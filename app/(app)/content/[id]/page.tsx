import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ArrowLeft, FileText } from "lucide-react";
import { ContentTitleEditor } from "@/components/content-title-editor";
import { ContentDeleteButton } from "@/components/content-delete-button";
import { ContentShareButton } from "@/components/content-share-button";
import { AudioPlayer } from "@/components/audio-player";
import { ContentTabs } from "@/components/content-tabs";

interface ContentRow {
    id: string;
    title: string | null;
    type: string | null;
    source_url: string | null;
    summary: string | null;
    created_at: string;
    user_id: string;
    share_token: string | null;
    audio_url: string | null;
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

export default async function ContentPage({
    params,
}: {
    params: { id: string };
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    const [{ data }, { data: flashcardData }] = await Promise.all([
        supabase
            .from("contents")
            .select("id, title, type, source_url, summary, created_at, user_id, share_token, audio_url")
            .eq("id", params.id)
            .single(),
        supabase
            .from("flashcards")
            .select("id, question, answer, status")
            .eq("content_id", params.id)
            .order("created_at", { ascending: true }),
    ]);

    const content = data as ContentRow | null;

    if (!content || content.user_id !== user.id) {
        redirect("/");
    }

    const flashcards = (flashcardData ?? []) as Flashcard[];

    // For PDFs: generate a signed URL from Supabase Storage (valid 1 hour)
    let pdfSignedUrl: string | null = null;
    if (content.type === "pdf") {
        const { data: signed } = await supabase.storage
            .from("pdfs")
            .createSignedUrl(`${user.id}/${content.id}.pdf`, 3600);
        pdfSignedUrl = signed?.signedUrl ?? null;
    }

    const displayTitle = content.title ?? content.source_url ?? "Untitled";
    const createdDate = new Date(content.created_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });

    return (
        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-10 pb-10">
            <div className="mb-8 w-full">
                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Library
                </Link>

                {/* Title + actions row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4">
                    <ContentTitleEditor contentId={content.id} initialTitle={displayTitle} />
                    <div className="flex items-center gap-2">
                        <ContentShareButton contentId={content.id} initialToken={content.share_token} />
                        <ContentDeleteButton contentId={content.id} />
                    </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-0 text-xs font-medium"
                >
                    {typeLabel(content.type)}
                </Badge>
                {content.source_url && (
                    <a
                        href={content.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors max-w-[160px] sm:max-w-xs"
                    >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{content.source_url}</span>
                    </a>
                )}
                {pdfSignedUrl && (
                    <a
                        href={pdfSignedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        View PDF
                    </a>
                )}
                <span>{createdDate}</span>
                </div>
                
                {/* Audio Generation + Player */}
                <div className="mt-8">
                    <AudioPlayer contentId={content.id} initialAudioUrl={content.audio_url} title={displayTitle} />
                </div>
            </div>

            {/* Summary + Flashcards tabs */}
            <div className="mt-8 w-full">
                <ContentTabs contentId={content.id} summary={content.summary} initialFlashcards={flashcards} />
            </div>
        </div>
    );
}
