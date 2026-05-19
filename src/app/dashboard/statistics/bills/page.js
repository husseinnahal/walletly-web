'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useCurrency } from '../../../../context/CurrencyContext';
import { apiFetch } from '../../../../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function BillStatsPage() {
  const { user } = useAuth();
  const { displayAmount, convertToUserCurrency, userCurrency } = useCurrency();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ trends: [], breakdown: [] });

  useEffect(() => {
    if (!user) router.push('/login');
    else fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/bills/stats`);
      setData(res.data || { trends: [], breakdown: [] });
      
    } catch (err) {
      console.error('Failed to fetch bill stats', err);
      if (err.status === 404) {
        console.warn('Backend route /api/bills/stats not found. Please ensure backend is updated and restarted.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 pb-20">
      <div className="bg-white dark:bg-neutral-900 pt-8 pb-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>🧾</span> Bill Analytics
            </h1>
            <p className="text-gray-500 dark:text-neutral-400 font-medium mt-1">Insights into your recurring obligations.</p>
          </div>
          <button onClick={() => router.push('/dashboard/statistics')} className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl hover:bg-gray-50 transition shadow-sm">
            ← Back to Analytics
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Trend Chart */}
            <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-neutral-700">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Spending</h2>
                    <p className="text-sm text-gray-500 font-medium">Total paid bills over the last 6 months.</p>
                </div>
                
                {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => displayAmount(value)} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: "#000" }} 
                                    cursor={{ fill: 'transparent' }} 
                                    formatter={(value) => [displayAmount(value), 'Paid Amount']}
                                />
                                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} name="Paid Amount" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Breakdown Chart */}
            <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-neutral-700">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bill Distribution</h2>
                    <p className="text-sm text-gray-500 font-medium">Breakdown by bill name (Last 6 Months).</p>
                </div>

                {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.breakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="amount"
                                >
                                    {data.breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: "#000" }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

        </div>

        {/* Detailed Table/List */}
        <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-neutral-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Spending Details</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-neutral-700">
                            <th className="pb-4 font-black text-xs text-gray-400 uppercase tracking-widest">Bill Name</th>
                            <th className="pb-4 font-black text-xs text-gray-400 uppercase tracking-widest">Payments</th>
                            <th className="pb-4 font-black text-xs text-gray-400 uppercase tracking-widest">Total Spent</th>
                            <th className="pb-4 font-black text-xs text-gray-400 uppercase tracking-widest text-right">Avg / Month</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-neutral-700/50">
                        {data.breakdown.map((bill) => (
                            <tr key={bill.name} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition">
                                <td className="py-4 font-bold text-gray-900 dark:text-white">{bill.name}</td>
                                <td className="py-4 text-sm font-bold text-gray-500">{bill.count} Times</td>
                                <td className="py-4 font-black text-indigo-600">{displayAmount(bill.amount)}</td>
                                <td className="py-4 text-right font-bold text-gray-900 dark:text-white">{displayAmount(bill.amount / 6)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}
