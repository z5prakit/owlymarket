# OwlyMarket 🦉

> AI-Powered Prediction Market Analysis Platform

OwlyMarket uses advanced multi-agent AI systems and Bayesian probability analysis to provide deep, systematic research on prediction markets (Polymarket & Kalshi).

## ✨ Features

- 🤖 **8 Specialized AI Agents** - Planner, Pro/Con Researchers, Critic, Follow-up, Analyst, Correlation, Reporter
- 📊 **Bayesian Probability Analysis** - Evidence-based probability calculations with confidence intervals
- ✅ **Evidence Grading (A-F)** - All evidence is evaluated for credibility, recency, and verifiability
- 🔗 **Multi-Source Research** - Integrates Valyu AI for proprietary datasets
- 💰 **BSC USDT Payments** - Premium subscriptions via Binance Smart Chain
- 📱 **Responsive UI** - Modern, professional interface built with Next.js 14 + Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account (free tier works)
- OpenAI API key
- (Optional) Valyu API key for enhanced research

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd owlymarket
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (Required)
OPENAI_API_KEY=sk-your-api-key

# Valyu AI (Optional - for enhanced research)
VALYU_API_KEY=valyu_your-api-key
NEXT_PUBLIC_ENABLE_VALYU=true

# BSC Payment Wallet (for production)
NEXT_PUBLIC_PAYMENT_WALLET=0xYourWalletAddress

# Feature Flags
NEXT_PUBLIC_ENABLE_KALSHI=true
NEXT_PUBLIC_ENABLE_REAL_PAYMENTS=false
```

4. **Set up Supabase database**

Run migrations in your Supabase project dashboard or via CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually execute migration files in order:
1. `supabase/migrations/20250101000000_initial_schema.sql`
2. `supabase/migrations/20250101000001_create_users.sql`
3. `supabase/migrations/20250101000002_create_analyses.sql`
4. `supabase/migrations/20250101000003_create_transactions.sql`
5. `supabase/migrations/20250101000004_add_rls_policies.sql`

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📖 Usage

### Analyze a Market

1. Go to the home page
2. Paste a Polymarket or Kalshi market URL
   - Example: `https://polymarket.com/event/will-trump-win-2024`
3. Click "Analyze"
4. Wait 30-60 seconds for AI agents to complete analysis
5. View comprehensive report with:
   - Bayesian probability estimate
   - Pro/Con evidence with quality grades
   - Confidence level and intervals
   - Final recommendation

### API Usage

#### Create Analysis

```bash
POST /api/analyze
Content-Type: application/json

{
  "market_url": "https://polymarket.com/event/your-market"
}
```

Response:
```json
{
  "id": "uuid",
  "status": "pending",
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### Get Analysis

```bash
GET /api/analyze/{id}
```

Response:
```json
{
  "id": "uuid",
  "market_title": "Will Trump win 2024?",
  "status": "completed",
  "report": {
    "market_data": {...},
    "evidence": [...],
    "probability_analysis": {...},
    "final_prediction": {
      "probability": 0.65,
      "confidence": "high",
      "recommendation": "..."
    }
  }
}
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o, Valyu AI (optional)
- **Blockchain**: Viem + Wagmi (BSC USDT)
- **Deployment**: Vercel

### Project Structure

```
owlymarket/
├── src/
│   ├── app/              # Next.js pages & API routes
│   ├── components/       # React components
│   ├── lib/
│   │   ├── agents/      # AI agent implementations (9 files)
│   │   ├── blockchain/  # BSC payment integration
│   │   ├── supabase/    # Database queries & auth
│   │   ├── integrations/# External APIs (OpenAI, Polymarket, Kalshi, Valyu)
│   │   └── utils/       # Helper functions (Bayesian calc, validation, etc.)
│   ├── types/           # TypeScript types
│   └── config/          # App configuration
├── supabase/
│   └── migrations/      # Database schema
├── docs/                # Documentation
└── public/              # Static assets
```

### AI Agent Flow

```
User Input → Planner → [Pro Researcher, Con Researcher] → Critic →
Follow-up (if gaps) → Analyst → Correlation → Reporter → Final Report
```

1. **Planner**: Creates research strategy
2. **Pro Researcher**: Gathers supporting evidence
3. **Con Researcher**: Gathers opposing evidence
4. **Critic**: Grades evidence quality (A-F)
5. **Follow-up**: Fills research gaps
6. **Analyst**: Performs Bayesian probability calculation
7. **Correlation**: Adjusts for redundant evidence
8. **Reporter**: Generates final markdown report

## 🧪 Testing

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_ENABLE_REAL_PAYMENTS=true
```

## 💰 Pricing & Subscriptions

- **Free Tier**: 5 analyses per month
- **Premium**: $10/month (unlimited analyses)

Payment via BSC USDT to configured wallet address.

## 🔒 Security

- ✅ Row Level Security (RLS) enabled on all Supabase tables
- ✅ API keys stored server-side only
- ✅ Input validation on all endpoints
- ✅ On-chain payment verification
- ✅ Rate limiting per user

## 🛠️ Development

### Key Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
npm run type-check   # TypeScript check
```

### Adding a New Agent

1. Create file in `src/lib/agents/your-agent.ts`
2. Implement agent function with input/output types
3. Add to orchestrator in `src/lib/agents/orchestrator.ts`

### Adding a New Market Source

1. Create integration in `src/lib/integrations/your-source.ts`
2. Add parsing logic in `src/lib/utils/validation.ts`
3. Update API route in `src/app/api/analyze/route.ts`

## 📚 Documentation

- [Research Summary](./docs/01-research-summary.md) - API research findings
- [Architecture Plan](./docs/02-architecture-plan.md) - Detailed system design

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 🙏 Acknowledgments

- PolySeer for inspiration
- OpenAI for GPT-4o API
- Supabase for backend infrastructure
- Polymarket & Kalshi for market data

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@owlymarket.com (placeholder)

---

**Built with ❤️ using Next.js, OpenAI, and Supabase**
