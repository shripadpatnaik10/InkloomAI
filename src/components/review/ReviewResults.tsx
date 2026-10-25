import Card from '../ui/Card'
import { severityCounts } from '../../utils/analysis'
import FindingCard from './FindingCard'
import ScoreSummary from './ScoreSummary'
import type { Finding, ReviewRecord } from '../../types/review'

interface Props {
  review: ReviewRecord
  onAccept: (finding: Finding) => void
  onDismiss: (finding: Finding) => void
  onResolve: (finding: Finding) => void
}

export default function ReviewResults({ review, onAccept, onDismiss, onResolve }: Props) {
  const counts = severityCounts(review.findings)
  const notes = [
    { label: 'Brand tone', status: 'evaluated' as const, note: 'Checked with configurable keyword and phrase heuristics.' },
    { label: 'Terminology', status: 'evaluated' as const, note: 'Checked against approved terminology rules.' },
    { label: 'Approved facts', status: 'evaluated' as const, note: 'Checked price statements against configured approved facts.' },
    { label: 'Restricted claims', status: 'evaluated' as const, note: 'Checked for configured restricted phrases.' },
    { label: 'Accessibility', status: 'evaluated' as const, note: 'Checked text for basic accessibility signals.' },
    { label: 'Visual guidelines', status: 'not-evaluated' as const, note: 'Not evaluated because the submitted text does not provide sufficient visual information.' },
  ]

  const grouped: { severity: Finding['severity']; items: Finding[] }[] = (['critical', 'high', 'medium', 'low'] as const).map((s) => ({
    severity: s,
    items: review.findings.filter((f) => f.severity === s),
  }))

  return (
    <div className="space-y-4">
      <ScoreSummary score={review.score} counts={counts} notes={notes} />
      <Card title="Detected issues" subtitle={`${review.findings.length} finding${review.findings.length === 1 ? '' : 's'} from simulated checks`}>
        {review.findings.length === 0 && (
          <p className="text-sm text-slate-600">
            No issues detected by the current checks. This does not prove full compliance; the simulated analysis may miss issues.
          </p>
        )}
        <div className="space-y-6">
          {grouped.map(({ severity, items }) =>
            items.length > 0 ? (
              <div key={severity}>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 capitalize">{severity} severity</h4>
                <div className="space-y-3">
                  {items.map((f) => (
                    <FindingCard key={f.id} finding={f} onAccept={onAccept} onDismiss={onDismiss} onResolve={onResolve} />
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      </Card>
    </div>
  )
}