'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    ShoppingCart, DollarSign, Users, Clock, Box, ArrowRight, Activity
} from 'lucide-react';

import GlassCard from '@/components/ui/GlassCard';
import { sendToast } from "@/components/ui/ToasterProvider";
import { ContainerScroll } from '@/components/ui/container-scroll-animation';

const monthlySpendData = [
    { name: 'Jan', spend: 45000 },
    { name: 'Feb', spend: 52000 },
    { name: 'Mar', spend: 38000 },
    { name: 'Apr', spend: 65000 },
    { name: 'May', spend: 48000 },
    { name: 'Jun', spend: 71000 },
];

export default function PlatformPreview() {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL || 'http://localhost:8501';

    const TitleComponent = (
        <div className="flex flex-col items-center space-y-4 mb-4">
            <h2 className="text-4xl md:text-[5rem] font-bold mt-1 leading-none tracking-tight text-white mb-2">
                OmniProcure <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-purple-500">
                    Command Center
                </span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
                Autonomous orchestration dashboard governed by Amazon Nova.
            </p>
            <div className="mt-8 flex justify-center pb-8">
                <Link
                    href={demoUrl}
                    onClick={() => sendToast("Accessing Secure Enterprise Portal...")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors backdrop-blur-md"
                >
                    Open Full Dashboard
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );

    return (
        <section id="platform" className="relative w-full bg-[#0A0A0A] text-white">
            <ContainerScroll titleComponent={TitleComponent}>
                <div className="h-full w-full bg-[#0A0A0A] text-white overflow-hidden flex flex-col">
                    {/* Mac-style Window Header */}
                    <div className="h-12 border-b border-white/10 bg-white/[0.02] flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>

                        <div className="absolute left-1/2 -translate-x-1/2 text-xs text-white/40 font-mono tracking-widest uppercase hidden md:block">
                            OmniProcure // Workspace // Active
                        </div>

                        {/* Live Badge */}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider hidden sm:block">Live System</span>
                        </div>
                    </div>

                    <div className="p-4 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]">
                        {/* Top Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <GlassCard className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-4 p-4 hover:border-[#3b82f6]/50 transition-colors bg-black/60">
                                <div className="p-2 sm:p-3 bg-blue-500/10 rounded-xl shrink-0">
                                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#3b82f6]" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-white/50 font-medium">Active Orders</p>
                                    <p className="text-xl sm:text-3xl font-bold">24</p>
                                </div>
                            </GlassCard>

                            <GlassCard className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-4 p-4 hover:border-[#3b82f6]/50 transition-colors bg-black/60">
                                <div className="p-2 sm:p-3 bg-blue-500/10 rounded-xl shrink-0">
                                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-[#3b82f6]" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-white/50 font-medium">Budget Used</p>
                                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-1 sm:gap-2">
                                        <p className="text-xl sm:text-3xl font-bold">73%</p>
                                        <span className="text-[10px] sm:text-xs text-green-400 mb-1">+2.4%</span>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-4 p-4 hover:border-[#3b82f6]/50 transition-colors bg-black/60 hidden md:flex">
                                <div className="p-3 bg-blue-500/10 rounded-xl shrink-0">
                                    <Users className="w-6 h-6 text-[#3b82f6]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/50 font-medium">Active Suppliers</p>
                                    <p className="text-3xl font-bold">3</p>
                                </div>
                            </GlassCard>

                            <GlassCard className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-4 p-4 hover:border-[#3b82f6]/50 transition-colors bg-black/60 hidden md:flex">
                                <div className="p-3 bg-blue-500/10 rounded-xl shrink-0">
                                    <Clock className="w-6 h-6 text-[#3b82f6]" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/50 font-medium">Avg Cycle</p>
                                    <p className="text-3xl font-bold">&lt;4m</p>
                                </div>
                            </GlassCard>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                            {/* Spend Chart */}
                            <GlassCard className="flex flex-col p-4 sm:p-6 bg-black/60 h-full">
                                <div className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
                                    <h3 className="text-sm sm:text-lg font-semibold text-white flex items-center gap-2">
                                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6]" />
                                        Monthly Spend Traces
                                    </h3>
                                    <span className="text-[10px] sm:text-xs font-mono text-white/40">YTD '26</span>
                                </div>
                                <div className="flex-1 w-full min-h-0 bg-black/20 rounded-lg flex items-center justify-center">
                                    {isMounted ? (
                                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                            <BarChart data={monthlySpendData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                                                    dy={10}
                                                />
                                                <YAxis hide domain={[0, 'auto']} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
                                                />
                                                <Bar dataKey="spend" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} animationDuration={1500} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="w-full h-full flex flex-row items-end justify-around p-4 opacity-50">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="w-8 bg-[#3b82f6]/20 rounded-t-sm" style={{ height: `${20 + Math.random() * 60}%` }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </GlassCard>

                            {/* Orders Table */}
                            <GlassCard className="flex flex-col p-4 sm:p-6 bg-black/60 h-full">
                                <h3 className="text-sm sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2 shrink-0">
                                    <Box className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6]" />
                                    Recent Orchestrations
                                </h3>
                                <div className="space-y-3 sm:space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
                                    {/* Row 1 */}
                                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-colors group cursor-default">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                                <Box className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-semibold text-white truncate">ADH-001</p>
                                                <p className="text-[10px] sm:text-xs text-white/50 truncate">Industrial Adhesive</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-2">
                                            <p className="text-xs sm:text-sm font-bold text-white">$42,365</p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-wide bg-green-500/10 text-green-400 border border-green-500/20">
                                                APPROVED
                                            </span>
                                        </div>
                                    </div>

                                    {/* Row 2 */}
                                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-colors group cursor-default">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                                                <Box className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-semibold text-white truncate">GLV-003</p>
                                                <p className="text-[10px] sm:text-xs text-white/50 truncate">Nitrile Gloves</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-2">
                                            <p className="text-xs sm:text-sm font-bold text-white">$8,140</p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-wide bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                                PENDING
                                            </span>
                                        </div>
                                    </div>

                                    {/* Row 3 */}
                                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-colors group cursor-default">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Box className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs sm:text-sm font-semibold text-white truncate">FST-012</p>
                                                <p className="text-[10px] sm:text-xs text-white/50 truncate">Steel Fasteners</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-2">
                                            <p className="text-xs sm:text-sm font-bold text-white">$3,290</p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold tracking-wide bg-blue-500/10 text-[#3b82f6] border border-blue-500/20 animate-pulse">
                                                PROCESSING
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </ContainerScroll>
        </section>
    );
}
