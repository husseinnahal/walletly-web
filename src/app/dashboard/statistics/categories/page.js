'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { apiFetch } from '../../../../lib/api';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function CategoryStatsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedRange, setSelectedRange] = useState('month');

  const ranges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    if (!user) router.push('/login');
    else fetchStats();
  }, [user, selectedRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/transactions/stats/categories?range=${selectedRange}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
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
              <span>🍕</span> Category Breakdown
            </h1>
            <p className="text-gray-500 dark:text-neutral-400 font-medium mt-1">Detailed spending and income by category.</p>
          </div>
          <button onClick={() => router.push('/dashboard/statistics')} className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl hover:bg-gray-50 transition shadow-sm">
            ← Back to Analytics
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Range Selector */}
        <div className="flex flex-wrap gap-2 bg-white dark:bg-neutral-800 p-2 rounded-2xl border border-gray-100 dark:border-neutral-700 w-fit">
          {ranges.map((range) => (
            <button
              key={range.id}
              onClick={() => setSelectedRange(range.id)}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                selectedRange === range.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-neutral-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {loading ? (
           <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Expenses */}
            <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-neutral-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense Distribution</h2>
                <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg">Total: ${data?.totalRangeExpense?.toLocaleString()}</span>
              </div>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.categoryBreakdown?.expense || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {(data?.categoryBreakdown?.expense || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: "#000" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-4">
                {(data?.categoryBreakdown?.expense || []).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-neutral-900/50 rounded-xl transition">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-100 dark:bg-neutral-900">
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{item.count} Transactions</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-gray-900 dark:text-white">${item.amount.toLocaleString()}</p>
                        <p className="text-xs font-bold text-red-500">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Income */}
            <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-neutral-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Income Sources</h2>
                <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg">Total: ${data?.totalRangeIncome?.toLocaleString()}</span>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.categoryBreakdown?.income || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {(data?.categoryBreakdown?.income || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: "#000" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-4">
                {(data?.categoryBreakdown?.income || []).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-neutral-900/50 rounded-xl transition">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-100 dark:bg-neutral-900">
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{item.count} Transactions</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-gray-900 dark:text-white">${item.amount.toLocaleString()}</p>
                        <p className="text-xs font-bold text-green-500">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
