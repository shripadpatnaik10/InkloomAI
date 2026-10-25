import { useEffect, useMemo, useState } from 'react'
import { useBrandKnowledge } from '../context/BrandKnowledgeContext'
import { brandRulesApi, type BackendBrandRule } from '../lib/api'
import { Plus, RotateCcw, Search } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import MetricCard from '../components/ui/MetricCard'
import BrandRuleCard from '../components/brand/BrandRuleCard'
import BrandRuleDetails from '../components/brand/BrandRuleDetails'
import BrandRuleForm from '../components/brand/BrandRuleForm'
import {
  BRAND_KNOWLEDGE_CATEGORY_LABELS,
  type BrandKnowledgeCategory,
  type BrandKnowledgeEntry,
  type BrandKnowledgeSeverity,
  type BrandKnowledgeStatus,
} from '../types/brand'


const ALL = 'all'

export default function BrandGuidelines() {
  const { entries, setEntries } = useBrandKnowledge()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | BrandKnowledgeCategory>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | BrandKnowledgeSeverity>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | BrandKnowledgeStatus>('all')
  const [selected, setSelected] = useState<BrandKnowledgeEntry | null>(null)
  const [editing, setEditing] = useState<BrandKnowledgeEntry | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const toFrontend = (rule: BackendBrandRule): BrandKnowledgeEntry => {
    let extra: Record<string, unknown> = {}
    if (rule.rule_text) {
      try { extra = JSON.parse(rule.rule_text) as Record<string, unknown> } catch { extra = {} }
    }
    return {
      id: rule.id,
      title: rule.name,
      category: rule.category as BrandKnowledgeEntry['category'],
      description: rule.description,
      severity: rule.severity as BrandKnowledgeEntry['severity'],
      status: rule.status as BrandKnowledgeEntry['status'],
      source: (extra.source as string) ?? 'Backend API',
      effectiveDate: extra.effectiveDate as string | undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: extra.tags as string[] | undefined,
      preferredTerm: extra.preferredTerm as string | undefined,
      restrictedTerms: extra.restrictedTerms as string[] | undefined,
      usageExample: extra.usageExample as string | undefined,
      factType: extra.factType as string | undefined,
      factValue: extra.factValue as string | undefined,
      restrictedClaim: extra.restrictedClaim as string | undefined,
      rationale: extra.rationale as string | undefined,
      approvedAlternative: extra.approvedAlternative as string | undefined,
      evidenceRequired: extra.evidenceRequired as boolean | undefined,
      colorName: extra.colorName as string | undefined,
      colorCode: extra.colorCode as string | undefined,
      typography: extra.typography as string | undefined,
      logoUsage: extra.logoUsage as string | undefined,
      imageRule: extra.imageRule as string | undefined,
      wcagCriterion: extra.wcagCriterion as string | undefined,
      impact: extra.impact as string | undefined,
    }
  }

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const rules = await brandRulesApi.list()
      setEntries(rules.map(toFrontend))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load brand rules from backend.')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  // oxlint-disable react/set-state-in-effect react-hooks/exhaustive-deps
  useEffect(() => {
    void load()
  }, [])
  // oxlint-enable react/set-state-in-effect react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries.filter((e) => {
      if (categoryFilter !== ALL && e.category !== categoryFilter) return false
      if (severityFilter !== ALL && e.severity !== severityFilter) return false
      if (statusFilter !== ALL && e.status !== statusFilter) return false
      if (!q) return true
      const haystack = [
        e.title,
        e.description,
        e.source,
        e.preferredTerm,
        e.restrictedTerms?.join(' '),
        e.factValue,
        e.restrictedClaim,
        e.colorCode,
        e.tags?.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [entries, search, categoryFilter, severityFilter, statusFilter])

  const totalRules = entries.length
  const approvedFacts = entries.filter((e) => e.category === 'facts' && e.status === 'active').length
  const restrictedClaims = entries.filter((e) => e.category === 'claims').length
  const inactiveRules = entries.filter((e) => e.status === 'inactive').length

  const handleAdd = () => {
    setEditing(null)
    setShowForm(true)
  }

  const handleEdit = (entry: BrandKnowledgeEntry) => {
    setEditing(entry)
    setShowForm(true)
    setSelected(null)
  }

  const handleSubmit = async (data: Omit<BrandKnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { title, category, description, severity, status, ...extra } = data
    const payload = {
      name: title,
      category,
      description,
      rule_text: JSON.stringify(extra),
      severity,
      status,
    }
    try {
      if (editing) {
        const updated = await brandRulesApi.update(editing.id, payload)
        setEntries((prev) => prev.map((e) => (e.id === editing.id ? toFrontend(updated) : e)))
        showToast('success', 'Brand rule updated.')
      } else {
        const created = await brandRulesApi.create(payload)
        setEntries((prev) => [toFrontend(created), ...prev])
        showToast('success', 'Brand rule added.')
      }
      setShowForm(false)
      setEditing(null)
    } catch (e) {
      showToast('error', e instanceof Error ? e.message : 'Failed to save brand rule.')
    }
  }

  const handleDelete = async (entry: BrandKnowledgeEntry) => {
    const confirmed = window.confirm(`Delete "${entry.title}"? This cannot be undone.`)
    if (!confirmed) return
    try {
      await brandRulesApi.remove(entry.id)
      setEntries((prev) => prev.filter((e) => e.id !== entry.id))
      setSelected(null)
      showToast('success', 'Brand rule deleted.')
    } catch (e) {
      showToast('error', e instanceof Error ? e.message : 'Failed to delete brand rule.')
    }
  }

  const handleToggleStatus = async (entry: BrandKnowledgeEntry) => {
    try {
      const updated = await brandRulesApi.update(entry.id, { status: entry.status === 'active' ? 'inactive' : 'active' })
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? toFrontend(updated) : e)))
      showToast('success', `Rule ${entry.status === 'active' ? 'deactivated' : 'activated'}.`)
    } catch (e) {
      showToast('error', e instanceof Error ? e.message : 'Failed to update brand rule.')
    }
  }

  const handleReset = () => {
    void load()
    showToast('success', 'Reloaded brand rules from backend.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Brand Knowledge Hub</h2>
          <p className="text-sm text-slate-500 mt-1">
            Approved source of truth for brand rules, terminology, facts, claims, visual standards, and accessibility.
            Changes are kept in session state only and are not stored in a permanent database.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw size={16} /> Reset demo data
          </Button>
          <Button onClick={handleAdd}>
            <Plus size={16} /> Add New Rule
          </Button>
        </div>
      </div>

      {toast && (
        <div
          className={`text-sm rounded-md px-4 py-2 border ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {toast.message}
        </div>
      )}

      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-2">
        Demonstration data only. Sample facts are illustrative and are not verified commercial claims.
      </p>

      {loading && <p className="text-sm text-slate-500">Loading brand rules from backend...</p>}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total rules" value={totalRules} />
        <MetricCard label="Approved facts" value={approvedFacts} />
        <MetricCard label="Restricted claims" value={restrictedClaims} />
        <MetricCard label="Inactive rules" value={inactiveRules} />
      </div>

      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 flex items-center gap-2 bg-slate-50 rounded-md px-3">
            <Search size={16} className="text-slate-400" />
            <Input
              className="border-0 bg-transparent"
              placeholder="Search title, description, terminology..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as 'all' | BrandKnowledgeCategory)}>
            <option value="all">All categories</option>
            {Object.entries(BRAND_KNOWLEDGE_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as 'all' | BrandKnowledgeSeverity)}>
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | BrandKnowledgeStatus)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm ${categoryFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          All
        </button>
        {(Object.keys(BRAND_KNOWLEDGE_CATEGORY_LABELS) as BrandKnowledgeCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-full text-sm ${categoryFilter === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {BRAND_KNOWLEDGE_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-slate-500">No brand knowledge records match your filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting search or filters, or add a new rule.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((entry) => (
            <BrandRuleCard
              key={entry.id}
              entry={entry}
              onView={setSelected}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {selected && (
        <BrandRuleDetails
          entry={selected}
          onClose={() => setSelected(null)}
          onEdit={handleEdit}
        />
      )}

      {showForm && (
        <BrandRuleForm
          initialEntry={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}