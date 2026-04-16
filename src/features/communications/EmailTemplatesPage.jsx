import { useMemo, useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { FilterBar } from '../../components/ui/FilterBar.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { emailTemplates } from '../../lib/mock-data/scaffold.js'

function categoryTone(cat) {
  if (cat === 'Transactional') return 'info'
  if (cat === 'Fees') return 'warning'
  if (cat === 'Decisions') return 'success'
  if (cat === 'Interview') return 'default'
  return 'default'
}

export function EmailTemplatesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [activeOnly, setActiveOnly] = useState('')

  const categories = useMemo(() => [...new Set(emailTemplates.map((t) => t.category))].sort(), [])

  const rows = useMemo(() => {
    let list = [...emailTemplates]
    if (category) list = list.filter((t) => t.category === category)
    if (activeOnly === 'yes') list = list.filter((t) => t.active)
    if (activeOnly === 'no') list = list.filter((t) => !t.active)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      )
    }
    return list.map((t) => ({ ...t, rowKey: t.id }))
  }, [search, category, activeOnly])

  const columns = [
    {
      key: 'name',
      header: 'Template',
      sortable: true,
      sortType: 'string',
      render: (t) => (
        <div className="flex min-w-0 items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-heading)]">{t.name}</p>
            <p className="line-clamp-2 text-xs text-[var(--color-text-muted)]">{t.bodyPreview}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      sortType: 'string',
      render: (t) => <Badge tone={categoryTone(t.category)}>{t.category}</Badge>,
    },
    {
      key: 'subject',
      header: 'Subject line',
      sortable: true,
      sortType: 'string',
      render: (t) => <span className="text-sm text-[var(--color-text)]">{t.subject}</span>,
    },
    {
      key: 'mergeFields',
      header: 'Merge fields',
      render: (t) => (
        <div className="flex max-w-[14rem] flex-wrap gap-1">
          {t.mergeFields.slice(0, 3).map((f) => (
            <span
              key={f}
              className="rounded-md bg-[var(--color-bg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-heading)] ring-1 ring-[var(--color-border)]"
            >
              {f.replace(/[{}]/g, '')}
            </span>
          ))}
          {t.mergeFields.length > 3 ? (
            <span className="text-xs text-[var(--color-text-muted)]">+{t.mergeFields.length - 3}</span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      sortable: true,
      sortType: 'string',
      render: (t) => <Badge tone={t.active ? 'success' : 'default'}>{t.active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'lastEdited',
      header: 'Last edited',
      sortable: true,
      sortType: 'date',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="secondary" className="!px-2.5 !py-1.5 text-xs">
            Edit
          </Button>
          <Button type="button" variant="ghost" className="!px-2.5 !py-1.5 text-xs">
            Preview
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Card>
        <CardHeader
          title="Library"
          actions={
            <Button type="button">
              <Plus className="h-4 w-4" aria-hidden />
              New template
            </Button>
          }
        />
        <FilterBar className="mb-4 !shadow-none">
          <div className="min-w-[200px] flex-1">
            <Input
              label="Search"
              placeholder="Template name or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="min-w-[180px]">
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[160px]">
            <Select label="Visibility" value={activeOnly} onChange={(e) => setActiveOnly(e.target.value)}>
              <option value="">All</option>
              <option value="yes">Active only</option>
              <option value="no">Inactive only</option>
            </Select>
          </div>
        </FilterBar>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.rowKey}
          pageSize={8}
          emptyMessage="No templates match your filters."
        />
      </Card>
    </div>
  )
}
