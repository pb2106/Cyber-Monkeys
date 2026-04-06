import { useRef, useCallback, useState } from "react";
import type { KeystrokeEvent } from "../types";

export function useKeystrokeCapture() {
    const eventsRef = useRef<KeystrokeEvent[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        eventsRef.current.push({
            key: e.key,
            type: "keydown",
            timestamp: Date.now(),
        });
        if (!isCapturing) setIsCapturing(true);
    }, [isCapturing]);

    const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
        eventsRef.current.push({
            key: e.key,
            type: "keyup",
            timestamp: Date.now(),
        });
    }, []);

    const getEvents = useCallback(() => {
        return [...eventsRef.current];
    }, []);

    const reset = useCallback(() => {
        eventsRef.current = [];
        setIsCapturing(false);
    }, []);

    return {
        handleKeyDown,
        handleKeyUp,
        getEvents,
        reset,
        isCapturing,
        eventCount: eventsRef.current.length,
    };
}
