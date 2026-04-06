import type { ScoreUpdate } from "../types";

interface EventLogEntry {
    message: string;
    timestamp: number;
    riskLevel: ScoreUpdate["riskLevel"];
}

interface EventLogProps {
    events: EventLogEntry[];
}

function riskColor(level: ScoreUpdate["riskLevel"]) {
    switch (level) {
        case "normal":
            return "text-emerald-400";
        case "mild":
            return "text-amber-400";
        case "moderate":
            return "text-orange-400";
        case "high":
            return "text-red-400";
        case "severe":
            return "text-red-500";
    }
}

function riskDot(level: ScoreUpdate["riskLevel"]) {
    switch (level) {
        case "normal":
            return "bg-emerald-400";
        case "mild":
            return "bg-amber-400";
        case "moderate":
            return "bg-orange-400";
        case "high":
            return "bg-red-400";
        case "severe":
            return "bg-red-500";
    }
}

function formatTimestamp(ts: number) {
    return new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export default function EventLog({ events }: EventLogProps) {
    return (
        <div className="bg-[#1a1d27] rounded-2xl p-5 border border-gray-800/50">
            <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-wider mb-4">
                Session Events
            </h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                {events.length === 0 && (
                    <p className="text-gray-600 text-sm py-4 text-center">
                        No events yet — waiting for score data…
                    </p>
                )}
                {events.map((event, idx) => (
                    <div
                        key={`${event.timestamp}-${idx}`}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                    >
                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                            <span
                                className={`w-2 h-2 rounded-full ${riskDot(event.riskLevel)} ${event.riskLevel === "high" || event.riskLevel === "severe"
                                        ? "animate-pulse"
                                        : ""
                                    }`}
                            />
                            <span className="text-xs text-gray-500 font-mono w-[70px]">
                                {formatTimestamp(event.timestamp)}
                            </span>
                        </div>
                        <span className={`text-sm ${riskColor(event.riskLevel)}`}>
                            {event.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
