'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { getCurrencies } from '../../../lib/currencies';
// import { toast } from 'react-hot-toast'; // Not installed
import { useRouter } from 'next/navigation';

export default function AccountsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  
  // Form States
  const [newAccount, setNewAccount] = useState({ name: '', initialBalance: 0, currency: 'USD' });
  const [transfer, setTransfer] = useState({ fromAccountId: '', toAccountId: '', amount: 0, currency: 'USD', date: new Date().toISOString().split('T')[0] });
  const [availableCurrencies, setAvailableCurrencies] = useState(['USD', 'EUR', 'GBP', 'SAR', 'AED', 'DZD']);

  const fetchAccounts = async () => {
    try {
      const response = await apiFetch('/accounts');
      setAccounts(response.data.accounts || []);
      setTotalBalance(response.data.totalLiquidity || 0);
      
      console.log(response);
      
    } catch (err) {
      console.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    const codes = await getCurrencies();
    setAvailableCurrencies(codes);
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await apiFetch(`/accounts/${editingAccount._id}`, {
          method: 'PATCH',
          body: JSON.stringify(newAccount)
        });
        alert('Account updated successfully');
      } else {
        await apiFetch('/accounts', {
          method: 'POST',
          body: JSON.stringify(newAccount)
        });
        alert('Account created successfully');
      }
      setIsAddModalOpen(false);
      setEditingAccount(null);
      setNewAccount({ name: '', initialBalance: 0, currency: 'USD' });
      fetchAccounts();
    } catch (err) {
      alert(err.message || 'Failed to save account');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this account? It must have no transactions.')) return;
    try {
      await apiFetch(`/accounts/${accountId}`, { method: 'DELETE' });
      alert('Account deleted successfully');
      fetchAccounts();
    } catch (err) {
      alert(err.message || 'Failed to delete account');
    }
  };

  const openEditModal = (acc) => {
    setEditingAccount(acc);
    setNewAccount({ name: acc.name, initialBalance: acc.initialBalance, currency: acc.currency });
    setIsAddModalOpen(true);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/accounts/transfer', {
        method: 'POST',
        body: JSON.stringify(transfer)
      });
      alert('Transfer successful');
      setIsTransferModalOpen(false);
      setTransfer({ fromAccountId: '', toAccountId: '', amount: 0, currency: 'USD', date: new Date().toISOString().split('T')[0] });
      fetchAccounts();
    } catch (err) {
      alert(err.message || 'Transfer failed');
    }
  };

  // const totalBalance = accounts.reduce((sum, acc) => sum + acc.totalBalance, 0); // Replaced by server-side totalBalance state

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-[#6be6b0] to-emerald-600">
              Accounts
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Manage your cash, banks, and e-wallets in one place.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2 md:gap-3">
            <button 
              onClick={() => setIsTransferModalOpen(true)}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 shadow-sm text-xs sm:text-sm font-medium rounded-xl text-gray-700 dark:text-black bg-white dark:bg-neutral-850 dark:hover:text-gray-100  hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all flex items-center gap-1.5"
            >
              <span>🔄</span> Transfer
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-bold rounded-xl text-black bg-gradient-to-r from-[#6be6b0] to-emerald-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>➕</span> Add Account
            </button>

          </div>
        </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-emerald-100 font-bold uppercase tracking-wider text-xs">Total Liquidity</p>
          <h2 className="text-4xl font-black mt-3">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
          <div className="mt-4 flex items-center gap-2 text-emerald-100 text-sm font-medium">
             <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
             Active across {accounts.length} accounts
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100"></div>)
        ) : accounts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="text-4xl mb-4">🏦</div>
            <h3 className="text-xl font-bold text-slate-800">No accounts yet</h3>
            <p className="text-slate-500 mt-2">Start by adding your first bank or cash account.</p>
          </div>
        ) : (
          accounts.map(acc => (
            <div key={acc._id} className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group relative">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-emerald-50 transition-colors">
                  {acc.name.toLowerCase().includes('bank') ? '🏛️' : acc.name.toLowerCase().includes('card') ? '💳' : acc.name.toLowerCase().includes('paypal') ? '🅿️' : '💵'}
                </div>
                <div className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase px-2 py-1 rounded-lg">
                  {acc.currency || 'USD'}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">{acc.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    ${acc.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  Initial: ${acc.initialBalance.toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(acc)}
                    className="text-slate-300 hover:text-emerald-500 transition-colors p-1"
                    title="Edit Account"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeleteAccount(acc._id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Delete Account"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">{editingAccount ? 'Edit Account' : 'New Account'}</h2>
                <button onClick={() => { setIsAddModalOpen(false); setEditingAccount(null); }} className="w-10 h-10 flex items-center justify-center text-black rounded-2xl hover:bg-slate-100 transition-colors text-xl">✕</button>
              </div>
              <form onSubmit={handleAddAccount} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Chase Bank, Cash, PayPal"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold text-slate-900"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Starting Balance</label>
                    <input 
                      type="number" 
                      value={newAccount.initialBalance}
                      required
                      onChange={(e) => setNewAccount({...newAccount, initialBalance: parseFloat(e.target.value)})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Currency</label>
                    <select 
                      value={newAccount.currency} 
                      onChange={(e) => setNewAccount({...newAccount, currency: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    >
                      {availableCurrencies.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-4 uppercase tracking-widest text-xs">
                  {editingAccount ? 'Save Changes' : 'Create Account'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">Internal Transfer</h2>
                <button onClick={() => setIsTransferModalOpen(false)} className="w-10 text-black h-10 flex items-center justify-center rounded-2xl hover:bg-slate-100 transition-colors text-xl">✕</button>
              </div>
              <form onSubmit={handleTransfer} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">From Account</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold text-slate-900 appearance-none"
                      value={transfer.fromAccountId}
                      onChange={(e) => setTransfer({...transfer, fromAccountId: e.target.value})}
                      required
                    >
                      <option value="">Select source</option>
                      {accounts.map(a => <option key={a._id} value={a._id}>{a.name} (${a.totalBalance})</option>)}
                    </select>
                  </div>
                  <div className="flex items-center justify-center pt-6 text-slate-300 md:absolute md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 bg-white md:p-2 md:rounded-full md:shadow-sm md:z-10">
                    <span className="rotate-90 md:rotate-0 text-xl font-black">➔</span>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">To Account</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold text-slate-900 appearance-none"
                      value={transfer.toAccountId}
                      onChange={(e) => setTransfer({...transfer, toAccountId: e.target.value})}
                      required
                    >
                      <option value="">Select target</option>
                      {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount</label>
                    <input 
                      type="number" 
                      value={transfer.amount} 
                      onChange={(e) => setTransfer({...transfer, amount: parseFloat(e.target.value)})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500 transition-all font-bold text-slate-900"
                      value={transfer.date}
                      onChange={(e) => setTransfer({...transfer, date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Currency</label>
                  <select 
                    value={transfer.currency} 
                    onChange={(e) => setTransfer({...transfer, currency: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                  >
                    {availableCurrencies.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 mt-4 uppercase tracking-widest text-xs">
                  Confirm Transfer
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
