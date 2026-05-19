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
      await apiFetch('/metals', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to add metal asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await apiFetch(`/metals/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Failed to delete asset');
    }
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
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => {
              setFormData({ ...formData, date: new Date().toISOString().split('T')[0] });
              setShowModal(true);
            }} className="px-5 py-2.5 text-sm font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-2xl transition shadow-md shadow-yellow-500/20 flex-1 md:flex-none">
              + Add Asset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Asset Inventory</h2>
                
                {/* Filters UI */}
                <div className="flex flex-wrap items-center gap-3">
                    <select 
                        value={filters.type} 
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                    </select>

                    <select 
                        value={filters.form} 
                        onChange={(e) => setFilters(prev => ({ ...prev, form: e.target.value }))}
                        className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        <option value="">All Forms</option>
                        <option value="gram">Grams</option>
                        <option value="ounce">Ounces</option>
                        <option value="lira">Liras</option>
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
                    <span className="text-4xl block mb-3">⚖️</span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No assets found</h3>
                    <p className="text-gray-500 dark:text-neutral-400 mt-1">Add your first gold or silver holding.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-neutral-700 text-sm font-semibold text-gray-500 dark:text-neutral-400">
                                <th className="pb-4 pr-4">Type</th>
                                <th className="pb-4 px-4">Form</th>
                                <th className="pb-4 px-4">Details</th>
                                <th className="pb-4 px-4">Weight</th>
                                <th className="pb-4 px-4">Spent</th>
                                <th className="pb-4 px-4">Date</th>
                                <th className="pb-4 pl-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {metals.map(metal => (
                                <tr key={metal._id} className="border-b border-gray-50 dark:border-neutral-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition">
                                    <td className="py-4 pr-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${metal.type === 'gold' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-600'}`}>
                                                {metal.type === 'gold' ? 'Au' : 'Ag'}
                                            </div>
                                            <span className="font-bold capitalize text-gray-900 dark:text-white">{metal.type}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 capitalize font-medium text-gray-700 dark:text-neutral-300">{metal.form}</td>
                                    <td className="py-4 px-4 text-gray-500 dark:text-neutral-400">
                                        {metal.form === 'gram' && metal.purity && <span className="bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs">{metal.purity}</span>}
                                        {metal.form === 'lira' && metal.liraType && <span className="bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs capitalize">{metal.liraType}</span>}
                                        {metal.quantity > 1 && <span className="ml-2 text-xs">x{metal.quantity}</span>}
                                    </td>
                                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">{metal.weight}g</td>
                                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">${metal.price.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-gray-500 dark:text-neutral-400">{new Date(metal.date).toLocaleDateString()}</td>
                                    <td className="py-4 pl-4 text-right">
                                        <button onClick={() => handleDelete(metal._id)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg transition font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2"><span>➕</span> Record Asset</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-500 hover:bg-gray-200 transition">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/30">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Metal</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none">
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">Form</label>
                  <select name="form" value={formData.form} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none">
                    <option value="gram">Gram</option>
                    <option value="lira">Lira</option>
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
                  {isSubmitting ? 'Saving...' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
