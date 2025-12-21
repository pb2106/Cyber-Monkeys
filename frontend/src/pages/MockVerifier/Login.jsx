import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Loader2, LogOut, CheckCircle2, XCircle, Shield, Users, MapPin } from 'lucide-react';
import api from '../../services/api';

export default function Login() {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeVerification, setActiveVerification] = useState(null);
    const [proofRequest, setProofRequest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [polling, setPolling] = useState(false);
    const [proofData, setProofData] = useState(null);

    // Quick login accounts
    const accounts = {
        john: { name: 'John Doe', id: 'usr_demo_adult', ages: ['34 years old', 'Passes age verification', 'Non-student'] },
        jane: { name: 'Jane Smith', id: 'usr_demo_teen', ages: ['14 years old', 'Fails age verification', 'Student status'] }
    };

    // Verification types
    const verifications = [
        {
            id: 'age',
            label: 'Age Verification',
            condition: 'age_over_18',
            description: 'Verify 18+ age requirement',
            icon: Shield,
            bgGradient: 'from-blue-600/20 to-cyan-600/20',
            borderColor: 'border-blue-500/30',
            badgeColor: 'bg-blue-500/20 text-blue-300'
        },
        {
            id: 'student',
            label: 'Student Status',
            condition: 'student_status',
            description: 'Verify student enrollment',
            icon: Users,
            bgGradient: 'from-purple-600/20 to-pink-600/20',
            borderColor: 'border-purple-500/30',
            badgeColor: 'bg-purple-500/20 text-purple-300'
        },
        {
            id: 'residency',
            label: 'Residency Verification',
            condition: 'residency_US',
            description: 'Verify US residency',
            icon: MapPin,
            bgGradient: 'from-emerald-600/20 to-teal-600/20',
            borderColor: 'border-emerald-500/30',
            badgeColor: 'bg-emerald-500/20 text-emerald-300'
        }
    ];

    const verifierKeys = {
        age: 'pk_4cZLBbGW4jAcbNBNw5KmTG1R4Bx49kFoTjFDizaRZEA',
        student: 'pk_D9rCkll5Mn6Qc0o8QgOp5XYv4v8gvgDAQEqYuHS93rU',
        residency: 'pk_motlljUo4BsMnXslYtTyiq2lrDMp13lCpZXJkE89vNk'
    };

    useEffect(() => {
        if (proofRequest && !proofData) {
            startPolling();
        }

        return () => {
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

    const handleQuickLogin = (accountKey) => {
        const account = accounts[accountKey];
        setCurrentUser(account);
        localStorage.setItem('user_name', account.name);
        localStorage.setItem('mock_user_id', account.id);
        setActiveVerification(null);
        setProofRequest(null);
        setProofData(null);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setActiveVerification(null);
        setProofRequest(null);
        setProofData(null);
        localStorage.removeItem('user_name');
        localStorage.removeItem('mock_user_id');
    };

    const startPolling = () => {
        if (window.pollInterval) {
            clearInterval(window.pollInterval);
        }
        if (window.pollTimeout) {
            clearTimeout(window.pollTimeout);
        }

        setPolling(true);
        const pollProof = async () => {
            try {
                const response = await api.get(`/proof-requests/${proofRequest.proof_request_id}`);

                if (response.data && response.data.status === 'rejected') {
                    setProofData({
                        result: 'DENIED',
                        proof_id: null
                    });
                    setPolling(false);
                    if (window.pollInterval) {
                        clearInterval(window.pollInterval);
                        window.pollInterval = null;
                    }
                } else if (response.data && response.data.status === 'approved' && response.data.presentation_result !== null) {
                    setProofData({
                        result: response.data.presentation_result ? 'PASS' : 'FAIL',
                        proof_id: response.data.proof_id
                    });
                    setPolling(false);
                    if (window.pollInterval) {
                        clearInterval(window.pollInterval);
                        window.pollInterval = null;
                    }
                }
            } catch (error) {
                console.error('Error polling proof:', error);
            }
        };

        window.pollInterval = setInterval(pollProof, 1000);
        window.pollTimeout = setTimeout(() => {
            if (window.pollInterval) {
                clearInterval(window.pollInterval);
                window.pollInterval = null;
            }
            setPolling(false);
        }, 60000);
    };

    const handleVerificationRequest = async (verificationType) => {
        setLoading(true);
        try {
            const response = await api.post('/proof-requests/', {
                condition: verificationType.condition,
                expires_in: 1800  // 30 minutes
            }, {

                headers: {
                    'Authorization': `Bearer ${verifierKeys[verificationType.id]}`
                }
            });
            setProofRequest(response.data);
            console.log('Proof request data for QR code:', response.data);
            console.log('QR code JSON string:', JSON.stringify(response.data));
            setActiveVerification(verificationType.id);
            setProofData(null);
        } catch (error) {
            console.error('Error creating proof request:', error);
            console.error('Response data:', error.response?.data);  // ← Add this line
            console.error('Request headers:', error.config?.headers);  // ← Add this line
        } finally {
            setLoading(false);
        }
    };

    // LOGIN SCREEN
    if (!currentUser) {
        return (
            <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                    <div className="w-full max-w-md">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="flex justify-center mb-6">
                                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Prüfen
                            </h1>
                            <p className="text-slate-400 text-lg">Privacy-Preserving Verification</p>
                            <p className="text-slate-500 text-sm mt-3">Demo Mock Verifier</p>
                        </div>

                        {/* Quick Login Section */}
                        <div className="space-y-3 mb-8">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-4">Quick Login</p>

                            <button
                                onClick={() => handleQuickLogin('john')}
                                className="w-full group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-blue-500/50 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">John Doe</p>
                                            <p className="text-xs text-slate-500 mt-1">34 years • Can verify age</p>
                                        </div>
                                        <div className="text-black group-hover:translate-x-1 transition-transform">→</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleQuickLogin('jane')}
                                className="w-full group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-purple-500/50 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">Jane Smith</p>
                                            <p className="text-xs text-slate-500 mt-1">14 years • Student status</p>
                                        </div>
                                        <div className="text-black group-hover:translate-x-1 transition-transform">→</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // DASHBOARD SCREEN
    if (currentUser && !activeVerification) {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                {/* Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <div className="relative z-10">
                    {/* Header with logout */}
                    <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-20">
                        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Prüfen Verifier</p>
                                    <p className="text-xs text-slate-500">Mock Demo</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 transition-colors text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="max-w-6xl mx-auto px-4 py-12">
                        {/* Welcome section */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-2">Welcome, {currentUser.name}</h2>
                            <p className="text-slate-400">
                                Select a verification type to create a zero-knowledge proof. Your data stays private while you prove your attributes.
                            </p>
                        </div>

                        {/* Verification cards grid */}
                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            {verifications.map((verification) => {
                                const IconComponent = verification.icon;
                                return (
                                    <button
                                        key={verification.id}
                                        onClick={() => handleVerificationRequest(verification)}
                                        disabled={loading}
                                        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 text-left
                                            bg-gradient-to-br ${verification.bgGradient} 
                                            ${verification.borderColor}
                                            hover:border-opacity-100 hover:shadow-lg hover:shadow-slate-600/20
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="relative z-10">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className={`p-3 bg-slate-900/50 rounded-lg group-hover:scale-110 transition-transform ${verification.badgeColor}`}>
                                                    <IconComponent className="w-6 h-6" />
                                                </div>
                                                <div className="text-xs font-mono text-slate-500">01</div>
                                            </div>

                                            <h3 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">
                                                {verification.label}
                                            </h3>
                                            <p className="text-sm text-slate-400 mb-4">
                                                {verification.description}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                                                <span>Request verification</span>
                                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // QR CODE SCREEN
    if (proofRequest && !proofData) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2">
                            {verifications.find(v => v.id === activeVerification)?.label}
                        </h2>
                        <p className="text-slate-400">
                            Scan with your Prüfen wallet to submit your zero-knowledge proof
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 flex flex-col items-center">
                        {/* QR Code */}
                        <div className="mb-8 p-6 bg-white rounded-2xl">
                            {proofRequest && (
                                <QRCodeSVG
                                    value={JSON.stringify(proofRequest)}
                                    size={400}
                                    level="M"
                                    includeMargin={true}
                                />
                            )}
                        </div>

                        {/* Status info */}
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-2 text-blue-400 mb-4">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Waiting for proof submission...</span>
                            </div>
                            <p className="text-sm text-slate-500 font-mono">
                                ID: {proofRequest?.proof_request_id?.substring(0, 12)}...
                            </p>
                        </div>

                        {/* Back button */}
                        <button
                            onClick={() => {
                                setActiveVerification(null);
                                setProofRequest(null);
                                setProofData(null);
                            }}
                            className="mt-6 px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Help text */}
                    <p className="text-center text-xs text-slate-600 mt-8">
                        This is a demo. In production, users would scan this with their Prüfen mobile wallet.
                    </p>
                </div>
            </div>
        );
    }

    // RESULTS SCREEN
    if (proofData) {
        const isSuccess = proofData.result === 'PASS' || proofData.result === true;
        const verification = verifications.find(v => v.id === activeVerification);

        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 w-full max-w-2xl">
                    {/* Result Card */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-12 text-center">
                        {/* Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className={`p-4 rounded-full ${isSuccess ? 'bg-emerald-500/20' : proofData.result === 'DENIED' ? 'bg-slate-500/20' : 'bg-red-500/20'}`}>
                                {isSuccess ? (
                                    <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                                ) : proofData.result === 'DENIED' ? (
                                    <LogOut className="w-16 h-16 text-slate-400" />
                                ) : (
                                    <XCircle className="w-16 h-16 text-red-400" />
                                )}
                            </div>
                        </div>

                        {/* Result text */}
                        <h2 className={`text-4xl font-bold mb-4 ${isSuccess ? 'text-emerald-400' : proofData.result === 'DENIED' ? 'text-slate-400' : 'text-red-400'}`}>
                            {isSuccess ? 'VERIFIED' : proofData.result === 'DENIED' ? 'REQUEST DENIED' : 'NOT VERIFIED'}
                        </h2>

                        <p className="text-slate-400 text-lg mb-6">
                            {verification?.label}
                        </p>

                        {/* Details */}
                        <div className="bg-slate-900/50 rounded-xl p-6 mb-8 text-left text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">User</p>
                                    <p className="font-semibold">{currentUser.name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Proof ID</p>
                                    <p className="font-mono text-xs">{proofData?.proof_id?.substring(0, 16)}...</p>
                                </div>
                            </div>
                        </div>

                        {/* Info message */}
                        <p className="text-xs text-slate-500 mb-8">
                            ✓ This proof was generated and verified using zero-knowledge cryptography
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setActiveVerification(null);
                                    setProofRequest(null);
                                    setProofData(null);
                                }}
                                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition-colors"
                            >
                                Try Another
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 font-semibold transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
