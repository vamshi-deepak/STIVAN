import React from 'react';
import './ErrorBoundary.css';

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree
 * and displays a fallback UI instead of crashing the app.
 * 
 * Wrap your App or specific sections with this component.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error info:', errorInfo);
    
    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRefresh = () => {
    // Clear error state and reload
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    // Clear error and navigate to home
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-page">
          <div className="error-boundary-container">
            <div className="error-card">
              {/* Error Icon */}
              <div className="error-icon-wrapper">
                <i className="fas fa-exclamation-triangle error-icon"></i>
              </div>

              {/* Error Title */}
              <h1 className="error-title">Oops! Something went wrong</h1>

              {/* Error Message */}
              <p className="error-message">
                We're sorry for the inconvenience. The page encountered an unexpected error.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="error-details">
                  <summary>Error Details (Development Only)</summary>
                  <pre className="error-stack">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="error-actions">
                <button 
                  onClick={this.handleRefresh} 
                  className="error-button primary"
                >
                  <i className="fas fa-redo"></i> Refresh Page
                </button>
                <button 
                  onClick={this.handleGoHome} 
                  className="error-button secondary"
                >
                  <i className="fas fa-home"></i> Go to Home
                </button>
              </div>

              {/* Help Text */}
              <p className="error-help">
                If the problem persists, please contact support or try again later.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
