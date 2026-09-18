import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, barcode, price, stock, category, subCategory, imageUrl } = body;

    if (!name || !barcode) {
      return NextResponse.json({ error: "Name and Barcode are required" }, { status: 400 });
    }

    const product = await prisma.product.upsert({
      where: { barcode: String(barcode).trim() },
      update: {
        name: String(name).trim(),
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        category: category || "Staples & Grains",
        subCategory: subCategory || "Atta, Flours & Sooji",
        imageUrl: imageUrl || null,
      },
      create: {
        barcode: String(barcode).trim(),
        name: String(name).trim(),
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        category: category || "Staples & Grains",
        subCategory: subCategory || "Atta, Flours & Sooji",
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Save product error:", error);
    return NextResponse.json({ error: error.message || "Failed to save product" }, { status: 500 });
  }
}
