import { Bell, Search, User } from 'lucide-react'

export default function TopNav({ title }: { title: string }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-md px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input className="bg-transparent text-sm outline-none w-48" placeholder="Search..." />
        </div>
        <button className="p-2 rounded-md hover:bg-slate-100 text-slate-600" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">A</div>
          <span className="hidden sm:block text-sm text-slate-700">Admin</span>
          <User size={16} className="text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  )
}