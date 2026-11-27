import React from "react";
import { redirect } from "next/navigation";
import {
  getCoordinatorWorkspaceData,
  requireCoordinatorUser,
} from "@/server/queries/coordinator.queries";
import { CoordinatorAnnouncementsView } from "./announcements-view";

export default async function CoordinatorAnnouncementsPage() {
  const user = await requireCoordinatorUser();
  if (!user) {
    redirect("/login");
  }

  const { drives, announcements } = await getCoordinatorWorkspaceData(
    user.id,
    user.collegeId,
    user.role
  );

  return (
    <CoordinatorAnnouncementsView
      drives={drives}
      announcements={announcements}
    />
  );
}
