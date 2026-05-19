'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { getCurrencies } from '../../../lib/currencies';
import { useRouter } from 'next/navigation';

export default function SavingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD', 'EUR', 'GBP', 'SAR', 'AED']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Goal Form State
  const [goalForm, setGoalForm] = useState({
    title: '',
    amount: '',
    currency: 'USD',
    icon: '💰',
    deadline: ''
  });
  const [isEditing, setIsEditing] = useState(null); // ID of goal being edited
  const [showGoalForm, setShowGoalForm] = useState(false);

  // Progress Form State
  const [accounts, setAccounts] = useState([]);
  const [progressForm, setProgressForm] = useState({
    amount: '',
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    accountId: ''
  });
  const [activeGoal, setActiveGoal] = useState(null); // Goal for which progress is being added
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // AI Insights State
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    if (!user) router.push('/login');
    else {
      fetchGoals();
      loadCurrencies();
      fetchAccounts();
    }
  }, [user, searchTerm]);

  const fetchAccounts = async () => {
    try {
      const res = await apiFetch('/accounts');
      const accs = res.data.accounts || [];
      setAccounts(accs);
      if (accs.length > 0) {
        setProgressForm(prev => ({ ...prev, accountId: accs[0]._id }));
      }
    } catch (err) {
      console.error('Failed to fetch accounts');
    }
  };

  const loadCurrencies = async () => {
    const codes = await getCurrencies();
    setAvailableCurrencies(codes);
  };

  const fetchGoals = async () => {
    try {
      const url = searchTerm ? `/savings?search=${encodeURIComponent(searchTerm)}` : '/savings';
      const res = await apiFetch(url);
      // res is { success: true, data: { goals: [], totalTarget: 0, totalSaved: 0 } }
      const savingsData = res.data || {};
      const newGoals = savingsData.goals || [];
      setGoals(newGoals);
      setTotalTarget(savingsData.totalTarget || 0);
      setTotalSaved(savingsData.totalSaved || 0);

      // Update activeGoal if it exists
      if (activeGoal) {
        const updated = newGoals.find(g => g._id === activeGoal._id);
        if (updated) setActiveGoal(updated);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch saving goals');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing ? `/savings/${isEditing}` : '/savings';
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(goalForm)
      });
      
      // Refresh list to update totals
      fetchGoals();
      
      if (isEditing) {
        showFeedback('Goal updated successfully!');
      } else {
        showFeedback('New goal started! Good luck! 🚀');
      }
      
      resetGoalForm();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const resetGoalForm = () => {
    setGoalForm({ title: '', amount: '', currency: 'USD', icon: '💰', deadline: '' });
    setIsEditing(null);
    setShowGoalForm(false);
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm('Are you sure you want to delete this goal? All progress history will be lost.')) return;
    try {
      await apiFetch(`/savings/${id}`, { method: 'DELETE' });
      fetchGoals(); // Refresh to update totals
      showFeedback('Goal deleted.');
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/savings/${activeGoal._id}/progress`, {
        method: 'POST',
        body: JSON.stringify(progressForm)
      });
      fetchGoals(); // Refresh to update totals
      showFeedback('Progress logged! Keep going! 💪');
      setShowProgressForm(false);
      setProgressForm({ amount: '', currency: 'USD', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleDeleteProgress = async (goalId, progressId) => {
    if (!confirm('Delete this progress entry?')) return;
    try {
      await apiFetch(`/savings/${goalId}/progress/${progressId}`, { method: 'DELETE' });
      fetchGoals(); // Refresh to update totals
      showFeedback('Progress entry removed.');
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleFetchInsights = async (goal) => {
    setActiveGoal(goal);
    setLoadingInsights(true);
    setShowInsights(true);
    setInsights(null);
    try {
      const res = await apiFetch(`/savings/${goal._id}/insights`);
      setInsights(res.data);
    } catch (err) {
      showFeedback(err.message || 'Failed to generate AI insights', true);
      setShowInsights(false);
    } finally {
      setLoadingInsights(false);
    }
  };

  const calculateProgress = (total, target) => {
    if (!target || target === 0) return 0;
    const percent = (total / target) * 100;
    return Math.min(percent, 100).toFixed(1);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-wrap gap-1 md:items-center md:justify-between bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-[#6be6b0] to-emerald-600">
              Savings
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Track your dreams and build your future.</p>
          </div>
          <div className="mt-4 md:mt-2  flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3">
            <button onClick={() => setShowGoalForm(true)} className="px-4 py-2 w-full  sm:w-auto border border-transparent shadow-sm text-xs sm:text-sm font-bold rounded-xl text-black bg-gradient-to-r from-[#6be6b0] to-emerald-600 hover:scale-[1.02] active:scale-95 transition-all">
              + New Goal
            </button>
            <div className="relative group w-full  sm:w-auto">
              <input 
                type="text" 
                placeholder="Search goals..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-48 text-xs text-black font-semibold bg-gray-50 dark:bg-neutral-850 border border-gray-200 dark:border-neutral-750 rounded-xl focus:ring-2 focus:ring-[#6be6b0]/40 outline-none transition-all shadow-sm "
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <span className="text-5xl">🎯</span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Target</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">${totalTarget.toLocaleString()}</h3>
            <p className="text-xs text-gray-500 mt-2 font-medium">USD Equivalent</p>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <span className="text-5xl">💵</span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Saved</p>
            <h3 className="text-3xl font-black text-green-600 dark:text-green-400">${totalSaved.toLocaleString()}</h3>
            <p className="text-xs text-gray-500 mt-2 font-medium">Across {goals.length} goals</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-purple-500/20 relative overflow-hidden group text-white">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
              <span className="text-5xl">📈</span>
            </div>
            <p className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-1">Overall Progress</p>
            <h3 className="text-3xl font-black">{calculateProgress(totalSaved, totalTarget)}%</h3>
            <div className="mt-4 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
               <div className="bg-white h-full transition-all duration-1000" style={{ width: `${calculateProgress(totalSaved, totalTarget)}%` }} />
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {message && <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium animate-fade-in">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium animate-fade-in">{error}</div>}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.length === 0 ? (
            <div className="md:col-span-2 py-20 text-center bg-white dark:bg-neutral-800 rounded-3xl border border-dashed border-gray-300 dark:border-neutral-700">
              <span className="text-6xl mb-4 block">🎯</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No savings goals yet</h3>
              <p className="text-gray-500 dark:text-neutral-400 mt-1">Ready to start saving for something big?</p>
              <button onClick={() => setShowGoalForm(true)} className="mt-6 text-purple-600 font-bold hover:underline">Create your first goal →</button>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal._id} className="bg-white dark:bg-neutral-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-700 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        Target: <span className="font-bold text-gray-700 dark:text-neutral-200">${goal.amount.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setIsEditing(goal._id); setGoalForm({ title: goal.title, amount: goal.amount, icon: goal.icon, deadline: goal.deadline ? goal.deadline.split('T')[0] : '', currency: 'USD' }); setShowGoalForm(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button onClick={() => handleFetchInsights(goal)} className="p-2 text-purple-500 hover:text-purple-700 transition" title="AI Insights">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </button>
                    <button onClick={() => handleDeleteGoal(goal._id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">${goal.total.toLocaleString()} saved</span>
                    <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">{calculateProgress(goal.total, goal.amount)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-neutral-700 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${calculateProgress(goal.total, goal.amount)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-700">
                  <button onClick={() => { setActiveGoal(goal); setShowHistory(true); }} className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
                    View History
                  </button>
                  <button onClick={() => { setActiveGoal(goal); setShowProgressForm(true); }} className="px-4 py-2 text-sm font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition">
                    + Add Progress
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Goal Modal */}
        {showGoalForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Goal' : 'Create New Goal'}</h2>
                <button onClick={resetGoalForm} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleGoalSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Title</label>
                  <input type="text" value={goalForm.title} onChange={(e) => setGoalForm({...goalForm, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all" placeholder="New Car, Vacation, Emergency Fund..." required minLength={3} />
                </div>
                <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Target Amount</label>
                    <div className="flex gap-2">
                       <select value={goalForm.currency} onChange={(e) => setGoalForm({...goalForm, currency: e.target.value})} className="w-[100px] px-2 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-sm">
                          {availableCurrencies.map(code => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                       </select>
                       <input type="number" value={goalForm.amount} onChange={(e) => setGoalForm({...goalForm, amount: e.target.value})} className="flex-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all" placeholder="0.00" required />
                    </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Icon (Emoji)</label>
                    <input type="text" value={goalForm.icon} onChange={(e) => setGoalForm({...goalForm, icon: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-center text-2xl focus:ring-2 focus:ring-purple-500 transition-all" placeholder="💰" required />
                  </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Deadline (Optional)</label>
                  <input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-95 transition-all">
                  {isEditing ? 'Save Changes' : 'Start Saving'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Progress Modal */}
        {showProgressForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Progress</h2>
                  <p className="text-sm text-gray-500">For: {activeGoal.title}</p>
                </div>
                <button onClick={() => setShowProgressForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleProgressSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Amount to Add</label>
                    <div className="flex gap-2">
                      <select value={progressForm.currency} onChange={(e) => setProgressForm({...progressForm, currency: e.target.value})} className="w-24 px-3 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-sm font-bold">
                        {availableCurrencies.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                      <input type="number" value={progressForm.amount} onChange={(e) => setProgressForm({...progressForm, amount: e.target.value})} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all font-bold" placeholder="0.00" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Account</label>
                    <select value={progressForm.accountId} onChange={(e) => setProgressForm({...progressForm, accountId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-sm font-bold" required>
                      <option value="">Select Account</option>
                      {accounts.map(acc => (
                        <option key={acc._id} value={acc._id}>{acc.name} (${acc.totalBalance})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Date</label>
                  <input type="date" value={progressForm.date} onChange={(e) => setProgressForm({...progressForm, date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all font-bold" required />
                </div>
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wider text-xs">
                  Log Payment & Update Balance
                </button>
              </form>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-scale-up max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Saving History</h2>
                  <p className="text-sm text-gray-500">{activeGoal.title}</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {activeGoal.savedAmounts?.length === 0 ? (
                  <p className="text-center py-10 text-gray-500 italic">No entries yet.</p>
                ) : (
                  [...activeGoal.savedAmounts].reverse().map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900/50 rounded-2xl border border-gray-100 dark:border-neutral-700">
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">+ ${entry.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => handleDeleteProgress(activeGoal._id, entry._id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => { setShowHistory(false); setShowProgressForm(true); }} className="mt-6 w-full py-3 text-sm font-bold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl border border-dashed border-purple-200 dark:border-purple-800 transition">
                + Add New Entry
              </button>
            </div>
          </div>
        )}

        {/* AI Insights Modal */}
        {showInsights && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 text-lg animate-pulse">✨</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Insights</h2>
                    <p className="text-xs text-gray-500">{activeGoal?.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowInsights(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              {loadingInsights ? (
                <div className="py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-purple-600 mb-4"></div>
                  <p className="text-xs text-gray-500 font-medium tracking-wide">Analyzing your goal...</p>
                </div>
              ) : insights ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/50">
                    <h3 className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="text-sm">📅</span> Smart Saving Plan
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-neutral-300 leading-snug">{insights.savingPlan}</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <h3 className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="text-sm">💡</span> Auto Insights
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-neutral-300 leading-snug">{insights.insights}</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                    <h3 className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="text-sm">🚀</span> Smart Suggestions
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-neutral-300 leading-snug">{insights.suggestions}</p>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-[10px] text-gray-400">Powered by Gemini AI</p>
                  </div>
                </div>
              ) : (
                <p className="text-center py-6 text-red-500 text-sm">Failed to load insights. Please try again.</p>
              )}
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
        }
      `}</style>
    </div>
  );
}
