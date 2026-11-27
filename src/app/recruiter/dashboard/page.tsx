import React from "react";
import { redirect } from "next/navigation";
import {
  getRecruiterWorkspaceData,
  requireRecruiterUser,
} from "@/server/queries/recruiter.queries";
import { RecruiterDashboardView } from "./recruiter-dashboard-view";

export default async function RecruiterDashboardPage() {
  const user = await requireRecruiterUser();
  if (!user) {
    redirect("/login");
  }

  const data = await getRecruiterWorkspaceData(user.collegeId, user.companyId);

  return (
    <RecruiterDashboardView
      companyName={data.companyName}
      drives={data.drives}
      candidates={data.candidates}
    />
  );
}
