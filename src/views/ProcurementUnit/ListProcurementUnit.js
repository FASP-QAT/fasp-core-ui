// import React, { Component } from "react";
// import { NavLink } from 'react-router-dom';
// import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// // import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import getLabelText from '../../CommonComponent/getLabelText';
// import ProcurementUnitService from "../../api/ProcurementUnitService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// import i18n from '../../i18n';
// import PlanningUnitService from '../../api/PlanningUnitService'
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

// const entityname = i18n.t('static.procurementUnit.procurementUnit');
// export default class ListProcurementUnit extends Component {

//   constructor(props) {
//     super(props);
//     this.state = {
//       procurementUnitList: [],
//       lang: 'en',
//       message: '',
//       selProcurementUnit: [],
//       planningUnitList: [],
//       lang: localStorage.getItem('lang'),
//       loading: true
//     }
//     this.editProcurementUnit = this.editProcurementUnit.bind(this);
//     this.addNewProcurementUnit = this.addNewProcurementUnit.bind(this);
//     this.filterData = this.filterData.bind(this);
//     this.formatLabel = this.formatLabel.bind(this);
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
//     let planningUnitId = document.getElementById("planningUnitId").value;
//     if (planningUnitId != 0) {
//       const selProcurementUnit = this.state.procurementUnitList.filter(c => c.planningUnit.planningUnitId == planningUnitId)
//       this.setState({
//         selProcurementUnit: selProcurementUnit
//       });
//     } else {
//       this.setState({
//         selProcurementUnit: this.state.procurementUnitList
//       });
//     }
//   }

//   editProcurementUnit(procurementUnit) {
//     if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PROCUREMENT_UNIT')) {
//       console.log(procurementUnit.procurementUnitId)
//       this.props.history.push({
//         pathname: `/procurementUnit/editProcurementUnit/${procurementUnit.procurementUnitId}`,
//       });
//     }
//   }
//   componentDidMount() {
//     AuthenticationService.setupAxiosInterceptors();
//     this.hideFirstComponent();
//     ProcurementUnitService.getProcurementUnitList().then(response => {
//       if (response.status == 200) {
//         console.log("LIST-------", response.data);
//         this.setState({
//           procurementUnitList: response.data,
//           selProcurementUnit: response.data,
//           loading: false
//         })
//       } else {
//         this.setState({
//           message: response.data.messageCode
//         },
//           () => {
//             this.hideSecondComponent();
//           })
//       }
//     })

//     PlanningUnitService.getActivePlanningUnitList().then(response => {
//       if (response.status == 200) {
//         console.log("response--->", response.data);
//         this.setState({
//           planningUnitList: response.data,
//         })
//       } else {
//         this.setState({ message: response.data.messageCode })
//       }
//     })

//   }

//   addNewProcurementUnit() {
//     this.props.history.push({
//       pathname: "/procurementUnit/addProcurementUnit"
//     });
//   }

//   formatLabel(cell, row) {
//     return getLabelText(cell, this.state.lang);
//   }

//   render() {
//     const { SearchBar, ClearSearchButton } = Search;
//     const customTotal = (from, to, size) => (
//       <span className="react-bootstrap-table-pagination-total">
//         {i18n.t('static.common.result', { from, to, size })}
//       </span>
//     );
//     const { planningUnitList } = this.state;
//     let planningUnits = planningUnitList.length > 0
//       && planningUnitList.map((item, i) => {
//         return (
//           <option key={i} value={item.planningUnitId}>
//             {getLabelText(item.label, this.state.lang)}
//           </option>
//         )
//       }, this);

