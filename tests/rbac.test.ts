import { describe, it, expect } from 'vitest';
import { authorize, can, ForbiddenError, UnauthorizedError } from '../src/server/auth/rbac';
import type { User } from '../src/server/db/schema';

function createMockUser(role: User['role']): User {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    collegeId: '22222222-2222-2222-2222-222222222222',
    email: 'user@college.edu',
    name: 'Test User',
    role,
    createdAt: new Date(),
  };
}

describe('RBAC Security: authorize & can helpers', () => {
  it('throws UnauthorizedError when user is null or undefined', () => {
    expect(() => authorize(null, 'READ', 'DRIVE')).toThrow(UnauthorizedError);
    expect(() => authorize(undefined, 'READ', 'DRIVE')).toThrow(UnauthorizedError);
    expect(can(null, 'READ', 'DRIVE')).toBe(false);
  });

  describe('Student Permissions', () => {
    const student = createMockUser('STUDENT');

    it('allows student to apply to drives', () => {
      expect(() => authorize(student, 'APPLY', 'APPLICATION')).not.toThrow();
      expect(can(student, 'APPLY', 'APPLICATION')).toBe(true);
    });

    it('allows student to read drives and update their profile', () => {
      expect(() => authorize(student, 'READ', 'DRIVE')).not.toThrow();
      expect(() => authorize(student, 'UPDATE', 'STUDENT_PROFILE')).not.toThrow();
    });

    it('blocks student from verifying other students or viewing audit logs', () => {
      expect(() => authorize(student, 'VERIFY_STUDENT', 'STUDENT_PROFILE')).toThrow(ForbiddenError);
      expect(() => authorize(student, 'VIEW_AUDIT_LOGS', 'AUDIT_LOG')).toThrow(ForbiddenError);
      expect(can(student, 'VERIFY_STUDENT', 'STUDENT_PROFILE')).toBe(false);
    });

    it('blocks student from creating drives or uploading round results', () => {
      expect(() => authorize(student, 'CREATE', 'DRIVE')).toThrow(ForbiddenError);
      expect(() => authorize(student, 'UPLOAD_ROUND_RESULTS', 'ROUND_RESULT')).toThrow(ForbiddenError);
    });
  });

  describe('Coordinator Permissions', () => {
    const coordinator = createMockUser('COORDINATOR');

    it('allows coordinator to upload round results', () => {
      expect(() => authorize(coordinator, 'UPLOAD_ROUND_RESULTS', 'ROUND_RESULT')).not.toThrow();
      expect(can(coordinator, 'UPLOAD_ROUND_RESULTS', 'ROUND_RESULT')).toBe(true);
    });

    it('blocks coordinator from verifying students or deleting drives', () => {
      expect(() => authorize(coordinator, 'VERIFY_STUDENT', 'STUDENT_PROFILE')).toThrow(ForbiddenError);
      expect(() => authorize(coordinator, 'DELETE', 'DRIVE')).toThrow(ForbiddenError);
    });
  });

  describe('Admin (TPO) Permissions', () => {
    const admin = createMockUser('ADMIN');

    it('grants admin full access across drives, verification, and audit logs', () => {
      expect(() => authorize(admin, 'CREATE', 'DRIVE')).not.toThrow();
      expect(() => authorize(admin, 'DELETE', 'DRIVE')).not.toThrow();
      expect(() => authorize(admin, 'VERIFY_STUDENT', 'STUDENT_PROFILE')).not.toThrow();
      expect(() => authorize(admin, 'VIEW_AUDIT_LOGS', 'AUDIT_LOG')).not.toThrow();
      expect(() => authorize(admin, 'UPLOAD_ROUND_RESULTS', 'ROUND_RESULT')).not.toThrow();
    });
  });
});
