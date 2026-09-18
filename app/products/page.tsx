import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { name: "asc" }
  });

  return (
    <>
      <nav className="nav"><strong><Link href="/">Supermarket</Link></strong><Link href="/products">Products</Link></nav>
      <main className="container">
        <h1>Products</h1>
        <div className="grid">
          {products.map(p => (
            <article className="card" key={p.id}>
              <span className="badge">{p.category.name}</span>
              <h3>{p.name}</h3>
              <p className="muted">{p.description ?? "Quality supermarket product"}</p>
              <div className="price">₹{Number(p.price).toFixed(2)}</div>
              <p>Available: {p.stock}</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
