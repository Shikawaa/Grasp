import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiModel } from "@/lib/gemini";

const SYSTEM_PROMPT = `You are a learning assistant. Answer questions strictly based on the following content summary. Be concise and pedagogical. If the answer is not in the summary, say so honestly. Always respond in English.`;

const MAX_HISTORY = 10;

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const { content_id, messages: history, user_message } = body ?? {};

    if (!content_id || !user_message) {
        return NextResponse.json({ error: "Missing content_id or user_message" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch summary server-side — never trust the client
    const { data: content } = await supabase
        .from("contents")
        .select("id, summary")
        .eq("id", content_id)
        .eq("user_id", user.id)
        .single();

    if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });

    if (!content.summary) {
        return NextResponse.json({
            reply: "This content doesn't have a summary yet. Try importing it again.",
        });
    }

    // Build prompt with summary + conversation history
    const contextBlock = `${SYSTEM_PROMPT}\n\n--- CONTENT SUMMARY ---\n${content.summary}\n--- END SUMMARY ---`;

    const conversationHistory = Array.isArray(history)
        ? history
            .slice(-MAX_HISTORY)
            .map((m: { role: string; body: string }) =>
                `${m.role === "user" ? "User" : "Assistant"}: ${m.body}`
            )
            .join("\n\n")
        : "";

    const fullPrompt = conversationHistory
        ? `${contextBlock}\n\n--- CONVERSATION HISTORY ---\n${conversationHistory}\n--- END HISTORY ---\n\nUser: ${user_message}`
        : `${contextBlock}\n\nUser: ${user_message}`;

    // Call Gemini
    let reply: string;
    try {
        const result = await geminiModel.generateContent(fullPrompt);
        reply = result.response.text();
        if (!reply) throw new Error("Empty response from Gemini");
    } catch (err) {
        console.error("[chat/contextual] Gemini error:", err);
        return NextResponse.json({ error: "Failed to generate reply" }, { status: 502 });
    }

    // Persist both messages in Supabase
    const { error: insertError } = await supabase.from("messages").insert([
        { content_id, user_id: user.id, role: "user", body: user_message },
        { content_id, user_id: user.id, role: "assistant", body: reply },
    ]);

    if (insertError) {
        console.error("[chat/contextual] DB insert error:", insertError);
        // Non-fatal — still return the reply
    }

    return NextResponse.json({ reply });
}
