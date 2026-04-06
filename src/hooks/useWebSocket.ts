import { useEffect, useRef, useState, useCallback } from "react";
import type { ScoreUpdate } from "../types";

const MAX_HISTORY = 60;
const MAX_EVENTS = 20;

interface EventLogEntry {
    message: string;
    timestamp: number;
    riskLevel: ScoreUpdate["riskLevel"];
}

function riskLabel(level: ScoreUpdate["riskLevel"]): string {
    switch (level) {
        case "normal":
            return "Session normal — authenticated";
        case "mild":
            return "Mild anomaly detected — monitoring";
        case "moderate":
            return "Anomaly detected — confirm identity";
        case "high":
            return "High risk — step-up MFA required";
        case "severe":
            return "Severe risk — session terminated";
    }
}

export function useWebSocket(userId: string) {
    const [currentScore, setCurrentScore] = useState<ScoreUpdate | null>(null);
    const [scoreHistory, setScoreHistory] = useState<ScoreUpdate[]>([]);
    const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const reconnectAttemptRef = useRef(0);

    const connect = useCallback(() => {
        if (!userId) return;

        const wsUrl = `ws://localhost:5000/ws/score?userId=${encodeURIComponent(userId)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            reconnectAttemptRef.current = 0;
        };

        ws.onmessage = (event) => {
            try {
                const data: ScoreUpdate = JSON.parse(event.data);
                setCurrentScore(data);

                setScoreHistory((prev) => {
                    const next = [...prev, data];
                    return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
                });

                setEventLog((prev) => {
                    const entry: EventLogEntry = {
                        message: riskLabel(data.riskLevel),
                        timestamp: data.timestamp,
                        riskLevel: data.riskLevel,
                    };
                    const next = [entry, ...prev];
                    return next.length > MAX_EVENTS ? next.slice(0, MAX_EVENTS) : next;
                });
            } catch {
                // ignore malformed messages
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            // Exponential backoff reconnect
            const delay = Math.min(1000 * 2 ** reconnectAttemptRef.current, 30000);
            reconnectAttemptRef.current += 1;
            reconnectTimeoutRef.current = setTimeout(connect, delay);
        };

        ws.onerror = () => {
            ws.close();
        };
    }, [userId]);

    useEffect(() => {
        connect();
        return () => {
            wsRef.current?.close();
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    return { currentScore, scoreHistory, eventLog, isConnected };
}
