import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContentList } from "@/components/content-list";
import type { ContentItem } from "@/components/content-card";

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    const { data: contents } = await supabase
        .from("contents")
        .select("id, title, type, source_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

    const items = (contents ?? []) as ContentItem[];

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">My Library</h1>
                    <p className="text-sm text-muted-foreground mt-1">Your imported content</p>
                </div>
                <Button asChild size="sm">
                    <Link href="/import">
                        <Plus className="h-4 w-4" />
                        Import
                    </Link>
                </Button>
            </div>

            {/* Content list — client component handles interactions */}
            <ContentList initialItems={items} />
        </div>
    );
}
