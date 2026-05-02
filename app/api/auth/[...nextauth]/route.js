// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getCollection } from '@/lib/mongodb';

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Email si Parola',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Parola', type: 'password' },
      },
      async authorize(credentials) {
        const users = await getCollection('users');
        const user = await users.findOne({ email: credentials.email });

        if (!user) throw new Error('Email inexistent!');

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Parola incorecta!');

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };