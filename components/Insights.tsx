
import React, { useEffect, useState } from 'react';
import { Sparkles } from './Icons';
import { generateSpendingInsights } from '../services/geminiService';
import { Transaction } from '../types';
import ReactMarkdown from 'react-markdown';

interface InsightsProps {
  transactions: Transaction[];
}

export const Insights: React.FC<InsightsProps> = ({ transactions }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (transactions.length === 0) {
      setInsight("Hãy thêm vài giao dịch để AI có thể phân tích giúp bạn!");
      return;
    }
    setLoading(true);
    const result = await generateSpendingInsights(transactions);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
           <Sparkles className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold">Góc nhìn Tài chính</h2>
          </div>

          {loading ? (
             <div className="space-y-3 animate-pulse">
               <div className="h-4 bg-white/20 rounded w-3/4"></div>
               <div className="h-4 bg-white/20 rounded w-1/2"></div>
               <div className="h-4 bg-white/20 rounded w-5/6"></div>
             </div>
          ) : (
            <div className="prose prose-invert max-w-none">
               <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t border-white/20 flex justify-end">
             <button 
               onClick={fetchInsights}
               disabled={loading}
               className="text-sm font-medium hover:text-white/80 transition-colors"
             >
               Làm mới phân tích
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
