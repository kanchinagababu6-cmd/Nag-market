import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 12
  });

  return (
    <>
      <nav className="nav">
        <strong>Supermarket</strong>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/cashier">POS</Link>
          <Link href="/delivery">Delivery</Link>
        </div>
      </nav>
      <main className="container">
        <section className="hero">
          <span className="badge">Online Store + POS + Inventory</span>
          <h1>Fresh groceries, managed from one system.</h1>
          <p className="muted">A shared inventory foundation for online orders and store operations.</p>
          <Link className="button" href="/products">Shop products</Link>
        </section>
        <h2>Featured products</h2>
        <div className="grid">
          {products.map(p => (
            <article className="card" key={p.id}>
              <span className="badge">{p.category.name}</span>
              <h3>{p.name}</h3>
              {p.barcode && <p className="muted">Barcode: {p.barcode}</p>}
              <div className="price">₹{Number(p.price).toFixed(2)}</div>
              <p className="muted">Stock: {p.stock}</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
