import { Notification } from '../models/Notification';

export class AlertFatigueService {
    /**
     * Checks if the user has received too many notifications recently.
     * Rule: Max 10 notifications within the last 1 hour.
     * If they exceeded it, return true (fatigue triggered).
     */
    public static async isFatigued(userId: string): Promise<boolean> {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const count = await Notification.countDocuments({
            user_id: userId,
            timestamp: { $gte: oneHourAgo },
            status: { $in: ['NOW', 'LATER'] } // Exclude NEVER and FAILED from fatigue logic
        });

        const ALERT_THRESHOLD = 10;

        return count >= ALERT_THRESHOLD;
    }
}
