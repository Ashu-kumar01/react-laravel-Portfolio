import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/States'

export default function AdminNotFound() {
  return (
    <EmptyState
      title="Lost in the code?"
      description="This admin page doesn't exist."
      action={<Button to="/admin/dashboard" size="sm">Back to dashboard</Button>}
      className="mt-10"
    />
  )
}
