"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import {
    Search,
    Filter,
    Plus,
    MapPin,
    Clock,
    DollarSign,
    ChevronRight,
    Loader2
} from "lucide-react";

export type Listing = {
    id: string;
    title: string;
    category: string;
    budgetMin: number;
    budgetMax: number;
    deadline: string;
    status: "Active" | "Closed";
    postedAt: string;
    tags: string[];
    description: string;
};

// Initial Mock Data Fallback
const MOCK_LISTINGS: Listing[] = [
    { id: "RFQ-2041", title: "Q3 Enterprise Server Procurement", category: "Electronics", budgetMin: 45000, budgetMax: 60000, deadline: "2024-04-15", status: "Active", postedAt: "2 days ago", tags: ["Dell", "Rack Servers", "Data Center"], description: "Seeking vendor for 40x 2U Rack Servers." },
    { id: "RFQ-2042", title: "Raw Lithium Supply Contract (6 Months)", category: "Raw Materials", budgetMin: 120000, budgetMax: 150000, deadline: "2024-03-30", status: "Active", postedAt: "1 week ago", tags: ["Battery Grade", "Lithium Carbonate"], description: "Monthly supply of 50 tonnes of Lithium Carbonate." },
    { id: "RFQ-2043", title: "Last Mile Logistics - EU Region", category: "Logistics", budgetMin: 80000, budgetMax: 100000, deadline: "2024-04-01", status: "Active", postedAt: "3 days ago", tags: ["EU", "Transport", "Freight"], description: "Looking for logistics partner for France and Germany fulfillment." },
    { id: "RFQ-2044", title: "Cloud Security Audit Services", category: "IT Services", budgetMin: 15000, budgetMax: 25000, deadline: "2024-05-10", status: "Active", postedAt: "4 hours ago", tags: ["Pen Testing", "AWS", "Compliance"], description: "Annual security audit and penetration testing for AWS infrastructure." },
    { id: "RFQ-2045", title: "Office Supplies Restock - Q2", category: "Office Supplies", budgetMin: 2000, budgetMax: 5000, deadline: "2024-03-25", status: "Closed", postedAt: "2 weeks ago", tags: ["Stationery", "Bulk"], description: "Standard office supplies for Chicago HQ." },
    { id: "RFQ-2046", title: "Industrial HVAC Maintenance", category: "IT Services", budgetMin: 12000, budgetMax: 18000, deadline: "2024-04-20", status: "Active", postedAt: "1 day ago", tags: ["Facilities", "Maintenance"], description: "Annual maintenance contract for fulfillment center HVAC systems." },
];

export default function ListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [status, setStatus] = useState("All");

    useEffect(() => {
        // Attempt to load from localStorage first (to include custom ones)
        const stored = localStorage.getItem("omniprocure_listings");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                    setListings(parsed);
                } else {
                    setListings(MOCK_LISTINGS);
                    localStorage.setItem("omniprocure_listings", JSON.stringify(MOCK_LISTINGS));
                }
            } catch (e) {
                setListings(MOCK_LISTINGS);
            }
        } else {
            setListings(MOCK_LISTINGS);
            localStorage.setItem("omniprocure_listings", JSON.stringify(MOCK_LISTINGS));
        }
        setLoading(false);
    }, []);

    // Filter Logic
    const filteredListings = listings.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = category === "All Categories" || item.category === category;
        const matchesStatus = status === "All" || item.status === status;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const categories = ["All Categories", "Electronics", "Raw Materials", "Logistics", "IT Services", "Office Supplies", "Other"];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

            {/* Header */}
            <AnimatedSection className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Procurement Listings</h1>
                    <p className="text-white/50 text-sm">Discover open Requests for Quotations (RFQs) and supply opportunities.</p>
                </div>
                <Link
                    href="/dashboard/listings/new"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white text-sm font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-400/50"
                >
                    <Plus className="w-4 h-4" />
                    Post New Listing
                </Link>
            </AnimatedSection>

            {/* Filters Bar */}
            <AnimatedSection delay={0.1}>
                <GlassCard className="p-4 flex flex-col md:flex-row gap-4 border-[#3b82f6]/10">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search listings by title or tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm font-mono"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm appearance-none sm:w-48"
                        >
                            {categories.map(cat => <option key={cat} value={cat} className="bg-[#0A0A0A]">{cat}</option>)}
                        </select>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-11 px-4 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm appearance-none min-w-32"
                        >
                            <option value="All" className="bg-[#0A0A0A]">All Status</option>
                            <option value="Active" className="bg-[#0A0A0A]">Active</option>
                            <option value="Closed" className="bg-[#0A0A0A]">Closed</option>
                        </select>
                    </div>
                </GlassCard>
            </AnimatedSection>

            {/* Grid */}
            <AnimatedSection delay={0.2}>
                {filteredListings.length === 0 ? (
                    <GlassCard className="p-12 flex flex-col items-center justify-center text-center border-dashed border-white/20 bg-white/[0.01]">
                        <Filter className="w-12 h-12 text-white/20 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No listings found</h3>
                        <p className="text-sm text-white/50 max-w-sm">We couldn't find any procurement listings matching your current filter criteria.</p>
                        <button
                            onClick={() => { setSearch(""); setCategory("All Categories"); setStatus("All"); }}
                            className="mt-6 text-sm text-[#3b82f6] font-medium hover:text-blue-400"
                        >
                            Clear all filters
                        </button>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings.map((item, index) => (
                            <GlassCard
                                key={item.id}
                                className={`p-6 flex flex-col group hover:border-[#3b82f6]/30 transition-all duration-300 ${item.status === 'Closed' ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{item.category}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${item.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-white/40 border-white/10"
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-[#3b82f6] transition-colors">
                                    {item.title}
                                </h3>

                                <div className="space-y-2 mb-6 flex-1 text-sm">
                                    <div className="flex items-center text-white/60">
                                        <DollarSign className="w-4 h-4 mr-2 opacity-50" />
                                        <span className="font-mono">${item.budgetMin.toLocaleString()} - ${item.budgetMax.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center text-white/60">
                                        <Clock className="w-4 h-4 mr-2 opacity-50" />
                                        <span>Closes: <span className="text-white/80">{item.deadline}</span></span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2">
                                        {item.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-white/50 text-[10px] font-medium border border-white/5">
                                                {tag}
                                            </span>
                                        ))}
                                        {item.tags.length > 3 && (
                                            <span className="px-2 py-0.5 rounded bg-white/5 text-white/40 text-[10px] font-medium border border-white/5">
                                                +{item.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-white/40">{item.postedAt} • {item.id}</span>
                                    <Link
                                        href={`/dashboard/listings/${item.id}`}
                                        className="flex items-center text-sm font-semibold text-[#3b82f6] group-hover:translate-x-1 transition-transform"
                                    >
                                        Details <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </AnimatedSection>
        </div>
    );
}
