import express from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import { config } from "dotenv";

config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const siteConfig = JSON.parse(readFileSync("./public/site.config.json", "utf-8"));

const dataDir = "./data";
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const BASE_URL = process.env.BASE_SHORT_URL || `http://localhost:${process.env.PORT || 5000}`;
const CODE_LENGTH = parseInt(process.env.SHORT_CODE_LENGTH || "6", 10);

// --- JSON store helpers ---
function readStore(file, defaultVal) {
  try { return JSON.parse(readFileSync(file, "utf-8")); }
  catch { return defaultVal; }
}
function writeStore(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2));
}

const urlsFile = join(dataDir, "urls.json");
const leadsFile = join(dataDir, "leads.json");

if (!existsSync(urlsFile)) writeStore(urlsFile, { urls: [] });
if (!existsSync(leadsFile)) writeStore(leadsFile, { leads: [] });

// --- URL helpers ---
function generateCode() {
  return randomBytes(Math.ceil(CODE_LENGTH * 0.75)).toString("base64url").slice(0, CODE_LENGTH);
}
function isValidUrl(str) {
  try { const u = new URL(str); return u.protocol === "http:" || u.protocol === "https:"; }
  catch { return false; }
}

// --- Static ---
app.use(express.static("public"));

// --- Health ---
app.get("/health", (_req, res) => res.json({ ok: true, siteName: siteConfig.siteName, version: siteConfig.version }));
app.get("/api/health", (_req, res) => res.json({ ok: true, siteName: siteConfig.siteName, version: siteConfig.version }));

// --- Shorten ---
app.post("/api/shorten", (req, res) => {
  const { url, custom_code } = req.body;
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ success: false, message: "A valid http/https URL is required" });
  }

  const store = readStore(urlsFile, { urls: [] });
  let code = custom_code?.trim();

  if (code) {
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(code)) {
      return res.status(400).json({ success: false, message: "Custom code must be 3-20 alphanumeric characters" });
    }
    if (store.urls.find(u => u.short_code === code)) {
      return res.status(409).json({ success: false, message: "Custom code already taken" });
    }
  } else {
    let attempts = 0;
    do {
      code = generateCode();
      if (++attempts > 10) return res.status(500).json({ success: false, message: "Failed to generate unique code" });
    } while (store.urls.find(u => u.short_code === code));
  }

  const entry = {
    id: `url_${Date.now()}`,
    short_code: code,
    original_url: url,
    clicks: 0,
    created_at: new Date().toISOString(),
  };
  store.urls.unshift(entry);
  writeStore(urlsFile, store);

  res.status(201).json({
    success: true,
    short_code: code,
    short_url: `${BASE_URL}/${code}`,
    original_url: url,
  });
});

// --- Stats ---
app.get("/api/stats/:code", (req, res) => {
  const store = readStore(urlsFile, { urls: [] });
  const entry = store.urls.find(u => u.short_code === req.params.code);
  if (!entry) return res.status(404).json({ success: false, message: "Short URL not found" });
  res.json({ success: true, ...entry, short_url: `${BASE_URL}/${entry.short_code}` });
});

// --- List ---
app.get("/api/urls", (_req, res) => {
  const store = readStore(urlsFile, { urls: [] });
  const urls = store.urls.slice(0, 100).map(u => ({ ...u, short_url: `${BASE_URL}/${u.short_code}` }));
  res.json({ success: true, count: urls.length, urls });
});

// --- Delete ---
app.delete("/api/urls/:code", (req, res) => {
  const store = readStore(urlsFile, { urls: [] });
  const idx = store.urls.findIndex(u => u.short_code === req.params.code);
  if (idx === -1) return res.status(404).json({ success: false, message: "Not found" });
  store.urls.splice(idx, 1);
  writeStore(urlsFile, store);
  res.json({ success: true });
});

// --- Leads ---
app.post("/api/leads", (req, res) => {
  const { firstName, lastName, email, company, phone, source } = req.body;
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ success: false, message: "First name, last name, and email are required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }
  const store = readStore(leadsFile, { leads: [] });
  const existing = store.leads.find(l => l.email === email);
  if (existing) return res.json({ success: true, message: "Lead already exists", leadId: existing.id });
  const lead = {
    id: `lead_${Date.now()}_${randomBytes(4).toString("hex")}`,
    firstName, lastName, email,
    company: company || "", phone: phone || "",
    source: source || "direct", status: "new",
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  store.leads.push(lead);
  writeStore(leadsFile, store);
  res.status(201).json({ success: true, message: "Lead captured successfully", leadId: lead.id });
});

app.get("/api/leads", (_req, res) => {
  const store = readStore(leadsFile, { leads: [] });
  res.json({ success: true, count: store.leads.length, leads: store.leads });
});

// --- Redirect (last, before 404) ---
app.get("/:code", (req, res, next) => {
  if (req.params.code.includes(".")) return next();
  const store = readStore(urlsFile, { urls: [] });
  const entry = store.urls.find(u => u.short_code === req.params.code);
  if (!entry) return next();
  entry.clicks++;
  writeStore(urlsFile, store);
  res.redirect(301, entry.original_url);
});

app.use((_req, res) => res.status(404).json({ success: false, message: "Not found" }));

const port = parseInt(process.env.PORT || "5000", 10);
app.listen(port, "0.0.0.0", () => console.log(`SFS URL Shortener running on port ${port}`));

export default app;
