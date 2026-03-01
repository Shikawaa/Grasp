/**
 * lib/youtube.ts
 *
 * YouTube transcript fetcher — two-strategy approach:
 *  Strategy A: Supadata API (dedicated service, any video, any language)
 *  Strategy B: InnerTube Android API (fallback, no extra key needed)
 */

export class TranscriptError extends Error {
    constructor(
        message: string,
        public readonly code: "NOT_FOUND" | "NO_TRANSCRIPT" | "UNAVAILABLE"
    ) {
        super(message);
        this.name = "TranscriptError";
    }
}

export interface TranscriptResult {
    transcript: string;
    title: string;
    language: string;
}

interface CaptionTrack {
    baseUrl: string;
    languageCode: string;
    kind?: string;
}

interface TranscriptEvent {
    segs?: { utf8?: string }[];
}

function decodeEntities(text: string): string {
    return text
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\n/g, " ");
}

function eventsToText(events: TranscriptEvent[]): string {
    return events
        .filter((e) => e.segs)
        .flatMap((e) => e.segs!.map((s) => s.utf8 ?? ""))
        .filter((t) => t.trim() !== "" && t !== "\n")
        .map(decodeEntities)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Strategy A: Supadata API — dedicated transcript service
// Handles auto-generated captions, any language, any video type
// ─────────────────────────────────────────────────────────────────────────────
async function fetchViaSupadata(videoId: string): Promise<TranscriptResult> {
    const apiKey = process.env.SUPADATA_API_KEY;
    if (!apiKey) throw new Error("SUPADATA_API_KEY not configured");

    const url = `https://api.supadata.ai/v1/youtube/transcript?url=https://www.youtube.com/watch?v=${videoId}&text=true`;

    const res = await fetch(url, {
        headers: {
            "x-api-key": apiKey,
        },
    });

    if (res.status === 404) {
        throw new TranscriptError("Video not found.", "NOT_FOUND");
    }

    if (!res.ok) {
        throw new TranscriptError(
            `Supadata API error: ${res.status}`,
            "UNAVAILABLE"
        );
    }

    const data = await res.json();

    // Supadata returns { content: string, lang: string } when text=true
    const transcript: string =
        typeof data.content === "string" ? data.content.trim() : "";

    if (!transcript) {
        throw new TranscriptError(
            "This video has no transcript available. Try a video with subtitles or auto-generated captions enabled.",
            "NO_TRANSCRIPT"
        );
    }

    return {
        transcript,
        title: data.title ?? videoId,
        language: data.lang ?? "unknown",
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Strategy B: InnerTube Android API — no extra key, good coverage
// ─────────────────────────────────────────────────────────────────────────────
const INNERTUBE_URL =
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

const INNERTUBE_CONTEXT = {
    client: {
        clientName: "ANDROID",
        clientVersion: "19.09.37",
        androidSdkVersion: 30,
        hl: "en",
        gl: "US",
    },
};

async function fetchViaInnerTube(videoId: string): Promise<TranscriptResult> {
    const playerRes = await fetch(INNERTUBE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip",
            "X-YouTube-Client-Name": "3",
            "X-YouTube-Client-Version": "19.09.37",
        },
        body: JSON.stringify({ videoId, context: INNERTUBE_CONTEXT }),
    });

    if (!playerRes.ok) {
        throw new TranscriptError("Video not found.", "NOT_FOUND");
    }

    const playerData = await playerRes.json();

    const status = playerData?.playabilityStatus?.status;
    if (status === "ERROR" || status === "LOGIN_REQUIRED") {
        throw new TranscriptError("Video unavailable.", "NOT_FOUND");
    }

    const title: string = playerData?.videoDetails?.title ?? videoId;
    const tracks: CaptionTrack[] | undefined =
        playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!tracks?.length) {
        throw new TranscriptError("No transcript available.", "NO_TRANSCRIPT");
    }

    const track = tracks.find((t) => t.kind !== "asr") ?? tracks[0];
    const transcriptUrl = track.baseUrl.includes("fmt=")
        ? track.baseUrl
        : `${track.baseUrl}&fmt=json3`;

    const transcriptRes = await fetch(transcriptUrl);
    if (!transcriptRes.ok) {
        throw new TranscriptError("Failed to download transcript.", "UNAVAILABLE");
    }

    const transcriptData = (await transcriptRes.json()) as {
        events?: TranscriptEvent[];
    };
    const transcript = eventsToText(transcriptData.events ?? []);

    if (!transcript) {
        throw new TranscriptError("Transcript is empty.", "NO_TRANSCRIPT");
    }

    return {
        transcript,
        title: decodeEntities(title),
        language: track.languageCode,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchYouTubeTranscript(
    videoId: string
): Promise<TranscriptResult> {
    // Strategy A: Supadata (if key is configured)
    if (process.env.SUPADATA_API_KEY) {
        try {
            return await fetchViaSupadata(videoId);
        } catch (err) {
            if (err instanceof TranscriptError && err.code === "NOT_FOUND") throw err;
            console.warn(
                `[youtube] Supadata failed for ${videoId}, falling back to InnerTube:`,
                (err as Error).message
            );
        }
    }

    // Strategy B: InnerTube Android (no key required)
    console.info(`[youtube] Using InnerTube Android for ${videoId}…`);
    return await fetchViaInnerTube(videoId);
}
