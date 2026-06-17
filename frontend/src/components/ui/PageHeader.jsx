export default function PageHeader({ title, breadcrumb, actionButton }) {
  return (
    <div className="border-b border-[#E2E8F0] pb-6 mb-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-semibold text-[#0F172A] mb-1">{title}</h3>
          {breadcrumb && (
            <p className="text-sm text-[#64748B] font-normal">{breadcrumb}</p>
          )}
        </div>
        {actionButton && <div>{actionButton}</div>}
      </div>
    </div>
  );
}
