"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { ArrowLeft, Loader2, DollarSign, Clock, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import type { Listing } from "../page";

// We copy the mock array here as a fallback mechanism if LocalStorage fails or isn't populated on first load
const MOCK_FALLBACK: Listing[] = [
    { id: "RFQ-2041", title: "Q3 Enterprise Server Procurement", category: "Electronics", budgetMin: 45000, budgetMax: 60000, deadline: "2024-04-15", status: "Active", postedAt: "2 days ago", tags: ["Dell", "Rack Servers", "Data Center"], description: "Seeking vendor for 40x 2U Rack Servers." },
];

export default function ListingDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Attempt to locate the exact ID from localStorage listings array
        const stored = localStorage.getItem("omniprocure_listings");
        if (stored) {
            try {
                const parsed: Listing[] = JSON.parse(stored);
                const found = parsed.find(l => l.id === id);
                if (found) {
                    setListing(found);
                } else {
                    // Fallback check
                    setListing(MOCK_FALLBACK.find(l => l.id === id) || null);
                }
            } catch (e) { }
        } else {
            setListing(MOCK_FALLBACK.find(l => l.id === id) || null);
        }
        setLoading(false);
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Link href="/dashboard/listings" className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Listings
                </Link>
                <GlassCard className="p-12 text-center border-dashed border-red-500/20 bg-red-500/5">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Listing Not Found</h2>
                    <p className="text-sm text-white/50">The RFQ you are looking for does not exist or has been removed.</p>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">

            <div className="mb-2">
                <Link href="/dashboard/listings" className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Listings
                </Link>
            </div>

            <AnimatedSection>
                <GlassCard className={`p-6 sm:p-10 ${listing.status === 'Closed' ? 'opacity-80' : 'border-[#3b82f6]/20 shadow-[0_0_40px_rgba(59,130,246,0.05)]'}`}>
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-2.5 py-1 rounded text-xs uppercase font-bold tracking-wider border ${listing.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-white/40 border-white/10"
                                    }`}>
                                    {listing.status}
                                </span>
                                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{listing.category}</span>
                                <span className="text-xs text-white/30 ml-auto sm:ml-0 font-mono hidden sm:inline-block">ID: {listing.id}</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight tracking-tight">{listing.title}</h1>
                            <p className="text-sm text-white/40">Posted {listing.postedAt}</p>
                        </div>

                        {/* CTA Box */}
                        <div className="shrink-0 sm:w-64 bg-black/40 border border-white/10 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                            <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-2">Estimated Budget</p>
                            <div className="text-2xl font-bold text-[#3b82f6] font-mono mb-4">
                                ${listing.budgetMin.toLocaleString()} - ${listing.budgetMax.toLocaleString()}
                            </div>
                            <button
                                disabled={listing.status === 'Closed'}
                                className="w-full py-2.5 rounded-lg bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            >
                                {listing.status === 'Active' ? 'Express Interest' : 'RFQ Closed'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-white/10">
                        {/* Main Desc */}
                        <div className="md:col-span-3 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">Scope of Work</h3>
                                <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-6 rounded-xl border border-white/5">
                                    {listing.description}

                                    {/* Fake boilerplate data for visual bulk since descriptions are short */}
                                    {listing.description.length < 100 && (
                                        <span className="opacity-50 mt-4 block">
                                            This entails adherence to ISO 9001 compliance standards, 30-day net payment terms, logistics FOB to primary distribution centers, and mandatory QA integration with existing OmniProcure APIs.
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    Required Compliance Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {listing.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-medium border border-blue-500/20">
                                            {tag}
                                        </span>
                                    ))}
                                    <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20 flex items-center">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Identity
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right sidebar metrics */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start flex-col gap-2">
                                <p className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center">
                                    <Calendar className="w-3 h-3 mr-1.5" /> Deadline
                                </p>
                                <p className="text-white font-semibold font-mono">{listing.deadline}</p>
                                {listing.status === 'Active' && <p className="text-[10px] text-green-400 mt-1">Accepting submissions</p>}
                            </div>

                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start flex-col gap-2">
                                <p className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center">
                                    <Clock className="w-3 h-3 mr-1.5" /> Contract Type
                                </p>
                                <p className="text-white font-semibold">Fixed Source / B2B</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </AnimatedSection>

            {/* Similar Listings Stub */}
            <AnimatedSection delay={0.2} className="pt-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white tracking-tight">Similar Opportunities</h3>
                    <span className="text-sm text-[#3b82f6] cursor-pointer hover:underline">View all</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_FALLBACK.map((item, index) => (
                        <GlassCard key={index} className="p-5 flex flex-col group cursor-pointer hover:border-[#3b82f6]/30 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{item.category}</span>
                            </div>
                            <h4 className="font-bold text-sm text-white mb-2 line-clamp-2">{item.title}</h4>
                            <div className="mt-auto flex items-center justify-between pt-4 text-xs">
                                <span className="font-mono text-white/60">${item.budgetMax.toLocaleString()} Max</span>
                                <ChevronRight className="w-4 h-4 text-[#3b82f6] group-hover:translate-x-1 transition-transform" />
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </AnimatedSection>

        </div>
    );
}
