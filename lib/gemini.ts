import { GoogleGenerativeAI } from "@google/generative-ai";
import { PROMPTS } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

export type ContentType = "youtube" | "article" | "pdf";

export async function summarize(rawText: string, type: ContentType): Promise<string> {
    const systemPrompt = `${PROMPTS.base}\n\n${PROMPTS[type]}`;
    const fullPrompt = `${systemPrompt}\n\n---\n\n${rawText}`;
    const result = await geminiModel.generateContent(fullPrompt);
    return result.response.text();
}

/**
 * If Gemini prefixed the output with "# Title\n", extract it.
 * Returns { title, summary } — title falls back to fallback if no heading found.
 */
export function extractTitle(
    raw: string,
    fallback: string
): { title: string; summary: string } {
    const lines = raw.split("\n");
    if (lines[0].startsWith("# ")) {
        const title = lines[0].slice(2).trim() || fallback;
        const summary = lines.slice(1).join("\n").trimStart();
        return { title, summary };
    }
    return { title: fallback, summary: raw };
}
