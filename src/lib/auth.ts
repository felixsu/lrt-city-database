import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const BOOTSTRAP_ADMIN_EMAIL = "felix.soewito@gmail.com";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase();

      const existing = await prisma.adminUser.findUnique({ where: { email } });
      if (existing) return true;

      const adminCount = await prisma.adminUser.count();
      if (adminCount === 0 && email === BOOTSTRAP_ADMIN_EMAIL) {
        await prisma.adminUser.create({
          data: {
            email,
            name: user.name,
            image: user.image,
            role: "SUPER_ADMIN",
          },
        });
        return true;
      }

      // Not an admin (and not eligible for bootstrap) - deny access.
      return false;
    },
    async jwt({ token }) {
      if (token.email) {
        const admin = await prisma.adminUser.findUnique({
          where: { email: token.email.toLowerCase() },
        });
        token.isAdmin = !!admin;
        token.role = admin?.role ?? null;
        token.adminId = admin?.id ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.role = (token.role as string | null) ?? null;
      }
      return session;
    },
  },
});
