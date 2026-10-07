import { Archive, CircleDot, MailOpen, Reply } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'

const MESSAGE = {
  new: { tone: 'ember', label: 'New', icon: CircleDot },
  read: { tone: 'neutral', label: 'Read', icon: MailOpen },
  replied: { tone: 'mint', label: 'Replied', icon: Reply },
  archived: { tone: 'neutral', label: 'Archived', icon: Archive },
}

/** Status is always icon + label, never colour alone. */
export function MessageStatusBadge({ status }) {
  const s = MESSAGE[status] ?? MESSAGE.read
  const Icon = s.icon
  return (
    <Badge tone={s.tone}>
      <Icon className="h-3 w-3" aria-hidden="true" /> {s.label}
    </Badge>
  )
}

export function PublishBadge({ status }) {
  return status === 'published' ? <Badge tone="mint">Published</Badge> : <Badge tone="amber">Draft</Badge>
}

export function ActiveBadge({ active }) {
  return active ? <Badge tone="mint">Active</Badge> : <Badge>Hidden</Badge>
}
