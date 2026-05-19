'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useEffect } from 'react';

export default function StatisticsHub() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  const statsModules = [
    {
      title: "Daily Cash Flow",
      description: "Analyze your income vs expenses on a day-by-day basis for any month.",
      icon: "📅",
      route: "/dashboard/statistics/daily",
      color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      title: "Yearly Trends",
      description: "Observe long-term financial patterns and monthly growth throughout the year.",
      icon: "📈",
      route: "/dashboard/statistics/trends",
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      title: "Category Breakdown",
      description: "See exactly where your money goes with detailed categorical distribution.",
      icon: "🍕",
      route: "/dashboard/statistics/categories",
      color: "bg-indigo-50 text-indigo-600 border-indigo-100"
    },
    {
      title: "Savings Rate",
      description: "Track your consistency in growing your wealth over the last 6 months.",
      icon: "💰",
      route: "/dashboard/statistics/savings",
      color: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
      title: "Debt & Credit",
      description: "Monitor how effectively you're paying off debts and collecting credits.",
      icon: "🏦",
      route: "/dashboard/statistics/debt",
      color: "bg-rose-50 text-rose-600 border-rose-100"
    },
    {
      title: "Bill Analytics",
      description: "Analyze your recurring obligations and spending patterns over time.",
      icon: "🧾",
      route: "/dashboard/statistics/bills",
      color: "bg-blue-50 text-blue-600 border-blue-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 pb-20 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-[#6be6b0] to-emerald-600">
              Insights & Analytics
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Select a module below to explore your financial patterns.</p>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statsModules.map((module) => (
            <button
              key={module.title}
              onClick={() => router.push(module.route)}
              className="flex flex-col text-left bg-white dark:bg-neutral-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-700 hover:shadow-2xl hover:shadow-[#6be6b0]/5 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 ${module.color} rounded-2xl flex items-center justify-center text-3xl mb-6 border group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{module.title}</h2>
              <p className="text-gray-500 dark:text-neutral-400 font-medium leading-relaxed mb-8 flex-grow">
                {module.description}
              </p>
              <div className="flex items-center gap-2 text-[#EA7108] font-black text-sm uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Explore Module <span>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Info Card */}
        <div className="mt-12 bg-gradient-to-br from-[#0e0e0e] via-[#161616] to-[#0e0e0e] border border-neutral-855 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6be6b0]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#EA7108]/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#6be6b0] to-emerald-600">Master Your Money</h3>
            <p className="text-neutral-400 text-sm sm:text-lg font-medium leading-relaxed">
              Our analytics engine processes your transactions in real-time to give you the most accurate financial picture possible. 
              Use these insights to optimize your budget and grow your savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
