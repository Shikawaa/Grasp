import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["new", "known", "review"] as const;
type Status = typeof VALID_STATUSES[number];

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const flashcardId = params.id;

    const body = await request.json().catch(() => null);
    const { status } = body ?? {};

    if (!VALID_STATUSES.includes(status as Status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership via JOIN with contents
    const { data: card } = await supabase
        .from("flashcards")
        .select("id, content_id, contents!inner(user_id)")
        .eq("id", flashcardId)
        .single();

    if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const cardWithContent = card as typeof card & { contents: { user_id: string } };
    if (cardWithContent.contents?.user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
        .from("flashcards")
        .update({ status })
        .eq("id", flashcardId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
