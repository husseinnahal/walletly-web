'use client';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        
        {step === 'register' ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
              <p className="text-sm text-gray-500 mt-1">Start managing your money with Walletly</p>
            </div>

            {/* Google Register Container */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div id="googleRegisterDiv" className="w-full min-h-[44px] flex items-center justify-center" />
            </div>

            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">or register manually</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleChange}
                    required
                    placeholder={f.placeholder}
                    className="w-full text-black px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Next: Verify Email'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 text-green-600 rounded-2xl mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Verify your Email</h1>
              <p className="text-sm text-gray-500 mt-1.5 px-4">
                We sent a 6-digit verification code to <br />
                <span className="font-semibold text-gray-800">{formData.email}</span>
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-center text-sm font-semibold text-gray-700 mb-2">Enter Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="123456"
                  className="w-full text-center text-black px-4 py-3 border border-gray-300 rounded-xl text-2xl font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder:opacity-30 placeholder:tracking-normal"
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
                  className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Complete Register'}
                </button>

                <button
                  type="button"
                  onClick={() => { setError(''); setStep('register'); }}
                  className="w-full py-2.5 text-center text-sm font-medium text-gray-500 hover:text-gray-700 transition"
                >
                  Back to Registration
                </button>
              </div>
            </form>
          </>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 font-medium hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  );
}
