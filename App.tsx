
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  List, 
  Sparkles, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Trash2
} from './components/Icons';
import { ArrowRightLeft, Settings as SettingsIcon } from 'lucide-react';
import { SmartAdd } from './components/SmartAdd';
import { StatCard } from './components/StatCard';
import { Insights } from './components/Insights';
import { CurrencyConverter } from './components/CurrencyConverter';
import { Settings } from './components/Settings';
import { Transaction, AppView, TransactionType } from './types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from './utils';
import { TransactionService } from './services/transactionService';
import { SettingsService } from './services/settingsService';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

function App() {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState<string>('VND');

  // Load data and settings on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await TransactionService.getAll();
        setTransactions(data);
        setCurrency(SettingsService.getCurrency());
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const addTransaction = async (t: Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => {
    if (Array.isArray(t)) {
      const newTransactions: Transaction[] = [];
      for (const item of t) {
        const newTrans = await TransactionService.add(item);
        newTransactions.push(newTrans);
      }
      setTransactions(prev => [...newTransactions, ...prev]);
    } else {
      const newTrans = await TransactionService.add(t);
      setTransactions(prev => [newTrans, ...prev]);
    }
    setView(AppView.DASHBOARD);
  };

  const deleteTransaction = async (id: string) => {
    await TransactionService.delete(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  // Statistics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Chart Data Preparation
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  // Render Views
  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    switch (view) {
      case AppView.ADD:
        return <SmartAdd onAdd={addTransaction} />;
      
      case AppView.INSIGHTS:
        return <Insights transactions={transactions} />;

      case AppView.CONVERTER:
        return <CurrencyConverter />;

      case AppView.SETTINGS:
        return <Settings onCurrencyChange={handleCurrencyChange} />;
      
      case AppView.TRANSACTIONS:
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Ngày</th>
                    <th className="px-6 py-4">Nội dung</th>
                    <th className="px-6 py-4">Danh mục</th>
                    <th className="px-6 py-4 text-right">Số tiền</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        Chưa có giao dịch nào. Hãy thêm mới!
                      </td>
                    </tr>
                  ) : (
                    transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">{t.date}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{t.description}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {t.category}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => deleteTransaction(t.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case AppView.DASHBOARD:
      default:
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Số dư hiện tại" 
                amount={balance} 
                icon={<Wallet className="w-6 h-6 text-indigo-600" />} 
                colorClass="bg-indigo-50"
                currency={currency}
              />
              <StatCard 
                title="Tổng thu nhập" 
                amount={totalIncome} 
                icon={<TrendingUp className="w-6 h-6 text-emerald-600" />} 
                colorClass="bg-emerald-50"
                currency={currency}
              />
              <StatCard 
                title="Tổng chi tiêu" 
                amount={totalExpense} 
                icon={<TrendingDown className="w-6 h-6 text-red-600" />} 
                colorClass="bg-red-50"
                currency={currency}
              />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Phân bổ chi tiêu</h3>
                <div className="h-64 w-full">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      Chưa có dữ liệu chi tiêu
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity (Mini List) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Giao dịch gần đây</h3>
                  <button onClick={() => setView(AppView.TRANSACTIONS)} className="text-sm text-indigo-600 hover:underline">Xem tất cả</button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-64">
                  {transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{t.description}</p>
                          <p className="text-xs text-slate-500">{t.date}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-slate-400 text-sm text-center mt-10">Chưa có hoạt động nào</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 z-20">
        <div className="h-16 flex items-center justify-center border-b border-slate-100">
          <div className="flex items-center gap-2 px-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">G</div>
            <span className="font-bold text-slate-800 hidden lg:block">KitPayment</span>
          </div>
        </div>

        <nav className="p-4 flex-1 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible justify-between md:justify-start">
          <NavButton 
            active={view === AppView.DASHBOARD} 
            onClick={() => setView(AppView.DASHBOARD)} 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Tổng quan" 
          />
          <NavButton 
            active={view === AppView.ADD} 
            onClick={() => setView(AppView.ADD)} 
            icon={<PlusCircle className="w-5 h-5" />} 
            label="Thêm mới" 
          />
          <NavButton 
            active={view === AppView.TRANSACTIONS} 
            onClick={() => setView(AppView.TRANSACTIONS)} 
            icon={<List className="w-5 h-5" />} 
            label="Lịch sử" 
          />
          <NavButton 
            active={view === AppView.CONVERTER} 
            onClick={() => setView(AppView.CONVERTER)} 
            icon={<ArrowRightLeft className="w-5 h-5" />} 
            label="Chuyển đổi" 
          />
          <NavButton 
            active={view === AppView.INSIGHTS} 
            onClick={() => setView(AppView.INSIGHTS)} 
            icon={<Sparkles className="w-5 h-5" />} 
            label="Góc nhìn AI" 
          />
          <div className="md:flex-1"></div>
          <NavButton 
            active={view === AppView.SETTINGS} 
            onClick={() => setView(AppView.SETTINGS)} 
            icon={<SettingsIcon className="w-5 h-5" />} 
            label="Cài đặt" 
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {view === AppView.DASHBOARD && 'Bảng điều khiển'}
              {view === AppView.ADD && 'Thêm Giao Dịch'}
              {view === AppView.TRANSACTIONS && 'Lịch Sử Giao Dịch'}
              {view === AppView.CONVERTER && 'Chuyển Đổi Tiền Tệ'}
              {view === AppView.INSIGHTS && 'Góc Nhìn Tài Chính AI'}
              {view === AppView.SETTINGS && 'Cài Đặt Ứng Dụng'}
            </h1>
            <p className="text-slate-500 text-sm">Quản lý tài chính hàng ngày</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-100">
              Beta
            </div>
          </div>
        </header>

        {renderView()}
      </main>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap
      ${active 
        ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
  >
    {icon}
    <span className="hidden lg:block">{label}</span>
  </button>
);

export default App;
