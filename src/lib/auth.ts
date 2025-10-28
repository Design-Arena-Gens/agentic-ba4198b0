import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "shopverse_session";
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  userId: number;
  email: string;
  name: string;
};

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET is not set.");
  }
  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(user: Pick<User, "id" | "email" | "name">) {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: TOKEN_EXPIRY_SECONDS,
  });
}

export function verifySessionToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload;
  } catch (error) {
    return null;
  }
}

export function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_EXPIRY_SECONDS,
  });
}

export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export function getSessionTokenFromCookies(): string | null {
  const cookieStore = cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}

export function getSessionUser(): SessionPayload | null {
  const token = getSessionTokenFromCookies();
  if (!token) return null;
  return verifySessionToken(token);
}
