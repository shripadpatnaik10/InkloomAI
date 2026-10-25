export type BrandKnowledgeCategory =
  | 'voice'
  | 'terminology'
  | 'facts'
  | 'claims'
  | 'visual'
  | 'accessibility'

export type BrandKnowledgeSeverity = 'critical' | 'high' | 'medium' | 'low'

export type BrandKnowledgeStatus = 'active' | 'inactive'

export interface BrandKnowledgeEntry {
  id: string
  title: string
  category: BrandKnowledgeCategory
  description: string
  severity: BrandKnowledgeSeverity
  status: BrandKnowledgeStatus
  source?: string
  effectiveDate?: string
  createdAt: string
  updatedAt: string
  tags?: string[]

  // Terminology
  preferredTerm?: string
  restrictedTerms?: string[]
  usageExample?: string

  // Approved facts
  factType?: string
  factValue?: string

  // Claims and restrictions
  restrictedClaim?: string
  rationale?: string
  approvedAlternative?: string
  evidenceRequired?: boolean

  // Visual guidelines
  colorName?: string
  colorCode?: string
  typography?: string
  logoUsage?: string
  imageRule?: string

  // Accessibility
  wcagCriterion?: string
  impact?: string
}

export const BRAND_KNOWLEDGE_CATEGORY_LABELS: Record<BrandKnowledgeCategory, string> = {
  voice: 'Brand voice & tone',
  terminology: 'Approved terminology',
  facts: 'Approved facts',
  claims: 'Claims & restrictions',
  visual: 'Visual brand guidelines',
  accessibility: 'Accessibility guidelines',
}

export const BRAND_KNOWLEDGE_CATEGORY_DESCRIPTIONS: Record<BrandKnowledgeCategory, string> = {
  voice: 'Tone, audience, and language standards for all content.',
  terminology: 'Preferred and restricted terms for consistent wording.',
  facts: 'Verified product and brand facts used as reference.',
  claims: 'Restricted promotional claims and approved alternatives.',
  visual: 'Colours, typography, logo, and image usage rules.',
  accessibility: 'Readability and inclusive design requirements.',
}