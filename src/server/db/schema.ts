import {
    pgTable,
    uuid,
    text,
    timestamp,
    integer,
    numeric,
    jsonb,
    pgEnum,
    uniqueIndex,
    index,
    primaryKey
}
    from 'drizzle-orm/pg-core'

import { relations } from 'drizzle-orm'

//ENUMS

export const userRoleEnum = pgEnum('user_role', [
    'STUDENT',
    'COORDINATOR',
    'ADMIN',
    'RECRUITER'
])

export const placementStatusEnum = pgEnum('placement_status', [
    'UNPLACED',
    'PLACED'
])

export const driveStatusEnum = pgEnum('drive_status', [
    'DRAFT',
    'PUBLISHED',
    'COMPLETED',
    'ARCHIVED'
])

export const applicationStatusEnum = pgEnum('application_status', [
    'APPLIED',
    'SHORTLISTED',
    'IN_PROGRESS',
    'REJECTED',
    'OFFERED',
]);
export const roundResultEnum = pgEnum('round_result', [
    'PENDING',
    'PASSED',
    'FAILED',
    'ABSENT',
]);

//CORE ENTITIES
export const colleges = pgTable('colleges', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    emailDomain: text('email_domain').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    collegeId: uuid('college_id').notNull()
        .references(() => colleges.id, { onDelete: 'cascade' }),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    role: userRoleEnum('role').default('STUDENT').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})


export const students = pgTable('students', {
    userId: uuid('user_id').primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    rollNo: text('roll_no').notNull().unique(),
    branch: text('branch').notNull(),
    batch: integer('batch').notNull(),
    cgpa: numeric('cgpa', { precision: 4, scale: 2 }).notNull(),
    activeBacklogs: integer('active_backlogs').default(0).notNull(),
    tenthPercentage: numeric('tenth_percentage', { precision: 5, scale: 2 }),
    twelfthPercentage: numeric('twelfth_percentage', { precision: 5, scale: 2 }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    verifiedBy: uuid('verified_by').references(() => users.id, { onDelete: 'set null' }),
    placementStatus: placementStatusEnum('placement_status').default('UNPLACED').notNull(),
    placedTier: text('placed_tier')
},
    (table) => [
        index('idx_students_criteria').on(table.branch, table.batch, table.cgpa)
    ]);

export const resumes = pgTable('resumes', {
    id: uuid('id').defaultRandom().primaryKey(),
    studentId: uuid('studentId').notNull().references(() => students.userId, { onDelete: 'cascade' }),
    fileKey: text('file_key').notNull(),
    version: integer('version').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()

})

export const companies = pgTable('companies', {
    id: uuid('id').defaultRandom().primaryKey(),
    collegeId: uuid('college_id').notNull()
        .references(() => colleges.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    website: text('website'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

//DRIVES AND APPLICATIONS

//1.Drives:placement recruitment drives posted by TPO
export const drives = pgTable(
    'drives',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        collegeId: uuid('college_id')
            .notNull()
            .references(() => colleges.id, { onDelete: 'cascade' }),
        companyId: uuid('company_id')
            .notNull()
            .references(() => companies.id, { onDelete: 'cascade' }),
        title: text('title').notNull(),
        description: text('description').notNull(),
        ctc: numeric('ctc', { precision: 10, scale: 2 }).notNull(), // LPA
        tier: text('tier').notNull(), // "Dream", "Standard", etc.
        deadline: timestamp('deadline', { withTimezone: true }).notNull(),
        eligibilityRules: jsonb('eligibility_rules').notNull(), // Dynamic JSON rule tree
        status: driveStatusEnum('status').default('DRAFT').notNull(),
        createdBy: uuid('created_by')
            .notNull()
            .references(() => users.id, { onDelete: 'restrict' }),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index('idx_drives_lookup').on(table.collegeId, table.status, table.deadline),
    ]
);


// 7. Drive Rounds: Sequential interview rounds (OA, Tech, HR).
export const driveRounds = pgTable('drive_rounds', {
    id: uuid('id').defaultRandom().primaryKey(),
    driveId: uuid('drive_id')
        .notNull()
        .references(() => drives.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // "OA", "Technical Interview", etc.
    sequence: integer('sequence').notNull(), // 1, 2, 3...
});


// 8. Drive Coordinators: Student coordinators assigned to a specific drive.
export const driveCoordinators = pgTable(
    'drive_coordinators',
    {
        driveId: uuid('drive_id')
            .notNull()
            .references(() => drives.id, { onDelete: 'cascade' }),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
    },
    (table) => [
        primaryKey({ columns: [table.driveId, table.userId] }),
    ]
);


// 9. Applications: Student applications to drives.
export const applications = pgTable(
    'applications',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        studentId: uuid('student_id')
            .notNull()
            .references(() => students.userId, { onDelete: 'cascade' }),
        driveId: uuid('drive_id')
            .notNull()
            .references(() => drives.id, { onDelete: 'cascade' }),
        resumeId: uuid('resume_id')
            .references(() => resumes.id, { onDelete: 'set null' }),
        // Immutable snapshot of CGPA, backlogs, etc. at the exact second they applied:
        profileSnapshot: jsonb('profile_snapshot').notNull(),
        status: applicationStatusEnum('status').default('APPLIED').notNull(),
        idempotencyKey: text('idempotency_key'),
        appliedAt: timestamp('applied_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        // CRITICAL: Prevents duplicate applications at the database level!
        uniqueIndex('idx_applications_student_drive').on(table.studentId, table.driveId),
        index('idx_applications_drive_status').on(table.driveId, table.status),
    ]
);


// ============================================================================
// SECTION 4: OPERATIONS (Results, Notifications, Audit, Relations)
// ============================================================================
// 10. Round Results: Pass/Fail per candidate per round.
export const roundResults = pgTable(
    'round_results',
    {
        applicationId: uuid('application_id')
            .notNull()
            .references(() => applications.id, { onDelete: 'cascade' }),
        roundId: uuid('round_id')
            .notNull()
            .references(() => driveRounds.id, { onDelete: 'cascade' }),
        result: roundResultEnum('result').default('PENDING').notNull(),
        updatedBy: uuid('updated_by')
            .notNull()
            .references(() => users.id, { onDelete: 'restrict' }),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.applicationId, table.roundId] }),
    ]
);


// 11. Notifications: In-app notifications with deduplication.
export const notifications = pgTable(
    'notifications',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        type: text('type').notNull(), // "DRIVE_NEW", "ROUND_RESULT"
        refId: text('ref_id').notNull(),
        payload: jsonb('payload').notNull(),
        readAt: timestamp('read_at', { withTimezone: true }),
        sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex('idx_notifications_dedupe').on(table.userId, table.type, table.refId),
    ]
);


// 12. Audit Logs: Immutable ledger recording all sensitive updates.
export const auditLogs = pgTable(
    'audit_logs',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        actorId: uuid('actor_id')
            .notNull()
            .references(() => users.id, { onDelete: 'restrict' }),
        entity: text('entity').notNull(), // "student", "round_result"
        entityId: text('entity_id').notNull(),
        action: text('action').notNull(), // "VERIFY_PROFILE", "UPDATE_RESULT"
        diff: jsonb('diff').notNull(), // { before: {...}, after: {...} }
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        index('idx_audit_logs_entity').on(table.entity, table.entityId),
    ]
);



