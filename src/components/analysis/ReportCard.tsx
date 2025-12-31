import { Card } from '@/components/ui/Card'
import { formatProbability, formatDate, getGradeColor } from '@/lib/utils/format'
import type { AnalysisReport } from '@/types/api'

interface ReportCardProps {
  report: AnalysisReport
}

export function ReportCard({ report }: ReportCardProps) {
  const proEvidence = report.evidence.filter(e => e.supports_outcome === 'yes')
  const conEvidence = report.evidence.filter(e => e.supports_outcome === 'no')

  return (
    <div className="space-y-6">
      {/* Market Info */}
      <Card>
        <h2 className="text-2xl font-bold mb-2">{report.market_data.title}</h2>
        <div className="flex gap-4 text-sm text-text-muted">
          <span>Close Date: {formatDate(report.market_data.close_date)}</span>
          <span>Current: {formatProbability(report.market_data.current_probability)}</span>
        </div>
      </Card>

      {/* Final Prediction */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Final Prediction</h3>
        <div className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">
            {formatProbability(report.final_prediction.probability)}
          </div>
          <div className="text-sm text-text-muted mb-4">
            Confidence: <span className="font-semibold">{report.final_prediction.confidence.toUpperCase()}</span>
          </div>
          <p className="text-text">{report.final_prediction.recommendation}</p>
        </div>
      </Card>

      {/* Pro Evidence */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Supporting Evidence ({proEvidence.length})</h3>
        <div className="space-y-3">
          {proEvidence.map((e, i) => (
            <div key={i} className="border-l-4 border-grade-A pl-4">
              <div className="flex items-start justify-between">
                <p className="font-medium">{e.claim}</p>
                <span className={`text-sm font-bold ${getGradeColor(e.quality_grade)}`}>
                  {e.quality_grade}
                </span>
              </div>
              <p className="text-sm text-text-muted mt-1">{e.source}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Con Evidence */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Opposing Evidence ({conEvidence.length})</h3>
        <div className="space-y-3">
          {conEvidence.map((e, i) => (
            <div key={i} className="border-l-4 border-grade-F pl-4">
              <div className="flex items-start justify-between">
                <p className="font-medium">{e.claim}</p>
                <span className={`text-sm font-bold ${getGradeColor(e.quality_grade)}`}>
                  {e.quality_grade}
                </span>
              </div>
              <p className="text-sm text-text-muted mt-1">{e.source}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Probability Analysis */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Probability Analysis</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Prior (Market):</span>
            <span className="font-semibold">{formatProbability(report.probability_analysis.prior)}</span>
          </div>
          <div className="flex justify-between">
            <span>Raw Posterior:</span>
            <span className="font-semibold">{formatProbability(report.probability_analysis.raw_posterior)}</span>
          </div>
          <div className="flex justify-between">
            <span>Adjusted:</span>
            <span className="font-semibold">{formatProbability(report.probability_analysis.adjusted_posterior)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-muted">
            <span>Confidence Interval:</span>
            <span>
              {formatProbability(report.probability_analysis.confidence_interval[0])} - {formatProbability(report.probability_analysis.confidence_interval[1])}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
