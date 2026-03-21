/**
 * Standalone TTS worker — runs outside Next.js webpack.
 * Reads JSON from stdin: { text: string }
 * Writes MP3 to a temp file and outputs: { file: string, size: number }
 */
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/** Strip Markdown syntax so Jenny reads clean prose */
function stripMarkdown(text) {
    return text
        .replace(/(#{1,6}\s*)?(TL;?DR|Overview)[^\n]*\n[\s\S]*?(?=\n#{1,6}\s|\n\n[A-Z]|$)/gim, "") // remove entire TL;DR/Overview section
        .replace(/^#{1,6}\s+/gm, "")                         // strip # symbols but keep the heading text
        .replace(/\*\*(.+?)\*\*/g, "$1")       // **bold**
        .replace(/\*(.+?)\*/g, "$1")           // *italic*
        .replace(/__(.+?)__/g, "$1")           // __bold__
        .replace(/_(.+?)_/g, "$1")             // _italic_
        .replace(/~~(.+?)~~/g, "$1")           // ~~strikethrough~~
        .replace(/`{1,3}[^`]*`{1,3}/g, "")    // inline code & code blocks
        .replace(/^\s*[-*+]\s+/gm, "")         // bullet points
        .replace(/^\s*\d+\.\s+/gm, "")         // numbered lists
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [link text](url)
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // images
        .replace(/^>\s*/gm, "")                // blockquotes
        .replace(/^---+$/gm, "")               // horizontal rules
        .replace(/\|/g, "")                    // table pipes
        .replace(/\n{3,}/g, "\n\n")            // collapse excessive newlines
        .trim();
}

/** Escape XML special chars for SSML */
function escapeSSML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

async function main() {
    let input = "";
    for await (const chunk of process.stdin) {
        input += chunk;
    }

    const { text } = JSON.parse(input);
    if (!text) {
        process.stderr.write("Missing text input\n");
        process.exit(1);
    }

    // Strip markdown → truncate → escape for SSML
    const cleanText = escapeSSML(stripMarkdown(text).slice(0, 3000));

    const tts = new MsEdgeTTS();
    await tts.setMetadata("en-US-JennyNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(cleanText);

    const chunks = [];
    audioStream.on("data", (chunk) => chunks.push(chunk));

    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("TTS timeout after 50s")), 50000);
        audioStream.on("end", () => { clearTimeout(timeout); resolve(); });
        audioStream.on("error", (err) => { clearTimeout(timeout); reject(err); });
    });

    const buffer = Buffer.concat(chunks);
    if (buffer.length === 0) {
        process.stderr.write("TTS returned 0 bytes\n");
        process.exit(1);
    }

    const tmpFile = path.join("/tmp", `tts-${crypto.randomUUID()}.mp3`);
    fs.writeFileSync(tmpFile, buffer);

    process.stdout.write(JSON.stringify({ file: tmpFile, size: buffer.length }));
}

main().catch((err) => {
    process.stderr.write(err.message + "\n");
    process.exit(1);
});
