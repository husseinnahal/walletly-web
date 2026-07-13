'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { getCurrencies } from '../../../lib/currencies';

export default function BudgetsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD', 'EUR', 'GBP', 'SAR', 'AED']);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    note: '',
    period: 'monthly',
    startDate: '',
    endDate: '',
    autoRenew: true,
    carryOverEnabled: false,
    currency: 'USD',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [budgetsRes, categoriesRes, currencies] = await Promise.all([
          apiFetch('/budgets'),
          apiFetch('/categories')
        ]);
        setBudgets(budgetsRes.data?.budgets || []);
        setCategories(categoriesRes.data || []);
        window.dispatchEvent(new Event('walletly-feature-progress-refresh'));
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };
      
      const response = await apiFetch(editingBudgetId ? `/budgets/${editingBudgetId}` : '/budgets', {
        method: editingBudgetId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });

      setMessage(editingBudgetId ? 'Budget updated successfully!' : 'Budget created successfully!');
      setBudgets(editingBudgetId ? budgets.map((budget) => budget._id === editingBudgetId ? response.data : budget) : [response.data, ...budgets]);
      window.dispatchEvent(new Event('walletly-feature-progress-refresh'));
      setFormData({
        name: '',
        amount: '',
        category: '',
        note: '',
        period: 'monthly',
        startDate: '',
        endDate: '',
        autoRenew: true,
        carryOverEnabled: false,
        currency: 'USD',
      });
      setEditingBudgetId(null);
      setShowBudgetForm(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create budget');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await apiFetch(`/budgets/${id}`, { method: 'DELETE' });
      setBudgets(budgets.filter((b) => b._id !== id));
      window.dispatchEvent(new Event('walletly-feature-progress-refresh'));
      setMessage('Budget deleted permanently.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete budget');
      setTimeout(() => setError(''), 5000);
    }
  };

  const openEditBudget = (budget) => {
    setEditingBudgetId(budget._id);
    setFormData({
      name: budget.name || '',
      amount: budget.amount || '',
      category: budget.category?._id || budget.category || '',
      note: budget.note || '',
      period: budget.period || 'monthly',
      startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
      endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
      autoRenew: Boolean(budget.autoRenew),
      carryOverEnabled: Boolean(budget.carryOverEnabled),
      currency: budget.currency || 'USD',
    });
    setShowBudgetForm(true);
  };

  const closeBudgetForm = () => {
    setShowBudgetForm(false);
    setEditingBudgetId(null);
  };

  const handleToggleActive = async (id) => {
    try {
      const response = await apiFetch(`/budgets/${id}/toggle-active`, { method: 'PATCH' });
      setBudgets(budgets.map((b) => (b._id === id ? response.data : b)));
      window.dispatchEvent(new Event('walletly-feature-progress-refresh'));
      setMessage(`Budget ${response.data.isActive ? 'activated' : 'paused'}.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to toggle active status');
      setTimeout(() => setError(''), 5000);
    }
  };

  if (!user || loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-[#6be6b0] to-emerald-600">
              Budgets
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Take control of your finances by setting smart limits.</p>
          </div>
        </div>

        <div className="walletly-fab-group">
          <button
            onClick={() => { setEditingBudgetId(null); setShowBudgetForm(true); }}
            className="walletly-fab walletly-fab-primary"
          >
            <span className="walletly-fab-icon">+</span>
            <span>Add Budget</span>
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

        <div className="grid grid-cols-1 gap-8">
          
          {/* Create Form */}
          {showBudgetForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-neutral-700 overflow-hidden my-6">
              <div className="p-6 bg-gray-50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-700">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    {editingBudgetId ? 'Edit Budget' : 'New Budget'}
                  </h2>
                  <button type="button" onClick={closeBudgetForm} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/15" aria-label="Close budget form">×</button>
                </div>
              </div>
              
              <form onSubmit={handleCreateBudget} className="p-4 md:p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Budget Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required 
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="e.g. Monthly Groceries" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Limit Amount</label>
                      <div className="flex gap-2">
                        <select name="currency" value={formData.currency} onChange={handleInputChange} 
                          className="w-[100px] px-3 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-bold">
                          {availableCurrencies.map(code => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                        </select>
                        <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required min="1"
                          className="flex-1 w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Period</label>
                      <select name="period" value={formData.period} onChange={handleInputChange} 
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold">
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="semiannual">Semi-Annual</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required 
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold">
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Start Date</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required 
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">End Date</label>
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required 
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Note (Optional)</label>
                    <textarea name="note" value={formData.note} onChange={handleInputChange} rows="2" 
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none" placeholder="What's this budget for?"></textarea>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-4">
                  <label className="relative flex items-center cursor-pointer group">
                    <input type="checkbox" name="autoRenew" checked={formData.autoRenew} onChange={handleInputChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-bold text-gray-600 dark:text-neutral-400 group-hover:text-blue-600 transition-colors">Auto Renew Budget</span>
                  </label>

                  <label className="relative flex items-center cursor-pointer group">
                    <input type="checkbox" name="carryOverEnabled" checked={formData.carryOverEnabled} onChange={handleInputChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    <span className="ml-3 text-sm font-bold text-gray-600 dark:text-neutral-400 group-hover:text-purple-600 transition-colors">Enable Carry Over</span>
                  </label>
                </div>

                <button type="submit" disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-2xl shadow-lg shadow-[#6be6b0]/15 text-sm font-extrabold text-black bg-gradient-to-r from-[#6be6b0] to-emerald-600 hover:scale-[1.02] transition-all transform active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? 'Processing...' : editingBudgetId ? 'Save Changes' : 'Launch Budget'}
                </button>
              </form>
            </div>
          </div>
          )}

          {/* Budgets List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Active Budgets</h2>
            
            {budgets.length === 0 ? (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center shadow-sm border border-gray-100 dark:border-neutral-700">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No budgets found</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating a new budget to track your spending.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgets.map((budget) => {
                  const progress = Math.min((budget.spent / budget.amount) * 100, 100);
                  const isNearLimit = progress > 85;
                  
                  return (
                  <div key={budget._id} 
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-xl border ${
                      budget.isActive 
                        ? 'bg-white dark:bg-neutral-800 border-gray-100 dark:border-neutral-700 shadow-md hover:-translate-y-1' 
                        : 'bg-gray-50 dark:bg-neutral-800/50 border-gray-200 dark:border-neutral-700 opacity-75 grayscale'
                    }`}>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        budget.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${budget.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        {budget.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <div className="mb-4 pr-16">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{budget.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {budget.period} • {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="my-6">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${budget.spent.toFixed(2)}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">spent</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">of ${budget.amount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2.5 mb-1 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${isNearLimit ? 'bg-red-500' : 'bg-blue-500'} transition-all duration-1000 ease-out`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs text-right font-medium ${isNearLimit ? 'text-red-500' : 'text-gray-500'}`}>
                        {progress.toFixed(0)}% Used
                      </p>
                    </div>

                    {budget.carryOverEnabled && budget.carriedOverAmount > 0 && (
                      <div className="mb-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-xl p-3 flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">Carried Over</p>
                          <p className="text-sm font-bold text-purple-900 dark:text-purple-200">+${budget.carriedOverAmount.toFixed(2)} available</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-neutral-700 pt-4">
                      <button
                        onClick={() => openEditBudget(budget)}
                        className="py-2 px-3 rounded-xl text-sm font-medium border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-900/50 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 transition-colors"
                        title="Edit Budget"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4 4 0 01-1.897 1.13L6 18l.8-2.685a4 4 0 011.13-1.897l8.932-8.931z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 7.125L16.875 4.5M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleToggleActive(budget._id)}
                        className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium border transition-colors ${
                          budget.isActive 
                            ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-900/50 dark:text-amber-400 dark:bg-amber-900/20 dark:hover:bg-amber-900/40' 
                            : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-900/50 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/40'
                        }`}
                      >
                        {budget.isActive ? 'Pause' : 'Resume'}
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteBudget(budget._id)}
                        className="py-2 px-4 rounded-xl text-sm font-medium border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-900/50 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
