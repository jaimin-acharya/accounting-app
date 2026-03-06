'use client'

import { useState } from 'react'
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
  quantity: z.coerce.number().optional(),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
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
      quantity: undefined,
      amount: 0,
      notes: '',
    },
  })

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
        quantity: values.quantity || null,
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
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
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
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
