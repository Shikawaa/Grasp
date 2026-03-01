"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { ContentCard, ContentItem } from "./content-card";

interface ContentListProps {
    initialItems: ContentItem[];
}

export function ContentList({ initialItems }: ContentListProps) {
    const [items, setItems] = useState<ContentItem[]>(initialItems);

    function handleRename(id: string, newTitle: string) {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, title: newTitle } : item
            )
        );
    }

    function handleDelete(id: string) {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
                    <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-lg font-medium text-foreground mb-2">No content yet</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                    Import a YouTube video to get a summary, flashcards, and more.
                </p>
                <Button asChild>
                    <Link href="/import">Import your first video</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {items.map((item) => (
                <ContentCard
                    key={item.id}
                    item={item}
                    onRename={handleRename}
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
}
