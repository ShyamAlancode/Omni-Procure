"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";

// Helper component for count up effect using Framer Motion
// In a production app you might use a dedicated library like react-countup,
// but we can achieve a simple CSS animation or just static display with delayed fade-in
// if we want to minimize client dependencies. We'll use a static approach that fades in
// elegantly to ensure perfect performance during the hackathon.

interface MetricCardProps {
    value: string;
    label: string;
    delay: number;
}

const MetricCard = ({ value, label, delay }: MetricCardProps) => {
    return (
        <AnimatedSection delay={delay} className="relative group">
            <div className="flex flex-col items-center justify-center p-8 bg-[#0A0A0A] rounded-2xl border border-white/5 relative z-10 overflow-hidden text-center h-full">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-[#3b82f6]/0 group-hover:bg-[#3b82f6]/5 transition-colors duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-[#3b82f6]/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>

                <h3 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#3b82f6]/80 mb-4 tracking-tighter">
                    {value}
                </h3>
                <p className="text-sm md:text-base font-medium text-white/50 tracking-wide uppercase">
                    {label}
                </p>
            </div>
        </AnimatedSection>
    );
};

export default function Metrics() {
    const metrics = [
        { value: "68%", label: "Reduction in procurement time" },
        { value: "<4m", label: "Full orchestration cycle" },
        { value: ".817", label: "Catalog match confidence" },
        { value: "100%", label: "Budget compliance rate" }
    ];

    return (
        <section className="w-full py-32 bg-[#050505] relative overflow-hidden border-t border-white/5">
            {/* Background Glow Accents */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-[#3b82f6]/10 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <AnimatedSection className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
                        Proven at Scale
                    </h2>
                    <p className="text-lg text-white/60 leading-relaxed">
                        Enterprise procurement teams recover thousands of hours previously lost to manual verification, catalog matching, and endless approval chains.
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, idx) => (
                        <MetricCard
                            key={idx}
                            value={metric.value}
                            label={metric.label}
                            delay={0.2 + (idx * 0.1)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
