const express = require("express");
const cors = require("cors");
const fetch = global.fetch || require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Root
app.get("/", (req, res) => {
  res.sendFile(require("path").join(__dirname, "public", "index.html"));
});

/**
 * GET /api/info?url=<YOUTUBE_URL>
 * Returns JSON info from yt-api.org
 */
app.get("/api/info", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "You must provide ?url=" });

    const apiURL = `https://yt-api.org/api/info?url=${encodeURIComponent(url)}`;
    const r = await fetch(apiURL, { method: "GET" });
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: "Upstream error", status: r.status, body: text });
    }
    const data = await r.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/download?url=<YOUTUBE_URL>&type=mp4
 * This proxies a simple downloader button HTML (or direct link) from yt-api.org.
 * We return the upstream body (HTML or redirect) so frontend can use it.
 */
app.get("/api/download", async (req, res) => {
  try {
    const url = req.query.url;
    const type = req.query.type || "mp4"; // mp4 or mp3 or button
    if (!url) return res.status(400).json({ error: "You must provide ?url=" });

    // Examples on yt-api.org:
    // /api/button/mp4?url=...
    // /api/button/mp3?url=...
    // or other endpoints — we use button endpoints for a simple result
    const apiURL = `https://yt-api.org/api/button/${encodeURIComponent(type)}?url=${encodeURIComponent(url)}`;
    const r = await fetch(apiURL, { method: "GET" });
    const body = await r.text();

    // If upstream returned HTML with a direct link, respond with HTML
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(body);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port " + PORT));
