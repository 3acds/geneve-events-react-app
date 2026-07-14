import React, { Component } from 'react';

// ErrorBoundary to catch javascript errors in its child component tree
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // Update state on error true
  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  
  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  // Render a fallback element if an error is cought otherwise render the child component
  render() {
    if (this.state.hasError) {
      return <h1>{this.props.fallbackMessage || "Quelque chose s'est mal passé. Veuillez réessayer plus tard."}</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
