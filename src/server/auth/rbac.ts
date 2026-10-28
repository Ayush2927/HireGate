import type { User } from '../db/schema';

// 1. All available actions in the platform
export type Action =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'VERIFY_STUDENT'
  | 'APPLY'
  | 'UPLOAD_ROUND_RESULTS'
  | 'VIEW_AUDIT_LOGS';

// 2. All protected resources in the system
export type Resource =
  | 'DRIVE'
  | 'STUDENT_PROFILE'
  | 'APPLICATION'
  | 'ROUND_RESULT'
  | 'AUDIT_LOG'
  | 'COMPANY';

// 3. Custom Error class for 403 Forbidden access
export class ForbiddenError extends Error {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// 4. Custom Error class for 401 Unauthenticated users
export class UnauthorizedError extends Error {
  constructor(message = 'You must be logged in to access this resource.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// 5. The Permission Matrix mapping Role -> Allowed Actions per Resource
type PermissionMatrix = {
  [role in User['role']]: {
    [resource in Resource]?: Action[];
  };
};

const PERMISSIONS: PermissionMatrix = {
  ADMIN: {
    DRIVE: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    STUDENT_PROFILE: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VERIFY_STUDENT'],
    APPLICATION: ['READ', 'UPDATE', 'DELETE'],
    ROUND_RESULT: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'UPLOAD_ROUND_RESULTS'],
    AUDIT_LOG: ['READ', 'VIEW_AUDIT_LOGS'],
    COMPANY: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  },

  COORDINATOR: {
    DRIVE: ['READ', 'UPDATE'],
    STUDENT_PROFILE: ['READ'],
    APPLICATION: ['READ', 'UPDATE'],
    ROUND_RESULT: ['CREATE', 'READ', 'UPDATE', 'UPLOAD_ROUND_RESULTS'],
    COMPANY: ['READ'],
  },

  STUDENT: {
    DRIVE: ['READ'],
    STUDENT_PROFILE: ['READ', 'UPDATE'], // Only unverified fields
    APPLICATION: ['READ', 'APPLY'],
    ROUND_RESULT: ['READ'],
    COMPANY: ['READ'],
  },

  RECRUITER: {
    DRIVE: ['READ'],
    STUDENT_PROFILE: ['READ'],
    APPLICATION: ['READ'],
    ROUND_RESULT: ['READ', 'UPDATE'],
    COMPANY: ['READ'],
  },
};

/**
 * Central Server-Side Authorization Guard.
 *
 * Checks if the given user is permitted to perform 'action' on 'resource'.
 * Throws ForbiddenError if denied.
 *
 * Example:
 * authorize(sessionUser, 'VERIFY_STUDENT', 'STUDENT_PROFILE');
 */
export function authorize(
  user: User | null | undefined,
  action: Action,
  resource: Resource
): void {
  // 1. Must be logged in
  if (!user) {
    throw new UnauthorizedError();
  }

  // 2. Check if the user's role has permission for this resource and action
  const rolePermissions = PERMISSIONS[user.role];
  const allowedActions = rolePermissions?.[resource] ?? [];

  if (!allowedActions.includes(action)) {
    throw new ForbiddenError(
      `Role '${user.role}' is not authorized to perform '${action}' on '${resource}'.`
    );
  }
}

/**
 * Boolean helper for conditional UI rendering (e.g. whether to show an Edit button).
 */
export function can(
  user: User | null | undefined,
  action: Action,
  resource: Resource
): boolean {
  try {
    authorize(user, action, resource);
    return true;
  } catch {
    return false;
  }
}
