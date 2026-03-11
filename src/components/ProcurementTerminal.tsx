"use client";

import { useState, FormEvent, useEffect } from "react";
import { Send, Sparkles, Server, Factory, Package, ArrowRight } from "lucide-react";

interface ProcurementTerminalProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

export default function ProcurementTerminal({ onSubmit, isLoading }: ProcurementTerminalProps) {
    const [prompt, setPrompt] = useState("");

    // Rotating hints placeholder effect for that enterprise terminal feel
    const hints = [
        "500 units Lithium Carbonate under $10,000",
        "Industrial sensors for manufacturing line, budget $50k",
        "Server hardware refresh, 20 nodes, under $200k",
        "Heavy duty safety gloves PPE, 100 cases"
    ];
    const [hintIndex, setHintIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setHintIndex(prev => (prev + 1) % hints.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt);
        }
    };

    const chips = [
        { label: "Raw Materials", icon: <Factory className="w-3 h-3" />, query: "100kg Lithium Carbonate (Battery Grade) under $10000" },
        { label: "Electronics", icon: <Server className="w-3 h-3" />, query: "20 Precision IR Temperature Sensors from approved supplier" },
        { label: "PPE Safety", icon: <Package className="w-3 h-3" />, query: "Procure 500 cases of N95 Respirator Masks" }
    ];

    return (
        <div className="w-full flex justify-center items-center h-full px-4 sm:px-8 mt-16 sm:mt-0 lg:mt-32">
            <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Sparkles className="w-3.5 h-3.5" /> Core Engine
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
                        What do you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">procure?</span>
                    </h1>
                    <p className="text-lg text-white/50">
                        Describe your requirements in plain English. The AWS Strands agent swarm will handle compliance, sourcing, and browser automation.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="relative group">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${isLoading ? 'animate-pulse opacity-60' : ''}`}></div>
                    <div className="relative bg-black border border-white/10 rounded-2xl flex items-center p-2 shadow-2xl">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isLoading}
                            placeholder={hints[hintIndex]}
                            className="w-full h-[60px] sm:h-[80px] bg-transparent text-white placeholder:text-white/30 p-4 focus:outline-none resize-none font-medium text-lg leading-relaxed"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="absolute right-3 bottom-3 sm:bottom-4 px-4 py-2 sm:py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span>Orchestrating</span>
                                </>
                            ) : (
                                <>
                                    Execute <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <span className="text-sm text-white/40 mr-2">Quick Starts:</span>
                    {chips.map((chip, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (!isLoading) {
                                    setPrompt(chip.query);
                                }
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
                        >
                            {chip.icon} {chip.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
