export type IssueCategory =
  | 'factual'
  | 'brand'
  | 'tone'
  | 'terminology'
  | 'accessibility'

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface Issue {
  id: string
  category: IssueCategory
  severity: IssueSeverity
  title: string
  explanation: string
  guideline: string
  original: string
  suggestion: string
  accepted?: boolean
  rejected?: boolean
  editedSuggestion?: string
}

export type ContentType = 'social' | 'ad' | 'blog' | 'email'

export interface ContentItem {
  id: string
  title: string
  creator: string
  submittedAt: string
  contentType: ContentType
  score: number
  issueCount: number
  status: 'draft' | 'in-review' | 'changes-requested' | 'approved'
  criticalIssues: number
  content: string
  revised?: string
}

export interface Scorecard {
  overall: number
  factual: number
  brand: number
  tone: number
  accessibility: number
  creativity: number
  originalOverall: number
  revisedOverall: number
  strengths: string[]
  improvements: string[]
  unresolvedCritical: number
}

export interface BrandRule {
  id: string
  category: 'voice' | 'terminology' | 'facts' | 'claims' | 'colors' | 'accessibility'
  title: string
  description: string
}

export interface Activity {
  id: string
  actor: string
  action: string
  target: string
  time: string
}

export interface QualityPoint {
  date: string
  score: number
}

export interface IssueDistribution {
  category: string
  count: number
}

export interface FeedbackItem {
  id: string
  creator: string
  suggestion: string
  verdict: 'accepted' | 'rejected' | 'disputed'
  comment: string
}

export interface DisputedFinding {
  id: string
  finding: string
  reason: string
  status: 'open' | 'resolved'
}

export interface RecurringProblem {
  id: string
  guideline: string
  occurrences: number
  note: string
}
export * from './brand'
