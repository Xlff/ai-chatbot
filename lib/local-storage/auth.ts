import { getUser, createUser } from './queries';

export async function authenticateUser({ 
  email, 
  password 
}: { 
  email: string; 
  password: string 
}): Promise<{ id: string; email: string } | null> {
  try {
    const users = await getUser(email);
    
    if (users.length === 0) {
      // 如果用户不存在，创建新用户
      const newUser = await createUser({ email, password });
      return {
        id: newUser.id,
        email: newUser.email
      };
    }
    
    // 简单密码比较（在实际应用中应使用加密比较）
    if (users[0].password === password) {
      return {
        id: users[0].id,
        email: users[0].email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
} 