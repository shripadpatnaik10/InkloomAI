import type {
  Activity,
  BrandRule,
  ContentItem,
  DisputedFinding,
  FeedbackItem,
  Issue,
  IssueDistribution,
  QualityPoint,
  RecurringProblem,
  Scorecard,
} from '../types'

export const SAMPLE_ORIGINAL =
  'Hey users! Get our amazing product for just ₹999. Guaranteed results for everyone!'

export const SAMPLE_REVISED =
  'Discover our product for ₹1,499 and explore how it can support your needs.'

export const SAMPLE_ISSUES: Issue[] = [
  {
    id: 'i1',
    category: 'factual',
    severity: 'critical',
    title: 'Incorrect price',
    explanation: 'The draft states ₹999, which conflicts with the approved product price of ₹1,499.',
    guideline: 'Approved product price must be ₹1,499 in all customer-facing content.',
    original: '₹999',
    suggestion: '₹1,499',
  },
  {
    id: 'i2',
    category: 'terminology',
    severity: 'medium',
    title: 'Terminology violation',
    explanation: 'Customer-facing content must use "customers" rather than "users".',
    guideline: 'Approved terminology: use "customers" instead of "users".',
    original: 'users',
    suggestion: 'customers',
  },
  {
    id: 'i3',
    category: 'brand',
    severity: 'critical',
    title: 'Unsupported promotional claim',
    explanation: '"Guaranteed results for everyone" is an unsupported guarantee and is prohibited.',
    guideline: 'Unsupported guarantees are prohibited in all promotional content.',
    original: 'Guaranteed results for everyone',
    suggestion: 'Explore how it can support your needs',
  },
  {
    id: 'i4',
    category: 'tone',
    severity: 'low',
    title: 'Tone mismatch',
    explanation: '"Hey" and "amazing" may not fit the specified professional, friendly, trustworthy brand voice.',
    guideline: 'Brand tone must be professional, friendly, and trustworthy.',
    original: 'Hey ... amazing',
    suggestion: 'Discover ...',
  },
]

export const SAMPLE_SCORECARD: Scorecard = {
  overall: 58,
  factual: 40,
  brand: 45,
  tone: 62,
  accessibility: 78,
  creativity: 70,
  originalOverall: 58,
  revisedOverall: 86,
  strengths: [
    'Clear call to action',
    'Concise message length',
    'Accessible reading level',
  ],
  improvements: [
    'Correct the product price to ₹1,499',
    'Replace "users" with "customers"',
    'Remove unsupported guarantee claim',
    'Adjust tone to professional and trustworthy',
  ],
  unresolvedCritical: 2,
}

export const BRAND_RULES: BrandRule[] = [
  {
    id: 'b1',
    category: 'voice',
    title: 'Brand voice and tone',
    description: 'Professional, friendly, and trustworthy. Avoid slang, hype, and exaggerated claims.',
  },
  {
    id: 'b2',
    category: 'terminology',
    title: 'Approved terminology',
    description: 'Use "customers" instead of "users" in all customer-facing content.',
  },
  {
    id: 'b3',
    category: 'facts',
    title: 'Approved product price',
    description: 'Approved product price is ₹1,499. Do not state any other price.',
  },
  {
    id: 'b4',
    category: 'claims',
    title: 'Prohibited promotional claims',
    description: 'Unsupported guarantees such as "guaranteed results" are prohibited.',
  },
  {
    id: 'b5',
    category: 'colors',
    title: 'Brand colours',
    description: 'Primary #1e3a8a, Secondary #0ea5e9, Accent #f59e0b. Use on white backgrounds.',
  },
  {
    id: 'b6',
    category: 'accessibility',
    title: 'Accessibility requirements',
    description: 'Minimum contrast ratio 4.5:1, alt text for images, plain language, max grade 8 reading level.',
  },
]

