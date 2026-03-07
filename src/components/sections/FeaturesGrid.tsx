"use client";

import { Network, Shield, ScanEye, MousePointer, UserCheck, ClipboardList } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function FeaturesGrid() {
    const features = [
        {
            title: "Multi-Agent Orchestration",
            description: "Distributed AI workers handling specific nodes of the procurement pipeline simultaneously.",
            icon: Network,
        },
        {
            title: "Budget Guardrails",
            description: "Pre-flight checks against strict ERP budget constraints before any orders execute.",
            icon: Shield,
        },
        {
            title: "Visual Product Matching",
            description: "Multimodal Embeddings map obscure supplier catalogs perfectly to your required spec.",
            icon: ScanEye,
        },
        {
            title: "Browser Automation",
            description: "Amazon Nova Act navigates headless vendor portals and injects cart items automatically.",
            icon: MousePointer,
        },
        {
            title: "Human-in-the-Loop",
            description: "Final visual QA and approval step ensuring complete oversight of automated actions.",
            icon: UserCheck,
        },
        {
            title: "Full Audit Trail",
            description: "Immutable logging of every model reasoning step and system trace for compliance.",
            icon: ClipboardList,
        },
    ];

    return (
        <section id="features" className="w-full py-32 bg-[#0A0A0A] relative overflow-hidden">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
                        Intelligent by Design
                    </h2>
                    <p className="text-lg text-white/60 leading-relaxed">
                        Every module in the OmniProcure pipeline is purpose-built to eliminate
                        friction between intent and execution.
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <AnimatedSection key={idx} delay={idx * 0.1}>
                                {/* 
                  We use an inner group-hover to make the GlassCard border light up 
                  with our primary accent color #3b82f6
                */}
                                <div className="group h-full cursor-default">
                                    <GlassCard className="h-full p-8 transition-colors duration-500 group-hover:border-[#3b82f6]/50">
                                        <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/10 flex items-center justify-center mb-6 border border-[#3b82f6]/20 group-hover:bg-[#3b82f6]/20 group-hover:scale-110 transition-all duration-300">
                                            <Icon className="w-6 h-6 text-[#3b82f6]" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                                            {feature.description}
                                        </p>
                                    </GlassCard>
                                </div>
                            </AnimatedSection>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
