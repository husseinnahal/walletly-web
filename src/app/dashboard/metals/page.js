// it is the api to get the data of charts
// https://api.gold-api.com/history?symbol=XAU&groupBy=day&startTimestamp=1771053764&endTimestamp=1771485764
// it is api key for charts
// 6009ef0e83080d59de9c3fa534352228df0eb9d59bf12b515835e290995be038

// Live price APIs
//https://api.gold-api.com/price/XAU/USD
// https://api.gold-api.com/price/XAG/USD


'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, Calculator, Gem, Hexagon, Pencil, Trash2 } from 'lucide-react';

export default function MetalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [metals, setMetals] = useState([]);
  const [stats, setStats] = useState(null);
  const [marketPrices, setMarketPrices] = useState({ gold: null, silver: null });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingMetalId, setEditingMetalId] = useState(null);
  const [expandedMetalId, setExpandedMetalId] = useState(null);
  const [calculator, setCalculator] = useState({
    type: 'gold',
    mode: 'g',
    option: '21K',
    grams: 31.1,
    quantity: 1
  });

  // Filter State
  const [filters, setFilters] = useState({
    type: 'gold', // Default to Gold
    form: ''
  });
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'gold',
    form: 'gram',
    purity: '24k',
    liraType: 'full',
    quantity: 1,
    weight: 0,
    price: 0,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    note: '',
    accountId: ''
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [goldRes, silverRes] = await Promise.all([
          fetch('https://api.gold-api.com/price/XAU/USD').then(res => res.json()),
          fetch('https://api.gold-api.com/price/XAG/USD').then(res => res.json())
        ]);
        setMarketPrices({
          gold: goldRes.price,
          silver: silverRes.price
        });
        
      } catch (err) {
        console.error('Failed to fetch live prices', err);
      }
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const symbol = filters.type === 'gold' ? 'XAU' : 'XAG';
      const end = Math.floor(Date.now() / 1000);
      const start = end - (30 * 24 * 60 * 60); // 30 days ago

      try {
        const response = await fetch(`https://api.gold-api.com/history?symbol=${symbol}&groupBy=day&startTimestamp=${start}&endTimestamp=${end}`, {
          headers: {
            'x-api-key': '6009ef0e83080d59de9c3fa534352228df0eb9d59bf12b515835e290995be038'
          }
        });
        const result = await response.json();


        if (Array.isArray(result)) {
          const formattedData = result.map(item => ({
            date: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: Number(item.max_price)
          })).sort((a, b) => new Date(a.date) - new Date(b.date)); // Ensure chronological order
          setChartData(formattedData);
        }
        
      } catch (err) {
        console.error('Failed to fetch market history', err);
      }
    };

    fetchHistory();
  }, [filters.type]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
    fetchAccounts();
  }, [user, router, filters]);

  const fetchAccounts = async () => {
    try {
      const res = await apiFetch('/accounts');
      const accs = res.data.accounts || [];
      setAccounts(accs);
      if (accs.length > 0) {
        setFormData(prev => ({ ...prev, accountId: accs[0]._id }));
      }
    } catch (err) {
      console.error('Failed to fetch accounts');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Build query string for filters
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.form) queryParams.append('form', filters.form);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const [metalsRes, statsRes] = await Promise.all([
        apiFetch(`/metals${queryString}`),
        apiFetch('/metals/stats')
      ]);
      setMetals(metalsRes.data || []);
      setStats(statsRes.data);
      
    } catch (err) {
      console.error('Failed to fetch metals data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Clean up payload based on form to match strict Joi validation
    const payload = { ...formData };
    payload.quantity = Number(payload.quantity);
    payload.weight = Number(payload.weight);
    payload.price = Number(payload.price);
    
    // Clean up payload based on form to match strict Joi validation
    if (payload.form !== 'gram') delete payload.purity;
    if (payload.form !== 'lira') delete payload.liraType;
    if (payload.form === 'lira') delete payload.weight;

    try {
      await apiFetch(editingMetalId ? `/metals/${editingMetalId}` : '/metals', {
        method: editingMetalId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload)
      });
      setEditingMetalId(null);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to add metal asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditMetal = (metal) => {
    setEditingMetalId(metal._id);
    setFormData({
      type: metal.type || 'gold',
      form: metal.form || 'gram',
      purity: metal.purity || '24k',
      liraType: metal.liraType || 'full',
      quantity: metal.quantity || 1,
      weight: metal.weight || 0,
      price: metal.price || 0,
      date: metal.date ? new Date(metal.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      note: metal.note || '',
      accountId: metal.accountId?._id || metal.accountId || ''
    });
    setShowModal(true);
  };

  const openCreateMetal = () => {
    setEditingMetalId(null);
    setFormData({
      type: filters.type,
      form: 'gram',
      purity: '24k',
      liraType: 'full',
      quantity: 1,
      weight: 0,
      price: 0,
      currency: 'USD',

      date: new Date().toISOString().split('T')[0],
      note: '',
      accountId: accounts[0]?._id || ''
    });
    setShowModal(true);
  };

  const switchMetalType = (type) => {
    setFilters({ type, form: '' });
    setCalculator((prev) => ({
      ...prev,
      type,
      mode: 'g',
      option: type === 'gold' ? '21K' : '1g',
      grams: type === 'gold' ? 31.1 : 31.3
    }));
    setFormData((prev) => ({ ...prev, type }));
    setExpandedMetalId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await apiFetch(`/metals/${id}`, { method: 'DELETE' });
      setExpandedMetalId(null);
      fetchData();
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  const calculatorQuantity = Number(calculator.quantity) || 0;

  const formatMoney = (value, decimals = 0, sign = '') =>
    `${sign}$${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;

  const formatQuantity = (value) => {
    const number = Number(value || 0);
    return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/\.?0+$/, '');
  };

  const purityNumber = (value, fallback = 24) => {
    const parsed = Number(String(value || '').replace(/k$/i, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const weightOptionToGrams = (option) => {
    const value = String(option || '').trim().toLowerCase();
    if (value === '1g') return 1;
    if (value === '10g') return 10;
    if (value === '31.1g') return 31.1;
    if (value === '31.3g') return 31.3;
    if (value === '100g') return 100;
    if (value === '1kg' || value === '1 kg') return 1000;
    if (value === '1 oz') return 31.1035;
    if (value === '10 oz') return 311.035;

    const numeric = Number(value.replace(/kg|g|oz/g, ''));
    if (!Number.isFinite(numeric) || numeric <= 0) return 1;
    return value.includes('kg') ? numeric * 1000 : numeric;
  };

  const fractionMultiplier = (option) => {
    const value = String(option || '').trim().toLowerCase();
    if (value === 'quarter' || value === '1/4' || value === '0.25') return 0.25;
    if (value === 'half' || value === '1/2' || value === '0.5') return 0.5;
    return 1;
  };

  const calculatorTabs = filters.type === 'gold' ? ['g', 'Lira', 'Ounce'] : ['g', 'Ounce'];

  const calculatorOptionsFor = (mode = calculator.mode, type = filters.type) => {
    if (type === 'gold' && mode === 'g') return ['18K', '21K', '24K'];
    if (type === 'gold' && mode === 'Lira') return ['1/4', '1/2', '1'];
    if (type === 'gold' && mode === 'Ounce') return ['31.1g', '100g', '1kg'];
    if (type === 'silver' && mode === 'g') return ['1g', '10g', '100g'];
    if (type === 'silver' && mode === 'Ounce') return ['31.3g', '100g', '1kg'];
    return [];
  };

  const marketplaceFor = (type = filters.type) => stats?.[type]?.marketplace;

  const fallbackGramPrice = (type = filters.type, purity = 24) => {
    const spot = Number(marketPrices[type]) || 0;
    if (!spot) return 0;
    const pureGramPrice = spot / 31.1035;
    if (type === 'silver') return pureGramPrice;
    return pureGramPrice * (purity / 24);
  };

  const goldGramPrice = (market, purity = 24) => {
    const key = purityNumber(purity);
    return Number(market?.[key] ?? market?.[`k${key}`] ?? 0);
  };

  const calculatorUnitPrice = (option = calculator.option) => {
    const market = marketplaceFor(filters.type);

    if (filters.type === 'gold') {
      const k24 = goldGramPrice(market, 24) || fallbackGramPrice('gold', 24);
      const k21 = goldGramPrice(market, 21) || fallbackGramPrice('gold', 21);
      const k18 = goldGramPrice(market, 18) || fallbackGramPrice('gold', 18);

      if (calculator.mode === 'g') {
        if (option === '18K') return k18;
        if (option === '21K') return k21;
        return k24;
      }

      if (calculator.mode === 'Lira') {
        return fractionMultiplier(option) * 7.2 * k21;
      }

      if (calculator.mode === 'Ounce') {
        const grams = option ? weightOptionToGrams(option) : Number(calculator.grams) || 31.1;
        return k24 * grams;
      }
    }

    const silverGram = Number(market) || fallbackGramPrice('silver');
    if (calculator.mode === 'g') return silverGram * weightOptionToGrams(option);
    if (calculator.mode === 'Ounce') {
      const grams = option ? weightOptionToGrams(option) : Number(calculator.grams) || 31.3;
      return silverGram * grams;
    }

    return 0;
  };

  const calculatorValue = calculatorQuantity * calculatorUnitPrice();

  const normalizeUnit = (metal) => {
    const unit = String(metal.unit || metal.form || '').toLowerCase();
    if (unit === 'gram') return 'grams';
    if (unit === 'lira') return 'liras';
    if (unit === 'ounce') return 'ounces';
    return unit || 'grams';
  };

  const formatOunceGram = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const lower = raw.toLowerCase();
    return lower.endsWith('g') || lower.endsWith('kg') ? raw : `${raw}g`;
  };

  const metalTitle = (metal) => {
    const unit = normalizeUnit(metal);
    const isGold = metal.type === 'gold';
    const quantity = formatQuantity(
      unit === 'grams' && Number(metal.weight) > 0 ? metal.weight : metal.quantity || 1
    );

    if (unit === 'grams') {
      return `${quantity}g${isGold && metal.purity ? ` x ${String(metal.purity).replace(/k$/i, '')}k` : ''}`;
    }

    if (unit === 'ounces') {
      const ounceGram =
        formatOunceGram(metal.ounceType) ||
        formatOunceGram(metal.liraType) ||
        (Number(metal.weight) > 0 && Number(metal.quantity) > 0
          ? `${formatQuantity(Number(metal.weight) / Number(metal.quantity))}g`
          : '');
      const ounceLabel = Number(metal.quantity) === 1 ? 'ounce' : 'ounces';
      return ounceGram ? `${ounceGram} x ${quantity} ${ounceLabel}` : `${quantity} ${ounceLabel}`;
    }

    if (unit === 'liras') {
      const rawType = String(metal.liraType || 'full').toLowerCase();
      const liraType = rawType === 'quarter' || rawType === '1/4' || rawType === '0.25'
        ? '1/4'
        : rawType === 'half' || rawType === '1/2' || rawType === '0.5'
          ? '1/2'
          : '1';
      return `${liraType} x ${quantity} lira`;
    }

    return `${quantity} ${unit}`;
  };

  const metalPurchasedValue = (metal) => {
    const spent = Number(metal.totalSpent);
    if (spent > 0) return spent;
    const paid = Number(metal.price);
    if (paid > 0) return paid;
    return (Number(metal.quantity) || 0) * (Number(metal.purchasePrice) || 0);
  };

  const ounceGramsPerUnit = (metal) => {
    const multiplier = Number(metal.weightMultiplier);
    if (multiplier > 0) return multiplier * 31.1035;

    const fromOunceType = weightOptionToGrams(metal.ounceType);
    if (metal.ounceType && fromOunceType > 0) return fromOunceType;

    const fromLiraType = weightOptionToGrams(metal.liraType);
    if (metal.liraType && fromLiraType > 0) return fromLiraType;

    const weight = Number(metal.weight);
    const quantity = Number(metal.quantity);
    if (weight > 0 && quantity > 0) return weight / quantity;

    return 31.1035;
  };

  const metalCurrentValue = (metal) => {
    const unit = normalizeUnit(metal);
    const quantity = Number(metal.quantity) || 0;
    const type = metal.type || filters.type;
    const metalStats = stats?.[type];
    if (!metalStats) return metalPurchasedValue(metal);

    if (type === 'gold') {
      if (unit === 'grams') {
        const purity = purityNumber(metal.purity, 24);
        const grams = Number(metal.weight) > 0 ? Number(metal.weight) : quantity;
        const gramPrice = goldGramPrice(metalStats.marketplace, purity) || goldGramPrice(metalStats.marketplace, 24);
        return grams * gramPrice;
      }
      if (unit === 'liras') {
        const multiplier = Number(metal.weightMultiplier) || fractionMultiplier(metal.liraType);
        return quantity * multiplier * goldGramPrice(metalStats.marketplace, 21) * 7.2;
      }
      if (unit === 'ounces') {
        const grams = Number(metal.weight) > 0 ? Number(metal.weight) : quantity * ounceGramsPerUnit(metal);
        return grams * goldGramPrice(metalStats.marketplace, 24);
      }
    }

    if (type === 'silver') {
      if (unit === 'grams') {
        const purity = Number(String(metal.purity || '999').replace(/k$/i, '')) || 999;
        const grams = Number(metal.weight) > 0 ? Number(metal.weight) : quantity;
        return grams * (metalStats.marketplace || 0) * (purity / 999);
      }
      if (unit === 'ounces') {
        const grams = Number(metal.weight) > 0 ? Number(metal.weight) : quantity * ounceGramsPerUnit(metal);
        return grams * (metalStats.marketplace || 0);
      }
    }

    return metalPurchasedValue(metal);
  };

  const renderMetalAssetCard = (metal) => {
    const isGold = metal.type === 'gold';
    const purchased = metalPurchasedValue(metal);
    const current = metalCurrentValue(metal);
    const diff = current - purchased;
    const Icon = isGold ? Gem : Hexagon;
    const isExpanded = expandedMetalId === metal._id;

    return (
      <div
        key={metal._id}
        onClick={() => setExpandedMetalId((currentId) => currentId === metal._id ? null : metal._id)}
        className="cursor-pointer rounded-[18px] border border-white/15 bg-gradient-to-br from-white/[0.11] to-white/[0.04] px-3.5 py-3 shadow-[0_18px_42px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:border-white/20"
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] border ${
            isGold
              ? 'border-yellow-300/25 bg-yellow-400/20 text-yellow-300'
              : 'border-slate-200/25 bg-slate-200/15 text-slate-100'
          }`}>
            <Icon className="h-[22px] w-[22px]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-extrabold text-white">{metalTitle(metal)}</p>
            <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-white/70">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{metal.createdAt ? new Date(metal.createdAt).toLocaleDateString() : new Date(metal.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end">
            <span className="rounded-full bg-white/12 px-3 py-1.5 text-[13px] font-black text-white">
              {formatMoney(purchased)}
            </span>
            <span className={`mt-1 text-xs font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatMoney(Math.abs(diff), 2, diff >= 0 ? '+' : '-')}
            </span>
          </div>
        </div>

        {isExpanded && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="flex gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation();
                openEditMetal(metal);
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(metal._id);
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 pt-8 pb-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-neutral-800 ">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>🪙</span> Metals Portfolio
            </h1>
            <p className="text-gray-500 dark:text-neutral-400 font-medium mt-1">Track your physical gold and silver assets.</p>
          </div>
        </div>
      </div>

      <div className="walletly-fab-group">
        <button onClick={openCreateMetal} className="walletly-fab walletly-fab-primary">
          <span className="walletly-fab-icon">+</span>
          <span>Add Asset</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="rounded-[18px] border border-white/10 bg-white/[0.06] p-1.5 shadow-sm backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2">
            {['gold', 'silver'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => switchMetalType(type)}
                className={`h-11 rounded-[14px] text-sm font-extrabold capitalize transition ${
                  filters.type === type
                    ? 'bg-yellow-500 text-[#2f1d08] shadow-lg shadow-yellow-500/15'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Section */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Value Spent vs Market Value */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-neutral-800 dark:to-neutral-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between md:col-span-2">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <span className="text-8xl">💎</span>
                </div>
                <div>
                    <h3 className="text-gray-400 font-medium mb-1 relative z-10 text-sm">Total Spent on {filters.type === 'gold' ? 'Gold' : 'Silver'}</h3>
                    <p className="text-2xl font-bold relative z-10 text-gray-300">${(stats[filters.type]?.totalSpent || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <h3 className="text-gray-300 font-bold mb-1 relative z-10">Current Market Value</h3>
                    <p className={`text-4xl sm:text-5xl font-black relative z-10 ${
                        (stats[filters.type]?.totalValue || 0) >= (stats[filters.type]?.totalSpent || 0)
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                        ${(stats[filters.type]?.totalValue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                    {stats[filters.type]?.totalSpent > 0 && (
                        <p className="text-xs font-medium text-gray-400 mt-2 relative z-10">
                            {((stats[filters.type]?.totalValue || 0) - stats[filters.type]?.totalSpent) >= 0 ? '+' : ''}
                            {(((stats[filters.type]?.totalValue || 0) - stats[filters.type]?.totalSpent)).toFixed(2)}$ Return
                        </p>
                    )}
                </div>
            </div>

            {/* Selected Metal Stats */}
            <div className={`bg-white dark:bg-neutral-800 border ${filters.type === 'gold' ? 'border-yellow-200 dark:border-yellow-900/50' : 'border-slate-200 dark:border-slate-700'} rounded-[2rem] p-6 shadow-sm flex flex-col justify-between`}>
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${filters.type === 'gold' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {filters.type === 'gold' ? 'Au' : 'Ag'}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Total Inventory</h3>
                    </div>
                    <div className="space-y-4">
                        <div className={`flex justify-between items-center pb-3 border-b ${filters.type === 'gold' ? 'border-yellow-100 dark:border-yellow-900/30' : 'border-gray-100 dark:border-neutral-700'}`}>
                            <span className="text-gray-500 font-medium text-sm">Grams</span>
                            <span className={`font-bold ${filters.type === 'gold' ? 'text-yellow-600' : 'text-slate-400'}`}>{(stats[filters.type]?.grams?.total || 0).toFixed(2)}g</span>
                        </div>
                        <div className={`flex justify-between items-center pb-3 border-b ${filters.type === 'gold' ? 'border-yellow-100 dark:border-yellow-900/30' : 'border-gray-100 dark:border-neutral-700'}`}>
                            <span className="text-gray-500 font-medium text-sm">Ounces</span>
                            <span className={`font-bold ${filters.type === 'gold' ? 'text-yellow-600' : 'text-slate-400'}`}>{(stats[filters.type]?.ounces?.quantity || 0)} oz</span>
                        </div>
                        {filters.type === 'gold' && (
                            <div className="flex justify-between items-center pb-3 border-b border-yellow-100 dark:border-yellow-900/30">
                                <span className="text-gray-500 font-medium text-sm">Liras</span>
                                <span className="font-bold text-yellow-600">{(stats[filters.type]?.liras?.quantity || 0)} coins</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {filters.type === 'gold' && stats.gold?.byPurity && (
                    <div className="mt-4 pt-4 border-t border-yellow-100 dark:border-yellow-900/30">
                        <h4 className="text-xs font-bold text-yellow-800/70 dark:text-yellow-600/70 uppercase mb-2">Purity Breakdown</h4>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>24k: <strong className="text-yellow-600">{(stats.gold.byPurity['24k'] || 0).toFixed(1)}g</strong></span>
                            <span>21k: <strong className="text-yellow-600">{(stats.gold.byPurity['21k'] || 0).toFixed(1)}g</strong></span>
                            <span>18k: <strong className="text-yellow-600">{(stats.gold.byPurity['18k'] || 0).toFixed(1)}g</strong></span>
                        </div>
                    </div>
                )}
            </div>

          </div>
        )}

        {/* Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400 mb-2">
                {filters.type === 'gold' ? 'Gold' : 'Silver'} Calculator
              </p>
              <h2 className="flex items-center gap-2 text-2xl font-black text-gray-900 dark:text-white">
                <Calculator className="h-6 w-6 text-yellow-500" />
                Estimate current value
              </h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2 max-w-xl">Choose grams, ounces, or gold liras using the same options as the Walletly app.</p>
            </div>

            <div className="relative z-10 mt-6 rounded-[18px] bg-gray-100 p-1.5 dark:bg-neutral-900">
              <div className={`grid gap-1.5 ${calculatorTabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {calculatorTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      const nextOptions = calculatorOptionsFor(tab);
                      const nextOption = nextOptions[0] || '';
                      setCalculator((prev) => ({
                        ...prev,
                        mode: tab,
                        option: nextOption,
                        grams: tab === 'Ounce' ? weightOptionToGrams(nextOption) : prev.grams
                      }));
                    }}
                    className={`h-10 rounded-[13px] text-sm font-black transition ${
                      calculator.mode === tab
                        ? 'bg-yellow-500 text-gray-950 shadow-sm'
                        : 'text-gray-600 hover:bg-white dark:text-neutral-300 dark:hover:bg-white/10'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {calculatorOptionsFor().map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCalculator((prev) => ({
                    ...prev,
                    option,
                    grams: calculator.mode === 'Ounce' ? weightOptionToGrams(option) : prev.grams
                  }))}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    calculator.option === option
                      ? 'border-yellow-400 bg-yellow-50 text-gray-950 shadow-lg shadow-yellow-500/10 dark:bg-yellow-500'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-yellow-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200'
                  }`}
                >
                  <span className="block text-sm font-black">{option}</span>
                  <span className="mt-1 block text-xs font-bold opacity-70">
                    {formatMoney(calculatorUnitPrice(option), 2)}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative z-10 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {calculator.mode === 'Ounce' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Grams per unit</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={calculator.grams}
                    onChange={(event) => setCalculator((prev) => ({ ...prev, grams: event.target.value, option: '' }))}
                    className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
                </div>
              )}

              <div className={calculator.mode === 'Ounce' ? '' : 'sm:col-span-2'}>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={calculator.quantity}
                  onChange={(event) => setCalculator((prev) => ({ ...prev, quantity: event.target.value }))}
                  className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-neutral-800 dark:to-neutral-900 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl border border-white/10">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Estimated Value</p>
            <p className="mt-3 text-4xl font-black">
              ${calculatorValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-gray-400">Unit price</span>
                <span className="font-bold">{formatMoney(calculatorUnitPrice(), 2)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-gray-400">Amount</span>
                <span className="font-bold">
                  {formatQuantity(calculatorQuantity)} {calculator.mode === 'g' ? calculator.option : calculator.mode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Metal</span>
                <span className="font-bold capitalize">{filters.type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {chartData.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-neutral-700 mt-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          30-Day {filters.type === 'gold' ? 'Gold' : 'Silver'} Market Trend
                      </h3>
                      <p className="text-sm text-gray-500 font-medium mt-1">Real-time historical data from market spot prices</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm border ${
                      chartData[chartData.length - 1].price > chartData[0].price
                      ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400'
                      : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400'
                  }`}>
                      {chartData[chartData.length - 1].price > chartData[0].price ? '+' : ''}
                      {(((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price) * 100).toFixed(2)}%
                  </div>
              </div>
              
              <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={filters.type === 'gold' ? '#eab308' : '#94a3b8'} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={filters.type === 'gold' ? '#eab308' : '#94a3b8'} stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} 
                            minTickGap={30}
                          />
                          <YAxis 
                            domain={['auto', 'auto']} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} 
                            tickFormatter={(val) => `$${val.toLocaleString()}`}
                            width={65}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                            itemStyle={{ color: filters.type === 'gold' ? '#ca8a04' : '#64748b' }}
                            formatter={(value) => [`$${value}`, 'Price / oz']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke={filters.type === 'gold' ? '#eab308' : '#94a3b8'} 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                          />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
        )}

        {/* Assets List */}
        <div className="bg-white dark:bg-neutral-800 rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-neutral-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    Added {filters.type === 'gold' ? 'Gold' : 'Silver'}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-500 dark:text-neutral-400">
                    {filters.type === 'gold' ? 'Gold assets' : 'Silver assets'} are shown separately like the Walletly app.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select 
                        value={filters.form} 
                        onChange={(e) => setFilters(prev => ({ ...prev, form: e.target.value }))}
                        className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        <option value="">All Forms</option>
                        <option value="gram">Grams</option>
                        <option value="ounce">Ounces</option>
                        {filters.type === 'gold' && <option value="lira">Liras</option>}
                    </select>

                    {filters.form && (
                        <button 
                            onClick={() => setFilters({ ...filters, form: '' })}
                            className="text-sm font-bold text-yellow-600 hover:text-yellow-700 underline"
                        >
                            Reset Form Filter
                        </button>
                    )}
                </div>
            </div>
            
            {metals.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-neutral-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-700">
                    <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[18px] border ${filters.type === 'gold' ? 'border-yellow-300/25 bg-yellow-400/20 text-yellow-300' : 'border-slate-200/25 bg-slate-200/15 text-slate-100'}`}>
                      {filters.type === 'gold' ? <Gem className="h-7 w-7" /> : <Hexagon className="h-7 w-7" />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No {filters.type} added yet</h3>
                    <p className="text-gray-500 dark:text-neutral-400 mt-1">Add your first {filters.type} holding.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metals.map((metal) => renderMetalAssetCard(metal))}
                </div>
            )}
        </div>
      </div>
      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">{editingMetalId ? 'Edit Asset' : 'Record Asset'}</h2>
              <button onClick={() => { setShowModal(false); setEditingMetalId(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 hover:bg-gray-200 transition">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/30">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Metal</label>
                  <div className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-black text-gray-900 dark:text-white capitalize">
                    {formData.type}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Form</label>
                  <select name="form" value={formData.form} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none">
                    <option value="gram">Gram</option>
                    {formData.type === 'gold' && <option value="lira">Lira</option>}
                    <option value="ounce">Ounce</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Fields */}
              <div className="grid grid-cols-2 gap-4">
                {formData.form === 'gram' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Purity</label>
                        <select name="purity" value={formData.purity} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none">
                            <option value="24k">24k</option>
                            <option value="21k">21k</option>
                            <option value="18k">18k</option>
                        </select>
                    </div>
                )}
                {formData.form === 'lira' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Lira Type</label>
                        <select name="liraType" value={formData.liraType} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none">
                            <option value="full">Full Lira</option>
                            <option value="half">Half Lira</option>
                            <option value="quarter">Quarter Lira</option>
                        </select>
                    </div>
                )}
                
                <div className={formData.form === 'ounce' ? 'col-span-2' : ''}>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Quantity</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" required className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
              </div>

              <div className={`grid ${formData.form === 'lira' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                {formData.form !== 'lira' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Weight (g)</label>
                    <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleInputChange} required placeholder="e.g. 10.5" className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Spent ($)</label>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required placeholder="Total paid" className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Account</label>
                  <select 
                    name="accountId" 
                    value={formData.accountId} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="">Select Account</option>
                    {accounts.map(acc => (
                      <option key={acc._id} value={acc._id}>{acc.name} (${acc.totalBalance})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Purchase Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm py-3.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-md disabled:opacity-70">
                  {isSubmitting ? 'Saving...' : editingMetalId ? 'Save Changes' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
