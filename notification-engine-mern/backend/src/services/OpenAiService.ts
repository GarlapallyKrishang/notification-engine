import OpenAI from 'openai';
import { CircuitBreaker } from '../utils/CircuitBreaker';
import { RuleEngineService } from './RuleEngineService';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';

// We initialize openai without apiKey globally so it doesn't crash if env var is missing during build
let openai: OpenAI | null = null;
const getOpenAIClient = () => {
    if (!openai && process.env.OPENAI_API_KEY) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
}


export class OpenAiService {

    /**
     * Processes the notification via LLM asynchronously.
     * Modifies the Notification document status based on AI output.
     * If AI fails or circuit is open, falls back to RuleEngine.
     */
    public static async processAsynchronously(notificationId: string) {
        // We execute this off the main request thread.
        // In production, we'd use BullMQ. Here we just run it as an unawaited async promise 
        // for simplicity, grabbing the DB record again.
        try {
            const notif = await Notification.findById(notificationId);
            if (!notif) return;

            if (await CircuitBreaker.isCircuitOpen()) {
                await this.fallbackToRules(notif, 'Circuit Breaker OPEN');
                return;
            }

            await this.attemptAiClassification(notif);

        } catch (error) {
            console.error(`Unexpected Async Error for ${notificationId}:`, error);
        }
    }

    private static async attemptAiClassification(notif: any) {
        let attempts = 0;
        while (attempts < 3) {
            try {
                const client = getOpenAIClient();
                if (!client) throw new Error("OpenAI API key missing");

                const prompt = `Classify this notification into NOW, LATER, or NEVER.
Return ONLY a valid JSON object like: {"action": "NOW", "confidence": 0.95, "reason": "System alert required immediately"}
Data:
User: ${notif.user_id}
Type: ${notif.event_type}
Message: ${notif.message}
Priority Hint: ${notif.priority_hint || 'None'}
`;

                const response = await client.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'system', content: prompt }],
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                });

                const resultStr = response.choices[0].message.content;
                if (!resultStr) throw new Error("Empty response from AI");
                const result = JSON.parse(resultStr);

                // Success
                await CircuitBreaker.recordSuccess();

                notif.status = result.action;
                notif.ai_processed = true;
                notif.ai_confidence = result.confidence;
                notif.ai_model_used = 'gpt-3.5-turbo';
                await notif.save();

                await AuditLog.create({
                    notification_id: notif._id.toString(),
                    decision: result.action,
                    reason: result.reason || 'AI decided',
                    ai_used: true,
                    fallback_used: false
                });

                return; // Done
            } catch (err) {
                attempts++;
                console.error(`AI Attempt ${attempts} failed:`, err);
                // Exponential backoff
                await new Promise(r => setTimeout(r, Math.pow(2, attempts) * 1000));
            }
        }

        // After 3 failed attempts, record circuit failure and fallback
        await CircuitBreaker.recordFailure();
        await this.fallbackToRules(notif, 'AI Retries Exhausted');
    }

    private static async fallbackToRules(notif: any, reasonPrefix: string) {
        const fallbackResult = await RuleEngineService.evaluate(notif);

        notif.status = fallbackResult.action;
        notif.ai_processed = false;
        await notif.save();

        await AuditLog.create({
            notification_id: notif._id.toString(),
            decision: fallbackResult.action,
            reason: `${reasonPrefix} -> Fallback to Rules`,
            rule_triggered: fallbackResult.ruleName,
            ai_used: false,
            fallback_used: true
        });
    }
}
