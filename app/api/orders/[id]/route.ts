import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !["OWNER", "MANAGER", "DELIVERY_AGENT"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Order status update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
