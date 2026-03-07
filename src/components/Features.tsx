'use client'
import GlassCard from './ui/GlassCard'
import AnimatedSection from './ui/AnimatedSection'
import { Network, ShieldCheck, ScanEye, Zap } from 'lucide-react'

const features = [
    {
        icon: Network,
        title: 'Intelligent Orchestration',
        description: 'Multi-agent routing with AWS Strands. Orchestrator delegates to specialized workers — ComplianceWorker, CatalogMatcher, and ActuateWithRetry — in a deterministic pipeline.',
        accent: 'blue',
    },
    {
        icon: ShieldCheck,
        title: 'Budget Guardrails',
        description: 'Strict financial compliance at every step. Real-time ERP budget verification against allocated codes before any purchase intent is logged.',
        accent: 'emerald',
    },
    {
        icon: ScanEye,
        title: 'Computer Vision QA',
        description: 'Multimodal catalog matching using Amazon Nova 2. Visual similarity scoring between ERP records and supplier product images before actuation.',
        accent: 'violet',
    },
    {
        icon: Zap,
        title: 'Autonomous Actuation',
        description: 'Nova Act navigates live supplier portals — searching, adding to cart, and confirming orders — entirely hands-free with intelligent retry fallback.',
        accent: 'amber',
    },
]

const accentMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

export default function Features() {
    return (
        <section id="capabilities" className="px-6 py-24 max-w-6xl mx-auto">
            <AnimatedSection className="text-center mb-16">
                <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-3">Core Capabilities</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                    Built for enterprise-grade<br />procurement at scale.
                </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {features.map((f, i) => (
                    <GlassCard key={f.title} delay={i * 0.1}>
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-5 ${accentMap[f.accent]}`}>
                            <f.icon size={18} />
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2 tracking-tight">{f.title}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
                    </GlassCard>
                ))}
            </div>
        </section>
    )
}
