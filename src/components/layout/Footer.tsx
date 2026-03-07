"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function Footer() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const githubUrl = "https://github.com/ShyamAlancode/Omni-Procure";

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        e.preventDefault();
        if (href.startsWith("#")) {
            const targetId = href.substring(1);
            const elem = document.getElementById(targetId);
            if (elem) {
                elem.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <footer className="w-full bg-[#0A0A0A] border-t border-white/10 text-white pt-16 pb-8 relative overflow-hidden">
            {/* Subtle glow effect behind footer */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-64 bg-[#3b82f6]/5 blur-[120px] rounded-[100%] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12 border-b border-white/10 pb-12">

                    {/* Logo & Tagline (Left) */}
                    <div className="col-span-1 md:col-span-2 flex flex-col">
                        <Link href="/" className="flex items-center gap-2 mb-4 w-max" onClick={(e) => handleSmoothScroll(e, "#top")}>
                            <div className="w-8 h-8 rounded bg-[#3b82f6] flex items-center justify-center text-white font-bold">
                                O
                            </div>
                            <span className="font-bold text-xl tracking-tight">OmniProcure</span>
                        </Link>
                        <p className="text-white/50 text-sm max-w-sm mb-6 leading-relaxed">
                            Autonomous, multi-agent supply chain orchestration. Powered by Amazon Nova 2 and AWS Strands for zero-bottleneck execution.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href={githubUrl} target="_blank" className="text-white/40 hover:text-white transition-colors">
                                <Github size={20} />
                            </Link>
                            <Link href="#" className="text-white/40 hover:text-[#1DA1F2] transition-colors">
                                <Twitter size={20} />
                            </Link>
                            <Link href="#" className="text-white/40 hover:text-[#0A66C2] transition-colors">
                                <Linkedin size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Links Column 1 Center */}
                    <div className="col-span-1 flex flex-col space-y-3">
                        <h4 className="text-white font-semibold mb-2">Product</h4>
                        <Link href="#features" onClick={(e) => handleSmoothScroll(e, "#features")} className="text-white/50 hover:text-[#3b82f6] text-sm transition-colors w-max">Features</Link>
                        <Link href="#pipeline" onClick={(e) => handleSmoothScroll(e, "#pipeline")} className="text-white/50 hover:text-[#3b82f6] text-sm transition-colors w-max">Agent Pipeline</Link>
                        <Link href="#platform" onClick={(e) => handleSmoothScroll(e, "#platform")} className="text-white/50 hover:text-[#3b82f6] text-sm transition-colors w-max">Command Center</Link>
                        <Link href="#techstack" onClick={(e) => handleSmoothScroll(e, "#techstack")} className="text-white/50 hover:text-[#3b82f6] text-sm transition-colors w-max">Architecture</Link>
                    </div>

                    {/* Links Column 2 Right */}
                    <div className="col-span-1 flex flex-col space-y-3">
                        <h4 className="text-white font-semibold mb-2">Resources</h4>
                        <Link href={githubUrl} target="_blank" className="text-white/50 hover:text-white text-sm transition-colors w-max">GitHub Repository</Link>
                        <Link href="https://aws.amazon.com/bedrock/nova/" target="_blank" className="text-white/50 hover:text-[#FF9900] text-sm transition-colors w-max flex items-center gap-1">Amazon Nova 2 <span className="text-[10px] ml-1 bg-white/10 px-1 py-0.5 rounded">EXT</span></Link>
                        <Link href="#" className="text-white/50 hover:text-white text-sm transition-colors w-max">API Documentation</Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between text-xs text-white/40">
                    <p>© {new Date().getFullYear()} OmniProcure. Built for AWS Nova Hackathon.</p>

                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <p>Powered by <span className="text-[#FF9900] font-medium">AWS</span></p>
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="flex items-center gap-2 hover:text-white transition-colors border border-white/10 rounded-full px-3 py-1 bg-white/5"
                        >
                            {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
                            <span>{theme === "dark" ? "Dark Theme" : "Light Theme"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
