import { spawnSync } from "node:child_process";

const env = { ...process.env };
const isVercel = env.VERCEL === "1";

const nodeOptions = env.NODE_OPTIONS ?? "";
if (!nodeOptions.includes("--max-old-space-size")) {
  env.NODE_OPTIONS = `${nodeOptions} --max-old-space-size=4096`.trim();
}

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

// Ensure Prisma Client types match the current schema before TypeScript build.
run("npx", ["prisma", "generate"]);

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