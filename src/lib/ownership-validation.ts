import { z } from "zod";
import { Prisma } from "@prisma/client";

export const unitNumberSchema = z
  .string()
  .trim()
  .regex(/^\d{2}-\d{2}$/, "Unit number must be in the format 05-18 (2-digit floor, 2-digit room).");

export function isUniqueConstraintError(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export function uniqueConstraintField(err: unknown): string | null {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") return null;
  const target = err.meta?.target;
  return Array.isArray(target) ? String(target[0]) : typeof target === "string" ? target : null;
}
