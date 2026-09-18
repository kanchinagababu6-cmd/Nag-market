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
    { barcode: "890000000001", name: "Premium Rice 5kg", slug: "premium-rice-5kg", price: 395, costPrice: 350, stock: 50 },
    { barcode: "890000000002", name: "Sunflower Oil 1L", slug: "sunflower-oil-1l", price: 145, costPrice: 125, stock: 40 },
    { barcode: "890000000003", name: "Toor Dal 1kg", slug: "toor-dal-1kg", price: 165, costPrice: 140, stock: 35 }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        stock: p.stock,
        price: p.price,
        costPrice: p.costPrice
      },
      create: {
        barcode: p.barcode,
        name: p.name,
        slug: p.slug,
        price: p.price,
        costPrice: p.costPrice,
        stock: p.stock,
        categoryId: grocery.id
      }
    });
  }

  const demoUsers = [
    ["admin@example.com", "Demo Admin", UserRole.ADMIN],
    ["staff@example.com", "Demo Staff", UserRole.STAFF],
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
