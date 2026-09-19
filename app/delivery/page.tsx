"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items?: {
    id: string;
    quantity: number;
    price: number;
    product?: { name: string };
  }[];
}

export default function DeliveryDispatchHub() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/user?all=true");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Show orders that need delivery or are on the move
        const deliveryList = data.filter(
          (o) => o.status === "PACKED" || o.status === "OUT_FOR_DELIVERY" || o.status === "PENDING"
        );
        setOrders(deliveryList);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
      } else {
        alert("Failed to update status");
      }
    } catch {
      alert("Error updating order status");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 text-slate-100">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">🛵 Delivery Dispatch Hub</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-xs text-slate-400">Live delivery queue & rapid dispatch</p>
        </div>
        <Link
          href="/"
          className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
        >
          ← Workstation
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            Loading active deliveries...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-500 text-xs font-mono">
            🎉 No orders pending delivery right now.
          </div>
        ) : (
          orders.map((order) => {
            const encodedAddress = encodeURIComponent(order.deliveryAddress || "");
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            const whatsappUrl = `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(
              `Hello ${order.customerName}, your grocery order #${order.id.slice(0, 6).toUpperCase()} from Nag Market is on its way!`
            )}`;

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-400">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-2">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === "OUT_FOR_DELIVERY"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-sm">{order.customerName}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ₹{order.totalAmount.toFixed(2)} ({order.paymentMethod})
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">{order.deliveryAddress || "Address not provided"}</p>
                </div>

                {/* 1-Tap Quick Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                  {order.deliveryAddress && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      🗺️ Google Maps
                    </a>
                  )}
                  {order.customerPhone && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      💬 WhatsApp
                    </a>
                  )}

                  <div className="ml-auto flex gap-2">
                    {order.status !== "OUT_FOR_DELIVERY" ? (
                      <button
                        onClick={() => updateStatus(order.id, "OUT_FOR_DELIVERY")}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow"
                      >
                        Start Delivery →
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(order.id, "COMPLETED")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
                      >
                        ✓ Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
