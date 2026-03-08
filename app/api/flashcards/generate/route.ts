import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateFlashcards } from "@/lib/generateFlashcards";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const { contentId } = body ?? {};

    if (!contentId) {
        return NextResponse.json({ error: "Missing contentId" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership AND fetch summary in one query
    const { data: content } = await supabase
        .from("contents")
        .select("id, summary")
        .eq("id", contentId)
        .eq("user_id", user.id)
        .single();

    if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!content.summary) {
        return NextResponse.json({ error: "Content has no summary to generate flashcards from" }, { status: 422 });
    }

    // Generate — pass supabase client to preserve auth context
    await generateFlashcards({ contentId, summary: content.summary, supabase });

    return NextResponse.json({ success: true });
}
