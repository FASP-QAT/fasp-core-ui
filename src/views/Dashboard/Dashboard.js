import React, { Component, lazy, Suspense } from 'react';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
    this.hideFirstComponent = this.hideFirstComponent.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
  }
  hideFirstComponent() {
    setTimeout(function () {
        document.getElementById('div1').style.display = 'none';
    }, 8000);
}

hideSecondComponent() {
    setTimeout(function () {
        document.getElementById('div2').style.display = 'none';
    }, 8000);
}
  componentDidMount() {
    console.log("COLOR===",this.props.match.params.color);
    console.log("MESSAGE===",this.props.match.params.message);
    this.hideFirstComponent();
    if (navigator.onLine) {
      // AuthenticationService.setupAxiosInterceptors();
    }
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
  render() {

    return (
      <div className="animated fadeIn">
        {this.props.message}
        <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message)}</h5>
        <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
        
      </div>
    );
  }
}

export default Dashboard;
