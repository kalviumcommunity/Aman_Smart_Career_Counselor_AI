const cosineSimilarity = require('./cosineSimilarity');
// VectorDB integration
const db = require('./vectorDB');

// Endpoint to insert a vector
app.post('/api/vector/insert', async (req, res) => {
  const { id, embedding, metadata } = req.body;
  if (!id || !embedding) {
    return res.status(400).json({ error: 'id and embedding are required' });
  }
  try {
    await db.insert(id, embedding, metadata || {});
    res.json({ success: true });
  } catch (err) {
    console.error('VectorDB insert error:', err);
    res.status(500).json({ error: 'Failed to insert vector' });
  }
});

// Endpoint to search for similar vectors
app.post('/api/vector/search', async (req, res) => {
  const { embedding, k } = req.body;
  if (!embedding) {
    return res.status(400).json({ error: 'embedding is required' });
  }
  try {
    // Get all vectors from DB (for demo, assuming db.getAll() returns [{id, embedding, metadata}])
    const allVectors = await db.getAll();
    // Compute Euclidean distance for each
    const euclideanDistance = require('./euclideanDistance');
    const distances = allVectors.map(v => ({
      id: v.id,
      distance: euclideanDistance(embedding, v.embedding),
      metadata: v.metadata
    }));
    // Sort by distance, ascending (smaller = more similar)
    distances.sort((a, b) => a.distance - b.distance);
    // Return top k
    res.json({ results: distances.slice(0, k || 5) });
  } catch (err) {
    console.error('VectorDB search error:', err);
    res.status(500).json({ error: 'Failed to search vectors' });
  }
});
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");

// API endpoint for Gemini Embeddings
app.post("/api/embedding", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  if (!geminiApiKey) {
    return res.status(500).json({ error: "Gemini API key not configured." });
  }

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent",
      {
        content: { parts: [{ text }] }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": geminiApiKey,
        },
      }
    );

    const embedding = response.data?.embedding?.values;
    if (!embedding) {
      throw new Error("No embedding returned from Gemini API.");
    }
    res.json({ embedding });
  } catch (err) {
    console.error("❌ Gemini Embedding API error:", err.response?.data?.error || err.message);
    res.status(500).json({ error: "Failed to fetch embedding from Gemini API" });
  }
});
// server.js

 
// Get the Gemini API key from environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;
 
const app = express();
app.use(cors());
app.use(bodyParser.json());

// API endpoint for Gemini
app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;

  // RTFC System prompt
  const systemPrompt = `You are an expert career counselor AI. Your job is to provide clear, actionable, and personalized career advice. Always respond in valid JSON format.`;

  // RTFC User prompt
  const userPrompt = `User Query: ${prompt}`;

  // Function definition for Gemini function calling
  const functionDeclarations = [
    {
      name: "getCareerAdvice",
      description: "Get personalized career advice for a user based on their query.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The user's career-related question or context." }
        },
        required: ["query"]
      }
    }
  ];
 
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
        contents: [
          { role: "system", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: userPrompt }] }
        ],
        generationConfig: {
          topP: 0.9, // Controls diversity of output (nucleus sampling)
          topK: 40,  // Controls how many most likely tokens are considered
          stopSequences: ["<END>"] // Model will stop generation when <END> is encountered
        },
        tools: [
          {
            functionDeclarations
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": geminiApiKey,
        },
      }
    );

    // Check for function call in response
    const candidate = response.data?.candidates?.[0];
    const functionCall = candidate?.content?.functionCall;
    let structuredResult = null;
    if (functionCall && functionCall.name === "getCareerAdvice") {
      // Simulate function execution
      const advice = {
        advice: `Personalized career advice for: ${functionCall.args.query}`,
        steps: ["Assess your interests", "Research career options", "Seek mentorship", "Set goals"]
      };
      structuredResult = advice;
    } else {
      // Try to parse structured output
      const reply = candidate?.content?.parts?.[0]?.text;
      try {
        structuredResult = JSON.parse(reply);
      } catch (e) {
        structuredResult = { raw: reply };
      }
    }

    // Log token usage if available
    if (response.data?.usage) {
      const { promptTokens, completionTokens, totalTokens } = response.data.usage;
      console.log(`Gemini API Token Usage: promptTokens=${promptTokens}, completionTokens=${completionTokens}, totalTokens=${totalTokens}`);
    } else {
      console.log("Gemini API Token Usage: Not available in response.");
    }
    if (!structuredResult) {
      throw new Error("No reply from Gemini model.");
    }

    res.json({ result: structuredResult });
  } catch (err) {
    console.error("❌ Gemini API error:", err.response?.data?.error || err.message);
    res.status(500).json({ error: "Failed to fetch from Gemini API" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});