'use client';

import React from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { PackageSearch, ShieldCheck, Activity, Cpu, UserCheck } from 'lucide-react';
import dynamic from "next/dynamic";

const RadialOrbitalTimeline = dynamic(
    () => import('@/components/ui/radial-orbital-timeline'),
    { ssr: false }
);

const agentTimelineData = [
    {
        id: 1,
        title: "Natural Language Request",
        date: "Phase 1",
        content: "User types procurement need. Syntactic and semantic extraction via Amazon Nova 2.",
        category: "Input",
        icon: PackageSearch,
        relatedIds: [2],
        status: "completed" as const,
        energy: 100,
    },
    {
        id: 2,
        title: "ComplianceWorker",
        date: "Phase 2",
        content: "ERP budget validation and supplier verification via MCP (Model Context Protocol).",
        category: "Validation",
        icon: ShieldCheck,
        relatedIds: [1, 3],
        status: "completed" as const,
        energy: 90,
    },
    {
        id: 3,
        title: "CatalogMatcher",
        date: "Phase 3",
        content: "Vision AI product match using Multimodal Embeddings natively through AWS Strands. (0.817 score)",
        category: "Search",
        icon: Activity,
        relatedIds: [2, 4],
        status: "completed" as const,
        energy: 85,
    },
    {
        id: 4,
        title: "ActuateWithRetry",
        date: "Phase 4",
        content: "Nova Act browser automation. Headless navigation across legacy portals.",
        category: "Execution",
        icon: Cpu,
        relatedIds: [3, 5],
        status: "in-progress" as const,
        energy: 60,
    },
    {
        id: 5,
        title: "HITL Approval",
        date: "Phase 5",
        content: "Human confirms visual QA evidence. Order placed securely into source systems.",
        category: "Governance",
        icon: UserCheck,
        relatedIds: [4],
        status: "pending" as const,
        energy: 20,
    },
];

export default function HowItWorks() {
    return (
        <section
            id="pipeline"
            className="relative w-full min-h-screen bg-[#0A0A0A] py-24 overflow-hidden"
            style={{ boxShadow: 'inset 0 150px 100px -50px #0A0A0A' }}
        >
            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/20 to-transparent blur-3xl rounded-full"></div>
            </div>

            <div className="relative z-10 w-full mb-12 flex flex-col items-center">
                <AnimatedSection className="text-center px-4">
                    <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        The 5-node autonomous orchestration pipeline powered by Amazon Nova models.
                    </p>
                </AnimatedSection>
            </div>

            <AnimatedSection delay={0.2} className="w-full relative h-[700px] mt-8">
                <RadialOrbitalTimeline timelineData={agentTimelineData} />
            </AnimatedSection>
        </section>
    );
}
