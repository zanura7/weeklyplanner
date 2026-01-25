import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Generate unique error ID for tracking
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Log error details
    const errorDetails = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store in localStorage for debugging
    try {
      const errorHistory = JSON.parse(localStorage.getItem('errorHistory') || '[]');
      errorHistory.push(errorDetails);
      // Keep only last 10 errors
      if (errorHistory.length > 10) {
        errorHistory.shift();
      }
      localStorage.setItem('errorHistory', JSON.stringify(errorHistory));
    } catch (storageError) {
      console.error('Failed to store error:', storageError);
    }

    // Send to error tracking service if configured
    if (this.props.onError) {
      this.props.onError(errorDetails);
    }

    this.setState({
      error,
      errorInfo,
      errorId
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    this.handleReset();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-red-500 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-1">
                      Oops! Something went wrong
                    </h1>
                    <p className="text-red-100 text-sm font-medium">
                      Don't worry, your data is safe
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Error ID for support */}
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Error Reference ID:</strong>
                  </p>
                  <code className="text-sm font-mono text-slate-800 bg-white px-3 py-1.5 rounded-lg inline-block">
                    {this.state.errorId}
                  </code>
                  <p className="text-xs text-slate-500 mt-2">
                    Please save this ID and contact support if the problem persists
                  </p>
                </div>

                {/* Error Message */}
                {this.state.error && (
                  <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                      What happened:
                    </p>
                    <p className="text-sm text-red-700 font-mono bg-white p-3 rounded-lg overflow-x-auto">
                      {this.state.error.message}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all active:scale-95"
                  >
                    <RefreshCw size={18} />
                    Try Again
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                  >
                    <Home size={18} />
                    Go to Home
                  </button>
                </div>

                {/* Development Mode Details */}
                {isDevelopment && this.state.errorInfo && (
                  <details className="mt-6">
                    <summary className="cursor-pointer text-sm font-bold text-slate-700 mb-3 hover:text-slate-900">
                      Technical Details (Development Mode)
                    </summary>
                    <div className="mt-3 space-y-4">
                      {/* Error Stack */}
                      <div className="bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto">
                        <p className="text-xs font-bold mb-2 text-slate-400">Error Stack:</p>
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>

                      {/* Component Stack */}
                      {this.state.errorInfo.componentStack && (
                        <div className="bg-slate-900 text-blue-400 p-4 rounded-xl overflow-x-auto">
                          <p className="text-xs font-bold mb-2 text-slate-400">Component Stack:</p>
                          <pre className="text-xs font-mono whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>

            {/* Footer Tips */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 mb-2">
                💡 <strong>Quick tips:</strong>
              </p>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>• Try refreshing the page</li>
                <li>• Clear your browser cache</li>
                <li>• Check your internet connection</li>
                <li>• Contact support with the Error ID above</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Async Error Boundary for handling promise rejections
 */
class AsyncErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.rejectionHandler = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Convert to error and pass to error boundary
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.props.fallback(error);
    };
  }

  componentDidMount() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.rejectionHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.rejectionHandler);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(new Error('Async operation failed'));
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary(Component, fallback = null) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook for error handling in functional components
 */
export function useErrorHandler() {
  return (error) => {
    throw error;
  };
}

export default ErrorBoundary;
