# Security Remediation Checklist

## 🚨 Exposed Secrets Incident - Action Required

GitGuardian detected exposed secrets in commit `6675f1b`. This document outlines the remediation steps.

### Secrets Exposed:
1. ✅ **OpenAI API Key** - ROTATED
2. ⚠️ **Supabase Service Role Key** - PENDING ROTATION

---

## Steps Completed ✅

- [x] Removed `.env.vercel.production` from git repository
- [x] Updated `.gitignore` to prevent future leaks
- [x] Rotated OpenAI API key
- [x] Updated `.env.local` with new OpenAI key
- [x] Removed Vercel env files from filesystem
- [x] Verified only `.env.example` is tracked in git

---

## 🔴 URGENT: Rotate Supabase Service Role Key

**Exposed Key (DO NOT USE):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcXNoaXh6cGFybm15a2dodHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk3OTA4NywiZXhwIjoyMDgyNTU1MDg3fQ.pjIQ0EAR9-yzPow1DPdujJ38CKrujvdFvLD-aY78Il4
```

### Manual Rotation Steps:

1. **Log into Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/sign-in
   - Sign in with your account

2. **Navigate to API Keys Settings**
   - Go to: https://supabase.com/dashboard/project/usqshixzparnmykghtzn/settings/api-keys
   - Or: Project Settings → API → API Keys

3. **Create New Secret API Key**
   - Look for "Create new secret API key" button
   - Click it and copy the new key immediately (it won't be shown again)

4. **Update Local Environment**
   ```bash
   # Edit .env.local and replace SUPABASE_SERVICE_ROLE_KEY with the new key
   nano .env.local
   ```

5. **Update Vercel Environment Variables**
   - Go to: https://vercel.com/simbas-projects-54c0e905/owlymarket/settings/environment-variables
   - Find `SUPABASE_SERVICE_ROLE_KEY` and edit it
   - Paste the new key from Supabase dashboard
   - Also update `OPENAI_API_KEY` with the new rotated key (check `.env.local` for the value)
   - Redeploy the application

6. **Delete Old Compromised Key**
   - Back in Supabase dashboard API Keys page
   - Find the old service_role key
   - Delete it to revoke access

7. **Test the Application**
   ```bash
   npm run dev
   ```
   - Verify the app still works with new keys
   - Test wallet authentication flow

---

## Security Best Practices Going Forward

### ✅ Files That Should NEVER Be Committed:
- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- `.env.vercel.production`
- `.env.vercel.local`
- Any file containing API keys, secrets, or credentials

### ✅ Before Every Git Push:
```bash
# Check what files will be committed
git status

# Verify no sensitive files
git ls-files | grep -E "(\.env|key|secret|password|credential)"

# Should only return .env.example
```

### ✅ Current .gitignore Coverage:
The `.gitignore` file now properly excludes:
- All `.env*` files except `.env.example`
- Node modules, build artifacts
- IDE configurations
- Supabase local data

### ✅ Environment Variable Management:
- **Local Development:** Use `.env.local` (git-ignored)
- **Vercel Production:** Configure in Vercel Dashboard only
- **Example/Template:** Use `.env.example` (safe to commit)

---

## Why Service Role Key Is Critical

The Supabase `service_role` key:
- ❌ Bypasses ALL Row Level Security (RLS) policies
- ❌ Can read/write/delete ANY data in your database
- ❌ Can modify database schema
- ❌ Should NEVER be exposed to client-side code
- ❌ Should NEVER be committed to git

**Impact of Exposure:**
- Attackers could steal all user data
- Attackers could delete your entire database
- Attackers could create fake analyses and users
- Even without payment card linked, they could rack up Supabase usage

---

## Current Security Status

| Component | Status | Action Required |
|-----------|--------|-----------------|
| OpenAI API Key | ✅ Rotated | Update Vercel env vars |
| Supabase Service Role | ⚠️ Exposed | Rotate immediately |
| Supabase Anon Key | ✅ Safe | Client-side key, protected by RLS |
| Privy Keys | ✅ Safe | Not in exposed files |
| GitHub Token | ✅ Safe | Not committed |
| .env Files | ✅ Git-ignored | Properly configured |

---

## After Rotation Complete

- [ ] Verify new service_role key works locally
- [ ] Verify new keys work on Vercel
- [ ] Delete old compromised key from Supabase
- [ ] Monitor Supabase logs for suspicious activity
- [ ] Consider enabling Supabase audit logging
- [ ] Test full application flow

---

## Support

If you encounter issues during key rotation:
- Supabase Docs: https://supabase.com/docs/guides/api/api-keys
- Vercel Env Vars: https://vercel.com/docs/projects/environment-variables
