import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/db";
// 🌟 Importujeme všechna schémata z centrálního indexu
import * as schema from "@/db/schemas";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 🌟 Předáme tabulky z naimportovaného schématu adaptéru
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
  }),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(schema.users) // Používáme tabulku z objektu schema
          .where(eq(schema.users.email, credentials.email as string))
          .limit(1);

        if (!user?.passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.passwordHash);

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      // 🌟 2. Zpracování změny uživatele z Profil.tsx
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.image = session.user.image;
      }

      return token;
    },
    async session({ session, token }) {
      // 🌟 3. Odeslání upravených dat z tokenu zpět do klienta (prohlížeče)
      if (session.user && token.id) {
        session.user.id = token.id as string;

        // Pokud token obsahuje upravené jméno nebo email, propíšeme je do session
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email as string;
        session.user.image = token.image as string | null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
