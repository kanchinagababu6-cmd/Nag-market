<nav className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
  <Link href="/shop" className="px-2.5 py-1 text-slate-300 hover:text-white rounded-lg">
    Store
  </Link>
  <Link href="/pos" className="px-2.5 py-1 text-slate-300 hover:text-white rounded-lg">
    POS
  </Link>
  <Link href="/delivery" className="px-2.5 py-1 text-slate-300 hover:text-white rounded-lg">
    Delivery
  </Link>
  {session && ["OWNER", "MANAGER", "SALES_BOY"].includes(session.role) && (
    <Link href="/admin/products" className="px-2.5 py-1 text-emerald-400 hover:text-emerald-300 rounded-lg font-medium">
      Inventory
    </Link>
  )}
  {session && ["OWNER", "MANAGER"].includes(session.role) && (
    <Link href="/admin/staff" className="px-2.5 py-1 text-purple-400 hover:text-purple-300 rounded-lg font-medium">
      Staff
    </Link>
  )}
</nav>
