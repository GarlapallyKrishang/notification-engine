import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AiHealth } from '../models/AiHealth';
import { CircuitBreaker } from '../utils/CircuitBreaker';
import OpenAI from 'openai';

export class HealthController {
    public static async getHealth(req: Request, res: Response) {
        try {
            // 1. Database Status
            const dbStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';

            // 2. Circuit State
            const isCircuitOpen = await CircuitBreaker.isCircuitOpen();
            const healthRecord = await AiHealth.findOne({ id_key: 'singleton' });

            const circuitState = healthRecord ? healthRecord.circuit_state : 'CLOSED';

            // 3. AI Status (Naive check: if API key exists and circuit is not open)
            const aiStatus = (process.env.OPENAI_API_KEY && !isCircuitOpen) ? 'healthy' : 'degraded';

            res.json({
                status: dbStatus === 'up' && aiStatus === 'healthy' ? 'OK' : 'DEGRADED',
                database: dbStatus,
                ai_integration: {
                    status: aiStatus,
                    circuit_state: circuitState,
                    failure_count: healthRecord?.failure_count || 0
                },
                timestamp: new Date()
            });
        } catch (err) {
            res.status(500).json({ status: 'ERROR', error: 'Internal Health Check Failure' });
        }
    }
}
