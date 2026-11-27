import React from "react";
import { redirect } from "next/navigation";
import {
  getStudentApplicationsFeed,
  getStudentDrivesFeed,
  getStudentPortalContext,
} from "@/server/queries/student.queries";
import { StudentDashboardView } from "./dashboard-view";

export default async function StudentDashboardPage() {
  const ctx = await getStudentPortalContext();
  if (!ctx) {
    redirect("/login");
  }

  const { user, student, resumes } = ctx;
  const drives = await getStudentDrivesFeed(user.collegeId, student);
  const apps = student ? await getStudentApplicationsFeed(student.userId) : [];

  const offersCount = apps.filter((a) => a.status === "OFFERED").length;
  const inProgressCount = apps.filter(
    (a) => a.status === "SHORTLISTED" || a.status === "IN_PROGRESS"
  ).length;

  return (
    <StudentDashboardView
      userName={user.name}
      student={
        student
          ? {
              rollNo: student.rollNo,
              branch: student.branch,
              batch: student.batch,
              cgpa: student.cgpa,
              isVerified: Boolean(student.verifiedAt),
              placementStatus: student.placementStatus,
              placedTier: student.placedTier,
            }
          : null
      }
      drives={drives}
      resumes={resumes}
      offersCount={offersCount}
      inProgressCount={inProgressCount}
    />
  );
}
