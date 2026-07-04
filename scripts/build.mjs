import { spawnSync } from "node:child_process";

const env = { ...process.env };
const isVercel = env.VERCEL === "1";

if (!env.DIRECT_URL && env.DATABASE_URL) {
  env.DIRECT_URL = env.DATABASE_URL;
}

const hasPostgresUrl = Boolean(env.DATABASE_URL && env.DATABASE_URL !== "file:./dev.db");
const shouldRunMigrations = hasPostgresUrl && env.RUN_PRISMA_MIGRATIONS === "1" && !isVercel;

const run = (command, args, { allowFailure = false } = {}) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  });

  if (result.status !== 0 && !allowFailure) {
    process.exit(result.status ?? 1);
  }
};

if (shouldRunMigrations) {
  run("npx", ["prisma", "migrate", "resolve", "--rolled-back", "20260704000000_init_postgres"], { allowFailure: true });
  run("npx", ["prisma", "migrate", "deploy"]);
} else if (hasPostgresUrl) {
  if (isVercel) {
    console.log("Skipping prisma migrate deploy on Vercel build (run migrations manually)");
  } else {
    console.log("Skipping prisma migrate deploy during build (set RUN_PRISMA_MIGRATIONS=1 to enable)");
  }
}
run("npx", ["next", "build"]);