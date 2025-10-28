import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, name, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const token = createSessionToken(user);
    setSessionCookie(token);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
