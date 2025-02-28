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
