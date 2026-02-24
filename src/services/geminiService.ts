import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are CursorGenie, an intelligent AI plugin for Logitech MX Master4 (Actions Ring) + MX Creative Console in Cursor.IDE.
Your Role: Gesture -> generate React Native telehealth code -> insert via JSON.

Available Mock API Endpoints (Base URL: /api):
- GET /patients: Fetch all patients
- GET /patients/:id: Fetch single patient
- POST /patients: Create new patient (Body: { name, age, symptoms })

Rules:
1. React Native telehealth only (patient fetch, vitals charts, booking UI).
2. Cursor.IDE format (async functions, hooks, Tailwind).
3. Bengaluru hospital context (vitals monitoring, appointment flow).
4. Forms MUST include real-time validation feedback and clear error messages using React state.
5. Use the provided mock API endpoints in generated code.
6. Output MUST be STRICT JSON matching this schema:
{
  "action": "code_insert" | "notification",
  "content": "string (max 300 chars)",
  "haptic_feedback": "short_vibrate" | "long_pulse" | "none",
  "next_gesture": "string"
}
Respond ONLY with the JSON object. No markdown, no explanations.`;

export async function generateWorkflow(input: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: JSON.stringify(input),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  let text = response.text?.trim() || "";
  
  // Strip markdown code blocks if the model returned them despite responseMimeType
  if (text.startsWith("```")) {
    text = text.replace(/^```json\n?/, "").replace(/```$/, "").trim();
  }

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return JSON.parse(text);
}
