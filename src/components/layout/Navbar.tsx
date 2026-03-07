"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Github, Moon, Sun } from "lucide-react";
import { sendToast } from "@/components/ui/ToasterProvider";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [activeSection, setActiveSection] = useState("");

    const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL || "http://localhost:8501";
    const githubUrl = "https://github.com/ShyamAlancode/Omni-Procure";

    const navLinks = [
        { name: "Capabilities", href: "#features" },
        { name: "Platform", href: "#platform" },
        { name: "Pipeline", href: "#pipeline" },
        { name: "Architecture", href: "#techstack" },
    ];

    // Handle scroll events
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            const sections = navLinks.map((link) => link.href.substring(1));
            let currentSection = "";

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        currentSection = section;
                        break;
                    }
                }
            }
            setActiveSection(currentSection);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        e.preventDefault();
        if (href.startsWith("#")) {
            const targetId = href.substring(1);
            const elem = document.getElementById(targetId);
            if (elem) {
                elem.scrollIntoView({ behavior: "smooth" });
            }
            setMobileMenuOpen(false);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
                : "bg-transparent border-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* Logo Left */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2 group" onClick={(e) => handleSmoothScroll(e, "#top")}>
                            {/* Replace with actual image later if needed */}
                            <div className="w-8 h-8 rounded bg-[#3b82f6] flex items-center justify-center text-white font-bold group-hover:bg-blue-400 transition-colors">
                                O
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white group-hover:text-blue-200 transition-colors">
                                OmniProcure
                            </span>
                        </Link>
                    </div>

                    {/* Nav Links Center */}
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
                        <div className="flex space-x-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-inner">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => handleSmoothScroll(e, link.href)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 relative ${activeSection === link.href.substring(1)
                                        ? "text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {activeSection === link.href.substring(1) && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white/10 rounded-full"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* CTA Right */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <Link
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-white/20 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 hover:border-white/40 transition-all flex items-center gap-2"
                        >
                            <Github size={16} />
                            GitHub
                        </Link>

                        <Link
                            href={demoUrl}
                            onClick={() => sendToast("Initializing OmniProcure Demo Environment...")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative px-5 py-2 rounded-lg text-sm font-bold text-white overflow-hidden group border border-[#3b82f6]/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all bg-[#3b82f6]/20"
                        >
                            {/* Glow Pulse */}
                            <div className="absolute inset-0 bg-[#3b82f6] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                            <span className="relative z-10">Launch Demo</span>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="text-white/60"
                        >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-white p-2"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden overflow-hidden bg-[#0A0A0A] border-b border-white/10"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => handleSmoothScroll(e, link.href)}
                                    className={`block px-3 py-3 rounded-md text-base font-medium ${activeSection === link.href.substring(1)
                                        ? "bg-[#3b82f6]/10 text-[#3b82f6]"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-6 pt-6 border-t border-white/10 space-y-4 flex flex-col">
                                <Link
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-white/20 rounded-md text-base font-medium text-white hover:bg-white/5"
                                >
                                    <Github size={18} />
                                    View GitHub
                                </Link>
                                <Link
                                    href={demoUrl}
                                    onClick={() => sendToast("Initializing OmniProcure Demo Environment...")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full px-4 py-3 rounded-md text-base font-bold text-white bg-gradient-to-r from-[#3b82f6] to-purple-600 shadow-lg"
                                >
                                    Launch Demo
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
