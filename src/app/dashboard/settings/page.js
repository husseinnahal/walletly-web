'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [ratesData, setRatesData] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.currency) {
      setCurrency(user.currency);
    }

    // Fetch all available currencies from the API
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates) {
          // Extract just the currency codes (keys) and sort them alphabetically
          const codes = Object.keys(data.rates).sort();
          setAvailableCurrencies(codes);
          setRatesData(data.rates);
        }
      } catch (err) {
        console.error('Failed to fetch currencies:', err);
        // Fallback list just in case the API is blocked or offline
        setAvailableCurrencies(['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED']);
      }
    };

    fetchCurrencies();
  }, [user, router]);

  const handleCurrencyUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Find the precise exchange rate for the newly selected currency
      const rate = ratesData ? ratesData[currency] : 1;

      const res = await apiFetch('/users/profile/currency', {
        method: 'PUT',
        body: JSON.stringify({ 
          currency: currency,
          currencyRate: rate || 1 
        }),
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Currency updated successfully!' });
        // Update the global user context with both values
        updateUser({ 
          currency: res.data.currency,
          currencyRate: res.data.currencyRate
        });
        
        // Refresh the page to reload the CurrencyContext with new rates
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update currency' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 pb-20">
      <div className="bg-white dark:bg-neutral-900 pt-8 pb-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>⚙️</span> Settings
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Profile Settings */}
        <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-sm border border-gray-100 dark:border-neutral-700 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Regional Preferences</h2>
            
            <form onSubmit={handleCurrencyUpdate} className="max-w-md space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Base Currency
                </label>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="block w-full rounded-2xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 px-4 py-3 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors appearance-none"
                    disabled={loading}
                  >
                    {availableCurrencies.map(code => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This will be the default currency for all your charts, dashboards, and new transactions.
                </p>
              </div>

              {message.text && (
                <div className={`p-4 rounded-2xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || currency === user?.currency}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
