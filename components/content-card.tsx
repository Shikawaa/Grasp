"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ArrowRight, Pencil, Trash2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ContentItem {
    id: string;
    title: string | null;
    type: string | null;
    source_url: string | null;
    created_at: string;
}

interface ContentCardProps {
    item: ContentItem;
    onRename: (id: string, newTitle: string) => void;
    onDelete: (id: string) => void;
}

function typeLabel(type: string | null): string {
    switch (type) {
        case "youtube": return "YouTube";
        case "article": return "Article";
        case "pdf": return "PDF";
        default: return type ?? "Content";
    }
}

function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ContentCard({ item, onRename, onDelete }: ContentCardProps) {
    const router = useRouter();
    const [renaming, setRenaming] = useState(false);
    const [draft, setDraft] = useState(item.title ?? item.source_url ?? "Untitled");
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const displayTitle = item.title ?? item.source_url ?? "Untitled";

    useEffect(() => {
        if (renaming) {
            setDraft(displayTitle);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [renaming, displayTitle]);

    async function saveRename() {
        const trimmed = draft.trim();
        if (!trimmed || trimmed === displayTitle) { setRenaming(false); return; }
        setSaving(true);
        try {
            const res = await fetch(`/api/content/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: trimmed }),
            });
            if (res.ok) onRename(item.id, trimmed);
        } finally {
            setSaving(false);
            setRenaming(false);
        }
    }

    async function confirmDelete() {
        setDeleting(true);
        try {
            await fetch(`/api/content/${item.id}`, { method: "DELETE" });
            onDelete(item.id);
        } finally {
            setDeleting(false);
            setDeleteOpen(false);
        }
    }

    return (
        <>
            <div className="group relative flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-shadow hover:shadow-sm hover:border-primary/30">
                {/* Clickable area — takes up most of the card */}
                {renaming ? (
                    <div className="flex flex-1 items-center gap-2">
                        <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary border-0 text-xs font-medium">
                            {typeLabel(item.type)}
                        </Badge>
                        <input
                            ref={inputRef}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") saveRename();
                                if (e.key === "Escape") setRenaming(false);
                            }}
                            className="flex-1 text-sm font-medium bg-transparent border-b border-primary outline-none text-foreground"
                            disabled={saving}
                        />
                        <button
                            onClick={saveRename}
                            disabled={saving || !draft.trim()}
                            className="p-1 rounded text-primary hover:bg-primary/10 disabled:opacity-40"
                            aria-label="Save rename"
                        >
                            <Check className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setRenaming(false)}
                            disabled={saving}
                            className="p-1 rounded text-muted-foreground hover:bg-muted"
                            aria-label="Cancel rename"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <Link
                        href={`/content/${item.id}`}
                        className="flex flex-1 items-center gap-3 min-w-0"
                    >
                        <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary border-0 text-xs font-medium">
                            {typeLabel(item.type)}
                        </Badge>
                        <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {displayTitle}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground shrink-0 pl-4">
                            {formatRelativeDate(item.created_at)}
                        </span>
                    </Link>
                )}

                {/* ⋯ context menu */}
                {!renaming && (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="shrink-0 p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all focus:opacity-100"
                            aria-label="More options"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => router.push(`/content/${item.id}`)}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRenaming(true)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setDeleteOpen(true)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Delete confirmation dialog */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this content?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The summary and transcript will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
