export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatApiMessage {
  _id: string;
  user: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  session?: string;
}

export interface ChatSession {
  _id: string;
  user: string;
  title: string;
  lastMessagePreview?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}
