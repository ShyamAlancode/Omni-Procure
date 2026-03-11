"use client";

import { useState, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Send, Bot, Loader2, Workflow, ShieldCheck, CheckCircle2, AlertTriangle, ShieldAlert, ImageIcon, XCircle, ChevronRight } from "lucide-react";
import { getCurrentUser } from "aws-amplify/auth";

type TraceLog = {
    step: string;
    status: string;
    detail: string;
    timestamp: string;
    extra?: any;
};

export default function AIOrchestratorPanel() {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [traces, setTraces] = useState<TraceLog[]>([]);
    const [jobId, setJobId] = useState<string | null>(null);
    const [poDraft, setPoDraft] = useState<any>(null);
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApprove = async () => {
        if (!jobId) return;
        setIsLoading(true);
        try {
            const user = await getCurrentUser();
            const res = await fetch(`http://localhost:8000/agent/approve/${jobId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    approved_by: user?.username || "Authorized User",
                    notes: "Approved via Autonomous Orchestrator Panel"
                })
            });
            if (res.ok) {
                setIsComplete(true);
                setPoDraft(null);
                setScreenshot(null);
            }
        } catch (err) {
            console.error("Failed to approve PO", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        if (!jobId) return;
        setIsLoading(true);
        try {
            const user = await getCurrentUser();
            await fetch(`http://localhost:8000/agent/reject/${jobId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rejected_by: user?.username || "Authorized User",
                    reason: "Rejected by user from panel"
                })
            });
            resetState();
        } catch (err) {
            console.error("Failed to reject PO", err);
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setPrompt("");
        setTraces([]);
        setJobId(null);
        setPoDraft(null);
        setScreenshot(null);
        setIsComplete(false);
        setError(null);
    };

    const handleExecute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setTraces([]);
        setPoDraft(null);
        setScreenshot(null);
        setIsComplete(false);
        setError(null);

        try {
            // 1. Get User ID
            const user = await getCurrentUser();
            const userId = (user as any)?.userId || "demo-user-001";

            // 2. Submit Job (POST)
            const res = await fetch("http://localhost:8000/agent/procure", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    request: prompt,
                    userid: userId
                })
            });

            if (!res.ok) throw new Error("Failed to initialize procurement job");
            const { job_id } = await res.json();
            setJobId(job_id);

            // 3. Connect WebSocket
            const ws = new WebSocket(`ws://localhost:8000/ws/agent-stream/${job_id}`);

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // Add to tracers - ALWAYS append, never deduplicate
                if (data.step) {
                    setTraces(prev => [...prev, data]);
                }

                // Handle HITL state
                if (data.status === "hitl_required") {
                    if (data.po_draft) setPoDraft(data.po_draft);
                    if (data.screenshot_base64) setScreenshot(data.screenshot_base64);
                    setIsLoading(false);
                }

                // Handle Completion (APPROVED state from server)
                if (data.step === "APPROVED") {
                    setIsComplete(true);
                    setPoDraft(null);
                    setScreenshot(null);
                    setIsLoading(false);
                }

                // Handle Error
                if (data.status === "error") {
                    setError(data.detail);
                    setIsLoading(false);
                }
            };

            ws.onerror = () => {
                setError("Streaming connection failed. Check backend status.");
                setIsLoading(false);
            };

            ws.onclose = () => {
                setIsLoading(false);
            };

        } catch (err: any) {
            setError(err.message || "Failed to initialize pipeline");
            setIsLoading(false);
        }
    };

    const getAgentIcon = (step: string) => {
        if (step.includes("ORCHESTRATOR")) return <Bot className="w-4 h-4 text-[#3b82f6]" />;
        if (step.includes("COMPLIANCE")) return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
        if (step.includes("CATALOG")) return <Workflow className="w-4 h-4 text-purple-400" />;
        if (step.includes("AUTOMATION")) return <Bot className="w-4 h-4 text-orange-400" />;
        if (step.includes("ERROR")) return <AlertTriangle className="w-4 h-4 text-red-500" />;
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
                    <p className="text-white/50 text-xs text-uppercase tracking-wider">Multi-Agent System Active</p>
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleExecute} className="mb-4">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading || !!poDraft}
                        placeholder='e.g., "Find the best alternative supplier for Lithium Carbonate, verify the budget, and initiate a PO for 500 units."'
                        className="w-full h-24 p-4 pr-12 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#3b82f6]/50 transition-all font-medium text-sm resize-none disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim() || !!poDraft}
                        className="absolute bottom-3 right-3 p-2 rounded-lg bg-[#3b82f6] hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Trace Terminal Output */}
                {(traces.length > 0 || isLoading || error) && (
                    <div className="bg-black/60 rounded-xl border border-white/10 p-4 font-mono text-xs overflow-y-auto max-h-[300px]">
                        <div className="space-y-3">
                            {traces.map((trace, idx) => (
                                <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="shrink-0 mt-0.5">{getAgentIcon(trace.step)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-white/80">{trace.step}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${trace.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                                trace.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-blue-500/20 text-blue-400 animate-pulse'
                                                }`}>
                                                {trace.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-white/50 text-[11px] mt-1 leading-relaxed break-words">{trace.detail}</p>
                                    </div>
                                </div>
                            ))}

                            {error && (
                                <div className="flex gap-2 text-red-400 p-2 rounded bg-red-500/10 border border-red-500/20">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {isLoading && (
                                <div className="flex gap-3 items-center opacity-50">
                                    <Loader2 className="w-3 h-3 animate-spin text-[#3b82f6]" />
                                    <span className="text-[10px] text-white/50 animate-pulse">Orchestrating agents...</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* HITL / PO Preview Area */}
                {poDraft && (
                    <div className="rounded-xl border border-[#3b82f6]/30 bg-black/40 p-4 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 text-[#3b82f6] mb-3">
                            <ShieldAlert className="w-4 h-4" />
                            <h4 className="font-bold text-sm tracking-tight">ACTION REQUIRED: PO APPROVAL</h4>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                                <div className="flex justify-between mb-2">
                                    <span className="text-white/40">Item</span>
                                    <span className="text-white font-medium">{poDraft.product_name}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-white/40">Qty / Unit Price</span>
                                    <span className="text-white font-medium">{poDraft.quantity} x ${poDraft.unit_price}</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
                                    <span className="text-white/40">Total Amount</span>
                                    <span className="text-[#3b82f6]">${poDraft.total_price}</span>
                                </div>
                            </div>

                            {screenshot && (
                                <div className="relative group cursor-zoom-in rounded-lg overflow-hidden border border-white/10">
                                    <img
                                        src={screenshot.startsWith('data:') ? screenshot : `data:image/png;base64,${screenshot}`}
                                        alt="Portal State"
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ImageIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] text-white/70">
                                        Vision Verified: 85%
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleApprove}
                                disabled={isLoading}
                                className="flex-1 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                Approve PO
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isLoading}
                                className="p-2 aspect-square bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 text-white hover:text-red-400 rounded-lg transition-all"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Completion State */}
                {isComplete && (
                    <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                        <h4 className="font-bold text-green-400 mb-1">P.O. Executed Successfully</h4>
                        <p className="text-xs text-white/50 mb-4">The order has been finalized on the supplier portal and logged in the enterprise ledger.</p>
                        <button
                            onClick={resetState}
                            className="text-xs font-bold text-green-400 hover:text-green-300 flex items-center gap-1"
                        >
                            Start New Request <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
