import { env } from "./config/env";
import { prisma } from "./prisma/client";
import { app } from "./app";

const server = app.listen(env.PORT, () => {
  console.log(`World CRUD API running on http://localhost:${env.PORT}/api`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
