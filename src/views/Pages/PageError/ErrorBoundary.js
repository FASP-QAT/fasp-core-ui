import { json } from 'mathjs';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true, error };
    }
  
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
    }
  
    render() {
      const { hasError, error } = this.state;
      if (this.state.hasError) {
        // You can render any custom fallback UI
        // this.props.history.push('/error');
        // return <h1>{error.message}</h1>;
        return <Redirect to={{
            pathname: '/error',
            state: { errorMessage: error.message, errorPage: window.location.href, errorName: error.name, errorStack: error.stack }
        }}  />    
    }
  
      return this.props.children; 
    }
  }

  export default ErrorBoundary;

  