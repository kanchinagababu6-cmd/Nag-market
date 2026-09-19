import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = session;
    const isAuthorized =
      role === "OWNER" ||
      role === "MANAGER" ||
      role === "SALES_BOY" ||
      role === "DELIVERY_AGENT";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        ...(role === "DELIVERY_AGENT" ? { deliveryAgentId: session.id } : {}),
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
