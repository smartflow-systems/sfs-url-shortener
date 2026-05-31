import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "server.js",
  "public/index.html",
  "public/shortener.html",
  "public/site.config.json",
  "package.json"
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length) {
  console.error("Missing required files:\n" + missing.map((file) => "- " + file).join("\n"));
  process.exit(1);
}

const server = readFileSync("server.js", "utf8");
for (const route of ["/health", "/api/health", "/api/shorten", "/api/stats/:code", "/api/analytics/:code", "/api/qr/:code"]) {
  if (!server.includes(route)) {
    console.error("Missing expected route: " + route);
    process.exit(1);
  }
}

JSON.parse(readFileSync("public/site.config.json", "utf8"));
console.log("SFS URL Shortener validation passed.");
