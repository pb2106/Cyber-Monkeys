import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
            if (!proofRequest.proof_request_id || !proofRequest.claim) {
                throw new Error('Invalid proof request format');
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
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                {/* Logo */}
                <div className="mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                        <span className="text-4xl">🔒</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Prüfen
                </h1>

                {/* Tagline */}
                <p className="text-gray-600 mb-2 text-lg">
                    Privacy-Preserving Verification
                </p>

                <p className="text-gray-500 mb-8 text-sm">
                    Prove you're 18+ without sharing your date of birth
                </p>

                {/* Actions */}
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/scan')}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-4 rounded-xl font-semibold flex items-center justify-center shadow-lg transform hover:scale-105 transition-all"
                    >
                        <span className="mr-2 text-2xl">📷</span>
                        Scan QR Code
                    </button>

                    <button
                        onClick={() => document.getElementById('qr-upload').click()}
                        disabled={uploading}
                        className="w-full bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 p-4 rounded-xl font-semibold flex items-center justify-center transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="mr-2 text-2xl">📤</span>
                        {uploading ? 'Processing...' : 'Upload QR Image'}
                    </button>

                    <input
                        id="qr-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                    />

                    {/* Hidden div for QR upload processing */}
                    <div id="qr-reader-upload" className="hidden"></div>
                </div>

                {/* Privacy Badges */}
                <div className="mt-8 grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-2xl mb-1">🔐</div>
                        <div className="font-semibold text-purple-900">Zero Knowledge</div>
                        <div className="text-purple-600">No data shared</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="font-semibold text-blue-900">Instant</div>
                        <div className="text-blue-600">Under 2 seconds</div>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="mt-6 text-xs text-gray-400">
                    Your personal data is never stored. Only YES/NO proofs.
                </p>
            </div>
        </div>
    );
}
