/* eslint-disable require-jsdoc */
import {initializeApp} from "firebase-admin/app";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {onRequest} from "firebase-functions/v2/https";
import {defineSecret, defineString} from "firebase-functions/params";
import express, {Request, Response as ExpressResponse} from "express";
import cors from "cors";
import {
  createCodeChallenge,
  createHttpError,
  createRandomString,
  parsePages,
  parseScopes,
} from "./security.js";

initializeApp();

const app = express();
const db = getFirestore();

const canvaClientSecret = defineSecret("CANVA_CLIENT_SECRET");
const canvaClientId = defineString("CANVA_CLIENT_ID");
const canvaRedirectUri = defineString("CANVA_REDIRECT_URI", {
  default: "https://portfoliodanilo-api.web.app/api/oauth/callback",
});
const canvaAppOrigin = defineString("CANVA_APP_ORIGIN", {
  default: "https://app-aahaafcfxka.canva-apps.com",
});
const publicFrontendOrigin = defineString("PUBLIC_FRONTEND_ORIGIN", {
  default: "https://canva-app-5f36c.web.app",
});
const enableLocalOrigins = defineString("ENABLE_LOCAL_ORIGINS", {
  default: "false",
});

const CANVA_AUTHORIZE_URL = "https://www.canva.com/api/oauth/authorize";
const CANVA_TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token";
const CANVA_REVOKE_URL = "https://api.canva.com/rest/v1/oauth/revoke";
const CANVA_EXPORTS_URL = "https://api.canva.com/rest/v1/exports";
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const TOKEN_REFRESH_SKEW_MS = 60 * 1000;

type CanvaTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
  token_type: "Bearer" | string;
};

type SessionRecord = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Timestamp;
  scope: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type OAuthStateRecord = {
  codeVerifier: string;
  redirectAfterAuth?: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
};

type CanvaExportJob = {
  job: {
    id: string;
    status: "in_progress" | "success" | "failed";
    result?: {
      url?: string;
      urls?: string[];
    };
    error?: {
      code?: string;
      message?: string;
    };
  };
};

function getAllowedOrigins(): string[] {
  const origins = [
    canvaAppOrigin.value(),
    publicFrontendOrigin.value(),
  ].filter(Boolean);

  if (enableLocalOrigins.value().toLowerCase() === "true") {
    origins.push("http://localhost:8080", "https://localhost:8080");
  }

  return origins;
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || getAllowedOrigins().includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Canva-Session-Id",
    ],
  }),
);

app.use(express.json({limit: "1mb"}));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "canva-backend-root",
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

