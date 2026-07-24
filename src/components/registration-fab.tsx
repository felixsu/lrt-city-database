import { prisma } from "@/lib/prisma";
import { RegistrationFabClient } from "./registration-fab-client";

export async function RegistrationFab() {
  const buildings = await prisma.building.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <RegistrationFabClient buildings={buildings} />;
}
