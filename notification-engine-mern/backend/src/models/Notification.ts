import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    user_id: string;
    event_type: string;
    message: string;
    source: string;
    priority_hint?: string;
    channel?: string;
    metadata?: any;
    dedupe_key: string;
    status: 'PENDING' | 'NOW' | 'LATER' | 'NEVER' | 'FAILED';
    ai_processed: boolean;
    ai_confidence?: number;
    ai_model_used?: string;
    timestamp: Date;
    expires_at?: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        user_id: { type: String, required: true, index: true },
        event_type: { type: String, required: true },
        message: { type: String, required: true },
        source: { type: String, required: true },
        priority_hint: { type: String },
        channel: { type: String },
        metadata: { type: Schema.Types.Mixed },
        dedupe_key: { type: String, required: true, unique: true },
        status: {
            type: String,
            enum: ['PENDING', 'NOW', 'LATER', 'NEVER', 'FAILED'],
            default: 'PENDING',
            index: true
        },
        ai_processed: { type: Boolean, default: false },
        ai_confidence: { type: Number },
        ai_model_used: { type: String },
        timestamp: { type: Date, default: Date.now },
        expires_at: { type: Date }
    },
    { timestamps: true }
);

notificationSchema.index({ dedupe_key: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ user_id: 1, timestamp: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
