import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const session = getSessionUser();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      addresses: {
        select: {
          id: true,
          label: true,
          fullName: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          phone: true,
          isDefault: true,
        },
      },
    },
  });

  return NextResponse.json({ user });
}
