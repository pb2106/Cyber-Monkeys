import { useEffect, useState } from "react";
import type { EnrollmentStatusData } from "../types";

interface EnrollmentStatusProps {
    userId: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EnrollmentStatus({ userId }: EnrollmentStatusProps) {
    const [status, setStatus] = useState<EnrollmentStatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        async function fetchStatus() {
            try {
                const res = await fetch(
                    `${API_URL}/api/status?userId=${encodeURIComponent(userId)}`
                );
                if (!res.ok) throw new Error("Failed to fetch status");
                const data = await res.json();
                setStatus(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        fetchStatus();
    }, [userId]);

    if (loading) {
        return (
            <div className="bg-[#1a1d27] rounded-2xl p-5 border border-gray-800/50 animate-pulse">
                <div className="h-4 bg-gray-700/50 rounded w-1/3 mb-4" />
                <div className="space-y-3">
                    <div className="h-3 bg-gray-700/30 rounded w-full" />
                    <div className="h-3 bg-gray-700/30 rounded w-2/3" />
                    <div className="h-3 bg-gray-700/30 rounded w-1/2" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#1a1d27] rounded-2xl p-5 border border-red-900/30">
                <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-3">
                    Enrollment Status
                </h3>
                <p className="text-red-400 text-sm">⚠ {error}</p>
            </div>
        );
    }

    if (!status) return null;

    const isTrained = status.modelStatus === "trained";

    return (
        <div className="bg-[#1a1d27] rounded-2xl p-5 border border-gray-800/50">
            <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-4">
                Enrollment Status
            </h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">User ID</span>
                    <span className="text-gray-200 text-sm font-mono bg-gray-800/50 px-2.5 py-1 rounded-md">
                        {status.userId}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Enrolled</span>
                    <span className="text-gray-300 text-sm">
                        {new Date(status.enrollmentTime).toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Training Samples</span>
                    <span className="text-gray-300 text-sm font-mono">
                        {status.trainingSamples}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Model</span>
                    <span
                        className={`text-sm font-semibold px-2.5 py-1 rounded-full ${isTrained
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                    >
                        {isTrained ? "✓ Trained" : "⏳ Not Trained"}
                    </span>
                </div>
            </div>
        </div>
    );
}
