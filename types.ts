
export interface Citation {
  id: string;
  title: string;
  authors: string[];
  year: string;
  publisher: string;
  page: string;
  snippet: string;
  sourceUrl: string;
  imageUrl?: string;
  type?: string; 
}

export interface SearchResult {
  query: string;
  synthesis: string;
  citations: Citation[];
  groundingSources?: any[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum PaymentMethod {
  QRIS = 'QRIS',
  EWALLET = 'E-Wallet',
  BANK_TRANSFER = 'Bank Transfer'
}

export interface UserStats {
  searchCount: number;
  isPremium: boolean;
}
