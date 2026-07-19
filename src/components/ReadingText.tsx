import type { TableData } from "../data/types";

interface ReadingTextProps {
  title: string;
  content: string;
  table?: TableData;
}

export function ReadingText({ title, content, table }: ReadingTextProps) {
  const contextOnly = table
    ? content.split(/\n\s*\n/)[0]
    : content;

  return (
    <div className="reading-text h-full overflow-y-auto px-6 py-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="whitespace-pre-wrap text-gray-700 mb-4">{contextOnly}</div>
      {table && (
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                {table.headers.map((h, i) => (
                  <th key={i} className="border border-gray-300 px-3 py-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-gray-300 px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
