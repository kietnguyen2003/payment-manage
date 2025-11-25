
import { Transaction } from "../types";

const API_URL = 'https://payment-manage.onrender.com/api';

export const TransactionService = {
  async getAll(): Promise<Transaction[]> {
    const response = await fetch(`${API_URL}/transactions`);
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return response.json();
  },

  async add(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error('Failed to add transaction');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete transaction');
    }
  },

  // Deprecated or Client-side only for now
  async convertAll(convertFn: (amount: number) => number): Promise<void> {
    console.warn("Bulk conversion is not supported on the backend yet.");
  }
};
