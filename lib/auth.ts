import { AuthOptions } from "next-auth/";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "./prisma";
import { Role } from "@prisma/client";
import { AUTH_CONSTANTS } from "./constants";

/**
 * Type extensions for NextAuth.js
 * Adds role-based authentication support
 */
declare module "next-auth" {
  interface User {
    role?: Role;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}

/**
 * NextAuth configuration options
 * Implements email/password authentication with role-based access
 */
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials presence
          if (!credentials?.email || !credentials?.password) {
            console.warn("Missing credentials in auth attempt");
            throw new Error(AUTH_CONSTANTS.ERROR_MESSAGES.MISSING_CREDENTIALS);
          }

          // Find user
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            console.warn(
              `Auth failed: User not found for email ${credentials.email}`
            );
            throw new Error(AUTH_CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
          }

          // Validate password
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            console.warn(
              `Auth failed: Invalid password for email ${credentials.email}`
            );
            throw new Error(AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS);
          }

          // Return sanitized user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    /**
     * Add custom claims to JWT token
     */
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    /**
     * Customize session object
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: AUTH_CONSTANTS.SESSION.MAX_AGE,
  },
  jwt: {
    maxAge: AUTH_CONSTANTS.SESSION.MAX_AGE,
  },
  pages: {
    signIn: "/login",
    signOut: "/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
} as const;
