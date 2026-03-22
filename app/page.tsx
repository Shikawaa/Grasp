import Link from "next/link";
import Image from "next/image";
import {
    FileText,
    Brain,
    Headphones,
    MessageSquare,
    Upload,
    Sparkles,
    GraduationCap,
    ArrowRight,
} from "lucide-react";

const features = [
    {
        icon: FileText,
        title: "Smart Summaries",
        description:
            "AI-generated study notes with clear structure, key takeaways, and bold concepts.",
    },
    {
        icon: Brain,
        title: "Flashcards",
        description:
            "Auto-generated flashcards with spaced repetition to lock knowledge into long-term memory.",
    },
    {
        icon: Headphones,
        title: "Audio Playback",
        description:
            "Listen to your summaries on the go with natural-sounding AI narration.",
    },
    {
        icon: MessageSquare,
        title: "Chat with Content",
        description:
            "Ask questions about any import and get instant, context-aware answers.",
    },
];

const steps = [
    {
        number: "01",
        title: "Import",
        description: "Paste a YouTube link, article URL, or upload a PDF.",
    },
    {
        number: "02",
        title: "Generate",
        description: "AI creates a structured summary, flashcards, and audio in seconds.",
    },
    {
        number: "03",
        title: "Learn",
        description: "Review, listen, chat, and retain — all in one place.",
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#080914] text-[#F4F4F5] overflow-x-hidden">
            {/* ── Navbar ──────────────────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#080914]/80 border-b border-[rgba(79,70,229,0.1)]">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image
                            src="/grasp-logo.svg"
                            alt="Grasp"
                            width={28}
                            height={28}
                            priority
                        />
                        <span className="text-lg font-bold tracking-tight">Grasp</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/sign-in"
                            className="text-sm text-[#A1A1AA] hover:text-white transition-colors px-3 py-2"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/sign-up"
                            className="text-sm font-medium bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Get started free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Hero ────────────────────────────────────────────── */}
            <section className="relative pt-32 pb-32 px-6">
                {/* Radial glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.15)_0%,transparent_70%)]" />
                </div>

                <div className="relative max-w-3xl mx-auto text-center space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(79,70,229,0.25)] bg-[rgba(79,70,229,0.08)] text-sm text-[#A1A1AA]">
                        <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                        AI-Powered Learning
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                        Turn any content into{" "}
                        <span className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">
                            knowledge
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
                        Import any YouTube video, article, or PDF. Get an AI-generated
                        summary, flashcards, and audio — ready to learn in 30 seconds.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <Link
                            href="/sign-up"
                            className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium px-6 py-3 rounded-lg text-base transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]"
                        >
                            Import your first content
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/sign-in"
                            className="text-sm text-[#A1A1AA] hover:text-white transition-colors px-4 py-3"
                        >
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Features ────────────────────────────────────────── */}
            <section className="relative py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-xs font-mono uppercase tracking-[0.15em] text-[#4F46E5] mb-3">
                            Features
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Everything you need to learn faster
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="group rounded-2xl border border-[rgba(79,70,229,0.12)] bg-[#11121F] p-6 transition-all hover:border-[rgba(129,140,248,0.35)] hover:shadow-[0_0_30px_rgba(79,70,229,0.08)]"
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[rgba(79,70,229,0.1)] text-[#4F46E5] mb-4">
                                    <f.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-semibold mb-2 group-hover:text-white transition-colors">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                                    {f.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it Works ─────────────────────────────────────── */}
            <section className="relative py-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-xs font-mono uppercase tracking-[0.15em] text-[#4F46E5] mb-3">
                            How it works
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            From content to knowledge in 3 steps
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Dashed connector — spans from center of col-1 circle to center of col-3 circle */}
                        <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] border-t-2 border-dashed border-[rgba(79,70,229,0.3)] pointer-events-none" />

                        {steps.map((s) => (
                            <div key={s.number} className="relative text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#11121F] border-2 border-[rgba(79,70,229,0.3)] text-[#4F46E5] font-bold text-sm mb-5 relative z-10">
                                    {s.number}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                                <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-xs mx-auto">
                                    {s.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ──────────────────────────────────────── */}
            <section className="relative py-28 px-6">
                {/* Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.12)_0%,transparent_65%)]" />
                </div>

                <div className="relative max-w-2xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Stop consuming.{" "}
                        <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                            Start learning.
                        </span>
                    </h2>
                    <p className="text-[#A1A1AA] text-lg">
                        Join Grasp and turn your favorite content into lasting knowledge.
                    </p>
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium px-7 py-3.5 rounded-lg text-base transition-all hover:shadow-[0_0_40px_rgba(79,70,229,0.35)]"
                    >
                        Get started — it&apos;s free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* ── Footer ──────────────────────────────────────────── */}
            <footer className="border-t border-[rgba(79,70,229,0.1)] py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                        <Image
                            src="/grasp-logo.svg"
                            alt="Grasp"
                            width={20}
                            height={20}
                        />
                        Grasp &copy; {new Date().getFullYear()}
                    </div>
                    <p className="text-sm text-[#A1A1AA]">
                        Made with ❤️ to learn better
                    </p>
                </div>
            </footer>
        </div>
    );
}
