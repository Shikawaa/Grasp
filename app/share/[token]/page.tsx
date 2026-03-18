import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText } from "lucide-react";
import { PublicShareSummary } from "@/components/public-share-summary";
import { PublicShareFlashcards } from "@/components/public-share-flashcards";

interface ContentRow {
    id: string;
    title: string | null;
    type: string | null;
    source_url: string | null;
    summary: string | null;
    created_at: string;
}

interface Flashcard {
    id: string;
    question: string;
    answer: string;
    status: "new" | "known" | "review";
}

function typeLabel(type: string | null): string {
    switch (type) {
        case "youtube": return "YouTube";
        case "article": return "Article";
        case "pdf": return "PDF";
        default: return type ?? "Content";
    }
}

export default async function PublicSharePage({
    params,
}: {
    params: { token: string };
}) {
    // Note: this assumes Supabase policies allow public select where share_token matches.
    const supabase = createClient();
    
    // 1. Fetch content by share token
    const { data } = await supabase
        .from("contents")
        .select("id, title, type, source_url, summary, created_at")
        .eq("share_token", params.token)
        .single();
        
    const content = data as ContentRow | null;

    if (!content) {
        notFound();
    }

    // 2. Fetch flashcards
    const { data: flashcardData } = await supabase
        .from("flashcards")
        .select("id, question, answer, status")
        .eq("content_id", content.id)
        .order("created_at", { ascending: true });

    const flashcards = (flashcardData ?? []) as Flashcard[];
    
    // For PDFs: technically getting signedUrl requires ownership usually.
    // In a purely public context, generating signed URLs for PDF storage might fail if RLS for storage isn't public.
    // We will skip signed PDF links for the public share page or just attempt it safely if it allows anon reads.
    const displayTitle = content.title ?? content.source_url ?? "Untitled";
    const createdDate = new Date(content.created_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    });

    return (
        <div className="min-h-screen bg-[#080914] text-[#F4F4F5]">
            {/* Header with Logo */}
            <header className="flex items-center h-16 px-6 border-b border-[rgba(79,70,229,0.15)] bg-[#080914]">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/grasp-logo.svg"
                        alt="Grasp"
                        width={32}
                        height={32}
                        priority
                    />
                    <span className="font-semibold text-lg tracking-tight">Grasp</span>
                </Link>
            </header>

            {/* Main Content Area */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Meta block */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-4 leading-tight">{displayTitle}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#A1A1AA]">
                        <Badge
                            variant="secondary"
                            className="bg-[rgba(79,70,229,0.1)] text-[#4F46E5] border-0 text-xs font-medium"
                        >
                            {typeLabel(content.type)}
                        </Badge>
                        {content.source_url && (
                            <a
                                href={content.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 hover:text-white transition-colors truncate max-w-[200px] sm:max-w-xs"
                            >
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{content.source_url}</span>
                            </a>
                        )}
                        <span>{createdDate}</span>
                    </div>
                </div>

                {/* Summary Section */}
                {content.summary && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold mb-6 text-white border-b border-[rgba(79,70,229,0.15)] pb-3">Summary</h2>
                        <PublicShareSummary summary={content.summary} />
                    </div>
                )}

                {/* Flashcards Section */}
                {flashcards.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-semibold mb-6 text-white border-b border-[rgba(79,70,229,0.15)] pb-3">Flashcards</h2>
                        <PublicShareFlashcards flashcards={flashcards} />
                    </div>
                )}
            </main>
        </div>
    );
}
