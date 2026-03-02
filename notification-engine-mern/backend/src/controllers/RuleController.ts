import { Request, Response } from 'express';
import { Rule } from '../models/Rule';

export class RuleController {
    public static async getRules(req: Request, res: Response) {
        try {
            const rules = await Rule.find().sort({ priority_boost: -1 });
            res.json(rules);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch rules' });
        }
    }

    public static async createRule(req: Request, res: Response) {
        try {
            const rule = new Rule(req.body);
            await rule.save();
            res.status(201).json(rule);
        } catch (err) {
            res.status(400).json({ error: 'Failed to create rule' });
        }
    }

    public static async updateRule(req: Request, res: Response) {
        try {
            const rule = await Rule.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!rule) return res.status(404).json({ error: 'Not found' });
            res.json(rule);
        } catch (err) {
            res.status(400).json({ error: 'Failed to update rule' });
        }
    }

    public static async deleteRule(req: Request, res: Response) {
        try {
            await Rule.findByIdAndDelete(req.params.id);
            res.status(204).send();
        } catch (err) {
            res.status(400).json({ error: 'Failed to delete rule' });
        }
    }
}
