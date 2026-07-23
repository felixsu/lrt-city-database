import { prisma } from "@/lib/prisma";

const UPLOAD_SETTINGS_ID = 1;

export async function getUploadSettings() {
  return prisma.uploadSettings.upsert({
    where: { id: UPLOAD_SETTINGS_ID },
    update: {},
    create: { id: UPLOAD_SETTINGS_ID },
  });
}

export { UPLOAD_SETTINGS_ID };
