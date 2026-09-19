import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { customerName, customerPhone, deliveryAddress, paymentMethod, items, totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1. Create order & items transaction, and decrement stock
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerName,
          customerPhone,
          deliveryAddress: deliveryAddress || "",
          paymentMethod: paymentMethod || "COD",
          totalAmount: parseFloat(totalAmount) || 0,
          status: "ORDER_PLACED",
          userId: session ? session.id : null,
          items: {
            create: items.map((item: any) => {
              const pId = item.productId || item.id;
              return {
                productId: pId,
                quantity: Number(item.quantity) || 1,
                price: parseFloat(item.price) || 0,
              };
            }),
          },
        },
      });

      // Decrement stock for each purchased item
      for (const item of items) {
        const pId = item.productId || item.id;
        if (pId) {
          await tx.product.update({
            where: { id: pId },
            data: {
              stock: {
                decrement: Number(item.quantity) || 1,
              },
            },
          });
        }
      }

      return order;
    });

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: any) {
    console.error("Order error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
