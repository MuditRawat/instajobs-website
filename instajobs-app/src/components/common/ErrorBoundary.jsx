import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Dashboard ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-wrapper dashboard">
          <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card shadow-sm p-5 border-0" style={{ maxWidth: '600px', width: '100%' }}>
              <div className="mb-3 text-warning">
                <i className="la la-exclamation-triangle" style={{ fontSize: '64px' }}></i>
              </div>
              <h3 className="mb-2 font-weight-bold">Something went wrong</h3>
              <p className="text-muted mb-4">
                We encountered an unexpected error while loading this dashboard view. Your account and profile details remain completely safe.
              </p>
              {this.state.error && (
                <div className="text-left alert alert-light text-monospace small p-3 mb-4 text-danger border" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  {this.state.error.toString()}
                </div>
              )}
              <div className="d-flex justify-content-center" style={{ gap: '12px' }}>
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="theme-btn btn-style-one"
                >
                  <i className="la la-refresh mr-1"></i> Reload Page
                </button>
                <Link to="/candidate-dashboard" className="theme-btn btn-style-three" onClick={() => this.setState({ hasError: false, error: null })}>
                  <i className="la la-home mr-1"></i> Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
