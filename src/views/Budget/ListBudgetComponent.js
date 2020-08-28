// import React, { Component } from 'react';
// import { NavLink } from 'react-router-dom'
// import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// // import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import BudgetServcie from '../../api/BudgetService';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import getLabelText from '../../CommonComponent/getLabelText'
// import i18n from '../../i18n';

// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import FundingSourceService from '../../api/FundingSourceService';
// import moment from 'moment';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// import { DATE_FORMAT_CAP } from '../../Constants.js';

// const entityname = i18n.t('static.dashboard.budget');

// class ListBudgetComponent extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       budgetList: [],
//       lang: localStorage.getItem('lang'),
//       message: '',
//       selBudget: [],
//       fundingSourceList: [],
//       loading: true
//     }

//     // this.options = {
//     //   sortIndicator: true,
//     //   hideSizePerPage: true,
//     //   paginationSize: 3,
//     //   hidePageListOnlyOnePage: true,
//     //   clearSearch: true,
//     //   alwaysShowAllBtns: false,
//     //   withFirstAndLast: false,
//     //   onRowClick: function (row) {
//     //     this.editBudget(row);
//     //   }.bind(this)
//     // }

//     // this.showBudgetLabel = this.showBudgetLabel.bind(this);
//     // this.showSubFundingSourceLabel = this.showSubFundingSourceLabel.bind(this);
//     // this.showFundingSourceLabel = this.showFundingSourceLabel.bind(this);
//     this.editBudget = this.editBudget.bind(this);
//     this.addBudget = this.addBudget.bind(this);
//     this.filterData = this.filterData.bind(this);
//     this.formatDate = this.formatDate.bind(this);
//     this.formatLabel = this.formatLabel.bind(this);
//     this.addCommas = this.addCommas.bind(this);
//     this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
//     this.hideFirstComponent = this.hideFirstComponent.bind(this);
//     this.hideSecondComponent = this.hideSecondComponent.bind(this);
//   }

//   hideFirstComponent() {
//     this.timeout = setTimeout(function () {
//       document.getElementById('div1').style.display = 'none';
//     }, 8000);
//   }
//   componentWillUnmount() {
//     clearTimeout(this.timeout);
//   }


//   hideSecondComponent() {
//     setTimeout(function () {
//       document.getElementById('div2').style.display = 'none';
//     }, 8000);
//   }



//   filterData() {
//     let fundingSourceId = document.getElementById("fundingSourceId").value;
//     if (fundingSourceId != 0) {
//       const selBudget = this.state.budgetList.filter(c => c.fundingSource.fundingSourceId == fundingSourceId)
//       this.setState({
//         selBudget: selBudget
//       });
//     } else {
//       this.setState({
//         selBudget: this.state.budgetList
//       });
//     }
//   }
//   formatDate(cell, row) {
//     if (cell != null && cell != "") {
//       var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
//       return modifiedDate;
//     } else {
//       return "";
//     }
//   }
//   editBudget(budget) {
//     if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_BUDGET')) {
//       var budgetId = budget.budgetId
//       this.props.history.push({
//         pathname: `/budget/editBudget/${budgetId}`,
//         // state: { budget }
//       });
//     }
//   }

//   addBudget(budget) {
//     // console.log("going to Add Budget");
//     this.props.history.push({
//       pathname: "/budget/addBudget"
//     });
//   }


