'use client';

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';

export function DataTable<T>({ data, columns, emptyMessage = 'No records found.' }: { data: T[]; columns: Array<ColumnDef<T>>; emptyMessage?: string }) {
  // TanStack Table intentionally exposes mutable callbacks that React Compiler skips.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="w-full overflow-x-auto bg-white rounded-2xl border border-slate-100/80 shadow-sm">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id} className="border-b border-slate-100 bg-slate-50/50">
              {group.headers.map((header) => (
                <th key={header.id} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4 align-middle text-sm text-[#06402b]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
