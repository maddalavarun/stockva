import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { Package, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await login({ email, password });
            loginUser(data.user, data.token);
            navigate(data.user.role === 'admin' ? '/admin' : '/staff');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-500/25">
                        <Package size={28} className="text-white" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">StockPro</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Sign in to manage your inventory</p>
                </div>

                {/* Card */}
                <div className="card">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs sm:text-sm font-medium border border-red-100 flex items-center gap-2">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                            <input
                                type="email" required value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                            <input
                                type="password" required value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input"
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="btn btn-primary w-full h-11 sm:h-12 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[10px] sm:text-xs text-gray-300 mt-6">
                    StockPro • Inventory Management System
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
