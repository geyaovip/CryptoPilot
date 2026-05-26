import { Card } from "@cryptopilot/ui";

type EmptyTableProps = {
  title: string;
  columns: string[];
};

export function EmptyTable({ title, columns }: EmptyTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 p-4">
        <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">暂无记录。数据写入后会在这里展示。</p>
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
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                当前没有可展示的数据。
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
