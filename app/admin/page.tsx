import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [products, orders, lowStock, customers] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  return (
    <main className="container">
      <h1>Admin Dashboard</h1>
      <p className="muted">Role-protected product & order management</p>
      <div className="grid">
        <div className="card">
          <h3>Products</h3>
          <p className="stat">{products}</p>
        </div>
        <div className="card">
          <h3>Orders</h3>
          <p className="stat">{orders}</p>
        </div>
        <div className="card">
          <h3>Low stock items</h3>
          <p className="stat">{lowStock}</p>
        </div>
        <div className="card">
          <h3>Customers</h3>
          <p className="stat">{customers}</p>
        </div>
      </div>
    </main>
  );
}
