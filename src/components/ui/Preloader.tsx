"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hide preloader when the window fully loads
        const handleLoad = () => {
            // Add a slight delay for aesthetic purposes
            setTimeout(() => setLoading(false), 800);
        };

        if (document.readyState === "complete") {
            handleLoad();
        } else {
            window.addEventListener("load", handleLoad);
            return () => window.removeEventListener("load", handleLoad);
        }
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A]"
                >
                    <div className="relative w-20 h-20 mb-8">
                        <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#3b82f6] animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-t-2 border-l-2 border-orange-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                        <div className="absolute inset-4 rounded-full border-b-2 border-white/50 animate-[spin_2s_linear_infinite]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        </div>
                    </div>

                    <div className="overflow-hidden">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <h2 className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
                                Omni<span className="text-[#3b82f6]">Procure</span>
                            </h2>
                            <p className="text-xs text-white/40 tracking-[0.2em] mt-2 uppercase">
                                Initializing Agents
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
