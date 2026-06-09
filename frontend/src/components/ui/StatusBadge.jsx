const statusConfig = {
  approved: {
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#059669]',
    label: 'Approved',
  },
  rejected: {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#DC2626]',
    label: 'Rejected',
  },
  waiting: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#D97706]',
    label: 'Waiting',
  },
  pending: {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#2563EB]',
    label: 'Pending',
  },
  submitted: {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#2563EB]',
    label: 'Submitted',
  },
  confirmed: {
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#059669]',
    label: 'Confirmed',
  },
  done: {
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#059669]',
    label: 'Done',
  },
};

export default function StatusBadge({ status, customLabel }) {
  const config = statusConfig[status] || statusConfig.pending;
  const label = customLabel || config.label;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {label}
    </span>
  );
}
