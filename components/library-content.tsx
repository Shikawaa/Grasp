"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentList } from "@/components/content-list";
import type { ContentItem } from "@/components/content-card";
import { Search } from "lucide-react";

type FilterType = "all" | "youtube" | "article" | "pdf";

const FILTER_LABELS: Record<FilterType, string> = {
    all: "All",
    youtube: "YouTube",
    article: "Article",
    pdf: "PDF",
};

const EMPTY_MESSAGES: Record<FilterType, string> = {
    all: "Your library is empty.",
    youtube: "No YouTube videos yet.",
    article: "No articles yet.",
    pdf: "No PDFs yet.",
};

interface LibraryContentProps {
    initialItems: ContentItem[];
}

export function LibraryContent({ initialItems }: LibraryContentProps) {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");

    const filtered = initialItems.filter((item) => {
        const matchesType = activeFilter === "all" || item.type === activeFilter;
        const matchesSearch = !search.trim() ||
            (item.title ?? item.source_url ?? "").toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="space-y-5">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
                <input
                    type="text"
                    placeholder="Search your library..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-[8px] bg-[#11121F] border border-[rgba(79,70,229,0.15)] text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#4F46E5]"
                />
            </div>

            {/* Type filter tabs */}
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterType)}>
                <TabsList className="w-full">
                    {(Object.keys(FILTER_LABELS) as FilterType[]).map((key) => (
                        <TabsTrigger key={key} value={key} className="flex-1">
                            {FILTER_LABELS[key]}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm text-[#A1A1AA]">{EMPTY_MESSAGES[activeFilter]}</p>
                </div>
            ) : (
                <ContentList
                    key={`${activeFilter}-${search}`}
                    initialItems={filtered}
                />
            )}
        </div>
    );
}
