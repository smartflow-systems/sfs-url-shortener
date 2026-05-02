import express from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { randomBytes, createHash } from "crypto";
import { config } from "dotenv";
import geoip from "geoip-lite";
import QRCode from "qrcode";

config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const siteConfig = JSON.parse(readFileSync("./public/site.config.json", "utf-8"));

const dataDir = "./data";
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const BASE_URL = process.env.BASE_SHORT_URL || `http://localhost:${process.env.PORT || 5000}`;
const CODE_LENGTH = parseInt(process.env.SHORT_CODE_LENGTH || "6", 10);
const API_KEYS = process.env.API_KEYS?.split(",").map(k => k.trim()).filter(Boolean) || [];

// --- JSON store helpers ---
function readStore(file, defaultVal) {
  try { return JSON.parse(readFileSync(file, "utf-8")); }
  catch { return defaultVal; }
}
function writeStore(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2));
}

const urlsFile       = join(dataDir, "urls.json");
const leadsFile      = join(dataDir, "leads.json");
const analyticsFile  = join(dataDir, "analytics.json");

if (!existsSync(urlsFile))      writeStore(urlsFile,      { urls: [] });
if (!existsSync(leadsFile))     writeStore(leadsFile,     { leads: [] });
if (!existsSync(analyticsFile)) writeStore(analyticsFile, { clicks: {} });

// --- Helpers ---
function generateCode() {
  return randomBytes(Math.ceil(CODE_LENGTH * 0.75)).toString("base64url").slice(0, CODE_LENGTH);
}
function isValidUrl(str) {
  try { const u = new URL(str); return u.protocol === "http:" || u.protocol === "https:"; }
  catch { return false; }
}
function hashPassword(pw) {
  return createHash("sha256").update(pw).digest("hex");
}

function recordClick(code, req) {
  const analytics = readStore(analyticsFile, { clicks: {} });
  if (!analytics.clicks[code]) analytics.clicks[code] = [];

  const rawIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || req.socket.remoteAddress
    || "";
  const ip = rawIp.replace(/^::ffff:/, "");
  const geo = geoip.lookup(ip);
  const ua  = req.headers["user-agent"] || "";

  let device = "desktop";
  if (/mobile/i.test(ua) && !/tablet|ipad/i.test(ua)) device = "mobile";
  else if (/tablet|ipad/i.test(ua)) device = "tablet";

  let browser = "Other";
  if (/Edg\//.test(ua))                           browser = "Edge";
  else if (/Chrome\//.test(ua))                   browser = "Chrome";
  else if (/Firefox\//.test(ua))                  browser = "Firefox";
  else if (/Safari\//.test(ua))                   browser = "Safari";

  analytics.clicks[code].push({
    timestamp: new Date().toISOString(),
    ip,
    country:  geo?.country  || "Unknown",
    city:     geo?.city     || "",
    referrer: req.headers.referer || req.headers.referrer || "",
    device,
    browser,
  });

  writeStore(analyticsFile, analytics);
}

// --- API key middleware (no-op when API_KEYS not configured) ---
function requireApiKey(req, res, next) {
  if (!API_KEYS.length) return next();
  const auth = req.headers.authorization;
  const key  = auth?.startsWith("Bearer ") ? auth.slice(7) : req.headers["x-api-key"];
  if (!key || !API_KEYS.includes(key)) {
    return res.status(401).json({ success: false, message: "Invalid or missing API key" });
  }
  next();
}

// --- Static ---
app.use(express.static("public"));

// --- Health ---
app.get("/health",     (_req, res) => res.json({ ok: true, siteName: siteConfig.siteName, version: siteConfig.version }));
app.get("/api/health", (_req, res) => res.json({ ok: true, siteName: siteConfig.siteName, version: siteConfig.version }));

// --- Shorten (single) ---
app.post("/api/shorten", requireApiKey, (req, res) => {
  const {
    url, custom_code, expires_at, password,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
  } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ success: false, message: "A valid http/https URL is required" });
  }

  // Build UTM-appended destination
  let finalUrl = url;
  const utmEntries = Object.entries({ utm_source, utm_medium, utm_campaign, utm_content, utm_term })
    .filter(([, v]) => v?.trim());
  if (utmEntries.length) {
    const parsed = new URL(url);
    utmEntries.forEach(([k, v]) => parsed.searchParams.set(k, v.trim()));
    finalUrl = parsed.toString();
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
    id:            `url_${Date.now()}`,
    short_code:    code,
    original_url:  finalUrl,
    clicks:        0,
    created_at:    new Date().toISOString(),
    expires_at:    expires_at || null,
    password_hash: password ? hashPassword(password) : null,
    has_password:  !!password,
  };

  store.urls.unshift(entry);
  writeStore(urlsFile, store);

  res.status(201).json({
    success:      true,
    short_code:   code,
    short_url:    `${BASE_URL}/${code}`,
    original_url: finalUrl,
  });
});

// --- Shorten (bulk, up to 50) ---
app.post("/api/shorten/bulk", requireApiKey, (req, res) => {
  const { urls } = req.body;
  if (!Array.isArray(urls) || !urls.length) {
    return res.status(400).json({ success: false, message: "urls array is required" });
  }
  if (urls.length > 50) {
    return res.status(400).json({ success: false, message: "Max 50 URLs per bulk request" });
  }

  const store   = readStore(urlsFile, { urls: [] });
  const results = [];

  for (const item of urls) {
    const url  = typeof item === "string" ? item : item?.url;
    if (!url || !isValidUrl(url)) {
      results.push({ success: false, url, message: "Invalid URL" });
      continue;
    }

    let code = (typeof item === "object" ? item.custom_code : null)?.trim() || null;
    if (code) {
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(code) || store.urls.find(u => u.short_code === code)) {
        results.push({ success: false, url, message: "Invalid or already-taken custom code" });
        continue;
      }
    } else {
      let attempts = 0;
      let ok = false;
      do {
        code = generateCode();
        if (++attempts > 10) break;
        ok = !store.urls.find(u => u.short_code === code);
      } while (!ok);
      if (!ok) { results.push({ success: false, url, message: "Code generation failed" }); continue; }
    }

    const entry = {
      id:            `url_${Date.now()}_${randomBytes(2).toString("hex")}`,
      short_code:    code,
      original_url:  url,
      clicks:        0,
      created_at:    new Date().toISOString(),
      expires_at:    (typeof item === "object" ? item.expires_at : null) || null,
      password_hash: null,
      has_password:  false,
    };
    store.urls.unshift(entry);
    results.push({ success: true, url, short_code: code, short_url: `${BASE_URL}/${code}` });
  }

  writeStore(urlsFile, store);
  res.status(207).json({ success: true, count: results.filter(r => r.success).length, results });
});

