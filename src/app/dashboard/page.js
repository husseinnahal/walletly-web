'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

const inputClass = "w-full px-4 py-3 rounded-2xl border border-neutral-850 bg-neutral-900 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#6be6b0]/40 transition duration-200";

export default function DashboardPage() {
  const { user, logout, updateUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  // Note: auth guard lives in layout.js — no need to duplicate it here

  // Categories state
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [editingCat, setEditingCat] = useState(null); // { _id, name, icon }
  const [newCat, setNewCat] = useState({ name: '', icon: '' });

  // Base Currency / Regional Settings state
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [loadingCurrency, setLoadingCurrency] = useState(false);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [ratesData, setRatesData] = useState(null);

  // Fetch categories when tab becomes active
  useEffect(() => {
    if (activeTab === 'categories' && user) fetchCategories();
  }, [activeTab, user]);

  useEffect(() => {
    if (user?.currency) {
      setCurrency(user.currency);
    }

    const fetchCurrencies = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates) {
          const codes = Object.keys(data.rates).sort();
          setAvailableCurrencies(codes);
          setRatesData(data.rates);
        }
      } catch (err) {
        console.error('Failed to fetch currencies:', err);
        setAvailableCurrencies(['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED']);
      }
    };

    fetchCurrencies();
  }, [user]);

  const showFeedback = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  // ── Categories API ──────────────────────────────────────────
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await apiFetch('/categories');
      setCategories(res.data || []);
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setCatLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify(newCat),
      });
      setCategories([...categories, res.data]);
      setNewCat({ name: '', icon: '' });
      showFeedback('Category created ✓');
    } catch (err) { showFeedback(err.message, true); }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch(`/categories/${editingCat._id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingCat.name, icon: editingCat.icon }),
      });
      setCategories(categories.map((c) => (c._id === editingCat._id ? res.data : c)));
      setEditingCat(null);
      showFeedback('Category updated ✓');
    } catch (err) { showFeedback(err.message, true); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      setCategories(categories.filter((c) => c._id !== id));
      showFeedback('Category deleted ✓');
    } catch (err) { showFeedback(err.message, true); }
  };

  // ── Profile handlers ────────────────────────────────────────
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      const response = await apiFetch('/users/profile/info', {
        method: 'PUT',
        body: JSON.stringify({
          username: e.target.username.value,
          email: e.target.email.value,
          phone: e.target.phone.value,
        }),
      });
      updateUser(response.data);
      showFeedback('Profile updated successfully ✓');
    } catch (err) { showFeedback(err.message, true); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/users/profile/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: e.target.currentPassword.value,
          newPassword: e.target.newPassword.value,
        }),
      });
      e.target.reset();
      showFeedback('Password updated successfully ✓');
    } catch (err) { showFeedback(err.message, true); }
  };

  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    const file = e.target.avatar.files[0];
    if (!file) return showFeedback('Please select a file', true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const response = await apiFetch('/users/profile/avatar', { method: 'PUT', body: formData });
      updateUser(response.data);
      showFeedback('Avatar updated successfully ✓');
    } catch (err) { showFeedback(err.message, true); }
  };

  const handleCurrencyUpdate = async (e) => {
    e.preventDefault();
    setLoadingCurrency(true);
    try {
      const rate = ratesData ? ratesData[currency] : 1;
      const res = await apiFetch('/users/profile/currency', {
        method: 'PUT',
        body: JSON.stringify({ 
          currency: currency,
          currencyRate: rate || 1 
        }),
      });

      if (res.success) {
        showFeedback('Regional preferences updated successfully ✓');
        updateUser({ 
          currency: res.data.currency,
          currencyRate: res.data.currencyRate
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      showFeedback(err.message, true);
    } finally {
      setLoadingCurrency(false);
    }
  };


  const tabs = [
    { id: 'info',       label: '👤 Profile'    },
    { id: 'categories', label: '🏷️ Categories'  },
    { id: 'password',   label: '🔒 Password'   },
    { id: 'avatar',     label: '🖼️ Avatar'     },
    { id: 'settings',   label: '⚙️ Preferences' },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage your profile, categories, and security settings.</p>
        </div>

        {/* Feedback */}
        {message && <div className="mb-6 bg-emerald-950/30 border border-emerald-900/50 text-[#6be6b0] text-sm px-5 py-3.5 rounded-2xl animate-fade-in">{message}</div>}
        {error   && <div className="mb-6 bg-red-950/30 border border-red-900/50 text-red-400 text-sm px-5 py-3.5 rounded-2xl animate-fade-in">{error}</div>}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-[#0e0e0e] p-1.5 rounded-2xl mb-8 w-fit border border-neutral-900">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition duration-200 ${
                  isActive 
                    ? 'bg-neutral-800 text-[#6be6b0] shadow-md border border-neutral-750' 
                    : 'text-neutral-450 hover:text-neutral-250'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div className="bg-[#0e0e0e] rounded-3xl border border-neutral-900 p-6 sm:p-8 shadow-xl">

          {/* Profile Info */}
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateInfo} className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              {[
                { label: 'Username', name: 'username', type: 'text',  defaultValue: user?.username },
                { label: 'Email',    name: 'email',    type: 'email', defaultValue: user?.email    },
                { label: 'Phone',    name: 'phone',    type: 'text',  defaultValue: user?.phone    },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-semibold text-neutral-400 mb-2">{f.label}</label>
                  <input type={f.type} name={f.name} defaultValue={f.defaultValue} className={inputClass} />
                </div>
              ))}
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-[#6be6b0] to-emerald-600 hover:scale-[1.02] text-black font-extrabold text-sm rounded-2xl transition duration-200 shadow-md shadow-[#6be6b0]/10">
                Save Changes
              </button>
            </form>
          )}

          {/* ── Categories ── */}
          {activeTab === 'categories' && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">My Custom Categories</h2>
              <p className="text-sm text-neutral-400 mb-6">These are your personal categories used for budgets and transactions.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create / Edit form */}
                <div className="bg-[#080808] rounded-3xl p-6 border border-neutral-900">
                  {editingCat ? (
                    <>
                      <h3 className="text-sm font-bold text-white mb-4">✏️ Edit Category</h3>
                      <form onSubmit={handleUpdateCategory} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-450 mb-2">Name</label>
                          <input
                            type="text"
                            value={editingCat.name}
                            onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                            required
                            minLength={3}
                            maxLength={15}
                            className={inputClass}
                            placeholder="e.g. Groceries"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-450 mb-2">Icon (emoji)</label>
                          <input
                            type="text"
                            value={editingCat.icon}
                            onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}
                            required
                            className={inputClass}
                            placeholder="e.g. 🛒"
                          />
                          {editingCat.icon && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-2xl">{editingCat.icon}</span>
                              <span className="text-xs text-neutral-500">Preview</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3 pt-1">
                          <button type="submit" className="px-5 py-3 bg-gradient-to-r from-[#6be6b0] to-emerald-600 hover:scale-[1.02] text-black font-extrabold text-xs rounded-2xl transition duration-200">
                            Save Changes
                          </button>
                          <button type="button" onClick={() => setEditingCat(null)} className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-extrabold text-xs rounded-2xl border border-neutral-800 transition duration-200">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-bold text-white mb-4">➕ New Category</h3>
                      <form onSubmit={handleCreateCategory} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-neutral-450 mb-2">Name</label>
                          <input
                            type="text"
                            value={newCat.name}
                            onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                            required
                            minLength={3}
                            maxLength={15}
                            className={inputClass}
                            placeholder="e.g. Groceries"
                          />
                          <p className="text-xs text-neutral-500 mt-1.5">3–15 characters</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-neutral-455 mb-2">Icon (emoji)</label>
                          <input
                            type="text"
                            value={newCat.icon}
                            onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                            required
                            className={inputClass}
                            placeholder="e.g. 🛒"
                          />
                          {newCat.icon && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-2xl">{newCat.icon}</span>
                              <span className="text-xs text-neutral-500">Preview</span>
                            </div>
                          )}
                        </div>
                        <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#6be6b0] to-emerald-600 hover:scale-[1.02] text-black font-extrabold text-sm rounded-2xl transition duration-200 shadow-md shadow-[#6be6b0]/10">
                          Create Category
                        </button>
                      </form>
                    </>
                  )}
                </div>

                {/* Categories list */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Your Categories ({categories.length})</h3>
                  {catLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#6be6b0]"></div>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-10 bg-[#080808] rounded-3xl border border-dashed border-neutral-800">
                      <p className="text-3xl mb-2">🏷️</p>
                      <p className="text-sm font-bold text-neutral-400">No custom categories yet</p>
                      <p className="text-xs text-neutral-500 mt-1">Create one using the form on the left.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {categories.map((cat) => (
                        <div key={cat._id} className="flex items-center justify-between p-3.5 bg-[#080808] hover:bg-[#0c0c0c] rounded-2xl border border-neutral-900 transition group">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{cat.icon}</span>
                            <span className="text-sm font-bold text-neutral-200">{cat.name}</span>
                          </div>
                          {!cat.isDefault && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() => setEditingCat({ _id: cat._id, name: cat.name, icon: cat.icon })}
                                className="px-3 py-1.5 text-xs font-bold text-[#EA7108] bg-[#EA7108]/5 hover:bg-[#EA7108]/15 rounded-xl border border-[#EA7108]/20 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat._id)}
                                className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-950/20 hover:bg-red-950/40 rounded-xl border border-red-900/20 transition"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-4">Change Password</h2>
              {[
                { label: 'Current Password', name: 'currentPassword' },
                { label: 'New Password',     name: 'newPassword'     },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-semibold text-neutral-400 mb-2">{f.label}</label>
                  <input type="password" name={f.name} placeholder="••••••••" className={inputClass} />
                </div>
              ))}
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-[#EA7108] to-[#EA7108]/90 hover:scale-[1.02] text-white font-extrabold text-sm rounded-2xl transition duration-200 shadow-md shadow-[#EA7108]/10">
                Update Password
              </button>
            </form>
          )}

          {/* Avatar */}
          {activeTab === 'avatar' && (
            <form onSubmit={handleUpdateAvatar} className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-4">Profile Picture</h2>
              {user?.avatar && (
                <div className="mb-4">
                  <p className="text-sm text-neutral-400 mb-2">Current avatar:</p>
                  <Image src={user.avatar} alt="Current Avatar" width={80} height={80} className="rounded-full object-cover w-20 h-20 border-2 border-neutral-800" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-neutral-400 mb-2">Upload New Avatar</label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-neutral-900 file:text-white hover:file:bg-neutral-850 transition cursor-pointer"
                />
              </div>
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-[#6be6b0] to-emerald-600 hover:scale-[1.02] text-black font-extrabold text-sm rounded-2xl transition duration-200 shadow-md shadow-[#6be6b0]/10">
                Upload Avatar
              </button>
            </form>
          )}

          {/* Regional Settings / Preferences */}
          {activeTab === 'settings' && (
            <form onSubmit={handleCurrencyUpdate} className="space-y-6">
              <h2 className="text-lg font-bold text-white mb-1">Regional Preferences</h2>
              <p className="text-sm text-neutral-400 mb-6">Select your default base currency for all charts, accounts, and budgets.</p>
              <div>
                <label className="block text-sm font-semibold text-neutral-400 mb-2">Base Currency</label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="block w-full px-4 py-3 rounded-2xl border border-neutral-850 bg-neutral-900 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#6be6b0]/40 transition duration-200 appearance-none cursor-pointer"
                    disabled={loadingCurrency}
                  >
                    {availableCurrencies.map(code => (
                      <option key={code} value={code} className="bg-[#0e0e0e] text-white">
                        {code}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  This updates your account's live conversion multipliers dynamically!
                </p>
              </div>
              <button
                type="submit"
                disabled={loadingCurrency || currency === user?.currency}
                className="px-6 py-3 bg-gradient-to-r from-[#6be6b0] to-emerald-600 hover:scale-[1.02] text-black font-extrabold text-sm rounded-2xl transition duration-200 shadow-md shadow-[#6be6b0]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingCurrency ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
