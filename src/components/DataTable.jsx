import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useState } from 'react';

function SortIcon({ sorted }) {
  if (sorted === 'asc') return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline ml-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
  );
  if (sorted === 'desc') return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline ml-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline ml-1 text-slate-300 group-hover:text-slate-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export default function DataTable({ columns, data, onRowClick }) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id} className="border-b border-slate-100 bg-slate-50/80">
              {hg.headers.map(header => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="group px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-widest cursor-pointer select-none whitespace-nowrap first:rounded-tl-2xl last:rounded-tr-2xl"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <SortIcon sorted={header.column.getIsSorted()} />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center text-slate-300">
                <div className="flex flex-col items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm">No data found</span>
                </div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`border-b border-slate-50 last:border-0 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-blue-50/40`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
