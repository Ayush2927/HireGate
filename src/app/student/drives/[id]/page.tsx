import React from "react";
import { notFound, redirect } from "next/navigation";
import {
  getStudentDriveDetail,
  getStudentPortalContext,
} from "@/server/queries/student.queries";
import { StudentDriveDetailView } from "./drive-detail-view";

export default async function StudentDriveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getStudentPortalContext();
  if (!ctx) {
    redirect("/login");
  }

  const { id } = await params;
  const drive = await getStudentDriveDetail(ctx.user.collegeId, ctx.student, id);
  if (!drive) {
    notFound();
  }

  return <StudentDriveDetailView drive={drive} resumes={ctx.resumes} />;
}
