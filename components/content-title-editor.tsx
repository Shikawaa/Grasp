"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ContentTitleEditorProps {
    contentId: string;
    initialTitle: string;
}

export function ContentTitleEditor({ contentId, initialTitle }: ContentTitleEditorProps) {
    const [title, setTitle] = useState(initialTitle);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(initialTitle);
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    function startEdit() {
        setDraft(title);
        setEditing(true);
    }

    function cancelEdit() {
        setEditing(false);
        setDraft(title);
    }

    async function saveEdit() {
        const trimmed = draft.trim();
        if (!trimmed || trimmed === title) {
            setEditing(false);
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/content/${contentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: trimmed }),
            });
            if (res.ok) {
                setTitle(trimmed);
            }
        } finally {
            setSaving(false);
            setEditing(false);
        }
    }

    if (!editing) {
        return (
            <div className="flex items-start gap-2 group">
                <h1 className="text-2xl font-semibold text-foreground tracking-tight leading-snug">
                    {title}
                </h1>
                <button
                    onClick={startEdit}
                    className="mt-1 p-1 rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted transition-all"
                    aria-label="Edit title"
                >
                    <Pencil className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                }}
                className="text-xl font-semibold h-auto py-1 px-2 w-full max-w-lg"
                disabled={saving}
            />
            <Button
                size="sm"
                onClick={saveEdit}
                disabled={saving || !draft.trim()}
                aria-label="Save title"
            >
                <Check className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant="ghost"
                onClick={cancelEdit}
                disabled={saving}
                aria-label="Cancel"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
