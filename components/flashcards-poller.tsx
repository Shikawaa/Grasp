"use client";

interface Flashcard {
    id: string;
    question: string;
    answer: string;
    status: "new" | "known" | "review";
}

interface FlashcardsDisplayProps {
    flashcards: Flashcard[];
    isPolling: boolean;
    timedOut: boolean;
    visible: boolean;
}

function StatusBadge({ status }: { status: Flashcard["status"] }) {
    const styles: Record<Flashcard["status"], { bg: string; text: string; label: string }> = {
        new: { bg: "bg-[rgba(79,70,229,0.1)]", text: "text-[#4F46E5]", label: "NEW" },
        known: { bg: "bg-[rgba(34,197,94,0.1)]", text: "text-[#22C55E]", label: "KNOWN" },
        review: { bg: "bg-[rgba(245,158,11,0.1)]", text: "text-[#F59E0B]", label: "TO REVIEW" },
    };
    const s = styles[status] ?? styles.new;
    return (
        <span className={`font-mono text-xs font-semibold uppercase px-2 py-0.5 rounded-md ${s.bg} ${s.text}`}>
            {s.label}
        </span>
    );
}

export function FlashcardsDisplay({ flashcards, isPolling, timedOut, visible }: FlashcardsDisplayProps) {
    // ── Loading skeleton ──────────────────────────────────────────
    if (isPolling) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <svg
                        className="animate-spin h-4 w-4 text-[#4F46E5] shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <p className="font-mono text-sm text-[#A1A1AA]">Generating flashcards...</p>
                </div>
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-[#11121F] border border-[rgba(79,70,229,0.15)] rounded-[12px] p-5 animate-pulse"
                    >
                        <div className="h-4 bg-[rgba(79,70,229,0.08)] rounded w-3/4 mb-3" />
                        <div className="h-3 bg-[rgba(161,161,170,0.08)] rounded w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    // ── Timeout state ─────────────────────────────────────────────
    if (timedOut) {
        return (
            <p className="font-mono text-sm text-[#A1A1AA]">
                Could not generate flashcards. Try re-importing the content.
            </p>
        );
    }

    // ── Empty (shouldn't normally reach here) ─────────────────────
    if (flashcards.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                No flashcards yet — they generate automatically after import.
            </p>
        );
    }

    // ── Card list with fade-in ────────────────────────────────────
    return (
        <div className={`flex flex-col gap-4 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
            {flashcards.map((card) => (
                <div
                    key={card.id}
                    className="bg-[#11121F] border border-[rgba(79,70,229,0.15)] rounded-[12px] p-5 flex flex-col gap-3"
                >
                    <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-[#F4F4F5] leading-snug">
                            <span className="text-[#4F46E5] mr-1.5">Q:</span>
                            {card.question}
                        </p>
                        <StatusBadge status={card.status} />
                    </div>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed">
                        <span className="text-[#6B7280] mr-1.5">A:</span>
                        {card.answer}
                    </p>
                </div>
            ))}
        </div>
    );
}
