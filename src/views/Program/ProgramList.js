import React, { Component } from "react";
import { NavLink } from 'react-router-dom';
import { Card, CardHeader, CardBody,Button } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import programDate from './ProgramData';
import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../common/AuthenticationService.js';
export default class ProgramList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      table: [],
      lang: 'en'
    }
    // this.table = programDate.rows;
    this.options = {
      sortIndicator: true,
      hideSizePerPage: true,
      paginationSize: 3,
      hidePageListOnlyOnePage: true,
      clearSearch: true,
      alwaysShowAllBtns: false,
      withFirstAndLast: false,
      onRowClick: function (row) {
        this.editProgram(row);
      }.bind(this)
    }

    this.showProgramLabel = this.showProgramLabel.bind(this);
    this.showRealmLabel = this.showRealmLabel.bind(this);
    this.showCountryLabel = this.showCountryLabel.bind(this);
    this.showOrganisationLabel = this.showOrganisationLabel.bind(this);
    this.editProgram = this.editProgram.bind(this);
    this.addNewProgram = this.addNewProgram.bind(this);
    this.buttonFormatter=this.buttonFormatter.bind(this);

  }

  editProgram(program) {
    this.props.history.push({
      pathname: "/program/editProgram",
      state: { program }
    });
  }
  // just an example
  // nameFormat(cell, row) {
  //   const id = `/budgets/${row.id}`
  //   return (
  //     <NavLink strict to={id}> {cell} </NavLink>
  //   );
  // };

  componentDidMount() {
    AuthenticationService.setupAxiosInterceptors();
    ProgramService.getProgramList().then(response => {
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

  showProgramLabel(cell, row) {
    // console.log("========", cell);
    return getLabelText(cell, this.state.lang);

  }
  showRealmLabel(cell, row) {
    // console.log("========>",cell);
    return getLabelText(cell.realm.label, this.state.lang);

  }
  showCountryLabel(cell, row) {
    // console.log("========>",cell);
    return getLabelText(cell.country.label, this.state.lang);

  }
  showOrganisationLabel(cell, row) {
    // console.log("========>",cell);
    return getLabelText(cell.label, this.state.lang);

  }
  // buttonFormatter(cell, row){
  //   return <Button type="button" size="sm" color="success" className="float-right mr-1" ><i className="fa fa-check"></i> Add</Button>;
  // }
  addNewProgram() {
    this.props.history.push({
      pathname: "/program/addProgram"
    });
  }
  render() {
    return (
      <div className="animated">
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>Program List{' '}
            <div className="card-header-actions">
              <div className="card-header-action">
                <a href="javascript:void();" title="Add Budget" onClick={this.addNewProgram}><i className="fa fa-plus-square"></i></a>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <BootstrapTable data={this.state.table} version="4" striped hover pagination search options={this.options}>
              <TableHeaderColumn dataField="label" dataSort dataFormat={this.showProgramLabel} >Program</TableHeaderColumn>
              <TableHeaderColumn dataField="realmCountry" dataSort dataFormat={this.showRealmLabel} >Realm</TableHeaderColumn>
              <TableHeaderColumn dataField="realmCountry" dataSort dataFormat={this.showCountryLabel} >Country</TableHeaderColumn>
              <TableHeaderColumn dataField="organisation" dataSort dataFormat={this.showOrganisationLabel} >Organisation</TableHeaderColumn>
              <TableHeaderColumn isKey dataField="airFreightPerc" dataSort >Air Freight Percentage</TableHeaderColumn>
              <TableHeaderColumn dataField="seaFreightPerc" dataSort>Sea Freight Percentage</TableHeaderColumn>
              <TableHeaderColumn dataField="plannedToDraftLeadTime" dataSort>Planed To Draft Lead Time</TableHeaderColumn>
              <TableHeaderColumn dataField="draftToSubmittedLeadTime" dataSort>Draft To Submit Lead Time</TableHeaderColumn>
              <TableHeaderColumn dataField="submittedToApprovedLeadTime" dataSort>Submited To Approved Lead Time</TableHeaderColumn>
              {/* <TableHeaderColumn dataField="button" dataFormat={this.buttonFormatter}>Map Product To Program</TableHeaderColumn> */}
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>
    )
  }
}