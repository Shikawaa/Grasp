import { NextResponse } from "next/server";
import { summarize, extractTitle } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { extractText, getDocumentProxy } from "unpdf";

export const runtime = "nodejs";

const MAX_CHARS = 100_000;

export async function POST(request: Request) {
    // ── 1. Auth ───────────────────────────────────────────────────
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // ── 2. Parse FormData ─────────────────────────────────────────
    let file: File;
    try {
        const form = await request.formData();
        const f = form.get("file");
        if (!f || typeof f === "string") {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }
        file = f as File;
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf") || file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File exceeds the 10 MB limit." }, { status: 400 });
    }

    // ── 3. Parse PDF ──────────────────────────────────────────────
    let rawText: string;
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        const pdf = await getDocumentProxy(new Uint8Array(buffer));
        const { text } = await extractText(pdf, { mergePages: true });
        rawText = text?.trim() ?? "";
    } catch (err) {
        console.error("unpdf error:", err);
        return NextResponse.json(
            { error: "Could not read this PDF. Make sure it contains selectable text (not a scanned image)." },
            { status: 422 }
        );
    }

    if (!rawText) {
        return NextResponse.json(
            { error: "Could not extract text from this PDF. It may be a scanned image or encrypted." },
            { status: 422 }
        );
    }

    let truncated = false;
    if (rawText.length > MAX_CHARS) {
        rawText = rawText.slice(0, MAX_CHARS);
        truncated = true;
    }

    // Extract title from filename
    const title = file.name.replace(/\.pdf$/i, "").trim() || "Untitled PDF";

    // ── 4. Summarize with Gemini 2.5 Flash ────────────────────────────────
    let summary: string;
    let aiTitle: string = title;
    try {
        const raw = await summarize(rawText, "pdf");
        if (!raw) {
            return NextResponse.json({ error: "Could not generate summary. Please try again." }, { status: 502 });
        }
        ({ title: aiTitle, summary } = extractTitle(raw, title));
        if (truncated) {
            summary = `> ⚠️ This PDF was very long. Only the first 100,000 characters were analyzed.\n\n${summary}`;
        }
    } catch (err) {
        console.error("Gemini error:", err);
        return NextResponse.json({ error: "Could not generate summary. Please try again." }, { status: 502 });
    }

    // ── 5. Save to Supabase ───────────────────────────────────────
    let contentId: string;
    try {
        const { data, error } = await supabase
            .from("contents")
            .insert({
                user_id: user.id,
                title: aiTitle,
                type: "pdf",
                source_url: null,
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

        contentId = data.id;
    } catch (err) {
        console.error("DB error:", err);
        return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
    }

    // ── 6. Upload PDF to Supabase Storage ─────────────────────────
    try {
        await supabase.storage
            .from("pdfs")
            .upload(`${user.id}/${contentId}.pdf`, buffer, { contentType: "application/pdf" });
        // Storage upload failure is non-fatal — content is already saved
    } catch (err) {
        console.error("Storage upload error (non-fatal):", err);
    }

    return NextResponse.json({ id: contentId }, { status: 200 });
}
