import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function updateOrderStatus(formData: FormData) {
  "use server";
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;

  if (!orderId || !status) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/delivery");
}

export default async function DeliveryPage() {
  const session = await getSession();

  if (!session || !["OWNER", "MANAGER", "DELIVERY_AGENT"].includes(session.role)) {
    redirect("/login");
  }

  // Fetch real incoming online customer orders with line items
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ORDER_PLACED":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "PACKED":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "DELIVERED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white">🛵 Delivery Logistics & Dispatch Hub</h1>
          <p className="text-xs text-slate-400">
            Real-time customer online orders, navigation routes, and fulfillment
          </p>
        </div>
        <Link
          href="/"
          className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700"
        >
          ← Home
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            No customer deliveries pending right now.
          </div>
        ) : (
          orders.map((order) => {
            // Clean phone for WhatsApp/Calls
            const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
            const encodedAddress = encodeURIComponent(order.deliveryAddress);
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
              order.customerName
            )},%20I%20am%20your%20Nag%20Market%20delivery%20partner%20for%20order%20%23${order.id.slice(
              0,
              6
            )}.`;

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-blue-400 font-bold">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base mt-1">{order.customerName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      📍 {order.deliveryAddress}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base font-mono font-black text-emerald-400">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] block font-mono text-slate-400">
                      Payment: {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="bg-slate-950 p-3 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Basket Summary:
                  </div>
                  <div className="divide-y divide-slate-900 text-xs text-slate-300">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-1 flex justify-between">
                        <span>
                          {item.product.name}{" "}
                          <span className="text-blue-400 font-mono font-bold">× {item.quantity}</span>
                        </span>
                        <span className="font-mono text-slate-400">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistics Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {/* Communication & Maps */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition"
                    >
                      📞 Call
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
                    >
                      💬 WhatsApp
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition"
                    >
                      🗺️ Map Route
                    </a>
                  </div>

                  {/* Status Change Form */}
                  <form action={updateOrderStatus} className="flex items-center gap-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none"
                    >
                      <option value="ORDER_PLACED">Order Placed</option>
                      <option value="PACKED">Packed & Ready</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Update
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
        }
        
