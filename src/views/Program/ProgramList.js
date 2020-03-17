import React, { Component } from "react";
import { NavLink } from 'react-router-dom';
import { Card, CardHeader, CardBody,Button } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import programDate from './ProgramData';
import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../common/AuthenticationService.js';
import i18n from '../../i18n';
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
    this.addProductMapping=this.addProductMapping.bind(this);


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
  addNewProgram() {
    this.props.history.push({
      pathname: "/program/addProgram"
    });
  }
  buttonFormatter(cell, row){
    return <Button type="button" size="sm" color="success" onClick={(event) => {this.addProductMapping(event)}} className="float-right mr-1" ><i className="fa fa-check"></i> Add</Button>;
  }
  addProductMapping(event){
    event.stopPropagation();
    // console.log("---------------------",cell.program.programId);
    this.props.history.push({
      pathname: "/programProduct/addProgramProduct"
    });
    
  }
  render() {
    return (
      <div className="animated">
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>{i18n.t('static.program.programlist')}{' '}
            <div className="card-header-actions">
              <div className="card-header-action">
                <a href="javascript:void();" title="Add Budget" onClick={this.addNewProgram}><i className="fa fa-plus-square"></i></a>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <BootstrapTable data={this.state.table} version="4" striped hover pagination search options={this.options}>
              <TableHeaderColumn dataField="label" dataSort dataFormat={this.showProgramLabel} >{i18n.t('static.program.program')}</TableHeaderColumn>
              <TableHeaderColumn dataField="realmCountry" dataSort dataFormat={this.showRealmLabel} >{i18n.t('static.program.realm')}</TableHeaderColumn>
              <TableHeaderColumn dataField="realmCountry" dataSort dataFormat={this.showCountryLabel} >{i18n.t('static.program.realmcountry')}</TableHeaderColumn>
              <TableHeaderColumn dataField="organisation" dataSort dataFormat={this.showOrganisationLabel} >{i18n.t('static.program.organisation')}</TableHeaderColumn>
              <TableHeaderColumn isKey dataField="airFreightPerc" dataSort >{i18n.t('static.program.airfreightperc')}</TableHeaderColumn>
              <TableHeaderColumn dataField="seaFreightPerc" dataSort>{i18n.t('static.program.seafreightperc')}</TableHeaderColumn>
              <TableHeaderColumn dataField="plannedToDraftLeadTime" dataSort>{i18n.t('static.program.draftleadtime')}</TableHeaderColumn>
              <TableHeaderColumn dataField="draftToSubmittedLeadTime" dataSort>{i18n.t('static.program.drafttosubmitleadtime')}</TableHeaderColumn>
              <TableHeaderColumn dataField="submittedToApprovedLeadTime" dataSort>{i18n.t('static.program.submittoapproveleadtime')}</TableHeaderColumn>
              {/* <TableHeaderColumn dataField="button" dataFormat={this.buttonFormatter}>Map Product To Program</TableHeaderColumn> */}
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>
    )
  }
}