import { PrismaClient, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function createStaffUser(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const phone = formData.get("phone") as string;

  if (!name || !email || !password || !role) return;

  await prisma.user.create({
    data: {
      name,
      email,
      password,
      role,
      phone: phone || null,
    },
  });

  revalidatePath("/admin/staff");
}

async function updateStaffRole(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as Role;

  if (!userId || !newRole) return;

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin/staff");
}

export default async function AdminStaffPage() {
  const staffMembers = await prisma.user.findMany({
    where: {
      role: { in: ["OWNER", "MANAGER", "SALES_BOY", "DELIVERY_AGENT"] },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Permissions</h1>
          <p className="text-sm text-slate-500">Create staff logins and assign access to POS, Delivery, or Admin.</p>
        </div>

        {/* Add Staff Form */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Add New Team Member</h2>
          <form action={createStaffUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              required
              className="border border-slate-300 p-2.5 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              name="email"
              type="email"
              placeholder="Login Email"
              required
              className="border border-slate-300 p-2.5 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              name="password"
              type="password"
              placeholder="Login Password"
              required
              className="border border-slate-300 p-2.5 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              name="phone"
              type="text"
              placeholder="Phone (Delivery/Contact)"
              className="border border-slate-300 p-2.5 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              name="role"
              required
              className="border border-slate-300 p-2.5 rounded-lg text-slate-900 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="SALES_BOY">Sales Boy (POS Counter)</option>
              <option value="DELIVERY_AGENT">Delivery Agent (Orders & Map)</option>
              <option value="MANAGER">Manager (Stock & Ops)</option>
              <option value="OWNER">Owner (Full System Access)</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition"
            >
              Save & Authorize Staff
            </button>
          </form>
        </section>

        {/* Staff Table */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Active Staff Accounts ({staffMembers.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Update Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      No staff accounts added yet.
                    </td>
                  </tr>
                ) : (
                  staffMembers.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{staff.name}</td>
                      <td className="p-3">{staff.email}</td>
                      <td className="p-3">{staff.phone || "—"}</td>
                      <td className="p-3">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded text-xs font-semibold">
                          {staff.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <form action={updateStaffRole} className="flex gap-2 items-center">
                          <input type="hidden" name="userId" value={staff.id} />
                          <select
                            name="role"
                            defaultValue={staff.role}
                            className="border border-slate-300 p-1.5 text-xs rounded bg-white text-slate-800"
                          >
                            <option value="SALES_BOY">SALES_BOY</option>
                            <option value="DELIVERY_AGENT">DELIVERY_AGENT</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="OWNER">OWNER</option>
                          </select>
                          <button
                            type="submit"
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded transition"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
