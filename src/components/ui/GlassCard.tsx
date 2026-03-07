'use client'
import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface Props {
    children: ReactNode
    className?: string
    delay?: number
}

export default function GlassCard({ children, className = '', delay = 0 }: Props) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 transition-all duration-300 ${className}`}
            style={{
                background: isHovered
                    ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0.04) 60%)`
                    : 'rgba(255,255,255,0.04)',
                boxShadow: isHovered ? '0 0 30px rgba(59,130,246,0.15), inset 0 0 30px rgba(59,130,246,0.05)' : 'none',
                borderColor: isHovered ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)',
            }}
        >
            {children}
        </motion.div>
    )
}
