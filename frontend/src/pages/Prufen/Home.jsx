import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShieldCheck, QrCode, Upload, Zap, Lock, Fingerprint, Eye, EyeOff } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        try {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;
            };

            reader.readAsDataURL(file);

            await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load image'));
            });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            const { default: jsQR } = await import('jsqr');
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                const proofRequest = JSON.parse(code.data);

                if (!proofRequest.proof_request_id) {
                    throw new Error('Invalid proof request format: missing ID');
                }

                navigate(`/consent/${proofRequest.proof_request_id}`, {
                    state: { request: proofRequest }
                });
            } else {
                throw new Error('QR code not found');
            }
        } catch (error) {
            console.error('QR decode error:', error);
            alert('Could not find a QR code in this image. Please ensure the image is clear and contains a valid QR code.');
        }

        setUploading(false);
    };

    return (
        <div className="min-h-screen bg-veridia-bg flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Floating Orbs */}
            <div className="orb w-72 h-72 bg-emerald-600/10 -top-20 -right-20 animate-float"></div>
            <div className="orb w-96 h-96 bg-cyan-600/8 -bottom-32 -left-32 animate-float-delayed"></div>
            <div className="orb w-64 h-64 bg-emerald-500/5 top-1/2 right-1/4 animate-float-slow"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl opacity-20 animate-glow-pulse"></div>
                        <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl w-full h-full flex items-center justify-center shadow-lg">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-3 text-gradient">
                        Veridia
                    </h1>
                    <p className="text-slate-400 font-medium text-lg">
                        Prove facts. Not data.
                    </p>
                </div>

                {/* Main Card */}
                <div className="glass-glow rounded-2xl overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-lg font-semibold text-slate-100 mb-2">
                                Verify Your Identity
                            </h2>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Prove your eligibility without sharing sensitive personal data like your date of birth.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/scan')}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 text-white p-4 rounded-xl font-semibold flex items-center justify-center shadow-lg transition-all duration-300 active:scale-[0.98] group glow-emerald hover:glow-emerald-strong"
                            >
                                <QrCode className="w-5 h-5 mr-3 text-emerald-200 group-hover:text-white transition-colors" />
                                Scan QR Code
                            </button>

                            <button
                                onClick={() => document.getElementById('qr-upload').click()}
                                disabled={uploading}
                                className="w-full glass text-slate-300 hover:text-white p-4 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 active:scale-[0.98] hover:border-emerald-500/30"
                            >
                                <Upload className="w-5 h-5 mr-3 text-slate-500 group-hover:text-emerald-400" />
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
                    <div className="border-t border-emerald-500/10 p-6 grid grid-cols-3 gap-4 bg-veridia-bg/50">
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-emerald-500/20 transition-colors">
                                <Lock className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-xs font-semibold text-slate-300">Zero Knowledge</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">No data shared</span>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-cyan-500/20 transition-colors">
                                <Zap className="w-4 h-4 text-cyan-400" />
                            </div>
                            <span className="text-xs font-semibold text-slate-300">Instant</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">Under 2 seconds</span>
                        </div>
                        <div className="flex flex-col items-center text-center group">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-emerald-500/20 transition-colors">
                                <EyeOff className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-xs font-semibold text-slate-300">Anonymous</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">No tracking</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500/50"></span>
                    Secure
                    <span className="w-1 h-1 rounded-full bg-emerald-500/50"></span>
                    Anonymous
                    <span className="w-1 h-1 rounded-full bg-emerald-500/50"></span>
                    Ephemeral
                    <span className="w-1 h-1 rounded-full bg-emerald-500/50"></span>
                </p>
            </div>
        </div>
    );
}
