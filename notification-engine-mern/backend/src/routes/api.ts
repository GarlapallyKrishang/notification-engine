import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { RuleController } from '../controllers/RuleController';
import { HealthController } from '../controllers/HealthController';
import { AuditLog } from '../models/AuditLog';

const router = Router();

// Notification Events
router.post('/notifications/events', NotificationController.receiveEvent);
router.get('/notifications', NotificationController.getNotifications); // debug/dashboard

// Rule Management
router.get('/rules', RuleController.getRules);
router.post('/rules', RuleController.createRule);
router.put('/rules/:id', RuleController.updateRule);
router.delete('/rules/:id', RuleController.deleteRule);

// Health
router.get('/health', HealthController.getHealth);

// Audit Logs (For Dashboard)
router.get('/audit-logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

export default router;
