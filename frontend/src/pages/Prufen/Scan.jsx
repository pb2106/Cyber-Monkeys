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

            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    setCameras(devices);
                    const cameraId = devices[devices.length - 1].id;
                    setSelectedCamera(cameraId);
                    startScanner(cameraId);
                } else {
                    throw new Error('No cameras found on this device.');
                }
            } catch (cameraErr) {
                console.error('Camera enumeration failed:', cameraErr);
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

            if (scannerRef.current) {
                await stopScanner();
            }

            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            };

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

            try {
                const data = JSON.parse(decodedText);
                if (data.proof_request_id) {
                    requestId = data.proof_request_id;
                }
            } catch (e) {
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

            navigate(`/consent/${requestId}`);
        } catch (err) {
            alert('Invalid QR code format. Please scan a valid Veridia request.');
            setTimeout(() => initializeScanner(), 1000);
        }
    };

    const onScanFailure = (error) => {
        // Silent fail - just keep scanning
    };

    return (
        <div className="min-h-screen bg-veridia-bg flex flex-col font-sans relative overflow-hidden">
            {/* Background orbs */}
            <div className="orb w-64 h-64 bg-emerald-600/8 -top-20 -right-20 animate-float"></div>
            <div className="orb w-48 h-48 bg-cyan-600/8 bottom-20 -left-20 animate-float-delayed"></div>

            {/* Header */}
            <div className="p-4 flex items-center justify-between z-10 relative">
                <button
                    onClick={() => navigate('/')}
                    className="text-slate-400 flex items-center hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-500/5"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span className="font-medium">Back</span>
                </button>
                <div className="text-slate-200 font-semibold flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-emerald-400" />
                    Scan QR Code
                </div>
                <div className="w-20"></div>
            </div>

            {/* Scanner Container */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
                <div className="w-full max-w-md relative z-0 min-h-[300px] bg-black/80 rounded-3xl overflow-hidden border border-emerald-500/20 glow-emerald">

                    {/* The Scanner Element */}
                    <div id="qr-reader" className="w-full h-full absolute inset-0"></div>

                    {/* Overlay Guide */}
                    {!loading && !error && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                            <div className="w-64 h-64 border-2 border-emerald-500/30 rounded-3xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>
                            </div>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-veridia-bg z-20 flex flex-col items-center justify-center p-6 text-center">
                            <Loader2 className="w-10 h-10 mb-4 animate-spin text-emerald-400" />
                            <p className="font-semibold mb-2 text-lg text-slate-100">Initializing Camera...</p>
                            <p className="text-sm text-slate-500">Please grant camera permissions when prompted</p>
                        </div>
                    )}

                    {/* Error Overlay */}
                    {error && (
                        <div className="absolute inset-0 bg-veridia-bg z-30 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <p className="font-bold mb-2 text-lg text-red-400">Camera Error</p>
                            <p className="text-sm mb-6 text-slate-400 leading-relaxed max-w-xs">{error}</p>

                            <div className="space-y-3 w-full max-w-xs">
                                <button
                                    onClick={() => {
                                        setError(null);
                                        initializeScanner();
                                    }}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full glass text-slate-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                                >
                                    Go Back Home
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scanning Indicator */}
                    {scanning && !loading && !error && (
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                            <div className="inline-flex items-center glass rounded-full px-6 py-3 text-white">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-3"></div>
                                <p className="font-medium text-sm">Scanning for codes...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer hint */}
            <div className="p-6 text-center z-10 relative">
                <div className="inline-flex items-center text-slate-600 text-xs">
                    <Lock className="w-3 h-3 mr-1.5 text-emerald-500/50" />
                    <span>Your camera feed is processed locally. No images are stored.</span>
                </div>
            </div>
        </div>
    );
}
