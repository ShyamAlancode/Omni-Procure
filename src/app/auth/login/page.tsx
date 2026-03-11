"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getCurrentUser } from "@/lib/auth";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check for existing session on mount
    useEffect(() => {
        async function checkSession() {
            const user = await getCurrentUser();
            if (user) {
                router.push("/dashboard");
            }
        }
        checkSession();
    }, [router]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn(email, password);
            // Give a tiny delay for AWS Amplify cookies / localstorage to sync
            setTimeout(() => {
                router.push("/dashboard");
            }, 300);
        } catch (err: any) {
            setError(err.message || "Invalid credentials. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4"
            style={{ boxShadow: 'inset 0 150px 100px -50px #0A0A0A, inset 0 -150px 100px -50px #0A0A0A' }}
        >
            <AnimatedSection className="w-full max-w-md relative z-10">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </div>

                <GlassCard className="p-8 sm:p-10 bg-black/60 shadow-2xl border-white/5">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Access Workspace</h1>
                    <p className="text-white/60 mb-8 max-w-[280px]">Sign in to orchestrate your autonomous enterprise procurement.</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSignIn} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Corporate Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all font-mono text-sm disabled:opacity-50"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-white/80">Password</label>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all font-mono text-lg disabled:opacity-50"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 mt-4 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-wait border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Authenticating Phase...
                                </>
                            ) : (
                                "Sign In Securely"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center text-sm text-white/60">
                        Don't have an enterprise account?{" "}
                        <Link href="/auth/register" className="text-[#3b82f6] hover:text-blue-400 font-medium transition-colors ml-1">
                            Initialize Access
                        </Link>
                    </div>
                </GlassCard>
            </AnimatedSection>
        </div>
    );
}
