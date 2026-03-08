import { geminiModel } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const FLASHCARD_PROMPT = `You are a learning assistant. Based on the following summary, generate between 5 and 10 flashcards to test knowledge.
Return ONLY a valid JSON array, no markdown, no explanation, no code block:
[{ "question": "...", "answer": "..." }]
Questions should be specific and answers concise (1-3 sentences max).
Write in English.`;

interface FlashcardInput {
    contentId: string;
    summary: string;
    supabase?: SupabaseClient;
}

export async function generateFlashcards({ contentId, summary, supabase: passedClient }: FlashcardInput): Promise<void> {
    // Use passed client (has auth context from request) or create a new one
    const supabase = passedClient ?? createClient();

    try {
        const result = await geminiModel.generateContent(`${FLASHCARD_PROMPT}\n\n---\n\n${summary}`);
        const raw = result.response.text();

        if (!raw) return;

        // Strip markdown code fences if Gemini wrapped the JSON
        const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

        let flashcards: Array<{ question: string; answer: string }>;
        try {
            flashcards = JSON.parse(cleaned);
        } catch (err) {
            console.error("generateFlashcards: failed to parse Gemini response", err);
            return;
        }

        if (!Array.isArray(flashcards) || flashcards.length === 0) return;

        const rows = flashcards
            .filter((f) => typeof f.question === "string" && typeof f.answer === "string")
            .map((f) => ({
                content_id: contentId,
                question: f.question.trim(),
                answer: f.answer.trim(),
                status: "new" as const,
            }));

        if (rows.length === 0) return;

        const { error } = await supabase.from("flashcards").insert(rows);
        if (error) console.error("generateFlashcards: Supabase insert error", error);
    } catch (err) {
        console.error("generateFlashcards: Gemini error", err);
    }
}
