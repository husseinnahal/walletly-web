'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { getCurrencies } from '../../../lib/currencies';

export default function BillsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bills, setBills] = useState({ upcoming: [], others: [] });
  const [summary, setSummary] = useState({ spentThisMonth: 0, overdueCount: 0, projected30Days: 0 });
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD', 'EUR', 'GBP', 'SAR', 'AED']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  // Bill Form State
  const [billForm, setBillForm] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    dueDate: '',
    isRecurring: true,
    recurrence: 'monthly',
    autoRenew: true,
    autoPaid: false,
    autoPayAccountId: '',
    notes: '',
    image: ''
  });
  const [isEditing, setIsEditing] = useState(null);
  const [showBillForm, setShowBillForm] = useState(false);
  const [showHistoryFor, setShowHistoryFor] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingBill, setPayingBill] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  // Filter & Search State
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRecurrence, setFilterRecurrence] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) router.push('/login');
    else {
      fetchBills();
      loadCurrencies();
      fetchAccounts();
    }
  }, [user, filterStatus]);

  const fetchAccounts = async () => {
    try {
      const res = await apiFetch('/accounts');
      const accs = res.data.accounts || [];
      setAccounts(accs);
      if (accs.length > 0) setSelectedAccountId(accs[0]._id);
    } catch (err) {
      console.error('Failed to fetch accounts');
    }
  };

  const loadCurrencies = async () => {
    const codes = await getCurrencies();
    setAvailableCurrencies(codes);
  };

  const fetchBills = async () => {
    try {
      const query = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const res = await apiFetch(`/bills${query}`);
      const data = res.data || { upcoming: [], others: [], stats: { spentThisMonth: 0, overdueCount: 0, projected30Days: 0 } };
      
      setBills(data);
      setSummary(data.stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const handleBillSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing ? `/bills/${isEditing}` : '/bills';
      await apiFetch(url, {
        method,
        body: JSON.stringify(billForm)
      });
      
      fetchBills();
      showFeedback(isEditing ? 'Bill updated!' : 'New bill added! 📅');
      resetBillForm();
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const resetBillForm = () => {
    setBillForm({ name: '', amount: '', currency: 'USD', dueDate: '', isRecurring: true, recurrence: 'monthly', autoRenew: true, autoPaid: false, autoPayAccountId: '', notes: '', image: '' });
    setIsEditing(null);
    setShowBillForm(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillForm({ ...billForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteBill = async (id) => {
    if (!confirm('Delete this bill? This will stop all future tracking for it.')) return;
    try {
      await apiFetch(`/bills/${id}`, { method: 'DELETE' });
      fetchBills();
      showFeedback('Bill removed.');
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handlePayBill = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/bills/${payingBill._id}/pay`, { 
        method: 'POST',
        body: JSON.stringify({ accountId: selectedAccountId })
      });
      fetchBills();
      showFeedback('Bill paid and transaction recorded! ✅');
      setShowPayModal(false);
      setPayingBill(null);
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

  const handleCancelBill = async (id, currentStatus) => {
    const isCancelled = currentStatus === 'cancelled';
    const msg = isCancelled 
        ? 'Resume this subscription?' 
        : 'Stop this subscription? It will be marked as cancelled.';
        
    if (!confirm(msg)) return;
    try {
      await apiFetch(`/bills/${id}/cancel`, { method: 'POST' });
      fetchBills();
      showFeedback(isCancelled ? 'Subscription resumed ▶️' : 'Subscription stopped 🛑');
    } catch (err) {
      showFeedback(err.message, true);
    }
  };

const applyFilters = (bill) => {
  const matchesSearch =
    !searchTerm ||
    bill.name.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesStatus =
    filterStatus === 'all' || bill.status === filterStatus;

  const matchesRecurrence =
    filterRecurrence === 'all' ||
    (bill.isRecurring && bill.recurrence === filterRecurrence);

  return matchesSearch && matchesStatus && matchesRecurrence;
};

  const filteredUpcoming = (bills.upcoming || []).filter(applyFilters);
  const filteredOthers = (bills.others || []).filter(applyFilters);

  const renderBillCard = (bill) => (
    <div key={bill._id} className="bg-white dark:bg-neutral-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-700 transition-all hover:shadow-md relative overflow-hidden">
      {/* Status Indicator */}
      <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl ${
        bill.status === 'paid' ? 'bg-green-100 text-green-600' : 
        bill.status === 'overdue' ? 'bg-red-100 text-red-600' : 
        'bg-amber-100 text-amber-600'
      }`}>
        {bill.status}
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="relative group/img">
            {bill.image ? (
              <img src={bill.image} alt={bill.name} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-indigo-50 dark:bg-indigo-900/20`}>
                📄
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{bill.name}</h3>
            <p className="text-sm text-gray-500 dark:text-neutral-400 capitalize">
              {bill.isRecurring ? `${bill.recurrence} payment` : 'One-time payment'}
            </p>
          </div>
        </div>
        <div className="flex gap-1 pt-6">
          <button onClick={() => {
            setBillForm({
              name: bill.name,
              amount: bill.amount,
              currency: bill.currency || 'USD',
              dueDate: new Date(bill.dueDate).toISOString().split('T')[0],
              isRecurring: bill.isRecurring,
              recurrence: bill.recurrence,
              autoRenew: bill.autoRenew,
              autoPaid: bill.autoPaid,
              autoPayAccountId: bill.autoPayAccountId || '',
              notes: bill.notes || '',
              image: bill.image || ''
            });
            setIsEditing(bill._id);
            setShowBillForm(true);
          }} className="p-2 text-gray-400 hover:text-indigo-600 transition" title="Edit Bill">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </button>
          <button onClick={() => handleDeleteBill(bill._id)} className="p-2 text-gray-400 hover:text-red-600 transition" title="Delete Permanent">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
          {bill.isRecurring && (
            <button 
              onClick={() => handleCancelBill(bill._id, bill.status)} 
              className={`p-2 transition ${bill.status === 'cancelled' ? 'text-gray-400 hover:text-green-600' : 'text-gray-400 hover:text-orange-600'}`} 
              title={bill.status === 'cancelled' ? "Resume Subscription" : "Stop Subscription"}
            >
              <span className="text-xl">{bill.status === 'cancelled' ? '▶️' : '🛑'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-700 mt-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Due Date</span>
          <span className={`text-sm font-bold ${bill.status === 'overdue' ? 'text-red-600' : 'text-gray-600 dark:text-neutral-300'}`}>
            {new Date(bill.dueDate).toLocaleDateString()}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase block text-right">Amount</span>
          <span className="text-lg font-black text-gray-900 dark:text-white">${bill.amount.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        {bill.status !== 'paid' && (
          <button onClick={() => { 
            setPayingBill(bill); 
            setSelectedAccountId(bill.autoPayAccountId || (accounts.length > 0 ? accounts[0]._id : ''));
            setShowPayModal(true); 
          }} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-lg shadow-indigo-500/20">
            Pay Now
          </button>
        )}
        <button onClick={() => setShowHistoryFor(bill)} className="px-4 py-3 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 text-gray-700 dark:text-neutral-300 font-bold rounded-2xl transition shadow-sm">
          History
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">🏛️ Bills & Subscriptions</h1>
            <p className="mt-2 text-gray-500 dark:text-neutral-400 font-medium">Manage your recurring payments and dues.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowBillForm(true)} className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-[1.02] active:scale-95 rounded-2xl shadow-xl shadow-indigo-500/25 transition-all">
              + Add Bill
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 relative overflow-hidden group">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Spent This Month</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">${summary.spentThisMonth?.toLocaleString()}</h3>
            <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live Ledger Sync
            </p>
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
            <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">30-Day Forecast</p>
            <h3 className="text-3xl font-black text-white">${summary.projected30Days?.toLocaleString()}</h3>
            <p className="text-xs text-indigo-200 mt-2 font-medium">Projected Obligations</p>
          </div>

          <div className={`p-6 rounded-3xl shadow-xl transition-all relative overflow-hidden group ${summary.overdueCount > 0 ? 'bg-red-600 text-white shadow-red-500/20' : 'bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700'}`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${summary.overdueCount > 0 ? 'text-red-100' : 'text-gray-400'}`}>Overdue Alerts</p>
            <h3 className={`text-3xl font-black ${summary.overdueCount > 0 ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{summary.overdueCount}</h3>
            <p className={`text-xs mt-2 font-medium ${summary.overdueCount > 0 ? 'text-red-50/80' : 'text-gray-500'}`}>Requires immediate action</p>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-neutral-800 p-4 rounded-[2rem] shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search bills by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-neutral-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-neutral-900 rounded-2xl text-sm border-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <select 
              value={filterRecurrence} 
              onChange={(e) => setFilterRecurrence(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-neutral-900 rounded-2xl text-sm border-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Frequencies</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Feedback Messages */}
        {message && <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium animate-fade-in">{message}</div>}
        {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium animate-fade-in">{error}</div>}

        {/* Bills List */}
        <div className="space-y-12">
          {filteredUpcoming.length === 0 && filteredOthers.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-neutral-800 rounded-3xl border border-dashed border-gray-300 dark:border-neutral-700">
              <span className="text-6xl mb-4 block">📧</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No bills found</h3>
              <p className="text-gray-500 dark:text-neutral-400 mt-1">Start tracking your recurring payments to avoid late fees.</p>
              <button onClick={() => setShowBillForm(true)} className="mt-6 text-indigo-600 font-bold hover:underline">Add your first bill →</button>
            </div>
          ) : (
            <>
              {/* Upcoming Section */}
              {filteredUpcoming.length > 0 && (
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                    🔥 Urgent (This Week)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredUpcoming.map((bill) => renderBillCard(bill))}
                  </div>
                </div>
              )}

              {/* Others Section */}
              {filteredOthers.length > 0 && (
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                    📂 All Other Bills
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredOthers.map((bill) => renderBillCard(bill))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* </div > */}
        {showBillForm && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl sm:rounded-3xl w-full max-w-md p-4 sm:p-8 shadow-2xl animate-scale-up my-4 sm:my-8">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Bill' : 'New Bill'}</h2>
                <button onClick={resetBillForm} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all text-lg">✕</button>
              </div>
              <form onSubmit={handleBillSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-neutral-300 mb-1.5">Bill Name</label>
                  <input type="text" value={billForm.name} onChange={(e) => setBillForm({...billForm, name: e.target.value})} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="E.g. Netflix, Rent, Electricity..." required />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-neutral-300 mb-1.5">Bill Photo / Receipt</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center h-24 sm:h-32 px-3 py-4 bg-gray-50 dark:bg-neutral-900 border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all overflow-hidden">
                      {billForm.image ? (
                        <img src={billForm.image} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <div className="text-center">
                          <span className="text-xl sm:text-2xl mb-1 block">📸</span>
                          <p className="text-xs text-gray-500 font-bold">Tap to upload receipt</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                    {billForm.image && (
                      <button type="button" onClick={() => setBillForm({...billForm, image: ''})} className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl">Remove</button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-neutral-300 mb-1.5">Amount</label>
                  <div className="flex gap-2">
                    <select value={billForm.currency} onChange={(e) => setBillForm({...billForm, currency: e.target.value})} className="w-20 sm:w-[100px] px-2 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-xs sm:text-sm">
                      {availableCurrencies.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                    <input type="number" value={billForm.amount} onChange={(e) => setBillForm({...billForm, amount: e.target.value})} className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="0.00" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-neutral-300 mb-1.5">Due Date</label>
                  <input type="date" value={billForm.dueDate} onChange={(e) => setBillForm({...billForm, dueDate: e.target.value})} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" required />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input type="checkbox" checked={billForm.isRecurring} onChange={(e) => setBillForm({...billForm, isRecurring: e.target.checked, autoRenew: e.target.checked})} className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded-lg focus:ring-indigo-500" />
                  <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-neutral-300">This is a recurring bill</label>
                </div>

                {billForm.isRecurring && (
                  <div className="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">Frequency</label>
                      <select value={billForm.recurrence} onChange={(e) => setBillForm({...billForm, recurrence: e.target.value})} className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-800 text-xs sm:text-sm">
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="semiannual">Semi-Annual</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={billForm.autoPaid} onChange={(e) => setBillForm({...billForm, autoPaid: e.target.checked})} className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded-lg focus:ring-indigo-500" />
                      <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-neutral-300">Auto-paid (Background Sync)</label>
                    </div>

                    <div>
                      <label className="block text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">Default Payment Account</label>
                      <select
                        value={billForm.autoPayAccountId}
                        onChange={(e) => setBillForm({...billForm, autoPayAccountId: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-neutral-800 text-xs sm:text-sm"
                        required
                      >
                        <option value="">Select Default Account</option>
                        {accounts.map(acc => (
                          <option key={acc._id} value={acc._id}>{acc.name} (${acc.totalBalance})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm sm:text-base font-black rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all">
                  {isEditing ? 'Save Changes' : 'Create Bill Tracker'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Payment History Modal */}
        {showHistoryFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up my-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h2>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">{showHistoryFor.name}</p>
                </div>
                <button onClick={() => setShowHistoryFor(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {!showHistoryFor.paymentHistory || showHistoryFor.paymentHistory.length === 0 ? (
                  <div className="text-center py-10">
                    <span className="text-4xl block mb-2">📭</span>
                    <p className="text-gray-500 dark:text-neutral-400 font-medium">No payment history yet.</p>
                  </div>
                ) : (
                  [...showHistoryFor.paymentHistory].reverse().map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">Paid</p>
                          <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className="font-black text-gray-900 dark:text-white">${payment.amount?.toLocaleString() || showHistoryFor.amount?.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pay Bill Modal */}
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Payment</h2>
                  <p className="text-sm text-gray-500">Bill: {payingBill?.name}</p>
                </div>
                <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={handlePayBill} className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Amount Due:</span>
                    <span className="text-xl font-black text-gray-900 dark:text-white">${payingBill?.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Due Date:</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-neutral-300">{new Date(payingBill?.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-neutral-300 mb-2">Choose Account</label>
                  <select 
                    value={selectedAccountId} 
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-sm font-bold"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map(acc => (
                      <option key={acc._id} value={acc._id}>{acc.name} (${acc.totalBalance})</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs">
                  Authorize Payment & Update Balance
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
