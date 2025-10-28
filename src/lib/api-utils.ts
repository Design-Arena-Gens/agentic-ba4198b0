import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function requireUser() {
  const session = getSessionUser();
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  return user;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFoundResponse(entity = "Resource") {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}

export function successResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
