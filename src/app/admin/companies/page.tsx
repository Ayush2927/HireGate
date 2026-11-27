import React from "react";
import { redirect } from "next/navigation";
import {
  getAdminCompaniesList,
  requireAdminUser,
} from "@/server/queries/admin.queries";
import { AdminCompaniesView } from "./companies-view";

export default async function AdminCompaniesPage() {
  const admin = await requireAdminUser();
  if (!admin) {
    redirect("/login");
  }

  const companies = await getAdminCompaniesList(admin.collegeId);
  return <AdminCompaniesView initialCompanies={companies} />;
}
