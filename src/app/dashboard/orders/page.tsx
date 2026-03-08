"use client";

import { useState, useEffect } from "react";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Download, Search, Filter, AlertCircle } from "lucide-react";

type Order = {
    id: string;
    item: string;
    counterparty: string;
    date: string;
    amount: number;
    status: "Pending" | "Confirmed" | "Delivered" | "Cancelled";
};

const MOCK_PLACED: Order[] = [
    { id: "PO-89241", item: "Enterprise Server Hardware", counterparty: "TechLogix Inc.", date: "2024-03-01", amount: 55000, status: "Confirmed" },
    { id: "PO-89230", item: "Logistics Routing Software", counterparty: "RouteCloud Systems", date: "2024-02-28", amount: 12000, status: "Delivered" },
    { id: "PO-89190", item: "Industrial Lithium Batch", counterparty: "Minera Corp", date: "2024-02-15", amount: 145000, status: "Pending" },
    { id: "PO-89025", item: "Consulting Audit Services", counterparty: "SecurityFirst", date: "2024-01-10", amount: 22000, status: "Cancelled" },
];

const MOCK_RECEIVED: Order[] = []; // Intentionally blank to show empty state

function StatusBadge({ status }: { status: Order["status"] }) {
    switch (status) {
        case "Pending": return <span className="px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] uppercase font-bold tracking-wider">Pending</span>;
        case "Confirmed": return <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] uppercase font-bold tracking-wider">Confirmed</span>;
        case "Delivered": return <span className="px-2.5 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] uppercase font-bold tracking-wider">Delivered</span>;
        case "Cancelled": return <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] uppercase font-bold tracking-wider">Cancelled</span>;
    }
}

export default function OrdersPage() {
    const [tab, setTab] = useState<"placed" | "received">("placed");
    const [localOrders, setLocalOrders] = useState<Order[]>([]);

    useEffect(() => {
        const loadOrders = () => {
            const stored = localStorage.getItem('omniprocure_orders');
            if (stored) {
                try {
                    setLocalOrders(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse local orders");
                }
            }
        };
        loadOrders();
        // Listen for standard storage events and custom storage events from our panel
        window.addEventListener('storage', loadOrders);
        return () => window.removeEventListener('storage', loadOrders);
    }, []);

    const combinedPlaced = [...localOrders, ...MOCK_PLACED];
    const currentData = tab === "placed" ? combinedPlaced : MOCK_RECEIVED;

    return (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

            {/* Header */}
            <AnimatedSection className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">My Orders</h1>
                    <p className="text-white/50 text-sm">Track purchase orders, fulfillment statuses, and supplier executions.</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all border border-white/10 shrink-0">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
                <GlassCard className="p-0 border-white/5 overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setTab("placed")}
                            className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium transition-colors border-b-2 ${tab === "placed" ? "text-[#3b82f6] border-[#3b82f6] bg-[#3b82f6]/5" : "text-white/50 border-transparent hover:text-white hover:bg-white/5"}`}
                        >
                            Orders Placed
                        </button>
                        <button
                            onClick={() => setTab("received")}
                            className={`flex-1 sm:flex-none px-6 py-4 text-sm font-medium transition-colors border-b-2 ${tab === "received" ? "text-purple-400 border-purple-400 bg-purple-500/5" : "text-white/50 border-transparent hover:text-white hover:bg-white/5"}`}
                        >
                            Orders Received
                        </button>
                    </div>

                    {/* Table Container */}
                    <div className="w-full overflow-x-auto">
                        {currentData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <AlertCircle className="w-8 h-8 text-white/20" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">No data available</h3>
                                <p className="text-sm text-white/50">There are currently no orders in this category.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/10">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">Order ID</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">Item / Service</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">{tab === "placed" ? "Supplier" : "Buyer"}</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {currentData.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs text-white/60">{order.id}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-sm text-white group-hover:text-[#3b82f6] transition-colors">{order.item}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white/70">{order.counterparty}</td>
                                            <td className="px-6 py-4 text-sm text-white/50">{order.date}</td>
                                            <td className="px-6 py-4 font-mono text-sm text-white">${order.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-xs font-medium text-[#3b82f6] hover:text-blue-400">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </GlassCard>
            </AnimatedSection>
        </div>
    );
}
