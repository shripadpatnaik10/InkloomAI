import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import ContentReview from './pages/ContentReview'
import Scorecard from './pages/Scorecard'
import BrandGuidelines from './pages/BrandGuidelines'
import ApprovalCenter from './pages/ApprovalCenter'
import FeedbackInsights from './pages/FeedbackInsights'
import Login from './pages/Login'

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/review': 'Content Review Studio',
  '/scorecard': 'Content Scorecard',
  '/guidelines': 'Brand Guidelines',
  '/approval': 'Approval Center',
  '/feedback': 'Feedback & Insights',
}

function AppLayout() {
  const location = useLocation()
  const title = titles[location.pathname] ?? 'Inkloom AI'
  return <Layout title={title} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/review" element={<ContentReview />} />
          <Route path="/scorecard" element={<Scorecard />} />
          <Route path="/guidelines" element={<BrandGuidelines />} />
          <Route path="/approval" element={<ApprovalCenter />} />
          <Route path="/feedback" element={<FeedbackInsights />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}