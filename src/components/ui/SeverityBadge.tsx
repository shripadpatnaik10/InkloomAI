import type { IssueSeverity } from '../../types'
import Badge from './Badge'

const map: Record<IssueSeverity, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  critical: { label: 'Critical', variant: 'danger' },
  high: { label: 'High', variant: 'danger' },
  medium: { label: 'Medium', variant: 'warning' },
  low: { label: 'Low', variant: 'default' },
}

export default function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  const m = map[severity]
  return <Badge variant={m.variant}>{m.label}</Badge>
}