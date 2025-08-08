// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");
 
// Get the Gemini API key from environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;
 
const app = express();
app.use(cors());
app.use(bodyParser.json());

// API endpoint for Gemini
app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;
 
  // Input validation
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Check for API key
  if (!geminiApiKey) {
    return res.status(500).json({ error: "Gemini API key not configured." });
  }

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": geminiApiKey,
        }, 
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new Error("No reply from Gemini model.");
    }

    res.json({ result: reply });
  } catch (err) {
    console.error("❌ Gemini API error:", err.response?.data?.error || err.message);
    res.status(500).json({ error: "Failed to fetch from Gemini API" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});