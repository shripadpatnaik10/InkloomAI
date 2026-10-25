import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, BarChart3, BookOpen, CheckCircle2, MessageSquare, Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/review', label: 'Content Review', icon: FileText },
  { to: '/scorecard', label: 'Scorecard', icon: BarChart3 },
  { to: '/guidelines', label: 'Brand Knowledge Hub', icon: BookOpen },
  { to: '/approval', label: 'Approval Center', icon: CheckCircle2 },
  { to: '/feedback', label: 'Feedback & Insights', icon: MessageSquare },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white border border-slate-200 rounded-md p-2 shadow"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div>
            <p className="text-lg font-bold">Inkloom AI</p>
            <p className="text-xs text-slate-400">Brand Governance</p>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-500">
          Demo data only. No backend connected.
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  )
}