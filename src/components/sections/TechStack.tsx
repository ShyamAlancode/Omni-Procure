"use client";

import { Layers, Server, Code2, Database, Workflow, Bot } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function TechStack() {
    const frontendStack = [
        { name: "Next.js 14", desc: "App Router & SSR", icon: Layers },
        { name: "React 19", desc: "UI Components", icon: Code2 },
        { name: "Tailwind v4", desc: "Utility-first CSS", icon: Database },
        { name: "Framer Motion", desc: "Orchestrated Animations", icon: Workflow },
    ];

    const backendStack = [
        { name: "Amazon Nova 2", desc: "Foundation & Vision Models", icon: Bot },
        { name: "AWS Strands", desc: "Agent Orchestration", icon: Server },
        { name: "Nova Act API", desc: "Headless Execution", icon: Layers },
        { name: "Python 3.12", desc: "Microservices & Auth", icon: Code2 },
    ];

    return (
        <section id="techstack" className="w-full py-32 bg-[#050505] border-t border-white/5 relative overflow-hidden">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="flex flex-col md:flex-row gap-16 md:gap-8 justify-between">

                    {/* Section Header (Left Column on Desktop) */}
                    <div className="w-full md:w-1/3 flex flex-col justify-center">
                        <AnimatedSection>
                            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white mb-6">
                                Built on <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#3b82f6]">
                                    Modern Infrastructure.
                                </span>
                            </h2>
                            <p className="text-lg text-white/50 leading-relaxed mb-8">
                                OmniProcure leverages the latest in React rendering alongside Amazon's
                                bleeding-edge Nova agent models to guarantee high availability and scale.
                            </p>
                        </AnimatedSection>
                    </div>

                    {/* Stacks (Right Column on Desktop) */}
                    <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 pl-0 md:pl-12 border-t md:border-t-0 md:border-l border-white/10 pt-12 md:pt-0">

                        {/* Frontend */}
                        <div className="flex flex-col space-y-6">
                            <AnimatedSection delay={0.2}>
                                <h3 className="text-sm font-semibold tracking-widest uppercase text-white/40 mb-2">
                                    Presentation Layer
                                </h3>
                            </AnimatedSection>

                            {frontendStack.map((tech, idx) => {
                                const Icon = tech.icon;
                                return (
                                    <AnimatedSection key={idx} delay={0.2 + (idx * 0.1)}>
                                        <div className="flex items-start gap-4 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors group cursor-default">
                                            <div className="mt-1 w-8 h-8 rounded-md bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                                                <Icon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-white group-hover:text-[#3b82f6] transition-colors">
                                                    {tech.name}
                                                </h4>
                                                <p className="text-sm text-white/40">
                                                    {tech.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </AnimatedSection>
                                );
                            })}
                        </div>

                        {/* Backend / AI */}
                        <div className="flex flex-col space-y-6">
                            <AnimatedSection delay={0.3}>
                                <h3 className="text-sm font-semibold tracking-widest uppercase text-white/40 mb-2">
                                    Intelligence Layer
                                </h3>
                            </AnimatedSection>

                            {backendStack.map((tech, idx) => {
                                const Icon = tech.icon;
                                return (
                                    <AnimatedSection key={idx} delay={0.3 + (idx * 0.1)}>
                                        <div className="flex items-start gap-4 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors group cursor-default">
                                            <div className="mt-1 w-8 h-8 rounded-md bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                                                <Icon className="w-4 h-4 text-[#3b82f6]/60 group-hover:text-[#3b82f6] transition-colors" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-white group-hover:text-[#3b82f6] transition-colors">
                                                    {tech.name}
                                                </h4>
                                                <p className="text-sm text-white/40">
                                                    {tech.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </AnimatedSection>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