//   componentDidMount() {
//     AuthenticationService.setupAxiosInterceptors();
//     this.hideFirstComponent();
//     BudgetServcie.getBudgetList()
//       .then(response => {
//         console.log(response)
//         if (response.status == 200) {
//           console.log("budget after status 200 new console --- ---->", response.data);
//           this.setState({
//             budgetList: response.data,
//             selBudget: response.data, loading: false
//           })
//         } else {
//           this.setState({
//             message: response.data.messageCode
//           },
//             () => {
//               this.hideSecondComponent();
//             })
//         }
//       })
//     // .catch(
//     //   error => {
//     //     if (error.message === "Network Error") {
//     //       this.setState({ message: error.message });
//     //     } else {
//     //       switch (error.response ? error.response.status : "") {
//     //         case 500:
//     //         case 401:
//     //         case 404:
//     //         case 406:
//     //         case 412:
//     //           this.setState({ message: error.response.data.messageCode });
//     //           break;
//     //         default:
//     //           this.setState({ message: 'static.unkownError' });
//     //           break;
//     //       }
//     //     }
//     //   }
//     // );
//     FundingSourceService.getFundingSourceListAll()
//       .then(response => {
//         if (response.status == 200) {
//           console.log("funding source after status 200--->" + response.data)
//           this.setState({
//             fundingSourceList: response.data
//           })
//         } else {
//           this.setState({ message: response.data.messageCode })
//         }
//       })
//     // .catch(
//     //   error => {
//     //     if (error.message === "Network Error") {
//     //       this.setState({ message: error.message });
//     //     } else {
//     //       switch (error.response ? error.response.status : "") {
//     //         case 500:
//     //         case 401:
//     //         case 404:
//     //         case 406:
//     //         case 412:
//     //           this.setState({ message: error.response.data.messageCode });
//     //           break;
//     //         default:
//     //           this.setState({ message: 'static.unkownError' });
//     //           console.log("Error code unkown");
//     //           break;
//     //       }
//     //     }
//     //   }
//     // );

//   }
//   // showSubFundingSourceLabel(cell, row) {
//   //   return getLabelText(cell.label, this.state.lang);
//   // }

//   // showFundingSourceLabel(cell, row) {
//   //   return getLabelText(cell.fundingSource.label, this.state.lang);
//   // }

//   // showStatus(cell, row) {
//   //   if (cell) {
//   //     return "Active";
//   //   } else {
//   //     return "Disabled";
//   //   }
//   // }
//   rowClassNameFormat(row, rowIdx) {
//     // row is whole row object
//     // rowIdx is index of row
//     // console.log('in rowClassNameFormat')
//     // console.log(new Date(row.stopDate).getTime() < new Date().getTime())
//     return new Date(row.stopDate) < new Date() || (row.budgetAmt - row.usedUsdAmt) <= 0 ? 'background-red' : '';
//   }
//   formatLabel(cell, row) {
//     // console.log("celll----", cell);
//     if (cell != null && cell != "") {
//       return getLabelText(cell, this.state.lang);
//     }
//   }

//   addCommas(cell, row) {
//     console.log("row---------->", row);
//     var currencyCode = row.currency.currencyCode;
//     cell += '';
//     var x = cell.split('.');
//     var x1 = x[0];
//     var x2 = x.length > 1 ? '.' + x[1] : '';
//     var rgx = /(\d+)(\d{3})/;
//     while (rgx.test(x1)) {
//       x1 = x1.replace(rgx, '$1' + ',' + '$2');
//     }
//     // return "(" + currencyCode + ")" + "  " + x1 + x2;
//     return currencyCode + "    " + x1 + x2;
//   }


//   render() {

//     const { SearchBar, ClearSearchButton } = Search;
//     const { fundingSourceList } = this.state;

//     const customTotal = (from, to, size) => (
//       <span className="react-bootstrap-table-pagination-total">
//         {i18n.t('static.common.result', { from, to, size })}
//       </span>
//     );

//     let fundingSources = fundingSourceList.length > 0 && fundingSourceList.map((item, i) => {
//       return (
//         <option key={i} value={item.fundingSourceId}>
//           {getLabelText(item.label, this.state.lang)}
//         </option>
//       )
//     }, this);

//     const columns = [

//       {
//         dataField: 'program.label',
//         text: i18n.t('static.budget.program'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: this.formatLabel
//       },
//       {
//         dataField: 'label',
//         text: i18n.t('static.budget.budget'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: this.formatLabel
//       },
//       {
//         dataField: 'budgetCode',
//         text: i18n.t('static.budget.budgetCode'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//       },
//       {
//         dataField: 'fundingSource.label',
//         text: i18n.t('static.budget.fundingsource'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: this.formatLabel

//       },

