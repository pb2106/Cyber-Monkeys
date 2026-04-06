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

    const accounts = {
        john: { name: 'John Doe', id: 'usr_demo_adult', ages: ['34 years old', 'Passes age verification', 'Non-student'] },
        jane: { name: 'Jane Smith', id: 'usr_demo_teen', ages: ['14 years old', 'Fails age verification', 'Student status'] }
    };

    const verifications = [
        {
            id: 'age',
            label: 'Age Verification',
            condition: 'age_over_18',
            description: 'Verify 18+ age requirement',
            icon: Shield,
            accentColor: 'emerald',
            gradientFrom: 'from-emerald-600/15',
            gradientTo: 'to-cyan-600/10',
            borderHover: 'hover:border-emerald-500/40',
            iconBg: 'bg-emerald-500/15',
            iconColor: 'text-emerald-400',
        },
        {
            id: 'student',
            label: 'Student Status',
            condition: 'student_status',
            description: 'Verify student enrollment',
            icon: Users,
            accentColor: 'cyan',
            gradientFrom: 'from-cyan-600/15',
            gradientTo: 'to-blue-600/10',
            borderHover: 'hover:border-cyan-500/40',
            iconBg: 'bg-cyan-500/15',
            iconColor: 'text-cyan-400',
        },
        {
            id: 'residency',
            label: 'Residency Verification',
            condition: 'residency_US',
            description: 'Verify residency',
            icon: MapPin,
            accentColor: 'teal',
            gradientFrom: 'from-teal-600/15',
            gradientTo: 'to-emerald-600/10',
            borderHover: 'hover:border-teal-500/40',
            iconBg: 'bg-teal-500/15',
            iconColor: 'text-teal-400',
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
                expires_in: 1800
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
            console.error('Response data:', error.response?.data);
            console.error('Request headers:', error.config?.headers);
        } finally {
            setLoading(false);
        }
    };

    // ═════════════════════════════════
    // LOGIN SCREEN
    // ═════════════════════════════════
    if (!currentUser) {
        return (
            <div className="min-h-screen bg-veridia-bg text-white overflow-hidden relative">
                {/* Floating orbs */}
                <div className="orb w-80 h-80 bg-emerald-600/8 -top-32 -right-32 animate-float"></div>
                <div className="orb w-96 h-96 bg-cyan-600/6 top-1/2 -left-48 animate-float-delayed"></div>
                <div className="orb w-64 h-64 bg-emerald-500/5 -bottom-20 right-1/4 animate-float-slow"></div>

                <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                    <div className="w-full max-w-md">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl animate-glow-pulse"></div>
                                    <div className="relative p-4 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl shadow-lg">
                                        <ShieldCheck className="w-10 h-10" />
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold mb-3 text-gradient">
                                Veridia
                            </h1>
                            <p className="text-slate-400 text-lg">Privacy-Preserving Verification</p>
                            <div className="mt-4 inline-flex items-center glass px-4 py-1.5 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse"></div>
                                <span className="text-xs text-slate-400 font-medium">Demo Mock Verifier</span>
                            </div>
                        </div>

                        {/* Quick Login Section */}
                        <div className="space-y-3 mb-8">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Quick Login</p>

                            <button
                                onClick={() => handleQuickLogin('john')}
                                className="w-full group relative overflow-hidden rounded-xl p-5 glass transition-all duration-300 hover:border-emerald-500/30"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">John Doe</p>
                                            <p className="text-xs text-slate-500 mt-1">34 years • Can verify age</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-emerald-400/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">→</span>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleQuickLogin('jane')}
                                className="w-full group relative overflow-hidden rounded-xl p-5 glass transition-all duration-300 hover:border-cyan-500/30"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between">
                                        <div className="text-left">
                                            <p className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">Jane Smith</p>
                                            <p className="text-xs text-slate-500 mt-1">14 years • Student status</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                            <span className="text-cyan-400/50 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all">→</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ═════════════════════════════════
    // DASHBOARD SCREEN
    // ═════════════════════════════════
    if (currentUser && !activeVerification) {
        return (
            <div className="min-h-screen bg-veridia-bg text-white relative">
                {/* Background */}
                <div className="orb w-80 h-80 bg-emerald-600/6 -top-32 -right-32 animate-float"></div>
                <div className="orb w-96 h-96 bg-cyan-600/5 top-1/2 -left-48 animate-float-delayed"></div>

                <div className="relative z-10">
                    {/* Header with logout */}
                    <div className="border-b border-emerald-500/10 bg-veridia-bg/80 backdrop-blur-xl sticky top-0 z-20">
                        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg shadow-md">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gradient">Veridia Verifier</p>
                                    <p className="text-xs text-slate-600">Mock Demo</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-slate-400 hover:text-red-400 transition-colors text-sm"
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
                            <h2 className="text-3xl font-bold mb-2 text-slate-100">Welcome, <span className="text-gradient">{currentUser.name}</span></h2>
                            <p className="text-slate-500">
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
                                        className={`group relative overflow-hidden rounded-2xl border border-white/5 transition-all duration-300 p-6 text-left
                                            bg-gradient-to-br ${verification.gradientFrom} ${verification.gradientTo} 
                                            ${verification.borderHover}
                                            hover:shadow-lg hover:shadow-emerald-500/5
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="relative z-10">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className={`p-3 ${verification.iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                                    <IconComponent className={`w-6 h-6 ${verification.iconColor}`} />
                                                </div>
                                                <div className="text-xs font-mono text-slate-700">
                                                    {verification.id === 'age' ? '01' : verification.id === 'student' ? '02' : '03'}
                                                </div>
                                            </div>

                                            <h3 className="text-lg font-bold mb-2 text-slate-200 group-hover:text-white transition-colors">
                                                {verification.label}
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-4">
                                                {verification.description}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm text-slate-600 group-hover:text-emerald-400 transition-colors">
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

    // ═════════════════════════════════
    // QR CODE SCREEN
    // ═════════════════════════════════
    if (proofRequest && !proofData) {
        return (
            <div className="min-h-screen bg-veridia-bg text-white flex items-center justify-center p-4 relative overflow-hidden">
                <div className="orb w-80 h-80 bg-emerald-600/8 -top-32 -right-32 animate-float"></div>
                <div className="orb w-72 h-72 bg-cyan-600/6 -bottom-32 -left-32 animate-float-delayed"></div>

                <div className="relative z-10 w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold mb-2 text-slate-100">
                            {verifications.find(v => v.id === activeVerification)?.label}
                        </h2>
                        <p className="text-slate-500">
                            Scan with your Veridia wallet to submit your zero-knowledge proof
                        </p>
                    </div>

                    <div className="glass-glow rounded-3xl p-8 flex flex-col items-center">
                        {/* QR Code */}
                        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
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
                            <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="font-medium">Waiting for proof submission...</span>
                            </div>
                            <p className="text-sm text-slate-600 font-mono">
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
                            className="mt-6 px-6 py-2 rounded-lg glass text-slate-400 hover:text-white text-sm transition-all duration-300 hover:border-emerald-500/30"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Help text */}
                    <p className="text-center text-xs text-slate-700 mt-8">
                        This is a demo. In production, users would scan this with their Veridia mobile wallet.
                    </p>
                </div>
            </div>
        );
    }

    // ═════════════════════════════════
    // RESULTS SCREEN
    // ═════════════════════════════════
    if (proofData) {
        const isSuccess = proofData.result === 'PASS' || proofData.result === true;
        const verification = verifications.find(v => v.id === activeVerification);

        return (
            <div className="min-h-screen bg-veridia-bg text-white flex items-center justify-center p-4 relative overflow-hidden">
                <div className="orb w-80 h-80 bg-emerald-600/8 -top-32 -right-32 animate-float"></div>
                <div className="orb w-72 h-72 bg-cyan-600/6 -bottom-32 -left-32 animate-float-delayed"></div>

                <div className="relative z-10 w-full max-w-2xl">
                    {/* Result Card */}
                    <div className="glass-glow rounded-3xl p-12 text-center">
                        {/* Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="relative">
                                <div className={`absolute inset-0 rounded-full animate-ring-ping ${isSuccess ? 'bg-emerald-500/20' : proofData.result === 'DENIED' ? 'bg-slate-500/10' : 'bg-red-500/20'
                                    }`}></div>
                                <div className={`relative p-5 rounded-full ${isSuccess ? 'bg-emerald-500/15 border border-emerald-500/30' : proofData.result === 'DENIED' ? 'bg-slate-500/10 border border-slate-500/20' : 'bg-red-500/15 border border-red-500/30'
                                    }`}>
                                    {isSuccess ? (
                                        <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                                    ) : proofData.result === 'DENIED' ? (
                                        <LogOut className="w-16 h-16 text-slate-500" />
                                    ) : (
                                        <XCircle className="w-16 h-16 text-red-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Result text */}
                        <h2 className={`text-4xl font-bold mb-4 ${isSuccess ? 'text-gradient' : proofData.result === 'DENIED' ? 'text-slate-400' : 'text-red-400'}`}>
                            {isSuccess ? 'VERIFIED' : proofData.result === 'DENIED' ? 'REQUEST DENIED' : 'NOT VERIFIED'}
                        </h2>

                        <p className="text-slate-500 text-lg mb-6">
                            {verification?.label}
                        </p>

                        {/* Details */}
                        <div className="glass rounded-xl p-6 mb-8 text-left text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-600 text-xs uppercase tracking-wider mb-1">User</p>
                                    <p className="font-semibold text-slate-200">{currentUser.name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600 text-xs uppercase tracking-wider mb-1">Proof ID</p>
                                    <p className="font-mono text-xs text-slate-400">{proofData?.proof_id?.substring(0, 16)}...</p>
                                </div>
                            </div>
                        </div>

                        {/* Info message */}
                        <p className="text-xs text-slate-600 mb-8 flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
                            This proof was generated and verified using zero-knowledge cryptography
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setActiveVerification(null);
                                    setProofRequest(null);
                                    setProofData(null);
                                }}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 font-semibold transition-all duration-300 glow-emerald"
                            >
                                Try Another
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-3 rounded-xl glass text-slate-300 hover:text-white font-semibold transition-all duration-300 hover:border-emerald-500/30"
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
