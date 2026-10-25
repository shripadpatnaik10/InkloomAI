import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { REVIEW_CONTENT_TYPE_LABELS } from '../../types/review'
import type { ReviewRecord } from '../../types/review'

interface Props {
  history: ReviewRecord[]
  onReopen: (review: ReviewRecord) => void
}

export default function ReviewHistory({ history, onReopen }: Props) {
  if (history.length === 0) {
    return (
      <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-md p-4">
        No previous reviews in this session yet.
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="py-2 pr-3">Title</th>
            <th className="py-2 pr-3">Type</th>
            <th className="py-2 pr-3">Date</th>
            <th className="py-2 pr-3">Score</th>
            <th className="py-2 pr-3">Unresolved C/H</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map((r) => (
            <tr key={r.id} className="border-b border-slate-100">
              <td className="py-2 pr-3 font-medium text-slate-900">{r.title || 'Untitled review'}</td>
              <td className="py-2 pr-3">{REVIEW_CONTENT_TYPE_LABELS[r.contentType]}</td>
              <td className="py-2 pr-3">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="py-2 pr-3">{r.score}/100</td>
              <td className="py-2 pr-3">{r.unresolvedCritical + r.unresolvedHigh}</td>
              <td className="py-2 pr-3">
                <Badge variant={r.status === 'awaiting-approval' ? 'warning' : r.status === 'reviewed' ? 'success' : 'default'}>
                  {r.status}
                </Badge>
              </td>
              <td className="py-2">
                <Button size="sm" variant="ghost" onClick={() => onReopen(r)}>Reopen</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}