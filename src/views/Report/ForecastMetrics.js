import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import { Search } from 'react-bootstrap-table2-toolkit';
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import {
  Card,
  CardBody,
  Form,
  FormGroup, Input, InputGroup,
  Label
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, PROGRAM_TYPE_SUPPLY_PLAN, SECRET_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import TracerCategoryService from '../../api/TracerCategoryService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import { addDoubleQuoteToRowContent, filterOptions, makeText, roundN2 } from '../../CommonComponent/JavascriptCommonFunctions';
const ref = React.createRef();
/**
 * Component for Forecast Metrics Report.
 */
class ForecastMetrics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      lang: localStorage.getItem('lang'),
      countrys: [],
      planningUnits: [],
      consumptions: [],
      productCategories: [],
      programs: [],
      countryValues: [],
      countryLabels: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      programValues: [],
      programLabels: [],
      message: '',
      singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
      minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
      maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
      loading: true,
      programLst: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
      tracerCategories: [],
    };
    this.getCountrys = this.getCountrys.bind(this);
    this.filterData = this.filterData.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeProgram = this.handleChangeProgram.bind(this)
    this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
    this.pickAMonth2 = React.createRef();
    this.buildJExcel = this.buildJExcel.bind(this);
    this.filterProgram = this.filterProgram.bind(this)
    this.filterTracerCategory = this.filterTracerCategory.bind(this);
  }
  /**
   * Exports the data to a CSV file.
   */
  exportCSV() {
    var csvRow = [];
    csvRow.push('"' + (i18n.t('static.report.month') + ' : ' + makeText(this.state.singleValue2)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.report.timeWindow') + ' : ' + (document.getElementById("viewById").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    this.state.countryLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    this.state.programLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    this.state.planningUnitLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    this.state.tracerCategoryLabels.map(ele =>
      csvRow.push('"' + (i18n.t('static.tracercategory.tracercategory')).replaceAll(' ', '%20') + ' : ' + (ele.toString()).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    csvRow.push('"' + ((i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text).replaceAll(' ', '%20') + '"'))
    csvRow.push('')
    csvRow.push('')
    csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    var re;
    var A = [addDoubleQuoteToRowContent([(i18n.t('static.program.program')).replaceAll(' ', '%20'), (i18n.t('static.report.qatPID')).replaceAll(' ', '%20'), (i18n.t('static.dashboard.planningunit')).replaceAll(' ', '%20'),
    (i18n.t('static.report.error')).replaceAll(' ', '%20'), (i18n.t('static.report.noofmonth')).replaceAll(' ', '%20')])]
    re = this.state.consumptions
    for (var item = 0; item < re.length; item++) {
      A.push([addDoubleQuoteToRowContent([(getLabelText(re[item].program.label).replaceAll(',', '%20')).replaceAll(' ', '%20'), re[item].planningUnit.id, re[item].planningUnit.id == 0 ? '' : (getLabelText(re[item].planningUnit.label)).replaceAll(' ', '%20'),
      re[item].message != null ? (i18n.t(re[item].message)).replaceAll(' ', '%20') : roundN2(re[item].forecastError) + '%', re[item].monthCount])])
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.forecastmetrics') + ".csv"
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
    const addHeaders = doc => {
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFont('helvetica', 'bold')
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12)
        doc.setPage(i)
        doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.dashboard.forecastmetrics'), doc.internal.pageSize.width / 2, 50, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.text(i18n.t('static.report.month') + ' : ' + makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.report.timeWindow') + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
        }
      }
    }
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";
    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size, true);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal')
    doc.setTextColor("#002f6c");
    var y = 130;
    var planningText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
    }
    planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
    }
    planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, planningText[i]);
      y = y + 10;
    }
    let tracerCategoryText = doc.splitTextToSize((i18n.t('static.tracercategory.tracercategory') + ' : ' + this.state.tracerCategoryLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
    y = y + 10;
    for (var i = 0; i < tracerCategoryText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;
      }
      doc.text(doc.internal.pageSize.width / 8, y, tracerCategoryText[i]);
      y = y + 10;
    }
    doc.text(i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text, doc.internal.pageSize.width / 8, y, {
      align: 'left'
    })
    var height = doc.internal.pageSize.height;
    var h1 = 50;
    let startY = y + 20
    let pages = Math.ceil(startY / height)
    for (var j = 1; j < pages; j++) {
      doc.addPage()
    }
    let startYtable = startY - ((height - h1) * (pages - 1))
    const headers = [[i18n.t('static.program.program'), i18n.t('static.report.qatPID'), i18n.t('static.dashboard.planningunit'),
    i18n.t('static.report.error'), i18n.t('static.report.noofmonth')]]
    const data = this.state.consumptions.map(elt => [getLabelText(elt.program.label), elt.planningUnit.id, getLabelText(elt.planningUnit.label),
    elt.message != null ? i18n.t(elt.message) : roundN2(elt.forecastError) + '%', elt.monthCount]);
    let content = {
      margin: { top: 80, bottom: 50 },
      startY: startYtable,
      head: headers,
      body: data,
      styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 169.0 },
        1: { cellWidth: 141 },
        2: { cellWidth: 169.89 },
        3: { cellWidth: 141 },
        4: { cellWidth: 141 }
      }
    };
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.dashboard.forecastmetrics') + ".pdf")
  }
  /**
   * Handles the change event for tracer categories.
   * @param {Array} tracerCategoryIds - An array containing the selected tracer category IDs.
   */
  handleTracerCategoryChange = (tracerCategoryIds) => {
    tracerCategoryIds = tracerCategoryIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      tracerCategoryValues: tracerCategoryIds.map(ele => ele),
      tracerCategoryLabels: tracerCategoryIds.map(ele => ele.label)
    }, () => {
      this.getPlanningUnit();
    })
  }
  /**
   * Handles the change event for countries.
   * @param {Array} countrysId - An array containing the selected country IDs.
   */
  handleChange(countrysId) {
    countrysId = countrysId.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      countryValues: countrysId.map(ele => ele),
      countryLabels: countrysId.map(ele => ele.label),
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      tracerCategories: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
    }, () => {
      this.filterProgram();
    })
  }
  /**
   * Filters programs based on selected countries.
   */
  filterProgram = () => {
    let countryIds = this.state.countryValues.map(ele => ele.value);
    this.setState({
      programLst: [],
      programValues: [],
      programLabels: []
    }, () => {
      if (countryIds.length != 0) {
        let newCountryList = [... new Set(countryIds)];
        DropdownService.getSPProgramWithFilterForMultipleRealmCountryForDropdown(newCountryList)
          .then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = a.code.toUpperCase();
              var itemLabelB = b.code.toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            if (listArray.length > 0) {
              this.setState({
                programLst: listArray
              }, () => {
                this.filterData()
              });
            } else {
              this.setState({
                programLst: []
              }, () => {
                this.filterData()
              });
            }
          }).catch(
            error => {
              this.setState({
                programLst: [], loading: false
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
        this.setState({
          programLst: []
        }, () => {
          this.filterData()
        });
      }
    })
  }
  /**
   * Handles the change event for program selection.
   * @param {array} programIds - The array of selected program IDs.
   */
  handleChangeProgram(programIds) {
    programIds = programIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      programValues: programIds.map(ele => ele),
      programLabels: programIds.map(ele => ele.label),
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      tracerCategories: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
    }, () => {
      this.filterTracerCategory(programIds);
      this.getPlanningUnit();
    })
  }
  /**
   * Retrieves and filters tracer categories based on the provided program IDs.
   * @param {Array} programIds - An array containing the selected program IDs.
   */
  filterTracerCategory(programIds) {
    this.setState({
      tracerCategories: [],
      tracerCategoryValues: [],
      tracerCategoryLabels: [],
    }, () => {
      if (programIds.length > 0) {
        var programIdsValue = [];
        for (var i = 0; i < programIds.length; i++) {
          programIdsValue.push(programIds[i].value);
        }
        let realmId = AuthenticationService.getRealmId();
        TracerCategoryService.getTracerCategoryByProgramIds(realmId, programIdsValue)
          .then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
              tracerCategories: listArray
            }, () => {
              this.filterData()
            });
          }).catch(
            error => {
              this.setState({
                tracerCategories: []
              }, () => {
                this.filterData()
              });
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
                      tracerCategories: [],
                      message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                      loading: false
                    }, () => {
                      this.filterData()
                    });
                    break;
                  case 412:
                    this.setState({
                      tracerCategories: [],
                      message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                      loading: false
                    }, () => {
                      this.filterData()
                    });
                    break;
                  default:
                    this.setState({
                      tracerCategories: [],
                      message: 'static.unkownError',
                      loading: false
                    }, () => {
                      this.filterData()
                    });
                    break;
                }
              }
            }
          );
        if (programIdsValue.length == 0) {
          this.setState({ message: i18n.t('static.common.selectProgram'), data: [], selData: [] });
        } else {
          this.setState({ message: '' });
        }
      }
    })
  }
  /**
   * Handles the change event for planning units.
   * @param {Array} planningUnitIds - An array containing the selected planning unit IDs.
   */
  handlePlanningUnitChange(planningUnitIds) {
    planningUnitIds = planningUnitIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      planningUnitValues: planningUnitIds.map(ele => ele),
      planningUnitLabels: planningUnitIds.map(ele => ele.label)
    }, () => {
      this.filterData()
    })
  }
  /**
     * Builds the jexcel table based on the consumption list.
     */
  buildJExcel() {
    let consumptions = this.state.consumptions;
    let consumptionArray = [];
    let count = 0;
    for (var j = 0; j < consumptions.length; j++) {
      data = [];
      data[0] = (consumptions[j].program.code)
      data[1] = getLabelText(consumptions[j].planningUnit.label, this.state.lang)
      data[2] = consumptions[j].message != null ? "" : roundN2(consumptions[j].forecastError);
      data[3] = consumptions[j].monthCount;
      data[4] = roundN2(consumptions[j].forecastError);
      data[5] = consumptions[j].forecastErrorThreshold;
      consumptionArray[count] = data;
      count++;
    }
    this.el = jexcel(document.getElementById("tableDiv"), '');
    jexcel.destroy(document.getElementById("tableDiv"), true);
    var data = consumptionArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [150, 150, 100],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: i18n.t('static.program.program'),
          type: 'text',
        },
        {
          title: i18n.t('static.dashboard.planningunit'),
          type: 'text',
        },
        {
          title: i18n.t('static.report.error'),
          type: 'numeric',
          mask: '#,##.00%', decimal: '.'
        },
        {
          title: i18n.t('static.report.noofmonth'),
          type: 'numeric', mask: '#,##'
        },
        {
          title: i18n.t('static.report.error'),
          type: 'hidden',
          // title: 'A',
          // type: 'text',
          // visible: false
        },
        {
          title: i18n.t('static.report.forecastErrorThreshold'),
          type: 'hidden',
        },
      ],
      editable: false,
      onsearch: function (el) {
      },
      onfilter: function (el) {
      },
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
      filters: true,
      license: JEXCEL_PRO_KEY,
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
   * Callback function triggered when the Jexcel instance is loaded to format the table.
   */
  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunction(instance);
    var elInstance = instance.worksheets[0];
    var json = elInstance.getJson();
    var colArr = ['A', 'B', 'C', 'D', 'E']
    for (var j = 0; j < json.length; j++) {
      var rowData = elInstance.getRowData(j);
      var forecastError = rowData[4];
      if (forecastError > rowData[5]) {
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
   * Filters data based on selected parameters and updates component state accordingly.
   */
  filterData() {
    let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
    let planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value).toString());
    let tracercategory = this.state.tracerCategoryValues.length == this.state.tracerCategories.length ? [] : this.state.tracerCategoryValues.map(ele => (ele.value).toString());
    let programIds = this.state.programValues.length == this.state.programLst.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
    let startDate = (this.state.singleValue2.year) + '-' + this.state.singleValue2.month + '-01';
    let monthInCalc = document.getElementById("viewById").value;
    let useApprovedVersion = document.getElementById("includeApprovedVersions").value
    if (this.state.countryValues.length > 0 && this.state.planningUnitValues.length > 0 && this.state.programValues.length > 0 && this.state.tracerCategoryValues.length > 0) {
      this.setState({ loading: true })
      var inputjson = {
        "realmCountryIds": CountryIds, "programIds": programIds, "planningUnitIds": planningUnitIds, "startDate": startDate, "previousMonths": monthInCalc, "useApprovedSupplyPlanOnly": useApprovedVersion, "tracerCategoryIds": tracercategory,
      }
      ReportService.getForecastError(inputjson)
        .then(response => {
          this.setState({
            consumptions: response.data,
            message: ''
          }, () => {
            this.buildJExcel();
          });
        }).catch(
          error => {
            this.setState({
              consumptions: [], loading: false
            }, () => {
              this.el = jexcel(document.getElementById("tableDiv"), '');
              jexcel.destroy(document.getElementById("tableDiv"), true);
            });
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
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                    loading: false
                  });
                  break;
                case 412:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
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
    } else if (this.state.countryValues.length == 0) {
      this.setState({
        message: i18n.t('static.program.validcountrytext'),
        consumptions: [],
        programValues: [],
        programLabels: [],
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: [],
        tracerCategories: [],
        tracerCategoryValues: [],
        tracerCategoryLabels: [],
      }, () => {
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
      });
    } else if (this.state.programValues.length == 0) {
      this.setState({
        message: i18n.t('static.common.selectProgram'),
        consumptions: [],
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: [],
        tracerCategories: [],
        tracerCategoryValues: [],
        tracerCategoryLabels: [],
      }, () => {
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
      });
    } else if (this.state.tracerCategoryValues.length == 0) {
      this.setState({
        message: i18n.t('static.tracercategory.tracercategoryText'),
        consumptions: [],
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: [],
      }, () => {
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
      });
    } else if (this.state.planningUnitValues.length == 0) {
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] }, () => {
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
      });
    }
  }
  /**
   * Retrieves the list of countries based on the realm ID and updates the state with the list.
   */
  getCountrys() {
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getRealmCountryDropdownList(realmId)
        .then(response => {
          var listArray = response.data;
          listArray.sort((a, b) => {
            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            countrys: listArray, loading: false
          })
        }).catch(
          error => {
            this.setState({
              countrys: [], loading: false
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
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                    loading: false
                  });
                  break;
                case 412:
                  this.setState({
                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
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
      const lan = 'en';
      var db1;
      getDatabase();
      var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['CountryData'], 'readwrite');
        var Country = transaction.objectStore('CountryData');
        var getRequest = Country.getAll();
        var proList = []
        getRequest.onerror = function (event) {
        };
        getRequest.onsuccess = function (event) {
          var myResult = [];
          myResult = getRequest.result;
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          for (var i = 0; i < myResult.length; i++) {
            if (myResult[i].userId == userId) {
              var bytes = CryptoJS.AES.decrypt(myResult[i].CountryName, SECRET_KEY);
              var CountryNameLabel = bytes.toString(CryptoJS.enc.Utf8);
              var CountryJson = {
                name: getLabelText(JSON.parse(CountryNameLabel), lan) + "~v" + myResult[i].version,
                id: myResult[i].id
              }
              proList[i] = CountryJson
            }
          }
          proList.sort((a, b) => {
            var itemLabelA = a.name.toUpperCase();
            var itemLabelB = b.name.toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            countrys: proList
          })
        }.bind(this);
      }
    }
  }
  /**
   * Retrieves the list of planning units for a selected programs.
   */
  getPlanningUnit() {
    if (this.state.tracerCategoryValues.length > 0) {
      let programValues = this.state.programValues;
      this.setState({
        planningUnits: [],
        planningUnitValues: [],
        planningUnitLabels: []
      }, () => {
        if (programValues.length > 0) {
          let inputjson = {
            tracerCategoryIds: this.state.tracerCategoryValues.map(ele => (ele.value).toString()),
            programIds: programValues.map(ele => (ele.value))
          }
          DropdownService.getProgramPlanningUnitDropdownList(inputjson).then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
              var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
              var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
              planningUnits: listArray,
              planningUnitValues: listArray.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
              }, this),
              planningUnitLabels: listArray.map((item, i) => {
                return (getLabelText(item.label, this.state.lang))
              }, this),
              message: ''
            }, () => {
              this.filterData();
            })
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
      })
    } else {
      this.filterData();
    }
  }
  /**
   * Calls the get countrys function on page load
   */
  componentDidMount() {
    this.getCountrys();
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  handleClickMonthBox2 = (e) => {
    this.refs.pickAMonth2.show()
  }
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleAMonthDissmis2 = (value) => {
    this.setState({ singleValue2: value }, () => {
      this.filterData();
    })
  }
  /**
   * Displays a loading indicator while data is being loaded.
   */
  loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
  /**
   * Renders the Forecast Metrics Report table.
   * @returns {JSX.Element} - Forecast Metrics Report table.
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const { planningUnits } = this.state;
    let planningUnitList = [];
    planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return (
          { label: getLabelText(item.label, this.state.lang), value: item.id }
        )
      }, this);
    const { programLst } = this.state;
    let programList = [];
    programList = programLst.length > 0
      && programLst.map((item, i) => {
        return (
          { label: item.code, value: item.id }
        )
      }, this);
    const { countrys } = this.state;
    let countryList = countrys.length > 0 && countrys.map((item, i) => {
      return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
    }, this);
    const { tracerCategories } = this.state;
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
        text: 'All', value: this.state.consumptions.length
      }]
    };
    const { SearchBar, ClearSearchButton } = Search;
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
      </span>
    );
    const pickerLang = {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      from: 'From', to: 'To',
    }
    const { singleValue2 } = this.state
    const makeText = m => {
      if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
      return '?'
    }
    return (
      <div className="animated fadeIn" >
        <AuthenticationServiceComponent history={this.props.history} />
        <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
        <h5 className="red">{i18n.t(this.state.message)}</h5>
        <SupplyPlanFormulas ref="formulaeChild" />
        <Card>
          <div className="Card-header-reporticon">
            <div className="card-header-actions">
              <a className="card-header-action">
                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleForecastMatrix1() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
              </a>
              {this.state.consumptions.length > 0 &&
                <a className="card-header-action">
                  <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                  <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                </a>
              }
            </div>
          </div>
          <CardBody className="pb-lg-5 pt-lg-0 ">
            <div ref={ref}>
              <Form >
                <div className="pl-0" >
                  <div className="row">
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.selectMonth')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                      <div className="controls edit">
                        <Picker
                          ref="pickAMonth2"
                          years={{ min: this.state.minDate, max: this.state.maxDate }}
                          value={singleValue2}
                          lang={pickerLang.months}
                          theme="dark"
                          onDismiss={this.handleAMonthDissmis2}
                        >
                          <MonthBox value={makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
                        </Picker>
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.timeWindow')}</Label>
                      <div className="controls">
                        <InputGroup>
                          <Input
                            type="select"
                            name="viewById"
                            id="viewById"
                            bsSize="sm"
                            onChange={this.filterData}
                          >
                            <option value="5">6 {i18n.t('static.dashboard.months')}</option>
                            <option value="2">3 {i18n.t('static.dashboard.months')}</option>
                            <option value="8">9 {i18n.t('static.dashboard.months')}</option>
                            <option value="11">12 {i18n.t('static.dashboard.months')}</option>
                          </Input>
                        </InputGroup>
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3" style={{ zIndex: '2' }}>
                      <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}</Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <div className="controls edit">
                        <MultiSelect
                          bsSize="sm"
                          name="countrysId"
                          id="countrysId"
                          value={this.state.countryValues}
                          onChange={(e) => { this.handleChange(e) }}
                          options={countryList && countryList.length > 0 ? countryList : []}
                          disabled={this.state.loading}
                          overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                          selectSomeItems: i18n.t('static.common.select')}}
                          filterOptions={filterOptions}
                        />
                        {!!this.props.error &&
                          this.props.touched && (
                            <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                          )}
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3">
                      <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <MultiSelect
                        bsSize="sm"
                        name="programIds"
                        id="programIds"
                        value={this.state.programValues}
                        onChange={(e) => { this.handleChangeProgram(e) }}
                        options={programList && programList.length > 0 ? programList : []}
                        disabled={this.state.loading}
                        overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                        selectSomeItems: i18n.t('static.common.select')}}
                        filterOptions={filterOptions}
                      />
                      {!!this.props.error &&
                        this.props.touched && (
                          <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                        )}
                    </FormGroup>
                    <FormGroup className="col-md-3" style={{ zIndex: '1' }}>
                      <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <div className="controls">
                        <MultiSelect
                          name="tracerCategoryId"
                          id="tracerCategoryId"
                          bsSize="sm"
                          value={this.state.tracerCategoryValues}
                          onChange={(e) => { this.handleTracerCategoryChange(e) }}
                          disabled={this.state.loading}
                          filterOptions={filterOptions}
                          options=
                          {tracerCategories.length > 0 ?
                            tracerCategories.map((item, i) => {
                              return ({ label: getLabelText(item.label, this.state.lang), value: item.tracerCategoryId })
                            }, this) : []}
                            overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                            selectSomeItems: i18n.t('static.common.select')}}
                             />
                      </div>
                    </FormGroup>
                    <FormGroup className="col-sm-3" id="hideDiv" style={{ zIndex: '1' }}>
                      <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                      <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                      <div className="controls">
                        <MultiSelect
                          name="planningUnitId"
                          id="planningUnitId"
                          bsSize="sm"
                          value={this.state.planningUnitValues}
                          onChange={(e) => { this.handlePlanningUnitChange(e) }}
                          options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                          disabled={this.state.loading}
                          overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                          selectSomeItems: i18n.t('static.common.select')}}
                          filterOptions={filterOptions}
                        />
                      </div>
                    </FormGroup>
                    <FormGroup className="col-md-3" style={{ zIndex: '1' }}>
                      <Label htmlFor="appendedInputButton">{i18n.t('static.report.includeapproved')}</Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            type="select"
                            name="includeApprovedVersions"
                            id="includeApprovedVersions"
                            bsSize="sm"
                            onChange={(e) => { this.filterData() }}
                          >
                            <option value="true">{i18n.t('static.program.yes')}</option>
                            <option value="false">{i18n.t('static.program.no')}</option>
                          </Input>
                        </InputGroup>
                      </div>
                    </FormGroup>
                  </div>
                </div>
              </Form>
            </div>
            <div className="ReportSearchMarginTop">
              <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
          </CardBody>
        </Card>
      </div>
    );
  }
}
export default ForecastMetrics;
