const fs = require("node:fs");
const path = require("node:path");

function getBackendUrl() {
  try {
    const config = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "vercel.json"), "utf8"));
    const fromConfig = String(config.env?.BACKEND_URL || "").trim();
    if (fromConfig) return fromConfig.replace(/\/+$/, "");
  } catch {
    // Fall through to the environment fallback when the config file is unavailable.
  }
  return String(process.env.BACKEND_URL || "").trim().replace(/\/+$/, "");
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.setHeader("Access-Control-Allow-Origin", request.headers.origin || "*");
    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.end();
    return;
  }
  if (request.method !== "GET") {
    response.statusCode = 405;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Use GET for Discord dashboard requests." }));
    return;
  }
  const authorization = String(request.headers.authorization || "");
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    response.statusCode = 401;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Discord login required." }));
    return;
  }
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    response.statusCode = 503;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "BACKEND_URL is not configured in Vercel." }));
    return;
  }
  try {
    const headers = { accept: "application/json", authorization };
    const backendAccessToken = String(process.env.BACKEND_ACCESS_TOKEN || "").trim();
    if (backendAccessToken) headers["x-backend-access-token"] = backendAccessToken;
    const upstream = await fetch(`${backendUrl}/api/user/dashboard`, {
      method: "GET",
      headers,
      redirect: "manual",
    });
    response.statusCode = upstream.status;
    response.setHeader("content-type", upstream.headers.get("content-type") || "application/json; charset=utf-8");
    response.setHeader("cache-control", "no-store");
    response.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    response.statusCode = 502;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Backend unavailable.", detail: error.message }));
  }
};
