'use client'

import { useEntries } from '@/lib/context/entries-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  Package,
  Users,
  Zap,
  TrendingUp,
  Calendar,
} from 'lucide-react'

export function StatsCards() {
  const { stats, entries } = useEntries()

  const totalVendor = stats.byCategory.vendor
  const totalLabour = stats.byCategory.labour + stats.byCategory.labour_attendance
  const totalMaterial = stats.byCategory.material + stats.byCategory.material_stock
  const lastMonth = Object.entries(stats.byMonth).slice(-1)[0]?.[1] || 0

  const statItems = [
    {
      title: 'Total Amount',
      value: `₹${stats.totalAmount.toLocaleString('en-IN')}`,
      description: `${stats.totalEntries} entries`,
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Vendor Payments',
      value: totalVendor.toString(),
      description: 'Total entries',
      icon: Package,
      color: 'from-amber-500 to-amber-600',
    },
    {
      title: 'Labour Cost',
      value: `${totalLabour} entries`,
      description: `Amount varies`,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Material',
      value: `${totalMaterial} entries`,
      description: 'Stock & purchases',
      icon: Zap,
      color: 'from-slate-500 to-slate-600',
    },
    {
      title: 'This Month',
      value: `₹${lastMonth.toLocaleString('en-IN')}`,
      description: 'Monthly total',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Total Entries',
      value: stats.totalEntries.toString(),
      description: 'All records',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <Card
            key={item.title}
            className="border-slate-200 bg-white hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                {item.title}
              </CardTitle>
              <div className={`bg-gradient-to-br ${item.color} p-2 rounded-lg`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{item.value}</div>
              <p className="text-xs text-slate-600 mt-1">{item.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
