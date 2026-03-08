"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Save, Loader2, CheckCircle2, User, Building2, MapPin, AlignLeft, ShieldCheck } from "lucide-react";

type ProfileData = {
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
    role: "Buyer" | "Supplier";
    city: string;
    country: string;
    bio: string;
};

export default function ProfilePage() {
    const [formData, setFormData] = useState<ProfileData>({
        fullName: "",
        email: "",
        phone: "",
        companyName: "",
        role: "Buyer",
        city: "",
        country: "",
        bio: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [completionPercent, setCompletionPercent] = useState(0);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            // 1. Get real email from Cognito
            const user = await getCurrentUser();
            const userEmail = (user as { username?: string })?.username || "";

            // 2. Load from localStorage if exists
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem("omniprocure_profile");
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (mounted) {
                            setFormData({ ...parsed, email: userEmail || parsed.email }); // Enforce Cognito email
                            calculateCompletion({ ...parsed, email: userEmail || parsed.email });
                        }
                    } catch (e) { }
                } else if (mounted) {
                    setFormData(prev => ({ ...prev, email: userEmail }));
                    calculateCompletion({ ...formData, email: userEmail });
                }
            }

            if (mounted) setLoading(false);
        };

        loadData();
        return () => { mounted = false; };
    }, []);

    const calculateCompletion = (data: ProfileData) => {
        const fields = ['fullName', 'email', 'phone', 'companyName', 'role', 'city', 'country', 'bio'];
        let filled = 0;
        fields.forEach(field => {
            if (data[field as keyof ProfileData] && data[field as keyof ProfileData].toString().trim() !== "") {
                filled++;
            }
        });
        setCompletionPercent(Math.round((filled / fields.length) * 100));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const newData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newData);
        // Don't calculate completion immediately on every keystroke to avoid UI jitter,
        // do it on save instead, or just let it update live smoothly.
        calculateCompletion(newData);
        setSuccess(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        // Simulate API Call delay 
        setTimeout(() => {
            localStorage.setItem("omniprocure_profile", JSON.stringify(formData));
            setSaving(false);
            setSuccess(true);
            calculateCompletion(formData);

            // Auto-hide success message
            setTimeout(() => setSuccess(false), 3000);
        }, 800);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
            </div>
        );
    }

    const initials = formData.fullName
        ? formData.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
        : formData.email.substring(0, 2).toUpperCase();

    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

            <AnimatedSection>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">My Profile</h1>
                <p className="text-white/50 text-sm">Manage your enterprise identity and corporate contact details.</p>
            </AnimatedSection>

            {/* Completion Header */}
            <AnimatedSection delay={0.1}>
                <GlassCard className="p-6 border-[#3b82f6]/20 bg-[#3b82f6]/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-lg text-white">Profile Strength</h3>
                            <p className="text-sm text-white/50 mt-1">Complete profiles rank higher in supplier matching algorithms.</p>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-1/2">
                            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#3b82f6] to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${completionPercent}%` }}
                                />
                            </div>
                            <span className="font-bold text-lg text-white w-12 text-right">{completionPercent}%</span>
                        </div>
                    </div>
                </GlassCard>
            </AnimatedSection>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                {/* Left Column: Avatar & Role */}
                <AnimatedSection delay={0.2} className="lg:col-span-1 space-y-6">
                    <GlassCard className="p-6 flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#3b82f6] to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-blue-500/20 mb-6">
                            {initials || "OP"}
                        </div>
                        <h2 className="text-xl font-bold text-white truncate w-full px-2">{formData.fullName || "Corporate User"}</h2>
                        <p className="text-sm text-white/50 mt-1 mb-6 truncate w-full px-2">{formData.email}</p>

                        <div className="w-full text-left space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Network Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#3b82f6]/50 transition-all font-medium appearance-none"
                            >
                                <option value="Buyer" className="bg-[#0A0A0A]">Corporate Buyer</option>
                                <option value="Supplier" className="bg-[#0A0A0A]">Verified Supplier</option>
                            </select>
                        </div>
                    </GlassCard>
                </AnimatedSection>

                {/* Right Column: Fields */}
                <AnimatedSection delay={0.3} className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Full Name
                                </label>
                                <input
                                    type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm"
                                    placeholder="Jane Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Corporate Email (Read Only)</label>
                                <input
                                    type="email" value={formData.email} disabled
                                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/5 text-white/50 focus:outline-none cursor-not-allowed text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5" /> Company Name
                                </label>
                                <input
                                    type="text" name="companyName" value={formData.companyName} onChange={handleChange} required
                                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm"
                                    placeholder="Acme Corp LLC"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Phone Number</label>
                                <input
                                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5" /> City
                                </label>
                                <input
                                    type="text" name="city" value={formData.city} onChange={handleChange}
                                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm"
                                    placeholder="San Francisco"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Country</label>
                                <input
                                    type="text" name="country" value={formData.country} onChange={handleChange}
                                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm"
                                    placeholder="United States"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                                    <AlignLeft className="w-3.5 h-3.5" /> Bio / About
                                </label>
                                <textarea
                                    name="bio" value={formData.bio} onChange={handleChange} rows={4}
                                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#3b82f6]/50 transition-all text-sm resize-none"
                                    placeholder="Tell us about your organization's core competencies or procurement needs..."
                                />
                            </div>

                        </div>

                        <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                            {success ? (
                                <div className="flex items-center text-green-400 text-sm font-medium animate-in fade-in">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Profile synchronized successfully
                                </div>
                            ) : (
                                <div /> // empty flex placeholder
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-blue-600 text-white text-sm font-semibold transition-all disabled:opacity-50 border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            >
                                {saving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Save Changes</>
                                )}
                            </button>
                        </div>
                    </GlassCard>
                </AnimatedSection>
            </form>

        </div>
    );
}
