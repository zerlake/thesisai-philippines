import 'dotenv/config'; // Load .env.test
import { describe, it, expect } from "vitest";

// Helper to conditionally skip tests
// @ts-ignore
describe.skipIf = (cond: boolean) => (cond ? describe.skip : describe);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const url = process.env.GENERATE_OUTLINE_URL || "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/generate-outline"; // Updated to hosted Supabase URL

// Only run if API key is available
describe.skipIf(!OPENROUTER_API_KEY)(
  "generate-outline integration",
  () => {
    it(
      "returns a non-empty outline",
      async () => {
        const prompt =
          "Create a concise outline for a 1200-word essay about the economic impacts of renewable energy adoption.";
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt, max_tokens: 300 }),
        });
        expect(res.ok).toBe(true);
        const json = await res.json();
        expect(json).toHaveProperty("outline");
        expect(typeof json.outline).toBe("string");
        expect(json.outline.length).toBeGreaterThan(50);
      },
      60_000,
    );
  },
);