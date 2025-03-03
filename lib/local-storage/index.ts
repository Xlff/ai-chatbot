// 类型定义
export interface User {
  id: string;
  email: string;
  password?: string;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  visibility?: 'public' | 'private';
}

export interface Message {
  id: string;
  chatId: string;
  role: string;
  content: any;
  createdAt: Date;
}

export interface Vote {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
}

export interface Document {
  id: string;
  createdAt: Date;
  title: string;
  content: string;
  kind: 'text' | 'code' | 'image' | 'sheet';
  userId: string;
}

export interface Suggestion {
  id: string;
  documentId: string;
  documentCreatedAt: Date;
  content: string;
  userId: string;
  originalText: string;
  suggestedText: string;
}

// 类型定义
export interface LocalStorageDB {
  users: Record<string, User>;
  chats: Record<string, Chat>;
  messages: Record<string, Message[]>;
  votes: Record<string, Vote[]>;
  documents: Record<string, Document[]>;
  suggestions: Record<string, Suggestion[]>;
}

// 初始化本地存储
const initLocalStorage = (): LocalStorageDB => {
  if (typeof window === 'undefined') {
    return {
      users: {},
      chats: {},
      messages: {},
      votes: {},
      documents: {},
      suggestions: {},
    };
  }

  const existingData = localStorage.getItem('ai-chatbot-db');
  
  if (existingData) {
    try {
      return JSON.parse(existingData);
    } catch (error) {
      console.error('Failed to parse local storage data:', error);
    }
  }
  
  // 默认空数据库
  const emptyDB: LocalStorageDB = {
    users: {},
    chats: {},
    messages: {},
    votes: {},
    documents: {},
    suggestions: {},
  };
  
  localStorage.setItem('ai-chatbot-db', JSON.stringify(emptyDB));
  return emptyDB;
};

// 获取本地存储数据
export const getLocalStorage = (): LocalStorageDB => {
  if (typeof window === 'undefined') {
    return {
      users: {},
      chats: {},
      messages: {},
      votes: {},
      documents: {},
      suggestions: {},
    };
  }

  return initLocalStorage();
};

// 保存数据到本地存储
export const saveToLocalStorage = (db: LocalStorageDB): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('ai-chatbot-db', JSON.stringify(db));
};

// 生成UUID
export const generateLocalUUID = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}; 