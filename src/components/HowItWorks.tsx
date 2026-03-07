'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import AnimatedSection from './ui/AnimatedSection'
import { FileSearch, ShieldCheck, ScanEye, MousePointerClick, UserCheck } from 'lucide-react'

const steps = [
    { icon: FileSearch, label: 'Request', desc: 'Natural language procurement query submitted to Orchestrator', color: '#3b82f6' },
    { icon: ShieldCheck, label: 'Compliance', desc: 'ComplianceWorker validates suppliers, retrieves ERP pricing, verifies budget', color: '#10b981' },
    { icon: ScanEye, label: 'Matching', desc: 'CatalogMatcher computes visual similarity score via Nova 2 multimodal', color: '#8b5cf6' },
    { icon: MousePointerClick, label: 'Actuation', desc: 'Nova Act navigates supplier portals, places order autonomously', color: '#f59e0b' },
    { icon: UserCheck, label: 'Review', desc: 'HITL approval gate — human confirms before purchase intent is logged', color: '#ef4444' },
]

export default function HowItWorks() {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.2'] })
    const lineScaleX = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

    return (
        <section id="pipeline" className="px-6 py-24 max-w-6xl mx-auto" ref={ref}>
            <AnimatedSection className="text-center mb-20">
                <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-3">Pipeline</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                    Five steps. Zero<br />human bottlenecks.
                </h2>
            </AnimatedSection>

            <div className="relative">
                {/* Connector line background */}
                <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px bg-white/5" />

                {/* Animated progress line */}
                <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-amber-500 origin-left"
                        style={{ scaleX: lineScaleX, transformOrigin: 'left center' }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.label}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className="flex flex-col items-center text-center"
                        >
                            {/* Node circle */}
                            <div className="relative mb-6 z-10">
                                <div className="w-20 h-20 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl flex items-center justify-center"
                                    style={{ boxShadow: `0 0 20px ${step.color}22` }}>
                                    <step.icon size={22} style={{ color: step.color }} />
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] text-zinc-400 font-mono">
                                    {i + 1}
                                </div>
                            </div>
                            <p className="text-white font-semibold text-sm mb-2">{step.label}</p>
                            <p className="text-zinc-500 text-xs leading-relaxed">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
