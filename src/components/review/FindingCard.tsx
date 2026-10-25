import { Check, Copy, X } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import type { Finding } from '../../types/review'

interface Props {
  finding: Finding
  onAccept: (finding: Finding) => void
  onDismiss: (finding: Finding) => void
  onResolve: (finding: Finding) => void
}

const severityVariant = (s: Finding['severity']): 'danger' | 'warning' | 'default' | 'info' => {
  if (s === 'critical' || s === 'high') return 'danger'
  if (s === 'medium') return 'warning'
  return 'default'
}

export default function FindingCard({ finding, onAccept, onDismiss, onResolve }: Props) {
  const copySuggestion = async () => {
    if (!finding.suggestedReplacement) return
    try {
      await navigator.clipboard.writeText(finding.suggestedReplacement)
    } catch {
      // ignore
    }
  }

  return (
    <div className="border border-slate-200 rounded-md p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">{finding.title}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="info">{finding.category}</Badge>
            <Badge variant={severityVariant(finding.severity)}>{finding.severity}</Badge>
            <Badge variant={finding.status === 'accepted' || finding.status === 'resolved' ? 'success' : finding.status === 'dismissed' ? 'default' : 'warning'}>
              {finding.status}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-sm text-slate-700 bg-slate-50 rounded p-2">
        <span className="font-medium">Matched text:</span> <span className="text-red-600">{finding.matchedText}</span>
      </div>
      {finding.excerpt && <p className="text-xs text-slate-500">Context: {finding.excerpt}</p>}
      <p className="text-sm text-slate-700">{finding.explanation}</p>
      <p className="text-sm text-slate-700"><span className="font-medium">Recommendation:</span> {finding.recommendation}</p>
      {finding.sourceRuleTitle && (
        <p className="text-xs text-slate-500"><span className="font-medium">Source rule:</span> {finding.sourceRuleTitle}</p>
      )}
      {finding.dismissalReason && (
        <p className="text-xs text-slate-500"><span className="font-medium">Dismissal reason:</span> {finding.dismissalReason}</p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {finding.status === 'open' && (
          <>
            <Button size="sm" onClick={() => onAccept(finding)}><Check size={14} /> Accept</Button>
            <Button size="sm" variant="secondary" onClick={() => onDismiss(finding)}><X size={14} /> Dismiss</Button>
            <Button size="sm" variant="ghost" onClick={() => onResolve(finding)}>Mark resolved</Button>
          </>
        )}
        {finding.suggestedReplacement && (
          <Button size="sm" variant="ghost" onClick={copySuggestion}><Copy size={14} /> Copy suggestion</Button>
        )}
      </div>
    </div>
  )
}