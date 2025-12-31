/**
 * Agent Orchestrator - Main analysis flow
 */

import { runPlannerAgent } from './planner'
import { runProResearcherAgent } from './researcher-pro'
import { runConResearcherAgent } from './researcher-con'
import { runCriticAgent } from './critic'
import { runFollowUpAgent } from './followup'
import { runAnalystAgent } from './analyst'
import { runCorrelationAgent } from './correlation'
import { runReporterAgent } from './reporter'
import type { OrchestrationResult } from '@/types/agents'

export interface OrchestrationInput {
  market_url: string
  market_data: {
    title: string
    description?: string
    current_probability: number
    close_date: string
    volume?: number
  }
  analysis_id?: string
  onProgress?: (step: string, message: string) => Promise<void>
}

/**
 * Run complete multi-agent analysis
 */
export async function runAgentOrchestration(
  input: OrchestrationInput
): Promise<OrchestrationResult> {
  const startTime = Date.now()

  console.log('[Orchestrator] Starting analysis...')

  // Step 1: Plan research strategy
  console.log('[Orchestrator] Step 1: Planning...')
  if (input.onProgress) {
    await input.onProgress('planning', 'Creating research strategy...')
  }
  const plan = await runPlannerAgent({
    market_url: input.market_url,
    market_data: input.market_data,
  })

  // Step 2: Parallel research (Pro & Con)
  console.log('[Orchestrator] Step 2: Researching...')
  if (input.onProgress) {
    await input.onProgress('researching', 'Gathering evidence from multiple sources...')
  }
  const [proResearch, conResearch] = await Promise.all([
    runProResearcherAgent({
      research_question: plan.research_question,
      queries: plan.pro_queries,
      stance: 'pro',
    }),
    runConResearcherAgent({
      research_question: plan.research_question,
      queries: plan.con_queries,
      stance: 'con',
    }),
  ])

  const allRawEvidence = [...proResearch.evidence, ...conResearch.evidence]

  // Step 3: Critique evidence
  console.log('[Orchestrator] Step 3: Critiquing...')
  if (input.onProgress) {
    await input.onProgress('critiquing', 'Evaluating evidence quality and reliability...')
  }
  const critique = await runCriticAgent({ evidence: allRawEvidence })

  // Step 4: Follow-up research (SKIPPED for speed)
  let allEvidence = critique.graded_evidence
  if (false && critique.gaps.length >= 3) {
    console.log('[Orchestrator] Step 4: Follow-up research...')
    if (input.onProgress) {
      await input.onProgress('followup', 'Conducting additional research to fill gaps...')
    }
    // Limit to top 2 most important gaps for speed
    const topGaps = critique.gaps.slice(0, 2)
    const followUp = await runFollowUpAgent({
      gaps: topGaps,
      research_question: plan.research_question,
    })

    if (followUp.additional_evidence.length > 0) {
      // Re-critique follow-up evidence
      const followUpCritique = await runCriticAgent({
        evidence: followUp.additional_evidence,
      })
      allEvidence = [...allEvidence, ...followUpCritique.graded_evidence]
    }
  } else {
    console.log('[Orchestrator] Step 4: Skipping follow-up (sufficient evidence)')
  }

  // Step 5: Bayesian analysis
  console.log('[Orchestrator] Step 5: Analyzing probabilities...')
  if (input.onProgress) {
    await input.onProgress('analyzing', 'Calculating probability using Bayesian analysis...')
  }
  const analysis = await runAnalystAgent({
    prior_probability: input.market_data.current_probability,
    evidence: allEvidence,
  })

  // Step 6: Correlation adjustment (SKIPPED for speed)
  console.log('[Orchestrator] Step 6: Skipping correlation (using raw probability)...')
  // Skip correlation adjustment for speed - use raw probability
  analysis.adjusted_posterior = analysis.raw_posterior

  // Step 7: Generate report
  console.log('[Orchestrator] Step 7: Generating report...')
  if (input.onProgress) {
    await input.onProgress('reporting', 'Generating final analysis report...')
  }
  const report = await runReporterAgent({
    market_data: input.market_data,
    evidence: allEvidence,
    analysis,
  })

  const executionTime = (Date.now() - startTime) / 1000

  console.log(`[Orchestrator] Complete! Execution time: ${executionTime.toFixed(1)}s`)

  return {
    market_data: input.market_data,
    plan,
    all_evidence: allEvidence,
    analysis,
    final_report: report,
    execution_time: executionTime,
  }
}
