import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const product = await prisma.product.upsert({
      where: { barcode: data.barcode },
      update: {
        name: data.name,
        price: data.price,
        stock: data.stock,
        category: data.category,
        subCategory: data.subCategory,
        imageUrl: data.imageUrl,
      },
      create: {
        barcode: data.barcode,
        name: data.name,
        price: data.price,
        stock: data.stock,
        category: data.category,
        subCategory: data.subCategory,
        imageUrl: data.imageUrl,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 });
  }
}
