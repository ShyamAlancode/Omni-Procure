"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Package,
  DollarSign,
  Shield,
  Zap,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USER_ID  = "demo-user-001";

interface PurchaseOrder {
  id: string;
  job_id: string;
  user_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  supplier_name: string;
  supplier_portal: string;
  compliance_status: string;
  status: string;
  screenshot_path?: string;
  nova_act_trace?: string[];
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    APPROVED: {
      icon: <CheckCircle size={12} />,
      className: "bg-green-500/20 border-green-500/30 text-green-400",
      label: "Approved",
    },
    PENDING: {
      icon: <Clock size={12} />,
      className: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
      label: "Pending",
    },
    REJECTED: {
      icon: <XCircle size={12} />,
      className: "bg-red-500/20 border-red-500/30 text-red-400",
      label: "Rejected",
    },
    DELIVERED: {
      icon: <Truck size={12} />,
      className: "bg-blue-500/20 border-blue-500/30 text-blue-400",
      label: "Delivered",
    },
  };
  const c = config[status] || {
    icon: <Clock size={12} />,
    className: "bg-white/10 border-white/10 text-slate-400",
    label: status,
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${c.className}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function OrderRow({ order }: { order: PurchaseOrder }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden transition-all"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      {/* Row header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/3 transition"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Product icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Package size={18} className="text-blue-400" />
        </div>

        {/* Product name & supplier */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{order.product_name}</p>
          <p className="text-xs text-slate-500 truncate">{order.supplier_name}</p>
        </div>

        {/* Quantity */}
        <div className="hidden sm:block text-right shrink-0">
          <p className="text-xs text-slate-500">Qty</p>
          <p className="text-sm font-medium text-white">{order.quantity.toLocaleString()}</p>
        </div>

        {/* Total */}
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-sm font-semibold text-green-400">{formatCurrency(order.total_price)}</p>
        </div>

        {/* Status */}
        <div className="shrink-0">
          <StatusBadge status={order.status} />
        </div>

        {/* Date */}
        <div className="hidden md:block text-right shrink-0">
          <p className="text-xs text-slate-600">{formatDate(order.created_at)}</p>
        </div>

        {/* Expand */}
        <span className="text-slate-600 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-white/5 px-5 py-4 space-y-4">
          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DetailItem icon={<Package size={12} />}     label="Order ID"      value={order.id.slice(0, 16) + "..."} />
            <DetailItem icon={<DollarSign size={12} />}  label="Unit Price"    value={formatCurrency(order.unit_price)} />
            <DetailItem icon={<DollarSign size={12} />}  label="Total"         value={formatCurrency(order.total_price)} highlight />
            <DetailItem icon={<Truck size={12} />}       label="Supplier"      value={order.supplier_name} />
            <DetailItem icon={<Shield size={12} />}      label="Compliance"    value={order.compliance_status}
              badge={order.compliance_status === "PASSED" ? "green" : "red"}
            />
            {order.approved_by && (
              <DetailItem icon={<CheckCircle size={12} />} label="Approved By" value={order.approved_by} />
            )}
            {order.approved_at && (
              <DetailItem icon={<Clock size={12} />} label="Approved At" value={formatDate(order.approved_at)} />
            )}
            {order.rejection_reason && (
              <DetailItem icon={<XCircle size={12} />} label="Rejection Reason" value={order.rejection_reason} />
            )}
          </div>

          {/* Nova Act trace */}
          {order.nova_act_trace && order.nova_act_trace.length > 0 && (
            <div className="rounded-lg border border-white/5 bg-black/20 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Zap size={12} className="text-blue-400" />
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                  Nova Act Automation Steps
                </p>
              </div>
              <ol className="space-y-1">
                {order.nova_act_trace.map((step, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon, label, value, highlight = false, badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  badge?: "green" | "red";
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2">
      <p className="mb-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-slate-500">
        {icon}
        {label}
      </p>
      {badge ? (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold border ${
          badge === "green"
            ? "bg-green-500/20 border-green-500/30 text-green-400"
            : "bg-red-500/20 border-red-500/30 text-red-400"
        }`}>
          {value}
        </span>
      ) : (
        <p className={`text-xs font-medium truncate ${highlight ? "text-green-400" : "text-white"}`}>
          {value}
        </p>
      )}
    </div>
  );
}

// Summary stat card
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/5 px-4 py-3"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <div className="mb-1 text-blue-400">{icon}</div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders]       = useState<PurchaseOrder[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filter, setFilter]       = useState<string>("ALL");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/agent/orders/${USER_ID}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statuses = ["ALL", "APPROVED", "PENDING", "REJECTED", "DELIVERED"];

  const filtered = filter === "ALL"
    ? orders
    : orders.filter((o) => o.status === filter);

  const totalSpend   = orders.filter(o => o.status === "APPROVED").reduce((s, o) => s + o.total_price, 0);
  const approvedCount = orders.filter(o => o.status === "APPROVED").length;
  const pendingCount  = orders.filter(o => o.status === "PENDING").length;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">OmniProcure</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/procurement"
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
            >
              + New Request
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Order History</h1>
          <p className="mt-1 text-sm text-slate-400">
            All AI-generated purchase orders with full audit trail
          </p>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<ShoppingCart size={16} />} label="Total Orders"   value={orders.length} />
          <StatCard icon={<CheckCircle size={16} />}  label="Approved"       value={approvedCount} />
          <StatCard icon={<Clock size={16} />}        label="Pending"        value={pendingCount} />
          <StatCard icon={<DollarSign size={16} />}   label="Total Spend"    value={formatCurrency(totalSpend)} />
        </div>

        {/* Filter tabs + refresh */}
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  filter === s
                    ? "border-blue-500 bg-blue-500/20 text-blue-400"
                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {s}
                {s !== "ALL" && (
                  <span className="ml-1.5 opacity-60">
                    ({orders.filter((o) => o.status === s).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            Error loading orders: {error}
          </div>
        )}

        {loading && !error && (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <RefreshCw size={20} className="animate-spin mr-2" />
            Loading orders...
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart size={40} className="text-slate-700 mb-4" />
            <p className="text-sm text-slate-500">
              {filter === "ALL"
                ? "No purchase orders yet"
                : `No ${filter.toLowerCase()} orders`}
            </p>
            <a
              href="/procurement"
              className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Create your first procurement request →
            </a>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
