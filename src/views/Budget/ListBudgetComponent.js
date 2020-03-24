import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import BudgetServcie from '../../api/BudgetService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText'
import i18n from '../../i18n'
class ListBudgetComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      table: [],
      lang: localStorage.getItem('lang'),
      message: ''
    }

    this.options = {
      sortIndicator: true,
      hideSizePerPage: true,
      paginationSize: 3,
      hidePageListOnlyOnePage: true,
      clearSearch: true,
      alwaysShowAllBtns: false,
      withFirstAndLast: false,
      onRowClick: function (row) {
        this.editBudget(row);
      }.bind(this)
    }

    this.showBudgetLabel = this.showBudgetLabel.bind(this);
    this.showSubFundingSourceLabel = this.showSubFundingSourceLabel.bind(this);
    this.showFundingSourceLabel = this.showFundingSourceLabel.bind(this);
    this.editBudget = this.editBudget.bind(this);
    this.addBudget = this.addBudget.bind(this);
  }

  editBudget(budget) {
    var budgetId = budget.budgetId
    this.props.history.push({
      pathname: `/budget/editBudget/${budgetId}`
    });
  }

  addBudget(budget) {
    // console.log("going to Add Budget");
    this.props.history.push({
      pathname: "/budget/addBudget"
    });
  }

  componentDidMount() {
    console.log("message------------->"+this.props.match.params.message);
    AuthenticationService.setupAxiosInterceptors();
    BudgetServcie.getBudgetList()
      .then(response => {
        if (response.status == "Success") {
        console.log(response.data);
        this.setState({
          table: response.data
        }) } else {
          this.setState({ message: response.data.messageCode })
      }
      })
      .catch(
        error => {
          if (error.message === "Network Error") {
            this.setState({ message: error.message });
        } else {
            switch (error.response.status) {
                case 500:
                case 401:
                case 404:
                case 406:
                case 412:
                    this.setState({ message: error.response.data.messageCode });
                    break;
                default:
                    this.setState({ message: 'static.unkownError' });
                    break;
            }
        }
    }
);

  }


  showBudgetLabel(cell, row) {
    return getLabelText(cell, this.state.lang);
  }

  showSubFundingSourceLabel(cell, row) {
    return getLabelText(cell.label, this.state.lang);
  }

  showFundingSourceLabel(cell, row) {
    return getLabelText(cell.fundingSource.label, this.state.lang);
  }

  showStatus(cell, row) {
    if (cell) {
      return "Active";
    } else {
      return "Disabled";
    }
  }
  render() {
    return (
      <div className="animated">
        <h5>{i18n.t(this.props.match.params.message)}</h5>
        <h5>{i18n.t(this.state.message)}</h5>
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>{i18n.t('static.budget.budgetlist')}{' '}
            <div className="card-header-actions">
              <div className="card-header-action">
                <a href="javascript:void();" title="Add Budget" onClick={this.addBudget}><i className="fa fa-plus-square"></i></a>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <BootstrapTable data={this.state.table} version="4" striped hover pagination search options={this.options}>
              <TableHeaderColumn isKey dataField="budgetId" hidden>Budget Id</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="label" dataFormat={this.showBudgetLabel} dataSort>{i18n.t('static.budget.budget')}</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="subFundingSource" dataFormat={this.showSubFundingSourceLabel} dataSort>{i18n.t('static.budget.subfundingsource')}</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="subFundingSource" dataFormat={this.showFundingSourceLabel} dataSort>{i18n.t('static.budget.fundingsource')}</TableHeaderColumn>
              <TableHeaderColumn dataField="budgetAmt" dataSort>{i18n.t('static.budget.budgetamount')}</TableHeaderColumn>
              <TableHeaderColumn dataField="startDate" dataSort>{i18n.t('static.common.startdate')}</TableHeaderColumn>
              <TableHeaderColumn dataField="stopDate" dataSort>{i18n.t('static.common.stopdate')}</TableHeaderColumn>
              <TableHeaderColumn dataFormat={this.showStatus} dataField="active" dataSort>{i18n.t('static.common.active')}</TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default ListBudgetComponent;
