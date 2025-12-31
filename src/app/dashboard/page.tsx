'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'

interface AnalysisSummary {
  id: string
  market_url: string
  market_source: 'polymarket' | 'kalshi'
  market_title: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  ai_prediction: 'YES' | 'NO' | null
  probability: number | null
  confidence: string | null
  created_at: string
}

const ITEMS_PER_PAGE = 20

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalyses() {
      setLoading(true)
      try {
        const offset = (page - 1) * ITEMS_PER_PAGE
        const response = await fetch(`/api/analyses?limit=${ITEMS_PER_PAGE}&offset=${offset}`)
        if (!response.ok) {
          throw new Error('Failed to fetch analyses')
        }
        const data = await response.json()
        setAnalyses(data.analyses)
        setTotal(data.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyses()
  }, [page])

  if (loading) {
    return (
      <Container>
        <div className="py-20">
          <Loading message="Loading dashboard..." />
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div className="py-20 text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="py-12">
        <h1 className="text-4xl font-bold mb-8">Analysis Dashboard</h1>

        {analyses.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>No analyses yet. Start by analyzing your first market!</p>
            <Link
              href="/"
              className="inline-block mt-4 text-primary hover:underline"
            >
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/analyze/${analysis.id}`}
                      className="text-lg font-semibold hover:text-primary transition-colors block mb-2"
                    >
                      {analysis.market_title || 'Untitled Market'}
                    </Link>

                    <a
                      href={analysis.market_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text-muted hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      {analysis.market_source === 'polymarket' ? '📊 Polymarket' : '📈 Kalshi'}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>

                    <p className="text-xs text-text-muted mt-2">
                      {new Date(analysis.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    {analysis.status === 'completed' && analysis.ai_prediction && analysis.probability !== null ? (
                      <>
                        <div
                          className={`text-2xl font-bold ${
                            analysis.ai_prediction === 'YES'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {analysis.ai_prediction}
                        </div>
                        <div className="text-xl font-semibold text-text">
                          {analysis.probability}%
                        </div>
                        {analysis.confidence && (
                          <div className="text-xs text-text-muted capitalize mt-1">
                            {analysis.confidence} confidence
                          </div>
                        )}
                      </>
                    ) : analysis.status === 'processing' ? (
                      <div className="text-sm text-text-muted">
                        <div className="animate-pulse">Analyzing...</div>
                      </div>
                    ) : analysis.status === 'failed' ? (
                      <div className="text-sm text-red-500">Failed</div>
                    ) : (
                      <div className="text-sm text-text-muted">Pending</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > ITEMS_PER_PAGE && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-text-muted">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, total)} of {total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * ITEMS_PER_PAGE >= total}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}
