import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, AlertCircle, Loader2, ShieldCheck, Lock } from 'lucide-react';

export default function Scan() {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const scannerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Delay scanner initialization to ensure DOM is ready
        const timer = setTimeout(() => {
            initializeScanner();
        }, 100);

        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, []);

    const initializeScanner = async () => {
        setLoading(true);
        setError(null);

        try {
            const { Html5Qrcode } = await import('html5-qrcode');

            // First, check for cameras
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    setCameras(devices);
                    // Default to the last camera (usually back camera on mobile)
                    const cameraId = devices[devices.length - 1].id;
                    setSelectedCamera(cameraId);
                    startScanner(cameraId);
                } else {
                    throw new Error('No cameras found on this device.');
                }
            } catch (cameraErr) {
                console.error('Camera enumeration failed:', cameraErr);
                // Fallback: try starting without ID (let browser pick)
                startScanner(null);
            }

        } catch (err) {
            handleError(err);
            setLoading(false);
        }
    };

    const startScanner = async (cameraId) => {
        try {
            const { Html5Qrcode } = await import('html5-qrcode');

            // Ensure previous instance is stopped
            if (scannerRef.current) {
                await stopScanner();
            }

            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            };

            // If we have a specific camera ID, use it. Otherwise use facingMode.
            const cameraConfig = cameraId
                ? { deviceId: { exact: cameraId } }
                : { facingMode: "environment" };

            await scanner.start(
                cameraConfig,
                config,
                onScanSuccess,
                onScanFailure
            );

            setScanning(true);
            setError(null);
            setLoading(false);
        } catch (err) {
            console.error('Start failed with config:', cameraId, err);

            // If environment failed, try user facing or default
            if (!cameraId) {
                try {
                    console.log('Retrying with user facing mode...');
                    await scannerRef.current.start(
                        { facingMode: "user" },
                        { fps: 10, qrbox: 250 },
                        onScanSuccess,
                        onScanFailure
                    );
                    setScanning(true);
                    setError(null);
                    setLoading(false);
                    return;
                } catch (retryErr) {
                    console.error('Retry failed:', retryErr);
                }
            }

            handleError(err);
            setLoading(false);
        }
    };

    const handleError = (err) => {
        let errorMessage = err.message || 'Camera access denied.';

        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            errorMessage = 'Camera access requires HTTPS or localhost. Please use a secure connection.';
        } else if (err.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError') {
            errorMessage = 'No camera found on this device.';
        } else if (err.name === 'NotReadableError') {
            errorMessage = 'Camera is in use by another application.';
        }

        setError(errorMessage);
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (e) {
                console.error('Error stopping scanner:', e);
            }
            scannerRef.current = null;
        }
    };

    const onScanSuccess = async (decodedText) => {
        console.log('QR Code scanned:', decodedText);
        stopScanner();

        try {
            let requestId;

            // Try parsing as JSON first (new format)
            try {
                const data = JSON.parse(decodedText);
                if (data.proof_request_id) {
                    requestId = data.proof_request_id;
                }
            } catch (e) {
                // Not JSON, try URL format (legacy/fallback)
                try {
                    const url = new URL(decodedText);
                    requestId = url.pathname.split('/').pop();
                } catch (urlErr) {
                    throw new Error('Invalid QR format');
                }
            }

            if (!requestId) {
                throw new Error('No request ID found');
            }

            // Navigate to consent screen
            navigate(`/consent/${requestId}`);
        } catch (err) {
            alert('Invalid QR code format. Please scan a valid Prüfen request.');
            // Give user time to see the alert before restarting
            setTimeout(() => initializeScanner(), 1000);
        }
    };

    const onScanFailure = (error) => {
        // Silent fail - just keep scanning
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-slate-900 z-10">
                <button
                    onClick={() => navigate('/')}
                    className="text-slate-300 flex items-center hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span className="font-medium">Back</span>
                </button>
                <div className="text-white font-semibold flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Scan QR Code
                </div>
                <div className="w-20"></div> {/* Spacer for centering */}
            </div>

            {/* Scanner Container */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
                <div className="w-full max-w-md relative z-0 min-h-[300px] bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700">

                    {/* The Scanner Element - ALWAYS RENDERED */}
                    <div id="qr-reader" className="w-full h-full absolute inset-0"></div>

                    {/* Overlay Guide (only show when scanning and no error) */}
                    {!loading && !error && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                            <div className="w-64 h-64 border-2 border-blue-500/50 rounded-3xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                            </div>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-slate-900 z-20 flex flex-col items-center justify-center p-6 text-center">
                            <Loader2 className="w-10 h-10 mb-4 animate-spin text-blue-500" />
                            <p className="font-semibold mb-2 text-lg text-white">Initializing Camera...</p>
                            <p className="text-sm text-slate-400">Please grant camera permissions when prompted</p>
                        </div>
                    )}

                    {/* Error Overlay */}
                    {error && (
                        <div className="absolute inset-0 bg-slate-900 z-30 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <p className="font-bold mb-2 text-lg text-red-400">Camera Error</p>
                            <p className="text-sm mb-6 text-slate-300 leading-relaxed max-w-xs">{error}</p>

                            <div className="space-y-3 w-full max-w-xs">
                                <button
                                    onClick={() => {
                                        setError(null);
                                        initializeScanner();
                                    }}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                                >
                                    Go Back Home
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scanning Indicator */}
                    {scanning && !loading && !error && (
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                            <div className="inline-flex items-center bg-slate-800/80 backdrop-blur-md rounded-full px-6 py-3 text-white border border-slate-700">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-3"></div>
                                <p className="font-medium text-sm">Scanning for codes...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer hint */}
            <div className="p-6 text-center bg-slate-900/90 backdrop-blur-sm z-10">
                <div className="inline-flex items-center text-slate-500 text-xs">
                    <Lock className="w-3 h-3 mr-1.5" />
                    <span>Your camera feed is processed locally. No images are stored.</span>
                </div>
            </div>
        </div>
    );
}
