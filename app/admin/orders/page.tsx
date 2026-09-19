"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { name: string };
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

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/user?all=true");
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      }
    } catch {
      alert("Error updating order status");
    }
  };

  const filtered = orders.filter((o) => (filter === "ALL" ? true : o.status === filter));

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            🛍️ Live Customer Store Orders
          </h1>
          <p className="text-xs text-slate-400">Incoming online storefront orders (auto-syncs)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
          >
            🔄 Refresh
          </button>
          <Link
            href="/"
            className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
          >
            ← Home
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {["ALL", "ORDER_PLACED", "PACKED", "OUT_FOR_DELIVERY", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
              filter === tab
                ? "bg-blue-600 text-white"
                : "bg-slate-900 text-slate-400 border border-slate-800"
            }`}
          >
            {tab} ({orders.filter((o) => (tab === "ALL" ? true : o.status === tab)).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-500 text-xs py-8 font-mono">Loading orders...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 text-xs py-8 font-mono bg-slate-900 border border-slate-800 rounded-2xl">
            No orders under {filter}
          </p>
        ) : (
          filtered.map((order) => {
            const isDelivery =
              order.deliveryAddress &&
              order.deliveryAddress.trim().toLowerCase() !== "store pickup" &&
              order.deliveryAddress.trim().toLowerCase() !== "pickup";

            return (
              <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-blue-400 font-bold">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300">
                      💳 {order.paymentMethod} {isDelivery ? "(DELIVERY)" : "(PICKUP)"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-slate-400">Customer: </span>
                    <strong className="text-white">{order.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone: </span>
                    <span className="font-mono text-slate-300">{order.customerPhone}</span>
                  </div>
                  {isDelivery && (
                    <div>
                      <span className="text-slate-400">Delivery Address: </span>
                      <span className="text-white font-semibold">{order.deliveryAddress}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80 text-xs font-mono">
                  {order.items?.map((it) => (
                    <div key={it.id} className="flex justify-between py-0.5 text-slate-300">
                      <span>{it.product?.name || "Item"} ×{it.quantity}</span>
                      <span className="text-emerald-400">₹{(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-slate-800 mt-1 pt-1 font-bold">
                    <span className="text-slate-400">Bill Total:</span>
                    <span className="text-emerald-400">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Store Action: Pack & Send to Delivery */}
                <div className="flex gap-2 justify-end pt-1">
                  {order.customerPhone && (
                    <a
                      href={`https://wa.me/91${order.customerPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-500/30"
                    >
                      💬 WhatsApp
                    </a>
                  )}

                  {order.status === "ORDER_PLACED" && (
                    <button
                      onClick={() => updateStatus(order.id, "PACKED")}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow"
                    >
                      📦 Mark Packed & Ready
                    </button>
                  )}
                  {order.status === "PACKED" && (
                    <span className="text-xs text-amber-400 font-semibold px-2 py-1 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      Waiting for Delivery Pickup 🛵
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
