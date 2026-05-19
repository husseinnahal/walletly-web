'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function SecurityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSessions();
  }, [user, router]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/auth/sessions');
      setSessions(res.data || []);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch active sessions');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const handleRevoke = async (sessionId) => {
    if (!confirm('Are you sure you want to log out this device?')) return;
    try {
      await apiFetch(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
      fetchSessions();
      showFeedback('Device successfully disconnected 🛡️');
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">🛡️ Security</h1>
            <p className="mt-2 text-gray-500 dark:text-neutral-400 font-medium">Manage your active sessions and connected devices.</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl hover:bg-gray-50 transition shadow-sm">
            Back to Dashboard
          </button>
        </div>

        {/* Feedback Messages */}
        {message && <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium animate-fade-in">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium animate-fade-in">{error}</div>}

        {/* Sessions List */}
        <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-neutral-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32"></div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 relative z-10">Active Devices</h2>
          <div className="space-y-4 relative z-10">
            {sessions.map((session) => (
              <div key={session._id} className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border transition-all hover:shadow-md ${session.isCurrentDevice ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50' : 'bg-gray-50 dark:bg-neutral-900 border-gray-100 dark:border-neutral-700'}`}>
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${session.isCurrentDevice ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-500'}`}>
                    {session.deviceInfo?.toLowerCase().includes('mobile') || session.deviceInfo?.toLowerCase().includes('iphone') || session.deviceInfo?.toLowerCase().includes('android') ? '📱' : '💻'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {session.deviceName || session.deviceInfo || 'Unknown Device'}
                      {session.isCurrentDevice && (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white rounded-full shadow-sm">This Device</span>
                      )}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:gap-4 text-xs font-medium text-gray-500 dark:text-neutral-400 mt-1">
                      <span className="flex items-center gap-1">📍 IP: {session.ip || 'Unknown'}</span>
                      <span className="flex items-center gap-1">⏱️ Active: {new Date(session.updatedAt).toLocaleDateString()} at {new Date(session.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
                
                {!session.isCurrentDevice && (
                  <button 
                    onClick={() => handleRevoke(session._id)}
                    className="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 dark:bg-red-900/20 dark:border-red-900/30 dark:hover:bg-red-600 rounded-xl transition-all shadow-sm"
                  >
                    Revoke Access
                  </button>
                )}
              </div>
            ))}
            
            {sessions.length === 0 && (
              <div className="text-center py-10">
                <span className="text-4xl block mb-2">🛡️</span>
                <p className="text-gray-500 dark:text-neutral-400 font-medium">No active sessions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
