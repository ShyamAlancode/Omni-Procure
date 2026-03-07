'use client'
import { motion } from 'framer-motion'
import { Zap, Github, ExternalLink } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="border-t border-white/[0.06] px-8 py-12">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                        <Zap size={12} className="text-white" fill="white" />
                    </div>
                    <span className="text-white font-semibold text-sm">OmniProcure</span>
                    <span className="text-zinc-600 text-xs ml-2">v4.0 · Built on Amazon Nova 2</span>
                </div>

                <div className="flex items-center gap-6 text-sm text-zinc-500">
                    <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <Github size={14} /> Source
                    </a>
                    <a href="#" className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <ExternalLink size={14} /> Architecture Docs
                    </a>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium glow-btn transition-colors">
                        Launch Demo
                    </motion.button>
                </div>
            </div>
        </footer>
    )
}
