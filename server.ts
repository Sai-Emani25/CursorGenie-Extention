import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CursorGenie API Endpoint
  app.post("/api/workflow", async (req, res) => {
    const input = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemInstruction = `You are CursorGenie, an intelligent AI plugin for Logitech MX Master4 (Actions Ring) + MX Creative Console in Cursor.IDE.
Your Role: Gesture -> generate React Native telehealth code -> insert via JSON.

Rules:
1. React Native telehealth only (patient fetch, vitals charts, booking UI).
2. Cursor.IDE format (async functions, hooks, Tailwind).
3. Bengaluru hospital context (vitals monitoring, appointment flow).
4. Output MUST be STRICT JSON matching this schema:
{
  "action": "code_insert" | "notification",
  "content": "string (max 300 chars)",
  "haptic_feedback": "short_vibrate" | "long_pulse" | "none",
  "next_gesture": "string"
}
Respond ONLY with the JSON object. No markdown, no explanations.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: JSON.stringify(input),
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ 
        action: "notification",
        content: "Error generating telehealth code.",
        haptic_feedback: "none",
        next_gesture: "Thumb press to retry"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WorkflowGenie Server running on http://localhost:${PORT}`);
  });
}

startServer();
