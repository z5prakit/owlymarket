# OwlyMarket - Architecture & Design Plan

**Project**: OwlyMarket
**Date**: December 28, 2025
**Status**: Planning Phase Complete ✅

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Database Schema](#2-database-schema)
3. [API Routes Design](#3-api-routes-design)
4. [Component Hierarchy](#4-component-hierarchy)
5. [AI Agent Architecture](#5-ai-agent-architecture)
6. [State Management](#6-state-management)
7. [Environment Variables](#7-environment-variables)
8. [UI/UX Design System](#8-uiux-design-system)
9. [Data Flow Diagrams](#9-data-flow-diagrams)

---

## 1. Project Structure

```
owlymarket/
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment (gitignored)
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind + theme configuration
├── README.md                    # Project documentation
│
├── docs/                        # Documentation
│   ├── 01-research-summary.md
│   ├── 02-architecture-plan.md
│   ├── 03-api-documentation.md
│   └── 04-deployment-guide.md
│
├── public/                      # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   │
│   │   ├── analyze/
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Analysis results page
│   │   │       └── loading.tsx # Loading state
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # User dashboard
│   │   │   └── layout.tsx      # Dashboard layout
│   │   │
│   │   ├── auth/
│   │   │   ├── page.tsx        # Sign in page
│   │   │   ├── callback/       # OAuth callback
│   │   │   │   └── page.tsx
│   │   │   └── sign-out/
│   │   │       └── page.tsx
│   │   │
│   │   ├── payment/
│   │   │   ├── page.tsx        # Subscription page
│   │   │   ├── success/
│   │   │   │   └── page.tsx
│   │   │   └── cancel/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                # API routes
│   │       ├── analyze/
│   │       │   ├── route.ts    # POST: Trigger analysis
│   │       │   └── [id]/
│   │       │       └── route.ts # GET: Fetch analysis
│   │       │
│   │       ├── payment/
│   │       │   └── verify/
│   │       │       └── route.ts # POST: Verify BSC tx
│   │       │
│   │       ├── user/
│   │       │   ├── history/
│   │       │   │   └── route.ts # GET: User analyses
│   │       │   └── subscription/
│   │       │       └── route.ts # GET: Subscription status
│   │       │
│   │       └── health/
│   │           └── route.ts     # GET: Health check
│   │
│   ├── components/              # React components
│   │   ├── ui/                 # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Container.tsx
│   │   │
│   │   ├── analysis/           # Analysis-specific
│   │   │   ├── MarketInput.tsx      # URL input form
│   │   │   ├── AnalysisProgress.tsx # Progress indicator
│   │   │   ├── ReportCard.tsx       # Full report display
│   │   │   ├── EvidenceTable.tsx    # Evidence list
│   │   │   ├── EvidenceItem.tsx     # Single evidence
│   │   │   ├── ProbabilityChart.tsx # Bayesian calc viz
│   │   │   └── MarketInfo.tsx       # Market metadata
│   │   │
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── AnalysisHistory.tsx  # Past analyses
│   │   │   ├── AnalysisCard.tsx     # Single analysis card
│   │   │   ├── StatsCard.tsx        # Usage stats
│   │   │   └── SubscriptionCard.tsx # Plan info
│   │   │
│   │   ├── payment/            # Payment components
│   │   │   ├── PricingTable.tsx     # Pricing tiers
│   │   │   ├── PaymentForm.tsx      # BSC payment form
│   │   │   └── TransactionStatus.tsx # TX verification
│   │   │
│   │   └── auth/               # Auth components
│   │       ├── WalletConnect.tsx    # Wallet connection
│   │       └── SignInForm.tsx       # Email sign in
│   │
│   ├── lib/                    # Core business logic
│   │   ├── agents/             # AI agent implementations
│   │   │   ├── planner.ts
│   │   │   ├── researcher-pro.ts
│   │   │   ├── researcher-con.ts
│   │   │   ├── critic.ts
│   │   │   ├── followup.ts
│   │   │   ├── analyst.ts
│   │   │   ├── correlation.ts
│   │   │   ├── reporter.ts
│   │   │   └── orchestrator.ts      # Main flow
│   │   │
│   │   ├── blockchain/         # BSC integration
│   │   │   ├── config.ts            # Chain config
│   │   │   ├── wallet.ts            # Wallet connection
│   │   │   ├── payment.ts           # USDT transfers
│   │   │   └── verify.ts            # TX verification
│   │   │
│   │   ├── supabase/           # Database
│   │   │   ├── client.ts            # Supabase clients
│   │   │   ├── queries.ts           # Typed queries
│   │   │   ├── mutations.ts         # Insert/update
│   │   │   └── auth.ts              # Auth helpers
│   │   │
│   │   ├── integrations/       # External APIs
│   │   │   ├── openai.ts            # OpenAI client
│   │   │   ├── polymarket.ts        # Polymarket API
│   │   │   ├── kalshi.ts            # Kalshi API
│   │   │   └── valyu.ts             # Valyu API (optional)
│   │   │
│   │   ├── utils/              # Utility functions
│   │   │   ├── bayesian.ts          # Bayesian calculations
│   │   │   ├── validation.ts        # Input validation
│   │   │   ├── format.ts            # Formatting helpers
│   │   │   ├── api.ts               # API helpers
│   │   │   └── errors.ts            # Error handling
│   │   │
│   │   └── hooks/              # React hooks
│   │       ├── useAnalysis.ts       # Analysis operations
│   │       ├── useAuth.ts           # Auth state
│   │       ├── useWallet.ts         # Wallet connection
│   │       └── useSubscription.ts   # Subscription status
│   │
│   ├── types/                  # TypeScript types
│   │   ├── index.ts            # Main type exports
│   │   ├── database.ts         # Database types (auto-generated)
│   │   ├── api.ts              # API request/response types
│   │   ├── agents.ts           # Agent input/output types
│   │   └── blockchain.ts       # Blockchain types
│   │
│   └── config/                 # Configuration files
│       ├── constants.ts        # App constants
│       └── site.ts             # Site metadata
│
├── supabase/                   # Supabase project files
│   ├── config.toml             # Supabase config
│   ├── seed.sql                # Seed data (optional)
│   └── migrations/             # Database migrations
│       ├── 20250101000000_initial_schema.sql
│       ├── 20250101000001_create_users.sql
│       ├── 20250101000002_create_analyses.sql
│       ├── 20250101000003_create_transactions.sql
│       └── 20250101000004_add_rls_policies.sql
│
└── tests/                      # Test files
    ├── unit/
    │   ├── agents/
    │   │   └── bayesian.test.ts
    │   └── utils/
    │       └── validation.test.ts
    │
    ├── integration/
    │   └── analysis-flow.test.ts
    │
    └── setup.ts                # Test configuration
```

---

## 2. Database Schema

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐         ┌──────────────────┐         ┌───────────────────┐
│     users       │         │    analyses      │         │   transactions    │
├─────────────────┤         ├──────────────────┤         ├───────────────────┤
│ id (PK)         │────┐    │ id (PK)          │    ┌───│ id (PK)           │
│ wallet_address  │    │    │ user_id (FK)     │────┘   │ user_id (FK)      │
│ email           │    └───<│ market_url       │        │ tx_hash (unique)  │
│ subscription_   │         │ market_source    │        │ amount            │
│  tier           │         │ report_json      │        │ currency          │
│ subscription_   │         │ status           │        │ status            │
│  expires_at     │         │ is_public        │        │ created_at        │
│ created_at      │         │ created_at       │        └───────────────────┘
│ updated_at      │         │ updated_at       │
└─────────────────┘         └──────────────────┘

Relationships:
- users 1:N analyses (one user has many analyses)
- users 1:N transactions (one user has many transactions)
```

### Table Definitions

#### `users` Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE,
  email TEXT UNIQUE,
  subscription_tier TEXT NOT NULL DEFAULT 'free', -- 'free' | 'premium'
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  analyses_count INT DEFAULT 0, -- Denormalized for rate limiting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier, subscription_expires_at);
```

#### `analyses` Table

```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  market_url TEXT NOT NULL,
  market_source TEXT NOT NULL, -- 'polymarket' | 'kalshi'
  market_id TEXT, -- External market ID
  market_title TEXT,
  report_json JSONB NOT NULL, -- Full analysis report
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
  error_message TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analyses_user ON analyses(user_id, created_at DESC);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_public ON analyses(is_public, created_at DESC) WHERE is_public = TRUE;
CREATE INDEX idx_analyses_market ON analyses(market_source, market_id);

-- Trigger for updated_at
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### `transactions` Table

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tx_hash TEXT UNIQUE NOT NULL,
  amount NUMERIC(20, 8) NOT NULL, -- USDT amount (18 decimals)
  currency TEXT DEFAULT 'USDT',
  chain TEXT DEFAULT 'BSC',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'failed'
  verified_at TIMESTAMP WITH TIME ZONE,
  subscription_months INT DEFAULT 1, -- How many months purchased
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_hash ON transactions(tx_hash);
CREATE INDEX idx_transactions_status ON transactions(status);
```

### Helper Functions

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment analyses count
CREATE OR REPLACE FUNCTION increment_analyses_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE users
    SET analyses_count = analyses_count + 1
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_user_analyses_count
  AFTER UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION increment_analyses_count();
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Analyses table policies
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- Transactions table policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 3. API Routes Design

### API Endpoints Overview

```
POST   /api/analyze              # Trigger new analysis
GET    /api/analyze/[id]         # Get analysis by ID
GET    /api/user/history         # Get user's analysis history
GET    /api/user/subscription    # Get subscription status
POST   /api/payment/verify       # Verify BSC transaction
GET    /api/health               # Health check endpoint
```

### Detailed API Specifications

#### POST `/api/analyze`

**Purpose**: Trigger a new market analysis

**Authentication**: Required

**Request Body**:
```typescript
{
  market_url: string  // Polymarket or Kalshi URL
}
```

**Response** (201 Created):
```typescript
{
  id: string  // Analysis ID
  status: 'pending' | 'processing'
  created_at: string
}
```

**Error Responses**:
- 400: Invalid market URL
- 401: Unauthorized
- 429: Rate limit exceeded
- 500: Internal server error

**Implementation Flow**:
1. Validate user authentication
2. Check subscription limits (free: 5/month, premium: unlimited)
3. Parse and validate market URL
4. Create analysis record with status 'pending'
5. Queue analysis job (async)
6. Return analysis ID immediately

**Rate Limiting**:
- Free tier: 5 analyses per month
- Premium: Unlimited
- Implement exponential backoff for retries

---

#### GET `/api/analyze/[id]`

**Purpose**: Retrieve analysis results

**Authentication**: Required (owner) or Public (if is_public = true)

**URL Parameters**:
- `id`: Analysis UUID

**Response** (200 OK):
```typescript
{
  id: string
  market_url: string
  market_source: 'polymarket' | 'kalshi'
  market_title: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  report: {
    market_data: {
      title: string
      current_probability: number
      close_date: string
      volume: number
    }
    evidence: Array<{
      claim: string
      source: string
      quality_grade: 'A' | 'B' | 'C' | 'D' | 'F'
      supports_outcome: 'yes' | 'no'
      confidence: number
      reasoning: string
    }>
    probability_analysis: {
      prior: number
      raw_posterior: number
      adjusted_posterior: number
      confidence_interval: [number, number]
    }
    final_prediction: {
      probability: number
      confidence: 'high' | 'medium' | 'low'
      recommendation: string
    }
  }
  created_at: string
  updated_at: string
}
```

**Error Responses**:
- 401: Unauthorized (not owner and not public)
- 404: Analysis not found
- 500: Internal server error

---

#### GET `/api/user/history`

**Purpose**: Get user's past analyses

**Authentication**: Required

**Query Parameters**:
- `limit`: Number of results (default: 10, max: 50)
- `offset`: Pagination offset (default: 0)
- `status`: Filter by status (optional)

**Response** (200 OK):
```typescript
{
  analyses: Array<{
    id: string
    market_url: string
    market_title: string
    status: string
    created_at: string
  }>
  total: number
  has_more: boolean
}
```

---

#### GET `/api/user/subscription`

**Purpose**: Get user's subscription status

**Authentication**: Required

**Response** (200 OK):
```typescript
{
  tier: 'free' | 'premium'
  expires_at: string | null
  analyses_count: number
  analyses_limit: number | null  // null for unlimited
  is_active: boolean
}
```

---

#### POST `/api/payment/verify`

**Purpose**: Verify BSC USDT transaction and update subscription

**Authentication**: Required

**Request Body**:
```typescript
{
  tx_hash: string  // BSC transaction hash
  amount: string   // USDT amount
}
```

**Response** (200 OK):
```typescript
{
  success: true
  transaction: {
    id: string
    status: 'confirmed'
    verified_at: string
  }
  subscription: {
    tier: 'premium'
    expires_at: string
  }
}
```

**Error Responses**:
- 400: Invalid transaction hash
- 402: Transaction amount insufficient
- 409: Transaction already used
- 500: Verification failed

**Implementation Flow**:
1. Check if tx_hash already exists
2. Fetch transaction receipt from BSC
3. Verify recipient address matches app wallet
4. Verify amount >= required payment
5. Decode transfer event to confirm USDT transfer
6. Create transaction record
7. Update user subscription (add 1 month per payment)
8. Return success with new subscription details

---

## 4. Component Hierarchy

### Page Component Trees

#### Home Page (`/`)

```
HomePage
├── Header
│   ├── Logo
│   ├── Navigation
│   │   ├── NavLink (Features)
│   │   ├── NavLink (Pricing)
│   │   └── NavLink (About)
│   └── AuthButton
│       └── WalletConnect
├── HeroSection
│   ├── HeroTitle
│   ├── HeroSubtitle
│   ├── MarketInput
│   │   ├── Input (URL)
│   │   └── Button (Analyze)
│   └── RecentAnalyses (optional)
├── FeaturesSection
│   ├── FeatureCard (AI Agents)
│   ├── FeatureCard (Bayesian Analysis)
│   └── FeatureCard (Evidence Grading)
├── HowItWorksSection
│   ├── Step (Input Market)
│   ├── Step (AI Research)
│   └── Step (Get Report)
├── PricingSection
│   ├── PricingCard (Free)
│   └── PricingCard (Premium)
└── Footer
    ├── FooterLinks
    └── SocialLinks
```

#### Analysis Page (`/analyze/[id]`)

```
AnalysisPage
├── Header
├── Container
│   ├── AnalysisProgress (if processing)
│   │   ├── ProgressBar
│   │   └── StatusMessage
│   │
│   └── ReportCard (if completed)
│       ├── MarketInfo
│       │   ├── MarketTitle
│       │   ├── MarketMeta (source, close date)
│       │   └── CurrentProbability
│       │
│       ├── EvidenceSection
│       │   ├── SectionTitle (Pro Evidence)
│       │   ├── EvidenceTable
│       │   │   └── EvidenceItem[]
│       │   ├── SectionTitle (Con Evidence)
│       │   └── EvidenceTable
│       │       └── EvidenceItem[]
│       │
│       ├── ProbabilitySection
│       │   ├── ProbabilityChart
│       │   │   ├── PriorBar
│       │   │   ├── PosteriorBar
│       │   │   └── ConfidenceInterval
│       │   └── ExplanationText
│       │
│       ├── FinalPredictionCard
│       │   ├── PredictionValue
│       │   ├── ConfidenceBadge
│       │   └── Recommendation
│       │
│       └── ActionsBar
│           ├── Button (Share)
│           ├── Button (Export)
│           └── Button (New Analysis)
│
└── Footer
```

#### Dashboard Page (`/dashboard`)

```
DashboardPage
├── Header
├── Sidebar
│   ├── NavItem (Overview)
│   ├── NavItem (History)
│   ├── NavItem (Subscription)
│   └── NavItem (Settings)
│
├── MainContent
│   ├── StatsGrid
│   │   ├── StatsCard (Total Analyses)
│   │   ├── StatsCard (This Month)
│   │   └── StatsCard (Accuracy)
│   │
│   ├── SubscriptionCard
│   │   ├── CurrentTier
│   │   ├── ExpiryDate
│   │   └── UpgradeButton
│   │
│   └── AnalysisHistory
│       ├── FilterBar
│       │   ├── StatusFilter
│       │   └── DateRangeFilter
│       │
│       └── AnalysisList
│           └── AnalysisCard[]
│               ├── MarketTitle
│               ├── StatusBadge
│               ├── CreatedDate
│               └── ViewButton
│
└── Footer
```

#### Payment Page (`/payment`)

```
PaymentPage
├── Header
├── Container
│   ├── PricingTable
│   │   ├── FreeTier
│   │   └── PremiumTier (selected)
│   │
│   ├── PaymentForm
│   │   ├── WalletConnect
│   │   │   └── ConnectedWalletInfo
│   │   │
│   │   ├── PaymentDetails
│   │   │   ├── AmountDisplay
│   │   │   ├── RecipientAddress
│   │   │   └── NetworkInfo (BSC)
│   │   │
│   │   ├── TransferButton
│   │   │   └── Loading (if pending)
│   │   │
│   │   └── TransactionStatus
│   │       ├── PendingState
│   │       ├── SuccessState
│   │       └── ErrorState
│   │
│   └── FAQSection
│       └── FAQ[]
│
└── Footer
```

---

## 5. AI Agent Architecture

### Agent Flow Diagram

```
┌─────────────────────┐
│  User Submits URL   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│  Planner Agent                              │
│  - Breaks down market question              │
│  - Creates research strategy                │
│  - Defines search queries                   │
└──────────┬──────────────────────────────────┘
           │
           ├─────────────────┬─────────────────┐
           ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐   (Parallel)
│ Pro Researcher   │ │ Con Researcher   │
│ - Gathers YES    │ │ - Gathers NO     │
│   evidence       │ │   evidence       │
│ - Uses Valyu/Web │ │ - Uses Valyu/Web │
└──────────┬───────┘ └─────────┬────────┘
           │                   │
           └─────────┬─────────┘
                     ▼
           ┌──────────────────┐
           │  Critic Agent    │
           │  - Grades A-F    │
           │  - Finds gaps    │
           │  - Quality check │
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │ Follow-up Agent  │
           │ - Fills gaps     │
           │ - Additional     │
           │   research       │
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │  Analyst Agent   │
           │  - Bayesian calc │
           │  - Logit updates │
           │  - Confidence    │
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │ Correlation Agent│
           │ - Adjust for     │
           │   redundancy     │
           │ - Final prob     │
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │  Reporter Agent  │
           │  - Synthesize    │
           │  - Format report │
           │  - Markdown      │
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │  Save to DB      │
           │  Return to User  │
           └──────────────────┘
```

### Agent Input/Output Types

```typescript
// lib/agents/types.ts

export interface PlannerInput {
  market_url: string
  market_data: {
    title: string
    description?: string
    current_probability: number
  }
}

export interface PlannerOutput {
  research_question: string
  pro_queries: string[]
  con_queries: string[]
  estimated_time: number
}

export interface ResearcherInput {
  research_question: string
  queries: string[]
  stance: 'pro' | 'con'
}

export interface ResearcherOutput {
  evidence: Array<{
    claim: string
    source: string
    url?: string
    excerpt: string
    relevance_score: number
  }>
}

export interface CriticInput {
  evidence: ResearcherOutput['evidence']
}

export interface CriticOutput {
  graded_evidence: Array<{
    claim: string
    source: string
    quality_grade: 'A' | 'B' | 'C' | 'D' | 'F'
    supports_outcome: 'yes' | 'no'
    confidence: number
    reasoning: string
  }>
  gaps: string[]
}

export interface AnalystInput {
  prior_probability: number
  evidence: CriticOutput['graded_evidence']
}

export interface AnalystOutput {
  prior: number
  raw_posterior: number
  adjusted_posterior: number
  confidence_interval: [number, number]
  explanation: string
}

export interface ReporterInput {
  market_data: PlannerInput['market_data']
  evidence: CriticOutput['graded_evidence']
  analysis: AnalystOutput
}

export interface ReporterOutput {
  markdown_report: string
  structured_data: {
    market_data: any
    evidence: any[]
    probability_analysis: AnalystOutput
    final_prediction: {
      probability: number
      confidence: 'high' | 'medium' | 'low'
      recommendation: string
    }
  }
}
```

---

## 6. State Management

### Global State (Zustand)

```typescript
// src/lib/store/authStore.ts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (credentials: any) => Promise<void>
  signOut: () => Promise<void>
}

// src/lib/store/walletStore.ts
interface WalletState {
  address: string | null
  isConnected: boolean
  chainId: number | null
  connect: () => Promise<void>
  disconnect: () => void
}

// src/lib/store/subscriptionStore.ts
interface SubscriptionState {
  tier: 'free' | 'premium'
  expiresAt: Date | null
  analysesCount: number
  analysesLimit: number | null
  refresh: () => Promise<void>
}
```

### Server State (React Query)

```typescript
// src/lib/hooks/useAnalysis.ts
export function useAnalysis(id: string) {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn: () => fetchAnalysis(id),
    refetchInterval: (data) =>
      data?.status === 'processing' ? 5000 : false, // Poll if processing
  })
}

export function useAnalysisHistory() {
  return useQuery({
    queryKey: ['analyses', 'history'],
    queryFn: fetchAnalysisHistory,
  })
}

export function useCreateAnalysis() {
  return useMutation({
    mutationFn: createAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    },
  })
}
```

### Local Component State

Use React `useState` for:
- Form inputs
- UI toggles (modals, dropdowns)
- Temporary selections

---

## 7. Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=OwlyMarket

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Valyu (optional)
VALYU_API_KEY=valyu_...

# Blockchain (BSC)
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_USDT_CONTRACT=0x55d398326f99059ff775485246999027b3197955
NEXT_PUBLIC_PAYMENT_WALLET=0x... # Your wallet to receive payments

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# App Configuration
NEXT_PUBLIC_FREE_TIER_LIMIT=5
NEXT_PUBLIC_PREMIUM_PRICE_USDT=10

# Feature Flags
NEXT_PUBLIC_ENABLE_VALYU=false
NEXT_PUBLIC_ENABLE_KALSHI=false
```

---

## 8. UI/UX Design System

### Color Palette (Based on UI/UX Pro Max Skill)

**Fintech/Analytics Theme:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Blue
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          900: '#1E3A8A',
        },
        secondary: {
          DEFAULT: '#60A5FA',
          500: '#60A5FA',
        },
        cta: {
          DEFAULT: '#F97316', // Orange
          hover: '#EA580C',
        },
        background: '#F8FAFC',
        text: {
          DEFAULT: '#1E293B',
          muted: '#64748B',
        },
        border: '#E2E8F0',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        // Evidence grades
        grade: {
          A: '#10B981', // Green
          B: '#3B82F6', // Blue
          C: '#F59E0B', // Yellow
          D: '#F97316', // Orange
          F: '#EF4444', // Red
        },
      },
    },
  },
}
```

### Typography

```typescript
fontFamily: {
  sans: ['Inter', 'sans-serif'],
  mono: ['Fira Code', 'monospace'],
},
fontSize: {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
},
```

### Component Variants

**Button Variants:**
- Primary (CTA orange)
- Secondary (Blue outline)
- Ghost (Transparent)
- Danger (Red)

**Card Variants:**
- Default (white background, subtle shadow)
- Elevated (larger shadow, hover effect)
- Outlined (border only)

### Animation/Motion

```typescript
animation: {
  'fade-in': 'fadeIn 0.3s ease-in',
  'slide-up': 'slideUp 0.4s ease-out',
  'pulse-slow': 'pulse 3s infinite',
},
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  slideUp: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
},
```

---

## 9. Data Flow Diagrams

### Analysis Creation Flow

```
User Input (Market URL)
        │
        ▼
Frontend Validation
        │
        ▼
POST /api/analyze
        │
        ├─► Check Auth (Supabase)
        ├─► Check Subscription Limits
        ├─► Validate Market URL
        │
        ▼
Create Analysis Record (status: 'pending')
        │
        ▼
Queue Analysis Job (async)
        │
        ├─► Return Analysis ID to User
        │
        └─► Background Processing:
                │
                ├─► Update status to 'processing'
                │
                ├─► Fetch Market Data (Polymarket/Kalshi API)
                │
                ├─► Run Agent Orchestrator
                │   ├─► Planner
                │   ├─► Researchers (parallel)
                │   ├─► Critic
                │   ├─► Follow-up (if needed)
                │   ├─► Analyst
                │   ├─► Correlation
                │   └─► Reporter
                │
                ├─► Save Report to Database (report_json)
                │
                └─► Update status to 'completed' (or 'failed')
```

### Payment Verification Flow

```
User Sends USDT on BSC
        │
        ▼
User Submits TX Hash
        │
        ▼
POST /api/payment/verify
        │
        ├─► Check if TX already used
        │
        ├─► Fetch TX Receipt from BSC Node
        │   (using Viem publicClient)
        │
        ├─► Verify TX Status = 'success'
        │
        ├─► Decode Transfer Event
        │   ├─► Check Recipient = App Wallet
        │   └─► Check Amount >= Required
        │
        ├─► Create Transaction Record
        │
        ├─► Update User Subscription
        │   ├─► Set tier = 'premium'
        │   └─► Set expires_at = +1 month
        │
        └─► Return Success + New Subscription Info
```

### Real-time Analysis Status Updates (Future)

```
Client Subscribes to Analysis
        │
        ▼
Supabase Realtime Subscription
        │
        ▼
Agent Updates Database
   (status: 'planner_done', 'research_done', etc.)
        │
        ▼
Supabase Broadcasts Change
        │
        ▼
Client Receives Update
        │
        └─► UI Updates Progress Bar
```

---

## Security Considerations

1. **API Keys**: Never expose OpenAI/Valyu keys to client
2. **RLS Policies**: Enforce at database level
3. **Input Validation**: Validate all user inputs (URLs, tx hashes)
4. **Rate Limiting**: Prevent abuse (per-user limits)
5. **Payment Verification**: Always verify on-chain
6. **CORS**: Restrict to app domain only
7. **SQL Injection**: Use parameterized queries (Supabase handles this)
8. **XSS**: Sanitize markdown output

---

## Performance Optimizations

1. **Code Splitting**: Dynamic imports for heavy components
2. **Image Optimization**: Use Next.js Image component
3. **API Caching**: Cache market data (5-minute TTL)
4. **Database Indexes**: On frequently queried columns
5. **Lazy Loading**: Components below fold
6. **Memoization**: Expensive calculations (useMemo)
7. **Debouncing**: Search inputs

---

## Accessibility Standards

- **Target**: WCAG 2.1 Level AA
- **Keyboard Navigation**: All interactive elements
- **Screen Readers**: Semantic HTML, ARIA labels
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Indicators**: Visible focus states
- **Alt Text**: All images
- **Form Labels**: Proper label associations

---

**Planning Phase Complete**: ✅
**Ready for Implementation**: Next step is project setup and dependency installation.
