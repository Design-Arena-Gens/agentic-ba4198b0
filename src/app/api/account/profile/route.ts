import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/api-utils";
import { profileSchema } from "@/lib/validators";

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return NextResponse.json({ user: updated });
}
