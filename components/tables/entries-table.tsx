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
import { Trash2, Loader2 } from 'lucide-react'
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
        <CardHeader>
          <CardTitle className="text-slate-900">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-700">Date</TableHead>
                  <TableHead className="text-slate-700">Project</TableHead>
                  <TableHead className="text-slate-700">Category</TableHead>
                  <TableHead className="text-slate-700">Party</TableHead>
                  <TableHead className="text-slate-700 text-right">Amount</TableHead>
                  <TableHead className="text-slate-700">Qty</TableHead>
                  <TableHead className="text-slate-700">Notes</TableHead>
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
                      <TableCell className="text-slate-700">{entry.project_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={categoryColors[entry.category] || categoryColors.other}
                        >
                          {entry.category.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700">{entry.party_name}</TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        ₹{entry.amount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {entry.quantity ? entry.quantity.toString() : '-'}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm max-w-xs truncate">
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
          </div>
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
