import { PrismaClient, OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function updateOrderStatus(formData: FormData) {
  "use server";
  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as OrderStatus;

  if (!orderId || !newStatus) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  revalidatePath("/delivery");
}

export default async function DeliveryPortalPage() {
  const activeOrders = await prisma.order.findMany({
    where: {
      type: "ONLINE",
      status: { in: ["PAID", "PREPARING", "OUT_FOR_DELIVERY"] },
    },
    include: {
      customer: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const completedToday = await prisma.order.count({
    where: {
      type: "ONLINE",
      status: "DELIVERED",
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              🛵 Delivery Agent Hub
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Live Online Order Dispatch & Routing</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-medium">
              Completed: {completedToday}
            </span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl font-medium">
              Pending: {activeOrders.length}
            </span>
          </div>
        </header>

        {/* Delivery Cards List */}
        <div className="space-y-4">
          {activeOrders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <p className="text-sm">No pending deliveries right now. All orders are fulfilled!</p>
            </div>
          ) : (
            activeOrders.map((order) => {
              const isOut = order.status === "OUT_FOR_DELIVERY";
              return (
                <div
                  key={order.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-xs text-slate-500 block">
                        ORDER #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <h2 className="text-lg font-bold text-white">
                        {order.customer?.name || "Customer"}
                      </h2>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        isOut
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Customer Info & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 uppercase font-semibold">Address</span>
                      <p className="text-slate-200">{order.deliveryAddress || "Address on record"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 uppercase font-semibold">Total Collection</span>
                      <p className="text-emerald-400 font-mono font-bold text-base">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 block mb-1.5 font-medium">
                      Packages ({order.items.length} items):
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="font-mono text-slate-400">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {/* Google Maps External Link */}
                    {order.deliveryAddress && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          order.deliveryAddress
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[130px] text-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-700 transition"
                      >
                        📍 Open Maps
                      </a>
                    )}

                    {/* Customer Call Button */}
                    {order.customer?.phone && (
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="flex-1 min-w-[130px] text-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-700 transition"
                      >
                        📞 Call Customer
                      </a>
                    )}

                    {/* One-click Status Toggle */}
                    {!isOut ? (
                      <form action={updateOrderStatus} className="flex-1 min-w-[140px]">
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="status" value="OUT_FOR_DELIVERY" />
                        <button
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2.5 px-3 rounded-xl transition"
                        >
                          Pick Up Order
                        </button>
                      </form>
                    ) : (
                      <form action={updateOrderStatus} className="flex-1 min-w-[140px]">
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="status" value="DELIVERED" />
                        <button
                          type="submit"
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold py-2.5 px-3 rounded-xl transition"
                        >
                          Mark Delivered ✓
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
