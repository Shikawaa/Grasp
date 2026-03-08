"use client";

import { useCallback, useState } from "react";
import Link from "next/link";

interface Flashcard {
    id: string;
    question: string;
    answer: string;
    status: "new" | "known" | "review";
}

interface FlipCardReviewProps {
    contentId: string;
    initialCards: Flashcard[];
}

async function updateStatus(flashcardId: string, status: "known" | "review") {
    await fetch(`/api/flashcards/${flashcardId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
    });
}

export function FlipCardReview({ contentId, initialCards }: FlipCardReviewProps) {
    const [cards] = useState<Flashcard[]>(initialCards);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [cardVisible, setCardVisible] = useState(true);
    const [known, setKnown] = useState(0);
    const [toReview, setToReview] = useState(0);
    const [done, setDone] = useState(false);

    const card = cards[index];

    const goNext = useCallback(
        (result: "known" | "review") => {
            if (result === "known") setKnown((k) => k + 1);
            else setToReview((r) => r + 1);

            // Fade out, then advance
            setCardVisible(false);
            setTimeout(() => {
                if (index + 1 >= cards.length) {
                    setDone(true);
                } else {
                    setIndex((i) => i + 1);
                    setFlipped(false);
                    setCardVisible(true);
                }
            }, 300);
        },
        [index, cards.length]
    );

    const handleGotIt = useCallback(() => {
        updateStatus(card.id, "known").catch(console.error);
        goNext("known");
    }, [card, goNext]);

    const handleReviewAgain = useCallback(() => {
        updateStatus(card.id, "review").catch(console.error);
        goNext("review");
    }, [card, goNext]);

    // ── Completion screen ─────────────────────────────────────────
    if (done) {
        return (
            <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-500">
                <h1 className="text-3xl font-bold text-[#F4F4F5]">Session complete!</h1>
                <p className="text-[#A1A1AA] text-base">
                    <span className="text-[#22C55E] font-semibold">{known} known</span>
                    {" · "}
                    <span className="text-[#F59E0B] font-semibold">{toReview} to review</span>
                </p>
                <Link
                    href={`/content/${contentId}`}
                    className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                    Back to content
                </Link>
            </div>
        );
    }

    // ── Progress ──────────────────────────────────────────────────
    return (
        <div className="w-full max-w-xl flex flex-col items-center gap-8">
            {/* Progress indicator */}
            <p className="text-sm text-[#6B7280] font-mono">
                Card {index + 1} / {cards.length}
            </p>

            {/* Flip card */}
            <div
                className={`w-full transition-opacity duration-300 ${cardVisible ? "opacity-100" : "opacity-0"}`}
                style={{ perspective: "1000px" }}
            >
                <div
                    onClick={() => setFlipped((f) => !f)}
                    className="relative w-full min-h-64 cursor-pointer"
                    style={{
                        transformStyle: "preserve-3d",
                        transition: "transform 0.5s",
                        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                >
                    {/* Front — Question */}
                    <div
                        className="absolute inset-0 bg-[#11121F] border border-[rgba(79,70,229,0.15)] hover:border-[rgba(79,70,229,0.3)] hover:shadow-[0_0_24px_rgba(79,70,229,0.1)] rounded-[16px] p-8 flex flex-col items-center justify-center gap-4 transition-colors"
                        style={{ backfaceVisibility: "hidden" }}
                    >
                        <p className="text-[#F4F4F5] font-semibold text-lg text-center leading-snug">
                            {card.question}
                        </p>
                        <p className="text-xs text-[#6B7280] font-mono mt-2">Click to reveal</p>
                    </div>

                    {/* Back — Answer */}
                    <div
                        className="absolute inset-0 bg-[#11121F] border border-[rgba(79,70,229,0.25)] rounded-[16px] p-8 flex flex-col items-center justify-center"
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                        }}
                    >
                        <p className="text-[#A1A1AA] text-base text-center leading-relaxed">
                            {card.answer}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action buttons — only when flipped */}
            <div
                className={`flex flex-col sm:flex-row gap-3 w-full transition-opacity duration-300 ${flipped && cardVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
            >
                <button
                    onClick={handleGotIt}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                >
                    ✅ Got it
                </button>
                <button
                    onClick={handleReviewAgain}
                    className="flex-1 flex items-center justify-center gap-2 bg-[rgba(245,158,11,0.12)] hover:bg-[rgba(245,158,11,0.2)] text-[#F59E0B] font-semibold px-5 py-3 rounded-lg border border-[rgba(245,158,11,0.25)] transition-colors"
                >
                    🔁 Review again
                </button>
            </div>
        </div>
    );
}
