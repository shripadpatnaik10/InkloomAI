import type { ReactNode } from 'react'
import Card from './Card'

interface MetricCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
}

export default function MetricCard({ label, value, hint, icon }: MetricCardProps) {
  return (
    <Card className="p-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
        {icon && <div className="text-blue-600">{icon}</div>}
      </div>
    </Card>
  )
}