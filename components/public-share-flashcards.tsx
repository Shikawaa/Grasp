"use client";

import { useState } from "react";

interface Flashcard {
    id: string;
    question: string;
    answer: string;
    status: "new" | "known" | "review";
}

export function PublicShareFlashcards({ flashcards }: { flashcards: Flashcard[] }) {
    const [flipped, setFlipped] = useState<Set<number>>(new Set());

    const toggleFlip = (index: number) => {
        setFlipped(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const previewCards = flashcards.slice(0, 3);
    const lockedCards = flashcards.slice(3, 5);

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {previewCards.map((card, idx) => {
                    const isFlipped = flipped.has(idx);
                    return (
                        <div
                            key={card.id}
                            className="relative h-[160px] cursor-pointer"
                            onClick={() => toggleFlip(idx)}
                        >
                            <div className={`w-full h-full flashcard-inner ${isFlipped ? "flipped" : ""}`}>
                                {/* Front face */}
                                <div className="absolute inset-0 flashcard-face bg-[#11121F] border border-[rgba(79,70,229,0.15)] rounded-2xl px-6 py-5 flex flex-col">
                                    <h3 className="text-sm font-medium text-[#A1A1AA] mb-2">Question</h3>
                                    <p className="text-base text-white font-medium break-words overflow-y-auto">{card.question}</p>
                                </div>
                                {/* Back face */}
                                <div className="absolute inset-0 flashcard-face flashcard-back bg-[#11121F] border border-[rgba(79,70,229,0.15)] rounded-2xl px-6 py-5 flex flex-col">
                                    <h3 className="text-sm font-medium text-[#A1A1AA] mb-2">Answer</h3>
                                    <p className="text-base text-[#F4F4F5] break-words overflow-y-auto">{card.answer}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {lockedCards.length > 0 && (
                <div className="relative mt-6">
                    {/* blurred cards stacked behind */}
                    <div className="space-y-4 blur-sm pointer-events-none select-none opacity-60">
                        {lockedCards.map((card) => (
                            <div key={card.id} className="h-[160px] bg-[#11121F] border border-[rgba(79,70,229,0.15)] rounded-2xl px-6 py-5 flex flex-col">
                                <h3 className="text-sm font-medium text-[#A1A1AA] mb-2">Question</h3>
                                <p className="text-base text-white font-medium line-clamp-3">{card.question}</p>
                            </div>
                        ))}
                    </div>

                    {/* overlay centered on top */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-transparent via-[#080914]/80 to-[#080914]">
                        <p className="text-[#F4F4F5] text-lg font-semibold text-center mt-8">
                            Want to master all {flashcards.length} flashcards?
                        </p>
                        <p className="text-[#A1A1AA] text-sm text-center max-w-xs">
                            Grasp turns any content into an interactive learning experience.
                        </p>
                        <a href="/sign-up" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium rounded-xl px-6 py-3 transition-colors mt-2">
                            Start learning for free →
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
