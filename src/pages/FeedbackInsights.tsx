import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { DISPUTED_FINDINGS, FEEDBACK_ITEMS, ISSUE_DISTRIBUTION, RECURRING_PROBLEMS } from '../data/sampleData'

export default function FeedbackInsights() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Sample insights derived from demonstration data.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Commonly detected issue categories">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ISSUE_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Frequently violated brand guidelines">
          <ul className="space-y-2">
            {RECURRING_PROBLEMS.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{r.guideline}</p>
                  <p className="text-slate-500">{r.note}</p>
                </div>
                <Badge variant="warning">{r.occurrences}x</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Creator feedback on suggestions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-3">Creator</th>
                <th className="py-2 pr-3">Suggestion</th>
                <th className="py-2 pr-3">Verdict</th>
                <th className="py-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {FEEDBACK_ITEMS.map((f) => (
                <tr key={f.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-medium">{f.creator}</td>
                  <td className="py-2 pr-3">{f.suggestion}</td>
                  <td className="py-2 pr-3">
                    <Badge variant={f.verdict === 'accepted' ? 'success' : f.verdict === 'rejected' ? 'default' : 'warning'}>
                      {f.verdict}
                    </Badge>
                  </td>
                  <td className="py-2">{f.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Disputed AI findings">
          <ul className="space-y-3">
            {DISPUTED_FINDINGS.map((d) => (
              <li key={d.id} className="border border-slate-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-900 text-sm">{d.finding}</p>
                  <Badge variant={d.status === 'open' ? 'warning' : 'success'}>{d.status}</Badge>
                </div>
                <p className="text-sm text-slate-600">{d.reason}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Recurring problems (unclear guidelines)">
          <ul className="space-y-3">
            {RECURRING_PROBLEMS.map((r) => (
              <li key={r.id} className="text-sm">
                <p className="font-medium text-slate-900">{r.guideline}</p>
                <p className="text-slate-500">{r.occurrences} occurrences — {r.note}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}