import React,{ Component } from "react";
import { NavLink } from 'react-router-dom'
import {Card, CardHeader, CardBody} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';

import programDate from './ProgramData'

export default class ProgramList extends Component{

    constructor(props) {
        super(props);
    
        this.table = programDate.rows;
        this.options = {
          sortIndicator: true,
          hideSizePerPage: true,
          paginationSize: 3,
          hidePageListOnlyOnePage: true,
          clearSearch: true,
          alwaysShowAllBtns: false,
          withFirstAndLast: false
        }
    
      }
    
      // just an example
      nameFormat(cell, row) {
        const id = `/budgets/${row.id}`
          return (
          <NavLink strict to={id}> {cell} </NavLink>
        );
      };

  render() {

   

    return (
        <div className="animated">
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>Program List{' '}
            {/* <a href="https://coreui.io/pro/react/" className="badge badge-danger">CoreUI Pro Component</a> */}
            <div className="card-header-actions">
              <a href="https://github.com/AllenFang/react-bootstrap-table" rel="noopener noreferrer" target="_blank" className="card-header-action">
                <small className="text-muted">docs</small>
              </a>
            </div>
          </CardHeader>
          <CardBody>
            <BootstrapTable data={this.table} version="4" striped hover pagination search options={this.options}>
              <TableHeaderColumn dataField="budget" dataSort dataFormat={this.nameFormat} >Budget</TableHeaderColumn>
              <TableHeaderColumn isKey dataField="budgetAmount" dataSort>Budget Amount</TableHeaderColumn>
              <TableHeaderColumn dataField="startDate" dataSort>Start Date</TableHeaderColumn>
              <TableHeaderColumn dataField="stopDate" dataSort>Stop Date</TableHeaderColumn>
              <TableHeaderColumn dataField="active" dataSort>Active</TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>
    )
  }
}