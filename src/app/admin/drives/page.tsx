import React from "react";
import { redirect } from "next/navigation";
import {
  getAdminDrivesList,
  requireAdminUser,
} from "@/server/queries/admin.queries";
import { AdminDrivesView } from "./drives-view";

export default async function AdminDrivesPage() {
  const admin = await requireAdminUser();
  if (!admin) {
    redirect("/login");
  }

  const drives = await getAdminDrivesList(admin.collegeId);
  return <AdminDrivesView initialDrives={drives} />;
}
