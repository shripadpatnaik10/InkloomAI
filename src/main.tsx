import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { BrandKnowledgeProvider } from './context/BrandKnowledgeContext'
import { ReviewRecordsProvider } from './context/ReviewRecordsContext'
import { ApprovalProvider } from './context/ApprovalContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrandKnowledgeProvider>
        <ReviewRecordsProvider>
          <ApprovalProvider>
            <App />
          </ApprovalProvider>
        </ReviewRecordsProvider>
      </BrandKnowledgeProvider>
    </AuthProvider>
  </StrictMode>,
)