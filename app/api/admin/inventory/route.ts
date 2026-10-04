import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, barcode, category, subCategory, mrp, discount, price, stock, imageUrl } = body;

    if (!name || !barcode) {
      return NextResponse.json({ error: "Name and Barcode are required" }, { status: 400 });
    }

    const product = await prisma.product.upsert({
      where: { barcode: String(barcode).trim() },
      update: {
        name,
        category,
        subCategory,
        mrp: parseFloat(mrp) || 0,
        discount: parseFloat(discount) || 0,
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        imageUrl: imageUrl || null,
      },
      create: {
        name,
        barcode: String(barcode).trim(),
        category,
        subCategory,
        mrp: parseFloat(mrp) || 0,
        discount: parseFloat(discount) || 0,
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(product);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save product" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { barcode, stock } = body;

    if (!barcode) {
      return NextResponse.json({ error: "Barcode required" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { barcode: String(barcode).trim() },
      data: { stock: parseInt(stock, 10) },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Stock update failed" }, { status: 500 });
  }
}
