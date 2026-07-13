'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, user, loading: authLoading, role } = useAuth();
  const router = useRouter();

  // Load Google Sign-In SDK
  useEffect(() => {
    const handleGoogleSignInResponse = async (response) => {
      setError('');
      setLoading(true);
      try {
        const user = await loginWithGoogle(response.credential);
        if (user) {
          router.push(user.role === 'admin' ? '/admin' : '/dashboard/transactions');
        }
      } catch (err) {
        setError(err.message || 'Google authentication failed');
      } finally {
        setLoading(false);
      }
    };

    // Google Identity Services GSI Loader
    if (typeof window !== 'undefined') {
      const initializeGoogleBtn = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '825902143714-g0t37d7k9a6skpbe1378iilsc73c2df2.apps.googleusercontent.com',
            callback: handleGoogleSignInResponse,
          });

          window.google.accounts.id.renderButton(
            document.getElementById('googleSignInDiv'),
            { theme: 'outline', size: 'large', width: '380', shape: 'pill' }
          );
        }
      };

      // Check if already loaded, otherwise poll or wait
      if (window.google?.accounts?.id) {
        initializeGoogleBtn();
      } else {
        const interval = setInterval(() => {
          if (window.google?.accounts?.id) {
            initializeGoogleBtn();
            clearInterval(interval);
          }
        }, 150);
        return () => clearInterval(interval);
      }
    }
  }, [loginWithGoogle, router]);

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(role === 'admin' ? '/admin' : '/dashboard/transactions');
    }
  }, [user, authLoading, role, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier, password);
      if (user) {
        setIdentifier('');
        setPassword('');
        router.push(user.role === 'admin' ? '/admin' : '/dashboard/transactions');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Don't flash the form while auth state is being determined
  if (authLoading || user) return null;

  return (
    <div className="walletly-shell bg-walletly-theme min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md glass-strong rounded-2xl shadow-2xl p-8 border border-white/10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 relative h-20 w-full">
            <Image src="/logo.png" alt="Walletly Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-white/50 mt-1">Sign in to your Walletly account</p>
        </div>

        {/* Google Sign In Container */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div id="googleSignInDiv" className="w-full min-h-[44px] flex items-center justify-center" />
        </div>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-white/40 text-xs font-bold uppercase tracking-wider">or email</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email or Phone</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 text-white py-2.5 border border-white/10 bg-white/5 rounded-xl text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#6be6b0] focus:border-[#6be6b0] transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-white border border-white/10 bg-white/5 rounded-xl text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#6be6b0] focus:border-[#6be6b0] transition"
            />
          </div>


          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-br from-[#EA7108] to-[#FDB147] hover:from-[#d96607] hover:to-[#eca542] shadow-[0_5px_15px_rgba(234,113,8,0.3)] text-white text-sm font-bold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-white/50 mt-6">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-[#6be6b0] font-medium hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
}
