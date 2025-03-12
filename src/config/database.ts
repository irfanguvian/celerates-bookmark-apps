import { PrismaClient } from "@prisma/client";

// Avoid multiple instances of Prisma Client in development
declare global {
	var prisma: PrismaClient;
}

export const prismaC = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
	global.prisma = prismaC;
}

export default prisma;
