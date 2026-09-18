import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

async function addProduct(formData: FormData) {
  "use server";

  const session = await getSession();
  const allowedRoles = ["OWNER", "MANAGER", "SALES_BOY"];

  if (!session || !allowedRoles.includes(session.role)) {
    throw new Error("Unauthorized to modify inventory");
  }

  const name = (formData.get("name") as string)?.trim();
  const barcode = (formData.get("barcode") as string)?.trim();
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10) || 0;
  const category = (formData.get("category") as string)?.trim() || "General";

  if (!name || !barcode || isNaN(price)) {
    return;
  }

  await prisma.product.upsert({
    where: { barcode },
    update: { name, price, stock, category },
    create: { name, barcode, price, stock, category },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/pos");
}

export default async function AdminProductsPage() {
  const session = await getSession();
  const allowedRoles = ["OWNER", "MANAGER", "SALES_BOY"];

  // Guard: Redirect unauthorized users back to home
  if (!session || !allowedRoles.includes(session.role)) {
    redirect("/");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const isSalesBoy = session.role === "SALES_BOY";

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            📦 Stock & Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isSalesBoy
              ? "Sales Desk Inventory: Quickly register barcodes, update stock, and adjust prices."
              : "Store Administration: Manage master catalog, barcodes, and inventory quantities."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-xl">
            Role: <strong className="text-blue-400">{session.role}</strong>
          </span>
          <span className="font-mono text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-1.5 rounded-xl">
            Items: {products.length}
          </span>
        </div>
      </div>

      {/* Add / Update Form */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>➕</span> Add or Update Barcode Item
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Existing barcode updates stock & price automatically
          </span>
        </div>

        <form action={addProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Basmati Rice 5kg"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Barcode / SKU *
            </label>
            <input
              type="text"
              name="barcode"
              placeholder="Scan or type barcode"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-xs font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <input
              type="text"
              name="category"
              placeholder="e.g. Dairy, Snacks"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Price (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              placeholder="0.00"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-xs font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              placeholder="0"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-white text-xs font-mono outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-5 flex justify-end mt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              Save Product
            </button>
          </div>
        </form>
      </section>

      {/* Real-Time Product List */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white">Current Inventory Status</h2>
          <span className="text-[11px] text-slate-400 font-mono">Live Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Barcode</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock Units</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No products added yet.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{item.barcode}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700/60">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.stock > 10
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : item.stock > 0
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
