import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
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
                // In a real app, this would check webhook or long-polling endpoint
                // For demo, we'll navigate to verified page after timeout
                // The proof request would have a callback_url that receives webhook

                // For now, let user manually proceed after scanning
                // In production, the webhook would trigger navigation
            } catch (err) {
                console.error('Poll error:', err);
            }
        }, 2000);

        // Store interval ref for cleanup
        window.pollInterval = pollInterval;

        // Auto-navigate after 30 seconds for demo purposes
        setTimeout(() => {
            if (!proofData) {
                clearInterval(pollInterval);
                // navigate('/mock-verifier/verified');
            }
        }, 30000);
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

            console.log('Request headers:', headers);

            const body = {
                condition: 'age_over_18',
                expires_in: 300,
                callback_url: `${window.location.origin}/api/webhooks/proof-received`
            };

            console.log('Request body:', body);

            // Make the API call directly with fetch
            // IMPORTANT: Include trailing slash to match FastAPI route and avoid 307 redirect
            const res = await fetch('/api/proof-requests/', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            console.log('Response status:', res.status);
            console.log('Response headers:', Object.fromEntries(res.headers.entries()));

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">🍺</div>
                    <h1 className="text-2xl font-bold text-orange-800 mb-1">
                        Welcome, {userName}!
                    </h1>
                    <p className="text-orange-600 text-sm">Let's get you verified</p>
                </div>

                {/* Age Gate Message */}
                <div className="bg-orange-50 border-2 border-orange-300 p-5 rounded-xl mb-6">
                    <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">⚠️</span>
                        <h2 className="text-lg font-bold text-orange-900">Age Verification Required</h2>
                    </div>
                    <p className="text-orange-800">
                        You must be <strong>18 or older</strong> to access AlcoholDelivery.com
                    </p>
                </div>

                {!proofRequest ? (
                    /* Initial state - show verify button */
                    <>
                        <div className="mb-6 text-center text-gray-600 text-sm">
                            <p className="mb-4">We use <strong>Prüfen</strong> for privacy-preserving age verification.</p>
                            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                                <p className="font-semibold text-purple-900 mb-2">🔒 Your Privacy is Protected</p>
                                <ul className="text-xs text-purple-800 text-left space-y-1">
                                    <li>• We only receive YES or NO</li>
                                    <li>• We  don't see your date of birth</li>
                                    <li>• We don't see your ID or name</li>
                                    <li>• Proof expires in 5 minutes</li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={requestProof}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-4 rounded-xl font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all"
                        >
                            <span className="mr-2 text-xl">🔒</span>
                            {loading ? 'Loading...' : 'Verify with Prüfen'}
                        </button>
                    </>
                ) : (
                    /* QR Code Display */
                    <div className="text-center">
                        <p className="mb-4 font-semibold text-gray-700">
                            Scan this QR code with the Prüfen app:
                        </p>

                        {/* QR Code */}
                        <div className="bg-white p-6 rounded-xl border-4 border-purple-600 inline-block mb-4">
                            <QRCodeSVG
                                value={JSON.stringify(proofRequest)}
                                size={280}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        {/* Request Details */}
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-4 text-xs text-left">
                            <p className="font-semibold mb-1">Request Details:</p>
                            <p><strong>Request ID:</strong> {proofRequest.proof_request_id.substring(0, 12)}...</p>
                            <p><strong>Claim:</strong> {proofRequest.claim.display}</p>
                            <p><strong>Expires:</strong> {new Date(proofRequest.expires_at).toLocaleTimeString()}</p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4 text-sm text-left">
                            <p className="font-semibold mb-2">📱 How to scan:</p>
                            <ol className="space-y-1 ml-4 list-decimal text-gray-700">
                                <li>Open Prüfen app (or go to <code className="bg-blue-100 px-1 rounded">localhost:5173</code> in new tab)</li>
                                <li>Click "Scan QR Code" or "Upload QR Image"</li>
                                <li>Review the verification request</li>
                                <li>Approve to complete verification</li>
                            </ol>
                        </div>

                        {/* Demo Helper */}
                        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-4">
                            <p className="text-sm text-yellow-800 mb-2">
                                <strong>Demo Mode:</strong> For local testing without mobile camera:
                            </p>
                            <ol className="text-xs text-yellow-700 space-y-1 ml-4 list-decimal">
                                <li>Right-click QR code → "Save image"</li>
                                <li>Open <a href="/" target="_blank" className="underline font-semibold">Prüfen app</a> in new tab</li>
                                <li>Click "Upload QR Image" and select saved image</li>
                            </ol>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                            <span className="animate-spin mr-2">⚙️</span>
                            <span>Waiting for verification...</span>
                        </div>

                        {/* Expiration */}
                        <p className="text-xs text-gray-400 mb-4">
                            Expires in 5 minutes
                        </p>

                        {/* Manual Continue (for demo) */}
                        <button
                            onClick={handleManualVerified}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-lg font-semibold text-sm"
                        >
                            [Demo: Skip to Verified Page]
                        </button>
                    </div>
                )}

                {/* Powered by Prüfen */}
                <div className="mt-6 pt-4 border-t text-center">
                    <p className="text-xs text-gray-400 mb-2">Powered by</p>
                    <div className="inline-flex items-center">
                        <span className="mr-2">🔒</span>
                        <span className="font-bold text-purple-900">Prüfen</span>
                        <span className="text-xs text-gray-500 ml-2">Privacy-Preserving Verification</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
