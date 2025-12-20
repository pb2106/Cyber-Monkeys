import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Verified() {
    const location = useLocation();
    const navigate = useNavigate();
    const [verified] = useState(location.state?.verified ?? true);
    const userName = localStorage.getItem('user_name') || 'User';

    useEffect(() => {
        // If no state, redirect to login
        if (!location.state) {
            navigate('/mock-verifier/login');
        }
    }, []);

    if (!verified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-3xl font-bold text-red-800 mb-2">
                        Verification Failed
                    </h1>
                    <p className="text-red-600 mb-6">
                        You must be 18 or older to access this service.
                    </p>

                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                        <p className="text-sm text-red-700">
                            The age verification proof indicates you do not meet the minimum age requirement.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/mock-verifier/login')}
                        className="w-full bg-gray-600 text-white p-3 rounded-lg font-semibold"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
                {/* Success Header */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse-slow">
                        <span className="text-4xl text-white">✓</span>
                    </div>
                    <h1 className="text-3xl font-bold text-green-800 mb-2">
                        Age Verified!
                    </h1>
                    <p className="text-green-600">
                        Welcome to AlcoholDelivery.com, {userName}
                    </p>
                </div>

                {/* Verification Details */}
                <div className="bg-green-50 border-2 border-green-300 p-5 rounded-xl mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">VERIFICATION STATUS</p>
                            <p className="text-2xl font-bold text-green-900">18+ Confirmed ✓</p>
                        </div>
                        <div className="text-4xl">🍺</div>
                    </div>

                    <div className="border-t border-green-200 pt-3 mt-3">
                        <p className="text-xs font-semibold text-green-800 mb-2">RECEIVED FROM PRÜFEN:</p>
                        <div className="bg-white rounded p-3 font-mono text-xs">
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-600">Claim:</span>
                                <span className="text-green-700 font-semibold">age_over_18</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-600">Result:</span>
                                <span className="text-green-700 font-bold">YES ✓</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Signature:</span>
                                <span className="text-gray-500">RS256 verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Privacy Guarantee */}
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
                    <p className="text-sm font-bold text-purple-900 mb-3 flex items-center">
                        <span className="mr-2">🔒</span>
                        Privacy Preserved
                    </p>
                    <div className="text-xs text-purple-800 space-y-2">
                        <div className="flex items-start">
                            <span className="text-purple-600 mr-2">✓</span>
                            <p>We received <strong>YES/NO only</strong> - no personal data</p>
                        </div>
                        <div className="flex items-start">
                            <span className="text-purple-600 mr-2">✓</span>
                            <p>We did NOT see: date of birth, name, ID, or address</p>
                        </div>
                        <div className="flex items-start">
                            <span className="text-purple-600 mr-2">✓</span>
                            <p>Proof expires in 5 minutes and cannot be reused</p>
                        </div>
                        <div className="flex items-start">
                            <span className="text-purple-600 mr-2">✓</span>
                            <p>Cryptographically signed and auditable</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => alert('🎉 In a real app, this would take you to the shop!')}
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white p-4 rounded-xl font-bold transform hover:scale-105 transition-all shadow-lg"
                    >
                        🛒 Start Shopping
                    </button>

                    <button
                        onClick={() => navigate('/mock-verifier/login')}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-lg font-semibold"
                    >
                        Logout
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t text-center">
                    <p className="text-xs text-gray-400 mb-2">Age verification powered by</p>
                    <div className="inline-flex items-center bg-purple-50 border border-purple-200 px-4 py-2 rounded-full">
                        <span className="mr-2">🔒</span>
                        <span className="font-bold text-purple-900">Prüfen</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
