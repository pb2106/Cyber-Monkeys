import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShieldCheck, QrCode, Upload, Zap, Lock, CheckCircle2 } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        // Use html5-qrcode to decode uploaded image
        const { Html5Qrcode } = await import('html5-qrcode');
        const html5QrCode = new Html5Qrcode("qr-reader-upload");

        try {
            const decodedText = await html5QrCode.scanFile(file, false);

            // Parse JSON from QR code
            const proofRequest = JSON.parse(decodedText);

            // Validate it's a valid proof request
            if (!proofRequest.proof_request_id) {
                throw new Error('Invalid proof request format: missing ID');
            }

            // Navigate to consent screen with the proof request data
            navigate(`/consent/${proofRequest.proof_request_id}`, {
                state: { request: proofRequest }
            });
        } catch (error) {
            alert('Invalid QR code or unable to decode');
            console.error('QR decode error:', error);
        }

        setUploading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full">
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl shadow-lg mb-6">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                        Prüfen
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Privacy-Preserving Verification
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">
                                Verify Your Identity
                            </h2>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Prove your eligibility without sharing sensitive personal data like your date of birth.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/scan')}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl font-semibold flex items-center justify-center shadow-md transition-all active:scale-[0.98] group"
                            >
                                <QrCode className="w-5 h-5 mr-3 text-slate-300 group-hover:text-white transition-colors" />
                                Scan QR Code
                            </button>

                            <button
                                onClick={() => document.getElementById('qr-upload').click()}
                                disabled={uploading}
                                className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 p-4 rounded-xl font-semibold flex items-center justify-center transition-all active:scale-[0.98]"
                            >
                                <Upload className="w-5 h-5 mr-3 text-slate-400" />
                                {uploading ? 'Processing...' : 'Upload QR Image'}
                            </button>

                            <input
                                id="qr-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleUpload}
                            />
                            <div id="qr-reader-upload" className="hidden"></div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="bg-slate-50 p-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                                <Lock className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-xs font-semibold text-slate-900">Zero Knowledge</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">No data shared</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-xs font-semibold text-slate-900">Instant</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">Under 2 seconds</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-slate-400">
                    Secure • Anonymous • Ephemeral
                </p>
            </div>
        </div>
    );
}
