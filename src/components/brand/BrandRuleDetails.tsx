import { X } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { BRAND_KNOWLEDGE_CATEGORY_LABELS } from '../../types/brand'
import type { BrandKnowledgeEntry } from '../../types/brand'

interface Props {
  entry: BrandKnowledgeEntry
  onClose: () => void
  onEdit: (entry: BrandKnowledgeEntry) => void
}

function Row({ label, value }: { label: string; value?: string | boolean | string[] }) {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return null
  const display = Array.isArray(value) ? value.join(', ') : String(value)
  return (
    <div className="py-2 border-b border-slate-100 last:border-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-sm text-slate-800 whitespace-pre-wrap">{display}</p>
    </div>
  )
}

export default function BrandRuleDetails({ entry, onClose, onEdit }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{entry.title}</h3>
            <p className="text-sm text-slate-500">{BRAND_KNOWLEDGE_CATEGORY_LABELS[entry.category]}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-1">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="info">{BRAND_KNOWLEDGE_CATEGORY_LABELS[entry.category]}</Badge>
            <Badge variant={entry.severity === 'critical' || entry.severity === 'high' ? 'danger' : entry.severity === 'medium' ? 'warning' : 'default'}>{entry.severity}</Badge>
            <Badge variant={entry.status === 'active' ? 'success' : 'default'}>{entry.status}</Badge>
          </div>
          <Row label="Description" value={entry.description} />
          <Row label="Source" value={entry.source} />
          <Row label="Effective date" value={entry.effectiveDate} />
          <Row label="Created" value={entry.createdAt} />
          <Row label="Updated" value={entry.updatedAt} />
          <Row label="Tags" value={entry.tags} />

          <Row label="Preferred term" value={entry.preferredTerm} />
          <Row label="Restricted terms" value={entry.restrictedTerms} />
          <Row label="Usage example" value={entry.usageExample} />

          <Row label="Fact type" value={entry.factType} />
          <Row label="Fact value" value={entry.factValue} />

          <Row label="Restricted claim" value={entry.restrictedClaim} />
          <Row label="Rationale" value={entry.rationale} />
          <Row label="Approved alternative" value={entry.approvedAlternative} />
          <Row label="Evidence required" value={entry.evidenceRequired} />

          <Row label="Colour name" value={entry.colorName} />
          <Row label="Colour code" value={entry.colorCode} />
          <Row label="Typography" value={entry.typography} />
          <Row label="Logo usage" value={entry.logoUsage} />
          <Row label="Image rule" value={entry.imageRule} />

          <Row label="WCAG criterion" value={entry.wcagCriterion} />
          <Row label="Impact" value={entry.impact} />

          {entry.colorCode && (
            <div className="pt-2">
              <p className="text-xs font-medium text-slate-500 mb-1">Colour preview</p>
              <div className="w-16 h-16 rounded border border-slate-300" style={{ backgroundColor: entry.colorCode }} />
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onEdit(entry)}>Edit</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}