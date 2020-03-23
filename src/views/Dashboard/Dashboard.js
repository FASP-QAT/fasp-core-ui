import React, { Component, lazy, Suspense } from 'react';
import i18n from '../../i18n'
import AuthenticationService from '../common/AuthenticationService.js';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }
  componentDidMount() {
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
    }
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
  render() {

    return (
      <div className="animated fadeIn">
        {this.props.message}
        <h5>{i18n.t(this.props.match.params.message)}</h5>
        <h5>{i18n.t(this.state.message)}</h5>
      </div>
    );
  }
}

export default Dashboard;
