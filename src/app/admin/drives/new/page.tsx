import React from "react";
import { redirect } from "next/navigation";
import {
  getAdminCompaniesList,
  getAdminStudentsList,
  getDefaultDriveDeadline,
  requireAdminUser,
} from "@/server/queries/admin.queries";
import { AdminCreateDriveView } from "./create-drive-view";

export default async function AdminCreateDrivePage() {
  const admin = await requireAdminUser();
  if (!admin) {
    redirect("/login");
  }

  const [companies, students] = await Promise.all([
    getAdminCompaniesList(admin.collegeId),
    getAdminStudentsList(admin.collegeId),
  ]);

  const defaultDeadline = getDefaultDriveDeadline();

  return (
    <AdminCreateDriveView
      companies={companies}
      students={students}
      defaultDeadline={defaultDeadline}
    />
  );
}
