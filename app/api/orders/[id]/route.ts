import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
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

    // Resolve params safely whether synchronous or asynchronous (Next 14/15+)
    const resolvedParams = await Promise.resolve(context.params);
    const orderId = resolvedParams?.id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Construct update data
    const updateData: Record<string, any> = { status };

    // Link delivery agent if session contains an ID
    if (role === "DELIVERY_AGENT" && session.id) {
      try {
        updateData.deliveryAgentId = session.id;
      } catch {
        // Continue if field is absent in schema
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
