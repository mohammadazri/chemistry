import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { Mail, Lock, User, Beaker, Hexagon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const setToken = useUserStore((state) => state.setToken);
    const setUser = useUserStore((state) => state.setUser);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const res = await axios.post(`${API_URL}/api/auth/login`, {
                    email,
                    password
                });
                setToken(res.data.token);
                setUser(res.data.user);
                navigate('/dashboard');
            } else {
                await axios.post(`${API_URL}/api/auth/register`, {
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    role: 'student'
                });
                const res = await axios.post(`${API_URL}/api/auth/login`, {
                    email,
                    password
                });
                setToken(res.data.token);
                setUser(res.data.user);
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden">
            {/* Animated Premium Backgrounds */}
            <div className="absolute inset-0 z-0 flex items-center justify-center text-white/5 pointer-events-none">
                <Hexagon className="w-[800px] h-[800px] absolute animate-[spin_60s_linear_infinite]" />
                <Hexagon className="w-[1200px] h-[1200px] absolute animate-[spin_90s_reverse_linear_infinite]" />
            </div>

            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-float opacity-60" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-float opacity-60" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 w-full max-w-md">
                {/* Main Card */}
                <div className="backdrop-blur-xl bg-background/60 border border-border p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                    {/* Gloss Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="text-center mb-8 relative">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 border border-white/20 transform rotate-3 hover:rotate-6 transition-transform">
                            <Beaker className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-2">
                            {isLogin ? 'Welcome Back' : 'Join HoloLab'}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {isLogin ? 'Enter your credentials to access the lab' : 'Create an account to start experimenting'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="First"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">&nbsp;</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Last"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="student@school.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pb-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-[1px] group disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                        >
                            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-300" />
                            <div className="relative flex items-center justify-center gap-2 bg-card group-hover:bg-transparent px-8 py-3 rounded-xl cursor-pointer transition-colors" style={isLogin ? { background: 'transparent' } : {}}>
                                {loading ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                    <span className="text-white font-semibold">
                                        {isLogin ? 'Sign In to Lab' : 'Create Account'}
                                    </span>
                                )}
                            </div>
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 w-full p-2"
                    >
                        {isLogin ? (
                            <span>Don't have an account? <span className="text-indigo-500 dark:text-indigo-400 font-medium border-b border-indigo-400/30 pb-0.5">Register here</span></span>
                        ) : (
                            <span>Already have an account? <span className="text-indigo-500 dark:text-indigo-400 font-medium border-b border-indigo-400/30 pb-0.5">Sign in</span></span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
