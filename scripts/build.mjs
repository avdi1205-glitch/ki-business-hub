import { spawnSync } from "node:child_process";

const env = { ...process.env };

if (!env.DIRECT_URL && env.DATABASE_URL) {
  env.DIRECT_URL = env.DATABASE_URL;
}

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

run("npx", ["prisma", "migrate", "resolve", "--rolled-back", "20260704000000_init_postgres"], { allowFailure: true });
run("npx", ["prisma", "migrate", "deploy"]);
run("npx", ["next", "build"]);