import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

export default function Consent() {
    const { request_id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [request, setRequest] = useState(location.state?.request);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!request) {
            // Fetch request details if not passed via state
            fetchRequestDetails();
        }
    }, [request_id]);

    const fetchRequestDetails = async () => {
        try {
            const res = await api.get(`/proof-requests/${request_id}`);
            setRequest(res.data);
        } catch (err) {
            setError('Proof request not found or expired');
            console.error(err);
        }
    };

    const handleApprove = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get mock user ID (in real app, from authentication)
            const mockUserId = localStorage.getItem('mock_user_id') || 'usr_demo_adult';

            // Generate proof through backend
            const res = await api.post(`/proof-requests/${request_id}/approve`, {
                user_id: mockUserId
            });

            console.log('Proof generated:', res.data);

            // Send proof directly to verifier's callback URL
            if (request.callback_url) {
                try {
                    console.log('Sending proof to callback:', request.callback_url);
                    await fetch(request.callback_url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            proof_request_id: request_id,
                            proof_id: res.data.proof_id,
                            status: 'approved',
                            timestamp: new Date().toISOString()
                        })
                    });
                    console.log('Proof sent to verifier callback');
                } catch (callbackErr) {
                    console.error('Failed to send to callback:', callbackErr);
                    // Continue even if callback fails
                }
            }

            navigate('/success');
        } catch (err) {
            setError(err.response?.data?.detail || 'Approval failed');
            console.error('Approval error:', err);
        }

        setLoading(false);
    };

    if (error && !request) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold mb-2">Request Not Found</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h1 className="text-2xl font-bold">Verification Request</h1>
                    <p className="text-gray-500 text-sm mt-1">Review before approving</p>
                </div>

                {/* Verifier Info */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
                    <p className="text-xs text-blue-600 font-semibold mb-1">REQUESTED BY</p>
                    <p className="font-bold text-blue-900">{request.verifier?.name || request.verifier_name}</p>
                    <p className="text-sm text-blue-700 mt-1">{request.verifier?.domain || request.verifier_domain}</p>
                </div>

                {/* Claim Display */}
                <div className="mb-6 text-center">
                    <p className="text-lg font-semibold text-gray-700 mb-2">They want to verify:</p>
                    <p className="text-2xl font-bold text-purple-900">
                        {request.claim?.display || request.claim_display}
                    </p>
                </div>

                {/* Privacy Disclosure - THE CORE VALUE PROP */}
                <div className="border-2 border-purple-200 bg-purple-50 rounded-xl p-4 mb-6">
                    <div className="mb-4">
                        <p className="text-sm font-bold text-green-700 mb-2 flex items-center">
                            <span className="mr-2">✅</span>
                            They WILL receive:
                        </p>
                        <div className="ml-6">
                            <p className="text-sm font-semibold">• YES or NO only</p>
                            <p className="text-xs text-gray-600">No personal information</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-red-700 mb-2 flex items-center">
                            <span className="mr-2">🚫</span>
                            They will NOT see:
                        </p>
                        <div className="ml-6 space-y-1">
                            <p className="text-sm line-through text-gray-500">Your date of birth</p>
                            <p className="text-sm line-through text-gray-500">Your name</p>
                            <p className="text-sm line-through text-gray-500">Your ID number</p>
                            <p className="text-sm line-through text-gray-500">Your address</p>
                        </div>
                    </div>
                </div>

                {/* Privacy Guarantees */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-center">
                        <p className="text-lg mb-1">⏱️</p>
                        <p className="text-xs font-semibold text-purple-900">5 min</p>
                        <p className="text-xs text-purple-600">validity</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-center">
                        <p className="text-lg mb-1">🗑️</p>
                        <p className="text-xs font-semibold text-purple-900">Deleted</p>
                        <p className="text-xs text-purple-600">after use</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-center">
                        <p className="text-lg mb-1">🔒</p>
                        <p className="text-xs font-semibold text-purple-900">Single</p>
                        <p className="text-xs text-purple-600">verifier</p>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-4 rounded-xl font-bold mb-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all shadow-lg"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <span className="animate-spin mr-2">⚙️</span>
                            Generating Proof...
                        </span>
                    ) : (
                        'Approve Verification'
                    )}
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="w-full text-gray-600 hover:text-gray-800 p-2 font-semibold"
                >
                    Decline
                </button>

                {/* Privacy Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        🔐 Your data is processed in memory and <strong>never stored</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
