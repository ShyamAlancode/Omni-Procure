"use client";

import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { sendToast } from "@/components/ui/ToasterProvider";

export default function CTA() {
    const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL || "http://localhost:8501";
    const githubUrl = "https://github.com"; // User will update this later

    return (
        <section className="w-full py-32 bg-[#0A0A0A] relative overflow-hidden border-t border-white/5">
            {/* Centered Radial Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#3b82f6]/20 via-purple-500/10 to-transparent blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">

                <AnimatedSection className="mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-purple-600 flex items-center justify-center mx-auto shadow-2xl shadow-[#3b82f6]/20 mb-8 border border-white/20">
                        <span className="text-2xl font-bold text-white">O</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">
                        Ready to eliminate <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#3b82f6]">procurement bottlenecks?</span>
                    </h2>

                    <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                        Initialize an OmniProcure workspace and watch Amazon Nova models fulfill a purchase order end-to-end, autonomously.
                    </p>
                </AnimatedSection>

                <AnimatedSection delay={0.2} className="w-full flex w-full flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Link href={demoUrl} onClick={() => sendToast("Deploying Amazon Nova Pipeline...")} target="_blank" className="w-full sm:w-auto">
                        <LiquidButton className="w-full sm:w-auto text-base font-bold tracking-wide h-14 flex items-center justify-center gap-2" variant="default" size="xxl">
                            Launch Demo Environment
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </LiquidButton>
                    </Link>

                    <Link
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-8 h-14 rounded-xl border border-white/20 bg-[#0A0A0A] hover:bg-white/5 text-white font-medium flex items-center justify-center gap-2 transition-all group"
                    >
                        <Github className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                        View on GitHub
                    </Link>
                </AnimatedSection>

                {/* Small subtext */}
                <AnimatedSection delay={0.3} className="mt-8">
                    <p className="text-xs text-white/30 uppercase tracking-widest font-semibold flex flex-col md:flex-row items-center gap-2">
                        <span>Runs locally</span>
                        <span className="hidden md:inline">•</span>
                        <span>No credit card required</span>
                        <span className="hidden md:inline">•</span>
                        <span>Open Source</span>
                    </p>
                </AnimatedSection>
            </div>
        </section>
    );
}
