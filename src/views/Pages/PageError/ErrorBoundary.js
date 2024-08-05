import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
/**
 * Component for error boundary
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  /**
   * Captures errors during rendering, allowing the component to display a fallback UI.
   * @param {Error} error - The error that was thrown during rendering.
   * @returns {Object} An object representing the new state of the component.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
  }
  /**
   * Renders the Error boundary.
   * @returns {JSX.Element} - Error boundary page.
   */
  render() {
    const { hasError, error } = this.state;
    if (this.state.hasError) {
      return <Redirect to={{
        pathname: '/error',
        state: { errorMessage: error.message, errorPage: window.location.href, errorName: error.name, errorStack: error.stack }
      }} />
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
