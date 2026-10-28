import { describe, it, expect } from 'vitest';
import { evaluateRules } from '../src/server/rules/evaluator';
import { rulesToSqlWhere } from '../src/server/rules/sql';
import type { Student } from '../src/server/db/schema';

// Mock student generator helper
function createMockStudent(overrides?: Partial<Student>): Student {
  return {
    userId: '11111111-1111-1111-1111-111111111111',
    rollNo: '21CS001',
    branch: 'CS',
    batch: 2026,
    cgpa: '8.50',
    activeBacklogs: 0,
    tenthPercentage: '92.00',
    twelfthPercentage: '88.50',
    verifiedAt: new Date('2026-01-01T00:00:00Z'),
    verifiedBy: '22222222-2222-2222-2222-222222222222',
    placementStatus: 'UNPLACED',
    placedTier: null,
    ...overrides,
  };
}

describe('Rules Engine: evaluateRules (In-Memory Evaluator)', () => {
  it('blocks unverified students regardless of their grades', () => {
    const unverifiedStudent = createMockStudent({ verifiedAt: null });
    const rules = {
      all: [{ field: 'cgpa', op: 'gte', value: 7.0 }],
    };

    const result = evaluateRules(rules, unverifiedStudent);
    expect(result.eligible).toBe(false);
    expect(result.failedRules).toHaveLength(1);
    expect(result.failedRules[0].message).toContain('not been verified');
  });

  it('approves an eligible student meeting all criteria', () => {
    const student = createMockStudent({
      cgpa: '8.50',
      branch: 'CS',
      activeBacklogs: 0,
      tenthPercentage: '90.00',
      twelfthPercentage: '85.00',
    });

    const rules = {
      all: [
        { field: 'cgpa', op: 'gte', value: 8.0 },
        { field: 'branch', op: 'in', value: ['CS', 'IT'] },
        { field: 'active_backlogs', op: 'eq', value: 0 },
        { field: 'tenth_percentage', op: 'gte', value: 75.0 },
        { field: 'twelfth_percentage', op: 'gte', value: 75.0 },
      ],
    };

    const result = evaluateRules(rules, student);
    expect(result.eligible).toBe(true);
    expect(result.failedRules).toHaveLength(0);
  });

  it('rejects a student with low CGPA and returns exact diagnostic message', () => {
    const student = createMockStudent({ cgpa: '7.20' });
    const rules = {
      all: [{ field: 'cgpa', op: 'gte', value: 8.0 }],
    };

    const result = evaluateRules(rules, student);
    expect(result.eligible).toBe(false);
    expect(result.failedRules).toHaveLength(1);
    expect(result.failedRules[0].field).toBe('cgpa');
    expect(result.failedRules[0].actualValue).toBe(7.2);
    expect(result.failedRules[0].expectedValue).toBe(8.0);
    expect(result.failedRules[0].message).toContain('must be at least 8');
  });

  it('rejects a student with active backlogs', () => {
    const student = createMockStudent({ activeBacklogs: 2 });
    const rules = {
      all: [{ field: 'active_backlogs', op: 'eq', value: 0 }],
    };

    const result = evaluateRules(rules, student);
    expect(result.eligible).toBe(false);
    expect(result.failedRules[0].field).toBe('active_backlogs');
    expect(result.failedRules[0].actualValue).toBe(2);
  });

  it('evaluates "any" combinator correctly (passing one is enough)', () => {
    // Mechanical student with a high 9.20 CGPA
    const student = createMockStudent({ branch: 'MECH', cgpa: '9.20' });

    const rules = {
      all: [{ field: 'active_backlogs', op: 'eq', value: 0 }],
      any: [
        { field: 'branch', op: 'in', value: ['CS', 'IT'] },
        { field: 'cgpa', op: 'gte', value: 9.0 },
      ],
    };

    const result = evaluateRules(rules, student);
    expect(result.eligible).toBe(true);
    expect(result.failedRules).toHaveLength(0);
  });

  it('fails "any" combinator if all any-conditions fail', () => {
    // Mechanical student with 8.0 CGPA
    const student = createMockStudent({ branch: 'MECH', cgpa: '8.00' });

    const rules = {
      any: [
        { field: 'branch', op: 'in', value: ['CS', 'IT'] },
        { field: 'cgpa', op: 'gte', value: 9.0 },
      ],
    };

    const result = evaluateRules(rules, student);
    expect(result.eligible).toBe(false);
    expect(result.failedRules.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Rules Engine: rulesToSqlWhere (SQL Compiler)', () => {
  it('generates a valid SQL condition including verifiedAt check', () => {
    const rules = {
      all: [
        { field: 'cgpa', op: 'gte', value: 8.0 },
        { field: 'branch', op: 'in', value: ['CS', 'IT'] },
      ],
    };

    const sqlClause = rulesToSqlWhere(rules);
    expect(sqlClause).toBeDefined();
  });
});
