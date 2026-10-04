import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "today";

    const now = new Date();
    let startDate = new Date();

    if (range === "yesterday") {
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - 1);
      now.setHours(23, 59, 59, 999);
    } else if (range === "7days") {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "month") {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // today
      startDate.setHours(0, 0, 0, 0);
    }

    // Fetch orders within range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch live inventory for stock health monitoring
    const products = await prisma.product.findMany({
      orderBy: { stock: "asc" },
    });

    // Core Metrics Initializers
    let grossRevenue = 0;
    let cashCodRevenue = 0;
    let upiRevenue = 0;
    let posRevenue = 0;
    let posCount = 0;
    let deliveryRevenue = 0;
    let deliveryCount = 0;
    let pickupRevenue = 0;
    let pickupCount = 0;

    const hourlyMap: Record = {};
    const productSalesMap: Record = {};

    for (let i = 0; i < 24; i++) {
      hourlyMap[i] = 0;
    }

    orders.forEach((o) => {
      const amount = o.totalAmount || 0;
      grossRevenue += amount;

      // Payment Breakdown
      const pm = (o.paymentMethod || "").toUpperCase();
      if (pm.includes("UPI") || pm.includes("QR")) {
        upiRevenue += amount;
      } else {
        cashCodRevenue += amount;
      }

      // Channel Breakdown
      const addr = (o.deliveryAddress || "").toLowerCase();
      if (!o.deliveryAddress || addr.includes("pos") || addr.includes("counter sale")) {
        posRevenue += amount;
        posCount++;
      } else if (addr.includes("store pickup") || addr.includes("pickup")) {
        pickupRevenue += amount;
        pickupCount++;
      } else {
        deliveryRevenue += amount;
        deliveryCount++;
      }

      // Hourly Heatmap
      const hour = new Date(o.createdAt).getHours();
      hourlyMap[hour] = (hourlyMap[hour] || 0) + amount;

      // Item Sales
      o.items?.forEach((item) => {
        const pId = item.productId;
        const name = item.product?.name || "Product";
        const cat = item.product?.category || "General";
        const qty = item.quantity || 1;
        const total = item.price * qty;

        if (!productSalesMap[pId]) {
          productSalesMap[pId] = { name, category: cat, units: 0, sales: 0 };
        }
        productSalesMap[pId].units += qty;
        productSalesMap[pId].sales += total;
      });
    });

    const topSelling = Object.values(productSalesMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    // Depleted stock analysis (<= 5 units or negative stock)
    const depletedInventory = products
      .filter((p) => p.stock <= 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        category: p.category,
        stock: p.stock,
        price: p.price,
      }));

    const criticalCount = depletedInventory.filter((p) => p.stock <= 0).length;

    // Hourly Curve
    const hourlyData = Object.entries(hourlyMap).map(([h, val]) => ({
      hour: `${h.padStart(2, "0")}:00`,
      sales: val,
    }));

    return NextResponse.json({
      summary: {
        grossRevenue,
        orderCount: orders.length,
        avgOrderValue: orders.length ? grossRevenue / orders.length : 0,
        cashCodRevenue,
        upiRevenue,
        posRevenue,
        posCount,
        deliveryRevenue,
        deliveryCount,
        pickupRevenue,
        pickupCount,
        criticalCount,
        marginEstimate: grossRevenue * 0.18, // 18% benchmark grocery margin
      },
      hourlyData,
      topSelling,
      depletedInventory,
    });
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
