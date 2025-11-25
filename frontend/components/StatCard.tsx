
import React from 'react';
import { formatCurrency } from '../utils';

interface StatCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  colorClass: string;
  currency?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, amount, icon, colorClass, currency }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">
          {formatCurrency(amount, currency)}
        </h3>
      </div>
    </div>
  );
};
