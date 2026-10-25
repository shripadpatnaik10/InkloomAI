import type { BrandKnowledgeCategory } from './brand'

export type ReviewContentType = 'social' | 'blog' | 'ad' | 'email' | 'website' | 'other'

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low'

export type FindingStatus = 'open' | 'accepted' | 'dismissed' | 'resolved'

export interface Finding {
  id: string
  title: string
  category: BrandKnowledgeCategory
  severity: FindingSeverity
  matchedText: string
  excerpt: string
  explanation: string
  recommendation: string
  suggestedReplacement?: string
  sourceRuleId?: string
  sourceRuleTitle?: string
  status: FindingStatus
  dismissalReason?: string
  startIndex?: number
}

export interface ReviewRecord {
  id: string
  title: string
  contentType: ReviewContentType
  content: string
  createdAt: string
  score: number
  findings: Finding[]
  status: 'draft' | 'reviewed' | 'awaiting-approval'
  analysisMode?: 'real_ai' | 'demo'
  modelName?: string | null
  unresolvedCritical: number
  unresolvedHigh: number
}

export interface EvaluationNote {
  label: string
  status: 'evaluated' | 'not-evaluated' | 'partial'
  note: string
}

export const REVIEW_CONTENT_TYPE_LABELS: Record<ReviewContentType, string> = {
  social: 'Social Media',
  blog: 'Blog',
  ad: 'Advertisement',
  email: 'Email',
  website: 'Website Copy',
  other: 'Other',
}

export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  open: 'Open',
  accepted: 'Accepted',
  dismissed: 'Dismissed',
  resolved: 'Resolved',
}