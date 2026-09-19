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
  status: "PENDING" | "PACKED" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/user?all=true");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error("Error fetching store orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh orders every 10 seconds for real-time order alerts
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o))
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error updating order status");
    }
  };

  const filteredOrders = orders.filter((o) =>
    filterStatus === "ALL" ? true : o.status === filterStatus
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-white">🛍️ Live Customer Store Orders</h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <p className="text-xs text-slate-400">Incoming online storefront orders (auto-syncs every 10s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs border border-slate-700"
          >
            🔄 Refresh
          </button>
          <Link
            href="/"
            className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700"
          >
            ← Home
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {["ALL", "PENDING", "PACKED", "OUT_FOR_DELIVERY", "COMPLETED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
              filterStatus === st
                ? "bg-blue-600 text-white"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            {st} ({orders.filter((o) => (st === "ALL" ? true : o.status === st)).length})
          </button>
        ))}
      </div>

      {/* Orders Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-xs font-mono">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500 text-xs font-mono">
            No customer orders under status "{filterStatus}".
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/80 pb-2.5">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-400">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-slate-400 text-xs ml-2">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    💳 {order.paymentMethod}
                  </span>
                  <span
                    className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold ${
                      order.status === "PENDING"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : order.status === "COMPLETED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Customer Details & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Customer: </span>
                  <span className="font-bold text-white">{order.customerName}</span>
                  <div className="text-slate-400 mt-0.5">
                    Phone:{" "}
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="text-blue-400 font-mono underline hover:text-blue-300"
                    >
                      {order.customerPhone}
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Delivery Address: </span>
                  <p className="text-slate-300 font-mono mt-0.5 line-clamp-2">
                    {order.deliveryAddress || "Store Pickup / Not Specified"}
                  </p>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800/80">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[10px] font-mono text-slate-500 border-b border-slate-900 pb-1">
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono text-slate-300">
                    {order.items?.map((it) => (
                      <tr key={it.id} className="py-1">
                        <td className="py-1 text-white font-sans truncate max-w-[200px]">
                          {it.product?.name || "Grocery Item"}
                        </td>
                        <td className="py-1">×{it.quantity}</td>
                        <td className="py-1">₹{it.price.toFixed(2)}</td>
                        <td className="py-1 text-right text-emerald-400 font-bold">
                          ₹{(it.quantity * it.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                <div className="text-xs font-mono">
                  <span className="text-slate-400">Bill Total: </span>
                  <span className="text-emerald-400 font-bold text-sm">₹{order.totalAmount.toFixed(2)}</span>
                </div>

                {/* Status Updater Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "PACKED")}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg shadow"
                    >
                      📦 Mark Packed
                    </button>
                  )}
                  {order.status === "PACKED" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "OUT_FOR_DELIVERY")}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow"
                    >
                      🛵 Out for Delivery
                    </button>
                  )}
                  {order.status === "OUT_FOR_DELIVERY" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow"
                    >
                      ✓ Mark Delivered
                    </button>
                  )}
                  <a
                    href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello ${order.customerName}, your Nag Supermarket order #${order.id
                        .slice(0, 8)
                        .toUpperCase()} (₹${order.totalAmount.toFixed(2)}) is${order.status.toLowerCase()}!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-slate-800 text-emerald-400 hover:text-white rounded-lg text-xs border border-slate-700"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
              
