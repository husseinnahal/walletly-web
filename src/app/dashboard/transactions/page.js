'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { getCurrencies } from '../../../lib/currencies';

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [todayTransactions, setTodayTransactions] = useState([]);
  const [otherTransactions, setOtherTransactions] = useState([]);
  const [filters, setFilters] = useState({ type: '', category: '', period: '', startDate: '', endDate: '' });
  const [summary, setSummary] = useState({ income: 0, expenses: 0, savings: 0 });
  const [categories, setCategories] = useState([]);
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD', 'EUR', 'GBP', 'SAR', 'AED']);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState(null);

  // AI Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiLanguage, setAiLanguage] = useState('English');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    account: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0], // today's date
    note: '',
    currency: 'USD',
  });

  const fetchTransactions = async () => {
    try {
      const queryParams = new URLSearchParams(Object.entries(filters).filter(([_, v]) => v !== '')).toString();
      const url = queryParams ? `/transactions?${queryParams}` : '/transactions';
      const res = await apiFetch(url);
      setTodayTransactions(res.data?.todayTransactions || []);
      setOtherTransactions(res.data?.otherTransactions || []);
      setSummary({ 
        income: res.data?.totalIncome || 0, 
        expenses: res.data?.totalExpenses || 0,
        savings: res.data?.totalSavings || 0
      });
      
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
    }
  };

  const loadCurrencies = async () => {
    const codes = await getCurrencies();
    setAvailableCurrencies(codes);
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [categoriesRes, accountsRes] = await Promise.all([
          apiFetch('/categories'),
          apiFetch('/accounts'),
          loadCurrencies()
        ]);
        const cats = categoriesRes.data || [];
        const accs = accountsRes.data.accounts || [];
        setCategories(cats);
        setAccounts(accs);
        
        // Set first account as default if exists
        if (accs.length > 0) {
            setFormData(prev => ({ ...prev, account: accs[0]._id }));
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user, router]);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [filters, user]);

  const showFeedback = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };
      
      await apiFetch(editingTransactionId ? `/transactions/${editingTransactionId}` : '/transactions', {
        method: editingTransactionId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });

      await fetchTransactions();

      showFeedback(editingTransactionId ? 'Transaction updated successfully!' : 'Transaction added successfully!');
      setFormData({
        title: '',
        amount: '',
        category: formData.category, // Keep category for faster multi-entry
        account: formData.account,   // Keep account for faster multi-entry
        type: formData.type,
        date: new Date().toISOString().split('T')[0],
        note: '',
        currency: 'USD',
      });
      setEditingTransactionId(null);
      setShowTransactionForm(false);
    } catch (err) {
      showFeedback(err.message || 'Failed to add transaction', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
      fetchTransactions();
      showFeedback('Transaction deleted.');
    } catch (err) {
      showFeedback(err.message || 'Failed to delete transaction', true);
    }
  };

  const openEditTransaction = (transaction) => {
    setEditingTransactionId(transaction._id);
    setFormData({
      title: transaction.title || '',
      amount: transaction.amount || '',
      category: transaction.category?._id || transaction.category || '',
      account: transaction.account?._id || transaction.account || '',
      type: transaction.type || 'expense',
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      note: transaction.note || '',
      currency: transaction.currency || 'USD',
    });
    setShowTransactionForm(true);
  };

  const closeTransactionForm = () => {
    setShowTransactionForm(false);
    setEditingTransactionId(null);
  };

  // ── AI Voice Methods ──

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = processAudio;

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      showFeedback('Microphone access denied or unavailable.', true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release mic
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async () => {
    setIsProcessingAI(true);
    showFeedback('🤖 Processing your voice with AI...');

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      // append the file, give it a name
      formData.append('audio', audioBlob, 'voice-record.webm');
      formData.append('language', aiLanguage);

      // we use apiFetch which automatically strips Content-Type for FormData
      const result = await apiFetch('/transactions/ai-parse', {
        method: 'POST',
        body: formData,
      });

      if (result.data && result.data.length > 0) {
        showFeedback(result.message || `Successfully saved ${result.data.length} transaction(s)!`);
        // Refresh the transactions list from the server
        await fetchTransactions();
      } else {
        showFeedback('AI did not detect any transactions in the audio.', true);
      }
    } catch (err) {
      showFeedback(err.message, true);
      console.log(err);
      
    } finally {
      setIsProcessingAI(false);
    }
  };

  function renderTransactionCard(transaction) {
    const isExpense = transaction.type;
    return (
      <div key={transaction._id} className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
        
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm ${isExpense ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-green-50 text-green-600 dark:bg-green-900/20'}`}>
            {transaction.category?.icon || (isExpense=="expense" ? '💸' : '💰')}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{transaction.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">{transaction.category?.name || 'Uncategorized'}</span>
              <span>•</span>
              <span>{new Date(transaction.date).toLocaleDateString()}</span>
            </p>
            {transaction.note && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{transaction.note}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 dark:border-neutral-700">
          <div className="text-right">
            <span className={`text-xl font-extrabold ${isExpense=="expense" ? 'text-red-600 dark:text-red-400' : (isExpense=="income" ?  'text-green-600 dark:text-green-400': 'text-blue-600 dark:text-blue-400')}`}>
              {isExpense=="expense" ? '-' : (isExpense=="income"?'+': "")}${transaction.amount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => openEditTransaction(transaction)}
              className="p-2 text-gray-400 hover:text-[#6be6b0] bg-gray-50 hover:bg-emerald-50 rounded-lg transition-colors dark:bg-neutral-700 dark:hover:bg-emerald-900/20"
              title="Edit Transaction"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4 4 0 01-1.897 1.13L6 18l.8-2.685a4 4 0 011.13-1.897l8.932-8.931z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 7.125L16.875 4.5M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path></svg>
            </button>
            <button 
              onClick={() => handleDeleteTransaction(transaction._id)}
              className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors dark:bg-neutral-700 dark:hover:bg-red-900/20"
              title="Delete Transaction"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>

      </div>
    );
  }

  if (!user || loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-[#6be6b0] to-emerald-600">
              Transactions
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Log your expenses manually or use Voice AI.</p>
          </div>
        </div>

        <div className="walletly-fab-group">
          <button
            onClick={() => { setEditingTransactionId(null); setShowTransactionForm(true); }}
            className="walletly-fab walletly-fab-primary"
          >
            <span className="walletly-fab-icon">+</span>
            <span>Add</span>
          </button>
          <button
            onClick={() => setShowAiPanel(true)}
            className="walletly-fab walletly-fab-orange"
          >
            <span className="walletly-fab-icon">AI</span>
            <span>Voice</span>
          </button>
        </div>

        {/* Alerts */}
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
          {message && (
            <div className="animate-fade-in-down bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              {message}
            </div>
          )}
          {error && (
            <div className="animate-fade-in-down bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}
        </div>
        {showAiPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-4xl">
                 {/* AI Voice Section */}
        <div className="bg-gradient-to-br from-[#0e0e0e] via-[#161616] to-[#0e0e0e] border border-neutral-850 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAiPanel(false)}
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
            aria-label="Close AI voice panel"
          >
            ×
          </button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6be6b0]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#EA7108]/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 sm:mb-3 flex items-center justify-center md:justify-start gap-2">
                <span>🎙️</span> AI Voice Assistant
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base max-w-xl">
                Just tap and speak. Our AI will automatically parse, categorize, and save all your transactions in seconds.
              </p>
              <p className="mt-3 text-xs sm:text-sm font-semibold text-[#EA7108]/90 italic">
                Try: I spent 50 SAR on fuel and 100 SAR on dinner at Al Baik
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4 sm:gap-6 bg-neutral-900/50 p-6 sm:p-8 rounded-3xl border border-neutral-850 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-450">Language</span>
                <select value={aiLanguage} onChange={(e) => setAiLanguage(e.target.value)} disabled={isRecording || isProcessingAI} 
                  className="bg-neutral-850 text-white text-xs sm:text-sm font-bold border border-neutral-800 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#6be6b0]/40 cursor-pointer outline-none hover:bg-neutral-800 transition-all">
                  <option value="English" className="text-white bg-neutral-900">🇬🇧 English</option>
                  <option value="Arabic" className="text-white bg-neutral-900">🇸🇦 Arabic</option>
                </select>
              </div>
              
              <div className="relative group">
                {isRecording && (
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25"></div>
                )}
                <button 
                  onClick={isRecording ? stopRecording : startRecording} 
                  disabled={isProcessingAI}
                  className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all transform active:scale-90 shadow-2xl ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gradient-to-tr from-[#6be6b0] to-emerald-600 text-black hover:scale-105 shadow-[#6be6b0]/20'
                  } ${isProcessingAI ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessingAI ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                  ) : isRecording ? (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"></path></svg>
                  ) : (
                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                  )}
                </button>
              </div>
              
              <div className="text-center">
                <p className={`text-xs sm:text-sm font-bold tracking-wide uppercase ${isRecording ? 'text-red-400' : 'text-neutral-300'}`}>
                  {isRecording ? 'Recording...' : isProcessingAI ? 'AI is Processing' : 'Tap to Start'}
                </p>
                {isRecording && <p className="text-[10px] text-red-350 mt-1">Tap again to stop</p>}
              </div>
            </div>
          </div>
        </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          
          {/* Create Form */}
          {showTransactionForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-lg bg-white dark:bg-neutral-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-neutral-700 overflow-hidden my-6">
              <div className="p-6 bg-gray-50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-700">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    {editingTransactionId ? 'Edit Transaction' : 'Quick Entry'}
                  </h2>
                  <button type="button" onClick={closeTransactionForm} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/15" aria-label="Close transaction form">×</button>
                </div>
              </div>
              
              <form onSubmit={handleCreateTransaction} className=" p-4 md:p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Transaction Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required 
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none" placeholder="e.g. Starbucks Coffee" />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Amount & Currency</label>
                      <div className="flex gap-2 ">
                        <select name="currency" value={formData.currency} onChange={handleInputChange} 
                          className="w-[100px] px-3 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm font-bold">
                          {availableCurrencies.map(code => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                        </select>
                        <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required step="1"
                          className="flex-1 w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none font-bold" placeholder="0.00" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Type</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} 
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none font-bold">
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Date</label>
                      <input type="date" name="date" value={formData.date} onChange={handleInputChange} required 
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} required 
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none font-bold">
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Account</label>
                      <select name="account" value={formData.account} onChange={handleInputChange} required 
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none font-bold">
                        <option value="">Select Account</option>
                        {accounts.map((acc) => (
                          <option key={acc._id} value={acc._id}>{acc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Note (Optional)</label>
                    <textarea name="note" value={formData.note} onChange={handleInputChange} rows="2" 
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 transition-all outline-none resize-none" placeholder="Add a quick note..."></textarea>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-2xl shadow-lg shadow-green-500/20 text-sm font-extrabold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-[1.02] active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? 'Processing...' : editingTransactionId ? 'Save Changes' : 'Save Transaction'}
                </button>
              </form>
            </div>
          </div>
          )}

          {/* Transactions List */}
          <div className="space-y-6">
            
            {/* Totals Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center text-xl">💰</div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Income</p>
                  <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">${summary.income.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center text-xl">💸</div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Expenses</p>
                  <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">${summary.expenses.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center text-xl">🏦</div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Savings</p>
                  <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">${summary.savings.toFixed(2)}</p>
                </div>
              </div>
            </div>
            {/* Filter Bar */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-neutral-700">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filter Transactions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-sm">
                  <option value="">All Types</option>
                  <option value="expense">Expenses</option>
                  <option value="income">Income</option>
                  <option value="saving">Savings</option>
                </select>
                <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-sm">
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select value={filters.period} onChange={(e) => setFilters({...filters, period: e.target.value, startDate: '', endDate: ''})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-sm">
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="yearly">This Year</option>
                </select>
                <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value, period: ''})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-sm" title="Start Date" />
                <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value, period: ''})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-sm" title="End Date" />
                <div className="flex justify-end items-center">
                  <button onClick={() => setFilters({ type: '', category: '', period: '', startDate: '', endDate: '' })} className="text-sm text-blue-600 hover:underline">
                    Clear
                  </button>
                </div>
              </div>
            </div>



            {/* Empty State */}
            {todayTransactions.length === 0 && otherTransactions.length === 0 && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-neutral-700">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No transactions found</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Try adjusting your filters or add a new transaction.</p>
              </div>
            )}

            {/* Today's Transactions */}
            {todayTransactions.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today</h2>
                <div className="space-y-4">
                  {todayTransactions.map(renderTransactionCard)}
                </div>
              </div>
            )}

            {/* Previous Transactions */}
            {otherTransactions.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8">Previous Transactions</h2>
                <div className="space-y-4">
                  {otherTransactions.map(renderTransactionCard)}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
