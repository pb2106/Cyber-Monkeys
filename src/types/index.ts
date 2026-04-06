export interface KeystrokeEvent {
  key: string;
  type: "keydown" | "keyup";
  timestamp: number; // Date.now()
}

export interface ScoreUpdate {
  score: number;        // 0–100
  riskLevel: "normal" | "mild" | "moderate" | "high" | "severe";
  timestamp: number;
}

export interface EnrollmentStatusData {
  userId: string;
  enrollmentTime: string;
  trainingSamples: number;
  modelStatus: "trained" | "not trained";
}
