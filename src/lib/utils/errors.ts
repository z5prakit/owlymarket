/**
 * Error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT', 429)
    this.name = 'RateLimitError'
  }
}

export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, 'PAYMENT_ERROR', 402)
    this.name = 'PaymentError'
  }
}

// Error handler for API routes
export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return Response.json(
      {
        error: error.code,
        message: error.message,
      },
      { status: error.status }
    )
  }

  if (error instanceof Error) {
    return Response.json(
      {
        error: 'INTERNAL_ERROR',
        message: error.message,
      },
      { status: 500 }
    )
  }

  return Response.json(
    {
      error: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    },
    { status: 500 }
  )
}

// Extract error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}
