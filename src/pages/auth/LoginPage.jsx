import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Heart, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { loginUser, signInWithGoogle } from '../../Firebaseconfig';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { role } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await loginUser(email, password);
        setLoading(false);
        if (result.success) {
            toast.success('Logged in successfully!');
            // Navigate based on role
            if (role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            setError(result.error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                        <Heart className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">MedCenter</h1>
                    <p className="text-blue-100 mt-2">Welcome back! Please login to your account</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span className="ml-2 text-sm text-gray-700">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign In Button */}
                        <button
                            onClick={async () => {
                                setLoading(true);
                                setError('');
                                const result = await signInWithGoogle();
                                setLoading(false);
                                
                                if (result.success) {
                                    toast.success('Logged in successfully with Google!');
                                    if (role === 'admin') {
                                        navigate('/admin');
                                    } else {
                                        navigate('/');
                                    }
                                } else {
                                    setError(result.error?.message || 'Failed to sign in with Google');
                                }
                            }}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <img 
                                className="w-5 h-5" 
                                src="https://www.google.com/favicon.ico" 
                                alt="Google" 
                            />
                            <span>Sign in with Google</span>
                        </button>

                        {/* Social Login Buttons */}
                        
                    </form>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link to="/" className="text-blue-100 hover:text-white text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}