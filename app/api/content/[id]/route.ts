import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
    params: { id: string };
}

// ── PATCH /api/content/[id] — rename title ────────────────────────────────
export async function PATCH(request: Request, { params }: RouteContext) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    let title: string;
    try {
        const body = await request.json();
        title = (body?.title ?? "").trim();
    } catch {
        return NextResponse.json({ error: "Invalid body." }, { status: 400 });
    }

    if (!title) {
        return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
    }

    // Update only if the row belongs to this user (user_id filter = ownership check)
    const { data, error } = await supabase
        .from("contents")
        .update({ title })
        .eq("id", params.id)
        .eq("user_id", user.id)
        .select("id, title")
        .single();

    if (error || !data) {
        return NextResponse.json({ error: "Content not found." }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
}

// ── DELETE /api/content/[id] — delete row ────────────────────────────────
export async function DELETE(_request: Request, { params }: RouteContext) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    // Delete only if the row belongs to this user
    const { error, count } = await supabase
        .from("contents")
        .delete({ count: "exact" })
        .eq("id", params.id)
        .eq("user_id", user.id);

    if (error || count === 0) {
        return NextResponse.json({ error: "Content not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
