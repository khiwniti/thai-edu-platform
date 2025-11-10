// Database Layer - Unified Export
// Thai Education Platform

// Prisma (PostgreSQL) - Relational Data
export { prisma } from './prisma';
export * from '@prisma/client';

// MongoDB - Document Storage
export { connectMongoDB } from './mongodb';
export * from './models';

// Redis - Caching (to be implemented)
// export { redis } from './redis';