//       {
//         dataField: 'budgetAmt',
//         text: i18n.t('static.budget.budgetamount'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: this.addCommas
//       },
//       {

//         dataField: 'usedUsdAmt',
//         text: i18n.t('static.budget.availableAmt'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: (cell, row) => {
//           var cell1 = row.budgetAmt - row.usedUsdAmt
//           var currencyCode = row.currency.currencyCode;
//           cell1 += '';
//           var x = cell1.split('.');
//           var x1 = x[0];
//           var x2 = x.length > 1 ? '.' + x[1] : '';
//           var rgx = /(\d+)(\d{3})/;
//           while (rgx.test(x1)) {
//             x1 = x1.replace(rgx, '$1' + ',' + '$2');
//           }
//           return currencyCode + " " + x1 + x2;
//         }
//       }
//       // {
//       //   dataField: 'budgetUsdAmt',
//       //   text: i18n.t('static.budget.budgetamountUSD'),
//       //   sort: true,
//       //   align: 'center',
//       //   headerAlign: 'center',
//       //   formatter: this.addCommas
//       // },
//       // {
//       //   dataField: 'usedUsdAmt',
//       //   text: i18n.t('static.budget.availableAmt'),
//       //   sort: true,
//       //   align: 'center',
//       //   headerAlign: 'center',
//       //   formatter: this.addCommas
//       // },

//       ,
//       {
//         dataField: 'startDate',
//         text: i18n.t('static.common.startdate'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: this.formatDate
//       },
//       {
//         dataField: 'stopDate',
//         text: i18n.t('static.common.stopdate'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: this.formatDate
//       },
//       {
//         dataField: 'active',
//         text: i18n.t('static.common.status'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: (cellContent, row) => {
//           return (
//             (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
//           );
//         }
//       }];
//     const options = {
//       hidePageListOnlyOnePage: true,
//       firstPageText: i18n.t('static.common.first'),
//       prePageText: i18n.t('static.common.back'),
//       nextPageText: i18n.t('static.common.next'),
//       lastPageText: i18n.t('static.common.last'),
//       nextPageTitle: i18n.t('static.common.firstPage'),
//       prePageTitle: i18n.t('static.common.prevPage'),
//       firstPageTitle: i18n.t('static.common.nextPage'),
//       lastPageTitle: i18n.t('static.common.lastPage'),
//       showTotal: true,
//       paginationTotalRenderer: customTotal,
//       disablePageTitle: true,
//       sizePerPageList: [{
//         text: '10', value: 10
//       }, {
//         text: '30', value: 30
//       }
//         ,
//       {
//         text: '50', value: 50
//       },
//       {
//         text: 'All', value: this.state.selBudget.length
//       }]
//     }
//     return (
//       <div className="animated">
//         <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//           this.setState({ message: message })
//         }} />
//         <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//         <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//         <Card style={{ display: this.state.loading ? "none" : "block" }}>
//           <div className="Card-header-addicon">
//             {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}{' '}</strong> */}
//             <div className="card-header-actions">
//               <div className="card-header-action">
//                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_BUDGET') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addBudget}><i className="fa fa-plus-square"></i></a>}
//               </div>
//             </div>
//           </div>
//           <CardBody className="pb-lg-0 ">
//             {/* <BootstrapTable data={this.state.table} version="4" striped hover pagination search options={this.options}>
//               <TableHeaderColumn isKey dataField="budgetId" hidden>Budget Id</TableHeaderColumn>
//               <TableHeaderColumn filterFormatted dataField="label" dataFormat={this.showBudgetLabel} dataSort>{i18n.t('static.budget.budget')}</TableHeaderColumn>
//               <TableHeaderColumn filterFormatted dataField="subFundingSource" dataFormat={this.showSubFundingSourceLabel} dataSort>{i18n.t('static.budget.subfundingsource')}</TableHeaderColumn>
//               <TableHeaderColumn filterFormatted dataField="subFundingSource" dataFormat={this.showFundingSourceLabel} dataSort>{i18n.t('static.budget.fundingsource')}</TableHeaderColumn>
//               <TableHeaderColumn dataField="budgetAmt" dataSort>{i18n.t('static.budget.budgetamount')}</TableHeaderColumn>
//               <TableHeaderColumn dataField="startDate" dataSort>{i18n.t('static.common.startdate')}</TableHeaderColumn>
//               <TableHeaderColumn dataField="stopDate" dataSort>{i18n.t('static.common.stopdate')}</TableHeaderColumn>
//               <TableHeaderColumn dataFormat={this.showStatus} dataField="active" dataSort>{i18n.t('static.common.active')}</TableHeaderColumn>
//             </BootstrapTable> */}
//             <Col md="3 pl-0" >
//               <FormGroup className="Selectdiv">
//                 <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
//                 <div className="controls SelectGo">
//                   <InputGroup>
//                     <Input
//                       type="select"
//                       name="fundingSourceId"
//                       id="fundingSourceId"
//                       bsSize="sm"
//                       onChange={this.filterData}
//                     >
//                       <option value="0">{i18n.t('static.common.all')}</option>
//                       {fundingSources}
//                     </Input>
//                     {/* <InputGroupAddon addonType="append">
//                       <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                     </InputGroupAddon> */}
//                   </InputGroup>
//                 </div>
//               </FormGroup>
//             </Col>
//             <ToolkitProvider
//               keyField="budgetId"
//               data={this.state.selBudget}
//               columns={columns}
//               search={{ searchFormatted: true }}
//               hover
//               filter={filterFactory()}
//             >
//               {
//                 props => (
//                   <div className="TableCust listBudgetAlignThtd">
//                     <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                       <SearchBar {...props.searchProps} />
//                       <ClearSearchButton {...props.searchProps} />
//                     </div>
//                     <BootstrapTable hover rowClasses={this.rowClassNameFormat} striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                       pagination={paginationFactory(options)}
//                       rowEvents={{
//                         onClick: (e, row, rowIndex) => {
//                           // row.startDate = moment(row.startDate).format('YYYY-MM-DD');
//                           // row.stopDate = moment(row.stopDate).format('YYYY-MM-DD');
//                           // row.startDate = moment(row.startDate);
//                           // row.stopDate = moment(row.stopDate);
//                           this.editBudget(row);
//                         }
//                       }}
//                       {...props.baseProps}
//                     /><h5>*Rows in red indicate that Budget has either lapsed or has no money in it</h5>
//                   </div>
//                 )
//               }
//             </ToolkitProvider>
//           </CardBody>
//         </Card>
//         <div style={{ display: this.state.loading ? "block" : "none" }}>
//           <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
//             <div class="align-items-center">
//               <div ><h4> <strong>Loading...</strong></h4></div>

