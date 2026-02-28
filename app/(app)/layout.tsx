import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/sidebar-nav";
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
        <div className="flex h-screen bg-background overflow-hidden">
            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-card">
                {/* Logo */}
                <div className="flex items-center gap-2.5 h-14 px-5 border-b border-border">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
                        <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                            />
                        </svg>
                    </div>
                    <span className="font-semibold text-foreground tracking-tight">
                        Grasp
                    </span>
                </div>

                {/* Nav links */}
                <div className="flex-1 py-4 overflow-y-auto">
                    <SidebarNav />
                </div>

                {/* User section at bottom */}
                <div className="border-t border-border px-4 py-3">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
            </aside>

            {/* ── Right column ─────────────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-card shrink-0">
                    {/* Mobile: show logo (sidebar is hidden) */}
                    <div className="flex items-center gap-2 md:hidden">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
                            <svg
                                className="w-3.5 h-3.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                                />
                            </svg>
                        </div>
                        <span className="font-semibold text-sm">Grasp</span>
                    </div>

                    {/* Desktop: empty left side (page title comes from each page) */}
                    <div className="hidden md:block" />

                    {/* Sign out */}
                    <form action={signOut}>
                        <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Sign out
                        </Button>
                    </form>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
