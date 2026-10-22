import { z } from 'zod'

export const RuleFieldSchema = z.enum([
    'cgpa',
    'branch',
    'batch',
    'active_backlogs',
    'gender',
    'tenth_percentage',
    'twelfth_percentage'
])

export type RuleField = z.infer<typeof RuleFieldSchema>

export const RuleOpSchema = z.enum([
    'eq', //equal to
    'neq', //not equal to
    'lt', // less than
    'lte', //less than or equal to
    'gt', //greater than
    'gte', //greater than or equal to
    'in', //in list
    'nin' //not in list
])

export type RuleOp = z.infer<typeof RuleOpSchema>

export const AtomicRuleSchema = z.object({
    field: RuleFieldSchema,
    op: RuleOpSchema,
    value: z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.string()),
        z.array(z.number())
    ])
})

export type AtomicRule = z.infer<typeof AtomicRuleSchema>

export const EligibilityRuleSchema = z.object({
    all: z.array(AtomicRuleSchema).optional(),
    any: z.array(AtomicRuleSchema).optional()
})

export type EligiblityRules = z.infer<typeof EligibilityRuleSchema>

export interface FailedRuleDiagnostic {
    field: RuleField;
    operator: RuleOp;
    expectedValue: unknown;
    actualValue: unknown;
    message: string;
}

export interface EvaluationResult {
    eligible: boolean;
    failedRules: FailedRuleDiagnostic[];
}
