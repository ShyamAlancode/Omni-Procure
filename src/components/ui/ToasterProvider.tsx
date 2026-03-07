"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Radix Toast requires some generic CSS which we'll handle inline for simplicity
// But since Radix UI might not be installed, we will create a simple custom DOM Toaster 
// that listens to a custom window event "show-toast". This requires zero dependencies.

export default function ToasterProvider() {
    const [toasts, setToasts] = useState<{ id: number; message: string; visible: boolean }[]>([]);

    useEffect(() => {
        const handleAddToast = (e: Event) => {
            const customEvent = e as CustomEvent<{ message: string }>;
            const newToast = { id: Date.now(), message: customEvent.detail.message, visible: true };

            setToasts((prev) => [...prev, newToast]);

            // Hide after 3 seconds
            setTimeout(() => {
                setToasts((prev) =>
                    prev.map((t) => (t.id === newToast.id ? { ...t, visible: false } : t))
                );

                // Remove from DOM after transition
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
                }, 300);
            }, 3000);
        };

        window.addEventListener("show-toast", handleAddToast);
        return () => window.removeEventListener("show-toast", handleAddToast);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 bg-[#0A0A0A] border border-white/10 shadow-2xl rounded-lg p-4 min-w-[300px] transition-all duration-300 ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}
                >
                    <Loader2 className="w-5 h-5 text-[#3b82f6] animate-spin" />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">Action Triggered</span>
                        <span className="text-xs text-white/60">{toast.message}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Helper to trigger toasts anywhere in the app
export const sendToast = (message: string) => {
    if (typeof window !== "undefined") {
        const event = new CustomEvent("show-toast", { detail: { message } });
        window.dispatchEvent(event);
    }
};
