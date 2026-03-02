import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
    notification_id: string; // Sticking to string instead of ObjectId for decoupling across systems if needed
    decision: string;
    reason: string;
    rule_triggered?: string;
    ai_used: boolean;
    fallback_used: boolean;
    timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
    {
        notification_id: { type: String, required: true, index: true },
        decision: { type: String, required: true },
        reason: { type: String, required: true },
        rule_triggered: { type: String },
        ai_used: { type: Boolean, default: false },
        fallback_used: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now }
    }
);

// Append only log, no updates expected. Let's index timestamp for sorting.
auditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
