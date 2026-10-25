import { Upload } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'

import { REVIEW_CONTENT_TYPE_LABELS } from '../../types/review'
import type { ReviewContentType } from '../../types/review'

interface Props {
  title: string
  setTitle: (v: string) => void
  contentType: ReviewContentType
  setContentType: (v: ReviewContentType) => void
  content: string
  setContent: (v: string) => void
  wordCount: number
  onFileUpload: (file: File) => void
  fileError: string
}

export default function ContentEditor({
  title,
  setTitle,
  contentType,
  setContentType,
  content,
  setContent,
  wordCount,
  onFileUpload,
  fileError,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Content title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Content type</label>
          <Select value={contentType} onChange={(e) => setContentType(e.target.value as ReviewContentType)}>
            {Object.entries(REVIEW_CONTENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Content source</label>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <Upload size={16} /> Upload .txt or .md
            <input
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onFileUpload(file)
                e.target.value = ''
              }}
            />
          </label>
          <span className="text-xs text-slate-400">Pasted text is the primary workflow.</span>
        </div>
        {fileError && <p className="text-sm text-red-600 mt-1">{fileError}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
        <Textarea
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type content here..."
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{wordCount} words</span>
          <span>Manual edits are preserved until re-run.</span>
        </div>
      </div>
    </div>
  )
}