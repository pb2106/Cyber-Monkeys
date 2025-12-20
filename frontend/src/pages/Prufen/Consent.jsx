import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Trash2, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center border border-slate-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Request Not Found</h1>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center text-slate-900 font-bold">
                            <ShieldCheck className="w-5 h-5 mr-2 text-slate-900" />
                            Prüfen
                        </div>
                        <div className="w-5"></div> {/* Spacer */}
                    </div>

                    <div className="text-center">
                        <h1 className="text-xl font-bold text-slate-900 mb-1">Verification Request</h1>
                        <p className="text-sm text-slate-500">
                            <span className="font-semibold text-slate-900">{request.verifier?.name || request.verifier_name}</span> is requesting proof.
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {/* Claim Display */}
                    <div className="bg-slate-50 rounded-xl p-6 text-center mb-6 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">They want to verify</p>
                        <p className="text-lg font-medium text-slate-900">
                            {request.claim?.display || request.claim_display}
                        </p>
                    </div>

                    {/* Privacy Disclosure - THE CORE VALUE PROP */}
                    <div className="space-y-4 mb-8">
                        {/* What they get */}
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold text-slate-900">They will receive</p>
                                <p className="text-xs text-slate-500 mt-0.5">A simple YES or NO confirmation only.</p>
                            </div>
                        </div>

                        {/* What they don't get */}
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5 text-slate-300" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold text-slate-900">They will NOT see</p>
                                <p className="text-xs text-slate-500 mt-0.5">Your date of birth, name, ID number, or address.</p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-3 gap-2 mb-8">
                        <div className="flex flex-col items-center text-center p-2">
                            <Clock className="w-4 h-4 text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-500">Expires in 5m</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-2">
                            <Trash2 className="w-4 h-4 text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-500">Deleted after use</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-2">
                            <Lock className="w-4 h-4 text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-500">Single verifier</span>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl font-bold mb-3 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Generating Proof...
                            </span>
                        ) : (
                            'Approve Verification'
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full text-slate-500 hover:text-slate-700 p-3 font-medium text-sm transition-colors"
                    >
                        Decline Request
                    </button>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 flex items-center justify-center">
                        <Lock className="w-3 h-3 mr-1" />
                        Zero-Knowledge Proof Protocol
                    </p>
                </div>
            </div>
        </div>
    );
}
