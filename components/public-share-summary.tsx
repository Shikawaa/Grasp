"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export function PublicShareSummary({ summary }: { summary: string }) {
    const [expanded, setExpanded] = useState(false);
    
    const wordCount = summary.split(" ").length;
    const isLongSummary = wordCount > 600;

    if (!isLongSummary) {
        return (
            <article className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#4F46E5] prose-strong:text-white leading-relaxed">
                <ReactMarkdown>{summary}</ReactMarkdown>
            </article>
        );
    }

    return (
        <div>
            <div className={`relative ${expanded ? "" : "max-h-[400px] overflow-hidden"}`}>
                <article className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#4F46E5] prose-strong:text-white leading-relaxed">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                </article>
                {!expanded && (
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#080914] to-transparent pointer-events-none" />
                )}
            </div>
            {!expanded && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setExpanded(true)}
                        className="text-[#4F46E5] text-sm font-medium hover:underline"
                    >
                        Read full summary
                    </button>
                </div>
            )}
        </div>
    );
}
