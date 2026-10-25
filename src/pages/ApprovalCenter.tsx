import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCcw, Search } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import MetricCard from '../components/ui/MetricCard'
import { useApproval } from '../context/ApprovalContext'
import { useReviewRecords } from '../context/ReviewRecordsContext'
import { DEMO_ROLE_LABELS } from '../types/approval'
import type { ApprovalStatus, ApprovalSubmission, DemoRole } from '../types/approval'
import { APPROVAL_STATUS_LABELS } from '../types/approval'
import { REVIEW_CONTENT_TYPE_LABELS } from '../types/review'
import type { ReviewContentType } from '../types/review'
import {
  approvalBlockedReasons,
  canApprove,
  canTransition,
  createActivity,
  getReviewSummary,
  riskLevel,
} from '../utils/approval'

const DEMO_USERS: Record<DemoRole, string> = {
  creator: 'Demo Creator',
  reviewer: 'Demo Reviewer',
  admin: 'Demo Admin',
}

type SortKey = 'date' | 'priority' | 'score'

export default function ApprovalCenter() {
  const navigate = useNavigate()
  const { submissions, setSubmissions, role, setRole } = useApproval()
  const { reviews } = useReviewRecords()
  const currentUser = DEMO_USERS[role]

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | ReviewContentType>('all')
  const [riskFilter, setRiskFilter] = useState<'all' | 'Critical' | 'High' | 'Medium' | 'Low'>('all')
  const [reviewerFilter, setReviewerFilter] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<ReviewContentType>('social')
  const [newReviewId, setNewReviewId] = useState('')
  const [newContent, setNewContent] = useState('')

  const scopedSubmissions = useMemo(() => {
    if (role === 'creator') return submissions.filter((s) => s.submitter === currentUser)
    return submissions
  }, [submissions, role, currentUser])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = scopedSubmissions.filter((s) => {
      const summary = getReviewSummary(s, reviews)
      const risk = riskLevel(summary)
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (typeFilter !== 'all' && s.contentType !== typeFilter) return false
      if (riskFilter !== 'all' && risk !== riskFilter) return false
      if (reviewerFilter !== 'all' && s.assignedReviewer !== reviewerFilter) return false
      if (!q) return true
      return (s.title + ' ' + s.submitter + ' ' + (s.assignedReviewer ?? '')).toLowerCase().includes(q)
    })
    const sorted = [...list].sort((a, b) => {
      if (sortKey === 'date') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      if (sortKey === 'score') {
        return getReviewSummary(b, reviews).score - getReviewSummary(a, reviews).score
      }
      const priorityRank = (s: ApprovalSubmission) => {
        const summary = getReviewSummary(s, reviews)
        if (summary.critical > 0) return 0
        if (summary.high > 0) return 1
        if (summary.medium > 0) return 2
        return 3
      }
      return priorityRank(a) - priorityRank(b)
    })
    return sorted
  }, [scopedSubmissions, search, statusFilter, typeFilter, riskFilter, reviewerFilter, sortKey, reviews])

  const selected = submissions.find((s) => s.id === selectedId) ?? null

  const updateSubmission = (id: string, updater: (s: ApprovalSubmission) => ApprovalSubmission) => {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)))
  }

  // oxlint-disable react/purity
  const addActivity = (submission: ApprovalSubmission, event: string, description: string) => ({
    ...submission,
    activity: [createActivity(event, description, currentUser, role), ...submission.activity],
    updatedAt: new Date().toISOString(),
  })
  // oxlint-enable react/purity

  const pending = submissions.filter((s) => s.status === 'submitted' || s.status === 'resubmitted').length
  const inReview = submissions.filter((s) => s.status === 'in-review' || s.status === 'reopened').length
  const changesRequested = submissions.filter((s) => s.status === 'changes-requested').length
  const approved = submissions.filter((s) => s.status === 'approved').length
  const rejected = submissions.filter((s) => s.status === 'rejected').length

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setRiskFilter('all')
    setReviewerFilter('all')
    setSortKey('date')
  }

  const assignReviewer = (id: string, reviewer: string) => {
    updateSubmission(id, (s) =>
      addActivity({ ...s, assignedReviewer: reviewer }, 'reviewer-assigned', `Reviewer assigned: ${reviewer}.`)
    )
  }

  const startReview = (id: string) => {
    const s = submissions.find((x) => x.id === id)
    if (!s || !canTransition(s.status, 'in-review')) return
    const reviewer = s.assignedReviewer ?? (role === 'reviewer' ? currentUser : 'Demo Reviewer')
    updateSubmission(id, (sub) =>
      addActivity({ ...sub, status: 'in-review', assignedReviewer: reviewer }, 'review-started', `Review started by ${reviewer}.`)
    )
  }

  const requestChanges = (id: string) => {
    const reason = window.prompt('Reason for requesting changes (required):')
    if (!reason || !reason.trim()) return
    const s = submissions.find((x) => x.id === id)
    if (!s || !canTransition(s.status, 'changes-requested')) return
    updateSubmission(id, (sub) =>
      addActivity(
        {
          ...sub,
          status: 'changes-requested',
          comments: [...sub.comments, { id: `c${Date.now()}`, actor: currentUser, role, text: reason.trim(), createdAt: new Date().toISOString() }],
          decisions: [...sub.decisions, { id: `d${Date.now()}`, type: 'request-changes', actor: currentUser, role, reason: reason.trim(), createdAt: new Date().toISOString() }],
        },
        'changes-requested',
        `Changes requested: ${reason.trim()}`
      )
    )
  }

  const resubmit = (id: string) => {
    const s = submissions.find((x) => x.id === id)
    if (!s || !canTransition(s.status, 'resubmitted')) return
    const confirmed = window.confirm('Resubmit revised content? Earlier reviewer feedback will be preserved.')
    if (!confirmed) return
    updateSubmission(id, (sub) =>
      addActivity(
        {
          ...sub,
          status: 'resubmitted',
          contentVersion: sub.contentVersion + 1,
          highRiskAcknowledged: false,
        },
        'resubmitted',
        'Content resubmitted after revisions.'
      )
    )
  }

  const approve = (id: string) => {
    const s = submissions.find((x) => x.id === id)
    if (!s || !canApprove(s, reviews)) return
    const confirmed = window.confirm('Approve this content? This confirms human review.')
    if (!confirmed) return
    updateSubmission(id, (sub) =>
      addActivity(
        {
          ...sub,
          status: 'approved',
          decisions: [...sub.decisions, { id: `d${Date.now()}`, type: 'approve', actor: currentUser, role, createdAt: new Date().toISOString() }],
        },
        'approved',
        `Content approved by ${currentUser}.`
      )
    )
  }

  const reject = (id: string) => {
    const reason = window.prompt('Reason for rejection (required):')
    if (!reason || !reason.trim()) return
    const s = submissions.find((x) => x.id === id)
    if (!s || !canTransition(s.status, 'rejected')) return
    const confirmed = window.confirm('Reject this submission?')
    if (!confirmed) return
    updateSubmission(id, (sub) =>
      addActivity(
        {
          ...sub,
          status: 'rejected',
          decisions: [...sub.decisions, { id: `d${Date.now()}`, type: 'reject', actor: currentUser, role, reason: reason.trim(), createdAt: new Date().toISOString() }],
        },
        'rejected',
        `Content rejected: ${reason.trim()}`
      )
    )
  }

  const reopen = (id: string) => {
    const s = submissions.find((x) => x.id === id)
    if (!s || !canTransition(s.status, 'reopened')) return
    const confirmed = window.confirm('Reopen this submission for another review?')
    if (!confirmed) return
    updateSubmission(id, (sub) =>
      addActivity({ ...sub, status: 'reopened' }, 'reopened', 'Submission reopened for another review.')
    )
  }

  const createSubmission = () => {
    if (!newTitle.trim() || !newContent.trim()) return
    const selectedReview = reviews.find((r) => r.id === newReviewId)
    const submission: ApprovalSubmission = {
      id: `ap${Date.now()}`,
      title: newTitle.trim(),
      contentType: newType,
      submitter: currentUser,
      assignedReviewer: role === 'creator' ? null : currentUser,
      status: selectedReview ? 'submitted' : 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: newContent,
      contentVersion: 1,
      reviewedContentVersion: selectedReview ? 1 : undefined,
      linkedReviewId: selectedReview?.id,
      demoReview: selectedReview ? undefined : { score: 0, critical: 0, high: 0, medium: 0, low: 0, outdated: true },
      highRiskAcknowledged: false,
      comments: [],
      decisions: [],
      activity: [createActivity('submission-created', 'Submission created.', currentUser, role)],
    }
    if (selectedReview) {
      submission.activity.unshift(createActivity('submitted-for-review', 'Submitted for human review.', currentUser, role))
    }
    setSubmissions((prev) => [submission, ...prev])
    setShowNew(false)
    setNewTitle('')
    setNewContent('')
    setNewReviewId('')
  }

  const roleOptions: DemoRole[] = ['creator', 'reviewer', 'admin']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Approval Center</h2>
          <p className="text-sm text-slate-500 mt-1">
            Human review workflow for content approval. Prototype data only; no real permissions or persistence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Demo role</label>
          <Select value={role} onChange={(e) => setRole(e.target.value as DemoRole)}>
            {roleOptions.map((r) => (
              <option key={r} value={r}>{DEMO_ROLE_LABELS[r]}</option>
            ))}
          </Select>
          <Button onClick={() => setShowNew(true)}><Plus size={16} /> New Submission</Button>
        </div>
      </div>

      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-2">
        Prototype workflow only. Changing the demo role does not grant real permissions. A high score never overrides unresolved critical findings.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Pending Reviews" value={pending} />
        <MetricCard label="In Review" value={inReview} />
        <MetricCard label="Changes Requested" value={changesRequested} />
        <MetricCard label="Approved" value={approved} />
        <MetricCard label="Rejected" value={rejected} />
      </div>

      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2 flex items-center gap-2 bg-slate-50 rounded-md px-3">
            <Search size={16} className="text-slate-400" />
            <Input className="border-0 bg-transparent" placeholder="Search title, submitter, reviewer" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | ApprovalStatus)}>
            <option value="all">All statuses</option>
            {Object.entries(APPROVAL_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | ReviewContentType)}>
            <option value="all">All types</option>
            {Object.entries(REVIEW_CONTENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as typeof riskFilter)}>
            <option value="all">All risks</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
          <Select value={reviewerFilter} onChange={(e) => setReviewerFilter(e.target.value)}>
            <option value="all">All reviewers</option>
            <option value="Demo Reviewer">Demo Reviewer</option>
            <option value="Demo Admin">Demo Admin</option>
            <option value={null as unknown as string}>Unassigned</option>
          </Select>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Button variant="ghost" size="sm" onClick={resetFilters}><RotateCcw size={14} /> Reset filters</Button>
          <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="date">Sort by date</option>
            <option value="priority">Sort by priority</option>
            <option value="score">Sort by score</option>
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-slate-500">No submissions match the current filters.</div>
        </Card>
      ) : (
        <Card title="Submissions">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Submitter</th>
                  <th className="py-2 pr-3">Reviewer</th>
                  <th className="py-2 pr-3">Score</th>
                  <th className="py-2 pr-3">Unresolved Critical</th>
                  <th className="py-2 pr-3">Risk</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Updated</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const summary = getReviewSummary(s, reviews)
                  const risk = riskLevel(summary)
                  return (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-medium text-slate-900">{s.title}</td>
                      <td className="py-2 pr-3">{REVIEW_CONTENT_TYPE_LABELS[s.contentType]}</td>
                      <td className="py-2 pr-3">{s.submitter}</td>
                      <td className="py-2 pr-3">{s.assignedReviewer ?? 'Unassigned'}</td>
                      <td className="py-2 pr-3">{summary.score}/100</td>
                      <td className="py-2 pr-3">{summary.critical}</td>
                      <td className="py-2 pr-3">
                        <Badge variant={risk === 'Critical' || risk === 'High' ? 'danger' : risk === 'Medium' ? 'warning' : 'default'}>{risk}</Badge>
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant={s.status === 'approved' ? 'success' : s.status === 'rejected' ? 'danger' : s.status === 'changes-requested' ? 'warning' : 'info'}>
                          {APPROVAL_STATUS_LABELS[s.status]}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3">{new Date(s.updatedAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedId(s.id)}>Details</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Submission details</h3>
              <button onClick={() => setSelectedId(null)} className="p-2 text-slate-500 hover:text-slate-900" aria-label="Close">×</button>
            </div>
            <div className="p-5 space-y-4">
              {(() => {
                const s = selected
                const summary = getReviewSummary(s, reviews)
                const risk = riskLevel(summary)
                const blocked = approvalBlockedReasons(s, reviews)
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-slate-500">Title:</span> {s.title}</div>
                      <div><span className="text-slate-500">Type:</span> {REVIEW_CONTENT_TYPE_LABELS[s.contentType]}</div>
                      <div><span className="text-slate-500">Submitter:</span> {s.submitter}</div>
                      <div><span className="text-slate-500">Reviewer:</span> {s.assignedReviewer ?? 'Unassigned'}</div>
                      <div><span className="text-slate-500">Status:</span> {APPROVAL_STATUS_LABELS[s.status]}</div>
                      <div><span className="text-slate-500">Score:</span> {summary.score}/100</div>
                      <div><span className="text-slate-500">Risk:</span> {risk}</div>
                      <div><span className="text-slate-500">Revision:</span> {s.contentVersion}</div>
                    </div>
                    <div className="bg-slate-50 rounded p-3 text-sm">
                      <p className="font-medium text-slate-900 mb-1">Content</p>
                      <p className="text-slate-700 whitespace-pre-wrap">{s.content}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <Badge variant="danger">Critical: {summary.critical}</Badge>
                      <Badge variant="danger">High: {summary.high}</Badge>
                      <Badge variant="warning">Medium: {summary.medium}</Badge>
                      <Badge variant="default">Low: {summary.low}</Badge>
                    </div>
                    {summary.outdated && (
                      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                        Warning: the latest review may be outdated because content changed after review.
                      </p>
                    )}
                    {blocked.length > 0 && (
                      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                        <p className="font-medium">Approval blocked</p>
                        <ul className="list-disc pl-5">
                          {blocked.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                      </div>
                    )}
                    {s.comments.length > 0 && (
                      <div>
                        <p className="font-medium text-slate-900 mb-1">Reviewer feedback</p>
                        <ul className="space-y-2 text-sm">
                          {s.comments.map((c) => (
                            <li key={c.id} className="bg-slate-50 rounded p-2">
                              <span className="font-medium">{c.actor}:</span> {c.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900 mb-1">Activity timeline</p>
                      <ul className="space-y-2 text-sm">
                        {s.activity.map((a) => (
                          <li key={a.id} className="border-l-2 border-slate-200 pl-3">
                            <p className="font-medium text-slate-800">{a.description}</p>
                            <p className="text-xs text-slate-500">{a.actor} · {new Date(a.createdAt).toLocaleString()}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                      {s.status === 'submitted' && (
                        <Button size="sm" onClick={() => startReview(s.id)}>Start review</Button>
                      )}
                      {s.status === 'resubmitted' && (
                        <Button size="sm" onClick={() => startReview(s.id)}>Start review</Button>
                      )}
                      {s.status === 'reopened' && (
                        <Button size="sm" onClick={() => startReview(s.id)}>Start review</Button>
                      )}
                      {s.status === 'in-review' && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => requestChanges(s.id)}>Request changes</Button>
                          <Button size="sm" onClick={() => approve(s.id)} disabled={!canApprove(s, reviews)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => reject(s.id)}>Reject</Button>
                        </>
                      )}
                      {summary.high > 0 && s.status === 'in-review' && (
                        <label className="flex items-center gap-2 text-xs text-slate-600">
                          <input type="checkbox" checked={s.highRiskAcknowledged} onChange={(e) => updateSubmission(s.id, (sub) => ({ ...sub, highRiskAcknowledged: e.target.checked }))} />
                          I acknowledge high-severity findings
                        </label>
                      )}
                      {s.status === 'changes-requested' && (
                        <Button size="sm" onClick={() => resubmit(s.id)}>Resubmit revised content</Button>
                      )}
                      {(s.status === 'approved' || s.status === 'rejected') && (
                        <Button size="sm" variant="secondary" onClick={() => reopen(s.id)}>Reopen</Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/review?review=${s.linkedReviewId ?? ''}`)} disabled={!s.linkedReviewId}>
                        Open review
                      </Button>
                      {s.assignedReviewer !== currentUser && role === 'admin' && (
                        <Select value={s.assignedReviewer ?? ''} onChange={(e) => assignReviewer(s.id, e.target.value)}>
                          <option value="">Assign reviewer</option>
                          <option value="Demo Reviewer">Demo Reviewer</option>
                          <option value="Demo Admin">Demo Admin</option>
                        </Select>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto p-5 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">New submission</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Submission title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content type</label>
              <Select value={newType} onChange={(e) => setNewType(e.target.value as ReviewContentType)}>
                {Object.entries(REVIEW_CONTENT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link content review (optional)</label>
              <Select value={newReviewId} onChange={(e) => setNewReviewId(e.target.value)}>
                <option value="">No linked review</option>
                {reviews.map((r) => (
                  <option key={r.id} value={r.id}>{r.title} ({r.score}/100)</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
              <textarea className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" rows={6} value={newContent} onChange={(e) => setNewContent(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button onClick={createSubmission}>Create submission</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}