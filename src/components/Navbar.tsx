'use client'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function Navbar() {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/[0.06] backdrop-blur-xl bg-black/40"
        >
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Zap size={14} className="text-white" fill="white" />
                </div>
                <span className="text-white font-semibold text-sm tracking-tight">OmniProcure</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
                {['Capabilities', 'Pipeline', 'Architecture'].map((item) => (
                    <a key={item} href={`#${item.toLowerCase()}`}
                        className="hover:text-white transition-colors duration-200">
                        {item}
                    </a>
                ))}
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glow-btn px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors duration-200"
            >
                Launch Demo
            </motion.button>
        </motion.nav>
    )
}
