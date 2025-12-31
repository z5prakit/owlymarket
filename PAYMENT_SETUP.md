# x402 Payment System Setup

OwlyMarket uses the x402 payment protocol for on-chain payments via USDC on Base network.

## Overview

The payment flow follows the x402 standard (HTTP 402 Payment Required):

1. **Client** requests analysis via POST /api/analyze
2. **Server** returns 402 with payment details if payment enabled
3. **Client** makes USDC payment on Base network
4. **Client** retries request with transaction hash in `X-Payment` header
5. **Server** verifies payment on-chain and proceeds with analysis

## Configuration

### Environment Variables

Add these to `.env.local`:

```bash
# Payment Wallet (REQUIRED - where payments are received)
NEXT_PUBLIC_PAYMENT_WALLET=0x549F33e7FED0b514b1DfEF8305746d8D379F3592

# x402 Payment Configuration
NEXT_PUBLIC_X402_PAYMENT_AMOUNT=1.00         # Amount in USDC
NEXT_PUBLIC_X402_CURRENCY=USDC
NEXT_PUBLIC_X402_NETWORK=base
NEXT_PUBLIC_X402_CHAIN_ID=8453              # Base mainnet
NEXT_PUBLIC_X402_TESTNET_CHAIN_ID=84532     # Base Sepolia testnet

# Base Network
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_TESTNET_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_USDC_CONTRACT=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_BASE_USDC_TESTNET=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Feature Flag
NEXT_PUBLIC_ENABLE_REAL_PAYMENTS=false       # Set to 'true' to enable
```

## How It Works

### Server-Side Verification

The server (`src/lib/payment/x402.ts`) verifies payments by:

1. Parsing the transaction hash from `X-Payment` header
2. Fetching transaction receipt from Base network via viem
3. Checking the Transfer event logs for USDC contract
4. Verifying:
   - Recipient address matches `NEXT_PUBLIC_PAYMENT_WALLET`
   - Amount is >= `NEXT_PUBLIC_X402_PAYMENT_AMOUNT`
   - Transaction succeeded (status: success)

### Client-Side Payment (To Implement)

Users need to:

1. Have a Web3 wallet (Coinbase Wallet, MetaMask, etc.)
2. Hold USDC on Base network
3. When receiving 402 response, transfer USDC to payment wallet
4. Submit transaction hash back to API

Example client implementation:

```typescript
async function analyzeMarket(marketUrl: string, wallet: any) {
  // Initial request
  let response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ market_url: marketUrl })
  })

  // Check if payment required
  if (response.status === 402) {
    const paymentDetails = await response.json()
    // {
    //   amount: "1.00",
    //   recipient: "0x549F33e7FED0b514b1DfEF8305746d8D379F3592",
    //   currency: "USDC",
    //   network: "base",
    //   chainId: 8453
    // }

    // User transfers USDC using their wallet
    const txHash = await transferUSDC(wallet, paymentDetails)

    // Retry with payment proof
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Payment': txHash  // Transaction hash
      },
      body: JSON.stringify({ market_url: marketUrl })
    })
  }

  // Process successful response
  const result = await response.json()
  return result
}
```

## Testing

### Testnet Testing (Base Sepolia)

1. Set `NODE_ENV=development` (auto-uses Base Sepolia)
2. Get testnet USDC from Base Sepolia faucet
3. Test payment flow with testnet wallet

### Mainnet

1. Set `NODE_ENV=production`
2. Ensure `NEXT_PUBLIC_PAYMENT_WALLET` is set correctly
3. Set `NEXT_PUBLIC_ENABLE_REAL_PAYMENTS=true`
4. Users need real USDC on Base mainnet

## Security Notes

- **Never expose private keys** - only public addresses
- Payment verification happens on-chain via viem (no trusted third party)
- Server validates all payment details before processing
- Transaction must be confirmed on Base network
- Amount and recipient are strictly checked

## Wallet Setup for Users

Users need:

1. **Base Network Support**
   - Coinbase Wallet (recommended)
   - MetaMask with Base network added
   - Any wallet supporting Base (EIP-155 chain ID 8453)

2. **USDC Balance**
   - Get USDC on Base network
   - Bridge from Ethereum mainnet or other chains
   - Buy directly on Base via Coinbase or exchanges

3. **Gas Fees**
   - Small amount of ETH on Base for gas
   - Much cheaper than Ethereum mainnet (~$0.01-0.10)

## Resources

- x402 Protocol: https://www.x402.org/
- Base Network: https://base.org/
- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- USDC on Base: https://www.coinbase.com/price/usd-coin

## Support

For payment issues:

1. Check transaction on Base Explorer: https://basescan.org/
2. Verify wallet address is correct
3. Ensure sufficient USDC balance + gas
4. Check server logs for verification errors
