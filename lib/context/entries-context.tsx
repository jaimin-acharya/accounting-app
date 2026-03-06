'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Entry, CreateEntryInput, EntryStats } from '@/lib/types'

interface EntriesContextType {
  entries: Entry[]
  stats: EntryStats
  loading: boolean
  error: string | null
  addEntry: (entry: CreateEntryInput) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  updateEntry: (id: string, entry: Partial<CreateEntryInput>) => Promise<void>
  refreshEntries: () => Promise<void>
}

const EntriesContext = createContext<EntriesContextType | undefined>(undefined)

export function EntriesProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [stats, setStats] = useState<EntryStats>({
    totalAmount: 0,
    totalEntries: 0,
    byCategory: {
      vendor: 0,
      labour: 0,
      material: 0,
      labour_attendance: 0,
      material_stock: 0,
      other: 0,
    },
    byMonth: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Calculate stats from entries
  const calculateStats = useCallback((data: Entry[]): EntryStats => {
    const stats: EntryStats = {
      totalAmount: 0,
      totalEntries: data.length,
      byCategory: {
        vendor: 0,
        labour: 0,
        material: 0,
        labour_attendance: 0,
        material_stock: 0,
        other: 0,
      },
      byMonth: {},
    }

    data.forEach((entry) => {
      stats.totalAmount += entry.amount
      stats.byCategory[entry.category]++

      const monthKey = entry.date.substring(0, 7) // YYYY-MM format
      stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + entry.amount
    })

    return stats
  }, [])

  // Fetch entries from Supabase
  const refreshEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('entries')
        .select('*')
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      setEntries(data || [])
      setStats(calculateStats(data || []))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch entries'
      setError(message)
      console.error('[v0] Error fetching entries:', message)
    } finally {
      setLoading(false)
    }
  }, [supabase, calculateStats])

  // Add new entry
  const addEntry = useCallback(
    async (entry: CreateEntryInput) => {
      try {
        setError(null)

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) throw new Error('User not authenticated')

        const { error: insertError } = await supabase.from('entries').insert({
          ...entry,
          user_id: user.id,
        })

        if (insertError) throw insertError

        await refreshEntries()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add entry'
        setError(message)
        console.error('[v0] Error adding entry:', message)
        throw err
      }
    },
    [supabase, refreshEntries]
  )

  // Delete entry
  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        setError(null)

        const { error: deleteError } = await supabase.from('entries').delete().eq('id', id)

        if (deleteError) throw deleteError

        await refreshEntries()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete entry'
        setError(message)
        console.error('[v0] Error deleting entry:', message)
        throw err
      }
    },
    [supabase, refreshEntries]
  )

  // Update entry
  const updateEntry = useCallback(
    async (id: string, entry: Partial<CreateEntryInput>) => {
      try {
        setError(null)

        const { error: updateError } = await supabase
          .from('entries')
          .update({
            ...entry,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)

        if (updateError) throw updateError

        await refreshEntries()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update entry'
        setError(message)
        console.error('[v0] Error updating entry:', message)
        throw err
      }
    },
    [supabase, refreshEntries]
  )

  // Load entries on mount, but don't fail if table doesn't exist
  useEffect(() => {
    const loadEntries = async () => {
      try {
        await refreshEntries()
      } catch (err) {
        // Table might not exist yet - that's OK
        setLoading(false)
      }
    }
    loadEntries()
  }, [refreshEntries])

  return (
    <EntriesContext.Provider
      value={{
        entries,
        stats,
        loading,
        error,
        addEntry,
        deleteEntry,
        updateEntry,
        refreshEntries,
      }}
    >
      {children}
    </EntriesContext.Provider>
  )
}

export function useEntries() {
  const context = useContext(EntriesContext)
  if (context === undefined) {
    throw new Error('useEntries must be used within an EntriesProvider')
  }
  return context
}
