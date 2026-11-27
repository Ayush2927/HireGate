import { desc, eq, and } from 'drizzle-orm';
import { db } from '../db';
import { companies, drives } from '../db/schema';
import { getCurrentUser } from '../auth/session';

export interface RecruiterCandidateItem {
  applicationId: string;
  studentUserId: string;
  driveId: string;
  driveTitle: string;
  driveTier: string;
  companyName: string;
  name: string;
  email: string;
  rollNo: string;
  branch: string;
  cgpa: number;
  status: string;
  appliedOn: string;
}

export interface RecruiterDriveItem {
  id: string;
  title: string;
  companyName: string;
  tier: string;
  ctcFormatted: string;
  status: string;
  deadlineLabel: string;
  applicantCount: number;
  shortlistedCount: number;
  offeredCount: number;
}

export async function requireRecruiterUser() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'RECRUITER' && user.role !== 'ADMIN')) {
    return null;
  }
  return user;
}

export async function getRecruiterWorkspaceData(
  collegeId: string,
  companyId: string | null
): Promise<{
  companyName: string | null;
  companyWebsite: string | null;
  drives: RecruiterDriveItem[];
  candidates: RecruiterCandidateItem[];
}> {
  const whereClause = companyId
    ? and(eq(drives.collegeId, collegeId), eq(drives.companyId, companyId))
    : eq(drives.collegeId, collegeId);

  const driveRows = await db.query.drives.findMany({
    where: whereClause,
    with: {
      company: true,
      applications: {
        with: {
          student: {
            with: {
              user: true,
            },
          },
        },
        orderBy: (a, { desc: descFn }) => [descFn(a.appliedAt)],
      },
    },
    orderBy: [desc(drives.createdAt)],
  });

  const company = companyId
    ? await db.query.companies.findFirst({ where: eq(companies.id, companyId) })
    : driveRows[0]?.company ?? null;

  const formattedDrives: RecruiterDriveItem[] = driveRows.map((d) => ({
    id: d.id,
    title: d.title,
    companyName: d.company.name,
    tier: d.tier,
    ctcFormatted: `₹ ${Number(d.ctc).toFixed(1)} LPA`,
    status: d.status,
    deadlineLabel: d.deadline.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    applicantCount: d.applications.length,
    shortlistedCount: d.applications.filter(
      (a) => a.status === 'SHORTLISTED' || a.status === 'IN_PROGRESS'
    ).length,
    offeredCount: d.applications.filter((a) => a.status === 'OFFERED').length,
  }));

  const candidates: RecruiterCandidateItem[] = [];
  for (const d of driveRows) {
    for (const app of d.applications) {
      candidates.push({
        applicationId: app.id,
        studentUserId: app.studentId,
        driveId: d.id,
        driveTitle: d.title,
        driveTier: d.tier,
        companyName: d.company.name,
        name: app.student.user.name,
        email: app.student.user.email,
        rollNo: app.student.rollNo,
        branch: app.student.branch,
        cgpa: Number(app.student.cgpa),
        status: app.status,
        appliedOn: app.appliedAt.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      });
    }
  }

  return {
    companyName: company?.name ?? null,
    companyWebsite: company?.website ?? null,
    drives: formattedDrives,
    candidates,
  };
}
