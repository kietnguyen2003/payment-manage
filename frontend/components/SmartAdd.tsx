
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, PlusCircle, Trash2, List } from './Icons';
import { parseTransactionInput } from '../services/geminiService';
import { Transaction, TransactionType, CATEGORIES } from '../types';

interface SmartAddProps {
  onAdd: (transaction: Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => void;
}

export const SmartAdd: React.FC<SmartAddProps> = ({ onAdd }) => {
  const [mode, setMode] = useState<'ai' | 'review'>('ai');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Pending transactions to review
  const [pendingTransactions, setPendingTransactions] = useState<Partial<Transaction>[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Form State (synced with current pending transaction)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: CATEGORIES[0],
    type: 'expense' as TransactionType,
    date: new Date().toISOString().split('T')[0]
  });

  // Sync form when current index or pending transactions change
  useEffect(() => {
    if (pendingTransactions.length > 0 && pendingTransactions[currentIndex]) {
      const t = pendingTransactions[currentIndex];
      setFormData({
        amount: t.amount?.toString() || '',
        description: t.description || '',
        category: t.category || CATEGORIES[0],
        type: (t.type as TransactionType) || 'expense',
        date: t.date || new Date().toISOString().split('T')[0]
      });
    }
  }, [currentIndex, pendingTransactions]);

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const results = await parseTransactionInput(input);
      if (results && results.length > 0) {
        setPendingTransactions(results);
        setCurrentIndex(0);
        setMode('review');
      } else {
        setError('Không tìm thấy giao dịch nào. Thử lại nhé.');
      }
    } catch (err) {
      setError('Lỗi phân tích. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update pending transaction array
    const updated = [...pendingTransactions];
    if (updated[currentIndex]) {
        updated[currentIndex] = { ...updated[currentIndex], [field]: value };
        if (field === 'amount') updated[currentIndex].amount = parseFloat(value) || 0;
        setPendingTransactions(updated);
    }
  };

  const saveCurrent = () => {
    if (!formData.amount || !formData.description) {
        setError("Vui lòng nhập số tiền và nội dung");
        return;
    }

    onAdd({
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      type: formData.type,
      date: formData.date
    });

    // Remove current
    const remaining = pendingTransactions.filter((_, i) => i !== currentIndex);
    if (remaining.length === 0) {
      setMode('ai');
      setInput('');
      setPendingTransactions([]);
      setError('');
    } else {
      setPendingTransactions(remaining);
      // Adjust index if needed
      if (currentIndex >= remaining.length) {
        setCurrentIndex(remaining.length - 1);
      }
    }
  };

  const saveAll = () => {
    // Validate all
    const invalid = pendingTransactions.some(t => !t.amount || !t.description);
    if (invalid) {
        setError("Có mục thiếu thông tin (số tiền/nội dung). Vui lòng kiểm tra lại từng mục.");
        return;
    }

    // Convert Partial<Transaction> to Omit<Transaction, 'id'>
    // We assume validation passed so required fields are present
    const cleanTransactions = pendingTransactions.map(t => ({
        amount: t.amount || 0,
        description: t.description || '',
        category: t.category || CATEGORIES[0],
        type: (t.type as TransactionType) || 'expense',
        date: t.date || new Date().toISOString().split('T')[0]
    }));

    onAdd(cleanTransactions);

    // Reset
    setMode('ai');
    setInput('');
    setPendingTransactions([]);
    setError('');
  };

  const skipCurrent = () => {
    const remaining = pendingTransactions.filter((_, i) => i !== currentIndex);
    if (remaining.length === 0) {
      setMode('ai');
      setInput('');
      setPendingTransactions([]);
      setError('');
    } else {
      setPendingTransactions(remaining);
      if (currentIndex >= remaining.length) {
        setCurrentIndex(remaining.length - 1);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            {mode === 'ai' ? <Sparkles className="w-5 h-5 text-indigo-500" /> : <PlusCircle className="w-5 h-5 text-emerald-500" />}
            {mode === 'ai' ? 'Thêm Thông Minh (AI)' : `Đang duyệt (${pendingTransactions.length})`}
          </h2>
          {mode === 'review' && (
              <button 
                onClick={() => { setMode('ai'); setPendingTransactions([]); }}
                className="text-xs text-slate-400 hover:text-red-500"
              >
                Hủy tất cả
              </button>
          )}
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
                  Bạn vừa chi tiêu gì? (Nhập nhiều mục cách nhau dấu phẩy)
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ví dụ: Ăn sáng 50k, đi taxi 100k, nhận lương 15tr..."
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
            <div className="space-y-6">
               {/* Carousel / List Summary */}
               <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-slate-200">
                 {pendingTransactions.map((t, idx) => (
                   <button
                     key={idx}
                     onClick={() => setCurrentIndex(idx)}
                     className={`flex-shrink-0 w-32 p-3 rounded-lg border text-left snap-center transition-all relative ${
                       idx === currentIndex 
                         ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-500' 
                         : 'border-slate-200 bg-white hover:bg-slate-50'
                     }`}
                   >
                     <p className="font-bold text-slate-800 text-sm truncate">{t.description || 'Chưa đặt tên'}</p>
                     <p className={`text-xs font-medium truncate ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-500'}`}>
                       {t.amount?.toLocaleString()}đ
                     </p>
                     {idx === currentIndex && (
                        <div className="absolute top-[-6px] right-[-6px] w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>
                     )}
                   </button>
                 ))}
               </div>

               <div className="border-t border-slate-100 pt-4">
                 <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Loại</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleFormChange('type', 'expense')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        Chi tiêu
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormChange('type', 'income')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        Thu nhập
                      </button>
                    </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Số tiền (VNĐ)</label>
                     <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleFormChange('amount', e.target.value)}
                      placeholder="0"
                      className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                     />
                  </div>
                 </div>

                 <div className="mb-4">
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nội dung</label>
                   <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Danh mục</label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleFormChange('category', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ngày</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleFormChange('date', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                   </div>
                 </div>

                 <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button
                            onClick={skipCurrent}
                            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Bỏ qua
                        </button>
                        <button
                            onClick={saveCurrent}
                            className="flex-[2] py-3 px-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        >
                             Lưu mục này
                        </button>
                    </div>
                    {pendingTransactions.length > 0 && (
                        <button
                            onClick={saveAll}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <List className="w-5 h-5" /> Lưu tất cả ({pendingTransactions.length} mục)
                        </button>
                    )}
                 </div>
                 
                 <div className="mt-4 flex justify-between text-xs text-slate-400">
                    <span>Còn {pendingTransactions.length} mục</span>
                    <span>{currentIndex + 1} / {pendingTransactions.length}</span>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