app.get("/api/oauth/start", async (req, res) => {
  try {
    const scopes = parseScopes(req.query.scope);
    const state = createRandomString();
    const codeVerifier = createRandomString();
    const codeChallenge = createCodeChallenge(codeVerifier);
    const redirectAfterAuth = parseOptionalString(
      req.query.redirect_after_auth,
    );

    await db.collection("canvaOAuthStates").doc(state).set({
      codeVerifier,
      redirectAfterAuth,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + OAUTH_STATE_TTL_MS),
    } satisfies OAuthStateRecord);

    const authUrl = new URL(CANVA_AUTHORIZE_URL);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", canvaClientId.value());
    authUrl.searchParams.set("redirect_uri", canvaRedirectUri.value());
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("state", state);

    res.json({
      authUrl: authUrl.toString(),
      sessionId: state,
      expiresInSeconds: OAUTH_STATE_TTL_MS / 1000,
    });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/oauth/callback", async (req, res) => {
  try {
    const code = requireQueryString(req, "code");
    const state = requireQueryString(req, "state");
    const stateRef = db.collection("canvaOAuthStates").doc(state);
    const stateSnap = await stateRef.get();

    if (!stateSnap.exists) {
      throw createHttpError(400, "Unknown OAuth state.");
    }

    const stateRecord = stateSnap.data() as OAuthStateRecord;
    if (stateRecord.expiresAt.toMillis() < Date.now()) {
      await stateRef.delete();
      throw createHttpError(400, "Expired OAuth state.");
    }

    const token = await exchangeAuthorizationCode(
      code,
      stateRecord.codeVerifier,
    );

    await persistSession(state, token);
    await stateRef.delete();

    if (stateRecord.redirectAfterAuth) {
      const redirectUrl = new URL(stateRecord.redirectAfterAuth);
      redirectUrl.searchParams.set("canva_session_id", state);
      res.redirect(302, redirectUrl.toString());
      return;
    }

    res
      .status(200)
      .type("html")
      .send(renderOAuthSuccessPage(state));
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/exports/pptx", async (req, res) => {
  try {
    const sessionId = requireSessionId(req);
    const designId = requireBodyString(req, "designId");
    const pages = parsePages(req.body.pages);
    const accessToken = await getValidAccessToken(sessionId);

    const job = await createPptxExportJob(accessToken, designId, pages);

    res.status(201).json(job);
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/exports/:jobId", async (req, res) => {
  try {
    const sessionId = requireSessionId(req);
    const accessToken = await getValidAccessToken(sessionId);
    const jobId = req.params.jobId;

    if (!jobId) {
      throw createHttpError(400, "Missing export job ID.");
    }

    const job = await getPptxExportJob(accessToken, jobId);

    res.json(job);
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/oauth/revoke", async (req, res) => {
  try {
    const sessionId = requireSessionId(req);
    const sessionRef = db.collection("canvaSessions").doc(sessionId);
    const sessionSnap = await sessionRef.get();

    if (!sessionSnap.exists) {
      res.status(204).send();
      return;
    }

    const session = sessionSnap.data() as SessionRecord;
    await Promise.allSettled([
      revokeCanvaToken(session.accessToken),
      revokeCanvaToken(session.refreshToken),
    ]);
    await sessionRef.delete();

    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
});

async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
): Promise<CanvaTokenResponse> {
  return requestCanvaToken(new URLSearchParams({
    grant_type: "authorization_code",
    code,
    code_verifier: codeVerifier,
    redirect_uri: canvaRedirectUri.value(),
  }));
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<CanvaTokenResponse> {
  return requestCanvaToken(new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  }));
}

async function requestCanvaToken(
  body: URLSearchParams,
): Promise<CanvaTokenResponse> {
  const credentials = Buffer.from(
    `${canvaClientId.value()}:${process.env.CANVA_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(CANVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return parseCanvaResponse<CanvaTokenResponse>(response, "token request");
}

async function persistSession(
  sessionId: string,
  token: CanvaTokenResponse,
): Promise<void> {
  await db.collection("canvaSessions").doc(sessionId).set({
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Timestamp.fromMillis(Date.now() + token.expires_in * 1000),
    scope: token.scope || "",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  } satisfies SessionRecord);
}

async function getValidAccessToken(sessionId: string): Promise<string> {
  const sessionRef = db.collection("canvaSessions").doc(sessionId);
  const sessionSnap = await sessionRef.get();

  if (!sessionSnap.exists) {
    throw createHttpError(401, "Unknown or expired Canva session.");
  }

  const session = sessionSnap.data() as SessionRecord;
  if (session.expiresAt.toMillis() > Date.now() + TOKEN_REFRESH_SKEW_MS) {
    return session.accessToken;
  }

  const refreshed = await refreshAccessToken(session.refreshToken);
  await sessionRef.set({
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    expiresAt: Timestamp.fromMillis(Date.now() + refreshed.expires_in * 1000),
    scope: refreshed.scope || session.scope,
    createdAt: session.createdAt,
    updatedAt: Timestamp.now(),
  } satisfies SessionRecord);

  return refreshed.access_token;
}

async function createPptxExportJob(
  accessToken: string,
  designId: string,
  pages?: number[],
): Promise<CanvaExportJob> {
  const response = await fetch(CANVA_EXPORTS_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      design_id: designId,
      format: {
        type: "pptx",
        ...(pages ? {pages} : {}),
      },
    }),
  });

  return parseCanvaResponse<CanvaExportJob>(response, "create PPTX export");
}

async function getPptxExportJob(
  accessToken: string,
  jobId: string,
): Promise<CanvaExportJob> {
  const response = await fetch(`${CANVA_EXPORTS_URL}/${jobId}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  return parseCanvaResponse<CanvaExportJob>(response, "get PPTX export");
}

async function revokeCanvaToken(token: string): Promise<void> {
  const credentials = Buffer.from(
    `${canvaClientId.value()}:${process.env.CANVA_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(CANVA_REVOKE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({token}),
  });

  if (!response.ok) {
    throw createHttpError(response.status, "Failed to revoke Canva token.");
  }
}

async function parseCanvaResponse<T>(
  response: globalThis.Response,
  operation: string,
): Promise<T> {
  const body = await response.text();
  const data = body ? JSON.parse(body) : {};

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `Canva ${operation} failed.`;
    throw createHttpError(response.status, message);
  }

  return data as T;
}

function requireQueryString(req: Request, key: string): string {
  const value = req.query[key];
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(400, `Missing query parameter: ${key}.`);
  }

  return value;
}

function requireBodyString(req: Request, key: string): string {
  const value = req.body?.[key];
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(400, `Missing body field: ${key}.`);
  }

  return value;
}

function requireSessionId(req: Request): string {
  const header = req.header("X-Canva-Session-Id");
  if (!header?.trim()) {
    throw createHttpError(401, "Missing X-Canva-Session-Id header.");
  }

  return header;
}

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return value;
}

function renderOAuthSuccessPage(sessionId: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Canva authorization complete</title>
  </head>
  <body>
    <p>Canva authorization complete.</p>
    <p>Session ID: <code>${escapeHtml(sessionId)}</code></p>
    <p>You can close this tab and return to the app.</p>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sendError(res: ExpressResponse, error: unknown): void {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" ?
      error.status :
      500;
  const message = error instanceof Error ? error.message : "Internal error.";

  res.status(status).json({
    ok: false,
    error: message,
  });
}

export const api = onRequest(
  {
    region: "us-central1",
    secrets: [canvaClientSecret],
  },
  app,
);
