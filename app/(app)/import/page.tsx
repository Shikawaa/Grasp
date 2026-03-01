"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Youtube } from "lucide-react";

const YOUTUBE_REGEX =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}(?:[?&].*)?$/;

export default function ImportPage() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
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

            // Success → redirect to content page
            router.push(`/content/${data.id}`);
        } catch {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-full py-16 px-4">
            <div className="w-full max-w-lg">
                <Card className="shadow-sm">
                    <CardHeader className="space-y-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50">
                                <Youtube className="w-4 h-4 text-red-600" />
                            </div>
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
                                    onChange={(e) => {
                                        setUrl(e.target.value);
                                        if (error) setError(null); // clear error on new input
                                    }}
                                    disabled={loading}
                                    className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                                    autoFocus
                                />

                                {/* Error message */}
                                {error && (
                                    <div className="flex items-start gap-2 text-destructive text-sm mt-1.5">
                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || !url.trim()}
                            >
                                {loading && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {loading ? "Processing…" : "Generate summary"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