// --- Stats ---
app.get("/api/stats/:code", (req, res) => {
  const store = readStore(urlsFile, { urls: [] });
  const entry = store.urls.find(u => u.short_code === req.params.code);
  if (!entry) return res.status(404).json({ success: false, message: "Short URL not found" });
  const { password_hash, ...safe } = entry;
  res.json({ success: true, ...safe, short_url: `${BASE_URL}/${entry.short_code}` });
});

// --- Analytics ---
app.get("/api/analytics/:code", requireApiKey, (req, res) => {
  const store = readStore(urlsFile, { urls: [] });
  const entry = store.urls.find(u => u.short_code === req.params.code);
  if (!entry) return res.status(404).json({ success: false, message: "Short URL not found" });

  const analytics = readStore(analyticsFile, { clicks: {} });
  const clicks    = analytics.clicks[req.params.code] || [];

  const countries = {}, devices = {}, browsers = {}, referrers = {}, byDay = {};
  for (const c of clicks) {
    countries[c.country]                     = (countries[c.country] || 0) + 1;
    devices[c.device]                        = (devices[c.device]   || 0) + 1;
    browsers[c.browser]                      = (browsers[c.browser] || 0) + 1;
    const ref = c.referrer || "Direct";
    referrers[ref]                           = (referrers[ref]      || 0) + 1;
    const day = c.timestamp.slice(0, 10);
    byDay[day]                               = (byDay[day]          || 0) + 1;
  }

  const { password_hash, ...safe } = entry;
  res.json({
    success:       true,
    ...safe,
    short_url:     `${BASE_URL}/${entry.short_code}`,
    total_clicks:  entry.clicks,
    stats: { by_country: countries, by_device: devices, by_browser: browsers, by_referrer: referrers, by_day: byDay },
    recent_clicks: clicks.slice(-20).reverse(),
  });
});

// --- QR code ---
app.get("/api/qr/:code", async (req, res) => {
  const store = readStore(urlsFile, { urls: [] });
  const entry = store.urls.find(u => u.short_code === req.params.code);
  if (!entry) return res.status(404).json({ success: false, message: "Short URL not found" });

  const shortUrl = `${BASE_URL}/${entry.short_code}`;
  const fmt      = req.query.format === "png" ? "png" : "svg";

  try {
    if (fmt === "png") {
      const buf = await QRCode.toBuffer(shortUrl, {
        width: 300, margin: 2,
        color: { dark: "#0D0D0D", light: "#FFD700" },
      });
      res.setHeader("Content-Type", "image/png");
      return res.send(buf);
    }
    const svg = await QRCode.toString(shortUrl, {
      type: "svg", width: 300, margin: 2,
      color: { dark: "#0D0D0D", light: "#FFD700" },
    });
    res.setHeader("Content-Type", "image/svg+xml");
    return res.send(svg);
  } catch {
    res.status(500).json({ success: false, message: "QR generation failed" });
  }
});

