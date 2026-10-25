import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, RotateCcw } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ContentEditor from '../components/review/ContentEditor'
import ReviewResults from '../components/review/ReviewResults'
import ReviewHistory from '../components/review/ReviewHistory'
import { useBrandKnowledge } from '../context/BrandKnowledgeContext'
import { useReviewRecords } from '../context/ReviewRecordsContext'
import { contentApi, reviewsApi } from '../lib/api'
import type { Finding, ReviewRecord, ReviewContentType } from '../types/review'

// remove unused import above by not importing createBrandKnowledgeEntry

export default function ContentReview() {
  const { entries: brandEntries } = useBrandKnowledge()
  const { reviews, addReview } = useReviewRecords()
  const [title, setTitle] = useState('')
  const [contentType, setContentType] = useState<ReviewContentType>('social')
  const [content, setContent] = useState('')
  const [fileError, setFileError] = useState('')
  const [currentReview, setCurrentReview] = useState<ReviewRecord | null>(null)
  const [searchParams] = useSearchParams()
  const reviewHistory = reviews.filter((r) => r.id !== currentReview?.id)

  // oxlint-disable react/set-state-in-effect
  useEffect(() => {
    const id = searchParams.get('review')
    if (!id || currentReview?.id === id) return
    const found = reviews.find((r) => r.id === id)
    if (found) {
      setTitle(found.title)
      setContentType(found.contentType)
      setContent(found.content)
      setCurrentReview({ ...found, findings: found.findings.map((f) => ({ ...f })) })
    }
  }, [searchParams, reviews, currentReview])
  // oxlint-enable react/set-state-in-effect
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  const handleFileUpload = (file: File) => {
    const supported = file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md') || file.type === 'text/plain' || file.type === 'text/markdown'
    if (!supported) {
      setFileError('Unsupported file type. Please upload a .txt or .md file.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setContent(String(reader.result ?? ''))
      setFileError('')
    }
    reader.onerror = () => setFileError('Could not read the selected file.')
    reader.readAsText(file)
  }

  const runReview = async () => {
    if (!content.trim()) {
      setError('Content is required before running a review.')
      return
    }
    setError('')
    setLoading(true)
    try {
      if (currentReview) {
        addReview(currentReview)
      }
      const contentRecord = await contentApi.create({
        title: title.trim() || 'Untitled review',
        content_type: contentType,
        content,
        created_by: 'demo-creator',
      })
      const backendReview = await reviewsApi.create(contentRecord.id, 'demo-creator')
      const findings = backendReview.findings.map((f) => {
        const matched = f.original_excerpt
        return {
          id: f.id,
          title: `Finding: ${matched}`,
          category: f.category as Finding['category'],
          severity: f.severity as Finding['severity'],
          matchedText: matched,
          excerpt: matched,
          explanation: f.explanation,
          recommendation: f.suggested_correction ?? 'Review the applicable brand rule.',
          suggestedReplacement: f.suggested_correction ?? undefined,
          sourceRuleId: f.brand_rule_id ?? undefined,
          sourceRuleTitle: brandEntries.find((e) => e.id === f.brand_rule_id)?.title,
          status: f.status as Finding['status'],
          startIndex: content.indexOf(matched),
        }
      })
      const unresolvedCritical = findings.filter((f) => f.severity === 'critical' && f.status !== 'resolved' && f.status !== 'dismissed').length
      const unresolvedHigh = findings.filter((f) => f.severity === 'high' && f.status !== 'resolved' && f.status !== 'dismissed').length
      const review: ReviewRecord = {
        id: backendReview.id,
        title: contentRecord.title,
        contentType,
        content,
        createdAt: backendReview.analyzed_at,
        score: backendReview.score ?? 0,
        findings,
        status: unresolvedCritical > 0 ? 'awaiting-approval' : 'reviewed',
        unresolvedCritical,
        unresolvedHigh,
        analysisMode: backendReview.analysis_mode as 'real_ai' | 'demo',
        modelName: backendReview.model_name,
      }
      addReview(review)
      setCurrentReview(review)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to run review.')
    } finally {
      setLoading(false)
    }
  }

  const updateFinding = (findingId: string, updater: (f: Finding) => Finding) => {
    setCurrentReview((prev) => {
      if (!prev) return prev
      const findings = prev.findings.map((f) => (f.id === findingId ? updater(f) : f))
      const unresolvedCritical = findings.filter((f) => f.severity === 'critical' && f.status !== 'resolved' && f.status !== 'dismissed').length
      const unresolvedHigh = findings.filter((f) => f.severity === 'high' && f.status !== 'resolved' && f.status !== 'dismissed').length
      const updated = {
        ...prev,
        findings,
        unresolvedCritical,
        unresolvedHigh,
        status: (unresolvedCritical > 0 ? 'awaiting-approval' : 'reviewed') as 'draft' | 'reviewed' | 'awaiting-approval',
      }
      addReview(updated)
      return updated
    })
  }

  const acceptFinding = async (finding: Finding) => {
    let newContent = content
    if (finding.suggestedReplacement && finding.matchedText) {
      const occurrences = content.split(finding.matchedText).length - 1
      if (occurrences <= 0) {
        // no change
      } else if (occurrences === 1) {
        newContent = content.replace(finding.matchedText, finding.suggestedReplacement)
      } else {
        const ok = window.confirm(`"${finding.matchedText}" appears ${occurrences} times. Replace all occurrences?`)
        if (ok) {
          newContent = content.split(finding.matchedText).join(finding.suggestedReplacement)
        }
      }
    }
    setContent(newContent)
    try {
      await reviewsApi.updateFinding(finding.id, 'accepted')
    } catch {
      // keep local state if backend unavailable
    }
    updateFinding(finding.id, (f) => ({ ...f, status: 'accepted' }))
  }

  const dismissFinding = async (finding: Finding) => {
    const reason = window.prompt('Reason for dismissal (optional):') ?? ''
    try {
      await reviewsApi.updateFinding(finding.id, 'dismissed')
    } catch {
      // keep local state if backend unavailable
    }
    updateFinding(finding.id, (f) => ({ ...f, status: 'dismissed', dismissalReason: reason.trim() || undefined }))
  }

  const resolveFinding = async (finding: Finding) => {
    try {
      await reviewsApi.updateFinding(finding.id, 'resolved')
    } catch {
      // keep local state if backend unavailable
    }
    updateFinding(finding.id, (f) => ({ ...f, status: 'resolved' }))
  }

  const newReview = () => {
    setTitle('')
    setContentType('social')
    setContent('')
    setCurrentReview(null)
    setError('')
    setFileError('')
  }

  const reopenReview = (review: ReviewRecord) => {
    setTitle(review.title)
    setContentType(review.contentType)
    setContent(review.content)
    setCurrentReview({ ...review, findings: review.findings.map((f) => ({ ...f })) })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Content Review Studio</h2>
          <p className="text-sm text-slate-500 mt-1">
            Submit content for a simulated brand-compliance review against the Brand Knowledge Hub. Results are heuristic and may miss issues.
          </p>
        </div>
        <Button onClick={newReview}>
          <Plus size={16} /> New Review
        </Button>
      </div>

      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-2">
        Simulated analysis only. Findings are generated by deterministic frontend checks, not a real AI model.
      </p>

      <Card title="Content submission">
        <ContentEditor
          title={title}
          setTitle={setTitle}
          contentType={contentType}
          setContentType={setContentType}
          content={content}
          setContent={setContent}
          wordCount={wordCount}
          onFileUpload={handleFileUpload}
          fileError={fileError}
        />
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <div className="flex gap-3 mt-4">
          <Button onClick={runReview} disabled={loading}>
            {loading ? 'Running review...' : 'Run Brand Review'}
          </Button>
          {currentReview && (
            <Button variant="secondary" onClick={runReview} disabled={loading}>
              <RotateCcw size={16} /> Re-run Review
            </Button>
          )}
        </div>
      </Card>

      {loading && (
        <Card>
          <p className="text-sm text-slate-500">Running simulated brand review...</p>
        </Card>
      )}

      {currentReview && !loading && (
        <>
          <ReviewResults
            review={currentReview}
            onAccept={acceptFinding}
            onDismiss={dismissFinding}
            onResolve={resolveFinding}
          />
          <p className="text-xs text-slate-500">
            Analysis mode: {currentReview.analysisMode ?? 'demo'}
            {currentReview.modelName ? ` · Model: ${currentReview.modelName}` : ''}
          </p>
        </>
      )}

      <Card title="Recent reviews" subtitle="Session history">
        <ReviewHistory history={reviewHistory} onReopen={reopenReview} />
      </Card>
    </div>
  )
}