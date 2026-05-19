const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Core API wrapper around Next.js fetch.
 * Automatically injects the Authorization header.
 */
export async function apiFetch(endpoint, options = {}) {
  const { headers, ...restOptions } = options;
  
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (remove Content-Type to let browser set it with boundary)
  if (options.body && options.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    // Required to send cookies (like refresh token) across origins
    credentials: 'include',
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // AUTO-REFRESH LOGIC
    // If unauthorized (401) and we aren't already in the middle of a refresh call
    if (response.status === 401 && endpoint !== '/auth/refresh') {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.accessToken;
          
          // Update storage so future calls use it
          localStorage.setItem('accessToken', newToken);
          
          // Notify the app that the token changed (AuthContext will listen for this)
          window.dispatchEvent(new Event('auth-token-refreshed'));

          // RETRY THE ORIGINAL REQUEST
          return apiFetch(endpoint, options);
        }
      } catch (refreshError) {
        console.error('Silent refresh failed:', refreshError);
      }
    }

    const error = new Error(data?.message || data || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
