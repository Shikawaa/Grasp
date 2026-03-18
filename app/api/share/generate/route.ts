import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { content_id } = body;

        if (!content_id) {
            return NextResponse.json({ error: "Missing content_id" }, { status: 400 });
        }

        // 1. Verify ownership and get existing token
        const { data: content, error: authError } = await supabase
            .from("contents")
            .select("id, share_token")
            .eq("id", content_id)
            .eq("user_id", user.id)
            .single();

        if (authError || !content) {
            return NextResponse.json({ error: "Content not found or unauthorized" }, { status: 404 });
        }

        // 2. Return existing if present
        if (content.share_token) {
            return NextResponse.json({ share_token: content.share_token });
        }

        // 3. Generate new text if null (idempotent setup handles concurrent requests if any)
        // Just use Postgres gen_random_uuid in an update
        const { data: updated, error: updateError } = await supabase
            .from("contents")
            .update({ share_token: crypto.randomUUID() })
            .eq("id", content_id)
            .eq("user_id", user.id)
            .select("share_token")
            .single();

        if (updateError || !updated) {
            return NextResponse.json({ error: "Failed to generate share token" }, { status: 500 });
        }

        return NextResponse.json({ share_token: updated.share_token });
    } catch (err) {
        console.error("Share generate error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
