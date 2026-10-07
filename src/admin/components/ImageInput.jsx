import { useEffect, useMemo, useRef } from 'react'
import { ImagePlus, Trash2, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const ACCEPT = 'image/jpeg,image/png,image/webp'

function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => url && URL.revokeObjectURL(url), [url])
  return url
}

/** Client-side pre-check; the API re-validates MIME type, size and dimensions. */
function checkImage(file, maxKb) {
  if (!ACCEPT.split(',').includes(file.type)) return 'Only JPG, PNG or WebP images are allowed.'
  if (file.size > maxKb * 1024) return `Image must be smaller than ${Math.round(maxKb / 1024) || 1} MB.`
  return null
}

/** Reads the pixel size of an image file (null if the browser can't decode it). */
function imageSize(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

/** Single image: shows the current image or a new local preview. */
export function SingleImageInput({ id, currentUrl, file, onFile, onRemove, removed, maxKb = 4096, minWidth, minHeight, aspect = 'aspect-[16/9]', fit = 'cover', onInvalid, hint }) {
  const inputRef = useRef(null)
  const preview = useObjectUrl(file)
  const shown = preview ?? (removed ? null : currentUrl)

  return (
    <div className="space-y-2">
      <div className={cn('relative overflow-hidden rounded-xl border border-dashed border-[var(--line-strong)] bg-ink-900/60', aspect)}>
        {shown ? (
          <img src={shown} alt="Selected" className={cn('h-full w-full', fit === 'contain' ? 'object-contain p-2' : 'object-cover')} />
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-muted transition hover:bg-white/[0.02] hover:text-fg">
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
            Choose image
            {hint && <span className="text-xs text-subtle">{hint}</span>}
          </button>
        )}
        {shown && (
          <div className="absolute right-2 top-2 flex gap-1.5">
            {!preview && (
              <a href={shown} target="_blank" rel="noopener noreferrer" className="glass rounded-lg px-2.5 py-1.5 text-xs text-fg">View</a>
            )}
            <button type="button" onClick={() => inputRef.current?.click()} className="glass rounded-lg px-2.5 py-1.5 text-xs text-fg">Replace</button>
            <button type="button" onClick={() => (file ? onFile(null) : onRemove?.())} className="glass rounded-lg p-1.5 text-danger-400" aria-label="Remove image">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={async (e) => {
          const next = e.target.files?.[0]
          e.target.value = ''
          if (!next) return
          const problem = checkImage(next, maxKb)
          if (problem) return onInvalid?.(problem)
          if (minWidth || minHeight) {
            const size = await imageSize(next)
            if (!size) return onInvalid?.('This image could not be read. Try another JPG, PNG or WebP file.')
            if (size.width < (minWidth ?? 0) || size.height < (minHeight ?? 0)) {
              return onInvalid?.(`Image is ${size.width}×${size.height} px; minimum is ${minWidth ?? 0}×${minHeight ?? 0} px.`)
            }
          }
          onFile(next)
        }}
      />
    </div>
  )
}

function GalleryThumb({ src, onRemove, label }) {
  return (
    <li className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-[var(--line)]">
      <img src={src} alt={label} className="h-full w-full object-cover" />
      <button type="button" onClick={onRemove} className="glass absolute right-1.5 top-1.5 rounded-md p-1 text-danger-400 opacity-90 transition hover:opacity-100" aria-label={`Remove ${label}`}>
        <X className="h-3.5 w-3.5" />
      </button>
    </li>
  )
}

function NewThumb({ file, onRemove, index }) {
  const url = useObjectUrl(file)
  return <GalleryThumb src={url} onRemove={onRemove} label={`new image ${index + 1}`} />
}

/** Gallery: existing images (kept/removed) + new uploads. */
export function GalleryInput({ id, existing = [], keep, onKeepChange, files, onFilesChange, max = 12, maxKb = 4096, onInvalid }) {
  const inputRef = useRef(null)
  const kept = existing.filter((img) => keep.includes(img.path))
  const total = kept.length + files.length

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {kept.map((img, i) => (
          <GalleryThumb key={img.path} src={img.url} label={`gallery image ${i + 1}`} onRemove={() => onKeepChange(keep.filter((p) => p !== img.path))} />
        ))}
        {files.map((file, i) => (
          <NewThumb key={`${file.name}-${file.lastModified}-${i}`} file={file} index={i} onRemove={() => onFilesChange(files.filter((_, j) => j !== i))} />
        ))}
        {total < max && (
          <li>
            <button type="button" onClick={() => inputRef.current?.click()} className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[var(--line-strong)] text-xs text-muted transition hover:bg-white/[0.02] hover:text-fg">
              <ImagePlus className="h-5 w-5" aria-hidden="true" /> Add images
            </button>
          </li>
        )}
      </ul>
      <p className="text-xs text-subtle">{total} / {max} images · JPG, PNG or WebP up to {Math.round(maxKb / 1024)} MB each</p>
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const picked = [...(e.target.files ?? [])]
          e.target.value = ''
          const valid = []
          for (const f of picked) {
            const problem = checkImage(f, maxKb)
            if (problem) onInvalid?.(`${f.name}: ${problem}`)
            else valid.push(f)
          }
          onFilesChange([...files, ...valid].slice(0, max - kept.length))
        }}
      />
    </div>
  )
}
