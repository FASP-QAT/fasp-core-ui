import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup, Input, InputGroup, Label,
  Modal, ModalBody, ModalFooter, ModalHeader,
  Table,
  Popover, PopoverBody
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import { addDoubleQuoteToRowContent, dateFormatter, dateFormatterCSV, makeText, roundAMC, roundN, formatter, hideSecondComponent, filterOptions, roundARU, roundARUWithoutRounding } from '../../CommonComponent/JavascriptCommonFunctions';
export const DEFAULT_MIN_MONTHS_OF_STOCK = 3
export const DEFAULT_MAX_MONTHS_OF_STOCK = 18
const entityname1 = i18n.t('static.dashboard.stockstatus')
const ref = React.createRef();
const pickerLang = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  from: 'From', to: 'To',
}
/**
 * Component for Stock Status Report.
 */
class StockStatus extends Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      isDarkMode: false,
      PlanningUnitDataForExport: [],
      loading: true,
      dropdownOpen: false,
      radioSelected: 2,
      realms: [],
      programs: [],
      planningUnits: [],
      planningUnitsMulti: [],
      stockStatusList: [],
      versions: [],
      show: false,
      rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      programId: [],
      planningUnitLabel: '',
      lang: localStorage.getItem('lang'),
      exportModal: false,
      planningUnitIdsExport: [],
      type: 0,
      planningUnitNotes: "",
      viewById: 1,
      planningUnitId: [],
      planningUnitIdExport: [],
      realmCountryPlanningUnitId: [],
      realmCountryPlanningUnitIdExport: [],
      planningUnitIds: [],
      forecastingUnitId: "",
      forecastingUnitIds: [],
      equivalencyUnitId: "",
      consumptionData: [],
      equivalencyUnitList: [],
      programEquivalencyUnitList: [],
      yaxisEquUnit: -1,
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      forecastingUnits: [],
      allForecastingUnits: [],
      forecastingUnitValues: [],
      forecastingUnitLabels: [],
      realmCountryPlanningUnits: [],
      realmCountryPlanningUnitValues: [],
      realmCountryPlanningUnitLabels: [],
      planningUnitList: [],
      planningUnitListAll: [],
      realmCountryPlanningUnitList: [],
      realmCountryPlanningUnitListAll: [],
      shipmentPopup: false,
      isAggregate: false,
      PlanningUnitIdDataForExport: "",
      onlyShowAllPUs: false,
      ppuList: [],
      graphAggregatedBy: 1,
      versionId: "",
      planningUnitDetails: "",
      planningUnitDetailsExport: ""
    };
    this.filterData = this.filterData.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.programChange = this.programChange.bind(this);
    this.toggleExport = this.toggleExport.bind(this);
    this.yAxisChange = this.yAxisChange.bind(this);
    this.setViewById = this.setViewById.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.toggleShipmentPopup = this.toggleShipmentPopup.bind(this);
    this.setIsAggregate = this.setIsAggregate.bind(this);
    this.setPlanningUnitExport = this.setPlanningUnitExport.bind(this);
    this.setRealmCountryPlanningUnitExport = this.setRealmCountryPlanningUnitExport.bind(this);
    this.setGraphAggregatedBy = this.setGraphAggregatedBy.bind(this);
    this.setVersionId = this.setVersionId.bind(this);
    this.getPlanningUnitByProgramIdAndPlanningUnitId = this.getPlanningUnitByProgramIdAndPlanningUnitId.bind(this);
  }
  setGraphAggregatedBy(e) {
    this.setState({
      graphAggregatedBy: e.target.value
    })
  }
  setIsAggregate(e) {
    this.setState({
      isAggregate: e.target.value
    })
  }
  /**
   * Handles the change event for the program selection.
   * Resets relevant state variables and triggers filtering of versions.
   * @param {Event} event - The on change event object.
   */
  programChange(event) {
    if (localStorage.getItem("sessionType") != 'Online') {
      var pId = event.target.value;
      if (pId != "") {
        var pLabel = document.getElementById("programId").selectedOptions[0].text.toString()
        var p = [{
          value: Number(pId),
          label: pLabel
        }]
        event = p;
      }
    }
    this.setState({
      programId: event.map(ele => ele),
      planningUnitList: [],
      realmCountryPlanningUnitList: [],
      planningUnitId: [],
      onlyShowAllPUs: false,
      realmCountryPlanningUnitId: [],
      stockStatusList: [],
      yaxisEquUnit: -1,
      graphAggregatedBy: event.map(ele => ele).length > 1 ? this.state.graphAggregatedBy : 2,
      planningUnitDetails: "",
      planningUnitDetailsExport: ""
      // planningUnits: [],
      // planningUnitsMulti: [],
      // planningUnitLabel: "",
      // stockStatusList: [],
      // forecastingUnits: [],
      // allForecastingUnits: [],
      // forecastingUnitIds: [],
      // matricsList: [],
      // viewById: 1,
      // planningUnitId: "",
      // forecastingUnitId: "",
      // equivalencyUnitId: "",
      // dataList: [],
    }, () => {
      this.filterVersion();
    })
  }
  /**
   * Sets the version ID and updates the tracer category list.
   * @param {Object} event - The event object containing the version ID value.
   */
  setVersionId(event) {
    this.setState(
      {
        versionId: event.target.value,
      },
      () => {
        if (this.state.versionId != "")
          this.getDropdownLists();
      }
    );
  }

  getDropdownLists() {
    var json = {
      programIds: this.state.programId.map(ele => ele.value),
      onlyAllowPuPresentAcrossAllPrograms: this.state.onlyShowAllPUs
    }
    if (this.state.versionId.toString().includes("Local")) {
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(
        INDEXED_DB_NAME,
        INDEXED_DB_VERSION
      );
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var planningunitTransaction = db1.transaction(["programPlanningUnit"], "readwrite");
        var planningunitOs = planningunitTransaction.objectStore("programPlanningUnit");
        var planningunitRequest = planningunitOs.getAll();
        planningunitRequest.onerror = function (event) {
        };
        planningunitRequest.onsuccess = function (e) {
          var myResult = [];
          myResult = planningunitRequest.result;
          var programId = this.state.programId[0].value;
          var proList = [];
          let incrmental = 0;
          var ppuResult = myResult.filter(epu => epu.program.id == programId && epu.active);
          let planningUnitListAll = []
          ppuResult.map(pu =>
            planningUnitListAll.push({
              id: pu.planningUnit.id,
              label: pu.planningUnit.label,
              forecastingUnitId: pu.forecastingUnit.id
            }
            )
          );
          var realmCountryPlanningunitTransaction = db1.transaction(["realmCountryPlanningUnit"], "readwrite");
          var realmCountryPlanningunitOs = realmCountryPlanningunitTransaction.objectStore("realmCountryPlanningUnit");
          var realmCountryPlanningunitRequest = realmCountryPlanningunitOs.getAll();
          realmCountryPlanningunitRequest.onerror = function (event) {
          };
          realmCountryPlanningunitRequest.onsuccess = function (e) {
            var euTransaction = db1.transaction(["equivalencyUnit"], "readwrite");
            var euOs = euTransaction.objectStore("equivalencyUnit");
            var euRequest = euOs.getAll();
            euRequest.onerror = function (event) {
            };
            euRequest.onsuccess = function (e) {
              var programTransaction = db1.transaction(["program"], "readwrite");
              var programOs = programTransaction.objectStore("program");
              var programRequest = programOs.get(programId);
              programRequest.onerror = function (event) {
              };
              programRequest.onsuccess = function (e) {
                var programResult;
                programResult = programRequest.result;

                var myResult = [];
                myResult = realmCountryPlanningunitRequest.result;
                let realmCountryPlanningUnitList = myResult.filter(ercpu => [...new Set(planningUnitListAll.map(x => x.id))].includes(ercpu.planningUnit.id) && programResult.realmCountry.realmCountryId == ercpu.realmCountry.id);
                var realmCountryPlanningUnitListAll = [];
                realmCountryPlanningUnitList.map(item => {
                  realmCountryPlanningUnitListAll.push({
                    "id": item.realmCountryPlanningUnitId,
                    "label": item.label,
                    "planningUnit": item.planningUnit,
                    "forecastingUnitId": ppuResult.filter(c => c.planningUnit.id == item.planningUnit.id)[0].forecastingUnit.id,
                    "multiplier": item.multiplier
                  })
                })
                var lang = this.state.lang;
                var fuIds = [...new Set(ppuResult.map(c => c.forecastingUnit.id.toString()))];
                var equivalencyUnitList = [];
                var euResults = euRequest.result.filter(c => (c.program == null || (c.program != null && c.program.id == programId)) && fuIds.includes(c.forecastingUnit.id.toString()) && c.active && c.equivalencyUnit.active)
                euResults.map(item => {
                  if (equivalencyUnitList.findIndex(c => c.id == item.equivalencyUnit.equivalencyUnitId) == -1) {
                    equivalencyUnitList.push({
                      id: item.equivalencyUnit.equivalencyUnitId,
                      label: item.equivalencyUnit.label,
                      forecastingUnitIds: euResults.filter(c => c.equivalencyUnit.equivalencyUnitId == item.equivalencyUnit.equivalencyUnitId && c.active && c.equivalencyUnit.active).map(c => c.forecastingUnit.id.toString())
                    })
                  }
                });
                this.setState({
                  equivalencyUnitList: equivalencyUnitList,
                  planningUnitListAll: planningUnitListAll,
                  realmCountryPlanningUnitListAll: realmCountryPlanningUnitListAll,
                  planningUnitList: planningUnitListAll,
                  realmCountryPlanningUnitList: realmCountryPlanningUnitListAll,
                  planningUnitId: [],
                  realmCountryPlanningUnitId: [],
                  stockStatusList: []
                }, () => {
                  if (this.state.yaxisEquUnit != -1) {
                    var validFu = this.state.equivalencyUnitList.filter(x => x.id == this.state.yaxisEquUnit)[0].forecastingUnitIds;
                    var planningUnitList = this.state.planningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
                    var realmCountryPlanningUnitList = this.state.realmCountryPlanningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
                    this.setState({
                      planningUnitList: planningUnitList,
                      realmCountryPlanningUnitList: realmCountryPlanningUnitList,
                    })
                  }
                });
              }.bind(this);
            }.bind(this);
          }.bind(this);
        }.bind(this);
      }.bind(this);
    } else {
      ReportService.getDropdownListByProgramIds(json).then(response => {
        this.setState({
          equivalencyUnitList: response.data.equivalencyUnitList,
          planningUnitListAll: response.data.planningUnitList,
          realmCountryPlanningUnitListAll: response.data.realmCountryPlanningUnitList,
          planningUnitList: response.data.planningUnitList,
          realmCountryPlanningUnitList: response.data.realmCountryPlanningUnitList,
          planningUnitId: [],
          realmCountryPlanningUnitId: [],
          stockStatusList: []
        }, () => {
          if (this.state.yaxisEquUnit != -1) {
            var validFu = this.state.equivalencyUnitList.filter(x => x.id == this.state.yaxisEquUnit)[0].forecastingUnitIds;
            var planningUnitList = this.state.planningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
            var realmCountryPlanningUnitList = this.state.realmCountryPlanningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
            this.setState({
              planningUnitList: planningUnitList,
              realmCountryPlanningUnitList: realmCountryPlanningUnitList,
            })
          }
        })
      }).catch(
        error => {
          this.setState({
            stockStatusList: [], loading: false
          })
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
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                  loading: false
                });
                break;
              case 412:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
  }
  /**
   * Toggles the value of the 'show' state variable.
   */
  toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
  /**eact
   * Toggle info for shipment details
   */
  toggleShipmentPopup() {
    this.setState({
      shipmentPopup: !this.state.shipmentPopup,
    });
  }
  /**
   * Returns the CSS class name for formatting text color in a row.
   * @param {Object} row - The row object.
   * @returns {string} - The CSS class name for text color formatting.
   */
  rowtextFormatClassName = (row) => {
    return 'textcolor-purple';
  }
  /**
   * Exports the data to a CSV file.
   */
  exportCSV() {
    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.report.dateRange') + ': ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
    var A = ""
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var list = this.state.PlanningUnitDataForExport
    list.map(
      (item, index) => {
        csvRow.push("")
        if (index != 0) {
          csvRow.push("")
        }
        var ppu = item.PlanningUnitIdDataForExport;
        if (this.state.isAggregate == "false" || this.state.isAggregate == false) {
          csvRow.push('"' + ((i18n.t('static.program.program') + ': ' + (this.state.programs.filter(c => c.programId == item.programId)[0].programCode))).replaceAll(' ', '%20') + '"')
          if (this.state.yaxisEquUnit != -1) {
            csvRow.push('"' + (i18n.t('static.equivalancyUnit.equivalancyUnits') + ': ' + (document.getElementById("yaxisEquUnit").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
          }
          csvRow.push('"' + ((this.state.viewById == 1 ? i18n.t('static.planningunit.planningunit') : i18n.t('static.planningunit.countrysku')).replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + getLabelText(item.reportBy.label, this.state.lang)).replaceAll(' ', '%20') + '"');
          csvRow.push('"' + (i18n.t('static.supplyPlan.amcPastOrFuture').replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + (ppu.monthsInPastForAmc) + "/" + (ppu.monthsInFutureForAmc) + '"'))
          if (item.data.length > 0 && ppu.planBasedOn == 1) {
            csvRow.push('"' + (i18n.t('static.supplyPlan.minStockMos').replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + item.data[0].minMos + '"'))
          } else {
            csvRow.push('"' + (i18n.t('static.product.minQuantity').replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + item.data[0].minStock + '"'))
          }
          csvRow.push('"' + (i18n.t('static.report.shelfLife').replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + ppu.shelfLife + '"'))
          if (item.data.length > 0 && ppu.planBasedOn == 1) {
            csvRow.push('"' + (i18n.t('static.supplyPlan.maxStockMos').replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + item.data[0].maxMos + '"'))
          } else {
            csvRow.push('"' + (i18n.t('static.product.distributionLeadTime').replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + item.data[0].distributionLeadTime + '"'))
          }
          csvRow.push('"' + (i18n.t('static.supplyPlan.reorderInterval').replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + ppu.reorderFrequencyInMonths + '"'))
          if (ppu.ppuNotes != null && ppu.ppuNotes != undefined && ppu.ppuNotes.length > 0) {
            csvRow.push('"' + (i18n.t('static.program.notes').replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + (ppu.ppuNotes).replaceAll(' ', '%20') + '"'))
          }
        } else {
          var programLabel = this.state.programId.map(ele => ele.label).join(', ');
          var reportingUnitList = this.state.viewById == 1 ? this.state.planningUnitIdExport : this.state.realmCountryPlanningUnitIdExport;
          var planningUnitLabel = reportingUnitList.map(ele => ele.label).join(', ');
          csvRow.push('"' + (i18n.t('static.program.program') + ': ' + programLabel).replaceAll(' ', '%20') + '"')
          if (this.state.yaxisEquUnit != -1) {
            csvRow.push('"' + (i18n.t('static.equivalancyUnit.equivalancyUnits') + ': ' + (document.getElementById("yaxisEquUnit").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
          }
          csvRow.push('"' + ((this.state.viewById == 1 ? i18n.t('static.planningunit.planningunit') : i18n.t('static.planningunit.countrysku')).replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + planningUnitLabel).replaceAll(' ', '%20') + '"');
          if (this.state.viewById == 1 ? this.state.planningUnitIdExport.length == 1 : this.state.realmCountryPlanningUnitIdExport.length == 1) {
            csvRow.push("\"" + i18n.t("static.supplyPlan.amcPast").replaceAll(' ', '%20') + ' : ' + this.state.planningUnitDetailsExport.monthsInPastForAmc + "\"")
            csvRow.push("\"" + i18n.t("static.supplyPlan.amcFuture").replaceAll(' ', '%20') + ' : ' + this.state.planningUnitDetailsExport.monthsInFutureForAmc + "\"")
            csvRow.push("\"" + i18n.t("static.report.shelfLife").replaceAll(' ', '%20') + ' : ' + this.state.planningUnitDetailsExport.shelfLife + "\"")
          }
          csvRow.push('"' + (((item.data[0].planBasedOn == 1 ? i18n.t('static.supplyPlan.minStockMos') : i18n.t('static.product.minQuantity'))).replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + (item.data[0].planBasedOn == 1 ? roundAMC(item.data[0].minStockMos) : roundAMC(item.data[0].minStockQty, 1))).replaceAll(' ', '%20') + '"');
          if (this.state.viewById == 1 ? this.state.planningUnitIdExport.length == 1 : this.state.realmCountryPlanningUnitIdExport.length == 1) {
            csvRow.push("\"" + i18n.t("static.supplyPlan.reorderInterval").replaceAll(' ', '%20').replaceAll('#', '%23') + ' : ' + this.state.planningUnitDetailsExport.reorderFrequencyInMonths + "\"")
          }
          if (item.data[0].planBasedOn == 1) {
            csvRow.push('"' + (((i18n.t('static.supplyPlan.maxStockMos'))).replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + (roundAMC(item.data[0].maxStockMos))).replaceAll(' ', '%20') + '"');
          } else {
            if (this.state.viewById == 1 ? this.state.planningUnitIdExport.length == 1 : this.state.realmCountryPlanningUnitIdExport.length == 1) {
              csvRow.push("\"" + i18n.t("static.product.distributionLeadTime").replaceAll(' ', '%20') + ' : ' + this.state.planningUnitDetailsExport.distributionLeadTime + "\"")
            }
          }
          if (item.data[0].ppuNotes != null && item.data[0].ppuNotes != undefined && item.data[0].ppuNotes.length > 0) {
            var notes = item.data[0].ppuNotes.split("~");
            var finalNotes = "";
            notes.map((item, index) => {
              if (index != 0) {
                finalNotes += ", ";
              }
              finalNotes += this.state.programId.length==1?item.split(":").slice(1).join(':'):item.split(":")[0] + ": " + item.split(":").slice(1).join(':');
            })
            csvRow.push('"' + (i18n.t('static.program.notes').replaceAll(' ', '%20') + (': ').replaceAll(' ', '%20') + (finalNotes).replaceAll(' ', '%20') + '"'))
          }
        }
        csvRow.push("")
        var headers = [addDoubleQuoteToRowContent([i18n.t('static.common.month').replaceAll(' ', '%20'),
        i18n.t('static.supplyPlan.openingBalance').replaceAll(' ', '%20'),
        i18n.t('static.report.forecasted').replaceAll(' ', '%20'),
        i18n.t('static.report.actual').replaceAll(' ', '%20'),
        i18n.t('static.shipment.qty').replaceAll(' ', '%20'),
        (i18n.t('static.shipment.qty') + " | " + i18n.t('static.budget.fundingsource') + " | " + i18n.t('static.supplyPlan.shipmentStatus').replaceAll(' ', '%20') + " | " + i18n.t('static.report.procurementAgentName') + " | " + i18n.t('static.mt.roNoAndPrimeLineNo')) + " | " + (i18n.t('static.mt.orderNoAndPrimeLineNo')),
        i18n.t('static.report.adjustmentQty').replaceAll(' ', '%20'),
        i18n.t('static.supplyplan.exipredStock').replaceAll(' ', '%20'),
        i18n.t('static.supplyPlan.endingBalance').replaceAll(' ', '%20'),
        i18n.t('static.report.amc').replaceAll(' ', '%20'),
        item.data.length > 0 && (this.state.isAggregate.toString() == "false" ? item.planBasedOn : item.data[0].planBasedOn) == 1 ? i18n.t('static.report.mos').replaceAll(' ', '%20') : i18n.t('static.supplyPlan.maxQty').replaceAll(' ', '%20'),
        i18n.t('static.supplyPlan.unmetDemandStr').replaceAll(' ', '%20')
        ])];
        if (this.state.isAggregate.toString() == "true" && (this.state.programId.length > 0 || this.state.planningUnitIdExport.length > 0 || this.state.realmCountryPlanningUnitIdExport.length > 0)) {
          headers = [addDoubleQuoteToRowContent([i18n.t('static.common.month').replaceAll(' ', '%20'),
          i18n.t('static.supplyPlan.openingBalance').replaceAll(' ', '%20'),
          i18n.t('static.report.forecasted').replaceAll(' ', '%20'),
          i18n.t('static.report.actual').replaceAll(' ', '%20'),
          i18n.t('static.stockStatus.consensus').replaceAll(' ', '%20'),
          i18n.t('static.shipment.qty').replaceAll(' ', '%20'),
          (i18n.t('static.program.programMaster') + " | " + i18n.t('static.shipment.qty') + " | " + i18n.t('static.budget.fundingsource') + " | " + i18n.t('static.supplyPlan.shipmentStatus').replaceAll(' ', '%20') + " | " + i18n.t('static.report.procurementAgentName') + " | " + i18n.t('static.mt.roNoAndPrimeLineNo')) + " | " + (i18n.t('static.mt.orderNoAndPrimeLineNo')),
          i18n.t('static.report.adjustmentQty').replaceAll(' ', '%20'),
          i18n.t('static.supplyplan.exipredStock').replaceAll(' ', '%20'),
          i18n.t('static.supplyPlan.endingBalance').replaceAll(' ', '%20'),
          i18n.t('static.report.amc').replaceAll(' ', '%20'),
          item.data.length > 0 && (this.state.isAggregate.toString() == "false" ? item.planBasedOn : item.data[0].planBasedOn) == 1 ? i18n.t('static.report.mos').replaceAll(' ', '%20') : i18n.t('static.supplyPlan.maxQty').replaceAll(' ', '%20'),
          i18n.t('static.supplyPlan.unmetDemandStr').replaceAll(' ', '%20')
          ])]
        }
        A = headers
        if (this.state.isAggregate.toString() == "true" && (this.state.programId.length > 0 || this.state.planningUnitIdExport.length > 0 || this.state.realmCountryPlanningUnitIdExport.length > 0)) {
          item.data.map(ele => A.push(addDoubleQuoteToRowContent([dateFormatterCSV(ele.dt).replaceAll(' ', '%20'), roundARU(ele.openingBalance, 1), ele.forecastedConsumptionQty == null ? '' : roundARU(ele.forecastedConsumptionQty, 1), ele.actualConsumptionQty == null ? '' : roundARU(ele.actualConsumptionQty, 1), ele.finalConsumptionQty == null ? '' : roundARU(ele.finalConsumptionQty, 1), ele.shipmentQty == null ? '' : (ele.shipmentInfo.length > 0 ? roundARU(ele.shipmentQty, 1) : ""),
          (ele.shipmentInfo.map(item1 => {
            return (
              item1.program.code + " | " + roundARU(item1.shipmentQty, 1) + " | " + item1.fundingSource.code + " | " + getLabelText(item1.shipmentStatus.label, this.state.lang) + " | " + item1.procurementAgent.code +
              (item1.orderNo == null &&
                item1.primeLineNo == null &&
                item1.roNo == null &&
                item1.roPrimeLineNo == null
                ? " | N/A"
                : (item1.roNo == null && item1.roPrimeLineNo == null
                  ? ""
                  : " | " + item1.roNo + "-" + item1.roPrimeLineNo) +
                (item1.orderNo == null && item1.primeLineNo == null
                  ? ""
                  : item1.orderNo == null
                    ? ""
                    : " | " + item1.orderNo) +
                (item1.primeLineNo == null
                  ? ""
                  : "-" + item1.primeLineNo))
            )
          }).join(' \n')).replaceAll(' ', '%20').replaceAll("#", "%23")
            , (ele.adjustment == 0 ? ele.regionCountForStock > 0 ? roundARU(ele.nationalAdjustment, 1) : "" : ele.regionCountForStock > 0 ? Number(roundARU(ele.nationalAdjustment, 1)) + Number(ele.adjustment != null ? roundARU(ele.adjustment, 1) : 0) : ele.adjustment != null ? roundARU(ele.adjustment, 1) : ""), ele.expiredStock != 0 ? roundARU(ele.expiredStock, 1) : '', roundARU(ele.closingBalance, 1), ele.amc != null ? roundAMC(ele.amc) : "", (this.state.isAggregate.toString() == "false" ? item.planBasedOn : ele.planBasedOn) == 1 ? roundAMC(ele.mos) : roundAMC((this.state.isAggregate.toString() == "false" ? ele.maxStock : ele.maxStockQty)), ele.unmetDemand != 0 ? roundARU(ele.unmetDemand, 1) : ''])));
        } else {
          item.data.map(ele => A.push(addDoubleQuoteToRowContent([dateFormatterCSV(ele.dt).replaceAll(' ', '%20'), roundARU(ele.openingBalance, 1), ele.forecastedConsumptionQty == null ? '' : roundARU(ele.forecastedConsumptionQty, 1), ele.actualConsumptionQty == null ? '' : roundARU(ele.actualConsumptionQty, 1), ele.shipmentQty == null ? '' : (ele.shipmentInfo.length > 0 ? roundARU(ele.shipmentQty, 1) : ""),
          (ele.shipmentInfo.map(item1 => {
            return (
              roundARU(item1.shipmentQty, 1) + " | " + item1.fundingSource.code + " | " + getLabelText(item1.shipmentStatus.label, this.state.lang) + " | " + item1.procurementAgent.code +
              (item1.orderNo == null &&
                item1.primeLineNo == null &&
                item1.roNo == null &&
                item1.roPrimeLineNo == null
                ? " | N/A"
                : (item1.roNo == null && item1.roPrimeLineNo == null
                  ? ""
                  : " | " + item1.roNo + "-" + item1.roPrimeLineNo) +
                (item1.orderNo == null && item1.primeLineNo == null
                  ? ""
                  : item1.orderNo == null
                    ? ""
                    : " | " + item1.orderNo) +
                (item1.primeLineNo == null
                  ? ""
                  : "-" + item1.primeLineNo))
            )
          }).join(' \n')).replaceAll(' ', '%20').replaceAll("#", "%23")
            , (ele.adjustment == 0 ? ele.regionCountForStock > 0 ? roundARU(ele.nationalAdjustment, 1) : "" : ele.regionCountForStock > 0 ? Number(roundARU(ele.nationalAdjustment, 1)) + Number(ele.adjustment != null ? roundARU(ele.adjustment, 1) : 0) : ele.adjustment != null ? roundARU(ele.adjustment, 1) : ""), ele.expiredStock != 0 ? roundARU(ele.expiredStock, 1) : '', roundARU(ele.closingBalance, 1), ele.amc != null ? roundAMC(ele.amc) : "", (this.state.isAggregate.toString() == "false" ? item.planBasedOn : ele.planBasedOn) == 1 ? roundAMC(ele.mos) : roundAMC((this.state.isAggregate.toString() == "false" ? ele.maxStock : ele.maxStockQty)), ele.unmetDemand != 0 ? roundARU(ele.unmetDemand, 1) : ''])));
        }
        for (var i = 0; i < A.length; i++) {
          csvRow.push(A[i].join(","))
        }
      })
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.stockstatus') + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
    document.body.appendChild(a)
    a.click()
  }
  /**
   * Exports the data to a PDF file.
   */
  exportPDF = () => {
    const addFooters = doc => {
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setPage(i)
        doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
          align: 'center'
        })
        doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
          align: 'center'
        })
      }
    }
    const addHeaders = (doc, pageArray) => {
      const pageCount = doc.internal.getNumberOfPages()
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setPage(i)
        doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.dashboard.stockstatus'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          var splittext = doc.splitTextToSize(i18n.t('static.common.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`) + ' ' + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width / 8);
          doc.text(doc.internal.pageSize.width * 3 / 4, 60, splittext)
          splittext = doc.splitTextToSize(i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width / 8);
          doc.text(doc.internal.pageSize.width / 8, 60, splittext)
        }
      }
    }
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";
    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(8);
    var pageArray = [];
    var list = this.state.PlanningUnitDataForExport
    var count = 0;
    list.map(
      (item, itemCount) => {
        if (itemCount != 0) {
          doc.addPage()
        }
        doc.setFontSize(8)
        doc.setTextColor("#002f6c");
        var ppu1 = item.PlanningUnitIdDataForExport;
        if (this.state.isAggregate == "false" || this.state.isAggregate == false) {
          doc.text(i18n.t('static.program.program') + ': ' + (this.state.programs.filter(c => c.programId == item.programId)[0].programCode), doc.internal.pageSize.width / 10, 80, {
            align: 'left'
          })
          var y = 80;
          if (this.state.yaxisEquUnit != -1) {
            y += 10;
            doc.text(i18n.t('static.equivalancyUnit.equivalancyUnits') + ': ' + (document.getElementById("yaxisEquUnit").selectedOptions[0].text), doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
          }
          y += 10;
          doc.text((this.state.viewById == 1 ? i18n.t('static.planningunit.planningunit') : i18n.t('static.planningunit.countrysku')) + ': ' + getLabelText(item.reportBy.label, this.state.lang), doc.internal.pageSize.width / 10, y, {
            align: 'left'
          })
          y += 10;
          doc.text(i18n.t('static.supplyPlan.amcPastOrFuture') + ': ' + (ppu1.monthsInPastForAmc) + "/" + (ppu1.monthsInFutureForAmc), doc.internal.pageSize.width / 10, y, {
            align: 'left'
          })
          y += 10;
          doc.text(i18n.t('static.report.shelfLife') + ': ' + ppu1.shelfLife, doc.internal.pageSize.width / 10, y, {
            align: 'left'
          })
          y += 10;
          if (ppu1.planBasedOn == 1) {
            doc.text(i18n.t('static.supplyPlan.minStockMos') + ': ' + item.data[0].minMos, doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
          } else {
            doc.text(i18n.t('static.product.minQuantity') + ': ' + formatter(ppu1.minQty, 0), doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
          }
          y += 10;
          doc.text(i18n.t('static.supplyPlan.reorderInterval') + ': ' + ppu1.reorderFrequencyInMonths, doc.internal.pageSize.width / 10, y, {
            align: 'left'
          })
          y += 10;
          if (ppu1.planBasedOn == 1) {
            doc.text(i18n.t('static.supplyPlan.maxStockMos') + ': ' + item.data[0].maxMos, doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
          } else {
            doc.text(i18n.t('static.product.distributionLeadTime') + ': ' + formatter(ppu1.distributionLeadTime, 0), doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
          }
          if (ppu1.ppuNotes != null && ppu1.ppuNotes != undefined && ppu1.ppuNotes.length > 0) {
            y += 10;
            doc.text(i18n.t('static.program.notes') + ': ' + ppu1.ppuNotes, doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
          }
        } else {
          var programLabel = this.state.programId.map(ele => ele.label).join(', ');
          var reportingUnitList = this.state.viewById == 1 ? this.state.planningUnitIdExport : this.state.realmCountryPlanningUnitIdExport;
          var planningUnitLabel = reportingUnitList.map(ele => ele.label).join(', ');
          var y = 80
          var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ': ' + programLabel, doc.internal.pageSize.width * 3 / 4);
          doc.text(doc.internal.pageSize.width / 10, y, planningText)
          for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
              doc.addPage();
              y = 80;
            } else {
              y = y + 10
            }
          }
          if (this.state.yaxisEquUnit != -1) {
            var planningText = doc.splitTextToSize(i18n.t('static.equivalancyUnit.equivalancyUnits') + ': ' + (document.getElementById("yaxisEquUnit").selectedOptions[0].text), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 10, y, planningText)
            for (var i = 0; i < planningText.length; i++) {
              if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
              } else {
                y = y + 10
              }
            }
          }
          var planningText = doc.splitTextToSize((this.state.viewById == 1 ? i18n.t('static.planningunit.planningunit') : i18n.t('static.planningunit.countrysku')) + ': ' + planningUnitLabel, doc.internal.pageSize.width * 3 / 4);
          doc.text(doc.internal.pageSize.width / 10, y, planningText)
          for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
              doc.addPage();
              y = 80;
            } else {
              y = y + 10
            }
          }
          // y=y-3
          if (this.state.viewById == 1 ? this.state.planningUnitIdExport.length == 1 : this.state.realmCountryPlanningUnitIdExport.length == 1) {
            doc.text(i18n.t('static.supplyPlan.amcPast') + ' : ' + this.state.planningUnitDetailsExport.monthsInPastForAmc, doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
            y += 10;
            doc.text(i18n.t('static.supplyPlan.amcFuture') + ' : ' + this.state.planningUnitDetailsExport.monthsInFutureForAmc, doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
            y += 10;
            doc.text(i18n.t('static.report.shelfLife') + ' : ' + this.state.planningUnitDetailsExport.shelfLife, doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
            y += 10;
          }
          doc.text((item.data[0].planBasedOn == 1 ? i18n.t('static.supplyPlan.minStockMos') : i18n.t('static.product.minQuantity')) + ': ' + (item.data[0].planBasedOn == 1 ? formatter(roundAMC(item.data[0].minStockMos, 1), 0) : formatter(roundAMC(item.data[0].minStockQty, 1), 0)), doc.internal.pageSize.width / 10, y, {
            align: 'left'
          })
          if (this.state.viewById == 1 ? this.state.planningUnitIdExport.length == 1 : this.state.realmCountryPlanningUnitIdExport.length == 1) {
            y += 10;
            doc.text(i18n.t('static.supplyPlan.reorderInterval') + ' : ' + this.state.planningUnitDetailsExport.reorderFrequencyInMonths, doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
          }
          if (item.data[0].planBasedOn == 1) {
            y += 10;
            doc.text(i18n.t('static.supplyPlan.maxStockMos') + ': ' + formatter(roundAMC(item.data[0].maxStockMos), 0), doc.internal.pageSize.width / 10, y, {
              align: 'left'
            })
          } else {
            if (this.state.viewById == 1 ? this.state.planningUnitIdExport.length == 1 : this.state.realmCountryPlanningUnitIdExport.length == 1) {
              y += 10;
              doc.text(i18n.t('static.product.distributionLeadTime') + ' : ' + formatter(this.state.planningUnitDetailsExport.distributionLeadTime), doc.internal.pageSize.width / 10, y, {
                align: 'left'
              })
            }
          }
          y += 10;
          if (item.data[0].ppuNotes != null && item.data[0].ppuNotes != undefined && item.data[0].ppuNotes.length > 0) {
            var notes = item.data[0].ppuNotes.split("~");
            var finalNotes = "";
            notes.map((item, index) => {
              if (index != 0) {
                finalNotes += ", ";
              }
              finalNotes += this.state.programId.length==1?item.split(":").slice(1).join(':'):item.split(":")[0] + ": " + item.split(":").slice(1).join(':');
            })
            var planningText = doc.splitTextToSize(i18n.t('static.program.notes') + ': ' + finalNotes, doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 10, y, planningText)
            for (var i = 0; i < planningText.length; i++) {
              if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
              } else {
                y = y + 10
              }
            }
          }
        }
        var canv = document.getElementById("cool-canvas" + count)
        var canvasImg1 = canv.toDataURL("image/png", 1.0);
        doc.addImage(canvasImg1, 'png', 50, (this.state.isAggregate.toString() == "false" ? 170 : y), 750, 300, "a" + count, 'CANVAS')
        count++
        var height = doc.internal.pageSize.height;
        let otherdata;
        if (this.state.isAggregate.toString() == "true" && (this.state.programId.length > 0 || this.state.planningUnitIdExport.length > 0 || this.state.realmCountryPlanningUnitIdExport.length > 0)) {
          otherdata =
            item.data.map(ele => [dateFormatter(ele.dt), formatter(roundARU(ele.openingBalance, 1), 0), formatter(roundARU(ele.forecastedConsumptionQty, 1), 0), formatter(roundARU(ele.actualConsumptionQty, 1), 0), formatter(roundARU(ele.finalConsumptionQty, 1), 0), (ele.shipmentInfo.length > 0 ? formatter(roundARU(ele.shipmentQty, 1), 0) : ""),
            ele.shipmentInfo.map(item1 => {
              return (
                (item1.program.code + " | ") + formatter(roundARU(item1.shipmentQty, 1)) + " | " + item1.fundingSource.code + " | " + getLabelText(item1.shipmentStatus.label, this.state.lang) + " | " + item1.procurementAgent.code + (item1.orderNo == null &&
                  item1.primeLineNo == null &&
                  item1.roNo == null &&
                  item1.roPrimeLineNo == null
                  ? " | N/A"
                  : (item1.roNo == null && item1.roPrimeLineNo == null
                    ? ""
                    : " | " + item1.roNo + "-" + item1.roPrimeLineNo) +
                  (item1.orderNo == null && item1.primeLineNo == null
                    ? ""
                    : item1.orderNo == null
                      ? ""
                      : " | " + item1.orderNo) +
                  (item1.primeLineNo == null ? "" : "-" + item1.primeLineNo)))
            })
              , formatter(ele.adjustment == 0 ? ele.regionCountForStock > 0 ? roundARU(ele.nationalAdjustment, 1) : "" : ele.regionCountForStock > 0 ? Number(roundARU(ele.nationalAdjustment, 1)) + Number(roundARU(ele.adjustment, 1)) : roundARU(ele.adjustment, 1), 0), ele.expiredStock != 0 ? formatter(roundARU(ele.expiredStock, 1), 0) : '', formatter(roundARU(ele.closingBalance, 1), 0), formatter(roundAMC(ele.amc, 0)), (this.state.isAggregate.toString() == "false" ? item.planBasedOn : ele.planBasedOn) == 1 ? formatter(roundAMC(ele.mos, 0)) : formatter(roundAMC((this.state.isAggregate.toString() == "false" ? ele.maxStock : ele.maxStockQty), 0)), ele.unmetDemand != 0 ? formatter(roundARU(ele.unmetDemand, 1), 0) : '']);
        } else {
          otherdata =
            item.data.map(ele => [dateFormatter(ele.dt), formatter(roundARU(ele.openingBalance, 1), 0), formatter(roundARU(ele.forecastedConsumptionQty, 1), 0), formatter(roundARU(ele.actualConsumptionQty, 1), 0), (ele.shipmentInfo.length > 0 ? formatter(roundARU(ele.shipmentQty, 1), 0) : ""),
            ele.shipmentInfo.map(item1 => {
              return (
                formatter(roundARU(item1.shipmentQty, 1)) + " | " + item1.fundingSource.code + " | " + getLabelText(item1.shipmentStatus.label, this.state.lang) + " | " + item1.procurementAgent.code + (item1.orderNo == null &&
                  item1.primeLineNo == null &&
                  item1.roNo == null &&
                  item1.roPrimeLineNo == null
                  ? " | N/A"
                  : (item1.roNo == null && item1.roPrimeLineNo == null
                    ? ""
                    : " | " + item1.roNo + "-" + item1.roPrimeLineNo) +
                  (item1.orderNo == null && item1.primeLineNo == null
                    ? ""
                    : item1.orderNo == null
                      ? ""
                      : " | " + item1.orderNo) +
                  (item1.primeLineNo == null ? "" : "-" + item1.primeLineNo)))
            })
              , formatter(ele.adjustment == 0 ? ele.regionCountForStock > 0 ? roundARU(ele.nationalAdjustment, 1) : "" : ele.regionCountForStock > 0 ? Number(roundARU(ele.nationalAdjustment, 1)) + Number(roundARU(ele.adjustment, 1)) : roundARU(ele.adjustment, 1), 0), ele.expiredStock != 0 ? formatter(roundARU(ele.expiredStock, 1), 0) : '', formatter(roundARU(ele.closingBalance, 1), 0), formatter(roundAMC(ele.amc, 0)), (this.state.isAggregate.toString() == "false" ? item.planBasedOn : ele.planBasedOn) == 1 ? formatter(roundAMC(ele.mos, 0)) : formatter(roundAMC((this.state.isAggregate.toString() == "false" ? ele.maxStock : ele.maxStockQty), 0)), ele.unmetDemand != 0 ? formatter(roundARU(ele.unmetDemand, 1), 0) : '']);
        }
        var header1 = [[{ content: i18n.t('static.common.month'), rowSpan: 2 },
        { content: i18n.t("static.report.stock"), colSpan: 1 },
        { content: i18n.t("static.supplyPlan.consumption"), colSpan: 2 },
        { content: i18n.t("static.shipment.shipment"), colSpan: 2 },
        { content: i18n.t("static.report.stock"), colSpan: 6 }
        ],
        [
          i18n.t('static.supplyPlan.openingBalance'),
          i18n.t('static.report.forecasted'),
          i18n.t('static.report.actual'),
          i18n.t('static.supplyPlan.qty'),
          (i18n.t('static.supplyPlan.qty') + " | " + i18n.t('static.supplyPlan.funding') + " | " + i18n.t('static.shipmentDataEntry.shipmentStatus') + " | " + (i18n.t('static.supplyPlan.procAgent')) + " | " + (i18n.t('static.mt.roNoAndPrimeLineNo')) + " | " + (i18n.t('static.mt.orderNoAndPrimeLineNo'))),
          i18n.t('static.supplyPlan.adj'),
          i18n.t('static.supplyplan.exipredStock'),
          i18n.t('static.supplyPlan.endingBalance'),
          i18n.t('static.report.amc'),
          (this.state.isAggregate.toString() == "false" ? item.planBasedOn : item.data[0].planBasedOn) == 1 ? i18n.t('static.report.mos') : i18n.t('static.supplyPlan.maxQty'),
          i18n.t('static.supplyPlan.unmetDemandStr'),
        ]];
        if (this.state.isAggregate.toString() == "true" && (this.state.programId.length > 0 || this.state.planningUnitIdExport.length > 0 || this.state.realmCountryPlanningUnitIdExport.length > 0)) {
          header1 = [[{ content: i18n.t('static.common.month'), rowSpan: 2 },
          { content: i18n.t("static.report.stock"), colSpan: 1 },
          { content: i18n.t("static.supplyPlan.consumption"), colSpan: 3 },
          { content: i18n.t("static.shipment.shipment"), colSpan: 2 },
          { content: i18n.t("static.report.stock"), colSpan: 6 }
          ],
          [
            i18n.t('static.supplyPlan.openingBalance'),
            i18n.t('static.report.forecasted'),
            i18n.t('static.report.actual'),
            i18n.t('static.stockStatus.consensus'),
            i18n.t('static.supplyPlan.qty'),
            i18n.t('static.program.programMaster') + " | " + (i18n.t('static.supplyPlan.qty') + " | " + i18n.t('static.supplyPlan.funding') + " | " + i18n.t('static.shipmentDataEntry.shipmentStatus') + " | " + (i18n.t('static.supplyPlan.procAgent')) + " | " + (i18n.t('static.mt.roNoAndPrimeLineNo')) + " | " + (i18n.t('static.mt.orderNoAndPrimeLineNo'))),
            i18n.t('static.supplyPlan.adj'),
            i18n.t('static.supplyplan.exipredStock'),
            i18n.t('static.supplyPlan.endingBalance'),
            i18n.t('static.report.amc'),
            (this.state.isAggregate.toString() == "false" ? item.planBasedOn : item.data[0].planBasedOn) == 1 ? i18n.t('static.report.mos') : i18n.t('static.supplyPlan.maxQty'),
            i18n.t('static.supplyPlan.unmetDemandStr'),
          ]];
        }
        let content = "";
        if (this.state.isAggregate.toString() == "true" && (this.state.programId.length > 0 || this.state.planningUnitIdExport.length > 0 || this.state.realmCountryPlanningUnitIdExport.length > 0)) {
          content = {
            margin: { top: 80, bottom: 70 },
            startY: height,
            head: header1,
            body: otherdata,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 52, halign: 'center' },
            headStyles: { fillColor: "#e5edf5", textColor: "#000", fontStyle: "normal" },
            columnStyles: {
              6: { cellWidth: 146.89 },
            },
            didParseCell: function (data) {
              if (data.column.index === 9 && data.row.section != "head") {
                if (item.data[data.row.index].regionCount == item.data[data.row.index].regionCountForStock) {
                  data.cell.styles.fontStyle = 'bold';
                }
              }
              if (data.column.index === 1 && data.row.section != "head") {
                if (data.row.index == 0) {
                  if (item.firstMonthRegionCount == item.firstMonthRegionCountForStock) {
                    data.cell.styles.fontStyle = 'bold';
                  }
                } else {
                  if (item.data[data.row.index - 1].regionCount == item.data[data.row.index - 1].regionCountForStock) {
                    data.cell.styles.fontStyle = 'bold';
                  }
                }
              }
            }.bind(this)
          }
        } else {
          content = {
            margin: { top: 80, bottom: 70 },
            startY: height,
            head: header1,
            body: otherdata,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 55, halign: 'center' },
            headStyles: { fillColor: "#e5edf5", textColor: "#000", fontStyle: "normal" },
            columnStyles: {
              5: { cellWidth: 156.89 },
            },
            didParseCell: function (data) {
              if (data.column.index === 8 && data.row.section != "head") {
                if (item.data[data.row.index].regionCount == item.data[data.row.index].regionCountForStock) {
                  data.cell.styles.fontStyle = 'bold';
                }
              }
              if (data.column.index === 1 && data.row.section != "head") {
                if (data.row.index == 0) {
                  if (item.firstMonthRegionCount == item.firstMonthRegionCountForStock) {
                    data.cell.styles.fontStyle = 'bold';
                  }
                } else {
                  if (item.data[data.row.index - 1].regionCount == item.data[data.row.index - 1].regionCountForStock) {
                    data.cell.styles.fontStyle = 'bold';
                  }
                }
              }
            }.bind(this)
          }
        };
        doc.autoTable(content);
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        var y = doc.lastAutoTable.finalY + 20
        if (y + 100 > height) {
          doc.addPage();
          y = 80
        }
        doc.text(i18n.t('static.program.notes'), doc.internal.pageSize.width / 9, y, {
          align: 'left'
        })
        doc.setFont('helvetica', 'normal')
        var cnt = 0
        cnt = 0
        item.coList.map(ele => {
          if (ele.notes != null && ele.notes != '') {
            cnt = cnt + 1
            if (cnt == 1) {
              y = y + 10
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(8)
              doc.text(i18n.t("static.supplyPlan.consumptionMsg"), doc.internal.pageSize.width / 9, y, {
                align: 'left'
              })
              y = y + 10
            } else {
              y = y + 5
            }
            doc.setFontSize(8)
            if (y > doc.internal.pageSize.height - 100) {
              doc.addPage();
              y = 80;
            }
            if ((this.state.programId.length > 1 && this.state.isAggregate.toString() == "true")) {
              doc.text(ele.program.code + " " + (ele.actualFlag.toString() == "true" ? moment(ele.consumptionDate).format('DD-MMM-YY') + "*" : moment(ele.consumptionDate).format('DD-MMM-YY') + ""), doc.internal.pageSize.width / 8, y, {
                align: 'left'
              })
            } else {
              doc.text((ele.actualFlag.toString() == "true" ? moment(ele.consumptionDate).format('DD-MMM-YY') + "*" : moment(ele.consumptionDate).format('DD-MMM-YY') + ""), doc.internal.pageSize.width / 8, y, {
                align: 'left'
              })
            }
            var splitTitle = doc.splitTextToSize("(" + getLabelText(ele.region.label, this.state.lang) + " | " + getLabelText(ele.dataSource.label, this.state.lang) + ") " + ele.notes.replace(/[\r\n]+/gm, " "), doc.internal.pageSize.width * 3 / 4);
            if ((this.state.programId.length > 1 && this.state.isAggregate.toString() == "true")) {
              doc.text(doc.internal.pageSize.width / 4.0, y, splitTitle);
            } else {
              doc.text(doc.internal.pageSize.width / 5.7, y, splitTitle);
            }
            for (var i = 0; i < splitTitle.length; i++) {
              if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
              } else {
                y = y + 5
              }
            }
            if (splitTitle.length > 1) {
              y = y + (5 * (splitTitle.length - 1));
            }
          }
        })
        cnt = 0
        item.shList.map(ele => {
          if (ele.notes != null && ele.notes != '') {
            cnt = cnt + 1
            if (cnt == 1) {
              y = y + 10
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(8)
              doc.text(i18n.t('static.shipment.shipment'), doc.internal.pageSize.width / 9, y, {
                align: 'left'
              })
              y = y + 10
            } else {
              y = y + 5
            }
            doc.setFontSize(8)
            if (y > doc.internal.pageSize.height - 100) {
              doc.addPage();
              y = 80;
            }
            if ((this.state.programId.length > 1 && this.state.isAggregate.toString() == "true")) {
              doc.text(ele.program.code + " " + moment(ele.receivedDate == null || ele.receivedDate == '' ? ele.expectedDeliveryDate : ele.receivedDate).format('DD-MMM-YY'), doc.internal.pageSize.width / 8, y, {
                align: 'left'
              })
            } else {
              doc.text(moment(ele.receivedDate == null || ele.receivedDate == '' ? ele.expectedDeliveryDate : ele.receivedDate).format('DD-MMM-YY'), doc.internal.pageSize.width / 8, y, {
                align: 'left'
              })
            }
            var splitTitle = doc.splitTextToSize("(" + getLabelText(ele.dataSource.label, this.state.lang) + ") " + ele.notes.replace(/[\r\n]+/gm, " "), doc.internal.pageSize.width * 3 / 4);
            if ((this.state.programId.length > 1 && this.state.isAggregate.toString() == "true")) {
              doc.text(doc.internal.pageSize.width / 4.0, y, splitTitle);
            } else {
              doc.text(doc.internal.pageSize.width / 5.7, y, splitTitle);
            }
            for (var i = 0; i < splitTitle.length; i++) {
              if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
              } else {
                y = y + 5
              }
            }
            if (splitTitle.length > 1) {
              y = y + (5 * (splitTitle.length - 1));
            }
          }
        }
        )
        cnt = 0;
        item.inList.map(ele => {
          if (ele.notes != null && ele.notes != '') {
            cnt = cnt + 1
            if (cnt == 1) {
              y = y + 10
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(8)
              doc.text(i18n.t("static.supplyPlan.inventoryMsg"), doc.internal.pageSize.width / 9, y, {
                align: 'left'
              })
              y = y + 10
            } else {
              y = y + 5
            }
            doc.setFontSize(8)
            if (y > doc.internal.pageSize.height - 100) {
              doc.addPage();
              y = 80;
            }
            if ((this.state.programId.length > 1 && this.state.isAggregate.toString() == "true")) {
              doc.text(ele.program.code + " " + (ele.actualQty !== "" && ele.actualQty != undefined && ele.actualQty != null ? moment(ele.inventoryDate).format('DD-MMM-YY') + "" : moment(ele.inventoryDate).format('DD-MMM-YY') + "*"), doc.internal.pageSize.width / 8, y, {
                align: 'left'
              })
            } else {
              doc.text((ele.actualQty !== "" && ele.actualQty != undefined && ele.actualQty != null ? moment(ele.inventoryDate).format('DD-MMM-YY') + "" : moment(ele.inventoryDate).format('DD-MMM-YY') + "*"), doc.internal.pageSize.width / 8, y, {
                align: 'left'
              })
            }
            var splitTitle = doc.splitTextToSize("(" + getLabelText(ele.region.label, this.state.lang) + " | " + getLabelText(ele.dataSource.label, this.state.lang) + ") " + ele.notes.replace(/[\r\n]+/gm, " "), doc.internal.pageSize.width * 3 / 4);
            if ((this.state.programId.length > 1 && this.state.isAggregate.toString() == "true")) {
              doc.text(doc.internal.pageSize.width / 4.0, y, splitTitle);
            } else {
              doc.text(doc.internal.pageSize.width / 5.7, y, splitTitle);
            }
            for (var i = 0; i < splitTitle.length; i++) {
              if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
              } else {
                y = y + 5
              }
            }
            if (splitTitle.length > 1) {
              y = y + (5 * (splitTitle.length - 1));
            }
          }
        })
        var ppu = this.state.planningUnits.filter(c => c.planningUnit.id == item.planningUnit.id)[0];
      }
    )
    addHeaders(doc, pageArray)
    addFooters(doc)
    doc.save(i18n.t('static.dashboard.stockstatus') + ".pdf")
  }
  /**
   * Fetches and filters data based on selected program, version, planning unit, and date range.
   */
  filterData() {
    // let programId = document.getElementById("programId").value;
    // let planningUnitIds = this.state.planningUnitIds.map(item => item.value.toString());
    // let forecastingUnitIds = this.state.forecastingUnitIds.map(item => item.value.toString());
    // let viewById = this.state.viewById;
    // let equivalencyUnitId = document.getElementById("yaxisEquUnit").value;
    // let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
    // if (programId != 0 && ((planningUnitIds.length > 0 && viewById == 1) || (forecastingUnitIds.length > 0 && viewById == 2))) {

    //   this.setState({ loading: true })
    //   var inputjson = {
    //     "programId": programId,
    //     "startDate": startDate.startOf('month').subtract(1, 'months').format('YYYY-MM-DD'),
    //     "stopDate": this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
    //     "planningUnitIds": planningUnitIds,
    //     "allPlanningUnits": false
    //   }
    //   ReportService.getStockStatusData(inputjson)
    //     .then(response => {
    //       var inventoryList = [];
    //       var consumptionList = [];
    //       var shipmentList = [];
    //       var responseData = response.data[0];
    //       let startDate = moment(new Date(this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01'));
    //       var filteredResponseData = (responseData).filter(c => moment(c.dt).format("YYYY-MM") >= moment(startDate).format("YYYY-MM"));
    //       filteredResponseData.map(c => {
    //         c.inventoryInfo.map(i => inventoryList.push(i))
    //         c.consumptionInfo.map(ci => consumptionList.push(ci))
    //         c.shipmentInfo.map(si => shipmentList.push(si))
    //       }
    //       );
    //       this.setState({
    //         firstMonthRegionCount: responseData.length > 0 ? responseData[0].regionCount : 1,
    //         firstMonthRegionCountForStock: responseData.length > 0 ? responseData[0].regionCountForStock : 0,
    //         stockStatusList: filteredResponseData,
    //         message: '', loading: false,
    //         planningUnitLabel: document.getElementById("planningUnitId").selectedOptions[0].text,
    //         inList: inventoryList,
    //         coList: consumptionList,
    //         shList: shipmentList
    //       })
    //     }).catch(
    //       error => {
    //         this.setState({
    //           stockStatusList: [], loading: false
    //         })
    //         if (error.message === "Network Error") {
    //           this.setState({
    //             message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
    //             loading: false
    //           });
    //         } else {
    //           switch (error.response ? error.response.status : "") {
    //             case 401:
    //               this.props.history.push(`/login/static.message.sessionExpired`)
    //               break;
    //             case 403:
    //               this.props.history.push(`/accessDenied`)
    //               break;
    //             case 500:
    //             case 404:
    //             case 406:
    //               this.setState({
    //                 message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
    //                 loading: false
    //               });
    //               break;
    //             case 412:
    //               this.setState({
    //                 message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
    //                 loading: false
    //               });
    //               break;
    //             default:
    //               this.setState({
    //                 message: 'static.unkownError',
    //                 loading: false
    //               });
    //               break;
    //           }
    //         }
    //       }
    //     );

    // } else if (programId == 0) {
    //   this.setState({ message: i18n.t('static.common.selectProgram'), stockStatusList: [] });
    // } else {
    //   this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), stockStatusList: [], planningUnitLabel: '' });
    // }
  }
  /**
   * Fetches the data for exporting it in CSV or PDF based on the planning units selected
   * @param {*} report This is the type of the export. 1 for PDF and 2 for CSV
   */
  exportData = (report) => {
    this.setState({
      exportModal: false
    })
    let startDate = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01');
    report == 1 ? document.getElementById("bars_div").style.display = 'block' : document.getElementById("bars_div").style.display = 'none';
    var PlanningUnitDataForExport = [];
    var PlanningUnitIdForExport;
    var ProgramIdForExport;
    var PlanningUnitIdDataForExport;
    this.setState({ loading: true })
    var inputjson = {
      "aggregate": this.state.isAggregate == "true" ? true : false, // True if you want the results to be aggregated and False if you want Individual Supply Plans for the Multi-Select information
      "programIds": this.state.programId.map(ele => ele.value), // Will be used when singleProgram is false
      "programId": this.state.programId.map(ele => ele.value), // Will be used only if aggregate is false
      "versionId": parseInt(this.state.versionId),
      "startDate": startDate.startOf('month').format('YYYY-MM-DD'),
      "stopDate": this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
      "viewBy": this.state.viewById, // 1 for PU, 2 for ARU
      "reportingUnitIds": this.state.viewById == 1 ? this.state.planningUnitIdExport.map(ele => ele.value) : this.state.realmCountryPlanningUnitIdExport.map(ele => ele.value),
      "reportingUnitId": this.state.viewById == 1 ? this.state.planningUnitIdExport.map(ele => ele.value).toString() : this.state.realmCountryPlanningUnitIdExport.map(ele => ele.value).toString(), // Will be used only if aggregate is false
      "equivalencyUnitId": this.state.yaxisEquUnit == -1 ? 0 : this.state.yaxisEquUnit
    }
    if (this.state.programId.map(ele => ele.value).length == 1 && this.state.versionId.toString().includes("Local")) {
      let programId = this.state.programId[0].value + "_v" + this.state.versionId.split(" ")[0] + "_uId_" + AuthenticationService.getLoggedInUserId();
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: '#BA0C2F'
        })
        this.hideFirstComponent()
      }.bind(this);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['programData'], 'readwrite');
        var programTransaction = transaction.objectStore('programData');
        var programRequest = programTransaction.get(programId);
        programRequest.onerror = function (event) {
          this.setState({
            message: i18n.t('static.program.errortext'),
            color: '#BA0C2F'
          })
          this.hideFirstComponent()
        }.bind(this);
        programRequest.onsuccess = function (event) {
          var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
          var ppuOS = ppuTransaction.objectStore('programPlanningUnit');
          var ppuRequest = ppuOS.getAll();
          ppuRequest.onerror = function (event) {
            this.setState({
              message: i18n.t('static.program.errortext'),
              color: '#BA0C2F'
            })
            this.hideFirstComponent()
          }.bind(this);
          ppuRequest.onsuccess = function (event) {
            let tempOutput;
            var ppuList;
            if (this.state.isAggregate.toString() == "true") {
              var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
              var puData = [];
              var planningUnitList = this.state.planningUnitIdExport;
              var consumptionList = [], inventoryList = [], shipmentList = [], supplyPlanList = [], programPlanningUnitList = [], stockStatusVerticalAggregateList = [];
              for (var pu = 0; pu < planningUnitList.length; pu++) {
                var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == planningUnitList[pu].value);
                var programJson = {};
                if (planningUnitDataFilter.length > 0) {
                  var planningUnitData = planningUnitDataFilter[0]
                  var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                  var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                  programJson = JSON.parse(programData);
                  consumptionList = consumptionList.concat(programJson.consumptionList);
                  inventoryList = inventoryList.concat(programJson.inventoryList);
                  shipmentList = shipmentList.concat(programJson.shipmentList);
                  supplyPlanList = supplyPlanList.concat(programJson.supplyPlan);
                  programPlanningUnitList.push({
                    "programId": Number(programId.split("_")[0]),
                    "planningUnitId": planningUnitList[pu].value
                  })
                } else {
                  programJson = {
                    consumptionList: [],
                    inventoryList: [],
                    shipmentList: [],
                    batchInfoList: [],
                    supplyPlan: [],
                  }
                  programPlanningUnitList.push({
                    "programId": Number(programId.split("_")[0]),
                    "planningUnitId": planningUnitList[pu].value
                  })
                }

              }
              var ppuResult = ppuRequest.result;
              var planningUnitArray = [...new Set(this.state.planningUnitIdExport).map(c => Number(c.value))];
              var ppu = ppuResult.filter(c => c.program.id == this.state.programId[0].value && planningUnitArray.includes(c.planningUnit.id));
              console.log("PPu Test@123", ppu)
              let startDate = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01').startOf('month').format('YYYY-MM-DD');
              let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
              for (let m = moment(startDate).format("YYYY-MM"); moment(m).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"); m = moment(m).add(1, "months").format("YYYY-MM")) {
                let sp = supplyPlanList.filter(x => moment(x.transDate).format("YYYY-MM") == moment(m).format("YYYY-MM"))
                var conList = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(m).format("YYYY-MM") && planningUnitArray.includes(c.planningUnit.id) && c.active.toString() == "true");
                conList.map(item => {
                  item.program = {
                    id: this.state.programId[0].value,
                    label: {
                      "label_en": this.state.programId[0].label
                    },
                    code: this.state.programId[0].label
                  }
                })
                var invList = inventoryList.filter(c => moment(c.inventoryDate).format("YYYY-MM") == moment(m).format("YYYY-MM") && planningUnitArray.includes(c.planningUnit.id) && c.active.toString() == "true");
                invList.map(item => {
                  item.program = {
                    id: this.state.programId[0].value,
                    label: {
                      "label_en": this.state.programId[0].label
                    },
                    code: this.state.programId[0].label
                  }
                })
                var shipList = shipmentList.filter(c => moment(c.receivedDate != null && c.receivedDate != "" && c.receivedDate != undefined ? c.receivedDate : c.expectedDeliveryDate).format("YYYY-MM") == moment(m).format("YYYY-MM") && planningUnitArray.includes(c.planningUnit.id) && c.active.toString() == "true" && c.accountFlag.toString() == "true");
                shipList.map(item => {
                  item.program = {
                    id: this.state.programId[0].value,
                    label: {
                      "label_en": this.state.programId[0].label
                    },
                    code: this.state.programId[0].label
                  }
                })
                var multiplier = 1;
                if (this.state.viewById == 2) {
                  multiplier = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == this.state.realmCountryPlanningUnitIdExport[0].value)[0].multiplier
                }
                shipList.map(c => {
                  c.shipmentQty = roundARU(c.shipmentQty, multiplier)
                })
                var eq = {};
                if (this.state.yaxisEquUnit != -1) {
                  eq = this.state.equivalencyUnitList.filter(c => c.id == this.state.yaxisEquUnit)[0]
                }
                var notes = "";
                ppu.map(item => {
                  if (item.notes != null && item.notes != "") {
                    if (notes == "") {
                      notes += this.state.programId[0].label + ": " + item.notes
                    } else {
                      notes += "|" + this.state.programId[0].label + ": " + item.notes
                    }
                  }

                })
                stockStatusVerticalAggregateList.push({
                  "dt": m + "-01",
                  "reportingUnit": this.state.yaxisEquUnit == -1 ? this.state.viewById == 1 ? {
                    "id": this.state.planningUnitIdExport[0].value,
                    "label": {
                      "label_en": this.state.planningUnitIdExport[0].label
                    }
                  } : {
                    "id": this.state.realmCountryPlanningUnitIdExport[0].value,
                    "label": {
                      "label_en": this.state.realmCountryPlanningUnitIdExport[0].label
                    }
                  } : {
                    "id": eq.id,
                    "label": {
                      "label_en": eq.label.label_en
                    }
                  },
                  "openingBalance": sp.reduce((sum, value) => sum + roundARUWithoutRounding((value.openingBalance), multiplier), 0),
                  "actualConsumption": sp.filter(x => x.actualFlag).length == sp.length,
                  "actualConsumptionQty": conList.filter(c => c.actualFlag.toString() == "true").length > 0 ? conList.filter(c => c.actualFlag.toString() == "true").reduce((sum, value) => sum + roundARUWithoutRounding((value.consumptionQty), multiplier), 0) : null,
                  "forecastedConsumptionQty": conList.filter(c => c.actualFlag.toString() == "false").length > 0 ? conList.filter(c => c.actualFlag.toString() == "false").reduce((sum, value) => sum + roundARUWithoutRounding((value.consumptionQty), multiplier), 0) : null,
                  "finalConsumptionQty": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.consumptionQty, multiplier), 0),
                  "shipmentQty": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.shipmentTotalQty, multiplier), 0),
                  "adjustment": invList.filter(c => c.adjustmentQty != null).length > 0 ? invList.reduce((sum, value) => sum + roundARUWithoutRounding(value.adjustmentQty, multiplier), 0) : null,
                  "expiredStock": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.expiredStock, multiplier), 0),
                  "closingBalance": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.closingBalance, multiplier), 0),
                  "amc": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.amc, multiplier), 0),
                  "mos": sp.reduce((sum, value) => sum + value.closingBalance, 0) / sp.reduce((sum, value) => sum + value.amc, 0),
                  "minStockMos": ppu.reduce((sum, value) => sum + value.minMonthsOfStock, 0) / ppu.length,
                  "maxStockMos": Number(ppu.reduce((sum, value) => sum + value.minMonthsOfStock, 0) / ppu.length) + Number(ppu.reduce((sum, value) => sum + value.reorderFrequencyInMonths, 0) / ppu.length),
                  "minStockQty": ppu.reduce((sum, value) => sum + value.minQty, 0) / ppu.length,
                  "maxStockQty": Number(sp.reduce((sum, value) => sum + roundARU(value.amc, multiplier), 0)) * Number(Number(ppu.reduce((sum, value) => sum + value.minMonthsOfStock, 0) / ppu.length) + Number(ppu.reduce((sum, value) => sum + value.reorderFrequencyInMonths, 0) / ppu.length)),
                  "unmetDemand": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.unmetDemand, multiplier), 0),
                  "regionCount": sp[0].regionCount,
                  "regionCountForStock": sp[0].regionCountForStock,
                  "nationalAdjustment": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.nationalAdjustment, multiplier), 0),
                  "planBasedOn": ppu.some(c => c.planBasedOn == 1) ? 1 : 2,
                  "ppuNotes": ppu.length > 1 ? (notes == "" ? null : notes) : ((ppu[0].notes == "" || ppu[0].notes == null) ? null : this.state.programId[0].label + ": " + ppu[0].notes),
                  "consumptionInfo": conList,
                  "inventoryInfo": invList,
                  "shipmentInfo": shipList
                })
              }
              var stockStatusVerticalAggregateListJson = {
                "programPlanningUnitList": programPlanningUnitList,
                "stockStatusVerticalAggregateList": stockStatusVerticalAggregateList
              }
              var tempKey = this.state.programId.map(ele => ele.value).toString() + "~" + (this.state.viewById == 1 ? this.state.planningUnitIdExport.map(ele => ele.value).toString() : this.state.realmCountryPlanningUnitIdExport.map(ele => ele.value).toString());
              tempOutput = {
                [tempKey]: stockStatusVerticalAggregateListJson.stockStatusVerticalAggregateList
              }
              ppuList = stockStatusVerticalAggregateListJson.programPlanningUnitList;
            } else {
              var stockStatusVerticalAggregateListJson = {};
              var planningUnitList = this.state.planningUnitIdExport;
              var ppuResult = ppuRequest.result;
              var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
              var eq = {};
              if (this.state.yaxisEquUnit != -1) {
                eq = this.state.equivalencyUnitList.filter(c => c.id == this.state.yaxisEquUnit)[0]
              }
              for (var pu = 0; pu < planningUnitList.length; pu++) {
                var ppu = ppuResult.filter(c => c.planningUnit.id == planningUnitList[pu].value);
                var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == planningUnitList[pu].value);
                var programJson = {};
                if (planningUnitDataFilter.length > 0) {
                  var planningUnitData = planningUnitDataFilter[0]
                  var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                  var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                  programJson = JSON.parse(programData);
                  consumptionList = programJson.consumptionList;
                  inventoryList = programJson.inventoryList;
                  shipmentList = programJson.shipmentList;
                  supplyPlanList = programJson.supplyPlan;
                } else {
                  programJson = {
                    consumptionList: [],
                    inventoryList: [],
                    shipmentList: [],
                    batchInfoList: [],
                    supplyPlan: [],
                  }
                }
                let startDate = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01').startOf('month').format('YYYY-MM-DD');
                let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
                var conList = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM") && moment(c.consumptionDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM") && c.active.toString() == "true");
                conList.map(item => {
                  item.program = {
                    id: this.state.programId[0].value,
                    label: {
                      "label_en": this.state.programId[0].label
                    },
                    code: this.state.programId[0].label
                  }
                })
                var invList = inventoryList.filter(c => moment(c.inventoryDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM") && moment(c.inventoryDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM") && c.active.toString() == "true");
                invList.map(item => {
                  item.program = {
                    id: this.state.programId[0].value,
                    label: {
                      "label_en": this.state.programId[0].label
                    },
                    code: this.state.programId[0].label
                  }
                })
                var stockStatusVertical = [];
                for (let m = moment(startDate).format("YYYY-MM"); moment(m).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"); m = moment(m).add(1, "months").format("YYYY-MM")) {
                  let sp = supplyPlanList.filter(x => moment(x.transDate).format("YYYY-MM") == moment(m).format("YYYY-MM"))
                  var shipList = shipmentList.filter(c => moment(c.receivedDate != null && c.receivedDate != "" && c.receivedDate != undefined ? c.receivedDate : c.expectedDeliveryDate).format("YYYY-MM") == moment(m).format("YYYY-MM") && c.planningUnit.id == planningUnitList[pu].value && c.active.toString() == "true" && c.accountFlag.toString() == "true");
                  shipList.map(item => {
                    item.program = {
                      id: this.state.programId[0].value,
                      label: {
                        "label_en": this.state.programId[0].label
                      },
                      code: this.state.programId[0].label
                    }
                  })
                  var multiplier = 1;
                  var conListPU = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(m).format("YYYY-MM") && c.planningUnit.id == planningUnitList[pu].value && c.active.toString() == "true");
                  var invListPU = inventoryList.filter(c => moment(c.inventoryDate).format("YYYY-MM") == moment(m).format("YYYY-MM") && c.planningUnit.id == planningUnitList[pu].value && c.active.toString() == "true");
                  stockStatusVertical.push(
                    {
                      "dt": m + "-01",
                      "openingBalance": sp.reduce((sum, value) => sum + roundARUWithoutRounding((value.openingBalance), multiplier), 0),
                      "actualConsumption": sp.filter(x => x.actualFlag).length == sp.length,
                      "actualConsumptionQty": conListPU.filter(c => c.actualFlag.toString() == "true").length > 0 ? conListPU.filter(c => c.actualFlag.toString() == "true").reduce((sum, value) => sum + roundARUWithoutRounding((value.consumptionQty), multiplier), 0) : null,
                      "forecastedConsumptionQty": conListPU.filter(c => c.actualFlag.toString() == "false").length > 0 ? conListPU.filter(c => c.actualFlag.toString() == "false").reduce((sum, value) => sum + roundARUWithoutRounding((value.consumptionQty), multiplier), 0) : null,
                      "finalConsumptionQty": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.consumptionQty, multiplier), 0),
                      "shipmentQty": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.shipmentTotalQty, multiplier), 0),
                      "adjustment": invListPU.filter(c => c.adjustmentQty != null).length > 0 ? invListPU.reduce((sum, value) => sum + roundARUWithoutRounding(value.adjustmentQty, multiplier), 0) : null,
                      "expiredStock": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.expiredStock, multiplier), 0),
                      "closingBalance": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.closingBalance, multiplier), 0),
                      "amc": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.amc, multiplier), 0),
                      "mos": sp.reduce((sum, value) => sum + value.closingBalance, 0) / sp.reduce((sum, value) => sum + value.amc, 0),
                      "minMos": ppu[0].minMonthsOfStock,
                      "maxMos": Number(ppu[0].minMonthsOfStock) + Number(ppu[0].reorderFrequencyInMonths),
                      "unmetDemand": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.unmetDemand, multiplier), 0),
                      "regionCount": sp[0].regionCount,
                      "regionCountForStock": sp[0].regionCountForStock,
                      "nationalAdjustment": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.nationalAdjustment, multiplier), 0),
                      "minStock": ppu[0].planBasedOn == 1 ? Number(sp.reduce((sum, value) => sum + roundARU(value.amc, multiplier), 0)) * Number(ppu.reduce((sum, value) => sum + value.minMonthsOfStock, 0) / ppu.length) : (ppu[0].minQty),
                      "maxStock": ppu[0].planBasedOn == 1 ? Number(sp.reduce((sum, value) => sum + roundARU(value.amc, multiplier), 0)) * Number(Number(ppu.reduce((sum, value) => sum + value.minMonthsOfStock, 0) / ppu.length) + Number(ppu.reduce((sum, value) => sum + value.reorderFrequencyInMonths, 0) / ppu.length)) : (Number(sp.reduce((sum, value) => sum + roundARU(value.amc, multiplier), 0)) * ppu[0].minQty),
                      "shipmentInfo": shipList
                    }
                  )
                }
                stockStatusVerticalAggregateListJson[this.state.programId[0].value + "~" + planningUnitList[pu].value] = {
                  "reportingUnit": this.state.yaxisEquUnit == -1 ? this.state.viewById == 1 ? {
                    "id": this.state.planningUnitIdExport[0].value,
                    "label": {
                      "label_en": this.state.planningUnitIdExport[0].label
                    }
                  } : {
                    "id": this.state.realmCountryPlanningUnitIdExport[0].value,
                    "label": {
                      "label_en": this.state.realmCountryPlanningUnitIdExport[0].label
                    }
                  } : {
                    "id": eq.id,
                    "label": {
                      "label_en": eq.label.label_en
                    }
                  },
                  "reorderFrequencyInMonths": ppu[0].reorderFrequencyInMonths,
                  "minMonthsOfStock": ppu[0].minMonthsOfStock,
                  "localProcurementLeadTime": ppu[0].localProcurementLeadTime,
                  "shelfLife": ppu[0].shelfLife,
                  "monthsInFutureForAmc": ppu[0].monthsInFutureForAmc,
                  "monthsInPastForAmc": ppu[0].monthsInPastForAmc,
                  "planBasedOn": ppu[0].planBasedOn,
                  "minQty": ppu[0].minQty,
                  "distributionLeadTime": ppu[0].distributionLeadTime,
                  "notes": ppu[0].notes,
                  "consumptionInfo": conList,
                  "inventoryInfo": invList,
                  "stockStatusVertical": stockStatusVertical,
                  "ppuNotes": ppu[0].notes
                }
              }
              tempOutput = stockStatusVerticalAggregateListJson;
            }
            var tempOutputIndex = Object.keys(tempOutput);
            var tempOutputProgramId = tempOutputIndex.map(a => a.split("~")[0]);
            var tempOutputPlanningUnitId = tempOutputIndex.map(a => a.split("~")[1]);
            tempOutput = Object.values(tempOutput);
            // var sortedPlanningUnitData = this.state.planningUnitList.filter(c => this.state.planningUnitId.map(x => x.value).includes(c.id)).sort(function (a, b) {
            //   a = a.label.toLowerCase();
            //   b = b.label.toLowerCase();
            //   return a < b ? -1 : a > b ? 1 : 0;
            // });
            // First, create an array of indices to keep track of sorting order
            const indices = tempOutput.map((_, index) => index);

            // Sort `indices` based on the corresponding values in `programList` and `planningUnitList`
            indices.sort((indexA, indexB) => {
              const programA = this.state.programs.filter(c => c.programId == tempOutputProgramId[indexA])[0].programCode.toString();
              const programB = this.state.programs.filter(c => c.programId == tempOutputProgramId[indexB])[0].programCode.toString()

              const planningUnitA = getLabelText(tempOutput[indexA].reportingUnit.label, this.state.lang);
              const planningUnitB = getLabelText(tempOutput[indexB].reportingUnit.label, this.state.lang);

              // First compare by program
              const programComparison = programA.localeCompare(programB);

              // If programs are the same, compare by planning unit
              if (programComparison === 0) {
                return planningUnitA.localeCompare(planningUnitB);
              }

              return programComparison;
            });

            // Use the sorted indices to rearrange `tempOutput`, `programList`, and `planningUnitList`
            const sortedTempOutput = indices.map(index => tempOutput[index]);
            const sortedProgramList = indices.map(index => tempOutputProgramId[index]);
            const sortedPlanningUnitList = indices.map(index => tempOutputPlanningUnitId[index]);
            sortedTempOutput.map((plannningUnitItem, outputIndex) => {
              var planningUnitItemFilter = plannningUnitItem; //.filter(c => c.reportingUnit.id == plannningUnitItem.value);
              let startDateForFilter = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01');
              var filteredPlanningUnitData = this.state.isAggregate.toString() == "true" ? plannningUnitItem : plannningUnitItem.stockStatusVertical; //planningUnitItemFilter.filter(c => moment(c.dt).format("YYYY-MM") >= moment(startDateForFilter).format("YYYY-MM"));
              var datasets = [
                {
                  label: i18n.t('static.supplyplan.exipredStock'),
                  yAxisID: 'A',
                  type: 'line',
                  stack: 7,
                  order: 0,
                  data: filteredPlanningUnitData.map((item, index) => (item.expiredStock > 0 ? item.expiredStock : null)),
                  fill: false,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1,
                  showLine: false,
                  pointStyle: 'triangle',
                  pointBackgroundColor: '#ED8944',
                  pointBorderColor: '#212721',
                  pointRadius: 10
                },
                {
                  type: "line",
                  yAxisID: 'A',
                  label: i18n.t('static.supplyPlan.consumption'),
                  backgroundColor: 'transparent',
                  borderColor: '#ba0c2f',
                  order: 7,
                  ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                  },
                  lineTension: 0,
                  showInLegend: true,
                  pointStyle: 'line',
                  pointRadius: 0,
                  yValueFormatString: "$#,##0",
                  data: filteredPlanningUnitData.map((item, index) => (item.finalConsumptionQty))
                },
                {
                  label: (this.state.isAggregate.toString() == "true" && (this.state.programId.length > 0 || this.state.planningUnitIdExport.length > 0 || this.state.realmCountryPlanningUnitIdExport.length > 0)) ? i18n.t('static.stockStatus.consensusConsumption') : i18n.t('static.report.actualConsumption'),
                  yAxisID: 'A',
                  type: 'line',
                  stack: 7,
                  order: 7,
                  data: filteredPlanningUnitData.map((item, index) => (item.actualConsumption ? item.finalConsumptionQty : null)),
                  fill: false,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1,
                  showLine: false,
                  pointStyle: 'point',
                  pointBackgroundColor: '#ba0c2f',
                  pointBorderColor: '#ba0c2f',
                  pointRadius: 3
                },
                {
                  label: i18n.t('static.report.stock'),
                  yAxisID: 'A',
                  type: 'line',
                  stack: 7,
                  order: 7,
                  borderColor: '#cfcdc9',
                  ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                  },
                  lineTension: 0,
                  pointStyle: 'circle',
                  pointRadius: 0,
                  showInLegend: true,
                  data: filteredPlanningUnitData.map((item, index) => (item.closingBalance))
                },
                {
                  type: "line",
                  yAxisID: (this.state.isAggregate.toString() == "false" ? plannningUnitItem.planBasedOn : filteredPlanningUnitData[0].planBasedOn) == 1 ? 'B' : 'A',
                  label: (this.state.isAggregate.toString() == "false" ? plannningUnitItem.planBasedOn : filteredPlanningUnitData[0].planBasedOn) == 1 ? i18n.t('static.report.minmonth') : i18n.t('static.product.minQuantity'),
                  backgroundColor: 'rgba(255,193,8,0.2)',
                  borderColor: '#59cacc',
                  borderStyle: 'dotted',
                  order: 7,
                  borderDash: [10, 10],
                  fill: '+1',
                  backgroundColor: 'transparent',
                  ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                  },
                  showInLegend: true,
                  pointStyle: 'line',
                  pointRadius: 0,
                  yValueFormatString: "$#,##0",
                  lineTension: 0,
                  data: this.state.isAggregate.toString() == "true" ? (filteredPlanningUnitData.map((item, index) => ((filteredPlanningUnitData[0].planBasedOn == 1 ? roundAMC(item.minStockMos, 1) : roundAMC(item.minStockQty, 1))))) : (filteredPlanningUnitData.map((item, index) => ((plannningUnitItem.planBasedOn == 1 ? item.minMos : item.minStock))))
                }
                , {
                  type: "line",
                  yAxisID: (this.state.isAggregate.toString() == "false" ? plannningUnitItem.planBasedOn : filteredPlanningUnitData[0].planBasedOn) == 1 ? 'B' : 'A',
                  label: (this.state.isAggregate.toString() == "false" ? plannningUnitItem.planBasedOn : filteredPlanningUnitData[0].planBasedOn) == 1 ? i18n.t('static.report.maxmonth') : i18n.t('static.supplyPlan.maxQty'),
                  backgroundColor: 'rgba(0,0,0,0)',
                  borderColor: '#59cacc',
                  order: 7,
                  borderStyle: 'dotted',
                  backgroundColor: 'transparent',
                  borderDash: [10, 10],
                  fill: true,
                  ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                  },
                  lineTension: 0,
                  pointStyle: 'line',
                  pointRadius: 0,
                  showInLegend: true,
                  yValueFormatString: "$#,##0",
                  data: this.state.isAggregate.toString() == "true" ? (filteredPlanningUnitData.map((item, index) => ((filteredPlanningUnitData[0].planBasedOn == 1 ? roundAMC(item.maxStockMos, 1) : roundAMC(item.maxStock, 1))))) : (filteredPlanningUnitData.map((item, index) => ((plannningUnitItem.planBasedOn == 1 ? item.maxMos : roundAMC(item.maxStock, 1)))))
                }
              ];
              if ((this.state.isAggregate.toString() == "false" ? plannningUnitItem.planBasedOn : filteredPlanningUnitData[0].planBasedOn) == 1) {
                datasets.push({
                  type: "line",
                  yAxisID: 'B',
                  label: i18n.t('static.report.mos'),
                  borderColor: '#118b70',
                  backgroundColor: 'transparent',
                  ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                  },
                  lineTension: 0,
                  order: 7,
                  showInLegend: true,
                  pointStyle: 'line',
                  pointRadius: 0,
                  yValueFormatString: "$#,##0",
                  data: filteredPlanningUnitData.map((item, index) => (roundN(item.mos)))
                })
              }
              var graphLabel = "";
              var height = 400;
              if (this.state.isAggregate.toString() == "true") {
                var reportingUnitList = this.state.viewById == 1 ? this.state.planningUnitIdExport : this.state.realmCountryPlanningUnitIdExport;
                graphLabel = this.state.programId != undefined && reportingUnitList != undefined && this.state.programId.length > 0 && reportingUnitList.length > 0 ? entityname1 + " - " + (this.state.programId.map(ele => ele.label).toString() + " - " + reportingUnitList.map(ele => ele.label).toString()) : entityname1;
                var count = 0;
                var programCount = 0;
                var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
                var newDatasetArray = [];
                var graphAggregatedBy = this.state.graphAggregatedBy;
                this.state.programId.map((e, i) => {
                  reportingUnitList.map((r, j) => {
                    var viewBy = this.state.viewById;
                    var planningUnitId = "";
                    if (viewBy == 1) {
                      planningUnitId = r.value;
                    } else {
                      var fuId = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == r.value)[0].forecastingUnitId;
                      planningUnitId = this.state.planningUnitListAll.filter(c => c.forecastingUnitId == fuId)[0].id;
                    }
                    if (ppuList.filter(c => c.programId == e.value && c.planningUnitId == planningUnitId).length > 0) {
                      programCount += 1;
                      if (count >= 10) {
                        count = 0;
                      }
                      newDatasetArray.push({
                        label: reportingUnitList.length > 1 ? this.state.viewById == 2 ? (e.label + " - " + r.label + " | " + r.value) : (e.label + " - " + r.label) : (e.label),
                        yAxisID: 'A',
                        stack: 1,
                        order: 1,
                        programId: graphAggregatedBy == 1 ? e.value : r.value,
                        programLabel: graphAggregatedBy == 1 ? e.label : r.label,
                        backgroundColor: colourArray[count],
                        borderColor: colourArray[count],
                        pointBackgroundColor: colourArray[count],
                        pointBorderColor: colourArray[count],
                        pointHoverBackgroundColor: colourArray[count],
                        pointHoverBorderColor: colourArray[count],
                        data: filteredPlanningUnitData.map((item, index) => {
                          let count = 0;
                          (item.shipmentInfo.map((ele, index) => {
                            (ele.program.id == e.value && ele.planningUnit.id == planningUnitId) ? count = count + Number(ele.shipmentQty) : count = count
                          }))
                          return count
                        })
                      })
                      count += 1;
                    }
                  })
                })
                newDatasetArray = newDatasetArray.filter(c => c.data.some(c => c != 0));
                if (this.state.yaxisEquUnit != -1 && (graphAggregatedBy == 1 || graphAggregatedBy == 2)) {
                  var count = 0;
                  var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
                  const combinedDataset = newDatasetArray.reduce((acc, item) => {
                    const existingItem = acc.find((entry) => entry.programId === item.programId);

                    if (existingItem) {
                      // Sum the data arrays if the programId already exists
                      existingItem.data = existingItem.data.map((value, index) =>
                        value + (item.data[index] || 0)
                      );
                    } else {
                      if (count >= 10) {
                        count = 0;
                      }
                      item.label = item.programLabel;
                      item.backgroundColor = colourArray[count];
                      item.borderColor = colourArray[count];
                      item.pointBackgroundColor = colourArray[count];
                      item.pointBorderColor = colourArray[count];
                      item.pointHoverBackgroundColor = colourArray[count];
                      item.pointHoverBorderColor = colourArray[count];
                      // Add a new entry for the programId if it doesn't exist in the accumulator
                      acc.push({ ...item });
                      count += 1;
                    }

                    return acc;
                  }, []);
                  datasets = datasets.concat(combinedDataset);
                } else {
                  var count = 0;
                  var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
                  newDatasetArray.map(item => {
                    if (count >= 10) {
                      count = 0;
                    }
                    item.backgroundColor = colourArray[count];
                    item.borderColor = colourArray[count];
                    item.pointBackgroundColor = colourArray[count];
                    item.pointBorderColor = colourArray[count];
                    item.pointHoverBackgroundColor = colourArray[count];
                    item.pointHoverBorderColor = colourArray[count];
                    count += 1;
                  })

                  const smallScreen = window.matchMedia('(max-width: 768px)');
                  const mediumScreen = window.matchMedia('(min-width: 769px) and (max-width: 1366px)');
                  const largeScreen = window.matchMedia('(min-width: 1367px) and (max-width: 1919px)');
                  const extraLargeScreen = window.matchMedia('(min-width: 1920px)');

                  if (newDatasetArray.length > 10) {
                    if (extraLargeScreen.matches) {
                      height = 400 + (10 * newDatasetArray.length);
                    } else if (largeScreen.matches) {
                      height = 400 + (12 * newDatasetArray.length);
                    } else if (mediumScreen.matches) {
                      height = 400 + (16 * newDatasetArray.length);
                    } else if (smallScreen.matches) {
                      height = 400 + (21 * newDatasetArray.length);
                    }
                  }
                  datasets = datasets.concat(newDatasetArray);
                }
              } else {
                graphLabel = entityname1 + " - " + (this.state.programs.filter(c => c.programId == sortedProgramList[outputIndex])[0].programCode.toString() + " - " + getLabelText(planningUnitItemFilter.reportingUnit.label, this.state.lang));
                datasets.push({
                  label: i18n.t('static.supplyPlan.delivered'),
                  yAxisID: 'A',
                  stack: 1,
                  order: 1,
                  backgroundColor: '#002f6c',
                  borderColor: '#002f6c',
                  pointBackgroundColor: '#002f6c',
                  pointBorderColor: '#002f6c',
                  pointHoverBackgroundColor: '#002f6c',
                  pointHoverBorderColor: '#002f6c',
                  data: filteredPlanningUnitData.map((item, index) => {
                    let count = 0;
                    (item.shipmentInfo.map((ele, index) => {
                      ele.shipmentStatus.id == 7 ? count = count + ele.shipmentQty : count = count
                    }))
                    return count
                  })
                });
                datasets.push({
                  label: i18n.t('static.supplyPlan.shipped'),
                  yAxisID: 'A',
                  stack: 1,
                  order: 1,
                  backgroundColor: '#49A4A1',
                  borderColor: '#49A4A1',
                  pointBackgroundColor: '#49A4A1',
                  pointBorderColor: '#49A4A1',
                  pointHoverBackgroundColor: '#49A4A1',
                  pointHoverBorderColor: '#49A4A1',
                  data: filteredPlanningUnitData.map((item, index) => {
                    let count = 0;
                    (item.shipmentInfo.map((ele, index) => {
                      (ele.shipmentStatus.id == 5 || ele.shipmentStatus.id == 6) ? count = count + ele.shipmentQty : count = count
                    }))
                    return count
                  })
                });
                datasets.push({
                  label: i18n.t('static.supplyPlan.approved'),
                  yAxisID: 'A',
                  stack: 1,
                  order: 1,
                  backgroundColor: '#0067B9',
                  borderColor: '#0067B9',
                  pointBackgroundColor: '#0067B9',
                  pointBorderColor: '#0067B9',
                  pointHoverBackgroundColor: '#0067B9',
                  pointHoverBorderColor: '#0067B9',
                  data: filteredPlanningUnitData.map((item, index) => {
                    let count = 0;
                    (item.shipmentInfo.map((ele, index) => {
                      (ele.shipmentStatus.id == 3 || ele.shipmentStatus.id == 4) ? count = count + ele.shipmentQty : count = count
                    }))
                    return count
                  })
                });
                datasets.push({
                  label: i18n.t('static.supplyPlan.planned'),
                  backgroundColor: '#A7C6ED',
                  borderColor: '#A7C6ED',
                  pointBackgroundColor: '#A7C6ED',
                  pointBorderColor: '#A7C6ED',
                  pointHoverBackgroundColor: '#A7C6ED',
                  pointHoverBorderColor: '#A7C6ED',
                  yAxisID: 'A',
                  stack: 1,
                  order: 1,
                  data: filteredPlanningUnitData.map((item, index) => {
                    let count = 0;
                    (item.shipmentInfo.map((ele, index) => {
                      (ele.shipmentStatus.id == 1 || ele.shipmentStatus.id == 2 || ele.shipmentStatus.id == 9) ? count = count + ele.shipmentQty : count = count
                    }))
                    return count
                  })
                });
              }
              // const mediaQuery = window.matchMedia('(min-width: 1920px)')
              // if (programCount > 10) {
              //   if (mediaQuery.matches) {
              //     height = 400 + (10 * programCount);
              //   } else {
              //     height = 400 + (21 * programCount);
              //   }
              // }
              var bar = {
                labels: filteredPlanningUnitData.map((item, index) => (dateFormatter(item.dt))),
                datasets: datasets,
              };
              var chartOptions = {
                title: {
                  display: false,
                  text: entityname1
                },
                scales: {
                  yAxes: [{
                    id: 'A',
                    position: 'left',
                    // stacked: true,
                    scaleLabel: {
                      labelString: i18n.t('static.shipment.qty'),
                      display: true,
                      fontSize: "12",
                      fontColor: 'black'
                    },
                    // stacked: true,
                    ticks: {
                      beginAtZero: true,
                      fontColor: 'black',
                      callback: function (value) {
                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                          x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return x1 + x2;
                      }
                    }, gridLines: {
                      color: 'rgba(171,171,171,1)',
                      lineWidth: 0
                    }
                  }
                    , {
                    id: 'B',
                    position: 'right',
                    scaleLabel: {
                      labelString: i18n.t('static.supplyPlan.monthsOfStock'),
                      fontColor: 'black',
                      display: true,
                    },
                    ticks: {
                      beginAtZero: true,
                      fontColor: 'black',
                      callback: function (value) {
                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                          x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return x1 + x2;
                      }
                    },
                    gridLines: {
                      color: 'rgba(171,171,171,1)',
                      lineWidth: 0
                    }
                  }],
                  xAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: i18n.t('static.common.month'),
                      fontColor: 'black',
                      fontStyle: "normal",
                      fontSize: "12"
                    },
                    stacked: true,
                    ticks: {
                      fontColor: 'black',
                      fontStyle: "normal",
                      fontSize: "12"
                    },
                    gridLines: {
                      color: 'rgba(171,171,171,1)',
                      lineWidth: 0
                    }
                  }]
                },
                tooltips: {
                  enabled: false,
                  custom: CustomTooltips,
                  callbacks: {
                    label: function (tooltipItem, data) {
                      if (data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] != 0) {
                        let label = data.labels[tooltipItem.index];
                        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                          x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                      } else {
                        return false
                      }
                    }
                  }
                },
                maintainAspectRatio: false,
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                  }
                }
              }
              var data = this.state.isAggregate.toString() == "true" ? planningUnitItemFilter : planningUnitItemFilter.stockStatusVertical;
              let startDate = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01');
              var filteredData = data.filter(c => moment(c.dt).format("YYYY-MM") >= moment(startDate).format("YYYY-MM"));
              var planningUnit = this.state.planningUnitListAll.filter(e => e.id == sortedPlanningUnitList[outputIndex])[0];
              var conList = [];
              var invList = [];
              var shipList = [];
              if (this.state.isAggregate.toString() == "true") {
                filteredData.map(c => c.consumptionInfo.map(ci => conList.push(ci)));
                filteredData.map(c => c.inventoryInfo.map(ii => invList.push(ii)));
              } else {
                conList = planningUnitItemFilter.consumptionInfo;
                invList = planningUnitItemFilter.inventoryInfo;
              }
              filteredData.map(c => c.shipmentInfo.map(si => shipList.push(si)));
              var planningUnitexport = {
                planningUnit: planningUnit,
                firstMonthRegionCount: data.length > 0 ? data[0].regionCount : 1,
                firstMonthRegionCountForStock: data.length > 0 ? data[0].regionCountForStock : 0,
                data: filteredData,
                bar: bar,
                chartOptions: chartOptions,
                height: height,
                inList: invList,
                coList: conList,
                shList: shipList,
                planBasedOn: this.state.isAggregate.toString() == "false" ? planningUnitItemFilter.planBasedOn : "",
                programId: sortedProgramList[outputIndex],
                PlanningUnitIdDataForExport: planningUnitItemFilter,
                reportBy: this.state.viewById == 1 ? planningUnit : this.state.realmCountryPlanningUnitListAll.filter(c => c.id == sortedPlanningUnitList[outputIndex])[0]
              }
              PlanningUnitDataForExport.push(planningUnitexport)
              PlanningUnitIdForExport = sortedPlanningUnitList[outputIndex]
              ProgramIdForExport = sortedProgramList[outputIndex]
              PlanningUnitIdDataForExport = this.state.isAggregate.toString() == "false" ? planningUnitItemFilter : "";
            })
            this.setState({
              PlanningUnitDataForExport: PlanningUnitDataForExport,
              PlanningUnitIdForExport: PlanningUnitIdForExport,
              ProgramIdForExport: ProgramIdForExport,
              PlanningUnitIdDataForExport: PlanningUnitIdDataForExport,
              message: '', loading: false
            }, () => {
              setTimeout(() => {
                if (report == 1) {
                  this.exportPDF()
                  document.getElementById("bars_div").style.display = 'none';
                } else {
                  this.exportCSV()
                }
              }, 2000)
            })
          }.bind(this)
        }.bind(this)
      }.bind(this)

    } else {
      ReportService.getStockStatusData(inputjson)
        .then(response => {
          let tempOutput;
          var ppuList;
          if (this.state.isAggregate.toString() == "true") {
            var tempKey = this.state.programId.map(ele => ele.value).toString() + "~" + (this.state.viewById == 1 ? this.state.planningUnitIdExport.map(ele => ele.value).toString() : this.state.realmCountryPlanningUnitIdExport.map(ele => ele.value).toString());
            tempOutput = {
              [tempKey]: response.data.stockStatusVerticalAggregateList
            }
            ppuList = response.data.programPlanningUnitList;
          } else {
            tempOutput = response.data
          }
          var tempOutputIndex = Object.keys(tempOutput);
          var tempOutputProgramId = tempOutputIndex.map(a => a.split("~")[0]);
          var tempOutputPlanningUnitId = tempOutputIndex.map(a => a.split("~")[1]);
          tempOutput = Object.values(tempOutput);
          // var sortedPlanningUnitData = this.state.planningUnitList.filter(c => this.state.planningUnitId.map(x => x.value).includes(c.id)).sort(function (a, b) {
          //   a = a.label.toLowerCase();
          //   b = b.label.toLowerCase();
          //   return a < b ? -1 : a > b ? 1 : 0;
          // });
          // First, create an array of indices to keep track of sorting order
          const indices = tempOutput.map((_, index) => index);

          // Sort `indices` based on the corresponding values in `programList` and `planningUnitList`
          indices.sort((indexA, indexB) => {
            const programA = this.state.programs.filter(c => c.programId == tempOutputProgramId[indexA])[0].programCode.toString();
            const programB = this.state.programs.filter(c => c.programId == tempOutputProgramId[indexB])[0].programCode.toString()

            const planningUnitA = getLabelText(tempOutput[indexA].reportingUnit.label, this.state.lang);
            const planningUnitB = getLabelText(tempOutput[indexB].reportingUnit.label, this.state.lang);

            // First compare by program
            const programComparison = programA.localeCompare(programB);

            // If programs are the same, compare by planning unit
            if (programComparison === 0) {
              return planningUnitA.localeCompare(planningUnitB);
            }

            return programComparison;
          });

          // Use the sorted indices to rearrange `tempOutput`, `programList`, and `planningUnitList`
          const sortedTempOutput = indices.map(index => tempOutput[index]);
          const sortedProgramList = indices.map(index => tempOutputProgramId[index]);
          const sortedPlanningUnitList = indices.map(index => tempOutputPlanningUnitId[index]);
          sortedTempOutput.map((plannningUnitItem, outputIndex) => {
            var planningUnitItemFilter = plannningUnitItem; //.filter(c => c.reportingUnit.id == plannningUnitItem.value);
            let startDateForFilter = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01');
            var filteredPlanningUnitData = this.state.isAggregate.toString() == "true" ? plannningUnitItem : plannningUnitItem.stockStatusVertical; //planningUnitItemFilter.filter(c => moment(c.dt).format("YYYY-MM") >= moment(startDateForFilter).format("YYYY-MM"));
            var datasets = [
              {
                label: i18n.t('static.supplyplan.exipredStock'),
                yAxisID: 'A',
                type: 'line',
                stack: 7,
                order: 0,
                data: filteredPlanningUnitData.map((item, index) => (item.expiredStock > 0 ? item.expiredStock : null)),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                showLine: false,
                pointStyle: 'triangle',
                pointBackgroundColor: '#ED8944',
                pointBorderColor: '#212721',
                pointRadius: 10
              },
              {
                type: "line",
                yAxisID: 'A',
                label: i18n.t('static.supplyPlan.consumption'),
                backgroundColor: 'transparent',
                borderColor: '#ba0c2f',
                order: 7,
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent',
                },
                lineTension: 0,
                showInLegend: true,
                pointStyle: 'line',
                pointRadius: 0,
                yValueFormatString: "$#,##0",
                data: filteredPlanningUnitData.map((item, index) => (item.finalConsumptionQty))
              },
              {
                label: (this.state.isAggregate.toString() == "true" && (this.state.programId.length > 0 || this.state.planningUnitIdExport.length > 0 || this.state.realmCountryPlanningUnitIdExport.length > 0)) ? i18n.t('static.stockStatus.consensusConsumption') : i18n.t('static.report.actualConsumption'),
                yAxisID: 'A',
                type: 'line',
                stack: 7,
                order: 7,
                data: filteredPlanningUnitData.map((item, index) => (item.actualConsumption ? item.finalConsumptionQty : null)),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                showLine: false,
                pointStyle: 'point',
                pointBackgroundColor: '#ba0c2f',
                pointBorderColor: '#ba0c2f',
                pointRadius: 3
              },
              {
                label: i18n.t('static.report.stock'),
                yAxisID: 'A',
                type: 'line',
                stack: 7,
                order: 7,
                borderColor: '#cfcdc9',
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent',
                },
                lineTension: 0,
                pointStyle: 'circle',
                pointRadius: 0,
                showInLegend: true,
                data: filteredPlanningUnitData.map((item, index) => (item.closingBalance))
              },
              {
                type: "line",
                yAxisID: (this.state.isAggregate.toString() == "false" ? plannningUnitItem.planBasedOn : filteredPlanningUnitData[0].planBasedOn) == 1 ? 'B' : 'A',
                label: (this.state.isAggregate.toString() == "false" ? plannningUnitItem.planBasedOn : filteredPlanningUnitData[0].planBasedOn) == 1 ? i18n.t('static.report.minmonth') : i18n.t('static.product.minQuantity'),
                backgroundColor: 'rgba(255,193,8,0.2)',
                borderColor: '#59cacc',
                borderStyle: 'dotted',
                order: 7,
                borderDash: [10, 10],
                fill: '+1',
                backgroundColor: 'transparent',
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent',
                },
                showInLegend: true,
                pointStyle: 'line',
                pointRadius: 0,
                yValueFormatString: "$#,##0",
                lineTension: 0,
                data: this.state.isAggregate.toString() == "true" ? (filteredPlanningUnitData.map((item, index) => ((filteredPlanningUnitData[0].planBasedOn == 1 ? roundAMC(item.minStockMos, 1) : roundAMC(item.minStockQty, 1))))) : (filteredPlanningUnitData.map((item, index) => ((plannningUnitItem.planBasedOn == 1 ? item.minMos : item.minStock))))
              }
              , {
                type: "line",
                yAxisID: (this.state.isAggregate.toString() == "false" ? plannningUnitItem.planBasedOn : filteredPlanningUnitData[0].planBasedOn) == 1 ? 'B' : 'A',
                label: (this.state.isAggregate.toString() == "false" ? plannningUnitItem.planBasedOn : filteredPlanningUnitData[0].planBasedOn) == 1 ? i18n.t('static.report.maxmonth') : i18n.t('static.supplyPlan.maxQty'),
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: '#59cacc',
                order: 7,
                borderStyle: 'dotted',
                backgroundColor: 'transparent',
                borderDash: [10, 10],
                fill: true,
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent',
                },
                lineTension: 0,
                pointStyle: 'line',
                pointRadius: 0,
                showInLegend: true,
                yValueFormatString: "$#,##0",
                data: this.state.isAggregate.toString() == "true" ? (filteredPlanningUnitData.map((item, index) => ((filteredPlanningUnitData[0].planBasedOn == 1 ? roundAMC(item.maxStockMos, 1) : roundAMC(item.maxStock, 1))))) : (filteredPlanningUnitData.map((item, index) => ((plannningUnitItem.planBasedOn == 1 ? item.maxMos : roundAMC(item.maxStock, 1)))))
              }
            ];
            if ((this.state.isAggregate.toString() == "false" ? plannningUnitItem.planBasedOn : filteredPlanningUnitData[0].planBasedOn) == 1) {
              datasets.push({
                type: "line",
                yAxisID: 'B',
                label: i18n.t('static.report.mos'),
                borderColor: '#118b70',
                backgroundColor: 'transparent',
                ticks: {
                  fontSize: 2,
                  fontColor: 'transparent',
                },
                lineTension: 0,
                order: 7,
                showInLegend: true,
                pointStyle: 'line',
                pointRadius: 0,
                yValueFormatString: "$#,##0",
                data: filteredPlanningUnitData.map((item, index) => (roundN(item.mos)))
              })
            }
            var graphLabel = "";
            var height = 400;
            if (this.state.isAggregate.toString() == "true") {
              var reportingUnitList = this.state.viewById == 1 ? this.state.planningUnitIdExport : this.state.realmCountryPlanningUnitIdExport;
              graphLabel = this.state.programId != undefined && reportingUnitList != undefined && this.state.programId.length > 0 && reportingUnitList.length > 0 ? entityname1 + " - " + (this.state.programId.map(ele => ele.label).toString() + " - " + reportingUnitList.map(ele => ele.label).toString()) : entityname1;
              var count = 0;
              var programCount = 0;
              var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
              var newDatasetArray = [];
              var graphAggregatedBy = this.state.graphAggregatedBy;
              this.state.programId.map((e, i) => {
                reportingUnitList.map((r, j) => {
                  var viewBy = this.state.viewById;
                  var planningUnitId = "";
                  if (viewBy == 1) {
                    planningUnitId = r.value;
                  } else {
                    var fuId = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == r.value)[0].forecastingUnitId;
                    planningUnitId = this.state.planningUnitListAll.filter(c => c.forecastingUnitId == fuId)[0].id;
                  }
                  if (ppuList.filter(c => c.programId == e.value && c.planningUnitId == planningUnitId).length > 0) {
                    programCount += 1;
                    if (count >= 10) {
                      count = 0;
                    }
                    newDatasetArray.push({
                      label: reportingUnitList.length > 1 ? this.state.viewById == 2 ? (e.label + " - " + r.label + " | " + r.value) : (e.label + " - " + r.label) : (e.label),
                      yAxisID: 'A',
                      stack: 1,
                      order: 1,
                      programId: graphAggregatedBy == 1 ? e.value : r.value,
                      programLabel: graphAggregatedBy == 1 ? e.label : r.label,
                      backgroundColor: colourArray[count],
                      borderColor: colourArray[count],
                      pointBackgroundColor: colourArray[count],
                      pointBorderColor: colourArray[count],
                      pointHoverBackgroundColor: colourArray[count],
                      pointHoverBorderColor: colourArray[count],
                      data: filteredPlanningUnitData.map((item, index) => {
                        let count = 0;
                        (item.shipmentInfo.map((ele, index) => {
                          (ele.program.id == e.value && ele.planningUnit.id == planningUnitId) ? count = count + Number(ele.shipmentQty) : count = count
                        }))
                        return count
                      })
                    })
                    count += 1;
                  }
                })
              })
              newDatasetArray = newDatasetArray.filter(c => c.data.some(c => c != 0));
              if (this.state.yaxisEquUnit != -1 && (graphAggregatedBy == 1 || graphAggregatedBy == 2)) {
                var count = 0;
                var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
                const combinedDataset = newDatasetArray.reduce((acc, item) => {
                  const existingItem = acc.find((entry) => entry.programId === item.programId);

                  if (existingItem) {
                    // Sum the data arrays if the programId already exists
                    existingItem.data = existingItem.data.map((value, index) =>
                      value + (item.data[index] || 0)
                    );
                  } else {
                    if (count >= 10) {
                      count = 0;
                    }
                    item.label = item.programLabel;
                    item.backgroundColor = colourArray[count];
                    item.borderColor = colourArray[count];
                    item.pointBackgroundColor = colourArray[count];
                    item.pointBorderColor = colourArray[count];
                    item.pointHoverBackgroundColor = colourArray[count];
                    item.pointHoverBorderColor = colourArray[count];
                    // Add a new entry for the programId if it doesn't exist in the accumulator
                    acc.push({ ...item });
                    count += 1;
                  }

                  return acc;
                }, []);
                datasets = datasets.concat(combinedDataset);
              } else {
                var count = 0;
                var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
                newDatasetArray.map(item => {
                  if (count >= 10) {
                    count = 0;
                  }
                  item.backgroundColor = colourArray[count];
                  item.borderColor = colourArray[count];
                  item.pointBackgroundColor = colourArray[count];
                  item.pointBorderColor = colourArray[count];
                  item.pointHoverBackgroundColor = colourArray[count];
                  item.pointHoverBorderColor = colourArray[count];
                  count += 1;
                })

                const smallScreen = window.matchMedia('(max-width: 768px)');
                const mediumScreen = window.matchMedia('(min-width: 769px) and (max-width: 1366px)');
                const largeScreen = window.matchMedia('(min-width: 1367px) and (max-width: 1919px)');
                const extraLargeScreen = window.matchMedia('(min-width: 1920px)');

                if (newDatasetArray.length > 10) {
                  if (extraLargeScreen.matches) {
                    height = 400 + (10 * newDatasetArray.length);
                  } else if (largeScreen.matches) {
                    height = 400 + (12 * newDatasetArray.length);
                  } else if (mediumScreen.matches) {
                    height = 400 + (16 * newDatasetArray.length);
                  } else if (smallScreen.matches) {
                    height = 400 + (21 * newDatasetArray.length);
                  }
                }
                datasets = datasets.concat(newDatasetArray);
              }
            } else {
              graphLabel = entityname1 + " - " + (this.state.programs.filter(c => c.programId == sortedProgramList[outputIndex])[0].programCode.toString() + " - " + getLabelText(planningUnitItemFilter.reportingUnit.label, this.state.lang));
              datasets.push({
                label: i18n.t('static.supplyPlan.delivered'),
                yAxisID: 'A',
                stack: 1,
                order: 1,
                backgroundColor: '#002f6c',
                borderColor: '#002f6c',
                pointBackgroundColor: '#002f6c',
                pointBorderColor: '#002f6c',
                pointHoverBackgroundColor: '#002f6c',
                pointHoverBorderColor: '#002f6c',
                data: filteredPlanningUnitData.map((item, index) => {
                  let count = 0;
                  (item.shipmentInfo.map((ele, index) => {
                    ele.shipmentStatus.id == 7 ? count = count + ele.shipmentQty : count = count
                  }))
                  return count
                })
              });
              datasets.push({
                label: i18n.t('static.supplyPlan.shipped'),
                yAxisID: 'A',
                stack: 1,
                order: 1,
                backgroundColor: '#49A4A1',
                borderColor: '#49A4A1',
                pointBackgroundColor: '#49A4A1',
                pointBorderColor: '#49A4A1',
                pointHoverBackgroundColor: '#49A4A1',
                pointHoverBorderColor: '#49A4A1',
                data: filteredPlanningUnitData.map((item, index) => {
                  let count = 0;
                  (item.shipmentInfo.map((ele, index) => {
                    (ele.shipmentStatus.id == 5 || ele.shipmentStatus.id == 6) ? count = count + ele.shipmentQty : count = count
                  }))
                  return count
                })
              });
              datasets.push({
                label: i18n.t('static.supplyPlan.approved'),
                yAxisID: 'A',
                stack: 1,
                order: 1,
                backgroundColor: '#0067B9',
                borderColor: '#0067B9',
                pointBackgroundColor: '#0067B9',
                pointBorderColor: '#0067B9',
                pointHoverBackgroundColor: '#0067B9',
                pointHoverBorderColor: '#0067B9',
                data: filteredPlanningUnitData.map((item, index) => {
                  let count = 0;
                  (item.shipmentInfo.map((ele, index) => {
                    (ele.shipmentStatus.id == 3 || ele.shipmentStatus.id == 4) ? count = count + ele.shipmentQty : count = count
                  }))
                  return count
                })
              });
              datasets.push({
                label: i18n.t('static.supplyPlan.planned'),
                backgroundColor: '#A7C6ED',
                borderColor: '#A7C6ED',
                pointBackgroundColor: '#A7C6ED',
                pointBorderColor: '#A7C6ED',
                pointHoverBackgroundColor: '#A7C6ED',
                pointHoverBorderColor: '#A7C6ED',
                yAxisID: 'A',
                stack: 1,
                order: 1,
                data: filteredPlanningUnitData.map((item, index) => {
                  let count = 0;
                  (item.shipmentInfo.map((ele, index) => {
                    (ele.shipmentStatus.id == 1 || ele.shipmentStatus.id == 2 || ele.shipmentStatus.id == 9) ? count = count + ele.shipmentQty : count = count
                  }))
                  return count
                })
              });
            }
            // const mediaQuery = window.matchMedia('(min-width: 1920px)')
            // if (programCount > 10) {
            //   if (mediaQuery.matches) {
            //     height = 400 + (10 * programCount);
            //   } else {
            //     height = 400 + (21 * programCount);
            //   }
            // }
            var bar = {
              labels: filteredPlanningUnitData.map((item, index) => (dateFormatter(item.dt))),
              datasets: datasets,
            };
            var chartOptions = {
              title: {
                display: false,
                text: entityname1
              },
              scales: {
                yAxes: [{
                  id: 'A',
                  position: 'left',
                  // stacked: true,
                  scaleLabel: {
                    labelString: i18n.t('static.shipment.qty'),
                    display: true,
                    fontSize: "12",
                    fontColor: 'black'
                  },
                  // stacked: true,
                  ticks: {
                    beginAtZero: true,
                    fontColor: 'black',
                    callback: function (value) {
                      var cell1 = value
                      cell1 += '';
                      var x = cell1.split('.');
                      var x1 = x[0];
                      var x2 = x.length > 1 ? '.' + x[1] : '';
                      var rgx = /(\d+)(\d{3})/;
                      while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                      }
                      return x1 + x2;
                    }
                  }, gridLines: {
                    color: 'rgba(171,171,171,1)',
                    lineWidth: 0
                  }
                }
                  , {
                  id: 'B',
                  position: 'right',
                  scaleLabel: {
                    labelString: i18n.t('static.supplyPlan.monthsOfStock'),
                    fontColor: 'black',
                    display: true,
                  },
                  ticks: {
                    beginAtZero: true,
                    fontColor: 'black',
                    callback: function (value) {
                      var cell1 = value
                      cell1 += '';
                      var x = cell1.split('.');
                      var x1 = x[0];
                      var x2 = x.length > 1 ? '.' + x[1] : '';
                      var rgx = /(\d+)(\d{3})/;
                      while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                      }
                      return x1 + x2;
                    }
                  },
                  gridLines: {
                    color: 'rgba(171,171,171,1)',
                    lineWidth: 0
                  }
                }],
                xAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: i18n.t('static.common.month'),
                    fontColor: 'black',
                    fontStyle: "normal",
                    fontSize: "12"
                  },
                  stacked: true,
                  ticks: {
                    fontColor: 'black',
                    fontStyle: "normal",
                    fontSize: "12"
                  },
                  gridLines: {
                    color: 'rgba(171,171,171,1)',
                    lineWidth: 0
                  }
                }]
              },
              tooltips: {
                enabled: false,
                custom: CustomTooltips,
                callbacks: {
                  label: function (tooltipItem, data) {
                    if (data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] != 0) {
                      let label = data.labels[tooltipItem.index];
                      let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                      var cell1 = value
                      cell1 += '';
                      var x = cell1.split('.');
                      var x1 = x[0];
                      var x2 = x.length > 1 ? '.' + x[1] : '';
                      var rgx = /(\d+)(\d{3})/;
                      while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                      }
                      return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                    } else {
                      return false
                    }
                  }
                }
              },
              maintainAspectRatio: false,
              legend: {
                display: true,
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  fontColor: 'black'
                }
              }
            }
            var data = this.state.isAggregate.toString() == "true" ? planningUnitItemFilter : planningUnitItemFilter.stockStatusVertical;
            let startDate = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01');
            var filteredData = data.filter(c => moment(c.dt).format("YYYY-MM") >= moment(startDate).format("YYYY-MM"));
            var planningUnit = this.state.planningUnitListAll.filter(e => e.id == sortedPlanningUnitList[outputIndex])[0];
            var conList = [];
            var invList = [];
            var shipList = [];
            if (this.state.isAggregate.toString() == "true") {
              filteredData.map(c => c.consumptionInfo.map(ci => conList.push(ci)));
              filteredData.map(c => c.inventoryInfo.map(ii => invList.push(ii)));
            } else {
              conList = planningUnitItemFilter.consumptionInfo;
              invList = planningUnitItemFilter.inventoryInfo;
            }
            filteredData.map(c => c.shipmentInfo.map(si => shipList.push(si)));
            var planningUnitexport = {
              planningUnit: planningUnit,
              firstMonthRegionCount: data.length > 0 ? data[0].regionCount : 1,
              firstMonthRegionCountForStock: data.length > 0 ? data[0].regionCountForStock : 0,
              data: filteredData,
              bar: bar,
              chartOptions: chartOptions,
              height: height,
              inList: invList,
              coList: conList,
              shList: shipList,
              planBasedOn: this.state.isAggregate.toString() == "false" ? planningUnitItemFilter.planBasedOn : "",
              programId: sortedProgramList[outputIndex],
              PlanningUnitIdDataForExport: planningUnitItemFilter,
              reportBy: this.state.viewById == 1 ? planningUnit : this.state.realmCountryPlanningUnitListAll.filter(c => c.id == sortedPlanningUnitList[outputIndex])[0]
            }
            PlanningUnitDataForExport.push(planningUnitexport)
            PlanningUnitIdForExport = sortedPlanningUnitList[outputIndex]
            ProgramIdForExport = sortedProgramList[outputIndex]
            PlanningUnitIdDataForExport = this.state.isAggregate.toString() == "false" ? planningUnitItemFilter : "";
          })
          this.setState({
            PlanningUnitDataForExport: PlanningUnitDataForExport,
            PlanningUnitIdForExport: PlanningUnitIdForExport,
            ProgramIdForExport: ProgramIdForExport,
            PlanningUnitIdDataForExport: PlanningUnitIdDataForExport,
            message: '', loading: false
          }, () => {
            setTimeout(() => {
              if (report == 1) {
                this.exportPDF()
                document.getElementById("bars_div").style.display = 'none';
              } else {
                this.exportCSV()
              }
            }, 2000)
          })
        }
        )
      // .catch(
      //   error => {
      //     this.setState({
      //       stockStatusList: [], loading: false
      //     })
      //     if (error.message === "Network Error") {
      //       this.setState({
      //         message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
      //         loading: false
      //       });
      //     } else {
      //       switch (error.response ? error.response.status : "") {
      //         case 401:
      //           this.props.history.push(`/login/static.message.sessionExpired`)
      //           break;
      //         case 403:
      //           this.props.history.push(`/accessDenied`)
      //           break;
      //         case 500:
      //         case 404:
      //         case 406:
      //           this.setState({
      //             message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
      //             loading: false
      //           });
      //           break;
      //         case 412:
      //           this.setState({
      //             message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
      //             loading: false
      //           });
      //           break;
      //         default:
      //           this.setState({
      //             message: 'static.unkownError',
      //             loading: false
      //           });
      //           break;
      //       }
      //     }
      //   }
      // );
    }
  }
  /**
   * Retrieves the list of programs.
   */
  getPrograms = () => {
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getSPProgramBasedOnRealmId(realmId)
        .then(response => {
          var proList = [];
          for (var i = 0; i < response.data.length; i++) {
            var programJson = {
              programId: response.data[i].id,
              label: response.data[i].label,
              programCode: response.data[i].code,
            };
            proList[i] = programJson;
          }
          this.setState({
            programs: proList, message: '',
            loading: false
          }, () => {
            this.consolidatedProgramList();
          })
        }).catch(
          error => {
            this.setState({
              programs: [], loading: false
            })
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
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                    loading: false
                  });
                  break;
                case 412:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
    } else {
      this.setState({ loading: false })
      this.consolidatedProgramList();
    }
  }
  /**
     * Consolidates the list of programs obtained from Server and local programs.
     */
  consolidatedProgramList = () => {
    const { programs } = this.state;
    var proList = programs;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(["programQPLDetails"], "readwrite");
      var program = transaction.objectStore("programQPLDetails");
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        );
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId) {
            if (![...new Set(programs.map(ele => (ele.programId)))].includes(myResult[i].programId)) {
              programs.push({
                programId: myResult[i].programId,
                label: myResult[i].programCode,
                programCode: myResult[i].programCode,
              })
            }
          }
        }
        this.setState({
          programs: programs, message: '',
          loading: false
        })
      }.bind(this);
    }.bind(this);
  };
  /**
   * Filters versions based on the selected program ID and updates the state accordingly.
   * Sets the selected program ID in local storage.
   * Fetches version list for the selected program and updates the state with the fetched versions.
   * Handles error cases including network errors, session expiry, access denial, and other status codes.
   */
  filterVersion = () => {
    let programId = this.state.programId;
    if (programId.length == 1) {
      programId = programId[0].value
      const program = this.state.programs.filter(
        (c) => c.programId == programId
      );
      if (program.length == 1) {
        if (localStorage.getItem("sessionType") === 'Online') {
          this.setState(
            {
              versions: [],
            },
            () => {
              DropdownService.getVersionListForSPProgram(
                programId
              )
                .then((response) => {
                  this.setState(
                    {
                      versions: [],
                    },
                    () => {
                      this.setState(
                        {
                          versions: response.data,
                        },
                        () => {
                          this.consolidatedVersionList(programId);
                        }
                      );
                    }
                  );
                })
                .catch((error) => {
                  this.setState({
                    programs: [],
                    loading: false,
                  });
                  if (error.message === "Network Error") {
                    this.setState({
                      message: API_URL.includes("uat")
                        ? i18n.t("static.common.uatNetworkErrorMessage")
                        : API_URL.includes("demo")
                          ? i18n.t("static.common.demoNetworkErrorMessage")
                          : i18n.t("static.common.prodNetworkErrorMessage"),
                      loading: false,
                    });
                  } else {
                    switch (error.response ? error.response.status : "") {
                      case 401:
                        this.props.history.push(
                          `/login/static.message.sessionExpired`
                        );
                        break;
                      case 409:
                        this.setState({
                          message: i18n.t('static.common.accessDenied'),
                          loading: false,
                          color: "#BA0C2F",
                        });
                        break;
                      case 403:
                        this.props.history.push(`/accessDenied`);
                        break;
                      case 500:
                      case 404:
                      case 406:
                        this.setState({
                          message: i18n.t(error.response.data.messageCode, {
                            entityname: i18n.t("static.dashboard.program"),
                          }),
                          loading: false,
                        });
                        break;
                      case 412:
                        this.setState({
                          message: i18n.t(error.response.data.messageCode, {
                            entityname: i18n.t("static.dashboard.program"),
                          }),
                          loading: false,
                        });
                        break;
                      default:
                        this.setState({
                          message: "static.unkownError",
                          loading: false,
                        });
                        break;
                    }
                  }
                });
            }
          );
        } else {
          this.setState(
            {
              versions: [],
            },
            () => {
              this.consolidatedVersionList(programId);
            }
          );
        }
      } else {
        this.setState({
          versions: [],
        });
      }
    } else {
      this.setState({
        versions: [],
      }, () => {
        this.getDropdownLists();
      });
    }
  };
  /**
   * Retrieves data from IndexedDB and combines it with fetched versions to create a consolidated version list.
   * Filters out duplicate versions and reverses the list.
   * Sets the version list in the state and triggers fetching of planning units.
   * Handles cases where a version is selected from local storage or the default version is selected.
   * @param {number} programId - The ID of the selected program
   */
  consolidatedVersionList = (programId) => {
    const { versions } = this.state;
    var verList = versions;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(["programData"], "readwrite");
      var program = transaction.objectStore("programData");
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        );
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (
            myResult[i].programId == programId
          ) {
            var databytes = CryptoJS.AES.decrypt(
              myResult[i].programData.generalData,
              SECRET_KEY
            );
            var programData = databytes.toString(CryptoJS.enc.Utf8);
            var version = JSON.parse(programData).currentVersion;
            version.versionId = `${version.versionId} (Local)`;
            version.cutOffDate = JSON.parse(programData).cutOffDate != undefined && JSON.parse(programData).cutOffDate != null && JSON.parse(programData).cutOffDate != "" ? JSON.parse(programData).cutOffDate : ""
            verList.push(version);
          }
        }
        let versionList = verList.filter(function (x, i, a) {
          return a.indexOf(x) === i;
        });
        versionList.reverse();
        this.setState(
          {
            versions: versionList,
            versionId: versionList[0].versionId,
          },
          () => {
            this.getDropdownLists();
          }
        );
      }.bind(this);
    }.bind(this);
  };
  /**
    * Sets the planning unit based on the provided event data.
    * @param {Object} e - Event data containing planning unit information.
    */
  setPlanningUnit(e) {
    if (this.state.yaxisEquUnit == -1) {
      var selectedText = e.map(item => item.label);
      var tempPUList = e.filter(puItem => !this.state.planningUnitId.map(ele => ele).includes(puItem));
      this.setState({
        planningUnitId: e.map(ele => ele).length == 0 ? [] : e.length == 1 ? e.map(ele => ele) : tempPUList,
        planningUnitIdExport: e.map(ele => ele).length == 0 ? [] : e.length == 1 ? e.map(ele => ele) : tempPUList,
        show: false,
        dataList: [],
        consumptionAdjForStockOutId: false,
        loading: false,
        planningUnitDetails: "",
        planningUnitDetailsExport: ""
      }, () => {
        // document.getElementById("consumptionAdjusted").checked = false;
        this.fetchData();
      })
    } else {
      if (this.state.yaxisEquUnit > 0) {
        this.setState({
          planningUnitId: e.map(ele => ele),
          planningUnitIdExport: e.map(ele => ele),
          show: false,
          dataList: [],
          consumptionAdjForStockOutId: false,
          loading: false
        }, () => {
          if (this.state.planningUnitId.length > 0) {
            this.fetchData();
          } else {
            this.setState({
              stockStatusList: [],
            })
          }
        })
      }
    }
  }
  /**
    * Sets the planning unit based on the provided event data.
    * @param {Object} e - Event data containing planning unit information.
    */
  setPlanningUnitSingle(e) {
    var planningUnitId = e.target.value;
    if (planningUnitId != "") {
      var planningUnitLabel = document.getElementById("planningUnitId").selectedOptions[0].text.toString()
      var planningUnit = [{
        value: Number(planningUnitId),
        label: planningUnitLabel
      }]
      this.setState({
        planningUnitId: planningUnit,
        planningUnitIdExport: planningUnit,
        show: false,
        dataList: [],
        consumptionAdjForStockOutId: false,
        loading: false
      }, () => {
        if (this.state.programId.length == 1) {
          this.getPlanningUnitByProgramIdAndPlanningUnitId(this.state.programId[0].value, planningUnitId, false);
        }
        // document.getElementById("consumptionAdjusted").checked = false;
        this.fetchData();
      })
    } else {
      this.setState({
        planningUnitId: [],
        stockStatusList: []
      })
    }
  }
  /**
    * Sets the planning unit based on the provided event data.
    * @param {Object} e - Event data containing planning unit information.
    */
  setRealmCountryPlanningUnitSingle(e) {
    var realmCountryPlanningUnitId = e.target.value;
    if (realmCountryPlanningUnitId != "") {
      var realmCountryPlanningUnitLabel = document.getElementById("realmCountryPlanningUnitId").selectedOptions[0].text.toString()
      var realmCountryPlanningUnit = [{
        value: Number(realmCountryPlanningUnitId),
        label: realmCountryPlanningUnitLabel
      }]
      if (this.state.versionId.toString().includes("Local")) {
        var rcpu = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == Number(realmCountryPlanningUnitId));
        var planningUnitLabel = rcpu[0].planningUnit.label
        var planningUnit = [{
          value: Number(rcpu[0].planningUnit.id),
          label: planningUnitLabel
        }]
        this.setState({
          planningUnitId: planningUnit,
          planningUnitIdExport: planningUnit,
        })
      }
      this.setState({
        realmCountryPlanningUnitId: realmCountryPlanningUnit,
        realmCountryPlanningUnitIdExport: realmCountryPlanningUnit,
        show: false,
        dataList: [],
        consumptionAdjForStockOutId: false,
        loading: false
      }, () => {
        if (this.state.programId.length == 1) {
          var planningUnitId;
          if (this.state.versionId.toString().includes("Local")) {
            var rcpu = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == Number(realmCountryPlanningUnitId));
            planningUnitId = Number(rcpu[0].planningUnit.id);
          } else {
            var fuId = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == realmCountryPlanningUnitId)[0].forecastingUnitId;
            planningUnitId = this.state.planningUnitListAll.filter(c => c.forecastingUnitId == fuId)[0].id;
          }
          this.getPlanningUnitByProgramIdAndPlanningUnitId(this.state.programId[0].value, planningUnitId, false);
        }
        // document.getElementById("consumptionAdjusted").checked = false;
        this.fetchData();
      })
    } else {
      this.setState({
        realmCountryPlanningUnitId: [],
        stockStatusList: []
      })
    }
  }
  getPlanningUnitByProgramIdAndPlanningUnitId(programId, planningUnitId, setOnlyExportValue) {
    if (this.state.versionId.toString().includes("Local")) {
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(["programPlanningUnit"], "readwrite");
        var program = transaction.objectStore("programPlanningUnit");
        var getRequest = program.getAll();
        getRequest.onerror = function (event) {
        };
        getRequest.onsuccess = function (event) {
          var myResult = getRequest.result;
          if (setOnlyExportValue) {
            this.setState({
              planningUnitDetailsExport: myResult.filter(c => c.program.id == programId && c.planningUnit.id == planningUnitId)[0],
            })
          } else {
            this.setState({
              planningUnitDetails: myResult.filter(c => c.program.id == programId && c.planningUnit.id == planningUnitId)[0],
              planningUnitDetailsExport: myResult.filter(c => c.program.id == programId && c.planningUnit.id == planningUnitId)[0],
            })
          }
        }.bind(this)
      }.bind(this)
    } else {
      ReportService.getPlanningUnitByProgramIdAndPlanningUnitId(programId, planningUnitId).then(response => {
        if (setOnlyExportValue) {
          this.setState({
            planningUnitDetailsExport: response.data
          })
        } else {
          this.setState({
            planningUnitDetails: response.data,
            planningUnitDetailsExport: response.data
          })
        }
      }).catch(
        error => {
          this.setState({
            stockStatusList: [], loading: false
          })
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
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                  loading: false
                });
                break;
              case 412:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
  }
  setPlanningUnitExport(e) {
    this.setState({
      planningUnitIdExport: e.map(ele => ele),
    }, () => {
      if (this.state.programId.length == 1 && this.state.planningUnitIdExport.length == 1) {
        this.getPlanningUnitByProgramIdAndPlanningUnitId(this.state.programId[0].value, this.state.planningUnitIdExport[0].value, true);
      }
    })
  }
  setRealmCountryPlanningUnit(e) {
    if (this.state.yaxisEquUnit == -1) {
      var selectedText = e.map(item => item.label);
      var tempRCPUList = e.filter(rcpuItem => !this.state.planningUnitId.map(ele => ele).includes(rcpuItem));
      this.setState({
        realmCountryPlanningUnitId: e.map(ele => ele).length == 0 ? [] : e.length == 1 ? e.map(ele => ele) : tempRCPUList,
        realmCountryPlanningUnitIdExport: e.map(ele => ele).length == 0 ? [] : e.length == 1 ? e.map(ele => ele) : tempRCPUList,
        show: false,
        dataList: [],
        consumptionAdjForStockOutId: false,
        loading: false,
        planningUnitDetails: "",
        planningUnitDetailsExport: ""
      }, () => {
        // document.getElementById("consumptionAdjusted").checked = false;
        this.fetchData();
      })
    } else {
      if (this.state.yaxisEquUnit > 0) {
        this.setState({
          realmCountryPlanningUnitId: e.map(ele => ele),
          realmCountryPlanningUnitIdExport: e.map(ele => ele),
          show: false,
          dataList: [],
          consumptionAdjForStockOutId: false,
          loading: false
        }, () => {
          // document.getElementById("consumptionAdjusted").checked = false;
          if (this.state.realmCountryPlanningUnitId.length > 0) {
            this.fetchData();
          } else {
            this.setState({
              stockStatusList: [],
            })
          }
        })
      }
    }
  }
  setRealmCountryPlanningUnitExport(e) {
    this.setState({
      realmCountryPlanningUnitIdExport: e.map(ele => ele),
    }, () => {
      if (this.state.versionId.toString().includes("Local") && e.length > 0) {
        var rcpu = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == Number(e[0].value));
        var planningUnitLabel = rcpu[0].planningUnit.label
        var planningUnit = [{
          value: Number(rcpu[0].planningUnit.id),
          label: planningUnitLabel
        }]
        this.setState({
          planningUnitIdExport: planningUnit,
        })
      }
      if (this.state.programId.length == 1 && this.state.realmCountryPlanningUnitIdExport.length == 1) {
        var planningUnitId;
        if (this.state.versionId.toString().includes("Local")) {
          var rcpu = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == Number(this.state.realmCountryPlanningUnitIdExport[0].value));
          planningUnitId = Number(rcpu[0].planningUnit.id);
        } else {
          var fuId = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == this.state.realmCountryPlanningUnitIdExport[0].value)[0].forecastingUnitId;
          planningUnitId = this.state.planningUnitListAll.filter(c => c.forecastingUnitId == fuId)[0].id;
        }
        this.getPlanningUnitByProgramIdAndPlanningUnitId(this.state.programId[0].value, this.state.planningUnitIdExport[0].value, true);
      }
    })
  }
  /**
  * Sets the y-axis equivalent unit ID and triggers data fetching.
  * @param {Object} e - Event data containing the y-axis equivalent unit ID.
  */
  setYaxisEquUnitId(e) {
    var yaxisEquUnit = e.target.value;
    this.setState({
      yaxisEquUnit: yaxisEquUnit,
      loading: false,
      viewById: yaxisEquUnit != -1 ? this.state.viewById : 1
    }, () => {
      if (this.state.viewById == 2) {
        document.getElementById("realmCountryPlanningUnitDiv").style.display = "block";
        document.getElementById("planningUnitDiv").style.display = "none";
        // this.fetchData();
      } else {
        document.getElementById("planningUnitDiv").style.display = "block";
        document.getElementById("realmCountryPlanningUnitDiv").style.display = "none";
        // this.fetchData();
      }
      // this.fetchData();
    })
  }
  /**
   * Updates the selected view mode in the state and triggers actions to update the UI.
   * @param {Object} e - The event object containing the selected view mode value.
   */
  setViewById(e) {
    var viewById = e.target.value;
    this.setState({
      viewById: viewById,
      consumptionData: [],
      monthArrayList: [],
      errorValues: [],
      regionListFiltered: [],
      show: false,
      loading: false,
      stockStatusList: [],
      yaxisEquUnit: -1,
      realmCountryPlanningUnitId: [],
      planningUnitId: []
    }, () => {
      if (viewById == 2) {
        document.getElementById("realmCountryPlanningUnitDiv").style.display = "block";
        document.getElementById("planningUnitDiv").style.display = "none";
        // this.fetchData();
      } else {
        document.getElementById("planningUnitDiv").style.display = "block";
        document.getElementById("realmCountryPlanningUnitDiv").style.display = "none";
        // this.fetchData();
      }
    })
  }
  /**
  * Handles the change event for the Y-axis equivalency unit.
  * @param {object} e - The event object
  */
  yAxisChange(e) {
    var yaxisEquUnit = e.target.value;
    var planningUnitList = this.state.planningUnitListAll;
    var realmCountryPlanningUnitList = this.state.realmCountryPlanningUnitListAll;
    if (yaxisEquUnit != -1) {
      var validFu = this.state.equivalencyUnitList.filter(x => x.id == e.target.value)[0].forecastingUnitIds;
      planningUnitList = planningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
      realmCountryPlanningUnitList = realmCountryPlanningUnitList.filter(x => validFu.includes(x.forecastingUnitId.toString()));
    }
    this.setState({
      viewById: yaxisEquUnit != -1 ? 1 : this.state.viewById,
      yaxisEquUnit: yaxisEquUnit,
      planningUnitList: planningUnitList,
      realmCountryPlanningUnitList: realmCountryPlanningUnitList,
      planningUnitId: [],
      realmCountryPlanningUnitId: [],
      stockStatusList: [],
      onlyShowAllPUs: false,
      // planningUnits: [],
      // planningUnitIds: [],
      // planningUnitValues: [],
      // planningUnitLabels: [],
      // foreastingUnits: [],
      // forecastingUnitIds: [],
      // foreastingUnitValues: [],
      // foreastingUnitLabels: [],
      // planningUnitId: "",
      // forecastingUnitId: "",
      // dataList: [],
      // loading: false
    }, () => {
      if (this.state.viewById == 2) {
        try {
          document.getElementById("realmCountryPlanningUnitDiv").style.display = "block";
          document.getElementById("planningUnitDiv").style.display = "none";
        } catch (err) { }
        // this.fetchData();
      } else {
        try {
          document.getElementById("planningUnitDiv").style.display = "block";
          document.getElementById("realmCountryPlanningUnitDiv").style.display = "none";
        } catch (err) { }
        // this.fetchData();
      }
      if (yaxisEquUnit > 0) {//Yes        
        // this.getPlanningUnitAndForcastingUnit();
      } else {//NO
        // this.getPlanningUnitAndForcastingUnit();
        // this.fetchData();
      }
    })
  }
  setOnlyShowAllPUs(e) {
    var checked = e.target.checked;
    this.setState({
      onlyShowAllPUs: checked,
      // yaxisEquUnit: -1
    }, () => {
      this.getDropdownLists();
    })
  }
  fetchData() {
    this.setState({
      loading: true
    })
    if (this.state.programId.map(ele => ele.value).length == 1 && this.state.versionId.toString().includes("Local")) {
      let programId = this.state.programId[0].value + "_v" + this.state.versionId.split(" ")[0] + "_uId_" + AuthenticationService.getLoggedInUserId();
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: '#BA0C2F'
        })
        this.hideFirstComponent()
      }.bind(this);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['programData'], 'readwrite');
        var programTransaction = transaction.objectStore('programData');
        var programRequest = programTransaction.get(programId);
        programRequest.onerror = function (event) {
          this.setState({
            message: i18n.t('static.program.errortext'),
            color: '#BA0C2F'
          })
          this.hideFirstComponent()
        }.bind(this);
        programRequest.onsuccess = function (event) {
          var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
          var ppuOS = ppuTransaction.objectStore('programPlanningUnit');
          var ppuRequest = ppuOS.getAll();
          ppuRequest.onerror = function (event) {
            this.setState({
              message: i18n.t('static.program.errortext'),
              color: '#BA0C2F'
            })
            this.hideFirstComponent()
          }.bind(this);
          ppuRequest.onsuccess = function (event) {
            var planningUnitDataList = programRequest.result.programData.planningUnitDataList;
            var puData = [];
            var planningUnitList = this.state.planningUnitId;
            var consumptionList = [], inventoryList = [], shipmentList = [], supplyPlanList = [], programPlanningUnitList = [], stockStatusVerticalAggregateList = [];
            for (var pu = 0; pu < planningUnitList.length; pu++) {
              var planningUnitDataFilter = planningUnitDataList.filter(c => c.planningUnitId == planningUnitList[pu].value);
              var programJson = {};
              if (planningUnitDataFilter.length > 0) {
                var planningUnitData = planningUnitDataFilter[0]
                var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                programJson = JSON.parse(programData);
                consumptionList = consumptionList.concat(programJson.consumptionList);
                inventoryList = inventoryList.concat(programJson.inventoryList);
                shipmentList = shipmentList.concat(programJson.shipmentList);
                supplyPlanList = supplyPlanList.concat(programJson.supplyPlan);
                programPlanningUnitList.push({
                  "programId": Number(programId.split("_")[0]),
                  "planningUnitId": planningUnitList[pu].value
                })
              } else {
                programJson = {
                  consumptionList: [],
                  inventoryList: [],
                  shipmentList: [],
                  batchInfoList: [],
                  supplyPlan: [],
                }
                programPlanningUnitList.push({
                  "programId": Number(programId.split("_")[0]),
                  "planningUnitId": planningUnitList[pu].value
                })
              }

            }
            var ppuResult = ppuRequest.result;
            var planningUnitArray = [...new Set(this.state.planningUnitId).map(c => Number(c.value))];
            var ppu = ppuResult.filter(c => c.program.id == this.state.programId[0].value && planningUnitArray.includes(c.planningUnit.id));
            let startDate = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01').startOf('month').format('YYYY-MM-DD');
            let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
            for (let m = moment(startDate).format("YYYY-MM"); moment(m).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"); m = moment(m).add(1, "months").format("YYYY-MM")) {
              let sp = supplyPlanList.filter(x => moment(x.transDate).format("YYYY-MM") == moment(m).format("YYYY-MM"))
              var conList = consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(m).format("YYYY-MM") && planningUnitArray.includes(c.planningUnit.id) && c.active.toString() == "true");
              conList.map(item => {
                item.program = {
                  id: this.state.programId[0].value,
                  label: {
                    "label_en": this.state.programId[0].label
                  },
                  code: this.state.programId[0].label
                }
              })
              var invList = inventoryList.filter(c => moment(c.inventoryDate).format("YYYY-MM") == moment(m).format("YYYY-MM") && planningUnitArray.includes(c.planningUnit.id) && c.active.toString() == "true");
              invList.map(item => {
                item.program = {
                  id: this.state.programId[0].value,
                  label: {
                    "label_en": this.state.programId[0].label
                  },
                  code: this.state.programId[0].label
                }
              })
              var shipList = shipmentList.filter(c => moment(c.receivedDate != null && c.receivedDate != "" && c.receivedDate != undefined ? c.receivedDate : c.expectedDeliveryDate).format("YYYY-MM") == moment(m).format("YYYY-MM") && planningUnitArray.includes(c.planningUnit.id) && c.active.toString() == "true" && c.accountFlag.toString() == "true");
              shipList.map(item => {
                item.program = {
                  id: this.state.programId[0].value,
                  label: {
                    "label_en": this.state.programId[0].label
                  },
                  code: this.state.programId[0].label
                }
              })
              var multiplier = 1;
              if (this.state.viewById == 2) {
                multiplier = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == this.state.realmCountryPlanningUnitId[0].value)[0].multiplier
              }
              shipList.map(c => {
                c.shipmentQty = roundARU(c.shipmentQty, multiplier)
              })
              var eq = {};
              if (this.state.yaxisEquUnit != -1) {
                eq = this.state.equivalencyUnitList.filter(c => c.id == this.state.yaxisEquUnit)[0]
              }
              var notes = "";
              ppu.map(item => {
                if (item.notes != null && item.notes != "") {
                  if (notes == "") {
                    notes += this.state.programId[0].label + ": " + item.notes
                  } else {
                    notes += "|" + this.state.programId[0].label + ": " + item.notes
                  }
                }

              })
              stockStatusVerticalAggregateList.push({
                "dt": m + "-01",
                "reportingUnit": this.state.yaxisEquUnit == -1 ? this.state.viewById == 1 ? {
                  "id": this.state.planningUnitId[0].value,
                  "label": {
                    "label_en": this.state.planningUnitId[0].label
                  }
                } : {
                  "id": this.state.realmCountryPlanningUnitId[0].value,
                  "label": {
                    "label_en": this.state.realmCountryPlanningUnitId[0].label
                  }
                } : {
                  "id": eq.id,
                  "label": {
                    "label_en": eq.label.label_en
                  }
                },
                "openingBalance": sp.reduce((sum, value) => sum + roundARUWithoutRounding((value.openingBalance), multiplier), 0),
                "actualConsumption": sp.filter(x => x.actualFlag).length == sp.length,
                "actualConsumptionQty": conList.filter(c => c.actualFlag.toString() == "true").length > 0 ? conList.filter(c => c.actualFlag.toString() == "true").reduce((sum, value) => sum + roundARUWithoutRounding((value.consumptionQty), multiplier), 0) : null,
                "forecastedConsumptionQty": conList.filter(c => c.actualFlag.toString() == "false").length > 0 ? conList.filter(c => c.actualFlag.toString() == "false").reduce((sum, value) => sum + roundARUWithoutRounding((value.consumptionQty), multiplier), 0) : null,
                "finalConsumptionQty": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.consumptionQty, multiplier), 0),
                "shipmentQty": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.shipmentTotalQty, multiplier), 0),
                "adjustment": invList.filter(c => c.adjustmentQty != null).length > 0 ? invList.reduce((sum, value) => sum + roundARUWithoutRounding(value.adjustmentQty, multiplier), 0) : null,
                "expiredStock": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.expiredStock, multiplier), 0),
                "closingBalance": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.closingBalance, multiplier), 0),
                "amc": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.amc, multiplier), 0),
                "mos": sp.reduce((sum, value) => sum + value.closingBalance, 0) / sp.reduce((sum, value) => sum + value.amc, 0),
                "minStockMos": ppu.reduce((sum, value) => sum + value.minMonthsOfStock, 0) / ppu.length,
                "maxStockMos": Number(ppu.reduce((sum, value) => sum + value.minMonthsOfStock, 0) / ppu.length) + Number(ppu.reduce((sum, value) => sum + value.reorderFrequencyInMonths, 0) / ppu.length),
                "minStockQty": ppu.reduce((sum, value) => sum + value.minQty, 0) / ppu.length,
                "maxStockQty": Number(sp.reduce((sum, value) => sum + roundARU(value.amc, multiplier), 0)) * Number(Number(ppu.reduce((sum, value) => sum + value.minMonthsOfStock, 0) / ppu.length) + Number(ppu.reduce((sum, value) => sum + value.reorderFrequencyInMonths, 0) / ppu.length)),
                "unmetDemand": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.unmetDemand, multiplier), 0),
                "regionCount": sp.length > 0 ? sp[0].regionCount : 0,
                "regionCountForStock": sp.length > 0 ? sp[0].regionCountForStock : 0,
                "nationalAdjustment": sp.reduce((sum, value) => sum + roundARUWithoutRounding(value.nationalAdjustment, multiplier), 0),
                "planBasedOn": ppu.some(c => c.planBasedOn == 1) ? 1 : 2,
                "ppuNotes": ppu.length > 1 ? (notes == "" ? null : notes) : ((ppu[0].notes == "" || ppu[0].notes == null) ? null : this.state.programId[0].label + ": " + ppu[0].notes),
                "consumptionInfo": conList,
                "inventoryInfo": invList,
                "shipmentInfo": shipList
              })
            }
            var stockStatusVerticalAggregateListJson = {
              "programPlanningUnitList": programPlanningUnitList,
              "stockStatusVerticalAggregateList": stockStatusVerticalAggregateList
            }
            var inventoryList = [];
            var consumptionList = [];
            var shipmentList = [];
            var responseData = stockStatusVerticalAggregateListJson.stockStatusVerticalAggregateList;
            startDate = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01');
            var filteredResponseData = (responseData).filter(c => moment(c.dt).format("YYYY-MM") >= moment(startDate).format("YYYY-MM"));
            filteredResponseData.map(c => {
              c.inventoryInfo.map(i => inventoryList.push(i))
              c.consumptionInfo.map(ci => consumptionList.push(ci))
              c.shipmentInfo.map(si => shipmentList.push(si))
            }
            );
            this.setState({
              firstMonthRegionCount: stockStatusVerticalAggregateList.length > 0 ? responseData[0].regionCount : 1,
              firstMonthRegionCountForStock: responseData.length > 0 ? responseData[0].regionCountForStock : 0,
              stockStatusList: responseData,
              message: '', loading: false,
              planningUnitLabel: "",//document.getElementById("planningUnitId").selectedOptions[0].text,
              inList: inventoryList,
              coList: consumptionList,
              shList: shipmentList,
              ppuList: stockStatusVerticalAggregateListJson.programPlanningUnitList,
              loading: false
            })
          }.bind(this)
        }.bind(this)
      }.bind(this)
    } else {
      let startDate = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01');
      let inputjson = {
        "aggregate": true, // True if you want the results to be aggregated and False if you want Individual Supply Plans for the Multi-Select information
        "programIds": this.state.programId.map(ele => ele.value), // Will be used when singleProgram is false
        "programId": this.state.programId.map(ele => ele.value), // Will be used only if aggregate is false
        "versionId": parseInt(this.state.versionId),
        "startDate": startDate.startOf('month').format('YYYY-MM-DD'),
        "stopDate": this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate(),
        "viewBy": this.state.viewById, // 1 for PU, 2 for ARU
        "reportingUnitIds": this.state.viewById == 1 ? this.state.planningUnitId.map(ele => ele.value) : this.state.realmCountryPlanningUnitId.map(ele => ele.value),
        "reportingUnitId": this.state.viewById == 1 ? this.state.planningUnitId.map(ele => ele.value).toString() : this.state.realmCountryPlanningUnitId.map(ele => ele.value).toString(), // Will be used only if aggregate is false
        "equivalencyUnitId": this.state.yaxisEquUnit == -1 ? 0 : this.state.yaxisEquUnit
      }
      ReportService.getStockStatusData(inputjson).then((response) => {
        var inventoryList = [];
        var consumptionList = [];
        var shipmentList = [];
        var responseData = response.data.stockStatusVerticalAggregateList;
        let startDate = moment(this.state.rangeValue.from.year + '-' + (this.state.rangeValue.from.month <= 9 ? "0" + this.state.rangeValue.from.month : this.state.rangeValue.from.month) + '-01');
        var filteredResponseData = (responseData).filter(c => moment(c.dt).format("YYYY-MM") >= moment(startDate).format("YYYY-MM"));
        filteredResponseData.map(c => {
          c.inventoryInfo.map(i => inventoryList.push(i))
          c.consumptionInfo.map(ci => consumptionList.push(ci))
          c.shipmentInfo.map(si => shipmentList.push(si))
        }
        );
        this.setState({
          firstMonthRegionCount: responseData.length > 0 ? responseData[0].regionCount : 1,
          firstMonthRegionCountForStock: responseData.length > 0 ? responseData[0].regionCountForStock : 0,
          stockStatusList: filteredResponseData,
          message: '', loading: false,
          planningUnitLabel: "",//document.getElementById("planningUnitId").selectedOptions[0].text,
          inList: inventoryList,
          coList: consumptionList,
          shList: shipmentList,
          ppuList: response.data.programPlanningUnitList,
          loading: false
        })
      }).catch(
        error => {
          this.setState({
            stockStatusList: [], loading: false
          })
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
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                  loading: false
                });
                break;
              case 412:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
  }
  /**
   * Calls the get programs function on page load
   */
  componentDidMount() {
    // Detect initial theme
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    this.setState({ isDarkMode });

    // Listening for theme changes
    const observer = new MutationObserver(() => {
      const updatedDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      this.setState({ isDarkMode: updatedDarkMode });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    this.getPrograms();
  }
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      if (this.state.planningUnitId.length > 0 || this.state.realmCountryPlanningUnitId.length > 0) {
        this.fetchData()
      } else {
        this.setState({
          stockStatusList: []
        })
      }
    })
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }
  /**
   * Displays a loading indicator while data is being loaded.
   */
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
  /**
   * Renders the Stock Status report table.
   * @returns {JSX.Element} - Stock Status report table.
   */
  render() {
    console.log("This.state.planningUnitDetails", this.state.planningUnitDetails != "" ? this.state.planningUnitDetails.monthsInPastForAmc : "");
    const darkModeColors = [
      '#d4bbff',
      '#757575',
    ];

    const lightModeColors = [
      '#002F6C',  // Color 1 
      '#cfcdc9',
    ];
    const { isDarkMode } = this.state;
    const colors = isDarkMode ? darkModeColors : lightModeColors;
    const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
    const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';

    const { equivalencyUnitList } = this.state;
    let equivalencyUnitList1 = equivalencyUnitList.length > 0
      && equivalencyUnitList.map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {item.label.label_en}
          </option>
        )
      }, this);

    const { programs } = this.state;
    let programList = programs.length > 0
      && programs.map((item) => {
        return { value: item.programId, label: item.programCode }
      }, this);

    const { versions } = this.state;
    let versionList =
      versions.length > 0 &&
      versions.map((item, i) => {
        return (
          <option key={i} value={item.versionId}>
            {item.versionStatus.id == 2 && item.versionType.id == 2
              ? item.versionId + "*"
              : item.versionId}{" "}
            ({moment(item.createdDate).format(`MMM DD YYYY`)}) {item.cutOffDate != undefined && item.cutOffDate != null && item.cutOffDate != '' ? " (" + i18n.t("static.supplyPlan.start") + " " + moment(item.cutOffDate).format('MMM YYYY') + ")" : ""}
          </option>
        );
      }, this);

    const { planningUnitList, lang } = this.state;
    let puList = planningUnitList.length > 0 && planningUnitList.sort(function (a, b) {
      a = getLabelText(a.label, lang).toLowerCase();
      b = getLabelText(b.label, lang).toLowerCase();
      return a < b ? -1 : a > b ? 1 : 0;
    }).map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang) + " | " + item.id, value: item.id })
    }, this);

    const { realmCountryPlanningUnitList } = this.state;
    let rcpuList = realmCountryPlanningUnitList.length > 0 && realmCountryPlanningUnitList.sort(function (a, b) {
      a = getLabelText(a.label, lang).toLowerCase();
      b = getLabelText(b.label, lang).toLowerCase();
      return a < b ? -1 : a > b ? 1 : 0;
    }).map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
    }, this);
    var reportingUnitList = (this.state.viewById == 1 ? this.state.planningUnitId : this.state.realmCountryPlanningUnitId);
    var graphLabel = this.state.programId != undefined && reportingUnitList != undefined && this.state.programId.length > 0 && reportingUnitList.length > 0 ? (this.state.programId.map(ele => ele.label).toString() + " - " + reportingUnitList.map(ele => ele.label).toString()) : entityname1;
    const options = {
      title: {
        display: this.state.yaxisEquUnit == -1 && this.state.programId.length == 1 ? true : false,
        text: graphLabel,
        fontColor: fontColor
      },
      scales: {
        yAxes: [{
          id: 'A',
          position: 'left',
          // stacked: true,
          scaleLabel: {
            labelString: i18n.t('static.shipment.qty'),
            display: true,
            fontSize: "12",
            fontColor: fontColor
          },
          ticks: {
            beginAtZero: true,
            fontColor: fontColor,
            callback: function (value) {
              var cell1 = value
              cell1 += '';
              var x = cell1.split('.');
              var x1 = x[0];
              var x2 = x.length > 1 ? '.' + x[1] : '';
              var rgx = /(\d+)(\d{3})/;
              while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
              }
              return x1 + x2;
            }
          }, gridLines: {
            lineWidth: 0,
            color: gridLineColor,
            zeroLineColor: gridLineColor
          }
        }
          , {
          id: 'B',
          position: 'right',
          scaleLabel: {
            labelString: i18n.t('static.supplyPlan.monthsOfStock'),
            fontColor: fontColor,
            display: true,
          },
          ticks: {
            beginAtZero: true,
            fontColor: fontColor,
            callback: function (value) {
              var cell1 = value
              cell1 += '';
              var x = cell1.split('.');
              var x1 = x[0];
              var x2 = x.length > 1 ? '.' + x[1] : '';
              var rgx = /(\d+)(\d{3})/;
              while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
              }
              return x1 + x2;
            }
          },
          gridLines: {
            lineWidth: 0,
            color: gridLineColor,
            zeroLineColor: gridLineColor
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: i18n.t('static.common.month'),
            fontColor: fontColor,
            fontStyle: "normal",
            fontSize: "12"
          },
          stacked: true,
          ticks: {
            fontColor: fontColor,
            fontStyle: "normal",
            fontSize: "12"
          },
          gridLines: {
            lineWidth: 0,
            color: gridLineColor,
            zeroLineColor: gridLineColor
          }
        }]
      },
      tooltips: {
        mode: 'nearest',
        callbacks: {
          label: function (tooltipItem, data) {
            if (data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] != 0) {
              if (tooltipItem.datasetIndex == 2) {
                return "";
              } else {
                let label = data.labels[tooltipItem.index];
                let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                var cell1 = value
                cell1 += '';
                var x = cell1.split('.');
                var x1 = x[0];
                var x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                  x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
              }
            } else {
              return false
            }
          }
        },
        // Disable tooltips if the value is 0
        filter: function (tooltipItem) {
          const value = tooltipItem.value;
          return value != 0; // Only show tooltips for non-zero values
        }
        , intersect: false
      },
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontColor: fontColor,
        }
      }
    }
    const options1 = {
      title: {
        display: this.state.yaxisEquUnit == -1 && this.state.programId.length == 1 ? true : false,
        text: graphLabel,
        fontColor: fontColor
      },
      scales: {
        yAxes: [{
          id: 'A',
          position: 'left',
          // stacked: true,
          scaleLabel: {
            labelString: i18n.t('static.shipment.qty'),
            display: true,
            fontSize: "12",
            fontColor: fontColor
          },
          ticks: {
            beginAtZero: true,
            fontColor: fontColor,
            callback: function (value) {
              var cell1 = value
              cell1 += '';
              var x = cell1.split('.');
              var x1 = x[0];
              var x2 = x.length > 1 ? '.' + x[1] : '';
              var rgx = /(\d+)(\d{3})/;
              while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
              }
              return x1 + x2;
            }
          }, gridLines: {
            lineWidth: 0,
            color: gridLineColor,
            zeroLineColor: gridLineColor
          }
        }
        ],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: i18n.t('static.common.month'),
            fontColor: fontColor,
            fontStyle: "normal",
            fontSize: "12"
          },
          stacked: true,
          ticks: {
            fontColor: fontColor,
            fontStyle: "normal",
            fontSize: "12"
          },
          gridLines: {
            lineWidth: 0,
            color: gridLineColor,
            zeroLineColor: gridLineColor
          }
        }]
      },
      tooltips: {
        mode: 'nearest',
        intersect: false,
        // enabled: false,
        // custom: CustomTooltips,
        callbacks: {
          label: function (tooltipItem, data) {
            if (data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] != 0) {
              if (tooltipItem.datasetIndex == 2) {
                return "";
              } else {
                let label = data.labels[tooltipItem.index];
                let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                var cell1 = value
                cell1 += '';
                var x = cell1.split('.');
                var x1 = x[0];
                var x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                  x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
              }
            } else {
              return false
            }
          }
        },
        // Disable tooltips if the value is 0
        filter: function (tooltipItem) {
          const value = tooltipItem.value;
          return value != 0; // Only show tooltips for non-zero values
        }
      },
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontColor: fontColor
        }
      }
    }
    let height = 400;
    let datasets = [
      {
        label: i18n.t('static.supplyplan.exipredStock'),
        yAxisID: 'A',
        type: 'line',
        stack: 7,
        order: 0,
        data: this.state.stockStatusList.map((item, index) => (item.expiredStock > 0 ? item.expiredStock : null)),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        showLine: false,
        pointStyle: 'triangle',
        pointBackgroundColor: '#ED8944',
        pointBorderColor: '#212721',
        pointRadius: 10
      },
      {
        type: "line",
        yAxisID: 'A',
        label: i18n.t('static.supplyPlan.consumption'),
        backgroundColor: 'transparent',
        borderColor: '#ba0c2f',
        pointBackgroundColor: '#ba0c2f',
        pointBorderColor: '#ba0c2f',
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },
        lineTension: 0,
        showInLegend: true,
        order: 7,
        pointStyle: 'line',
        pointRadius: 0,
        yValueFormatString: "$#,##0",
        data: this.state.stockStatusList.map((item, index) => (item.finalConsumptionQty))
      },
      {
        label: (this.state.programId.length > 1 || this.state.planningUnitId.length > 1 || this.state.realmCountryPlanningUnitId.length > 1) ? i18n.t('static.stockStatus.consensusConsumption') : i18n.t('static.report.actualConsumption'),
        yAxisID: 'A',
        type: 'line',
        stack: 7,
        order: 7,
        data: this.state.stockStatusList.map((item, index) => (item.actualConsumption ? item.finalConsumptionQty : null)),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        showLine: false,
        pointStyle: 'point',
        pointBackgroundColor: '#ba0c2f',
        pointBorderColor: '#ba0c2f',
        pointRadius: 3,
        yValueFormatString: "$#,##0",
      },
      {
        label: i18n.t('static.report.stock'),
        yAxisID: 'A',
        type: 'line',
        stack: 7,
        order: 7,
        borderColor: '#cfcdc9',
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },
        lineTension: 0,
        pointStyle: 'circle',
        pointRadius: 0,
        showInLegend: true,
        data: this.state.stockStatusList.map((item, index) => (item.closingBalance))
      },
      {
        type: "line",
        yAxisID: this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? 'B' : 'A',
        label: this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? i18n.t('static.report.minmonth') : i18n.t('static.product.minQuantity'),
        backgroundColor: 'rgba(255,193,8,0.2)',
        borderColor: '#59cacc',
        order: 7,
        pointBackgroundColor: '#59cacc',
        pointBorderColor: '#59cacc',
        borderStyle: 'dotted',
        borderDash: [10, 10],
        fill: '+1',
        backgroundColor: 'transparent',
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },
        showInLegend: true,
        pointStyle: 'line',
        pointRadius: 0,
        yValueFormatString: "$#,##0",
        lineTension: 0,
        data: this.state.stockStatusList.map((item, index) => (this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? roundAMC(item.minStockMos, 1) : roundAMC(item.minStockQty, 1)))
      }
      , {
        type: "line",
        yAxisID: this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? 'B' : 'A',
        label: this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? i18n.t('static.report.maxmonth') : i18n.t('static.supplyPlan.maxQty'),
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: '#59cacc',
        order: 7,
        pointBackgroundColor: '#59cacc',
        pointBorderColor: '#59cacc',
        borderStyle: 'dotted',
        backgroundColor: 'transparent',
        borderDash: [10, 10],
        fill: true,
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },
        lineTension: 0,
        pointStyle: 'line',
        pointRadius: 0,
        showInLegend: true,
        yValueFormatString: "$#,##0",
        data: this.state.stockStatusList.map((item, index) => (this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? roundAMC(item.maxStockMos, 1) : roundAMC(item.maxStockQty, 1)))
      }
    ]
    if (this.state.programId.length > 0 && reportingUnitList.length > 0) {
      if (this.state.programId.length == 1 && reportingUnitList.length == 1) {
        datasets.push({
          label: i18n.t('static.supplyPlan.delivered'),
          yAxisID: 'A',
          stack: 1,
          order: 1,
          backgroundColor: colors[0],
          borderColor: colors[0],
          pointBackgroundColor: colors[0],
          pointBorderColor: colors[0],
          pointHoverBackgroundColor: colors[0],
          pointHoverBorderColor: colors[0],
          data: this.state.stockStatusList.map((item, index) => {
            let count = 0;
            (item.shipmentInfo.map((ele, index) => {
              ele.shipmentStatus.id == 7 ? count = count + Number(ele.shipmentQty) : count = count
            }))
            return count
          })
        });
        datasets.push({
          label: i18n.t('static.supplyPlan.shipped'),
          yAxisID: 'A',
          stack: 1,
          order: 1,
          backgroundColor: '#49a4a1',
          borderColor: '#49a4a1',
          pointBackgroundColor: '#49a4a1',
          pointBorderColor: '#49a4a1',
          pointHoverBackgroundColor: '#49a4a1',
          pointHoverBorderColor: '#49a4a1',
          data: this.state.stockStatusList.map((item, index) => {
            let count = 0;
            (item.shipmentInfo.map((ele, index) => {
              (ele.shipmentStatus.id == 5 || ele.shipmentStatus.id == 6) ? count = count + Number(ele.shipmentQty) : count = count
            }))
            return count
          })
        });
        datasets.push({
          label: i18n.t('static.supplyPlan.approved'),
          yAxisID: 'A',
          stack: 1,
          order: 1,
          backgroundColor: '#0067B9',
          borderColor: '#0067B9',
          pointBackgroundColor: '#0067B9',
          pointBorderColor: '#0067B9',
          pointHoverBackgroundColor: '#0067B9',
          pointHoverBorderColor: '#0067B9',
          data: this.state.stockStatusList.map((item, index) => {
            let count = 0;
            (item.shipmentInfo.map((ele, index) => {
              (ele.shipmentStatus.id == 3 || ele.shipmentStatus.id == 4) ? count = count + Number(ele.shipmentQty) : count = count
            }))
            return count
          })
        });
        datasets.push({
          label: i18n.t('static.supplyPlan.planned'),
          backgroundColor: '#A7C6ED',
          borderColor: '#A7C6ED',
          pointBackgroundColor: '#A7C6ED',
          order: 1,
          pointBorderColor: '#A7C6ED',
          pointHoverBackgroundColor: '#A7C6ED',
          pointHoverBorderColor: '#A7C6ED',
          yAxisID: 'A',
          stack: 1,
          data: this.state.stockStatusList.map((item, index) => {
            let count = 0;
            (item.shipmentInfo.map((ele, index) => {
              (ele.shipmentStatus.id == 1 || ele.shipmentStatus.id == 2 || ele.shipmentStatus.id == 9) ? count = count + Number(ele.shipmentQty) : count = count
            }))
            return count
          })
        });
      } else {
        var count = 0;
        var programCount = 0;
        var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
        var newDatasetArray = [];
        var graphAggregatedBy = this.state.graphAggregatedBy;
        this.state.programId.map((e, i) => {
          reportingUnitList.map((r, j) => {
            var viewBy = this.state.viewById;
            var planningUnitId = "";
            if (viewBy == 1) {
              planningUnitId = r.value;
            } else {
              var fuId = this.state.realmCountryPlanningUnitListAll.filter(c => c.id == r.value)[0].forecastingUnitId;
              planningUnitId = this.state.planningUnitListAll.filter(c => c.forecastingUnitId == fuId)[0].id;
            }
            var ppuList = this.state.ppuList;
            if (ppuList.filter(c => c.programId == e.value && c.planningUnitId == planningUnitId).length > 0) {
              programCount += 1;
              if (count >= 10) {
                count = 0;
              }
              newDatasetArray.push({
                label: reportingUnitList.length > 1 ? this.state.viewById == 2 ? (e.label + " - " + r.label + " | " + r.value) : (e.label + " - " + r.label) : (e.label),
                yAxisID: 'A',
                stack: 1,
                order: 1,
                programId: graphAggregatedBy == 1 ? e.value : r.value,
                programLabel: graphAggregatedBy == 1 ? e.label : r.label,
                backgroundColor: colourArray[count],
                borderColor: colourArray[count],
                pointBackgroundColor: colourArray[count],
                pointBorderColor: colourArray[count],
                pointHoverBackgroundColor: colourArray[count],
                pointHoverBorderColor: colourArray[count],
                data: this.state.stockStatusList.map((item, index) => {
                  let count = 0;
                  (item.shipmentInfo.map((ele, index) => {
                    (ele.program.id == e.value && ele.planningUnit.id == planningUnitId) ? count = count + Number(ele.shipmentQty) : count = count
                  }))
                  return count
                })
              })
              count += 1;
            }
          })
        })
        newDatasetArray = newDatasetArray.filter(c => c.data.some(c => c != 0));
        if (this.state.yaxisEquUnit != -1 && (graphAggregatedBy == 1 || graphAggregatedBy == 2)) {
          var count = 0;
          var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
          const combinedDataset = newDatasetArray.reduce((acc, item) => {
            const existingItem = acc.find((entry) => entry.programId === item.programId);

            if (existingItem) {
              // Sum the data arrays if the programId already exists
              existingItem.data = existingItem.data.map((value, index) =>
                value + (item.data[index] || 0)
              );
            } else {
              if (count >= 10) {
                count = 0;
              }
              item.label = item.programLabel;
              item.backgroundColor = colourArray[count];
              item.borderColor = colourArray[count];
              item.pointBackgroundColor = colourArray[count];
              item.pointBorderColor = colourArray[count];
              item.pointHoverBackgroundColor = colourArray[count];
              item.pointHoverBorderColor = colourArray[count];
              // Add a new entry for the programId if it doesn't exist in the accumulator
              acc.push({ ...item });
              count += 1;
            }

            return acc;
          }, []);
          datasets = datasets.concat(combinedDataset);
        } else {
          var count = 0;
          var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#f0bc52", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
          newDatasetArray.map(item => {
            if (count >= 10) {
              count = 0;
            }
            item.backgroundColor = colourArray[count];
            item.borderColor = colourArray[count];
            item.pointBackgroundColor = colourArray[count];
            item.pointBorderColor = colourArray[count];
            item.pointHoverBackgroundColor = colourArray[count];
            item.pointHoverBorderColor = colourArray[count];
            count += 1;
          })

          const smallScreen = window.matchMedia('(max-width: 768px)');
          const mediumScreen = window.matchMedia('(min-width: 769px) and (max-width: 1366px)');
          const largeScreen = window.matchMedia('(min-width: 1367px) and (max-width: 1919px)');
          const extraLargeScreen = window.matchMedia('(min-width: 1920px)');

          if (newDatasetArray.length > 10) {
            if (extraLargeScreen.matches) {
              height = 400 + (10 * newDatasetArray.length);
            } else if (largeScreen.matches) {
              height = 400 + (12 * newDatasetArray.length);
            } else if (mediumScreen.matches) {
              height = 400 + (16 * newDatasetArray.length);
            } else if (smallScreen.matches) {
              height = 400 + (21 * newDatasetArray.length);
            }
          }

          datasets = datasets.concat(newDatasetArray);
        }
      }
    }
    const mediaQuery = window.matchMedia('(min-width: 1920px)')
    // if (programCount > 10) {
    //   if (mediaQuery.matches) {
    //     height = 400 + (10 * programCount);
    //   } else {
    //     height = 400 + (21 * programCount);
    //   }
    // }
    if (this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1) {
      datasets.push({
        type: "line",
        yAxisID: 'B',
        label: i18n.t('static.report.mos'),
        borderColor: '#118b70',
        pointBackgroundColor: '#118b70',
        pointBorderColor: '#118b70',
        backgroundColor: 'transparent',
        order: 7,
        ticks: {
          fontSize: 2,
          fontColor: 'transparent',
        },
        lineTension: 0,
        showInLegend: true,
        pointStyle: 'line',
        pointRadius: 0,
        yValueFormatString: "$#,##0",
        data: this.state.stockStatusList.map((item, index) => (item.mos != null ? roundN(item.mos) : item.mos))
      })
    }
    const bar = {
      labels: this.state.stockStatusList.map((item, index) => (dateFormatter(item.dt))),
      datasets: datasets,
    };
    const { rangeValue } = this.state
    var ppu = (this.state.planningUnitList.filter(c => this.state.planningUnitId.map(x => x.value).includes(c.id))[0])
    return (
      <div className="animated fadeIn" >
        <AuthenticationServiceComponent history={this.props.history} />
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>
        <SupplyPlanFormulas ref="formulaeChild" />
        <Card>
          <div className="Card-header-reporticon pb-2">
            <div className="card-header-actions">
              <a className="card-header-action">
                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleStockStatus() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
              </a>
              <a className="card-header-action">
                {this.state.stockStatusList.length > 0 && <div className="card-header-actions">
                  <img style={{ height: '25px', width: '25px', cursor: 'Pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.toggleExport(1)} />
                  <img style={{ height: '25px', width: '25px', cursor: 'Pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.toggleExport(2)} />
                </div>}
              </a>
            </div>
          </div>
          <CardBody className="pb-lg-2  CardBodyTop">
            <div>
              <div ref={ref}>
                <Form >
                  <div className=" pl-0">
                    <div className="row">
                      <FormGroup className="col-md-3">
                        <div className="row">
                          <FormGroup className="col-md-12">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}</Label>
                            <div className="controls  edit">
                              <Picker
                                ref="pickRange"
                                years={{ min: this.state.minDate, max: this.state.maxDate }}
                                value={rangeValue}
                                lang={pickerLang}
                                key={JSON.stringify(this.state.minDate) + "-" + JSON.stringify(rangeValue)}
                                onDismiss={this.handleRangeDissmis}
                              >
                                <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                              </Picker>
                            </div>
                          </FormGroup>
                          {this.state.yaxisEquUnit != -1 && (this.state.programId.length > 1 || this.state.programId.length == 0) &&
                            <FormGroup className="col-md-12">
                              <Label htmlFor="appendedInputButton">{i18n.t("static.stockStatus.graphAggregatedBy")}</Label>
                              <div className="controls ">
                                <InputGroup>
                                  <Input
                                    type="select"
                                    name="graphAggregatedBy"
                                    id="graphAggregatedBy"
                                    value={this.state.graphAggregatedBy}
                                    onChange={(e) => this.setGraphAggregatedBy(e)}
                                    bsSize="sm"
                                  >
                                    <option value="1">{i18n.t('static.program.programMaster')}</option>
                                    <option value="2">{this.state.viewById == 1 ? i18n.t('static.report.planningUnit') : i18n.t('static.dashboad.planningunitcountry')}</option>
                                    <option value="3">{i18n.t("static.stockStatus.programPlanningUnit")}</option>
                                  </Input>

                                </InputGroup>
                              </div>
                            </FormGroup>
                          }
                        </div>
                      </FormGroup>
                      <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                        <div className="controls">
                          {localStorage.getItem("sessionType") == 'Online' && <MultiSelect
                            name="programId"
                            id="programId"
                            bsSize="sm"
                            options={programList.length > 0 ? programList : []}
                            filterOptions={filterOptions}
                            value={this.state.programId}
                            onChange={(e) => { this.programChange(e); }}
                            labelledBy={i18n.t('static.common.select')}
                          />}
                          {localStorage.getItem("sessionType") != 'Online' && <InputGroup>
                              <Input
                                type="select"
                                name="programId"
                                id="programId"
                                value={this.state.programId.length > 0 ? this.state.programId[0].value : ""}
                                onChange={(e) => { this.programChange(e); }}
                                bsSize="sm"
                              >
                                <option value="">{i18n.t('static.common.select')}</option>
                                {programList.length > 0
                                  && programList.map((item, i) => {
                                    return (
                                      <option key={i} value={item.value}>
                                        {item.label}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                            </InputGroup>}
                        </div>
                      </FormGroup>
                      {this.state.programId.length == 1 && <FormGroup className="col-md-3">
                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                        <div className="controls">
                          <InputGroup>
                            <Input
                              type="select"
                              name="versionId"
                              id="versionId"
                              bsSize="sm"
                              onChange={(e) => {
                                this.setVersionId(e);
                              }}
                              value={this.state.versionId}
                            >
                              <option value="0">
                                {i18n.t("static.common.select")}
                              </option>
                              {versionList}
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>}
                      <FormGroup className="col-md-2" id="equivelencyUnitDiv">
                        <Label htmlFor="appendedInputButton">{i18n.t("static.forecastReport.yAxisInEquivalencyUnit")}</Label>
                        <div className="controls ">
                          <InputGroup>
                            <Input
                              type="select"
                              name="yaxisEquUnit"
                              id="yaxisEquUnit"
                              bsSize="sm"
                              value={this.state.yaxisEquUnit}
                              onChange={(e) => { this.yAxisChange(e); }}
                            // onChange={(e) => { this.setYaxisEquUnitId(e); }}
                            // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                            >
                              <option value="-1">{i18n.t('static.program.no')}</option>
                              {equivalencyUnitList1}
                            </Input>

                          </InputGroup>
                        </div>
                      </FormGroup>

                      <FormGroup className="col-md-4" >
                        <div className='row MarginTopfieldsupply'>
                          <FormGroup check inline className='PaddingLeftSupplyReport' style={{ marginTop: '-4px' }}>
                            <Input
                              type="radio"
                              id="viewById"
                              name="viewById"
                              style={{ "margin-left": "0px" }}
                              value={"1"}
                              checked={this.state.viewById == 1}
                              title={i18n.t('static.report.planningUnit')}
                              onChange={this.setViewById}
                            />
                            <Label
                              className="form-check-label"
                              // check htmlFor="inline-radio1"
                              title={i18n.t('static.report.planningUnit')}>
                              {i18n.t('static.report.planningUnit')}
                            </Label>
                          </FormGroup>
                          {this.state.yaxisEquUnit == -1 && <FormGroup check inline className='PaddingLeftSupplyReport' style={{ marginTop: '-4px' }}>
                            <Input
                              type="radio"
                              id="viewById"
                              name="viewById"
                              style={{ "margin-left": "0px" }}
                              value={"2"}
                              checked={this.state.viewById == 2}
                              title={i18n.t('static.planningunit.countrysku')}
                              onChange={this.setViewById}
                            />
                            <Label
                              className="form-check-label"
                              // check htmlFor="inline-radio1"
                              title={i18n.t('static.planningunit.countrysku')}>
                              {i18n.t('static.planningunit.countrysku')}
                            </Label>
                          </FormGroup>}
                        </div>
                        <FormGroup id="realmCountryPlanningUnitDiv" style={{ display: "none", "marginTop": "8px" }}>
                          <div className="controls">
                            {this.state.yaxisEquUnit != -1 && <MultiSelect
                              bsSize="sm"
                              name="realmCountryPlanningUnitId"
                              id="realmCountryPlanningUnitId"
                              filterOptions={filterOptions}
                              value={this.state.realmCountryPlanningUnitId}
                              onChange={(e) => { this.setRealmCountryPlanningUnit(e); }}
                              options={rcpuList && rcpuList.length > 0 ? rcpuList : []}
                              hasSelectAll={this.state.yaxisEquUnit == -1 ? false : true}
                            />}
                            {this.state.yaxisEquUnit == -1 && <InputGroup>
                              <Input
                                type="select"
                                name="realmCountryPlanningUnitId"
                                id="realmCountryPlanningUnitId"
                                value={this.state.realmCountryPlanningUnitId.length > 0 ? this.state.realmCountryPlanningUnitId[0].value : ""}
                                onChange={(e) => { this.setRealmCountryPlanningUnitSingle(e); }}
                                bsSize="sm"
                              >
                                <option value="">{i18n.t('static.common.select')}</option>
                                {rcpuList.length > 0
                                  && rcpuList.map((item, i) => {
                                    return (
                                      <option key={i} value={item.value}>
                                        {item.label}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                            </InputGroup>}
                          </div>
                        </FormGroup>
                        <FormGroup id="planningUnitDiv" style={{ "marginTop": "8px" }}>
                          <div className="controls">
                            {this.state.yaxisEquUnit != -1 && <MultiSelect
                              bsSize="sm"
                              name="planningUnitId"
                              id="planningUnitId"
                              filterOptions={filterOptions}
                              value={this.state.planningUnitId}
                              onChange={(e) => { this.setPlanningUnit(e); }}
                              options={puList && puList.length > 0 ? puList : []}
                              hasSelectAll={this.state.yaxisEquUnit == -1 ? false : true}
                              showCheckboxes={this.state.yaxisEquUnit == -1 ? false : true}
                            />}
                            {this.state.yaxisEquUnit == -1 && <InputGroup>
                              <Input
                                type="select"
                                name="planningUnitId"
                                id="planningUnitId"
                                value={this.state.planningUnitId.length > 0 ? this.state.planningUnitId[0].value : ""}
                                onChange={(e) => { this.setPlanningUnitSingle(e); }}
                                bsSize="sm"
                              >
                                <option value="">{i18n.t('static.common.select')}</option>
                                {puList.length > 0
                                  && puList.map((item, i) => {
                                    return (
                                      <option key={i} value={item.value}>
                                        {item.label}
                                      </option>
                                    )
                                  }, this)}
                              </Input>
                            </InputGroup>}
                          </div>
                        </FormGroup>
                        {this.state.programId.length > 1 && <FormGroup style={{ "marginTop": "-10px" }}>
                          <div className={this.state.yaxisEquUnit != 1 ? "col-md-12" : "col-md-12"} style={{ "padding-left": "23px", "marginTop": "-25px !important" }}>
                            <Input
                              className="form-check-input"
                              type="checkbox"
                              id="onlyShowAllPUs"
                              name="onlyShowAllPUs"
                              checked={this.state.onlyShowAllPUs}
                              onClick={(e) => { this.setOnlyShowAllPUs(e); }}
                              style={{ marginTop: '2px' }}
                            />
                            <Label
                              className="form-check-label"
                              check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                              {i18n.t('static.stockStatus.onlyShowPUsThatArePartOfAllPrograms')}
                            </Label>
                          </div>
                        </FormGroup>}
                      </FormGroup>
                      {/* {this.state.yaxisEquUnit != -1 && this.state.programId.length == 1 &&
                        <FormGroup className="col-md-3">
                          <Label htmlFor="appendedInputButton">{i18n.t("static.stockStatus.graphAggregatedBy")}</Label>
                          <div className="controls ">
                            <InputGroup>
                              <Input
                                type="select"
                                name="graphAggregatedBy"
                                id="graphAggregatedBy"
                                value={this.state.graphAggregatedBy}
                                onChange={(e) => this.setGraphAggregatedBy(e)}
                                bsSize="sm"
                              >
                                <option value="1">{i18n.t('static.program.programMaster')}</option>
                                <option value="2">{this.state.viewById == 1 ? i18n.t('static.report.planningUnit') : i18n.t('static.dashboad.planningunitcountry')}</option>
                                <option value="3">{i18n.t("static.stockStatus.programPlanningUnit")}</option>
                              </Input>

                            </InputGroup>
                          </div>
                        </FormGroup>
                      } */}
                      {/* <FormGroup style={{ "marginTop": "-10px" }}>
                        <div className="col-md-12" style={{ "padding-left": "34px", "marginTop": "-25px !important" }}>
                          <Input
                            className="form-check-input"
                            type="checkbox"
                            id="onlyShowAllPUs"
                            name="onlyShowAllPUs"
                            checked={this.state.onlyShowAllPUs}
                            onClick={(e) => { this.setOnlyShowAllPUs(e); }}
                            style={{marginTop:'2px'}}
                          />
                          <Label
                            className="form-check-label"
                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                            {i18n.t('static.stockStatus.onlyShowPUsThatArePartOfAllPrograms')}
                          </Label>
                        </div>
                      </FormGroup> */}
                    </div>
                  </div>
                </Form>
                <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }} >
                  <div className="row">
                    {
                      this.state.stockStatusList.length > 0
                      &&
                      <div className="col-md-12 p-0">
                        {this.state.stockStatusList.length > 0 &&
                          <FormGroup className="col-md-12 pl-0" style={{ display: this.state.display }}>
                            <ul className="legendcommitversion list-group" style={{ "marginTop": "10px" }}>
                              <li><span className="redlegend "></span>
                                <span className="legendcommitversionText">
                                  <b>{i18n.t("static.supplyPlan.planningUnitSettings")}<i class="fa fa-info-circle icons pl-lg-2" id="Popover2" title={i18n.t("static.tooltip.planningUnitSettings")} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i> : </b>
                                </span>
                              </li>
                              <>
                                {this.state.programId.length == 1 && (this.state.viewById == 1 ? this.state.planningUnitId.length == 1 : this.state.realmCountryPlanningUnitId.length == 1) && <><li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.amcPastOrFuture")}</b> : {this.state.planningUnitDetails.monthsInPastForAmc}/{this.state.planningUnitDetails.monthsInFutureForAmc}</span></li>
                                  <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.report.shelfLife")}</b> : {this.state.planningUnitDetails.shelfLife}</span></li></>}
                                {this.state.stockStatusList[0].planBasedOn == 1 ? <li><span className="redlegend "></span>
                                  <span className="legendcommitversionText">
                                    <b>{i18n.t("static.supplyPlan.minStockMos")}</b> : {formatter(roundAMC(this.state.stockStatusList[0].minStockMos), 0)}
                                  </span>
                                </li> : <li><span className="redlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.product.minQuantity")}</b> : {formatter(this.state.stockStatusList[0].minStockQty, 0)}</span></li>}
                                {this.state.programId.length == 1 && (this.state.viewById == 1 ? this.state.planningUnitId.length == 1 : this.state.realmCountryPlanningUnitId.length == 1) && <li><span className="lightgreenlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.supplyPlan.reorderInterval")}</b> : {this.state.planningUnitDetails.reorderFrequencyInMonths}</span></li>}
                                {this.state.stockStatusList[0].planBasedOn == 1 && <li><span className="redlegend "></span>
                                  <span className="legendcommitversionText">
                                    <b>{i18n.t("static.supplyPlan.maxStockMos")}</b>   : {formatter(roundAMC(this.state.stockStatusList[0].maxStockMos), 0)}
                                  </span>
                                </li>}
                                {this.state.programId.length == 1 && (this.state.viewById == 1 ? this.state.planningUnitId.length == 1 : this.state.realmCountryPlanningUnitId.length == 1) && this.state.stockStatusList[0].planBasedOn == 2 && <li><span className="lightgreenlegend "></span> <span className="legendcommitversionText"><b>{i18n.t("static.product.distributionLeadTime")}</b> : {this.state.planningUnitDetails.distributionLeadTime}</span></li>}
                              </>
                            </ul>
                            {this.state.stockStatusList[0].ppuNotes != undefined && this.state.stockStatusList[0].ppuNotes != null && this.state.stockStatusList[0].ppuNotes.length > 0 &&
                              <span style={{ "marginTop": "10px" }} className="legendcommitversionText"><b>{i18n.t("static.program.notes")}</b> : {this.state.stockStatusList[0].ppuNotes.toString().split("~").map((item, index) => {
                                if(this.state.programId.length==1){
                                  return (<>{(index != 0 ? ", " : "")}{item.toString().split(":").slice(1).join(':')}</>)
                                }else{
                                  return (<>{(index != 0 ? ", " : "")}<b>{item.toString().split(":")[0]}</b>&nbsp;{": " + item.toString().split(":").slice(1).join(':')}</>)
                                }
                              })}</span>
                            }
                          </FormGroup>
                        }
                        <div className="col-md-12 text-center">
                          {(this.state.yaxisEquUnit != -1 || this.state.programId.length > 1) && <span align="center" className='text-blackD'><b>{entityname1}</b></span>}<br />
                          {(this.state.yaxisEquUnit != -1 || this.state.programId.length > 1) && <span id="programIdsLabels" align="center" className='text-blackD'>{this.state.programId != undefined && (this.state.viewById == 1 ? this.state.planningUnitId : this.state.realmCountryPlanningUnitId) != undefined && this.state.programId.length > 0 && (this.state.viewById == 1 ? this.state.planningUnitId : this.state.realmCountryPlanningUnitId).length > 0 ? (this.state.programId.filter(c => [...new Set(this.state.ppuList).map(ele => ele.programId)].includes(c.value)).map(ele => ele.label).join(", ")) : ""}</span>}<br />
                          {(this.state.yaxisEquUnit != -1 || this.state.programId.length > 1) && <span id="planningUnitIdsLabels" align="center" className='text-blackD'>{this.state.programId != undefined && (this.state.viewById == 1 ? this.state.planningUnitId : this.state.realmCountryPlanningUnitId) != undefined && this.state.programId.length > 0 && (this.state.viewById == 1 ? this.state.planningUnitId : this.state.realmCountryPlanningUnitId).length > 0 ? (this.state.yaxisEquUnit != -1 ? ("EU: " + document.getElementById("yaxisEquUnit").selectedOptions[0].text) : (this.state.viewById == 1 ? this.state.planningUnitId : this.state.realmCountryPlanningUnitId).map(ele => ele.label).join(", ")) : ""}</span>}
                          <div className={this.state.graphAggregatedBy != 3 ? "chart-wrapper chart-graph-report" : "chart-wrapper"} style={this.state.graphAggregatedBy == 3 ? { "height": height + "px" } : {}}>
                            {this.state.stockStatusList[0].planBasedOn == 1 && <Bar id="cool-canvas" data={bar} options={options} />}
                            {this.state.stockStatusList[0].planBasedOn == 2 && <Bar id="cool-canvas" data={bar} options={options1} />}
                          </div>
                          <div id="bars_div" style={{ display: "none" }}>
                            {this.state.isAggregate.toString() == "true" && this.state.PlanningUnitDataForExport.map((ele, index) => {
                              return (<>{ele.data[0].planBasedOn == 1 && <div className={this.state.graphAggregatedBy != 3 ? "chart-wrapper chart-graph-report" : "chart-wrapper"} style={this.state.graphAggregatedBy == 3 ? { "height": height + "px" } : {}}><Bar id={"cool-canvas" + index} data={ele.bar} options={ele.chartOptions} /></div>}
                                {ele.data[0].planBasedOn == 2 && <div className={this.state.graphAggregatedBy != 3 ? "chart-wrapper chart-graph-report" : "chart-wrapper"} style={this.state.graphAggregatedBy == 3 ? { "height": height + "px" } : {}} ><Bar id={"cool-canvas" + index} data={ele.bar} options={ele.chartOptions} /></div>}</>)
                            })}
                            {this.state.isAggregate.toString() == "false" && this.state.PlanningUnitDataForExport.map((ele, index) => {
                              return (<>{ele.planBasedOn == 1 && <div className={this.state.graphAggregatedBy != 3 ? "chart-wrapper chart-graph-report" : "chart-wrapper"} style={this.state.graphAggregatedBy == 3 ? { "height": height + "px" } : {}}><Bar id={"cool-canvas" + index} data={ele.bar} options={ele.chartOptions} /></div>}
                                {ele.planBasedOn == 2 && <div className={this.state.graphAggregatedBy != 3 ? "chart-wrapper chart-graph-report" : "chart-wrapper"} style={this.state.graphAggregatedBy == 3 ? { "height": height + "px" } : {}}><Bar id={"cool-canvas" + index} data={ele.bar} options={ele.chartOptions} /></div>}</>)
                            })}
                          </div>
                        </div>
                        <div className="col-md-12">
                          <button className="mr-1 mt-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                            {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                          </button>
                        </div>
                      </div>}
                  </div>
                  {this.state.show && this.state.stockStatusList.length > 0 &&
                    <FormGroup className="col-md-12 mt-2 " style={{ display: this.state.display }}>
                      <ul className="legendcommitversion list-group">
                        {
                          <>
                            <li><span className="redlegend "></span> <span className="legendcommitversionTextStock"><b>{i18n.t("static.supplyPlan.stockBalance")}/{i18n.t("static.report.mos")} : </b></span></li>
                            <li><span className="legendcolor"></span> <span className="legendcommitversionText"><b>{i18n.t('static.supplyPlan.actualBalance')}</b></span></li>
                            <li><span className="legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.projectedBalance')}</span></li>
                            <li><span className="legendcolor" style={{ backgroundColor: "#BA0C2F" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.stockout')}</span></li>
                            <li><span className="legendcolor" style={{ backgroundColor: "#f48521" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.lowstock')}</span></li>
                            <li><span className="legendcolor" style={{ backgroundColor: "#118b70" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.okaystock')}</span></li>
                            <li><span className="legendcolor" style={{ backgroundColor: "#edb944" }}></span> <span className="legendcommitversionText">{i18n.t('static.report.overstock')}</span></li>
                            <li><span className="legendcolor" style={{ backgroundColor: "#cfcdc9" }}></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlanFormula.na')}</span></li></>
                        }
                      </ul>
                    </FormGroup>
                  }
                  {this.state.show && this.state.stockStatusList.length > 0 && <Table responsive className="table-striped table-bordered text-center mt-2">
                    <thead>
                      <tr>
                        <th rowSpan="2" style={{ width: "200px" }}>{i18n.t('static.common.month')}</th>
                        <th className="text-center" colSpan="1"> {i18n.t('static.report.stock')} </th>
                        <th className="text-center" colSpan={(this.state.programId.length > 1 || this.state.planningUnitId.length > 1 || this.state.realmCountryPlanningUnitId.length > 1) ? "3" : "2"}> {i18n.t('static.supplyPlan.consumption')} </th>
                        <th className="text-center" colSpan="2"> {i18n.t('static.shipment.shipment')} </th>
                        <th className="text-center" colSpan="6"> {i18n.t('static.report.stock')} </th>
                      </tr>
                      <tr>
                        <th title={this.state.yaxisEquUnit == -1 ? (this.state.programId.length == 1 ? i18n.t('static.stockStatus.openingBalanceTooltipSingleProgram') : i18n.t('static.stockStatus.openingBalanceTooltipMultiProgram')) : i18n.t('static.stockStatus.openingBalanceTooltipEU')} className="text-center" style={{ width: "200px" }}>{i18n.t('static.supplyPlan.openingBalance')}<i class="fa fa-info-circle icons pl-lg-2" style={{ color: '#002f6c' }}></i></th>
                        <th title={this.state.yaxisEquUnit == -1 ? (this.state.programId.length == 1 ? i18n.t('static.stockStatus.forecastedTooltipSingleProgram') : i18n.t('static.stockStatus.forecastedTooltipMultiProgram')) : i18n.t('static.stockStatus.forecastedTooltipEU')} className="text-center" style={{ width: "200px" }}>{i18n.t('static.report.forecasted')}<i class="fa fa-info-circle icons pl-lg-2" style={{ color: '#002f6c' }}></i></th>
                        <th title={this.state.yaxisEquUnit == -1 ? (this.state.programId.length == 1 ? i18n.t('static.stockStatus.actualTooltipSingleProgram') : i18n.t('static.stockStatus.actualTooltipMultiProgram')) : i18n.t('static.stockStatus.actualTooltipEU')} className="text-center" style={{ width: "200px" }}> {i18n.t('static.report.actual')}<i class="fa fa-info-circle icons pl-lg-2" style={{ color: '#002f6c' }}></i> </th>
                        {(this.state.programId.length > 1 || this.state.planningUnitId.length > 1 || this.state.realmCountryPlanningUnitId.length > 1) && <th title={this.state.yaxisEquUnit == -1 ? (this.state.programId.length == 1 ? i18n.t('static.stockStatus.consensusTooltipSingleProgram') : i18n.t('static.stockStatus.consensusTooltipMultiProgram')) : i18n.t('static.stockStatus.consensusTooltipEU')} className="text-center" style={{ width: "200px" }}> {i18n.t('static.stockStatus.consensus')}<i class="fa fa-info-circle icons pl-lg-2" style={{ color: '#002f6c' }}></i> </th>}
                        <th className="text-center" title={this.state.yaxisEquUnit != -1 ? i18n.t('static.stockStatus.shipmentQtyTooltipEU') : ''} style={{ width: "200px" }}>{i18n.t('static.report.qty')}{this.state.yaxisEquUnit != -1 && <i class="fa fa-info-circle icons pl-lg-2" style={{ color: '#002f6c' }}></i>}</th>
                        <th className="text-center" title={i18n.t('static.stockStatus.shipmemtTooltip')} style={{ width: "600px" }}>{i18n.t('static.report.qty') + " | " + (i18n.t('static.budget.fundingsource') + " | " + i18n.t('static.supplyPlan.shipmentStatus') + " | " + (i18n.t('static.report.procurementAgentName')) + " | " + (i18n.t('static.mt.roNoAndPrimeLineNo')) + " | " + (i18n.t('static.mt.orderNoAndPrimeLineNo')))}<i class="fa fa-info-circle icons pl-lg-2" style={{ color: '#002f6c' }}></i></th>
                        <th title={this.state.yaxisEquUnit == -1 ? (this.state.programId.length == 1 ? i18n.t('static.stockStatus.adjustmentQtyTooltipSingleProgram') : i18n.t('static.stockStatus.adjustmentQtyTooltipMultiProgram')) : i18n.t('static.stockStatus.adjustmentQtyTooltipEU')} className="text-center" style={{ width: "200px" }}>{i18n.t('static.report.adjustmentQty')}<i class="fa fa-info-circle icons pl-lg-2" style={{ color: '#002f6c' }}></i></th>
                        <th title={this.state.yaxisEquUnit == -1 ? (this.state.programId.length == 1 ? i18n.t('static.stockStatus.expiredStockTooltipSingleProgram') : i18n.t('static.stockStatus.expiredStockTooltipMultiProgram')) : i18n.t('static.stockStatus.expiredStockTooltipEU')} className="text-center" style={{ width: "200px" }}>{i18n.t('static.supplyplan.exipredStock')}<i class="fa fa-info-circle icons pl-lg-2" style={{ color: '#002f6c' }}></i></th>
                        <th title={this.state.yaxisEquUnit == -1 ? (this.state.programId.length == 1 ? i18n.t('static.stockStatus.endingBalanceTooltipSingleProgram') : i18n.t('static.stockStatus.endingBalanceTooltipMultiProgram')) : i18n.t('static.stockStatus.endingBalanceTooltipEU')} className="text-center" style={{ width: "200px" }}>{i18n.t('static.supplyPlan.endingBalance')}<i class="fa fa-info-circle icons pl-lg-2" style={{ color: '#002f6c' }}></i></th>
                        <th title={this.state.yaxisEquUnit == -1 ? (this.state.programId.length == 1 ? i18n.t('static.stockStatus.amcTooltipSingleProgram') : i18n.t('static.stockStatus.amcTooltipMultiProgram')) : i18n.t('static.stockStatus.amcTooltipEU')} className="text-center" style={{ width: "200px" }}>{i18n.t('static.report.amc')}<i class="fa fa-info-circle icons pl-lg-2" style={{ color: '#002f6c' }}></i></th>
                        <th className="text-center" style={{ width: "200px" }}>{this.state.stockStatusList.length > 0 && this.state.stockStatusList[0].planBasedOn == 1 ? i18n.t('static.report.mos') : i18n.t('static.supplyPlan.maxQty')}</th>
                        <th className="text-center" style={{ width: "200px" }}>{i18n.t('static.supplyPlan.unmetDemandStr')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        this.state.stockStatusList.length > 0
                        &&
                        this.state.stockStatusList.map((item, idx) =>
                          <tr id="addr0" key={idx} >
                            <td>
                              {dateFormatter(this.state.stockStatusList[idx].dt)}
                            </td>
                            {(idx == 0 ? this.state.firstMonthRegionCount : this.state.stockStatusList[idx - 1].regionCount) == (idx == 0 ? this.state.firstMonthRegionCountForStock : this.state.stockStatusList[idx - 1].regionCountForStock) ?
                              <td><b>{formatter(roundARU(this.state.stockStatusList[idx].openingBalance, 1), 0)}</b></td> : <td>{formatter(roundARU(this.state.stockStatusList[idx].openingBalance, 1), 0)}</td>}
                            <td className={this.rowtextFormatClassName(this.state.stockStatusList[idx])}>
                              {formatter(roundARU(this.state.stockStatusList[idx].forecastedConsumptionQty, 1), 0)}
                            </td> <td>
                              {formatter(roundARU(this.state.stockStatusList[idx].actualConsumptionQty, 1), 0)}
                            </td>
                            {(this.state.programId.length > 1 || this.state.planningUnitId.length > 1 || this.state.realmCountryPlanningUnitId.length > 1) && <td>
                              {formatter(roundARU(this.state.stockStatusList[idx].finalConsumptionQty, 1), 0)}
                            </td>}
                            <td>
                              {this.state.stockStatusList[idx].shipmentInfo.length > 0 ? formatter(roundARU(this.state.stockStatusList[idx].shipmentQty, 1), 0) : ""}
                            </td>
                            <td align="center"><table >
                              {this.state.stockStatusList[idx].shipmentInfo.map((item, index) => {
                                return (<tr  >
                                  <td title={getLabelText(item.planningUnit.label, this.state.lang) + " - " + item.planningUnit.id} padding="0" id={"shipmentPopup" + idx + index}>{(this.state.programId.length > 1 ? item.program.code + ` | ` : "") + formatter(roundARU(item.shipmentQty, 1), 0) + `   |    ${item.fundingSource.code}    |    ${item.shipmentStatus.label.label_en}   |    ${item.procurementAgent.code} `} {item.orderNo == null &&
                                    item.primeLineNo == null &&
                                    item.roNo == null &&
                                    item.roPrimeLineNo == null
                                    ? " | N/A"
                                    : `${item.roNo == null &&
                                      item.roPrimeLineNo == null
                                      ? ""
                                      : " | " +
                                      item.roNo +
                                      "-" +
                                      item.roPrimeLineNo
                                    }   ${item.orderNo == null &&
                                      item.primeLineNo == null
                                      ? ""
                                      : item.orderNo == null
                                        ? ""
                                        : " | " + item.orderNo
                                    }   ${item.primeLineNo == null
                                      ? ""
                                      : "-" + item.primeLineNo
                                    }`}
                                    {/* <div>
                                    <Popover placement="top" isOpen={this.state.shipmentPopup} target={"shipmentPopup"+idx+index} trigger="hover" toggle={this.toggleShipmentPopup}>
                                      <PopoverBody>{i18n.t('static.tooltip.LinearRegression')}</PopoverBody>
                                    </Popover>
                                  </div> */}
                                  </td></tr>)
                              })}</table>
                            </td>
                            <td>
                              {formatter(this.state.stockStatusList[idx].adjustment == 0 ? this.state.stockStatusList[idx].regionCountForStock > 0 ? roundARU(this.state.stockStatusList[idx].nationalAdjustment, 1) : "" : this.state.stockStatusList[idx].regionCountForStock > 0 ? Number(roundARU(this.state.stockStatusList[idx].nationalAdjustment, 1)) + Number(roundARU(this.state.stockStatusList[idx].adjustment, 1)) : roundARU(this.state.stockStatusList[idx].adjustment, 1), 0)}
                            </td>
                            <td>
                              {this.state.stockStatusList[idx].expiredStock != 0 ? formatter(roundARU(this.state.stockStatusList[idx].expiredStock, 1), 0) : ''}
                            </td>
                            {this.state.stockStatusList[idx].regionCount == this.state.stockStatusList[idx].regionCountForStock ?
                              <td style={{ backgroundColor: this.state.stockStatusList[0].planBasedOn == 2 ? this.state.stockStatusList[idx].closingBalance == null ? "#cfcdc9" : this.state.stockStatusList[idx].closingBalance == 0 ? "#BA0C2F" : this.state.stockStatusList[idx].closingBalance < this.state.stockStatusList[idx].minStockQty ? "#f48521" : this.state.stockStatusList[idx].closingBalance > this.state.stockStatusList[idx].maxStockQty ? "#edb944" : "#118b70" : "" }}><b>{formatter(roundARU(this.state.stockStatusList[idx].closingBalance, 1), 0)}</b></td> : <td style={{ backgroundColor: this.state.stockStatusList[0].planBasedOn == 2 ? this.state.stockStatusList[idx].closingBalance == null ? "#cfcdc9" : this.state.stockStatusList[idx].closingBalance == 0 ? "#BA0C2F" : this.state.stockStatusList[idx].closingBalance < this.state.stockStatusList[idx].minStockQty ? "#f48521" : this.state.stockStatusList[idx].closingBalance > this.state.stockStatusList[idx].maxStockQty ? "#edb944" : "#118b70" : "" }}>{formatter(roundARU(this.state.stockStatusList[idx].closingBalance, 1), 0)}</td>}
                            <td>
                              {formatter(roundAMC(this.state.stockStatusList[idx].amc, 0))}
                            </td>
                            <td style={{ backgroundColor: this.state.stockStatusList[0].planBasedOn == 1 ? this.state.stockStatusList[idx].mos == null ? "#cfcdc9" : this.state.stockStatusList[idx].mos == 0 ? "#BA0C2F" : this.state.stockStatusList[idx].mos < this.state.stockStatusList[idx].minStockMos ? "#f48521" : this.state.stockStatusList[idx].mos > this.state.stockStatusList[idx].maxStockMos ? "#edb944" : "#118b70" : "" }}>
                              {this.state.stockStatusList[0].planBasedOn == 1 ? this.state.stockStatusList[idx].mos != null ? roundAMC(this.state.stockStatusList[idx].mos) : i18n.t("static.supplyPlanFormula.na") : formatter(roundAMC(this.state.stockStatusList[idx].maxStockQty, 0))}
                            </td>
                            <td>
                              {this.state.stockStatusList[idx].unmetDemand != 0 ? formatter(roundARU(this.state.stockStatusList[idx].unmetDemand, 1), 0) : ''}
                            </td>
                          </tr>)
                      }
                    </tbody>
                  </Table>}
                </Col>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                  <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                    <div class="align-items-center">
                      <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                      <div class="spinner-border blue ml-4" role="status">
                      </div>
                    </div>
                  </div>
                </div>
              </div></div>
            <Modal isOpen={this.state.exportModal}
              className={'modal-md'}>
              <ModalHeader toggle={() => this.toggleExport(0)} className="modalHeaderSupplyPlan" id="shipmentModalHeader">
                <strong>{this.state.type == 1 ? i18n.t("static.supplyPlan.exportAsPDF") : i18n.t("static.supplyPlan.exportAsCsv")}</strong>
              </ModalHeader>
              <ModalBody>
                <>
                  <FormGroup className="col-md-12">
                    <div className="controls ">
                      <FormGroup>
                        <Label>{i18n.t('static.stockStatus.doYouWantToAggregate')}</Label>
                        <FormGroup check inline style={{ "padding-left": "0px", "margin-left": "0px" }}>
                          <Input
                            className="form-check-input"
                            type="radio"
                            id="isAggregateTrue"
                            name="isAggregate"
                            value={true}
                            checked={this.state.isAggregate == true || this.state.isAggregate == "true"}
                            onChange={(e) => { this.setIsAggregate(e) }}
                          />
                          <Label
                            className="form-check-label"
                            check htmlFor="isAggregateTrue">
                            {i18n.t('static.program.yes')}
                          </Label>
                        </FormGroup>
                        <FormGroup check inline>
                          <Input
                            className="form-check-input"
                            type="radio"
                            id="isAggregateFalse"
                            name="isAggregate"
                            value={false}
                            checked={this.state.isAggregate == false || this.state.isAggregate == "false"}
                            onChange={(e) => { this.setIsAggregate(e) }}
                          />
                          <Label
                            className="form-check-label"
                            check htmlFor="isAggregateFalse">
                            {i18n.t('static.program.no')}
                          </Label>
                        </FormGroup>
                      </FormGroup>
                      {this.state.viewById == 1 && <FormGroup>
                        <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                        <MultiSelect
                          bsSize="sm"
                          name="planningUnitIdExport"
                          id="planningUnitIdExport"
                          filterOptions={filterOptions}
                          value={this.state.planningUnitIdExport}
                          onChange={(e) => { this.setPlanningUnitExport(e); }}
                          options={puList && puList.length > 0 ? puList : []}
                        />
                      </FormGroup>}
                      {this.state.viewById == 2 && <FormGroup>
                        <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.countrysku')}</Label>
                        <MultiSelect
                          bsSize="sm"
                          name="realmCountryPlanningUnitIdExport"
                          id="realmCountryPlanningUnitIdExport"
                          value={this.state.realmCountryPlanningUnitIdExport}
                          filterOptions={filterOptions}
                          onChange={(e) => { this.setRealmCountryPlanningUnitExport(e); }}
                          options={rcpuList && rcpuList.length > 0 ? rcpuList : []}
                        />
                      </FormGroup>}
                      {/* <MultiSelect
                        name="planningUnitIdsExport"
                        id="planningUnitIdsExport"
                        filterOptions={filterOptions}
                        options={this.state.planningUnitList && this.state.planningUnitList.length > 0 ? this.state.planningUnitList : []}
                        value={this.state.planningUnitIdsExport}
                        onChange={(e) => { this.setPlanningUnitIdsExport(e) }}
                        labelledBy={i18n.t('static.common.select')}
                      /> */}
                    </div>
                  </FormGroup>
                  {((this.state.yaxisEquUnit == -1 && this.state.isAggregate.toString() == "true" && (this.state.viewById == 1 ? this.state.planningUnitIdExport : this.state.realmCountryPlanningUnitIdExport).length > 1)) && <span className="red">When selecting multiple programs, please only choose one product (PU or ARU). Alternatively, choose an EU to allow aggregation across products.</span>}
                </>
              </ModalBody>
              <ModalFooter>
                {(this.state.viewById == 1 ? this.state.planningUnitIdExport.length > 0 : this.state.realmCountryPlanningUnitIdExport.length > 0) && (!(this.state.yaxisEquUnit == -1 && this.state.isAggregate.toString() == "true" && (this.state.viewById == 1 ? this.state.planningUnitIdExport : this.state.realmCountryPlanningUnitIdExport).length > 1)) && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.exportData(this.state.type)} ><i className="fa fa-check"></i>{i18n.t("static.common.submit")}</Button>}
              </ModalFooter>
            </Modal>
          </CardBody>
        </Card>
      </div>
    );
  }
  /**
   * Toggles the export modal and updates the state with the selected planning unit IDs for export.
   * @param {number} type - The type of export action. 1 for PDF export, 2 for CSV export.
   */
  toggleExport(type) {
    var list = this.state.planningUnitsMulti;
    this.setState({
      exportModal: !this.state.exportModal,
      planningUnitIdsExport: type != 0 ? list.filter(c => c.value == document.getElementById("planningUnitId").value) : [],
      type: type
    })
  }
  /**
   * Sets the planning unit IDs for export in the state.
   * @param {Array} e - An array containing the planning unit IDs to be exported.
   */
  setPlanningUnitIdsExport(e) {
    this.setState({
      planningUnitIdsExport: e,
    })
  }
}
export default StockStatus;