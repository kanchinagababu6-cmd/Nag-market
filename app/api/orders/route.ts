import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { items, totalAmount, deliveryAddress, phone } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!deliveryAddress || !phone) {
      return NextResponse.json({ error: "Address and phone are required" }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order record
      const newOrder = await tx.order.create({
        data: {
          type: "ONLINE",
          status: "PAID",
          totalAmount: parseFloat(totalAmount),
          deliveryAddress: `${deliveryAddress} (Tel: ${phone})`,
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
      });

      // 2. Decrement inventory stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process order" }, { status: 500 });
  }
}
