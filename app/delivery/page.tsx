"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  orderType?: "DELIVERY" | "PICKUP";
}

export default function DeliveryDispatchHub() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "DELIVERY" | "PICKUP">("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetches orders available for fulfillment / dispatch
      const res = await fetch("/api/delivery/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load delivery orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      await fetchOrders();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper to determine whether an order is Home Delivery or Store Pickup
  const isPickupOrder = (order: Order) => {
    return (
      order.orderType === "PICKUP" ||
      order.deliveryAddress?.toLowerCase().includes("store pickup") ||
      order.deliveryAddress?.toLowerCase().includes("pickup")
    );
  };

  // Apply Home Delivery vs Store Pickup filter
  const filteredOrders = orders.filter((order) => {
    const isPickup = isPickupOrder(order);
    if (filterType === "DELIVERY") return !isPickup;
    if (filterType === "PICKUP") return isPickup;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛵</span>
              <h1 className="text-lg font-bold text-white">Delivery & Dispatch Hub</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live fulfillment queue for Home Delivery & Store Pickups
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              🔄 Refresh
            </button>
            <Link
              href="/"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              ← Workstation
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterType === "ALL"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilterType("DELIVERY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              filterType === "DELIVERY"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <span>🛵</span>
            <span>Home Delivery ({orders.filter((o) => !isPickupOrder(o)).length})</span>
          </button>
          <button
            onClick={() => setFilterType("PICKUP")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              filterType === "PICKUP"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <span>🏬</span>
            <span>Store Pickup ({orders.filter((o) => isPickupOrder(o)).length})</span>
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800">
            Loading dispatch queue...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800">
            No orders found under this filter.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredOrders.map((order) => {
              const pickup = isPickupOrder(order);

              return (
                <div
                  key={order.id}
                  className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4 space-y-3 shadow-sm"
                >
                  {/* Order Top Line */}
                  <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-400">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          pickup
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        }`}
                      >
                        {pickup ? "🏬 STORE PICKUP" : "🛵 HOME DELIVERY"}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {order.status}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                    <div>
                      <h3 className="font-bold text-white text-sm">{order.customerName}</h3>
                      <p className="text-slate-400 mt-0.5">
                        📍 {pickup ? "Store Counter Pickup" : order.deliveryAddress}
                      </p>
                    </div>
                    <div className="text-left sm:text-right font-mono">
                      <span className="text-emerald-400 font-bold text-sm block">
                        ₹{order.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Snippet */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/70 text-xs space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span>
                            {it.product?.name || "Item"} × {it.quantity}
                          </span>
                          <span className="font-mono text-slate-400">
                            ₹{(it.price * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2 text-xs">
                    {/* Customer WhatsApp Contact */}
                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/91${order.customerPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-xl font-semibold flex items-center gap-1 transition"
                      >
                        <span>💬 WhatsApp</span>
                      </a>
                    )}

                    {/* Home Delivery specific controls (Only for Home Delivery) */}
                    {!pickup ? (
                      <>
                        {/* Maps Link */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            order.deliveryAddress
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold flex items-center gap-1 transition"
                        >
                          <span>🗺️ Route Maps</span>
                        </a>

                        {/* Delivery Boy Dispatch Flow */}
                        {order.status !== "DELIVERED" && (
                          <button
                            disabled={updatingId === order.id}
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                order.status === "READY_FOR_PICKUP" || order.status === "ORDER_PLACED"
                                  ? "OUT_FOR_DELIVERY"
                                  : "DELIVERED"
                              )
                            }
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition shadow"
                          >
                            {updatingId === order.id
                              ? "Updating..."
                              : order.status === "READY_FOR_PICKUP" || order.status === "ORDER_PLACED"
                              ? "🛵 Pick Up Order"
                              : "✅ Mark Delivered"}
                          </button>
                        )}
                      </>
                    ) : (
                      /* Store Pickup specific fulfillment */
                      order.status !== "COMPLETED" && order.status !== "DELIVERED" && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl font-bold transition shadow"
                        >
                          {updatingId === order.id ? "Updating..." : "📦 Hand Over to Customer"}
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
                                                            }
                          
