import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Default Owner Account
  const owner = await prisma.user.upsert({
    where: { email: "owner@supermarket.com" },
    update: {},
    create: {
      name: "Supermarket Owner",
      email: "owner@supermarket.com",
      password: "adminpassword123",
      role: "OWNER",
      phone: "9988776655",
    },
  });
  console.log("Owner created:", owner.email);

  // 2. Create Default Sales Boy Account
  await prisma.user.upsert({
    where: { email: "sales@supermarket.com" },
    update: {},
    create: {
      name: "Ramesh (POS Counter)",
      email: "sales@supermarket.com",
      password: "salespassword123",
      role: "SALES_BOY",
      phone: "9876543210",
    },
  });

  // 3. Create Default Delivery Agent Account
  await prisma.user.upsert({
    where: { email: "delivery@supermarket.com" },
    update: {},
    create: {
      name: "Suresh (Delivery)",
      email: "delivery@supermarket.com",
      password: "deliverypassword123",
      role: "DELIVERY_AGENT",
      phone: "9123456780",
    },
  });

  // 4. Seed Inventory Products with Barcodes
  const sampleProducts = [
    {
      name: "Basmati Rice 5kg",
      barcode: "8901234567890",
      price: 450.0,
      stock: 40,
      category: "Grains",
    },
    {
      name: "Sunflower Cooking Oil 1L",
      barcode: "8901234567891",
      price: 135.0,
      stock: 60,
      category: "Oils",
    },
    {
      name: "Whole Wheat Atta 10kg",
      barcode: "8901234567892",
      price: 380.0,
      stock: 25,
      category: "Flour",
    },
    {
      name: "Toor Dal 1kg",
      barcode: "8901234567893",
      price: 160.0,
      stock: 50,
      category: "Pulses",
    },
    {
      name: "Sugar 1kg",
      barcode: "8901234567894",
      price: 45.0,
      stock: 100,
      category: "Essentials",
    },
    {
      name: "Milk Packet 500ml",
      barcode: "8901234567895",
      price: 28.0,
      stock: 80,
      category: "Dairy",
    },
  ];

  for (const item of sampleProducts) {
    await prisma.product.upsert({
      where: { barcode: item.barcode },
      update: { stock: item.stock, price: item.price },
      create: item,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
