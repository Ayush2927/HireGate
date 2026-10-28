import {
  SQL,
  and,
  or,
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  inArray,
  notInArray,
  isNotNull,
} from 'drizzle-orm';
import { students } from '../db/schema';
import {
  AtomicRule,
  EligibilityRuleSchema,
  EligiblityRules,
} from './schema';

// Maps our rule field name to the actual Drizzle database table column
function getStudentColumn(field: string) {
  switch (field) {
    case 'cgpa':
      return students.cgpa;
    case 'branch':
      return students.branch;
    case 'batch':
      return students.batch;
    case 'active_backlogs':
      return students.activeBacklogs;
    case 'tenth_percentage':
      return students.tenthPercentage;
    case 'twelfth_percentage':
      return students.twelfthPercentage;
    default:
      return null;
  }
}

// Converts a single atomic rule into a Drizzle SQL condition
function atomicRuleToSql(rule: AtomicRule): SQL | undefined {
  const column = getStudentColumn(rule.field);
  if (!column) return undefined;

  // For numeric fields like cgpa and percentages, format number as string for Postgres numeric columns
  const val = typeof rule.value === 'number' ? rule.value.toString() : rule.value;

  switch (rule.op) {
    case 'eq':
      return eq(column, val as any);
    case 'neq':
      return ne(column, val as any);
    case 'gt':
      return gt(column, val as any);
    case 'gte':
      return gte(column, val as any);
    case 'lt':
      return lt(column, val as any);
    case 'lte':
      return lte(column, val as any);
    case 'in':
      return Array.isArray(rule.value) && rule.value.length > 0
        ? inArray(column, rule.value as any[])
        : undefined;
    case 'nin':
      return Array.isArray(rule.value) && rule.value.length > 0
        ? notInArray(column, rule.value as any[])
        : undefined;
    default:
      return undefined;
  }
}

/**
 * Main SQL Compiler: Converts JSON rules into a Drizzle WHERE clause.
 *
 * Example Output:
 * and(
 *   isNotNull(students.verifiedAt),
 *   gte(students.cgpa, '8.00'),
 *   inArray(students.branch, ['CS', 'IT'])
 * )
 */
export function rulesToSqlWhere(rawRules: unknown): SQL | undefined {
  // Safe-parse the incoming rules
  const parsed = EligibilityRuleSchema.safeParse(rawRules);
  if (!parsed.success) {
    // If rules are invalid, return a condition that matches NOTHING
    return eq(students.userId, '00000000-0000-0000-0000-000000000000');
  }

  const rules: EligiblityRules = parsed.data;
  const conditions: SQL[] = [];

  // RULE 1: Only verified students are ever eligible in DB queries
  conditions.push(isNotNull(students.verifiedAt));

  // 1. Process "all" conditions (Logical AND)
  if (rules.all && rules.all.length > 0) {
    for (const rule of rules.all) {
      const sqlCond = atomicRuleToSql(rule);
      if (sqlCond) {
        conditions.push(sqlCond);
      }
    }
  }

  // 2. Process "any" conditions (Logical OR)
  if (rules.any && rules.any.length > 0) {
    const anyConds: SQL[] = [];
    for (const rule of rules.any) {
      const sqlCond = atomicRuleToSql(rule);
      if (sqlCond) {
        anyConds.push(sqlCond);
      }
    }
    if (anyConds.length > 0) {
      conditions.push(or(...anyConds)!);
    }
  }

  // Combine everything with AND
  return conditions.length > 0 ? and(...conditions) : undefined;
}
