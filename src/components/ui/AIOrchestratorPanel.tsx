"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Send, Bot, Loader2, Workflow, ShieldCheck, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

type TraceLog = {
    agent: string;
    status: string;
    details: string;
};

export default function AIOrchestratorPanel() {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [traces, setTraces] = useState<TraceLog[]>([]);
    const [finalResult, setFinalResult] = useState<any>(null);
    const [isApproved, setIsApproved] = useState(false);

    const handleApprove = () => {
        // Mock pushing to the local orders system
        if (typeof window !== 'undefined') {
            const existingOrders = JSON.parse(localStorage.getItem('omniprocure_orders') || '[]');
            const newOrder = {
                id: `PO-${Math.floor(Math.random() * 10000)}`,
                item: "Industrial Adhesive (500 units)",
                counterparty: "PrestaShop Demo Supplier",
                date: new Date().toISOString().split('T')[0],
                status: "Confirmed",
                action: "View Invoice"
            };
            localStorage.setItem('omniprocure_orders', JSON.stringify([newOrder, ...existingOrders]));

            // Dispatch custom event to trigger updates in the rest of the Dashboard if needed
            window.dispatchEvent(new Event('storage'));
        }
        setIsApproved(true);
    };

    const handleExecute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setTraces([]);
        setFinalResult(null);
        setIsApproved(false);

        try {
            // First trace line to show immediate action
            setTraces(prev => [...prev, { agent: "Orchestrator", status: "Initializing", details: "Evaluating prompt intent..." }]);

            // Connect to FastAPI WebSocket
            const ws = new WebSocket("ws://localhost:8000/ws/agent-stream");

            ws.onopen = () => {
                // Send the prompt to begin the orchestration
                ws.send(prompt);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.status === "AWAITING_HUMAN_APPROVAL") {
                        setFinalResult({
                            status: "AWAITING_HUMAN_APPROVAL",
                            final_recommendation: data.details
                        });
                        setIsLoading(false);
                        ws.close();
                    } else {
                        // Regular trace
                        setTraces(prev => [...prev, data]);
                    }
                } catch (err) {
                    console.error("Failed to parse WS message", err);
                }
            };

            ws.onerror = (error) => {
                setTraces(prev => [...prev, { agent: "System Error", status: "Failed", details: "WebSocket connection dropped. Is FastAPI running?" }]);
                setIsLoading(false);
            };

            ws.onclose = () => {
                setIsLoading(false);
            };

        } catch (err: any) {
            setTraces(prev => [...prev, { agent: "System Error", status: "Failed", details: err.message || "Failed to initialize WebSocket" }]);
            setIsLoading(false);
        }
    };

    const getAgentIcon = (agentName: string) => {
        if (agentName.includes("Orchestrator")) return <Bot className="w-4 h-4 text-[#3b82f6]" />;
        if (agentName.includes("Compliance")) return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
        if (agentName.includes("Actuator")) return <Workflow className="w-4 h-4 text-purple-400" />;
        if (agentName.includes("Error")) return <AlertTriangle className="w-4 h-4 text-red-500" />;
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    };

    return (
        <GlassCard className="p-5 flex flex-col border-[#3b82f6]/20 bg-[#3b82f6]/5 overflow-hidden relative">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center border border-[#3b82f6]/30">
                    <Bot className="w-4 h-4 text-[#3b82f6]" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg leading-tight">OmniProcure Autonomous Orchestrator</h3>
                    <p className="text-white/50 text-xs">Powered by Amazon Nova 2 Lite & Strands Sub-Agents</p>
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleExecute} className="mb-4">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading}
                        placeholder='e.g., "Find the best alternative supplier for Lithium Carbonate, verify the budget, and initiate a PO for 500 units."'
                        className="w-full h-24 p-4 pr-12 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#3b82f6]/50 transition-all font-medium text-sm resize-none"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="absolute bottom-3 right-3 p-2 rounded-lg bg-[#3b82f6] hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </form>

            {/* Trace Terminal Output */}
            {(traces.length > 0 || isLoading) && (
                <div className="flex-1 min-h-[150px] bg-black/60 rounded-xl border border-white/10 p-4 font-mono text-sm overflow-y-auto">
                    <div className="space-y-3">
                        {traces.map((trace, idx) => (
                            <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="shrink-0 mt-0.5">{getAgentIcon(trace.agent)}</div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white/80">{trace.agent}</span>
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/50">{trace.status}</span>
                                    </div>
                                    <p className="text-white/60 text-xs mt-1 leading-relaxed">{trace.details}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 items-center opacity-50 animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin text-[#3b82f6]" />
                                <span className="text-xs text-white/50">Computing maxReasoningEffort trajectory...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Final Human-In-The-Loop Mock Render */}
            {!isLoading && finalResult?.status === "AWAITING_HUMAN_APPROVAL" && !isApproved && (
                <div className="mt-4 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 animate-in fade-in zoom-in-95">
                    <h4 className="flex items-center gap-2 font-bold text-yellow-400 mb-2">
                        <ShieldAlert className="w-4 h-4" /> HUMAN-IN-THE-LOOP APPROVAL REQUIRED
                    </h4>
                    <p className="text-sm text-yellow-200/70 mb-4">{finalResult.final_recommendation}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleApprove}
                            className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors text-sm"
                        >
                            Approve P.O. Execution
                        </button>
                        <button
                            onClick={() => { setPrompt(""); setTraces([]); setFinalResult(null); }}
                            className="flex-1 py-2 bg-black/40 border border-white/10 hover:bg-white/5 text-white font-bold rounded-lg transition-colors text-sm"
                        >
                            Reject / Abort
                        </button>
                    </div>
                </div>
            )}

            {/* Approved State */}
            {isApproved && (
                <div className="mt-4 p-4 rounded-xl border border-green-500/30 bg-green-500/10 animate-in fade-in zoom-in-95">
                    <h4 className="flex items-center gap-2 font-bold text-green-400 mb-2">
                        <CheckCircle2 className="w-4 h-4" /> PURCHASE ORDER EXECUTED
                    </h4>
                    <p className="text-sm text-green-200/70 mb-4">The Actuator Agent has successfully placed the order on the supplier portal. It has been added to your ledger.</p>
                    <button
                        onClick={() => { setPrompt(""); setTraces([]); setFinalResult(null); setIsApproved(false); }}
                        className="w-full py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold rounded-lg transition-colors text-sm"
                    >
                        Start New Orchestration
                    </button>
                </div>
            )}
        </GlassCard>
    );
}
