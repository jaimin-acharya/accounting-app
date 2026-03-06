# Quick Start Guide - Construction Account Manager

## 1. Database Setup (One-time)

The app requires a Supabase database setup. Here's how:

### Option A: Via Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Create a new query
5. Copy the entire content from `/scripts/init-db.sql`
6. Paste it into the SQL editor
7. Click **Run**
8. Done! The database tables are created

### Option B: Via Command Line (if you have `psql` access)
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f scripts/init-db.sql
```

## 2. Start Using the App

Once the database is set up:

1. **Sign Up**: Go to `/auth/sign-up`
   - Enter your email and password
   - Check your email for a confirmation link
   - Click the link to verify your email
   - You'll be redirected to the dashboard

2. **Add Entries**: On the dashboard
   - Fill in the "Add New Entry" form on the left
   - Select category, amount, party name, etc.
   - Click "Add Entry"
   - Your entry will appear in the table

3. **View Stats**: See real-time statistics
   - Total amount spent
   - Breakdown by category
   - Monthly totals
   - Entry counts

4. **Manage Entries**: In the table
   - View all your entries
   - Delete entries if needed
   - Sort by date or other fields

5. **Logout**: Click the logout button in the top right

## 3. Troubleshooting

### "Database Setup Required" message
- The `entries` table doesn't exist
- Follow the database setup steps above
- Refresh the page when done

### Email confirmation link not working
- Check your spam folder
- Make sure you're clicking the confirmation link from the email
- The link should redirect to `/auth/callback` then to the dashboard

### Can't add entries
- Make sure you've confirmed your email
- Check that you're logged in
- Try refreshing the page

### Database connection issues
- Verify your Supabase credentials in `.env.local`
- Check that your Supabase project is active
- Make sure RLS policies were created correctly

## Project Structure

```
app/
  ├── page.tsx                 # Main dashboard
  ├── auth/
  │   ├── login/              # Login page
  │   ├── sign-up/            # Sign up page
  │   ├── callback/           # Email confirmation handler
  │   └── error/              # Auth error page
  └── protected/              # Protected page after email confirmation

components/
  ├── dashboard/
  │   └── stats-cards.tsx     # Statistics cards
  ├── forms/
  │   └── add-entry-form.tsx  # Entry form
  └── tables/
      └── entries-table.tsx   # Entries data table

lib/
  ├── supabase/
  │   ├── client.ts           # Client-side Supabase setup
  │   ├── server.ts           # Server-side Supabase setup
  │   └── proxy.ts            # Auth proxy for middleware
  ├── context/
  │   └── entries-context.tsx # State management
  └── types/
      └── index.ts            # TypeScript types

scripts/
  └── init-db.sql             # Database schema
```

## Features

✅ User Authentication (email/password)
✅ Email Confirmation Flow
✅ Secure Data Storage (Row Level Security)
✅ Real-time Statistics
✅ Entry Management (Add/Delete)
✅ Category Tracking (Vendor, Labour, Material, etc.)
✅ Responsive Design (Mobile/Tablet/Desktop)
✅ User Isolation (Each user sees only their data)

## Database Schema

### entries table
- `id`: Unique entry identifier (UUID)
- `user_id`: Link to authenticated user
- `date`: Entry date
- `project_name`: Name of the project
- `category`: Type (vendor, labour, material, labour_attendance, material_stock, other)
- `party_name`: Vendor/labour provider name
- `quantity`: Optional quantity
- `amount`: Cost/amount
- `notes`: Optional notes
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

All data is protected by Row Level Security - users can only see and modify their own entries.
