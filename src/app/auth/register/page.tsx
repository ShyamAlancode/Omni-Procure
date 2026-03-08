"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Password strength logic
    const passwordStrength = useMemo(() => {
        let score = 0;
        if (!password) return score;
        if (password.length >= 8) score += 1; // Length rule
        if (/[A-Z]/.test(password)) score += 1; // Uppercase rule
        if (/[0-9]/.test(password)) score += 1; // Number rule
        if (/[^A-Za-z0-9]/.test(password)) score += 1; // Symbol rule
        return score; // Max 4
    }, [password]);

    const getStrengthColor = (score: number) => {
        switch (score) {
            case 0: return 'bg-white/10';
            case 1: return 'bg-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
            case 2: return 'bg-orange-500 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
            case 3: return 'bg-yellow-400 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]';
            case 4: return 'bg-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
            default: return 'bg-white/10';
        }
    };

    const getStrengthLabel = (score: number) => {
        switch (score) {
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            default: return '';
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Initial validations
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill out all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (passwordStrength < 3) {
            setError("Password is too weak. Please include at least 8 characters, numbers, and uppercase letters.");
            return;
        }

        setIsLoading(true);

        try {
            await signUp(name, email, password);
            // Success, route to OTP verification and push the email to the query string
            router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(err.message || "Failed to create account. Please contact support.");
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 py-20"
            style={{ boxShadow: 'inset 0 150px 100px -50px #0A0A0A, inset 0 -150px 100px -50px #0A0A0A' }}
        >
            <AnimatedSection className="w-full max-w-md relative z-10">
                <div className="mb-6">
                    <Link href="/auth/login" className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Sign In
                    </Link>
                </div>

                <GlassCard className="p-8 sm:p-10 bg-black/60 shadow-2xl border-white/5">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">System Registry</h1>
                    <p className="text-white/60 mb-6 max-w-[300px]">Create an administrative account to deploy autonomous agents.</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                required
                                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all font-mono text-sm disabled:opacity-50"
                                placeholder="First Last"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Corporate Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all font-mono text-sm disabled:opacity-50"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Security Key (Password)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all font-mono text-lg disabled:opacity-50"
                                placeholder="••••••••"
                            />
                            {/* Password Strength Indicator */}
                            {password.length > 0 && (
                                <div className="pt-2">
                                    <div className="flex gap-1.5 h-1.5 w-full bg-transparent">
                                        {[1, 2, 3, 4].map((index) => (
                                            <div
                                                key={index}
                                                className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength >= index ? getStrengthColor(passwordStrength) : 'bg-white/10'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className={`text-[10px] uppercase tracking-wider font-bold mt-2 text-right ${getStrengthColor(passwordStrength).replace('bg-', 'text-').split(' ')[0]}`}>
                                        {getStrengthLabel(passwordStrength)}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 pt-1">
                            <label className="text-sm font-medium text-white/80">Confirm Security Key</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                className={`w-full h-11 px-4 rounded-xl bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:ring-1 transition-all font-mono text-lg disabled:opacity-50 ${confirmPassword && password !== confirmPassword
                                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50"
                                        : "border-white/10 focus:border-[#3b82f6]/50 focus:ring-[#3b82f6]/50"
                                    }`}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || passwordStrength < 3 || password !== confirmPassword}
                            className="w-full h-12 mt-4 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Identity...
                                </>
                            ) : (
                                "Deploy Account"
                            )}
                        </button>
                    </form>
                </GlassCard>
            </AnimatedSection>
        </div>
    );
}