export const CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'c1',
    title: 'Spring Campaign Post',
    creator: 'Aarav Mehta',
    submittedAt: '2026-10-20',
    contentType: 'social',
    score: 58,
    issueCount: 4,
    status: 'in-review',
    criticalIssues: 2,
    content: SAMPLE_ORIGINAL,
    revised: SAMPLE_REVISED,
  },
  {
    id: 'c2',
    title: 'Product Launch Email',
    creator: 'Priya Sharma',
    submittedAt: '2026-10-19',
    contentType: 'email',
    score: 82,
    issueCount: 1,
    status: 'approved',
    criticalIssues: 0,
    content: 'Discover our product for ₹1,499 and explore how it can support your needs.',
  },
  {
    id: 'c3',
    title: 'Homepage Hero Banner',
    creator: 'Rohan Verma',
    submittedAt: '2026-10-18',
    contentType: 'ad',
    score: 45,
    issueCount: 3,
    status: 'changes-requested',
    criticalIssues: 1,
    content: 'Buy now for ₹1,299. Guaranteed satisfaction for all users!',
  },
  {
    id: 'c4',
    title: 'Blog: Getting Started',
    creator: 'Neha Kapoor',
    submittedAt: '2026-10-17',
    contentType: 'blog',
    score: 91,
    issueCount: 0,
    status: 'approved',
    criticalIssues: 0,
    content: 'Learn how our product helps customers succeed with clear guidance.',
  },
  {
    id: 'c5',
    title: 'Instagram Story Copy',
    creator: 'Karan Singh',
    submittedAt: '2026-10-16',
    contentType: 'social',
    score: 67,
    issueCount: 2,
    status: 'draft',
    criticalIssues: 0,
    content: 'Amazing deals for users! Try today.',
  },
  {
    id: 'c6',
    title: 'Retargeting Ad Set',
    creator: 'Aarav Mehta',
    submittedAt: '2026-10-15',
    contentType: 'ad',
    score: 73,
    issueCount: 2,
    status: 'in-review',
    criticalIssues: 0,
    content: 'See why customers love our product at ₹1,499.',
  },
]

export const ACTIVITIES: Activity[] = [
  { id: 'a1', actor: 'Priya Sharma', action: 'approved', target: 'Product Launch Email', time: '2 hours ago' },
  { id: 'a2', actor: 'Rohan Verma', action: 'submitted', target: 'Homepage Hero Banner', time: '5 hours ago' },
  { id: 'a3', actor: 'Neha Kapoor', action: 'revised', target: 'Blog: Getting Started', time: '1 day ago' },
  { id: 'a4', actor: 'Karan Singh', action: 'drafted', target: 'Instagram Story Copy', time: '1 day ago' },
  { id: 'a5', actor: 'Aarav Mehta', action: 'submitted', target: 'Spring Campaign Post', time: '2 days ago' },
]

export const QUALITY_OVER_TIME: QualityPoint[] = [
  { date: 'Oct 14', score: 62 },
  { date: 'Oct 15', score: 68 },
  { date: 'Oct 16', score: 64 },
  { date: 'Oct 17', score: 75 },
  { date: 'Oct 18', score: 71 },
  { date: 'Oct 19', score: 82 },
  { date: 'Oct 20', score: 78 },
]

export const ISSUE_DISTRIBUTION: IssueDistribution[] = [
  { category: 'Factual accuracy', count: 5 },
  { category: 'Brand alignment', count: 4 },
  { category: 'Tone', count: 6 },
  { category: 'Terminology', count: 3 },
  { category: 'Accessibility', count: 2 },
]

export const FEEDBACK_ITEMS: FeedbackItem[] = [
  { id: 'f1', creator: 'Aarav Mehta', suggestion: 'Use ₹1,499 instead of ₹999', verdict: 'accepted', comment: 'Makes sense, corrected.' },
  { id: 'f2', creator: 'Rohan Verma', suggestion: 'Remove "guaranteed results"', verdict: 'disputed', comment: 'Marketing wants a softer claim instead.' },
  { id: 'f3', creator: 'Karan Singh', suggestion: 'Replace "users" with "customers"', verdict: 'accepted', comment: 'Applied across all drafts.' },
  { id: 'f4', creator: 'Neha Kapoor', suggestion: 'Soften "amazing"', verdict: 'rejected', comment: 'Kept for blog tone.' },
]

export const DISPUTED_FINDINGS: DisputedFinding[] = [
  { id: 'd1', finding: 'Tone mismatch on "amazing"', reason: 'Creator argues excitement is on-brand for campaigns.', status: 'open' },
  { id: 'd2', finding: 'Terminology "users" in internal docs', reason: 'Rule applies only to customer-facing content.', status: 'resolved' },
]

export const RECURRING_PROBLEMS: RecurringProblem[] = [
  { id: 'r1', guideline: 'Approved price ₹1,499', occurrences: 7, note: 'Creators frequently reuse old ₹999 price.' },
  { id: 'r2', guideline: 'Terminology "customers" vs "users"', occurrences: 5, note: 'Legacy copy still uses "users".' },
  { id: 'r3', guideline: 'Unsupported guarantees', occurrences: 3, note: 'Marketing requests clearer approved alternatives.' },
]

export const CATEGORY_LABELS: Record<string, string> = {
  factual: 'Factual accuracy',
  brand: 'Brand alignment',
  tone: 'Tone',
  terminology: 'Terminology',
  accessibility: 'Accessibility',
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  social: 'Social media post',
  ad: 'Advertisement',
  blog: 'Blog article',
  email: 'Email',
}