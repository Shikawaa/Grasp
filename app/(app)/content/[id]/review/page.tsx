import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import { FlipCardReview } from "@/components/flip-card-review";

interface Flashcard {
    id: string;
    question: string;
    answer: string;
    status: "new" | "known" | "review";
}

export default async function ReviewPage({
    params,
}: {
    params: { id: string };
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/sign-in");

    // Verify content ownership
    const { data: content } = await supabase
        .from("contents")
        .select("id, title")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

    if (!content) redirect("/dashboard");

    // Fetch only cards that need reviewing
    const { data: flashcardData } = await supabase
        .from("flashcards")
        .select("id, question, answer, status")
        .eq("content_id", params.id)
        .in("status", ["new", "review"])
        .order("created_at", { ascending: true });

    const flashcards = (flashcardData ?? []) as Flashcard[];

    // All cards already known
    if (flashcards.length === 0) {
        return (
            <div className="min-h-screen bg-[#080914] flex flex-col items-center justify-center px-6">
                <Link
                    href={`/content/${params.id}`}
                    className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#A1A1AA] transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to content
                </Link>
                <div className="text-center space-y-4">
                    <p className="text-4xl">🎉</p>
                    <h1 className="text-2xl font-bold text-[#F4F4F5]">All caught up!</h1>
                    <p className="text-[#6B7280] text-sm">All flashcards are marked as known.</p>
                    <Link
                        href={`/content/${params.id}`}
                        className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                    >
                        Back to content
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080914] flex flex-col px-6 py-8">
            {/* Back arrow */}
            <Link
                href={`/content/${params.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#A1A1AA] transition-colors mb-10 self-start"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to content
            </Link>

            {/* Flip card review */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <FlipCardReview contentId={params.id} initialCards={flashcards} />
            </div>
        </div>
    );
}