// ============================================================================
// RELATIONS (Enables Drizzle's db.query helpers)
// ============================================================================
export const collegesRelations = relations(colleges, ({ many }) => ({
    users: many(users),
    companies: many(companies),
    drives: many(drives),
}));


export const usersRelations = relations(users, ({ one, many }) => ({
    college: one(colleges, { fields: [users.collegeId], references: [colleges.id] }),
    student: one(students, { fields: [users.id], references: [students.userId] }),
    notifications: many(notifications),
    auditLogs: many(auditLogs),
}));


export const studentsRelations = relations(students, ({ one, many }) => ({
    user: one(users, { fields: [students.userId], references: [users.id] }),
    verifier: one(users, { fields: [students.verifiedBy], references: [users.id] }),
    resumes: many(resumes),
    applications: many(applications),
}));


export const drivesRelations = relations(drives, ({ one, many }) => ({
    college: one(colleges, { fields: [drives.collegeId], references: [colleges.id] }),
    company: one(companies, { fields: [drives.companyId], references: [companies.id] }),
    creator: one(users, { fields: [drives.createdBy], references: [users.id] }),
    rounds: many(driveRounds),
    coordinators: many(driveCoordinators),
    applications: many(applications),
}));


export const applicationsRelations = relations(applications, ({ one, many }) => ({
    student: one(students, { fields: [applications.studentId], references: [students.userId] }),
    drive: one(drives, { fields: [applications.driveId], references: [drives.id] }),
    resume: one(resumes, { fields: [applications.resumeId], references: [resumes.id] }),
    roundResults: many(roundResults),
}));


export const driveRoundsRelations = relations(driveRounds, ({ one, many }) => ({
    drive: one(drives, { fields: [driveRounds.driveId], references: [drives.id] }),
    results: many(roundResults),
}));
// ============================================================================
// INFERRED TYPES
// TypeScript automatically infers the types directly from the schema!
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type Drive = typeof drives.$inferSelect;
export type NewDrive = typeof drives.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
