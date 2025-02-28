import { auth } from '@/app/(auth)/auth';
import { ArtifactKind } from '@/components/artifact';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from '@/lib/local-storage/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  // 暂时注释掉强制登录的检查
  // if (!session || !session.user) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  const documents = await getDocumentsById({ id });

  const [document] = documents;

  if (!document) {
    return new Response('Not Found', { status: 404 });
  }

  // 暂时注释掉用户 ID 检查
  // if (document.userId !== session.user.id) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  return Response.json(documents, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  // 暂时注释掉强制登录的检查
  // if (!session) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: ArtifactKind } =
    await request.json();

  // 使用默认用户 ID
  const userId = session?.user?.id || 'anonymous-user';
  
  const document = await saveDocument({
    id,
    content,
    title,
    kind,
    userId,
  });

  return Response.json(document, { status: 200 });
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { timestamp }: { timestamp: string } = await request.json();

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  // 暂时注释掉强制登录的检查
  // if (!session || !session.user) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  const documents = await getDocumentsById({ id });

  const [document] = documents;

  if (!document) {
    return new Response('Not Found', { status: 404 });
  }
  
  // 暂时注释掉用户 ID 检查
  // if (document.userId !== session.user.id) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return new Response('Deleted', { status: 200 });
}
