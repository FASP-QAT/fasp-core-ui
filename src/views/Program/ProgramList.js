import React, { Component } from "react";
import { NavLink } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button } from 'reactstrap';
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
    this.buttonFormatter = this.buttonFormatter.bind(this);
    this.addProductMapping = this.addProductMapping.bind(this);

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
  buttonFormatter(cell, row) {
    // console.log("-----------", cell);
    return <Button type="button" size="sm" color="success" onClick={(event) => this.addProductMapping(event, cell)} className="float-right mr-1" ><i className="fa fa-check"></i> Add</Button>;
  }
  addProductMapping(event, cell) {
    // console.log(cell);
    event.stopPropagation();
    AuthenticationService.setupAxiosInterceptors();
    ProgramService.getProgramProductListByProgramId(cell)
      .then(response => {
        
        let myReasponse=response.data.data;
        console.log("myResponce=========",response.data.data);
        this.props.history.push({
          pathname: "/programProduct/addProgramProduct",
          state: {
            programProduct:myReasponse     
          }
          
        })
      }).catch(
        error => {
          switch (error.message) {
            case "Network Error":
              this.setState({
                message: error.response
              })
              break
            default:
              this.setState({
                message: error.response
              })
              break
          }
        }
      );



    // this.props.history.push({
    //   pathname: "/programProduct/addProgramProduct",
    //   state: {
    
    
    
    
    
    
    
    
    //     'programProduct':

    //     {
    //       'programId': 1,
    //       'label': {
    //         'label_en': "Kenya Malaria"
    //       },
    //       'prodcuts':
    //         [
    //           {
    //             'productId': 2,
    //             'label': {
    //               'label_en': "Abacavir"
    //             },
    //             'minMonth': 1,
    //             'maxMonth': 3
    //           },
    //           {
    //             'productId': 4,
    //             'label': {
    //               'label_en': "Condoms"
    //             },
    //             'minMonth': 1,
    //             'maxMonth': 3
    //           }
    //         ]
    //     }





    // programId: 1,
    // label: 'program 1',
    // rows: [
    //   {
    //     programId: '1',
    //     programName: 'Program 1',
    //     productId: '1',
    //     productName: 'product 1',
    //     minMonth: '2',
    //     maxMonth: '2'
    //   },
    //   {
    //     programId: '1',
    //     programName: 'Program 1',
    //     productId: '2',
    //     productName: 'product 2',
    //     minMonth: '3',
    //     maxMonth: '4'
    //   }
    // ]
    // }

  


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
            <TableHeaderColumn isKey dataField="programId" hidden >Program Id</TableHeaderColumn>
            <TableHeaderColumn filterFormatted dataField="label" dataSort dataFormat={this.showProgramLabel} >Program</TableHeaderColumn>
            <TableHeaderColumn filterFormatted dataField="realmCountry" dataSort dataFormat={this.showRealmLabel} >Realm</TableHeaderColumn>
            <TableHeaderColumn filterFormatted dataField="realmCountry" dataSort dataFormat={this.showCountryLabel} >Country</TableHeaderColumn>
            <TableHeaderColumn filterFormatted dataField="organisation" dataSort dataFormat={this.showOrganisationLabel} >Organisation</TableHeaderColumn>
            <TableHeaderColumn dataField="airFreightPerc" dataSort >Air Freight Percentage</TableHeaderColumn>
            <TableHeaderColumn dataField="seaFreightPerc" dataSort>Sea Freight Percentage</TableHeaderColumn>
            <TableHeaderColumn dataField="plannedToDraftLeadTime" dataSort>Planed To Draft Lead Time</TableHeaderColumn>
            <TableHeaderColumn dataField="draftToSubmittedLeadTime" dataSort>Draft To Submit Lead Time</TableHeaderColumn>
            <TableHeaderColumn dataField="submittedToApprovedLeadTime" dataSort>Submited To Approved Lead Time</TableHeaderColumn>
            <TableHeaderColumn dataField="programId" dataFormat={this.buttonFormatter}>Map Product To Program</TableHeaderColumn>
          </BootstrapTable>
        </CardBody>
      </Card>
    </div>
  )
}
}