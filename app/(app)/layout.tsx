import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppLayoutClient } from "@/components/app-layout-client";

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
        <AppLayoutClient userEmail={user.email ?? ""}>
            {children}
        </AppLayoutClient>
    );
}
