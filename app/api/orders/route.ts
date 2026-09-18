import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  paymentMethod: z.enum(["COD", "UPI", "CARD", "NET_BANKING", "CASH", "MULTI"]).default("COD"),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive()
  })).min(1)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { userId, paymentMethod, items } = parsed.data;

  try {
    const result = await prisma.$transaction(async tx => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map(i => i.productId) }, active: true },
        include: { inventory: true }
      });

      if (products.length !== items.length) throw new Error("One or more products are unavailable.");

      let subtotal = 0;
      const lines: { productId: string; quantity: number; unitPrice: number; lineTotal: number }[] = [];

      for (const item of items) {
        const p = products.find(x => x.id === item.productId)!;
        const stock = p.inventory?.quantity ?? 0;
        if (stock < item.quantity) throw new Error(`Insufficient stock for ${p.name}.`);
        const unitPrice = Number(p.sellingPrice);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        lines.push({ productId: p.id, quantity: item.quantity, unitPrice, lineTotal });
      }

      const tax = Number((subtotal * 0.05).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));
      const orderNumber = `ORD-${Date.now()}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          tax,
          total,
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "COD_PENDING" : "PENDING",
          items: { create: lines }
        }
      });

      for (const line of lines) {
        const updated = await tx.inventory.updateMany({
          where: { productId: line.productId, quantity: { gte: line.quantity } },
          data: { quantity: { decrement: line.quantity } }
        });
        if (updated.count !== 1) throw new Error("Stock changed during checkout. Please retry.");
        await tx.inventoryTransaction.create({
          data: {
            productId: line.productId,
            type: "OUT",
            quantity: line.quantity,
            reference: order.id,
            note: "Online order"
          }
        });
      }

      await tx.orderStatusHistory.create({
        data: { orderId: order.id, next: "NEW", note: "Order created" }
      });

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Order failed" }, { status: 409 });
  }
}
