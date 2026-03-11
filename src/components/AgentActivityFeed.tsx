"use client";

import { useEffect, useRef } from "react";
import { Bot, CheckCircle2, ShieldCheck, Workflow, AlertTriangle, Loader2 } from "lucide-react";

export interface AgentStep {
    step: string;
    status: string;
    detail?: string;
    details?: string;
    payload?: any;
    screenshotbase64?: string;
    screenshot_base64?: string;
    podraft?: any;
    po_draft?: any;
    orderid?: string;
    order_id?: string;
}

interface AgentActivityFeedProps {
    steps: AgentStep[];
    isRunning: boolean;
    jobId: string | null;
}

export default function AgentActivityFeed({ steps, isRunning, jobId }: AgentActivityFeedProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [steps]);

    const getAgentIcon = (agentName: string) => {
        const a = agentName.toUpperCase();
        if (a.includes("ORCHESTRATOR")) return <Bot className="w-5 h-5 text-blue-400" />;
        if (a.includes("COMPLIANCE")) return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
        if (a.includes("BROWSER") || a.includes("ACT")) return <Workflow className="w-5 h-5 text-purple-400" />;
        if (a.includes("CATALOG") || a.includes("SUPPLIER")) return <CheckCircle2 className="w-5 h-5 text-teal-400" />;
        if (a.includes("ERROR") || a.includes("FAILED")) return <AlertTriangle className="w-5 h-5 text-red-500" />;
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#0a0a0a] border-l border-white/5 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between z-10 bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        Live Agent Trace
                    </h3>
                </div>
                {jobId && <div className="text-xs font-mono text-white/30">JOB: {jobId.split('-')[0]}</div>}
            </div>

            {/* Scrollable Feed */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth pb-24">
                {isRunning && steps.length === 0 && (
                    <div className="flex items-center justify-center h-40 text-white/40 text-sm gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Establishing secure connection to AWS Strands...
                    </div>
                )}

                {steps.map((step, idx) => {
                    const isLast = idx === steps.length - 1;
                    const status = step.status.toUpperCase();
                    const isDone = ["COMPLETED", "EXECUTED", "REJECTED", "HITL_PENDING", "FAILED", "COMPLETE", "ERROR"].includes(status);
                    const details = step.details || step.detail || "";

                    return (
                        <div key={idx} className={`relative pl-8 animate-in slide-in-from-left-4 fade-in duration-500`}>
                            {/* Vertical Line Connector */}
                            {idx !== steps.length - 1 && (
                                <div className="absolute left-3.5 top-8 bottom-[-16px] w-[1px] bg-white/10"></div>
                            )}

                            {/* Icon Indicator */}
                            <div className="absolute left-0 top-1 w-7 h-7 bg-[#111] rounded-full flex items-center justify-center border border-white/10 z-10 shadow-lg">
                                {isLast && isRunning && !isDone ? <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping absolute"></div> : null}
                                {getAgentIcon(step.step ?? "")}
                            </div>

                            {/* Card Content */}
                            <div className={`p-4 rounded-xl border transition-all duration-500 ${isLast && isRunning && !isDone ? 'bg-blue-900/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/[0.02] border-white/5'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold tracking-wider text-white/50">{step.step}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${status === 'FAILED' || status === 'ERROR' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40'}`}>
                                        {status}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed ${isLast && isRunning && !isDone ? 'text-blue-100 flex items-center gap-2' : 'text-white/70'}`}>
                                    {details}
                                    {isLast && isRunning && !isDone && <span className="w-1.5 h-4 bg-blue-400 animate-pulse ml-1 inline-block"></span>}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Fade Out Bottom Edge */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none"></div>
        </div>
    );
}
