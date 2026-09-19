"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { name: string };
}

interface CustomerOrder {
  id: string;
  deliveryAddress: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export default function CustomerOrderHistoryPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch("/api/orders/my");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ORDER_PLACED":
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">Order Placed</span>;
      case "PACKED":
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">Packed & Ready</span>;
      case "OUT_FOR_DELIVERY":
        return <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold animate-pulse">Out for Delivery 🛵</span>;
      case "COMPLETED":
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">Delivered ✓</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-5 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            📦 My Orders
          </h1>
          <p className="text-xs text-slate-400">Track current deliveries and view purchase history</p>
        </div>
        <Link
          href="/shop"
          className="text-xs px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
        >
          ← Store
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-500 text-xs py-8 font-mono">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-3">
            <span className="text-3xl">🛍️</span>
            <p className="text-xs text-slate-400">You haven't placed any orders yet.</p>
            <Link
              href="/shop"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs">
                <div>
                  <span className="font-mono text-blue-400 font-bold">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-2">
                    {new Date(order.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Items Breakdown */}
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 text-xs font-mono space-y-1">
                {order.items?.map((it) => (
                  <div key={it.id} className="flex justify-between py-0.5 text-slate-300">
                    <span>{it.product?.name || "Item"} ×{it.quantity}</span>
                    <span className="text-emerald-400 font-bold">₹{(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-800/80 mt-1 pt-1 font-bold">
                  <span className="text-slate-400">Total Paid ({order.paymentMethod}):</span>
                  <span className="text-emerald-400">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {order.deliveryAddress && (
                <p className="text-[11px] text-slate-400">
                  📍 <strong className="text-slate-300">Delivered to:</strong> {order.deliveryAddress}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
