"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import { Loader2 } from "lucide-react";

export default function ProcurementLayout({ children }: { children: React.ReactNode }) {
    const [isAuthed, setIsAuthed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function checkSession() {
            try {
                const user = await getCurrentUser();
                if (user) {
                    setIsAuthed(true);
                } else {
                    router.push("/auth/login");
                }
            } catch {
                router.push("/auth/login");
            }
        }
        checkSession();
    }, [router]);

    if (!isAuthed) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" /> Authenticating Enterprise Session...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans text-white">
            <Navbar />
            <main className="flex-1 w-full h-[calc(100vh-64px)] overflow-hidden relative">
                {children}
            </main>
        </div>
    );
}
