/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

const defaultHomeContent = {
  id: 1,
  aboutTitle: "A transit-anchored home in Tebet",
  aboutMarkdown:
    "Perkumpulan konsumen LRT City Tebet yang menanti hak nya dipenuhi oleh PT ADCP (Adhi Commuter Properti), bagian dari Adhi Karya Group.",
  howToJoinTitle: "Bergabung dengan kami",
  howToJoinMarkdown:
    "1. Siapkan data unit (PPJB / SPPU)\n2. Daftarkan informasi kontak dan nomor unit\n3. Bersama-sama memantau progres dan memperjuangkan hak konsumen",
  updatedAt: new Date(),
};

const defaultUploadSettings = {
  id: 1,
  timelineMaxUploadMb: 10,
  ppjbMaxUploadMb: 10,
  updatedAt: new Date(),
};

const defaultBuildings = [
  { id: "bld-tower-c", name: "Tower C", totalUnits: 400, createdAt: new Date() },
  { id: "bld-tower-d", name: "Tower D", totalUnits: 350, createdAt: new Date() },
];

const defaultLoanBanks = [
  { id: "bank-mandiri", name: "Bank Mandiri", createdAt: new Date() },
  { id: "bank-btn", name: "Bank BTN", createdAt: new Date() },
  { id: "bank-bca", name: "Bank BCA", createdAt: new Date() },
];

const defaultTimelineEvents = [
  {
    id: "evt-1",
    title: "Groundbreaking LRT City",
    description: "Peletakan batu pertama pembangunan projek LRT City Tebet.",
    eventDate: new Date("2020-03-01"),
    order: 0,
    media: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "evt-2",
    title: "Konsolidasi Komunitas Konsumen",
    description: "Pertemuan koordinasi pemilik unit membahas serah terima dan status PPJB.",
    eventDate: new Date("2023-08-15"),
    order: 1,
    media: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultMediaLinks = [
  {
    id: "ml-1",
    url: "https://lrtcity.lixionary.com",
    title: "Komunitas Konsumen LRT City Tebet",
    description: "Perkumpulan konsumen yang menanti haknya dipenuhi oleh PT ADCP.",
    imageUrl: null,
    publishedAt: new Date(),
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function createMockModel(modelName: string) {
  return {
    findMany: async () => {
      if (modelName === "timelineEvent") return defaultTimelineEvents;
      if (modelName === "mediaLink") return defaultMediaLinks;
      if (modelName === "building") return defaultBuildings;
      if (modelName === "loanBank") return defaultLoanBanks;
      return [];
    },
    findFirst: async () => {
      if (modelName === "homeContent") return defaultHomeContent;
      if (modelName === "uploadSettings") return defaultUploadSettings;
      return null;
    },
    findUnique: async () => {
      if (modelName === "homeContent") return defaultHomeContent;
      if (modelName === "uploadSettings") return defaultUploadSettings;
      return null;
    },
    upsert: async (args?: any) => {
      if (modelName === "homeContent") return defaultHomeContent;
      if (modelName === "uploadSettings") return defaultUploadSettings;
      return args?.create ?? { id: 1 };
    },
    count: async () => {
      if (modelName === "timelineEvent") return defaultTimelineEvents.length;
      if (modelName === "mediaLink") return defaultMediaLinks.length;
      if (modelName === "building") return defaultBuildings.length;
      return 0;
    },
    create: async (d: any) => ({ id: "mock-id", ...(d?.data ?? {}) }),
    update: async (d: any) => ({ id: d?.where?.id ?? "mock-id", ...(d?.data ?? {}) }),
    delete: async () => ({ id: "deleted-id" }),
  };
}

function createPrismaMock() {
  const modelMocks = new Map<string, any>();
  const mockProxy: any = new Proxy(
    {
      $transaction: async (arg: any) => {
        if (typeof arg === "function") return arg(mockProxy);
        if (Array.isArray(arg)) return Promise.all(arg);
        return [];
      },
      $connect: async () => {},
      $disconnect: async () => {},
    },
    {
      get: (target, prop: string) => {
        if (prop in target) return (target as any)[prop];
        if (typeof prop !== "string" || prop.startsWith("$")) return undefined;
        if (!modelMocks.has(prop)) {
          modelMocks.set(prop, createMockModel(prop));
        }
        return modelMocks.get(prop);
      },
    },
  );
  return mockProxy;
}

let realPrisma: PrismaClient | null = null;
const mockPrisma = createPrismaMock();

if (process.env.DATABASE_URL) {
  try {
    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
    realPrisma = globalForPrisma.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = realPrisma;
  } catch {
    console.warn("[AI Studio] Database client initialization failed — using mock");
  }
} else {
  console.warn("[AI Studio] DATABASE_URL not set — using in-memory mock for Prisma");
}

export const prisma: PrismaClient = new Proxy(
  {} as unknown as PrismaClient,
  {
    get: (_, prop: string) => {
      if (!realPrisma) {
        return mockPrisma[prop];
      }
      const realTarget = (realPrisma as any)[prop];
      if (typeof realTarget === "function") {
        return async (...args: any[]) => {
          try {
            return await realTarget.apply(realPrisma, args);
          } catch (err) {
            console.warn(`[AI Studio] prisma.${prop} failed, falling back to mock:`, err);
            const mockTarget = mockPrisma[prop];
            return typeof mockTarget === "function" ? mockTarget(...args) : mockTarget;
          }
        };
      }
      if (typeof realTarget === "object" && realTarget !== null) {
        return new Proxy(realTarget, {
          get: (modelTarget, method: string) => {
            const realMethod = modelTarget[method];
            if (typeof realMethod === "function") {
              return async (...args: any[]) => {
                try {
                  return await realMethod.apply(modelTarget, args);
                } catch (err) {
                  console.warn(`[AI Studio] prisma.${prop}.${method} failed, falling back to mock:`, err);
                  const fallbackModel = mockPrisma[prop];
                  return fallbackModel?.[method]?.(...args);
                }
              };
            }
            return realMethod;
          },
        });
      }
      return realTarget ?? mockPrisma[prop];
    },
  },
);

