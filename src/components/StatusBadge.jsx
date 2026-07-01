const LABELS = {
  pending: 'Pending',
  preparing: 'Preparing',
  served: 'Served',
  cancelled: 'Cancelled',
  open: 'Open',
  paid: 'Paid',
};

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{LABELS[status] || status}</span>;
}
