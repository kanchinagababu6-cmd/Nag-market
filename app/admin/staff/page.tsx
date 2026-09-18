import { PrismaClient, Role } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

async function createStaffUser(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session || (session.role !== "OWNER" && session.role !== "MANAGER")) {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  if (!name || !email || !password || !role) return;

  await prisma.user.upsert({
    where: { email },
    update: { name, password, role },
    create: { name, email, password, role },
  });

  revalidatePath("/admin/staff");
}

export default async function StaffManagementPage() {
  const session = await getSession();

  if (!session || (session.role !== "OWNER" && session.role !== "MANAGER")) {
    redirect("/");
  }

  const staffMembers = await prisma.user.findMany({
    where: {
      role: { in: ["OWNER", "MANAGER", "SALES_BOY", "DELIVERY_AGENT"] },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Staff Credential Provisioning</h1>
        <p className="text-xs text-slate-400 mt-1">
          Issue authorized logins for Counter Sales Boys, Delivery Agents, and Store Managers.
        </p>
      </div>

      {/* Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-white mb-3">Add New Supermarket Employee</h2>
        <form action={createStaffUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Work Email"
            required
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Assign Password"
            required
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
          />
          <select
            name="role"
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
          >
            <option value="SALES_BOY">Sales Boy (POS & Stock)</option>
            <option value="DELIVERY_AGENT">Delivery Agent</option>
            <option value="MANAGER">Manager</option>
          </select>

          <div className="sm:col-span-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition"
            >
              Issue Credentials
            </button>
          </div>
        </form>
      </div>

      {/* Active Staff List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h2 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">Active Supermarket Staff</h2>
        <div className="divide-y divide-slate-800/60 text-xs">
          {staffMembers.map((member) => (
            <div key={member.id} className="py-2.5 flex justify-between items-center">
              <div>
                <span className="font-semibold text-white">{member.name}</span>
                <span className="text-slate-500 ml-2 font-mono text-[11px]">{member.email}</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md border border-slate-700 bg-slate-800 text-slate-300">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
