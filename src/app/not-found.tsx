import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center text-white overflow-hidden relative">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
                <h1 className="text-[150px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                    404
                </h1>

                <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent my-6"></div>

                <h2 className="text-2xl font-bold mb-4 tracking-tight">System Node Unreachable</h2>

                <p className="text-white/50 text-center max-w-sm mb-10 text-sm">
                    The autonomous agent cannot locate the path you requested in the procurement pipeline. It may have been archived or deleted.
                </p>

                <Link href="/">
                    <GradientButton className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Return to Dashboard
                    </GradientButton>
                </Link>
            </div>

            <div className="absolute bottom-10 left-0 w-full flex justify-center">
                <p className="text-[10px] text-white/30 tracking-widest uppercase font-mono">
                    OmniProcure // Error State // AWS Strands
                </p>
            </div>
        </div>
    );
}
