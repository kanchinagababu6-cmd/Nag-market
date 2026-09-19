"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
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

  const fetchDeliveries = async () => {
    try {
      const res = await fetch("/api/orders/user?all=true");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Strict filter: Exclude POS bills and Store Pickups
        const deliveryOrders = data.filter((o) => {
          const addr = (o.deliveryAddress || "").trim().toLowerCase();
          const pay = (o.paymentMethod || "").trim().toLowerCase();

          // 1. Must NOT be POS or counter sale
          const isPos = pay.includes("pos") || addr.includes("pos") || addr.includes("counter");

          // 2. Must NOT be Store Pickup
          const isPickup =
            pay.includes("pickup") ||
            addr.includes("pickup") ||
            addr === "store pickup" ||
            addr === "";

          // 3. Must have an actual home delivery address
          const isHomeDelivery = !isPos && !isPickup;

          // 4. Must be active for delivery (not already finished or cancelled)
          const isActiveStatus =
            o.status === "PACKED" ||
            o.status === "OUT_FOR_DELIVERY" ||
            o.status === "ORDER_PLACED";

          return isHomeDelivery && isActiveStatus;
        });

        setOrders(deliveryOrders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 8000);
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
        if (status === "COMPLETED") {
          setOrders((prev) => prev.filter((o) => o.id !== id));
        } else {
          setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
        }
      }
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 text-slate-100">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            🛵 Delivery Dispatch Hub
          </h1>
          <p className="text-xs text-slate-400">Home delivery orders only (POS & Pickups excluded)</p>
        </div>
        <Link
          href="/"
          className="text-xs px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
        >
          ← Workstation
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-500 text-xs py-8 font-mono">Loading deliveries...</p>
        ) : orders.length === 0 ? (
          <div className="p-10 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-500 text-xs font-mono">
            🎉 No home delivery orders waiting right now.
          </div>
        ) : (
          orders.map((order) => {
            const encodedAddr = encodeURIComponent(order.deliveryAddress || "");
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddr}`;
            const waUrl = `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(
              `Hello ${order.customerName}, your Nag Market order #${order.id.slice(0, 6).toUpperCase()} is out for delivery!`
            )}`;

            return (
              <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs">
                  <span className="font-mono text-blue-400 font-bold">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === "OUT_FOR_DELIVERY"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {order.status === "OUT_FOR_DELIVERY" ? "ON THE WAY" : "READY FOR PICKUP"}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{order.customerName}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ₹{order.totalAmount.toFixed(2)} ({order.paymentMethod})
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">🏠 {order.deliveryAddress}</p>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                  {order.items?.map((it) => (
                    <div key={it.id} className="flex justify-between py-0.5 text-slate-300">
                      <span>{it.product?.name || "Item"} ×{it.quantity}</span>
                      <span className="text-emerald-400">₹{(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold"
                  >
                    🗺️ Maps
                  </a>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold"
                  >
                    💬 WhatsApp
                  </a>

                  <div className="ml-auto">
                    {order.status !== "OUT_FOR_DELIVERY" ? (
                      <button
                        onClick={() => updateStatus(order.id, "OUT_FOR_DELIVERY")}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow"
                      >
                        🛵 Pick Up Order
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(order.id, "COMPLETED")}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
                      >
                        ✓ Delivery Completed
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
