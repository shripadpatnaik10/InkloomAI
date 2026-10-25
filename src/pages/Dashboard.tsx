import { AlertCircle, CheckCircle2, Clock, FileText, Star } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../components/ui/Card'
import MetricCard from '../components/ui/MetricCard'
import Badge from '../components/ui/Badge'
import StatusBadge from '../components/ui/StatusBadge'
import {
  ACTIVITIES,
  CONTENT_ITEMS,
  ISSUE_DISTRIBUTION,
  QUALITY_OVER_TIME,
} from '../data/sampleData'

export default function Dashboard() {
  const total = CONTENT_ITEMS.length
  const awaiting = CONTENT_ITEMS.filter((c) => c.status === 'in-review' || c.status === 'changes-requested').length
  const approved = CONTENT_ITEMS.filter((c) => c.status === 'approved').length
  const issues = CONTENT_ITEMS.reduce((s, c) => s + c.issueCount, 0)
  const avgScore = Math.round(CONTENT_ITEMS.reduce((s, c) => s + c.score, 0) / total)

  return (
    <div className="space-y-6">
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-2">
        Demonstration data only. Metrics below are illustrative sample values, not verified analytics.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total reviewed" value={total} icon={<FileText size={20} />} />
        <MetricCard label="Awaiting approval" value={awaiting} icon={<Clock size={20} />} />
        <MetricCard label="Approved" value={approved} icon={<CheckCircle2 size={20} />} />
        <MetricCard label="Issues detected" value={issues} icon={<AlertCircle size={20} />} />
        <MetricCard label="Avg quality score" value={avgScore} hint="out of 100" icon={<Star size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Content quality over time" subtitle="Sample trend (illustrative)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={QUALITY_OVER_TIME}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#1e3a8a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Issues by category" subtitle="Sample distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ISSUE_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent content reviews">
          <ul className="divide-y divide-slate-100">
            {CONTENT_ITEMS.slice(0, 5).map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.creator} · {c.submittedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">{c.score}/100</Badge>
                  <StatusBadge status={c.status} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Recent activity & pending reviews">
          <ul className="space-y-3">
            {ACTIVITIES.map((a) => (
              <li key={a.id} className="text-sm text-slate-700">
                <span className="font-medium">{a.actor}</span> {a.action}{' '}
                <span className="font-medium">{a.target}</span>
                <span className="text-slate-400"> · {a.time}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-900 mb-2">Pending reviews</p>
            {CONTENT_ITEMS.filter((c) => c.status === 'in-review').map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm py-1">
                <span>{c.title}</span>
                <span className="text-slate-500">{c.issueCount} issues</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}