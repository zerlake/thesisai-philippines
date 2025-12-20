// This is a placeholder component since DataTable wasn't found in the project
// In a real implementation, this would be a reusable table component

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T;
    cell?: (row: T) => React.ReactNode;
  }[];
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="text-left p-2 border-b">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b hover:bg-muted/50">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="p-2">
                  {column.cell ? column.cell(row) : String(row[column.accessorKey])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}