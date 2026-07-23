import { prisma } from "@/lib/prisma";

const HOME_CONTENT_ID = 1;

export async function getHomeContent() {
  return prisma.homeContent.upsert({
    where: { id: HOME_CONTENT_ID },
    update: {},
    create: { id: HOME_CONTENT_ID },
  });
}

export { HOME_CONTENT_ID };
