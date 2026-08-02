import { PrismaClient } from "../generated/client";

// Standard "singleton across hot-reloads" pattern so ts-node-dev / nodemon
// restarts in each microservice don't open a new pool of DB connections
// every time a file changes.
declare global {
  // eslint-disable-next-line no-var
  var __vectrazaiPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__vectrazaiPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__vectrazaiPrisma = prisma;
}

export * from "../generated/client";
export default prisma;
