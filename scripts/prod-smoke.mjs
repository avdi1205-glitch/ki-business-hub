const baseUrl = process.env.PROD_BASE_URL || "https://ki-business-hub.vercel.app";

const pagePaths = [
  "/",
  "/tools",
  "/affiliate",
  "/content-factory",
  "/blog",
  "/admin/dashboard",
];

const apiChecks = [
  {
    path: "/api/revenue-playbook?plan=pro",
    expectedStatus: 200,
    bodyIncludes: ["success"],
  },
  {
    path: "/api/revenue-playbook?plan=starter",
    expectedStatus: 403,
    bodyIncludes: ["locked", "ab Pro verfuegbar"],
  },
  {
    path: "/api/internal-bots/history?limit=5",
    expectedStatus: 200,
    bodyIncludes: ["success"],
  },
];

const pageContentHints = [
  "KI Business Hub",
  "Content-Factory",
  "Affiliate",
  "Blog",
  "Tools",
  "Verdiene",
];

async function checkUrl(path, expectedStatus, bodyIncludes) {
  const url = `${baseUrl}${path}`;
  try {
    const response = await fetch(url, { redirect: "follow" });
    const body = await response.text();
    const statusOk = response.status === expectedStatus;
    const contentOk = bodyIncludes.length === 0 || bodyIncludes.some((hint) => body.includes(hint));
    return {
      path,
      status: response.status,
      ok: statusOk && contentOk,
      reason: statusOk ? (contentOk ? "ok" : "content") : "status",
    };
  } catch (error) {
    return {
      path,
      status: "ERROR",
      ok: false,
      reason: error instanceof Error ? error.message : "unknown",
    };
  }
}

async function main() {
  const results = [];

  for (const path of pagePaths) {
    results.push(await checkUrl(path, 200, pageContentHints));
  }

  for (const api of apiChecks) {
    results.push(await checkUrl(api.path, api.expectedStatus, api.bodyIncludes));
  }

  const failed = results.filter((r) => !r.ok);

  console.table(
    results.map((r) => ({
      path: r.path,
      status: r.status,
      ok: r.ok,
      reason: r.reason,
    })),
  );

  if (failed.length > 0) {
    console.error(`prod smoke failed: ${failed.length} checks`);
    process.exit(1);
  }

  console.log(`prod smoke passed: ${results.length} checks`);
}

main();