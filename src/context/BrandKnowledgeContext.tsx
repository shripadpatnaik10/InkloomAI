import { createContext, useContext, useState } from 'react'
import { seedBrandKnowledge } from '../data/brandRules'
import type { BrandKnowledgeEntry } from '../types/brand'

interface BrandKnowledgeContextValue {
  entries: BrandKnowledgeEntry[]
  setEntries: React.Dispatch<React.SetStateAction<BrandKnowledgeEntry[]>>
}

const BrandKnowledgeContext = createContext<BrandKnowledgeContextValue | null>(null)

export function BrandKnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<BrandKnowledgeEntry[]>(() => seedBrandKnowledge())
  return (
    <BrandKnowledgeContext.Provider value={{ entries, setEntries }}>
      {children}
    </BrandKnowledgeContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useBrandKnowledge() {
  const ctx = useContext(BrandKnowledgeContext)
  if (!ctx) throw new Error('useBrandKnowledge must be used within BrandKnowledgeProvider')
  return ctx
}