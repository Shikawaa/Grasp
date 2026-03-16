import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarImportButton } from "@/components/sidebar-import-button";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="flex h-screen bg-[#080914] overflow-hidden">
            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-[rgba(79,70,229,0.15)] bg-[#11121F]">
                {/* Logo */}
                <div className="flex items-center h-16 px-4 border-b border-[rgba(79,70,229,0.15)]">
                    <Link href="/" className="mx-auto">
                        <Image
                            src="/grasp-logo.svg"
                            alt="Grasp — go to Dashboard"
                            width={32}
                            height={32}
                            priority
                        />
                    </Link>
                </div>

                {/* + Import button — just below logo */}
                <div className="px-3 pt-4 pb-2">
                    <SidebarImportButton />
                </div>

                {/* Nav links */}
                <div className="flex-1 py-2 overflow-y-auto">
                    <SidebarNav />
                </div>

                {/* User section at bottom */}
                <div className="border-t border-[rgba(79,70,229,0.15)] px-4 py-3">
                    <p className="text-xs text-[#A1A1AA] truncate">{user.email}</p>
                </div>

            </aside>

            {/* ── Right column ─────────────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between h-16 px-6 border-b border-[rgba(79,70,229,0.15)] bg-[#080914] shrink-0">
                    {/* Mobile: show logo */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Image
                            src="/grasp-logo.svg"
                            alt="Grasp"
                            width={32}
                            height={32}
                            priority
                        />
                    </div>
                    <div className="hidden md:block" />
                    {/* Sign out */}
                    <form action={signOut}>
                        <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-[#A1A1AA] hover:text-[#F4F4F5]"
                        >
                            Sign out
                        </Button>
                    </form>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto min-h-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
