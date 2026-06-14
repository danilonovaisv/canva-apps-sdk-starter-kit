/* eslint-disable require-jsdoc */
import crypto from "crypto";

export const DEFAULT_SCOPES = ["design:content:read"];

export function parseScopes(scopeQuery: unknown): string[] {
  if (typeof scopeQuery !== "string" || !scopeQuery.trim()) {
    return DEFAULT_SCOPES;
  }

  return scopeQuery
    .split(/[,\s]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

export function parsePages(value: unknown): number[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (
    !Array.isArray(value) ||
    value.some((page) => !Number.isInteger(page) || page < 1)
  ) {
    throw createHttpError(400, "pages must be an array of positive integers.");
  }

  return value;
}

export function createRandomString(): string {
  return crypto.randomBytes(96).toString("base64url");
}

export function createCodeChallenge(codeVerifier: string): string {
  return crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
}

export function createHttpError(status: number, message: string): Error & {
  status: number;
} {
  const error = new Error(message) as Error & {status: number};
  error.status = status;
  return error;
}
