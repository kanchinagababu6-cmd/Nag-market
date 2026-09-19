import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    // Only store staff can use ?all=true
    const isStaff =
      session?.role === "OWNER" ||
      session?.role === "MANAGER" ||
      session?.role === "DELIVERY_AGENT";

    const showAll = searchParams.get("all") === "true" && isStaff;

    const orders = await prisma.order.findMany({
      where: showAll
        ? {}
        : {
            OR: [
              ...(session?.id ? [{ userId: session.id }] : []),
              ...(phone ? [{ customerPhone: phone }] : []),
              ...(session?.phone ? [{ customerPhone: session.phone }] : []),
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
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
