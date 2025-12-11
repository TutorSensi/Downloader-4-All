const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Get Video Info
app.get("/api/info", async (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) return res.json({ error: "No URL provided" });

    try {
        const apiURL = `https://api.vevioz.com/api/button/info?url=${encodeURIComponent(videoURL)}`;
        const fetchRes = await fetch(apiURL);
        const text = await fetchRes.text(); // HTML response

        res.send(text); // Directly send HTML to frontend
    } catch (err) {
        res.json({ error: err.message });
    }
});

// Download (MP4/MP3)
app.get("/api/download", async (req, res) => {
    const url = req.query.url;
    const type = req.query.type || "mp4";

    const apiURL = `https://api.vevioz.com/api/button/${type}?url=${encodeURIComponent(url)}`;

    res.redirect(apiURL);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("API running on port " + PORT));