//     const columns = [
//       {
//         dataField: 'planningUnit.label',
//         text: i18n.t('static.procurementUnit.planningUnit'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: this.formatLabel
//       },
//       {
//         dataField: 'label',
//         text: i18n.t('static.procurementUnit.procurementUnit'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: this.formatLabel
//       },
//       {
//         dataField: 'multiplier',
//         text: i18n.t('static.procurementUnit.multiplier'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center'
//       },
//       {
//         dataField: 'unit.label',
//         text: i18n.t('static.procurementUnit.unit'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: this.formatLabel
//       },
//       {
//         dataField: 'supplier.label',
//         text: i18n.t('static.procurementUnit.supplier'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center',
//         formatter: this.formatLabel
//       },
//       {
//         dataField: 'labeling',
//         text: i18n.t('static.procurementUnit.labeling'),
//         sort: true,
//         align: 'center',
//         headerAlign: 'center'
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
//       }
//     ];
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
//         text: 'All', value: this.state.selProcurementUnit.length
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
//             {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
//             <div className="card-header-actions">
//               <div className="card-header-action">
//                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_PROCUREMENT_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewProcurementUnit}><i className="fa fa-plus-square"></i></a>}
//               </div>
//             </div>
//           </div>
//           <CardBody className="pb-lg-0">
//             <Col md="3 pl-0" >
//               <FormGroup className="Selectdiv">
//                 <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>

//                 <div className="controls SelectGo">
//                   <InputGroup >
//                     <Input
//                       type="select"
//                       name="planningUnitId"
//                       id="planningUnitId"
//                       bsSize="sm"
//                       onChange={this.filterData}
//                     >
//                       <option value="0">{i18n.t('static.common.all')}</option>
//                       {planningUnits}
//                     </Input>
//                     {/* <InputGroupAddon addonType="append">
//                       <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                     </InputGroupAddon> */}
//                   </InputGroup>
//                 </div>
//               </FormGroup>
//             </Col>
//             <ToolkitProvider
//               keyField="procurementUnitId"
//               data={this.state.selProcurementUnit}
//               columns={columns}
//               search={{ searchFormatted: true }}
//               hover
//               filter={filterFactory()}
//             >
//               {
//                 props => (
//                   <div>
//                     <div className="TableCust listprocurementUnitAlignThtd" >
//                       <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                         <SearchBar {...props.searchProps} />
//                         <ClearSearchButton {...props.searchProps} />
//                       </div>
//                       <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                         pagination={paginationFactory(options)}
//                         rowEvents={{
//                           onClick: (e, row, rowIndex) => {
//                             this.editProcurementUnit(row);
//                           }
//                         }}
//                         {...props.baseProps}
//                       />
//                     </div>

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

import React, { Component } from "react";
import { NavLink } from 'react-router-dom';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import ProcurementUnitService from "../../api/ProcurementUnitService";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import PlanningUnitService from '../../api/PlanningUnitService'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import moment from 'moment';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from "../../Constants";

