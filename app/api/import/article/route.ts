import { NextResponse } from "next/server";
import { summarize, extractTitle } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

const URL_REGEX = /^https?:\/\/.+/i;
const MAX_CHARS = 100_000;

function extractTitleFromText(text: string, sourceUrl: string): string {
    // Try first non-empty line if it looks like a title
    const firstLine = text
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.length > 0 && l.length < 120);

    if (firstLine) return firstLine;

    // Fallback: domain name
    try {
        return new URL(sourceUrl).hostname.replace(/^www\./, "");
    } catch {
        return sourceUrl;
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

    if (!url || !URL_REGEX.test(url)) {
        return NextResponse.json(
            { error: "Invalid URL. Please provide a valid http/https link." },
            { status: 400 }
        );
    }

    // ── 2. Extract article via Jina.ai Reader ─────────────────────
    let rawText: string;
    let title: string;

    try {
        const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
        const headers: Record<string, string> = {
            Accept: "text/plain",
            "X-Return-Format": "text",
        };
        if (process.env.JINA_API_KEY) {
            headers["Authorization"] = `Bearer ${process.env.JINA_API_KEY}`;
        }

        const res = await fetch(jinaUrl, { headers });
        if (!res.ok) {
            return NextResponse.json(
                { error: `Could not read the article (HTTP ${res.status}). Make sure the URL is publicly accessible.` },
                { status: 422 }
            );
        }

        rawText = (await res.text()).trim();

        if (!rawText) {
            return NextResponse.json(
                { error: "The article appears to be empty or could not be extracted." },
                { status: 422 }
            );
        }

        if (rawText.length > MAX_CHARS) {
            return NextResponse.json(
                { error: "The article is too long to process (limit: 100,000 characters)." },
                { status: 422 }
            );
        }

        title = extractTitleFromText(rawText, url);
    } catch (err) {
        console.error("Jina extraction error:", err);
        return NextResponse.json(
            { error: "Failed to fetch the article. Please check the URL and try again." },
            { status: 502 }
        );
    }

    // ── 3. Summarise with Gemini 2.5 Flash ────────────────────────────────
    let summary: string;
    let aiTitle: string = title;
    try {
        const raw = await summarize(rawText, "article");
        if (!raw) {
            return NextResponse.json(
                { error: "Could not generate summary. Please try again." },
                { status: 502 }
            );
        }
        ({ title: aiTitle, summary } = extractTitle(raw, title));
    } catch (err) {
        console.error("Gemini error:", err);
        return NextResponse.json(
            { error: "Could not generate summary. Please try again." },
            { status: 502 }
        );
    }
    // ── 4. Save to Supabase ───────────────────────────────────────
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("contents")
            .insert({
                user_id: user.id,
                title: aiTitle,
                type: "article",
                source_url: url,
                raw_text: rawText,
                summary,
                is_public: false,
            })
            .select("id")
            .single();

        if (error || !data) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
        }

        return NextResponse.json({ id: data.id }, { status: 200 });
    } catch (err) {
        console.error("DB error:", err);
        return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
    }
}
