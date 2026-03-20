import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // 管理员密码登录
    Credentials({
      name: 'Admin',
      credentials: {
        password: { label: 'Password', type: 'password' }
      },
      authorize(credentials) {
        if (credentials?.password === process.env.ADMIN_PASSWORD) {
          return { id: 'admin', name: 'Will', email: 'will@fuluckai.com', role: 'admin' }
        }
        return null
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as unknown as Record<string, unknown>).role || 'user'
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as unknown as Record<string, unknown>).role = token.role
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
})
