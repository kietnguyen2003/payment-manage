interface ExchangeRates {
  [key: string]: number;
}

interface ExchangeRateResponse {
  result: string;
  provider: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  time_eol_unix: number;
  base_code: string;
  rates: ExchangeRates;
}

// Fallback rates in case API fails or for initial load
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  VND: 25450,
  CAD: 1.43,
  EUR: 0.95,
  JPY: 154.5,
  GBP: 0.79,
  AUD: 1.54,
  CNY: 7.24
};

const API_URL = 'https://open.er-api.com/v6/latest/USD';

export const currencyService = {
  async getRates(): Promise<{ rates: ExchangeRates; lastUpdated: string }> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch rates');
      }
      const data: ExchangeRateResponse = await response.json();
      return { 
        rates: data.rates, 
        lastUpdated: new Date(data.time_last_update_utc).toLocaleString('vi-VN') 
      };
    } catch (error) {
      console.error('Currency fetch error, using fallback:', error);
      return { 
        rates: FALLBACK_RATES, 
        lastUpdated: 'Chế độ Offline (Dữ liệu mẫu)' 
      };
    }
  },

  convert(amount: number, from: string, to: string, rates: ExchangeRates): number {
    if (!rates[from] || !rates[to]) return 0;
    
    // Convert to USD (base) first, then to target
    // If base is USD in rates:
    // Amount in USD = Amount / Rate(From)
    // Amount in Target = Amount in USD * Rate(To)
    
    const amountInUSD = amount / rates[from];
    const result = amountInUSD * rates[to];
    
    return Number(result.toFixed(2));
  }
};
