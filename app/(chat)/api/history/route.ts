import { auth } from '@/app/(auth)/auth';
import { getChatsByUserId } from '@/lib/local-storage/queries';

export async function GET() {
  const session = await auth();

  // 暂时注释掉强制登录的检查
  // if (!session || !session.user) {
  //   return Response.json('Unauthorized!', { status: 401 });
  // }

  // 如果未登录，使用默认用户 ID
  const userId = session?.user?.id || 'anonymous-user';
  
  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatsByUserId({ id: userId });
  return Response.json(chats);
}
