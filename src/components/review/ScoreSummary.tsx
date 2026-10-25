import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import type { EvaluationNote } from '../../types/review'

interface Props {
  score: number
  counts: { critical: number; high: number; medium: number; low: number }
  notes: EvaluationNote[]
}

export default function ScoreSummary({ score, counts, notes }: Props) {
  const critical = counts.critical
  return (
    <Card title="Brand compliance score">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-slate-900">{score}<span className="text-lg text-slate-400">/100</span></div>
          {critical > 0 && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm">
              <AlertTriangle size={16} />
              {critical} unresolved critical finding{critical > 1 ? 's' : ''} remain
            </div>
          )}
          {critical === 0 && score >= 80 && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-sm">
              <CheckCircle2 size={16} />
              No critical findings detected by current checks
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="danger">Critical: {counts.critical}</Badge>
          <Badge variant="danger">High: {counts.high}</Badge>
          <Badge variant="warning">Medium: {counts.medium}</Badge>
          <Badge variant="default">Low: {counts.low}</Badge>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Illustrative prototype metric. A high score never overrides unresolved critical findings.
      </p>
      <div className="mt-4 border-t border-slate-100 pt-3 space-y-1">
        {notes.map((n) => (
          <div key={n.label} className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">{n.label}</span>
            <span className={n.status === 'not-evaluated' ? 'text-amber-700' : 'text-slate-500'}>
              {n.status === 'not-evaluated' ? 'Not evaluated' : 'Evaluated'}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}