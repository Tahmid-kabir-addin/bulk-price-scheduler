const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }
  prisma = global.__db;
}

module.exports = prisma;
