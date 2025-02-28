import { getLocalStorage, saveToLocalStorage, generateLocalUUID, type Chat, type Message, type User, type Vote, type Document, type Suggestion } from './index';

// 用户相关操作
export async function getUser(email: string): Promise<User[]> {
  const db = getLocalStorage();
  const user = Object.values(db.users).find(user => user.email === email);
  return user ? [user] : [];
}

export async function createUser({ email, password }: { email: string; password: string }): Promise<User> {
  const db = getLocalStorage();
  const id = generateLocalUUID();
  
  const newUser: User = {
    id,
    email,
    password
  };
  
  db.users[id] = newUser;
  saveToLocalStorage(db);
  
  return newUser;
}

// 聊天相关操作
export async function getChatById({ id }: { id: string }): Promise<Chat | undefined> {
  const db = getLocalStorage();
  return db.chats[id];
}

export async function getChatsByUserId({ id }: { id: string }): Promise<Chat[]> {
  const db = getLocalStorage();
  return Object.values(db.chats).filter(chat => chat.userId === id);
}

export async function saveChat({ id, userId, title }: { id: string; userId: string; title: string }): Promise<void> {
  const db = getLocalStorage();
  
  db.chats[id] = {
    id,
    userId,
    title,
    createdAt: new Date(),
    visibility: 'private'
  };
  
  saveToLocalStorage(db);
}

export async function updateChatVisiblityById({ 
  chatId, 
  visibility 
}: { 
  chatId: string; 
  visibility: 'public' | 'private' 
}): Promise<void> {
  const db = getLocalStorage();
  
  if (db.chats[chatId]) {
    db.chats[chatId].visibility = visibility;
    saveToLocalStorage(db);
  }
}

export async function deleteChatById({ id }: { id: string }): Promise<void> {
  const db = getLocalStorage();
  
  delete db.chats[id];
  delete db.messages[id];
  delete db.votes[id];
  
  saveToLocalStorage(db);
}

// 消息相关操作
export async function getMessagesByChatId({ chatId }: { chatId: string }): Promise<Message[]> {
  const db = getLocalStorage();
  return db.messages[chatId] || [];
}

export async function getMessageById({ id }: { id: string }): Promise<Message[]> {
  const db = getLocalStorage();
  
  for (const chatId in db.messages) {
    const message = db.messages[chatId].find(msg => msg.id === id);
    if (message) {
      return [message];
    }
  }
  
  return [];
}

export async function saveMessages({ messages }: { messages: Array<Partial<Message>> }): Promise<void> {
  const db = getLocalStorage();
  
  for (const message of messages) {
    if (!message.chatId) continue;
    
    if (!db.messages[message.chatId]) {
      db.messages[message.chatId] = [];
    }
    
    const fullMessage: Message = {
      id: message.id || generateLocalUUID(),
      chatId: message.chatId,
      role: message.role || 'user',
      content: message.content || '',
      createdAt: message.createdAt || new Date()
    };
    
    db.messages[message.chatId].push(fullMessage);
  }
  
  saveToLocalStorage(db);
}

export async function deleteMessagesByChatIdAfterTimestamp({ 
  chatId, 
  timestamp 
}: { 
  chatId: string; 
  timestamp: Date 
}): Promise<void> {
  const db = getLocalStorage();
  
  if (db.messages[chatId]) {
    db.messages[chatId] = db.messages[chatId].filter(
      message => new Date(message.createdAt) <= new Date(timestamp)
    );
    saveToLocalStorage(db);
  }
}

// 投票相关操作
export async function getVotesByChatId({ id }: { id: string }): Promise<Vote[]> {
  const db = getLocalStorage();
  return db.votes[id] || [];
}

export async function voteMessage({ 
  chatId, 
  messageId, 
  type 
}: { 
  chatId: string; 
  messageId: string; 
  type: 'up' | 'down' 
}): Promise<void> {
  const db = getLocalStorage();
  
  if (!db.votes[chatId]) {
    db.votes[chatId] = [];
  }
  
  // 检查是否已存在投票
  const existingVoteIndex = db.votes[chatId].findIndex(
    vote => vote.messageId === messageId
  );
  
  const isUpvoted = type === 'up';
  
  if (existingVoteIndex !== -1) {
    // 更新现有投票
    db.votes[chatId][existingVoteIndex].isUpvoted = isUpvoted;
  } else {
    // 添加新投票
    db.votes[chatId].push({
      chatId,
      messageId,
      isUpvoted
    });
  }
  
  saveToLocalStorage(db);
}

// 文档相关操作
export async function saveDocument({ 
  id,
  title, 
  content, 
  kind, 
  userId 
}: { 
  id: string;
  title: string; 
  content?: string; 
  kind: 'text' | 'code' | 'image' | 'sheet'; 
  userId: string 
}): Promise<Document> {
  const db = getLocalStorage();
  
  if (!db.documents[userId]) {
    db.documents[userId] = [];
  }
  
  const newDocument: Document = {
    id,
    createdAt: new Date(),
    title,
    content: content || '',
    kind,
    userId
  };
  
  db.documents[userId].push(newDocument);
  saveToLocalStorage(db);
  
  return newDocument;
}

export async function getDocumentById({ id }: { id: string }): Promise<Document | undefined> {
  const db = getLocalStorage();
  
  for (const userId in db.documents) {
    const document = db.documents[userId].find(doc => doc.id === id);
    if (document) {
      return document;
    }
  }
  
  return undefined;
}

export async function getDocumentsById({ id }: { id: string }): Promise<Document[]> {
  const db = getLocalStorage();
  
  const documents: Document[] = [];
  
  for (const userId in db.documents) {
    const userDocuments = db.documents[userId].filter(doc => doc.id === id);
    documents.push(...userDocuments);
  }
  
  return documents;
}

export async function deleteDocumentsByIdAfterTimestamp({ 
  id, 
  timestamp 
}: { 
  id: string; 
  timestamp: Date 
}): Promise<void> {
  const db = getLocalStorage();
  
  for (const userId in db.documents) {
    db.documents[userId] = db.documents[userId].filter(
      doc => doc.id !== id || new Date(doc.createdAt) <= new Date(timestamp)
    );
  }
  
  saveToLocalStorage(db);
}

// 建议相关操作
export async function saveSuggestions({ 
  suggestions 
}: { 
  suggestions: Array<Suggestion>
}): Promise<void> {
  const db = getLocalStorage();
  
  for (const suggestion of suggestions) {
    if (!db.suggestions[suggestion.userId]) {
      db.suggestions[suggestion.userId] = [];
    }
    
    db.suggestions[suggestion.userId].push(suggestion);
  }
  
  saveToLocalStorage(db);
}

export async function getSuggestionsByDocumentId({ 
  documentId 
}: { 
  documentId: string 
}): Promise<Suggestion[]> {
  const db = getLocalStorage();
  
  const allSuggestions: Suggestion[] = [];
  
  Object.values(db.suggestions).forEach(userSuggestions => {
    allSuggestions.push(...userSuggestions.filter(s => s.documentId === documentId));
  });
  
  return allSuggestions;
} 