"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { FlashcardsDisplay } from "@/components/flashcards-poller";
import { ContentChat } from "@/components/content-chat";

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
    const [isRegenerating, setIsRegenerating] = useState(false);

    const loaded = useRef(initialFlashcards.length > 0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Shared polling logic (used for initial gen + regenerate) ──
    const startPolling = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setTimedOut(false);

        timeoutRef.current = setTimeout(() => {
            setTimedOut(true);
            setIsRegenerating(false);
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
                    setIsRegenerating(false);
                }
            } catch {
                // silently ignore
            }
        }, 3_000);
    }, [contentId]);

    // Initial poll on mount if no cards yet
    useEffect(() => {
        if (loaded.current) return;
        startPolling();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [startPolling]);

    // ── Regenerate handler ────────────────────────────────────────
    const handleRegenerate = useCallback(async () => {
        if (!summary) return;
        setIsRegenerating(true);
        setFlashcards([]);
        loaded.current = false;

        try {
            // 1. Delete existing cards — must succeed before generating
            const deleteRes = await fetch(`/api/flashcards?contentId=${contentId}`, { method: "DELETE" });
            if (!deleteRes.ok) {
                const body = await deleteRes.json().catch(() => ({}));
                console.error("[Regenerate] DELETE failed:", deleteRes.status, body);
                setIsRegenerating(false);
                return;
            }
            const deleteBody = await deleteRes.json();
            console.log("[Regenerate] DELETE confirmed:", deleteBody);

            // 2. Trigger generation (fire & forget — Gemini call is slow)
            fetch("/api/flashcards/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentId }),
            }).catch(console.error);

            // 3. Poll until new cards arrive (server-fetched, not from local state)
            startPolling();
        } catch (err) {
            console.error("[Regenerate] unexpected error:", err);
            setIsRegenerating(false);
        }
    }, [contentId, summary, startPolling]);

    const isPolling = flashcards.length === 0 && !timedOut && !isRegenerating;

    return (
        <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full mb-6 overflow-x-auto">
                <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
                <TabsTrigger value="flashcards" className="flex-1">
                    Flashcards
                    {flashcards.length > 0 && (
                        <span className="ml-1.5 text-xs opacity-60">({flashcards.length})</span>
                    )}
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
            </TabsList>

            {/* ── Summary tab ───────────────────────────────────────── */}
            <TabsContent value="summary" className="pb-10">
                {summary ? (
                    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-strong:text-foreground">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </article>
                ) : (
                    <p className="text-muted-foreground text-sm">No summary available.</p>
                )}
            </TabsContent>

            {/* ── Flashcards tab ────────────────────────────────────── */}
            <TabsContent value="flashcards" className="pb-10">
                <FlashcardsDisplay
                    contentId={contentId}
                    summary={summary ?? ""}
                    flashcards={flashcards}
                    isPolling={isPolling}
                    timedOut={timedOut}
                    onRegenerate={handleRegenerate}
                    isRegenerating={isRegenerating}
                />
            </TabsContent>

            {/* ── Chat tab ──────────────────────────────────────────── */}
            <TabsContent value="chat" className="pb-10">
                <ContentChat contentId={contentId} />
            </TabsContent>
        </Tabs>
    );
}
