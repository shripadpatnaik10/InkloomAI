import type { BrandKnowledgeEntry } from '../types/brand'
import type { EvaluationNote, Finding, FindingSeverity, FindingStatus } from '../types/review'

const TONE_KEYWORDS: { phrase: string; severity: FindingSeverity; label: string }[] = [
  { phrase: 'hey', severity: 'low', label: 'casual greeting' },
  { phrase: 'amazing', severity: 'low', label: 'exaggerated adjective' },
  { phrase: 'awesome', severity: 'low', label: 'exaggerated adjective' },
  { phrase: 'guys', severity: 'low', label: 'informal address' },
  { phrase: 'act now', severity: 'medium', label: 'aggressive call to action' },
  { phrase: 'limited time', severity: 'medium', label: 'urgency claim' },
  { phrase: 'hurry', severity: 'medium', label: 'urgency language' },
  { phrase: 'don\'t miss', severity: 'medium', label: 'urgency language' },
  { phrase: 'guaranteed', severity: 'high', label: 'absolute guarantee' },
]

let findingCounter = 0
function nextId() {
  findingCounter += 1
  return `f${Date.now()}-${findingCounter}`
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function excerptFor(text: string, index: number, length: number) {
  const start = Math.max(0, index - 40)
  const end = Math.min(text.length, index + length + 40)
  return text.slice(start, end).trim()
}

function findOccurrences(text: string, term: string): { index: number; matched: string }[] {
  const results: { index: number; matched: string }[] = []
  if (!term.trim()) return results
  const lowerTerm = term.toLowerCase()
  // Word-boundary regex for simple single tokens; fall back to indexOf for phrases.
  const isSimpleToken = /^\w+$/.test(term)
  if (isSimpleToken) {
    const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi')
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      results.push({ index: match.index, matched: match[0] })
    }
    return results
  }
  let from = 0
  while (true) {
    const idx = text.toLowerCase().indexOf(lowerTerm, from)
    if (idx === -1) break
    results.push({ index: idx, matched: text.slice(idx, idx + term.length) })
    from = idx + term.length
  }
  return results
}

function makeFinding(params: Omit<Finding, 'id' | 'status'> & { status?: FindingStatus }): Finding {
  return {
    id: nextId(),
    status: params.status ?? 'open',
    ...params,
  }
}

function normalisePrice(value: string) {
  return value.replace(/[₹$,\s]/g, '').replace(/rs\.?/gi, '').toLowerCase()
}

