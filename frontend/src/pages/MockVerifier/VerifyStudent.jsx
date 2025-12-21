import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, AlertTriangle, Loader2, Lock, GraduationCap } from 'lucide-react';
import api from '../../services/api';

export default function VerifyStudent() {
    const [proofRequest, setProofRequest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [polling, setPolling] = useState(false);
    const [proofData, setProofData] = useState(null);

    const userName = localStorage.getItem('user_name') || 'User';

    useEffect(() => {
        if (proofRequest && !proofData) {
            startPolling();
        }

        return () => {
            // Cleanup interval if component unmounts
            if (window.pollInterval) {
                clearInterval(window.pollInterval);
                window.pollInterval = null;
            }
            if (window.pollTimeout) {
                clearTimeout(window.pollTimeout);
                window.pollTimeout = null;
            }
            setPolling(false);
        };
    }, [proofRequest, proofData]);

    const startPolling = () => {
        // Clear any existing interval first
        if (window.pollInterval) {
            clearInterval(window.pollInterval);
        }
        if (window.pollTimeout) {
            clearTimeout(window.pollTimeout);
        }

        setPolling(true);
        const pollInterval = setInterval(async () => {
            try {
                if (!proofRequest?.proof_request_id) return;
                const res = await api.get(`/proof-requests/${proofRequest.proof_request_id}`);
                if (res.data.status === 'approved') {
                    console.log('Proof approved!');
                    clearInterval(pollInterval);
                    window.pollInterval = null;
                    setProofData(res.data);
                    setPolling(false);
                }
            } catch (err) {
                console.error('Poll error:', err);
            }
        }, 2000);
        window.pollInterval = pollInterval;
        const timeoutId = setTimeout(() => {
            if (window.pollInterval) {
                clearInterval(window.pollInterval);
                window.pollInterval = null;
            }
            setPolling(false);
        }, 120000);
        window.pollTimeout = timeoutId;
    };

    const requestProof = async () => {
        setLoading(true);
        try {
            const VERIFIER_API_KEY = 'pk_D9rCkll5Mn6Qc0o8QgOp5XYv4v8gvgDAQEqYuHS93rU';
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${VERIFIER_API_KEY}`
            };
            const body = {
                condition: 'student_status',
                expires_in: 300,
                callback_url: `${window.location.origin}/api/webhooks/proof-received`
            };
            const res = await fetch('/api/proof-requests/', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Failed to create proof request');
            }
            const data = await res.json();
            setProofRequest(data);
        } catch (err) {
            console.error('Proof request error:', err);
            alert('Failed to create proof request: ' + err.message);
        }
        setLoading(false);
    };

    if (proofData) {
        const isSuccess = proofData.presentation_result;
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
                <div className={`bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border ${isSuccess ? 'border-emerald-100' : 'border-red-100'}`}>
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 ${isSuccess ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {isSuccess ? (
                            <ShieldCheck className="w-8 h-8 text-emerald-600" />
                        ) : (
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-slate-900">
                        {isSuccess ? 'Verification Successful' : 'Verification Failed'}
                    </h1>
                    <p className="text-slate-500 mb-8 text-sm">
                        {isSuccess ? 'Student status confirmed.' : 'Student status could not be verified.'}
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 mb-8 text-left border border-slate-100">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs text-slate-500">Claim</span>
                            <span className="text-xs font-semibold text-slate-900">Student Status</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-xs text-slate-500">Result</span>
                            <span className={`text-xs font-bold ${isSuccess ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isSuccess ? 'PASS' : 'FAIL'}
                            </span>
                        </div>
                    </div>
                    <button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-bold transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full border border-slate-200">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                        <span className="text-2xl">🎧</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">StreamingService</h1>
                    <p className="text-slate-500 text-sm">Welcome back, {userName}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-5 rounded-lg mb-8">
                    <div className="flex items-start">
                        <GraduationCap className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h2 className="text-sm font-bold text-purple-900 mb-1">Student Status Required</h2>
                            <p className="text-sm text-purple-800 leading-relaxed">
                                Verify your student status to get <strong>50% off</strong> your subscription.
                            </p>
                        </div>
                    </div>
                </div>
                {!proofRequest ? (
                    <button
                        onClick={requestProof}
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-lg font-semibold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Lock className="w-5 h-5 mr-2" />}
                        {loading ? 'Connecting...' : 'Verify with Prüfen'}
                    </button>
                ) : (
                    <div className="text-center animate-fadeIn">
                        <p className="mb-6 font-medium text-slate-700">Scan with the Prüfen app to verify:</p>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner inline-block mb-6">
                            <QRCodeSVG value={JSON.stringify(proofRequest)} size={240} level="H" includeMargin={true} />
                        </div>
                        <div className="flex items-center justify-center text-sm text-slate-500 mb-6">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-400" />
                            <span>Waiting for verification...</span>
                        </div>
                    </div>
                )}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <div className="inline-flex items-center text-slate-400">
                        <ShieldCheck className="w-3 h-3 mr-1.5" />
                        <span className="text-[10px] uppercase tracking-widest font-semibold">Secured by Prüfen</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
