import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
        return NextResponse.json({ error: "Missing contentId" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("flashcards")
        .select("id, question, answer, status")
        .eq("content_id", contentId)
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    console.log("[DELETE /api/flashcards] contentId:", contentId);

    if (!contentId) {
        return NextResponse.json({ error: "Missing contentId" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership via contents table
    const { data: content } = await supabase
        .from("contents")
        .select("id")
        .eq("id", contentId)
        .eq("user_id", user.id)
        .single();

    if (!content) {
        console.error("[DELETE /api/flashcards] ownership check failed for contentId:", contentId);
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error, count } = await supabase
        .from("flashcards")
        .delete({ count: "exact" })
        .eq("content_id", contentId);

    if (error) {
        console.error("[DELETE /api/flashcards] delete error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[DELETE /api/flashcards] deleted ${count} rows for contentId:`, contentId);
    return NextResponse.json({ success: true, deleted: count });
}
