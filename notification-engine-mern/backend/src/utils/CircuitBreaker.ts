import { AiHealth } from '../models/AiHealth';

export class CircuitBreaker {
    private static readonly FAILURE_THRESHOLD = 5;
    private static readonly WINDOW_MS = 2 * 60 * 1000; // 2 minutes

    /**
     * Checks if the circuit is currently OPEN based on the database state.
     * If OPEN but enough time has passed, it sets it to HALF_OPEN (optional logic, but typically DB driven).
     */
    public static async isCircuitOpen(): Promise<boolean> {
        const health = await this.getHealthRecord();

        if (health.circuit_state === 'OPEN') {
            // Check if we should move to HALF_OPEN (timeout of 5 mins)
            if (health.last_failure_time && (Date.now() - health.last_failure_time.getTime() > 5 * 60 * 1000)) {
                health.circuit_state = 'HALF_OPEN';
                await health.save();
                return false; // Proceed to test
            }
            return true; // Still open
        }

        return false;
    }

    public static async recordSuccess(): Promise<void> {
        const health = await this.getHealthRecord();
        if (health.circuit_state !== 'CLOSED' || health.failure_count > 0) {
            health.failure_count = 0;
            health.circuit_state = 'CLOSED';
            await health.save();
        }
    }

    public static async recordFailure(): Promise<void> {
        const health = await this.getHealthRecord();

        // Clean old failures
        if (health.last_failure_time && (Date.now() - health.last_failure_time.getTime() > this.WINDOW_MS)) {
            health.failure_count = 0;
        }

        health.failure_count += 1;
        health.last_failure_time = new Date();

        if (health.failure_count >= this.FAILURE_THRESHOLD) {
            health.circuit_state = 'OPEN';
        } else if (health.circuit_state === 'HALF_OPEN') {
            // If it fails during HALF_OPEN, immediately string back to OPEN
            health.circuit_state = 'OPEN';
        }

        await health.save();
    }

    private static async getHealthRecord() {
        let health = await AiHealth.findOne({ id_key: 'singleton' });
        if (!health) {
            health = new AiHealth({ id_key: 'singleton' });
            await health.save();
        }
        return health;
    }
}
