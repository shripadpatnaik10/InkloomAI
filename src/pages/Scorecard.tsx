import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import MetricCard from '../components/ui/MetricCard'
import { useReviewRecords } from '../context/ReviewRecordsContext'
import { REVIEW_CONTENT_TYPE_LABELS } from '../types/review'
import type { ReviewContentType } from '../types/review'
import {
  averageScore,
  categoryScores,
  criticalRiskItems,
  filterReviews,
  generateInsights,
  getLatestReviews,
  severityCounts,
  trendData,
  type ScorecardFilters,
} from '../utils/scorecard'

const defaultFilters: ScorecardFilters = {
  dateFrom: '',
  dateTo: '',
  contentType: 'all',
  severity: 'all',
  status: 'all',
}

export default function Scorecard() {
  const navigate = useNavigate()
  const { reviews } = useReviewRecords()
  const [filters, setFilters] = useState<ScorecardFilters>(defaultFilters)

  const filteredReviews = useMemo(() => filterReviews(reviews, filters), [reviews, filters])
  const latestReviews = useMemo(() => getLatestReviews(filteredReviews), [filteredReviews])
  const avg = averageScore(latestReviews)
  const counts = severityCounts(latestReviews)
  const openFindings = latestReviews.reduce((sum, r) => sum + r.findings.filter((f) => f.status !== 'resolved' && f.status !== 'dismissed').length, 0)
  const readyForReview = latestReviews.filter((r) => r.status === 'reviewed').length
  const categories = categoryScores(latestReviews)
  const riskItems = criticalRiskItems(latestReviews)
  const trend = trendData(filteredReviews)
  const insights = generateInsights(filteredReviews, latestReviews)

  const noReviews = reviews.length === 0
  const noFilteredResults = !noReviews && filteredReviews.length === 0

  const resetFilters = () => setFilters(defaultFilters)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Content Scorecard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Governance insights derived from Phase 3 review records. Scores are illustrative prototype metrics, not approval decisions.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/review')}>
          Open Content Review Studio
        </Button>
      </div>

      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-2">
        Simulated data only. A high score never hides unresolved critical findings. Only authorised human reviewers can approve content.
      </p>

      {noReviews && (
        <Card>
          <div className="text-center py-8 space-y-3">
            <p className="text-slate-600">No review data is available yet.</p>
            <p className="text-xs text-slate-400">Run a brand review in Content Review Studio to populate this scorecard.</p>
            <Button onClick={() => navigate('/review')}>Go to Content Review Studio</Button>
          </div>
        </Card>
      )}

      {!noReviews && (
        <>
          <Card title="Filters">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
              <Input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
              <Select value={filters.contentType} onChange={(e) => setFilters({ ...filters, contentType: e.target.value as 'all' | ReviewContentType })}>
                <option value="all">All content types</option>
                {Object.entries(REVIEW_CONTENT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
              <Select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value as ScorecardFilters['severity'] })}>
                <option value="all">All severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
              <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as ScorecardFilters['status'] })}>
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="reviewed">Reviewed</option>
                <option value="awaiting-approval">Awaiting Human Approval</option>
              </Select>
            </div>
            <div className="mt-3">
              <Button variant="ghost" size="sm" onClick={resetFilters}>Reset filters</Button>
            </div>
          </Card>

          {noFilteredResults ? (
            <Card>
              <div className="text-center py-6 text-slate-500">No reviews match the current filters.</div>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard label="Average compliance score" value={avg} hint="latest reviews" />
                <MetricCard label="Total content reviews" value={filteredReviews.length} />
                <MetricCard label="Reviews with critical issues" value={latestReviews.filter((r) => r.unresolvedCritical > 0).length} />
                <MetricCard label="Open findings" value={openFindings} />
                <MetricCard label="Ready for human review" value={readyForReview} hint="review-readiness estimate" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Category scores">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categories.map((c) => ({ name: c.label, score: c.score ?? 0, hasData: c.score !== null }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#1e3a8a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-1">
                    {categories.map((c) => (
                      <div key={c.category} className="flex items-center justify-between text-xs text-slate-600">
                        <span>{c.label}</span>
                        <span>
                          {c.score === null ? (c.evaluated ? 'Not enough data' : 'Not evaluated') : `${c.score}/100`} · {c.count} finding{c.count === 1 ? '' : 's'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Risk distribution">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Critical', count: counts.critical },
                        { name: 'High', count: counts.high },
                        { name: 'Medium', count: counts.medium },
                        { name: 'Low', count: counts.low },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Unresolved findings by severity across latest reviews.</p>
                </Card>
              </div>

              <Card title="Compliance trend">
                {trend.length < 2 ? (
                  <p className="text-sm text-slate-500">Not enough review history to display a trend.</p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#1e3a8a" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">Uses actual review timestamps and scores. Simulated analysis disclaimer applies.</p>
              </Card>

              <Card title="Critical risk list">
                {riskItems.length === 0 ? (
                  <p className="text-sm text-slate-500">No unresolved critical findings in the current filtered reviews.</p>
                ) : (
                  <div className="space-y-3">
                    {riskItems.map((item) => (
                      <div key={item.id} className="border border-red-200 bg-red-50 rounded-md p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-medium text-red-900">{item.title}</p>
                          <p className="text-xs text-red-700">
                            Score {item.score}/100 · {item.count} unresolved critical finding{item.count === 1 ? '' : 's'} · {item.summary}
                          </p>
                        </div>
                        <Button size="sm" variant="danger" onClick={() => navigate(`/review?review=${item.id}`)}>
                          Open review
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Governance insights">
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-md p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-900">{insight.title}</p>
                        <Badge variant="info">{insight.metric}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{insight.explanation}</p>
                      <p className="text-xs text-slate-500 mt-1">Suggested action: {insight.action}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}