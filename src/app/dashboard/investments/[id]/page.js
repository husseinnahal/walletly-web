'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeDollarSign,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Mail,
  Phone,
  PieChart,
  Rocket,
  StickyNote,
  Tag,
  TrendingUp,
  WalletCards,
  XCircle,
  Pencil,
  Trash2
} from 'lucide-react';
import { apiFetch } from '../../../../lib/api';
import { useAuth } from '../../../../context/AuthContext';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim();
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

const money = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const percent = (value) => {
  const number = Number(value || 0);
  return Number.isInteger(number) ? `${number}%` : `${number.toFixed(1)}%`;
};

const resolveAvatarUrl = (value) => {
  const clean = String(value || '').trim();
  if (!clean) return null;
  if (/^https?:\/\//i.test(clean) || clean.startsWith('data:')) return clean;
  return `${API_ORIGIN}/${clean.replace(/^\/+/, '')}`;
};

const typeBadgeClasses = (type) => {
  switch (String(type || '').trim().toLowerCase()) {
    case 'equity':
      return 'bg-blue-500/20 text-blue-200 border-blue-300/15';
    case 'loan':
      return 'bg-amber-500/20 text-amber-200 border-amber-300/15';
    case 'partnership':
      return 'bg-purple-500/20 text-purple-200 border-purple-300/15';
    default:
      return 'bg-white/12 text-white border-white/15';
  }
};

const ownerName = (investment) =>
  investment?.postedBy || investment?.userId?.username || investment?.owner?.username || 'Anonymous';

const ownerAvatar = (investment) =>
  investment?.avatar || investment?.userId?.avatar || investment?.owner?.avatar;

const contactEmail = (investment) =>
  investment?.email || investment?.userId?.email || investment?.owner?.email || '';

const contactPhone = (investment) =>
  investment?.phoneNumber || investment?.phone || investment?.userId?.phone || investment?.owner?.phone || '';

const unwrapInvestment = (response) => {
  const data = response?.data ?? response;
  return data?.investment || data?.opportunity || data?.item || data?.data || data;
};

function GlassPanel({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.10] to-white/[0.04] p-4 shadow-[0_18px_46px_rgba(0,0,0,0.26)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <Icon className="mb-3 h-4 w-4 text-[#EA7108]/80" />
      <p className="text-[10px] font-black uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-white">{value || '-'}</p>
    </div>
  );
}

function TextPanel({ icon: Icon, title, text }) {
  return (
    <GlassPanel>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#EA7108]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-white">{title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-white/72">{text}</p>
        </div>
      </div>
    </GlassPanel>
  );
}

export default function InvestmentDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const { user } = useAuth();

  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchInvestment();
  }, [id]);

  const fetchInvestment = async () => {
    try {
      const response = await apiFetch(`/investments/${id}`);
      setInvestment(unwrapInvestment(response));
    } catch (err) {
      setError(err.message || 'Failed to load investment details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this posting?')) return;
    try {
      await apiFetch(`/investments/${id}`, { method: 'DELETE' });
      router.push('/dashboard/investments');
    } catch (err) {
      alert('Failed to delete investment');
    }
  };

  const handleOpenEditModal = () => {
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
      await apiFetch(`/investments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      fetchInvestment();
    } catch (err) {
      setError(err.message || 'Failed to save investment');
    } finally {
      setIsSubmitting(false);
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
        <GlassPanel className="max-w-md text-center">
          <h2 className="text-xl font-black text-white mb-2">Investment not found</h2>
          <p className="text-white/65 mb-6">{error || 'This opportunity is unavailable.'}</p>
          <button
            onClick={() => router.push('/dashboard/investments')}
            className="w-full rounded-2xl bg-[#6be6b0] py-3 font-black text-[#063015]"
          >
            Back to Marketplace
          </button>
        </GlassPanel>
      </div>
    );
  }

  const type = String(investment.investmentType || '').trim().toLowerCase();
  const avatar = resolveAvatarUrl(ownerAvatar(investment));
  const name = ownerName(investment);
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const email = contactEmail(investment);
  const phone = contactPhone(investment);
  const mailSubject = `Investment inquiry: ${investment.title}`;
  const mailBody = `Hello, I am interested in the investment: ${investment.title}`;

  const isOwner = user && investment && (
    investment?.userId?._id === user._id || 
    investment?.userId === user._id || 
    investment?.owner?._id === user._id || 
    investment?.owner === user._id
  );

  const detailItems = [
    { icon: Tag, label: 'Category', value: investment.category },
    { icon: WalletCards, label: 'Investment Required', value: money(investment.requiredAmount) },
    { icon: BadgeDollarSign, label: 'Min Investment', value: money(investment.minInvestment) },
    { icon: Rocket, label: 'Stage', value: String(investment.stage || '').toUpperCase() },
    { icon: investment.isAvailable ? CheckCircle2 : XCircle, label: 'Status', value: investment.isAvailable ? 'Available' : 'Closed' }
  ];

  if (type === 'equity') {
    detailItems.push({ icon: PieChart, label: 'Equity Offered', value: percent(investment.equityOffered) });
  }

  if (type === 'loan') {
    detailItems.push({ icon: TrendingUp, label: 'Expected Return', value: percent(investment.expectedReturn) });
    detailItems.push({ icon: Calendar, label: 'Duration', value: `${investment.durationMonths || 0} months` });
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.back()}
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-white/75 transition hover:text-white"
          >
            Back
          </button>
          
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={handleOpenEditModal}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-white/75 transition hover:text-white hover:bg-white/10"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-black text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <GlassPanel className="relative overflow-hidden p-0">
            <div className="p-5 sm:p-6">
              <div className={`absolute right-0 top-0 rounded-bl-2xl border px-4 py-2 text-[10px] font-black uppercase tracking-wider ${typeBadgeClasses(type)}`}>
                {investment.investmentType || 'Investment'}
              </div>

              <div className="pr-24">
                <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">{investment.title}</h1>
                <div className="mt-4 flex items-center gap-2 text-white/70">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-[11px] font-black text-[#EA7108]">
                    {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initial}
                  </div>
                  <span className="truncate text-sm font-bold">{name}</span>
                  <span className="text-white/30">•</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-white/50">
                    <Eye className="h-3.5 w-3.5" />
                    {investment.viewedByCount ?? investment.views ?? 0} views
                  </span>
                </div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {detailItems.map((item) => (
                <DetailItem key={item.label} {...item} />
              ))}
            </div>
          </GlassPanel>

          <TextPanel icon={FileText} title="Description" text={investment.description || '-'} />

          {phone && <TextPanel icon={Phone} title="Phone Number" text={phone} />}
          {email && <TextPanel icon={Mail} title="Email Address" text={email} />}
          {investment.note && <TextPanel icon={StickyNote} title="Note" text={investment.note} />}

          {(phone || email) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-4 text-sm font-black text-white transition hover:bg-emerald-400"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`}
                  className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#EA7108] px-4 py-4 text-sm font-black text-white transition hover:brightness-110"
                >
                  <Mail className="h-4 w-4" />
                  Send Message
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Post/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h2 className="text-xl font-bold">Edit Posting</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expected Return (%)</label>
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
                    Save Changes
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
