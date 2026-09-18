import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { items, totalAmount } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Execute atomic transaction: create POS order and decrement stock
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          type: "POS",
          status: "PAID",
          totalAmount: parseFloat(totalAmount),
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

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

      return order;
    });

    return NextResponse.json({ success: true, order: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
  }
}
