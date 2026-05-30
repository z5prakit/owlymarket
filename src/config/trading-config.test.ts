import { describe, expect, it } from 'vitest'
import {
  assertRealTradingDisabled,
  REAL_TRADING_ENABLED,
  TRADING_CONFIG,
} from './trading-config'

describe('trading guard', () => {
  it('keeps real trading disabled', () => {
    expect(REAL_TRADING_ENABLED).toBe(false)
    expect(assertRealTradingDisabled()).toBe(TRADING_CONFIG)
  })
})
