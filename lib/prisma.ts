import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to initialize Prisma.");
  }

  return databaseUrl;
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
  });

  return new PrismaClient({ adapter });
}

function isCompatiblePrismaClient(
  client: PrismaClient | undefined,
): client is PrismaClient {
  return Boolean(client && "twoFactorChallenge" in client);
}

const cachedPrisma = globalForPrisma.prisma;

let prismaInstance: PrismaClient;

if (isCompatiblePrismaClient(cachedPrisma)) {
  prismaInstance = cachedPrisma;
} else {
  prismaInstance = createPrismaClient();
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
