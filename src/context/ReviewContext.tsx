import { createContext, useContext, useState } from 'react'
import type { Issue, Scorecard } from '../types'
import { SAMPLE_ISSUES, SAMPLE_SCORECARD, SAMPLE_REVISED } from '../data/sampleData'

interface ReviewState {
  issues: Issue[]
  scorecard: Scorecard
  analysed: boolean
  original: string
  revised: string
}

interface ReviewContextValue extends ReviewState {
  runReview: (content: string) => void
  reanalyse: (content: string) => void
}

const ReviewContext = createContext<ReviewContextValue | null>(null)

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ReviewState>({
    issues: [],
    scorecard: SAMPLE_SCORECARD,
    analysed: false,
    original: '',
    revised: '',
  })

  const runReview = (content: string) => {
    setState({
      issues: SAMPLE_ISSUES.map((i) => ({ ...i })),
      scorecard: { ...SAMPLE_SCORECARD },
      analysed: true,
      original: content,
      revised: SAMPLE_REVISED,
    })
  }

  const reanalyse = (content: string) => {
    setState({
      issues: SAMPLE_ISSUES.map((i) => ({ ...i, id: i.id + '_r' })),
      scorecard: { ...SAMPLE_SCORECARD, overall: SAMPLE_SCORECARD.overall + 2 > 100 ? 100 : SAMPLE_SCORECARD.overall + 2 },
      analysed: true,
      original: content,
      revised: SAMPLE_REVISED,
    })
  }

  return (
    <ReviewContext.Provider value={{ ...state, runReview, reanalyse }}>
      {children}
    </ReviewContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useReview() {
  const ctx = useContext(ReviewContext)
  if (!ctx) throw new Error('useReview must be used within ReviewProvider')
  return ctx
}