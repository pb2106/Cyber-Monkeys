import { useNavigate } from 'react-router-dom';

export default function Success() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-veridia-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="orb w-96 h-96 bg-emerald-500/10 top-1/4 -right-20 animate-float"></div>
            <div className="orb w-72 h-72 bg-cyan-500/8 -bottom-20 left-1/4 animate-float-delayed"></div>

            <div className="glass-glow rounded-2xl max-w-md w-full p-8 text-center relative z-10">
                {/* Success Icon */}
                <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 w-24 h-24 mx-auto bg-emerald-500/20 rounded-full animate-ring-ping"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center shadow-lg glow-emerald-strong">
                        <span className="text-5xl text-white">✓</span>
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold mb-2 text-gradient">
                    Verification Complete!
                </h1>

                <p className="text-slate-400 mb-8">
                    Your proof has been sent to the verifier securely.
                </p>

                {/* Privacy Guarantees */}
                <div className="glass rounded-xl p-5 mb-6 text-left border border-emerald-500/20">
                    <p className="text-sm font-bold text-emerald-400 mb-3 flex items-center">
                        <span className="mr-2 text-lg">🔐</span>
                        Privacy Guarantees Fulfilled
                    </p>

                    <div className="space-y-2 ml-7">
                        <div className="flex items-start">
                            <span className="text-emerald-400 mr-2 mt-0.5">✓</span>
                            <p className="text-sm text-slate-300">
                                <strong className="text-slate-200">Data deleted</strong> from memory immediately
                            </p>
                        </div>

                        <div className="flex items-start">
                            <span className="text-emerald-400 mr-2 mt-0.5">✓</span>
                            <p className="text-sm text-slate-300">
                                Verifier received <strong className="text-slate-200">YES/NO result only</strong>
                            </p>
                        </div>

                        <div className="flex items-start">
                            <span className="text-emerald-400 mr-2 mt-0.5">✓</span>
                            <p className="text-sm text-slate-300">
                                Proof valid for <strong className="text-slate-200">5 minutes</strong>, then expires
                            </p>
                        </div>

                        <div className="flex items-start">
                            <span className="text-emerald-400 mr-2 mt-0.5">✓</span>
                            <p className="text-sm text-slate-300">
                                <strong className="text-slate-200">Single-use only</strong> — cannot be reused
                            </p>
                        </div>
                    </div>
                </div>

                {/* What Happened */}
                <div className="glass rounded-xl p-5 mb-8 text-left">
                    <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">What Just Happened</p>
                    <ol className="text-sm text-slate-400 space-y-2">
                        <li className="flex items-start">
                            <span className="mr-3 text-emerald-400 font-bold font-mono text-xs bg-emerald-500/10 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                            Your DOB was read from secure storage
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 text-emerald-400 font-bold font-mono text-xs bg-emerald-500/10 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                            Age calculated in memory (not stored)
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 text-emerald-400 font-bold font-mono text-xs bg-emerald-500/10 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                            YES/NO result generated and signed
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 text-emerald-400 font-bold font-mono text-xs bg-emerald-500/10 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                            Raw data immediately deleted
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 text-emerald-400 font-bold font-mono text-xs bg-emerald-500/10 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                            Only cryptographic proof sent to verifier
                        </li>
                    </ol>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white p-4 rounded-xl font-bold shadow-lg transition-all duration-300 active:scale-[0.98] glow-emerald hover:glow-emerald-strong"
                >
                    Done
                </button>

                {/* Footer */}
                <p className="mt-6 text-xs text-slate-600 flex items-center justify-center gap-1">
                    Thank you for using
                    <span className="text-gradient font-semibold">Veridia</span>
                    🔒
                </p>
            </div>
        </div>
    );
}
