"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Zap, ShoppingCart, CheckCircle, XCircle, Loader2, BrainCircuit } from "lucide-react";
import AgentActivityFeed, { AgentStep } from "@/components/AgentActivityFeed";
import HITLModal from "./HITLModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
const USER_ID = "demo-user-001"; // Replace with Cognito sub from session

const EXAMPLE_REQUESTS = [
  "I need 500 units of Industrial Safety Gloves under $20 each",
  "Order 50 units of Server Rack 2U for our data center expansion",
  "Purchase 200 Hard Hat Class E for construction site, budget $30/unit",
  "Get 100 units of Barcode Scanner Wireless for warehouse",
  "Buy 1000 units of High Vis Vest ANSI Class 2 under $20",
];

interface HITLData {
  screenshot_base64: string;
  po_draft: Record<string, any>;
}

interface OrderResult {
  status: string;
  order_id: string;
}

export default function ProcurementPage() {
  const [request, setRequest] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [showHitl, setShowHitl] = useState(false);
  const [hitlData, setHitlData] = useState<HITLData | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const currentJobRef = useRef<string | null>(null);

  // Cleanup WS on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const connectWebSocket = useCallback((jid: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`${WS_BASE}/ws/agent-stream/${jid}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsError(null);
    };

    ws.onmessage = (evt) => {
      let msg: AgentStep & { type?: string };
      try {
        msg = JSON.parse(evt.data);
      } catch {
        return;
      }

      // Skip heartbeat pings
      if (msg.type === "ping") return;

      setSteps((prev) => {
        // Deduplicate: if same step+status+detail already at tail, skip
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          if (last.step === msg.step && last.status === msg.status && last.detail === msg.detail) {
            return prev;
          }
        }
        return [...prev, msg];
      });

      if (msg.status === "hitl_required" && msg.screenshot_base64 && msg.po_draft) {
        setHitlData({
          screenshot_base64: msg.screenshot_base64 as string,
          po_draft: msg.po_draft as Record<string, any>,
        });
        setShowHitl(true);
        setIsRunning(false);
      }

      if (msg.step === "APPROVED" && msg.status === "complete") {
        setShowHitl(false);
        setIsRunning(false);
        setOrderResult({ status: "APPROVED", order_id: (msg as any).order_id || "" });
      }

      if (msg.step === "REJECTED" && msg.status === "error") {
        setShowHitl(false);
        setIsRunning(false);
        setOrderResult({ status: "REJECTED", order_id: "" });
      }

      if (msg.step === "ERROR" || msg.step === "TIMEOUT") {
        setIsRunning(false);
      }
    };

    ws.onerror = () => {
      setWsError("WebSocket connection error — retrying...");
    };

    ws.onclose = () => {
      if (currentJobRef.current === jid && isRunning) {
        setWsError("Connection closed unexpectedly");
      }
    };
  }, [isRunning]);

  const handleSubmit = async () => {
    const trimmed = request.trim();
    if (!trimmed || isRunning) return;

    setSubmitError(null);
    setSteps([]);
    setOrderResult(null);
    setHitlData(null);
    setShowHitl(false);
    setIsRunning(true);
    setWsError(null);

    try {
      const res = await fetch(`${API_BASE}/agent/procure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: trimmed, user_id: USER_ID }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to start procurement job");
      }

      const data = await res.json();
      const jid: string = data.job_id;

      if (!jid) {
        throw new Error("Backend did not return a job_id");
      }

      setJobId(jid);
      currentJobRef.current = jid;

      // Small delay to let server register the job before WS connect
      await new Promise((r) => setTimeout(r, 300));
      if (jid) {
        connectWebSocket(jid);
      }

    } catch (err: any) {
      setSubmitError(err.message || "An error occurred");
      setIsRunning(false);
    }
  };

  const handleApprove = async (notes: string) => {
    if (!jobId) return;
    try {
      const res = await fetch(`${API_BASE}/agent/approve/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved_by: "current_user", notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Approval failed");
      }
      const data = await res.json();
      setShowHitl(false);
      setOrderResult({ status: "APPROVED", order_id: data.order_id });
      setIsRunning(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleReject = async (reason: string) => {
    if (!jobId) return;
    try {
      const res = await fetch(`${API_BASE}/agent/reject/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejected_by: "current_user", reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Rejection failed");
      }
      setShowHitl(false);
      setOrderResult({ status: "REJECTED", order_id: "" });
      setIsRunning(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const handleExampleClick = (ex: string) => {
    if (!isRunning) setRequest(ex);
  };

  const handleReset = () => {
    wsRef.current?.close();
    setJobId(null);
    currentJobRef.current = null;
    setSteps([]);
    setRequest("");
    setIsRunning(false);
    setOrderResult(null);
    setHitlData(null);
    setShowHitl(false);
    setWsError(null);
    setSubmitError(null);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Top bar */}
      <header className="border-b border-white/5 px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">OmniProcure</span>
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              AI Terminal
            </span>
          </div>
          <div className="flex items-center gap-3">
            {jobId && (
              <span className="text-[10px] font-mono text-slate-600">
                JOB: {jobId.slice(0, 8)}
              </span>
            )}
            <a
              href="/dashboard/orders"
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Order History →
            </a>
            {(orderResult || steps.length > 0) && !isRunning && (
              <button
                onClick={handleReset}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition"
              >
                New Request
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-6" style={{ minHeight: "calc(100vh - 120px)" }}>
          {/* ---- LEFT: Procurement Terminal ---- */}
          <div className="flex flex-col gap-4 lg:w-[55%]">
            {/* Page title */}
            <div>
              <h1 className="text-2xl font-bold text-white">Procurement Terminal</h1>
              <p className="mt-1 text-sm text-slate-400">
                Describe what you need — the AI agent handles sourcing, compliance, and supplier automation.
              </p>
            </div>

            {/* Order result banner */}
            {orderResult && (
              <div
                className={`rounded-xl border p-4 flex items-start gap-3 ${orderResult.status === "APPROVED"
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-red-500/30 bg-red-500/10"
                  }`}
              >
                {orderResult.status === "APPROVED" ? (
                  <CheckCircle size={20} className="text-green-400 mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={`font-semibold text-sm ${orderResult.status === "APPROVED" ? "text-green-400" : "text-red-400"}`}>
                    {orderResult.status === "APPROVED" ? "Purchase Order Approved!" : "Purchase Order Rejected"}
                  </p>
                  {orderResult.order_id && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Order ID: <span className="font-mono text-slate-300">{orderResult.order_id}</span>
                    </p>
                  )}
                  {orderResult.status === "APPROVED" && (
                    <a
                      href="/dashboard/orders"
                      className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 inline-block"
                    >
                      View in Order History →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Input card */}
            <div className="rounded-xl border border-white/10 bg-white/3 p-4"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-slate-500">
                Procurement Request
              </label>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isRunning}
                placeholder="e.g. I need 500 units of Industrial Safety Gloves under $20 each for our Chicago warehouse..."
                rows={4}
                className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 transition"
              />

              {submitError && (
                <p className="mt-2 text-xs text-red-400">{submitError}</p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-slate-600">⌘↵ to submit</p>
                <button
                  onClick={handleSubmit}
                  disabled={isRunning || !request.trim()}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Agent Running...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Start Procurement
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Example requests */}
            {!isRunning && steps.length === 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-600">
                  Example Requests
                </p>
                <div className="flex flex-col gap-2">
                  {EXAMPLE_REQUESTS.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleExampleClick(ex)}
                      className="rounded-lg border border-white/5 bg-white/2 px-4 py-2.5 text-left text-xs text-slate-400 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-slate-200 transition"
                      style={{ background: "rgba(255,255,255,0.015)" }}
                    >
                      <span className="mr-2 text-slate-600">→</span>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* WS error */}
            {wsError && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-400">
                ⚠ {wsError}
              </div>
            )}

            {/* Pipeline info cards */}
            <div className="mt-auto grid grid-cols-3 gap-3">
              {[
                { icon: <BrainCircuit size={14} />, label: "Nova 2 AI", desc: "Bedrock Orchestration" },
                { icon: <ShoppingCart size={14} />, label: "Nova Act", desc: "Browser Automation" },
                { icon: <CheckCircle size={14} />, label: "HITL", desc: "Human Approval" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-lg border border-white/5 px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="mb-1 flex items-center gap-1.5 text-blue-400">{card.icon}</div>
                  <p className="text-xs font-semibold text-white">{card.label}</p>
                  <p className="text-[10px] text-slate-500">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ---- RIGHT: Agent Activity Feed ---- */}
          <div
            className="rounded-xl border border-white/5 lg:w-[45%]"
            style={{
              background: "rgba(255,255,255,0.015)",
              minHeight: 500,
              maxHeight: "calc(100vh - 140px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <AgentActivityFeed steps={steps} isRunning={isRunning} jobId={jobId} />
          </div>
        </div>
      </main>

      {/* HITL Approval Modal */}
      {showHitl && hitlData && jobId && (
        <HITLModal
          jobId={jobId}
          screenshotBase64={hitlData.screenshot_base64}
          poDraft={hitlData.po_draft as any}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
