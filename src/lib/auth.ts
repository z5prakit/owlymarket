/**
 * NextAuth configuration
 */

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { SupabaseAdapter } from '@auth/supabase-adapter'

// Simple auth configuration
// For production, configure OAuth providers with real credentials
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Google OAuth (requires setup in Google Cloud Console)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        // Add user ID from token or generate anonymous ID
        session.user.id = (token.sub || user?.id || 'anonymous') as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
})
