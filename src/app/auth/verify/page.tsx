"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmSignUp, resendSignUpCode } from "@/lib/auth";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") || "";

    const [email, setEmail] = useState(emailParam);
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (emailParam) setEmail(emailParam);
    }, [emailParam]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !code) {
            setError("Please provide both email and the 6-digit confirmation code.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            await confirmSignUp(email, code);
            setSuccessMsg("Identity verified successfully! Redirecting...");
            setTimeout(() => {
                router.push("/auth/login?verified=true");
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Invalid verification code.");
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError("Please enter your email to resend the code.");
            return;
        }

        setIsResending(true);
        setError(null);
        setSuccessMsg(null);

        try {
            await resendSignUpCode(email);
            setSuccessMsg("A new verification code has been dispatched to your email.");
        } catch (err: any) {
            setError(err.message || "Failed to resend code.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <AnimatedSection className="w-full max-w-md relative z-10">
            <div className="mb-6">
                <Link href="/auth/register" className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Registration
                </Link>
            </div>

            <GlassCard className="p-8 sm:p-10 bg-black/60 shadow-2xl border-white/5">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Identity Verification</h1>
                <p className="text-white/60 mb-6 max-w-[300px]">A 6-digit security code has been dispatched to your email for verification.</p>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-green-400 text-sm leading-relaxed">{successMsg}</p>
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Corporate Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading || isResending}
                            required
                            className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all font-mono text-sm disabled:opacity-50"
                            placeholder="name@company.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">6-Digit Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            disabled={isLoading || isResending}
                            required
                            maxLength={6}
                            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-center placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all font-mono text-2xl tracking-[0.5em] disabled:opacity-50"
                            placeholder="000000"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || code.length < 6}
                        className="w-full h-12 mt-4 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Confirm Identity"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <button
                        onClick={handleResend}
                        disabled={isLoading || isResending}
                        className="text-white/50 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center w-full"
                    >
                        {isResending ? (
                            <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Transmitting...</>
                        ) : (
                            "Resend Verification Code"
                        )}
                    </button>
                </div>
            </GlassCard>
        </AnimatedSection>
    );
}

export default function VerifyPage() {
    return (
        <div
            className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 py-20"
            style={{ boxShadow: 'inset 0 150px 100px -50px #0A0A0A, inset 0 -150px 100px -50px #0A0A0A' }}
        >
            {/* Suspense wrapper is required by Next.js when using useSearchParams in App Router components */}
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center w-full max-w-md h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
                </div>
            }>
                <VerifyContent />
            </Suspense>
        </div>
    );
}
