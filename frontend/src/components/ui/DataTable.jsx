export default function DataTable({ columns, data, onRowClick }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[#f2f4f6] border-b border-[#E2E8F0]">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-semibold text-[#454655] uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {data.map((row, index) => (
            <tr
              key={index}
              className={`hover:bg-[#f7f9fb] transition-colors cursor-pointer ${
                index % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'
              }`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 text-sm text-[#191c1e]">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="px-6 py-12 text-center text-sm text-[#64748B]">
          No data available
        </div>
      )}
    </div>
  );
}
