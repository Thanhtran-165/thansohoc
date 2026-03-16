/**
 * Error Handler
 * Centralized error handling with classification and recovery
 */

import { logger } from './logger';

// Error types for classification
export type ErrorType =
  | 'database'
  | 'api'
  | 'validation'
  | 'network'
  | 'timeout'
  | 'unknown';

// Application error class
export class AppError extends Error {
  type: ErrorType;
  code: string;
  recoverable: boolean;
  context?: Record<string, unknown>;

  constructor(
    message: string,
    type: ErrorType = 'unknown',
    code: string = 'UNKNOWN',
    recoverable: boolean = false,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.recoverable = recoverable;
    this.context = context;
  }
}

// Database errors
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'database', 'DB_ERROR', true, context);
    this.name = 'DatabaseError';
  }
}

// API errors
export class APIError extends AppError {
  statusCode?: number;

  constructor(message: string, statusCode?: number, context?: Record<string, unknown>) {
    super(message, 'api', `API_${statusCode || 'ERROR'}`, true, context);
    this.name = 'APIError';
    this.statusCode = statusCode;
  }
}

// Validation errors
export class ValidationError extends AppError {
  field?: string;

  constructor(message: string, field?: string, context?: Record<string, unknown>) {
    super(message, 'validation', 'VALIDATION_ERROR', false, { ...context, field });
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Network errors
export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed', context?: Record<string, unknown>) {
    super(message, 'network', 'NETWORK_ERROR', true, context);
    this.name = 'NetworkError';
  }
}

// Timeout errors
export class TimeoutError extends AppError {
  constructor(message: string = 'Operation timed out', context?: Record<string, unknown>) {
    super(message, 'timeout', 'TIMEOUT_ERROR', true, context);
    this.name = 'TimeoutError';
  }
}

// Error handler class
class ErrorHandler {
  /**
   * Handle an error with logging and classification
   */
  handle(error: unknown, context?: string): AppError {
    const appError = this.classify(error);

    // Log the error
    logger.error(
      `${context ? `[${context}] ` : ''}${appError.message}`,
      appError
    );

    return appError;
  }

  /**
   * Classify an unknown error into an AppError
   */
  classify(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Check for specific error types
      if (message.includes('database') || message.includes('sqlite')) {
        return new DatabaseError(error.message);
      }

      if (message.includes('network') || message.includes('connection')) {
        return new NetworkError(error.message);
      }

      if (message.includes('timeout') || message.includes('timed out')) {
        return new TimeoutError(error.message);
      }

      if (message.includes('validation') || message.includes('invalid')) {
        return new ValidationError(error.message);
      }

      // Generic error
      return new AppError(error.message, 'unknown', 'UNKNOWN', false, {
        originalName: error.name,
        stack: error.stack,
      });
    }

    // Non-Error thrown
    return new AppError(
      String(error),
      'unknown',
      'UNKNOWN',
      false,
      { rawError: error }
    );
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(error: unknown): string {
    const appError = error instanceof AppError ? error : this.classify(error);

    switch (appError.type) {
      case 'database':
        return 'A database error occurred. Please try restarting the application.';
      case 'api':
        return 'Unable to connect to the insight service. Using cached data.';
      case 'validation':
        return appError.message; // Validation messages are already user-friendly
      case 'network':
        return 'Network connection unavailable. Please check your internet connection.';
      case 'timeout':
        return 'The operation took too long. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if an error is recoverable
   */
  isRecoverable(error: unknown): boolean {
    const appError = error instanceof AppError ? error : this.classify(error);
    return appError.recoverable;
  }

  /**
   * Wrap an async function with error handling
   */
  wrapAsync<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | AppError> {
    return fn().catch((error) => this.handle(error, context));
  }

  /**
   * Retry a function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          const delay = delayMs * Math.pow(2, attempt - 1);
          logger.warn(
            `${context ? `[${context}] ` : ''}Attempt ${attempt} failed, retrying in ${delay}ms`
          );
          await this.sleep(delay);
        }
      }
    }

    throw this.handle(lastError, context);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

export default errorHandler;
