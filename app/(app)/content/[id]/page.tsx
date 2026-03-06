import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ArrowLeft, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ContentTitleEditor } from "@/components/content-title-editor";
import { ContentDeleteButton } from "@/components/content-delete-button";

interface ContentRow {
    id: string;
    title: string | null;
    type: string | null;
    source_url: string | null;
    summary: string | null;
    created_at: string;
    user_id: string;
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

    const { data } = await supabase
        .from("contents")
        .select("id, title, type, source_url, summary, created_at, user_id")
        .eq("id", params.id)
        .single();

    const content = data as ContentRow | null;

    if (!content || content.user_id !== user.id) {
        redirect("/");
    }

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
        <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Back link */}
            <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
            </Link>

            {/* Title + actions row */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <ContentTitleEditor contentId={content.id} initialTitle={displayTitle} />
                <ContentDeleteButton contentId={content.id} />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-8">
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
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors truncate max-w-xs"
                    >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        {content.source_url}
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

            {/* Divider */}
            <div className="border-t border-border mb-8" />

            {/* Summary */}
            {content.summary ? (
                <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-strong:text-foreground">
                    <ReactMarkdown>{content.summary}</ReactMarkdown>
                </article>
            ) : (
                <p className="text-muted-foreground text-sm">No summary available.</p>
            )}
        </div>
    );
}
