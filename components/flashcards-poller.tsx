"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Flashcard {
    id: string;
    question: string;
    answer: string;
    status: "new" | "known" | "review";
}

interface FlashcardsDisplayProps {
    contentId: string;
    summary: string;
    flashcards: Flashcard[];
    isPolling: boolean;
    timedOut: boolean;
    onRegenerate: () => void;
    isRegenerating: boolean;
}

export function FlashcardsDisplay({
    contentId,
    flashcards,
    isPolling,
    timedOut,
    onRegenerate,
    isRegenerating,
}: FlashcardsDisplayProps) {
    // ── Generating (initial or regenerating) ─────────────────────
    if (isPolling || isRegenerating) {
        return (
            <div className="flex flex-col items-center gap-3 py-10">
                <Loader2 className="h-6 w-6 text-[#4F46E5] animate-spin" />
                <p className="font-mono text-sm text-[#A1A1AA]">
                    {isRegenerating ? "Generating new flashcards..." : "Generating flashcards..."}
                </p>
            </div>
        );
    }

    // ── Timeout / failed state ───────────────────────────────────
    if (timedOut || flashcards.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <p className="text-[#A1A1AA] text-sm">No flashcards generated.</p>
                <Button variant="outline" size="sm" onClick={onRegenerate}>
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Try again
                </Button>
            </div>
        );
    }

    // ── Ready state ──────────────────────────────────────────────
    return (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
            <p className="text-2xl font-semibold text-[#F4F4F5]">
                {flashcards.length} flashcards ready
            </p>
            <p className="text-sm text-[#6B7280]">
                Review flashcards one by one to test your memory
            </p>

            <a
                href={`/content/${contentId}/review`}
                className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
                Start Review →
            </a>

            <Button variant="outline" size="sm" onClick={onRegenerate} className="text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Regenerate flashcards
            </Button>
        </div>
    );
}
