'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { getCurrencies } from '../../../lib/currencies';

export default function DebtPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState({ 
    debt: { total: 0, paid: 0, activeCount: 0, percentage: 0 }, 
    credit: { total: 0, paid: 0, activeCount: 0, percentage: 0 } 
  }); 
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD', 'EUR', 'GBP', 'SAR', 'AED']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Debt Form State
  const [debtForm, setDebtForm] = useState({
    person: '',
    amount: '',
    currency: 'USD',
    type: 'debt', // debt or credit
    interestRate: 0,
    dueDate: '',
    note: ''
  });
  const [isEditing, setIsEditing] = useState(null);
  const [showDebtForm, setShowDebtForm] = useState(false);

  // Payment Form State
  const [accounts, setAccounts] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    accountId: ''
  });
  const [activeDebt, setActiveDebt] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Filter State
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!user) router.push('/login');
    else {
      fetchDebts();
      loadCurrencies();
      fetchAccounts();
    }
  }, [user, filterType]); // Re-fetch when filterType changes

  const fetchAccounts = async () => {
    try {
      const res = await apiFetch('/accounts');
      const accs = res.data.accounts || [];
      setAccounts(accs);
      if (accs.length > 0) {
        setPaymentForm(prev => ({ ...prev, accountId: accs[0]._id }));
      }
    } catch (err) {
      console.log(err);
      console.error('Failed to fetch accounts');
    }
  };

  const loadCurrencies = async () => {
    const codes = await getCurrencies();
    setAvailableCurrencies(codes);
  };

  const fetchDebts = async () => {
    try {
      const query = filterType !== 'all' ? `?type=${filterType}` : '';
      const res = await apiFetch(`/debt${query}`);
      setDebts(res.data.debts || []);
      setSummary(res.data.summary || { 
        debt: { total: 0, paid: 0, activeCount: 0, percentage: 0 }, 
        credit: { total: 0, paid: 0, activeCount: 0, percentage: 0 } 
      });
      
      if (activeDebt) {
        const updated = (res.data.debts || []).find(d => d._id === activeDebt._id);
        if (updated) setActiveDebt(updated);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to fetch debts');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const handleDebtSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing ? `/debt/${isEditing}` : '/debt';
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(debtForm)
      });
      
      fetchDebts();
      showFeedback(isEditing ? 'Debt updated!' : 'New debt record created! 📝');
      resetDebtForm();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const resetDebtForm = () => {
    setDebtForm({ person: '', amount: '', currency: 'USD', type: 'debt', interestRate: 0, dueDate: '', note: '' });
    setIsEditing(null);
    setShowDebtForm(false);
  };

  const handleDeleteDebt = async (id) => {
    if (!confirm('Delete this record? All payment history and linked transactions will be removed.')) return;
    try {
      await apiFetch(`/debt/${id}`, { method: 'DELETE' });
      fetchDebts();
      showFeedback('Debt record deleted.');
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/debt/${activeDebt._id}/payments`, {
        method: 'POST',
        body: JSON.stringify(paymentForm)
      });
      fetchDebts();
      showFeedback('Payment logged and synchronized! ✅');
      setShowPaymentForm(false);
      setPaymentForm({ amount: '', currency: 'USD', date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleDeletePayment = async (debtId, paymentId) => {
    if (!confirm('Remove this payment? The linked transaction will also be deleted.')) return;
    try {
      await apiFetch(`/debt/${debtId}/payments/${paymentId}`, { method: 'DELETE' });
      fetchDebts();
      showFeedback('Payment entry removed.');
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const calculateProgress = (total, target) => {
    if (!target || target === 0) return 0;
    const percent = (total / target) * 100;
    return Math.min(percent, 100).toFixed(1);
  };

  const fetchInsights = async (id) => {
    setInsightsLoading(true);
    setInsights(null);
    setShowInsights(true);
    try {
      const res = await apiFetch(`/debt/${id}/insights`);
      setInsights(res.data);
    } catch (err) {
      showFeedback('Failed to generate AI insights. Please try again.', true);
      setShowInsights(false);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-[#6be6b0] to-emerald-600">
              Debt & Credit
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Track your personal obligations and receivables.</p>
          </div>
        </div>

        <div className="walletly-fab-group">
          <button onClick={() => { setIsEditing(null); setShowDebtForm(true); }} className="walletly-fab walletly-fab-primary">
            <span className="walletly-fab-icon">+</span>
            <span>Add Record</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {/* Debt Summary Card */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">💸 Total Debts</p>
              <span className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-black">{summary.debt.activeCount} People</span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">${summary.debt.total.toLocaleString()}</h3>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{summary.debt.percentage}% Repaid</span>
              <div className="flex-1 h-1.5 mx-3 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${summary.debt.percentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Credit Summary Card */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">💰 Total Credits</p>
              <span className="px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 text-[10px] font-black">{summary.credit.activeCount} People</span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">${summary.credit.total.toLocaleString()}</h3>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{summary.credit.percentage}% Collected</span>
              <div className="flex-1 h-1.5 mx-3 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${summary.credit.percentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Net Balance Card */}
          <div className="bg-gradient-to-br from-red-600 to-orange-700 p-6 rounded-3xl shadow-xl shadow-red-500/20 relative overflow-hidden group text-white">
            <p className="text-xs font-bold text-red-200 uppercase tracking-widest mb-1">⚖️ Net Balance</p>
            <h3 className="text-3xl font-black">${(summary.credit.total - summary.debt.total).toLocaleString()}</h3>
            <p className="text-xs text-red-100/80 mt-2 font-medium">Difference between receivables and payables</p>
            {/* Simple decoration */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-neutral-800 p-1 rounded-2xl w-fit">
          <button onClick={() => setFilterType('all')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${filterType === 'all' ? 'bg-white dark:bg-neutral-700 text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>All</button>
          <button onClick={() => setFilterType('debt')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${filterType === 'debt' ? 'bg-white dark:bg-neutral-700 text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>You Owe</button>
          <button onClick={() => setFilterType('credit')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${filterType === 'credit' ? 'bg-white dark:bg-neutral-700 text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Owed to You</button>
        </div>

        {/* Feedback Messages */}
        {message && <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium animate-fade-in">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium animate-fade-in">{error}</div>}

        {/* Debt Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {debts.length === 0 ? (
            <div className="md:col-span-2 py-20 text-center bg-white dark:bg-neutral-800 rounded-3xl border border-dashed border-gray-300 dark:border-neutral-700">
              <span className="text-6xl mb-4 block">📝</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No records found</h3>
              <p className="text-gray-500 dark:text-neutral-400 mt-1">Start tracking your debts and credits today.</p>
              <button onClick={() => setShowDebtForm(true)} className="mt-6 text-red-600 font-bold hover:underline">Add your first record →</button>
            </div>
          ) : (
            debts.map((debt) => (
              <div key={debt._id} className="bg-white dark:bg-neutral-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-700 transition-all hover:shadow-md relative overflow-hidden">
                {/* Type Indicator */}
                <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl ${debt.type === 'debt' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {debt.type === 'debt' ? 'You Owe' : 'Owed to You'}
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${debt.type === 'debt' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                      {debt.type === 'debt' ? '💸' : '💰'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{debt.person}</h3>
                      <p className="text-sm text-gray-500 dark:text-neutral-400">
                        {debt.type === 'debt' ? 'Money you owe' : 'Money owed to you'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 pt-6">
                    <button onClick={() => { setIsEditing(debt._id); setDebtForm({ ...debt, dueDate: debt.dueDate ? debt.dueDate.split('T')[0] : '' }); setShowDebtForm(true); }} className="p-2 text-gray-400 hover:text-blue-600 transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button onClick={() => handleDeleteDebt(debt._id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      ${debt.total.toLocaleString()} resolved of ${debt.totalAmountWithInterest?.toLocaleString() || debt.amount.toLocaleString()}
                    </span>
                    <span className={`text-sm font-extrabold ${debt.type === 'debt' ? 'text-red-600' : 'text-green-600'}`}>{calculateProgress(debt.total, debt.totalAmountWithInterest || debt.amount)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-neutral-700 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${debt.type === 'debt' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                      style={{ width: `${calculateProgress(debt.total, debt.totalAmountWithInterest || debt.amount)}%` }}
                    />
                  </div>
                  {debt.accumulatedInterest > 0 && (
                    <p className="mt-2 text-[10px] font-bold text-gray-400 italic">
                      Includes ${debt.accumulatedInterest.toLocaleString()} in accumulated interest ({debt.interestRate}%)
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-700">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Due Date</span>
                    <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">{debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : 'No deadline'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setActiveDebt(debt); setShowHistory(true); }} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
                      History
                    </button>
                    <button onClick={() => fetchInsights(debt._id)} className="px-4 py-2 text-sm font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 rounded-xl transition flex items-center gap-2">
                      <span>✨</span> AI Insights
                    </button>
                    <button onClick={() => { setActiveDebt(debt); setShowPaymentForm(true); }} className={`px-4 py-2 text-sm font-bold rounded-xl transition ${debt.type === 'debt' ? 'text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100' : 'text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100'}`}>
                      + {debt.type === 'debt' ? 'Make Payment' : 'Collect Payment'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Debt Modal */}
        {showDebtForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Record' : 'New Record'}</h2>
                <button onClick={resetDebtForm} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handleDebtSubmit} className="space-y-5">
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-neutral-900 rounded-xl">
                  <button type="button" onClick={() => setDebtForm({...debtForm, type: 'debt'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${debtForm.type === 'debt' ? 'bg-white dark:bg-neutral-800 text-red-600 shadow-sm' : 'text-gray-500'}`}>You Owe</button>
                  <button type="button" onClick={() => setDebtForm({...debtForm, type: 'credit'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${debtForm.type === 'credit' ? 'bg-white dark:bg-neutral-800 text-green-600 shadow-sm' : 'text-gray-500'}`}>Owed to You</button>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Person Name</label>
                  <input type="text" value={debtForm.person} onChange={(e) => setDebtForm({...debtForm, person: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all" placeholder="Who is involved?" required />
                </div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Total Amount</label>
                    <div className="flex gap-2">
                       <select value={debtForm.currency} onChange={(e) => setDebtForm({...debtForm, currency: e.target.value})} className="w-[100px] px-2 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-sm">
                          {availableCurrencies.map(code => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                       </select>
                       <input type="number" value={debtForm.amount} onChange={(e) => setDebtForm({...debtForm, amount: e.target.value})} className="flex-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all" placeholder="0.00" required />
                    </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Interest %</label>
                    <input type="number" value={debtForm.interestRate} onChange={(e) => setDebtForm({...debtForm, interestRate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all" placeholder="0" />
                  </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Due Date</label>
                  <input type="date" value={debtForm.dueDate} onChange={(e) => setDebtForm({...debtForm, dueDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all" />
                </div>
                <button type="submit" className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all ${debtForm.type === 'debt' ? 'bg-gradient-to-r from-red-600 to-orange-600 shadow-red-500/30' : 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-500/30'}`}>
                  {isEditing ? 'Save Changes' : 'Create Record'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeDebt.type === 'debt' ? 'Make Payment' : 'Collect Payment'}</h2>
                  <p className="text-sm text-gray-500">For: {activeDebt.person}</p>
                </div>
                <button onClick={() => setShowPaymentForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Amount</label>
                    <div className="flex gap-2">
                      <select value={paymentForm.currency} onChange={(e) => setPaymentForm({...paymentForm, currency: e.target.value})} className="w-24 px-3 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-sm font-bold">
                        {availableCurrencies.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                      <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} className={`flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 transition-all font-bold ${activeDebt.type === 'debt' ? 'focus:ring-red-500' : 'focus:ring-green-500'}`} placeholder="0.00" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Account</label>
                    <select value={paymentForm.accountId} onChange={(e) => setPaymentForm({...paymentForm, accountId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-sm font-bold" required>
                      <option value="">Select Account</option>
                      {accounts.map(acc => (
                        <option key={acc._id} value={acc._id}>{acc.name} (${acc.totalBalance})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Date</label>
                  <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})} className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 transition-all font-bold ${activeDebt.type === 'debt' ? 'focus:ring-red-500' : 'focus:ring-green-500'}`} required />
                </div>
                <button type="submit" className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all uppercase tracking-wider text-xs ${activeDebt.type === 'debt' ? 'bg-gradient-to-r from-red-600 to-orange-600 shadow-red-500/30' : 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-500/30'}`}>
                  Process Payment & Update Balance
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity History</h2>
                  <p className="text-sm text-gray-500">Transaction log for {activeDebt.person}</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {activeDebt.paidDebt?.length === 0 ? (
                  <p className="text-center py-10 text-gray-500 italic">No payments logged yet.</p>
                ) : (
                  [...activeDebt.paidDebt].reverse().map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900/50 rounded-2xl border border-gray-100 dark:border-neutral-700">
                      <div>
                        <p className={`text-lg font-bold ${activeDebt.type === 'debt' ? 'text-red-600' : 'text-green-600'}`}>
                          {activeDebt.type === 'debt' ? '-' : '+'} ${entry.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-black uppercase text-gray-400 bg-gray-200 dark:bg-neutral-700 px-2 py-0.5 rounded">Synced</div>
                        <button onClick={() => handleDeletePayment(activeDebt._id, entry._id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => { setShowHistory(false); setShowPaymentForm(true); }} className={`mt-6 w-full py-3 text-sm font-bold rounded-xl border border-dashed transition ${activeDebt.type === 'debt' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>
                + Log New Entry
              </button>
            </div>
          </div>
        )}

        {/* AI Insights Modal */}
        {showInsights && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-scale-up relative overflow-hidden border border-white/20">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">✨</div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">AI Debt Advisor</h2>
                    <p className="text-sm text-gray-500 font-medium">Smart Repayment Analysis</p>
                  </div>
                </div>
                <button onClick={() => setShowInsights(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 transition-all">✕</button>
              </div>

              {insightsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-purple-600 animate-pulse">Analyzing your debt strategy...</p>
                </div>
              ) : (
                <div className="space-y-6 relative z-10">
                  <div className="p-5 bg-purple-50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-800/30">
                    <h3 className="text-sm font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span> 💡 Smart Debt Plan
                    </h3>
                    <p className="text-gray-700 dark:text-neutral-300 text-sm leading-relaxed font-medium">{insights?.debtPlan}</p>
                  </div>

                  <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span> 📊 Payment Suggestions
                    </h3>
                    <p className="text-gray-700 dark:text-neutral-300 text-sm leading-relaxed font-medium">{insights?.suggestions}</p>
                  </div>

                  <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                    <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span> ⚖️ Financial Impact
                    </h3>
                    <p className="text-gray-700 dark:text-neutral-300 text-sm leading-relaxed font-medium">{insights?.impact}</p>
                  </div>

                  <button onClick={() => setShowInsights(false)} className="w-full py-4 mt-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                    Got it, thanks!
                  </button>
                </div>
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
