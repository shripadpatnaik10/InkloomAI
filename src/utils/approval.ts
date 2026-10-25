import type { ApprovalActivity, ApprovalStatus, ApprovalSubmission, DemoRole } from '../types/approval'
import type { ReviewRecord } from '../types/review'

export const APPROVAL_TRANSITIONS: Record<ApprovalStatus, ApprovalStatus[]> = {
  draft: ['submitted'],
  submitted: ['in-review'],
  'in-review': ['changes-requested', 'approved', 'rejected'],
  'changes-requested': ['resubmitted'],
  resubmitted: ['in-review'],
  approved: ['reopened'],
  rejected: ['reopened'],
  reopened: ['in-review'],
}

export function canTransition(from: ApprovalStatus, to: ApprovalStatus) {
  return APPROVAL_TRANSITIONS[from]?.includes(to) ?? false
}

export function createActivity(event: string, description: string, actor: string, role: DemoRole): ApprovalActivity {
  return {
    id: `act${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    event,
    description,
    actor,
    role,
    createdAt: new Date().toISOString(),
  }
}

export function getReviewSummary(submission: ApprovalSubmission, reviews: ReviewRecord[]) {
  if (submission.linkedReviewId) {
    const review = reviews.find((r) => r.id === submission.linkedReviewId)
    if (review) {
      const unresolved = review.findings.filter((f) => f.status !== 'resolved' && f.status !== 'dismissed')
      return {
        score: review.score,
        critical: unresolved.filter((f) => f.severity === 'critical').length,
        high: unresolved.filter((f) => f.severity === 'high').length,
        medium: unresolved.filter((f) => f.severity === 'medium').length,
        low: unresolved.filter((f) => f.severity === 'low').length,
        outdated: submission.reviewedContentVersion !== undefined && submission.reviewedContentVersion !== submission.contentVersion,
        review,
      }
    }
  }
  const demo = submission.demoReview ?? { score: 0, critical: 0, high: 0, medium: 0, low: 0 }
  return {
    score: demo.score,
    critical: demo.critical,
    high: demo.high,
    medium: demo.medium,
    low: demo.low,
    outdated: demo.outdated ?? false,
    review: undefined,
  }
}

export function riskLevel(summary: { critical: number; high: number; medium: number; low: number }) {
  if (summary.critical > 0) return 'Critical'
  if (summary.high > 0) return 'High'
  if (summary.medium > 0) return 'Medium'
  return 'Low'
}

export function approvalBlockedReasons(submission: ApprovalSubmission, reviews: ReviewRecord[]) {
  const reasons: string[] = []
  const summary = getReviewSummary(submission, reviews)
  if (!submission.linkedReviewId && !submission.demoReview) {
    reasons.push('No content review is linked. Run a content review first.')
  }
  if (summary.outdated) {
    reasons.push('The latest content review is outdated because the content changed after review.')
  }
  if (summary.critical > 0) {
    reasons.push(`Unresolved critical findings: ${summary.critical}.`)
  }
  if (summary.high > 0 && !submission.highRiskAcknowledged) {
    reasons.push('High-severity findings require explicit reviewer acknowledgment.')
  }
  return reasons
}

export function canApprove(submission: ApprovalSubmission, reviews: ReviewRecord[]) {
  return approvalBlockedReasons(submission, reviews).length === 0
}