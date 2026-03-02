import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { DedupeService } from '../services/DedupeService';
import { AlertFatigueService } from '../services/AlertFatigueService';
import { OpenAiService } from '../services/OpenAiService';
import crypto from 'crypto';

export class NotificationController {
    public static async receiveEvent(req: Request, res: Response) {
        try {
            const payload = req.body;

            if (!payload.user_id || !payload.event_type || !payload.message || !payload.source) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // 1. Deduplication
            let dedupeKey = payload.dedupe_key;
            if (!dedupeKey) {
                dedupeKey = crypto.createHash('sha256').update(`${payload.user_id}-${payload.event_type}-${payload.message}`).digest('hex');
            }

            const isExact = await DedupeService.isExactDuplicate(dedupeKey);
            if (isExact) {
                return res.status(202).json({ message: 'Accepted (Exact Duplicate Ignored)' });
            }

            const isNear = await DedupeService.isNearDuplicate(payload.user_id, payload.message);
            if (isNear) {
                return res.status(202).json({ message: 'Accepted (Near Duplicate Ignored)' });
            }

            // 2. Alert Fatigue
            const isFatigued = await AlertFatigueService.isFatigued(payload.user_id);
            if (isFatigued) {
                // Optionally save as 'NEVER' or just ignore
                payload.status = 'NEVER';
                payload.priority_hint = 'Fatigue';
            }

            // 3. Save as PENDING
            const notification = new Notification({
                user_id: payload.user_id,
                event_type: payload.event_type,
                message: payload.message,
                source: payload.source,
                priority_hint: payload.priority_hint,
                channel: payload.channel,
                metadata: payload.metadata,
                dedupe_key: dedupeKey,
                status: payload.status || 'PENDING',
                expires_at: payload.expires_at,
                timestamp: payload.timestamp || new Date()
            });

            await notification.save();

            // 4. Trigger Async Classification if not already bypassed by Fatigue
            if (notification.status === 'PENDING') {
                // Fire and forget
                OpenAiService.processAsynchronously(notification._id.toString());
            }

            // 5. Immediate Return
            return res.status(202).json({ message: 'Accepted', id: notification._id });

        } catch (error: any) {
            console.error('Ingestion Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Debug/UI endpoint
    public static async getNotifications(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const status = req.query.status;

            let query = {};
            if (status) query = { status };

            const notifs = await Notification.find(query).sort({ timestamp: -1 }).limit(limit);
            res.json(notifs);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch' });
        }
    }
}
