"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, ChevronDown, CheckCircle2, Shield, Zap, Search } from "lucide-react";
import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { sendToast } from "@/components/ui/ToasterProvider";

// MUST dynamically import WebGL to prevent Next.js SSR crashes (User Constraint #2)
const WebGLShader = dynamic(
    () => import("@/components/ui/web-gl-shader").then((mod) => mod.WebGLShader),
    { ssr: false }
);

export default function Hero() {
    const words = ["Zero Bottlenecks.", "Ships in 4 Minutes.", "Autonomous Procurement."];
    const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL || "http://localhost:8501";

    const handleScrollToPipeline = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        const elem = document.getElementById("pipeline");
        if (elem) elem.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section
            id="top"
            className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] overflow-hidden pt-20"
            style={{ boxShadow: 'inset 0 -150px 100px -50px #0A0A0A' }}
        >
            {/* Dynamic Interactive Shader Background */}
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                <WebGLShader />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

                <AnimatedSection delay={0.1}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                        <div className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse"></div>
                        <span className="text-xs font-medium text-white/80">
                            Powered by Amazon Nova 2 · AWS Strands
                        </span>
                    </div>
                </AnimatedSection>

                <AnimatedSection delay={0.2} className="w-full">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                        <span className="block mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Enterprise Supply Chain</span>
                        <AnimatedTextCycle words={words} className="text-[#3b82f6] min-h-[80px]" />
                    </h1>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 mb-10 leading-relaxed">
                        Replace manual catalog searches and disjointed ERP approvals with a unified, agent-driven orchestration layer. Secure, accurate, and autonomous.
                    </p>
                </AnimatedSection>

                <AnimatedSection delay={0.4} className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Link href={demoUrl} target="_blank" onClick={() => sendToast("Booting Amazon Nova 2 Workspace...")} className="w-full sm:w-auto">
                        <LiquidButton className="w-full sm:w-auto text-sm font-bold tracking-wide h-12 flex items-center justify-center gap-2" variant="default" size="xl">
                            Initialize Workspace
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </LiquidButton>
                    </Link>

                    <Link
                        href="#pipeline"
                        onClick={handleScrollToPipeline}
                        className="w-full sm:w-auto px-8 h-12 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-2 transition-all backdrop-blur-md"
                    >
                        View Architecture
                        <ChevronDown className="w-4 h-4 text-white/50" />
                    </Link>
                </AnimatedSection>

                {/* Hero Bottom Stats Grid */}
                <AnimatedSection delay={0.5} className="w-full max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-8 border-t border-white/10">
                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                            <Zap className="w-5 h-5 text-yellow-400 mb-2" />
                            <p className="text-2xl font-bold text-white tracking-tight">&lt;4 min</p>
                            <p className="text-xs text-white/50 font-medium">Cycle Time</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                            <Search className="w-5 h-5 text-blue-400 mb-2" />
                            <p className="text-2xl font-bold text-white tracking-tight">0.817</p>
                            <p className="text-xs text-white/50 font-medium">Confidence Score</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                            <Shield className="w-5 h-5 text-green-400 mb-2" />
                            <p className="text-2xl font-bold text-white tracking-tight">100%</p>
                            <p className="text-xs text-white/50 font-medium">Budget Compliance</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                            <CheckCircle2 className="w-5 h-5 text-purple-400 mb-2" />
                            <p className="text-2xl font-bold text-white tracking-tight">3+</p>
                            <p className="text-xs text-white/50 font-medium">AI Agents Linked</p>
                        </div>
                    </div>
                </AnimatedSection>

            </div>
        </section>
    );
}
