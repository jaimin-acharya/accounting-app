'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { AddEntryForm } from '@/components/forms/add-entry-form'
import { EntriesTable } from '@/components/tables/entries-table'
import { Menu, LogOut, Home } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [dbError, setDbError] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          redirect('/auth/login')
        }

        // Check if database is ready
        const { error } = await supabase
          .from('entries')
          .select('count(*)', { count: 'exact', head: true })

        if (error && error.code === 'PGRST116') {
          // Table doesn't exist
          setDbError(true)
        }

        setIsAuthenticated(true)
        setIsLoading(false)
      } catch (err) {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Database Setup Required</h2>
          <p className="text-slate-600 mb-6">
            The database tables haven't been created yet. To get started, follow these steps:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600 mb-6">
            <li>Go to your Supabase Dashboard</li>
            <li>Open the SQL Editor</li>
            <li>Copy & paste the contents of the SQL migration file</li>
            <li>Run the SQL</li>
            <li>Refresh this page</li>
          </ol>
          <p className="text-xs text-slate-500 mb-4">
            See <code className="bg-slate-100 px-2 py-1 rounded">DATABASE_SETUP.md</code> for detailed instructions.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Construction Manager
                </h1>
                <p className="text-sm text-slate-600">Account & Project Dashboard</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 p-0 text-slate-700"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="mt-6">
                    <Button
                      onClick={handleLogout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
              <p className="text-sm text-slate-600">Key metrics and statistics</p>
            </div>
            <StatsCards />
          </section>

          {/* Form and Table Section */}
          <section className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <AddEntryForm />
            </div>
            <div className="lg:col-span-2">
              <EntriesTable />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
