import { createContext, useContext, useState } from 'react'
import type { ApprovalSubmission, DemoRole } from '../types/approval'
import { createActivity } from '../utils/approval'

const now = new Date().toISOString()
const earlier = new Date(Date.now() - 86400000).toISOString()

const seed: ApprovalSubmission[] = [
  {
    id: 'ap1',
    title: 'Spring Campaign Post',
    contentType: 'social',
    submitter: 'Demo Creator',
    assignedReviewer: 'Demo Reviewer',
    status: 'submitted',
    createdAt: earlier,
    updatedAt: earlier,
    content: 'Hey users! Get our amazing product for just ₹999. Guaranteed results for everyone!',
    contentVersion: 1,
    reviewedContentVersion: 1,
    demoReview: { score: 92, critical: 0, high: 0, medium: 1, low: 1 },
    highRiskAcknowledged: false,
    comments: [],
    decisions: [],
    activity: [
      createActivity('submission-created', 'Submission created by Demo Creator.', 'Demo Creator', 'creator'),
      createActivity('submitted-for-review', 'Submitted for human review.', 'Demo Creator', 'creator'),
    ],
  },
  {
    id: 'ap2',
    title: 'Homepage Hero Banner',
    contentType: 'ad',
    submitter: 'Demo Creator',
    assignedReviewer: 'Demo Reviewer',
    status: 'in-review',
    createdAt: earlier,
    updatedAt: now,
    content: 'Buy now for ₹1,299. Guaranteed satisfaction for all users!',
    contentVersion: 1,
    reviewedContentVersion: 1,
    demoReview: { score: 45, critical: 2, high: 1, medium: 0, low: 0 },
    highRiskAcknowledged: false,
    comments: [],
    decisions: [],
    activity: [
      createActivity('submission-created', 'Submission created by Demo Creator.', 'Demo Creator', 'creator'),
      createActivity('submitted-for-review', 'Submitted for human review.', 'Demo Creator', 'creator'),
      createActivity('reviewer-assigned', 'Reviewer assigned: Demo Reviewer.', 'Demo Admin', 'admin'),
      createActivity('review-started', 'Review started by Demo Reviewer.', 'Demo Reviewer', 'reviewer'),
    ],
  },
  {
    id: 'ap3',
    title: 'Product Launch Email',
    contentType: 'email',
    submitter: 'Demo Creator',
    assignedReviewer: 'Demo Reviewer',
    status: 'changes-requested',
    createdAt: earlier,
    updatedAt: now,
    content: 'Discover our product for ₹1,499 and explore how it can support your needs.',
    contentVersion: 2,
    reviewedContentVersion: 1,
    demoReview: { score: 82, critical: 0, high: 1, medium: 0, low: 0 },
    highRiskAcknowledged: false,
    comments: [{ id: 'c1', actor: 'Demo Reviewer', role: 'reviewer', text: 'Soften the promotional wording.', createdAt: earlier }],
    decisions: [],
    activity: [
      createActivity('submission-created', 'Submission created by Demo Creator.', 'Demo Creator', 'creator'),
      createActivity('submitted-for-review', 'Submitted for human review.', 'Demo Creator', 'creator'),
      createActivity('changes-requested', 'Changes requested: Soften the promotional wording.', 'Demo Reviewer', 'reviewer'),
    ],
  },
  {
    id: 'ap4',
    title: 'Blog: Getting Started',
    contentType: 'blog',
    submitter: 'Demo Creator',
    assignedReviewer: 'Demo Reviewer',
    status: 'approved',
    createdAt: earlier,
    updatedAt: now,
    content: 'Learn how our product helps customers succeed with clear guidance.',
    contentVersion: 1,
    reviewedContentVersion: 1,
    demoReview: { score: 91, critical: 0, high: 0, medium: 0, low: 0 },
    highRiskAcknowledged: true,
    comments: [],
    decisions: [],
    activity: [
      createActivity('submission-created', 'Submission created by Demo Creator.', 'Demo Creator', 'creator'),
      createActivity('approved', 'Content approved by Demo Reviewer.', 'Demo Reviewer', 'reviewer'),
    ],
  },
  {
    id: 'ap5',
    title: 'Instagram Story Copy',
    contentType: 'social',
    submitter: 'Demo Creator',
    assignedReviewer: null,
    status: 'rejected',
    createdAt: earlier,
    updatedAt: now,
    content: 'Amazing deals for users! Try today.',
    contentVersion: 1,
    reviewedContentVersion: 1,
    demoReview: { score: 67, critical: 0, high: 0, medium: 2, low: 1 },
    highRiskAcknowledged: false,
    comments: [],
    decisions: [],
    activity: [
      createActivity('submission-created', 'Submission created by Demo Creator.', 'Demo Creator', 'creator'),
      createActivity('rejected', 'Content rejected: Does not meet brand standards.', 'Demo Reviewer', 'reviewer'),
    ],
  },
]

interface ApprovalContextValue {
  submissions: ApprovalSubmission[]
  setSubmissions: React.Dispatch<React.SetStateAction<ApprovalSubmission[]>>
  role: DemoRole
  setRole: (role: DemoRole) => void
}

const ApprovalContext = createContext<ApprovalContextValue | null>(null)

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const [submissions, setSubmissions] = useState<ApprovalSubmission[]>(seed)
  const [role, setRole] = useState<DemoRole>('reviewer')
  return (
    <ApprovalContext.Provider value={{ submissions, setSubmissions, role, setRole }}>
      {children}
    </ApprovalContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useApproval() {
  const ctx = useContext(ApprovalContext)
  if (!ctx) throw new Error('useApproval must be used within ApprovalProvider')
  return ctx
}