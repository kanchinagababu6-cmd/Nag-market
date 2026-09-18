import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    ["Groceries", "groceries"],
    ["Dairy", "dairy"],
    ["Beverages", "beverages"],
    ["Snacks", "snacks"]
  ];

  for (const [name, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug }
    });
  }

  const grocery = await prisma.category.findUniqueOrThrow({ where: { slug: "groceries" } });

  const products = [
    { sku: "RICE001", barcode: "890000000001", name: "Premium Rice 5kg", slug: "premium-rice-5kg", mrp: 420, sellingPrice: 395, purchasePrice: 350, gstRate: 5, stock: 50 },
    { sku: "OIL001", barcode: "890000000002", name: "Sunflower Oil 1L", slug: "sunflower-oil-1l", mrp: 160, sellingPrice: 145, purchasePrice: 125, gstRate: 5, stock: 40 },
    { sku: "DAL001", barcode: "890000000003", name: "Toor Dal 1kg", slug: "toor-dal-1kg", mrp: 180, sellingPrice: 165, purchasePrice: 140, gstRate: 5, stock: 35 }
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        barcode: p.barcode,
        name: p.name,
        slug: p.slug,
        mrp: p.mrp,
        sellingPrice: p.sellingPrice,
        purchasePrice: p.purchasePrice,
        gstRate: p.gstRate,
        categoryId: grocery.id
      }
    });

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id, quantity: p.stock }
    });
  }

  const demoUsers = [
    ["admin@example.com", "Demo Admin", UserRole.ADMIN],
    ["cashier@example.com", "Demo Cashier", UserRole.CASHIER],
    ["delivery@example.com", "Demo Delivery", UserRole.DELIVERY],
    ["customer@example.com", "Demo Customer", UserRole.CUSTOMER]
  ] as const;

  for (const [email, name, role] of demoUsers) {
    await prisma.user.upsert({
      where: { email },
      update: { role },
      create: { email, name, role }
    });
  }
}

main().finally(() => prisma.$disconnect());
