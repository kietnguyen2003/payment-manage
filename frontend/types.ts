
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string YYYY-MM-DD
  type: TransactionType;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  ADD = 'ADD',
  INSIGHTS = 'INSIGHTS',
  CONVERTER = 'CONVERTER',
  SETTINGS = 'SETTINGS',
  STATS = 'STATS'
}

export const CATEGORIES = [
  'Ăn uống',
  'Đi chợ/Siêu thị',
  'Di chuyển',
  'Mua sắm',
  'Nhà cửa',
  'Điện/Nước/Net',
  'Giải trí',
  'Sức khỏe',
  'Lương',
  'Đầu tư',
  'Khác'
];
