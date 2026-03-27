import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LibraryContent } from "@/components/library-content";
import type { ContentItem } from "@/components/content-card";

export default async function LibraryPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    const { data: contents } = await supabase
        .from("contents")
        .select("id, title, type, source_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

    const items = (contents ?? []) as ContentItem[];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-[#F4F4F5] tracking-tight">Library</h1>
                <p className="text-sm text-[#A1A1AA] mt-1">All your imported content</p>
            </div>
            <LibraryContent initialItems={items} />
        </div>
    );
}
