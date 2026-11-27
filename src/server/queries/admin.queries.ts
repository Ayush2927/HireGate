import { asc, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import {
  applications,
  auditLogs,
  companies,
  drives,
  students,
  users,
} from '../db/schema';
import { getCurrentUser } from '../auth/session';

export interface AdminStudentItem {
  userId: string;
  name: string;
  email: string;
  rollNo: string;
  branch: string;
  batch: number;
  cgpa: number;
  activeBacklogs: number;
  marks10th: string;
  marks12th: string;
  isVerified: boolean;
  verifiedAt: string | null;
  placementStatus: string;
}

export interface AdminDriveItem {
  id: string;
  title: string;
  companyName: string;
  tier: string;
  ctcFormatted: string;
  status: string;
  deadlineLabel: string;
  timeLeftLabel: string;
  applicantCount: number;
  roundsCount: number;
  eligibilitySummary: string;
}

export interface AdminCompanyItem {
  id: string;
  name: string;
  website: string | null;
  driveCount: number;
  latestRole: string | null;
  latestCtc: string | null;
}

export interface AdminApplicationItem {
  id: string;
  studentName: string;
  rollNo: string;
  companyName: string;
  roleTitle: string;
  currentRound: string;
  appliedOn: string;
  status: string;
}

export interface AdminAuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimeLeft(deadline: Date): string {
  const diffMs = deadline.getTime() - Date.now();
  if (diffMs <= 0) return 'Closed';
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  if (days > 0) return `${days}d left`;
  return `${totalHours}h left`;
}

function summarizeRules(rules: unknown): string {
  if (!rules || typeof rules !== 'object') return 'Custom rules';
  const all = (rules as { all?: Array<{ field?: string; value?: unknown }> }).all;
  if (!Array.isArray(all) || all.length === 0) return 'Open to all';
  const parts: string[] = [];
  for (const r of all) {
    if (r.field === 'branch' && Array.isArray(r.value)) {
      parts.push(r.value.join(', '));
    } else if (r.field === 'cgpa') {
      parts.push(`CGPA ≥ ${r.value}`);
    } else if (r.field === 'active_backlogs') {
      parts.push(`Backlogs ≤ ${r.value}`);
    }
  }
  return parts.length > 0 ? parts.join(' • ') : 'Custom rules';
}

export async function requireAdminUser() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function getAdminStudentsList(
  collegeId: string
): Promise<AdminStudentItem[]> {
  const rows = await db
    .select({
      userId: students.userId,
      name: users.name,
      email: users.email,
      rollNo: students.rollNo,
      branch: students.branch,
      batch: students.batch,
      cgpa: students.cgpa,
      activeBacklogs: students.activeBacklogs,
      tenthPercentage: students.tenthPercentage,
      twelfthPercentage: students.twelfthPercentage,
      verifiedAt: students.verifiedAt,
      placementStatus: students.placementStatus,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(users.collegeId, collegeId))
    .orderBy(asc(students.verifiedAt), asc(students.rollNo));

  return rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    email: r.email,
    rollNo: r.rollNo,
    branch: r.branch,
    batch: r.batch,
    cgpa: Number(r.cgpa),
    activeBacklogs: r.activeBacklogs,
    marks10th: r.tenthPercentage ? `${Number(r.tenthPercentage).toFixed(1)}%` : '—',
    marks12th: r.twelfthPercentage
      ? `${Number(r.twelfthPercentage).toFixed(1)}%`
      : '—',
    isVerified: Boolean(r.verifiedAt),
    verifiedAt: r.verifiedAt ? formatDateLabel(r.verifiedAt) : null,
    placementStatus: r.placementStatus,
  }));
}

