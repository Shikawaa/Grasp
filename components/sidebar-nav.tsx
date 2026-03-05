"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Library } from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Library", href: "/library", icon: Library },
];

export function SidebarNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <nav className="flex flex-col gap-1 px-3">
            {navItems.map(({ label, href, icon: Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive(href)
                            ? "bg-[rgba(79,70,229,0.15)] text-[#4F46E5]"
                            : "text-[#A1A1AA] hover:bg-[rgba(79,70,229,0.08)] hover:text-[#F4F4F5]"
                    )}
                >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                </Link>
            ))}
        </nav>
    );
}
