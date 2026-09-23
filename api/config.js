const fs = require("node:fs");
const path = require("node:path");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.statusCode = 405;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Use GET for dashboard configuration." }));
    return;
  }
  try {
    const config = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "vercel.json"), "utf8"));
    const env = config.env || {};
    const client = {
      apiBase: "/api",
      client_id: String(process.env.DISCORD_CLIENT_ID || env.DISCORD_CLIENT_ID || "1543274582520111104"),
      redirect_uri: String(process.env.DASHBOARD_REDIRECT_URI || env.DASHBOARD_REDIRECT_URI || "https://imagehost.bond/dashboard.html"),
      media_origin: String(process.env.MEDIA_ORIGIN || env.MEDIA_ORIGIN || "https://imagehost.bond").replace(/\/+$/, ""),
    };
    response.statusCode = 200;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.setHeader("cache-control", "no-store");
    response.end(JSON.stringify({ client }));
  } catch (error) {
    response.statusCode = 500;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Could not load Vercel configuration.", detail: error.message }));
  }
};
