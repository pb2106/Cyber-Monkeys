import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user_name', res.data.name);

            // Store user_id for demo purposes (for consent screen)
            localStorage.setItem('mock_user_id', res.data.user_id);

            navigate('/mock-verifier/verify-age');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        }

        setLoading(false);
    };

    // Demo accounts quick access
    const quickLogin = async (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setTimeout(() => {
            document.getElementById('login-form').requestSubmit();
        }, 100);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">🍺</div>
                    <h1 className="text-3xl font-bold text-orange-800">AlcoholDelivery</h1>
                    <p className="text-orange-600 text-sm">Premium drinks delivered</p>
                </div>

                {/* Login Form */}
                <form id="login-form" onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Demo Accounts */}
                <div className="mt-8 border-t pt-6">
                    <p className="text-xs text-gray-500 mb-3 text-center font-semibold">
                        DEMO ACCOUNTS (Click to login)
                    </p>

                    <div className="space-y-2">
                        <button
                            onClick={() => quickLogin('john@example.com', 'password123')}
                            className="w-full text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-sm">John (34 years old)</p>
                                    <p className="text-xs text-gray-600">john@example.com</p>
                                </div>
                                <span className="text-green-600 text-xs font-bold">✓ PASSES 18+</span>
                            </div>
                        </button>

                        <button
                            onClick={() => quickLogin('bob@example.com', 'password123')}
                            className="w-full text-left p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-sm">Bob (20 years old)</p>
                                    <p className="text-xs text-gray-600">bob@example.com</p>
                                </div>
                                <span className="text-yellow-600 text-xs font-bold">✓ PASSES 18+</span>
                            </div>
                        </button>

                        <button
                            onClick={() => quickLogin('jane@example.com', 'password123')}
                            className="w-full text-left p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-sm">Jane (14 years old)</p>
                                    <p className="text-xs text-gray-600">jane@example.com</p>
                                </div>
                                <span className="text-red-600 text-xs font-bold">✗ FAILS 18+</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Prüfen Badge */}
                <div className="mt-6 text-center">
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
