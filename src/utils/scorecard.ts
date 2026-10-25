import type { BrandKnowledgeCategory } from '../types/brand'
import type { FindingSeverity, ReviewRecord, ReviewContentType } from '../types/review'

export interface ScorecardFilters {
  dateFrom: string
  dateTo: string
  contentType: 'all' | ReviewContentType
  severity: 'all' | FindingSeverity
  status: 'all' | ReviewRecord['status']
}

export const CATEGORY_LABELS: Record<BrandKnowledgeCategory, string> = {
  voice: 'Brand Tone',
  terminology: 'Terminology',
  facts: 'Approved Facts',
  claims: 'Restricted Claims',
  accessibility: 'Accessibility',
  visual: 'Visual Guidelines',
}

const WEIGHTS: Record<FindingSeverity, number> = { critical: 25, high: 15, medium: 8, low: 3 }

export function filterReviews(reviews: ReviewRecord[], filters: ScorecardFilters): ReviewRecord[] {
  return reviews.filter((r) => {
    const created = new Date(r.createdAt)
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      if (created < from) return false
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      to.setHours(23, 59, 59, 999)
      if (created > to) return false
    }
    if (filters.contentType !== 'all' && r.contentType !== filters.contentType) return false
    if (filters.status !== 'all' && r.status !== filters.status) return false
    if (filters.severity !== 'all' && !r.findings.some((f) => f.severity === filters.severity)) return false
    return true
  })
}

export function getLatestReviews(reviews: ReviewRecord[]): ReviewRecord[] {
  const map = new Map<string, ReviewRecord>()
  for (const r of reviews) {
    const key = `${r.title}|${r.contentType}`
    const existing = map.get(key)
    if (!existing || new Date(r.createdAt) > new Date(existing.createdAt)) {
      map.set(key, r)
    }
  }
  return Array.from(map.values())
}

export function unresolved(finding: { status: string }) {
  return finding.status !== 'resolved' && finding.status !== 'dismissed'
}

export function severityCounts(reviews: ReviewRecord[]) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  reviews.forEach((r) => {
    r.findings.forEach((f) => {
      if (unresolved(f)) counts[f.severity] += 1
    })
  })
  return counts
}

export function totalFindings(reviews: ReviewRecord[]) {
  return reviews.reduce((sum, r) => sum + r.findings.length, 0)
}

export function averageScore(reviews: ReviewRecord[]) {
  if (reviews.length === 0) return 0
  return Math.round(reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length)
}

export function categoryScores(reviews: ReviewRecord[]) {
  const categories = Object.keys(CATEGORY_LABELS) as BrandKnowledgeCategory[]
  return categories.map((category) => {
    const perReviewScores = reviews
      .map((r) => {
        const findings = r.findings.filter((f) => f.category === category)
        if (findings.length === 0) return null
        let score = 100
        findings.forEach((f) => {
          score -= WEIGHTS[f.severity]
        })
        return Math.max(0, Math.min(100, score))
      })
      .filter((s): s is number => s !== null)
    const score = perReviewScores.length > 0
      ? Math.round(perReviewScores.reduce((a, b) => a + b, 0) / perReviewScores.length)
      : null
    const count = reviews.reduce((sum, r) => sum + r.findings.filter((f) => f.category === category).length, 0)
    const evaluated = category !== 'visual'
    return { category, label: CATEGORY_LABELS[category], score, count, evaluated }
  })
}

export function criticalRiskItems(reviews: ReviewRecord[]) {
  return reviews
    .filter((r) => r.findings.some((f) => f.severity === 'critical' && unresolved(f)))
    .map((r) => ({
      id: r.id,
      title: r.title,
      score: r.score,
      count: r.findings.filter((f) => f.severity === 'critical' && unresolved(f)).length,
      summary: r.findings.find((f) => f.severity === 'critical' && unresolved(f))?.title ?? 'Unresolved critical finding',
    }))
}

export function trendData(reviews: ReviewRecord[]) {
  return [...reviews]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString(),
      score: r.score,
      title: r.title,
    }))
}

export interface GovernanceInsight {
  title: string
  explanation: string
  metric: string
  action: string
}

export function generateInsights(reviews: ReviewRecord[], latest: ReviewRecord[]): GovernanceInsight[] {
  const insights: GovernanceInsight[] = []
  if (reviews.length === 0) {
    insights.push({
      title: 'No review data available',
      explanation: 'Submit content in Content Review Studio to generate scorecard metrics.',
      metric: '0 reviews',
      action: 'Open Content Review Studio and run a brand review.',
    })
    return insights
  }

  const unresolvedFindings = latest.flatMap((r) => r.findings.filter(unresolved))
  const criticalCount = unresolvedFindings.filter((f) => f.severity === 'critical').length

  // Most common unresolved category
  const categoryCounts = new Map<string, number>()
  unresolvedFindings.forEach((f) => {
    categoryCounts.set(f.category, (categoryCounts.get(f.category) ?? 0) + 1)
  })
  const topCategory = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (topCategory && topCategory[1] > 0) {
    insights.push({
      title: `${CATEGORY_LABELS[topCategory[0] as BrandKnowledgeCategory] ?? topCategory[0]} issues are the most frequent unresolved risk`,
      explanation: `Unresolved findings are concentrated in this category across the latest reviews.`,
      metric: `${topCategory[1]} unresolved finding${topCategory[1] === 1 ? '' : 's'}`,
      action: 'Review the related brand rules and affected content.',
    })
  }

  if (criticalCount > 0) {
    insights.push({
      title: 'Unresolved critical findings require human review',
      explanation: 'Critical findings remain visible regardless of overall score.',
      metric: `${criticalCount} unresolved critical finding${criticalCount === 1 ? '' : 's'}`,
      action: 'Open the affected reviews and resolve critical issues before approval.',
    })
  }

  const avg = averageScore(latest)
  if (avg >= 80 && criticalCount > 0) {
    insights.push({
      title: 'High scores do not override critical findings',
      explanation: 'The average score is high, but unresolved critical findings remain.',
      metric: `Average score ${avg}/100`,
      action: 'Address critical findings before considering content ready.',
    })
  }

  const accessibilityFindings = latest.flatMap((r) => r.findings.filter((f) => f.category === 'accessibility')).length
  if (accessibilityFindings === 0) {
    insights.push({
      title: 'Accessibility checks have limited evidence',
      explanation: 'No accessibility findings were detected, but coverage is text-based and may be incomplete.',
      metric: '0 accessibility findings',
      action: 'Review accessibility rules and submit more content for analysis.',
    })
  }

  insights.push({
    title: 'Visual guidelines were not evaluated',
    explanation: 'Visual checks are marked as not evaluated for text-only submissions.',
    metric: 'Not evaluated',
    action: 'Open Brand Knowledge Hub to review visual rules.',
  })

  if (latest.length < 2) {
    insights.push({
      title: 'Limited review history for comparison',
      explanation: 'Trend analysis needs more reviews to identify patterns.',
      metric: `${latest.length} latest review${latest.length === 1 ? '' : 's'}`,
      action: 'Submit additional content for analysis.',
    })
  }

  return insights
}