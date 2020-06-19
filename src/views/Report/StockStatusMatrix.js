import React from "react";
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Table } from 'reactstrap';
import i18n from '../../i18n'
import RealmService from '../../api/RealmService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProductService from '../../api/ProductService';
import ProgramService from '../../api/ProgramService';
import csvicon from '../../assets/img/csv.png'
import pdfIcon from '../../assets/img/pdf.png';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import Pdf from "react-to-pdf"
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Online, Offline } from "react-detect-offline";
import { LOGO } from '../../CommonComponent/Logo.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
const pickerLang = {
  months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
  from: 'From', to: 'To',
}
const { ExportCSVButton } = CSVExport;
const entityname = i18n.t('static.dashboard.productCatalog');
export default class StockStatusMatrix extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      realms: [],
      productCategories: [],
      planningUnits: [],
      data: [],
      programs: [],
      view: 1,
      offlinePrograms: [],
      offlinePlanningUnitList: [],
      offlineProductCategoryList: [],
      offlineInventoryList: [],
      years: [],
      pulst: [],
      message: '',
      planningUnitValues: [],
      planningUnitLabels: [],
      rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },


    }
    this.filterData = this.filterData.bind(this);
    this.formatLabel = this.formatLabel.bind(this);
    this.getProductCategories = this.getProductCategories.bind(this)
    this.getPrograms = this.getPrograms.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.getPlanningUnit = this.getPlanningUnit.bind(this);

  }

  makeText = m => {
    if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
    return '?'
  }
  show() {
    /* if (!this.state.showed) {
         setTimeout(() => {this.state.closeable = true}, 250)
         this.setState({ showed: true })
     }*/
  }
  handleRangeChange(value, text, listIndex) {
    //this.filterData();
  }
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      this.filterData();
    })

  }

  _handleClickRangeBox(e) {
    this.refs.pickRange.show()
  }
  getversion=()=>{
    let programId = document.getElementById("programId").value;
    if (programId != 0 ) {
         const program = this.state.programs.filter(c => c.programId == programId)
        if(program.length==1){
         return   program[0].currentVersion.versionId
       
    }else{
        return -1
    }}

  }

  handlePlanningUnitChange=(planningUnitIds)=> {


    var planningUnitIdArray = [];
    var planningUnitLabel = [];
    planningUnitIdArray = planningUnitIds.map(ele => ele.value)
    planningUnitLabel = planningUnitIds.map(ele => ele.label)
    /* for (var i = 0; i < planningUnitIds.length; i++) {
       planningUnitIdArray[i] = planningUnitIds[i].value;
       planningUnitLabel[i] = planningUnitIds[i].label
 
     }*/

    this.setState({
        planningUnitValues: planningUnitIds.map(ele => ele.value),
        planningUnitLabels: planningUnitIds.map(ele => ele.label)
    }, () => {

        this.filterData()
    })


}

  filterData() {
    console.log('In filter data---' + this.state.rangeValue.from.year)
    let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
    let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
    let programId = document.getElementById("programId").value;
    let productCategoryId = document.getElementById("productCategoryId").value;
    let planningUnitId =  this.state.planningUnitValues;
    let view = document.getElementById("view").value;
    let versionId=this.getversion();
    if(productCategoryId>=0 && planningUnitId.length>0&&programId>0){
      var inputjson={
        "programId":programId,
        "versionId":versionId,
        "startDate":startDate,
        "stopDate":endDate,
        "planningUnitIds":planningUnitId,
        "includePlannedShipments":1,
        "view":view
      }
    
    if (navigator.onLine) {
      let realmId = AuthenticationService.getRealmId();
      AuthenticationService.setupAxiosInterceptors();
      ProductService.getStockStatusMatrixData(inputjson)
        .then(response => {
          console.log("data---", response.data)
          if (view == 1) {
            this.setState({
              data: response.data,
              view: view
            })
          } else {

            let years = [...new Set(response.data.map(ele => (ele.YR)))]
            let pulst = [...new Set(response.data.map(ele => (ele.LABEL_EN)))]
            let consumptiondata = [];
            console.log(years + " " + pulst)
            for (var j = 0; j < pulst.length; j++) {

              let data = [];
              for (var i = 0; i < years.length; i++) {
                let d1 = response.data.filter(c => years[i] == c.YR && pulst[j] == c.LABEL_EN).map(ele => ([ele.Q1, ele.Q2, ele.Q3, ele.Q4]))
                var d2 = [];
                for (var k = 0; k < d1.length; k++)
                  d2 = [...d2, ...d1[k]]
                data = [...data, ...d2];
              }

              consumptiondata.push([pulst[j], ...data])
            }
            console.log(consumptiondata)
            this.setState({
              data: consumptiondata,
              view: view,
              years: years,
              pulst: pulst
            })
          }
        }).catch(
          error => {
            this.setState({
              consumptions: []
            })

            if (error.message === "Network Error") {
              this.setState({ message: error.message });
            } else {
              switch (error.response ? error.response.status : "") {
                case 500:
                case 401:
                case 404:
                case 406:
                case 412:
                  this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                  break;
                default:
                  this.setState({ message: 'static.unkownError' });
                  break;
              }
            }
          }
        );
    } else {
      if (view == 1) {

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;

          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var programRequest = programTransaction.get(programId);


          programRequest.onsuccess = function (event) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
            var offlineInventoryList1 = (programJson.inventoryList);
            console.log("offlineInventoryList1---", offlineInventoryList1);

            const activeFilter = offlineInventoryList1.filter(c => (c.active == true || c.active == "true"));
            console.log("activeFilter---", activeFilter);

            const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);
            console.log("planningUnitFilter---", planningUnitFilter);
            const productCategoryFilter = planningUnitFilter.filter(c => (c.planningUnit.forecastingUnit != null && c.planningUnit.forecastingUnit != "") && (c.planningUnit.forecastingUnit.productCategory.id == productCategoryId));
            console.log("productCategoryFilter---", productCategoryFilter)

            // const dateFilter = planningUnitFilter.filter(c => moment(c.startDate).isAfter(startDate) && moment(c.stopDate).isBefore(endDate))
            const filteredData = productCategoryFilter.filter(c => moment(c.inventoryDate).isBetween(startDate, endDate, null, '[)'))
            console.log("filteredData---", filteredData);
            let finalOfflineInventory = [];
            let previousYear = 0;
            let json;
            console.log("going to execute for loop");
            for (let i = this.state.rangeValue.from.year; i <= this.state.rangeValue.to.year; i++) {
              let jan = 0;
              let feb = 0;
              let mar = 0;
              let apr = 0;
              let may = 0;
              let jun = 0;
              let jul = 0;
              let aug = 0;
              let sep = 0;
              let oct = 0;
              let nov = 0;
              let dec = 0;
              let monthArray = [];
              for (let j = 0; j <= filteredData.length; j++) {
                if (filteredData[j] != null && filteredData[j] != "" && (i == moment(filteredData[j].inventoryDate, 'YYYY-MM-DD').format('YYYY'))) {
                  // for (let k = 0; k <= filteredData.length; k++) {

                  // }

                  let month = moment(filteredData[j].inventoryDate, 'YYYY-MM-DD').format('MM');
                  if (month == "01" || month == "1" || month == 1) {
                    jan = jan + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "02" || month == "2" || month == 2) {
                    feb = feb + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "03" || month == "3" || month == 3) {
                    mar = mar + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "04" || month == "4" || month == 4) {
                    apr = apr + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "05" || month == "5" || month == 5) {
                    may = may + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "06" || month == "6" || month == 6) {
                    jun = jun + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "07" || month == "7" || month == 7) {
                    jul = jul + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "08" || month == "8" || month == 8) {
                    aug = aug + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "09" || month == "9" || month == 9) {
                    sep = sep + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "10" || month == 10) {
                    oct = oct + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "11" || month == 11) {
                    nov = nov + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if (month == "12" || month == 12) {
                    dec = dec + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                }
              }
              let sel = document.getElementById("planningUnitId");
              var text = sel.options[sel.selectedIndex].text;
              json = {
                PLANNING_UNIT_LABEL_EN: text,
                YEAR: i,
                Jan: jan,
                Feb: feb,
                Mar: mar,
                Apr: apr,
                May: may,
                Jun: jun,
                Jul: jul,
                Aug: aug,
                Sep: sep,
                Oct: oct,
                Nov: nov,
                Dec: dec
              }
              finalOfflineInventory.push(json);
            }
            console.log("finalOfflineInventory---", finalOfflineInventory);
            let offlineInventoryList = finalOfflineInventory;
            console.log("offlineInventoryList---", offlineInventoryList);
            this.setState({
              offlineInventoryList
            });


          }.bind(this)

        }.bind(this)

      } else {

        let years = []

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
          db1 = e.target.result;

          var transaction = db1.transaction(['programData'], 'readwrite');
          var programTransaction = transaction.objectStore('programData');
          var programRequest = programTransaction.get(programId);


          programRequest.onsuccess = function (event) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
            var offlineInventoryList = (programJson.inventoryList);
            console.log("offlineInventoryList---", offlineInventoryList);

            const activeFilter = offlineInventoryList.filter(c => (c.active == true || c.active == "true"));
            console.log("activeFilter---", activeFilter);

            const planningUnitFilter = activeFilter.filter(c => c.planningUnit.id == planningUnitId);
            console.log("planningUnitFilter---", planningUnitFilter);
            const productCategoryFilter = planningUnitFilter.filter(c => (c.planningUnit.forecastingUnit != null && c.planningUnit.forecastingUnit != "") && (c.planningUnit.forecastingUnit.productCategory.id == productCategoryId));
            console.log("productCategoryFilter---", productCategoryFilter)

            // const dateFilter = planningUnitFilter.filter(c => moment(c.startDate).isAfter(startDate) && moment(c.stopDate).isBefore(endDate))
            const filteredData = productCategoryFilter.filter(c => moment(c.inventoryDate).isBetween(startDate, endDate, null, '[)'))
            console.log("filteredData---", filteredData);
            let finalOfflineInventory = [];
            // let previousYear = 0;
            let json;
            let sel = document.getElementById("planningUnitId");
            var text = sel.options[sel.selectedIndex].text;
            let pulst = [text]
            console.log(pulst + " " + pulst)
            for (let i = this.state.rangeValue.from.year; i <= this.state.rangeValue.to.year; i++) {
              years.push(i);
              let q1 = 0;
              let q2 = 0;
              let q3 = 0;
              let q4 = 0;
              for (let j = 0; j <= filteredData.length; j++) {
                if (filteredData[j] != null && filteredData[j] != "" && (i == moment(filteredData[j].inventoryDate, 'YYYY-MM-DD').format('YYYY'))) {
                  let month = moment(filteredData[j].inventoryDate, 'YYYY-MM-DD').format('MM');
                  if ((month == "01" || month == "1" || month == 1) || (month == "02" || month == "2" || month == 2) || (month == "03" || month == "3" || month == 3)) {
                    q1 = q1 + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if ((month == "04" || month == "4" || month == 4) || (month == "05" || month == "5" || month == 5) || (month == "06" || month == "6" || month == 6)) {
                    q2 = q2 + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if ((month == "07" || month == "7" || month == 7) || (month == "08" || month == "8" || month == 8) || (month == "09" || month == "9" || month == 9)) {
                    q3 = q3 + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                  if ((month == "10" || month == 10) || (month == "11" || month == 11) || (month == "12" || month == 12)) {
                    q4 = q4 + (filteredData[j].actualQty ? filteredData[j].actualQty : 0);
                  }
                }
              }
              json = {
                PLANNING_UNIT_LABEL_EN: text,
                YEAR: i,
                Q1: q1,
                Q2: q2,
                Q3: q3,
                Q4: q4
              }
              console.log("json---", json);
              finalOfflineInventory.push(json);
              // finalOfflineInventory.push(json);
            }
            console.log(years + " " + years)
            let consumptiondata = [];
            for (var j = 0; j < pulst.length; j++) {
              let data = [];
              for (var i = 0; i < years.length; i++) {
                let d1 = finalOfflineInventory.filter(c => years[i] == c.YEAR && pulst[j] == c.ABEL_EN).map(ele => ([ele.Q1, ele.Q2, ele.Q3, ele.Q4]))
                var d2 = [];
                for (var k = 0; k < d1.length; k++)
                  d2 = [...d2, ...d1[k]]
                data = [...data, ...d2];
              }
              consumptiondata.push([pulst[j], ...data])
            }
            console.log(consumptiondata)
            this.setState({
              data: consumptiondata,
              view: view,
              years: years,
              pulst: pulst
            })
            console.log("state pulst---" + this.state.pulst);
            // }
            // this.setState({
            //   offlineInventoryList: finalOfflineInventory
            // });

          }.bind(this)

        }.bind(this)
      }
    }}else   if(programId==0){
      this.setState({ message: i18n.t('static.common.selectProgram') ,consumptions:[]});
              
    }else if(productCategoryId==-1){
      this.setState({ message: i18n.t('static.common.selectProductCategory'),consumptions:[] });
  
    }else{
      this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'),consumptions:[] });
 
    }
  }

  getProductCategories() {
    let programId = document.getElementById("programId").value;
    let realmId = AuthenticationService.getRealmId();
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      let programId = document.getElementById("programId").value;
      ProductService.getProductCategoryListByProgram(realmId, programId)
        .then(response => {
          console.log(JSON.stringify(response.data))
          this.setState({
            productCategories: response.data
          })
        }).catch(
          error => {
            this.setState({
              productCategories: []
            })
            if (error.message === "Network Error") {
              this.setState({ message: error.message });
            } else {
              switch (error.response ? error.response.status : "") {
                case 500:
                case 401:
                case 404:
                case 406:
                case 412:
                  this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                  break;
                default:
                  this.setState({ message: 'static.unkownError' });
                  break;
              }
            }
          }
        );
    } else {
      var db1;
      getDatabase();
      var openRequest = indexedDB.open('fasp', 1);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;

        var transaction = db1.transaction(['programData'], 'readwrite');
        var programTransaction = transaction.objectStore('programData');
        var programRequest = programTransaction.get(programId);

        programRequest.onsuccess = function (event) {
          var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
          var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
          var programJson = JSON.parse(programData);
          var offlineInventoryList = (programJson.inventoryList);
          console.log("offlineInventoryList---", offlineInventoryList);
          let offlineProductCategoryList = [];
          var json;

          for (let i = 0; i <= offlineInventoryList.length; i++) {
            let count = 0;
            if (offlineInventoryList[i] != null && offlineInventoryList[i] != "" && offlineInventoryList[i].planningUnit.forecastingUnit != null && offlineInventoryList[i].planningUnit.forecastingUnit != "") {
              for (let j = 0; j <= offlineProductCategoryList.length; j++) {
                if (offlineProductCategoryList[j] != null && offlineProductCategoryList[j] != "" && (offlineProductCategoryList[j].id == offlineInventoryList[i].planningUnit.forecastingUnit.productCategory.id)) {
                  count++;
                }
              }
              if (count == 0 || i == 0) {
                offlineProductCategoryList.push({
                  id: offlineInventoryList[i].planningUnit.forecastingUnit.productCategory.id,
                  name: offlineInventoryList[i].planningUnit.forecastingUnit.productCategory.label.label_en
                });
              }
            }
          }
          this.setState({
            offlineProductCategoryList
          });

        }.bind(this)

      }.bind(this)
    }
    this.getPlanningUnit();


  }
  getPlanningUnit() {
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      let programId = document.getElementById("programId").value;
      let productCategoryId = document.getElementById("productCategoryId").value;
      ProgramService.getProgramPlaningUnitListByProgramAndProductCategory(programId, productCategoryId).then(response => {
        console.log('**' + JSON.stringify(response.data))
        this.setState({ planningUnits: response.data });
      })
        .catch(
          error => {
            if (error.message === "Network Error") {
              this.setState({ message: error.message, planningUnits: [] });
            } else {
              switch (error.response ? error.response.status : "") {
                case 500:
                case 401:
                case 404:
                case 406:
                case 412:
                  this.setState({ message: error.response.data.messageCode, planningUnits: [] });
                  break;
                default:
                  this.setState({ message: 'static.unkownError', planningUnits: [] });
                  break;
              }
            }
          }
        );
    } else {
      const lan = 'en';
      var db1;
      var storeOS;
      getDatabase();
      var openRequest = indexedDB.open('fasp', 1);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
        var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
        var planningunitRequest = planningunitOs.getAll();
        var planningList = []
        planningunitRequest.onerror = function (event) {
          // Handle errors!
        }.bind(this);
        planningunitRequest.onsuccess = function (e) {
          var myResult = [];
          myResult = planningunitRequest.result;
          var programId = (document.getElementById("programId").value).split("_")[0];
          var proList = []
          for (var i = 0; i < myResult.length; i++) {
            if (myResult[i].program.id == programId) {
              var productJson = {
                name: getLabelText(myResult[i].planningUnit.label, lan),
                id: myResult[i].planningUnit.id
              }
              proList[i] = productJson
            }
          }
          this.setState({
            offlinePlanningUnitList: proList
          })
        }.bind(this);
      }.bind(this)

    }
  }


  getPrograms() {
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      let realmId = AuthenticationService.getRealmId();
      ProgramService.getProgramByRealmId(realmId)
        .then(response => {
          console.log(JSON.stringify(response.data))
          this.setState({
            programs: response.data
          })
        }).catch(
          error => {
            this.setState({
              programs: []
            })
            if (error.message === "Network Error") {
              this.setState({ message: error.message });
            } else {
              switch (error.response ? error.response.status : "") {
                case 500:
                case 401:
                case 404:
                case 406:
                case 412:
                  this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                  break;
                default:
                  this.setState({ message: 'static.unkownError' });
                  break;
              }
            }
          }
        );

    } else {
      const lan = 'en';
      var db1;
      getDatabase();
      var openRequest = indexedDB.open('fasp', 1);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['programData'], 'readwrite');
        var program = transaction.objectStore('programData');
        var getRequest = program.getAll();
        var proList = []
        getRequest.onerror = function (event) {
          // Handle errors!
        };
        getRequest.onsuccess = function (event) {
          var myResult = [];
          myResult = getRequest.result;
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          for (var i = 0; i < myResult.length; i++) {
            if (myResult[i].userId == userId) {
              var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
              var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
              var programJson = {
                name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
                id: myResult[i].id
              }
              proList[i] = programJson
            }
          }
          this.setState({
            offlinePrograms: proList
          })

        }.bind(this);

      }


    }


  }
  componentDidUpdate() {
    setTimeout(() => this.setState({ message: '' }), 3000);
  }


  componentDidMount() {
    if (navigator.onLine) {
      AuthenticationService.setupAxiosInterceptors();
      this.getPrograms();

    } else {
      const lan = 'en';
      var db1;
      getDatabase();
      var openRequest = indexedDB.open('fasp', 1);
      openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['programData'], 'readwrite');
        var program = transaction.objectStore('programData');
        var getRequest = program.getAll();
        var offlinePrograms = []
        getRequest.onerror = function (event) {
          // Handle errors!
        }.bind(this);;
        getRequest.onsuccess = function (event) {
          var myResult = [];
          myResult = getRequest.result;
          var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
          var userId = userBytes.toString(CryptoJS.enc.Utf8);
          for (var i = 0; i < myResult.length; i++) {
            if (myResult[i].userId == userId) {
              console.log("my result---", myResult[i]);
              var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
              var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
              var programJson = {
                name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
                id: myResult[i].id
              }
              offlinePrograms[i] = programJson
            }
          }
          console.log("program list---", offlinePrograms);
          this.setState({
            offlinePrograms
          })

        }.bind(this);

      }.bind(this);
    }
  }
  formatter = value => {

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

  exportCSV(columns) {

    var csvRow = [];
    csvRow.push((i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20'))
    csvRow.push(i18n.t('static.program.program') + ' : ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20'))
    csvRow.push(i18n.t('static.productcategory.productcategory').replaceAll(' ', '%20') + '  :  ' + (document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(' ', '%20'))
    this.state.planningUnitLabels.map(ele =>
      csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
  csvRow.push('')
   csvRow.push('')
    csvRow.push('')
    csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
    csvRow.push('')

    const headers = [];
    columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });


    if (this.state.view == 2) {

      headers[0] = i18n.t('static.planningunit.planningunit').replaceAll(' ', '%20')
      for (var i = 0, j = 1; i < this.state.years.length; i++) {
        headers[j++] = ('Q1 ' + this.state.years[i]).replaceAll(' ', '%20')
        headers[j++] = ('Q2 ' + this.state.years[i]).replaceAll(' ', '%20')
        headers[j++] = ('Q3 ' + this.state.years[i]).replaceAll(' ', '%20')
        headers[j++] = ('Q4 ' + this.state.years[i]).replaceAll(' ', '%20')
      }
    } else {
      columns.map((item, idx) => { headers[idx] = item.text });
    }
    var A = [headers]
    var re;
    if (navigator.onLine) {
      re = this.state.data
    }
    else {
      re = this.state.offlineInventoryList
    }
    if (navigator.onLine) {
      if (this.state.view == 1) {
        this.state.data.map(ele => A.push([(ele.LABEL_EN.replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.YR, ele.Jan, ele.Feb, ele.Mar, ele.Apr, ele.May, ele.Jun, ele.Jul, ele.Aug, ele.Sep, ele.Oct, ele.Nov
          , ele.Dec]));
      } else {
        this.state.data.map(ele => A.push([ele.map(item => ((item.toString()).replaceAll(',', ' ')).replaceAll(' ', '%20'))]));

      }
    } else {
      if (this.state.view == 1) {
        this.state.offlineInventoryList.map(ele => A.push([(ele.PLANNING_UNIT_LABEL_EN.replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.YEAR, ele.Jan, ele.Feb, ele.Mar, ele.Apr, ele.May, ele.Jun, ele.Jul, ele.Aug, ele.Sep, ele.Oct, ele.Nov
          , ele.Dec]));
      } else {
        this.state.data.map(ele => A.push([ele.map(item => ((item.toString()).replaceAll(',', ' ')).replaceAll(' ', '%20'))]));

      }
    }
    /*for(var item=0;item<re.length;item++){
      A.push([re[item].consumption_date,re[item].forcast,re[item].Actual])
    } */
    for (var i = 0; i < A.length; i++) {
      console.log(A[i])
      csvRow.push(A[i].join(","))

    }

    var csvString = csvRow.join("%0A")
    console.log('csvString' + csvString)
    var a = document.createElement("a")
    a.href = 'data:attachment/csv,' + csvString
    a.target = "_Blank"
    a.download = i18n.t('static.dashboard.stockstatusmatrix') + "-" + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
    document.body.appendChild(a)
    a.click()
  }

  exportPDF = (columns) => {
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
        doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
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
        doc.text(i18n.t('static.dashboard.stockstatusmatrix'), doc.internal.pageSize.width / 2, 60, {
          align: 'center'
        })
        if (i == 1) {
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
            align: 'left'
          })
          doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
            align: 'left'
          })
          doc.text(i18n.t('static.productcategory.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
            align: 'left'
          })
         var  planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);

                    doc.text(doc.internal.pageSize.width / 8, 150, planningText)
        }

      }
    }

    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "landscape"; // portrait or landscape

    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(8);


    // const title = i18n.t('static.dashboard.stockstatusmatrix');
    let header = []

    if (this.state.view == 2) {
      let header1 = [{ content: i18n.t('static.planningunit.planningunit'), rowSpan: 2, styles: { halign: 'center' } }, ...this.state.years.map(ele => ({ content: ele, colSpan: 4, styles: { halign: 'center' } }))]
      let quarterheader = [];
      //headers[0]=i18n.t('static.planningunit.planningunit')
      for (var i = 0, j = 0; i < this.state.years.length; i++) {
        quarterheader[j++] = { content: 'Q1', styles: { halign: 'center' } }
        quarterheader[j++] = { content: 'Q2', styles: { halign: 'center' } }
        quarterheader[j++] = { content: 'Q3', styles: { halign: 'center' } }
        quarterheader[j++] = { content: 'Q4', styles: { halign: 'center' } }
      }
      header = [header1, quarterheader]
      console.log(header)
    } else {
      let headers = [];
      columns.map((item, idx) => { headers[idx] = item.text });
      header = [headers];
    }


    console.log(header);
    let data;
    if (this.state.view == 2) {
      data = this.state.data.map(ele => ele.map((item, index) => (index == 0 ? { content: item, styles: { halign: 'left' } } : { content: this.formatter(item), styles: { halign: 'right' } })));
    }
    else if (navigator.onLine && this.state.view == 1) {
      data = this.state.data.map(ele => [ele.LABEL_EN, ele.YR, ele.Jan.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Feb.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Mar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Apr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.May.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Jun.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Jul.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Aug.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Sep.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Oct.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Nov
      .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Dec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")]);

    } else {
      data = this.state.offlineInventoryList.map(ele => [ele.PLANNING_UNIT_LABEL_EN, ele.YEAR, ele.Jan.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Feb.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Mar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Apr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.May.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Jun.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Jul.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Aug.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Sep.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Oct.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Nov
        .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), ele.Dec.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")]);
    }

    // console.log(data1);
    let content = {
      margin: { top: 40 },
      startY: 200,
      head: header,
      body: data,
      styles: { lineWidth: 1, fontSize: 8,cellWidth: 40 },
      columnStyles: {
        0: { cellWidth: 120 },
       

        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' },
        10: { halign: 'right' },
        11: { halign: 'right' },
        12: { halign: 'right' },
        13: { halign: 'right' },
      }
    };

    // let content = {
    //   margin: { top: 80 },
    //   startY: height,
    //   head: headers,
    //   body: data,

    // };

    // doc.text(title, marginLeft, 40);
    doc.autoTable(content);
    addHeaders(doc)
    addFooters(doc)
    doc.save(i18n.t('static.dashboard.stockstatusmatrix') + ".pdf")
  }


  formatLabel(cell, row) {
    return getLabelText(cell, this.state.lang);
  }

  render() {


    const { offlinePrograms } = this.state;
    const { offlineProductCategoryList } = this.state;
    const { offlinePlanningUnitList } = this.state;

    const { planningUnits } = this.state;
    let planningUnitList = planningUnits.length > 0
      && planningUnits.map((item, i) => {
        return ({ label: getLabelText(item.planningUnit.label, this.state.lang), value: item.planningUnit.id })

      }, this);
    const { productCategories } = this.state;
    let productCategoryList = productCategories.length > 0
      && productCategories.map((item, i) => {
        return (
          <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
            {Array(item.level).fill('   ').join('') + (getLabelText(item.payload.label, this.state.lang))}
          </option>
        )
      }, this);
    const pickerLang = {
      months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
      from: 'From', to: 'To',
    }
    const { rangeValue } = this.state

    const makeText = m => {
      if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
      return '?'
    }
    const formatter = value => {

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

    const { SearchBar, ClearSearchButton } = Search;
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t('static.common.result', { from, to, size })}
      </span>
    );

    const { programs } = this.state;
    let programList = programs.length > 0
      && programs.map((item, i) => {
        return (
          <option key={i} value={item.programId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);
    let columns = [
      {
        dataField: 'LABEL_EN',
        text: i18n.t('static.planningunit.planningunit'),
        sort: true,
        align: 'left',
        headerAlign: 'left',
        width: '180'
      }, {
        dataField: 'YR',
        text: i18n.t('static.common.year'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
      },
      {
        dataField: 'Jan',
        text: i18n.t('static.month.jan'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Jan
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
      }, {
        dataField: 'Feb',
        text: i18n.t('static.month.feb'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Feb
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
      }, {
        dataField: 'Mar',
        text: i18n.t('static.month.mar'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Mar
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
      }, {
        dataField: 'Apr',
        text: i18n.t('static.month.apr'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Apr
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
      }, {
        dataField: 'May',
        text: i18n.t('static.month.may'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.May
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
      }, {
        dataField: 'Jun',
        text: i18n.t('static.month.jun'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Jun
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
      }, {
        dataField: 'Jul',
        text: i18n.t('static.month.jul'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Jul
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
      }, {
        dataField: 'Aug',
        text: i18n.t('static.month.aug'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Aug
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
      }, {
        dataField: 'Sep',
        text: i18n.t('static.month.sep'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Sep
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
      }, {
        dataField: 'Oct',
        text: i18n.t('static.month.oct'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Oct
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
      }, {
        dataField: 'Nov',
        text: i18n.t('static.month.nov'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Nov
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
      }, {
        dataField: 'Dec',
        text: i18n.t('static.month.dec'),
        sort: true,
        align: 'right',
        headerAlign: 'center',
        formatter: (cell, row) => {

          var cell1 = row.Dec
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
      }


    ];

    let columns1 = [
      {
        dataField: 'PLANNING_UNIT_LABEL_EN',
        text: i18n.t('static.procurementUnit.planningUnit'),
        sort: true,
        align: 'left',
        headerAlign: 'left',
        width: '180'
      }, {
        dataField: 'YEAR',
        text: i18n.t('static.common.year'),
        sort: true,
        align: 'center',
        headerAlign: 'center'
      },
      {
        dataField: 'Q1',
        text: i18n.t('static.common.quarter1'),
        sort: true,
        align: 'right',
        headerAlign: 'center'
      }, {
        dataField: 'Q2',
        text: i18n.t('static.common.quarter2'),
        sort: true,
        align: 'right',
        headerAlign: 'center'
      }, {
        dataField: 'Q3',
        text: i18n.t('static.common.quarter3'),
        sort: true,
        align: 'right',
        headerAlign: 'center'
      }, {
        dataField: 'Q4',
        text: i18n.t('static.common.quarter4'),
        sort: true,
        align: 'right',
        headerAlign: 'center'
      }]

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
        text: 'All', value: this.state.data.length
      }]
    }
    const MyExportCSV = (props) => {
      const handleClick = () => {
        props.onExport();
      };
      return (
        <div>

          <img style={{ height: '40px', width: '40px' }} src={csvicon} title="Export CSV" onClick={() => handleClick()} />


        </div>
      );
    };

    return (

      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} message={(message) => {
          this.setState({ message: message })
        }} />
        <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
        <h5>{i18n.t(this.state.message, { entityname })}</h5>
        <Card>
          <CardHeader className="pb-1">
            <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.stockstatusmatrix')}</strong>{' '}
            <Online>
              {this.state.data.length > 0 && <div className="card-header-actions">
                <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(this.state.view == 1 ? columns : columns1)} />
                <img style={{ height: '25px', width: '25px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(this.state.view == 1 ? columns : columns1)} />
              </div>}
            </Online>
            <Offline>
              {this.state.offlineInventoryList.length > 0 && <div className="card-header-actions">
                <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(this.state.view == 1 ? columns : columns1)} />
                <img style={{ height: '25px', width: '25px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(this.state.view == 1 ? columns : columns1)} />
              </div>}
            </Offline>
          </CardHeader>
          <CardBody className="pb-md-3">
            <Col md="12 pl-0">
              <div className="row">
                <FormGroup className="col-md-3" title="click here to select period">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                  <div className="controls edit">

                    <Picker
                      ref="pickRange"
                      years={{ min: 2013 }}
                      value={rangeValue}
                      lang={pickerLang}
                      //theme="light"
                      onChange={this.handleRangeChange}
                      onDismiss={this.handleRangeDissmis}
                    >
                      <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                    </Picker>
                  </div>

                </FormGroup>
                <Online>
                  <FormGroup className="col-md-3">
                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                    <div className="controls ">
                      <InputGroup>
                        <Input
                          type="select"
                          name="programId"
                          id="programId"
                          bsSize="sm"
                          onChange={(e) => { this.getProductCategories(e); this.filterData(e) }}


                        >
                          <option value="0">{i18n.t('static.common.select')}</option>
                          {programList}
                        </Input>

                      </InputGroup>
                    </div>
                  </FormGroup>
                </Online>
                <Offline>
                  <FormGroup className="col-md-3">
                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                    <div className="controls ">
                      <InputGroup>
                        <Input
                          type="select"
                          name="programId"
                          id="programId"
                          bsSize="sm"
                          onChange={this.getProductCategories}

                        >
                          <option value="0">{i18n.t('static.common.selectProgram')}</option>
                          {offlinePrograms.length > 0
                            && offlinePrograms.map((item, i) => {
                              return (
                                <option key={i} value={item.id}>
                                  {item.name}
                                </option>
                              )
                            }, this)}
                        </Input>

                      </InputGroup>
                    </div>
                  </FormGroup>
                </Offline>
                <Online>
                  <FormGroup className="col-md-3">
                    <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                    <div className="controls ">
                      <InputGroup>
                        <Input
                          type="select"
                          name="productCategoryId"
                          id="productCategoryId"
                          bsSize="sm"
                          onChange={(e) => { this.getPlanningUnit(e); this.filterData(e) }}
                        >
                          <option value="0">{i18n.t('static.common.all')}</option>
                          {productCategoryList}
                        </Input>

                      </InputGroup>
                    </div>
                  </FormGroup>
                </Online>
                <Offline>
                  <FormGroup className="col-md-3">
                    <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                    <div className="controls ">
                      <InputGroup>
                        <Input
                          type="select"
                          name="productCategoryId"
                          id="productCategoryId"
                          bsSize="sm"
                          onChange={this.getPlanningUnit}
                        >
                          {offlineProductCategoryList.length > 0
                            &&
                            <option value="0">{i18n.t('static.common.selectProductCategory')}</option>}
                          {offlineProductCategoryList.length < 1
                            &&
                            <option value="0">{i18n.t('static.common.selectProgram')}</option>}
                          {offlineProductCategoryList.length > 0
                            && offlineProductCategoryList.map((item, i) => {
                              return (
                                <option key={i} value={item.id}>
                                  {item.name}
                                </option>
                              )
                            }, this)}
                        </Input>

                      </InputGroup>
                    </div>
                  </FormGroup>
                </Offline>
                <Offline>
                  <FormGroup className="col-md-3">
                    <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                    <div className="controls">
                      <InputGroup>
                        <Input
                          type="select"
                          name="planningUnitId"
                          id="planningUnitId"
                          bsSize="sm"
                          onChange={this.filterData}
                        >
                          {offlinePlanningUnitList.length > 0
                            &&
                            <option value="0">{i18n.t('static.common.selectPlanningUnit')}</option>}
                          {offlinePlanningUnitList.length < 1
                            &&
                            <option value="0">{i18n.t('static.common.selectProgram')}</option>}
                          {offlinePlanningUnitList.length > 0
                            && offlinePlanningUnitList.map((item, i) => {
                              return (
                                <option key={i} value={item.id}>
                                  {item.name}
                                </option>
                              )
                            }, this)}
                        </Input>
                        {/* <InputGroupAddon addonType="append">
                          <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                        </InputGroupAddon> */}
                      </InputGroup>
                    </div>
                  </FormGroup>
                </Offline>

                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                  <div className="controls">
                    <InputGroup>
                      <Input
                        type="select"
                        name="view"
                        id="view"
                        bsSize="sm"
                        onChange={this.filterData}
                      >
                        <option value="1">{i18n.t('static.common.monthly')}</option>
                        <option value="2">{i18n.t('static.common.quarterly')}</option>

                      </Input>

                    </InputGroup>
                  </div>
                </FormGroup>
                <Online>
                <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                            <div className="controls">
                                                <InputGroup>   <ReactMultiSelectCheckboxes
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="md"
                                                    onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                    options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                /> </InputGroup>    </div></FormGroup> </Online>
              </div>
            </Col>
            {/* ---------------{this.state.offlineInventoryList} */}
            {this.state.view == 1 && this.state.data.length > 0 && <ToolkitProvider
              keyField="procurementUnitId"
              data={this.state.data}
              columns={columns}
              search={{ searchFormatted: true }}
              hover
              filter={filterFactory()}

            >
              {
                props => (
                  <div className="TableCust ReportFirstHead">

                    {/* <div className="col-md-3 pr-0 offset-md-9 text-right stock-status-search">
                      <SearchBar {...props.searchProps} />
                      <ClearSearchButton {...props.searchProps} /></div> */}
                    <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                      pagination={paginationFactory(options)}

                      {...props.baseProps}
                    />
                  </div>
                )
              }
            </ToolkitProvider>}
            {this.state.view == 1 && this.state.offlineInventoryList.length > 0 && <ToolkitProvider
              keyField="procurementUnitId"
              data={this.state.offlineInventoryList}
              columns={columns}
              search={{ searchFormatted: true }}
              hover
              filter={filterFactory()}

            >
              {
                props => (
                  <div className="TableCust ReportFirstHead">

                    {/* <div className="col-md-3 pr-0 offset-md-9 text-right stock-status-search">
                      <SearchBar {...props.searchProps} />
                      <ClearSearchButton {...props.searchProps} /></div> */}
                    <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                      pagination={paginationFactory(options)}

                      {...props.baseProps}
                    />
                  </div>
                )
              }
            </ToolkitProvider>}
            {this.state.view == 2 && this.state.data.length > 0 &&
              <Table striped bordered hover responsive="md">
                <thead>
                  <tr>
                    <th rowSpan="2" style={{ "width": "20%", "text-align": "center" }}> {i18n.t('static.planningunit.planningunit')}</th>
                    {this.state.years.map((item, i) => {
                      return (
                        <th colSpan="4" style={{ "text-align": "center" }}>{item}</th>
                      )
                    })}
                  </tr>
                  <tr>
                    {this.state.years.map(ele => { return (<><th style={{ "width": "3%", "text-align": "center" }} >Q1</th><th align="center" style={{ "width": "3%", "text-align": "center" }}>Q2</th ><th style={{ "width": "3%", "text-align": "center" }}>Q3</th><th style={{ "width": "3%", "text-align": "center" }}>Q4</th></>) })}

                  </tr>
                </thead>
                <tbody>
                
                    {this.state.data.map(ele => {
                      return (<tr> {ele.map((item, index) => { return (index == 0 ? <td style={{ "text-align": "left" }}>{item}</td> : <td style={{ "text-align": "right" }}>{formatter(item)}</td>) }
                      )}</tr>)
                    })}
                 
                </tbody>
              </Table>
            }

          </CardBody>
        </Card>


      </div>)
  }
}