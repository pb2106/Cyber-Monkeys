import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Trash2, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

export default function Consent() {
    const { request_id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(null);
    const [showUserSelector, setShowUserSelector] = useState(false);
    const [request, setRequest] = useState(location.state?.request || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('mock_user_id');
        const userName = localStorage.getItem('user_name');

        if (userId && userName) {
            setCurrentUser({ id: userId, name: userName });
        } else {
            setShowUserSelector(true);
        }

        if (!request) {
            fetchRequestDetails();
        }
    }, [request_id]);

    const selectUser = (user) => {
        localStorage.setItem('mock_user_id', user.id);
        localStorage.setItem('user_name', user.name);
        setCurrentUser(user);
        setShowUserSelector(false);
    };

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
        if (!currentUser) {
            setShowUserSelector(true);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.post(`/proof-requests/${request_id}/approve`, {
                user_id: currentUser.id
            });

            if (request.callback_url) {
                const isLocalhostCallback = request.callback_url.includes('localhost') || request.callback_url.includes('127.0.0.1');
                const isRemoteOrigin = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

                if (isRemoteOrigin && isLocalhostCallback) {
                    console.warn('Skipping localhost callback because we are on a remote origin:', request.callback_url);
                } else {
                    try {
                        await fetch(request.callback_url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                proof_request_id: request_id,
                                proof_id: res.data.proof_id,
                                status: 'approved',
                                timestamp: new Date().toISOString()
                            })
                        });
                    } catch (callbackErr) {
                        console.error('Failed to send to callback:', callbackErr);
                    }
                }
            }

            navigate('/success');
        } catch (err) {
            setError(err.response?.data?.detail || 'Approval failed');
        }

        setLoading(false);
    };

    if (showUserSelector) {
        return (
            <div className="min-h-screen bg-veridia-bg flex items-center justify-center p-4 relative overflow-hidden">
                <div className="orb w-72 h-72 bg-emerald-600/8 -top-20 -right-20 animate-float"></div>
                <div className="orb w-64 h-64 bg-cyan-600/8 -bottom-20 -left-20 animate-float-delayed"></div>

                <div className="glass-glow rounded-2xl max-w-md w-full p-8 relative z-10">
                    <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">Select Demo Persona</h2>
                    <p className="text-slate-400 mb-6 text-center text-sm">Who are you acting as for this test?</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => selectUser({ id: 'usr_demo_adult', name: 'John Doe' })}
                            className="w-full text-left p-4 glass rounded-xl hover:border-emerald-500/30 transition-all duration-300 group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">John Doe (Adult)</p>
                                    <p className="text-sm text-slate-500">Age: 34 • Resident</p>
                                </div>
                                <div className="h-3 w-3 rounded-full bg-emerald-500 glow-emerald"></div>
                            </div>
                        </button>
                        <button
                            onClick={() => selectUser({ id: 'usr_demo_teen', name: 'Jane Smith' })}
                            className="w-full text-left p-4 glass rounded-xl hover:border-cyan-500/30 transition-all duration-300 group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">Jane Smith (Teen)</p>
                                    <p className="text-sm text-slate-500">Age: 14 • Student</p>
                                </div>
                                <div className="h-3 w-3 rounded-full bg-cyan-500 glow-cyan"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !request) {
        return (
            <div className="min-h-screen bg-veridia-bg flex items-center justify-center p-4">
                <div className="glass-glow rounded-2xl max-w-md w-full p-8 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-100 mb-2">Request Not Found</h1>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <button onClick={() => navigate('/')} className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-veridia-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500"></div>
            </div>
        );
    }

    const claimDisplay = request.claim?.display || request.claim_display;
    const isStudent = request.claim_type === 'student_status';
    const isResidency = request.claim_type === 'residency_US';

    const handleDecline = async () => {
        try {
            await api.post(`/proof-requests/${request_id}/reject`);
        } catch (err) {
            console.error('Failed to reject request:', err);
        }
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-veridia-bg flex items-center justify-center p-4 font-sans relative overflow-hidden">
            <div className="orb w-72 h-72 bg-emerald-600/8 -top-20 right-10 animate-float"></div>
            <div className="orb w-56 h-56 bg-cyan-600/6 bottom-10 -left-10 animate-float-slow"></div>

            <div className="glass-glow rounded-2xl max-w-md w-full overflow-hidden relative z-10">
                {/* User Badge */}
                {currentUser && (
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={() => setShowUserSelector(true)}
                            className="flex items-center space-x-2 glass px-3 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                            <div className={`w-2 h-2 rounded-full ${currentUser.id === 'usr_demo_adult' ? 'bg-emerald-500' : 'bg-cyan-500'}`}></div>
                            <span>{currentUser.name}</span>
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="p-6 border-b border-emerald-500/10">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={handleDecline} className="text-slate-500 hover:text-slate-300 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center text-emerald-400 font-bold">
                            <ShieldCheck className="w-5 h-5 mr-2" />
                            Veridia
                        </div>
                        <div className="w-5"></div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-slate-100 mb-1">Verification Request</h1>
                        <p className="text-sm text-slate-400">
                            <span className="font-semibold text-emerald-400">{request.verifier?.name || request.verifier_name}</span> is requesting proof.
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {/* Claim Display */}
                    <div className="glass rounded-xl p-6 text-center mb-6">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">They want to verify</p>
                        <p className="text-lg font-medium text-gradient">
                            {isStudent ? 'Student Status' : isResidency ? 'US Residency' : claimDisplay}
                        </p>
                    </div>

                    {/* Privacy Disclosure */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold text-slate-200">They will receive</p>
                                <p className="text-xs text-slate-500 mt-0.5">A simple YES or NO confirmation only.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-semibold text-slate-200">They will NOT see</p>
                                <p className="text-xs text-slate-500 mt-0.5">Your private details or raw ID data.</p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-3 gap-2 mb-8">
                        <div className="flex flex-col items-center text-center p-3 glass rounded-lg">
                            <Clock className="w-4 h-4 text-emerald-400/60 mb-1" />
                            <span className="text-[10px] text-slate-500">Expires in 5m</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-3 glass rounded-lg">
                            <Trash2 className="w-4 h-4 text-emerald-400/60 mb-1" />
                            <span className="text-[10px] text-slate-500">Deleted after use</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-3 glass rounded-lg">
                            <Lock className="w-4 h-4 text-emerald-400/60 mb-1" />
                            <span className="text-[10px] text-slate-500">Single verifier</span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 text-white p-4 rounded-xl font-bold mb-3 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-lg glow-emerald active:scale-[0.98]"
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
                    <button onClick={handleDecline} className="w-full text-slate-500 hover:text-red-400 p-3 font-medium text-sm transition-colors">
                        Decline Request
                    </button>
                </div>
                <div className="border-t border-emerald-500/10 p-4 text-center bg-veridia-bg/50">
                    <p className="text-[10px] text-slate-600 flex items-center justify-center">
                        <Lock className="w-3 h-3 mr-1 text-emerald-500/30" />
                        Zero-Knowledge Proof Protocol
                    </p>
                </div>
            </div>
        </div>
    );
}
