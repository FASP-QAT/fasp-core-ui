import React, { Component } from 'react';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import csvicon from '../../assets/img/csv.png';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReportService from '../../api/ReportService';

import {
    Badge,
    Button,
    ButtonDropdown,
    ButtonGroup,
    ButtonToolbar,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Widgets,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Progress,
    Pagination,
    PaginationItem,
    PaginationLink,
    Row,
    CardColumns,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js';
import ProgramService from '../../api/ProgramService';
import getLabelText from '../../CommonComponent/getLabelText';
import { contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import { jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { FORECAST_DATEPICKER_START_MONTH, JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC, REPORT_DATEPICKER_START_MONTH, REPORT_DATEPICKER_END_MONTH, JEXCEL_PAGINATION_OPTION, JEXCEL_MONTH_PICKER_FORMAT, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import CryptoJS from 'crypto-js';

const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

export default class StepThreeImportMapPlanningUnits extends Component {
    constructor(props) {
        super(props);

        var dt = new Date();
        dt.setMonth(dt.getMonth() - FORECAST_DATEPICKER_START_MONTH);

        this.state = {
            lang: localStorage.getItem('lang'),
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            // loading: false,
            selSource: [],
            actualConsumptionData: [],
            stepOneData: [],
            datasetList: [],
            forecastProgramVersionId: '',
            forecastProgramId: '',
            startDate: '',
            stopDate: '',
            buildCSVTable: [],
            languageEl: '',
            consumptionData: [],
            monthArrayList: [],
        }
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        this.changeColor = this.changeColor.bind(this);

    }

    changeColor() {

        var elInstance1 = this.el;
        var elInstance = this.state.languageEl;

        var json = elInstance.getJson();

        // var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
        // for (var j = 0; j < json.length; j++) {
        //     var rowData = elInstance.getRowData(j);            
        //     var id = rowData[9];
        //     if (id == 1) {
        //         for (var i = 0; i < colArr.length; i++) {
        //             elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
        //             elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'yellow');
        //             // let textColor = contrast('#f48282');
        //             // elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'color', textColor);
        //         }
        //     } else {
        //         for (var i = 0; i < colArr.length; i++) {
        //             elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
        //         }
        //     }
        // }

        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
        for (var j = 0; j < json.length; j++) {
            var rowData = elInstance.getRowData(j);
            var id = rowData[9];
            if (id == 1 || id == 2 || id == 3) {
                for (var i = 0; i < colArr.length; i++) {
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'yellow');
                }
            } else {
                for (var i = 0; i < colArr.length; i++) {
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                }
            }
        }
    }

    dateFormatter = value => {
        return moment(value).format('MMM YY')
    }

    exportCSV() {

        var csvRow = [];

        // this.state.countryLabels.map(ele =>
        //     csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))

        // csvRow.push('"' + (i18n.t('static.region.country') + ' : ' + document.getElementById("realmCountryId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')

        const headers = [];
        // columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        headers.push(i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.forecastPlanningUnit'));
        headers.push(i18n.t('static.program.region'));
        headers.push(i18n.t('static.inventoryDate.inventoryReport'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.supplyPlanConsumption'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.conversionFactor(SupplyPlantoForecast)'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.convertedConsumption'));
        headers.push(i18n.t('static.importFromQATSupplyPlan.currentQATConsumption'));
        headers.push(i18n.t('static.quantimed.importData'));


        var A = [this.addDoubleQuoteToRowContent(headers)]
        this.state.buildCSVTable.map(ele => A.push(this.addDoubleQuoteToRowContent([((ele.supplyPlanPlanningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20'), ((ele.forecastPlanningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.region, this.dateFormatter(ele.month).replaceAll(' ', '%20'), ele.supplyPlanConsumption, ele.multiplier, ele.convertedConsumption, ele.currentQATConsumption, ele.import == true ? 'Yes' : 'No'])));
        for (var i = 0; i < A.length; i++) {
            // console.log(A[i])
            csvRow.push(A[i].join(","))

        }

        var csvString = csvRow.join("%0A")
        // console.log('csvString' + csvString)
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.importFromQATSupplyPlan.importFromQATSupplyPlan') + ".csv"
        document.body.appendChild(a)
        a.click()
    }

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    formSubmit() {
        confirmAlert({
            title: i18n.t('static.program.confirmsubmit'),
            message: i18n.t('static.importFromQATSupplyPlan.confirmAlert'),
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        this.props.updateStepOneData("loading", true);
                        var tableJson = this.el.getJson(null, false);
                        var programs = [];
                        var ImportListNotPink = [];
                        var ImportListPink = [];

                        let datasetList = this.props.items.datasetList
                        let forecastProgramVersionId = this.props.items.forecastProgramVersionId
                        let forecastProgramId = this.props.items.forecastProgramId
                        let selectedForecastProgramObj = datasetList.filter(c => c.programId == forecastProgramId && c.versionId == forecastProgramVersionId)[0];

                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                        let username = decryptedUser.username;

                        for (var i = 0; i < tableJson.length; i++) {
                            var map1 = new Map(Object.entries(tableJson[i]));

                            let selectedPlanningUnitObj = this.props.items.planningUnitList.filter(c => c.planningUnitId == map1.get("0"))[0];
                            var forecastingUnitObj = selectedPlanningUnitObj.forecastingUnit;
                            forecastingUnitObj.multiplier = map1.get("5");
                            if (map1.get("9") == 0 && map1.get("8") == true) { //not pink
                                // let tempJson = {
                                //     "forecastConsumptionId": '',
                                //     "program": {
                                //         "id": selectedForecastProgramObj.programId,
                                //         "label": selectedForecastProgramObj.label,
                                //         "code": selectedForecastProgramObj.programCode,
                                //         "idString": "" + selectedForecastProgramObj.programId
                                //     },
                                //     "consumptionUnit": {
                                //         "forecastConsumptionUnitId": '',
                                //         "dataType": 1,
                                //         "forecastingUnit": forecastingUnitObj,
                                //         "planningUnit": {
                                //             "id": selectedPlanningUnitObj.planningUnitId,
                                //             "label": selectedPlanningUnitObj.label,
                                //             "multiplier": selectedPlanningUnitObj.multiplier,
                                //             "idString": '' + selectedPlanningUnitObj.planningUnitId,
                                //         },
                                //         "otherUnit": null
                                //     },
                                //     "region": {
                                //         "id": map1.get("10"),
                                //         "label": null,
                                //         "idString": '' + map1.get("10")
                                //     },
                                //     "month": map1.get("3"),
                                //     // "actualConsumption": map1.get("4"),
                                //     "actualConsumption": this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                //     "reportingRate": null,
                                //     "daysOfStockOut": null,
                                //     "exclude": false,
                                //     "versionId": selectedForecastProgramObj.versionId,
                                //     "createdBy": {
                                //         "userId": userId,
                                //         "username": username
                                //     },
                                //     "createdDate": new Date().toISOString().slice(0, 10) + " 19:43:38"
                                // }

                                let regionObj = selectedForecastProgramObj.regionList.filter(c => c.regionId == parseInt(map1.get("10")))[0];

                                let tempJson = {
                                    "actualConsumptionId": '',
                                    "planningUnit": {
                                        "id": selectedPlanningUnitObj.planningUnitId,
                                        "label": selectedPlanningUnitObj.label,
                                        "idString": '' + selectedPlanningUnitObj.planningUnitId,
                                    },
                                    "region": {
                                        "id": map1.get("10"),
                                        "label": regionObj.label,
                                        "idString": '' + map1.get("10")
                                    },
                                    "month": map1.get("3"),
                                    "amount": parseInt(this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", "")),
                                    "reportingRate": null,
                                    "daysOfStockOut": null,
                                    "exclude": false,
                                    "createdBy": {
                                        "userId": userId,
                                        "username": username
                                    },
                                    "createdDate": new Date().toISOString().slice(0, 10) + " 19:43:38"
                                }


                                ImportListNotPink.push(tempJson);
                            }

                            if (map1.get("9") == 1 && map1.get("8") == true) {
                                let tempJsonPink = {
                                    regionId: map1.get("10"),
                                    planningUnitId: map1.get("0"),
                                    month: map1.get("3"),
                                    // actualConsumption: map1.get("4"),
                                    amount: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                                }
                                ImportListPink.push(tempJsonPink);
                            }

                            // console.log("map1.get(3)---", map1.get("3"));
                            // console.log("map1.get(12)---", map1.get("12"));
                            // console.log("map1.get(7)---", map1.get("7"));
                            // console.log("map1.get(8)---", map1.get("8"));
                            // var notes = map1.get("4");
                            // var startDate = map1.get("7");
                            // var stopDate = map1.get("8");
                            // var id = map1.get("10");
                            // var noOfDaysInMonth = map1.get("12");
                            // console.log("start date ---", startDate);
                            // console.log("stop date ---", stopDate);
                            // console.log("noOfDaysInMonth ---", noOfDaysInMonth);

                        }

                        var program = (this.props.items.datasetList1.filter(x => x.programId == this.props.items.forecastProgramId && x.version == this.props.items.forecastProgramVersionId)[0]);
                        var databytes = CryptoJS.AES.decrypt(program.programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));

                        // programData.currentVersion.forecastStartDate = startDate;
                        // programData.actionList = [1, 2]

                        console.log("Final-------------->", programData.actualConsumptionList);
                        let originalConsumptionList = programData.actualConsumptionList;
                        for (var i = 0; i < ImportListPink.length; i++) {
                            // let match = originalConsumptionList.filter(c => new Date(c.month).getTime() == new Date(papuList[j].month).getTime() && c.region.id == papuList[j].region.id && c.consumptionUnit.planningUnit.id == stepOneSelectedObject.forecastPlanningUnitId)
                            let index = originalConsumptionList.findIndex(c => new Date(c.month).getTime() == new Date(ImportListPink[i].month).getTime() && c.region.id == ImportListPink[i].regionId && c.planningUnit.id == ImportListPink[i].planningUnitId)

                            if (index != -1) {
                                let indexObj = originalConsumptionList[index];
                                indexObj.amount = ImportListPink[i].amount;
                                originalConsumptionList[index] = indexObj;
                            }
                        }

                        console.log("Final-------------->11", ImportListNotPink);
                        console.log("Final-------------->12", ImportListPink);
                        console.log("Final-------------->13", originalConsumptionList.concat(ImportListNotPink));
                        programData.actualConsumptionList = originalConsumptionList.concat(ImportListNotPink);


                        programData = (CryptoJS.AES.encrypt(JSON.stringify(programData), SECRET_KEY)).toString();
                        program.programData = programData;
                        // var db1;
                        // getDatabase();
                        // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        // openRequest.onerror = function (event) {
                        //     this.setState({
                        //         message: i18n.t('static.program.errortext'),
                        //         color: 'red'
                        //     })
                        //     this.hideFirstComponent()
                        // }.bind(this);
                        // openRequest.onsuccess = function (e) {
                        //     db1 = e.target.result;
                        //     var transaction = db1.transaction(['datasetData'], 'readwrite');
                        //     var programTransaction = transaction.objectStore('datasetData');
                        //     var programRequest = programTransaction.put(program);
                        //     programRequest.onerror = function (e) {

                        //     }.bind(this);
                        //     programRequest.onsuccess = function (e) {

                        //     }.bind(this);
                        // }.bind(this);
                        programs.push(program);


                        console.log("programs to update---", programs);

                        var db1;
                        getDatabase();
                        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                        openRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                color: 'red'
                            })
                            this.hideFirstComponent()
                            this.props.updateStepOneData("loading", false);
                        }.bind(this);
                        openRequest.onsuccess = function (e) {
                            db1 = e.target.result;
                            var transaction = db1.transaction(['datasetData'], 'readwrite');
                            var programTransaction = transaction.objectStore('datasetData');
                            programs.forEach(program => {
                                var programRequest = programTransaction.put(program);
                                console.log("---hurrey---");
                            })
                            transaction.oncomplete = function (event) {
                                // this.props.updateStepOneData("message", i18n.t('static.mt.dataUpdateSuccess'));
                                // this.props.updateStepOneData("color", "green");
                                // this.setState({
                                //     message: i18n.t('static.mt.dataUpdateSuccess'),
                                //     color: "green",
                                // }, () => {
                                //     this.props.hideSecondComponent();
                                //     this.props.finishedStepThree();
                                //     // this.buildJExcel();
                                // });
                                console.log("Data update success");

                                // this.props.history.push(`/importFromQATSupplyPlan/listImportFromQATSupplyPlan/` + 'green/' + i18n.t('static.mt.dataUpdateSuccess'))
                                this.props.history.push(`/dataentry/consumptionDataEntryAndAdjustment`)


                            }.bind(this);
                            transaction.onerror = function (event) {
                                this.setState({
                                    loading: false,
                                    // message: 'Error occured.',
                                    color: "red",
                                }, () => {
                                    this.hideSecondComponent();
                                    this.props.updateStepOneData("loading", false);
                                });
                                console.log("Data update errr");
                            }.bind(this);
                        }.bind(this);

                    }
                },
                {
                    label: i18n.t('static.program.no')
                }
            ]
        });

    }

    loaded = function (instance, cell, x, y, value) {

    }

    componentDidMount() {

    }

    handleRangeChange(value, text, listIndex) {
        //
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    filterData() {
        console.log("Props items---------------->", this.props.items);

        var unitIds = ""
        unitIds = this.props.items.supplyPlanPlanningUnitIds.map(c => c.forecastPlanningUnitId);
        var startDate = moment(this.props.items.startDate).format("YYYY-MM-DD HH:mm:ss")
        var stopDate = moment(this.props.items.stopDate).format("YYYY-MM-DD HH:mm:ss")

        let inputJson = {
            "programId": Number(this.props.items.forecastProgramId),
            "versionId": Number(this.props.items.versionId),
            "startDate": startDate,
            "stopDate": stopDate,
            "reportView": 1,
            "aggregateByYear": false,
            "unitIds": unitIds
        }

        console.log("OnlineInputJson---------------->", inputJson);
        // var unitDescArr = this.props.items.supplyPlanPlanningUnitIds.map(c);

        // console.log("RESP---------->unitDesc", unitDescArr);
        let tempList = [];
        let supplyPlanRegionList = this.props.items.regionList;
        for (let i = 0; i < supplyPlanRegionList.length; i++) {
            for (let j = 0; j < supplyPlanRegionList[i].supplyPlanRegionList.length; j++) {

            }
        }

        ReportService.forecastOutput(inputJson)
            .then(response => {
                console.log("RESP---------->forecastOutput", response.data);
                let primaryConsumptionData = response.data;
                let selectedSupplyPlan = this.props.items.supplyPlanPlanningUnitIds;
                var count1 = 1;
                for (let i = 0; i < primaryConsumptionData.length; i++) {
                    for (let j = 0; j < primaryConsumptionData[i].monthlyForecastData.length; j++) {
                        for (let k = 0; k < selectedSupplyPlan.length; k++) {
                            for (let l = 0; l < supplyPlanRegionList.length; l++) {
                                for (let m = 0; m < supplyPlanRegionList[l].supplyPlanRegionList.length; m++) {
                                    console.log("RESP---------->", supplyPlanRegionList[l].supplyPlanRegionList[m].forecastPercentage);

                                    tempList.push({
                                        id: count1,
                                        v1: getLabelText(primaryConsumptionData[i].planningUnit.label, this.state.lang),
                                        v2: selectedSupplyPlan[k].supplyPlanPlanningUnitDesc,
                                        v3: supplyPlanRegionList[l].supplyPlanRegionList[m].name,
                                        v4: primaryConsumptionData[i].monthlyForecastData[j].month,
                                        v5: (Number(primaryConsumptionData[i].monthlyForecastData[j].consumptionQty) * Number(supplyPlanRegionList[l].supplyPlanRegionList[m].forecastPercentage) / 100),
                                        v6: Number(selectedSupplyPlan[k].multiplier),
                                        v7: Number(primaryConsumptionData[i].monthlyForecastData[j].consumptionQty * selectedSupplyPlan[k].multiplier),
                                        v8: '3500.00',
                                        v9: true
                                    });
                                    // let consumptionList = primaryConsumptionData[i].monthlyForecastData.map(m => {
                                    //     return {
                                    //         consumptionDate: m.month,
                                    //         consumptionQty: Math.round(m.consumptionQty)
                                    //     }
                                    // });

                                    // //             let jsonTemp = { objUnit: (viewById == 1 ? primaryConsumptionData[i].planningUnit : primaryConsumptionData[i].forecastingUnit), scenario: { id: 1, label: primaryConsumptionData[i].selectedForecast.label_en }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                    // consumptionData.push(consumptionList);
                                    count1++;
                                }

                            }
                        }
                    }
                }


                // var monthArrayList = [];
                // let cursorDate = startDate;
                // for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"); i++) {
                //     var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                //     cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
                //     monthArrayList.push(dt);
                // }

                // console.log("consumptionData", consumptionData)
                // console.log("monthArrayList", monthArrayList)

                //         if (xaxisId == 1) {//yes

                //             let min = moment(startDate).format("YYYY");
                //             let max = moment(endDate).format("YYYY");
                //             let years = [];
                //             for (var i = min; i <= max; i++) {
                //                 years.push("" + i)
                //             }

                //             let nextStartDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
                //             let nextEndDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-28';

                //             console.log("TestFU------------>900online", nextStartDate);
                //             console.log("TestFU------------>901online", nextEndDate);
                //             console.log("TestFU------------>92online", consumptionData);

                //             for (let i = 0; i < consumptionData.length; i++) {

                //                 console.log("consumptionData------------------->3002online", consumptionData[i].consumptionList);
                //                 let nextConsumptionListData = consumptionData[i].consumptionList.filter(c => moment(c.consumptionDate).isBetween(nextStartDate, nextEndDate, null, '[)'))
                //                 console.log("consumptionData------------------->3003online", nextConsumptionListData);

                //                 let tempConsumptionListData = nextConsumptionListData.map(m => {
                //                     return {
                //                         consumptionDate: moment(m.consumptionDate).format("YYYY"),
                //                         // consumptionQty: m.consumptionQty
                //                         consumptionQty: parseInt(m.consumptionQty)
                //                     }
                //                 });
                //                 console.log("consumptionData------------------->33online", tempConsumptionListData);

                //                 //logic for add same date data                            
                //                 let resultTrue = Object.values(tempConsumptionListData.reduce((a, { consumptionDate, consumptionQty }) => {
                //                     if (!a[consumptionDate])
                //                         a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                //                     else
                //                         // a[consumptionDate].consumptionQty += consumptionQty;
                //                         // a[consumptionDate].consumptionQty = parseFloat(a[consumptionDate].consumptionQty) + parseFloat(consumptionQty);
                //                         a[consumptionDate].consumptionQty = parseInt(a[consumptionDate].consumptionQty) + parseInt(consumptionQty);
                //                     return a;
                //                 }, {}));

                //                 console.log("consumptionData------------------->3online", resultTrue);

                //                 consumptionData[i].consumptionList = resultTrue;
                //             }
                //             console.log("consumptionData------------------->3online", years);
                //             console.log("consumptionData------------------->4online", consumptionData);
                //             this.setState({
                //                 consumptionData: consumptionData,
                //                 monthArrayList: years,
                //                 message: ''
                //             }, () => {
                //                 // if (yaxisEquUnitId > 0) {
                //                 //     this.calculateEquivalencyUnitTotal();
                //                 // }
                //             })

                //         } else {//no
                this.setState({
                    selSource: tempList,
                    loading: true
                }, () => {
                    this.buildJexcel();
                })

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




        console.log("step 3-tempList--->", tempList)
        // tempList.push({ id: 1, v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'North', v4: 'Jan-21', v5: '5930', v6: '0.694444', v7: '4118.06', v8: '3500.00', v9: true });
        // tempList.push({ id: 2, v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'North', v4: 'Feb-21', v5: '4000', v6: '0.694444', v7: '2777.78', v8: '3000.00', v9: true });
        // tempList.push({ id: 3, v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'North', v4: 'Mar-21', v5: '3850', v6: '0.694444', v7: '2673.61', v8: '3100.00', v9: true });
        // tempList.push({ id: 4, v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Apr-21', v5: '4200', v6: '0.694444', v7: '2916.67', v8: '', v9: true });
        // tempList.push({ id: 5, v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'May-21', v5: '4530', v6: '0.694444', v7: '3145.83', v8: '', v9: true });
        // tempList.push({ id: 6, v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Jun-21', v5: '4250', v6: '0.694444', v7: '2951.39', v8: '', v9: true });
        // tempList.push({ id: 7, v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Jul-21', v5: '4100', v6: '0.694444', v7: '2847.22', v8: '', v9: true });
        // tempList.push({ id: 8, v2: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 3000 Pieces [4182]', v1: 'Male Condom (Latex) Lubricated, No Logo, 53 mm, 4320 Pieces [6357]', v3: 'National', v4: 'Aug-21', v5: '3900', v6: '0.694444', v7: '2708.33', v8: '', v9: true });

        // this.setState({
        //     selSource: tempList,
        //     loading: true
        // },
        //     () => {
        //         this.buildJexcel();
        //     })
    }

    buildJexcel() {
        var papuList = this.state.selSource;
        var data = [];
        var papuDataArr = [];
        var buildCSVTable = [];

        var count = 0;
        // console.log("match------>-1", this.props.items.stepOneData);
        // console.log("match------>0", papuList.length);

        if (papuList.length != 0) {

            for (var j = 0; j < papuList.length; j++) {

                data = [];
                data[0] = papuList[j].v1
                data[1] = papuList[j].v2
                data[2] = papuList[j].v3
                data[3] = papuList[j].v4
                data[4] = papuList[j].v5
                data[5] = papuList[j].v6
                data[6] = papuList[j].v7
                data[7] = papuList[j].v8
                data[8] = papuList[j].v9
                data[9] = papuList[j].id


                papuDataArr[count] = data;
                count++;

            }
        }

        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapRegion"), '');
        this.el.destroy();

        this.el = jexcel(document.getElementById("mapImport"), '');
        this.el.destroy();

        var json = [];
        var data = papuDataArr;
        console.log("data.length---------->", data.length);

        let planningUnitListJexcel = this.props.items.planningUnitListJexcel
        planningUnitListJexcel.splice(0, 1);

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            columns: [

                // {
                //     title: i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'),
                //     type: 'dropdown',
                //     source: planningUnitListJexcel,//A0
                //     readOnly: true
                // },
                // {
                //     title: i18n.t('static.importFromQATSupplyPlan.forecastPlanningUnit'),
                //     type: 'dropdown',
                //     source: planningUnitListJexcel,//B1
                //     readOnly: true
                // },
                // {
                //     title: i18n.t('static.program.region'),
                //     type: 'text',
                //     textEditor: true,
                //     readOnly: true//C2
                // },
                // {
                //     title: i18n.t('static.inventoryDate.inventoryReport'),
                //     type: 'calendar',
                //     options: {
                //         format: JEXCEL_MONTH_PICKER_FORMAT,
                //         type: 'year-month-picker'
                //     },
                //     readOnly: true//D3
                // },
                // {
                //     title: i18n.t('static.importFromQATSupplyPlan.actualConsumption(SupplyPlanModule)'),
                //     type: 'numeric',
                //     mask: '#,##',
                //     textEditor: true,
                //     readOnly: true//E4
                // },
                // {
                //     title: i18n.t('static.importFromQATSupplyPlan.conversionFactor(SupplyPlantoForecast)'),
                //     type: 'text',
                //     textEditor: true,
                //     readOnly: true//F5
                // },
                // {
                //     title: i18n.t('static.importFromQATSupplyPlan.convertedActualConsumption(SupplyPlanModule)'),
                //     type: 'numeric',
                //     decimal: '.',
                //     mask: '#,##.00',
                //     textEditor: true,
                //     readOnly: true//G6
                // },
                // {
                //     title: i18n.t('static.importFromQATSupplyPlan.currentActualConsumption(ForecastModule)'),
                //     type: 'numeric',
                //     mask: '#,##',
                //     textEditor: true,
                //     readOnly: true//H7
                // },
                // {
                //     title: i18n.t('static.quantimed.importData'),
                //     type: 'checkbox'//I8
                // },
                // {
                //     title: 'duplicate',
                //     type: 'hidden'//J9
                // },
                // {
                //     title: 'regionId',
                //     type: 'hidden'//K10
                // },

                {
                    title: 'Forecast Planning Unit',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Supply Plan Planning Unit',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Supply Plan Region',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Month',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Forecasted Consumption(Forecast Module)',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Conversion Factor (Forecast to Supply Plan)',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Converted Forecasted Consumption(to be imported)',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: 'Current Forecasted Consumption(Supply Plan Module)',
                    type: 'text',
                    textEditor: true,
                    readOnly: true
                },
                {
                    title: i18n.t('static.quantimed.importData'),
                    type: 'checkbox'
                },
                {
                    title: 'Id',
                    type: 'hidden'
                },


            ],
            // updateTable: function (el, cell, x, y, source, value, id) {
            //     console.log("INSIDE UPDATE TABLE");
            //     var elInstance = el.jexcel;
            //     var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
            //     var rowData = elInstance.getRowData(y);
            //     // console.log("elInstance---->", elInstance);
            //     var id = rowData[9];

            //     if (id == 1) {
            //         for (var i = 0; i < colArr.length; i++) {
            //             elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
            //             elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', '#f48282');
            //             let textColor = contrast('#f48282');
            //             elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'color', textColor);
            //         }
            //     } else {
            //         for (var i = 0; i < colArr.length; i++) {
            //             elInstance.setStyle(`${colArr[i]}${parseInt(y) + 1}`, 'background-color', 'transparent');
            //         }
            //     }

            // }.bind(this),
            // editable: false,
            // pagination: localStorage.getItem("sesRecordCount"),
            pagination: 5000000,
            filters: true,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            // allowDeleteRow: true,
            // onchange: this.changed,
            // oneditionend: this.onedit,
            copyCompatibility: true,
            allowManualInsertRow: false,
            parseFormulas: true,
            // onpaste: this.onPaste,
            // oneditionend: this.oneditionend,
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: function (obj, x, y, e) {
                // jExcelLoadedFunctionWithoutPagination(obj);
                jExcelLoadedFunction(obj);
                var asterisk = document.getElementsByClassName("resizable")[0];
                var tr = asterisk.firstChild;
                // tr.children[1].classList.add('AsteriskTheadtrTd');
                // tr.children[2].classList.add('AsteriskTheadtrTd');
            },
            editable: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: false,
        };

        var languageEl = jexcel(document.getElementById("mapImport"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false, buildCSVTable: buildCSVTable
        }, () => {
            this.props.updateStepOneData("loading", false);
            this.changeColor();
        })

    }

    render() {

        var { rangeValue } = this.state
        if (this.props.items.startDate != "") {
            var startDate1 = moment(this.props.items.startDate).format("YYYY-MM-DD");
            var stopDate1 = moment(this.props.items.stopDate).format("YYYY-MM-DD");
            // rangeValue = { from: { year: new Date(startDate1).getFullYear(), month: new Date(startDate1).getMonth() + 1 }, to: { year: new Date(stopDate1).getFullYear(), month: new Date(stopDate1).getMonth() + 1 } }
            rangeValue = startDate1 + " ~ " + stopDate1
        }

        let datasetList = this.props.items.datasetList;
        let datasets = null
        datasets = datasetList.filter(c => c.programId == this.props.items.forecastProgramId)[0]

        let supplyPlanList = this.props.items.programs;
        let supplyPlan = null

        supplyPlan = supplyPlanList.filter(c => c.id == this.props.items.programId)[0]


        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div12">{this.state.message}</h5>

                <div style={{ display: this.props.items.loading ? "none" : "block" }} >
                    <div className="row ">
                        <FormGroup className="col-md-4">
                            <Label htmlFor="appendedInputButton">Supply Plan Program</Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="supplyPlanProgramId"
                                        id="supplyPlanProgramId"
                                        bsSize="sm"
                                        // onChange={(e) => { this.setForecastProgramId(e); }}
                                        value={supplyPlan == null ? "" : supplyPlan.programCode}
                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>

                        <FormGroup className="col-md-4">
                            {/* <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.supplyPlanVersion')}</Label> */}
                            <Label htmlFor="appendedInputButton">Supply Plan version</Label>
                            <div className="controls">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="supplyPlanVersionId"
                                        id="supplyPlanVersionId"
                                        bsSize="sm"
                                        // onChange={(e) => { this.setVersionId(e); }}
                                        // value={this.state.versionId}
                                        value={supplyPlan == null ? "" : supplyPlan.programVersion}

                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>

                        <FormGroup className="col-md-4">
                            {/* <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.forecastProgram')}</Label> */}
                            <Label htmlFor="appendedInputButton">Forecast program</Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="forecastProgramId"
                                        id="forecastProgramId"
                                        bsSize="sm"
                                        value={datasets == null ? "" : datasets.programCode}
                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                        <FormGroup className="col-md-4">
                            {/* <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.forecastProgram')}</Label> */}
                            <Label htmlFor="appendedInputButton">{i18n.t('static.importFromQATSupplyPlan.Range')}<span className="stock-box-icon fa fa-sort-desc"></span></Label>
                            <div className="controls ">
                                <InputGroup>
                                    <Input
                                        type="text"
                                        name="rangeValue"
                                        id="rangeValue"
                                        bsSize="sm"
                                        value={rangeValue}
                                    >
                                    </Input>
                                </InputGroup>
                            </div>
                        </FormGroup>
                    </div>

                </div>
                <div className="pr-lg-0 Card-header-reporticon">
                    {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.globalconsumption')}</strong> */}
                    {this.state.buildCSVTable.length > 0 && <div className="card-header-actions">
                        <a className="card-header-action">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </a>
                    </div>}
                </div>
                <AuthenticationServiceComponent history={this.props.history} />
                {/* <h4 className="red">{this.props.message}</h4> */}
                {/* <ul className="legendcommitversion list-group">
                    <li><span className="legendcolor" style={{ backgroundColor: "yellow" }}></span><h5 className="red">Data already exists in Forecast Program</h5></li>
                </ul> */}
                <div class="col-md-10 mt-2 pl-lg-0 form-group">
                    <ul class="legendcommitversion list-group">
                        <li><span class="legendcolor" style={{ backgroundColor: "yellow", border: "1px solid #000" }}></span>
                            {/* <span class="legendcommitversionText red">{i18n.t('static.importFromQATSupplyPlan.dataAlreadyExistsInForecastProgram')}</span> */}
                            <span class="legendcommitversionText red">Data already exists in Supply Plan Program</span>
                        </li>
                    </ul>
                </div>
                {/* <h5 className="red">{i18n.t('static.importFromQATSupplyPlan.allValuesBelowAreInSupplyPlanningUnits.')}</h5> */}
                {/* <p><span className="legendcolor" style={{ backgroundColor: "yellow" }}></span> <span className="legendcommitversionText">abccsvsvsn vrsvw</span></p> */}
                <div className="table-responsive" style={{ display: this.props.items.loading ? "none" : "block" }} >

                    <div id="mapImport">
                    </div>
                </div>
                <div style={{ display: this.props.items.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
                <FormGroup>
                    {/* <Button color="info" size="md" className="float-right mr-1" type="submit" onClick={() => this.formSubmit()}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button> */}
                    <Button color="success" size="md" className="float-right mr-1" type="button" onClick={this.formSubmit}> <i className="fa fa-check"></i>{i18n.t('static.importFromQATSupplyPlan.Import')}</Button>
                    &nbsp;
                    {/* <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.props.previousToStepOne} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button> */}
                    <Button color="info" size="md" className="float-left mr-1 px-4" type="button" onClick={this.props.previousToStepTwo} > <i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                    &nbsp;
                </FormGroup>
            </>
        );
    }

}