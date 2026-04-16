import React, { useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { Button } from './Button.jsx'

function getSortValue(row, col) {
  if (col.sortValue) return col.sortValue(row)
  return row[col.key]
}

function compareValues(a, b, sortType = 'string') {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (sortType === 'number') {
    const na = Number(a)
    const nb = Number(b)
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb
  }
  if (sortType === 'date') {
    const da = new Date(a).getTime()
    const db = new Date(b).getTime()
    if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db
  }
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

export function DataTable({
  columns,
  rows,
  getRowKey,
  pageSize = 8,
  page: controlledPage,
  onPageChange,
  selectable,
  selectedKeys,
  onSelectionChange,
  emptyMessage = 'No rows',
}) {
  const [internalPage, setInternalPage] = useState(0)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const isPageControlled = controlledPage !== undefined
  const page = isPageControlled ? controlledPage : internalPage
  const setPage = (p) => {
    if (!isPageControlled) setInternalPage(p)
    onPageChange?.(p)
  }

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortable) return rows
    const sortType = col.sortType ?? 'string'
    const copy = [...rows]
    copy.sort((a, b) => {
      const cmp = compareValues(getSortValue(a, col), getSortValue(b, col), sortType)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, columns, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const start = safePage * pageSize
  const pageRows = sortedRows.slice(start, start + pageSize)

  function toggleSort(col) {
    if (!col.sortable) return
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col.key)
      setSortDir('asc')
    }
    if (!isPageControlled) setInternalPage(0)
  }

  function toggleAll(checked) {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange(new Set(pageRows.map((r) => getRowKey(r))))
    } else {
      const next = new Set(selectedKeys ?? [])
      pageRows.forEach((r) => next.delete(getRowKey(r)))
      onSelectionChange(next)
    }
  }

  function toggleOne(key, checked) {
    if (!onSelectionChange) return
    const next = new Set(selectedKeys ?? [])
    if (checked) next.add(key)
    else next.delete(key)
    onSelectionChange(next)
  }

  const allSelected =
    selectable &&
    pageRows.length > 0 &&
    pageRows.every((r) => selectedKeys?.has(getRowKey(r)))

  return (
    <div className="overflow-hidden rounded-xl border border-[#0a1628]/[0.08] bg-[var(--color-surface)] shadow-[0_1px_2px_rgb(10_22_40/0.05),0_12px_40px_-12px_rgb(10_22_40/0.12)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#0a1628]/[0.08] bg-gradient-to-b from-[#f4f6f9] to-[#eef1f6]">
              {selectable ? (
                <th scope="col" className="w-12 px-4 py-3.5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#0a1628]/25 text-[var(--color-primary)] focus:ring-[#D4A843]/50"
                    aria-label="Select all on page"
                    checked={allSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
              ) : null}
              {columns.map((col) => {
                const active = sortKey === col.key
                const ariaSort =
                  !col.sortable ? undefined : !active ? 'none' : sortDir === 'asc' ? 'ascending' : 'descending'
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className="px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.06em] text-[#0a1628]/65"
                    style={{ width: col.width }}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className="group inline-flex max-w-full items-center gap-1.5 text-left font-semibold text-[#0a1628] transition hover:text-[#0a1628]"
                      >
                        <span className="min-w-0 truncate">{col.header}</span>
                        <span className="inline-flex shrink-0 text-[#0a1628]/45 group-hover:text-[#D4A843]" aria-hidden>
                          {active ? (
                            sortDir === 'asc' ? (
                              <ChevronUp className="h-4 w-4 text-[#b8922a]" strokeWidth={2.25} />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-[#b8922a]" strokeWidth={2.25} />
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" strokeWidth={2} />
                          )}
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="bg-white">
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-14 text-center text-[var(--color-text-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const key = getRowKey(row)
                return (
                  <tr
                    key={key}
                    className="border-b border-[#0a1628]/[0.06] transition-colors last:border-0 hover:bg-[#f8fafc]"
                  >
                    {selectable ? (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-[#0a1628]/25 text-[var(--color-primary)] focus:ring-[#D4A843]/50"
                          aria-label={`Select ${key}`}
                          checked={selectedKeys?.has(key) ?? false}
                          onChange={(e) => toggleOne(key, e.target.checked)}
                        />
                      </td>
                    ) : null}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-[var(--color-text)] ${col.numeric ? 'tabular-nums' : ''}`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#0a1628]/[0.08] bg-[#fafbfc] px-4 py-3 text-xs text-[var(--color-text-muted)]">
        <span>
          Showing {sortedRows.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, sortedRows.length)} of{' '}
          {sortedRows.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            className="!border-[#0a1628]/12 !bg-white !px-2 !py-1.5 shadow-sm hover:!bg-[#f8fafc]"
            disabled={safePage <= 0}
            onClick={() => setPage(Math.max(0, safePage - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[5.5rem] px-2 text-center font-medium text-[#0a1628]/70">
            Page {safePage + 1} / {totalPages}
          </span>
          <Button
            variant="secondary"
            className="!border-[#0a1628]/12 !bg-white !px-2 !py-1.5 shadow-sm hover:!bg-[#f8fafc]"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
