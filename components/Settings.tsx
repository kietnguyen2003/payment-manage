import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { SettingsService } from '../services/settingsService';
import { currencyService } from '../services/currencyService';
import { TransactionService } from '../services/transactionService';

interface SettingsProps {
  onCurrencyChange: (currency: string) => void;
}

const CURRENCIES = [
  { code: 'VND', name: 'Việt Nam Đồng', symbol: '₫' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export const Settings: React.FC<SettingsProps> = ({ onCurrencyChange }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('VND');
  const [saved, setSaved] = useState(false);
  
  // Conversion State
  const [isConverting, setIsConverting] = useState(false);
  const [convertStatus, setConvertStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fromCurrencyForConvert, setFromCurrencyForConvert] = useState<string>('VND');

  useEffect(() => {
    const current = SettingsService.getCurrency();
    setSelectedCurrency(current);
    // Default "From" currency is usually what was previously selected, 
    // but for simplicity here we let user choose or default to VND
    if (current !== 'VND') setFromCurrencyForConvert('VND');
    else setFromCurrencyForConvert('USD');
  }, []);

  const handleCurrencySelect = (code: string) => {
    setSelectedCurrency(code);
    SettingsService.setCurrency(code);
    onCurrencyChange(code);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleConvertAllData = async () => {
    setIsConverting(true);
    setConvertStatus('idle');

    try {
      const { rates, lastUpdated } = await currencyService.getRates();

      if (!window.confirm(`Xác nhận chuyển đổi?\n\nTừ: ${fromCurrencyForConvert}\nSang: ${selectedCurrency}\nTỷ giá cập nhật lúc: ${lastUpdated}\n\nHành động này sẽ thay đổi vĩnh viễn dữ liệu của bạn.`)) {
        setIsConverting(false);
        return;
      }
      
      await TransactionService.convertAll((amount) => {
        return currencyService.convert(amount, fromCurrencyForConvert, selectedCurrency, rates);
      });

      setConvertStatus('success');
      window.location.reload(); 
    } catch (e) {
      console.error(e);
      setConvertStatus('error');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
          <div className="p-2 bg-slate-100 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Cài đặt</h2>
            <p className="text-sm text-slate-500">Tùy chỉnh trải nghiệm ứng dụng của bạn</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Currency Selection */}
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-4">Đơn vị tiền tệ hiển thị</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleCurrencySelect(curr.code)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedCurrency === curr.code
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      selectedCurrency === curr.code ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {curr.symbol}
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${selectedCurrency === curr.code ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {curr.code}
                      </p>
                      <p className="text-xs text-slate-500">{curr.name}</p>
                    </div>
                  </div>
                  {selectedCurrency === curr.code && (
                    <Check className="w-5 h-5 text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Data Conversion Section */}
          <div className="pt-6 border-t border-slate-100">
             <h3 className="text-lg font-medium text-slate-800 mb-2 flex items-center gap-2">
               <RefreshCw className="w-5 h-5 text-orange-500" />
               Chuyển đổi dữ liệu
             </h3>
             <p className="text-sm text-slate-500 mb-4">
               Công cụ này sẽ tính toán lại toàn bộ số tiền trong lịch sử giao dịch của bạn từ loại tiền cũ sang loại tiền hiện tại ({selectedCurrency}).
             </p>
             
             <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                   <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                   <div className="text-sm text-orange-800">
                     <p className="font-bold mb-1">Lưu ý quan trọng:</p>
                     <p>Hành động này sẽ thay đổi vĩnh viễn dữ liệu gốc. Hãy chắc chắn rằng dữ liệu hiện tại của bạn đang ở loại tiền: </p>
                     <div className="mt-2">
                        <select 
                          value={fromCurrencyForConvert}
                          onChange={(e) => setFromCurrencyForConvert(e.target.value)}
                          className="bg-white border border-orange-200 text-orange-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 font-bold"
                        >
                           {CURRENCIES.filter(c => c.code !== selectedCurrency).map(c => (
                             <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                           ))}
                        </select>
                     </div>
                   </div>
                </div>
             </div>

             <button
               onClick={handleConvertAllData}
               disabled={isConverting}
               className={`w-full py-3 px-4 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2 text-white transition-all ${
                 isConverting 
                   ? 'bg-slate-400 cursor-not-allowed' 
                   : 'bg-orange-600 hover:bg-orange-700'
               }`}
             >
               {isConverting ? (
                 <>Đang chuyển đổi...</>
               ) : (
                 <>Chuyển toàn bộ giao dịch sang {selectedCurrency}</>
               )}
             </button>
          </div>
        </div>

        {saved && (
          <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in-up">
            <Check className="w-4 h-4" />
            <span>Đã lưu cài đặt!</span>
          </div>
        )}
      </div>
    </div>
  );
};
