import React from "react";
import { notFound, redirect } from "next/navigation";
import {
  getRecruiterWorkspaceData,
  requireRecruiterUser,
} from "@/server/queries/recruiter.queries";
import { RecruiterDashboardView } from "../../dashboard/recruiter-dashboard-view";

export default async function RecruiterDriveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRecruiterUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const data = await getRecruiterWorkspaceData(user.collegeId, user.companyId);
  const drive = data.drives.find((d) => d.id === id);

  if (!drive) {
    notFound();
  }

  return (
    <RecruiterDashboardView
      companyName={drive.companyName}
      drives={[drive]}
      candidates={data.candidates.filter((c) => c.driveId === id)}
    />
  );
}
