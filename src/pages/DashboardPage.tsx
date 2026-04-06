import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import TrustScoreGauge from "../components/TrustScoreGauge";
import ScoreChart from "../components/ScoreChart";
import EventLog from "../components/EventLog";
import SimulateAttackButton from "../components/SimulateAttackButton";
import EnrollmentStatus from "../components/EnrollmentStatus";

export default function DashboardPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const userId = searchParams.get("userId") || "demo-user";
    const { currentScore, scoreHistory, eventLog, isConnected } = useWebSocket(userId);

    const [totpInput, setTotpInput] = useState("");

    const score = currentScore?.score ?? 85;
    const riskLevel = currentScore?.riskLevel ?? "normal";

    function getStatusBanner() {
        if (score > 70) {
            return (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                        <p className="text-emerald-400 font-semibold text-sm">
                            Session normal — authenticated
                        </p>
                        <p className="text-emerald-500/60 text-xs mt-0.5">
                            Your typing pattern matches your enrolled profile
                        </p>
                    </div>
                </div>
            );
        }
        if (score > 40) {
            return (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                    <div>
                        <p className="text-amber-400 font-semibold text-sm">
                            Mild anomaly detected — monitoring
                        </p>
                        <p className="text-amber-500/60 text-xs mt-0.5">
                            Slight deviation from your normal behavior pattern
                        </p>
                    </div>
                </div>
            );
        }
        if (score > 20) {
            return (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-5 py-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
                        <div>
                            <p className="text-orange-400 font-semibold text-sm">
                                Anomaly detected — confirm identity
                            </p>
                            <p className="text-orange-500/60 text-xs mt-0.5">
                                Significant deviation requires identity confirmation
                            </p>
                        </div>
                    </div>
                    <button
                        className="px-5 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-300 text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]"
                        onClick={() => alert("Identity confirmed!")}
                    >
                        ✋ Confirm it's me
                    </button>
                </div>
            );
        }
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <div>
                        <p className="text-red-400 font-semibold text-sm">
                            High risk — step-up MFA required
                        </p>
                        <p className="text-red-500/60 text-xs mt-0.5">
                            Session may be compromised. Verify with TOTP code.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={totpInput}
                        onChange={(e) => setTotpInput(e.target.value)}
                        placeholder="Enter TOTP code"
                        maxLength={6}
                        className="bg-[#0f1117] border border-red-800/50 rounded-lg px-4 py-2.5 text-gray-200 text-sm font-mono w-40 focus:outline-none focus:ring-2 focus:ring-red-500/30 tracking-[0.3em] text-center placeholder:tracking-normal"
                    />
                    <button
                        className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                        onClick={() => {
                            if (totpInput.length === 6) alert("TOTP verified!");
                        }}
                    >
                        Verify
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1117] p-4 md:p-6 lg:p-8">
            {/* Top bar */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-white">
                        CBA Dashboard
                    </h1>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50">
                        <div
                            className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                                }`}
                        />
                        <span className="text-xs text-gray-400">
                            {isConnected ? "Live" : "Disconnected"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <SimulateAttackButton userId={userId} />
                    <button
                        onClick={() => navigate("/enroll")}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 border border-gray-700/50 hover:bg-gray-800/50 hover:text-gray-200 transition-all"
                    >
                        Re-enroll
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Status banner */}
                {getStatusBanner()}

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gauge — center on mobile, left col on desktop */}
                    <div className="lg:col-span-1 flex flex-col items-center justify-center bg-[#1a1d27] rounded-2xl p-8 border border-gray-800/50">
                        <TrustScoreGauge score={score} />
                        <div className="mt-4 text-center">
                            <p className="text-gray-500 text-xs uppercase tracking-wider">
                                Risk Level
                            </p>
                            <p
                                className={`text-sm font-semibold mt-1 capitalize ${riskLevel === "normal"
                                        ? "text-emerald-400"
                                        : riskLevel === "mild"
                                            ? "text-amber-400"
                                            : riskLevel === "moderate"
                                                ? "text-orange-400"
                                                : "text-red-400"
                                    }`}
                            >
                                {riskLevel}
                            </p>
                        </div>
                    </div>

                    {/* Chart — 2 cols on desktop */}
                    <div className="lg:col-span-2">
                        <ScoreChart data={scoreHistory} />
                    </div>
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <EnrollmentStatus userId={userId} />
                    </div>
                    <div className="lg:col-span-2">
                        <EventLog events={eventLog} />
                    </div>
                </div>
            </div>
        </div>
    );
}
