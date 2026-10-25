import { useState } from 'react'
import { X } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import { BRAND_KNOWLEDGE_CATEGORY_LABELS } from '../../types/brand'
import type { BrandKnowledgeCategory, BrandKnowledgeEntry, BrandKnowledgeSeverity, BrandKnowledgeStatus } from '../../types/brand'

interface Props {
  initialEntry?: BrandKnowledgeEntry
  onSubmit: (data: Omit<BrandKnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

const categories = Object.keys(BRAND_KNOWLEDGE_CATEGORY_LABELS) as BrandKnowledgeCategory[]

export default function BrandRuleForm({ initialEntry, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initialEntry?.title ?? '')
  const [category, setCategory] = useState<BrandKnowledgeCategory>(initialEntry?.category ?? 'voice')
  const [description, setDescription] = useState(initialEntry?.description ?? '')
  const [severity, setSeverity] = useState<BrandKnowledgeSeverity>(initialEntry?.severity ?? 'medium')
  const [status, setStatus] = useState<BrandKnowledgeStatus>(initialEntry?.status ?? 'active')
  const [source, setSource] = useState(initialEntry?.source ?? '')
  const [effectiveDate, setEffectiveDate] = useState(initialEntry?.effectiveDate ?? '')
  const [tags, setTags] = useState(initialEntry?.tags?.join(', ') ?? '')

  // terminology
  const [preferredTerm, setPreferredTerm] = useState(initialEntry?.preferredTerm ?? '')
  const [restrictedTerms, setRestrictedTerms] = useState(initialEntry?.restrictedTerms?.join(', ') ?? '')
  const [usageExample, setUsageExample] = useState(initialEntry?.usageExample ?? '')

  // facts
  const [factType, setFactType] = useState(initialEntry?.factType ?? '')
  const [factValue, setFactValue] = useState(initialEntry?.factValue ?? '')

  // claims
  const [restrictedClaim, setRestrictedClaim] = useState(initialEntry?.restrictedClaim ?? '')
  const [rationale, setRationale] = useState(initialEntry?.rationale ?? '')
  const [approvedAlternative, setApprovedAlternative] = useState(initialEntry?.approvedAlternative ?? '')
  const [evidenceRequired, setEvidenceRequired] = useState(initialEntry?.evidenceRequired ?? false)

  // visual
  const [colorName, setColorName] = useState(initialEntry?.colorName ?? '')
  const [colorCode, setColorCode] = useState(initialEntry?.colorCode ?? '')
  const [typography, setTypography] = useState(initialEntry?.typography ?? '')
  const [logoUsage, setLogoUsage] = useState(initialEntry?.logoUsage ?? '')
  const [imageRule, setImageRule] = useState(initialEntry?.imageRule ?? '')

  // accessibility
  const [wcagCriterion, setWcagCriterion] = useState(initialEntry?.wcagCriterion ?? '')
  const [impact, setImpact] = useState(initialEntry?.impact ?? '')

  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.')
      return
    }
    setError('')
    const data: Omit<BrandKnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      category,
      description: description.trim(),
      severity,
      status,
      source: source.trim() || undefined,
      effectiveDate: effectiveDate || undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      preferredTerm: preferredTerm.trim() || undefined,
      restrictedTerms: restrictedTerms.split(',').map((t) => t.trim()).filter(Boolean),
      usageExample: usageExample.trim() || undefined,
      factType: factType.trim() || undefined,
      factValue: factValue.trim() || undefined,
      restrictedClaim: restrictedClaim.trim() || undefined,
      rationale: rationale.trim() || undefined,
      approvedAlternative: approvedAlternative.trim() || undefined,
      evidenceRequired,
      colorName: colorName.trim() || undefined,
      colorCode: colorCode.trim() || undefined,
      typography: typography.trim() || undefined,
      logoUsage: logoUsage.trim() || undefined,
      imageRule: imageRule.trim() || undefined,
      wcagCriterion: wcagCriterion.trim() || undefined,
      impact: impact.trim() || undefined,
    }
    onSubmit(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{initialEntry ? 'Edit brand rule' : 'Add new brand rule'}</h3>
          <button onClick={onCancel} className="p-2 text-slate-500 hover:text-slate-900" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rule title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value as BrandKnowledgeCategory)}>
                {categories.map((c) => (
                  <option key={c} value={c}>{BRAND_KNOWLEDGE_CATEGORY_LABELS[c]}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
              <Select value={severity} onChange={(e) => setSeverity(e.target.value as BrandKnowledgeSeverity)}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <Select value={status} onChange={(e) => setStatus(e.target.value as BrandKnowledgeStatus)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the rule" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
              <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source reference" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Effective date</label>
              <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2" />
            </div>
          </div>

          {category === 'terminology' && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="font-medium text-slate-900">Terminology details</h4>
              <Input placeholder="Preferred term" value={preferredTerm} onChange={(e) => setPreferredTerm(e.target.value)} />
              <Input placeholder="Restricted terms (comma separated)" value={restrictedTerms} onChange={(e) => setRestrictedTerms(e.target.value)} />
              <Textarea rows={2} placeholder="Usage example" value={usageExample} onChange={(e) => setUsageExample(e.target.value)} />
            </div>
          )}

          {category === 'facts' && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="font-medium text-slate-900">Fact details</h4>
              <Input placeholder="Fact type" value={factType} onChange={(e) => setFactType(e.target.value)} />
              <Input placeholder="Fact value" value={factValue} onChange={(e) => setFactValue(e.target.value)} />
            </div>
          )}

          {category === 'claims' && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="font-medium text-slate-900">Claim restriction details</h4>
              <Input placeholder="Restricted claim" value={restrictedClaim} onChange={(e) => setRestrictedClaim(e.target.value)} />
              <Textarea rows={2} placeholder="Rationale" value={rationale} onChange={(e) => setRationale(e.target.value)} />
              <Input placeholder="Approved alternative wording" value={approvedAlternative} onChange={(e) => setApprovedAlternative(e.target.value)} />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={evidenceRequired} onChange={(e) => setEvidenceRequired(e.target.checked)} />
                Evidence required
              </label>
            </div>
          )}

          {category === 'visual' && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="font-medium text-slate-900">Visual details</h4>
              <Input placeholder="Colour name" value={colorName} onChange={(e) => setColorName(e.target.value)} />
              <Input placeholder="Colour code (e.g. #1e3a8a)" value={colorCode} onChange={(e) => setColorCode(e.target.value)} />
              <Input placeholder="Typography" value={typography} onChange={(e) => setTypography(e.target.value)} />
              <Textarea rows={2} placeholder="Logo usage" value={logoUsage} onChange={(e) => setLogoUsage(e.target.value)} />
              <Textarea rows={2} placeholder="Image rule" value={imageRule} onChange={(e) => setImageRule(e.target.value)} />
            </div>
          )}

          {category === 'accessibility' && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="font-medium text-slate-900">Accessibility details</h4>
              <Input placeholder="WCAG criterion" value={wcagCriterion} onChange={(e) => setWcagCriterion(e.target.value)} />
              <Textarea rows={2} placeholder="Impact" value={impact} onChange={(e) => setImpact(e.target.value)} />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{initialEntry ? 'Save changes' : 'Add rule'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}