export async function getAdminDrivesList(
  collegeId: string
): Promise<AdminDriveItem[]> {
  const driveRows = await db.query.drives.findMany({
    where: eq(drives.collegeId, collegeId),
    with: {
      company: true,
      rounds: true,
      applications: {
        columns: { id: true },
      },
    },
    orderBy: [desc(drives.createdAt)],
  });

  return driveRows.map((d) => ({
    id: d.id,
    title: d.title,
    companyName: d.company.name,
    tier: d.tier,
    ctcFormatted: `₹ ${Number(d.ctc).toFixed(1)} LPA`,
    status: d.status,
    deadlineLabel: formatDateLabel(d.deadline),
    timeLeftLabel: formatTimeLeft(d.deadline),
    applicantCount: d.applications.length,
    roundsCount: d.rounds.length,
    eligibilitySummary: summarizeRules(d.eligibilityRules),
  }));
}

export async function getAdminCompaniesList(
  collegeId: string
): Promise<AdminCompanyItem[]> {
  const companyRows = await db.query.companies.findMany({
    where: eq(companies.collegeId, collegeId),
    with: {
      drives: {
        orderBy: [desc(drives.createdAt)],
      },
    },
    orderBy: [asc(companies.name)],
  });

  return companyRows.map((c) => {
    const latestDrive = c.drives[0];
    return {
      id: c.id,
      name: c.name,
      website: c.website,
      driveCount: c.drives.length,
      latestRole: latestDrive?.title ?? null,
      latestCtc: latestDrive ? `₹ ${Number(latestDrive.ctc).toFixed(1)} LPA` : null,
    };
  });
}

export async function getAdminApplicationsList(
  collegeId: string
): Promise<AdminApplicationItem[]> {
  const driveRows = await db.query.drives.findMany({
    where: eq(drives.collegeId, collegeId),
    with: {
      company: true,
      rounds: {
        orderBy: (r, { asc: ascFn }) => [ascFn(r.sequence)],
      },
      applications: {
        with: {
          student: {
            with: {
              user: true,
            },
          },
          roundResults: true,
        },
        orderBy: [desc(applications.appliedAt)],
      },
    },
  });

  const result: AdminApplicationItem[] = [];
  for (const d of driveRows) {
    for (const app of d.applications) {
      const rrMap = new Map(app.roundResults.map((rr) => [rr.roundId, rr.result]));
      const activeRound =
        d.rounds.find((r) => (rrMap.get(r.id) ?? 'PENDING') === 'PENDING') ??
        d.rounds[d.rounds.length - 1];

      result.push({
        id: app.id,
        studentName: app.student.user.name,
        rollNo: app.student.rollNo,
        companyName: d.company.name,
        roleTitle: d.title,
        currentRound: activeRound ? activeRound.name : 'Application Review',
        appliedOn: formatDateLabel(app.appliedAt),
        status: app.status,
      });
    }
  }

  return result;
}

export async function getAdminAuditLogs(
  collegeId: string
): Promise<AdminAuditLogItem[]> {
  const rows = await db
    .select({
      id: auditLogs.id,
      createdAt: auditLogs.createdAt,
      actorName: users.name,
      actorRole: users.role,
      action: auditLogs.action,
      entity: auditLogs.entity,
      entityId: auditLogs.entityId,
      diff: auditLogs.diff,
    })
    .from(auditLogs)
    .innerJoin(users, eq(auditLogs.actorId, users.id))
    .where(eq(users.collegeId, collegeId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    timestamp: r.createdAt.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    actorName: r.actorName,
    actorRole: r.actorRole,
    action: r.action,
    entity: r.entity,
    entityId: r.entityId,
    details: JSON.stringify(r.diff),
  }));
}

export function getDefaultDriveDeadline(): string {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
}

export async function getAdminDashboardData(collegeId: string) {
  const [studentList, driveList, appList] = await Promise.all([
    getAdminStudentsList(collegeId),
    getAdminDrivesList(collegeId),
    getAdminApplicationsList(collegeId),
  ]);

  const pendingVerifications = studentList.filter((s) => !s.isVerified).length;
  const activeDrives = driveList.filter((d) => d.status === 'PUBLISHED').length;

  return {
    stats: {
      totalStudents: studentList.length,
      pendingVerifications,
      activeDrives,
      totalApplications: appList.length,
    },
    recentApplications: appList.slice(0, 6),
    upcomingDeadlines: driveList
      .filter((d) => d.status === 'PUBLISHED')
      .slice(0, 4),
  };
}
