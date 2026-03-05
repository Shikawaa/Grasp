"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, FileText, Loader2 } from "lucide-react";

// ─── Validation ────────────────────────────────────────────────────
const YOUTUBE_REGEX =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}(?:[?&].*)?$/;

const HTTP_REGEX = /^https?:\/\/.+/i;

// ─── YouTube Tab ───────────────────────────────────────────────────
function YouTubeForm() {
    const router = useRouter();
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
            if (!res.ok) {
                setError(data.error ?? "Something went wrong. Please try again.");
                return;
            }
            router.push(`/content/${data.id}`);
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Image
                        src="/youtube-icon.png"
                        alt="YouTube"
                        width={24}
                        height={24}
                        className="rounded-sm"
                    />
                    <CardTitle className="text-xl">Import a YouTube video</CardTitle>
                </div>
                <CardDescription>
                    Paste a YouTube URL to generate a summary, flashcards, and more.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="youtube-url">YouTube URL</Label>
                        <Input
                            id="youtube-url"
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
                            disabled={loading}
                            className={error ? "border-destructive" : ""}
                            autoFocus
                        />
                        {error && (
                            <div className="flex items-start gap-2 text-red-400 text-sm mt-1.5">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-[#4F46E5] hover:bg-[#4338CA]"
                        disabled={loading || !url.trim()}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Processing…" : "Generate summary"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Article Tab ───────────────────────────────────────────────────
function ArticleForm() {
    const router = useRouter();
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
            if (!res.ok) {
                setError(data.error ?? "Something went wrong. Please try again.");
                return;
            }
            router.push(`/content/${data.id}`);
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-[#4F46E5]" />
                    <CardTitle className="text-xl">Import an article</CardTitle>
                </div>
                <CardDescription>
                    Paste any article URL to generate a summary and key takeaways.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="article-url">Article URL</Label>
                        <Input
                            id="article-url"
                            type="url"
                            placeholder="https://example.com/article"
                            value={url}
                            onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
                            disabled={loading}
                            className={error ? "border-destructive" : ""}
                            autoFocus
                        />
                        {error && (
                            <div className="flex items-start gap-2 text-red-400 text-sm mt-1.5">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-[#4F46E5] hover:bg-[#4338CA]"
                        disabled={loading || !url.trim()}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Processing…" : "Generate summary"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Page ──────────────────────────────────────────────────────────
export default function ImportPage() {
    return (
        <div className="flex items-center justify-center min-h-full py-16 px-4">
            <div className="w-full max-w-lg">
                <Tabs defaultValue="youtube" className="w-full">
                    <TabsList className="w-full mb-6">
                        <TabsTrigger value="youtube" className="flex-1">YouTube</TabsTrigger>
                        <TabsTrigger value="article" className="flex-1">Article</TabsTrigger>
                    </TabsList>
                    <TabsContent value="youtube">
                        <YouTubeForm />
                    </TabsContent>
                    <TabsContent value="article">
                        <ArticleForm />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
