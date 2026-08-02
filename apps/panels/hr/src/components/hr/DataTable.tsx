import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export interface FilterConfig<T> {
  key: string;
  label: string;
  options: string[];
  matches: (row: T, value: string) => boolean;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  searchValue?: (row: T) => string;
  filters?: FilterConfig<T>[];
  onRowClick?: (row: T) => void;
  emptyState: ReactNode;
  pageSize?: number;
  isLoading?: boolean;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchPlaceholder = "Search…",
  searchValue,
  filters = [],
  onRowClick,
  emptyState,
  pageSize = 10,
  isLoading = false,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [filterState, setFilterState] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  let data = rows;
  if (query && searchValue) {
    const q = query.toLowerCase();
    data = data.filter((row) => searchValue(row).toLowerCase().includes(q));
  }
  for (const filter of filters) {
    const value = filterState[filter.key];
    if (value && value !== "all") data = data.filter((row) => filter.matches(row, value));
  }
  if (sort) {
    const column = columns.find((c) => c.key === sort.key);
    if (column?.sortValue) {
      const get = column.sortValue;
      data = data.slice().sort((a, b) => {
        const av = get(a);
        const bv = get(b);
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
  }

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const showControls = Boolean(searchValue) || filters.length > 0;

  return (
    <div className="space-y-3">
      {showControls && (
        <div className="flex flex-wrap items-center gap-2">
          {searchValue && (
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="bg-card pl-8"
              />
            </div>
          )}
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterState[filter.key] ?? "all"}
              onValueChange={(value) => {
                setFilterState((prev) => ({ ...prev, [filter.key]: value }));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[190px] bg-card">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{`All ${filter.label.toLowerCase()}`}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column.key} className={cn("text-xs", column.className)}>
                  {column.sortValue ? (
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-1 font-medium hover:text-foreground"
                      onClick={() =>
                        setSort((prev) =>
                          prev?.key === column.key
                            ? { key: column.key, dir: prev.dir === "asc" ? "desc" : "asc" }
                            : { key: column.key, dir: "asc" },
                        )
                      }
                    >
                      {column.header}
                      {sort?.key === column.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : null}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  {data.length === 0 && !query ? (
                    emptyState
                  ) : (
                    <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Nothing matches that search or filter. Try clearing them.
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={cn("text-sm", column.className)}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, data.length)} of {data.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
