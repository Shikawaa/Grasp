"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            window.location.href = "/dashboard";
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setGoogleLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#080914] px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Image
                        src="/grasp-logo.svg"
                        alt="Grasp"
                        width={96}
                        height={28}
                        priority
                    />
                </div>

                <Card className="shadow-none">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl text-[#F4F4F5]">Sign in</CardTitle>
                        <CardDescription className="text-[#A1A1AA]">
                            Enter your email and password to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Google OAuth */}
                        <Button
                            variant="outline"
                            className="w-full border-[rgba(79,70,229,0.15)] text-[#F4F4F5] hover:border-[rgba(129,140,248,0.4)] hover:bg-[rgba(79,70,229,0.08)]"
                            onClick={handleGoogleSignIn}
                            disabled={googleLoading}
                            type="button"
                        >
                            {googleLoading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#4F46E5] border-t-transparent" />
                            ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )}
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <Separator className="bg-[rgba(79,70,229,0.15)]" />
                            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#11121F] px-2 text-xs text-[#A1A1AA]">
                                or continue with email
                            </span>
                        </div>

                        {/* Email / Password form */}
                        <form onSubmit={handleEmailSignIn} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-[#F4F4F5]">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-[#F4F4F5]">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}

                            <Button type="submit" className="w-full bg-[#4F46E5] hover:bg-[#4338CA]" disabled={loading}>
                                {loading ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : null}
                                Sign in
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <p className="text-sm text-[#A1A1AA] text-center w-full">
                            Don&apos;t have an account?{" "}
                            <Link href="/sign-up" className="text-[#4F46E5] font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
