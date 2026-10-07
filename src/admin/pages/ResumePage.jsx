import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, FileText, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '../../api/admin'
import { fieldErrors } from '../../api/errors'
import { queryKeys } from '../../api/queryClient'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Field, Input } from '../../components/ui/Field'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState, ErrorState } from '../../components/ui/States'
import { formatBytes, formatDateTime } from '../../utils/format'
import { PageHeader } from '../components/PageHeader'
import { useAdminMutation } from '../hooks'

const MAX_KB = 5120

export default function ResumePage() {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const query = useQuery({ queryKey: queryKeys.admin.resume, queryFn: adminApi.resume.get })
  const resume = query.data?.data

  const upload = useAdminMutation('resume', () => adminApi.resume.upload(file, title || undefined, (e) => e.total && setProgress(Math.round((e.loaded / e.total) * 100))), {
    success: resume ? 'Resume replaced' : 'Resume uploaded',
    onSuccess: () => {
      setFile(null)
      setTitle('')
      setProgress(0)
    },
    onError: (e) => {
      setProgress(0)
      setError(e.isValidation ? fieldErrors(e).file ?? e.message : e.message)
    },
  })
  const remove = useAdminMutation('resume', adminApi.resume.remove, { success: 'Resume deleted', onSuccess: () => setConfirmDelete(false) })

  const pick = (f) => {
    setError(null)
    if (!f) return
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return setError('The resume must be a PDF file.')
    if (f.size > MAX_KB * 1024) return setError('The resume may not be larger than 5 MB.')
    setFile(f)
  }

  const download = async () => {
    setDownloading(true)
    try {
      const blob = await adminApi.resume.download()
      const url = URL.createObjectURL(blob)
      const a = Object.assign(document.createElement('a'), { href: url, download: resume.file_name })
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <PageHeader title="Resume" description="The PDF visitors download from the website. Uploading a new file replaces the current one." />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface rounded-2xl p-5 sm:p-6" aria-labelledby="current-resume">
          <h2 id="current-resume" className="mb-4 text-sm font-medium text-fg">Current resume</h2>
          {query.isLoading && <Skeleton className="h-28" />}
          {query.isError && <ErrorState error={query.error} onRetry={query.refetch} compact />}
          {query.isSuccess && !resume && <EmptyState icon={FileText} title="No resume uploaded" description="The Download Resume button is hidden on the website until you upload one." />}
          {resume && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-ink-900 text-ember-400"><FileText className="h-5 w-5" aria-hidden="true" /></span>
                <div className="min-w-0">
                  <p className="font-medium text-fg">{resume.title}</p>
                  <p className="truncate text-sm text-muted">{resume.original_name}</p>
                  <p className="mt-1 font-mono text-xs text-subtle">{formatBytes(resume.size)} · updated {formatDateTime(resume.updated_at)} · {resume.download_count} downloads</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={download} loading={downloading}><Download className="h-4 w-4" aria-hidden="true" /> Download</Button>
                <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</Button>
              </div>
            </div>
          )}
        </section>

        <section className="surface rounded-2xl p-5 sm:p-6" aria-labelledby="upload-resume">
          <h2 id="upload-resume" className="mb-4 text-sm font-medium text-fg">{resume ? 'Replace resume' : 'Upload resume'}</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!file) return setError('Choose a PDF file to upload.')
              upload.mutate()
            }}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                pick(e.dataTransfer.files?.[0])
              }}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--line-strong)] px-4 py-8 text-sm text-muted transition hover:bg-white/[0.02] hover:text-fg"
            >
              <Upload className="h-5 w-5" aria-hidden="true" />
              {file ? <span className="text-fg">{file.name} · {formatBytes(file.size)}</span> : 'Click or drop a PDF here (max 5 MB)'}
            </button>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" aria-label="Resume PDF file" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
            <Field label="Title" hint="Optional, e.g. “Resume — 2026”">
              {(a) => <Input {...a} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />}
            </Field>
            {error && <p role="alert" className="text-sm text-danger-400">{error}</p>}
            {upload.isPending && (
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
                <div className="h-full bg-ember-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <Button type="submit" loading={upload.isPending} disabled={!file}>{resume ? 'Replace resume' : 'Upload resume'}</Button>
          </form>
        </section>
      </div>

      <ConfirmDialog open={confirmDelete} title="Delete resume?" description="Visitors will no longer be able to download your resume." loading={remove.isPending} onCancel={() => setConfirmDelete(false)} onConfirm={() => remove.mutate()} />
    </>
  )
}
