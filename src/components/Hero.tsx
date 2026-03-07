'use client'
import { motion, Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const staggerContainer: Variants = {
    hidden: {}, show: { transition: { staggerChildren: 0.12 } }
}
const staggerItem: Variants = {
    hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
}

export default function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
            {/* Background radial glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
                <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-emerald-600/5 blur-[80px]" />
            </div>

            {/* Grid lines overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
            >
                {/* Badge */}
                <motion.div variants={staggerItem}
                    className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Powered by Amazon Nova 2 + AWS Strands
                </motion.div>

                {/* Headline */}
                <motion.h1 variants={staggerItem}
                    className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
                    style={{ background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Autonomous Enterprise<br />Procurement.
                </motion.h1>

                {/* Subheadline */}
                <motion.p variants={staggerItem}
                    className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-2xl mb-10 font-light">
                    OmniProcure orchestrates compliance, budget verification, and automated supplier
                    actuation in a single AI-driven pipeline — no human bottlenecks.
                </motion.p>

                {/* CTAs */}
                <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="glow-btn flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-200">
                        Initialize Workspace
                        <ArrowRight size={16} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-medium text-sm transition-all duration-200">
                        View Architecture
                    </motion.button>
                </motion.div>

                {/* Stats row */}
                <motion.div variants={staggerItem}
                    className="mt-16 flex flex-col sm:flex-row gap-8 text-center">
                    {[
                        { value: '< 4min', label: 'Full procurement cycle' },
                        { value: '3', label: 'Specialized AI agents' },
                        { value: '0.81', label: 'Catalog match confidence' },
                        { value: '100%', label: 'Budget compliance rate' },
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col gap-1">
                            <span className="text-2xl font-bold text-white">{stat.value}</span>
                            <span className="text-xs text-zinc-500">{stat.label}</span>
                        </div>
                    ))}
                </motion.div>
            </motion.div>
        </section>
    )
}
