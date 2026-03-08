"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth";
import { User, LogOut, Loader2 } from "lucide-react";

export function AuthButtons() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkAuthStatus = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (isMounted) {
                    setUser(currentUser as { username: string } | null);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setUser(null);
                    setIsLoading(false);
                }
            }
        };

        checkAuthStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSignOut = async () => {
        setIsLoading(true); // Show loader immediately on click for UX
        await signOut();
        setUser(null);
        setIsLoading(false);
        router.push("/");
        router.refresh();
    };

    if (isLoading) {
        // Skeleton loader matching the footprint
        return (
            <div className="flex items-center space-x-3 opacity-50">
                <div className="h-9 w-24 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-9 w-28 bg-[#3b82f6]/20 border border-[#3b82f6]/30 rounded-lg animate-pulse" />
            </div>
        );
    }

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                    <User className="w-4 h-4 text-[#3b82f6]" />
                    <span className="hidden sm:inline-block truncate max-w-[120px]">{user.username}</span>
                </Link>
                <button
                    onClick={handleSignOut}
                    className="p-2 border border-white/20 rounded-lg text-white/80 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                    title="Sign Out"
                >
                    <LogOut size={16} />
                </button>
            </div>
        );
    }

    // Not logged in
    return (
        <div className="flex items-center space-x-3">
            <Link
                href="/auth/login"
                className="px-4 py-2 border border-white/20 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 hover:border-white/40 transition-all"
            >
                Sign In
            </Link>
            <Link
                href="/auth/register"
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#3b82f6] to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all"
            >
                Get Started
            </Link>
        </div>
    );
}
