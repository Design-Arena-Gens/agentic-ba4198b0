import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { passwordResetRequestSchema } from "@/lib/validators";

const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = passwordResetRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Respond with success to avoid email enumeration.
      return NextResponse.json({ success: true });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(token, 12);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        token: tokenHash,
        expiresAt,
      },
      create: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    console.info(`Password reset token for ${email}: ${token}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset request failed", error);
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
