import {
  AtomicRule,
  EligibilityRuleSchema,
  EligiblityRules,
  EvaluationResult,
  FailedRuleDiagnostic,
} from './schema';
import type { Student } from '../db/schema';

// Helper to safely extract and parse student field values
function getStudentFieldValue(student: Student, field: string): unknown {
  switch (field) {
    case 'cgpa':
      return parseFloat(student.cgpa);
    case 'branch':
      return student.branch;
    case 'batch':
      return student.batch;
    case 'active_backlogs':
      return student.activeBacklogs;
    case 'tenth_percentage':
      return student.tenthPercentage ? parseFloat(student.tenthPercentage) : null;
    case 'twelfth_percentage':
      return student.twelfthPercentage ? parseFloat(student.twelfthPercentage) : null;
    default:
      return null;
  }
}

// Generates human-friendly rejection messages
function createDiagnosticMessage(
  rule: AtomicRule,
  actualValue: unknown
): string {
  const fieldName = rule.field.replace('_', ' ').toUpperCase();

  switch (rule.op) {
    case 'gte':
      return `${fieldName} must be at least ${rule.value} (Your value: ${actualValue ?? 'Not provided'})`;
    case 'lte':
      return `${fieldName} must be at most ${rule.value} (Your value: ${actualValue ?? 'Not provided'})`;
    case 'gt':
      return `${fieldName} must be greater than ${rule.value} (Your value: ${actualValue ?? 'Not provided'})`;
    case 'lt':
      return `${fieldName} must be less than ${rule.value} (Your value: ${actualValue ?? 'Not provided'})`;
    case 'eq':
      return `${fieldName} must be ${rule.value} (Your value: ${actualValue ?? 'Not provided'})`;
    case 'neq':
      return `${fieldName} cannot be ${rule.value}`;
    case 'in':
      return `${fieldName} must be one of: ${(rule.value as unknown[]).join(', ')} (Your value: ${actualValue})`;
    case 'nin':
      return `${fieldName} cannot be one of: ${(rule.value as unknown[]).join(', ')}`;
    default:
      return `Failed criteria for ${fieldName}`;
  }
}

// Compares a single atomic rule against the student's actual value
function evaluateAtomicRule(
  rule: AtomicRule,
  student: Student
): { passed: boolean; diagnostic?: FailedRuleDiagnostic } {
  const actual = getStudentFieldValue(student, rule.field);

  if (actual === null || actual === undefined) {
    return {
      passed: false,
      diagnostic: {
        field: rule.field,
        operator: rule.op,
        expectedValue: rule.value,
        actualValue: null,
        message: `${rule.field.replace('_', ' ').toUpperCase()} is not filled in your verified profile`,
      },
    };
  }

  let passed = false;

  switch (rule.op) {
    case 'eq':
      passed = actual === rule.value;
      break;
    case 'neq':
      passed = actual !== rule.value;
      break;
    case 'gt':
      passed = (actual as number) > (rule.value as number);
      break;
    case 'gte':
      passed = (actual as number) >= (rule.value as number);
      break;
    case 'lt':
      passed = (actual as number) < (rule.value as number);
      break;
    case 'lte':
      passed = (actual as number) <= (rule.value as number);
      break;
    case 'in':
      passed = Array.isArray(rule.value) && rule.value.includes(actual as never);
      break;
    case 'nin':
      passed = Array.isArray(rule.value) && !rule.value.includes(actual as never);
      break;
  }

  if (passed) {
    return { passed: true };
  }

  return {
    passed: false,
    diagnostic: {
      field: rule.field,
      operator: rule.op,
      expectedValue: rule.value,
      actualValue: actual,
      message: createDiagnosticMessage(rule, actual),
    },
  };
}

/**
 * Main Evaluator: Checks an entire rule tree against a student profile.
 */
export function evaluateRules(
  rawRules: unknown,
  student: Student
): EvaluationResult {
  const failedRules: FailedRuleDiagnostic[] = [];

  // CRITICAL REQUIREMENT 1: Student MUST be verified by an admin first
  if (!student.verifiedAt) {
    return {
      eligible: false,
      failedRules: [
        {
          field: 'cgpa',
          operator: 'eq',
          expectedValue: 'VERIFIED',
          actualValue: 'UNVERIFIED',
          message: 'Your profile has not been verified by the placement cell yet.',
        },
      ],
    };
  }

  // Validate that the JSON structure conforms to EligibilityRuleSchema
  const parsed = EligibilityRuleSchema.safeParse(rawRules);
  if (!parsed.success) {
    return {
      eligible: false,
      failedRules: [
        {
          field: 'cgpa',
          operator: 'eq',
          expectedValue: 'VALID_RULE_JSON',
          actualValue: 'INVALID_RULE_JSON',
          message: 'This drive has invalid eligibility rules configured.',
        },
      ],
    };
  }

  const rules: EligiblityRules = parsed.data;

  // 1. Evaluate "all" (Logical AND: Every rule in this list MUST pass)
  if (rules.all && rules.all.length > 0) {
    for (const rule of rules.all) {
      const result = evaluateAtomicRule(rule, student);
      if (!result.passed && result.diagnostic) {
        failedRules.push(result.diagnostic);
      }
    }
  }

  // 2. Evaluate "any" (Logical OR: At least ONE rule in this list must pass)
  if (rules.any && rules.any.length > 0) {
    let anyPassed = false;
    const anyDiagnostics: FailedRuleDiagnostic[] = [];

    for (const rule of rules.any) {
      const result = evaluateAtomicRule(rule, student);
      if (result.passed) {
        anyPassed = true;
        break; // One passed, condition satisfied!
      } else if (result.diagnostic) {
        anyDiagnostics.push(result.diagnostic);
      }
    }

    if (!anyPassed) {
      // If none passed, add the diagnostics
      failedRules.push(...anyDiagnostics);
    }
  }

  return {
    eligible: failedRules.length === 0,
    failedRules,
  };
}
