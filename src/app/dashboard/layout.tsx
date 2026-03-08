"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth";
import {
    LayoutDashboard,
    User,
    FileText,
    ShoppingCart,
    Settings,
    LogOut,
    Menu,
    X,
    Loader2
} from "lucide-react";

const NAV_LINKS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
    { name: "Procurement Listings", href: "/dashboard/listings", icon: FileText },
    { name: "My Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ username?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        getCurrentUser().then((user) => {
            if (mounted) {
                setCurrentUser(user as { username?: string });
                setIsLoading(false);
            }
        }).catch(() => {
            if (mounted) setIsLoading(false);
        });
        return () => { mounted = false; };
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
            </div>
        );
    }

    const userInitials = currentUser?.username?.substring(0, 2).toUpperCase() || "OP";

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row font-sans text-white">

            {/* Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-50">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#3b82f6] flex items-center justify-center text-white font-bold">O</div>
                    <span className="font-bold tracking-tight">OmniProcure</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white/70 hover:text-white">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-[#0A0A0A] transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? "translate-x-0 pt-20" : "-translate-x-full pt-6"} 
        md:relative md:translate-x-0 md:pt-6
      `}>
                {/* Desktop Logo */}
                <div className="hidden md:flex px-6 mb-8 items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#3b82f6] flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]">O</div>
                    <span className="font-bold text-xl tracking-tight">OmniProcure</span>
                </div>

                {/* Links */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {NAV_LINKS.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard');

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                                        ? "bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }
                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-[#3b82f6]" : "text-white/40"}`} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer User Info */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3b82f6] to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                            {userInitials}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-medium text-white truncate">{currentUser?.username}</p>
                            <p className="text-xs text-white/40 truncate">Authenticated Session</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
                {/* Subtle Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-[#3b82f6]/5 blur-[120px] pointer-events-none rounded-full" />

                {/* Desktop Top Navbar inside Main */}
                <header className="hidden md:flex h-20 items-center justify-end px-8 border-b border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors mr-4">
                            Return to Landing Page
                        </Link>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-white/80 font-medium">{currentUser?.username}</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b82f6] to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg">
                                {userInitials}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content Injection */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10 w-full overflow-y-auto">
                    {children}
                </div>
            </main>

            {/* Mobile background overlay when menu open */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

        </div>
    );
}
