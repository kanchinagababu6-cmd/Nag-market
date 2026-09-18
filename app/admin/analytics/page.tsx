"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    barcode: string;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  stock: number;
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [timeFilter, setTimeFilter] = useState<"today" | "yesterday" | "7days" | "month" | "all">("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders/user?all=true"),
          fetch("/api/products"),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(productsData)) setProducts(productsData);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter orders by date range
  const filteredOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    const now = new Date();

    if (timeFilter === "today") {
      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }

    if (timeFilter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return (
        orderDate.getDate() === yesterday.getDate() &&
        orderDate.getMonth() === yesterday.getMonth() &&
        orderDate.getFullYear() === yesterday.getFullYear()
      );
    }

    if (timeFilter === "7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return orderDate >= sevenDaysAgo;
    }

    if (timeFilter === "month") {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }

    return true; // "all"
  });

  // Calculate dynamic financial metrics
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const upiRevenue = filteredOrders
    .filter((o) => o.paymentMethod.toUpperCase().includes("UPI"))
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const cashRevenue = filteredOrders
    .filter((o) => o.paymentMethod.toUpperCase().includes("CASH") || o.paymentMethod.toUpperCase().includes("COD"))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Low stock inventory warning (<= 5 units)
  const lowStockItems = products.filter((p) => p.stock <= 5);

  // Top moving products in filtered range
  const salesCountMap: Record<string, { name: string; qty: number; total: number }> = {};
  filteredOrders.forEach((o) => {
    o.items?.forEach((it) => {
      const pName = it.product?.name || "Product";
      if (!salesCountMap[pName]) {
        salesCountMap[pName] = { name: pName, qty: 0, total: 0 };
      }
      salesCountMap[pName].qty += it.quantity;
      salesCountMap[pName].total += it.price * it.quantity;
    });
  });

  const topSellers = Object.values(salesCountMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Export full filtered order dataset to Excel (.csv)
  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      alert("No transaction records available for this selected date filter.");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Time",
      "Customer Name",
      "Phone Number",
      "Delivery Address",
      "Payment Mode",
      "Fulfillment Status",
      "Billed Items (Qty x Price)",
      "Total Amount (INR)",
    ];

    const rows = filteredOrders.map((o) => {
      const dateObj = new Date(o.createdAt);
      const dateStr = dateObj.toLocaleDateString("en-IN");
      const timeStr = dateObj.toLocaleTimeString("en-IN");
      const itemsPurchased = o.items
        ?.map((it) => `${it.product?.name || "Item"} (${it.quantity} x Rs.${it.price})`)
        .join(" | ");

      return [
        `"${o.id}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerPhone}"`,
        `"${(o.deliveryAddress || "").replace(/"/g, '""')}"`,
        `"${o.paymentMethod}"`,
        `"${o.status}"`,
        `"${(itemsPurchased || "").replace(/"/g, '""')}"`,
        `"${o.totalAmount.toFixed(2)}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nag_Supermarket_Sales_${timeFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white">📊 Executive Business Analytics</h1>
          <p className="text-xs text-slate-400">Day-wise financial metrics, sales ledger & inventory warnings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <span>📥</span>
            <span>Export to Excel</span>
          </button>
          <Link
            href="/"
            className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700"
          >
            ← Home
          </Link>
        </div>
      </div>

      {/* Day-Wise Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "today", label: "Today" },
          { key: "yesterday", label: "Yesterday" },
          { key: "7days", label: "Last 7 Days" },
          { key: "month", label: "This Month" },
          { key: "all", label: "All Time" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTimeFilter(tab.key as any)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              timeFilter === tab.key
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Gross Revenue</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
            ₹{totalRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{filteredOrders.length} orders recorded</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Cash & COD</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-blue-400">
            ₹{cashRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Counter cash collections</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Digital UPI</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-400">
            ₹{upiRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Instant QR / Online pay</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Critical Low Stock</span>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">
            {lowStockItems.length} items
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Need store restock</span>
        </div>
      </div>

      {/* Low Stock & Fast Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Watch */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠️</span> Depleted Inventory (≤ 5 units)
            </h3>
            <span className="text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-lg">
              {lowStockItems.length} Products
            </span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-64 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                All inventory quantities are above minimum thresholds.
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-semibold text-white">{item.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500">{item.barcode} | {item.category}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${
                      item.stock === 0
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.stock === 0 ? "Out of Stock" : `${item.stock} left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Movers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔥</span> Best Selling Goods ({timeFilter})
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Top 5 by Volume</span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-64 overflow-y-auto">
            {topSellers.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-mono">
                No orders recorded for this period.
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
                      <span className="text-[10px] font-mono text-emerald-400">₹{s.total.toFixed(2)} sales</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {s.qty} units
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transaction Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Ledger ({filteredOrders.length} records in view)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Filtered: {timeFilter}</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Customer / Mode</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No transaction activity found for this date selection.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 text-blue-400 font-bold">#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-3 text-slate-400">{new Date(o.createdAt).toLocaleString("en-IN")}</td>
                  <td className="p-3 text-white font-sans font-medium">{o.customerName}</td>
                  <td className="p-3 text-slate-300">{o.paymentMethod}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-400">₹{o.totalAmount.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
