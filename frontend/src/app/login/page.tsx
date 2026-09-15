'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, AlertCircle, CheckCircle2, Home, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false); // Default to Sign Up as shown in reference design
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isLogin && !agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản và Điều kiện sử dụng.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.user) {
          router.push('/');
          router.refresh();
        }
      } else {
        // Sign Up
        if (!username.trim()) {
          throw new Error('Vui lòng nhập tên người dùng (Username)');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: username,
              username: username,
            }
          }
        });

        if (error) throw error;

        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error('Email này đã được đăng ký.');
        }

        setSuccessMsg('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
        setIsLogin(true); // Switch to Sign In
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // High quality Unsplash wallpaper of San Francisco Bay Bridge at night (matching the reference photo)
  const bgImageUrl = 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?q=80&w=2000&auto=format&fit=crop';

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center font-sans select-none bg-slate-950">
      {/* ── 1. Full Screen Background Bridge Wallpaper ── */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-90 transition-all duration-700"
        style={{ backgroundImage: `url('${bgImageUrl}')` }}
      />

      {/* ── 2. Split Glass Card Container (Matching Reference Design) ── */}
      <div className="relative z-10 w-[92vw] max-w-5xl h-[82vh] min-h-[560px] max-h-[720px] rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)] grid grid-cols-1 md:grid-cols-2 border border-white/10">
        
        {/* ── LEFT SIDE: Sharp Image with Dark Vignette Overlay ── */}
        <div className="relative hidden md:flex flex-col justify-center p-12 lg:p-16 text-white overflow-hidden">
          {/* Background image slice without blur for left side */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 filter brightness-75"
            style={{ backgroundImage: `url('${bgImageUrl}')` }}
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent pointer-events-none" />

          {/* Left Side Content */}
          <div className="relative z-10 space-y-6 max-w-md">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              {isLogin ? 'Already Have An Account?' : "Don't Have An Account?"}
            </h1>

            <p className="text-sm lg:text-base text-gray-300/90 leading-relaxed font-normal drop-shadow-xs">
              {isLogin
                ? 'Sign in to access your personal dashboard, track your focus sessions, and manage your tasks effortlessly.'
                : "Register to access all the features of our service. Manage your business in one place. It's free!"
              }
            </p>

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccessMsg('');
              }}
              className="mt-4 px-6 py-2.5 rounded-full border border-white/60 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>{isLogin ? 'Sign Up Now' : 'Sign In Now'}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ── RIGHT SIDE: Frosted Glass Panel with Blur Effect ── */}
        <div className="relative flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-black/45 backdrop-blur-2xl border-l border-white/10 text-white">
          {/* Glass Specular Highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />

          <div className="relative z-10 max-w-md w-full mx-auto space-y-7">
            {/* Header Title */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h2>
            </div>

            {/* Error or Success Messages */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 backdrop-blur-md">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 backdrop-blur-md">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleAuth} className="space-y-6">
              {/* Email Field */}
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-transparent border-b border-white/40 group-hover:border-white/70 focus:border-white text-white placeholder-gray-400/80 py-3 pr-10 text-sm focus:outline-none transition-colors"
                />
                <Mail size={17} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors" />
              </div>

              {/* Username Field (Sign Up Only) */}
              {!isLogin && (
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-transparent border-b border-white/40 group-hover:border-white/70 focus:border-white text-white placeholder-gray-400/80 py-3 pr-10 text-sm focus:outline-none transition-colors"
                  />
                  <User size={17} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              )}

              {/* Password Field */}
              <div className="relative group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent border-b border-white/40 group-hover:border-white/70 focus:border-white text-white placeholder-gray-400/80 py-3 pr-10 text-sm focus:outline-none transition-colors"
                />
                <Lock size={17} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-white transition-colors" />
              </div>

              {/* Checkbox: Terms & Conditions */}
              {!isLogin && (
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded bg-transparent border border-white/50 checked:bg-white checked:text-slate-900 focus:ring-0 cursor-pointer accent-white"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-300/90 cursor-pointer select-none">
                    I Agree To <span className="font-bold text-white">Terms</span> And <span className="font-bold text-white">Conditions</span> Of Service
                  </label>
                </div>
              )}

              {/* Submit & Switch Links */}
              <div className="flex items-center gap-5 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full border border-white/60 hover:bg-white hover:text-slate-900 text-white font-semibold text-sm transition-all duration-300 active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Processing...' : (isLogin ? 'Sign In >' : 'Sign Up >')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-gray-300 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
                >
                  {isLogin ? "Don't Have An Account?" : 'Have An Account?'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
