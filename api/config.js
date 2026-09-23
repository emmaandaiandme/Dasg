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
    response.statusCode = 200;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.setHeader("cache-control", "no-store");
    response.end(JSON.stringify({ client: config.client || { apiBase: "/api" } }));
  } catch (error) {
    response.statusCode = 500;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Could not load Vercel configuration.", detail: error.message }));
  }
};
