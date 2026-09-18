import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [products, orders, lowStock, customers] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } })
  ]);

  return (
    <main className="container">
      <h1>Admin Dashboard</h1>
      <p className="muted">Role-protected production authentication should be enabled before public launch.</p>
      <div className="grid">
        <div className="card"><h3>Products</h3><div className="price">{products}</div></div>
        <div className="card"><h3>Orders</h3><div className="price">{orders}</div></div>
        <div className="card"><h3>Low stock items</h3><div className="price">{lowStock}</div></div>
        <div className="card"><h3>Customers</h3><div className="price">{customers}</div></div>
      </div>
    </main>
  );
}
