import { useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { DataTable } from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { SettingsModalBackdrop } from '../../components/settings/SettingsModal.jsx'
import { useSettingsStore } from '../../hooks/useSettingsStore.js'

export function FeeStructurePage() {
  const { feeStructure, setSettingsState } = useSettingsStore()

  const [viewRow, setViewRow] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [programCode, setProgramCode] = useState('')
  const [intakeName, setIntakeName] = useState('')
  const [feeType, setFeeType] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [refundPolicy, setRefundPolicy] = useState('')

  function openAdd() {
    setEditingId(null)
    setProgramCode('')
    setIntakeName('')
    setFeeType('')
    setAmount('')
    setCurrency('USD')
    setRefundPolicy('')
    setFormOpen(true)
  }

  function openEdit(r) {
    setEditingId(r.id)
    setProgramCode(r.programCode)
    setIntakeName(r.intakeName)
    setFeeType(r.feeType)
    setAmount(r.amount)
    setCurrency(r.currency)
    setRefundPolicy(r.refundPolicy)
    setFormOpen(true)
  }

  function saveForm(e) {
    e.preventDefault()
    if (!feeType.trim()) return
    const row = {
      programCode: programCode.trim() || '—',
      intakeName: intakeName.trim() || '—',
      feeType: feeType.trim(),
      amount: amount.trim() || '0',
      currency: currency.trim() || 'USD',
      refundPolicy: refundPolicy.trim() || '—',
    }
    if (editingId) {
      setSettingsState((s) => ({
        ...s,
        feeStructure: s.feeStructure.map((x) => (x.id === editingId ? { ...x, ...row } : x)),
      }))
    } else {
      setSettingsState((s) => ({
        ...s,
        feeStructure: [...s.feeStructure, { id: `f_${Date.now()}`, ...row }],
      }))
    }
    setFormOpen(false)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setSettingsState((s) => ({
      ...s,
      feeStructure: s.feeStructure.filter((x) => x.id !== deleteTarget.id),
    }))
    if (viewRow?.id === deleteTarget.id) setViewRow(null)
    setDeleteTarget(null)
  }

  const columns = [
    { key: 'programCode', header: 'Program', sortable: true, sortType: 'string' },
    { key: 'intakeName', header: 'Intake', sortable: true, sortType: 'string' },
    { key: 'feeType', header: 'Fee type', sortable: true, sortType: 'string' },
    { key: 'amount', header: 'Amount', sortable: true, sortType: 'string', numeric: true },
    { key: 'currency', header: 'Currency', sortable: true, sortType: 'string' },
    { key: 'refundPolicy', header: 'Refund policy', sortable: true, sortType: 'string' },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => setViewRow(r)}>
            <Eye className="h-3.5 w-3.5" aria-hidden />
            View
          </Button>
          <Button type="button" variant="ghost" className="!px-2 !py-1.5 !text-xs" onClick={() => openEdit(r)}>
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="!px-2 !py-1.5 !text-xs text-red-700 hover:bg-red-50"
            onClick={() => setDeleteTarget(r)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button type="button" variant="secondary" onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            Add fee rule
          </Button>
        }
      />
      <DataTable columns={columns} rows={feeStructure} getRowKey={(r) => r.id} pageSize={10} />

      {viewRow ? (
        <SettingsModalBackdrop title="Fee rule" onClose={() => setViewRow(null)} wide>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Program</dt>
              <dd className="mt-1">{viewRow.programCode}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Intake</dt>
              <dd className="mt-1">{viewRow.intakeName}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Fee type</dt>
              <dd className="mt-1 font-medium text-[var(--color-heading)]">{viewRow.feeType}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Amount</dt>
              <dd className="mt-1">
                {viewRow.amount} {viewRow.currency}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">Refund policy</dt>
              <dd className="mt-1">{viewRow.refundPolicy}</dd>
            </div>
          </dl>
          <div className="mt-6 flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
            <Button type="button" variant="secondary" onClick={() => setViewRow(null)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                const r = viewRow
                setViewRow(null)
                openEdit(r)
              }}
            >
              Edit
            </Button>
          </div>
        </SettingsModalBackdrop>
      ) : null}

      {formOpen ? (
        <SettingsModalBackdrop title={editingId ? 'Edit fee rule' : 'Add fee rule'} onClose={() => setFormOpen(false)} wide>
          <form onSubmit={saveForm} className="space-y-4">
            <Input label="Program code" value={programCode} onChange={(e) => setProgramCode(e.target.value)} />
            <Input label="Intake name" value={intakeName} onChange={(e) => setIntakeName(e.target.value)} />
            <Input label="Fee type" value={feeType} onChange={(e) => setFeeType(e.target.value)} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
            <Input label="Refund policy" value={refundPolicy} onChange={(e) => setRefundPolicy(e.target.value)} />
            <div className="flex justify-end gap-2 border-t border-[#0A1628]/10 pt-4">
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? 'Save' : 'Add'}</Button>
            </div>
          </form>
        </SettingsModalBackdrop>
      ) : null}

      {deleteTarget ? (
        <SettingsModalBackdrop title="Delete fee rule?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-[var(--color-text)]">
            Remove <span className="font-semibold text-[var(--color-heading)]">{deleteTarget.feeType}</span> for{' '}
            {deleteTarget.programCode} / {deleteTarget.intakeName}? This cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </SettingsModalBackdrop>
      ) : null}
    </div>
  )
}
