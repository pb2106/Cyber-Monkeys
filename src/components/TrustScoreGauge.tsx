import { useMemo } from "react";

interface TrustScoreGaugeProps {
    score: number;
}

export default function TrustScoreGauge({ score }: TrustScoreGaugeProps) {
    const clampedScore = Math.max(0, Math.min(100, score));

    const { color, glowColor, label } = useMemo(() => {
        if (clampedScore > 70)
            return { color: "#22c55e", glowColor: "rgba(34,197,94,0.3)", label: "Trusted" };
        if (clampedScore > 40)
            return { color: "#f59e0b", glowColor: "rgba(245,158,11,0.3)", label: "Caution" };
        return { color: "#ef4444", glowColor: "rgba(239,68,68,0.3)", label: "At Risk" };
    }, [clampedScore]);

    // SVG arc geometry
    const size = 280;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;

    // Arc from 135° to 405° (270° sweep)
    const startAngle = 135;
    const totalSweep = 270;
    const endAngle = startAngle + (clampedScore / 100) * totalSweep;

    function polarToCartesian(angle: number) {
        const rad = ((angle - 90) * Math.PI) / 180;
        return {
            x: cx + radius * Math.cos(rad),
            y: cy + radius * Math.sin(rad),
        };
    }

    const bgStart = polarToCartesian(startAngle);
    const bgEnd = polarToCartesian(startAngle + totalSweep);
    const bgLargeArc = totalSweep > 180 ? 1 : 0;
    const bgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${bgLargeArc} 1 ${bgEnd.x} ${bgEnd.y}`;

    const valStart = polarToCartesian(startAngle);
    const valEnd = polarToCartesian(endAngle);
    const sweep = (clampedScore / 100) * totalSweep;
    const valLargeArc = sweep > 180 ? 1 : 0;
    const valPath =
        clampedScore > 0
            ? `M ${valStart.x} ${valStart.y} A ${radius} ${radius} 0 ${valLargeArc} 1 ${valEnd.x} ${valEnd.y}`
            : "";

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="drop-shadow-lg"
                >
                    {/* Glow filter */}
                    <defs>
                        <filter id="gauge-glow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background track */}
                    <path
                        d={bgPath}
                        fill="none"
                        stroke="#2a2d3a"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />

                    {/* Active arc */}
                    {clampedScore > 0 && (
                        <path
                            d={valPath}
                            fill="none"
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            filter="url(#gauge-glow)"
                            style={{
                                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                        />
                    )}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="text-6xl font-bold tabular-nums transition-colors duration-700"
                        style={{ color }}
                    >
                        {Math.round(clampedScore)}
                    </span>
                    <span className="text-sm text-gray-400 mt-1 uppercase tracking-widest">
                        Trust Score
                    </span>
                </div>
            </div>

            {/* Label badge */}
            <span
                className="px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-700"
                style={{
                    backgroundColor: glowColor,
                    color,
                    boxShadow: `0 0 20px ${glowColor}`,
                }}
            >
                {label}
            </span>
        </div>
    );
}
