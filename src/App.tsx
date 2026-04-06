import { Routes, Route, Navigate } from "react-router-dom";
import EnrollPage from "./pages/EnrollPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/enroll" element={<EnrollPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/enroll" replace />} />
    </Routes>
  );
}
