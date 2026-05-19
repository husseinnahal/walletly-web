'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export default function InvestmentDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvestment();
  }, [id]);

  const fetchInvestment = async () => {
    try {
      const response = await apiFetch(`/investments/${id}`);
      setInvestment(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load investment details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-500 mb-6">{error || 'Investment not found'}</p>
          <button 
            onClick={() => router.push('/dashboard/investments')}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const getStageColor = (stage) => {
    switch (stage) {
      case 'idea': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'mvp': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'launched': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Navigation Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <span>⬅️</span>
            Back
          </button>
          <div className="flex items-center gap-3">
             <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md border ${getStageColor(investment.stage)}`}>
               {investment.stage}
             </span>
             <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <span>👁️</span>
                <span>{investment.views} views</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Badge */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  {investment.category === 'tech' ? '💻' : 
                   investment.category === 'food' ? '🍔' : 
                   investment.category === 'ecommerce' ? '🛍️' : 
                   investment.category === 'service' ? '🛠️' : '💡'}
                </span>
                <div>
                  <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest">{investment.category}</p>
                  <h1 className="text-3xl font-black text-slate-900">{investment.title}</h1>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Description</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {investment.description}
                </p>
              </div>
            </div>

            {/* Additional Details Section if any */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Investment Goal</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-900">${investment.requiredAmount.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm mb-1 font-medium">Total Needed</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Minimum Entry</h3>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-900">${investment.minInvestment?.toLocaleString() || '0'}</span>
                  <span className="text-slate-400 text-sm mb-1 font-medium">Per Investor</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Stats Card */}
          <div className="space-y-6">
            {/* Investment Card */}
            <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl shadow-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                {investment.investmentType} Structure
              </h3>

              <div className="space-y-6">
                {investment.investmentType === 'equity' && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Equity Offered</p>
                    <p className="text-4xl font-black">{investment.equityOffered}%</p>
                    <p className="text-xs text-slate-500 mt-2">Ownership share in the company</p>
                  </div>
                )}

                {investment.investmentType === 'loan' && (
                  <>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Expected Return</p>
                      <p className="text-4xl font-black">{investment.expectedReturn}$</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Repayment Period</p>
                      <p className="text-2xl font-bold">{investment.durationMonths} Months</p>
                    </div>
                  </>
                )}

                {investment.investmentType === 'partnership' && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Role Offered</p>
                    <p className="text-2xl font-bold">Strategic Partner</p>
                    <p className="text-xs text-slate-500 mt-2">Seeking active involvement & expertise</p>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-800">
                   <p className="text-slate-400 text-sm mb-1">Posted On</p>
                   <p className="font-bold">{new Date(investment.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Owner Contact */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Owner Information</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl font-black text-emerald-600 border border-emerald-100">
                  {investment.userId?.avatar ? 
                    <img src={investment.userId.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : 
                    investment.userId?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{investment.userId?.name || 'Anonymous'}</p>
                  <p className="text-sm text-slate-400">Verified Member</p>
                </div>
              </div>

              <div className="space-y-3">
                <a 
                  href={`mailto:${investment.userId?.email}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all border border-slate-200"
                >
                  <span>✉️</span> Send Message
                </a>
                {investment.userId?.phone && (
                  <a 
                    href={`tel:${investment.userId?.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-100"
                  >
                    <span>📞</span> Contact via Phone
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
