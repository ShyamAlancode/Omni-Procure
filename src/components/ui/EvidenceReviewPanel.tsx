import React from "react";

interface Check {
    check: string;
    passed: boolean;
    detail: string;
    confidence: number;
}

interface EvidenceResult {
    verdict: "APPROVED" | "NEEDS_REVIEW";
    confidence: number;
    checks: Check[];
    summary: string;
}

interface Props {
    evidence: EvidenceResult | null;
    screenshotB64: string | null;
}

export default function EvidenceReviewPanel({ evidence, screenshotB64 }: Props) {
    if (!evidence) return null;

    const isApproved = evidence.verdict === "APPROVED";

    return (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 mt-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    🔍 Evidence Review
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isApproved
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}>
                    {evidence.verdict}
                </span>
            </div>

            {/* Confidence Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Overall Confidence</span>
                    <span className="font-bold text-white">{evidence.confidence}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${evidence.confidence >= 75 ? "bg-green-500" :
                                evidence.confidence >= 50 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                        style={{ width: `${evidence.confidence}%` }}
                    />
                </div>
            </div>

            {/* Individual Checks */}
            <div className="space-y-2 mb-4">
                {evidence.checks.map((check, i) => (
                    <div key={i} className="flex items-start gap-3 bg-gray-800 rounded-lg p-2">
                        <span className="text-lg mt-0.5">{check.passed ? "✅" : "⚠️"}</span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-gray-300">
                                    {check.check.replace("_", " ")}
                                </span>
                                <span className="text-xs text-gray-500">{check.confidence}%</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{check.detail}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Screenshot */}
            {screenshotB64 && (
                <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">📸 Nova Act Screenshot</p>
                    <img
                        src={`data:image/png;base64,${screenshotB64}`}
                        alt="Supplier portal screenshot"
                        className="w-full rounded-lg border border-gray-700 max-h-48 object-cover"
                    />
                </div>
            )}

            {/* Summary */}
            <p className="text-xs text-gray-500 mt-3 text-center">{evidence.summary}</p>
        </div>
    );
}
