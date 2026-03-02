import mongoose, { Document, Schema } from 'mongoose';

export interface IAiHealth extends Document {
    id_key: string; // constant 'singleton'
    failure_count: number;
    last_failure_time?: Date;
    circuit_state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

const aiHealthSchema = new Schema<IAiHealth>(
    {
        id_key: { type: String, required: true, unique: true, default: 'singleton' },
        failure_count: { type: Number, default: 0 },
        last_failure_time: { type: Date },
        circuit_state: {
            type: String,
            enum: ['CLOSED', 'OPEN', 'HALF_OPEN'],
            default: 'CLOSED'
        }
    }
);

export const AiHealth = mongoose.model<IAiHealth>('AiHealth', aiHealthSchema);
