import Anthropic from "@anthropic-ai/sdk";

// Clé côté serveur uniquement — jamais exposée au client.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
