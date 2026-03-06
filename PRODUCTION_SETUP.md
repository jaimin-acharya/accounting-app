# Production Setup Guide

## Vercel Environment Variables

To make email confirmation work in production, you need to set the following environment variables in your Vercel project:

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project: `accounting-app-navy-beta`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=https://accounting-app-navy-beta.vercel.app
```

### Where to find Supabase values:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Important Notes:

- `NEXT_PUBLIC_SITE_URL` must be set to your production domain (without trailing slash)
- After adding environment variables, **redeploy your application** for changes to take effect
- You can set different values for Production, Preview, and Development environments if needed

## Supabase Redirect URL Configuration

You also need to configure allowed redirect URLs in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Redirect URLs**, add:
   - `https://accounting-app-navy-beta.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)

4. Under **Site URL**, set:
   - `https://accounting-app-navy-beta.vercel.app`

5. Click **Save**

## After Configuration

1. **Redeploy your Vercel application** to pick up the new environment variables
2. Test the sign-up flow:
   - Go to `https://accounting-app-navy-beta.vercel.app/auth/sign-up`
   - Create a new account
   - Check your email for the confirmation link
   - Click the link - it should redirect to your production site and log you in

## Troubleshooting

If email confirmation still doesn't work:

1. **Check Vercel logs**: Go to your Vercel project → **Deployments** → Click on a deployment → **Logs** tab
2. **Verify environment variables**: Make sure all three variables are set and have correct values
3. **Check Supabase logs**: Go to Supabase dashboard → **Logs** → **Auth Logs** to see if there are any errors
4. **Verify redirect URL**: The email link should point to `https://accounting-app-navy-beta.vercel.app/auth/callback?code=...`

