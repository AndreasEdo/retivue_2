// 2K: Medical-grade status badges — muted pastel, rounded-md, smaller text
const statusConfig = {
  approved: {
    cls: 'bg-green-50 text-green-700 border border-green-200',
    label: 'Approved',
  },
  rejected: {
    cls: 'bg-red-50 text-red-700 border border-red-200',
    label: 'Rejected',
  },
  waiting: {
    cls: 'bg-amber-50 text-amber-700 border border-amber-200',
    label: 'Waiting',
  },
  pending: {
    cls: 'bg-blue-50 text-blue-700 border border-blue-200',
    label: 'Pending',
  },
  submitted: {
    cls: 'bg-blue-50 text-blue-700 border border-blue-200',
    label: 'Submitted',
  },
  confirmed: {
    cls: 'bg-green-50 text-green-700 border border-green-200',
    label: 'Confirmed',
  },
  done: {
    cls: 'bg-green-50 text-green-700 border border-green-200',
    label: 'Done',
  },
};

export default function StatusBadge({ status, customLabel }) {
  const config = statusConfig[status] || statusConfig.pending;
  const label = customLabel || config.label;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${config.cls}`}
    >
      {label}
    </span>
  );
}
