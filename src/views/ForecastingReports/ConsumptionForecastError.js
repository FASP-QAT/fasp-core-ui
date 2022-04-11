import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import { MultiSelect } from "react-multi-select-component";
import {
    Card,
    CardBody,
    Col,
    Table, FormGroup, Input, InputGroup, Label, Form
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling, DATE_FORMAT_CAP_WITHOUT_DATE, DATE_FORMAT_CAP, TITLE_FONT } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import NumberFormat from 'react-number-format';
import i18n from '../../i18n'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import moment from "moment";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import EquivalancyUnitService from "../../api/EquivalancyUnitService";
import { index } from 'mathjs';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}


class ConsumptionForecastError extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
            programs: [],
            planningUnits: [],
            forecastingUnits: [],
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
            equivalencyUnitLabel: '',
            planningUnitLabel: '',
            forecastingUnitLabel: '',
            regions: [],
            regionValues: [],
            regionLabels: [],
            // versionListAll: [{ versionId: 1, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 1, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }, { versionId: 1, program: { label: "Benin Malaria Forecast Dataset", programId: 3 } }, { versionId: 2, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 2, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }],
            // forecastingUnits: [{ forecastingUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom" }, { forecastingUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom" }, { forecastingUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom" }],
            // planningUnitListAll: [{ planningUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom, 1 Each", forecastingUnit: { forecastingUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom" }, program: { programId: 1 } }, { planningUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom, 1 Each", forecastingUnit: { forecastingUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom, 1 Each", forecastingUnit: { forecastingUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 4, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom" }, program: { programId: 1 } }, { planningUnitId: 5, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 6, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom" }, program: { programId: 1 } }],
            // planningUnits: [{ planningUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom, 1 Each", forecastingUnit: { forecastingUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom" }, program: { programId: 1 } }, { planningUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom, 1 Each", forecastingUnit: { forecastingUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom, 1 Each", forecastingUnit: { forecastingUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 4, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 1, label: "Female Condom (Nitrile) Lubricated, 17 cm Female Condom" }, program: { programId: 1 } }, { planningUnitId: 5, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 2, label: "Male Condom (Latex) Lubricated, No Logo, 53 mm Male Condom" }, program: { programId: 1 } }, { planningUnitId: 6, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom, 1000 Each", forecastingUnit: { forecastingUnitId: 3, label: "Male Condom (Latex) Lubricated, Prudence Plus, 53 mm Male Condom" }, program: { programId: 1 } }],
            forecastingUnitId: "",
            showTotalForecast: true,
            showTotalActual: true,
            showTotalDifference: true,
            monthArrayList: [],
            planningUnitId: "",
            consumptionAdjusted: 2,
            yaxisEquUnitId: 2,
            consumptionData: [],
            equivalencyUnitList: [],
            programEquivalencyUnitList: [],
            yaxisEquUnit: -1,
            filteredProgramEQList: [],

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
        this.storeProduct = this.storeProduct.bind(this);
        this.getEquivalencyUnitData = this.getEquivalencyUnitData.bind(this);
        this.calculateDaysInMonth = this.calculateDaysInMonth.bind(this);

    }

    getEquivalencyUnitData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],

            forecastingUnits: [],
            forecastingUnitValues: [],
            forecastingUnitLabels: [],
        }, () => {
            if (programId > 0 && versionId != 0) {
                if (versionId.includes('Local')) {

                    const lan = 'en';
                    var db1;
                    var storeOS;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var planningunitTransaction = db1.transaction(['equivalencyUnit'], 'readwrite');
                        var planningunitOs = planningunitTransaction.objectStore('equivalencyUnit');
                        var planningunitRequest = planningunitOs.getAll();
                        var planningList = []
                        planningunitRequest.onerror = function (event) {
                            // Handle errors!
                        };
                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest.result;
                            // var programId = (document.getElementById("programId").value).split("_")[0];
                            var filteredEquList = []
                            console.log("EquivalencyUnitList---------->", myResult);
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program != null) {
                                    if (myResult[i].program.id == programId && myResult[i].active == true) {
                                        filteredEquList.push(myResult[i]);
                                    }
                                } else {
                                    filteredEquList.push(myResult[i]);
                                }
                            }
                            console.log("EquivalencyUnitList---------->1", filteredEquList);

                            let duplicateEquiUnit = filteredEquList.map(c => c.equivalencyUnit);
                            const ids = duplicateEquiUnit.map(o => o.equivalencyUnitId)
                            const filteredEQUnit = duplicateEquiUnit.filter(({ equivalencyUnitId }, index) => !ids.includes(equivalencyUnitId, index + 1))

                            console.log("EquivalencyUnitList---------->2", filteredEQUnit);

                            var lang = this.state.lang;
                            this.setState({
                                equivalencyUnitList: filteredEQUnit.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                programEquivalencyUnitList: filteredEquList,
                            }, () => {
                                this.filterData();
                            })
                        }.bind(this);
                    }.bind(this)

                } else {//api call


                    EquivalancyUnitService.getEquivalancyUnitMappingList().then(response => {
                        if (response.status == 200) {
                            console.log("EQ1------->", response.data);
                            var listArray = response.data;
                            listArray.sort((a, b) => {
                                var itemLabelA = getLabelText(a.equivalencyUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                var itemLabelB = getLabelText(b.equivalencyUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                return itemLabelA > itemLabelB ? 1 : -1;
                            });

                            var filteredEquList = []
                            for (var i = 0; i < listArray.length; i++) {
                                if (listArray[i].program != null) {
                                    if (listArray[i].program.id == programId && listArray[i].active == true) {
                                        filteredEquList.push(listArray[i]);
                                    }
                                } else {
                                    filteredEquList.push(listArray[i]);
                                }
                            }
                            console.log("EquivalencyUnitList---------->1", filteredEquList);
                            let duplicateEquiUnit = filteredEquList.map(c => c.equivalencyUnit);
                            const ids = duplicateEquiUnit.map(o => o.equivalencyUnitId)
                            const filteredEQUnit = duplicateEquiUnit.filter(({ equivalencyUnitId }, index) => !ids.includes(equivalencyUnitId, index + 1))


                            console.log("EquivalencyUnitList---------->2", filteredEQUnit);

                            var lang = this.state.lang;


                            this.setState({
                                equivalencyUnitList: filteredEQUnit.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                programEquivalencyUnitList: filteredEquList,
                            }, () => {
                                this.filterData();
                            })


                        } else {
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
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: "#BA0C2F",
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
                                                loading: false,
                                                color: "#BA0C2F",
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: error.response.data.messageCode,
                                                loading: false,
                                                color: "#BA0C2F",
                                            });
                                            break;
                                        default:
                                            this.setState({
                                                message: 'static.unkownError',
                                                loading: false,
                                                color: "#BA0C2F",
                                            });
                                            break;
                                    }
                                }
                            }
                        );



                }
            }




        })
    }

    storeProduct(e) {
        console.log("E++++++++", e.target)
        var name = this.state.planningUnits.filter(c => c.planningUnitId == e.target.value);
        var planningUnitId = e.target.value;
        this.setState({
            planningUnitId: e.target.value,
            planningUnitLabel: name[0].label,
        }, () => {
            if (planningUnitId > 0) {
                this.showData();
            }
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

    setRegionVal(event) {

        console.log('***', event)
        var regionIds = event
        regionIds = regionIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        });

        this.setState({
            regionValues: regionIds.map(ele => ele),
            regionLabels: regionIds.map(ele => ele.label),
            regionListFiltered: event,
        }, () => {

            this.filterData()
        })
    }

    showData() {
        var consumptionData = this.state.consumptionDataAll;
        this.setState({
            consumptionData: consumptionData
        })
    }

    setForecastingUnit(e) {
        // var forecastingUnitId = e.target.value;
        var forecastingUnitId = document.getElementById("forecastingUnitId");
        var selectedText = forecastingUnitId.options[forecastingUnitId.selectedIndex].text;
        this.setState({
            forecastingUnitId: e.target.value,
            forecastingUnitLabel: selectedText
        }, () => {
            // this.filterPlanningUnit()
            // if (this.state.viewById == 2 && forecastingUnitId) {
            //     this.showData();
            // }
            this.filterData();
        })
    }

    setPlanningUnit(e) {
        var planningUnitId = document.getElementById("planningUnitId");
        var selectedText = planningUnitId.options[planningUnitId.selectedIndex].text;
        this.setState({
            planningUnitId: e.target.value,
            planningUnitLabel: selectedText
        }, () => {
            this.filterData();
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

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' : ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' : ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + ('Time Window' + ' : ' + document.getElementById("timeWindowId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.forecastReport.yAxisInEquivalencyUnit') + ' : ' + document.getElementById("yaxisEquUnit").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + ('Report View' + ' : ' + document.getElementById("viewById").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        if (document.getElementById("viewById").value == 1) {
            csvRow.push('"' + ('Planning Unit' + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
            csvRow.push('')
        } else {
            csvRow.push('"' + ('Forecasting unit' + ' : ' + document.getElementById("forecastingUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
            csvRow.push('')
        }
        this.state.regionLabels.map(ele =>
            csvRow.push('"' + ('Region' + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))

        csvRow.push('')
        csvRow.push('"' + ('Show consumption adjusted for stock out' + ' : ' + document.getElementById("consumptionAdjusted").selectedOptions[0].text).replaceAll(' ', '%20') + '"')

        csvRow.push('')
        csvRow.push('')

        const headers = [];
        let t1 = [];
        headers.push('');
        headers.push('Average')

        this.state.monthArrayList.map(item => (
            headers.push(moment(item).format(DATE_FORMAT_CAP_WITHOUT_DATE))
        ))

        var A = [this.addDoubleQuoteToRowContent(headers)]

        let B = this.addDoubleQuoteToRowContent([(('Error').replaceAll(',', ' ')).replaceAll(' ', '%20')])
        B = B.concat(this.calculateAverage(this.state.errorValues) + ' %')
        this.state.errorValues.map((item, index) => {
            return (index == 0 ? '' : B = B.concat(item))
        })


        A.push(B)
        // ----------
        B = [i18n.t('static.consumption.forcast')];

        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            t1.push(sum)
        })
        B = B.concat(this.calculateAverage(t1));

        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            B = B.concat(sum);
        })

        A.push(B)
        // ----------

        this.state.regionListFiltered.map(item1 => {
            B = [item1.label];
            t1 = [];

            this.state.monthArrayList.map((item, index) => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                t1.push(cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA")
            })
            B = B.concat(this.calculateAverage(t1));

            this.state.monthArrayList.map(item => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                B = B.concat(cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA")
            })
            A.push(B);
        })
        // ----------

        B = [i18n.t('static.consumption.actual')];
        t1 = [];

        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            t1.push(cd.length > 0 ? sum : "NA")
        })
        B = B.concat(this.calculateAverage(t1));

        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            B = B.concat(cd.length > 0 ? sum : "NA");
        })

        A.push(B);
        // ----------

        this.state.regionListFiltered.map(item1 => {
            t1 = [];
            B = [item1.label];
            this.state.monthArrayList.map(item => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                t1.push(cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA")
            })

            B = B.concat(this.calculateAverage(t1));

            this.state.monthArrayList.map(item => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                B = B.concat(cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA")
            })
            A.push(B);
        })
        // ----------

        B = ['Difference'];
        t1 = [];
        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum1 = 0;
            cd1.map(c => { sum1 += parseInt(c.consumptionQty) });
            t1.push(sum1 > 0 ? sum1 - sum : "NA")
        })

        B = B.concat(this.calculateAverage(t1));

        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum1 = 0;
            cd1.map(c => { sum1 += parseInt(c.consumptionQty) });
            B = B.concat(sum1 > 0 ? sum1 - sum : "NA")
        })
        A.push(B);
        // ----------

        this.state.regionListFiltered.map(item1 => {
            B = [item1.label];
            t1 = [];

            this.state.monthArrayList.map(item => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                t1.push((cd.length > 0 && cd1.length > 0) ? parseInt(cd[0].consumptionQty) - parseInt(cd1[0].consumptionQty) : "NA")
            })

            B = B.concat(this.calculateAverage(t1));

            this.state.monthArrayList.map(item => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                B = B.concat((cd.length > 0 && cd1.length > 0) ? parseInt(cd[0].consumptionQty) - parseInt(cd1[0].consumptionQty) : "NA")
            })
            A.push(B);
        })


        for (var i = 0; i < A.length; i++) {
            // console.log(A[i])
            csvRow.push(A[i].join(","))
        }

        var csvString = csvRow.join("%0A")
        // console.log('csvString' + csvString)
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + 'Consumption Forecast Error' + ".csv"
        document.body.appendChild(a)
        a.click();

    }

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }


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
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.supplyPlan.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`), doc.internal.pageSize.width - 40, 20, {
                    align: 'right'
                })
                doc.text(i18n.t('static.supplyPlan.runTime') + " " + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width - 40, 30, {
                    align: 'right'
                })
                doc.text(i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width - 40, 40, {
                    align: 'right'
                })
                doc.text(this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text), doc.internal.pageSize.width - 40, 50, {
                    align: 'right'
                })
                doc.text(document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width - 40, 60, {
                    align: 'right'
                })
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.monthlyForecast'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    doc.text('Time Window' + ' : ' + document.getElementById("timeWindowId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 170, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.forecastReport.yAxisInEquivalencyUnit') + ' : ' + document.getElementById("yaxisEquUnit").selectedOptions[0].text, doc.internal.pageSize.width / 8, 190, {
                        align: 'left'
                    })
                    doc.text('Reporting View' + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 210, {
                        align: 'left'
                    })
                    if (document.getElementById("viewById").value == 1) {
                        doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 230, {
                            align: 'left'
                        })
                    } else {
                        doc.text(i18n.t('static.product.unit1') + ' : ' + document.getElementById("forecastingUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 230, {
                            align: 'left'
                        })
                    }
                    // let startY1 = 0;

                    var regionText = doc.splitTextToSize(('Region' + ' : ' + this.state.regionLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 250, regionText)
                    // startY1 = 230 + (doc.splitTextToSize(('Region' + ' : ' + this.state.regionLabels.join('; ')), doc.internal.pageSize.width * 3 / 4).length * 10)

                    doc.text('Show consumption adjusted for stock out' + ' : ' + document.getElementById("consumptionAdjusted").selectedOptions[0].text, doc.internal.pageSize.width / 8, 270, {
                        align: 'left'
                    })

                }

            }
        }

        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(8);
        var canvas = document.getElementById("cool-canvas");

        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 100;
        var aspectwidth1 = (width - h1);

        doc.addImage(canvasImg, 'png', 50, 280, 750, 260, 'CANVAS');

        //table start
        const headers = [];

        headers.push('');
        headers.push('Average')

        this.state.monthArrayList.map(item => (
            headers.push(moment(item).format(DATE_FORMAT_CAP_WITHOUT_DATE))
        ))


        var header = [headers]
        var A = [];
        let data = [];
        let t1 = [];

        A.push('Error')
        {
            this.state.errorValues.map((item, index) => {
                return (index == 0 ? A = A.concat(this.calculateAverage(this.state.errorValues) + ' %') : A = A.concat(item))
            })
        }
        data.push(A);

        //---------------
        A = [];
        t1 = [];
        A.push(i18n.t('static.consumption.forcast'))

        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            t1.push(sum)
        })
        A = A.concat(this.calculateAverage(t1));
        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            A = A.concat(sum);
        })

        data.push(A);

        //---------------

        this.state.regionListFiltered.map(item1 => {
            A = [];
            t1 = [];
            A.push(item1.label)
            this.state.monthArrayList.map((item, index) => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                t1.push(cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA")
            })
            A = A.concat(this.calculateAverage(t1));
            this.state.monthArrayList.map(item => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                A = A.concat(cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA")
            })
            data.push(A);
        })

        //---------------

        A = [];
        t1 = [];
        A.push(i18n.t('static.consumption.actual'))

        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            t1.push(cd.length > 0 ? sum : "NA")
        })
        A = A.concat(this.calculateAverage(t1));

        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            A = A.concat(cd.length > 0 ? sum : "NA");
        })

        data.push(A);

        //---------------

        this.state.regionListFiltered.map(item1 => {
            A = [];
            t1 = [];
            A.push(item1.label)

            this.state.monthArrayList.map(item => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                t1.push(cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA")
            })
            A = A.concat(this.calculateAverage(t1));

            this.state.monthArrayList.map(item => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                A = A.concat(cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA")
            })
            data.push(A);
        })

        //---------------

        A = [];
        t1 = [];
        A.push('Difference')

        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum1 = 0;
            cd1.map(c => { sum1 += parseInt(c.consumptionQty) });
            t1.push(sum1 > 0 ? sum1 - sum : "NA")
        })

        A = A.concat(this.calculateAverage(t1));

        this.state.monthArrayList.map(item => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += parseInt(c.consumptionQty) });
            var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum1 = 0;
            cd1.map(c => { sum1 += parseInt(c.consumptionQty) });
            A = A.concat(sum1 > 0 ? sum1 - sum : "NA")
        })
        data.push(A);

        //---------------

        this.state.regionListFiltered.map(item1 => {
            A = [];
            t1 = [];
            A.push(item1.label)

            this.state.monthArrayList.map(item => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                t1.push((cd.length > 0 && cd1.length > 0) ? parseInt(cd[0].consumptionQty) - parseInt(cd1[0].consumptionQty) : "NA")
            })

            A = A.concat(this.calculateAverage(t1));

            this.state.monthArrayList.map(item => {
                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                A = A.concat((cd.length > 0 && cd1.length > 0) ? parseInt(cd[0].consumptionQty) - parseInt(cd1[0].consumptionQty) : "NA")
            })
            data.push(A);
        })

        let content = {
            margin: { top: 80, bottom: 50 },
            startY: height,
            head: header,
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            // rowPageBreak: 'auto',
            // tableWidth: 'auto',
            horizontalPageBreak: true,
            horizontalPageBreakRepeat: 0,
            columnStyles: [
                { halign: "left" },
                { halign: "left" },
            ]

        };



        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + 'Consumption Forecast Error' + ".pdf")

    }

    calculateDaysInMonth(date) {
        var dt = new Date(date);
        var month = dt.getMonth() + 1;
        var year = dt.getFullYear();
        return new Date(year, month, 0).getDate();
    }

    filterData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        let timeWindowId = document.getElementById("timeWindowId").value;
        let viewById = document.getElementById("viewById").value;
        let yaxisEquUnit = document.getElementById("yaxisEquUnit").value;
        let consumptionAdjForStockOutId = document.getElementById("consumptionAdjusted").value;
        let regionIds = this.state.regionValues.map(ele => (ele.value).toString())
        let planningUnitId = -1;
        let forecastingUnitId = -1;
        (viewById == 1 ? planningUnitId = document.getElementById("planningUnitId").value : forecastingUnitId = document.getElementById("forecastingUnitId").value);

        console.log('values =>', planningUnitId, programId, versionId, regionIds);

        if (versionId != 0 && programId > 0 && (viewById == 1 ? planningUnitId > 0 : forecastingUnitId > 0) && regionIds.length > 0) {

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

                            var monthArrayList = [];
                            var consumptionData = [];
                            let cursorDate = startDate;
                            for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(endDate).format("YYYY-MM"); i++) {
                                var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                                cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
                                monthArrayList.push(dt);
                            }


                            console.log("Test------------>1", filteredProgram);

                            let actualConsumptionList = filteredProgram.actualConsumptionList;
                            let consumptionExtrapolation = filteredProgram.consumptionExtrapolation;

                            if (viewById == 1) {//planningUnitId
                                let treeList = filteredProgram.treeList;
                                let consumptionExtrapolation = filteredProgram.consumptionExtrapolation;

                                //actual
                                let actualConsumptionList1 = actualConsumptionList.filter(c => c.planningUnit.id == planningUnitId);
                                console.log("Test------------>1.1", actualConsumptionList1);

                                let actualConsumptionList2 = [];
                                if (yaxisEquUnit != -1) {//yes

                                    let planningUniObj = filteredProgram.planningUnitList.filter(c => c.planningUnit.id == planningUnitId)[0];
                                    let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUniObj.planningUnit.forecastingUnit.id)[0].convertToEu;

                                    actualConsumptionList2 = actualConsumptionList1.map(m => {
                                        return {
                                            consumptionDate: m.month,
                                            // consumptionQty: m.amount,
                                            consumptionQty: (consumptionAdjForStockOutId == 2 ? Math.round(m.amount / convertToEu) : (m.daysOfStockOut == null ? Math.round(m.amount / convertToEu) : Math.round((this.calculateDaysInMonth(m.month) / (this.calculateDaysInMonth(m.month) - m.daysOfStockOut) * m.amount) / convertToEu))),
                                            region: { regionId: m.region.id },
                                            actualFlag: true
                                        }
                                    })

                                } else {//no

                                    actualConsumptionList2 = actualConsumptionList1.map(m => {
                                        return {
                                            consumptionDate: m.month,
                                            // consumptionQty: m.amount,
                                            consumptionQty: (consumptionAdjForStockOutId == 2 ? m.amount : (m.daysOfStockOut == null ? m.amount : parseInt(this.calculateDaysInMonth(m.month) / (this.calculateDaysInMonth(m.month) - m.daysOfStockOut) * m.amount))),
                                            region: { regionId: m.region.id },
                                            actualFlag: true
                                        }
                                    })

                                }


                                let actualConsumptionList3 = [];
                                //filter based on region
                                for (let k = 0; k < regionIds.length; k++) {
                                    let tempList = actualConsumptionList2.filter(c => c.region.regionId == regionIds[k]);
                                    actualConsumptionList3 = actualConsumptionList3.concat(tempList);
                                }


                                consumptionData = consumptionData.concat(actualConsumptionList3);
                                console.log("Test------------>22", consumptionData);
                                //end actual





                                //forecast start
                                let filteredPlanningUnitList = filteredProgram.planningUnitList.filter(c => c.planningUnit.id == planningUnitId);
                                console.log("Test------------>499", filteredPlanningUnitList);
                                for (let k = 0; k < filteredPlanningUnitList.length; k++) {
                                    console.log("Test------------>500", filteredPlanningUnitList[k]);
                                    let planningUniObj = filteredPlanningUnitList[k];
                                    let selectedForecastMap = planningUniObj.selectedForecastMap;
                                    let selectedForecastMapObjIn = (selectedForecastMap[Object.keys(selectedForecastMap)[0]]);

                                    if (selectedForecastMapObjIn != undefined && selectedForecastMapObjIn != null && selectedForecastMapObjIn != '') {

                                        let nodeDataMomList = [];
                                        let keys = Object.keys(selectedForecastMap);
                                        for (let j = 0; j < keys.length; j++) {//region loop
                                            if (selectedForecastMap[keys[j]] != undefined && selectedForecastMap[keys[j]] != null && selectedForecastMap[keys[j]] != '') {

                                                let regionSelectedForecast = regionIds.filter(c => c == keys[j]);
                                                if (regionSelectedForecast.length > 0) {

                                                    selectedForecastMapObjIn = (selectedForecastMap[keys[j]]);
                                                    let treeId = selectedForecastMapObjIn.treeId;
                                                    let scenarioId = selectedForecastMapObjIn.scenarioId;
                                                    let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;
                                                    let regionId = keys[j];


                                                    if (scenarioId != null) {//scenarioId
                                                        for (let m = 0; m < treeList.length; m++) {
                                                            let filteredScenario = (treeList[m].treeId == treeId ? treeList[m].scenarioList.filter(c => c.id == scenarioId) : []);
                                                            if (filteredScenario.length > 0) {
                                                                let flatlist = treeList[m].tree.flatList;
                                                                let listContainNodeType5 = flatlist.filter(c => c.payload.nodeType.id == 5);
                                                                console.log("Test------------>5", listContainNodeType5);


                                                                let myTempData = [];
                                                                for (let n = 0; n < listContainNodeType5.length; n++) {

                                                                    let arrayOfNodeDataMap = (listContainNodeType5[n].payload.nodeDataMap[scenarioId]).filter(c => c.puNode.planningUnit.id == filteredPlanningUnitList[k].planningUnit.id);
                                                                    if (arrayOfNodeDataMap.length > 0) {
                                                                        nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;

                                                                        if (yaxisEquUnit != -1) {//Yes                                                                            
                                                                            let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUniObj.planningUnit.forecastingUnit.id)[0].convertToEu;

                                                                            let consumptionList = nodeDataMomList.map(m => {
                                                                                return {
                                                                                    consumptionDate: m.month,
                                                                                    // consumptionQty: Math.round(m.calculatedMmdValue / convertToEu),
                                                                                    consumptionQty: (m.calculatedMmdValue == null ? 0 : Math.round(m.calculatedMmdValue / convertToEu)),
                                                                                    region: { regionId: regionId },
                                                                                    actualFlag: false
                                                                                }
                                                                            });
                                                                            myTempData = myTempData.concat(consumptionList);
                                                                        } else {
                                                                            let consumptionList = nodeDataMomList.map(m => {
                                                                                return {
                                                                                    consumptionDate: m.month,
                                                                                    consumptionQty: Math.round(m.calculatedMmdValue),
                                                                                    region: { regionId: regionId },
                                                                                    actualFlag: false
                                                                                }
                                                                            });
                                                                            myTempData = myTempData.concat(consumptionList);
                                                                        }
                                                                    }

                                                                }


                                                                // logic for add same date data
                                                                let resultTrue = Object.values(myTempData.reduce((a, { consumptionDate, consumptionQty, region, actualFlag }) => {
                                                                    if (!a[consumptionDate])
                                                                        a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty, region, actualFlag });
                                                                    else
                                                                        a[consumptionDate].consumptionQty += consumptionQty;
                                                                    return a;
                                                                }, {}));

                                                                console.log("Test------------>IMP", resultTrue);

                                                                consumptionData = consumptionData.concat(resultTrue);

                                                            }
                                                        }

                                                    } else {//consumptionExtrapolationId

                                                        let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);

                                                        if (consumptionExtrapolationObj.length > 0) {
                                                            console.log("Test------------>ELSE-1", consumptionExtrapolationObj);

                                                            let consumptionList = [];
                                                            if (yaxisEquUnit != -1) {//Yes
                                                                let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUniObj.planningUnit.forecastingUnit.id)[0].convertToEu;

                                                                consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                    return {
                                                                        consumptionDate: m.month,
                                                                        consumptionQty: (m.amount == null ? 0 : Math.round(m.amount / convertToEu)),
                                                                        region: { regionId: regionId },
                                                                        actualFlag: false
                                                                    }
                                                                });

                                                            } else {
                                                                consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                    return {
                                                                        consumptionDate: m.month,
                                                                        consumptionQty: (m.amount == null ? 0 : Math.round(m.amount)),
                                                                        region: { regionId: regionId },
                                                                        actualFlag: false
                                                                    }
                                                                });
                                                            }

                                                            consumptionData = consumptionData.concat(consumptionList);
                                                        }



                                                    }//end consumptionExtrapolationId



                                                }
                                            }
                                        }


                                        // let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;
                                        // console.log("Test------------>501", consumptionExtrapolationId);
                                        // if (consumptionExtrapolationId != null) {
                                        //     console.log("Test------------>502", consumptionExtrapolationId);
                                        //     let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);
                                        //     console.log("Test------------>503", consumptionExtrapolationObj);
                                        //     if (consumptionExtrapolationObj.length > 0) {
                                        //         console.log("Test------------>504", consumptionExtrapolationObj);
                                        //         let regionId = consumptionExtrapolationObj[0].region.id;

                                        //         let consumptionList = [];
                                        //         if (yaxisEquUnit != -1) {//yes

                                        //             let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUniObj.planningUnit.forecastingUnit.id)[0].convertToEu;

                                        //             consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                        //                 return {
                                        //                     consumptionDate: m.month,
                                        //                     consumptionQty: Math.round(m.amount / convertToEu),
                                        //                     region: { regionId: regionId },
                                        //                     actualFlag: false
                                        //                 }
                                        //             });
                                        //         } else {
                                        //             consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                        //                 return {
                                        //                     consumptionDate: m.month,
                                        //                     consumptionQty: m.amount,
                                        //                     region: { regionId: regionId },
                                        //                     actualFlag: false
                                        //                 }
                                        //             });
                                        //         }

                                        //         console.log("Test------------>2.1", planningUniObj.planningUnit.id);
                                        //         console.log("Test------------>2.2", consumptionList);

                                        //         //filter based on region
                                        //         let actualConsumptionList3 = [];
                                        //         for (let j = 0; j < regionIds.length; j++) {
                                        //             let tempList = consumptionList.filter(c => c.region.regionId == regionIds[j]);
                                        //             actualConsumptionList3 = actualConsumptionList3.concat(tempList);
                                        //         }

                                        //         consumptionData = consumptionData.concat(actualConsumptionList3);
                                        //     }
                                        // }
                                    }
                                }//end filter pu
                                console.log("Test------------>333", consumptionData);
                                //end forecast



                                let regionIdArr = regionIds.map(c => parseInt(c))

                                //start WAPE
                                let forecast = monthArrayList.map(item => {
                                    var cd = consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && regionIdArr.includes(c.region.regionId));
                                    var sum = 0;
                                    cd.map(c => { sum += c.consumptionQty });
                                    // return (<td><b>{sum}</b></td>)
                                    return sum;
                                });

                                let actual = monthArrayList.map(item => {
                                    var cd = consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && regionIdArr.includes(c.region.regionId));
                                    var sum = 0;
                                    cd.map(c => { sum += c.consumptionQty });
                                    // return (<td><b>{cd.length > 0 ? sum : "NA"}</b></td>)
                                    return (cd.length > 0 ? sum : "NA");
                                });

                                let difference = monthArrayList.map(item => {
                                    var cd = consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && regionIdArr.includes(c.region.regionId));
                                    var sum = 0;
                                    cd.map(c => { sum += c.consumptionQty });
                                    var cd1 = consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && regionIdArr.includes(c.region.regionId));
                                    var sum1 = 0;
                                    cd1.map(c => { sum1 += c.consumptionQty });
                                    // return (<td><b>{sum1 > 0 ? sum1 - sum : "NA"}</b></td>)
                                    return (sum1 > 0 ? sum1 - sum : "NA");
                                });


                                let wapeErrorValues = [];
                                // timeWindowId = timeWindowId;
                                let numOr0 = n => isNaN(n) ? 0 : n;
                                for (var i = actual.length - 1; i >= 0; i--) {
                                    let lastNActual = actual.slice(0, i + 1).slice(-timeWindowId);
                                    let lastNDifference = difference.slice(0, i + 1).slice(-timeWindowId);
                                    lastNDifference = lastNDifference.map(s => Math.abs(s));

                                    // let addActual = ((lastNActual.reduce((a, b) => a + b)).toString().includes('NA') == true ? 'NA' : lastNActual.reduce((a, b) => numOr0(a) + numOr0(b)));
                                    // let addDifference = lastNDifference.reduce((a, b) => numOr0(a) + numOr0(b));
                                    // ((addActual).toString().includes('NA') == true ? wapeErrorValues.push('NA') : wapeErrorValues.push(Math.round(addDifference / addActual * 100) + " %"));

                                    let addActual = ((lastNActual.reduce((a, b) => a + b)).toString().slice(-2) == "NA" ? 'NA' : lastNActual.reduce((a, b) => numOr0(a) + numOr0(b)));
                                    let addDifference = lastNDifference.reduce((a, b) => numOr0(a) + numOr0(b));
                                    ((addActual).toString().includes('NA') == true ? wapeErrorValues.push('NA') : wapeErrorValues.push(Math.round(addDifference / addActual * 100) + " %"));

                                }

                                wapeErrorValues = wapeErrorValues.reverse();
                                wapeErrorValues.unshift(" ");

                                console.log("WAP----------->forecast ", forecast);
                                console.log("WAP----------->actual ", actual);
                                console.log("WAP----------->difference ", difference);
                                console.log("WAP----------->reverse ", wapeErrorValues);
                                console.log("WAP----------->reverse1 ", this.state.regionValues);
                                console.log("WAP----------->reverse2 ", regionIds);


                                //end WAPE

                                this.setState({
                                    // consumptionData: consumptionData,
                                    // monthArrayList: monthArrayList,
                                    // regionIdArr: regionIds,

                                    //remove hardcode data
                                    monthArrayList: monthArrayList,
                                    // regionListFiltered: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
                                    // regionIdArr: regionIdArr,
                                    regionListFiltered: this.state.regionValues,
                                    regionIdArr: regionIds.map(c => parseInt(c)),
                                    consumptionData: consumptionData,
                                    errorValues: wapeErrorValues,
                                    message: ''
                                    // errorValues: ["39%", "66%", "48%", "32%", "30%", "37%", "32%", "28%", "NA", "NA", "NA", "NA", "NA"]
                                });



                            } else {//forecastingUnitId
                                let treeList = filteredProgram.treeList;
                                let consumptionExtrapolation = filteredProgram.consumptionExtrapolation;

                                //actual
                                let actualConsumptionList1 = actualConsumptionList.filter(c => c.planningUnit.forecastingUnit.id == forecastingUnitId);
                                console.log("Test------------>1.1 FU", actualConsumptionList1);

                                let actualConsumptionList2 = [];

                                if (yaxisEquUnit != -1) {//yes
                                    let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == forecastingUnitId)[0].convertToEu;

                                    actualConsumptionList2 = actualConsumptionList1.map(m => {
                                        return {
                                            consumptionDate: m.month,
                                            // consumptionQty: m.amount * m.puMultiplier,
                                            consumptionQty: (consumptionAdjForStockOutId == 2 ? Math.round(m.amount * m.puMultiplier / convertToEu) : (m.daysOfStockOut == null ? Math.round(m.amount * m.puMultiplier / convertToEu) : Math.round((this.calculateDaysInMonth(m.month) / (this.calculateDaysInMonth(m.month) - m.daysOfStockOut) * (m.amount * m.puMultiplier)) / convertToEu))),
                                            region: { regionId: m.region.id },
                                            actualFlag: true
                                        }
                                    })

                                } else {
                                    actualConsumptionList2 = actualConsumptionList1.map(m => {
                                        return {
                                            consumptionDate: m.month,
                                            // consumptionQty: m.amount * m.puMultiplier,
                                            consumptionQty: (consumptionAdjForStockOutId == 2 ? parseInt(m.amount * m.puMultiplier) : (m.daysOfStockOut == null ? parseInt(m.amount * m.puMultiplier) : parseInt(this.calculateDaysInMonth(m.month) / (this.calculateDaysInMonth(m.month) - m.daysOfStockOut) * (m.amount * m.puMultiplier)))),
                                            region: { regionId: m.region.id },
                                            actualFlag: true
                                        }
                                    })

                                }





                                let actualConsumptionList3 = [];
                                //filter based on region
                                for (let k = 0; k < regionIds.length; k++) {
                                    let tempList = actualConsumptionList2.filter(c => c.region.regionId == regionIds[k]);
                                    actualConsumptionList3 = actualConsumptionList3.concat(tempList);
                                }


                                consumptionData = consumptionData.concat(actualConsumptionList3);
                                console.log("Test------------>22 FU", consumptionData);
                                //end actual



                                //forecast start
                                let filteredPlanningUnitList = filteredProgram.planningUnitList.filter(c => c.planningUnit.forecastingUnit.id == forecastingUnitId);
                                console.log("Test------------>499 FU", filteredPlanningUnitList);
                                let tempConsumptionData = [];
                                for (let k = 0; k < filteredPlanningUnitList.length; k++) {
                                    console.log("Test------------>500 FU", filteredPlanningUnitList[k]);
                                    let planningUniObj = filteredPlanningUnitList[k];
                                    let selectedForecastMap = planningUniObj.selectedForecastMap;
                                    let selectedForecastMapObjIn = (selectedForecastMap[Object.keys(selectedForecastMap)[0]]);

                                    if (selectedForecastMapObjIn != undefined && selectedForecastMapObjIn != null && selectedForecastMapObjIn != '') {

                                        let nodeDataMomList = [];
                                        let keys = Object.keys(selectedForecastMap);
                                        for (let j = 0; j < keys.length; j++) {//region loop
                                            console.log("TestFU------------>3", keys[j]);

                                            if (selectedForecastMap[keys[j]] != undefined && selectedForecastMap[keys[j]] != '' && selectedForecastMap[keys[j]] != null) {
                                                let selectedForecastMapObjIn = (selectedForecastMap[keys[j]]);

                                                let treeId = selectedForecastMapObjIn.treeId;
                                                let scenarioId = selectedForecastMapObjIn.scenarioId;
                                                let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;
                                                let regionId = keys[j];


                                                if (scenarioId != null) {//scenarioId
                                                    for (let m = 0; m < treeList.length; m++) {
                                                        console.log("TestFU------------>4", treeList[m]);
                                                        // let filteredScenario = treeList[m].scenarioList.filter(c => c.id == scenarioId);
                                                        let filteredScenario = (treeList[m].treeId == treeId ? treeList[m].scenarioList.filter(c => c.id == scenarioId) : []);
                                                        if (filteredScenario.length > 0) {
                                                            let flatlist = treeList[m].tree.flatList;

                                                            let listContainNodeType4 = flatlist.filter(c => c.payload.nodeType.id == 4);

                                                            console.log("TestFU------------>5", listContainNodeType4);


                                                            let myTempData = [];
                                                            for (let k = 0; k < listContainNodeType4.length; k++) {
                                                                let arrayOfNodeDataMap = (listContainNodeType4[k].payload.nodeDataMap[scenarioId]).filter(c => c.fuNode.forecastingUnit.id == filteredPlanningUnitList[k].planningUnit.forecastingUnit.id);

                                                                if (arrayOfNodeDataMap.length > 0) {
                                                                    nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;
                                                                    if (yaxisEquUnit != -1) {//Yes

                                                                        let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == filteredPlanningUnitList[k].planningUnit.forecastingUnit.id)[0].convertToEu;

                                                                        let consumptionList = nodeDataMomList.map(m => {
                                                                            return {
                                                                                consumptionDate: m.month,
                                                                                consumptionQty: Math.round(m.calculatedValue / convertToEu),
                                                                                regionId: { regionId: regionId },
                                                                                actualFlag: false
                                                                            }
                                                                        });
                                                                        myTempData = myTempData.concat(consumptionList);
                                                                    } else {

                                                                        let consumptionList = nodeDataMomList.map(m => {
                                                                            return {
                                                                                consumptionDate: m.month,
                                                                                consumptionQty: Math.round(m.calculatedValue),
                                                                                regionId: { regionId: regionId },
                                                                                actualFlag: false
                                                                            }
                                                                        });
                                                                        myTempData = myTempData.concat(consumptionList);

                                                                    }
                                                                }
                                                            }

                                                            // logic for add same date data
                                                            let resultTrue = Object.values(myTempData.reduce((a, { consumptionDate, consumptionQty, regionId, actualFlag }) => {
                                                                if (!a[consumptionDate])
                                                                    a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty, regionId, actualFlag });
                                                                else
                                                                    a[consumptionDate].consumptionQty += consumptionQty;
                                                                return a;
                                                            }, {}));

                                                            console.log("Test------------>IMP FU", resultTrue);

                                                            if (tempConsumptionData.length > 0) {
                                                                let checkRegionIdIsPresent = tempConsumptionData.filter(c => c.regionId == regionId);
                                                                if (checkRegionIdIsPresent.length > 0) {
                                                                    let findIndex = tempConsumptionData.findIndex(c => c.regionId == regionId);
                                                                    let alreadyPresentConsumptionList = tempConsumptionData[findIndex].consumptionList.concat(resultTrue);

                                                                    // logic for add same date data
                                                                    let newAddedConsumptionList = Object.values(alreadyPresentConsumptionList.reduce((a, { consumptionDate, consumptionQty, regionId, actualFlag }) => {
                                                                        if (!a[consumptionDate])
                                                                            a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty, regionId, actualFlag });
                                                                        else
                                                                            a[consumptionDate].consumptionQty += consumptionQty;
                                                                        return a;
                                                                    }, {}));
                                                                    consumptionData[findIndex].consumptionList = newAddedConsumptionList;
                                                                } else {
                                                                    tempConsumptionData.push({ regionId: regionId, consumptionList: resultTrue })
                                                                }
                                                            } else {
                                                                tempConsumptionData.push({ regionId: regionId, consumptionList: resultTrue })
                                                            }


                                                        }
                                                    }

                                                } else {//consumptionExtrapolationId

                                                    // console.log("Test------------>ELSE");
                                                    let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                    if (consumptionExtrapolationObj.length > 0) {

                                                        let consumptionList = [];
                                                        if (yaxisEquUnit != -1) {//Yes
                                                            let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == filteredPlanningUnitList[k].planningUnit.forecastingUnit.id)[0].convertToEu;

                                                            consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                return {
                                                                    consumptionDate: m.month,
                                                                    consumptionQty: Math.round(m.amount * planningUniObj.planningUnit.muliplier / convertToEu),
                                                                    region: { regionId: regionId },
                                                                    actualFlag: false
                                                                }
                                                            });

                                                        } else {
                                                            consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                return {
                                                                    consumptionDate: m.month,
                                                                    consumptionQty: Math.round(m.amount),
                                                                    region: { regionId: regionId },
                                                                    actualFlag: false
                                                                }
                                                            });

                                                        }


                                                        if (tempConsumptionData.length > 0) {
                                                            let checkRegionIdIsPresent = tempConsumptionData.filter(c => c.regionId == regionId);
                                                            if (checkRegionIdIsPresent.length > 0) {
                                                                let findIndex = tempConsumptionData.findIndex(c => c.regionId == regionId);
                                                                let alreadyPresentConsumptionList = tempConsumptionData[findIndex].consumptionList.concat(consumptionList);

                                                                // logic for add same date data
                                                                let newAddedConsumptionList = Object.values(alreadyPresentConsumptionList.reduce((a, { consumptionDate, consumptionQty, regionId, actualFlag }) => {
                                                                    if (!a[consumptionDate])
                                                                        a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty, regionId, actualFlag });
                                                                    else
                                                                        a[consumptionDate].consumptionQty += consumptionQty;
                                                                    return a;
                                                                }, {}));
                                                                consumptionData[findIndex].consumptionList = newAddedConsumptionList;
                                                            } else {
                                                                tempConsumptionData.push({ regionId: regionId, consumptionList: consumptionList })
                                                            }
                                                        } else {
                                                            tempConsumptionData.push({ regionId: regionId, consumptionList: consumptionList })
                                                        }

                                                    }

                                                }//consumptionExtrapolationId end


                                            }//end if
                                        }//end keys


                                        // let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;
                                        // console.log("Test------------>501 FU", consumptionExtrapolationId);
                                        // if (consumptionExtrapolationId != null) {
                                        //     console.log("Test------------>502 FU", consumptionExtrapolationId);
                                        //     let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);
                                        //     console.log("Test------------>503 FU", consumptionExtrapolationObj);
                                        //     if (consumptionExtrapolationObj.length > 0) {
                                        //         console.log("Test------------>504 FU", consumptionExtrapolationObj);
                                        //         let regionId = consumptionExtrapolationObj[0].region.id;

                                        //         let consumptionList = [];
                                        //         if (yaxisEquUnit != -1) {//yes

                                        //             let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == forecastingUnitId)[0].convertToEu;

                                        //             consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                        //                 return {
                                        //                     consumptionDate: m.month,
                                        //                     consumptionQty: Math.round(m.amount * consumptionExtrapolationObj[0].planningUnit.multiplier / convertToEu),
                                        //                     region: { regionId: regionId },
                                        //                     actualFlag: false
                                        //                 }
                                        //             });
                                        //         } else {
                                        //             consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                        //                 return {
                                        //                     consumptionDate: m.month,
                                        //                     consumptionQty: m.amount * consumptionExtrapolationObj[0].planningUnit.multiplier,
                                        //                     region: { regionId: regionId },
                                        //                     actualFlag: false
                                        //                 }
                                        //             });
                                        //         }


                                        //         console.log("Test------------>2.1 FU", planningUniObj.planningUnit.id);
                                        //         console.log("Test------------>2.2 FU", consumptionList);

                                        //         //filter based on region
                                        //         let actualConsumptionList3 = [];
                                        //         for (let j = 0; j < regionIds.length; j++) {
                                        //             let tempList = consumptionList.filter(c => c.region.regionId == regionIds[j]);
                                        //             actualConsumptionList3 = actualConsumptionList3.concat(tempList);
                                        //         }

                                        //         consumptionData = consumptionData.concat(actualConsumptionList3);

                                        //     }
                                        // }

                                    }
                                }// end FU loop

                                let regionListData = tempConsumptionData.map(c => c.consumptionList);

                                consumptionData = consumptionData.concat(regionListData);


                                console.log("Test------------>333 FU", consumptionData);
                                //end forecast



                                let regionIdArr = regionIds.map(c => parseInt(c))

                                //start WAPE
                                let forecast = monthArrayList.map(item => {
                                    var cd = consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && regionIdArr.includes(c.region.regionId));
                                    var sum = 0;
                                    cd.map(c => { sum += c.consumptionQty });
                                    // return (<td><b>{sum}</b></td>)
                                    return sum;
                                });

                                let actual = monthArrayList.map(item => {
                                    var cd = consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && regionIdArr.includes(c.region.regionId));
                                    var sum = 0;
                                    cd.map(c => { sum += c.consumptionQty });
                                    // return (<td><b>{cd.length > 0 ? sum : "NA"}</b></td>)
                                    return (cd.length > 0 ? sum : "NA");
                                });

                                let difference = monthArrayList.map(item => {
                                    var cd = consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && regionIdArr.includes(c.region.regionId));
                                    var sum = 0;
                                    cd.map(c => { sum += c.consumptionQty });
                                    var cd1 = consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && regionIdArr.includes(c.region.regionId));
                                    var sum1 = 0;
                                    cd1.map(c => { sum1 += c.consumptionQty });
                                    // return (<td><b>{sum1 > 0 ? sum1 - sum : "NA"}</b></td>)
                                    return (sum1 > 0 ? sum1 - sum : "NA");
                                });


                                let wapeErrorValues = [];
                                // timeWindowId = timeWindowId;
                                let numOr0 = n => isNaN(n) ? 0 : n;
                                for (var i = actual.length - 1; i >= 0; i--) {
                                    let lastNActual = actual.slice(0, i + 1).slice(-timeWindowId);
                                    let lastNDifference = difference.slice(0, i + 1).slice(-timeWindowId);
                                    lastNDifference = lastNDifference.map(s => Math.abs(s));

                                    // let addActual = ((lastNActual.reduce((a, b) => a + b)).toString().includes('NA') == true ? 'NA' : lastNActual.reduce((a, b) => numOr0(a) + numOr0(b)));
                                    // let addDifference = lastNDifference.reduce((a, b) => numOr0(a) + numOr0(b));
                                    // ((addActual).toString().includes('NA') == true ? wapeErrorValues.push('NA') : wapeErrorValues.push(Math.round(addDifference / addActual * 100) + " %"));

                                    let addActual = ((lastNActual.reduce((a, b) => a + b)).toString().slice(-2) == "NA" ? 'NA' : lastNActual.reduce((a, b) => numOr0(a) + numOr0(b)));
                                    let addDifference = lastNDifference.reduce((a, b) => numOr0(a) + numOr0(b));
                                    ((addActual).toString().includes('NA') == true ? wapeErrorValues.push('NA') : wapeErrorValues.push(Math.round(addDifference / addActual * 100) + " %"));

                                }

                                wapeErrorValues = wapeErrorValues.reverse();
                                wapeErrorValues.unshift(" ");

                                console.log("WAP----------->forecast FU ", forecast);
                                console.log("WAP----------->actual FU ", actual);
                                console.log("WAP----------->difference FU ", difference);
                                console.log("WAP----------->reverse FU ", wapeErrorValues);
                                console.log("WAP----------->reverse1 FU ", this.state.regionValues);
                                console.log("WAP----------->reverse2 FU ", regionIds);


                                //end WAPE

                                this.setState({
                                    // consumptionData: consumptionData,
                                    // monthArrayList: monthArrayList,
                                    // regionIdArr: regionIds,

                                    //remove hardcode data
                                    monthArrayList: monthArrayList,
                                    // regionListFiltered: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
                                    // regionIdArr: regionIdArr,
                                    regionListFiltered: this.state.regionValues,
                                    regionIdArr: regionIds.map(c => parseInt(c)),
                                    consumptionData: consumptionData,
                                    errorValues: wapeErrorValues,
                                    message: ''
                                    // errorValues: ["39%", "66%", "48%", "32%", "30%", "37%", "32%", "28%", "NA", "NA", "NA", "NA", "NA"]
                                });




                            }

                        })


                    }.bind(this);
                }.bind(this);



            } else {//api call



            }



        } else if (programId == -1) {//validation message            
            this.setState({ message: i18n.t('static.common.selectProgram'), monthArrayList: [], regionListFiltered: [], regionIdArr: [], consumptionData: [], errorValues: [] });

        } else if (versionId == -1) {
            this.setState({ message: i18n.t('static.program.validversion'), monthArrayList: [], regionListFiltered: [], regionIdArr: [], consumptionData: [], errorValues: [] });

        } else if (viewById == 1 && planningUnitId == -1) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), monthArrayList: [], regionListFiltered: [], regionIdArr: [], consumptionData: [], errorValues: [] });

        } else if (viewById == 2 && forecastingUnitId == -1) {
            this.setState({ message: i18n.t('static.planningunit.forcastingunittext'), monthArrayList: [], regionListFiltered: [], regionIdArr: [], consumptionData: [], errorValues: [] });

        } else if (regionIds.length == 0) {
            this.setState({ message: 'Select Regions', monthArrayList: [], regionListFiltered: [], regionIdArr: [], consumptionData: [], errorValues: [] });

        }

    }


    getPrograms() {
        // this.setState({ programs: [{ label: "FASPonia MOH 1", programId: 1 }], loading: false });

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
                let downloadedProgramData = [];
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
                                console.log("programJson1-------->1", programData);
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                        downloadedProgramData.push(programData);
                    }


                }
                var lang = this.state.lang;

                this.setState({
                    programs: proList.sort(function (a, b) {
                        a = getLabelText(a.label, lang).toLowerCase();
                        b = getLabelText(b.label, lang).toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }),
                    downloadedProgramData: downloadedProgramData
                }, () => {
                    this.filterData();
                    console.log("programs------------------>", this.state.programs);
                })


            }.bind(this);

        }.bind(this);


    }

    componentDidMount() {
        this.getPrograms();
        document.getElementById("forecastingUnitDiv").style.display = "none";
        // this.setState({
        //     regionVal: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
        //     regionList: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
        //     regionListFiltered: [{ label: "East", value: 1 }, { label: "West", value: 2 }, { label: "North", value: 3 }, { label: "South", value: 4 }],
        //     regionIdArr: [1, 2, 3, 4]
        // })
    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: '',
            // equivalencyUnitId: '',
            consumptionData: [],
            monthArrayList: [],
            errorValues: [],
            regionListFiltered: [],
            planningUnits: [],
            planningUnitId: '',
            yaxisEquUnit: -1,

            foreastingUnits: [],
            forecastingUnitId: '',
        }, () => {
            // localStorage.setItem("sesVersionIdReport", '');
            this.filterData();
            this.getVersionIds();
        })
    }

    setVersionId(event) {

        var versionId = ((event == null || event == '' || event == undefined) ? ((this.state.versionId).toString().split('(')[0]) : (event.target.value.split('(')[0]).trim());
        console.log("versionId----------->", versionId);
        versionId = parseInt(versionId);
        var programId = this.state.programId;
        if (versionId != '' || versionId != undefined) {
            this.setState({
                versionId: ((event == null || event == '' || event == undefined) ? (this.state.versionId) : (event.target.value).trim()),
                yaxisEquUnit: -1,
                // equivalencyUnitId: '',
                planningUnits: [],
                planningUnitId: '',
                foreastingUnits: [],
                forecastingUnitId: '',
                consumptionData: [],
                monthArrayList: [],
                errorValues: [],
                regionListFiltered: [],

                regions: [],
                regionValues: [],
                regionLabels: [],
            }, () => {
                this.getEquivalencyUnitData();
                this.getPlanningUnitForecastingUnit();
            })
        } else {
            this.setState({
                versionId: event.target.value
            }, () => {
                this.getEquivalencyUnitData();
                this.getPlanningUnitForecastingUnit();
            })
        }
    }

    getRegionList = (regionList) => {
        this.setState({
            regions: regionList,
        }, () => {
            this.filterData();
        })
    }

    getPlanningUnitForecastingUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;

        if (programId != -1 && versionId != -1) {

            this.setState({
                // equivalencyUnitId: equivalencyUnitIdd,
                planningUnits: [],
                planningUnitId: '',
                foreastingUnits: [],
                forecastingUnitId: '',
                consumptionData: [],
                monthArrayList: [],
            }, () => {

                if (versionId == -1) {
                    this.setState({ message: i18n.t('static.program.validversion'), matricsList: [] });
                } else {
                    // localStorage.setItem("sesVersionIdReport", versionId);
                    if (versionId.includes('Local')) {
                        let programData = this.state.downloadedProgramData.filter(c => c.programId == programId && c.currentVersion.versionId == (versionId.split('(')[0]).trim())[0];
                        console.log("programData---------->", programData);
                        let forecastingUnitListTemp = [];
                        var lang = this.state.lang;

                        let consumptionForecastTrueList = programData.planningUnitList.filter(c => c.consuptionForecast == true && c.active == true);
                        let planningUnitList = consumptionForecastTrueList.map(o => o.planningUnit);

                        for (var i = 0; i < planningUnitList.length; i++) {
                            forecastingUnitListTemp.push(planningUnitList[i].forecastingUnit);
                        }
                        // console.log("PlanningUnitList----------------->1", planningUnitList);
                        // console.log("PlanningUnitList----------------->2", forecastingUnitListTemp);

                        const ids = forecastingUnitListTemp.map(o => o.id);
                        const forecastingUnitList = forecastingUnitListTemp.filter(({ id }, index) => !ids.includes(id, index + 1));
                        // console.log("PlanningUnitList----------------->3", filtered);


                        let yaxisEquUnitId = document.getElementById("yaxisEquUnit").value;
                        if (yaxisEquUnitId != -1) {//Yes
                            let filteredProgramEQList = this.state.programEquivalencyUnitList.filter(c => c.equivalencyUnit.equivalencyUnitId == yaxisEquUnitId);
                            let newPlanningUnitList = [];
                            let newForecastingUnitList = [];
                            for (var i = 0; i < forecastingUnitList.length; i++) {
                                let temp = filteredProgramEQList.filter(c => c.forecastingUnit.id == forecastingUnitList[i].id);
                                if (temp.length > 0) {
                                    newForecastingUnitList.push(forecastingUnitList[i]);
                                }
                            }

                            for (var i = 0; i < planningUnitList.length; i++) {
                                let temp = filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUnitList[i].forecastingUnit.id);
                                if (temp.length > 0) {
                                    newPlanningUnitList.push(planningUnitList[i]);
                                }
                            }

                            var yaxisEquUnitt = document.getElementById("yaxisEquUnit");
                            var selectedText = yaxisEquUnitt.options[yaxisEquUnitt.selectedIndex].text;

                            newPlanningUnitList.sort(function (a, b) {
                                a = getLabelText(a.label, lang).toLowerCase();
                                b = getLabelText(b.label, lang).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            });

                            newForecastingUnitList.sort(function (a, b) {
                                a = getLabelText(a.label, lang).toLowerCase();
                                b = getLabelText(b.label, lang).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })

                            this.setState({
                                planningUnits: newPlanningUnitList,
                                forecastingUnits: newForecastingUnitList,
                                equivalencyUnitLabel: selectedText,
                                filteredProgramEQList: filteredProgramEQList
                            }, () => {
                                this.getRegionList(programData.regionList);
                                // this.filterData();
                            })
                        } else {//NO

                            planningUnitList.sort(function (a, b) {
                                a = getLabelText(a.label, lang).toLowerCase();
                                b = getLabelText(b.label, lang).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            });

                            forecastingUnitList.sort(function (a, b) {
                                a = getLabelText(a.label, lang).toLowerCase();
                                b = getLabelText(b.label, lang).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })
                            this.setState({
                                planningUnits: planningUnitList,
                                forecastingUnits: forecastingUnitList,
                                equivalencyUnitLabel: ''
                            }, () => {
                                this.getRegionList(programData.regionList);
                                // this.filterData();
                            })
                        }

                    }
                    else {

                        // ProgramService.getActiveProgramPlaningUnitListByProgramId(programId).then(response => {
                        //     console.log('**' + JSON.stringify(response.data))
                        //     var listArray = response.data;
                        //     listArray.sort((a, b) => {
                        //         var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        //         var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        //         return itemLabelA > itemLabelB ? 1 : -1;
                        //     });
                        //     this.setState({
                        //         planningUnits: listArray,
                        //         message: ''
                        //     }, () => {
                        //         this.filterData();
                        //     })
                        // }).catch(
                        //     error => {
                        //         this.setState({
                        //             planningUnits: [],
                        //         })
                        //         if (error.message === "Network Error") {
                        //             this.setState({
                        //                 message: 'static.unkownError',
                        //                 loading: false
                        //             });
                        //         } else {
                        //             switch (error.response ? error.response.status : "") {

                        //                 case 401:
                        //                     this.props.history.push(`/login/static.message.sessionExpired`)
                        //                     break;
                        //                 case 403:
                        //                     this.props.history.push(`/accessDenied`)
                        //                     break;
                        //                 case 500:
                        //                 case 404:
                        //                 case 406:
                        //                     this.setState({
                        //                         message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
                        //                         loading: false
                        //                     });
                        //                     break;
                        //                 case 412:
                        //                     this.setState({
                        //                         message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
                        //                         loading: false
                        //                     });
                        //                     break;
                        //                 default:
                        //                     this.setState({
                        //                         message: 'static.unkownError',
                        //                         loading: false
                        //                     });
                        //                     break;
                        //             }
                        //         }
                        //     }
                        // );
                    }
                }
            });
        }
    }

    getVersionIds() {
        // var versionListAll = this.state.versionListAll;
        // var planningUnitListAll = this.state.planningUnitListAll;
        // var reportPeriod = [{ programId: 2, startDate: '2020-09-01', endDate: '2021-08-30' }, { programId: 1, startDate: '2020-07-01', endDate: '2021-06-30' }, { programId: 3, startDate: '2020-11-01', endDate: '2021-10-30' }];
        // var startDate = reportPeriod.filter(c => c.programId == this.state.programId)[0].startDate;
        // var endDate = reportPeriod.filter(c => c.programId == this.state.programId)[0].endDate;

        // var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } }
        // let stopDate = endDate;
        // var monthArrayList = [];
        // let cursorDate = startDate;
        // for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"); i++) {
        //     var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
        //     cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
        //     monthArrayList.push(dt);
        // }
        // this.setState({ versions: versionListAll.filter(c => c.program.programId == this.state.programId), loading: false, planningUnits: planningUnitListAll.filter(c => c.program.programId == this.state.programId), rangeValue: rangeValue, monthArrayList: monthArrayList });


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
                    this.filterData();
                    // this.getPlanningUnit();
                })


            }.bind(this);
        }.bind(this)
    }



    show() {

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
            this.filterData();
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

    consumptionAdjusted(e) {
        this.setState({
            consumptionAdjusted: e.target.value,
        }, () => {
            this.filterData();
        })
    }

    yAxisChange(e) {
        var yaxisEquUnit = e.target.value;
        console.log("e.target.value+++", e.target.value)
        this.setState({
            yaxisEquUnit: yaxisEquUnit,
            // equivalencyUnitId: (e.target.value == 2 ? '' : document.getElementById("equivalencyUnitId").value),
            planningUnits: [],
            planningUnitId: '',
            foreastingUnits: [],
            forecastingUnitId: '',
            consumptionData: [],
            monthArrayList: [],
        }, () => {
            if (yaxisEquUnit == 1) {
                // document.getElementById("equivalencyUnitDiv").style.display = "block";
                this.getEquivalencyUnitData();

            } else {
                // document.getElementById("equivalencyUnitDiv").style.display = "none";
                this.getPlanningUnitForecastingUnit();
                this.filterData();
            }
        })
    }

    setViewById(e) {
        console.log("e.targetvakue+++", e.target.value)
        var viewById = e.target.value;
        this.setState({
            viewById: viewById,
            planningUnitId: "",
            forecastingUnitId: '',
            consumptionData: [],
            monthArrayList: [],
            errorValues: [],
            regionListFiltered: [],
        }, () => {
            if (viewById == 2) {
                document.getElementById("forecastingUnitDiv").style.display = "block";
                document.getElementById("planningUnitDiv").style.display = "none";
                this.filterData();
            } else {
                document.getElementById("planningUnitDiv").style.display = "block";
                document.getElementById("forecastingUnitDiv").style.display = "none";
                this.filterData();
            }
        })
    }

    calculateAverage = (value) => {
        console.log("calculateAverage-------->0", value);
        if (value.length > 0) {
            let localValue = value;

            localValue = localValue.filter(v1 => '' + v1 != ' ');

            localValue.forEach((el, i, arr) => {
                arr[i] = el.toString().replace(/%/g, "").trim();
            });

            localValue = localValue.map(Number);

            localValue = localValue.filter(value => !Number.isNaN(value));

            const sum = localValue.reduce((a, b) => a + b, 0);
            const avg = (sum / localValue.length) || 0;
            return avg.toFixed(1);
        }
    }

    render() {

        var chartOptions = {
            title: {
                display: true,
                text: this.state.planningUnitLabel != "" && this.state.planningUnitLabel != undefined && this.state.planningUnitLabel != null ? "Forecast Error" + " - " + this.state.planningUnitLabel : "Forecast Error"
            },
            scales: {
                yAxes: [{
                    id: 'A',
                    scaleLabel: {
                        display: true,
                        // labelString: "Forecast Error",
                        labelString: "Units",
                        fontColor: 'black'
                    },
                    stacked: false,
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
                },
                {
                    id: 'B',
                    scaleLabel: {
                        display: true,
                        labelString: "Forecast Error",
                        // labelString: "Units",
                        fontColor: 'black'
                    },
                    stacked: false,
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    },
                    position: 'right',
                }
                ],
                xAxes: [{
                    ticks: {
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItems, data) {
                        if (tooltipItems.datasetIndex == 0) {
                            var details = this.state.expiredStockArr[tooltipItems.index].details;
                            var infoToShow = [];
                            details.map(c => {
                                infoToShow.push(c.batchNo + " - " + c.expiredQty.toLocaleString());
                            });
                            return (infoToShow.join(' | '));
                        } else {
                            return (tooltipItems.yLabel.toLocaleString());
                        }
                    }.bind(this)
                },
                enabled: false,
                intersect: false,
                custom: CustomTooltips
            },
            maintainAspectRatio: false
            ,
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
        var consumptionData = this.state.consumptionData;
        var actualConsumption = [];
        var forecastedConsumption = [];
        this.state.monthArrayList.map((item) => {
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += c.consumptionQty });
            actualConsumption.push(sum);
            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
            var sum = 0;
            cd.map(c => { sum += c.consumptionQty });
            forecastedConsumption.push(sum);
        })
        if (this.state.consumptionData.length > 0)
            bar = {

                labels: [...new Set(this.state.monthArrayList.map(ele => (moment(ele).format(DATE_FORMAT_CAP_WITHOUT_DATE))))],
                datasets: [
                    {
                        label: i18n.t('static.consumption.forcast'),
                        stack: 1,
                        yAxisID: 'B',
                        backgroundColor: '#8064a2',
                        borderColor: '#8064a2',
                        pointBackgroundColor: '#8064a2',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#8064a2',
                        data: forecastedConsumption,
                        barPercentage: 0.5
                    },
                    {
                        label: i18n.t('static.consumption.actual'),
                        stack: 3,
                        yAxisID: 'B',
                        backgroundColor: '#a6a6a6',
                        borderColor: '#a6a6a6',
                        pointBackgroundColor: '#a6a6a6',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#a6a6a6',
                        data: actualConsumption,
                        barPercentage: 0.5
                    }, {
                        label: "Error",
                        type: 'line',
                        stack: 4,
                        yAxisID: 'A',
                        backgroundColor: 'transparent',
                        borderColor: 'orange',
                        borderStyle: 'dotted',
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0,
                        pointStyle: 'line',
                        pointRadius: 0,
                        showInLegend: true,
                        // data: [39, 66, 48, 32, 30, 37, 32, 28, "", "", "", "", ""]
                        // data: this.state.errorValues.slice(1).map(function (item) { return item == "NA" ? "" : item; }).map(function (item) { return item.toString().includes("%") ? parseInt(item.toString().replace("%", "")) : item; })
                        data: (this.state.errorValues.slice(1).filter(c => c != "NA")).length > 0 ? this.state.errorValues.slice(1).map(function (item) { return item == "NA" ? "" : item; }).map(function (item) { return item.toString().includes("%") ? parseInt(item.toString().replace("%", "")) : item; }) : []
                    }
                ]

            };

        const { planningUnits } = this.state;

        const { forecastingUnits } = this.state;

        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);

        const { equivalencyUnitList } = this.state;
        let equivalencyUnitList1 = equivalencyUnitList.length > 0
            && equivalencyUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.equivalencyUnitId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId}
                    </option>
                )
            }, this);

        const { regions } = this.state;
        let regionList = regions.length > 0
            && regions.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.regionId })

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

        let t1 = [];
        let t2 = [];
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
                            this.state.consumptionData.length > 0 &&
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.timeWindow')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="timeWindowId"
                                                            id="timeWindowId"
                                                            bsSize="sm"
                                                            onChange={this.filterData}
                                                        >
                                                            <option value="6">6 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="3">3 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="9">9 {i18n.t('static.dashboard.months')}</option>
                                                            <option value="12">12 {i18n.t('static.dashboard.months')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Y-axis in equivelency unit</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="yaxisEquUnit"
                                                            id="yaxisEquUnit"
                                                            bsSize="sm"
                                                            value={this.state.yaxisEquUnit}
                                                            onChange={(e) => { this.yAxisChange(e); }}
                                                        // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="-1">{i18n.t('static.program.no')}</option>
                                                            {equivalencyUnitList1}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="viewById"
                                                            id="viewById"
                                                            bsSize="sm"
                                                            // value={this.state.viewById}
                                                            onChange={this.setViewById}
                                                        >
                                                            <option value="1">{i18n.t('static.report.planningUnit')}</option>
                                                            <option value="2">{i18n.t('static.dashboard.forecastingunit')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3" id="forecastingUnitDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.product.unit1')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="foreccastingUnitId"
                                                            id="forecastingUnitId"
                                                            value={this.state.forecastingUnitId}
                                                            // onChange={this.setForecastingUnit}
                                                            onChange={(e) => { this.setForecastingUnit(e); }}
                                                            bsSize="sm"
                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {forecastingUnits.length > 0
                                                                && forecastingUnits.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.id}>
                                                                            {item.label.label_en + ' | ' + item.id}
                                                                        </option>
                                                                    )
                                                                }, this)}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>


                                            <FormGroup className="col-md-3" id="planningUnitDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="planningUnitId"
                                                            id="planningUnitId"
                                                            bsSize="sm"
                                                            onChange={this.filterData}
                                                            value={this.state.planningUnitId}
                                                            // onChange={this.setPlanningUnit}
                                                            onChange={(e) => { this.setPlanningUnit(e); }}
                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {planningUnits.length > 0
                                                                && planningUnits.map((item, i) => {
                                                                    return (
                                                                        <option key={i} value={item.id}>
                                                                            {item.label.label_en + ' | ' + item.id}
                                                                        </option>
                                                                    )
                                                                }, this)}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.region')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls ">
                                                    {/* <InputGroup className="box"> */}
                                                    <MultiSelect
                                                        name="regionId"
                                                        id="regionId"
                                                        options={regionList && regionList.length > 0 ? regionList : []}
                                                        value={this.state.regionValues}
                                                        onChange={(e) => { this.setRegionVal(e) }}
                                                        // onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                        labelledBy={i18n.t('static.common.select')}
                                                    />

                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Show consumption adjusted for stock out</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="consumptionAdjusted"
                                                            id="consumptionAdjusted"
                                                            bsSize="sm"
                                                            value={this.state.consumptionAdjusted}
                                                            onChange={(e) => { this.consumptionAdjusted(e); }}
                                                        // onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="1">{i18n.t('static.program.yes')}</option>
                                                            <option value="2">{i18n.t('static.program.no')}</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>

                                <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div className="row">
                                        {this.state.consumptionData.length > 0
                                            &&
                                            <div className="col-md-12 p-0">
                                                <div className="col-md-12">
                                                    <div className="chart-wrapper chart-graph-report pl-5 ml-3" style={{ marginLeft: '50px' }}>
                                                        <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                                        <div>

                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                                        {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                                    </button>

                                                </div>
                                            </div>}




                                    </div>



                                    <div className="row">
                                        <div className="col-md-12 pl-0 pr-0">
                                            {this.state.show &&
                                                <div className="table-scroll">
                                                    <div className="table-wrap table-responsive">
                                                        {this.state.consumptionData.length > 0 &&
                                                            <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options}>
                                                                <thead>
                                                                    <tr>
                                                                        <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th>
                                                                        <th className="forecastErrorTdWidth sticky-col first-col clone"></th>
                                                                        <th className="">Average</th>
                                                                        {this.state.monthArrayList.map(item => (
                                                                            <th>{moment(item).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                        <td align="left" className="sticky-col first-col clone" style={{ color: '#8064a2' }}><b>Error*</b></td>
                                                                        <td>{this.calculateAverage(this.state.errorValues)} %</td>
                                                                        {this.state.errorValues.map((item, index) => {
                                                                            return (index == 0 ? '' : <td>{item}</td>)
                                                                        })}
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionTotalForecast()}>
                                                                            {this.state.showTotalForecast ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                        </td>
                                                                        <td align="left" className="sticky-col first-col clone" style={{ color: "#4f81bd" }}><b>{i18n.t('static.consumption.forcast')}</b></td>

                                                                        {this.state.monthArrayList.map(item => {
                                                                            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                            var sum = 0;
                                                                            cd.map(c => { sum += parseInt(c.consumptionQty) });
                                                                            t1.push(sum)
                                                                        })}
                                                                        <td align="center">{this.calculateAverage(t1)}</td>
                                                                        {this.state.monthArrayList.map(item => {
                                                                            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                            var sum = 0;
                                                                            cd.map(c => { sum += parseInt(c.consumptionQty) });
                                                                            return (<td><b>{sum}</b></td>)
                                                                        })}
                                                                    </tr>
                                                                    {this.state.regionListFiltered.map(item1 => (
                                                                        <tr className="totalForecast">
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td align="left" className="sticky-col first-col clone" style={{ color: "#4f81bd" }}><b>{item1.label}</b></td>
                                                                            {/* <td align="center">9.5</td> */}
                                                                            {/* {t1.splice(0, t1.length)} */}

                                                                            {this.state.monthArrayList.map((item, index) => {
                                                                                t1.splice(0, t1.length)
                                                                                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                                                                                t2.push(cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA")
                                                                            })}
                                                                            <td align="center">{this.calculateAverage(t2)}</td>
                                                                            {this.state.monthArrayList.map(item => {
                                                                                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                                                                                return (<td>{cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA"}</td>)
                                                                            })}
                                                                        </tr>
                                                                    ))}
                                                                    <tr>
                                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionTotalActual()}>
                                                                            {this.state.showTotalActual ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                        </td>
                                                                        <td align="left" className="sticky-col first-col clone" style={{ color: "#a6a6a6" }}><b>{i18n.t('static.consumption.actual')}</b></td>
                                                                        {/* {t1.splice(0, t1.length)} */}
                                                                        {this.state.monthArrayList.map(item => {
                                                                            t2.splice(0, t2.length)
                                                                            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                            var sum = 0;
                                                                            cd.map(c => { sum += parseInt(c.consumptionQty) });
                                                                            t1.push(cd.length > 0 ? sum : "NA")
                                                                        })}
                                                                        <td align="center">{this.calculateAverage(t1)}</td>
                                                                        {/* <td align="center"></td> */}
                                                                        {this.state.monthArrayList.map(item => {
                                                                            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                            var sum = 0;
                                                                            cd.map(c => { sum += parseInt(c.consumptionQty) });
                                                                            return (<td><b>{cd.length > 0 ? sum : "NA"}</b></td>)
                                                                        })}
                                                                    </tr>
                                                                    {this.state.regionListFiltered.map(item1 => (
                                                                        <tr className="totalActual">
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td align="left" className="sticky-col first-col clone" style={{ color: "#a6a6a6" }}><b>{item1.label}</b></td>
                                                                            {this.state.monthArrayList.map(item => {
                                                                                t1.splice(0, t1.length)
                                                                                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                                                                                t2.push(cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA")
                                                                            })}
                                                                            <td align="center">{this.calculateAverage(t2)}</td>
                                                                            {/* <td align="center"></td> */}
                                                                            {this.state.monthArrayList.map(item => {
                                                                                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                                                                                return (<td>{cd.length > 0 ? parseInt(cd[0].consumptionQty) : "NA"}</td>)
                                                                            })}
                                                                        </tr>
                                                                    ))}
                                                                    <tr>
                                                                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordionTotalDiffernce()}>
                                                                            {this.state.showTotalDifference ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                                                        </td>
                                                                        <td align="left" className="sticky-col first-col clone"><b>Difference</b></td>
                                                                        {this.state.monthArrayList.map(item => {
                                                                            t2.splice(0, t2.length)
                                                                            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                            var sum = 0;
                                                                            cd.map(c => { sum += parseInt(c.consumptionQty) });
                                                                            var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                            var sum1 = 0;
                                                                            cd1.map(c => { sum1 += parseInt(c.consumptionQty) });
                                                                            t1.push(sum1 > 0 ? sum1 - sum : "NA")
                                                                        })}
                                                                        <td align="center"><b>{this.calculateAverage(t1)}</b></td>
                                                                        {/* <td align="center"></td> */}
                                                                        {this.state.monthArrayList.map(item => {
                                                                            var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                            var sum = 0;
                                                                            cd.map(c => { sum += parseInt(c.consumptionQty) });
                                                                            var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && this.state.regionIdArr.includes(c.region.regionId));
                                                                            var sum1 = 0;
                                                                            cd1.map(c => { sum1 += parseInt(c.consumptionQty) });
                                                                            return (<td><b>{sum1 > 0 ? sum1 - sum : "NA"}</b></td>)
                                                                        })}
                                                                    </tr>
                                                                    {this.state.regionListFiltered.map(item1 => (
                                                                        <tr className="totalDifference">
                                                                            <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                                                                            <td align="left" className="sticky-col first-col clone"><b>{item1.label}</b></td>
                                                                            {this.state.monthArrayList.map(item => {
                                                                                t1.splice(0, t1.length)
                                                                                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                                                                                var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                                                                                t2.push((cd.length > 0 && cd1.length > 0) ? parseInt(cd[0].consumptionQty) - parseInt(cd1[0].consumptionQty) : "NA")
                                                                            })}

                                                                            <td align="center">{this.calculateAverage(t2)}</td>
                                                                            {/* <td align="center"></td> */}
                                                                            {this.state.monthArrayList.map(item => {
                                                                                var cd = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && c.actualFlag && c.region.regionId == item1.value);
                                                                                var cd1 = this.state.consumptionData.filter(c => moment(c.consumptionDate).format("YYYY-MM-DD") == moment(item).format("YYYY-MM-DD") && !c.actualFlag && c.region.regionId == item1.value);
                                                                                return (<td>{(cd.length > 0 && cd1.length > 0) ? parseInt(cd[0].consumptionQty) - parseInt(cd1[0].consumptionQty) : "NA"}</td>)
                                                                            })}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>

                                                            </Table>
                                                        }
                                                    </div>
                                                </div>}
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

export default ConsumptionForecastError;