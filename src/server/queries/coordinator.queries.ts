import { asc, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import {
  driveCoordinators,
  drives,
  notifications,
} from '../db/schema';
import { getCurrentUser } from '../auth/session';

export interface CoordinatorRoundItem {
  id: string;
  name: string;
  sequence: number;
}

export interface CoordinatorCandidateItem {
  applicationId: string;
  studentUserId: string;
  name: string;
  rollNo: string;
  branch: string;
  cgpa: number;
  applicationStatus: string;
  roundResults: Record<string, 'PENDING' | 'PASSED' | 'FAILED' | 'ABSENT'>;
}

export interface CoordinatorDriveItem {
  id: string;
  title: string;
  companyName: string;
  tier: string;
  status: string;
  deadlineLabel: string;
  rounds: CoordinatorRoundItem[];
  candidates: CoordinatorCandidateItem[];
}

export interface CoordinatorAnnouncementItem {
  id: string;
  title: string;
  venue: string;
  message: string;
  sentAt: string;
}

export async function requireCoordinatorUser() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'COORDINATOR' && user.role !== 'ADMIN')) {
    return null;
  }
  return user;
}

export async function getCoordinatorWorkspaceData(
  userId: string,
  collegeId: string,
  role: string
): Promise<{
  drives: CoordinatorDriveItem[];
  announcements: CoordinatorAnnouncementItem[];
}> {
  const assignments = await db.query.driveCoordinators.findMany({
    where: eq(driveCoordinators.userId, userId),
  });
  const assignedDriveIds = new Set(assignments.map((a) => a.driveId));

  const allCollegeDrives = await db.query.drives.findMany({
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
        orderBy: (a, { asc: ascFn }) => [ascFn(a.appliedAt)],
      },
    },
    orderBy: [asc(drives.deadline)],
  });

  const scopedDrives =
    role === 'COORDINATOR' && assignedDriveIds.size > 0
      ? allCollegeDrives.filter((d) => assignedDriveIds.has(d.id))
      : allCollegeDrives;

  const formattedDrives: CoordinatorDriveItem[] = scopedDrives.map((d) => ({
    id: d.id,
    title: d.title,
    companyName: d.company.name,
    tier: d.tier,
    status: d.status,
    deadlineLabel: d.deadline.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    rounds: d.rounds.map((r) => ({
      id: r.id,
      name: r.name,
      sequence: r.sequence,
    })),
    candidates: d.applications.map((app) => {
      const resultsMap: Record<
        string,
        'PENDING' | 'PASSED' | 'FAILED' | 'ABSENT'
      > = {};
      for (const rr of app.roundResults) {
        resultsMap[rr.roundId] = rr.result;
      }
      return {
        applicationId: app.id,
        studentUserId: app.studentId,
        name: app.student.user.name,
        rollNo: app.student.rollNo,
        branch: app.student.branch,
        cgpa: Number(app.student.cgpa),
        applicationStatus: app.status,
        roundResults: resultsMap,
      };
    }),
  }));

  const notifRows = await db.query.notifications.findMany({
    where: eq(notifications.type, 'ROUND_ANNOUNCEMENT'),
    orderBy: [desc(notifications.sentAt)],
    limit: 20,
  });

  const seenRefs = new Set<string>();
  const announcements: CoordinatorAnnouncementItem[] = [];
  for (const n of notifRows) {
    if (seenRefs.has(n.refId)) continue;
    seenRefs.add(n.refId);
    const payload = n.payload as {
      title?: string;
      venue?: string;
      message?: string;
    };
    announcements.push({
      id: n.id,
      title: payload.title ?? 'Round Update',
      venue: payload.venue ?? 'Placement Cell',
      message: payload.message ?? '',
      sentAt: n.sentAt.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  }

  return { drives: formattedDrives, announcements };
}
