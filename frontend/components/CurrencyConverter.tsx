import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw, Calculator } from 'lucide-react';
import { currencyService } from '../services/currencyService';

const POPULAR_CURRENCIES = ['VND', 'USD', 'CAD', 'EUR', 'JPY', 'GBP', 'AUD', 'CNY'];

export const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('100000');
  const [fromCurrency, setFromCurrency] = useState<string>('VND');
  const [toCurrency, setToCurrency] = useState<string>('CAD');
  const [result, setResult] = useState<number | null>(null);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    handleConvert();
  }, [amount, fromCurrency, toCurrency, rates]);

  const fetchRates = async () => {
    setLoading(true);
    const { rates, lastUpdated } = await currencyService.getRates();
    setRates(rates);
    setLastUpdated(lastUpdated);
    setLoading(false);
  };

  const handleConvert = () => {
    if (!rates || !amount) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;

    const converted = currencyService.convert(numAmount, fromCurrency, toCurrency, rates);
    setResult(converted);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatCurrency = (val: number, curr: string) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: curr }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Calculator className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Chuyển đổi tiền tệ</h2>
            {lastUpdated && (
              <p className="text-xs text-slate-400">Cập nhật: {lastUpdated}</p>
            )}
          </div>
        </div>
        <button 
          onClick={fetchRates}
          disabled={loading}
          className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${loading ? 'animate-spin' : ''}`}
          title="Cập nhật tỷ giá"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Số tiền</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-slate-800"
            placeholder="Nhập số tiền..."
          />
        </div>

        <div className="flex items-end gap-2">
          {/* From Currency */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600 mb-1">Từ</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white cursor-pointer"
            >
              {POPULAR_CURRENCIES.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button 
            onClick={handleSwap}
            className="mb-1 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          {/* To Currency */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600 mb-1">Sang</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white cursor-pointer"
            >
              {POPULAR_CURRENCIES.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Display */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl text-center">
          <p className="text-sm text-slate-500 mb-1">Kết quả ước tính</p>
          <div className="text-2xl font-bold text-indigo-600">
            {result !== null ? formatCurrency(result, toCurrency) : '...'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            1 {fromCurrency} ≈ {rates ? (rates[toCurrency] / rates[fromCurrency]).toFixed(4) : '...'} {toCurrency}
          </p>
        </div>
      </div>
    </div>
  );
};
