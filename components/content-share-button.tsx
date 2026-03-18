"use client";

import { useState } from "react";
import { Share, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ContentShareButton({ contentId, initialToken }: { contentId: string, initialToken: string | null }) {
    const [token, setToken] = useState<string | null>(initialToken);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    async function handleShare() {
        try {
            let currentToken = token;

            if (!currentToken) {
                setLoading(true);
                const res = await fetch("/api/share/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content_id: contentId }),
                });

                if (!res.ok) {
                    throw new Error("Failed to generate share link");
                }

                const data = await res.json();
                currentToken = data.share_token;
                setToken(currentToken);
                setLoading(false);
            }

            if (!currentToken) throw new Error("No token returned");

            const url = `${window.location.origin}/share/${currentToken}`;
            await navigator.clipboard.writeText(url);
            
            setCopied(true);
            toast.success("Link copied to clipboard!");
            
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Share error:", error);
            toast.error("Could not copy share link");
            setLoading(false);
        }
    }

    return (
        <Button
            variant="outline"
            className="border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors h-9 px-3"
            onClick={handleShare}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : copied ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
            ) : (
                <Share className="w-4 h-4 mr-2" />
            )}
            Share
        </Button>
    );
}
