import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

import { authenticateUser } from '@/lib/local-storage/auth';
import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse({ email, password });

        if (!parsedCredentials.success) {
          return null;
        }

        const { email: validEmail, password: validPassword } = parsedCredentials.data;
        const user = await authenticateUser({ email: validEmail, password: validPassword });
        
        if (!user) return null;
        
        return {
          id: user.id,
          email: user.email,
          name: user.email.split('@')[0]
        } as any;
      },
    }),
    {
      id: 'wechat',
      name: 'WeChat',
      type: 'oauth',
      authorization: {
        url: 'https://open.weixin.qq.com/connect/oauth2/authorize',
        params: {
          appid: process.env.WECHAT_APP_ID,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/wechat`,
          response_type: 'code',
          scope: 'snsapi_userinfo',
          state: 'STATE',
        },
      },
      token: {
        url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
        params: {
          appid: process.env.WECHAT_APP_ID,
          secret: process.env.WECHAT_APP_SECRET,
          code: '',
          grant_type: 'authorization_code',
        },
      },
      userinfo: {
        url: 'https://api.weixin.qq.com/sns/userinfo',
        params: {
          access_token: '',
          openid: '',
          lang: 'zh_CN',
        },
      },
      profile(profile) {
        return {
          id: profile.openid,
          name: profile.nickname,
          image: profile.headimgurl,
          email: `${profile.openid}@wechat.com`, // 微信没有提供邮箱，使用 openid 作为邮箱
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});
