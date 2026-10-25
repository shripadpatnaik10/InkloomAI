import type { ReviewContentType } from './review'

export type ApprovalStatus =
  | 'draft'
  | 'submitted'
  | 'in-review'
  | 'changes-requested'
  | 'resubmitted'
  | 'approved'
  | 'rejected'
  | 'reopened'

export type DemoRole = 'creator' | 'reviewer' | 'admin'

export interface ReviewerComment {
  id: string
  actor: string
  role: DemoRole
  text: string
  createdAt: string
}

export interface ReviewDecision {
  id: string
  type: 'submit' | 'assign' | 'start-review' | 'request-changes' | 'resubmit' | 'approve' | 'reject' | 'reopen' | 'comment'
  actor: string
  role: DemoRole
  reason?: string
  createdAt: string
}

export interface ApprovalActivity {
  id: string
  event: string
  description: string
  actor: string
  role: DemoRole
  createdAt: string
}

export interface DemoReviewSummary {
  score: number
  critical: number
  high: number
  medium: number
  low: number
  outdated?: boolean
}

export interface ApprovalSubmission {
  id: string
  title: string
  contentType: ReviewContentType
  submitter: string
  assignedReviewer: string | null
  status: ApprovalStatus
  createdAt: string
  updatedAt: string
  content: string
  contentVersion: number
  reviewedContentVersion?: number
  linkedReviewId?: string
  demoReview?: DemoReviewSummary
  highRiskAcknowledged: boolean
  comments: ReviewerComment[]
  decisions: ReviewDecision[]
  activity: ApprovalActivity[]
}

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted for Review',
  'in-review': 'In Review',
  'changes-requested': 'Changes Requested',
  resubmitted: 'Resubmitted',
  approved: 'Approved',
  rejected: 'Rejected',
  reopened: 'Reopened',
}

export const DEMO_ROLE_LABELS: Record<DemoRole, string> = {
  creator: 'Content Creator',
  reviewer: 'Reviewer',
  admin: 'Administrator',
}