export function analyzeContent(content: string, brandEntries: BrandKnowledgeEntry[]): {
  findings: Finding[]
  score: number
  notes: EvaluationNote[]
} {
  const findings: Finding[] = []
  const dedupe = new Set<string>()

  const addFinding = (finding: Finding) => {
    const key = `${finding.sourceRuleId ?? finding.category}-${finding.matchedText.toLowerCase()}-${finding.startIndex ?? 0}`
    if (dedupe.has(key)) return
    dedupe.add(key)
    findings.push(finding)
  }

  const activeEntries = brandEntries.filter((e) => e.status === 'active')

  // 1. Restricted claims
  activeEntries
    .filter((e) => e.category === 'claims' && e.restrictedClaim)
    .forEach((entry) => {
      findOccurrences(content, entry.restrictedClaim as string).forEach((occ) => {
        addFinding(
          makeFinding({
            title: `Restricted claim detected: ${entry.title}`,
            category: 'claims',
            severity: entry.severity,
            matchedText: occ.matched,
            excerpt: excerptFor(content, occ.index, occ.matched.length),
            explanation:
              entry.description +
              (entry.rationale ? ` Rationale: ${entry.rationale}` : ''),
            recommendation:
              entry.approvedAlternative ||
              'Remove or replace this claim with an approved, evidence-backed alternative.',
            suggestedReplacement: entry.approvedAlternative,
            sourceRuleId: entry.id,
            sourceRuleTitle: entry.title,
            startIndex: occ.index,
          })
        )
      })
    })

  // 2. Terminology
  activeEntries
    .filter((e) => e.category === 'terminology' && e.restrictedTerms && e.restrictedTerms.length > 0)
    .forEach((entry) => {
      const preferred = entry.preferredTerm
      entry.restrictedTerms?.forEach((term) => {
        findOccurrences(content, term).forEach((occ) => {
          addFinding(
            makeFinding({
              title: `Non-approved terminology: "${term}"`,
              category: 'terminology',
              severity: entry.severity,
              matchedText: occ.matched,
              excerpt: excerptFor(content, occ.index, occ.matched.length),
              explanation: entry.description,
              recommendation: preferred
                ? `Use "${preferred}" instead of "${term}".`
                : 'Use the approved terminology defined in the Brand Knowledge Hub.',
              suggestedReplacement: preferred,
              sourceRuleId: entry.id,
              sourceRuleTitle: entry.title,
              startIndex: occ.index,
            })
          )
        })
      })
    })

  // 3. Approved facts (price conflicts)
  const priceFacts = activeEntries.filter(
    (e) => e.category === 'facts' && e.factType?.toLowerCase().includes('price') && e.factValue
  )
  const priceRegex = /(?:₹|rs\.?|inr)\s?[\d,]+(?:\.\d+)?/gi
  let priceMatch: RegExpExecArray | null
  while ((priceMatch = priceRegex.exec(content)) !== null) {
    const foundPrice = priceMatch[0]
    const priceIndex = priceMatch.index
    priceFacts.forEach((entry) => {
      if (normalisePrice(foundPrice) !== normalisePrice(entry.factValue as string)) {
        addFinding(
          makeFinding({
            title: `Fact conflict: ${entry.title}`,
            category: 'facts',
            severity: entry.severity,
            matchedText: foundPrice,
            excerpt: excerptFor(content, priceIndex, foundPrice.length),
            explanation: `The content states ${foundPrice}, which conflicts with the approved fact "${entry.title}" (${entry.factValue}).`,
            recommendation: `Use the approved value ${entry.factValue}.`,
            suggestedReplacement: entry.factValue,
            sourceRuleId: entry.id,
            sourceRuleTitle: entry.title,
            startIndex: priceIndex,
          })
        )
      }
    })
  }

  // 4. Brand tone (simple keyword checks)
  const voiceRules = activeEntries.filter((e) => e.category === 'voice')
  const voiceSource = voiceRules[0]
  TONE_KEYWORDS.forEach(({ phrase, severity, label }) => {
    findOccurrences(content, phrase).forEach((occ) => {
      addFinding(
        makeFinding({
          title: `Tone check: ${label}`,
          category: 'voice',
          severity,
          matchedText: occ.matched,
          excerpt: excerptFor(content, occ.index, occ.matched.length),
          explanation: `The phrase "${occ.matched}" may not fit the specified brand voice. ${voiceSource?.description ?? ''}`.trim(),
          recommendation: 'Adjust wording to a professional, friendly, and trustworthy tone.',
          sourceRuleId: voiceSource?.id,
          sourceRuleTitle: voiceSource?.title ?? 'Brand voice and tone',
          startIndex: occ.index,
        })
      )
    })
  })

  // 5. Accessibility (text-detectable)
  const accessibilityRules = activeEntries.filter((e) => e.category === 'accessibility')
  const accessibilitySource = accessibilityRules[0]
  const emptyAltMatches = content.match(/!\[\s*\]\([^)]*\)/g)
  if (emptyAltMatches) {
    addFinding(
      makeFinding({
        title: 'Missing alternative text for image',
        category: 'accessibility',
        severity: accessibilitySource?.severity ?? 'medium',
        matchedText: emptyAltMatches[0],
        excerpt: emptyAltMatches[0],
        explanation: 'An image is present without descriptive alternative text.',
        recommendation: 'Provide descriptive alternative text for meaningful images.',
        sourceRuleId: accessibilitySource?.id,
        sourceRuleTitle: accessibilitySource?.title ?? 'Accessibility guidelines',
      })
    )
  }
  const mentionsImage = /\bimage\b|\bimg\b|<img/i.test(content)
  const mentionsAlt = /\balt\b/i.test(content)
  if (mentionsImage && !mentionsAlt) {
    addFinding(
      makeFinding({
        title: 'Possible missing alternative text',
        category: 'accessibility',
        severity: accessibilitySource?.severity ?? 'medium',
        matchedText: 'image',
        excerpt: excerptFor(content, content.toLowerCase().indexOf('image'), 5),
        explanation: 'Content references an image but does not mention alternative text.',
        recommendation: 'Add descriptive alternative text for meaningful images.',
        sourceRuleId: accessibilitySource?.id,
        sourceRuleTitle: accessibilitySource?.title ?? 'Accessibility guidelines',
      })
    )
  }

  // Score
  const weights: Record<FindingSeverity, number> = { critical: 25, high: 15, medium: 8, low: 3 }
  let score = 100
  findings.forEach((f) => {
    score -= weights[f.severity]
  })
  score = Math.max(0, Math.min(100, score))

  const notes: EvaluationNote[] = [
    { label: 'Brand tone', status: 'evaluated', note: 'Checked with configurable keyword and phrase heuristics.' },
    { label: 'Terminology', status: 'evaluated', note: 'Checked against approved terminology rules.' },
    { label: 'Approved facts', status: 'evaluated', note: 'Checked price statements against configured approved facts.' },
    { label: 'Restricted claims', status: 'evaluated', note: 'Checked for configured restricted phrases.' },
    { label: 'Accessibility', status: 'evaluated', note: 'Checked text for basic accessibility signals.' },
    { label: 'Visual guidelines', status: 'not-evaluated', note: 'Not evaluated because the submitted text does not provide sufficient visual information.' },
  ]

  return { findings, score, notes }
}

export function severityCounts(findings: Finding[]) {
  return findings.reduce(
    (acc, f) => {
      acc[f.severity] += 1
      return acc
    },
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<FindingSeverity, number>
  )
}