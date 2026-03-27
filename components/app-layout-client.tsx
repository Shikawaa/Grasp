"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarImportButton } from "@/components/sidebar-import-button";
import { signOut } from "@/app/actions/auth";

interface AppLayoutClientProps {
    userEmail: string;
    children: React.ReactNode;
}

export function AppLayoutClient({ userEmail, children }: AppLayoutClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    return (
        <div className="flex h-screen bg-[#080914] overflow-hidden">
            {/* ── Desktop sidebar ──────────────────────────────────── */}
            <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-[rgba(79,70,229,0.15)] bg-[#11121F]">
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
                <div className="px-3 pt-4 pb-2">
                    <SidebarImportButton />
                </div>
                <div className="flex-1 py-2 overflow-y-auto">
                    <SidebarNav />
                </div>
                <div className="border-t border-[rgba(79,70,229,0.15)] px-4 py-3">
                    <p className="text-xs text-[#A1A1AA] truncate">{userEmail}</p>
                </div>
            </aside>

            {/* ── Mobile sidebar overlay ────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={closeSidebar}
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col w-60 bg-[#11121F] border-r border-[rgba(79,70,229,0.15)] md:hidden transform transition-transform duration-200 ease-in-out ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-[rgba(79,70,229,0.15)]">
                    <Link href="/" onClick={closeSidebar}>
                        <Image
                            src="/grasp-logo.svg"
                            alt="Grasp"
                            width={32}
                            height={32}
                            priority
                        />
                    </Link>
                    <button
                        onClick={closeSidebar}
                        className="p-1.5 text-[#A1A1AA] hover:text-[#F4F4F5] rounded-md transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="px-3 pt-4 pb-2">
                    <div onClick={closeSidebar}>
                        <SidebarImportButton />
                    </div>
                </div>
                <div className="flex-1 py-2 overflow-y-auto" onClick={closeSidebar}>
                    <SidebarNav />
                </div>
                <div className="border-t border-[rgba(79,70,229,0.15)] px-4 py-3">
                    <p className="text-xs text-[#A1A1AA] truncate">{userEmail}</p>
                </div>
            </aside>

            {/* ── Right column ─────────────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-[rgba(79,70,229,0.15)] bg-[#080914] shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile: hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-1.5 text-[#A1A1AA] hover:text-[#F4F4F5] rounded-md transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        {/* Mobile: logo */}
                        <Link href="/" className="md:hidden">
                            <Image
                                src="/grasp-logo.svg"
                                alt="Grasp"
                                width={28}
                                height={28}
                                priority
                            />
                        </Link>
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
