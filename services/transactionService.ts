
import { Transaction } from "../types";

const STORAGE_KEY = 'gemini-flow-transactions';

// Simulate API delay to feel like a real backend
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const TransactionService = {
  async getAll(): Promise<Transaction[]> {
    await delay(300); // Fake network latency
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async add(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    await delay(300);
    const transactions = await this.getAll();
    
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID()
    };
    
    const updatedList = [newTransaction, ...transactions];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    
    return newTransaction;
  },

  async delete(id: string): Promise<void> {
    await delay(200);
    const transactions = await this.getAll();
    const updatedList = transactions.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  },

  async convertAll(convertFn: (amount: number) => number): Promise<void> {
     await delay(500);
     const transactions = await this.getAll();
     const updatedList = transactions.map(t => ({
       ...t,
       amount: convertFn(t.amount)
     }));
     localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  }
};
