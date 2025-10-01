import { flexRender } from '@tanstack/react-table';
import * as React from 'react';
import { setSelectedUser } from '@/redux/permissions/permissionSlice';

import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
// Removed problematic imports

/**
 * @typedef {Object} DataTableProps
 * @property {import('@tanstack/react-table').Table} table - The table instance
 * @property {React.ReactNode} [actionBar] - Optional action bar component
 * @property {React.ReactNode} [children] - Child components
 */

/**
 * @param {DataTableProps} props
 */
export const DataTable = React.memo(function DataTable({
  table,
  actionBar,
  children
}) {
  return (
    <div className='flex flex-1 flex-col space-y-4' style={{ minWidth: 0 }}>
      {children}
      <div className='overflow-x-scroll rounded-lg border max-w-full' style={{ WebkitOverflowScrolling: 'touch' }}>
        <Table style={{ minWidth: '100%', width: 'max-content' }}>
          <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className='h-24 text-center'
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
      </div>
      <div className='flex flex-col gap-2.5'>
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
});
