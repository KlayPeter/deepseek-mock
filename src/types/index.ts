export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  isThinking?: boolean;
  thoughtContent?: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface ModelConfig {
  useThinking: boolean;
  useSearch: boolean;
}

export type ViewState = 'home' | 'chat';
