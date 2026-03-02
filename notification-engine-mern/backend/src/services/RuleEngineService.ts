import { Rule } from '../models/Rule';
import { INotification } from '../models/Notification';

export class RuleEngineService {
    /**
     * Evaluates the event against active rules in the database.
     * If a rule matches, returns { action, ruleName }.
     * If no rules match, returns a default fallback Action (e.g. LATER).
     */
    public static async evaluate(notificationData: any): Promise<{ action: 'NOW' | 'LATER' | 'NEVER', ruleName?: string, isFallback: boolean }> {
        try {
            // Fetch active rules from DB, sorted by priority (descending if we added it, but just fetch all for now)
            const activeRules = await Rule.find({ active: true }).sort({ priority_boost: -1 }).lean();

            for (const rule of activeRules) {
                if (this.matchesCondition(notificationData, rule.condition_json)) {
                    return { action: rule.action, ruleName: rule.name, isFallback: true };
                }
            }

            // Default fallback
            return { action: 'LATER', ruleName: 'default_fallback', isFallback: true };
        } catch (e) {
            console.error('Rule Engine failed:', e);
            return { action: 'LATER', ruleName: 'error_fallback', isFallback: true };
        }
    }

    /**
     * Basic condition evaluator.
     * Supported condition structure:
     * { "field": "event_type", "operator": "eq", "value": "system_alert" }
     * More complex logic could be added (and/or arrays).
     */
    private static matchesCondition(data: any, condition: any): boolean {
        if (!condition || typeof condition !== 'object') return false;

        // Support basic JSON logic
        if (Array.isArray(condition.and)) {
            return condition.and.every((c: any) => this.matchesCondition(data, c));
        }
        if (Array.isArray(condition.or)) {
            return condition.or.some((c: any) => this.matchesCondition(data, c));
        }

        const { field, operator, value } = condition;
        if (!field || !operator) return false;

        const actualValue = data[field];

        switch (operator) {
            case 'eq': return actualValue === value;
            case 'neq': return actualValue !== value;
            case 'includes': return typeof actualValue === 'string' && actualValue.includes(value);
            case 'in': return Array.isArray(value) && value.includes(actualValue);
            default: return false;
        }
    }
}
