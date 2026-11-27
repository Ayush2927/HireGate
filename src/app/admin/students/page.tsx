import React from "react";
import { redirect } from "next/navigation";
import {
  getAdminStudentsList,
  requireAdminUser,
} from "@/server/queries/admin.queries";
import { AdminStudentsView } from "./students-view";

export default async function AdminVerificationDeskPage() {
  const admin = await requireAdminUser();
  if (!admin) {
    redirect("/login");
  }

  const students = await getAdminStudentsList(admin.collegeId);
  return <AdminStudentsView initialStudents={students} />;
}
