'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { initiateRegister, verifyRegister, loginWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Load Google Sign-In SDK
  useEffect(() => {
    const handleGoogleRegisterResponse = async (response) => {
      setError('');
      setLoading(true);
      try {
        const user = await loginWithGoogle(response.credential);
        if (user) {
          router.push('/dashboard/transactions');
        }
      } catch (err) {
        setError(err.message || 'Google registration failed');
      } finally {
        setLoading(false);
      }
    };

    // Google Identity Services GSI Loader
    if (typeof window !== 'undefined') {
      const initializeGoogleBtn = () => {
        if (window.google?.accounts?.id && document.getElementById('googleRegisterDiv')) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '825902143714-g0t37d7k9a6skpbe1378iilsc73c2df2.apps.googleusercontent.com',
            callback: handleGoogleRegisterResponse,
          });

          window.google.accounts.id.renderButton(
            document.getElementById('googleRegisterDiv'),
            { theme: 'outline', size: 'large', width: '380', shape: 'pill' }
          );
        }
      };

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
  }, [loginWithGoogle, router, step]); // Re-initialize button if layout changes step

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard/transactions');
    }
  }, [user, authLoading, router]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await initiateRegister(formData);
      if (res.success) {
        setStep('otp');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await verifyRegister(formData.email, otp);
      if (user) {
        setFormData({ username: '', email: '', phone: '', password: '' });
        setOtp('');
        router.push('/dashboard/transactions');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'username', label: 'Username', type: 'text', placeholder: 'johndoe' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { name: 'phone', label: 'Phone', type: 'text', placeholder: '+1 234 567 8900' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
  ];

  // Don't flash the form while auth state is being determined
  if (authLoading || user) return null;

  return (
    <div className="walletly-shell bg-walletly-theme min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md glass-strong rounded-2xl shadow-2xl p-8 border border-white/10">
        
        {step === 'register' ? (
          <>
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6 relative h-20 w-full">
                <Image src="/logo.png" alt="Walletly Logo" fill className="object-contain" priority />
              </div>
              <h1 className="text-2xl font-bold text-white">Create account</h1>
              <p className="text-sm text-white/50 mt-1">Start managing your money with Walletly</p>
            </div>

            {/* Google Register Container */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div id="googleRegisterDiv" className="w-full min-h-[44px] flex items-center justify-center" />
            </div>

            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-white/40 text-xs font-bold uppercase tracking-wider">or register manually</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-white/70 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleChange}
                    required
                    placeholder={f.placeholder}
                    className="w-full text-white px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#6be6b0] focus:border-[#6be6b0] transition"
                  />
                </div>
              ))}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-br from-[#EA7108] to-[#FDB147] hover:from-[#d96607] hover:to-[#eca542] shadow-[0_5px_15px_rgba(234,113,8,0.3)] text-white text-sm font-bold rounded-xl transition mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Next: Verify Email'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="flex justify-center mb-6 relative h-20 w-full">
                <Image src="/logo.png" alt="Walletly Logo" fill className="object-contain" priority />
              </div>
              <h1 className="text-2xl font-bold text-white">Verify your Email</h1>
              <p className="text-sm text-white/50 mt-1.5 px-4">
                We sent a 6-digit verification code to <br />
                <span className="font-semibold text-white">{formData.email}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-center text-sm font-semibold text-white/70 mb-2">Enter Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="123456"
                  className="w-full text-center text-white px-4 py-3 border border-white/10 bg-white/5 rounded-xl text-2xl font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-[#6be6b0] focus:border-[#6be6b0] transition placeholder:opacity-30 placeholder:tracking-normal"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-2.5 px-4 bg-gradient-to-br from-[#EA7108] to-[#FDB147] hover:from-[#d96607] hover:to-[#eca542] shadow-[0_5px_15px_rgba(234,113,8,0.3)] text-white text-sm font-bold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Complete Register'}
                </button>

                <button
                  type="button"
                  onClick={() => { setError(''); setStep('register'); }}
                  className="w-full py-2.5 text-center text-sm font-medium text-white/50 hover:text-white transition"
                >
                  Back to Registration
                </button>
              </div>
            </form>
          </>
        )}

        <p className="text-center text-sm text-white/50 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-[#6be6b0] font-medium hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  );
}
