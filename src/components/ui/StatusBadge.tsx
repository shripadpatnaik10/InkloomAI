import type { ContentItem } from '../../types'
import Badge from './Badge'

type Status = ContentItem['status']

const map: Record<Status, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  draft: { label: 'Draft', variant: 'default' },
  'in-review': { label: 'In Review', variant: 'info' },
  'changes-requested': { label: 'Changes Requested', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const m = map[status]
  return <Badge variant={m.variant}>{m.label}</Badge>
}