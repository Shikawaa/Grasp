"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, FileText, FileUp, Loader2 } from "lucide-react";

const YOUTUBE_REGEX =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}(?:[?&].*)?$/;
const HTTP_REGEX = /^https?:\/\/.+/i;

// ─── YouTube Form ──────────────────────────────────────────────────
function YouTubeForm({ onSuccess }: { onSuccess: (id: string) => void }) {
    const [url, setUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!YOUTUBE_REGEX.test(url.trim())) {
            setError("Invalid YouTube URL. Please enter a valid youtube.com or youtu.be link.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/import/youtube", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
            onSuccess(data.id);
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-none border-0 bg-transparent">
            <CardHeader className="px-0 pt-4 pb-3 space-y-1">
                <div className="flex items-center gap-2">
                    <Image src="/youtube-icon.png" alt="YouTube" width={20} height={20} className="rounded-sm" />
                    <CardTitle className="text-base">Import a YouTube video</CardTitle>
                </div>
                <CardDescription>Paste a YouTube URL to generate a summary and more.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="yt-url">YouTube URL</Label>
                        <Input
                            id="yt-url"
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
                            disabled={loading}
                            autoFocus
                        />
                        {error && (
                            <div className="flex items-start gap-2 text-red-400 text-sm mt-1">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                    <Button type="submit" className="w-full bg-[#4F46E5] hover:bg-[#4338CA]" disabled={loading || !url.trim()}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Processing…" : "Generate summary"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Article Form ──────────────────────────────────────────────────
function ArticleForm({ onSuccess }: { onSuccess: (id: string) => void }) {
    const [url, setUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!HTTP_REGEX.test(url.trim())) {
            setError("Invalid URL. Please enter a valid http/https link.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/import/article", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
            onSuccess(data.id);
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-none border-0 bg-transparent">
            <CardHeader className="px-0 pt-4 pb-3 space-y-1">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#4F46E5]" />
                    <CardTitle className="text-base">Import an article</CardTitle>
                </div>
                <CardDescription>Paste any article URL to generate a summary.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="article-url">Article URL</Label>
                        <Input
                            id="article-url"
                            type="url"
                            placeholder="https://example.com/article"
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
                            disabled={loading}
                            autoFocus
                        />
                        {error && (
                            <div className="flex items-start gap-2 text-red-400 text-sm mt-1">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                    <Button type="submit" className="w-full bg-[#4F46E5] hover:bg-[#4338CA]" disabled={loading || !url.trim()}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Processing…" : "Generate summary"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── PDF Form ───────────────────────────────────────────────────────
function PdfForm({ onSuccess }: { onSuccess: (id: string) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setError(null);
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.name.toLowerCase().endsWith(".pdf") || f.type !== "application/pdf") {
            setError("Only PDF files are supported.");
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            setError("File exceeds the 10 MB limit.");
            return;
        }
        setFile(f);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setError(null);
        setLoading(true);
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch("/api/import/pdf", { method: "POST", body: form });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
            onSuccess(data.id);
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-none border-0 bg-transparent">
            <CardHeader className="px-0 pt-4 pb-3 space-y-1">
                <div className="flex items-center gap-2">
                    <FileUp className="w-5 h-5 text-[#4F46E5]" />
                    <CardTitle className="text-base">Import a PDF</CardTitle>
                </div>
                <CardDescription>Upload a PDF file to generate a summary.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Dropzone */}
                    <label
                        htmlFor="pdf-file"
                        className={`flex flex-col items-center justify-center gap-2 w-full rounded-[8px] border-2 border-dashed cursor-pointer py-8 transition-colors ${file
                            ? "border-[#4F46E5] bg-[rgba(79,70,229,0.05)]"
                            : "border-[rgba(79,70,229,0.15)] hover:border-[rgba(79,70,229,0.4)]"
                            }`}
                    >
                        <FileUp className="h-6 w-6 text-[#A1A1AA]" />
                        {file ? (
                            <span className="text-sm text-[#F4F4F5] font-medium px-4 text-center truncate max-w-xs">
                                {file.name}
                            </span>
                        ) : (
                            <span className="text-sm text-[#A1A1AA]">
                                Click to choose a PDF <span className="text-xs">(max 10 MB)</span>
                            </span>
                        )}
                        <input
                            id="pdf-file"
                            type="file"
                            accept=".pdf,application/pdf"
                            className="sr-only"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                    </label>

                    {error && (
                        <div className="flex items-start gap-2 text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-[#4F46E5] hover:bg-[#4338CA]"
                        disabled={loading || !file}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Processing…" : "Generate summary"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Dialog ────────────────────────────────────────────────────────
interface ImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
    const router = useRouter();

    function handleSuccess(id: string) {
        onOpenChange(false);
        router.push(`/content/${id}`);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import content</DialogTitle>
                    <DialogDescription className="sr-only">
                        Import a YouTube video, article, or PDF to generate a summary.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="youtube" className="w-full">
                    <TabsList className="w-full">
                        <TabsTrigger value="youtube" className="flex-1">YouTube</TabsTrigger>
                        <TabsTrigger value="article" className="flex-1">Article</TabsTrigger>
                        <TabsTrigger value="pdf" className="flex-1">PDF</TabsTrigger>
                    </TabsList>
                    <TabsContent value="youtube">
                        <YouTubeForm onSuccess={handleSuccess} />
                    </TabsContent>
                    <TabsContent value="article">
                        <ArticleForm onSuccess={handleSuccess} />
                    </TabsContent>
                    <TabsContent value="pdf">
                        <PdfForm onSuccess={handleSuccess} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
