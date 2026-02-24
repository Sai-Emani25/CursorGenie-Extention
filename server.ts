import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Patient Database
  const patients = [
    { id: "1", name: "Rahul Sharma", age: 34, symptoms: "Fever, Cough", vitals: { hr: 72, bp: "120/80", temp: 98.6 } },
    { id: "2", name: "Priya Rao", age: 28, symptoms: "Headache", vitals: { hr: 80, bp: "110/70", temp: 99.1 } },
  ];

  // Mock API Endpoints for Telehealth Testing
  app.get("/api/patients", (req, res) => {
    res.json(patients);
  });

  app.get("/api/patients/:id", (req, res) => {
    const patient = patients.find(p => p.id === req.params.id);
    if (patient) res.json(patient);
    else res.status(404).json({ error: "Patient not found" });
  });

  app.post("/api/patients", (req, res) => {
    const newPatient = { id: String(patients.length + 1), ...req.body };
    patients.push(newPatient);
    res.status(201).json(newPatient);
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
