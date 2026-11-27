import React from "react";
import { redirect } from "next/navigation";
import {
  getAdminApplicationsList,
  requireAdminUser,
} from "@/server/queries/admin.queries";
import { AdminApplicationsView } from "./applications-view";

export default async function AdminApplicationsPage() {
  const admin = await requireAdminUser();
  if (!admin) {
    redirect("/login");
  }

  const applications = await getAdminApplicationsList(admin.collegeId);
  return <AdminApplicationsView initialApplications={applications} />;
}
