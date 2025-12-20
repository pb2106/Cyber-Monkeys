import { Routes, Route } from 'react-router-dom'

// Prüfen App Pages
import Home from './pages/Prufen/Home'
import Scan from './pages/Prufen/Scan'
import Consent from './pages/Prufen/Consent'
import Success from './pages/Prufen/Success'

// Mock Verifier App Pages
import Login from './pages/MockVerifier/Login'
import VerifyAge from './pages/MockVerifier/VerifyAge'
import Verified from './pages/MockVerifier/Verified'

function App() {
    return (
        <Routes>
            {/* Prüfen App */}
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/consent/:request_id" element={<Consent />} />
            <Route path="/success" element={<Success />} />

            {/* Mock Verifier App */}
            <Route path="/mock-verifier/login" element={<Login />} />
            <Route path="/mock-verifier/verify-age" element={<VerifyAge />} />
            <Route path="/mock-verifier/verified" element={<Verified />} />
        </Routes>
    )
}

export default App
