import React, { Component, lazy } from 'react';
import { Bar } from 'react-chartjs-2';
import MultiSelect from "react-multi-select-component";
import {
    Card,
    CardBody,
    Col,
    Table, FormGroup, Input, InputGroup, Label, Form
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling, DATE_FORMAT_CAP_WITHOUT_DATE } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';


const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}


class ForecastSummary extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
            programs: [],
            planningUnits: [],
            versions: [],
            show: false,
            message: '',
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: false,
            programId: '',
            versionId: '',
            planningUnitLabel: '',
            viewById: 1,
            regionList: [],
            regionVal: [],
            regionListFiltered: [],
            versionListAll: [{ versionId: 1, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 1, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }, { versionId: 1, program: { label: "Benin Malaria Forecast Dataset", programId: 3 } }, { versionId: 2, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 2, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }],
            showTotalForecast: true,
            showTotalActual: true,
            showTotalDifference: true,
            monthArrayList: [],
            planningUnitId: "",
            hideCalculation: 2,
            scenarioList: [{ id: 1, name: "A. Consumption High", checked: true, color: "#4f81bd" },
            { id: 2, name: "B. Consumption Med", checked: true, color: "#f79646" },
            { id: 3, name: "C. Consumption Low", checked: true, color: "#000000" },
            { id: 4, name: "D. Morbidity - assumption Y", checked: true, color: "#ff0000" },
            { id: 5, name: "E. Demographic", checked: true, color: "#604a7b" }],
            consumptionData: [
                { forecastingUnit: { id: 1, label: "Abacavir 300 mg Tablet" }, planningUnit: { id: 1, label: "Abacavir 300 mg Tablet, 60 Tablets" }, scenario: { id: 3 }, consumptionQty: 44556, startingStock: 6188, existingShipmentQty: 48120, desiredMonthsOfStock: 5, priceType: 1, price: 0.81 },
                { forecastingUnit: { id: 2, label: "Benzylpenicillin 5 MU Vial" }, planningUnit: { id: 2, label: "Benzylpenicillin 5 MU Vial, 10 Vials" }, scenario: { id: 1 }, consumptionQty: 51721, startingStock: 7183, existingShipmentQty: 50687, desiredMonthsOfStock: 5, priceType: 2, price: 1.04 },
                { forecastingUnit: { id: 3, label: "Lamivudine 150 mg Tablet" }, planningUnit: { id: 3, label: "Lamivudine 150 mg Tablet, 30 Tablets" }, scenario: { id: 3 }, consumptionQty: 36412, startingStock: 6069, existingShipmentQty: 33863, desiredMonthsOfStock: 5, priceType: 2, price: 43 },
                { forecastingUnit: { id: 4, label: "Lamivudine 10 mg/mL Solution" }, planningUnit: { id: 4, label: "Lamivudine 10 mg/mL Solution, 100 mL" }, scenario: { id: 4 }, consumptionQty: 24421, startingStock: 5427, existingShipmentQty: 23933, desiredMonthsOfStock: 5, priceType: 2, price: 3 },
                { forecastingUnit: { id: 5, label: "Paracetamol 500 mg Tablet" }, planningUnit: { id: 5, label: "Paracetamol 500 mg Tablet, 1000 Tablets" }, scenario: { id: 5 }, consumptionQty: 50152, startingStock: 5572, existingShipmentQty: 49650, desiredMonthsOfStock: 5, priceType: 2, price: 542 },
                { forecastingUnit: { id: 6, label: "Malaria Rapid Diagnostic Test (RDT) HRP2 (Pf) Cassette" }, planningUnit: { id: 6, label: "Malaria Rapid Diagnostic Test (RDT) HRP2 (Pf) Cassette, 25 Single Test Kits" }, scenario: { id: 1 }, consumptionQty: 45904, startingStock: 5100, existingShipmentQty: 44527, desiredMonthsOfStock: 5, priceType: 2, price: 3 },

                { forecastingUnit: { id: 6, label: 'Examination Gloves (Latex) Large, Powder-Free, Non-Sterile' }, planningUnit: { id: 6, label: 'Examination Gloves (Latex) Large, Powder-Free, Non-Sterile, 100 Each' }, scenario: { id: 3 }, consumptionQty: '95366', startingStock: '21192.4444444444', existingShipmentQty: '86783.06', desiredMonthsOfStock: 5, priceType: 2, price: '4' },
                { forecastingUnit: { id: 6, label: 'Gauze, Sterile, 12 Ply, 4 x 4 in (10 x 10 cm)' }, planningUnit: { id: 6, label: 'Gauze, Sterile, 12 Ply, 4 x 4 in (10 x 10 cm), 100 Pieces' }, scenario: { id: 3 }, consumptionQty: '62785', startingStock: '10464.1666666667', existingShipmentQty: '60901.45', desiredMonthsOfStock: 5, priceType: 2, price: '4.1' },
                { forecastingUnit: { id: 6, label: 'MC Kit, Sterile, Single Use, Forceps Guided Procedure, 2017' }, planningUnit: { id: 6, label: 'MC Kit, Sterile, Single Use, Forceps Guided Procedure, 2017, 1 Kit' }, scenario: { id: 3 }, consumptionQty: '54177', startingStock: '12039.3333333333', existingShipmentQty: '56344.08', desiredMonthsOfStock: 5, priceType: 2, price: '51' },
                { forecastingUnit: { id: 6, label: 'Male Condom (Latex) Lubricated, No Logo, 49 mm Male Condom' }, planningUnit: { id: 6, label: 'Male Condom (Latex) Lubricated, No Logo, 49 mm, 1 Each' }, scenario: { id: 3 }, consumptionQty: '70748', startingStock: '9826.11111111111', existingShipmentQty: '71455.48', desiredMonthsOfStock: 5, priceType: 2, price: '4.1' },
                { forecastingUnit: { id: 6, label: 'Male Condom (Latex) Lubricated, Ultimate Blue, 53 mm Male Condom' }, planningUnit: { id: 6, label: 'Male Condom (Latex) Lubricated, Ultimate Blue, 53 mm, 4320 Pieces' }, scenario: { id: 3 }, consumptionQty: '77219', startingStock: '15014.8055555556', existingShipmentQty: '74130.24', desiredMonthsOfStock: 5, priceType: 2, price: '5.1' },
                { forecastingUnit: { id: 6, label: 'Long Lasting Insecticide Treated Net (LLIN) 190x160x180 cm (LxWxH) Rectangular (Light Blue)' }, planningUnit: { id: 6, label: 'Long Lasting Insecticide Treated Net (LLIN) 190x160x180 cm (LxWxH) Rectangular (Light Blue), 1 Each' }, scenario: { id: 3 }, consumptionQty: '88216', startingStock: '14702.6666666667', existingShipmentQty: '90862.48', desiredMonthsOfStock: 5, priceType: 2, price: '55' },
                { forecastingUnit: { id: 6, label: 'Long Lasting Insecticide Treated Net (LLIN) 190x160x180 cm (LxWxH) Rectangular (Light Blue)' }, planningUnit: { id: 6, label: 'Long Lasting Insecticide Treated Net (LLIN) 190x160x180 cm (LxWxH) Rectangular (Light Blue), 1 Each' }, scenario: { id: 3 }, consumptionQty: '71032', startingStock: '7892.44444444444', existingShipmentQty: '64639.12', desiredMonthsOfStock: 5, priceType: 2, price: '5.9' }

            ],
            errorValues: ["39%", "66%", "48%", "32%", "30%", "37%", "32%", "28%", "NA", "NA", "NA", "NA", "NA"],
            summeryData: [],

        };
        this.getPrograms = this.getPrograms.bind(this);
        this.filterData = this.filterData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setViewById = this.setViewById.bind(this);
        // this.getProductCategories = this.getProductCategories.bind(this);
        //this.pickRange = React.createRef()
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        // this.setVersionId = this.setVersionId.bind(this);
        this.setForecastingUnit = this.setForecastingUnit.bind(this);
        this.setRegionVal = this.setRegionVal.bind(this);
        this.toggleAccordionTotalActual = this.toggleAccordionTotalActual.bind(this);
        this.toggleAccordionTotalF = this.toggleAccordionTotalForecast.bind(this);
        this.toggleAccordionTotalDiffernce = this.toggleAccordionTotalDiffernce.bind(this);
        this.storeProduct = this.storeProduct.bind(this)
        this.hideCalculation = this.hideCalculation.bind(this);

    }

    hideCalculation(e) {
        console.log("E++++++++", e.target.value);
        this.setState({
            hideCalculation: e.target.value
        })

    }

    storeProduct(e) {
        console.log("E++++++++", e.target)
        var name = this.state.planningUnits.filter(c => c.planningUnitId == e.target.value);
        this.setState({
            planningUnitId: e.target.value,
            planningUnitLabel: name[0].label,
        })
    }

    toggleAccordionTotalActual() {
        this.setState({
            showTotalActual: !this.state.showTotalActual
        })
        var fields = document.getElementsByClassName("totalActual");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalActual == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    toggleAccordionTotalForecast() {
        this.setState({
            showTotalForecast: !this.state.showTotalForecast
        })
        var fields = document.getElementsByClassName("totalForecast");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalForecast == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    toggleAccordionTotalDiffernce() {
        this.setState({
            showTotalDifference: !this.state.showTotalDifference
        })
        var fields = document.getElementsByClassName("totalDifference");
        for (var i = 0; i < fields.length; i++) {
            if (!this.state.showTotalDifference == true) {
                fields[i].style.display = "";
            } else {
                fields[i].style.display = "none";
            }
        }
    }

    setRegionVal(e) {
        console.log("e+++", e);
        var regionIdArr = [];
        for (var i = 0; i < e.length; i++) {
            regionIdArr.push(e[i].value);
        }
        var regionListFiltered = this.state.regionList.filter(c => regionIdArr.includes(c.value));
        this.setState({
            regionVal: e,
            regionListFiltered
        })
    }

    setForecastingUnit(e) {
        this.setState({
            forecastingUnitId: e.target.value
        }, () => {
            this.filterPlanningUnit()
        })
    }

    filterPlanningUnit() {
        var planningUnitListAll = this.state.planningUnitListAll;
        var planningUnits = planningUnitListAll.filter(c => c.program.programId == this.state.programId && c.forecastingUnit.forecastingUnitId == this.state.forecastingUnitId);
        this.setState({
            planningUnits
        })
    }

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    exportCSV() {
    }


    exportPDF = () => {
    }

    filterData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let planningUnitId = document.getElementById("displayId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

        if (versionId != 0 && programId > 0) {
            if (versionId.includes('Local')) {

                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var transaction = db1.transaction(['datasetData'], 'readwrite');
                    var program = transaction.objectStore('datasetData');
                    var getRequest = program.getAll();
                    var datasetList = [];
                    var datasetList1 = [];

                    getRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    getRequest.onsuccess = function (event) {
                        var myResult = [];
                        myResult = getRequest.result;
                        // console.log("DATASET----------->", myResult);
                        // this.setState({
                        //     datasetList: myResult
                        // });


                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                        for (var i = 0; i < filteredGetRequestList.length; i++) {

                            var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                            var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                            var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson1 = JSON.parse(programData);
                            console.log("programJson1-------->1", programJson1);
                            // let dupForecastingUnitObj = programJson1.consumptionList.map(ele => ele.consumptionUnit.forecastingUnit);
                            // const ids = dupForecastingUnitObj.map(o => o.id)
                            // const filtered = dupForecastingUnitObj.filter(({ id }, index) => !ids.includes(id, index + 1))
                            // console.log("programJson1-------->2", filtered);

                            // let dupPlanningUnitObjwithNull = programJson1.consumptionList.map(ele => ele.consumptionUnit.planningUnit);
                            // let dupPlanningUnitObj = dupPlanningUnitObjwithNull.filter(c => c != null);
                            // const idsPU = dupPlanningUnitObj.map(o => o.id)
                            // const filteredPU = dupPlanningUnitObj.filter(({ id }, index) => !idsPU.includes(id, index + 1))

                            datasetList.push({
                                programCode: filteredGetRequestList[i].programCode,
                                programVersion: filteredGetRequestList[i].version,
                                programId: filteredGetRequestList[i].programId,
                                versionId: filteredGetRequestList[i].version,
                                id: filteredGetRequestList[i].id,
                                loading: false,
                                forecastStartDate: (programJson1.currentVersion.forecastStartDate ? moment(programJson1.currentVersion.forecastStartDate).format(`MMM-YYYY`) : ''),
                                forecastStopDate: (programJson1.currentVersion.forecastStopDate ? moment(programJson1.currentVersion.forecastStopDate).format(`MMM-YYYY`) : ''),
                                healthAreaList: programJson1.healthAreaList,
                                actualConsumptionList: programJson1.actualConsumptionList,
                                consumptionExtrapolation: programJson1.consumptionExtrapolation,
                                treeList: programJson1.treeList,
                                planningUnitList: programJson1.planningUnitList,
                                // filteredForecastingUnit: filtered,
                                // filteredPlanningUnit: filteredPU,
                                regionList: programJson1.regionList,
                                label: programJson1.label,
                                realmCountry: programJson1.realmCountry,
                            });
                            datasetList1.push(filteredGetRequestList[i])
                            // }
                        }
                        console.log("DATASET-------->", datasetList);
                        this.setState({
                            datasetList: datasetList,
                            datasetList1: datasetList1
                        }, () => {
                            let filteredProgram = this.state.datasetList.filter(c => c.programId == programId && c.versionId == (versionId.split('(')[0]).trim())[0];
                            console.log("Test------------>1", filteredProgram);

                            let planningUnitList = filteredProgram.planningUnitList;
                            let summeryData = [];
                            let tempData = [];

                            let duplicateTracerCategoryId = planningUnitList.map(c => c.planningUnit.forecastingUnit.tracerCategory.id)
                            let filteredTracercategoryId = [...new Set(duplicateTracerCategoryId)];
                            console.log("Test------------>2", filteredTracercategoryId);

                            for (var j = 0; j < planningUnitList.length; j++) {
                                let tracerCategory = planningUnitList[j].planningUnit.forecastingUnit.tracerCategory;
                                let forecastingUnit = planningUnitList[j].planningUnit.forecastingUnit;
                                let planningUnit = planningUnitList[j].planningUnit;
                                let totalForecastedQuantity = 0;
                                let stock1 = planningUnitList[j].stock;
                                let existingShipments = planningUnitList[j].existingShipments;
                                let stock2 = 0;
                                let desiredMonthOfStock1 = planningUnitList[j].monthsOfStock;
                                let desiredMonthOfStock2 = 0;
                                let procurementGap = 0;
                                let priceType = (planningUnitList[j].procurementAgent != null ? planningUnitList[j].procurementAgent.label.label_en : '');
                                let unitPrice = planningUnitList[j].price;
                                let procurementNeeded = 0;
                                let notes = '';

                                let obj = { id: 1, tracerCategory: tracerCategory, forecastingUnit: forecastingUnit, planningUnit: planningUnit, totalForecastedQuantity: totalForecastedQuantity, stock1: stock1, existingShipments: existingShipments, stock2: stock2, desiredMonthOfStock1: desiredMonthOfStock1, desiredMonthOfStock2: desiredMonthOfStock2, procurementGap: procurementGap, priceType: priceType, unitPrice: unitPrice, procurementNeeded: procurementNeeded, notes: notes }
                                tempData.push(obj);

                            }

                            //sort based on tracerCategory
                            for (var i = 0; i < filteredTracercategoryId.length; i++) {
                                let filteredTracerCategoryList = tempData.filter(c => c.tracerCategory.id == filteredTracercategoryId[i]);
                                let obj = { id: 0, tracerCategory: filteredTracerCategoryList[0].tracerCategory, forecastingUnit: '', planningUnit: '', totalForecastedQuantity: '', stock1: '', existingShipments: '', stock2: '', desiredMonthOfStock1: '', desiredMonthOfStock2: '', procurementGap: '', priceType: '', unitPrice: '', procurementNeeded: '', notes: '' }
                                summeryData.push(obj);
                                summeryData = summeryData.concat(filteredTracerCategoryList);

                            }
                            console.log("Test------------>3", summeryData);
                            this.setState({
                                summeryData: summeryData
                            });





                        })


                    }.bind(this);
                }.bind(this);



            } else {//api call



            }
        } else {//validation message

        }
    }


    getPrograms() {
        // this.setState({ programs: [{ label: "Benin PRH,Condoms Forecast Dataset", programId: 1 }, { label: "Benin ARV Forecast Dataset", programId: 2 }, { label: "Benin Malaria Forecast Dataset", programId: 3 }], loading: false });
        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getDataSetListAll()
                .then(response => {
                    this.setState({
                        programs: response.data
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { this.consolidatedProgramList() })
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
            console.log('offline')
            this.consolidatedProgramList()
            this.setState({ loading: false })
        }
    }

    consolidatedProgramList = () => {
        const lan = 'en';
        const { programs } = this.state
        var proList = programs;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();

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
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        console.log(programNameLabel)

                        var f = 0
                        for (var k = 0; k < this.state.programs.length; k++) {
                            if (this.state.programs[k].programId == programData.programId) {
                                f = 1;
                                console.log('already exist')
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                    }

                }
                var lang = this.state.lang;

                this.setState({
                    programs: proList.sort(function (a, b) {
                        a = getLabelText(a.label, lang).toLowerCase();
                        b = getLabelText(b.label, lang).toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })
                }, () => {
                    console.log("programs------------------>", this.state.programs);
                })


            }.bind(this);

        }.bind(this);


    }

    componentDidMount() {
        this.getPrograms();
        this.setState({
            regionVal: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
            regionList: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
            regionListFiltered: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
        })
    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: ''
        }, () => {
            // localStorage.setItem("sesVersionIdReport", '');
            this.getVersionIds();
        })
    }

    setVersionId(event) {

        var versionId = event.target.value;
        var programId = this.state.programId;

        this.setState({
            versionId: event.target.value,
        }, () => {
            // localStorage.setItem("sesVersionIdReport", '');
            this.filterData();
        })


    }

    buildJexcel() {
        var dataArr = [];
        var data = [];
        var consumptionData = this.state.consumptionData;
        console.log("ConsumptionData+++", consumptionData[0].forecastingUnit);
        for (var j = 0; j < consumptionData.length; j++) {
            console.log("ConsumptionData+++", consumptionData[j].forecastingUnit);
            data = [];
            data[0] = consumptionData[j].forecastingUnit.label; //A
            data[1] = consumptionData[j].planningUnit.label; //B
            data[2] = consumptionData[j].scenario.id; //C
            data[3] = consumptionData[j].consumptionQty;//D
            data[4] = consumptionData[j].startingStock;//E
            data[5] = consumptionData[j].existingShipmentQty;//F
            data[6] = `=E${parseInt(j) + 1}+F${parseInt(j) + 1}-D${parseInt(j) + 1}`;//G
            data[7] = consumptionData[j].desiredMonthsOfStock;//H
            data[8] = `=ROUND(H${parseInt(j) + 1}*D${parseInt(j) + 1}/36,0)`;//I
            data[9] = `=ROUND(G${parseInt(j) + 1}-I${parseInt(j) + 1},0)`; //J
            data[10] = consumptionData[j].priceType;//K
            data[11] = consumptionData[j].price;//L
            data[12] = `=IF(IFERROR(-J${parseInt(j) + 1}*L${parseInt(j) + 1},"")>0,IFERROR(-J${parseInt(j) + 1}*L${parseInt(j) + 1},""),"")`;
            dataArr[j] = data;
        }
        var options = {
            data: dataArr,
            columnDrag: true,
            columns: [
                { title: i18n.t('static.product.unit1'), type: 'text', width: 200, readOnly: true },
                { title: i18n.t('static.product.product'), type: 'text', width: 200, readOnly: true },
                { type: 'dropdown', title: "Scenario", source: this.state.scenarioList, width: 200 },
                { title: "Forecast (PU)", type: 'numeric', width: 100, type: 'numeric', mask: '#,##', decimal: '.', readOnly: true },
                { title: "Starting Stock (PU) - end of Dec 2020", type: 'numeric', mask: '#,##', readOnly: true, width: 100 },
                { title: 'Existing Shipments in period (PU)', type: 'numeric', mask: '#,##', decimal: '.', readOnly: true, width: 100, },
                { title: "Ending Stock - end of Dec 2023", type: 'numeric', mask: '#,##', decimal: '.', width: 100, readOnly: true },
                { title: "Desired End of Period Stock (in months)", type: 'numeric', mask: '#,##', decimal: '.', width: 100, readOnly: true },
                { title: "Desired End of Period Stock (in PU)", type: 'numeric', mask: '#,##', decimal: '.', readOnly: true, width: 100 },
                { title: "Shipment gap", type: 'numeric', mask: '#,##', decimal: '.', readOnly: true, width: 100 },
                { title: "Price type", type: 'dropdown', width: 100, source: [{ id: 1, name: "Dataset" }, { id: 2, name: "GHSC-PSM*" }, { id: 3, name: "Global Fund*" }] },
                { title: "PU (unit $)", type: 'numeric', mask: '#,##.00', decimal: '.', readOnly: true, width: 100 },
                { title: "Procurements Needed PU (total $)", type: 'numeric', mask: '#,##.00', decimal: '.', readOnly: true, width: 100 }


            ],
            text: {
                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
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
        }
        var myVar = jexcel(document.getElementById("consumptionTable"), options);
        this.el = myVar;
        this.setState({
            consumptionEl: myVar,
            loading: false
        })
    }

    loaded(instance) {
        jExcelLoadedFunction(instance);
    }

    getVersionIds() {
        // var versionListAll = this.state.versionListAll;
        // var reportPeriod = [{ programId: 1, startDate: '2020-09-01', endDate: '2021-08-30' }, { programId: 2, startDate: '2020-07-01', endDate: '2021-06-30' }, { programId: 3, startDate: '2020-11-01', endDate: '2021-10-30' }];
        // var startDate = reportPeriod.filter(c => c.programId == this.state.programId)[0].startDate;
        // var endDate = reportPeriod.filter(c => c.programId == this.state.programId)[0].endDate;
        // var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } }
        // this.setState({ versions: versionListAll.filter(c => c.program.programId == this.state.programId), loading: false, rangeValue });

        let programId = this.state.programId;
        if (programId != 0) {

            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        versions: [],
                    }, () => {
                        this.setState({
                            versions: program[0].versionList.filter(function (x, i, a) {
                                return a.indexOf(x) === i;
                            })
                        }, () => { this.consolidatedVersionList(programId) });
                    });


                } else {
                    this.setState({
                        versions: [],

                    }, () => {
                        this.consolidatedVersionList(programId)
                    })
                }
            } else {

                this.setState({
                    versions: [],

                }, () => { })

            }
        } else {
            this.setState({
                versions: [],

            }, () => { })
        }
    }

    consolidatedVersionList = (programId) => {
        const lan = 'en';
        const { versions } = this.state
        var verList = versions;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].programId == programId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion

                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)

                    }


                }

                console.log(verList)
                let versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                })
                versionList.reverse();
                this.setState({
                    versions: versionList,
                    // versionId: versionList[0].versionId
                }, () => {
                    // this.getPlanningUnit();
                })


            }.bind(this);



        }.bind(this)


    }

    show() {
        this.getVersionIds()
    }
    handleRangeChange(value, text, listIndex) {

    }
    handleRangeDissmis(value) {
        let startDate = value.from.year + '-' + value.from.month + '-01';
        let stopDate = value.to.year + '-' + value.to.month + '-' + new Date(value.to.year, value.to.month, 0).getDate();
        var monthArrayList = [];
        let cursorDate = value.from.year + '-' + value.from.month + '-01';
        for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"); i++) {
            var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
            cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
            monthArrayList.push(dt);
        }
        this.setState({ rangeValue: value, monthArrayList: monthArrayList }, () => {
            // this.filterData();
        })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>

    dateFormatterLanguage = value => {
        if (moment(value).format('MM') === '01') {
            return (i18n.t('static.month.jan') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '02') {
            return (i18n.t('static.month.feb') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '03') {
            return (i18n.t('static.month.mar') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '04') {
            return (i18n.t('static.month.apr') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '05') {
            return (i18n.t('static.month.may') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '06') {
            return (i18n.t('static.month.jun') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '07') {
            return (i18n.t('static.month.jul') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '08') {
            return (i18n.t('static.month.aug') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '09') {
            return (i18n.t('static.month.sep') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '10') {
            return (i18n.t('static.month.oct') + ' ' + moment(value).format('YY'))
        } else if (moment(value).format('MM') === '11') {
            return (i18n.t('static.month.nov') + ' ' + moment(value).format('YY'))
        } else {
            return (i18n.t('static.month.dec') + ' ' + moment(value).format('YY'))
        }
    }

    setViewById(e) {
        console.log("e.targetvakue+++", e.target.value)
        var viewById = e.target.value;
        this.setState({
            viewById: viewById,
            planningUnitId: ""
        }, () => {
            if (viewById == 2) {
                document.getElementById("planningUnitDiv").style.display = "none";
            } else {
                document.getElementById("planningUnitDiv").style.display = "block";
            }
        })
    }

    render() {
        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {/* {item.versionId} */}
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)}
                    </option>
                )
            }, this);

        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const checkOnline = localStorage.getItem('sessionType');

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon pb-2">
                        {checkOnline === 'Online' &&
                            this.state.consumptionData.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />


                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                        {checkOnline === 'Offline' &&
                            this.state.offlineConsumptionList.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />

                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0 ">
                        <div>
                            <div ref={ref}>
                                <Form >
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            // onChange={this.filterVersion}
                                                            onChange={(e) => { this.setProgramId(e); }}
                                                            value={this.state.programId}

                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {programList}
                                                            {/* <option value="4">FASPonia MOH 1</option> */}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
                                                            // onChange={this.filterVersion}
                                                            onChange={(e) => { this.setVersionId(e); }}
                                                            value={this.state.versionId}

                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {versionList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Forecast Period<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">

                                                    <Picker
                                                        ref="pickRange"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
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
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Display</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="displayId"
                                                            id="displayId"
                                                            bsSize="sm"
                                                            onChange={this.filterData}
                                                        // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="1">National View</option>
                                                            <option value="2">Regional View</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Hide Calculations</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="calculationId"
                                                            id="calculationId"
                                                            bsSize="sm"
                                                            value={this.state.hideCalculation}
                                                            onChange={(e) => { this.hideCalculation(e); }}
                                                        >
                                                            <option value="1">Yes</option>
                                                            <option value="2">No</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>



                                        </div>
                                    </div>
                                </Form>

                                <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div className="row">
                                        <div className="col-md-12 pl-0 pr-0">
                                            {/* <div className="shipmentconsumptionSearchMarginTop" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <div className="table-responsive" id="consumptionTableDiv">
                                                    <div id="consumptionTable" />
                                                </div>
                                            </div> */}
                                            <div className="table-responsive">
                                                {this.state.summeryData.length > 0 &&
                                                    <Table className="table-striped table-bordered text-center mt-2">
                                                        {/* <Table className="table-bordered text-center mt-2 overflowhide main-table "> */}

                                                        <thead>
                                                            <tr>
                                                                <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                                                <th className="text-center" style={{}}> Forecasting Unit </th>
                                                                <th className="text-center" style={{}}>Planning Unit</th>
                                                                <th className="text-center" style={{}}>Total Forecasted Quantity</th>
                                                                <th className="text-center" style={{}}>Stock (end of Dec 2020)</th>
                                                                <th className="text-center" style={{}}>Existing Shipments (Jan 2021 - Dec 2023)</th>
                                                                <th className="text-center" style={{}}>Stock (end of Dec 2023)</th>
                                                                <th className="text-center" style={{}}>Desired Months of Stock (end of Dec 2023)</th>
                                                                <th className="text-center" style={{}}>Desired Stock (end of Dec 2023)</th>
                                                                <th className="text-center" style={{}}>Procurement Surplus/Gap</th>
                                                                <th className="text-center" style={{}}>Price Type</th>
                                                                <th className="text-center" style={{}}>Unit Price ($)</th>
                                                                <th className="text-center" style={{}}>Procurements Needed ($)</th>
                                                                <th className="text-center" style={{ width: '20%' }}>Notes</th>

                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {this.state.summeryData.map(item1 => (
                                                                <tr>
                                                                    {item1.id == 0 ?
                                                                        <>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1">
                                                                                <i className="fa fa-minus-square-o supplyPlanIcon" ></i> {item1.tracerCategory.label.label_en}
                                                                            </td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                            <td></td>
                                                                        </>
                                                                        :
                                                                        <>
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td>{item1.forecastingUnit.label.label_en}</td>
                                                                            <td>{item1.planningUnit.label.label_en}</td>
                                                                            <td>{item1.totalForecastedQuantity}</td>
                                                                            <td>{item1.stock1}</td>
                                                                            <td>{item1.existingShipments}</td>
                                                                            <td>{item1.stock2}</td>
                                                                            <td>{item1.desiredMonthOfStock1}</td>
                                                                            <td>{item1.desiredMonthOfStock2}</td>
                                                                            <td>{item1.procurementGap}</td>
                                                                            <td>{item1.priceType}</td>
                                                                            <td>{item1.unitPrice}</td>
                                                                            <td>{item1.procurementNeeded}</td>
                                                                            <td>{item1.notes}</td>
                                                                        </>
                                                                    }



                                                                </tr>
                                                            ))}

                                                            {/* <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1">
                                                                <i className="fa fa-minus-square-o supplyPlanIcon" ></i> ARVs
                                                            </td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>

                                                        </tr>
                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td>Abacavir 300 mg Tablet</td>
                                                            <td>Abacavir 300 mg Tablet, 60 Tablets</td>
                                                            <td>191,593</td>
                                                            <td>42,576</td>
                                                            <td>206,920</td>
                                                            <td>57,904</td>
                                                            <td>5</td>
                                                            <td>26,610</td>
                                                            <td>31,294 </td>
                                                            <td>Custom</td>
                                                            <td>$1.04</td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td>Benzylpenicillin 5 MU Vial</td>
                                                            <td>Benzylpenicillin 5 MU Vial, 10 Vials</td>
                                                            <td>259,051</td>
                                                            <td>50,371</td>
                                                            <td>248,689</td>
                                                            <td>40,009</td>
                                                            <td>5</td>
                                                            <td>35,979</td>
                                                            <td>4,030  </td>
                                                            <td>no price type available</td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td>Lamivudine 150 mg Tablet</td>
                                                            <td>Lamivudine 150 mg Tablet, 30 Tablets</td>
                                                            <td>202,179</td>
                                                            <td>27,638</td>
                                                            <td>204,963</td>
                                                            <td>30,422</td>
                                                            <td>5</td>
                                                            <td>28,080</td>
                                                            <td>2,341  </td>
                                                            <td>GHSC-PSM*</td>
                                                            <td>$3.00</td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>

                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1">
                                                                <i className="fa fa-minus-square-o supplyPlanIcon" ></i> Condoms
                                                            </td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>

                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td>Male Condom (Latex) Lubricated, No Logo, 49 mm Male Condom</td>
                                                            <td>Male Condom (Latex) Lubricated, No Logo, 49 mm, 1 Each</td>
                                                            <td>229,205</td>
                                                            <td>38,698</td>
                                                            <td>215,933</td>
                                                            <td>25,426</td>
                                                            <td>5</td>
                                                            <td>31,834</td>
                                                            <td>(6,408)</td>
                                                            <td>GHSC-PSM*</td>
                                                            <td>$3.00</td>
                                                            <td>$19,225.14</td>
                                                            <td></td>
                                                        </tr>

                                                        <tr>
                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                            <td>Male Condom (Latex) Lubricated, Ultimate Blue, 53 mm Male Condom</td>
                                                            <td>Male Condom (Latex) Lubricated, Ultimate Blue, 53 mm, 4320 Pieces</td>
                                                            <td>223,136</td>
                                                            <td>43,388</td>
                                                            <td>236,524</td>
                                                            <td>56,776</td>
                                                            <td>5</td>
                                                            <td>30,991</td>
                                                            <td>25,785 </td>
                                                            <td>Global Fund*</td>
                                                            <td>$4.00</td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr> */}
                                                        </tbody>
                                                    </Table>
                                                }
                                            </div>
                                        </div>
                                    </div>

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

                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div >
        );
    }
}

export default ForecastSummary;