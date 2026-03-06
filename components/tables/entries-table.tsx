'use client'

import { useState } from 'react'
import { useEntries } from '@/lib/context/entries-context'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2, FileSpreadsheet, FileDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const categoryColors: Record<string, string> = {
  vendor: 'bg-blue-100 text-blue-800',
  labour: 'bg-orange-100 text-orange-800',
  material: 'bg-green-100 text-green-800',
  labour_attendance: 'bg-yellow-100 text-yellow-800',
  material_stock: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
}

export function EntriesTable() {
  const { entries, loading, deleteEntry } = useEntries()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportBaseName = `entries-${new Date().toISOString().slice(0, 10)}`

  const handleExportExcel = async () => {
    if (entries.length === 0) return

    try {
      setIsExporting(true)
      const XLSX = await import('xlsx')

      const rows = entries.map((e) => ({
        Date: new Date(e.date).toLocaleDateString('en-IN'),
        Project: e.project_name,
        Category: e.category.replace(/_/g, ' '),
        Party: e.party_name,
        'Party GSTIN': e.party_gstin ?? '',
        'Party PAN': e.party_pan ?? '',
        Subtotal: e.subtotal_amount ?? '',
        'Tax %': e.tax_rate ?? '',
        'Tax Amount': e.tax_amount ?? '',
        'Total Amount': e.amount,
        Quantity: e.quantity ?? '',
        Notes: e.notes ?? '',
        'Created At': e.created_at ? new Date(e.created_at).toLocaleString('en-IN') : '',
        'Updated At': e.updated_at ? new Date(e.updated_at).toLocaleString('en-IN') : '',
      }))

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(rows)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Entries')
      XLSX.writeFile(workbook, `${exportBaseName}.xlsx`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPdf = async () => {
    if (entries.length === 0) return

    try {
      setIsExporting(true)
      const { jsPDF } = await import('jspdf')
      const autoTableModule = await import('jspdf-autotable')
      const autoTable =
        (autoTableModule as unknown as { default?: (doc: unknown, opts: unknown) => void }).default ??
        (autoTableModule as unknown as (doc: unknown, opts: unknown) => void)

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
      const fmtMoney = (n: unknown) => {
        const num = typeof n === 'number' ? n : n == null ? null : Number(n)
        if (num == null || !Number.isFinite(num)) return ''
        return num.toLocaleString('en-IN', { maximumFractionDigits: 2 })
      }
      doc.setFontSize(14)
      doc.text('Entries (INR)', 40, 40)
      doc.setFontSize(10)
      doc.text(`Exported: ${new Date().toLocaleString('en-IN')}`, 40, 58)

      const head = [[
        'Date',
        'Project',
        'Category',
        'Party',
        'GSTIN',
        'PAN',
        'Subtotal',
        'Tax %',
        'Tax',
        'Total',
        'Qty',
        'Notes',
      ]]
      const body = entries.map((e) => ([
        new Date(e.date).toLocaleDateString('en-IN'),
        e.project_name,
        e.category.replace(/_/g, ' '),
        e.party_name,
        e.party_gstin ?? '',
        e.party_pan ?? '',
        fmtMoney(e.subtotal_amount),
        e.tax_rate != null ? `${Number(e.tax_rate)}%` : '',
        fmtMoney(e.tax_amount),
        fmtMoney(e.amount),
        e.quantity != null ? String(e.quantity) : '',
        e.notes ?? '',
      ]))

      autoTable(doc, {
        head,
        body,
        startY: 75,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak', valign: 'top' },
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 125 },
          2: { cellWidth: 90 },
          3: { cellWidth: 120 },
          4: { cellWidth: 115 },
          5: { cellWidth: 85 },
          6: { cellWidth: 80, halign: 'right' },
          7: { cellWidth: 55, halign: 'right' },
          8: { cellWidth: 70, halign: 'right' },
          9: { cellWidth: 80, halign: 'right' },
          10: { cellWidth: 50, halign: 'right' },
          11: { cellWidth: 180 },
        },
        margin: { left: 35, right: 35 },
      })

      doc.save(`${exportBaseName}.pdf`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setIsDeleting(true)
      await deleteEntry(deleteId)
      setDeleteId(null)
    } catch (error) {
      console.error('[v0] Error deleting entry:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-slate-900">Recent Entries</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={loading || entries.length === 0 || isExporting}
              className="w-full sm:w-auto"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportPdf}
              disabled={loading || entries.length === 0 || isExporting}
              className="w-full sm:w-auto"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-700">Date</TableHead>
                  <TableHead className="text-slate-700">Project</TableHead>
                  <TableHead className="text-slate-700 hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-slate-700 hidden md:table-cell">Party</TableHead>
                  <TableHead className="text-slate-700 text-right">Amount</TableHead>
                  <TableHead className="text-slate-700 hidden lg:table-cell">Qty</TableHead>
                  <TableHead className="text-slate-700 hidden lg:table-cell">Notes</TableHead>
                  <TableHead className="text-slate-700 w-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-slate-600">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading entries...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-slate-600">
                      No entries yet. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id} className="border-slate-200 hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {new Date(entry.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell className="text-slate-700 whitespace-normal max-w-[14rem] sm:max-w-none">
                        {entry.project_name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className={categoryColors[entry.category] || categoryColors.other}
                        >
                          {entry.category.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700 hidden md:table-cell whitespace-normal max-w-[14rem]">
                        {entry.party_name}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        <div className="leading-tight">
                          <div>₹{entry.amount.toLocaleString('en-IN')}</div>
                          {entry.tax_amount != null && entry.tax_amount !== 0 ? (
                            <div className="hidden md:block text-xs font-normal text-slate-600">
                              Tax: ₹{Number(entry.tax_amount).toLocaleString('en-IN')}
                              {entry.tax_rate != null ? ` (${Number(entry.tax_rate)}%)` : ''}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700 hidden lg:table-cell">
                        {entry.quantity ? entry.quantity.toString() : '-'}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm hidden lg:table-cell max-w-xs truncate">
                        {entry.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(entry.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this entry? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
