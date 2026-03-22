import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight } from "lucide-react";

function typeLabel(type: string | null): string {
    switch (type) {
        case "youtube": return "YouTube";
        case "article": return "Article";
        case "pdf": return "PDF";
        default: return type ?? "Content";
    }
}

function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    // Fetch top 5: first is "Continue learning", next 4 are "Recent imports"
    const { data: contents } = await supabase
        .from("contents")
        .select("id, title, type, source_url, created_at, summary")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

    const items = contents ?? [];
    const continueItem = items[0] ?? null;
    const recentItems = items.slice(1, 5);

    // Empty state
    if (items.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
                <p className="text-xl font-semibold text-[#F4F4F5]">Nothing here yet.</p>
                <p className="text-sm text-[#A1A1AA] mt-2">Import your first content to get started.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

            {/* ── Continue learning ───────────────────────────────── */}
            {continueItem && (
                <section>
                    <h2 className="text-xs font-mono uppercase tracking-[0.08em] text-[#A1A1AA] mb-3">
                        Continue learning
                    </h2>
                    <Link href={`/content/${continueItem.id}`} className="block group">
                        <div className="rounded-[12px] border border-[rgba(79,70,229,0.15)] bg-[#11121F] px-6 py-5 transition-all hover:border-[rgba(129,140,248,0.4)] hover:shadow-[0_0_20px_rgba(79,70,229,0.1)]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-mono text-xs uppercase tracking-[0.05em] text-[#4F46E5] bg-[rgba(79,70,229,0.1)] px-2 py-0.5 rounded-[6px]">
                                    {typeLabel(continueItem.type)}
                                </span>
                                <span className="text-xs text-[#A1A1AA]">{formatRelativeDate(continueItem.created_at)}</span>
                            </div>
                            <h3 className="text-base font-semibold text-[#F4F4F5] mb-2 group-hover:text-white transition-colors truncate">
                                {continueItem.title ?? continueItem.source_url ?? "Untitled"}
                            </h3>
                            {continueItem.summary && (
                                <p className="text-sm text-[#A1A1AA] line-clamp-2 leading-relaxed">
                                    {continueItem.summary.replace(/[#*`>]/g, "").slice(0, 160)}
                                </p>
                            )}
                            <div className="flex items-center gap-1 mt-3 text-sm text-[#4F46E5] font-medium">
                                Continue <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </Link>
                </section>
            )}

            {/* ── Recent imports ──────────────────────────────────── */}
            {recentItems.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-mono uppercase tracking-[0.08em] text-[#A1A1AA]">
                            Recent imports
                        </h2>
                        <Link href="/library" className="text-xs text-[#4F46E5] hover:underline flex items-center gap-1">
                            View all in Library <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {recentItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/content/${item.id}`}
                                className="group block rounded-[12px] border border-[rgba(79,70,229,0.15)] bg-[#11121F] px-4 py-4 transition-all hover:border-[rgba(129,140,248,0.4)] hover:shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-xs uppercase tracking-[0.05em] text-[#4F46E5] bg-[rgba(79,70,229,0.1)] px-2 py-0.5 rounded-[6px]">
                                        {typeLabel(item.type)}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-[#F4F4F5] line-clamp-2 group-hover:text-white transition-colors break-words">
                                    {item.title ?? item.source_url ?? "Untitled"}
                                </p>
                                <p className="text-xs text-[#A1A1AA] mt-2">{formatRelativeDate(item.created_at)}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
