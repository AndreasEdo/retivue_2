export default function PageHeader({ title, breadcrumb, actionButton }) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h3 className="text-xl font-semibold text-[#0F172A] mb-1">{title}</h3>
        {breadcrumb && <p className="text-sm text-[#64748B]">{breadcrumb}</p>}
      </div>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
