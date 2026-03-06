'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEntries } from '@/lib/context/entries-context'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  project_name: z.string().min(1, 'Project name is required'),
  category: z.enum(['vendor', 'labour', 'material', 'labour_attendance', 'material_stock', 'other']),
  party_name: z.string().min(1, 'Party name is required'),
  party_gstin: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.toUpperCase() : '')),
  party_pan: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.toUpperCase() : '')),
  quantity: z.coerce.number().optional(),
  subtotal_amount: z.coerce.number().min(0, 'Subtotal must be 0 or greater'),
  tax_rate: z.coerce.number().min(0, 'Tax must be 0 or greater').max(100, 'Tax cannot exceed 100%'),
  tax_amount: z.coerce.number().optional(),
  amount: z.coerce.number().min(0.01, 'Total amount must be greater than 0'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function AddEntryForm() {
  const { addEntry, error: contextError } = useEntries()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      project_name: '',
      category: 'vendor',
      party_name: '',
      party_gstin: '',
      party_pan: '',
      quantity: undefined,
      subtotal_amount: 0,
      tax_rate: 0,
      tax_amount: 0,
      amount: 0,
      notes: '',
    },
  })

  const subtotal = form.watch('subtotal_amount')
  const taxRate = form.watch('tax_rate')

  const computed = useMemo(() => {
    const safeSubtotal = typeof subtotal === 'number' && Number.isFinite(subtotal) ? subtotal : 0
    const safeTaxRate = typeof taxRate === 'number' && Number.isFinite(taxRate) ? taxRate : 0
    const taxAmount = (safeSubtotal * safeTaxRate) / 100
    const total = safeSubtotal + taxAmount
    const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
    return {
      taxAmount: round2(taxAmount),
      total: round2(total),
    }
  }, [subtotal, taxRate])

  useEffect(() => {
    form.setValue('tax_amount', computed.taxAmount, { shouldDirty: false, shouldValidate: false })
    form.setValue('amount', computed.total, { shouldDirty: false, shouldValidate: false })
  }, [computed.taxAmount, computed.total, form])

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(false)

      await addEntry({
        date: values.date,
        project_name: values.project_name,
        category: values.category,
        party_name: values.party_name,
        party_gstin: values.party_gstin ? values.party_gstin : null,
        party_pan: values.party_pan ? values.party_pan : null,
        quantity: values.quantity || null,
        subtotal_amount: values.subtotal_amount,
        tax_rate: values.tax_rate,
        tax_amount: values.tax_amount ?? computed.taxAmount,
        amount: values.amount,
        notes: values.notes || null,
      })

      setSubmitSuccess(true)
      form.reset()
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add entry'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-900">Add New Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {submitSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Entry added successfully!
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="border-slate-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtotal_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Subtotal</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        min={0}
                        value={field.value ?? 0}
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === '') {
                            field.onChange(0)
                            return
                          }
                          const num = Number(v)
                          if (!Number.isFinite(num)) return
                          field.onChange(num < 0 ? 0 : num)
                        }}
                        className="border-slate-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Building A, Foundation Work"
                      {...field}
                      className="border-slate-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="labour">Labour</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="labour_attendance">Labour Attendance</SelectItem>
                        <SelectItem value="material_stock">Material Stock</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="party_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Party Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., John Smith, ABC Suppliers"
                        {...field}
                        className="border-slate-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <FormField
                control={form.control}
                name="party_gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Party GSTIN (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 27AAECS1234F1Z5"
                        inputMode="text"
                        autoCapitalize="characters"
                        {...field}
                        className="border-slate-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="party_pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Party PAN (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., AAECS1234F"
                        inputMode="text"
                        autoCapitalize="characters"
                        {...field}
                        className="border-slate-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Tax (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        min={0}
                        max={100}
                        value={field.value ?? 0}
                        onChange={(e) => {
                          const v = e.target.value
                          if (v === '') {
                            field.onChange(0)
                            return
                          }
                          const num = Number(v)
                          if (!Number.isFinite(num)) return
                          const clamped = Math.min(100, Math.max(0, num))
                          field.onChange(clamped)
                        }}
                        className="border-slate-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Tax Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        readOnly
                        className="border-slate-300 bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Total Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        readOnly
                        className="border-slate-300 bg-slate-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Quantity (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter quantity if applicable"
                      {...field}
                      min={0}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === '') {
                          field.onChange(undefined)
                          return
                        }
                        const num = Number(v)
                        if (!Number.isFinite(num) || num < 0) return
                        field.onChange(num)
                      }}
                      className="border-slate-300"
                    />
                  </FormControl>
                  <FormDescription className="text-slate-600">
                    Leave blank if not applicable
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="border-slate-300 resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Entry...
                </>
              ) : (
                'Add Entry'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
