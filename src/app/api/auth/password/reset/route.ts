import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { passwordResetSchema } from "@/lib/validators";
import { createSessionToken, setSessionCookie, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = passwordResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { email, token, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { userId: user.id },
    });

    if (!resetToken || resetToken.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    const valid = await bcrypt.compare(token, resetToken.token);
    if (!valid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.delete({ where: { userId: user.id } }),
    ]);

    const sessionToken = createSessionToken(user);
    setSessionCookie(sessionToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset failed", error);
    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
  }
}
