import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useKeystrokeCapture } from "../hooks/useKeystrokeCapture";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SAMPLE_PARAGRAPH = `The quick brown fox jumped over the lazy dog near the riverbank. Every morning, 
she would sit by the window and watch the birds fly across the golden sky. 
Typing patterns are as unique as fingerprints — the rhythm, pressure, and timing 
of each keystroke create a behavioral signature that is nearly impossible to replicate. 
This is the foundation of continuous behavioral authentication, where identity 
is verified not by what you know, but by how you type.`;

export default function EnrollPage() {
    const navigate = useNavigate();
    const { handleKeyDown, handleKeyUp, getEvents } = useKeystrokeCapture();
    const [userId, setUserId] = useState("");
    const [typedText, setTypedText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const progress = Math.min(
        100,
        (typedText.length / SAMPLE_PARAGRAPH.replace(/\n/g, "").length) * 100
    );
    const isComplete = progress >= 95;

    async function handleSubmit() {
        if (!userId.trim()) {
            setError("Please enter a User ID");
            return;
        }
        if (!isComplete) {
            setError("Please finish typing the paragraph");
            return;
        }
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userId.trim(), events: getEvents() }),
            });
            if (!res.ok) throw new Error("Enrollment failed");
            navigate(`/dashboard?userId=${encodeURIComponent(userId.trim())}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Enrollment failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                            Enrollment Mode
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Behavioral Enrollment
                    </h1>
                    <p className="text-gray-400">
                        Type the paragraph below naturally to create your biometric profile
                    </p>
                </div>

                {/* User ID input */}
                <div className="mb-6">
                    <label className="block text-gray-400 text-sm mb-2 font-medium">
                        User ID
                    </label>
                    <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Enter your unique identifier"
                        className="w-full bg-[#1a1d27] border border-gray-700/50 rounded-xl px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                </div>

                {/* Sample paragraph */}
                <div className="bg-[#1a1d27] rounded-2xl p-6 border border-gray-800/50 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-500 text-sm font-medium">
                            Reference Text
                        </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm select-none">
                        {SAMPLE_PARAGRAPH}
                    </p>
                </div>

                {/* Typing area */}
                <div className="relative mb-4">
                    <textarea
                        ref={textareaRef}
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                        placeholder="Start typing the paragraph above…"
                        rows={6}
                        className="w-full bg-[#1a1d27] border border-gray-700/50 rounded-2xl px-5 py-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none font-mono text-sm leading-relaxed"
                    />
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 rounded-b-2xl overflow-hidden">
                        <div
                            className="h-full transition-all duration-300 ease-out rounded-b-2xl"
                            style={{
                                width: `${progress}%`,
                                background: isComplete
                                    ? "linear-gradient(90deg, #22c55e, #4ade80)"
                                    : "linear-gradient(90deg, #6366f1, #818cf8)",
                            }}
                        />
                    </div>
                </div>

                {/* Progress info */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-500 text-sm">
                        Progress: {Math.round(progress)}%
                    </span>
                    {isComplete && (
                        <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Ready to enroll
                        </span>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !isComplete || !userId.trim()}
                    className={`
            w-full py-4 rounded-xl font-semibold text-base transition-all duration-300
            ${isComplete && userId.trim()
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                        }
            disabled:opacity-50
          `}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Enrolling biometric profile…
                        </span>
                    ) : (
                        "Enroll & Continue →"
                    )}
                </button>

                {/* Skip to dashboard link */}
                <div className="text-center mt-4">
                    <button
                        onClick={() => {
                            const id = userId.trim() || "demo-user";
                            navigate(`/dashboard?userId=${encodeURIComponent(id)}`);
                        }}
                        className="text-gray-600 hover:text-gray-400 text-sm transition-colors underline underline-offset-4"
                    >
                        Skip to dashboard →
                    </button>
                </div>
            </div>
        </div>
    );
}
