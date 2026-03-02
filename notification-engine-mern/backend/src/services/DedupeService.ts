import { Notification } from '../models/Notification';

export class DedupeService {
    /**
     * Checks for exact duplicate using the dedupe_key.
     * Returns true if an exact duplicate exists.
     */
    public static async isExactDuplicate(dedupe_key: string): Promise<boolean> {
        const existing = await Notification.findOne({ dedupe_key });
        return !!existing;
    }

    /**
     * Naive near-duplicate detection: Checks if the user sent a VERY similar message
     * within the last 15 minutes. Simple Levenshtein distance could be used, but for
     * basic DB efficiency, we'll check recent messages and do a basic inclusion check.
     */
    public static async isNearDuplicate(userId: string, message: string): Promise<boolean> {
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

        // Find recent messages by user
        const recentNotifications = await Notification.find({
            user_id: userId,
            timestamp: { $gte: fifteenMinsAgo }
        }).select('message');

        // Simple near-duplicate heuristic:
        // If an existing recent message is an exact substring, or >80% similar, consider it near duplicate.
        for (const notif of recentNotifications) {
            if (this.calculateSimilarity(message, notif.message) > 0.8) {
                return true;
            }
        }
        return false;
    }

    // Very basic Jaccard similarity for words
    private static calculateSimilarity(str1: string, str2: string): number {
        const set1 = new Set(str1.toLowerCase().split(' '));
        const set2 = new Set(str2.toLowerCase().split(' '));
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }
}
