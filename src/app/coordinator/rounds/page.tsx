import React from "react";
import { redirect } from "next/navigation";
import {
  getCoordinatorWorkspaceData,
  requireCoordinatorUser,
} from "@/server/queries/coordinator.queries";
import { CoordinatorRoundsView } from "./rounds-view";

export default async function CoordinatorRoundsPage() {
  const user = await requireCoordinatorUser();
  if (!user) {
    redirect("/login");
  }

  const { drives } = await getCoordinatorWorkspaceData(
    user.id,
    user.collegeId,
    user.role
  );

  return <CoordinatorRoundsView drives={drives} />;
}