const entityname = i18n.t('static.procurementUnit.procurementUnit');
export default class ListProcurementUnit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      procurementUnitList: [],
      lang: 'en',
      message: '',
      selProcurementUnit: [],
      planningUnitList: [],
      lang: localStorage.getItem('lang'),
      loading: true
    }
    this.editProcurementUnit = this.editProcurementUnit.bind(this);
    this.addNewProcurementUnit = this.addNewProcurementUnit.bind(this);
    this.filterData = this.filterData.bind(this);
    this.formatLabel = this.formatLabel.bind(this);
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
    let planningUnitId = document.getElementById("planningUnitId").value;
    if (planningUnitId != 0) {
      const selProcurementUnit = this.state.procurementUnitList.filter(c => c.planningUnit.planningUnitId == planningUnitId)
      this.setState({
        selProcurementUnit: selProcurementUnit
      }, () => {
        this.buildJExcel();
      });
    } else {
      this.setState({
        selProcurementUnit: this.state.procurementUnitList
      }, () => {
        this.buildJExcel();
      });
    }
  }

  editProcurementUnit(procurementUnit) {
    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROCUREMENT_UNIT')) {
      console.log(procurementUnit.procurementUnitId)
      this.props.history.push({
        pathname: `/procurementUnit/editProcurementUnit/${procurementUnit.procurementUnitId}`,
      });
    }
  }

  buildJExcel() {
    let procurementUnitList = this.state.selProcurementUnit;
    // console.log("procurementUnitList---->", procurementUnitList);
    let procurementUnitArray = [];
    let count = 0;

    for (var j = 0; j < procurementUnitList.length; j++) {
      data = [];
      data[0] = procurementUnitList[j].procurementUnitId
      data[1] = getLabelText(procurementUnitList[j].planningUnit.label, this.state.lang)
      data[2] = getLabelText(procurementUnitList[j].label, this.state.lang)
      data[3] = procurementUnitList[j].multiplier;
      data[4] = getLabelText(procurementUnitList[j].unit.label, this.state.lang)
      data[5] = getLabelText(procurementUnitList[j].supplier.label, this.state.lang)
      data[6] = procurementUnitList[j].labeling;
      data[7] = procurementUnitList[j].lastModifiedBy.username;
      data[8] = (procurementUnitList[j].lastModifiedDate ? moment(procurementUnitList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
      data[9] = procurementUnitList[j].active;


      procurementUnitArray[count] = data;
      count++;
    }
    // if (procurementUnitList.length == 0) {
    //   data = [];
    //   procurementUnitArray[0] = data;
    // }
    // console.log("procurementUnitArray---->", procurementUnitArray);
    this.el = jexcel(document.getElementById("tableDiv"), '');
    this.el.destroy();
    var json = [];
    var data = procurementUnitArray;

    var options = {
      data: data,
      columnDrag: true,
      colWidths: [0, 150, 150, 80, 60, 100, 100, 100, 100, 100],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: 'procurementUnitId',
          type: 'hidden',
        },
        {
          title: i18n.t('static.procurementUnit.planningUnit'),
          type: 'text',
          readOnly: true
        },
        {
          title: i18n.t('static.procurementUnit.procurementUnit'),
          type: 'text',
          readOnly: true
        },
        {
          title: i18n.t('static.procurementUnit.multiplier'),
          type: 'numeric', mask: '#,##.00', decimal: '.',
          readOnly: true
        },
        {
          title: i18n.t('static.procurementUnit.unit'),
          type: 'text',
          readOnly: true
        },
        {
          title: i18n.t('static.procurementUnit.supplier'),
          type: 'text',
          readOnly: true
        },
        {
          title: i18n.t('static.procurementUnit.labeling'),
          type: 'text',
          readOnly: true
        },
        {
          title: i18n.t('static.common.lastModifiedBy'),
          type: 'text',
          readOnly: true
        },
        {
          title: i18n.t('static.common.lastModifiedDate'),
          type: 'calendar',
          options: { format: JEXCEL_DATE_FORMAT_SM },
          readOnly: true
        },
        {
          type: 'dropdown',
          title: i18n.t('static.common.status'),
          readOnly: true,
          source: [
            { id: true, name: i18n.t('static.common.active') },
            { id: false, name: i18n.t('static.common.disabled') }
          ]
        },

      ],
      text: {
        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
        show: '',
        entries: '',
      },
      onload: this.loaded,
      pagination: localStorage.getItem("sesRecordCount"),
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
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: 'top',
      filters: true,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return [];
      }.bind(this),
    };
    var languageEl = jexcel(document.getElementById("tableDiv"), options);
    this.el = languageEl;
    this.setState({
      languageEl: languageEl,
      loading: false
    })
  }

  selected = function (instance, cell, x, y, value) {

    if ((x == 0 && value != 0) || (y == 0)) {
      // console.log("HEADER SELECTION--------------------------");
    } else {
      // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
      if (this.state.selProcurementUnit.length != 0) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROCUREMENT_UNIT')) {
          this.props.history.push({
            pathname: `/procurementUnit/editProcurementUnit/${this.el.getValueFromCoords(0, x)}`,
          });
        }
      }
    }
  }.bind(this);

  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunction(instance);
  }

  componentDidMount() {
    // AuthenticationService.setupAxiosInterceptors();
    this.hideFirstComponent();
    ProcurementUnitService.getProcurementUnitList().then(response => {
      if (response.status == 200) {
        console.log("LIST-------", response.data);
        this.setState({
          procurementUnitList: response.data,
          selProcurementUnit: response.data,
          // loading: false
        }, () => {
          this.buildJExcel();
        });
      } else {
        this.setState({
          message: response.data.messageCode, loading: false
        },
          () => {
            this.hideSecondComponent();
          })
      }
    }).catch(
      error => {
        if (error.message === "Network Error") {
          this.setState({
            message: 'static.unkownError',
            loading: false
          });
        } else {
          switch (error.response ? error.response.status : "") {

            case 401:
              this.props.history.push(`/login/static.message.sessionExpired`)
              break;
            case 403:
              this.props.history.push(`/accessDenied`)
              break;
            case 500:
            case 404:
            case 406:
              this.setState({
                message: error.response.data.messageCode,
                loading: false
              });
              break;
            case 412:
              this.setState({
                message: error.response.data.messageCode,
                loading: false
              });
              break;
            default:
              this.setState({
                message: 'static.unkownError',
                loading: false
              });
              break;
          }
        }
      }
    );

    PlanningUnitService.getActivePlanningUnitList().then(response => {
      if (response.status == 200) {
        console.log("response--->", response.data);
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState({
          planningUnitList: listArray,
        })
      } else {
        this.setState({ message: response.data.messageCode, loading: false })
      }
    }).catch(
      error => {
        if (error.message === "Network Error") {
          this.setState({
            message: 'static.unkownError',
            loading: false
          });
        } else {
          switch (error.response ? error.response.status : "") {

            case 401:
              this.props.history.push(`/login/static.message.sessionExpired`)
              break;
            case 403:
              this.props.history.push(`/accessDenied`)
              break;
            case 500:
            case 404:
            case 406:
              this.setState({
                message: error.response.data.messageCode,
                loading: false
              });
              break;
            case 412:
              this.setState({
                message: error.response.data.messageCode,
                loading: false
              });
              break;
            default:
              this.setState({
                message: 'static.unkownError',
                loading: false
              });
              break;
          }
        }
      }
    );

  }

  addNewProcurementUnit() {
    this.props.history.push({
      pathname: "/procurementUnit/addProcurementUnit"
    });
  }

  formatLabel(cell, row) {
    return getLabelText(cell, this.state.lang);
  }

  render() {
    const { SearchBar, ClearSearchButton } = Search;
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
      </span>
    );
    const { planningUnitList } = this.state;
    let planningUnits = planningUnitList.length > 0
      && planningUnitList.map((item, i) => {
        return (
          <option key={i} value={item.planningUnitId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);

    const columns = [
      {
        dataField: 'planningUnit.label',
        text: i18n.t('static.procurementUnit.planningUnit'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel
      },
      {
        dataField: 'label',
        text: i18n.t('static.procurementUnit.procurementUnit'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel
      },
      {
        dataField: 'multiplier',
        text: i18n.t('static.procurementUnit.multiplier'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
      },
      {
        dataField: 'unit.label',
        text: i18n.t('static.procurementUnit.unit'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel
      },
      {
        dataField: 'supplier.label',
        text: i18n.t('static.procurementUnit.supplier'),
        sort: true,
        align: 'center',
        headerAlign: 'center',
        formatter: this.formatLabel
      },
      {
        dataField: 'labeling',
        text: i18n.t('static.procurementUnit.labeling'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
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
      }
    ];
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
        text: 'All', value: this.state.selProcurementUnit.length
      }]
    }
    return (
      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
        <Card>
          <div className="Card-header-addicon">
            {/* <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '} */}
            <div className="card-header-actions">
              <div className="card-header-action">
                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_PROCUREMENT_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewProcurementUnit}><i className="fa fa-plus-square"></i></a>}
              </div>
            </div>
          </div>
          <CardBody className="pb-lg-0 pt-lg-0">
            <Col md="3 pl-0" >
              <div className="d-md-flex Selectdiv2">
                <FormGroup className="mt-md-2 mb-md-0 ">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.procurementUnit.planningUnit')}</Label>

                  <div className="controls SelectGo">
                    <InputGroup >
                      <Input
                        type="select"
                        name="planningUnitId"
                        id="planningUnitId"
                        bsSize="sm"
                        onChange={this.filterData}
                      >
                        <option value="0">{i18n.t('static.common.all')}</option>
                        {planningUnits}
                      </Input>
                      {/* <InputGroupAddon addonType="append">
                      <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                    </InputGroupAddon> */}
                    </InputGroup>
                  </div>
                </FormGroup>
              </div>
            </Col>
            <div >
              {/* <div id="loader" className="center"></div> */}
              <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: this.state.loading ? "none" : "block" }}>
              </div>
              <div style={{ display: this.state.loading ? "block" : "none" }}>
                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                  <div class="align-items-center">
                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                    <div class="spinner-border blue ml-4" role="status">

                    </div>
                  </div>
                </div>
              </div>

            </div>
          </CardBody>
        </Card>

      </div>
    )
  }
}


