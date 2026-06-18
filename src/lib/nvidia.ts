/**
 * @fileoverview Singleton NVIDIA Nemotron client.
 * Uses the OpenAI-compatible API from NVIDIA's inference endpoint.
 * Client is lazily initialized and reused across all API routes.
 *
 * Environment variables required:
 *   NVIDIA_API_KEY  — Your NVIDIA NIM API key
 *   NVIDIA_BASE_URL — (optional) Override base URL
 *   NVIDIA_MODEL_ID — (optional) Override model slug
 */

import OpenAI from "openai";

/** NVIDIA Nemotron model to use for all completions */
export const NVIDIA_MODEL =
  process.env["NVIDIA_MODEL_ID"] ?? "nvidia/llama-3.3-nemotron-super-49b-v1.5";

/** NVIDIA API base URL */
const NVIDIA_BASE_URL =
  process.env["NVIDIA_BASE_URL"] ?? "https://integrate.api.nvidia.com/v1";

/** Singleton client instance — null until first call */
let clientInstance: OpenAI | null = null;

/**
 * Returns the singleton NVIDIA OpenAI-compatible client.
 * Lazily initialized on first call; reused on subsequent calls.
 *
 * Throws a descriptive error if NVIDIA_API_KEY is missing,
 * so API routes can return a clean 500 rather than a cryptic auth error.
 *
 * @returns Configured OpenAI client pointed at NVIDIA endpoint
 * @throws Error if NVIDIA_API_KEY environment variable is not set
 */
export function getNvidiaClient(): OpenAI {
  if (clientInstance) return clientInstance;

  const apiKey = process.env["NVIDIA_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "NVIDIA_API_KEY is not set. Add it to your .env.local file. " +
        "Get a key at https://build.nvidia.com"
    );
  }

  clientInstance = new OpenAI({
    apiKey,
    baseURL: NVIDIA_BASE_URL,
  });

  return clientInstance;
}

/**
 * Resets the singleton client. Used in tests to re-initialize with
 * a different API key or base URL.
 * @internal
 */
export function resetNvidiaClient(): void {
  clientInstance = null;
}
