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

function requestedPath(request) {
  const raw = request.query?.path;
  const value = Array.isArray(raw) ? raw.join("/") : String(raw || "");
  if (/^\/(?:image|media|raw|v|video)\/[A-Za-z0-9][A-Za-z0-9-]{0,63}$/.test(value)) return value;
  return "";
}

module.exports = async function handler(request, response) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.statusCode = 405;
    response.end("Method not allowed");
    return;
  }
  const backendUrl = getBackendUrl();
  const mediaPath = requestedPath(request);
  if (!backendUrl || !mediaPath) {
    response.statusCode = !backendUrl ? 503 : 404;
    response.setHeader("content-type", "text/plain; charset=utf-8");
    response.end(!backendUrl ? "BACKEND_URL is not configured in Vercel." : "Media route not found.");
    return;
  }
  try {
    const headers = {};
    const backendAccessToken = String(process.env.BACKEND_ACCESS_TOKEN || "").trim();
    if (backendAccessToken) headers["x-backend-access-token"] = backendAccessToken;
    for (const name of ["range", "if-none-match", "if-modified-since", "x-vercel-ip-country", "cf-ipcountry"]) {
      if (request.headers[name]) headers[name] = request.headers[name];
    }
    const upstream = await fetch(`${backendUrl}${mediaPath}`, {
      method: request.method,
      headers,
      redirect: "manual",
    });
    response.statusCode = upstream.status;
    for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "cache-control", "content-disposition", "etag", "last-modified", "x-content-type-options"]) {
      const value = upstream.headers.get(name);
      if (value) response.setHeader(name, value);
    }
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    response.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    response.statusCode = 502;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Media backend unavailable.", detail: error.message }));
  }
};
