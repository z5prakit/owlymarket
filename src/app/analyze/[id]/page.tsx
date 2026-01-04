'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Loading } from '@/components/ui/Loading'
import { ReportCard } from '@/components/analysis/ReportCard'
import { apiRequest } from '@/lib/utils/api'
import type { GetAnalysisResponse } from '@/types/api'

export default function AnalysisPage() {
  const params = useParams()
  const id = params.id as string
  const [analysis, setAnalysis] = useState<GetAnalysisResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await apiRequest<GetAnalysisResponse>(`/api/analyze/${id}`)
        setAnalysis(data)

        // If pending or processing, trigger processing chunk
        if (data.status === 'processing' || data.status === 'pending') {
          // Call process endpoint to do work
          fetch(`/api/analyze/${id}/process`, { method: 'POST' })
            .then(res => res.json())
            .then(processResult => {
              console.log('[Analysis] Process result:', processResult)
              // Poll again after 3 seconds
              setTimeout(fetchAnalysis, 3000)
            })
            .catch(err => {
              console.error('[Analysis] Process error:', err)
              // Still poll even if process fails
              setTimeout(fetchAnalysis, 5000)
            })
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis')
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [id])

  if (error) {
    return (
      <Container>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-error mb-4">Error</h1>
          <p className="text-text-muted">{error}</p>
        </div>
      </Container>
    )
  }

  if (isLoading || !analysis) {
    return (
      <Container>
        <Loading message="Analyzing market..." />
      </Container>
    )
  }

  if (analysis.status === 'pending' || analysis.status === 'processing') {
    const progressMessage = analysis.progress_message || 'AI agents are analyzing the market...'
    const progressStep = analysis.progress_step

    const steps = [
      { id: 'planning', label: '📋 Planning' },
      { id: 'researching', label: '🔍 Researching' },
      { id: 'critiquing', label: '⚖️ Critiquing' },
      { id: 'analyzing', label: '📊 Analyzing' },
      { id: 'reporting', label: '📝 Reporting' },
    ]

    const currentStepIndex = steps.findIndex(s => s.id === progressStep)

    return (
      <Container>
        <div className="max-w-2xl mx-auto text-center py-20">
          <Loading message={progressMessage} />

          {progressStep && (
            <div className="mt-8 space-y-6">
              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'bg-primary animate-pulse scale-125'
                        : idx < currentStepIndex
                        ? 'bg-primary/60'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Current step label */}
              <div className="space-y-2">
                <p className="text-lg font-semibold text-primary">
                  {steps[currentStepIndex]?.label || progressStep}
                </p>
                <p className="text-sm text-text-muted">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
              </div>

              {/* Step descriptions */}
              <div className="mt-6 space-y-1 text-xs text-text-muted max-w-md mx-auto">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`py-1 px-3 rounded ${
                      idx === currentStepIndex
                        ? 'bg-primary/10 text-primary font-medium'
                        : idx < currentStepIndex
                        ? 'text-text-muted/60'
                        : 'text-text-muted/40'
                    }`}
                  >
                    {step.label}
                    {idx === currentStepIndex && ' (in progress...)'}
                    {idx < currentStepIndex && ' ✓'}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 text-sm text-text-muted">
            ⏱️ Analysis typically takes 60-90 seconds
          </p>
        </div>
      </Container>
    )
  }

  if (analysis.status === 'failed') {
    return (
      <Container>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-error mb-4">Analysis Failed</h1>
          <p className="text-text-muted">{analysis.error_message || 'Unknown error occurred'}</p>
        </div>
      </Container>
    )
  }

  if (!analysis.report) {
    return (
      <Container>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-error mb-4">No Report Available</h1>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <ReportCard report={analysis.report} />
    </Container>
  )
}
