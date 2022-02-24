import React from "react";
import { Bar } from 'react-chartjs-2';
import {
  Card, CardBody,
  Label, Input, FormGroup, Table,
  CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalBody
} from 'reactstrap';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP_WITHOUT_DATE } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from "../Common/AuthenticationService.js";
import moment from "moment"
import jexcel from 'jexcel-pro';
import csvicon from '../../assets/img/csv.png';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import { jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import NumberFormat from 'react-number-format';
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import { Prompt } from "react-router-dom";
import pdfIcon from '../../assets/img/pdf.png';
import jsPDF from 'jspdf';
import { LOGO } from "../../CommonComponent/Logo";

const entityname = i18n.t('static.dashboard.dataEntryAndAdjustment');

export default class ConsumptionDataEntryandAdjustment extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      datasetList: [],
      datasetId: "",
      showInPlanningUnit: false,
      lang: localStorage.getItem("lang"),
      consumptionUnitShowArr: [],
      dataEl: "",
      unitQtyArr: [],
      unitQtyArrForRegion: [],
      planningUnitList: [],
      forecastingUnitList: [],
      aruList: [],
      loading: true,
      selectedPlanningUnitId: "",
      toggleDataCheck: false,
      missingMonthList: [],
      consumptionListlessTwelve: [],
      showSmallTable: false,
      showDetailTable: false,
      allPlanningUnitList: [],
      message: "",
      consumptionChanged: false
    }
    this.loaded = this.loaded.bind(this);
    this.buildDataJexcel = this.buildDataJexcel.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);        
  //  this.consumptionDataChanged = this.consumptionDataChanged.bind(this);
    this.filterList = this.filterList.bind(this)
  }

  filterList = function (instance, cell, c, r, source) {
    var value = (instance.jexcel.getJson(null, false)[r])[1];
    return this.state.mixedList.filter(c => c.type == value);
  }

  cancelClicked() {
    var cont = false;
    if (this.state.consumptionChanged) {
        var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
        if (cf == true) {
            cont = true;
        } else {

        }
    } else {
        cont = true;
    }
    if (cont == true) {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}
  buildDataJexcel(consumptionUnitId) {

    var cont = false;
    if (this.state.consumptionChanged) {
      var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
      if (cf == true) {
        cont = true;
      } else {

      }
    } else {
      cont = true;
    }
    if (cont == true) {
      this.setState({
        loading: true
      }, () => {
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
        var consumptionList = this.state.consumptionList;
        var consumptionUnit = {};
        var consumptionNotes = "";
        if (consumptionUnitId > 0) {
          consumptionUnit = this.state.planningUnitList.filter(c => c.planningUnit.id == consumptionUnitId)[0];
          consumptionNotes = consumptionUnit.consumptionNotes;
        } else {
          consumptionUnit = {
            programPlanningUnitId: 0,
            planningUnit: {
              id: 0,
              label: {

              },
              multiplier: 1,
              forecastingUnit: {
                id: 0,
                label: {

                }
              }
            },
            consuptionForecast: true,
            treeForecast: false,
            consumptionNotes: "",
            consumptionDataType: 1,
            otherUnit: {
              id: 0,
              label: {

              },
              multiplier: 1,
            },
            selectedForecastMap: {},
          }
        }
        document.getElementById("consumptionNotes").value = consumptionNotes;
        var multiplier = 1;
        if (consumptionUnitId != 0) {
          if (consumptionUnit.consumptionDataType == 1) {
            multiplier = consumptionUnit.planningUnit.multiplier;
          } else if (consumptionUnit.consumptionDataType == 2) {
            multiplier = 1;
          } else {
            multiplier = consumptionUnit.otherUnit.multiplier;
          }
        }
        consumptionList = consumptionList.filter(c => c.planningUnit.id == consumptionUnitId);
        var monthArray = this.state.monthArray;
        var regionList = this.state.regionList;
        let dataArray = [];
        let data = [];
        let columns = [];
        columns.push({ title: i18n.t('static.inventoryDate.inventoryReport'), type: 'text', width: 200 })
        data[0] = i18n.t('static.program.noOfDaysInMonth');
        for (var j = 0; j < monthArray.length; j++) {
          data[j + 1] = monthArray[j].noOfDays;
          columns.push({ title: moment(monthArray[j].date).format(DATE_FORMAT_CAP_WITHOUT_DATE), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', disabledMaskOnEdition: true, width: 100 })
        }
        data[monthArray.length + 1] = multiplier;
        columns.push({ type: 'hidden', title: 'Multiplier' })
        dataArray.push(data)
        data = [];
        for (var r = 0; r < regionList.length; r++) {
          data = [];
          data[0] = getLabelText(regionList[r].label);
          for (var j = 0; j < monthArray.length; j++) {
            data[j + 1] = "";
          }
          data[monthArray.length + 1] = multiplier;

          dataArray.push(data);
          data = [];
          data[0] = i18n.t('static.supplyPlan.actualConsumption')
          for (var j = 0; j < monthArray.length; j++) {
            var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
            data[j + 1] = consumptionData.length > 0 ? consumptionData[0].amount : "";
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.reportingRate')
          for (var j = 0; j < monthArray.length; j++) {
            var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
            data[j + 1] = consumptionData.length > 0 && consumptionData[0].reportingRate > 0 ? consumptionData[0].reportingRate + "%" : 100 + "%";
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.stockedOut')
          for (var j = 0; j < monthArray.length; j++) {
            var consumptionData = consumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.region.id == regionList[r].regionId);
            data[j + 1] = consumptionData.length > 0 && consumptionData[0].daysOfStockOut > 0 ? consumptionData[0].daysOfStockOut : 0;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.stockedOutPer')
          for (var j = 0; j < monthArray.length; j++) {
            data[j + 1] = `=ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${colArr[j + 1] + "1"}*100,0)` + "%";
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.adjustedConsumption')
          for (var j = 0; j < monthArray.length; j++) {
            data[j + 1] = `=ROUND((${colArr[j + 1]}${parseInt(dataArray.length - 3)}/${colArr[j + 1]}${parseInt(dataArray.length - 2)}/(1-(${colArr[j + 1]}${parseInt(dataArray.length - 1)}/${colArr[j + 1] + "1"})))*100,0)`;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);

          data = [];
          data[0] = i18n.t('static.dataentry.convertedToPlanningUnit')
          for (var j = 0; j < monthArray.length; j++) {
            // data[j + 1] = `=ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${colArr[monthArray.length + 1] + "0"},0)`;
            data[j + 1] = `=ROUND(${colArr[j + 1]}${parseInt(dataArray.length)}/${multiplier},0)`;
          }
          data[monthArray.length + 1] = multiplier;
          dataArray.push(data);
          if (r != regionList.length - 1) {
            data = [];
            dataArray.push([]);
          }
        }
        // for (var j = 0; j < monthArray.length; j++) {
        //   data = [];
        //   data[0] = langaugeList[j].languageId
        //   data[1] = langaugeList[j].label.label_en;
        //   data[2] = langaugeList[j].languageCode;
        //   data[3] = langaugeList[j].countryCode;
        //   data[4] = langaugeList[j].lastModifiedBy.username;
        //   data[5] = (langaugeList[j].lastModifiedDate ? moment(langaugeList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
        //   data[6] = langaugeList[j].active;

        //   languageArray[count] = data;
        //   count++;
        // }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var options = {
          data: dataArray,
          columnDrag: true,
          columns: columns,
          text: {
            // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            show: '',
            entries: '',
          },
          updateTable: function (el, cell, x, y, source, value, id) {
          },
          onload: this.loaded,
          onchange: function (instance, cell, x, y, value) {
           // this.consumptionDataChanged()
            this.setState({
              consumptionChanged: true
            })
          }.bind(this),
          
          pagination: false,
          search: false,
          columnSorting: false,
          tableOverflow: true,
          wordWrap: true,
          allowInsertColumn: false,
          allowManualInsertColumn: false,
          allowDeleteRow: false,
          copyCompatibility: true,
          allowExport: false,
          paginationOptions: JEXCEL_PAGINATION_OPTION,
          position: 'top',
          filters: false,
          freezeColumns: 1,
          license: JEXCEL_PRO_KEY,
          contextMenu: function (obj, x, y, e) {
            return [];
          }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;

        // <td>{this.state.selectedConsumptionUnitId != 0 ? <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false} readOnly ></input> : <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false}></input>}</td>
        // <td>{c.dataType == 1 ? "Forecasting Unit" : c.dataType == 2 ? "Planning Unit" : "Other"}</td>
        // <td>{c.dataType == 1 ? getLabelText(c.forecastingUnit.label, this.state.lang) : c.dataType == 2 ? getLabelText(c.planningUnit.label, this.state.lang) : getLabelText(c.otherUnit.label, this.state.label)}</td>
        // <td>{c.dataType == 1 ? c.forecastingUnit.multiplier : c.dataType == 2 ? c.planningUnit.multiplier : c.otherUnit.multiplier}</td>

        let dataList = this.state.consumptionUnitList;
        let dataArray1 = [];
        // var mixedList = [];
        // var fuList = this.state.forecastingUnitList;
        // for (var fu = 0; fu < fuList.length; fu++) {
        //   var json = {
        //     id: fuList[fu].forecastingUnitId,
        //     name: getLabelText(fuList[fu].label),
        //     type: 1
        //   }
        //   mixedList.push(json)
        // }
        // var puList = this.state.planningUnitList;
        // for (var pu = 0; pu < fuList.length; pu++) {
        //   var json = {
        //     id: puList[pu].planningUnitId,
        //     name: getLabelText(puList[pu].label),
        //     type: 2
        //   }
        //   mixedList.push(json)
        // }
        // var aruList = this.state.aruList;
        // for (var aru = 0; aru < aruList.length; aru++) {
        //   var json = {
        //     id: aruList[aru].realmCountryPlanningUnitId,
        //     name: getLabelText(aruList[pu].label),
        //     type: 3
        //   }
        //   mixedList.push(json)
        // }
        if (consumptionUnitId != 0) {
          // if(consumptionUnit.dataType==3){
          //   mixedList.push({ id: getLabelText(dataList[j].otherUnit.label, this.state.lang), name: getLabelText(dataList[j].otherUnit.label, this.state.lang) })
          // }
          data = [];
          data[0] = consumptionUnit.consumptionDataType == 1 ? true : false;
          data[1] = 1;
          data[2] = getLabelText(consumptionUnit.planningUnit.forecastingUnit.label, this.state.lang);
          data[3] = parseInt(consumptionUnit.planningUnit.multiplier);
          data[4] = consumptionUnit.planningUnit.forecastingUnit.id;
          dataArray1.push(data);
          data = [];
          data[0] = consumptionUnit.consumptionDataType == 2 ? true : false;
          data[1] = 2;
          data[2] = getLabelText(consumptionUnit.planningUnit.label, this.state.lang);
          data[3] = 1;
          data[4] = consumptionUnit.planningUnit.id;
          dataArray1.push(data);
          data = [];
          data[0] = consumptionUnit.consumptionDataType == 3 ? true : false;
          data[1] = 3;
          data[2] = consumptionUnit.consumptionDataType == 3 ? getLabelText(consumptionUnit.otherUnit.label, this.state.lang) : "";
          data[3] = consumptionUnit.consumptionDataType == 3 ? parseInt(consumptionUnit.otherUnit.multiplier) : "";
          data[4] = consumptionUnit.consumptionDataType == 3 ? consumptionUnit.otherUnit.id : "";
          dataArray1.push(data);
        } else {
          data = [];
          data[0] = false;
          data[1] = 1;
          data[2] = "";
          data[3] = "";
          data[4] = "";
          dataArray1.push(data);
          data = [];
          data[0] = true;
          data[1] = 2;
          data[2] = "";
          data[3] = "";
          data[4] = "";
          dataArray1.push(data);
          data = [];
          data[0] = false;
          data[1] = 3;
          data[2] = "";
          data[3] = "";
          data[4] = "";
          dataArray1.push(data);
        }

        // for (var j = 0; j < dataList.length; j++) {
        //   if (dataList[j].dataType == 3) {
        //     mixedList.push({ id: getLabelText(dataList[j].otherUnit.label, this.state.lang), name: getLabelText(dataList[j].otherUnit.label, this.state.lang) })
        //   }
        //   data = [];
        //   var c = dataList[j]
        //   data[0] = c.forecastConsumptionUnitId == consumptionUnitId ? true : false
        //   data[1] = c.dataType;
        //   data[2] = c.dataType == 1 ? c.forecastingUnit.id : c.dataType == 2 ? c.planningUnit.id : getLabelText(c.otherUnit.label, this.state.lang);
        //   data[3] = c.dataType == 1 ? c.forecastingUnit.multiplier : c.dataType == 2 ? c.planningUnit.multiplier : c.otherUnit.multiplier;
        //   dataArray1.push(data);
        // }

        // if (consumptionUnitId == 0) {
        //   data = [];
        //   data[0] = true
        //   data[1] = "";
        //   data[2] = "";
        //   data[3] = "";
        //   dataArray1.push(data);
        // }

        var editable = consumptionUnitId > 0 ? false : true;
        this.el = jexcel(document.getElementById("smallTableDiv"), '');
        this.el.destroy();
        var options1 = {
          data: dataArray1,
          columnDrag: true,
          colWidths: [0, 150, 150, 150, 100, 100, 100],
          colHeaderClasses: ["Reqasterisk"],
          columns: [
            {
              title: i18n.t('static.realm.default'),
              type: 'radio'
            },
            {
              title: i18n.t('static.dataentry.dataType'),
              type: 'dropdown',
              source: [{ id: 1, name: i18n.t('static.product.unit1') }, { id: 2, name: i18n.t('static.product.product') }, { id: 3, name: i18n.t('static.dataentry.other') }],
            },
            {
              title: i18n.t('static.dashboard.Productmenu'),
              type: 'text',
              // source: mixedList,
              // filter: this.filterList
            },
            {
              title: i18n.t('static.importFromQATSupplyPlan.multiplier'),
              type: 'numeric'
            },
            {
              title: i18n.t('static.importFromQATSupplyPlan.multiplier'),
              type: 'hidden'
            }
          ],
          text: {
            // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            show: '',
            entries: '',
          },
          editable: editable,
          onchange: function (instance, cell, x, y, value) {
            this.setState({
              consumptionChanged: true
            })
          }.bind(this),
          onload: function (obj, x, y, e) {
            obj.jexcel.hideIndex(0);
            var elInstance = obj.jexcel;
            var json = obj.jexcel.getJson(null, true);
            var l = consumptionUnitId == 0 ? 2 : 3;
            for (var j = 0; j < l; j++) {
              if (consumptionUnitId != 0) {
                var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
                cell.classList.add('readonly');
              }
              var cell = elInstance.getCell(("B").concat(parseInt(j) + 1))
              cell.classList.add('readonly');
              var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
              cell.classList.add('readonly');
              var cell = elInstance.getCell(("D").concat(parseInt(j) + 1))
              cell.classList.add('readonly');
            }
            if (consumptionUnitId == 0) {
              var cell = elInstance.getCell(("B").concat(parseInt(2) + 1))
              cell.classList.add('readonly');
            }
          },
          // onChange: function (instance, cell, x, y, value) {
          //   if (x == 0) {
          //     var elInstance = this.state.dataEl;
          //     elInstance.setValueFromCoords(this.state.monthsArray.length + 1, 0, 2, true)
          //   }
          // },
          pagination: false,
          search: false,
          columnSorting: false,
          tableOverflow: true,
          wordWrap: true,
          allowInsertColumn: false,
          allowManualInsertColumn: false,
          allowDeleteRow: false,
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
        var smallTableEl = jexcel(document.getElementById("smallTableDiv"), options1);
        this.el = smallTableEl;

        this.setState({
          dataEl: dataEl, loading: false,
          smallTableEl: smallTableEl,
          selectedConsumptionUnitId: consumptionUnitId,
          selectedConsumptionUnitObject: consumptionUnit,
          selectedPlanningUnitId: consumptionUnit.planningUnit.id,
          showDetailTable: true
        })
      })
    }
  }
  // consumptionDataChanged = function (instance, cell, x, y, value) {
  //   var elInstance = this.state.consumptionEl;
  //   var rowData = elInstance.getRowData(y);
  // }

  interpolationMissingActualConsumption() {
    var notes = "";
    var monthArray = this.state.monthArray;
    var regionList = this.state.regionList;
    var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
    var curUser = AuthenticationService.getLoggedInUserId();

    var consumptionUnit = this.state.selectedConsumptionUnitObject;
    if (this.state.selectedConsumptionUnitId == 0) {
      var json = this.state.smallTableEl.getJson(null, false);
      var dataType = 0;
      if (json[0][0] == true) {
        dataType = 1;
      } else if (json[2][0] == true) {
        dataType = 3;
      } else {
        dataType = 2
      }

      var fu = this.state.forecastingUnitList.filter(c => c.forecastingUnitId == (json[0])[4])[0];
      var pu = this.state.allPlanningUnitList.filter(c => c.planningUnitId == this.state.selectedPlanningUnitId)[0];
      var consumptionUnit = {
        programPlanningUnitId: 0,
        planningUnit: {
          forecastingUnit: {
            id: (json[0])[4],
            label: fu.label
          },
          id: pu.planningUnitId,
          label: pu.label,
          multiplier: json[0][3]
        },
        consuptionForecast: true,
        treeForecast: false,
        stock: "",
        existingShipments: "",
        monthsOfStock: "",
        procurementAgent: {
          id: "",
          label: {}
        },
        price: "",
        higherThenConsumptionThreshold: "",
        lowerThenConsumptionThreshold: "",
        consumptionNotes: "",
        consumptionDataType: dataType,
        otherUnit: {
          id: 0,
          label: {
            label_en: json[2][2]
          },
          multiplier: json[2][3]
        },
        selectedForecastMap: {},
        createdBy: {
          userId: curUser
        },
        createdDate: curDate
      }
    }
    var fullConsumptionList = this.state.consumptionList.filter(c => c.planningUnit.id != consumptionUnit.planningUnit.id);
    var elInstance = this.state.dataEl;
    for (var i = 0; i < monthArray.length; i++) {
      var columnData = elInstance.getColumnData([i + 1]);
      var actualConsumptionCount = 2;
      var reportingRateCount = 3;
      var daysOfStockOutCount = 4;
      for (var r = 0; r < regionList.length; r++) {
        var index = -1;
        //   index = fullConsumptionList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));
        // index = fullConsumptionList.findIndex(con =>  con.region.id == regionList[r].regionId && moment(con.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));

        if (columnData[actualConsumptionCount] > 0) {
          if (index != -1) {
            fullConsumptionList[index].actualConsumption = columnData[actualConsumptionCount];
            fullConsumptionList[index].daysOfStockOut = columnData[daysOfStockOutCount];
            fullConsumptionList[index].reportingRate = columnData[reportingRateCount];
          } else {
            var json = {
              amount: columnData[actualConsumptionCount],
              planningUnit: {
                id: consumptionUnit.planningUnit.id,
                label: consumptionUnit.planningUnit.label
              },
              createdBy: {
                userId: curUser
              },
              createdDate: curDate,
              daysOfStockOut: columnData[daysOfStockOutCount],
              exculde: false,
              forecastConsumptionId: 0,
              month: moment(monthArray[i].date).format("YYYY-MM-DD"),
              region: {
                id: regionList[r].regionId,
                label: regionList[r].label
              },
              reportingRate: columnData[reportingRateCount]
            }
            fullConsumptionList.push(json);
          }
        }
        actualConsumptionCount += 8;
        reportingRateCount += 8;
        daysOfStockOutCount += 8
      }
    }

    for (var r = 0; r < regionList.length; r++) {
      for (var j = 0; j < monthArray.length; j++) {
        var consumptionData = fullConsumptionList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArray[j].date).format("YYYY-MM") && c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && c.amount > 0);
        if (consumptionData.length == 0) {
          var startValList = fullConsumptionList.filter(c => moment(c.month).format("YYYY-MM") < moment(monthArray[j].date).format("YYYY-MM") && c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && c.amount > 0)
            .sort(function (a, b) {
              return new Date(a.month) - new Date(b.month);
            });
          var endValList = fullConsumptionList.filter(c => moment(c.month).format("YYYY-MM") > moment(monthArray[j].date).format("YYYY-MM") && c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && c.amount > 0)
            .sort(function (a, b) {
              return new Date(a.month) - new Date(b.month);
            });
          if (startValList.length > 0 && endValList.length > 0) {
            var startVal = startValList[startValList.length - 1].amount;
            var startMonthVal = startValList[startValList.length - 1].month;
            var endVal = endValList[0].amount;
            var endMonthVal = endValList[0].month;
            notes += regionList[r].label + " " + moment(monthArray[j].date).format("YYYY-MM");
            //y=y1+(x-x1)*(y2-y1)/(x2-x1);
            // missingActualConsumption = startValKaAmount +( currentMonthAndStartMonthKaDifference ((endValKaAmount - startValKaAmount)/ endMonthAndStartMonthKaDiffrence))
            const monthDifference = moment(new Date(monthArray[j].date)).diff(new Date(startMonthVal), 'months', true);
            const monthDiff = moment(new Date(endMonthVal)).diff(new Date(startMonthVal), 'months', true);
            var missingActualConsumption = Number(startVal) + (monthDifference * ((Number(endVal) - Number(startVal)) / monthDiff));
            var json = {
              amount: missingActualConsumption.toFixed(2),
              planningUnit: {
                id: consumptionUnit.planningUnit.id,
                label: consumptionUnit.planningUnit.label
              },
              createdBy: {
                userId: curUser
              },
              createdDate: curDate,
              daysOfStockOut: columnData[daysOfStockOutCount],
              exculde: false,
              forecastConsumptionId: 0,
              month: moment(monthArray[j].date).format("YYYY-MM-DD"),
              region: {
                id: regionList[r].regionId,
                label: regionList[r].label
              },
              reportingRate: columnData[reportingRateCount]
            }
            fullConsumptionList.push(json);
          }
        }
      }
    }
    // document.getElementById("consumptionNotes").value = document.getElementById("consumptionNotes").value.concat(notes).concat("filled in with interpolated");
    document.getElementById("consumptionNotes").value = notes;

    this.setState({
      consumptionList: fullConsumptionList
    })
    this.buildDataJexcel(this.state.selectedConsumptionUnitId);
  }

  saveConsumptionList() {
    this.setState({
      loading: true
    })
    var db1;
    var storeOS;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
      this.props.updateState("color", "red");
      this.props.hideFirstComponent();
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['datasetData'], 'readwrite');
      var datasetTransaction = transaction.objectStore('datasetData');
      var datasetRequest = datasetTransaction.get(this.state.datasetId);
      datasetRequest.onerror = function (event) {
      }.bind(this);
      datasetRequest.onsuccess = function (event) {
        var myResult = datasetRequest.result;
        var datasetDataBytes = CryptoJS.AES.decrypt(myResult.programData, SECRET_KEY);
        var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
        var datasetJson = JSON.parse(datasetData);
        var elInstance = this.state.dataEl;
        var consumptionList = [];
        var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
        var curUser = AuthenticationService.getLoggedInUserId();
        var consumptionUnit = this.state.selectedConsumptionUnitObject;
        var fullConsumptionList = this.state.consumptionList.filter(c => c.planningUnit.id != consumptionUnit.planningUnit.id);
        if (this.state.selectedConsumptionUnitId == 0) {
          var json = this.state.smallTableEl.getJson(null, false);
          var dataType = 0;
          if (json[0][0] == true) {
            dataType = 1;
          } else if (json[2][0] == true) {
            dataType = 3;
          } else {
            dataType = 2
          }

          var fu = this.state.forecastingUnitList.filter(c => c.forecastingUnitId == (json[0])[4])[0];
          var pu = this.state.allPlanningUnitList.filter(c => c.planningUnitId == this.state.selectedPlanningUnitId)[0];
          var consumptionUnit = {
            programPlanningUnitId: 0,
            planningUnit: {
              forecastingUnit: {
                id: (json[0])[4],
                label: fu.label
              },
              id: pu.planningUnitId,
              label: pu.label,
              multiplier: json[0][3]
            },
            consuptionForecast: true,
            treeForecast: false,
            stock: "",
            existingShipments: "",
            monthsOfStock: "",
            procurementAgent: {
              id: "",
              label: {}
            },
            price: "",
            higherThenConsumptionThreshold: "",
            lowerThenConsumptionThreshold: "",
            consumptionNotes: "",
            consumptionDataType: dataType,
            otherUnit: {
              id: 0,
              label: {
                label_en: json[2][2]
              },
              multiplier: json[2][3]
            },
            selectedForecastMap: {},
            createdBy: {
              userId: curUser
            },
            createdDate: curDate
          }
        }
        var monthArray = this.state.monthArray;
        var regionList = this.state.regionList;
        for (var i = 0; i < monthArray.length; i++) {
          var columnData = elInstance.getColumnData([i + 1]);
          var actualConsumptionCount = 2;
          var reportingRateCount = 3;
          var daysOfStockOutCount = 4;
          for (var r = 0; r < regionList.length; r++) {
            var index = 0;
            index = fullConsumptionList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id && c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(monthArray[i].date).format("YYYY-MM"));
            if (columnData[actualConsumptionCount] > 0) {
              if (index != -1) {
                fullConsumptionList[index].amount = columnData[actualConsumptionCount];
                fullConsumptionList[index].reportingRate = columnData[reportingRateCount];
                fullConsumptionList[index].daysOfStockOut = columnData[daysOfStockOutCount];
              } else {
                var json = {
                  amount: columnData[actualConsumptionCount],
                  planningUnit: {
                    id: consumptionUnit.planningUnit.id,
                    label: consumptionUnit.planningUnit.label
                  },
                  createdBy: {
                    userId: curUser
                  },
                  createdDate: curDate,
                  daysOfStockOut: columnData[daysOfStockOutCount],
                  exculde: false,
                  forecastConsumptionId: 0,
                  month: moment(monthArray[i].date).format("YYYY-MM-DD"),
                  region: {
                    id: regionList[r].regionId,
                    label: regionList[r].label
                  },
                  reportingRate: columnData[reportingRateCount]
                }
                fullConsumptionList.push(json);
              }
            }
            actualConsumptionCount += 8;
            reportingRateCount += 8;
            daysOfStockOutCount += 8
          }
        }
        var planningUnitList = datasetJson.planningUnitList;
        if (this.state.selectedConsumptionUnitId == 0) {
          planningUnitList.push(consumptionUnit);
        }
        var planningUnitIndex = planningUnitList.findIndex(c => c.planningUnit.id == consumptionUnit.planningUnit.id);
        planningUnitList[planningUnitIndex].consumptionNotes = document.getElementById("consumptionNotes").value;
        datasetJson.actualConsumptionList = fullConsumptionList;
        datasetJson.planningUnitList = planningUnitList;
        datasetData = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString()
        myResult.programData = datasetData;
        var putRequest = datasetTransaction.put(myResult);

        putRequest.onerror = function (event) {
        }.bind(this);
        putRequest.onsuccess = function (event) {

          //this.el = jexcel(document.getElementById("tableDiv"), '');
          //this.el.destroy();
          //this.el = jexcel(document.getElementById("smallTableDiv"), '');
          //this.el.destroy();


          this.setState({
            dataEl: "",
            showDetailTable: true,
            loading: false,
            message: i18n.t('static.compareAndSelect.dataSaved'),
            consumptionChanged: false
          }, () => {
            this.getDatasetData();
            this.hideFirstComponent();
          })
        }.bind(this)
      }.bind(this)
    }.bind(this)
  }

  hideFirstComponent() {
    document.getElementById('div1').style.display = 'block';
    this.state.timeout = setTimeout(function () {
      document.getElementById('div1').style.display = 'none';
    }, 8000);
  }

  hideSecondComponent() {
    document.getElementById('div2').style.display = 'block';
    this.state.timeout = setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 8000);
  }

  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM'];
    var elInstance = instance.jexcel;
    var json = elInstance.getJson(null, false);
    var arr = [];
    var count = 1;
    for (var r = 0; r < this.state.regionList.length; r++) {
      arr.push(count);
      count += 8;
    }
    for (var j = 0; j < json.length; j++) {
      var cell = elInstance.getCell(("A").concat(parseInt(j) + 1))
      if (arr.includes(j)) {
        cell.classList.add('regionBold');
      }
      cell.classList.add('readonly');
    }

    for (var j = 0; j < this.state.monthArray.length; j++) {
      var count = 2;
      var count1 = 1;
      var count2 = 6;
      var count3 = 7;
      var count4 = 8;
      for (var r = 0; r < this.state.regionList.length; r++) {
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count)))
        cell.classList.add('readonly');
        cell.classList.add('regionBold');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count1)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count2)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count3)))
        cell.classList.add('readonly');
        var cell = elInstance.getCell((colArr[j + 1]).concat(parseInt(count4)))
        cell.classList.add('readonly');
        count = count + 8;
        count1 = count1 + 8;
        count2 = count2 + 8;
        count3 = count3 + 8;
        count4 = count4 + 8;
      }
    }
  }

  toggleAccordion(consumptionUnitId) {
    var consumptionUnitShowArr = this.state.consumptionUnitShowArr;
    if (consumptionUnitShowArr.includes(consumptionUnitId)) {
      consumptionUnitShowArr = consumptionUnitShowArr.filter(c => c != consumptionUnitId);
    } else {
      consumptionUnitShowArr.push(consumptionUnitId)
    }
    this.setState({
      consumptionUnitShowArr: consumptionUnitShowArr
    })}

    componentDidMount(){
    this.getDatasetList();
  }

  addDoubleQuoteToRowContent = (arr) => {
    return arr.map(ele => '"' + ele + '"')
  }

  exportCSV() {
    var csvRow = [];
    var elInstance = this.state.dataEl;
    var actualConsumption = 3;
    var reportingRateCount = 4;
    var stockOutCount = 5;
    var stockOutPercentCount = 6;
    var adjustedConsumptionCount = 7;
    var convertedToPlanningUnitCount = 8;

    csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
    csvRow.push('')
    if (this.state.selectedConsumptionUnitId > 0) {
      csvRow.push('"' + (i18n.t('static.dashboard.planningunitheader') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
    }
    csvRow.push('')
    csvRow.push('')
    var columns = [];
    columns.push(i18n.t('static.dashboard.Productmenu'));
    this.state.monthArray.map(item => (
      columns.push(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))
    ))
    columns.push(i18n.t('static.supplyPlan.total'));
    columns.push(i18n.t('static.dataentry.regionalPer'));

    let headers = [];
    columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
    var A = [this.addDoubleQuoteToRowContent(headers)];

    this.state.planningUnitList.map(item => {
      var total = 0;
      var totalPU = 0;
      var datacsv = [];
      datacsv.push(item.consumptionDataType == 1 ? getLabelText(item.planningUnit.forecastingUnit.label, this.state.lang) : item.consumptionDataType == 2 ? getLabelText(item.planningUnit.label, this.state.lang) : getLabelText(item.otherUnit.label, this.state.lang));
      this.state.monthArray.map((item1, count) => {
        var data = this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"));
        total += Number(data[0].qty);
        totalPU += Number(data[0].qtyInPU);
        datacsv.push(this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty)
      })
      datacsv.push(this.state.showInPlanningUnit ? Math.round(totalPU) : Math.round(total));
      datacsv.push("100 %");
      A.push(this.addDoubleQuoteToRowContent(datacsv))

      this.state.regionList.map(r => {
        var datacsv = [];
        var totalRegion = 0;
        var totalRegionPU = 0;
        datacsv.push(getLabelText(r.label, this.state.lang))
        {
          this.state.monthArray.map((item1, count) => {
            var data = this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.region.regionId == r.regionId)
            totalRegion += Number(data[0].qty);
            totalRegionPU += Number(data[0].qtyInPU);
            datacsv.push(this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty)
          })
        }
        A.push(this.addDoubleQuoteToRowContent(datacsv))
      });
    });

    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","))
    }
    if (this.state.selectedConsumptionUnitId > 0) {

      csvRow.push('')
      csvRow.push('')
      headers = [];
      var columns = [];
      columns.push(i18n.t('static.inventoryDate.inventoryReport'))
      this.state.monthArray.map(item => (
        columns.push(moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))
      ))
      columns.push('')
      columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
      var C = []
      C.push([this.addDoubleQuoteToRowContent(headers)]);
      var B = [];
      var monthArray = this.state.monthArray;
      var regionList = this.state.regionList;
      var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
      B.push(i18n.t('static.program.noOfDaysInMonth').replaceAll('#', '%23').replaceAll(' ', '%20'))
      for (var j = 0; j < monthArray.length; j++) {
        B.push(monthArray[j].noOfDays)
      }
      C.push(this.addDoubleQuoteToRowContent(B));

      for (var r = 0; r < regionList.length; r++) {
        B = [];
        B.push(getLabelText(regionList[r].label))
        for (var j = 0; j < monthArray.length; j++) {
          B.push("")
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.supplyPlan.actualConsumption'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(actualConsumption)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.reportingRate'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(reportingRateCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOut'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(stockOutCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        B.push(i18n.t('static.dataentry.stockedOutPer'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(stockOutPercentCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];

        B.push(i18n.t('static.dataentry.adjustedConsumption'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push((elInstance.getValue(`${colArr[j + 1]}${parseInt(adjustedConsumptionCount)}`, true).toString().replaceAll("\,", "")))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];

        B.push(i18n.t('static.dataentry.convertedToPlanningUnit'))
        for (var j = 0; j < monthArray.length; j++) {
          B.push(elInstance.getValue(`${colArr[j + 1]}${parseInt(convertedToPlanningUnitCount)}`, true).toString().replaceAll("\,", ""))
        }
        C.push(this.addDoubleQuoteToRowContent(B));
        B = [];
        actualConsumption += 8;
        reportingRateCount += 8;
        stockOutCount += 8;
        stockOutPercentCount += 8;
        adjustedConsumptionCount += 8;
        convertedToPlanningUnitCount += 8;
      }

      for (var i = 0; i < C.length; i++) {
        csvRow.push(C[i].join(","))
      }
    }


    var csvString = csvRow.join("%0A")
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.dataEntryAndAdjustment') + ".csv"
    document.body.appendChild(a)
    a.click()
  }


  getDatasetList() {
    this.setState({
      loading: true
    })
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
      var datasetOs = datasetTransaction.objectStore('datasetData');
      var getRequest = datasetOs.getAll();
      getRequest.onerror = function (event) {
      }.bind(this);
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var datasetList = this.state.datasetList;
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var mr = 0; mr < myResult.length; mr++) {
          if (myResult[mr].userId == userId) {
            var json = {
              id: myResult[mr].id,
              name: myResult[mr].programCode + "~v" + myResult[mr].version,
              dataset: myResult[mr]
            }
            datasetList.push(json)
          }
        }
        var datasetId = "";
        var event = {
          target: {
            value: ""
          }
        };
        if (datasetList.length == 1) {
          datasetId = datasetList[0].id;
          event.target.value = datasetList[0].id;
        } else if (localStorage.getItem("sesDatasetId") != "" && datasetList.filter(c => c.id == localStorage.getItem("sesDatasetId")).length > 0) {
          datasetId = localStorage.getItem("sesDatasetId");
          event.target.value = localStorage.getItem("sesDatasetId");
        }
        datasetList = datasetList.sort(function (a, b) {
          a = a.name.toLowerCase();
          b = b.name.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
        this.setState({
          datasetList: datasetList,
          loading: false
        }, () => {
          if (datasetId != "") {
            this.setDatasetId(event);
          }
        })
      }.bind(this)
    }.bind(this)
  }

  setDatasetId(e) {
    var cont = false;
    if (this.state.consumptionChanged) {
      var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
      if (cf == true) {
        cont = true;
      } else {

      }
    } else {
      cont = true;
    }
    if (cont == true) {
      this.setState({
        loading: true
      })
      var datasetId = e.target.value;
      localStorage.setItem("sesDatasetId", datasetId);
      this.setState({
        datasetId: datasetId,
      }, () => {
        if (datasetId != "") {
          this.getDatasetData();
        } else {
          this.setState({
            showSmallTable: false,
            showDetailTable: false
          })
        }
      })
    }
  }

  getDatasetData() {
    this.setState({
      loading: true
    })
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;

      var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
      var datasetOs = datasetTransaction.objectStore('datasetData');
      var dsRequest = datasetOs.get(this.state.datasetId);
      dsRequest.onerror = function (event) {
      }.bind(this);
      dsRequest.onsuccess = function (event) {

        var tcTransaction = db1.transaction(['tracerCategory'], 'readwrite');
        var tcOs = tcTransaction.objectStore('tracerCategory');
        var tcRequest = tcOs.getAll();
        tcRequest.onerror = function (event) {
        }.bind(this);
        tcRequest.onsuccess = function (event) {
          var myResult = [];
          myResult = tcRequest.result;

          var fuTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
          var fuOs = fuTransaction.objectStore('forecastingUnit');
          var fuRequest = fuOs.getAll();
          fuRequest.onerror = function (event) {
          }.bind(this);
          fuRequest.onsuccess = function (event) {
            var fuResult = [];
            fuResult = fuRequest.result;

            var puTransaction = db1.transaction(['planningUnit'], 'readwrite');
            var puOs = puTransaction.objectStore('planningUnit');
            var puRequest = puOs.getAll();
            puRequest.onerror = function (event) {
            }.bind(this);
            puRequest.onsuccess = function (event) {
              var puResult = [];
              puResult = puRequest.result;
              // var datasetData = this.state.datasetList.filter(c => c.id == )[0].dataset;
              var datasetData = dsRequest.result;
              var datasetDataBytes = CryptoJS.AES.decrypt(datasetData.programData, SECRET_KEY);
              var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
              var datasetJson = JSON.parse(datasetData);
              var consumptionList = datasetJson.actualConsumptionList;
              var planningUnitList = datasetJson.planningUnitList.filter(c => c.consuptionForecast);
              var regionList = datasetJson.regionList;

              regionList.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
              });

              var startDate = moment(Date.now()).add(-36, 'months').format("YYYY-MM-DD");
              var stopDate = moment(Date.now()).format("YYYY-MM-DD");
              var daysInMonth = datasetJson.currentVersion.daysInMonth;
              var monthArray = [];
              var curDate = startDate;
              var planningUnitTotalList = [];
              var planningUnitTotalListRegion = [];
              var totalPlanningUnitData = [];
              for (var m = 0; curDate < stopDate; m++) {
                curDate = moment(startDate).add(m, 'months').format("YYYY-MM-DD");
                var daysInCurrentDate = moment(curDate, "YYYY-MM").daysInMonth();
                var noOfDays = daysInMonth > 0 ? daysInMonth > daysInCurrentDate ? daysInCurrentDate : daysInMonth : daysInCurrentDate;
                monthArray.push({ date: curDate, noOfDays: noOfDays })
                var totalPlanningUnit = 0;
                var totalPlanningUnitPU = 0;
                for (var cul = 0; cul < planningUnitList.length; cul++) {
                  var totalQty = "";
                  var totalQtyPU = "";
                  for (var r = 0; r < regionList.length; r++) {
                    var consumptionDataForMonth = consumptionList.filter(c => c.region.id == regionList[r].regionId && moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.planningUnit.id == planningUnitList[cul].planningUnit.id)
                    var qty = 0;
                    var qtyInPU = 0;
                    var reportingRate = "";
                    var actualConsumption = "";
                    var daysOfStockOut = ""
                    if (consumptionDataForMonth.length > 0) {
                      var c = consumptionDataForMonth[0];
                      reportingRate = c.reportingRate > 0 ? c.reportingRate : 100;
                      actualConsumption = c.amount;
                      daysOfStockOut = c.daysOfStockOut;
                      qty = (Number(actualConsumption) / Number(reportingRate) / Number(1 - (Number(daysOfStockOut) / Number(noOfDays)))) * 100;
                      qty = qty.toFixed(2)
                      var multiplier = 0;
                      if (planningUnitList[cul].consumptionDataType == 1) {
                        multiplier = planningUnitList[cul].planningUnit.multiplier
                      } else if (planningUnitList[cul].consumptionDataType == 2) {
                        multiplier = 1
                      } else {
                        multiplier = planningUnitList[cul].otherUnit.multiplier
                      }
                      qtyInPU = (Number(qty) / Number(multiplier)).toFixed(2)
                    } else {
                      qty = "";
                      reportingRate = 100;
                      daysOfStockOut = 0;
                      qtyInPU = ""
                    }
                    planningUnitTotalListRegion.push({ planningUnitId: planningUnitList[cul].planningUnit.id, month: curDate, qty: qty != "" ? Math.round(qty) : "", qtyInPU: qtyInPU != "" ? Math.round(qtyInPU) : "", reportingRate: reportingRate, region: regionList[r], multiplier: multiplier, actualConsumption: actualConsumption, daysOfStockOut: daysOfStockOut, noOfDays: noOfDays })
                    if (qty != "") {
                      totalQty = Number(totalQty) + Number(qty);
                      totalQtyPU = Number(totalQtyPU) + Number(qtyInPU);
                    }
                  }
                  planningUnitTotalList.push({ planningUnitId: planningUnitList[cul].planningUnit.id, month: curDate, qty: totalQty != "" ? Math.round(totalQty) : "", qtyInPU: totalQtyPU != "" ? Math.round(totalQtyPU) : "" })
                  totalPlanningUnit += totalQty;
                  totalPlanningUnitPU += totalQtyPU;
                }
              }
              var healthAreaList = [...new Set(datasetJson.healthAreaList.map(ele => (ele.id)))];
              var tracerCategoryListFilter = myResult.filter(c => healthAreaList.includes(c.healthArea.id));
              var tracerCategoryIds = [...new Set(tracerCategoryListFilter.map(ele => (ele.tracerCategoryId)))];
              var forecastingUnitList = fuResult.filter(c => tracerCategoryIds.includes(c.tracerCategory.id));
              var forecastingUnitIds = [...new Set(forecastingUnitList.map(ele => (ele.forecastingUnitId)))];
              var allPlanningUnitList = puResult.filter(c => forecastingUnitIds.includes(c.forecastingUnit.forecastingUnitId));
              console.log("PlanningUnitTotalKList+++", planningUnitTotalList);
              console.log("PlanningUnitListForRegion+++", planningUnitTotalListRegion);

              this.setState({
                consumptionList: consumptionList,
                regionList: regionList,
                startDate: startDate,
                stopDate: stopDate,
                // consumptionUnitList: consumptionUnitList,
                monthArray: monthArray,
                datasetJson: datasetJson,
                planningUnitList: planningUnitList,
                forecastingUnitList: forecastingUnitList,
                showSmallTable: true,
                loading: false,
                planningUnitTotalList: planningUnitTotalList,
                planningUnitTotalListRegion: planningUnitTotalListRegion,
                allPlanningUnitList: allPlanningUnitList
              }, () => {
                console.log("this.props.match.params.planningUnitId+++", this.props.match.params.planningUnitId)
                if (this.props.match.params.planningUnitId > 0) {
                  this.buildDataJexcel(this.props.match.params.planningUnitId)
                }
              })
            }.bind(this)
          }.bind(this)
        }.bind(this)
      }.bind(this)
    }.bind(this)
  }

  getARUList(e) {
    var planningUnitId = e.target.value;
    if (planningUnitId > 0) {
      var planningUnitListFiltered = this.state.allPlanningUnitList.filter(c => c.planningUnitId == planningUnitId)[0];
      var elInstance = this.state.smallTableEl;
      elInstance.setValueFromCoords(2, 1, getLabelText(planningUnitListFiltered.label, this.state.lang), true);
      elInstance.setValueFromCoords(3, 1, 1, true);
      elInstance.setValueFromCoords(4, 1, planningUnitListFiltered.planningUnitId, true);
      elInstance.setValueFromCoords(2, 0, getLabelText(planningUnitListFiltered.forecastingUnit.label, this.state.lang), true);
      elInstance.setValueFromCoords(3, 0, planningUnitListFiltered.multiplier, true);
      elInstance.setValueFromCoords(4, 0, planningUnitListFiltered.forecastingUnit.forecastingUnitId, true);

    }
    this.setState({
      selectedPlanningUnitId: planningUnitId,
      consumptionChanged: true
    })
  }

  toggleShowGuidance() {
    this.setState({
      showGuidance: !this.state.showGuidance
    })
  }

  setShowInPlanningUnits(e) {
    this.setState({
      showInPlanningUnit: e.target.checked
    })
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    window.onbeforeunload = null;
  }

  componentDidUpdate = () => {
    if (this.state.consumptionChanged) {
      window.onbeforeunload = () => true
    } else {
      window.onbeforeunload = undefined
    }
  }


  exportPDFDataCheck() {
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


      //  var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
      // var reader = new FileReader();

      //var data='';
      // Use fs.readFile() method to read the file 
      //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
      //}); 
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setPage(i)
        doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
        /*doc.addImage(data, 10, 30, {
          align: 'justify'
        });*/
        doc.setTextColor("#002f6c");
        doc.text(i18n.t('static.common.dataCheck'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.text(i18n.t('static.dashboard.programheader') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text, doc.internal.pageSize.width / 20, 90, {
            align: 'left'
          })

        }

      }
    }


    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size, true);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal')


    var y = 110;

    doc.setFont('helvetica', 'bold')
    var planningText = doc.splitTextToSize(i18n.t('static.commitTree.consumptionForecast'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("a. " + i18n.t('static.commitTree.monthsMissingActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 10;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }
    this.state.missingMonthList.map((item, i) => {
      doc.setFont('helvetica', 'bold')
      planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 10;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
      doc.setFont('helvetica', 'normal')
      planningText = doc.splitTextToSize("" + item.monthsArray, doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 3;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
    })

    doc.setFont('helvetica', 'normal')
    planningText = doc.splitTextToSize("b. " + i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues'), doc.internal.pageSize.width * 3 / 4);
    // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
    y = y + 20;
    for (var i = 0; i < planningText.length; i++) {
      if (y > doc.internal.pageSize.height - 100) {
        doc.addPage();
        y = 80;

      }
      doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
      y = y + 10;
    }
    this.state.consumptionListlessTwelve.map((item, i) => {
      doc.setFont('helvetica', 'bold')
      planningText = doc.splitTextToSize(getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : ", doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 10;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
      doc.setFont('helvetica', 'normal')
      planningText = doc.splitTextToSize("" + item.noOfMonths + " month(s)", doc.internal.pageSize.width * 3 / 4);
      // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
      y = y + 3;
      for (var i = 0; i < planningText.length; i++) {
        if (y > doc.internal.pageSize.height - 100) {
          doc.addPage();
          y = 80;

        }
        doc.text(doc.internal.pageSize.width / 15, y, planningText[i]);
        y = y + 10;
      }
    })
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.common.dataCheck').concat('.pdf'));
  }

  render() {
    const { datasetList } = this.state;
    let datasets = datasetList.length > 0
      && datasetList.map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {item.name}
          </option>
        )
      }, this);

    const { allPlanningUnitList } = this.state;
    let planningUnits = allPlanningUnitList.length > 0
      && allPlanningUnitList.map((item, i) => {
        return (
          <option key={i} value={item.planningUnitId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);

    var chartOptions = {
      title: {
        display: false
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: "",
            fontColor: 'black'
          },
          // stacked: true,
          ticks: {
            beginAtZero: true,
            fontColor: 'black',
            callback: function (value) {
              return value.toLocaleString();
            }
          },
          gridLines: {
            drawBorder: true, lineWidth: 0
          },
          position: 'left',
        }],
        xAxes: [{
          ticks: {
            fontColor: 'black'
          },
          gridLines: {
            drawBorder: true, lineWidth: 0
          },
          // stacked: true
        }]
      },
      tooltips: {
        enabled: false,
        custom: CustomTooltips,
        callbacks: {
          label: function (tooltipItem, data) {

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

    let bar = {}
    var datasetListForGraph = [];
    var colourArray = ["#002F6C", "#BA0C2F", "#49A4A1", "#A7C6ED", "#212721", "#EDB944", "#F48521"]
    if (this.state.showDetailTable) {
      var elInstance = this.state.dataEl;
      if (elInstance != undefined) {
        var colourCount = 0;
        datasetListForGraph.push({
          label: getLabelText(this.state.selectedConsumptionUnitObject.consumptionDataType == 1 ? this.state.selectedConsumptionUnitObject.planningUnit.forecastingUnit.label : this.state.selectedConsumptionUnitObject.consumptionDataType == 2 ? this.state.selectedConsumptionUnitObject.planningUnit.label : this.state.selectedConsumptionUnitObject.otherUnit.label, this.state.lang),
          data: this.state.planningUnitTotalList.filter(c => c.planningUnitId == this.state.selectedConsumptionUnitObject.planningUnit.id).map(item => (item.qty > 0 ? item.qty : null)),
          type: 'line',
          backgroundColor: 'transparent',
          borderColor: "#6C6463",
          borderStyle: 'dotted',
          ticks: {
            fontSize: 2,
            fontColor: 'transparent',
          },
          lineTension: 0,
          pointStyle: 'line',
          pointRadius: 0,
          showInLegend: true,
        })

        var actualConsumptionCount = 6;
        this.state.regionList.map((item, count) => {
          if (colourCount > 7) {
            colourCount = 0;
          }

          // var columnData = elInstance.getRowData(actualConsumptionCount, true);
          // columnData.shift()
          datasetListForGraph.push({
            label: getLabelText(item.label, this.state.lang),
            data: this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == this.state.selectedConsumptionUnitObject.planningUnit.id && c.region.regionId == item.regionId).map(item => (item.qty > 0 ? item.qty : null)),
            type: 'line',
            backgroundColor: 'transparent',
            borderColor: colourArray[colourCount],
            borderStyle: 'dotted',
            ticks: {
              fontSize: 2,
              fontColor: 'transparent',
            },
            lineTension: 0,
            pointStyle: 'line',
            pointRadius: 0,
            showInLegend: true,
          })
          colourCount++;
        })
      }
    }
    if (this.state.showDetailTable) {
      bar = {

        labels: this.state.monthArray.map((item, index) => (moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE))),
        datasets: datasetListForGraph

      };

    }

    const { missingMonthList } = this.state;
    let missingMonths = missingMonthList.length > 0 && missingMonthList.map((item, i) => {
      return (
        <li key={i}>
          <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b>{"" + item.monthsArray}</span></div>
        </li>
      )
    }, this);

    //Consumption : planning unit less 12 month
    const { consumptionListlessTwelve } = this.state;
    let consumption = consumptionListlessTwelve.length > 0 && consumptionListlessTwelve.map((item, i) => {
      return (
        <li key={i}>
          <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b></span><span>{item.noOfMonths + " month(s)"}</span></div>
        </li>
      )
    }, this);
    return (
      <div className="animated fadeIn">
        <Prompt
         // when={this.state.consumptionChangedFlag == 1 || this.state.consumptionBatchInfoChangedFlag == 1}
          when={this.state.consumptionChanged == 1}
          message={i18n.t("static.dataentry.confirmmsg")}
        />
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className={"green"} id="div1">{this.state.message}</h5>
        <h5 className={this.props.match.params.color} id="div2">{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <Card>
          <div className="card-header-actions">
            <div className="Card-header-reporticon">
              <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
              <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
              <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/importFromQATSupplyPlan/listImportFromQATSupplyPlan" className="supplyplanformulas">{i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan')}</a></span>
              <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/extrapolation/extrapolateData" className="supplyplanformulas">{i18n.t('static.dashboard.extrapolation')}</a></span><br />
              {/* <strong>{i18n.t('static.dashboard.supplyPlan')}</strong> */}

              {/* <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
              {/* <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
            </div>
          </div>
          <div className="Card-header-addicon pb-0">
            <div className="card-header-actions">
              {/* <img style={{ height: '23px', width: '23px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
              <a className="card-header-action">
                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
              </a>
              <img style={{ height: '23px', width: '23px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
              {/* <span className="card-header-action">
                {this.state.datasetId != "" && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} ><i className="fa fa-plus-square" style={{ fontSize: '20px' }} onClick={() => this.buildDataJexcel(0)}></i></a>}</span> */}

              {/* <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} /> */}
            </div>
          </div>

          <CardBody className="pb-lg-0 pt-lg-0">
            <div>
              <Form >
                <div className="pl-0">
                  <div className="row">
                    <FormGroup className="col-md-3">
                      <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.programheader')}</Label>
                      <div className="controls ">
                        <InputGroup>
                          <Input
                            type="select"
                            name="datasetId"
                            id="datasetId"
                            bsSize="sm"
                            // onChange={this.filterVersion}
                            onChange={(e) => { this.setDatasetId(e); }}
                            value={this.state.datasetId}

                          >
                            <option value="">{i18n.t('static.common.select')}</option>
                            {datasets}
                          </Input>

                        </InputGroup>
                      </div>
                    </FormGroup>

                  </div>
                  <div className="row">
                    <FormGroup className="tab-ml-0 mb-md-3 ml-3">
                      <Col md="12" >
                        <Input className="form-check-input" type="checkbox" id="checkbox1" name="checkbox1" value={this.state.showInPlanningUnit} onChange={(e) => this.setShowInPlanningUnits(e)} />
                        <Label check className="form-check-label" htmlFor="checkbox1">{i18n.t('static.dataentry.showInPlanningUnits')}</Label>
                      </Col>
                    </FormGroup>
                  </div>
                </div>
              </Form>
              <div style={{ display: this.state.loading ? "none" : "block" }}>
                {this.state.showSmallTable &&
                  <>
                    <div className="table-scroll">
                      <div className="table-wrap table-responsive">
                        <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options}>
                          <thead>
                            <tr>
                              <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                              <th className="dataentryTdWidth sticky-col first-col clone">{i18n.t('static.dashboard.Productmenu')}</th>
                              {this.state.monthArray.map((item, count) => {
                                return (<th>{moment(item.date).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>)
                              })}
                              <th>{i18n.t('static.supplyPlan.total')}</th>
                              <th>{i18n.t('static.dataentry.regionalPer')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.planningUnitList.map(item => {
                              var total = 0;
                              var totalPU = 0;
                              return (<>
                                <tr className="hoverTd">
                                  <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(item.planningUnit.id)}>
                                    {this.state.consumptionUnitShowArr.includes(item.planningUnit.id) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                  </td>
                                  <td className="sticky-col first-col clone hoverTd" align="left" onClick={() => { this.buildDataJexcel(item.planningUnit.id) }}>{item.consumptionDataType == 1 ? getLabelText(item.planningUnit.forecastingUnit.label, this.state.lang) : item.consumptionDataType == 2 ? getLabelText(item.planningUnit.label, this.state.lang) : getLabelText(item.otherUnit.label, this.state.lang)}</td>
                                  {this.state.monthArray.map((item1, count) => {
                                    var data = this.state.planningUnitTotalList.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM"))
                                    total += Number(data[0].qty);
                                    totalPU += Number(data[0].qtyInPU);
                                    return (<td onClick={() => { this.buildDataJexcel(item.planningUnit.id) }}><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty} /></td>)
                                  })}
                                  <td><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? Math.round(totalPU) : Math.round(total)} /></td>
                                  <td>100%</td>
                                </tr>
                                {this.state.regionList.map(r => {
                                  var totalRegion = 0;
                                  var totalRegionPU = 0;
                                  return (<tr style={{ display: this.state.consumptionUnitShowArr.includes(item.planningUnit.id) ? "" : "none" }}>
                                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                    <td className="sticky-col first-col clone" align="center">{"   " + getLabelText(r.label, this.state.lang)}</td>
                                    {this.state.monthArray.map((item1, count) => {
                                      var data = this.state.planningUnitTotalListRegion.filter(c => c.planningUnitId == item.planningUnit.id && moment(c.month).format("YYYY-MM") == moment(item1.date).format("YYYY-MM") && c.region.regionId == r.regionId)
                                      totalRegion += Number(data[0].qty);
                                      totalRegionPU += Number(data[0].qtyInPU);
                                      return (<td onClick={() => { this.buildDataJexcel(item.planningUnit.id) }}><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? data[0].qtyInPU : data[0].qty} /></td>)
                                    })}
                                    <td><NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.showInPlanningUnit ? Math.round(totalRegionPU) : Math.round(totalRegion)} /></td>
                                    <td>{this.state.showInPlanningUnit ? Math.round((totalRegionPU / totalPU) * 100) : Math.round((totalRegion / total) * 100)}{"%"}</td>
                                  </tr>)
                                })}
                              </>)
                            }
                            )}

                          </tbody>
                        </Table>
                      </div>
                    </div>
                    <br></br>
                    <br></br>
                    <div className="row">
                      {this.state.showDetailTable &&
                        <>
                          <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.planningunitheader')}</Label>
                            <div className="controls ">
                              <InputGroup>
                                <Input
                                  type="select"
                                  name="planningUnitId"
                                  id="planningUnitId"
                                  bsSize="sm"
                                  disabled={this.state.selectedConsumptionUnitId > 0 ? true : false}
                                  // onChange={this.filterVersion}
                                  onChange={(e) => { this.getARUList(e); }}
                                  value={this.state.selectedPlanningUnitId}

                                >
                                  <option value="">{i18n.t('static.common.select')}</option>
                                  {planningUnits}
                                </Input>

                              </InputGroup>
                            </div>
                          </FormGroup></>}
                      <FormGroup className="col-md-4" style={{ display: this.state.showDetailTable ? 'block' : 'none' }}>
                        <Label htmlFor="appendedInputButton">{i18n.t('static.dataentry.consumptionNotes')}</Label>
                        <div className="controls ">
                          <InputGroup>
                            <Input
                              type="textarea"
                              name="consumptionNotes"
                              id="consumptionNotes"
                              bsSize="sm"
                              onChange={(e) => this.setState({ consumptionChanged: true })}
                            >
                            </Input>
                          </InputGroup>
                        </div>
                      </FormGroup>
                      <FormGroup className="col-md-4" style={{ paddingTop: '30px', display: this.state.showDetailTable ? 'block' : 'none' }}>
                        <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.interpolationMissingActualConsumption()}>
                          <i className="fa fa-check"></i>{i18n.t('static.pipeline.interpolateMissingValues')}</Button>
                      </FormGroup>
                    </div>
                    {/* <div className="table-scroll">
                          <div className="table-wrap table-responsive">
                            <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options}>
                              <tbody>
                                {this.state.consumptionUnitList.map(c => {
                                  return (<tr>
                                    <td>{this.state.selectedConsumptionUnitId != 0 ? <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false} readOnly ></input> : <input type="radio" id="dataType" name="dataType" checked={c.dataType == this.state.selectedConsumptionUnitId ? true : false}></input>}</td>
                                    <td>{c.dataType == 1 ? "Forecasting Unit" : c.dataType == 2 ? "Planning Unit" : "Other"}</td>
                                    <td>{c.dataType == 1 ? getLabelText(c.forecastingUnit.label, this.state.lang) : c.dataType == 2 ? getLabelText(c.planningUnit.label, this.state.lang) : getLabelText(c.otherUnit.label, this.state.label)}</td>
                                    <td>{c.dataType == 1 ? c.forecastingUnit.multiplier : c.dataType == 2 ? c.planningUnit.multiplier : c.otherUnit.multiplier}</td>
                                  </tr>)
                                })}
                                {this.state.selectedConsumptionUnitId==0 && 
                                <tr></tr>
                              }
                              </tbody>
                              
                            </Table>
                          </div></div> */}
                    {/* </> */}

                    <div className="row">
                      <div className="col-md-12 pl-2 pr-2">
                        <div id="smallTableDiv" className="dataentryTable">
                        </div>
                      </div>
                    </div>
                    <br></br>
                    <br></br>
                    <div className="row">
                      <div className="col-md-12 pl-2 pr-2">
                        <div id="tableDiv" className="leftAlignTable">
                        </div>
                      </div>
                    </div>
                    <br></br>
                    <br></br>
                    {this.state.showDetailTable &&
                      <div className="col-md-12">
                        <div className="chart-wrapper">
                          <Bar id="cool-canvas" data={bar} options={chartOptions} />
                          <div>

                          </div>
                        </div>
                        <b>{i18n.t('static.dataentry.graphNotes')}</b>
                      </div>
                    }
                  </>

                }
              </div>
              <div style={{ display: this.state.loading ? "block" : "none" }}>
                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                  <div class="align-items-center">
                    <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                    <div class="spinner-border blue ml-4" role="status">

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <FormGroup>
              <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
              {this.state.consumptionChanged && <><Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.saveConsumptionList()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>&nbsp;</>}
              {this.state.showSmallTable && <> <Button type="button" id="dataCheck" size="md" color="info" className="float-right mr-1" onClick={() => this.openDataCheckModel()}><i className="fa fa-check"></i>{i18n.t('static.common.dataCheck')}</Button></>}
              &nbsp;
            </FormGroup>
          </CardFooter>
        </Card>
        <Modal isOpen={this.state.showGuidance}
          className={'modal-lg ' + this.props.className} >
          <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
            <strong className="TextWhite">Show Guidance</strong>
          </ModalHeader>
          <div>
            <ModalBody>
              <p>Methods are organized from simple to robust

                More sophisticated models are more sensitive to problems in the data

                If you have poorer data (missing data points, variable reporting rates, less than 12 months of data), use simpler forecast methods
              </p>
            </ModalBody>
          </div>
        </Modal>
        <Modal isOpen={this.state.toggleDataCheck}
          className={'modal-lg ' + this.props.className} >
          <ModalHeader toggle={() => this.openDataCheckModel()} className="ModalHead modal-info-Headher">
            <div>
              <img className=" pull-right iconClass cursor ml-lg-2" style={{ height: '22px', width: '22px', cursor: 'pointer',marginTop:'-4px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDFDataCheck()} />
              <strong>{i18n.t('static.common.dataCheck')}</strong>
            </div>
          </ModalHeader>
          <div>
            <ModalBody>
              <span><b>{i18n.t('static.commitTree.consumptionForecast')} : </b>(<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank">{i18n.t('static.commitTree.dataEntry&Adjustment')}</a>, <a href="/#/extrapolation/extrapolateData" target="_blank">{i18n.t('static.commitTree.extrapolation')}</a>)</span><br />
              <span>a. {i18n.t('static.commitTree.monthsMissingActualConsumptionValues')} :</span><br />
              <ul>{missingMonths}</ul>
              <span>b. {i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues')} :</span><br />
              <ul>{consumption}</ul>
            </ModalBody>
          </div>
        </Modal>
      </div >
    );
  }

  openDataCheckModel() {
    this.setState({
      toggleDataCheck: !this.state.toggleDataCheck
    }, () => {
      if (this.state.toggleDataCheck) {
        this.calculateData();
      }
    })
  }

  calculateData() {
    this.setState({ loading: true })
    var datasetJson = this.state.datasetJson;
    var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
    var stopDate = moment(Date.now()).format("YYYY-MM-DD");

    var consumptionList = datasetJson.actualConsumptionList;
    var datasetPlanningUnit = datasetJson.planningUnitList.filter(c => c.consuptionForecast);
    var datasetRegionList = datasetJson.regionList;
    var missingMonthList = [];

    //Consumption : planning unit less 24 month
    var consumptionListlessTwelve = [];
    for (var dpu = 0; dpu < datasetPlanningUnit.length; dpu++) {
      for (var drl = 0; drl < datasetRegionList.length; drl++) {
        var curDate = startDate;
        var monthsArray = [];
        var puId = datasetPlanningUnit[dpu].planningUnit.id;
        var regionId = datasetRegionList[drl].regionId;
        var consumptionListFiltered = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
        if (consumptionListFiltered.length < 24) {
          consumptionListlessTwelve.push({
            planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
            planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
            regionId: datasetRegionList[drl].regionId,
            regionLabel: datasetRegionList[drl].label,
            noOfMonths: consumptionListFiltered.length
          })
        }

        //Consumption : missing months
        for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
          curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
          var consumptionListFilteredForMonth = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId && c.month == curDate);
          if (consumptionListFilteredForMonth.length == 0) {
            monthsArray.push(" " + moment(curDate).format(DATE_FORMAT_CAP_WITHOUT_DATE));
          }
        }

        if (monthsArray.length > 0) {
          missingMonthList.push({
            planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
            planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
            regionId: datasetRegionList[drl].regionId,
            regionLabel: datasetRegionList[drl].label,
            monthsArray: monthsArray
          })
        }
      }
    }
    this.setState({
      missingMonthList: missingMonthList,
      consumptionListlessTwelve: consumptionListlessTwelve,
      loading: false
    })

  }
}