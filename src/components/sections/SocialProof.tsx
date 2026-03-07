"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useAnimationFrame } from "framer-motion";

export default function SocialProof() {
    const logos = [
        "AWS Bedrock",
        "Amazon Nova 2",
        "AWS Strands",
        "Nova Act API",
        "Next.js 14",
        "Python 3.12",
        "Framer Motion",
        "Tailwind v4",
    ];

    // Repeat logos 3 times to ensure smooth infinite wrap
    const duplicatedLogos = [...logos, ...logos, ...logos];

    return (
        <section
            className="w-full py-16 bg-[#0A0A0A] overflow-hidden flex flex-col items-center relative"
            style={{ boxShadow: 'inset 0 100px 50px -50px #0A0A0A, inset 0 -100px 50px -50px #0A0A0A' }}
        >
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0A0A0A] to-transparent z-10"></div>
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0A0A0A] to-transparent z-10"></div>

            <p className="text-xs font-semibold tracking-[0.2em] text-white/30 uppercase mb-8">
                Built with Silicon Valley standards on enterprise infrastructure
            </p>

            <div className="w-full flex whitespace-nowrap overflow-hidden py-4">
                {/* Infinite Scroll Animation using Framer Motion */}
                <motion.div
                    className="flex items-center gap-16 md:gap-24 pl-16 md:pl-24"
                    animate={{ x: ["0%", "-33.333%"] }}
                    transition={{
                        duration: 30, // 30 seconds for one full translation
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {duplicatedLogos.map((logo, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 text-white/60 hover:text-white transition-colors cursor-default"
                        >
                            <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                {/* Fallback abstract icon since we don't have SVGs for AWS natively here */}
                                <div className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]"></div>
                            </div>
                            <span className="font-bold tracking-tight text-xl">{logo}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
