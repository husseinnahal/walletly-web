'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { apiFetch } from '../../../../lib/api';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend
} from 'recharts';

export default function SavingsStatsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user) router.push('/login');
    else fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/savings/stats`);
      setData(res.data || []);
    } catch (err) {
      console.error('Failed to fetch savings stats', err);
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
              <span>💰</span> Savings Rate
            </h1>
            <p className="text-gray-500 dark:text-neutral-400 font-medium mt-1">Monthly savings progression.</p>
          </div>
          <button onClick={() => router.push('/dashboard/statistics')} className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl hover:bg-gray-50 transition shadow-sm">
            ← Back to Analytics
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-neutral-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="text-left">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Growth Window</span>
                <p className="text-lg font-bold text-indigo-600">Last 6 Months</p>
            </div>
          </div>
          
          {loading ? (
             <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
             </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: "#000" }}
                  />
                  <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                  <Line 
                    type="monotone" 
                    dataKey="saved" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                    name="Amount Saved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl">
            <h3 className="text-blue-900 dark:text-blue-100 font-bold flex items-center gap-2 mb-2">
                <span>💡</span> Why track savings?
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                Consistency is key to long-term wealth. This chart tracks the total amount you've contributed to all your saving goals over the last 6 months. 
                Keep your "Amount Saved" line growing to hit your milestones faster!
            </p>
        </div>
      </div>
    </div>
  );
}
