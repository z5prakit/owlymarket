/**
 * Transaction verification utilities
 */

import { type Hash, type Address, decodeEventLog, formatUnits } from 'viem'
import { publicClient, USDT_ADDRESS, PAYMENT_WALLET, USDTConfig } from './config'
import { USDT_ABI } from './payment'
import type { PaymentVerification, TransferEvent } from '@/types/blockchain'

/**
 * Verify USDT payment transaction
 */
export async function verifyPaymentTransaction(
  txHash: Hash,
  expectedAmount: string
): Promise<PaymentVerification> {
  try {
    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash })

    // Check if transaction was successful
    if (receipt.status !== 'success') {
      return {
        isValid: false,
        txHash,
        from: receipt.from,
        to: receipt.to || ('0x0' as Address),
        amount: 0n,
        amountFormatted: '0',
        timestamp: 0,
      }
    }

    // Find Transfer event in logs
    const transferLog = receipt.logs.find(
      (log) =>
        log.address.toLowerCase() === USDT_ADDRESS.toLowerCase() &&
        log.topics[0] ===
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event signature
    )

    if (!transferLog) {
      return {
        isValid: false,
        txHash,
        from: receipt.from,
        to: receipt.to || ('0x0' as Address),
        amount: 0n,
        amountFormatted: '0',
        timestamp: 0,
      }
    }

    // Decode Transfer event
    const decoded = decodeEventLog({
      abi: USDT_ABI,
      data: transferLog.data,
      topics: transferLog.topics,
    }) as { args: TransferEvent }

    const { from, to, value } = decoded.args

    // Verify recipient is payment wallet
    const isValidRecipient = to.toLowerCase() === PAYMENT_WALLET.toLowerCase()

    // Verify amount
    const amountFormatted = formatUnits(value, USDTConfig.decimals)
    const isValidAmount = parseFloat(amountFormatted) >= parseFloat(expectedAmount)

    // Get block timestamp
    const block = await publicClient.getBlock({ blockHash: receipt.blockHash })

    return {
      isValid: isValidRecipient && isValidAmount,
      txHash,
      from,
      to,
      amount: value,
      amountFormatted,
      timestamp: Number(block.timestamp),
    }
  } catch (error) {
    console.error('Error verifying transaction:', error)
    return {
      isValid: false,
      txHash,
      from: '0x0' as Address,
      to: '0x0' as Address,
      amount: 0n,
      amountFormatted: '0',
      timestamp: 0,
    }
  }
}

/**
 * Check if transaction exists and is confirmed
 */
export async function isTransactionConfirmed(
  txHash: Hash,
  minConfirmations = 3
): Promise<boolean> {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash })

    if (receipt.status !== 'success') {
      return false
    }

    // Get current block number
    const currentBlock = await publicClient.getBlockNumber()

    // Calculate confirmations
    const confirmations = currentBlock - receipt.blockNumber

    return confirmations >= minConfirmations
  } catch (error) {
    console.error('Error checking transaction confirmation:', error)
    return false
  }
}
