
import React, { useState } from 'react';
import { Sparkles, ArrowRight, PlusCircle } from './Icons';
import { parseTransactionInput } from '../services/geminiService';
import { Transaction, TransactionType, CATEGORIES } from '../types';

interface SmartAddProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

export const SmartAdd: React.FC<SmartAddProps> = ({ onAdd }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Manual State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const result = await parseTransactionInput(input);
      
      // Fill manual form with result for review
      if (result.amount) setAmount(result.amount.toString());
      if (result.description) setDescription(result.description);
      if (result.category) setCategory(result.category);
      if (result.type) setType(result.type as TransactionType);
      if (result.date) setDate(result.date);

      setMode('manual'); // Switch to manual for review
    } catch (err) {
      setError('Không hiểu nội dung. Vui lòng thử lại hoặc nhập thủ công.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    onAdd({
      amount: parseFloat(amount),
      description,
      category,
      type,
      date
    });

    // Reset
    setInput('');
    setAmount('');
    setDescription('');
    setMode('ai');
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            {mode === 'ai' ? <Sparkles className="w-5 h-5 text-indigo-500" /> : <PlusCircle className="w-5 h-5 text-emerald-500" />}
            {mode === 'ai' ? 'Thêm Thông Minh (AI)' : 'Kiểm Tra & Lưu'}
          </h2>
          <button 
            onClick={() => setMode(mode === 'ai' ? 'manual' : 'ai')}
            className="text-sm text-slate-500 hover:text-slate-800 underline"
          >
            Chuyển sang {mode === 'ai' ? 'Thủ công' : 'AI'}
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {mode === 'ai' ? (
            <form onSubmit={handleAISubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Bạn vừa chi tiêu gì? (Nhập tự nhiên)
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ví dụ: Ăn sáng phở bò hết 50k, hoặc Nhận lương tháng này 15 triệu..."
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-32 text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input}
                className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${
                  isLoading || !input 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <>Đang xử lý...</>
                ) : (
                  <>Phân tích & Nhập <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
              <p className="text-xs text-center text-slate-400">
                Hỗ trợ bởi Gemini 2.5 Flash
              </p>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Loại</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Chi tiêu
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Thu nhập
                    </button>
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Số tiền (VNĐ)</label>
                   <input
                    type="number"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                   />
                </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nội dung</label>
                 <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Danh mục</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ngày</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                 </div>
               </div>

               <div className="pt-2">
                 <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition-all"
                 >
                   Lưu Giao Dịch
                 </button>
               </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
