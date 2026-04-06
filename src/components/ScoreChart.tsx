import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    ComposedChart,
} from "recharts";
import type { ScoreUpdate } from "../types";

interface ScoreChartProps {
    data: ScoreUpdate[];
}

function formatTime(ts: number) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function getScoreColor(score: number) {
    if (score > 70) return "#22c55e";
    if (score > 40) return "#f59e0b";
    return "#ef4444";
}

interface CustomDotProps {
    cx?: number;
    cy?: number;
    payload?: ScoreUpdate;
}

function CustomDot({ cx, cy, payload }: CustomDotProps) {
    if (!cx || !cy || !payload) return null;
    const color = getScoreColor(payload.score);
    return (
        <circle
            cx={cx}
            cy={cy}
            r={3}
            fill={color}
            stroke={color}
            strokeWidth={1}
            opacity={0.8}
        />
    );
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ScoreUpdate }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const color = getScoreColor(data.score);
    return (
        <div className="bg-[#1a1d27] border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
            <p className="text-gray-400 text-xs mb-1">{formatTime(data.timestamp)}</p>
            <p className="text-lg font-bold" style={{ color }}>
                Score: {data.score}
            </p>
            <p className="text-xs text-gray-500 capitalize">Risk: {data.riskLevel}</p>
        </div>
    );
}

export default function ScoreChart({ data }: ScoreChartProps) {
    return (
        <div className="bg-[#1a1d27] rounded-2xl p-5 border border-gray-800/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
                    Score Timeline
                </h3>
                <span className="text-xs text-gray-500">
                    Last {data.length} readings
                </span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
                <ComposedChart
                    data={data}
                    margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                    <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#2a2d3a"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatTime}
                        stroke="#4b5563"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke="#4b5563"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                        y={70}
                        stroke="#22c55e"
                        strokeDasharray="4 4"
                        strokeOpacity={0.4}
                    />
                    <ReferenceLine
                        y={40}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        strokeOpacity={0.4}
                    />
                    <ReferenceLine
                        y={20}
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                        strokeOpacity={0.4}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        fill="url(#scoreGradient)"
                        stroke="none"
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#818cf8"
                        strokeWidth={2.5}
                        dot={<CustomDot />}
                        activeDot={{ r: 5, fill: "#818cf8", strokeWidth: 2 }}
                        animationDuration={300}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
