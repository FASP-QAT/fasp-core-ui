import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import BudgetServcie from '../../api/BudgetService';
import getLabelText from '../../CommonComponent/getLabelText'
// import budgetData from './BudgetData'

class Budgets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      table: [],
      lang: 'en'
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
    this.editBudget=this.editBudget.bind(this);
  }

  // just an example
  // nameFormat(cell, row) {
  //   const id = `/budgets/${row.id}`
  //   return (
  //     <NavLink strict to={id}> {cell} </NavLink>
  //   );
  // };
  componentDidMount() {
    BudgetServcie.getBudgetList().then(response => {
      this.setState({
        table: response.data.data
      })
    })
      .catch(
        error => {
          switch (error.message) {
            case "Network Error":
              this.setState({
                message: error.message
              })
              break
            default:
              this.setState({
                message: error.message
              })
              break
          }
        }
      );

  }

  
  showBudgetLabel(cell, row) {
    console.log("========", this.state.lang);
    return getLabelText(cell, this.state.lang);
    // return cell.label_sp;
  }
  

  editBudget(budget) {
    this.props.history.push({
      pathname:"/budget/editBudget",
      state: { budget }
    });
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
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>Budget List{' '}
            {/* <a href="https://coreui.io/pro/react/" className="badge badge-danger">CoreUI Pro Component</a> */}
            <div className="card-header-actions">
              <a href="https://github.com/AllenFang/react-bootstrap-table" rel="noopener noreferrer" target="_blank" className="card-header-action">
                <small className="text-muted">docs</small>
              </a>
            </div>
          </CardHeader>
          <CardBody>
            <BootstrapTable data={this.state.table} version="4" striped hover pagination search options={this.options}>
              <TableHeaderColumn dataField="label" dataFormat={this.showBudgetLabel}>Budget</TableHeaderColumn>
              <TableHeaderColumn isKey dataField="budgetAmt" dataSort>Budget Amount</TableHeaderColumn>
              <TableHeaderColumn dataField="startDate" dataSort>Start Date</TableHeaderColumn>
              <TableHeaderColumn dataField="stopDate" dataSort>Stop Date</TableHeaderColumn>
              <TableHeaderColumn dataFormat={this.showStatus} dataField="active" dataSort>Active</TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default Budgets;
