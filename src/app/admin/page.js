'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

const inputClass = "w-full text-black px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
const btnPrimary = "px-5 py-2.5 bg-[#EA7108] hover:bg-[#d46500] text-white text-sm font-semibold rounded-xl transition";
const btnDanger  = "px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg border border-red-200 transition";
const btnWarning = "px-4 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-lg border border-amber-200 transition";

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
    if (user?.role === 'admin') { fetchAdmins(); fetchCategories(); fetchAllUsers(); }
  }, [user]);



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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
              <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mb-6">Manage admins and global categories.</p>

        {/* Feedback */}
        {message && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{message}</div>}
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {[{ id: 'admins', label: '👤 Admins' }, { id: 'categories', label: '🏷️ Categories' }, { id: 'allusers', label: '👥 Users' }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Admin Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Create New Admin</h2>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {[
                  { name: 'username', label: 'Username', type: 'text' },
                  { name: 'email', label: 'Email', type: 'email' },
                  { name: 'phone', label: 'Phone', type: 'text' },
                  { name: 'password', label: 'Password', type: 'password' },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-black mb-1">{f.label}</label>
                    <input type={f.type} name={f.name} required className={inputClass} />
                  </div>
                ))}
                <button type="submit" className={btnPrimary}>Create Admin</button>
              </form>
            </div>

            {/* Admins List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">All Admins ({admins.length})</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {admins.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-6">No admins found.</p>
                  : admins.map((admin) => (
                  <div key={admin._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{admin.username}</p>
                      <p className="text-xs text-gray-500">{admin.email}</p>
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Create New Category</h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Name</label>
                  <input type="text" name="name" required className={inputClass} placeholder="e.g. Groceries" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Icon (emoji or name)</label>
                  <input type="text" name="icon" required className={inputClass} placeholder="e.g. 🛒" />
                </div>
                <button type="submit" className={btnPrimary}>Create Category</button>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">All Categories ({categories.length})</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {categories.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-6">No categories found.</p>
                  : categories.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full">
            <h2 className="text-base font-semibold text-gray-900 mb-4">All Users ({allUsers.length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {allUsers.length === 0
                ? <p className="text-sm text-gray-400 text-center py-6">No users found.</p>
                : allUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{u.username}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{u.email} {u.phone ? `• ${u.phone}` : ''}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
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
