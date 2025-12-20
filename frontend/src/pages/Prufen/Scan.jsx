import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Scan() {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const scannerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Delay scanner initialization to ensure DOM is ready
        const timer = setTimeout(() => {
            startScanner();
        }, 100);

        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        setLoading(true);
        setError(null);

        try {
            // Dynamically import html5-qrcode
            const { Html5Qrcode } = await import('html5-qrcode');

            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                onScanSuccess,
                onScanFailure
            );

            setScanning(true);
            setError(null);
        } catch (err) {
            console.error('Scanner failed:', err);
            setError(err.message || 'Camera access denied or unavailable. Please ensure you granted camera permissions.');
        } finally {
            setLoading(false);
        }
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().catch(console.error);
            scannerRef.current = null;
        }
    };

    const onScanSuccess = async (decodedText) => {
        console.log('QR Code scanned:', decodedText);
        stopScanner();

        try {
            // Extract proof_request_id from URL
            const url = new URL(decodedText);
            const requestId = url.pathname.split('/').pop();

            // Navigate to consent screen
            navigate(`/consent/${requestId}`);
        } catch (err) {
            alert('Invalid QR code format');
            // Give user time to see the alert before restarting
            setTimeout(() => startScanner(), 1000);
        }
    };

    const onScanFailure = (error) => {
        // Silent fail - just keep scanning
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/')}
                    className="text-white flex items-center hover:text-purple-400 transition-colors"
                >
                    <span className="text-xl mr-2">←</span>
                    <span className="font-semibold">Back</span>
                </button>
                <div className="text-white font-semibold">Scan QR Code</div>
                <div className="w-16"></div> {/* Spacer for centering */}
            </div>

            {/* Scanner Container */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {loading && !error ? (
                        <div className="bg-purple-600 text-white p-6 rounded-lg text-center">
                            <div className="text-4xl mb-4 animate-spin">⚙️</div>
                            <p className="font-semibold mb-2">Initializing Camera...</p>
                            <p className="text-sm">Please grant camera permissions when prompted</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500 text-white p-6 rounded-lg text-center">
                            <div className="text-4xl mb-4">❌</div>
                            <p className="font-semibold mb-2">Camera Error</p>
                            <p className="text-sm mb-4">{error}</p>
                            <button
                                onClick={() => {
                                    setError(null);
                                    startScanner();
                                }}
                                className="mt-4 bg-white text-red-500 px-6 py-2 rounded-lg font-semibold"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-2 block w-full text-white underline"
                            >
                                Go Back Home
                            </button>
                        </div>
                    ) : (
                        <>
                            <div id="qr-reader" className="rounded-2xl overflow-hidden shadow-2xl"></div>

                            {scanning && (
                                <div className="mt-6 text-center">
                                    <div className="inline-block bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 text-white">
                                        <div className="animate-pulse-slow mb-2 text-2xl">📷</div>
                                        <p className="font-semibold">Position QR code within frame</p>
                                        <p className="text-sm text-gray-300 mt-1">Scanning will happen automatically</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Footer hint */}
            <div className="p-4 text-center text-gray-400 text-sm">
                <p>🔒 Your camera feed is processed locally</p>
                <p className="text-xs mt-1">No images are uploaded or stored</p>
            </div>
        </div>
    );
}
