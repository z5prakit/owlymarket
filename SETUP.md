# OwlyMarket - Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

**Minimum Required Variables:**

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (Required)
OPENAI_API_KEY=sk-your-api-key
```

### 3. Set Up Supabase Database

#### Option A: Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Create new project (or use existing)
3. Go to SQL Editor
4. Run each migration file in order:
   - `supabase/migrations/20250101000000_initial_schema.sql`
   - `supabase/migrations/20250101000001_create_users.sql`
   - `supabase/migrations/20250101000002_create_analyses.sql`
   - `supabase/migrations/20250101000003_create_transactions.sql`
   - `supabase/migrations/20250101000004_add_rls_policies.sql`

#### Option B: Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 4. Get API Keys

#### Supabase Keys

1. Go to Project Settings > API
2. Copy `URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

#### OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy to `OPENAI_API_KEY`

**Estimated cost:** ~$0.03 per analysis with GPT-4o

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## ✅ Test the App

1. Go to home page
2. Enter a test market URL:
   ```
   https://polymarket.com/event/will-bitcoin-hit-100k-by-2025
   ```
3. Click "Analyze"
4. Wait 30-60 seconds
5. View analysis report!

## 🔧 Optional Setup

### Valyu AI (Enhanced Research)

1. Get API key from https://valyu.ai
2. Add to `.env.local`:
   ```env
   VALYU_API_KEY=valyu_your-key
   NEXT_PUBLIC_ENABLE_VALYU=true
   ```

### BSC Payments (Production Only)

1. Create BSC wallet
2. Add wallet address:
   ```env
   NEXT_PUBLIC_PAYMENT_WALLET=0xYourWalletAddress
   NEXT_PUBLIC_ENABLE_REAL_PAYMENTS=true
   ```

### WalletConnect (For User Auth)

1. Get project ID from https://cloud.walletconnect.com
2. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
   ```

## 🐛 Troubleshooting

### TypeScript Errors

Some type errors are expected until Supabase types are generated:

```bash
npm run db:generate-types
```

### Port Already in Use

```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Supabase Connection Failed

- Check URL format: `https://xxx.supabase.co` (no trailing slash)
- Verify anon key is correct
- Check project is not paused

### OpenAI API Errors

- Verify API key is valid
- Check you have credits: https://platform.openai.com/usage
- Rate limit: wait 60 seconds and retry

### Build Errors

```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Next Steps

- [Read Architecture Docs](./docs/02-architecture-plan.md)
- [View API Documentation](./README.md#api-usage)
- Deploy to Vercel (see README)

## 💡 Development Tips

1. **Use `/preview` command** in Claude Code to test UI changes
2. **Check logs** in terminal for agent progress
3. **Mock API responses** for faster development (edit agents)
4. **Test with different markets** to improve prompts

## 🎯 Success Checklist

- ✅ Dependencies installed
- ✅ `.env.local` configured
- ✅ Supabase database migrations run
- ✅ API keys valid
- ✅ Dev server running on port 3000
- ✅ Can create and view analysis

**Setup complete! Happy analyzing! 🦉**
