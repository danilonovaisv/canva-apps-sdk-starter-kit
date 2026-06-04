import {onRequest} from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "https://app-aahaafcfxka.canva-apps.com",
  "https://canva-app-5f36c.web.app",
  "http://localhost:8080",
  "https://localhost:8080",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "canva-backend-root",
    message: "API Firebase funcionando",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "canva-backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "canva-backend-api-health",
    timestamp: new Date().toISOString(),
  });
});

export const api = onRequest(
  {
    region: "us-central1",
  },
  app,
);
