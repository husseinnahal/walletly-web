'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';

export default function InvestmentsDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView] = useState('marketplace'); // 'marketplace' or 'my'
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [availableCount, setAvailableCount] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    stage: '',
    investmentType: '',
    isAvailable: '',
    minPrice: '',
    maxPrice: ''
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInvestment, setCurrentInvestment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    requiredAmount: 0,
    investmentType: 'equity',
    equityOffered: 0,
    expectedReturn: 0,
    durationMonths: 0,
    stage: 'idea',
    minInvestment: 0,
    isAvailable: true
  });

  useEffect(() => {
    fetchInvestments();
  }, [view, filters, searchTerm]);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      let endpoint = view === 'marketplace' ? '/investments' : '/investments/my';
      
      // Build query params
      const params = new URLSearchParams();
      if (view === 'marketplace') {
        if (searchTerm) params.append('search', searchTerm);
        if (filters.category) params.append('category', filters.category);
        if (filters.stage) params.append('stage', filters.stage);
        if (filters.investmentType) params.append('investmentType', filters.investmentType);
        if (filters.isAvailable) params.append('isAvailable', filters.isAvailable);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await apiFetch(`${endpoint}${queryString}`);
      setInvestments(response.data);
      if (response.availableCount !== undefined) {
        setAvailableCount(response.availableCount);
      }
    } catch (err) {
      console.error('Failed to fetch investments', err);
      setError('Could not load investments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentInvestment(null);
    setFormData({
      title: '',
      description: '',
      category: 'other',
      requiredAmount: 0,
      investmentType: 'equity',
      equityOffered: 0,
      expectedReturn: 0,
      durationMonths: 0,
      stage: 'idea',
      minInvestment: 0,
      isAvailable: true
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (investment) => {
    setIsEditing(true);
    setCurrentInvestment(investment);
    setFormData({
      title: investment.title,
      description: investment.description,
      category: investment.category,
      requiredAmount: investment.requiredAmount,
      investmentType: investment.investmentType,
      equityOffered: investment.equityOffered || 0,
      expectedReturn: investment.expectedReturn || 0,
      durationMonths: investment.durationMonths || 0,
      stage: investment.stage,
      minInvestment: investment.minInvestment || 0,
      isAvailable: investment.isAvailable
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing) {
        await apiFetch(`/investments/${currentInvestment._id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData)
        });
      } else {
        await apiFetch('/investments', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setShowModal(false);
      fetchInvestments();
    } catch (err) {
      setError(err.message || 'Failed to save investment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this posting?')) return;
    try {
      await apiFetch(`/investments/${id}`, { method: 'DELETE' });
      fetchInvestments();
    } catch (err) {
      alert('Failed to delete investment');
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await apiFetch(`/investments/${id}/toggle-availability`, { method: 'PATCH' });
      fetchInvestments();
    } catch (err) {
      alert('Failed to toggle availability');
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'idea': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'mvp': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'launched': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'tech': return '💻';
      case 'food': return '🍔';
      case 'ecommerce': return '🛍️';
      case 'service': return '🛠️';
      default: return '💡';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            📈 Investment Marketplace
          </h1>
          <p className="text-slate-500 text-sm mt-1">Connect with ideas and investors worldwide</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-200"
        >
          <span>➕</span>
          Post New Idea
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-2xl rounded-xl">
              💼
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Available Opportunities</p>
              <h3 className="text-2xl font-bold text-slate-900">{availableCount}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-2xl rounded-xl">
              👥
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">number of investments</p>
              <h3 className="text-2xl font-bold text-slate-900">{ investments.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-2xl rounded-xl">
              📊
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">My Total Views</p>
              <h3 className="text-2xl font-bold text-slate-900">1,204</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="flex flex-col lg:flex-row items-center border-b border-slate-100">
          <div className="flex p-2 gap-2 w-full lg:w-auto">
            <button 
              onClick={() => setView('marketplace')}
              className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-sm font-medium transition-all ${view === 'marketplace' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Marketplace
            </button>
            <button 
              onClick={() => setView('my')}
              className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-sm font-medium transition-all ${view === 'my' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              My Postings
            </button>
          </div>

          {view === 'marketplace' && (
            <div className="flex-1 flex flex-col md:flex-row items-center gap-4 p-4 w-full">
              <div className="relative flex-1 w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by title or description..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Min $</span>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-16 py-1.5 bg-transparent text-sm focus:outline-none"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  />
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Max $</span>
                  <input 
                    type="number" 
                    placeholder="Max"
                    className="w-16 py-1.5 bg-transparent text-sm focus:outline-none"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select 
                  className="flex-1 md:flex-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
                  value={filters.isAvailable}
                  onChange={(e) => setFilters({...filters, isAvailable: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="true">Active Only</option>
                  <option value="false">Paused Only</option>
                </select>
                <select 
                  className="flex-1 md:flex-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="">All Categories</option>
                  <option value="tech">Technology</option>
                  <option value="food">Food & Beverage</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="service">Services</option>
                  <option value="other">Other</option>
                </select>
                <select 
                  className="flex-1 md:flex-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
                  value={filters.stage}
                  onChange={(e) => setFilters({...filters, stage: e.target.value})}
                >
                  <option value="">All Stages</option>
                  <option value="idea">Idea</option>
                  <option value="mvp">MVP</option>
                  <option value="launched">Launched</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium animate-pulse">Loading opportunities...</p>
            </div>
          ) : investments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-6 bg-slate-50 rounded-full mb-4 text-4xl">
                ℹ️
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No investments found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {investments.map((item) => (
                <div 
                  key={item._id} 
                  onClick={() => router.push(`/dashboard/investments/${item._id}`)}
                  className="group bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-3xl p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                        {getCategoryIcon(item.category)}
                      </span>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md border ${getStageColor(item.stage)}`}>
                          {item.stage}
                        </span>
                        {item.isAvailable ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            AVAILABLE
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                            UNAVAILABLE
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mb-1">Required</p>
                        <p className="text-sm font-bold text-slate-900">${item.requiredAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mb-1">Type</p>
                        <p className="text-sm font-bold text-slate-900 capitalize">{item.investmentType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-4 bg-slate-50/50 flex items-center justify-between mt-auto">
                    {view === 'marketplace' ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 border border-white shadow-sm overflow-hidden">
                            {item.userId?.avatar ? <img src={item.userId.avatar} alt="" /> : item.userId?.username?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{item.userId?.username || 'Anonymous'}</p>
                            <p className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <span className="text-xs">👁️</span>
                          <span className="text-xs font-medium">{item.views}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleAvailability(item._id); }}
                            className={`flex items-center gap-1.5 text-lg font-bold transition-colors ${item.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}
                          >
                            {item.isAvailable ? '🟢' : '⚪'}
                            <span className="text-xs">{item.isAvailable ? 'Active' : 'Paused'}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Post/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h2 className="text-xl font-bold">{isEditing ? 'Edit Posting' : 'Post Business Idea'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Smart Irrigation System for Vertical Farming"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea 
                    required
                    rows="3"
                    placeholder="Describe your idea or the opportunity..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                {/* Categories and Stages */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="tech">Technology</option>
                    <option value="food">Food & Beverage</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="service">Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Business Stage</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.stage}
                    onChange={(e) => setFormData({...formData, stage: e.target.value})}
                  >
                    <option value="idea">Idea / Conceptual</option>
                    <option value="mvp">MVP / Prototype</option>
                    <option value="launched">Launched / Scaling</option>
                  </select>
                </div>

                {/* Investment Details */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Investment Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                    value={formData.investmentType}
                    onChange={(e) => setFormData({...formData, investmentType: e.target.value})}
                  >
                    <option value="equity">Equity (Shares)</option>
                    <option value="loan">Loan (Repayment)</option>
                    <option value="partnership">Co-Founder / Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Amount ($)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.requiredAmount}
                    onChange={(e) => setFormData({...formData, requiredAmount: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Minimum Investment ($)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.minInvestment}
                    onChange={(e) => setFormData({...formData, minInvestment: Number(e.target.value)})}
                  />
                </div>

                {/* Conditional Fields based on Type */}
                {formData.investmentType === 'equity' && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Equity Offered (%)</label>
                    <input 
                      type="number" 
                      max="100"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.equityOffered}
                      onChange={(e) => setFormData({...formData, equityOffered: Number(e.target.value)})}
                    />
                  </div>
                )}

                {formData.investmentType === 'loan' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expected Return ($)</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={formData.expectedReturn}
                        onChange={(e) => setFormData({...formData, expectedReturn: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (Months)</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={formData.durationMonths}
                        onChange={(e) => setFormData({...formData, durationMonths: Number(e.target.value)})}
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
                  >
                    {isSubmitting && (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isEditing ? 'Save Changes' : 'Publish Opportunity'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
