let cachedCurrencies = null;

export const getCurrencies = async () => {
  if (cachedCurrencies) return cachedCurrencies;
  
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    
    if (data && data.rates) {
      // Get all currency codes and sort them alphabetically
      cachedCurrencies = Object.keys(data.rates).sort();
      return cachedCurrencies;
    }
    
    // Fallback if API fails
    return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'SAR', 'AED', 'KWD', 'EGP', 'INR'];
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'SAR', 'AED', 'KWD', 'EGP', 'INR'];
  }
};
