import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      paymentMethod,
      orderType,
      items,
      totalAmount,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Standardize payment method for Prisma enum compatibility
    let formattedPayment = "COD";
    if (paymentMethod) {
      const pm = paymentMethod.toString().toUpperCase();
      if (pm.includes("UPI") || pm.includes("QR")) {
        formattedPayment = "UPI";
      } else if (pm.includes("COUNTER") || pm.includes("PICKUP")) {
        formattedPayment = "PAY_AT_COUNTER";
      } else {
        formattedPayment = "COD";
      }
    }

    // Build the order data object
    const orderData: any = {
      customerName: customerName || "Customer",
      customerPhone: customerPhone || "",
      deliveryAddress: orderType === "PICKUP" ? "Store Pickup" : (deliveryAddress || ""),
      paymentMethod: formattedPayment,
      totalAmount: parseFloat(totalAmount) || 0,
      status: "ORDER_PLACED",
    };

    // Only attach userId if an authenticated session exists
    if (session?.id) {
      orderData.userId = session.id;
    }

    // Map items safely, accepting both item.productId and item.id
    orderData.items = {
      create: items.map((item: any) => ({
        productId: item.productId || item.id,
        quantity: Number(item.quantity || item.cartQty) || 1,
        price: parseFloat(item.price) || 0,
      })),
    };

    // Create the order in Prisma
    const newOrder = await prisma.order.create({
      data: orderData,
    });

    // Best-effort stock decrement without failing the order if one item misses
    for (const item of items) {
      const pId = item.productId || item.id;
      if (pId) {
        try {
          await prisma.product.update({
            where: { id: pId },
            data: {
              stock: {
                decrement: Number(item.quantity || item.cartQty) || 1,
              },
            },
          });
        } catch (stockErr) {
          console.warn("Stock decrement skipped for product ID:", pId, stockErr);
        }
      }
    }

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: any) {
    console.error("Order creation error:", error);
    // Return the actual database error message so we can see any remaining schema mismatches
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
