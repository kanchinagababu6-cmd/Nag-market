import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Product Inventory</h1>
            <p className="text-xs text-slate-400">All available catalog items</p>
          </div>
          <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl font-mono">
            Total: {products.length}
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] text-blue-400 uppercase font-mono font-bold tracking-wider">
                  {product.category}
                </span>
                <h3 className="text-base font-semibold text-white mt-1">{product.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Barcode: {product.barcode}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60 flex justify-between items-center">
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  ₹{product.price.toFixed(2)}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    product.stock > 0
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
