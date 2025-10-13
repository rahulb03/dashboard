'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useState } from 'react';

export function ClientProductTable({
  data = [],
  columns = []
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // console.log('ClientProductTable Debug:', {
  //   dataLength: data.length,
  //   dataType: typeof data,
  //   isArray: Array.isArray(data),
  //   firstItem: data[0],
  //   columnsLength: columns.length
  // });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    // Use client-side pagination instead of manual
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
  });

  // console.log('ClientTable State:', {
  //   rowCount: table.getRowModel().rows.length,
  //   totalRows: table.getRowCount(),
  //   pageIndex: table.getState().pagination.pageIndex,
  //   pageSize: table.getState().pagination.pageSize
  // });

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Client-side table with {data.length} products
      </div>
      <DataTable table={table}>
        <DataTableToolbar 
          table={table}
          placeholder="Search products..."
        />
      </DataTable>
    </div>
  );
}