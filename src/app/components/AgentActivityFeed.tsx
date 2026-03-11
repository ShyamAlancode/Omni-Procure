"use client";

import { useEffect, useRef } from "react";
import {
  CheckCircle,
  Circle,
  XCircle,
  Clock,
  Loader2,
  BrainCircuit,
  Search,
  ShieldCheck,
  Globe,
  UserCheck,
  AlertTriangle,
  Wifi,
} from "lucide-react";

export interface AgentStep {
  step: string;
  status: "running" | "complete" | "error" | "hitl_required";
  detail: string;
  timestamp: string;
  screenshot_base64?: string;
  po_draft?: Record<string, unknown>;
  order_id?: string;
  type?: string;
}

interface AgentActivityFeedProps {
  steps: AgentStep[];
  isRunning: boolean;
  jobId?: string | null;
}

const STEP_META: Record<string, { label: string; icon: React.ReactNode }> = {
  ORCHESTRATOR:       { label: "AI Orchestrator",        icon: <BrainCircuit size={16} /> },
  CATALOG_MATCH:      { label: "Catalog Matcher",         icon: <Search size={16} /> },
  COMPLIANCE_CHECK:   { label: "Compliance Check",        icon: <ShieldCheck size={16} /> },
  BROWSER_AUTOMATION: { label: "Browser Automation",      icon: <Globe size={16} /> },
  HITL_PENDING:       { label: "Awaiting Approval",       icon: <UserCheck size={16} /> },
  APPROVED:           { label: "Order Approved",          icon: <CheckCircle size={16} /> },
  REJECTED:           { label: "Order Rejected",          icon: <XCircle size={16} /> },
  TIMEOUT:            { label: "Approval Timeout",        icon: <AlertTriangle size={16} /> },
  ERROR:              { label: "Pipeline Error",          icon: <AlertTriangle size={16} /> },
};

function stepMeta(step: string): { label: string; icon: React.ReactNode } {
  return STEP_META[step] || { label: step, icon: <Circle size={16} /> };
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return iso;
  }
}

interface StatusStyleConfig {
  border: string;
  bg: string;
  iconColor: string;
  textColor: string;
  badge: string;
  badgeText: string;
  icon: React.ReactNode;
}

function statusStyles(status: AgentStep["status"], stepName: string): StatusStyleConfig {
  switch (status) {
    case "running":
      return {
        border:    "border-l-blue-500",
        bg:        "bg-blue-500/5",
        iconColor: "text-blue-400",
        textColor: "text-blue-300",
        badge:     "bg-blue-500/20 border-blue-500/30 text-blue-400",
        badgeText: "Running",
        icon:      <Loader2 size={16} className="animate-spin" />,
      };
    case "complete":
      return {
        border:    "border-l-green-500",
        bg:        "bg-green-500/5",
        iconColor: "text-green-400",
        textColor: "text-green-300",
        badge:     "bg-green-500/20 border-green-500/30 text-green-400",
        badgeText: "Complete",
        icon:      <CheckCircle size={16} />,
      };
    case "error":
      return {
        border:    "border-l-red-500",
        bg:        "bg-red-500/5",
        iconColor: "text-red-400",
        textColor: "text-red-300",
        badge:     "bg-red-500/20 border-red-500/30 text-red-400",
        badgeText: stepName === "REJECTED" ? "Rejected" : "Error",
        icon:      <XCircle size={16} />,
      };
    case "hitl_required":
      return {
        border:    "border-l-yellow-500",
        bg:        "bg-yellow-500/5",
        iconColor: "text-yellow-400",
        textColor: "text-yellow-300",
        badge:     "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
        badgeText: "Approval Required",
        icon:      <Clock size={16} />,
      };
    default:
      return {
        border:    "border-l-slate-500",
        bg:        "bg-white/5",
        iconColor: "text-slate-400",
        textColor: "text-slate-300",
        badge:     "bg-white/10 border-white/10 text-slate-400",
        badgeText: status,
        icon:      <Circle size={16} />,
      };
  }
}

export default function AgentActivityFeed({ steps, isRunning, jobId }: AgentActivityFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest step
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps.length]);

  const visibleSteps = steps.filter((s) => s.type !== "ping");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-white">Agent Activity</span>
        </div>
        <div className="flex items-center gap-2">
          {jobId && (
            <span className="text-[10px] font-mono text-slate-500">{jobId.slice(0, 8)}…</span>
          )}
          {isRunning && (
            <span className="flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              <Wifi size={10} className="animate-pulse" />
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {visibleSteps.length === 0 && !isRunning && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <BrainCircuit size={32} className="text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">Agent activity will appear here</p>
            <p className="text-xs text-slate-600 mt-1">Submit a procurement request to begin</p>
          </div>
        )}

        {visibleSteps.map((step, idx) => {
          const meta   = stepMeta(step.step);
          const styles = statusStyles(step.status, step.step);
          const isLast = idx === visibleSteps.length - 1;

          return (
            <div
              key={idx}
              className={`relative rounded-lg border-l-2 border border-white/5 px-4 py-3 transition-all duration-300 ${styles.border} ${styles.bg} ${
                isLast && isRunning ? "shadow-lg shadow-blue-500/10" : ""
              }`}
            >
              {/* Step header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={styles.iconColor}>{styles.icon}</span>
                  <span className="text-sm font-semibold text-white truncate">{meta.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${styles.badge}`}
                  >
                    {styles.badgeText}
                  </span>
                </div>
              </div>

              {/* Detail text */}
              <p className={`mt-1 text-xs leading-relaxed ${styles.textColor}`}>{step.detail}</p>

              {/* HITL badge */}
              {step.status === "hitl_required" && (
                <div className="mt-2 flex items-center gap-1.5 rounded bg-yellow-500/10 border border-yellow-500/20 px-2 py-1">
                  <UserCheck size={12} className="text-yellow-400" />
                  <span className="text-[11px] font-semibold text-yellow-400">
                    Your review is required — see approval modal
                  </span>
                </div>
              )}

              {/* Timestamp */}
              <p className="mt-1.5 text-[10px] font-mono text-slate-600">{formatTime(step.timestamp)}</p>
            </div>
          );
        })}

        {/* Running pulse placeholder */}
        {isRunning && visibleSteps.length > 0 && (
          <div className="rounded-lg border border-white/5 bg-white/2 px-4 py-3 animate-pulse">
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="text-blue-400 animate-spin" />
              <div className="h-3 w-32 rounded bg-white/10" />
            </div>
            <div className="mt-2 h-2 w-48 rounded bg-white/5" />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer step count */}
      <div className="border-t border-white/5 px-4 py-2">
        <p className="text-[10px] text-slate-600">
          {visibleSteps.length} {visibleSteps.length === 1 ? "step" : "steps"} recorded
          {isRunning ? " · agent running..." : ""}
        </p>
      </div>
    </div>
  );
}
