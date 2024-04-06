import React, {Component} from 'react';

import 'react-month-picker/css/month-picker.css';
/**
 * This component is used to display the calendar text box after date is selected
 */
export default class MonthBox extends Component {
    constructor(props, context) {
      super(props, context)
      this.state = {
          value: this.props.value || 'N/A',
      }
      this._handleClick = this._handleClick.bind(this);
    }

    componentWillReceiveProps(nextProps){
      this.setState({
          value: nextProps.value || 'N/A',
      })
    }

    render() {
      return (
        <div className="box" onClick={this._handleClick}>
            <label>{this.state.value}</label>
        </div>
      );
    }

    _handleClick(e) {
      this.props.onClick && this.props.onClick(e);
    }
}