import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import {
  applications,
  drives,
  resumes,
  students,
  users,
  type Student,
} from '../db/schema';
import { getCurrentUser } from '../auth/session';
import { evaluateRules } from '../rules/evaluator';

export interface SerializedResume {
  id: string;
  fileKey: string;
  version: number;
  createdAt: string;
}

export interface SerializedDriveItem {
  id: string;
  title: string;
  description: string;
  companyName: string;
  companyWebsite: string | null;
  ctcNumber: number;
  ctcFormatted: string;
  tier: string;
  deadlineIso: string;
  deadlineLabel: string;
  timeLeftLabel: string;
  rounds: { id: string; name: string; sequence: number }[];
  isEligible: boolean;
  failures: string[];
  applied: boolean;
  applicationStatus: string | null;
}

export interface SerializedApplicationItem {
  id: string;
  driveId: string;
  roleTitle: string;
  companyName: string;
  tier: string;
  ctcFormatted: string;
  status: string;
  appliedOn: string;
  resumeFileKey: string | null;
  rounds: {
    id: string;
    name: string;
    sequence: number;
    result: 'PENDING' | 'PASSED' | 'FAILED' | 'ABSENT';
  }[];
  currentRound: string;
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
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

export async function getStudentPortalContext() {
  const user = await getCurrentUser();
  if (!user) return null;

  const student = await db.query.students.findFirst({
    where: eq(students.userId, user.id),
  });

  let verifierName: string | null = null;
  if (student?.verifiedBy) {
    const verifier = await db.query.users.findFirst({
      where: eq(users.id, student.verifiedBy),
      columns: { name: true },
    });
    verifierName = verifier?.name ?? null;
  }

  const studentResumes = student
    ? await db.query.resumes.findMany({
        where: eq(resumes.studentId, student.userId),
        orderBy: [desc(resumes.version)],
      })
    : [];

  return {
    user,
    student: student ?? null,
    verifierName,
    resumes: studentResumes.map((r) => ({
      id: r.id,
      fileKey: r.fileKey,
      version: r.version,
      createdAt: formatDateLabel(r.createdAt),
    })),
  };
}

function evaluateDriveEligibility(
  eligibilityRules: unknown,
  student: Student | null
): { isEligible: boolean; failures: string[] } {
  if (!student) {
    return {
      isEligible: false,
      failures: ['Complete your Academic Passport to check eligibility'],
    };
  }

  const evaluation = evaluateRules(eligibilityRules, student);
  const failures = evaluation.failedRules.map((f) => f.message);

  if (!student.verifiedAt) {
    failures.unshift('Academic Passport pending TPO verification');
  }

  return {
    isEligible: evaluation.eligible && Boolean(student.verifiedAt),
    failures,
  };
}

export async function getStudentDrivesFeed(
  collegeId: string,
  student: Student | null
): Promise<SerializedDriveItem[]> {
  const publishedDrives = await db.query.drives.findMany({
    where: and(
      eq(drives.collegeId, collegeId),
      eq(drives.status, 'PUBLISHED')
    ),
    with: {
      company: true,
      rounds: {
        orderBy: (r, { asc: ascFn }) => [ascFn(r.sequence)],
      },
    },
    orderBy: [asc(drives.deadline)],
  });

  const existingApps = student
    ? await db.query.applications.findMany({
        where: eq(applications.studentId, student.userId),
      })
    : [];

  const appByDriveId = new Map(existingApps.map((a) => [a.driveId, a]));

  return publishedDrives.map((drive) => {
    const app = appByDriveId.get(drive.id);
    const eligibility = evaluateDriveEligibility(drive.eligibilityRules, student);
    const ctcNum = Number(drive.ctc);

    return {
      id: drive.id,
      title: drive.title,
      description: drive.description,
      companyName: drive.company.name,
      companyWebsite: drive.company.website,
      ctcNumber: ctcNum,
      ctcFormatted: `₹ ${ctcNum.toFixed(1)} LPA`,
      tier: drive.tier,
      deadlineIso: drive.deadline.toISOString(),
      deadlineLabel: formatDateLabel(drive.deadline),
      timeLeftLabel: formatTimeLeft(drive.deadline),
      rounds: drive.rounds.map((r) => ({
        id: r.id,
        name: r.name,
        sequence: r.sequence,
      })),
      isEligible: eligibility.isEligible,
      failures: eligibility.failures,
      applied: Boolean(app),
      applicationStatus: app?.status ?? null,
    };
  });
}

export async function getStudentDriveDetail(
  collegeId: string,
  student: Student | null,
  driveId: string
): Promise<SerializedDriveItem | null> {
  const drive = await db.query.drives.findFirst({
    where: and(eq(drives.id, driveId), eq(drives.collegeId, collegeId)),
    with: {
      company: true,
      rounds: {
        orderBy: (r, { asc: ascFn }) => [ascFn(r.sequence)],
      },
    },
  });

  if (!drive) return null;

  const existingApp = student
    ? await db.query.applications.findFirst({
        where: and(
          eq(applications.studentId, student.userId),
          eq(applications.driveId, drive.id)
        ),
      })
    : null;

  const eligibility = evaluateDriveEligibility(drive.eligibilityRules, student);
  const ctcNum = Number(drive.ctc);

  return {
    id: drive.id,
    title: drive.title,
    description: drive.description,
    companyName: drive.company.name,
    companyWebsite: drive.company.website,
    ctcNumber: ctcNum,
    ctcFormatted: `₹ ${ctcNum.toFixed(1)} LPA`,
    tier: drive.tier,
    deadlineIso: drive.deadline.toISOString(),
    deadlineLabel: formatDateLabel(drive.deadline),
    timeLeftLabel: formatTimeLeft(drive.deadline),
    rounds: drive.rounds.map((r) => ({
      id: r.id,
      name: r.name,
      sequence: r.sequence,
    })),
    isEligible: eligibility.isEligible,
    failures: eligibility.failures,
    applied: Boolean(existingApp),
    applicationStatus: existingApp?.status ?? null,
  };
}

export async function getStudentApplicationsFeed(
  studentId: string
): Promise<SerializedApplicationItem[]> {
  const rows = await db.query.applications.findMany({
    where: eq(applications.studentId, studentId),
    with: {
      drive: {
        with: {
          company: true,
          rounds: {
            orderBy: (r, { asc: ascFn }) => [ascFn(r.sequence)],
          },
        },
      },
      resume: true,
      roundResults: true,
    },
    orderBy: [desc(applications.appliedAt)],
  });

  return rows.map((app) => {
    const resultByRoundId = new Map(
      app.roundResults.map((rr) => [rr.roundId, rr.result])
    );

    const rounds = app.drive.rounds.map((round) => ({
      id: round.id,
      name: round.name,
      sequence: round.sequence,
      result: resultByRoundId.get(round.id) ?? 'PENDING',
    }));

    const activeRound =
      rounds.find((r) => r.result === 'PENDING') ?? rounds[rounds.length - 1];

    return {
      id: app.id,
      driveId: app.driveId,
      roleTitle: app.drive.title,
      companyName: app.drive.company.name,
      tier: app.drive.tier,
      ctcFormatted: `₹ ${Number(app.drive.ctc).toFixed(1)} LPA`,
      status: app.status,
      appliedOn: formatDateLabel(app.appliedAt),
      resumeFileKey: app.resume?.fileKey ?? null,
      rounds,
      currentRound: activeRound ? activeRound.name : 'Application Review',
    };
  });
}

export async function getStudentApplicationDetail(
  studentId: string,
  applicationId: string
): Promise<SerializedApplicationItem | null> {
  const all = await getStudentApplicationsFeed(studentId);
  return all.find((item) => item.id === applicationId) ?? null;
}
