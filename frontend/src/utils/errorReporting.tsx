// Error reporting and monitoring for frontend
import React from 'react';

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  timestamp: number;
  userAgent: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class ErrorReporter {
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;
  private flushInterval = 30000; // 30 seconds
  private enabled: boolean;

  constructor() {
    this.enabled = import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true';
    
    if (this.enabled) {
      this.setupGlobalErrorHandlers();
      this.startPeriodicFlush();
    }
  }

  private setupGlobalErrorHandlers(): void {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        metadata: {
          lineno: event.lineno,
          colno: event.colno,
          type: 'javascript-error',
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        metadata: {
          type: 'unhandled-promise-rejection',
          reason: event.reason,
        },
      });
    });

    // Handle React error boundaries (if using)
    window.addEventListener('react-error', (event: any) => {
      this.reportError({
        message: event.detail.message,
        stack: event.detail.stack,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        metadata: {
          type: 'react-error',
          componentStack: event.detail.componentStack,
        },
      });
    });
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushErrors();
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushErrors();
    });
  }

  reportError(error: Partial<ErrorReport>): void {
    if (!this.enabled) return;

    const errorReport: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      timestamp: error.timestamp || Date.now(),
      userAgent: error.userAgent || navigator.userAgent,
      userId: error.userId,
      metadata: error.metadata,
    };

    this.errorQueue.push(errorReport);

    // Prevent queue from growing too large
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Flush immediately for critical errors
    if (this.isCriticalError(errorReport)) {
      this.flushErrors();
    }
  }

  private isCriticalError(error: ErrorReport): boolean {
    const criticalPatterns = [
      /network error/i,
      /payment.*failed/i,
      /authentication.*failed/i,
      /server.*error/i,
    ];

    return criticalPatterns.some(pattern => pattern.test(error.message));
  }

  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In production, send to your error reporting service
      if (import.meta.env.PROD) {
        await this.sendToErrorService(errors);
      } else {
        // In development, log to console
        console.group('🐛 Error Reports');
        errors.forEach(error => {
          console.error('Error:', error.message);
          console.error('Stack:', error.stack);
          console.error('Metadata:', error.metadata);
        });
        console.groupEnd();
      }
    } catch (error) {
      console.warn('Failed to send error reports:', error);
      // Re-queue errors for retry
      this.errorQueue.unshift(...errors.slice(0, 10)); // Only retry first 10
    }
  }

  private async sendToErrorService(errors: ErrorReport[]): Promise<void> {
    // Example implementation - replace with your error reporting service
    const response = await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errors }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send errors: ${response.status}`);
    }
  }

  // Manual error reporting
  captureException(error: Error, metadata?: Record<string, any>): void {
    this.reportError({
      message: error.message,
      stack: error.stack,
      metadata: {
        ...metadata,
        type: 'manual-capture',
      },
    });
  }

  // Performance issue reporting
  reportPerformanceIssue(metric: string, value: number, threshold: number): void {
    if (value > threshold) {
      this.reportError({
        message: `Performance issue: ${metric} exceeded threshold`,
        metadata: {
          type: 'performance-issue',
          metric,
          value,
          threshold,
        },
      });
    }
  }

  // User feedback reporting
  reportUserFeedback(feedback: string, category: string = 'general'): void {
    this.reportError({
      message: `User feedback: ${feedback}`,
      metadata: {
        type: 'user-feedback',
        category,
        feedback,
      },
    });
  }
}

// Create singleton instance
export const errorReporter = new ErrorReporter();

// React Error Boundary component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    errorReporter.reportError({
      message: error.message,
      stack: error.stack,
      metadata: {
        type: 'react-error-boundary',
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="min-h-screen bg-off-white flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="text-red-500 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">
        We're sorry, but something unexpected happened. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-sage-green text-white px-4 py-2 rounded-md hover:bg-sage-green-dark transition-colors"
      >
        Refresh Page
      </button>
      {import.meta.env.DEV && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

export default errorReporter;