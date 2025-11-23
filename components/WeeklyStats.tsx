
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Transaction } from '../types';
import { formatCurrency } from '../utils';

interface WeeklyStatsProps {
  transactions: Transaction[];
  currency: string;
}

export const WeeklyStats: React.FC<WeeklyStatsProps> = ({ transactions, currency }) => {
  
  // Logic to group transactions by week
  const data = useMemo(() => {
    const groups: Record<string, { name: string; income: number; expense: number; rawDate: Date }> = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      // Get the Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const monday = new Date(date);
      monday.setDate(diff);
      const key = monday.toISOString().split('T')[0];
      
      // Format label: "DD/MM"
      const label = `${monday.getDate()}/${monday.getMonth() + 1}`;

      if (!groups[key]) {
        groups[key] = { 
            name: `Tuần ${label}`, 
            income: 0, 
            expense: 0,
            rawDate: monday
        };
      }

      if (t.type === 'income') {
        groups[key].income += t.amount;
      } else {
        groups[key].expense += t.amount;
      }
    });

    // Convert to array and sort by date (oldest first for chart usually, or newest first)
    // For charts, chronological order (oldest -> newest) usually looks best left-to-right
    return Object.values(groups).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
  }, [transactions]);

  // Calculations for summary
  const totalWeeks = data.length;
  const avgExpense = totalWeeks > 0 
    ? data.reduce((acc, cur) => acc + cur.expense, 0) / totalWeeks 
    : 0;

  const highestExpenseWeek = [...data].sort((a, b) => b.expense - a.expense)[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Trung bình chi tiêu/tuần</h3>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(avgExpense, currency)}</p>
         </div>
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Tuần chi tiêu nhiều nhất</h3>
            <p className="text-2xl font-bold text-red-600">
                {highestExpenseWeek ? formatCurrency(highestExpenseWeek.expense, currency) : '0đ'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
                {highestExpenseWeek ? highestExpenseWeek.name : '-'}
            </p>
         </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Biểu đồ Thu/Chi theo Tuần</h3>
        
        <div className="h-80 w-full">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => value >= 1000000 ? `${value/1000000}M` : `${value/1000}k`}
                        />
                        <Tooltip 
                            formatter={(value: number) => formatCurrency(value, currency)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Bar 
                            name="Thu nhập" 
                            dataKey="income" 
                            fill="#10B981" 
                            radius={[4, 4, 0, 0]} 
                            barSize={20}
                        />
                        <Bar 
                            name="Chi tiêu" 
                            dataKey="expense" 
                            fill="#EF4444" 
                            radius={[4, 4, 0, 0]} 
                            barSize={20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <p>Chưa có đủ dữ liệu để hiển thị biểu đồ tuần.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
