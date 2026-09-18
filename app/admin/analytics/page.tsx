import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session || (session.role !== "OWNER" && session.role !== "MANAGER")) {
    redirect("/login");
  }

  // 1. Fetch live orders & products
  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      orderBy: { stock: "asc" },
    }),
  ]);

  // 2. Financial totals
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const upiRevenue = orders
    .filter((o) => o.paymentMethod.includes("UPI"))
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const cashRevenue = orders
    .filter((o) => o.paymentMethod.includes("CASH") || o.paymentMethod.includes("COD"))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // 3. Low stock threshold (<= 5 units)
  const lowStockItems = products.filter((p) => p.stock <= 5);

  // 4. Calculate top sellers
  const salesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const pName = it.product?.name || "Unknown Item";
      if (!salesMap[pName]) {
        salesMap[pName] = { name: pName, qty: 0, revenue: 0 };
      }
      salesMap[pName].qty += it.quantity;
      salesMap[pName].revenue += it.price * it.quantity;
    });
  });

  const topSellers = Object.values(salesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white">📊 Store Business Intelligence</h1>
          <p className="text-xs text-slate-400">Live revenue metrics, payment modes, and replenishment warnings</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition"
          >
            📦 Restock
          </Link>
          <Link
            href="/"
            className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700"
          >
            ← Home
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Revenue</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
            ₹{totalRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{orders.length} lifetime orders</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Cash & COD</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-blue-400">
            ₹{cashRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Counter cash drawer</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Digital UPI</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-400">
            ₹{upiRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Direct bank transfers</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Stock Depletions</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">
            {lowStockItems.length} items
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Need supplier refill</span>
        </div>
      </div>

      {/* Main Grid: Low Stock & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Threshold Warning Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠️</span> Low Stock & Out of Stock Alerts
            </h3>
            <span className="text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-lg">
              {lowStockItems.length} Products
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                All catalog items have healthy stock levels.
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-semibold text-white">{item.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500">{item.barcode} | {item.category}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${item.stock === 0 ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                    {item.stock === 0 ? "Out of Stock" : `${item.stock} left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Moving Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔥</span> Fast-Moving Items (Sales Volume)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Top 5 Units</span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
            {topSellers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                No purchases recorded yet.
              </div>
            ) : (
              topSellers.map((s, idx) => (
                <div key={s.name} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white">{s.name}</h4>
                      <span className="text-[10px] font-mono text-emerald-400">₹{s.revenue.toFixed(2)} total sales</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {s.qty} units sold
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Master Transaction Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Consolidated Sales Ledger (POS Counter & Online Orders)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">{orders.length} entries</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer / Mode</th>
              <th className="p-3">Method</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {orders.slice(0, 10).map((o) => (
              <tr key={o.id}>
                <td className="p-3 text-blue-400 font-bold">#{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-3 text-white">{o.customerName}</td>
                <td className="p-3 text-slate-400">{o.paymentMethod}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    {o.status}
                  </span>
                </td>
                <td className="p-3 font-bold text-emerald-400">₹{o.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
    }
