import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody, Col, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN } from '../../Constants.js';
import BudgetServcie from '../../api/BudgetService';
import DropdownService from '../../api/DropdownService';
import FundingSourceService from '../../api/FundingSourceService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.dashboard.budget');
/**
 * Component for list of budget details.
 */
class ListBudgetComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      budgetList: [],
      lang: localStorage.getItem('lang'),
      message: '',
      selBudget: [],
      fundingSourceList: [],
      loading: true,
      programs: [],
      programId: localStorage.getItem("sesBudPro") != "" ? localStorage.getItem("sesBudPro") : 0,
      fundingSourceId: localStorage.getItem("sesBudFs") != "" ? localStorage.getItem("sesBudFs") : 0,
      statusId: localStorage.getItem("sesBudStatus") != "" ? localStorage.getItem("sesBudStatus") : "true",
    }
    this.addBudget = this.addBudget.bind(this);
    this.filterData = this.filterData.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.hideFirstComponent = this.hideFirstComponent.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
    this.buildJExcel = this.buildJExcel.bind(this);
    this.programChanged = this.programChanged.bind(this);
    this.fundingSourceChanged = this.fundingSourceChanged.bind(this);
    this.statusChanged = this.statusChanged.bind(this);
  }
  /**
   * Handles change in selected program & filters data accordingly.
   * @param {Event} event - The change event.
   */
  programChanged(event) {
    localStorage.setItem("sesBudPro", event.target.value);
    this.setState({
      programId: event.target.value
    }, () => {
      this.filterData();
    })
  }
  /**
   * Handles change in selected funding source & filters data accordingly.
   * @param {Event} event - The change event.
   */
  fundingSourceChanged(event) {
    localStorage.setItem("sesBudFs", event.target.value);
    this.setState({
      fundingSourceId: event.target.value
    }, () => {
      this.filterData();
    })
  }
  /**
   * Handles change in selected status & filters data accordingly.
   * @param {Event} event - The change event.
   */
  statusChanged(event) {
    localStorage.setItem("sesBudStatus", event.target.value);
    this.setState({
      statusId: event.target.value
    }, () => {
      this.filterData();
    })
  }
  /**
   * Hides the message in div1 after 30 seconds.
   */
  hideFirstComponent() {
    this.timeout = setTimeout(function () {
      document.getElementById('div1').style.display = 'none';
    }, 30000);
  }
  /**
   * Clears the timeout when the component is unmounted.
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  /**
   * Hides the message in div2 after 30 seconds.
   */
  hideSecondComponent() {
    setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 30000);
  }
  /**
   * Filters the budget list according to the Program, Funding source & Status filters
   */
  filterData() {
    let fundingSourceId = this.state.fundingSourceId;
    let programId = parseInt(this.state.programId);
    var selStatus = this.state.statusId;
    let tempSelStatus = (selStatus == "true" ? true : false)
    if (fundingSourceId != 0 && programId != 0 && selStatus != "") {
      const selBudget = this.state.budgetList.filter(c => c.fundingSource.fundingSourceId == fundingSourceId && [...new Set(c.programs.map(ele => ele.id))].includes(programId) && c.active == tempSelStatus)
      this.setState({
        selBudget: selBudget
      }, () => {
        this.buildJExcel();
      });
    } else if (fundingSourceId != 0 && programId != 0) {
      const selBudget = this.state.budgetList.filter(c => c.fundingSource.fundingSourceId == fundingSourceId && [...new Set(c.programs.map(ele => ele.id))].includes(programId))
      this.setState({
        selBudget: selBudget
      }, () => {
        this.buildJExcel();
      });
    } else if (fundingSourceId != 0 && selStatus != "") {
      const selBudget = this.state.budgetList.filter(c => c.fundingSource.fundingSourceId == fundingSourceId && c.active == tempSelStatus)
      this.setState({
        selBudget: selBudget
      }, () => {
        this.buildJExcel();
      });
    } else if (programId != 0 && selStatus != "") {
      const selBudget = this.state.budgetList.filter(c => [...new Set(c.programs.map(ele => ele.id))].includes(programId) && c.active == tempSelStatus)
      this.setState({
        selBudget: selBudget
      }, () => {
        this.buildJExcel();
      });
    } else if (fundingSourceId != 0) {
      const selBudget = this.state.budgetList.filter(c => c.fundingSource.fundingSourceId == fundingSourceId)
      this.setState({
        selBudget: selBudget
      }, () => {
        this.buildJExcel();
      });
    } else if (programId != 0) {
      const selBudget = this.state.budgetList.filter(c => [...new Set(c.programs.map(ele => ele.id))].includes(programId))
      this.setState({
        selBudget: selBudget
      }, () => {
        this.buildJExcel();
      });
    } else if (selStatus != "") {
      const selBudget = this.state.budgetList.filter(c => c.active == tempSelStatus)
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
  /**
   * Formats the date
   * @param {*} cell - value of the cell
   * @param {*} row 
   * @returns {string} - Formatted date.
   */
  formatDate(cell, row) {
    if (cell != null && cell != "") {
      var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
      return modifiedDate;
    } else {
      return "";
    }
  }
  /**
   * Redirects to the add budget screen
   * @param {*} budget 
   */
  addBudget(budget) {
    this.props.history.push({
      pathname: "/budget/addBudget"
    });
  }
  /**
   * Builds the jexcel component to display budget list.
   */
  buildJExcel() {
    let budgetList = this.state.selBudget;
    let budgetArray = [];
    let count = 0;
    for (var j = 0; j < budgetList.length; j++) {
      data = [];
      data[0] = budgetList[j].budgetId
      data[1] = budgetList[j].programs.filter(x => x.id != 0).map(x => getLabelText(x.label, this.state.lang)).join(", ")
      data[2] = getLabelText(budgetList[j].label, this.state.lang)
      data[3] = budgetList[j].budgetCode;
      data[4] = getLabelText(budgetList[j].fundingSource.label, this.state.lang)
      data[5] = budgetList[j].currency.currencyCode;
      data[6] = parseFloat(budgetList[j].budgetAmt).toFixed(2);
      data[7] = (budgetList[j].usedUsdAmt).toFixed(2);
      data[8] = (budgetList[j].budgetAmt - budgetList[j].usedUsdAmt).toFixed(2);
      data[9] = (budgetList[j].startDate ? moment(budgetList[j].startDate).format(`YYYY-MM-DD HH:mm:ss`) : null);
      data[10] = (budgetList[j].stopDate ? moment(budgetList[j].stopDate).format(`YYYY-MM-DD HH:mm:ss`) : null);
      data[11] = budgetList[j].lastModifiedBy.username;
      data[12] = (budgetList[j].lastModifiedDate ? moment(budgetList[j].lastModifiedDate).format(`YYYY-MM-DD HH:mm:ss`) : null)
      data[13] = (budgetList[j].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'));
      data[14] = budgetList[j].budgetAmt;
      data[15] = budgetList[j].usedUsdAmt;
      data[16] = budgetList[j].stopDate;
      budgetArray[count] = data;
      count++;
    }
    this.el = jexcel(document.getElementById("tableDiv"), '');
    jexcel.destroy(document.getElementById("tableDiv"), true);
    var data = budgetArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [150, 60, 60, 60, 100,],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: 'budgetId',
          type: 'hidden',
        },
        {
          title: i18n.t('static.budget.program'),
          type: 'text',
        },
        {
          title: i18n.t('static.budget.budget'),
          type: 'text',
        },
        {
          title: i18n.t('static.budget.budgetDisplayName'),
          type: 'text',
        },
        {
          title: i18n.t('static.budget.fundingsource'),
          type: 'text',
        },
        {
          title: i18n.t('static.country.currency'),
          type: 'text',
        },
        {
          title: i18n.t('static.budget.budgetamount'),
          mask: '[-]#,##.00', decimal: '.', type: 'numeric'
        },
        {
          title: i18n.t('static.budget.usedUSDAmount'),
          mask: '[-]#,##.00', decimal: '.', type: 'numeric'
        },
        {
          title: i18n.t('static.budget.availableAmt'),
          mask: '[-]#,##.00', decimal: '.', type: 'numeric'
        },
        {
          title: i18n.t('static.common.startdate'),
          options: { format: JEXCEL_DATE_FORMAT_SM },
          type: 'calendar'
        },
        {
          title: i18n.t('static.common.stopdate'),
          options: { format: JEXCEL_DATE_FORMAT_SM },
          type: 'calendar'
        },
        {
          title: i18n.t('static.common.lastModifiedBy'),
          type: 'text',
        },
        {
          title: i18n.t('static.common.lastModifiedDate'),
          options: { format: JEXCEL_DATE_FORMAT_SM },
          type: 'calendar'
        },
        {
          type: 'text',
          title: i18n.t('static.common.status'),
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
      license: JEXCEL_PRO_KEY,
      filters: true,
      updateTable: function (el, cell, x, y, source, value, id) {
      }.bind(this),
      onload: this.loaded,
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
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var languageEl = jexcel(document.getElementById("tableDiv"), options);
    this.el = languageEl;
    this.setState({
      languageEl: languageEl, loading: false
    })
  }
  /**
   * Redirects to the edit budget screen on row click with budgetId for editing.
   * @param {*} instance - This is the DOM Element where sheet is created
   * @param {*} cell - This is the object of the DOM element
   * @param {*} x - Row Number
   * @param {*} y - Column Number
   * @param {*} value - Cell Value
   * @param {Event} e - The selected event.
   */
  selected = function (instance, cell, x, y, value, e) {
    if (e.buttons == 1) {
      if ((x == 0 && value != 0) || (y == 0)) {
      } else {
        if (this.state.selBudget.length != 0) {
          if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_BUDGET')) {
            this.props.history.push({
              pathname: `/budget/editBudget/${this.el.getValueFromCoords(0, x)}`,
            });
          }
        }
      }
    }
  }.bind(this);
  /**
   * This function is used to format the table like add asterisk or info to the table headers or change color of cell text.
   * @param {*} instance - This is the DOM Element where sheet is created
   * @param {*} cell - This is the object of the DOM element
   * @param {*} x - Row Number
   * @param {*} y - Column Number
   * @param {*} value - Cell Value
   */
  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunction(instance);
    var elInstance = instance.worksheets[0];
    var json = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N']
    for (var j = 0; j < json.length; j++) {
      var rowData = elInstance.getRowData(j);
      var stopDate = rowData[16];
      var budgetAmt = rowData[14];
      var usedUsdAmt = rowData[15];
      if (((moment(stopDate)).isBefore(moment(Date.now())) || ((budgetAmt - usedUsdAmt) <= 0))) {
        for (var i = 0; i < colArr.length; i++) {
          elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
          var cell = elInstance.getCell((colArr[i]).concat(parseInt(j) + 1))
          cell.classList.add('jexcelRedCell');
        }
      } else {
        for (var i = 0; i < colArr.length; i++) {
          elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
        }
      }
    }
  }
  /**
   * Fetches the RealmId, Program list, Budget list and Funding source list from the server and builds the jexcel component on component mount.
   */
  componentDidMount() {
    this.hideFirstComponent();
    // Fetch realmId
    let realmId = AuthenticationService.getRealmId();
    //Fetch Program list
    DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
      .then(response => {
        if (response.status == 200) {
          var listArray = response.data.filter(c => c.active);
          listArray.sort((a, b) => {
            var itemLabelA = a.code.toUpperCase();
            var itemLabelB = b.code.toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            programs: listArray
          })
        }
        else {
          this.setState({
            message: response.data.messageCode, loading: false
          },
            () => {
              this.hideSecondComponent();
            })
        }
      })
      .catch(
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
    //Fetch budget list
    BudgetServcie.getBudgetList()
      .then(response => {
        if (response.status == 200) {
          this.setState({
            budgetList: response.data,
            selBudget: response.data, loading: false
          }, () => {
            this.filterData();
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
              message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
    //Fetch all funding source list
    FundingSourceService.getFundingSourceListAll()
      .then(response => {
        if (response.status == 200) {
          var listArray = response.data.filter(c => (c.allowedInBudget == true || c.allowedInBudget == "true"));
          listArray.sort((a, b) => {
            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            fundingSourceList: listArray
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
   * Renders the budget list with filters.
   * @returns {JSX.Element} - Budget list.
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
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
    const { programs } = this.state;
    let programList = programs.length > 0
      && programs.map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {item.code}
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
        text: 'All', value: this.state.selBudget.length
      }]
    }
    return (
      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
        <Card>
          <div className="Card-header-addicon BudgetPlusIcon" style={{ marginTop: '13px' }}>
            <span className="pl-0">{i18n.t("static.budget.budgetNoteForCommitingLocalVersion")}</span>
            <div className="card-header-actions">
              <div className="card-header-action">
                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_BUDGET') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addBudget}><i className="fa fa-plus-square"></i></a>}
              </div>
            </div>
          </div>
          <CardBody className="pb-lg-0 ">
            <Col md="6 pl-0">
              <div className="d-md-flex Selectdiv2">
                <FormGroup className="mt-md-2 mb-md-0 ">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                  <div className="controls SelectGo">
                    <InputGroup>
                      <Input
                        type="select"
                        name="programId"
                        id="programId"
                        bsSize="sm"
                        value={this.state.programId}
                        onChange={(e) => this.programChanged(e)}
                      >
                        <option value="0">{i18n.t('static.common.all')}</option>
                        {programList}
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                  <div className="controls SelectGo">
                    <InputGroup>
                      <Input
                        type="select"
                        name="fundingSourceId"
                        id="fundingSourceId"
                        bsSize="sm"
                        value={this.state.fundingSourceId}
                        onChange={(e) => this.fundingSourceChanged(e)}
                      >
                        <option value="0">{i18n.t('static.common.all')}</option>
                        {fundingSources}
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                  <div className="controls SelectGo">
                    <InputGroup>
                      <Input
                        type="select"
                        name="active"
                        id="active"
                        bsSize="sm"
                        value={this.state.statusId}
                        onChange={(e) => this.statusChanged(e)}
                      >
                        <option value="">{i18n.t('static.common.all')}</option>
                        <option value="true" selected>{i18n.t('static.common.active')}</option>
                        <option value="false">{i18n.t('static.common.disabled')}</option>
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>
              </div>
            </Col>
            <div className='consumptionDataEntryTable'>
              <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_BUDGET') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
            <h5 style={{ color: '#BA0C2F' }}>{i18n.t('static.budget.redRow')}</h5>
          </CardBody>
        </Card>
      </div>
    )
  }
}
export default ListBudgetComponent;