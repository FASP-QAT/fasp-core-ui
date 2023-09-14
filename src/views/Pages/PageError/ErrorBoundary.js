import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
  }
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
