import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import moment from 'moment';
import React, { Component } from "react";
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, Col, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import DropdownService from "../../api/DropdownService";
import ProcurementUnitService from "../../api/ProcurementUnitService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.procurementUnit.procurementUnit');
/**
 * Component for list of procurement unit details.
 */
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
    this.addNewProcurementUnit = this.addNewProcurementUnit.bind(this);
    this.filterData = this.filterData.bind(this);
    this.buildJExcel = this.buildJExcel.bind(this);
  }
  /**
   * Clears the timeout when the component is unmounted.
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  /**
   * Function to filter the procurement unit list based on planning unit
   */
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
  /**
   * Builds the jexcel component to display procurement unit list.
   */
  buildJExcel() {
    let procurementUnitList = this.state.selProcurementUnit;
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
    this.el = jexcel(document.getElementById("tableDiv"), '');
    jexcel.destroy(document.getElementById("tableDiv"), true);
    var json = [];
    var data = procurementUnitArray;
    var options = {
      data: data,
      columnDrag: false,
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
        },
        {
          title: i18n.t('static.procurementUnit.procurementUnit'),
          type: 'text',
        },
        {
          title: i18n.t('static.procurementUnit.multiplier'),
          type: 'numeric', mask: '#,##.00', decimal: '.',
        },
        {
          title: i18n.t('static.procurementUnit.unit'),
          type: 'text',
        },
        {
          title: i18n.t('static.procurementUnit.supplier'),
          type: 'text',
        },
        {
          title: i18n.t('static.procurementUnit.labeling'),
          type: 'text',
        },
        {
          title: i18n.t('static.common.lastModifiedBy'),
          type: 'text',
        },
        {
          title: i18n.t('static.common.lastModifiedDate'),
          type: 'calendar',
          options: { format: JEXCEL_DATE_FORMAT_SM },
        },
        {
          type: 'dropdown',
          title: i18n.t('static.common.status'),
          source: [
            { id: true, name: i18n.t('static.common.active') },
            { id: false, name: i18n.t('static.dataentry.inactive') }
          ]
        },
      ],
      editable: false,
      onload: loadedForNonEditableTables,
      pagination: localStorage.getItem("sesRecordCount"),
      search: true,
      columnSorting: true,
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
      license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var languageEl = jexcel(document.getElementById("tableDiv"), options);
    this.el = languageEl;
    this.setState({
      languageEl: languageEl,
      loading: false
    })
  }
  /**
   * Redirects to the edit procurement unit screen on row click.
   */
  selected = function (instance, cell, x, y, value, e) {
    if (e.buttons == 1) {
      if ((x == 0 && value != 0) || (y == 0)) {
      } else {
        if (this.state.selProcurementUnit.length != 0) {
          if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROCUREMENT_UNIT')) {
            this.props.history.push({
              pathname: `/procurementUnit/editProcurementUnit/${this.el.getValueFromCoords(0, x)}`,
            });
          }
        }
      }
    }
  }.bind(this);
  /**
   * Fetches the procurement unit and planning unit list from the server on component mount.
   */
  componentDidMount() {
    hideFirstComponent();
    ProcurementUnitService.getProcurementUnitList().then(response => {
      if (response.status == 200) {
        this.setState({
          procurementUnitList: response.data,
          selProcurementUnit: response.data,
        }, () => {
          this.buildJExcel();
        });
      } else {
        this.setState({
          message: response.data.messageCode, loading: false
        },
          () => {
            hideSecondComponent();
          })
      }
    }).catch(
      error => {
        if (error.message === "Network Error") {
          this.setState({
            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
            loading: false
          });
        } else {
          switch (error.response ? error.response.status : "") {
            case 401:
              this.props.history.push(`/login/static.message.sessionExpired`)
              break;
            case 409:
              this.setState({
                message: i18n.t('static.common.accessDenied'),
                loading: false,
                color: "#BA0C2F",
              });
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
    DropdownService.getPlanningUnitDropDownList().then(response => {
      if (response.status == 200) {
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
            loading: false
          });
        } else {
          switch (error.response ? error.response.status : "") {
            case 401:
              this.props.history.push(`/login/static.message.sessionExpired`)
              break;
            case 409:
              this.setState({
                message: i18n.t('static.common.accessDenied'),
                loading: false,
                color: "#BA0C2F",
              });
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
  /**
   * Redirects to the add procurement unit screen.
   */
  addNewProcurementUnit() {
    this.props.history.push({
      pathname: "/procurementUnit/addProcurementUnit"
    });
  }
  /**
   * Renders the procurement unit list.
   * @returns {JSX.Element} - Procurement Unit list.
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
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
          <option key={i} value={item.id}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);
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
        <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
        <Card>
          <div className="Card-header-addicon">
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
                    </InputGroup>
                  </div>
                </FormGroup>
              </div>
            </Col>
            <div >
              <div className="consumptionDataEntryTable">
                <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PROCUREMENT_UNIT') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                </div>
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
