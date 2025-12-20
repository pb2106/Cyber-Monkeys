import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, AlertTriangle, Smartphone, Loader2, ArrowRight, Lock } from 'lucide-react';
import api from '../../services/api';

export default function VerifyAge() {
    const [proofRequest, setProofRequest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [polling, setPolling] = useState(false);
    const [proofData, setProofData] = useState(null);
    const navigate = useNavigate();

    const userName = localStorage.getItem('user_name') || 'User';

    useEffect(() => {
        // Start polling when we have a proof request
        if (proofRequest && !proofData) {
            startPolling();
        }

        return () => setPolling(false);
    }, [proofRequest]);

    const startPolling = () => {
        setPolling(true);

        const pollInterval = setInterval(async () => {
            try {
                if (!proofRequest?.proof_request_id) return;

                // Poll the backend for status updates
                const res = await api.get(`/proof-requests/${proofRequest.proof_request_id}`);

                if (res.data.status === 'approved') {
                    console.log('Proof approved!');
                    clearInterval(pollInterval);
                    setProofData(res.data); // Store result if needed
                    navigate('/mock-verifier/verified', { state: { verified: true } });
                }
            } catch (err) {
                console.error('Poll error:', err);
            }
        }, 2000);

        // Store interval ref for cleanup
        window.pollInterval = pollInterval;

        // Stop polling after 2 minutes (timeout)
        setTimeout(() => {
            clearInterval(pollInterval);
            if (polling) setPolling(false);
        }, 120000);
    };

    const requestProof = async () => {
        setLoading(true);

        try {
            // Using the actual API key from the seeded AlcoholDelivery.com verifier
            // This was generated during database seeding
            const VERIFIER_API_KEY = 'pk_4cZLBbGW4jAcbNBNw5KmTG1R4Bx49kFoTjFDizaRZEA';

            console.log('Creating proof request with API key:', VERIFIER_API_KEY.substring(0, 15) + '...');

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${VERIFIER_API_KEY}`
            };

            const body = {
                condition: 'age_over_18',
                expires_in: 300,
                callback_url: `${window.location.origin}/api/webhooks/proof-received`
            };

            // Make the API call directly with fetch
            // IMPORTANT: Include trailing slash to match FastAPI route and avoid 307 redirect
            const res = await fetch('/api/proof-requests/', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.detail || 'Failed to create proof request');
            }

            const data = await res.json();
            console.log('Proof request created:', data);
            setProofRequest(data);
        } catch (err) {
            console.error('Proof request error:', err);
            alert('Failed to create proof request: ' + err.message);
        }

        setLoading(false);
    };

    const handleManualVerified = () => {
        // For demo: allow manual navigation after QR is displayed
        navigate('/mock-verifier/verified', {
            state: {
                verified: true,
                proof_request_id: proofRequest?.proof_request_id
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full border border-slate-200">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
                        <span className="text-2xl">🍺</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                        AlcoholDelivery.com
                    </h1>
                    <p className="text-slate-500 text-sm">Welcome back, {userName}</p>
                </div>

                {/* Age Gate Message */}
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg mb-8">
                    <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h2 className="text-sm font-bold text-amber-900 mb-1">Age Verification Required</h2>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                You must be <strong>18 or older</strong> to purchase alcohol. Please verify your age to continue.
                            </p>
                        </div>
                    </div>
                </div>

                {!proofRequest ? (
                    /* Initial state - show verify button */
                    <>
                        <div className="mb-8">
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg mb-6">
                                <div className="flex items-center mb-3">
                                    <ShieldCheck className="w-4 h-4 text-slate-900 mr-2" />
                                    <span className="text-sm font-semibold text-slate-900">Secure Verification via Prüfen</span>
                                </div>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-xs text-slate-600">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                                        We only receive a YES/NO confirmation
                                    </li>
                                    <li className="flex items-center text-xs text-slate-600">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                                        Your date of birth remains private
                                    </li>
                                    <li className="flex items-center text-xs text-slate-600">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                                        No ID photos are stored
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={requestProof}
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-lg font-semibold flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5 mr-2" />
                                        Verify with Prüfen
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    /* QR Code Display */
                    <div className="text-center animate-fadeIn">
                        <p className="mb-6 font-medium text-slate-700">
                            Scan with the Prüfen app to verify:
                        </p>

                        {/* QR Code */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-inner inline-block mb-6">
                            <QRCodeSVG
                                value={JSON.stringify(proofRequest)}
                                size={240}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        {/* Instructions */}
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg mb-6 text-left">
                            <div className="flex items-center mb-3">
                                <Smartphone className="w-4 h-4 text-slate-500 mr-2" />
                                <span className="text-xs font-semibold text-slate-700">How to scan</span>
                            </div>
                            <ol className="space-y-2 ml-6 list-decimal text-xs text-slate-600">
                                <li>Open <strong>Prüfen app</strong> on your phone</li>
                                <li>Tap <strong>Scan QR Code</strong></li>
                                <li>Approve the request</li>
                            </ol>
                        </div>

                        {/* Demo Helper */}
                        <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg mb-6 text-left">
                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                                Demo Mode
                            </p>
                            <p className="text-xs text-amber-700">
                                Right-click QR to save image, then upload in Prüfen app tab.
                            </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-center text-sm text-slate-500 mb-6">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-400" />
                            <span>Waiting for verification...</span>
                        </div>

                        {/* Manual Continue (for demo) */}
                        <button
                            onClick={handleManualVerified}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-lg font-medium text-sm flex items-center justify-center transition-colors"
                        >
                            Skip to Verified Page
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                )}

                {/* Footer */}
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
