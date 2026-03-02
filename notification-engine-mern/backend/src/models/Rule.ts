import mongoose, { Document, Schema } from 'mongoose';

export interface IRule extends Document {
    name: string;
    condition_json: any;
    action: 'NOW' | 'LATER' | 'NEVER';
    priority_boost?: number;
    active: boolean;
}

const ruleSchema = new Schema<IRule>(
    {
        name: { type: String, required: true },
        condition_json: { type: Schema.Types.Mixed, required: true },
        action: {
            type: String,
            enum: ['NOW', 'LATER', 'NEVER'],
            required: true
        },
        priority_boost: { type: Number },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const Rule = mongoose.model<IRule>('Rule', ruleSchema);
