import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Passkey from 'next-auth/providers/passkey';

import { prisma } from '@lib/DAL/prisma';

const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') ?? [];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [Passkey],
  experimental: { enableWebAuthn: true },
  callbacks: {
    signIn({ user }) {
      return (
        user.email === null ||
        user.email === undefined ||
        allowedEmails.includes(user.email)
      );
    },
  },
});