//               <div class="spinner-border blue ml-4" role="status">

//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }
// }

// export default ListBudgetComponent;

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import BudgetServcie from '../../api/BudgetService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText'
import i18n from '../../i18n';

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import FundingSourceService from '../../api/FundingSourceService';
import moment from 'moment';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { DATE_FORMAT_CAP } from '../../Constants.js';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'

const entityname = i18n.t('static.dashboard.budget');

class ListBudgetComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      budgetList: [],
      lang: localStorage.getItem('lang'),
      message: '',
      selBudget: [],
      fundingSourceList: [],
      loading: true
    }

    this.editBudget = this.editBudget.bind(this);
    this.addBudget = this.addBudget.bind(this);
    this.filterData = this.filterData.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.formatLabel = this.formatLabel.bind(this);
    this.addCommas = this.addCommas.bind(this);
    this.rowClassNameFormat = this.rowClassNameFormat.bind(this);
    this.hideFirstComponent = this.hideFirstComponent.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
    this.buildJExcel = this.buildJExcel.bind(this);
  }

  hideFirstComponent() {
    this.timeout = setTimeout(function () {
      document.getElementById('div1').style.display = 'none';
    }, 8000);
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }


  hideSecondComponent() {
    setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 8000);
  }



  filterData() {
    let fundingSourceId = document.getElementById("fundingSourceId").value;
    if (fundingSourceId != 0) {
      const selBudget = this.state.budgetList.filter(c => c.fundingSource.fundingSourceId == fundingSourceId)
      this.setState({
        selBudget: selBudget
      }, () => {
        this.buildJExcel();
      });
    } else {
      this.setState({
        selBudget: this.state.budgetList
      }, () => {
        this.buildJExcel();
      });
    }
  }
  formatDate(cell, row) {
    if (cell != null && cell != "") {
      var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
      return modifiedDate;
    } else {
      return "";
    }
  }
  editBudget(budget) {
    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_BUDGET')) {
      var budgetId = budget.budgetId
      this.props.history.push({
        pathname: `/budget/editBudget/${budgetId}`,
        // state: { budget }
      });
    }
  }

  addBudget(budget) {
    // console.log("going to Add Budget");
    this.props.history.push({
      pathname: "/budget/addBudget"
    });
  }

  buildJExcel() {
    let budgetList = this.state.selBudget;
    // console.log("budgetList---->", budgetList);
    let budgetArray = [];
    let count = 0;

    for (var j = 0; j < budgetList.length; j++) {
      data = [];
      data[0] = budgetList[j].budgetId
      data[1] = getLabelText(budgetList[j].program.label, this.state.lang)
      data[2] = getLabelText(budgetList[j].label, this.state.lang)
      data[3] = budgetList[j].budgetCode;
      data[4] = getLabelText(budgetList[j].fundingSource.label, this.state.lang)
      data[5] = budgetList[j].currency.currencyCode + " " + (budgetList[j].budgetAmt).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      data[6] = budgetList[j].currency.currencyCode + " " + (budgetList[j].budgetAmt - budgetList[j].usedUsdAmt).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      data[7] = (budgetList[j].startDate ? moment(budgetList[j].startDate).format(`${DATE_FORMAT_CAP}`) : null);
      data[8] = (budgetList[j].stopDate ? moment(budgetList[j].stopDate).format(`${DATE_FORMAT_CAP}`) : null);
      data[9] = (budgetList[j].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'));
      data[10] = budgetList[j].budgetAmt;
      data[11] = budgetList[j].usedUsdAmt;
      data[12] = budgetList[j].stopDate;



      budgetArray[count] = data;
      count++;
    }
    // if (budgetList.length == 0) {
    //   data = [];
    //   budgetArray[0] = data;
    // }
    // console.log("budgetArray---->", budgetArray);
    this.el = jexcel(document.getElementById("tableDiv"), '');
    this.el.destroy();
    var json = [];
    var data = budgetArray;

    var options = {
      data: data,
      columnDrag: true,
      colWidths: [150, 60, 60,60,100,],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: 'budgetId',
          type: 'hidden',
        },
        {
          title: i18n.t('static.budget.program'),
          type: 'text',
          // readOnly: true
        },
        {
          title: i18n.t('static.budget.budget'),
          type: 'text',
          // readOnly: true
        },
        {
          title: i18n.t('static.budget.budgetCode'),
          type: 'text',
          // readOnly: true
        },
        {
          title: i18n.t('static.budget.fundingsource'),
          type: 'text',
          // readOnly: true
        },
        {
          title: i18n.t('static.budget.budgetamount'),
          type: 'text',
          // readOnly: true
        },
        {
          title: i18n.t('static.budget.availableAmt'),
          type: 'text',
          // readOnly: true
        },
        {
          title: i18n.t('static.common.startdate'),
          type: 'text',
          // readOnly: true
        },
        {
          title: i18n.t('static.common.stopdate'),
          type: 'text',
          // readOnly: true
        },
        {
          type: 'text',
          title: i18n.t('static.common.status'),
          // readOnly: true,
          // source: [
          //   { id: true, name: i18n.t('static.common.active') },
          //   { id: false, name: i18n.t('static.common.disabled') }
          // ]
        },
        {
          title: i18n.t('static.budget.budgetamount'),
          type: 'hidden',
        },
        {
          title: i18n.t('static.budget.availableAmt'),
          type: 'hidden',
        },
        {
          title: 'Date',
          type: 'hidden',
        },

      ],
      editable: false,
      text: {
        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
        show: '',
        entries: '',
      },

      updateTable: function (el, cell, x, y, source, value, id) {
        console.log("INSIDE UPDATE TABLE");
        var elInstance = el.jexcel;
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
        var rowData = elInstance.getRowData(y);
        // console.log("elInstance---->", elInstance);
        var stopDate = rowData[12];
        var budgetAmt = rowData[10];
        var usedUsdAmt = rowData[11];

        if (((moment(stopDate)).isBefore(moment(Date.now())) || ((budgetAmt - usedUsdAmt) <= 0))) {
          for (var i = 0; i < colArr.length; i++) {
            elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
            elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
            let textColor = contrast('#f48282');
            elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'color', textColor);
          }
        } else {
          for (var i = 0; i < colArr.length; i++) {
            elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
          }
        }

      }.bind(this),

      onload: this.loaded,
      pagination: 10,
      search: true,
      columnSorting: true,
      tableOverflow: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      onselection: this.selected,


      oneditionend: this.onedit,
      copyCompatibility: true,
      allowExport: false,
      paginationOptions: [10, 25, 50],
      position: 'top',
      contextMenu: false,
    };
    var languageEl = jexcel(document.getElementById("tableDiv"), options);
    this.el = languageEl;
    this.setState({
      languageEl: languageEl
    })
  }

  selected = function (instance, cell, x, y, value) {

    if ((x == 0 && value != 0) || (y == 0)) {
      // console.log("HEADER SELECTION--------------------------");
    } else {
      // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
      if (this.state.selBudget.length != 0) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_BUDGET')) {
          this.props.history.push({
            pathname: `/budget/editBudget/${this.el.getValueFromCoords(0, x)}`,
          });
        }
      }
    }
  }.bind(this);

  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunction(instance);
  }


  componentDidMount() {
    AuthenticationService.setupAxiosInterceptors();
    this.hideFirstComponent();
    BudgetServcie.getBudgetList()
      .then(response => {
        console.log(response)
        if (response.status == 200) {
          console.log("budget after status 200 new console --- ---->", response.data);
          this.setState({
            budgetList: response.data,
            selBudget: response.data, loading: false
          }, () => {
            this.buildJExcel();
          });
        } else {
          this.setState({
            message: response.data.messageCode
          },
            () => {
              this.hideSecondComponent();
            })
        }
      })

    FundingSourceService.getFundingSourceListAll()
      .then(response => {
        if (response.status == 200) {
          console.log("funding source after status 200--->" + response.data)
          this.setState({
            fundingSourceList: response.data
          })
        } else {
          this.setState({ message: response.data.messageCode })
        }
      })
  }

  rowClassNameFormat(row, rowIdx) {
    return new Date(row.stopDate) < new Date() || (row.budgetAmt - row.usedUsdAmt) <= 0 ? 'background-red' : '';
  }

  formatLabel(cell, row) {
    // console.log("celll----", cell);
    if (cell != null && cell != "") {
      return getLabelText(cell, this.state.lang);
    }
  }

  addCommas(cell, row) {
    console.log("row---------->", row);
    var currencyCode = row.currency.currencyCode;
    cell += '';
    var x = cell.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    // return "(" + currencyCode + ")" + "  " + x1 + x2;
    return currencyCode + "    " + x1 + x2;
  }


  render() {

    const { SearchBar, ClearSearchButton } = Search;
    const { fundingSourceList } = this.state;

    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
      </span>
    );

    let fundingSources = fundingSourceList.length > 0 && fundingSourceList.map((item, i) => {
      return (
        <option key={i} value={item.fundingSourceId}>
          {getLabelText(item.label, this.state.lang)}
        </option>
      )
    }, this);

    const columns = [

      {
        dataField: 'program.label',
        text: i18n.t('static.budget.program'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel
      },
      {
        dataField: 'label',
        text: i18n.t('static.budget.budget'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel
      },
      {
        dataField: 'budgetCode',
        text: i18n.t('static.budget.budgetCode'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
      },
      {
        dataField: 'fundingSource.label',
        text: i18n.t('static.budget.fundingsource'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel

      },

      {
        dataField: 'budgetAmt',
        text: i18n.t('static.budget.budgetamount'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.addCommas
      },
      {

        dataField: 'usedUsdAmt',
        text: i18n.t('static.budget.availableAmt'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: (cell, row) => {
          var cell1 = row.budgetAmt - row.usedUsdAmt
          var currencyCode = row.currency.currencyCode;
          cell1 += '';
          var x = cell1.split('.');
          var x1 = x[0];
          var x2 = x.length > 1 ? '.' + x[1] : '';
          var rgx = /(\d+)(\d{3})/;
          while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
          }
          return currencyCode + " " + x1 + x2;
        }
      }
      // {
      //   dataField: 'budgetUsdAmt',
      //   text: i18n.t('static.budget.budgetamountUSD'),
      //   sort: true,
      //   align: 'center',
      //   headerAlign: 'center',
      //   formatter: this.addCommas
      // },
      // {
      //   dataField: 'usedUsdAmt',
      //   text: i18n.t('static.budget.availableAmt'),
      //   sort: true,
      //   align: 'center',
      //   headerAlign: 'center',
      //   formatter: this.addCommas
      // },

      ,
      {
        dataField: 'startDate',
        text: i18n.t('static.common.startdate'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatDate
      },
      {
        dataField: 'stopDate',
        text: i18n.t('static.common.stopdate'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatDate
      },
      {
        dataField: 'active',
        text: i18n.t('static.common.status'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: (cellContent, row) => {
          return (
            (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
          );
        }
      }];
    const options = {
      hidePageListOnlyOnePage: true,
      firstPageText: i18n.t('static.common.first'),
      prePageText: i18n.t('static.common.back'),
      nextPageText: i18n.t('static.common.next'),
      lastPageText: i18n.t('static.common.last'),
      nextPageTitle: i18n.t('static.common.firstPage'),
      prePageTitle: i18n.t('static.common.prevPage'),
      firstPageTitle: i18n.t('static.common.nextPage'),
      lastPageTitle: i18n.t('static.common.lastPage'),
      showTotal: true,
      paginationTotalRenderer: customTotal,
      disablePageTitle: true,
      sizePerPageList: [{
        text: '10', value: 10
      }, {
        text: '30', value: 30
      }
        ,
      {
        text: '50', value: 50
      },
      {
        text: 'All', value: this.state.selBudget.length
      }]
    }
    return (
      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} loading={(loading) => {
          this.setState({ loading: loading })
        }} />
        <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
        <Card style={{ display: this.state.loading ? "none" : "block" }}>
          <div className="Card-header-addicon">
            {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}{' '}</strong> */}
            <div className="card-header-actions">
              <div className="card-header-action">
                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_BUDGET') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addBudget}><i className="fa fa-plus-square"></i></a>}
              </div>
            </div>
          </div>
          <CardBody className="pb-lg-0 ">
            <Col md="3 pl-0" >
              <FormGroup className="Selectdiv mt-md-2 mb-md-0">
                <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                <div className="controls SelectGo">
                  <InputGroup>
                    <Input
                      type="select"
                      name="fundingSourceId"
                      id="fundingSourceId"
                      bsSize="sm"
                      onChange={this.filterData}
                    >
                      <option value="0">{i18n.t('static.common.all')}</option>
                      {fundingSources}
                    </Input>
                    {/* <InputGroupAddon addonType="append">
                      <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                    </InputGroupAddon> */}
                  </InputGroup>
                </div>
              </FormGroup>
            </Col>

            {/* <div id="loader" className="center"></div> */}<div id="tableDiv" className="jexcelremoveReadonlybackground">
            </div>
            <h5>*Rows in red indicate that Budget has either lapsed or has no money in it</h5>


          </CardBody>
        </Card>
        <div style={{ display: this.state.loading ? "block" : "none" }}>
          <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
            <div class="align-items-center">
              <div ><h4> <strong>Loading...</strong></h4></div>

              <div class="spinner-border blue ml-4" role="status">

              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ListBudgetComponent;
