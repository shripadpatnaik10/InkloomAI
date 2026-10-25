import { createContext, useContext, useState } from 'react'
import type { ReviewRecord } from '../types/review'

interface ReviewRecordsContextValue {
  reviews: ReviewRecord[]
  addReview: (review: ReviewRecord) => void
}

const ReviewRecordsContext = createContext<ReviewRecordsContextValue | null>(null)

export function ReviewRecordsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const addReview = (review: ReviewRecord) => {
    setReviews((prev) => {
      const without = prev.filter((r) => r.id !== review.id)
      return [review, ...without]
    })
  }
  return (
    <ReviewRecordsContext.Provider value={{ reviews, addReview }}>
      {children}
    </ReviewRecordsContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useReviewRecords() {
  const ctx = useContext(ReviewRecordsContext)
  if (!ctx) throw new Error('useReviewRecords must be used within ReviewRecordsProvider')
  return ctx
}