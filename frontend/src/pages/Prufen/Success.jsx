import { useNavigate } from 'react-router-dom';

export default function Success() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-blue-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                {/* Success Icon */}
                <div className="mb-6">
                    <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-lg animate-pulse-slow">
                        <span className="text-5xl text-white">✓</span>
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                    Verification Complete!
                </h1>

                <p className="text-gray-600 mb-8">
                    Your proof has been sent to the verifier securely.
                </p>

                {/* Privacy Guarantees */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-6 text-left">
                    <p className="text-sm font-bold text-green-900 mb-3 flex items-center">
                        <span className="mr-2 text-lg">🔐</span>
                        Privacy Guarantees Fulfilled
                    </p>

                    <div className="space-y-2 ml-7">
                        <div className="flex items-start">
                            <span className="text-green-600 mr-2 mt-0.5">✓</span>
                            <p className="text-sm text-green-800">
                                <strong>Data deleted</strong> from memory immediately
                            </p>
                        </div>

                        <div className="flex items-start">
                            <span className="text-green-600 mr-2 mt-0.5">✓</span>
                            <p className="text-sm text-green-800">
                                Verifier received <strong>YES/NO result only</strong>
                            </p>
                        </div>

                        <div className="flex items-start">
                            <span className="text-green-600 mr-2 mt-0.5">✓</span>
                            <p className="text-sm text-green-800">
                                Proof valid for <strong>5 minutes</strong>, then expires
                            </p>
                        </div>

                        <div className="flex items-start">
                            <span className="text-green-600 mr-2 mt-0.5">✓</span>
                            <p className="text-sm text-green-800">
                                <strong>Single-use only</strong> - cannot be reused
                            </p>
                        </div>
                    </div>
                </div>

                {/* What Happened */}
                <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
                    <p className="text-xs font-semibold text-gray-700 mb-2">WHAT JUST HAPPENED</p>
                    <ol className="text-sm text-gray-600 space-y-1.5">
                        <li className="flex items-start">
                            <span className="mr-2 text-purple-600 font-bold">1.</span>
                            Your DOB was read from secure storage
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 text-purple-600 font-bold">2.</span>
                            Age calculated in memory (not stored)
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 text-purple-600 font-bold">3.</span>
                            YES/NO result generated and signed
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 text-purple-600 font-bold">4.</span>
                            Raw data immediately deleted
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 text-purple-600 font-bold">5.</span>
                            Only cryptographic proof sent to verifier
                        </li>
                    </ol>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all"
                >
                    Done
                </button>

                {/* Footer */}
                <p className="mt-6 text-xs text-gray-400">
                    Thank you for using Prüfen 🔒
                </p>
            </div>
        </div>
    );
}