// --- List ---
app.get("/api/urls", (_req, res) => {
  const store = readStore(urlsFile, { urls: [] });
  const urls  = store.urls.slice(0, 100).map(({ password_hash, ...u }) => ({
    ...u,
    short_url: `${BASE_URL}/${u.short_code}`,
  }));
  res.json({ success: true, count: urls.length, urls });
});

// --- Delete ---
app.delete("/api/urls/:code", requireApiKey, (req, res) => {
  const store = readStore(urlsFile, { urls: [] });
  const idx   = store.urls.findIndex(u => u.short_code === req.params.code);
  if (idx === -1) return res.status(404).json({ success: false, message: "Not found" });
  store.urls.splice(idx, 1);
  writeStore(urlsFile, store);

  // Clean up analytics
  const analytics = readStore(analyticsFile, { clicks: {} });
  delete analytics.clicks[req.params.code];
  writeStore(analyticsFile, analytics);

  res.json({ success: true });
});

// --- Password verify ---
app.post("/api/verify/:code", (req, res) => {
  const { password } = req.body;
  const store = readStore(urlsFile, { urls: [] });
  const entry = store.urls.find(u => u.short_code === req.params.code);
  if (!entry) return res.status(404).json({ success: false, message: "Not found" });
  if (!entry.password_hash) return res.json({ success: true, redirect: entry.original_url });

  if (hashPassword(password || "") !== entry.password_hash) {
    return res.status(401).json({ success: false, message: "Incorrect password" });
  }

  entry.clicks++;
  writeStore(urlsFile, store);
  recordClick(entry.short_code, req);
  res.json({ success: true, redirect: entry.original_url });
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
  const store    = readStore(leadsFile, { leads: [] });
  const existing = store.leads.find(l => l.email === email);
  if (existing) return res.json({ success: true, message: "Lead already exists", leadId: existing.id });
  const lead = {
    id:        `lead_${Date.now()}_${randomBytes(4).toString("hex")}`,
    firstName, lastName, email,
    company:   company || "", phone: phone || "",
    source:    source  || "direct", status: "new",
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  store.leads.push(lead);
  writeStore(leadsFile, store);
  res.status(201).json({ success: true, message: "Lead captured successfully", leadId: lead.id });
});

app.get("/api/leads", requireApiKey, (_req, res) => {
  const store = readStore(leadsFile, { leads: [] });
  res.json({ success: true, count: store.leads.length, leads: store.leads });
});

// --- Stripe webhook ---
app.post("/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ success: false, message: "Missing STRIPE_WEBHOOK_SECRET" });
  }
  console.log("[stripe] webhook received");
  res.json({ received: true });
});

// --- Hub product routes ---
const hubRoutes = {
  book:    process.env.BOOK_URL    || "https://github.com/smartflow-systems/Barber-booker-tempate-v1",
  ai:      process.env.AI_URL      || "https://github.com/smartflow-systems/SocialScaleBoosterAIbot",
  demo:    process.env.DEMO_URL    || "https://github.com/smartflow-systems",
  contact: process.env.CONTACT_URL || "mailto:boweazy123@gmail.com",
};

app.get("/shorten", (_req, res) => res.sendFile(join(process.cwd(), "public/shortener.html")));

Object.entries(hubRoutes).forEach(([slug, target]) => {
  app.get(`/${slug}`, (_req, res) => res.redirect(302, target));
});

// --- Redirect (must come last before 404) ---
app.get("/:code", (req, res, next) => {
  if (req.params.code.includes(".")) return next();
  const store = readStore(urlsFile, { urls: [] });
  const entry = store.urls.find(u => u.short_code === req.params.code);
  if (!entry) return next();

  // Expiration check
  if (entry.expires_at && new Date() > new Date(entry.expires_at)) {
    return res.status(410).send(
      `<!DOCTYPE html><html><head><meta charset="UTF-8">
       <style>body{background:#0D0D0D;color:#f0e8d8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
       .box{text-align:center}h2{color:#FFD700;margin-bottom:.5rem}</style></head>
       <body><div class="box"><h2>Link Expired</h2><p>This short link has expired and is no longer active.</p></div></body></html>`
    );
  }

  // Password gate
  if (entry.password_hash) {
    return res.sendFile(join(process.cwd(), "public/password.html"));
  }

  entry.clicks++;
  writeStore(urlsFile, store);
  recordClick(entry.short_code, req);

  res.redirect(301, entry.original_url);
});

app.use((_req, res) => res.status(404).json({ success: false, message: "Not found" }));

const port = parseInt(process.env.PORT || "5000", 10);
app.listen(port, "0.0.0.0", () => console.log(`SFS URL Shortener running on port ${port}`));

export default app;
