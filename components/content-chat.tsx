"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
    id: string;
    role: "user" | "assistant";
    body: string;
    created_at: string;
}

interface ContentChatProps {
    contentId: string;
}

export function ContentChat({ contentId }: ContentChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        });
    }, []);

    // Fetch existing messages on mount
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/chat/messages?contentId=${contentId}`);
                if (res.ok) {
                    const data: Message[] = await res.json();
                    setMessages(data);
                }
            } catch { /* silent */ }
            finally { setInitialLoading(false); }
        })();
    }, [contentId]);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    const handleSend = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        setInput("");
        setLoading(true);

        const userMsg: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            body: trimmed,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            const res = await fetch("/api/chat/contextual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content_id: contentId,
                    messages: messages.slice(-10).map((m) => ({ role: m.role, body: m.body })),
                    user_message: trimmed,
                }),
            });
            if (!res.ok) throw new Error("Failed");
            const { reply } = await res.json();
            setMessages((prev) => [
                ...prev,
                { id: `temp-${Date.now()}-reply`, role: "assistant", body: reply, created_at: new Date().toISOString() },
            ]);
        } catch {
            setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        } finally {
            setLoading(false);
            textareaRef.current?.focus();
        }
    }, [input, loading, contentId, messages]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    }, [handleSend]);

    const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        const el = e.target;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, Math.round(window.innerHeight * 0.25)) + "px";
    }, []);

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-6 w-full max-w-[720px] mx-auto">
                {initialLoading ? (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                        <p className="text-base text-[#6B7280] font-mono">Loading conversation...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                        <p className="text-base text-[#A1A1AA]">Ask anything about this content…</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="flex flex-col">
                            {msg.role === "user" ? (
                                <div className="self-end max-w-[75%] bg-[#4F46E5] text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-base font-medium leading-relaxed whitespace-pre-wrap">
                                    {msg.body}
                                </div>
                            ) : (
                                <div className="text-[#F4F4F5] text-base leading-relaxed font-normal prose prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 px-2 py-1 self-start max-w-[85%]">
                                    <ReactMarkdown>
                                        {msg.body}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex justify-start">
                        <div className="self-start max-w-[85%] px-2 py-2">
                            <div className="flex gap-1.5 items-center h-6">
                                {[0, 150, 300].map((delay) => (
                                    <span key={delay} className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div className="px-6 pb-4 pt-2 w-full max-w-[720px] mx-auto">
                <div className="flex items-end gap-3 rounded-2xl bg-[#11121F] px-5 py-4 border border-[rgba(79,70,229,0.20)]">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question…"
                        disabled={loading}
                        rows={1}
                        className="chat-input flex-1 resize-none bg-transparent text-base font-normal tracking-normal text-[#F4F4F5] 
                                   placeholder:text-[#A1A1AA] focus:outline-none border-none 
                                   ring-0 focus:ring-0 shadow-none disabled:opacity-50"
                        style={{ minHeight: "44px", maxHeight: "25vh", outline: "none", boxShadow: "none", border: "none" }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="shrink-0 flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#4F46E5] hover:bg-[#4338CA] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ArrowUp className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
