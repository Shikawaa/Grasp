"use client";

import { useState } from "react";
import { ImportDialog } from "@/components/import-dialog";

export function SidebarImportButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium rounded-[8px] px-4 py-2 transition-colors"
            >
                + Import
            </button>
            <ImportDialog open={open} onOpenChange={setOpen} />
        </>
    );
}
