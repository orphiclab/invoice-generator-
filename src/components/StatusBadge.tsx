import { cn } from '@/lib/utils'

type Status = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'

const labels: Record<Status, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
}

const styles: Record<Status, string> = {
  DRAFT: 'status-draft',
  SENT: 'status-sent',
  PAID: 'status-paid',
  OVERDUE: 'status-overdue',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', styles[status])}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full inline-block" style={{ background: 'currentColor' }} />
      {labels[status]}
    </span>
  )
}
