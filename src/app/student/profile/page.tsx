import React from "react";
import { redirect } from "next/navigation";
import { getStudentPortalContext } from "@/server/queries/student.queries";
import { StudentProfileView } from "./profile-view";

export default async function AcademicPassportPage() {
  const ctx = await getStudentPortalContext();
  if (!ctx) {
    redirect("/login");
  }

  const { user, student, verifierName, resumes } = ctx;

  return (
    <StudentProfileView
      userName={user.name}
      initialStudent={
        student
          ? {
              rollNo: student.rollNo,
              branch: student.branch,
              batch: student.batch,
              cgpa: student.cgpa,
              activeBacklogs: student.activeBacklogs,
              tenthPercentage: student.tenthPercentage,
              twelfthPercentage: student.twelfthPercentage,
              verifiedAt: student.verifiedAt
                ? student.verifiedAt.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : null,
              verifierName,
            }
          : null
      }
      resumes={resumes}
    />
  );
}
