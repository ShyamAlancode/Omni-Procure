"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import {
    FileText,
    ShoppingCart,
    TrendingUp,
    CheckCircle2,
    Clock,
    ArrowRight,
    Plus
} from "lucide-react";

import AIOrchestratorPanel from "@/components/ui/AIOrchestratorPanel";

export default function DashboardHome() {
    const [user, setUser] = useState<{ username?: string } | null>(null);
    const [profileData, setProfileData] = useState<{ role?: string; completionPercent?: number }>({});

    useEffect(() => {
        let mounted = true;
        getCurrentUser().then((res) => {
            if (mounted && res) {
                setUser(res as { username?: string });
            }
        });

        // Load profile data from localStorage to calculate completeness & role
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("omniprocure_profile");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);

                    // Calculate completion %
                    const fields = ['fullName', 'phone', 'companyName', 'role', 'city', 'country', 'bio'];
                    let filled = 0;
                    fields.forEach(f => { if (parsed[f]) filled++; });
                    const percent = Math.round((filled / fields.length) * 100);

                    if (mounted) {
                        setProfileData({
                            role: parsed.role || "Buyer",
                            completionPercent: percent
                        });
                    }
                } catch (e) { }
            } else {
                if (mounted) setProfileData({ role: "Buyer", completionPercent: 15 }); // 15% for just having email
            }
        }

        return () => { mounted = false; };
    }, []);

    const displayName = user?.username?.split('@')[0] || "User";
    const isSupplier = profileData.role === 'Supplier';

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

            {/* Welcome Banner */}
            <AnimatedSection className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Welcome back, {displayName}! 👋
                        </h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${isSupplier ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }`}>
                            {profileData.role || "Buyer"}
                        </span>
                    </div>
                    <p className="text-white/50 text-sm">Here's what's happening in your procurement workspace today.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/listings/new"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-400/50"
                    >
                        <Plus className="w-4 h-4" />
                        Post a Listing
                    </Link>
                    <Link
                        href="/dashboard/listings"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all border border-white/10"
                    >
                        Browse RFQs
                    </Link>
                </div>
            </AnimatedSection>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <AnimatedSection delay={0.1}>
                    <GlassCard className="p-5 flex flex-col border-white/5 hover:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white/60 text-sm font-medium">Active Listings</h3>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-[#3b82f6]" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-white">4</span>
                            <span className="text-xs font-medium text-green-400 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" /> +2 this week</span>
                        </div>
                    </GlassCard>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                    <GlassCard className="p-5 flex flex-col border-white/5 hover:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white/60 text-sm font-medium">Orders Placed</h3>
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <ShoppingCart className="w-4 h-4 text-purple-400" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-white">12</span>
                        </div>
                    </GlassCard>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                    <GlassCard className="p-5 flex flex-col border-white/5 hover:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white/60 text-sm font-medium">Orders Received</h3>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-white">
                                {isSupplier ? "8" : "0"}
                            </span>
                        </div>
                    </GlassCard>
                </AnimatedSection>

                <AnimatedSection delay={0.4}>
                    <GlassCard className="p-5 flex flex-col border-white/5 hover:border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white/60 text-sm font-medium">Profile Score</h3>
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold tracking-tight text-white">{profileData.completionPercent || 0}%</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#3b82f6] to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${profileData.completionPercent || 0}%` }}
                            />
                        </div>
                        {(profileData.completionPercent || 0) < 100 && (
                            <Link href="/dashboard/profile" className="text-xs text-[#3b82f6] hover:text-blue-400 mt-3 font-medium flex items-center">
                                Complete your profile <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                        )}
                    </GlassCard>
                </AnimatedSection>
            </div>

            {/* OmniProcure AI Orchestrator Command Center */}
            <AnimatedSection delay={0.45} className="mt-8">
                <AIOrchestratorPanel />
            </AnimatedSection>

            {/* Recent Activity Section */}
            <AnimatedSection delay={0.5} className="mt-8">
                <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Recent Activity</h2>
                <GlassCard className="!p-0 border-white/5 overflow-hidden">
                    <ul className="divide-y divide-white/5">
                        {[
                            { id: 1, type: 'order', title: 'Purchase Order #PO-89241 generated', time: '2 hours ago', icon: ShoppingCart, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                            { id: 2, type: 'listing', title: 'New RFQ posted: "Q3 IT Hardware Resupply"', time: '5 hours ago', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                            { id: 3, type: 'status', title: 'Supplier "TechLogix" accepted PO-89230', time: 'Yesterday', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                            { id: 4, type: 'system', title: 'Budget Compliance Engine validated Q2 spend', time: '2 days ago', icon: Clock, color: 'text-white/70', bg: 'bg-white/10' },
                        ].map((activity) => (
                            <li key={activity.id} className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors flex items-start sm:items-center gap-4 group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{activity.title}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{activity.time}</p>
                                </div>
                                <div className="hidden sm:block">
                                    <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider font-bold text-white/50">
                                        {activity.type}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </GlassCard>
            </AnimatedSection>

        </div>
    );
}
