'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

const inputClass = "w-full text-white px-4 py-2.5 border border-white/10 bg-white/5 rounded-xl text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#6be6b0] focus:border-[#6be6b0] transition";
const btnPrimary = "px-5 py-2.5 bg-[#6be6b0] hover:bg-[#58d49d] text-[#080a0d] text-sm font-semibold rounded-xl transition";
const btnDanger  = "px-4 py-1.5 bg-red-950/30 hover:bg-red-950/45 text-red-300 text-sm font-medium rounded-lg border border-red-500/20 transition";
const btnWarning = "px-4 py-1.5 bg-[#EA7108]/15 hover:bg-[#EA7108]/25 text-[#ffb16d] text-sm font-medium rounded-lg border border-[#EA7108]/25 transition";
const cardClass = "glass-strong rounded-2xl border border-white/10 shadow-2xl p-6";
const listItemClass = "flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl";
const labelClass = "block text-sm font-medium text-white/70 mb-1";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('admins');
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/dashboard'); return; }
  }, [user, router]);


  
  const showFeedback = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const fetchAdmins = async () => {
    try { const res = await apiFetch('/admin/users'); setAdmins(res.data); }
    catch (err) { showFeedback('Failed to fetch admins: ' + err.message, true); }
  };

  const fetchCategories = async () => {
    try { const res = await apiFetch('/admin/categories'); setCategories(res.data); }
    catch (err) { showFeedback('Failed to fetch categories: ' + err.message, true); }
  };

  const fetchAllUsers = async () => {
    try { const res = await apiFetch('/users/allusers'); setAllUsers(res.data); }
    catch (err) { showFeedback('Failed to fetch all users: ' + err.message, true); }
  };

  useEffect(() => {
    if (user?.role !== 'admin') return;

    let cancelled = false;

    const loadAdminData = async () => {
      try {
        const [adminsRes, categoriesRes, usersRes] = await Promise.all([
          apiFetch('/admin/users'),
          apiFetch('/admin/categories'),
          apiFetch('/users/allusers'),
        ]);

        if (cancelled) return;

        setAdmins(adminsRes.data);
        setCategories(categoriesRes.data);
        setAllUsers(usersRes.data);
      } catch (err) {
        if (!cancelled) showFeedback('Failed to load admin data: ' + err.message, true);
      }
    };

    loadAdminData();

    return () => { cancelled = true; };
  }, [user?.role]);



  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          username: e.target.username.value,
          email: e.target.email.value,
          phone: e.target.phone.value,
          password: e.target.password.value,
        }),
      });
      e.target.reset();
      fetchAdmins();
      showFeedback('Admin created successfully ✓');
    } catch (err) { showFeedback(err.message, true); }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm('Delete this admin?')) return;
    try { await apiFetch(`/admin/users/${id}`, { method: 'DELETE' }); fetchAdmins(); showFeedback('Admin deleted ✓'); }
    catch (err) { showFeedback(err.message, true); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: e.target.name.value, icon: e.target.icon.value }),
      });
      e.target.reset();
      fetchCategories();
      showFeedback('Category created successfully ✓');
    } catch (err) { showFeedback(err.message, true); }
  };

  const handleUpdateCategory = async (category) => {
    const newName = prompt('New name:', category.name);
    const newIcon = prompt('New icon:', category.icon);
    if (!newName || !newIcon) return;
    try {
      await apiFetch(`/admin/categories/${category._id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName, icon: newIcon }),
      });
      fetchCategories();
      showFeedback('Category updated ✓');
    } catch (err) { showFeedback(err.message, true); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }); fetchCategories(); showFeedback('Category deleted ✓'); }
    catch (err) { showFeedback(err.message, true); }
  };

  if (!user || user.role !== 'admin') return (
    <div className="min-h-screen bg-walletly-theme flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#6be6b0]"></div>
    </div>
  );

  return (
    <div className="walletly-shell bg-walletly-theme min-h-screen text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-[#080a0d]/80 px-6 py-4 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6be6b0] to-[#EA7108] rounded-full flex items-center justify-center text-[#080a0d] font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.username}</p>
              <span className="text-xs font-medium bg-[#EA7108]/15 text-[#ffb16d] px-2 py-0.5 rounded-full border border-[#EA7108]/20">Admin</span>
            </div>
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm font-medium text-red-300 bg-red-950/30 hover:bg-red-950/45 rounded-xl border border-red-500/20 transition">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16">
            <Image src="/coinyChatbot.png" alt="Coiny Admin" fill className="object-contain animate-float" priority />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
            <p className="text-sm text-white/50">Manage admins, users, and global categories.</p>
          </div>
        </div>

        {/* Feedback */}
        {message && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{message}</div>}
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-xl mb-6 w-fit">
          {[{ id: 'admins', label: '👤 Admins' }, { id: 'categories', label: '🏷️ Categories' }, { id: 'allusers', label: '👥 Users' }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition ${activeTab === tab.id ? 'bg-[#6be6b0] text-[#080a0d] shadow-sm' : 'text-white/50 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Admin Form */}
            <div className={cardClass}>
              <h2 className="text-base font-semibold text-white mb-4">Create New Admin</h2>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {[
                  { name: 'username', label: 'Username', type: 'text' },
                  { name: 'email', label: 'Email', type: 'email' },
                  { name: 'phone', label: 'Phone', type: 'text' },
                  { name: 'password', label: 'Password', type: 'password' },
                ].map((f) => (
                  <div key={f.name}>
                    <label className={labelClass}>{f.label}</label>
                    <input type={f.type} name={f.name} required className={inputClass} />
                  </div>
                ))}
                <button type="submit" className={btnPrimary}>Create Admin</button>
              </form>
            </div>

            {/* Admins List */}
            <div className={cardClass}>
              <h2 className="text-base font-semibold text-white mb-4">All Admins ({admins.length})</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {admins.length === 0
                  ? <p className="text-sm text-white/40 text-center py-6">No admins found.</p>
                  : admins.map((admin) => (
                  <div key={admin._id} className={listItemClass}>
                    <div>
                      <p className="text-sm font-medium text-white">{admin.username}</p>
                      <p className="text-xs text-white/45">{admin.email}</p>
                    </div>
                    <button onClick={() => handleDeleteAdmin(admin._id)} className={btnDanger}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Category Form */}
            <div className={cardClass}>
              <h2 className="text-base font-semibold text-white mb-4">Create New Category</h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input type="text" name="name" required className={inputClass} placeholder="e.g. Groceries" />
                </div>
                <div>
                  <label className={labelClass}>Icon (emoji or name)</label>
                  <input type="text" name="icon" required className={inputClass} placeholder="e.g. 🛒" />
                </div>
                <button type="submit" className={btnPrimary}>Create Category</button>
              </form>
            </div>

            {/* Categories List */}
            <div className={cardClass}>
              <h2 className="text-base font-semibold text-white mb-4">All Categories ({categories.length})</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {categories.length === 0
                  ? <p className="text-sm text-white/40 text-center py-6">No categories found.</p>
                  : categories.map((cat) => (
                  <div key={cat._id} className={listItemClass}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <p className="text-sm font-medium text-white">{cat.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateCategory(cat)} className={btnWarning}>Edit</button>
                      <button onClick={() => handleDeleteCategory(cat._id)} className={btnDanger}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'allusers' && (
          <div className={`${cardClass} w-full`}>
            <h2 className="text-base font-semibold text-white mb-4">All Users ({allUsers.length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {allUsers.length === 0
                ? <p className="text-sm text-white/40 text-center py-6">No users found.</p>
                : allUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition">
                  <div>
                    <p className="text-sm font-semibold text-white">{u.username}</p>
                    <p className="text-xs text-white/45 mt-0.5">{u.email} {u.phone ? `• ${u.phone}` : ''}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    u.role === 'admin' ? 'bg-[#EA7108]/15 text-[#ffb16d] border border-[#EA7108]/20' : 'bg-[#6be6b0]/15 text-[#6be6b0] border border-[#6be6b0]/20'
                  }`}>
                    {u.role ? u.role.toUpperCase() : 'USER'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
