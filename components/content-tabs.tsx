"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { FlashcardsDisplay } from "@/components/flashcards-poller";

interface Flashcard {
    id: string;
    question: string;
    answer: string;
    status: "new" | "known" | "review";
}

interface ContentTabsProps {
    contentId: string;
    summary: string | null;
    initialFlashcards: Flashcard[];
}

export function ContentTabs({ contentId, summary, initialFlashcards }: ContentTabsProps) {
    const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
    const [timedOut, setTimedOut] = useState(false);
    const [visible, setVisible] = useState(initialFlashcards.length > 0);

    const loaded = useRef(initialFlashcards.length > 0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Already have cards — never poll
        if (loaded.current) return;

        // Abort after 30 seconds
        timeoutRef.current = setTimeout(() => {
            setTimedOut(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }, 30_000);

        intervalRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/api/flashcards?contentId=${contentId}`);
                if (!res.ok) return;
                const data: Flashcard[] = await res.json();
                if (data.length > 0) {
                    clearInterval(intervalRef.current!);
                    clearTimeout(timeoutRef.current!);
                    loaded.current = true;
                    setFlashcards(data);
                    requestAnimationFrame(() => setVisible(true));
                }
            } catch {
                // Silently ignore network errors during polling
            }
        }, 3_000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once — state is lifted here, not inside tab content

    const isPolling = flashcards.length === 0 && !timedOut;

    return (
        <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full mb-6">
                <TabsTrigger value="summary" className="flex-1">
                    Summary
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="flex-1">
                    Flashcards
                    {flashcards.length > 0 && (
                        <span className="ml-1.5 text-xs opacity-60">({flashcards.length})</span>
                    )}
                </TabsTrigger>
            </TabsList>

            {/* ── Summary tab ───────────────────────────────────────── */}
            <TabsContent value="summary">
                {summary ? (
                    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-strong:text-foreground">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </article>
                ) : (
                    <p className="text-muted-foreground text-sm">No summary available.</p>
                )}
            </TabsContent>

            {/* ── Flashcards tab — pure display, no polling state ───── */}
            <TabsContent value="flashcards">
                <FlashcardsDisplay
                    flashcards={flashcards}
                    isPolling={isPolling}
                    timedOut={timedOut}
                    visible={visible}
                />
            </TabsContent>
        </Tabs>
    );
}
