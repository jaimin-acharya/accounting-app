export type EntryCategory = 'vendor' | 'labour' | 'material' | 'labour_attendance' | 'material_stock' | 'other'

export interface Entry {
  id: string
  user_id: string
  date: string
  project_name: string
  category: EntryCategory
  party_name: string
  quantity?: number | null
  amount: number
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface CreateEntryInput {
  date: string
  project_name: string
  category: EntryCategory
  party_name: string
  quantity?: number | null
  amount: number
  notes?: string | null
}

export interface EntryStats {
  totalAmount: number
  totalEntries: number
  byCategory: Record<EntryCategory, number>
  byMonth: Record<string, number>
}
