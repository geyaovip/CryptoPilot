import { Card } from "@cryptopilot/ui";

type DataTableProps = {
  title: string;
  columns: string[];
  rows: string[][];
};

export function DataTable({ title, columns, rows }: DataTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 p-4">
        <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">共 {rows.length} 条记录。小屏可横向滑动查看完整字段。</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {columns.map((column) => (
                <th className="border-b border-slate-200 px-4 py-3 font-medium" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr className="border-b border-slate-100" key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td className="px-4 py-3 text-slate-700" key={`${rowIndex}-${cellIndex}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
