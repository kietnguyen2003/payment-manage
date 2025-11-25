export const SettingsService = {
  CURRENCY_KEY: 'geminiflow_currency',

  getCurrency(): string {
    return localStorage.getItem(this.CURRENCY_KEY) || 'VND';
  },

  setCurrency(currency: string): void {
    localStorage.setItem(this.CURRENCY_KEY, currency);
  }
};
