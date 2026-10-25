import { Pencil, Trash2, Eye, Power } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { BRAND_KNOWLEDGE_CATEGORY_LABELS } from '../../types/brand'
import type { BrandKnowledgeEntry, BrandKnowledgeSeverity, BrandKnowledgeStatus } from '../../types/brand'

interface Props {
  entry: BrandKnowledgeEntry
  onView: (entry: BrandKnowledgeEntry) => void
  onEdit: (entry: BrandKnowledgeEntry) => void
  onDelete: (entry: BrandKnowledgeEntry) => void
  onToggleStatus: (entry: BrandKnowledgeEntry) => void
}

const severityVariant: Record<BrandKnowledgeSeverity, 'danger' | 'warning' | 'info' | 'default'> = {
  critical: 'danger',
  high: 'danger',
  medium: 'warning',
  low: 'default',
}

const statusVariant: Record<BrandKnowledgeStatus, 'success' | 'default'> = {
  active: 'success',
  inactive: 'default',
}

export default function BrandRuleCard({ entry, onView, onEdit, onDelete, onToggleStatus }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="info">{BRAND_KNOWLEDGE_CATEGORY_LABELS[entry.category]}</Badge>
            <Badge variant={severityVariant[entry.severity]}>{entry.severity}</Badge>
            <Badge variant={statusVariant[entry.status]}>{entry.status}</Badge>
          </div>
          <h3 className="font-semibold text-slate-900 truncate">{entry.title}</h3>
        </div>
        {entry.colorCode && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-6 h-6 rounded border border-slate-300" style={{ backgroundColor: entry.colorCode }} />
            <span className="text-xs text-slate-500">{entry.colorCode}</span>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-600 line-clamp-3">{entry.description}</p>

      <div className="text-xs text-slate-500 space-y-1">
        {entry.source && <p><span className="font-medium">Source:</span> {entry.source}</p>}
        {entry.effectiveDate && <p><span className="font-medium">Effective:</span> {entry.effectiveDate}</p>}
        {entry.factValue && <p><span className="font-medium">Value:</span> {entry.factValue}</p>}
        {entry.preferredTerm && <p><span className="font-medium">Preferred:</span> {entry.preferredTerm}</p>}
      </div>

      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
        <Button size="sm" variant="ghost" onClick={() => onView(entry)}><Eye size={14} /> View</Button>
        <Button size="sm" variant="secondary" onClick={() => onEdit(entry)}><Pencil size={14} /> Edit</Button>
        <Button size="sm" variant="ghost" onClick={() => onToggleStatus(entry)}><Power size={14} /> {entry.status === 'active' ? 'Deactivate' : 'Activate'}</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(entry)}><Trash2 size={14} /> Delete</Button>
      </div>
    </div>
  )
}