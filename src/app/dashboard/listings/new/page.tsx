"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { ArrowLeft, Loader2, Save, TagsIcon } from "lucide-react";
import type { Listing } from "../page";

export default function NewListingPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        category: "Electronics",
        description: "",
        budgetMin: "",
        budgetMax: "",
        deadline: "",
        tagsStr: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const tagsArray = formData.tagsStr.split(",").map(t => t.trim()).filter(t => t.length > 0);
        const newId = `RFQ-${Math.floor(1000 + Math.random() * 9000)}`;

        const newListing: Listing = {
            id: newId,
            title: formData.title,
            category: formData.category,
            description: formData.description,
            budgetMin: parseInt(formData.budgetMin) || 0,
            budgetMax: parseInt(formData.budgetMax) || 0,
            deadline: formData.deadline,
            status: "Active",
            postedAt: "Just now",
            tags: tagsArray
        };

        // Store in LocalStorage
        setTimeout(() => {
            const stored = localStorage.getItem("omniprocure_listings");
            let allListings: Listing[] = [];
            if (stored) {
                try { allListings = JSON.parse(stored); } catch (err) { }
            }
            allListings.unshift(newListing); // Add to top
            localStorage.setItem("omniprocure_listings", JSON.stringify(allListings));

            router.push("/dashboard/listings");
        }, 1000);
    };

    const categories = ["Electronics", "Raw Materials", "Logistics", "IT Services", "Office Supplies", "Other"];

    return (
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">

            <div className="mb-2">
                <Link href="/dashboard/listings" className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Listings
                </Link>
            </div>

            <AnimatedSection>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Post Procurement RFQ</h1>
                <p className="text-white/50 text-sm">Create a verifiable request for quotation broadcasted to the OmniProcure supplier network.</p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
                <GlassCard className="p-6 sm:p-8 border-[#3b82f6]/20 shadow-[0_0_30px_rgba(59,130,246,0.05)]">
                    <form onSubmit={handlePost} className="space-y-6">

                        {/* Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Listing Title</label>
                                <input
                                    type="text" name="title" value={formData.title} onChange={handleChange} required disabled={loading}
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 transition-all font-medium text-sm"
                                    placeholder="e.g. Q4 Enterprise Server Hardware"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Category</label>
                                <select
                                    name="category" value={formData.category} onChange={handleChange} disabled={loading}
                                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm appearance-none"
                                >
                                    {categories.map(cat => <option key={cat} value={cat} className="bg-[#0A0A0A]">{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Scope and Description</label>
                            <textarea
                                name="description" value={formData.description} onChange={handleChange} required disabled={loading} rows={5}
                                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm resize-none"
                                placeholder="Detail the specific requirements, compliance standards, and SLAs..."
                            />
                        </div>

                        {/* Budget & Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-white/5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Min Budget (USD)</label>
                                <input
                                    type="number" name="budgetMin" value={formData.budgetMin} onChange={handleChange} required disabled={loading} min="0"
                                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all font-mono text-sm"
                                    placeholder="25000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Max Budget (USD)</label>
                                <input
                                    type="number" name="budgetMax" value={formData.budgetMax} onChange={handleChange} required disabled={loading} min="0"
                                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all font-mono text-sm"
                                    placeholder="50000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Submission Deadline</label>
                                <input
                                    type="date" name="deadline" value={formData.deadline} onChange={handleChange} required disabled={loading}
                                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                <TagsIcon className="w-3.5 h-3.5" /> Metatags (Comma Separated)
                            </label>
                            <input
                                type="text" name="tagsStr" value={formData.tagsStr} onChange={handleChange} disabled={loading}
                                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm font-mono"
                                placeholder="Hardware, Compliance, Bulk Order"
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-6 mt-6 border-t border-white/10 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white text-base font-semibold transition-all disabled:opacity-50 border border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] w-full sm:w-auto"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Broadcasting to Network...</>
                                ) : (
                                    <><Save className="w-5 h-5" /> Publish RFQ</>
                                )}
                            </button>
                        </div>

                    </form>
                </GlassCard>
            </AnimatedSection>
        </div>
    );
}
