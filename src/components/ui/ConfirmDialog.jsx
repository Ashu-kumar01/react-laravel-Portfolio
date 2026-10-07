import { TriangleAlert } from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

export function ConfirmDialog({ open, title = 'Are you sure?', description, confirmLabel = 'Delete', tone = 'danger', loading, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      dismissible={!loading}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} data-autofocus>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-danger-400/10 text-danger-400">
          <TriangleAlert className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </Modal>
  )
}
