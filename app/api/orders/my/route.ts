import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Matches orders by userId or by customer phone/email
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: session.id },
          ...(session.phone ? [{ customerPhone: session.phone }] : []),
          ...(session.email ? [{ customerEmail: session.email }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch customer orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
