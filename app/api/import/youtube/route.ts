import { NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { fetchYouTubeTranscript, TranscriptError } from "@/lib/youtube";
import { createClient } from "@/lib/supabase/server";

const YOUTUBE_REGEX =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}(?:[?&].*)?$/;

function parseVideoId(url: string): string | null {
    try {
        const u = new URL(url.startsWith("http") ? url : `https://${url}`);
        if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0];
        if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
        return u.searchParams.get("v");
    } catch {
        return null;
    }
}

export async function POST(request: Request) {
    // ── 1. Parse & validate URL ──────────────────────────────────
    let url: string;
    try {
        const body = await request.json();
        url = (body?.url ?? "").trim();
    } catch {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    if (!url || !YOUTUBE_REGEX.test(url)) {
        return NextResponse.json(
            { error: "Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link." },
            { status: 400 }
        );
    }

    const videoId = parseVideoId(url);
    if (!videoId) {
        return NextResponse.json(
            { error: "Could not extract video ID from URL." },
            { status: 400 }
        );
    }

    // ── 2. Extract transcript ─────────────────────────────────────
    let transcript: string;
    let title: string;

    try {
        const result = await fetchYouTubeTranscript(videoId);
        transcript = result.transcript;
        title = result.title;
    } catch (err) {
        if (err instanceof TranscriptError) {
            const status = err.code === "NOT_FOUND" ? 404 : 422;
            return NextResponse.json({ error: err.message }, { status });
        }
        console.error("Transcript error:", err);
        return NextResponse.json(
            { error: "Failed to fetch transcript. Please try again." },
            { status: 502 }
        );
    }

    // ── 3. Summarise with Mistral ─────────────────────────────────
    let summary: string;
    try {
        const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });
        const response = await mistral.chat.complete({
            model: "mistral-small-latest",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a learning assistant. Summarize the following video transcript in clear, structured markdown. Use headers, bullet points, and highlight key concepts. Be concise but complete.",
                },
                {
                    role: "user",
                    content: transcript,
                },
            ],
        });

        summary = (response.choices?.[0]?.message?.content as string) ?? "";

        if (!summary) {
            return NextResponse.json(
                { error: "Could not generate summary. Please try again." },
                { status: 502 }
            );
        }
    } catch (err) {
        console.error("Mistral error:", err);
        return NextResponse.json(
            { error: "Could not generate summary. Please try again." },
            { status: 502 }
        );
    }

    // ── 4. Save to Supabase ───────────────────────────────────────
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("contents")
            .insert({
                user_id: user.id,
                title,
                type: "youtube",
                source_url: url,
                raw_text: transcript,
                summary,
                is_public: false,
            })
            .select("id")
            .single();

        if (error || !data) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
        }

        return NextResponse.json({ id: data.id, title, summary }, { status: 200 });
    } catch (err) {
        console.error("DB error:", err);
        return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
    }
}
