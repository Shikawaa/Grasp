"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Play, Pause, Loader2, Headphones, MoreHorizontal, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AudioPlayerProps {
    contentId: string;
    initialAudioUrl: string | null;
    title: string;
}

export function AudioPlayer({ contentId, initialAudioUrl, title }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoaded = () => {
            setDuration(audio.duration);
            setCurrentTime(audio.currentTime);
        };
        const onTime = () => setCurrentTime(audio.currentTime);
        const onEnd = () => setIsPlaying(false);

        audio.addEventListener("loadeddata", onLoaded);
        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("ended", onEnd);
        if (audio.readyState >= 2) onLoaded();

        return () => {
            audio.removeEventListener("loadeddata", onLoaded);
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener("ended", onEnd);
        };
    }, [audioUrl]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.playbackRate = playbackRate;
    }, [playbackRate]);

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            setErrorText(null);

            const res = await fetch("/api/audio/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content_id: contentId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate audio");

            const newUrl = data.audio_url;
            setAudioUrl(newUrl);

            if (audioRef.current) {
                audioRef.current.src = newUrl;
                audioRef.current.load();
                await new Promise((r) => setTimeout(r, 500));
                await audioRef.current.play();
                setIsPlaying(true);
            }

            toast.success("Audio summary generated!");
        } catch (error: any) {
            const msg = error.message || "Failed to generate audio.";
            setErrorText(msg);
            toast.error(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerate = async () => {
        try {
            setIsRegenerating(true);
            setErrorText(null);

            const res = await fetch("/api/audio/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content_id: contentId, force_regenerate: true }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            const freshUrl = `${data.audio_url}?t=${Date.now()}`;
            setAudioUrl(freshUrl);

            if (audioRef.current) {
                audioRef.current.src = freshUrl;
                audioRef.current.load();
                await new Promise((r) => setTimeout(r, 500));
                await audioRef.current.play();
                setIsPlaying(true);
            }

            toast.success("Audio regenerated!");
        } catch (error: any) {
            const msg = error.message || "Failed to regenerate audio.";
            setErrorText(msg);
            toast.error(msg);
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!audioUrl) return;
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.mp3`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current || !audioUrl) return;
        const newTime = Number(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (t: number) => {
        if (isNaN(t)) return "0:00";
        return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, "0")}`;
    };

    const rates = [1, 1.5, 2];

    // ── No audio yet: show subtle pill-shaped generate button ──
    if (!audioUrl) {
        return (
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#A1A1AA] border border-[rgba(79,70,229,0.2)] rounded-full hover:border-[rgba(79,70,229,0.4)] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Headphones className="w-4 h-4" />
                    )}
                    {isGenerating ? "Generating…" : "Generate audio"}
                </button>
                {errorText && (
                    <span className="text-sm text-red-400">{errorText}</span>
                )}
            </div>
        );
    }

    // ── Has audio: full player ──
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="bg-[#11121F] border border-[rgba(79,70,229,0.15)] rounded-2xl px-3 sm:px-5 py-4 w-full flex items-center gap-2 sm:gap-4">
                <audio ref={audioRef} src={audioUrl} className="hidden" preload="metadata" />

                <button
                    onClick={() => {
                        if (!audioRef.current) return;
                        if (isPlaying) {
                            audioRef.current.pause();
                            setIsPlaying(false);
                        } else {
                            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                        }
                    }}
                    className="flex items-center justify-center rounded-full bg-[#4F46E5] hover:bg-[#4338CA] transition-colors w-10 h-10 shrink-0 text-white"
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="w-5 h-5" fill="currentColor" />
                    ) : (
                        <Play className="w-5 h-5 ml-1" fill="currentColor" />
                    )}
                </button>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleProgressChange}
                        className="w-full h-1.5 bg-[#1D1E35] rounded-lg appearance-none cursor-pointer accent-[#4F46E5] focus:outline-none focus:ring-0"
                    />
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[#A1A1AA] text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center bg-[#1A1B2E] rounded-lg p-1 shrink-0">
                    {rates.map((rate) => (
                        <button
                            key={rate}
                            onClick={() => setPlaybackRate(rate)}
                            className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                                playbackRate === rate
                                    ? "bg-[rgba(79,70,229,0.15)] text-[#4F46E5]"
                                    : "text-[#A1A1AA] hover:text-[#F4F4F5]"
                            }`}
                        >
                            {rate}x
                        </button>
                    ))}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            disabled={isRegenerating}
                            className="p-1.5 text-[#A1A1AA] hover:text-white transition-colors rounded-lg hover:bg-[rgba(79,70,229,0.15)] disabled:opacity-50"
                        >
                            {isRegenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreHorizontal className="w-5 h-5" />}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-[#11121F] border border-[rgba(79,70,229,0.15)] text-white">
                        <DropdownMenuItem
                            className="cursor-pointer hover:bg-[rgba(79,70,229,0.15)] focus:bg-[rgba(79,70,229,0.15)] focus:text-white"
                            onClick={handleDownload}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download audio</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer hover:bg-[rgba(79,70,229,0.15)] focus:bg-[rgba(79,70,229,0.15)] focus:text-white"
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Regenerate audio</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {errorText && (
                <div className="px-3 py-1.5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg inline-block self-start">
                    {errorText}
                </div>
            )}
        </div>
    );
}
