"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ShieldCheck, Package, DollarSign, Truck, Hash } from "lucide-react";

interface PODraft {
  product_name: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  supplier: string;
  supplier_portal?: string;
  compliance_status: string;
  compliance_codes?: string[];
  recommended?: boolean;
  nova_act_steps?: string[];
  category?: string;
  sku?: string;
}

interface HITLModalProps {
  jobId: string;
  screenshotBase64: string;
  poDraft: PODraft;
  onApprove: (notes: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

export default function HITLModal({
  jobId,
  screenshotBase64,
  poDraft,
  onApprove,
  onReject,
}: HITLModalProps) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    setError(null);
    try {
      await onApprove(notes);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }
    setLoading("reject");
    setError(null);
    try {
      await onReject(rejectReason);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(null);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-yellow-500/30 shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0f1629 0%, #1a1f3a 100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-yellow-500/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400">
              ⏳
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Human-in-the-Loop Approval</h2>
              <p className="text-xs text-slate-400">Review and approve the AI-generated purchase order</p>
            </div>
          </div>
          {poDraft.recommended && (
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400 border border-green-500/30">
              AI Recommended
            </span>
          )}
        </div>

        {/* Screenshot */}
        {screenshotBase64 && (
          <div className="border-b border-white/5 px-6 pt-4 pb-2">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">
              Supplier Portal Screenshot (Nova Act)
            </p>
            <div className="overflow-hidden rounded-lg border border-white/10">
              <img
                src={`data:image/png;base64,${screenshotBase64}`}
                alt="Supplier portal automation screenshot"
                className="w-full object-cover"
                style={{ maxHeight: 240 }}
              />
            </div>
          </div>
        )}

        {/* PO Details grid */}
        <div className="px-6 py-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">
            Purchase Order Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <DetailCard
              icon={<Package size={14} />}
              label="Product"
              value={poDraft.product_name}
              full
            />
            <DetailCard icon={<Hash size={14} />} label="SKU" value={poDraft.sku || "—"} />
            <DetailCard
              icon={<span className="text-xs">#</span>}
              label="Quantity"
              value={`${poDraft.quantity.toLocaleString()} units`}
            />
            <DetailCard
              icon={<DollarSign size={14} />}
              label="Unit Price"
              value={formatCurrency(poDraft.unit_price)}
            />
            <DetailCard
              icon={<DollarSign size={14} />}
              label="Total Amount"
              value={formatCurrency(poDraft.total_price)}
              highlight
            />
            <DetailCard
              icon={<Truck size={14} />}
              label="Supplier"
              value={poDraft.supplier}
            />
            <DetailCard
              icon={<ShieldCheck size={14} />}
              label="Compliance"
              value={poDraft.compliance_status}
              badge={poDraft.compliance_status === "PASSED" ? "green" : "red"}
            />
            {poDraft.category && (
              <DetailCard icon={null} label="Category" value={poDraft.category} />
            )}
          </div>

          {/* Nova Act steps */}
          {poDraft.nova_act_steps && poDraft.nova_act_steps.length > 0 && (
            <div className="mt-4 rounded-lg border border-white/5 bg-black/20 p-3">
              <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
                Nova Act Automation Steps
              </p>
              <ol className="space-y-1">
                {poDraft.nova_act_steps.map((step, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Notes */}
        {!showRejectForm && (
          <div className="px-6 pb-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional approval notes..."
              rows={2}
              className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Reject form */}
        {showRejectForm && (
          <div className="px-6 pb-2">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason (required)..."
              rows={2}
              className="w-full resize-none rounded-lg border border-red-500/30 bg-black/30 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 border-t border-white/5 px-6 py-4">
          {!showRejectForm ? (
            <>
              <button
                onClick={handleApprove}
                disabled={loading !== null}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading === "approve" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Approve Purchase Order
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={loading !== null}
                className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <XCircle size={16} />
                Reject
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReject}
                disabled={loading !== null}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading === "reject" ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <XCircle size={16} />
                )}
                Confirm Rejection
              </button>
              <button
                onClick={() => { setShowRejectForm(false); setError(null); }}
                disabled={loading !== null}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-60"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component: detail card
function DetailCard({
  icon,
  label,
  value,
  full = false,
  highlight = false,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  full?: boolean;
  highlight?: boolean;
  badge?: "green" | "red";
}) {
  return (
    <div
      className={`rounded-lg border border-white/5 bg-black/20 px-3 py-2 ${full ? "col-span-2" : ""}`}
    >
      <p className="mb-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-slate-500">
        {icon}
        {label}
      </p>
      {badge ? (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${badge === "green"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
        >
          {value}
        </span>
      ) : (
        <p className={`text-sm font-medium ${highlight ? "text-green-400" : "text-white"}`}>
          {value}
        </p>
      )}
    </div>
  );
}
