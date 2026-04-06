import { useState } from "react";

interface SimulateAttackButtonProps {
    userId: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SimulateAttackButton({ userId }: SimulateAttackButtonProps) {
    const [loading, setLoading] = useState(false);
    const [triggered, setTriggered] = useState(false);

    async function handleAttack() {
        setLoading(true);
        try {
            await fetch(
                `${API_URL}/api/simulate-attack?userId=${encodeURIComponent(userId)}`,
                { method: "POST" }
            );
            setTriggered(true);
            setTimeout(() => setTriggered(false), 3000);
        } catch (err) {
            console.error("Attack simulation failed:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleAttack}
            disabled={loading}
            className={`
        relative group px-6 py-3 rounded-xl font-semibold text-sm
        border-2 border-red-500/60 text-red-400
        bg-red-500/5 hover:bg-red-500/15
        transition-all duration-300 ease-out
        hover:border-red-400 hover:text-red-300
        hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${triggered ? "border-red-400 bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]" : ""}
      `}
        >
            <span className="flex items-center gap-2">
                {loading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                ) : (
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                )}
                {triggered ? "Attack Triggered!" : "Simulate Session Hijack"}
            </span>
        </button>
    );
}
