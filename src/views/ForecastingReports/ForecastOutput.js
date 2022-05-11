import React, { Component, lazy } from 'react';
import { Bar } from 'react-chartjs-2';
import { MultiSelect } from "react-multi-select-component";
import {
    Card,
    CardBody,
    Col,
    Table, FormGroup, Input, InputGroup, PopoverBody, Popover, Label,ModalHeader, ModalBody,Modal, Form
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import RealmService from '../../api/RealmService';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import ProductService from '../../api/ProductService';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import ProgramService from '../../api/ProgramService';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling, DATE_FORMAT_CAP_WITHOUT_DATE, TITLE_FONT, DATE_FORMAT_CAP } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import NumberFormat from 'react-number-format';
import EquivalancyUnitService from "../../api/EquivalancyUnitService";
import ReportService from '../../api/ReportService';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}


class ForecastOutput extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
            popoverOpen: false,
            popoverOpen1: false,
            programs: [],
            versions: [],
            show: false,
            message: '',
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: false,
            programId: '',
            versionId: -1,
            viewById: 1,
            monthArrayList: [],
            yaxisEquUnit: -1,
            xaxis: 2,
            consumptionData: [],
            forecastPeriod: '',
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            forecastingUnits: [],
            forecastingUnitValues: [],
            forecastingUnitLabels: [],
            downloadedProgramData: [],
            equivalencyUnitList: [],
            programEquivalencyUnitList: [],
            equivalencyUnitLabel: '',
            calculateEquivalencyUnitTotal: [],
            lang: localStorage.getItem('lang'),
            allProgramList: [],
            filteredProgramEQList: [],
            graphConsumptionData: [],
            // consumptionDataAll: [
            //     { planningUnit: { id: 1, label: "abacavir-lamivudine 600+300mg/Tablet Tablet (PO), bottle of 30" }, scenario: { id: 3, label: "C. Consumption Low" }, display: true, color: "#ba0c2f", consumptionList: [{ consumptionDate: "2021-01-01", consumptionQty: 36577 }, { consumptionDate: "2021-02-01", consumptionQty: 36805 }, { consumptionDate: "2021-03-01", consumptionQty: 37039 }, { consumptionDate: "2021-04-01", consumptionQty: 37273 }, { consumptionDate: "2021-05-01", consumptionQty: 37507 }, { consumptionDate: "2021-06-01", consumptionQty: 37741 }, { consumptionDate: "2021-07-01", consumptionQty: 37982 }, { consumptionDate: "2021-08-01", consumptionQty: 38223 }, { consumptionDate: "2021-09-01", consumptionQty: 38464 }, { consumptionDate: "2021-10-01", consumptionQty: 38705 }, { consumptionDate: "2021-11-01", consumptionQty: 38953 }, { consumptionDate: "2021-12-01", consumptionQty: 39200 }] },
            //     { planningUnit: { id: 2, label: "dolutegravir-lamivudine-tenofovir 50+300+300mg/Tablet Tablet (PO) - bottle of 30" }, scenario: { id: 1, label: "A. Consumption High" }, color: "#0067b9", display: true, consumptionList: [{ consumptionDate: "2021-01-01", consumptionQty: 29927 }, { consumptionDate: "2021-02-01", consumptionQty: 30113 }, { consumptionDate: "2021-03-01", consumptionQty: 30305 }, { consumptionDate: "2021-04-01", consumptionQty: 30496 }, { consumptionDate: "2021-05-01", consumptionQty: 30688 }, { consumptionDate: "2021-06-01", consumptionQty: 30879 }, { consumptionDate: "2021-07-01", consumptionQty: 31077 }, { consumptionDate: "2021-08-01", consumptionQty: 31274 }, { consumptionDate: "2021-09-01", consumptionQty: 31471 }, { consumptionDate: "2021-10-01", consumptionQty: 31668 }, { consumptionDate: "2021-11-01", consumptionQty: 31870 }, { consumptionDate: "2021-12-01", consumptionQty: 32073 }] },
            //     { planningUnit: { id: 3, label: "dolutegravir-lamivudine-tenofovir 50+300+300mg/Tablet Tablet (PO) - bottle of 90" }, scenario: { id: 3, label: "C. Consumption Low" }, color: "#118b70", display: true, consumptionList: [{ consumptionDate: "2021-01-01", consumptionQty: 32920 }, { consumptionDate: "2021-02-01", consumptionQty: 33124 }, { consumptionDate: "2021-03-01", consumptionQty: 33336 }, { consumptionDate: "2021-04-01", consumptionQty: 33546 }, { consumptionDate: "2021-05-01", consumptionQty: 33757 }, { consumptionDate: "2021-06-01", consumptionQty: 33967 }, { consumptionDate: "2021-07-01", consumptionQty: 34185 }, { consumptionDate: "2021-08-01", consumptionQty: 34401 }, { consumptionDate: "2021-09-01", consumptionQty: 34618 }, { consumptionDate: "2021-10-01", consumptionQty: 34835 }, { consumptionDate: "2021-11-01", consumptionQty: 35057 }, { consumptionDate: "2021-12-01", consumptionQty: 35280 }] }
            // ],


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
        this.yAxisChange = this.yAxisChange.bind(this);
        this.xAxisChange = this.xAxisChange.bind(this);
        this.getEquivalencyUnitData = this.getEquivalencyUnitData.bind(this);
        this.calculateEquivalencyUnitTotal = this.calculateEquivalencyUnitTotal.bind(this);
        this.backToCompareAndSelect = this.backToCompareAndSelect.bind(this);
        this.continueToForecastSummary = this.continueToForecastSummary.bind(this);
        this.toggleEu = this.toggleEu.bind(this);
        this.toggleRv = this.toggleRv.bind(this);
        this.setForecastPeriod = this.setForecastPeriod.bind(this);
        this.addGraphConsumptionData = this.addGraphConsumptionData.bind(this);
        this.addGraphId = this.addGraphId.bind(this);
    }

    backToCompareAndSelect() {
        this.props.history.push(`/report/compareAndSelectScenario`)
    }

    continueToForecastSummary() {
        this.props.history.push(`/forecastReport/forecastSummary`)
    }

    calculateEquivalencyUnitTotal() {
        let consumptionData = this.state.consumptionData;
        // console.log("consumptionList---------->1", consumptionData);
        let consumptionList = consumptionData.filter(c => c.display == true).map(v => v.consumptionList);
        let monthDataList = [];
        // console.log("consumptionList---------->2", consumptionList);
        for (var i = 0; i < consumptionList.length; i++) {
            // console.log("consumptionList---------->2.1", consumptionList[i]);
            monthDataList = monthDataList.concat(consumptionList[i]);
        }
        console.log("consumptionData------------------->500", monthDataList);
        // logic for add same date data
        let resultTrue = Object.values(monthDataList.reduce((a, { consumptionDate, consumptionQty }) => {
            if (!a[consumptionDate])
                a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
            else
                // a[consumptionDate].consumptionQty += consumptionQty;
                // a[consumptionDate].consumptionQty = parseFloat(a[consumptionDate].consumptionQty) + parseFloat(consumptionQty);
                a[consumptionDate].consumptionQty = parseInt(a[consumptionDate].consumptionQty) + parseInt(consumptionQty);
            return a;
        }, {}));

        let result1 = resultTrue.map(m => {
            return {
                consumptionDate: m.consumptionDate,
                // consumptionQty: parseFloat(m.consumptionQty).toFixed(2)
                consumptionQty: parseInt(m.consumptionQty)
            }
        });

        // console.log("consumptionList---------->4", resultTrue);



        if (this.state.xaxis == 2) {//no
            this.setState({
                calculateEquivalencyUnitTotal: result1
            }, () => {

            })
        } else {//yes
            // let consumptionData = resultTrue;

            // let tempConsumptionListData = consumptionData[i].consumptionList.map(m => {
            //     return {
            //         consumptionDate: moment(m.consumptionDate).format("YYYY"),
            //         consumptionQty: m.consumptionQty
            //     }
            // });
            let tempConsumptionListData = resultTrue;
            console.log("consumptionData------------------->501", tempConsumptionListData);
            //logic for add same date data                            
            let resultTrue1 = Object.values(tempConsumptionListData.reduce((a, { consumptionDate, consumptionQty }) => {
                if (!a[consumptionDate])
                    a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                else
                    // a[consumptionDate].consumptionQty += consumptionQty;
                    // a[consumptionDate].consumptionQty = parseFloat(a[consumptionDate].consumptionQty) + parseFloat(consumptionQty);
                    a[consumptionDate].consumptionQty = parseInt(a[consumptionDate].consumptionQty) + parseInt(consumptionQty);
                return a;
            }, {}));
            console.log("consumptionData------------------->502", resultTrue1);
            let result = resultTrue1.map(m => {
                return {
                    consumptionDate: m.consumptionDate,
                    // consumptionQty: parseFloat(m.consumptionQty).toFixed(2)
                    consumptionQty: parseInt(m.consumptionQty)
                }
            });
            console.log("consumptionData------------------->503", result);
            this.setState({
                calculateEquivalencyUnitTotal: result
            }, () => {

            })


        }



    }

    planningUnitCheckedChanged(id, regionId) {
        var consumptionData = this.state.consumptionData;
        var index = this.state.consumptionData.findIndex(c => c.objUnit.id == id && c.region.regionId == regionId);
        consumptionData[index].display = !consumptionData[index].display;
        this.setState({
            consumptionData
        }, () => {
            this.addGraphConsumptionData();
            this.addGraphId();
            this.calculateEquivalencyUnitTotal();
        })
    }

    getEquivalencyUnitData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
            // planningUnits: [],
            // planningUnitValues: [],
            // planningUnitLabels: [],

            // forecastingUnits: [],
            // forecastingUnitValues: [],
            // forecastingUnitLabels: [],
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

                            let fuList = this.state.forecastingUnits;
                            let newList = [];
                            for (var i = 0; i < filteredEquList.length; i++) {
                                let temp = fuList.filter(c => c.id == filteredEquList[i].forecastingUnit.id);
                                if (temp.length > 0) {
                                    newList.push(filteredEquList[i]);
                                }
                            }

                            filteredEquList = newList;

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

                            let fuList = this.state.forecastingUnits;
                            let newList = [];
                            for (var i = 0; i < filteredEquList.length; i++) {
                                let temp = fuList.filter(c => c.id == filteredEquList[i].forecastingUnit.id);
                                if (temp.length > 0) {
                                    newList.push(filteredEquList[i]);
                                }
                            }

                            filteredEquList = newList;

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

    yAxisChange(e) {
        var yaxisEquUnit = e.target.value;
        console.log("e.target.value+++", e.target.value)
        this.setState({
            yaxisEquUnit: yaxisEquUnit,
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            foreastingUnits: [],
            foreastingUnitValues: [],
            foreastingUnitLabels: [],
            consumptionData: [],
            graphConsumptionData: [],
            monthArrayList: [],
            calculateEquivalencyUnitTotal: [],
        }, () => {
            if (yaxisEquUnit > 0) {//Yes
                // document.getElementById("equivalencyUnitDiv").style.display = "block";
                // this.getEquivalencyUnitData();
                this.getPlanningUnitForecastingUnit();

            } else {//NO
                // document.getElementById("equivalencyUnitDiv").style.display = "none";
                this.getPlanningUnitForecastingUnit();
                this.filterData();
            }
        })
    }

    xAxisChange(e) {
        var xaxisEquUnit = e.target.value;
        console.log("e.target.value+++", e.target.value)
        this.setState({
            xaxis: xaxisEquUnit
        }, () => {
            this.filterData();
        })
    }


    setForecastingUnit = (event) => {
        console.log('***', event)
        var forecastingUnitIds = event
        forecastingUnitIds = forecastingUnitIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            forecastingUnitValues: forecastingUnitIds.map(ele => ele),
            forecastingUnitLabels: forecastingUnitIds.map(ele => ele.label)
        }, () => {

            this.filterData()
        })
    }


    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        // csvRow.push('"' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        // csvRow.push('"' + (i18n.t('static.program.program') + ': ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        // csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ': ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ': ' + this.state.forecastPeriod).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ': ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.forecastReport.yAxisInEquivalencyUnit') + ': ' + document.getElementById("yaxisEquUnit").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.display') + ': ' + document.getElementById("viewById").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        // if (document.getElementById("viewById").value == 1) {//planning unit
        //     this.state.planningUnitLabels.map(ele =>
        //         csvRow.push('"' + (i18n.t('static.report.planningUnit') + ': ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        // } else {//forecasting unit
        //     this.state.forecastingUnitLabels.map(ele =>
        //         csvRow.push('"' + (i18n.t('static.product.unit1') + ': ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        // }
        // csvRow.push('')
        csvRow.push('"' + (i18n.t('static.forecastReport.xAxisAggregateByYear') + ': ' + document.getElementById("xaxis").selectedOptions[0].text).replaceAll(' ', '%20') + '"')

        // csvRow.push('')
        csvRow.push('')

        const headers = [];
        // columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        // headers.push(i18n.t('static.importFromQATSupplyPlan.supplyPlanPlanningUnit'));

        // headers.push('Display');
        (this.state.viewById == 1 ? headers.push((i18n.t('static.product.product')).replaceAll(' ', '%20')) : headers.push((i18n.t('static.forecastingunit.forecastingunit')).replaceAll(' ', '%20')));
        headers.push(i18n.t('static.consumption.forcast'));
        {
            this.state.xaxis == 2 && this.state.monthArrayList.map(item => (
                headers.push(moment(item).format(DATE_FORMAT_CAP_WITHOUT_DATE))
            ))
        }
        {
            this.state.xaxis == 1 && this.state.monthArrayList.map(item => (
                headers.push(moment(item).format("YYYY"))
            ))
        }

        var A = [this.addDoubleQuoteToRowContent(headers)]

        // this.state.buildCSVTable.map(ele => 
        //     A.push(this.addDoubleQuoteToRowContent([ ((ele.supplyPlanPlanningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20'), 
        //     ((ele.forecastPlanningUnit).replaceAll(',', ' ')).replaceAll(' ', '%20'), 
        //     ele.region, this.dateFormatter(ele.month).replaceAll(' ', '%20'), 
        //     ele.supplyPlanConsumption, 
        //     ele.multiplier, 
        //     ele.convertedConsumption, 
        //     ele.currentQATConsumption, 
        //     ele.import == true ? 'Yes' : 'No' ])));


        this.state.xaxis == 2 && this.state.consumptionData.map(ele => {
            let propertyName = this.state.monthArrayList.map(item1 => (
                ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? ((ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty) == 'NAN' || Number.isNaN((ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty)) ? '' : (ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty)) : ''
            ));

            return (A.push(this.addDoubleQuoteToRowContent([
                ((getLabelText(ele.objUnit.label, this.state.lang)).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                ((ele.scenario.label).replaceAll(',', ' ')).replaceAll(' ', '%20'),
            ].concat(propertyName))))
        }
        );


        if (this.state.yaxisEquUnit > 0 && this.state.xaxis == 2) {
            let propertyName = this.state.monthArrayList.map(item1 => (
                this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty : ''
            ));
            A.push(this.addDoubleQuoteToRowContent([
                ((i18n.t('static.supplyPlan.total') + this.state.equivalencyUnitLabel).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                '',
            ].concat(propertyName)));
        }




        this.state.xaxis == 1 && this.state.consumptionData.map(ele => {
            let propertyName = this.state.monthArrayList.map(item1 => (
                ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY")).length > 0 ? ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY"))[0].consumptionQty : ''
            ));

            return (
                A.push(this.addDoubleQuoteToRowContent([
                    ((getLabelText(ele.objUnit.label, this.state.lang)).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                    ((ele.scenario.label).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                ].concat(propertyName)))
            )
        }
        );

        if (this.state.yaxisEquUnit > 0 && this.state.xaxis == 1) {
            let propertyName = this.state.monthArrayList.map(item1 => (
                this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY")).length > 0 ? this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY"))[0].consumptionQty : ''
            ));
            A.push(this.addDoubleQuoteToRowContent([
                ((i18n.t('static.supplyPlan.total') + this.state.equivalencyUnitLabel).replaceAll(',', ' ')).replaceAll(' ', '%20'),
                '',
            ].concat(propertyName)));

        }



        for (var i = 0; i < A.length; i++) {
            // console.log(A[i])
            csvRow.push(A[i].join(","))
        }

        var csvString = csvRow.join("%0A")
        // console.log('csvString' + csvString)
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.dashboard.monthlyForecast') + ".csv"
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
                doc.setFont('helvetica', 'bold')
                doc.text(i18n.t('static.supplyPlan.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`), doc.internal.pageSize.width - 40, 20, {
                    align: 'right'
                })
                doc.setFont('helvetica', 'normal')
                doc.text(i18n.t('static.supplyPlan.runTime') + " " + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width - 40, 30, {
                    align: 'right'
                })
                doc.text(i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername(), doc.internal.pageSize.width - 40, 40, {
                    align: 'right'
                })
                doc.text(this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text), doc.internal.pageSize.width - 40, 50, {
                    align: 'right'
                })
                // doc.text(document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width - 40, 60, {
                //     align: 'right'
                // })
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.monthlyForecast'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    // doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                    //     align: 'left'
                    // })
                    // doc.text(i18n.t('static.report.version*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 120, {
                    //     align: 'left'
                    // })
                    doc.setFont('helvetica', 'bold')
                    doc.text(i18n.t('static.common.forecastPeriod') + ': ' + this.state.forecastPeriod, doc.internal.pageSize.width / 8, 100, {
                        align: 'left'
                    })
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.dateRange') + ': ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.forecastReport.yAxisInEquivalencyUnit') + ': ' + document.getElementById("yaxisEquUnit").selectedOptions[0].text, doc.internal.pageSize.width / 8, 120, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.common.display') + ': ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    // let startY1 = 0;
                    // if (document.getElementById("viewById").value == 1) {
                    //     var planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    //     doc.text(doc.internal.pageSize.width / 8, 230, planningText)
                    //     startY1 = 230 + (doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4).length * 10)
                    // } else {
                    //     var planningText = doc.splitTextToSize((i18n.t('static.product.unit1') + ' : ' + this.state.forecastingUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    //     doc.text(doc.internal.pageSize.width / 8, 230, planningText)
                    //     startY1 = 250 + (doc.splitTextToSize((i18n.t('static.product.unit1') + ' : ' + this.state.forecastingUnitLabels.join('; ')), doc.internal.pageSize.width * 3 / 4).length * 10)
                    // }
                    // doc.text(i18n.t('static.forecastReport.xAxisAggregateByYear') + ' : ' + document.getElementById("xaxis").selectedOptions[0].text, doc.internal.pageSize.width / 8, startY1, {
                    //     align: 'left'
                    // })

                    doc.text(i18n.t('static.forecastReport.xAxisAggregateByYear') + ': ' + document.getElementById("xaxis").selectedOptions[0].text, doc.internal.pageSize.width / 8, 140, {
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

        doc.addImage(canvasImg, 'png', 50, 170, 750, 260, 'CANVAS');

        //table start
        const headers = [];

        (this.state.viewById == 1 ? headers.push(i18n.t('static.product.product')) : headers.push(i18n.t('static.forecastingunit.forecastingunit')));
        headers.push(i18n.t('static.consumption.forcast'));
        {
            this.state.xaxis == 2 && this.state.monthArrayList.map(item => (
                headers.push(moment(item).format(DATE_FORMAT_CAP_WITHOUT_DATE))
            ))
        }
        {
            this.state.xaxis == 1 && this.state.monthArrayList.map(item => (
                headers.push(moment(item).format("YYYY"))
            ))
        }

        var header = [headers]
        var A = [];
        let data = []
        this.state.xaxis == 2 && this.state.consumptionData.map(ele => {
            let propertyName = this.state.monthArrayList.map(item1 => (
                // ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? (ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty) : ''
                ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? ((ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty) == 'NAN' || Number.isNaN((ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty)) ? '' : (ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")) : ''
            ));
            A = [];
            A.push(
                ((getLabelText(ele.objUnit.label, this.state.lang))),
                ((ele.scenario.label))
            )

            A = A.concat(propertyName)
            data.push(A);
            return A
        }
        );
        console.log("Test---------->", A);
        // data = [A];


        if (this.state.yaxisEquUnit > 0 && this.state.xaxis == 2) {
            A = [];
            let propertyName = this.state.monthArrayList.map(item1 => (
                this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? (this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : ''
            ));
            A.push(
                ((i18n.t('static.supplyPlan.total') + ' ' + this.state.equivalencyUnitLabel)),
                ''
            );
            A = A.concat(propertyName);
            data.push(A);
        }




        this.state.xaxis == 1 && this.state.consumptionData.map(ele => {
            let propertyName = this.state.monthArrayList.map(item1 => (
                ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY")).length > 0 ? (ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY"))[0].consumptionQty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : ''
            ));
            A = [];
            A.push(
                ((getLabelText(ele.objUnit.label, this.state.lang))),
                ((ele.scenario.label))
            )

            A = A.concat(propertyName)
            data.push(A);
            return A
        }
        );


        if (this.state.yaxisEquUnit > 0 && this.state.xaxis == 1) {
            A = [];
            let propertyName = this.state.monthArrayList.map(item1 => (
                this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY")).length > 0 ? (this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY"))[0].consumptionQty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : ''
            ));
            A.push(
                ((i18n.t('static.supplyPlan.total') + ' ' + this.state.equivalencyUnitLabel)),
                ''
            );
            A = A.concat(propertyName);
            data.push(A);

        }

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
        doc.save(this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.dashboard.monthlyForecast') + ".pdf")

    }
    addGraphId() {
        let consumptionData1 = this.state.consumptionData;
        if (consumptionData1.length > 0) {
            let planningUnitIdList = consumptionData1.map(c => c.objUnit.id);
            let uniquePlanningUnitIdList = [...new Set(planningUnitIdList)];

            console.log("consumptionData000000-------->", uniquePlanningUnitIdList);
            let tempConsumptionData = [];
            let count = 0;
            for (var i = 0; i < consumptionData1.length; i++) {
                let index = uniquePlanningUnitIdList.findIndex(c => c == consumptionData1[i].objUnit.id);
                index = index - count;
                console.log("consumptionData2222222-------->", index);
                // consumptionData1[i].graphId = index;                
                let jsonTemp = { objUnit: consumptionData1[i].objUnit, scenario: consumptionData1[i].scenario, display: consumptionData1[i].display, color: consumptionData1[i].color, consumptionList: consumptionData1[i].consumptionList, region: consumptionData1[i].region, graphId: (consumptionData1[i].display == false || consumptionData1[i].scenario.id == 0 ? -1 : index) }
                let q = (consumptionData1[i].display == false || consumptionData1[i].scenario.id == 0 ? count = count + 1 : '');
                tempConsumptionData.push(jsonTemp);
            }

            this.setState({
                consumptionData: tempConsumptionData
            }, () => {
                console.log("consumptionData111111-------->", this.state.consumptionData);
            });

        }
    }

    addGraphConsumptionData() {
        // alert("Hi");
        let consumptionData1 = this.state.consumptionData;
        consumptionData1 = consumptionData1.filter(c => c.display == true).filter(c => c.scenario.id != 0);
        if (consumptionData1.length > 0) {

            let planningUnitIdList = consumptionData1.map(c => c.objUnit.id);
            let uniquePlanningUnitIdList = [...new Set(planningUnitIdList)];
            let graphConsumptionData = [];

            for (var i = 0; i < uniquePlanningUnitIdList.length; i++) {
                let tempData = consumptionData1.filter(c => c.objUnit.id == uniquePlanningUnitIdList[i]);

                let localConsumptionList = [];
                for (var j = 0; j < tempData.length; j++) {
                    localConsumptionList = localConsumptionList.concat(tempData[j].consumptionList);
                }

                // logic for add same date data
                let resultTrue1 = Object.values(localConsumptionList.reduce((a, { consumptionDate, consumptionQty }) => {
                    if (!a[consumptionDate])
                        a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                    else
                        a[consumptionDate].consumptionQty += consumptionQty;
                    return a;
                }, {}));

                // let localObj = tempData[0];
                let jsonTemp = { objUnit: tempData[0].objUnit, scenario: tempData[0].scenario, display: tempData[0].display, color: tempData[0].color, consumptionList: resultTrue1, region: tempData[0].region, graphId: 0 }
                graphConsumptionData.push(jsonTemp);
            }

            this.setState({
                graphConsumptionData: graphConsumptionData
            }, () => {
                // console.log("graphConsumptionData--------->", this.state.graphConsumptionData);
            })


        }
    }

    filterData() {
        console.log("INSIDE FILTERDATA---------------------------------");
        let planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value).toString())
        let forecastingUnitIds = this.state.forecastingUnitValues.map(ele => (ele.value).toString())
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        let viewById = document.getElementById("viewById").value;
        let yaxisEquUnitId = document.getElementById("yaxisEquUnit").value;
        let xaxisId = document.getElementById("xaxis").value;
        console.log("versionId----------->filterData", versionId);

        if (versionId != 0 && programId > 0 && (viewById == 1 ? planningUnitIds.length > 0 : forecastingUnitIds.length > 0)) {
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
                        console.log("Version-------->", document.getElementById("versionId").value);
                        this.setState({
                            datasetList: datasetList,
                            datasetList1: datasetList1,
                            message: ''
                        }, () => {
                            localStorage.setItem("sesForecastProgramIdReport", parseInt(programId));
                            localStorage.setItem("sesForecastVersionIdReport", document.getElementById("versionId").value);
                            localStorage.setItem("sesDatasetId", parseInt(programId) + '_v' + (document.getElementById("versionId").value).replace('(Local)', '').trim() + '_uId_' + userId);

                            localStorage.setItem("sesLiveDatasetId", parseInt(programId));
                            localStorage.setItem("sesDatasetCompareVersionId", document.getElementById("versionId").value);
                            localStorage.setItem("sesDatasetVersionId", document.getElementById("versionId").value);

                            console.log("In datasetId@@@", localStorage.getItem("sesDatasetId"));

                            let filteredProgram = this.state.datasetList.filter(c => c.programId == programId && c.versionId == (versionId.split('(')[0]).trim())[0];

                            var monthArrayList = [];
                            let cursorDate = startDate;
                            for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(endDate).format("YYYY-MM"); i++) {
                                var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                                cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
                                monthArrayList.push(dt);
                            }

                            let consumptionData = [];

                            if (viewById == 1) {//planning unit id
                                console.log("Test------------>1", filteredProgram);
                                let planningUnitList = filteredProgram.planningUnitList;
                                let selectedPlanningUnit = this.state.planningUnitValues;
                                let treeList = filteredProgram.treeList;
                                let consumptionExtrapolation = filteredProgram.consumptionExtrapolation;

                                for (let i = 0; i < selectedPlanningUnit.length; i++) {
                                    let nodeDataMomList = [];
                                    console.log("-----------------------------------------------", selectedPlanningUnit[i].value + '----' + selectedPlanningUnit[i].label);
                                    let planningUniObj = planningUnitList.filter(c => c.planningUnit.id == selectedPlanningUnit[i].value)[0];
                                    let selectedForecastMap = planningUniObj.selectedForecastMap;
                                    console.log("Test------------>2", selectedForecastMap);




                                    let keys = Object.keys(selectedForecastMap);
                                    if (keys.length > 0) {

                                        for (let j = 0; j < keys.length; j++) {
                                            console.log("Test------------>3", keys[j]);
                                            if (selectedForecastMap[keys[j]] != undefined && selectedForecastMap[keys[j]] != null && selectedForecastMap[keys[j]] != '') {
                                                let selectedForecastMapObjIn = (selectedForecastMap[keys[j]]);
                                                let treeId = selectedForecastMapObjIn.treeId;
                                                let scenarioId = selectedForecastMapObjIn.scenarioId;
                                                let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;

                                                if (scenarioId != null) {//scenarioId
                                                    for (let m = 0; m < treeList.length; m++) {
                                                        let filteredScenario = (treeList[m].treeId == treeId ? treeList[m].scenarioList.filter(c => c.id == scenarioId) : []);
                                                        if (filteredScenario.length > 0) {
                                                            let flatlist = treeList[m].tree.flatList;
                                                            let listContainNodeType5 = flatlist.filter(c => c.payload.nodeType.id == 5);
                                                            console.log("Test------------>5", listContainNodeType5);


                                                            let myTempData = [];
                                                            for (let k = 0; k < listContainNodeType5.length; k++) {

                                                                let arrayOfNodeDataMap = (listContainNodeType5[k].payload.nodeDataMap[scenarioId]).filter(c => c.puNode.planningUnit.id == selectedPlanningUnit[i].value);
                                                                if (arrayOfNodeDataMap.length > 0) {
                                                                    nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;

                                                                    if (yaxisEquUnitId != -1) {//Yes
                                                                        let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUniObj.planningUnit.forecastingUnit.id)[0].convertToEu;

                                                                        let consumptionList = nodeDataMomList.map(m => {
                                                                            return {
                                                                                consumptionDate: m.month,
                                                                                consumptionQty: Math.round(m.calculatedMmdValue / convertToEu)
                                                                            }
                                                                        });
                                                                        myTempData = myTempData.concat(consumptionList);
                                                                    } else {

                                                                        let consumptionList = nodeDataMomList.map(m => {
                                                                            return {
                                                                                consumptionDate: m.month,
                                                                                consumptionQty: Math.round(m.calculatedMmdValue)
                                                                            }
                                                                        });
                                                                        myTempData = myTempData.concat(consumptionList);
                                                                    }
                                                                }


                                                            }
                                                            // logic for add same date data
                                                            let resultTrue = Object.values(myTempData.reduce((a, { consumptionDate, consumptionQty }) => {
                                                                if (!a[consumptionDate])
                                                                    a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                                                else
                                                                    a[consumptionDate].consumptionQty += consumptionQty;
                                                                return a;
                                                            }, {}));


                                                            if (resultTrue.length > 0) {
                                                                let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: resultTrue, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                console.log("Test------------>8.1EU", jsonTemp);
                                                                consumptionData.push(jsonTemp);
                                                            } else {
                                                                let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: [], region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                consumptionData.push(jsonTemp);
                                                            }



                                                            // let match = 0;
                                                            // for (let k = 0; k < listContainNodeType5.length; k++) {
                                                            //     let arrayOfNodeDataMap = (listContainNodeType5[k].payload.nodeDataMap[scenarioId]).filter(c => c.puNode.planningUnit.id == selectedPlanningUnit[i].value)
                                                            //     console.log("Test------------>7.1", arrayOfNodeDataMap);

                                                            //     if (arrayOfNodeDataMap.length > 0) {
                                                            //         console.log("Test------------>8", arrayOfNodeDataMap[0].nodeDataMomList);
                                                            //         nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;

                                                            //         if (yaxisEquUnitId != -1) {//Yes
                                                            //             let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUniObj.planningUnit.forecastingUnit.id)[0].convertToEu;
                                                            //             console.log("Test------------>8.1 EQ OBJ", this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUniObj.planningUnit.forecastingUnit.id));

                                                            //             let consumptionList = nodeDataMomList.map(m => {
                                                            //                 return {
                                                            //                     consumptionDate: m.month,
                                                            //                     // consumptionQty: (m.calculatedValue).toFixed(2)
                                                            //                     consumptionQty: Math.round(m.calculatedMmdValue / convertToEu)
                                                            //                 }
                                                            //             });
                                                            //             let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                            //             console.log("Test------------>8.1EU", jsonTemp);
                                                            //             consumptionData.push(jsonTemp);
                                                            //         } else {

                                                            //             let consumptionList = nodeDataMomList.map(m => {
                                                            //                 return {
                                                            //                     consumptionDate: m.month,
                                                            //                     // consumptionQty: (m.calculatedValue).toFixed(2)
                                                            //                     consumptionQty: Math.round(m.calculatedMmdValue)
                                                            //                 }
                                                            //             });
                                                            //             let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                            //             console.log("Test------------>8.1", jsonTemp);
                                                            //             consumptionData.push(jsonTemp);
                                                            //         }

                                                            //         match = 0;
                                                            //         break;
                                                            //     } else {
                                                            //         // let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: filteredScenario[0], display: true, color: "#ba0c2f", consumptionList: [] }
                                                            //         // consumptionData.push(jsonTemp);
                                                            //         match = 1;
                                                            //     }
                                                            // }

                                                            // if (match == 1) {
                                                            //     let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: [] }
                                                            //     consumptionData.push(jsonTemp);
                                                            // }

                                                        }
                                                    }
                                                } else if (consumptionExtrapolationId != null) {//consumptionExtrapolationId
                                                    // console.log("Test------------>ELSE");
                                                    let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                    if (consumptionExtrapolationObj.length > 0) {
                                                        console.log("Test------------>ELSE-1", consumptionExtrapolationObj);

                                                        if (yaxisEquUnitId != -1) {//Yes
                                                            let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUniObj.planningUnit.forecastingUnit.id)[0].convertToEu;

                                                            let consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                return {
                                                                    consumptionDate: m.month,
                                                                    // consumptionQty: m.amount
                                                                    // consumptionQty: parseInt(m.amount)
                                                                    consumptionQty: (m.amount == null ? 0 : Math.round(m.amount / convertToEu))
                                                                }
                                                            });
                                                            let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: consumptionExtrapolationObj[0].extrapolationMethod.id, label: '(' + consumptionExtrapolationObj[0].extrapolationMethod.label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                            consumptionData.push(jsonTemp);

                                                        } else {
                                                            let consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                return {
                                                                    consumptionDate: m.month,
                                                                    // consumptionQty: m.amount
                                                                    // consumptionQty: parseInt(m.amount)
                                                                    consumptionQty: (m.amount == null ? 0 : Math.round(m.amount))
                                                                }
                                                            });
                                                            let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: consumptionExtrapolationObj[0].extrapolationMethod.id, label: '(' + consumptionExtrapolationObj[0].extrapolationMethod.label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                            consumptionData.push(jsonTemp);
                                                        }


                                                    } else {
                                                        let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 1, label: "" }, display: true, color: "#ba0c2f", consumptionList: [], region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                        consumptionData.push(jsonTemp);
                                                    }
                                                } else {
                                                    let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 0, label: "No forecast selected" }, display: false, color: "#ba0c2f", consumptionList: [], region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                    consumptionData.push(jsonTemp);
                                                }
                                            }
                                        }

                                    } else {//no forecast selected
                                        let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 0, label: 'No forecast selected' }, display: false, color: "#ba0c2f", consumptionList: [], region: { label: { label_en: '' } }, graphId: 0 }
                                        console.log("Test------------>8.1EU", jsonTemp);
                                        consumptionData.push(jsonTemp);

                                    }




                                }
                            } else {//forecasting unit id
                                console.log("TestFU------------>1", filteredProgram);
                                let planningUnitList = filteredProgram.planningUnitList;
                                let selectedForecastingUnit = this.state.forecastingUnitValues;
                                let treeList = filteredProgram.treeList;
                                let consumptionExtrapolation = filteredProgram.consumptionExtrapolation;

                                for (let i = 0; i < selectedForecastingUnit.length; i++) {
                                    let nodeDataMomList = [];
                                    console.log("-----------------------------------------------", selectedForecastingUnit[i].value + '----' + selectedForecastingUnit[i].label);
                                    let forecastingUniObj = planningUnitList.filter(c => c.planningUnit.forecastingUnit.id == selectedForecastingUnit[i].value);


                                    for (let l = 0; l < forecastingUniObj.length; l++) {

                                        let selectedForecastMap = forecastingUniObj[l].selectedForecastMap;
                                        console.log("TestFU------------>2", selectedForecastMap);
                                        let keys = Object.keys(selectedForecastMap);
                                        if (keys.length > 0) {

                                            for (let j = 0; j < keys.length; j++) {
                                                console.log("TestFU------------>3", keys[j]);

                                                if (selectedForecastMap[keys[j]] != undefined && selectedForecastMap[keys[j]] != '' && selectedForecastMap[keys[j]] != null) {
                                                    let selectedForecastMapObjIn = (selectedForecastMap[keys[j]]);

                                                    let treeId = selectedForecastMapObjIn.treeId;
                                                    let scenarioId = selectedForecastMapObjIn.scenarioId;
                                                    let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;

                                                    if (scenarioId != null) {//scenarioId
                                                        // console.log("Test------------>IF");

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
                                                                    let arrayOfNodeDataMap = (listContainNodeType4[k].payload.nodeDataMap[scenarioId]).filter(c => c.fuNode.forecastingUnit.id == selectedForecastingUnit[i].value);

                                                                    if (arrayOfNodeDataMap.length > 0) {
                                                                        nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;
                                                                        if (yaxisEquUnitId != -1) {//Yes

                                                                            let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == selectedForecastingUnit[i].value)[0].convertToEu;

                                                                            let consumptionList = nodeDataMomList.map(m => {
                                                                                return {
                                                                                    consumptionDate: m.month,
                                                                                    consumptionQty: Math.round(m.calculatedValue / convertToEu)
                                                                                }
                                                                            });
                                                                            myTempData = myTempData.concat(consumptionList);
                                                                        } else {

                                                                            let consumptionList = nodeDataMomList.map(m => {
                                                                                return {
                                                                                    consumptionDate: m.month,
                                                                                    consumptionQty: Math.round(m.calculatedValue)
                                                                                }
                                                                            });
                                                                            myTempData = myTempData.concat(consumptionList);

                                                                        }
                                                                    }
                                                                }

                                                                // logic for add same date data
                                                                let resultTrue = Object.values(myTempData.reduce((a, { consumptionDate, consumptionQty }) => {
                                                                    if (!a[consumptionDate])
                                                                        a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                                                    else
                                                                        a[consumptionDate].consumptionQty += consumptionQty;
                                                                    return a;
                                                                }, {}));

                                                                console.log("Test------------>IMP FU", resultTrue);

                                                                // if (resultTrue.length > 0) {
                                                                //     let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: resultTrue, treeId: treeId, scenarioId: scenarioId, consumptionExtrapolationId: 0 }
                                                                //     consumptionData.push(jsonTemp);
                                                                // } else {
                                                                //     let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: [], treeId: treeId, scenarioId: scenarioId, consumptionExtrapolationId: 0 }
                                                                //     consumptionData.push(jsonTemp);
                                                                // }

                                                                if (resultTrue.length > 0) {
                                                                    let checkIdPresent = consumptionData.filter(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.treeId == treeId && c.scenarioId == scenarioId);
                                                                    if (checkIdPresent.length > 0) {
                                                                        let findIndex = consumptionData.findIndex(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.treeId == treeId && c.scenarioId == scenarioId);
                                                                        let alreadyPresentConsumptionList = consumptionData[findIndex].consumptionList.concat(resultTrue);

                                                                        // logic for add same date data
                                                                        let newAddedConsumptionList = Object.values(alreadyPresentConsumptionList.reduce((a, { consumptionDate, consumptionQty }) => {
                                                                            if (!a[consumptionDate])
                                                                                a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                                                            else
                                                                                a[consumptionDate].consumptionQty += consumptionQty;
                                                                            return a;
                                                                        }, {}));
                                                                        consumptionData[findIndex].consumptionList = newAddedConsumptionList;
                                                                        // let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: newAddedConsumptionList, treeId: treeId, scenarioId: scenarioId, consumptionExtrapolationId: 0 }
                                                                    } else {
                                                                        let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: resultTrue, treeId: treeId, scenarioId: scenarioId, consumptionExtrapolationId: 0, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                        consumptionData.push(jsonTemp);
                                                                    }
                                                                } else {
                                                                    let checkIdPresent = consumptionData.filter(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.treeId == treeId && c.scenarioId == scenarioId);
                                                                    if (checkIdPresent.length > 0) {

                                                                    } else {
                                                                        let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: [], treeId: treeId, scenarioId: scenarioId, consumptionExtrapolationId: 0, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                        consumptionData.push(jsonTemp);
                                                                    }
                                                                }






                                                                // let match = 0;
                                                                // for (let k = 0; k < listContainNodeType4.length; k++) {
                                                                //     let arrayOfNodeDataMap = (listContainNodeType4[k].payload.nodeDataMap[scenarioId]).filter(c => c.fuNode.forecastingUnit.id == selectedForecastingUnit[i].value)
                                                                //     console.log("TestFU------------>7.1", arrayOfNodeDataMap);

                                                                //     if (arrayOfNodeDataMap.length > 0) {
                                                                //         console.log("TestFU------------>8", arrayOfNodeDataMap[0].nodeDataMomList);
                                                                //         nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;

                                                                //         if (yaxisEquUnitId != -1) {//Yes

                                                                //             let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == selectedForecastingUnit[i].value)[0].convertToEu;

                                                                //             let consumptionList = nodeDataMomList.map(m => {
                                                                //                 return {
                                                                //                     consumptionDate: m.month,
                                                                //                     // consumptionQty: (m.calculatedValue * forecastingUniObj[l].planningUnit.multiplier).toFixed(2)
                                                                //                     // consumptionQty: parseInt(m.calculatedValue * forecastingUniObj[l].planningUnit.multiplier)
                                                                //                     consumptionQty: Math.round(m.calculatedValue / convertToEu)
                                                                //                 }
                                                                //             });
                                                                //             // let jsonTemp = { objUnit: forecastingUniObj[l].planningUnit.forecastingUnit, scenario: { id: 1, label: treeList[m].label.label_en + filteredScenario[0].label.label_en }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                                //             let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                                //             consumptionData.push(jsonTemp);
                                                                //         } else {

                                                                //             let consumptionList = nodeDataMomList.map(m => {
                                                                //                 return {
                                                                //                     consumptionDate: m.month,
                                                                //                     // consumptionQty: (m.calculatedValue * forecastingUniObj[l].planningUnit.multiplier).toFixed(2)
                                                                //                     // consumptionQty: parseInt(m.calculatedValue * forecastingUniObj[l].planningUnit.multiplier)
                                                                //                     consumptionQty: Math.round(m.calculatedValue)
                                                                //                 }
                                                                //             });
                                                                //             // let jsonTemp = { objUnit: forecastingUniObj[l].planningUnit.forecastingUnit, scenario: { id: 1, label: treeList[m].label.label_en + filteredScenario[0].label.label_en }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                                //             let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                                //             consumptionData.push(jsonTemp);

                                                                //         }

                                                                //         match = 0;
                                                                //         break;
                                                                //     } else {
                                                                //         match = 1;
                                                                //     }
                                                                // }

                                                                // if (match == 1) {
                                                                //     // let jsonTemp = { objUnit: forecastingUniObj[l].planningUnit.forecastingUnit, scenario: { id: 1, label: treeList[m].label.label_en + filteredScenario[0].label.label_en }, display: true, color: "#ba0c2f", consumptionList: [] }
                                                                //     let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: [] }
                                                                //     consumptionData.push(jsonTemp);
                                                                // }









                                                            }
                                                        }

                                                    } else if (consumptionExtrapolationId != null) {//consumptionExtrapolationId
                                                        // console.log("Test------------>ELSE");
                                                        let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                        if (consumptionExtrapolationObj.length > 0) {


                                                            if (yaxisEquUnitId != -1) {//Yes
                                                                let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == selectedForecastingUnit[i].value)[0].convertToEu;

                                                                let consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                    return {
                                                                        consumptionDate: m.month,
                                                                        consumptionQty: Math.round(m.amount * forecastingUniObj[l].planningUnit.multiplier / convertToEu)
                                                                    }
                                                                });
                                                                // let jsonTemp = { objUnit: forecastingUniObj[l].planningUnit.forecastingUnit, scenario: { id: 1, label: "" }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                                // let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: consumptionExtrapolationObj[0].extrapolationMethod.id, label: '(' + consumptionExtrapolationObj[0].extrapolationMethod.label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList, treeId: 0, scenarioId: 0, consumptionExtrapolationId: consumptionExtrapolationId }
                                                                // consumptionData.push(jsonTemp);
                                                                let checkIdPresent = consumptionData.filter(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                                if (checkIdPresent.length > 0) {
                                                                    let findIndex = consumptionData.findIndex(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                                    let alreadyPresentConsumptionList = consumptionData[findIndex].consumptionList.concat(consumptionList);

                                                                    // logic for add same date data
                                                                    let newAddedConsumptionList = Object.values(alreadyPresentConsumptionList.reduce((a, { consumptionDate, consumptionQty }) => {
                                                                        if (!a[consumptionDate])
                                                                            a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                                                        else
                                                                            a[consumptionDate].consumptionQty += consumptionQty;
                                                                        return a;
                                                                    }, {}));
                                                                    consumptionData[findIndex].consumptionList = newAddedConsumptionList;

                                                                } else {
                                                                    let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: consumptionExtrapolationObj[0].extrapolationMethod.id, label: '(' + consumptionExtrapolationObj[0].extrapolationMethod.label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList, treeId: 0, scenarioId: 0, consumptionExtrapolationId: consumptionExtrapolationId, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                    consumptionData.push(jsonTemp);
                                                                }

                                                            } else {
                                                                let consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                    return {
                                                                        consumptionDate: m.month,
                                                                        consumptionQty: Math.round(m.amount * forecastingUniObj[l].planningUnit.multiplier)
                                                                    }
                                                                });
                                                                // let jsonTemp = { objUnit: forecastingUniObj[l].planningUnit.forecastingUnit, scenario: { id: 1, label: "" }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                                                                // let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: consumptionExtrapolationObj[0].extrapolationMethod.id, label: '(' + consumptionExtrapolationObj[0].extrapolationMethod.label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList, treeId: 0, scenarioId: 0, consumptionExtrapolationId: consumptionExtrapolationId }
                                                                // consumptionData.push(jsonTemp);

                                                                let checkIdPresent = consumptionData.filter(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                                if (checkIdPresent.length > 0) {
                                                                    let findIndex = consumptionData.findIndex(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                                    let alreadyPresentConsumptionList = consumptionData[findIndex].consumptionList.concat(consumptionList);

                                                                    // logic for add same date data
                                                                    let newAddedConsumptionList = Object.values(alreadyPresentConsumptionList.reduce((a, { consumptionDate, consumptionQty }) => {
                                                                        if (!a[consumptionDate])
                                                                            a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                                                        else
                                                                            a[consumptionDate].consumptionQty += consumptionQty;
                                                                        return a;
                                                                    }, {}));
                                                                    consumptionData[findIndex].consumptionList = newAddedConsumptionList;


                                                                } else {
                                                                    let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: consumptionExtrapolationObj[0].extrapolationMethod.id, label: '(' + consumptionExtrapolationObj[0].extrapolationMethod.label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList, treeId: 0, scenarioId: 0, consumptionExtrapolationId: consumptionExtrapolationId, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                    consumptionData.push(jsonTemp);
                                                                }
                                                            }




                                                        } else {
                                                            // let jsonTemp = { objUnit: forecastingUniObj[l].planningUnit.forecastingUnit, scenario: { id: 1, label: "" }, display: true, color: "#ba0c2f", consumptionList: [] }
                                                            // let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: "" }, display: true, color: "#ba0c2f", consumptionList: [], treeId: 0, scenarioId: 0, consumptionExtrapolationId: consumptionExtrapolationId }
                                                            // consumptionData.push(jsonTemp);

                                                            let checkIdPresent = consumptionData.filter(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                            if (checkIdPresent.length > 0) {

                                                            } else {
                                                                let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: "" }, display: true, color: "#ba0c2f", consumptionList: [], treeId: 0, scenarioId: 0, consumptionExtrapolationId: consumptionExtrapolationId, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                consumptionData.push(jsonTemp);
                                                            }
                                                        }
                                                    } else {
                                                        let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: "No forecast selected" }, display: false, color: "#ba0c2f", consumptionList: [], treeId: 0, scenarioId: 0, consumptionExtrapolationId: 0, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                        consumptionData.push(jsonTemp);
                                                    }

                                                }


                                            }

                                        } else {//no forecast selected

                                            let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 0, label: 'No forecast selected' }, display: false, color: "#ba0c2f", consumptionList: [], treeId: 0, scenarioId: 0, consumptionExtrapolationId: 0, region: { label: { label_en: '' } }, graphId: 0 }
                                            consumptionData.push(jsonTemp);



                                        }





                                        // console.log("TestFU------------>3", Object.keys(selectedForecastMap)[0]);
                                        // console.log("TestFU------------>4", (selectedForecastMap[Object.keys(selectedForecastMap)[0]]));


                                    }//end of forecastingUniObj L

                                }
                            }

                            console.log("TestFU------------>91", consumptionData);

                            consumptionData.sort(function (a, b) {
                                a = a.objUnit.label.label_en.toLowerCase();
                                b = b.objUnit.label.label_en.toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })

                            // logic for add same date data
                            // let resultTrue = Object.values(tempConsumptionListData.reduce((a, { consumptionDate, consumptionQty }) => {
                            //     if (!a[consumptionDate])
                            //         a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                            //     else
                            //         a[consumptionDate].consumptionQty += consumptionQty;
                            //     return a;
                            // }, {}));
                            // this.setState({
                            //     consumptionData: consumptionData,
                            //     monthArrayList: monthArrayList
                            // })

                            if (this.state.xaxis == 2) {//No
                                this.setState({
                                    consumptionData: consumptionData,
                                    monthArrayList: monthArrayList,
                                    message: ''
                                }, () => {
                                    this.addGraphConsumptionData();
                                    this.addGraphId();
                                    if (yaxisEquUnitId > 0) {
                                        this.calculateEquivalencyUnitTotal();
                                    }
                                })

                            } else {//yes
                                let min = moment(startDate).format("YYYY");
                                let max = moment(endDate).format("YYYY");
                                let years = [];
                                for (var i = min; i <= max; i++) {
                                    years.push("" + i)
                                }

                                let nextStartDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
                                let nextEndDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-28';

                                console.log("TestFU------------>900", nextStartDate);
                                console.log("TestFU------------>901", nextEndDate);
                                console.log("TestFU------------>92", consumptionData);

                                for (let i = 0; i < consumptionData.length; i++) {

                                    console.log("consumptionData------------------->3002", consumptionData[i].consumptionList);
                                    let nextConsumptionListData = consumptionData[i].consumptionList.filter(c => moment(c.consumptionDate).isBetween(nextStartDate, nextEndDate, null, '[)'))
                                    console.log("consumptionData------------------->3003", nextConsumptionListData);

                                    let tempConsumptionListData = nextConsumptionListData.map(m => {
                                        return {
                                            consumptionDate: moment(m.consumptionDate).format("YYYY"),
                                            // consumptionQty: m.consumptionQty
                                            consumptionQty: parseInt(m.consumptionQty)
                                        }
                                    });
                                    console.log("consumptionData------------------->33", tempConsumptionListData);

                                    //logic for add same date data                            
                                    let resultTrue = Object.values(tempConsumptionListData.reduce((a, { consumptionDate, consumptionQty }) => {
                                        if (!a[consumptionDate])
                                            a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                        else
                                            // a[consumptionDate].consumptionQty += consumptionQty;
                                            // a[consumptionDate].consumptionQty = parseFloat(a[consumptionDate].consumptionQty) + parseFloat(consumptionQty);
                                            a[consumptionDate].consumptionQty = parseInt(a[consumptionDate].consumptionQty) + parseInt(consumptionQty);
                                        return a;
                                    }, {}));

                                    console.log("consumptionData------------------->3", resultTrue);

                                    consumptionData[i].consumptionList = resultTrue;
                                }
                                console.log("consumptionData------------------->3", years);
                                console.log("consumptionData------------------->4", consumptionData);
                                this.setState({
                                    consumptionData: consumptionData,
                                    monthArrayList: years,
                                    message: ''
                                }, () => {
                                    this.addGraphConsumptionData();
                                    this.addGraphId();
                                    if (yaxisEquUnitId > 0) {
                                        this.calculateEquivalencyUnitTotal();
                                    }
                                })


                            }










                            // if (viewById == 1) {//planning unit id
                            //     // console.log("planningUnitValues---------->", this.state.planningUnitValues);{label: "Dolutegravir/Lamivudine/Tenofovir DF 50/300/300 mg Tablet, 30 Tablets", value: 2733}
                            //     let planningUnit = this.state.planningUnitValues;

                            //     for (let i = 0; i < planningUnit.length; i++) {

                            //         let filteredData = filteredProgram.consumptionList.filter(c => c.consumptionUnit.planningUnit.id == planningUnit[i].value);
                            //         console.log("Test------------------->1", filteredData);

                            //         let consumptionList = filteredData.map(m => {
                            //             return {
                            //                 consumptionDate: m.month,
                            //                 consumptionQty: m.actualConsumption
                            //             }
                            //         });

                            //         let jsonTemp = { objUnit: this.state.planningUnits.filter(c => c.id == planningUnit[i].value)[0], scenario: { id: 3, label: "C. Consumption Low" }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                            //         consumptionData.push(jsonTemp);
                            //     }
                            // } else {//forecasting unit id

                            //     let forecastingUnit = this.state.forecastingUnitValues;
                            //     console.log("forecastingUnitVal----------->", forecastingUnit);
                            //     for (let i = 0; i < forecastingUnit.length; i++) {

                            //         let filteredData = filteredProgram.consumptionList.filter(c => c.consumptionUnit.forecastingUnit.id == forecastingUnit[i].value);
                            //         console.log("Test------------------->2", filteredData);

                            //         let consumptionList = filteredData.map(m => {
                            //             return {
                            //                 consumptionDate: m.month,
                            //                 consumptionQty: m.actualConsumption * m.consumptionUnit.planningUnit.multiplier,
                            //                 multiplier: m.consumptionUnit.planningUnit.multiplier
                            //             }
                            //         });
                            //         console.log("Test------------------->3", consumptionList);

                            //         let jsonTemp = { objUnit: this.state.forecastingUnits.filter(c => c.id == forecastingUnit[i].value)[0], scenario: { id: 3, label: "C. Consumption Low" }, display: true, color: "#ba0c2f", consumptionList: consumptionList }
                            //         consumptionData.push(jsonTemp);
                            //     }

                            // }

                            // console.log("consumptionData------------------->11", monthArrayList);
                            // console.log("consumptionData------------------->22", consumptionData);

                            // if (this.state.xaxis == 2) {
                            //     this.setState({
                            //         consumptionData: consumptionData,
                            //         monthArrayList: monthArrayList
                            //     })
                            // } else {
                            //     let min = moment(startDate).format("YYYY");
                            //     let max = moment(endDate).format("YYYY");
                            //     let years = [];
                            //     for (var i = min; i <= max; i++) {
                            //         years.push("" + i)
                            //     }

                            //     for (let i = 0; i < consumptionData.length; i++) {

                            //         let tempConsumptionListData = consumptionData[i].consumptionList.map(m => {
                            //             return {
                            //                 consumptionDate: moment(m.consumptionDate).format("YYYY"),
                            //                 consumptionQty: m.consumptionQty
                            //             }
                            //         });
                            //         // console.log("consumptionData------------------->33", tempConsumptionListData);
                            //         //logic for add same date data                            
                            //         let resultTrue = Object.values(tempConsumptionListData.reduce((a, { consumptionDate, consumptionQty }) => {
                            //             if (!a[consumptionDate])
                            //                 a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                            //             else
                            //                 a[consumptionDate].consumptionQty += consumptionQty;
                            //             return a;
                            //         }, {}));

                            //         // console.log("consumptionData------------------->3", resultTrue);
                            //         consumptionData[i].consumptionList = resultTrue;

                            //     }
                            //     console.log("consumptionData------------------->3", years);
                            //     console.log("consumptionData------------------->4", consumptionData);
                            //     this.setState({
                            //         consumptionData: consumptionData,
                            //         monthArrayList: years
                            //     })

                            // }

                        })


                    }.bind(this);
                }.bind(this);

            } else {//api call

                let consumptionData = [];


                let inputJson = {
                    "programId": programId,
                    "versionId": versionId,
                    "startDate": startDate,
                    "stopDate": endDate,
                    "reportView": viewById,
                    "aggregateByYear": (xaxisId == 1 ? true : false),
                    "unitIds": (viewById == 1 ? planningUnitIds : forecastingUnitIds)
                }

                console.log("OnlineInputJson---------------->", inputJson);


                ReportService.forecastOutput(inputJson)
                    .then(response => {
                        console.log("RESP---------->forecastOutput", response.data);
                        let primaryConsumptionData = response.data;

                        for (let i = 0; i < primaryConsumptionData.length; i++) {

                            if (primaryConsumptionData[i].selectedForecast != null) {
                                let consumptionList = primaryConsumptionData[i].monthlyForecastData.map(m => {
                                    return {
                                        consumptionDate: m.month,
                                        consumptionQty: Math.round(m.consumptionQty)
                                    }
                                });

                                let jsonTemp = { objUnit: (viewById == 1 ? primaryConsumptionData[i].planningUnit : primaryConsumptionData[i].forecastingUnit), scenario: { id: 1, label: primaryConsumptionData[i].selectedForecast.label_en }, display: true, color: "#ba0c2f", consumptionList: consumptionList, region: primaryConsumptionData[i].region, graphId: 0 }
                                consumptionData.push(jsonTemp);
                            } else {
                                let consumptionList = primaryConsumptionData[i].monthlyForecastData.map(m => {
                                    return {
                                        consumptionDate: m.month,
                                        consumptionQty: Math.round(m.consumptionQty)
                                    }
                                });
                                let jsonTemp = { objUnit: (viewById == 1 ? primaryConsumptionData[i].planningUnit : primaryConsumptionData[i].forecastingUnit), scenario: { id: 0, label: 'No forecast selected' }, display: false, color: "#ba0c2f", consumptionList: consumptionList, region: primaryConsumptionData[i].region, graphId: 0 }
                                consumptionData.push(jsonTemp);
                            }

                        }


                        var monthArrayList = [];
                        let cursorDate = startDate;
                        for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(endDate).format("YYYY-MM"); i++) {
                            var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                            cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
                            monthArrayList.push(dt);
                        }

                        console.log('consumptionData-------->', consumptionData);

                        consumptionData.sort(function (a, b) {
                            a = a.objUnit.label.label_en.toLowerCase();
                            b = b.objUnit.label.label_en.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })


                        if (xaxisId == 1) {//yes

                            let min = moment(startDate).format("YYYY");
                            let max = moment(endDate).format("YYYY");
                            let years = [];
                            for (var i = min; i <= max; i++) {
                                years.push("" + i)
                            }

                            let nextStartDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
                            let nextEndDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-28';

                            console.log("TestFU------------>900online", nextStartDate);
                            console.log("TestFU------------>901online", nextEndDate);
                            console.log("TestFU------------>92online", consumptionData);

                            for (let i = 0; i < consumptionData.length; i++) {

                                console.log("consumptionData------------------->3002online", consumptionData[i].consumptionList);
                                let nextConsumptionListData = consumptionData[i].consumptionList.filter(c => moment(c.consumptionDate).isBetween(nextStartDate, nextEndDate, null, '[)'))
                                console.log("consumptionData------------------->3003online", nextConsumptionListData);

                                let tempConsumptionListData = nextConsumptionListData.map(m => {
                                    return {
                                        consumptionDate: moment(m.consumptionDate).format("YYYY"),
                                        // consumptionQty: m.consumptionQty
                                        consumptionQty: parseInt(m.consumptionQty)
                                    }
                                });
                                console.log("consumptionData------------------->33online", tempConsumptionListData);

                                //logic for add same date data                            
                                let resultTrue = Object.values(tempConsumptionListData.reduce((a, { consumptionDate, consumptionQty }) => {
                                    if (!a[consumptionDate])
                                        a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                    else
                                        // a[consumptionDate].consumptionQty += consumptionQty;
                                        // a[consumptionDate].consumptionQty = parseFloat(a[consumptionDate].consumptionQty) + parseFloat(consumptionQty);
                                        a[consumptionDate].consumptionQty = parseInt(a[consumptionDate].consumptionQty) + parseInt(consumptionQty);
                                    return a;
                                }, {}));

                                console.log("consumptionData------------------->3online", resultTrue);

                                consumptionData[i].consumptionList = resultTrue;
                            }
                            console.log("consumptionData------------------->3online", years);
                            console.log("consumptionData------------------->4online", consumptionData);
                            this.setState({
                                consumptionData: consumptionData,
                                monthArrayList: years,
                                message: ''
                            }, () => {
                                this.addGraphConsumptionData();
                                this.addGraphId();
                                if (yaxisEquUnitId > 0) {
                                    this.calculateEquivalencyUnitTotal();
                                }
                            })

                        } else {//no
                            this.setState({
                                consumptionData: consumptionData,
                                monthArrayList: monthArrayList,
                                message: ''
                            }, () => {
                                this.addGraphConsumptionData();
                                this.addGraphId();
                                if (yaxisEquUnitId > 0) {
                                    this.calculateEquivalencyUnitTotal();
                                }
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



            }


        } else if (programId == -1) {//validation message            
            this.setState({ message: i18n.t('static.common.selectProgram'), consumptionData: [], graphConsumptionData: [], monthArrayList: [], datasetList: [], datasetList1: [], versions: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnits: [], forecastingUnitValues: [], forecastingUnitLabels: [], equivalencyUnitList: [], programId: '', versionId: '', forecastPeriod: '', yaxisEquUnit: -1 });

        } else if (versionId == -1) {
            this.setState({ message: i18n.t('static.program.validversion'), consumptionData: [], graphConsumptionData: [], monthArrayList: [], datasetList: [], datasetList1: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnits: [], forecastingUnitValues: [], forecastingUnitLabels: [], equivalencyUnitList: [], versionId: '', forecastPeriod: '', yaxisEquUnit: -1 });

        } else if (viewById == 1 && planningUnitIds.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptionData: [], graphConsumptionData: [], monthArrayList: [], datasetList: [], datasetList1: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnitValues: [], forecastingUnitLabels: [] });

        } else if (viewById == 2 && forecastingUnitIds.length == 0) {
            this.setState({ message: i18n.t('static.planningunit.forcastingunittext'), consumptionData: [], graphConsumptionData: [], monthArrayList: [], datasetList: [], datasetList1: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnitValues: [], forecastingUnitLabels: [] });

        }







    }


    getPrograms() {
        // this.setState({ programs: [{ label: "FASPonia MOH 1", programId: 1 }], loading: false });

        if (isSiteOnline()) {
            // AuthenticationService.setupAxiosInterceptors();
            ProgramService.getDataSetListAll()
                .then(response => {
                    let datasetList = response.data;
                    console.log("datasetList-------------->1", datasetList);
                    datasetList = datasetList.filter(c => c.active == true);
                    console.log("datasetList-------------->2", datasetList);
                    this.setState({
                        programs: datasetList,
                        allProgramList: response.data
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

                if (proList.length == 1) {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = (a.programCode).toLowerCase();
                            b = (b.programCode).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        downloadedProgramData: downloadedProgramData,
                        programId: proList[0].programId,
                    }, () => {
                        this.getVersionIds();
                        console.log("programs------------------>1", this.state.programs);
                    })
                } else {
                    if (this.props.match.params.programId != "" && this.props.match.params.programId != undefined) {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            programId: this.props.match.params.programId,
                            downloadedProgramData: downloadedProgramData,
                            loading: false
                        }, () => {
                            this.getVersionIds();
                            console.log("programs------------------>", this.state.programs);
                        })
                    }
                    else if (localStorage.getItem("sesForecastProgramIdReport") != '' && localStorage.getItem("sesForecastProgramIdReport") != undefined) {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            downloadedProgramData: downloadedProgramData,
                            programId: localStorage.getItem("sesForecastProgramIdReport"),
                        }, () => {
                            this.getVersionIds();
                            console.log("programs------------------>2", this.state.programs);
                        })
                    } else {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = (a.programCode).toLowerCase();
                                b = (b.programCode).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            downloadedProgramData: downloadedProgramData
                        }, () => {
                            this.filterData();
                            console.log("programs------------------>3", this.state.programs);
                        })
                    }

                }




            }.bind(this);

        }.bind(this);


    }

    componentDidMount() {
        this.getPrograms();
        document.getElementById("forecastingUnitDiv").style.display = "none";
    }

    setProgramId(event) {
        this.setState({
            programId: event.target.value,
            versionId: '',
            forecastPeriod: '',
            yaxisEquUnit: -1,
            consumptionData: [],
            graphConsumptionData: [],
            monthArrayList: [],
            calculateEquivalencyUnitTotal: [],
            planningUnits: [],
            planningUnitValues: [],
            planningUnitLabels: [],

            foreastingUnits: [],
            foreastingUnitValues: [],
            foreastingUnitLabels: []
        }, () => {
            // localStorage.setItem("sesVersionIdReport", '');
            this.filterData();
            this.getVersionIds();
        })
    }

    // setVersionId(event) {
    //     this.setState({
    //         versionId: event.target.value,
    //     }, () => {
    //         // localStorage.setItem("sesVersionIdReport", '');
    //         // this.filterVersion();
    //     })
    // }


    getPlanningUnitForecastingUnit = () => {

        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;

        // let programId = this.state.programId;
        // let versionId = this.state.versionId;

        if (programId != -1 && versionId != -1) {

            this.setState({
                planningUnits: [],
                planningUnitValues: [],
                planningUnitLabels: [],
                foreastingUnits: [],
                foreastingUnitValues: [],
                foreastingUnitLabels: [],
                consumptionData: [],
                graphConsumptionData: [],
                monthArrayList: [],
                calculateEquivalencyUnitTotal: [],
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
                        // let planningUnitList = programData.planningUnitList.map(o => o.planningUnit)

                        let planningUnitActiveList = programData.planningUnitList.filter(c => c.active == true);

                        let planningUnitList = planningUnitActiveList.map(o => {
                            let planningUnitObj1 = o.planningUnit;
                            let planningUnitObj2 = { selectedForecastMap: o.selectedForecastMap };
                            return {
                                ...planningUnitObj1, ...planningUnitObj2
                            }
                        });

                        console.log("CheckPU------------------>1", planningUnitList);
                        // console.log("CheckPU------------------>1.1", planningUnitList[0].selectedForecastMap[(Object.keys(planningUnitList[0].selectedForecastMap))]);

                        // planningUnitList = planningUnitList.filter(c => Object.keys(c.selectedForecastMap).length !== 0)


                        // let tempPUList = [];
                        // for (var i = 0; i < planningUnitList.length; i++) {
                        //     let keys = Object.keys(planningUnitList[i].selectedForecastMap);
                        //     let k = 0;

                        //     //check selected forecast map wheter it is proper or not
                        //     for (var j = 0; j < keys.length; j++) {
                        //         if (planningUnitList[i].selectedForecastMap[keys[j]].scenarioId != null) {
                        //             k = k + 1;
                        //         } else if (planningUnitList[i].selectedForecastMap[keys[j]].consumptionExtrapolationId != 0) {
                        //             k = k + 1;
                        //         }
                        //     }

                        //     if (k == keys.length) {
                        //         tempPUList.push(planningUnitList[i]);
                        //     }

                        // }
                        // planningUnitList = tempPUList;

                        console.log("CheckPU------------------>3", planningUnitList);

                        for (var i = 0; i < planningUnitList.length; i++) {
                            forecastingUnitListTemp.push(planningUnitList[i].forecastingUnit);
                        }

                        // console.log("PlanningUnitList----------------->1", planningUnitList);
                        // console.log("PlanningUnitList----------------->2", forecastingUnitListTemp);

                        const ids = forecastingUnitListTemp.map(o => o.id);
                        const forecastingUnitList = forecastingUnitListTemp.filter(({ id }, index) => !ids.includes(id, index + 1));
                        console.log("CheckPU------------------>2", forecastingUnitList);
                        // console.log("PlanningUnitList----------------->3", filtered);

                        // let dupForecastingUnitObj = programData.consumptionList.map(ele => ele.consumptionUnit.forecastingUnit);
                        // const ids = dupForecastingUnitObj.map(o => o.id)
                        // const filtered = dupForecastingUnitObj.filter(({ id }, index) => !ids.includes(id, index + 1))
                        // // console.log("programData-------->2", filtered);

                        // let dupPlanningUnitObjwithNull = programData.consumptionList.map(ele => ele.consumptionUnit.planningUnit);
                        // let dupPlanningUnitObj = dupPlanningUnitObjwithNull.filter(c => c != null);
                        // const idsPU = dupPlanningUnitObj.map(o => o.id)
                        // const filteredPU = dupPlanningUnitObj.filter(({ id }, index) => !idsPU.includes(id, index + 1))

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
                                planningUnitValues: newPlanningUnitList.map((item, i) => {
                                    return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

                                }, this),
                                planningUnitLabels: newPlanningUnitList.map((item, i) => {
                                    return (getLabelText(item.label, this.state.lang))
                                }, this),
                                forecastingUnitValues: newForecastingUnitList.map((item, i) => {
                                    return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

                                }, this),
                                forecastingUnitLabels: newForecastingUnitList.map((item, i) => {
                                    return (getLabelText(item.label, this.state.lang))
                                }, this),
                                equivalencyUnitLabel: selectedText,
                                filteredProgramEQList: filteredProgramEQList
                            }, () => {
                                this.getEquivalencyUnitData();
                                this.filterData();
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
                                planningUnitValues: planningUnitList.map((item, i) => {
                                    return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

                                }, this),
                                planningUnitLabels: planningUnitList.map((item, i) => {
                                    return (getLabelText(item.label, this.state.lang))
                                }, this),
                                forecastingUnitValues: forecastingUnitList.map((item, i) => {
                                    return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

                                }, this),
                                forecastingUnitLabels: forecastingUnitList.map((item, i) => {
                                    return (getLabelText(item.label, this.state.lang))
                                }, this),
                                equivalencyUnitLabel: ''
                                // planningUnits: filteredPU,
                                // forecastingUnits: filtered
                            }, () => {
                                this.getEquivalencyUnitData();
                                this.filterData();
                            })
                        }



                    }
                    else {

                        PlanningUnitService.getPlanningUnitListByProgramVersionIdForSelectedForecastMap(programId, versionId).then(response => {
                            console.log('**' + JSON.stringify(response.data))
                            var listArray = response.data;
                            listArray = listArray.map(c => c.planningUnit);
                            listArray.sort((a, b) => {
                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                return itemLabelA > itemLabelB ? 1 : -1;
                            });
                            this.setState({
                                planningUnits: listArray,
                                message: ''
                            }, () => {

                                ForecastingUnitService.getForecastingUnitListByProgramVersionIdForSelectedForecastMap(programId, versionId).then(response => {
                                    console.log('**' + JSON.stringify(response.data))
                                    var listArray = response.data;
                                    listArray = listArray.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i)
                                    listArray.sort((a, b) => {
                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    this.setState({
                                        forecastingUnits: listArray,
                                        message: ''
                                    }, () => {

                                        let yaxisEquUnitId = document.getElementById("yaxisEquUnit").value;


                                        console.log("CheckPU------------------>201", this.state.planningUnits);
                                        console.log("CheckPU------------------>202", this.state.forecastingUnits);


                                        if (yaxisEquUnitId != -1) {//Yes
                                            let filteredProgramEQList = this.state.programEquivalencyUnitList.filter(c => c.equivalencyUnit.equivalencyUnitId == yaxisEquUnitId);
                                            let newPlanningUnitList = [];
                                            let newForecastingUnitList = [];

                                            let forecastingUnitList = this.state.forecastingUnits;
                                            let planningUnitList = this.state.planningUnits;

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
                                                planningUnitValues: newPlanningUnitList.map((item, i) => {
                                                    return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

                                                }, this),
                                                planningUnitLabels: newPlanningUnitList.map((item, i) => {
                                                    return (getLabelText(item.label, this.state.lang))
                                                }, this),
                                                forecastingUnitValues: newForecastingUnitList.map((item, i) => {
                                                    return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

                                                }, this),
                                                forecastingUnitLabels: newForecastingUnitList.map((item, i) => {
                                                    return (getLabelText(item.label, this.state.lang))
                                                }, this),
                                                equivalencyUnitLabel: selectedText,
                                                filteredProgramEQList: filteredProgramEQList
                                            }, () => {
                                                this.getEquivalencyUnitData();
                                                this.filterData();
                                            })

                                        } else {//NO

                                            this.setState({
                                                planningUnitValues: this.state.planningUnits.map((item, i) => {
                                                    return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

                                                }, this),
                                                planningUnitLabels: this.state.planningUnits.map((item, i) => {
                                                    return (getLabelText(item.label, this.state.lang))
                                                }, this),
                                                forecastingUnitValues: this.state.forecastingUnits.map((item, i) => {
                                                    return ({ label: getLabelText(item.label, this.state.lang), value: item.id })

                                                }, this),
                                                forecastingUnitLabels: this.state.forecastingUnits.map((item, i) => {
                                                    return (getLabelText(item.label, this.state.lang))
                                                }, this),
                                                equivalencyUnitLabel: ''
                                            }, () => {
                                                this.getEquivalencyUnitData();
                                                this.filterData();
                                            })

                                        }







                                    })
                                }).catch(
                                    error => {
                                        this.setState({
                                            planningUnits: [],
                                        })
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
                                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
                                                        loading: false
                                                    });
                                                    break;
                                                case 412:
                                                    this.setState({
                                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
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




                            })
                        }).catch(
                            error => {
                                this.setState({
                                    planningUnits: [],
                                })
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
                                                message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
                                                loading: false
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.planningunit.planningunit') }),
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
            });
        }

    }

    setForecastPeriod() {
        console.log("selectedForecastProgram------------>001", this.state.programId);
        console.log("selectedForecastProgram------------>002", this.state.versionId);
        console.log("selectedForecastProgram------------>002", this.state.programs);
        let programId = this.state.programId;
        let versionId = this.state.versionId;
        // versionId = (versionId.toString().includes('(') ? versionId.split('(')[0] : versionId);

        console.log("setForecastPeriod---------->", versionId);
        if (programId != -1 && (versionId.toString().includes('(') ? versionId.split('(')[0] : versionId) != -1) {
            // if (programId != -1 && versionIdsplit('(')[0] != -1) {

            if (versionId.toString().includes('Local')) {//Local version
                // versionId = versionId.split('(')[0];
                versionId = parseInt(versionId);
                let selectedForecastProgram = this.state.downloadedProgramData.filter(c => c.programId == programId && c.currentVersion.versionId == versionId)[0]
                let d1 = new Date(selectedForecastProgram.currentVersion.forecastStartDate);
                let d2 = new Date(selectedForecastProgram.currentVersion.forecastStopDate);
                var month = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ]

                let startDateSplit = ((month[d1.getMonth()] + '-' + d1.getFullYear())).split('-');
                let stopDateSplit = ((month[d2.getMonth()] + '-' + d2.getFullYear())).split('-');

                let forecastStopDate = new Date((month[d1.getMonth()] + '-' + d1.getFullYear()));
                forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);

                let forecastStartDateNew = selectedForecastProgram.currentVersion.forecastStartDate;
                let forecastStopDateNew = selectedForecastProgram.currentVersion.forecastStopDate;

                let beforeEndDateDisplay = new Date(selectedForecastProgram.forecastStartDate);
                beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);

                this.setState({
                    // forecastPeriod: (month[new Date((month[d1.getMonth()] + '-' + d1.getFullYear())).getMonth()]) + ' ' + (startDateSplit[1] - 3) + ' ~ ' + month[forecastStopDate.getMonth()] + ' ' + forecastStopDate.getFullYear(),
                    // rangeValue: { from: { year: new Date(forecastStartDateNew).getFullYear(), month: new Date(forecastStartDateNew).getMonth() + 1 }, to: { year: new Date(forecastStopDateNew).getFullYear(), month: new Date(forecastStopDateNew).getMonth() + 1 } },
                    rangeValue: { from: { year: Number(moment(forecastStartDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStartDateNew).startOf('month').format("M")) }, to: { year: Number(moment(forecastStopDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStopDateNew).startOf('month').format("M")) } },

                    minDate: { year: Number(moment(forecastStartDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStartDateNew).startOf('month').format("M")) },
                    maxDate: { year: Number(moment(forecastStopDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStopDateNew).startOf('month').format("M")) },

                    // forecastPeriod: month[new Date(forecastStartDateNew).getMonth()] + ' ' + new Date(forecastStartDateNew).getFullYear() + ' ~ ' + month[new Date(forecastStopDateNew).getMonth()] + ' ' + new Date(forecastStopDateNew).getFullYear(),
                    forecastPeriod: month[Number(moment(forecastStartDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDateNew).startOf('month').format("YYYY")) + ' ~ ' + month[Number(moment(forecastStopDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDateNew).startOf('month').format("YYYY")),
                }, () => { })

            } else {//server version
                let selectedForecastProgram = this.state.programs.filter(c => c.programId == programId)[0];

                let currentProgramVersion = selectedForecastProgram.versionList.filter(c => c.versionId == versionId)[0];

                console.log("selectedForecastProgram---------->", selectedForecastProgram);

                let d1 = new Date(currentProgramVersion.forecastStartDate);
                let d2 = new Date(currentProgramVersion.forecastStopDate);
                var month = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ]

                let forecastStopDate = new Date((month[d1.getMonth()] + '-' + d1.getFullYear()));
                forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);

                let forecastStartDateNew = currentProgramVersion.forecastStartDate;
                let forecastStopDateNew = currentProgramVersion.forecastStopDate;

                let beforeEndDateDisplay = new Date(currentProgramVersion.forecastStartDate);
                beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);

                this.setState({
                    rangeValue: { from: { year: Number(moment(forecastStartDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStartDateNew).startOf('month').format("M")) }, to: { year: Number(moment(forecastStopDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStopDateNew).startOf('month').format("M")) } },
                    minDate: { year: Number(moment(forecastStartDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStartDateNew).startOf('month').format("M")) },
                    maxDate: { year: Number(moment(forecastStopDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStopDateNew).startOf('month').format("M")) },
                    forecastPeriod: month[Number(moment(forecastStartDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDateNew).startOf('month').format("YYYY")) + ' ~ ' + month[Number(moment(forecastStopDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDateNew).startOf('month').format("YYYY")),
                }, () => { })

            }
        } else {
            this.setState({
                forecastPeriod: '',
            }, () => { })
        }
    }


    setVersionId(event) {



        var versionId = ((event == null || event == '' || event == undefined) ? ((this.state.versionId).toString().split('(')[0]) : (event.target.value.split('(')[0]).trim());
        console.log("versionId----------->", versionId);
        console.log("versionId----------->downloadedProgramData", this.state.downloadedProgramData);
        versionId = parseInt(versionId);
        // var version = (versionId.split('(')[0]).trim()
        var programId = this.state.programId;

        // if (programId != -1 && versionId != -1) {
        //     let selectedForecastProgram = this.state.programs.filter(c => c.programId == programId && c.currentVersion.versionId == versionId)[0]
        //     console.log("selectedForecastProgram------------>0", this.state.programs);
        //     console.log("selectedForecastProgram------------>1", selectedForecastProgram);
        //     console.log("selectedForecastProgram------------>2", programId);
        //     console.log("selectedForecastProgram------------>3", versionId);
        //     let d1 = new Date(selectedForecastProgram.currentVersion.forecastStartDate);
        //     let d2 = new Date(selectedForecastProgram.currentVersion.forecastStopDate);
        //     var month = [
        //         "Jan",
        //         "Feb",
        //         "Mar",
        //         "Apr",
        //         "May",
        //         "Jun",
        //         "Jul",
        //         "Aug",
        //         "Sep",
        //         "Oct",
        //         "Nov",
        //         "Dec",
        //     ]

        //     let startDateSplit = ((month[d1.getMonth()] + '-' + d1.getFullYear())).split('-');
        //     let stopDateSplit = ((month[d2.getMonth()] + '-' + d2.getFullYear())).split('-');

        //     let forecastStopDate = new Date((month[d1.getMonth()] + '-' + d1.getFullYear()));
        //     forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);

        //     let forecastStartDateNew = selectedForecastProgram.currentVersion.forecastStartDate;
        //     let forecastStopDateNew = selectedForecastProgram.currentVersion.forecastStopDate;

        //     let beforeEndDateDisplay = new Date(selectedForecastProgram.forecastStartDate);
        //     beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);

        //     this.setState({
        //         // forecastPeriod: (month[new Date((month[d1.getMonth()] + '-' + d1.getFullYear())).getMonth()]) + ' ' + (startDateSplit[1] - 3) + ' ~ ' + month[forecastStopDate.getMonth()] + ' ' + forecastStopDate.getFullYear(),
        //         rangeValue: { from: { year: new Date(forecastStartDateNew).getFullYear(), month: new Date(forecastStartDateNew).getMonth() + 1 }, to: { year: new Date(forecastStopDateNew).getFullYear(), month: new Date(forecastStopDateNew).getMonth() + 1 } },
        //         forecastPeriod: month[new Date(forecastStartDateNew).getMonth()] + ' ' + new Date(forecastStartDateNew).getFullYear() + ' ~ ' + month[new Date(forecastStopDateNew).getMonth()] + ' ' + new Date(forecastStopDateNew).getFullYear(),
        //     }, () => {

        //     })
        // } else {
        //     this.setState({
        //         forecastPeriod: '',
        //     }, () => {

        //     })
        // }


        var viewById = document.getElementById("viewById").value;
        if (versionId != '' || versionId != undefined) {
            this.setState({
                versionId: ((event == null || event == '' || event == undefined) ? (this.state.versionId) : (event.target.value).trim()),
                yaxisEquUnit: -1,
                planningUnits: [],
                planningUnitValues: [],
                planningUnitLabels: [],
                foreastingUnits: [],
                foreastingUnitValues: [],
                foreastingUnitLabels: [],

                consumptionData: [],
                graphConsumptionData: [],
                monthArrayList: [],
                calculateEquivalencyUnitTotal: [],
            }, () => {
                // localStorage.setItem("sesVersionIdReport", this.state.versionId);
                // (viewById == 1 ? this.getPlanningUnitForecastingUnit() : this.getForecastingUnit());
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);

                localStorage.setItem("sesForecastProgramIdReport", parseInt(document.getElementById("programId").value));
                localStorage.setItem("sesForecastVersionIdReport", document.getElementById("versionId").value);
                localStorage.setItem("sesDatasetId", parseInt(document.getElementById("programId").value) + '_v' + (document.getElementById("versionId").value).replace('(Local)', '').trim() + '_uId_' + userId);

                localStorage.setItem("sesLiveDatasetId", parseInt(document.getElementById("programId").value));
                localStorage.setItem("sesDatasetCompareVersionId", document.getElementById("versionId").value);
                localStorage.setItem("sesDatasetVersionId", document.getElementById("versionId").value);
                this.setForecastPeriod();
                this.filterData();
                // this.getEquivalencyUnitData();
                this.getPlanningUnitForecastingUnit();

            })
        } else {
            this.setState({
                versionId: event.target.value
            }, () => {
                // (viewById == 1 ? this.getPlanningUnitForecastingUnit() : this.getForecastingUnit());
                this.setForecastPeriod();
                this.filterData();
                // this.getEquivalencyUnitData();
                this.getPlanningUnitForecastingUnit()
            })
        }


    }

    getVersionIds() {
        // var versionListAll = this.state.versionListAll;
        // var planningUnitListAll = this.state.planningUnitListAll;
        // var reportPeriod = [{ programId: 1, startDate: '2020-09-01', endDate: '2021-08-30' }, { programId: 2, startDate: '2020-07-01', endDate: '2021-06-30' }, { programId: 3, startDate: '2020-11-01', endDate: '2021-10-30' }];
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
        // var planningUnitList = [];
        // var planningUnitListFiltered = planningUnitListAll.filter(c => c.program.programId == this.state.programId);
        // planningUnitListFiltered.map(item => {
        //     planningUnitList.push({
        //         label: item.label, value: item.planningUnitId
        //     })
        // })

        // // var scenarioList = [{ scenarioId: 1, label: "A. Consumption High", checked: true, color: "#4f81bd" }, { scenarioId: 2, label: "B. Consumption Med", checked: true, color: "#f79646" }, { scenarioId: 3, label: "C. Consumption Low", checked: true, color: "#000000" }, { scenarioId: 4, label: "D. Morbidity - assumption Y", checked: true, color: "#ff0000" }, { scenarioId: 5, label: "E. Demographic", checked: true, color: "#604a7b" }]
        // this.setState({ versions: versionListAll.filter(c => c.program.programId == this.state.programId), loading: false, planningUnits: planningUnitList, rangeValue: rangeValue, monthArrayList: monthArrayList });


        let programId = this.state.programId;
        if (programId != 0) {

            const program = this.state.programs.filter(c => c.programId == programId)
            console.log("program-------------->", program);
            if (program.length == 1) {
                if (isSiteOnline()) {
                    this.setState({
                        versions: [],
                    }, () => {
                        let inactiveProgram = this.state.allProgramList.filter(c => c.active == false);
                        inactiveProgram = inactiveProgram.filter(c => c.programId == programId);
                        if (inactiveProgram.length > 0) {//Inactive
                            this.consolidatedVersionList(programId)
                        } else {//Active
                            this.setState({
                                versions: program[0].versionList.filter(function (x, i, a) {
                                    return a.indexOf(x) === i;
                                })
                            }, () => { this.consolidatedVersionList(programId) });
                        }

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
                if (this.props.match.params.versionId != "" && this.props.match.params.versionId != undefined) {
                    // let versionVar = versionList.filter(c => c.versionId == this.props.match.params.versionId+" (Local)");
                    this.setState({
                        versions: versionList,
                        versionId: this.props.match.params.versionId + " (Local)",
                    }, () => {
                        this.filterData();
                        this.setVersionId();
                    })
                } else if (localStorage.getItem("sesForecastVersionIdReport") != '' && localStorage.getItem("sesForecastVersionIdReport") != undefined) {
                    let versionVar = versionList.filter(c => c.versionId == localStorage.getItem("sesForecastVersionIdReport"));
                    this.setState({
                        versions: versionList,
                        versionId: (versionVar != '' && versionVar != undefined ? localStorage.getItem("sesForecastVersionIdReport") : versionList[0].versionId),
                    }, () => {
                        this.filterData();
                        this.setVersionId();
                    })
                } else {
                    this.setState({
                        versions: versionList,
                        versionId: (versionList.length > 0 ? versionList[0].versionId : ''),
                    }, () => {
                        this.filterData();
                        this.setVersionId();
                    })
                }


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

    setViewById(e) {
        console.log("e.targetvakue+++", e.target.value)
        var viewById = e.target.value;
        this.setState({
            viewById: viewById,
            planningUnitValues: [],
            planningUnitLabels: [],
            forecastingUnitValues: [],
            forecastingUnitLabels: [],
            consumptionData: [],
            graphConsumptionData: [],
            monthArrayList: [],
            calculateEquivalencyUnitTotal: [],
        }, () => {
            if (viewById == 2) {
                document.getElementById("planningUnitDiv").style.display = "none";
                document.getElementById("forecastingUnitDiv").style.display = "block";
                this.getPlanningUnitForecastingUnit();
                this.filterData();
            } else if (viewById == 1) {
                document.getElementById("planningUnitDiv").style.display = "block";
                document.getElementById("forecastingUnitDiv").style.display = "none";
                this.getPlanningUnitForecastingUnit();
                this.filterData();
            }
        })
    }

    handlePlanningUnitChange = (event) => {
        console.log('***', event)
        var planningUnitIds = event
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

    getIndexAsKey = (d) => { return d.key };


    toggleEu() {
        this.setState({
            popoverOpen: !this.state.popoverOpen,
        });
    }

    toggleRv() {
        this.setState({
            popoverOpen1: !this.state.popoverOpen1,
        });
    }

    filterOptions = async (options, filter) => {
        if (filter) {
            return options.filter((i) =>
                i.label.toLowerCase().includes(filter.toLowerCase())
            );
        } else {
            return options;
        }
    };

    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }


    render() {

        const backgroundColor = [
            "#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED",
            "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"
            // '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
            // '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
            // '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            // '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
            // '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
            // '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
            // '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
        ]

        var chartOptions = {
            title: {
                display: true,
                // text: (this.state.yaxisEquUnit > 0 ? this.state.equivalencyUnitLabel : 'Monthly Forecast ' + (this.state.viewById == 1 ? '(' + i18n.t('static.product.product') + ')' : '(' + i18n.t('static.forecastingunit.forecastingunit') + ')'))
                text: i18n.t('static.dashboard.monthlyForecast')+' - ' + (this.state.programs.filter(c => c.programId == this.state.programId).length > 0 ? this.state.programs.filter(c => c.programId == this.state.programId)[0].programCode : '') + ' - ' + (this.state.versions.filter(c => c.versionId == this.state.versionId).length > 0 ? this.state.versions.filter(c => c.versionId == this.state.versionId)[0].versionId : '')
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: (this.state.yaxisEquUnit > 0 ? this.state.equivalencyUnitLabel : (this.state.viewById == 1 ? i18n.t('static.product.product') : i18n.t('static.forecastingunit.forecastingunit'))),
                            fontColor: 'black'
                        },
                        stacked: (this.state.yaxisEquUnit > 0 ? true : false),
                        // stacked: true,//stacked
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
                            drawBorder: true, lineWidth: 0
                        },
                        position: 'left',
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
                },
                // callbacks: {
                //     label: function (tooltipItems, data) {
                //         if (tooltipItems.datasetIndex == 0) {
                //             var details = this.state.expiredStockArr[tooltipItems.index].details;
                //             var infoToShow = [];
                //             details.map(c => {
                //                 infoToShow.push(c.batchNo + " - " + c.expiredQty.toLocaleString());
                //             });
                //             return (infoToShow.join(' | '));
                //         } else {
                //             return (tooltipItems.yLabel.toLocaleString());
                //         }
                //     }.bind(this)
                // },
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
        if (this.state.consumptionData.length > 0 && this.state.monthArrayList.length > 0 && this.state.xaxis == 2) {
            var datasetsArr = [];
            this.state.graphConsumptionData.filter(c => c.display == true).map((item, index) => {
                {
                    var consumptionValue = [];
                    this.state.monthArrayList.map(item1 => {
                        {
                            var value = item.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"));
                            if (value.length > 0) {
                                consumptionValue.push(value[0].consumptionQty)
                            } else {
                                consumptionValue.push("");
                            }
                        }
                    })
                    datasetsArr.push(
                        {
                            label: item.objUnit.label.label_en,
                            id: item.objUnit.id,
                            type: 'line',
                            stack: 3,
                            yAxisID: 'A',
                            // backgroundColor: 'transparent',
                            backgroundColor: (this.state.yaxisEquUnit > 0 ? backgroundColor[index] : 'transparent'),
                            // backgroundColor: item.color,//stacked
                            borderColor: backgroundColor[index],
                            borderStyle: 'dotted',
                            borderWidth: 5,
                            ticks: {
                                fontSize: 2,
                                fontColor: 'transparent',
                            },
                            lineTension: 0,
                            pointStyle: 'line',
                            pointRadius: 0,
                            showInLegend: true,
                            // data: consumptionValue
                            data: (consumptionValue.filter(c => c != "").length > 0 ? consumptionValue : []),
                            pointRadius: 4,
                        }
                    )

                }
            })

            bar = {

                labels: [...new Set(this.state.monthArrayList.map(ele => (moment(ele).format(DATE_FORMAT_CAP_WITHOUT_DATE))))],
                datasets: datasetsArr

            };
        } else if (this.state.consumptionData.length > 0 && this.state.monthArrayList.length > 0 && this.state.xaxis == 1) {
            var datasetsArr = [];
            this.state.graphConsumptionData.filter(c => c.display == true).map((item, index) => {
                {
                    var consumptionValue = [];
                    this.state.monthArrayList.map(item1 => {
                        {
                            var value = item.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY"));
                            if (value.length > 0) {
                                consumptionValue.push(value[0].consumptionQty)
                            } else {
                                // consumptionValue.push("");
                            }
                        }
                    })
                    datasetsArr.push(
                        {
                            // label: item.objUnit.label.label_en,
                            label: item.objUnit.label.label_en,
                            type: 'line',
                            stack: 3,
                            yAxisID: 'A',
                            // backgroundColor: 'transparent',
                            backgroundColor: (this.state.yaxisEquUnit > 0 ? backgroundColor[index] : 'transparent'),
                            // backgroundColor: item.color,//stacked
                            borderColor: backgroundColor[index],
                            borderStyle: 'dotted',
                            borderWidth: 5,
                            ticks: {
                                fontSize: 2,
                                fontColor: 'transparent',
                            },
                            lineTension: 0,
                            pointStyle: 'line',
                            pointRadius: 0,
                            showInLegend: true,
                            data: consumptionValue,
                            // borderDash: [5, 5],
                            pointRadius: 4,
                            // pointHoverRadius: 6,
                            // pointBackgroundColor: "#55bae7",
                            // pointBorderColor: "#55bae7",
                            // pointHoverBackgroundColor: "#55bae7",
                            // pointHoverBorderColor: "#55bae7",
                        }
                    )

                }
            })

            bar = {

                labels: [...new Set(this.state.monthArrayList.map(ele => (moment(ele).format("YYYY"))))],
                datasets: datasetsArr

            };
        }

        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang) + ' | ' + item.id, value: item.id })

            }, this);

        const { forecastingUnits } = this.state;
        let forecastingUnitList = forecastingUnits.length > 0
            && forecastingUnits.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang) + ' | ' + item.id, value: item.id })

            }, this);


        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {/* {item.label.label_en} */}
                        {item.programCode}
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


        const { equivalencyUnitList } = this.state;
        let equivalencyUnitList1 = equivalencyUnitList.length > 0
            && equivalencyUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.equivalencyUnitId}>
                        {item.label.label_en}
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
        let countVar = 0;
        let countVar1 = 0;

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card>
                <div className="card-header-actions">
                            <div className="card-header-action pr-lg-4">
                            <a style={{float:'right'}}>
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                            </div>
                            </div>
                    <div className="Card-header-reporticon pb-2">
                        {this.state.consumptionData.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />


                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                        {/* {checkOnline === 'Offline' &&
                            this.state.offlineConsumptionList.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />

                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        } */}
                    </div>
                    <div className="Card-header-reporticon ">
                        <div className="card-header-actions BacktoLink col-md-12 pl-lg-0 pr-lg-0 pt-lg-2">
                            {/* <a className="pr-lg-0 pt-lg-1 float-left">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.backToCompareAndSelect() }}><i className="fa fa-long-arrow-left" style={{ color: '#20a8d8', fontSize: '13px' }}></i> <small className="supplyplanformulas">{'Return To Compare And Select Forecast'}</small></span>
                            </a>
                            <a className="pr-lg-0 pt-lg-1 float-right">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.continueToForecastSummary() }}><i className="fa fa-long-arrow-right" style={{ color: '#20a8d8', fontSize: '13px' }}></i> <small className="supplyplanformulas">{'Continue To Forecast Summary'}</small></span>
                            </a> */}

                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/report/compareAndSelectScenario" className='supplyplanformulas'>{i18n.t('static.forecastOutput.compareAndSelectForecast')}</a> </span>
                            <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/forecastReport/forecastSummary" className='supplyplanformulas'>{i18n.t('static.commitTree.forecastSummary')}</a></span><br />

                        </div>
                    </div>
                    <div className='col-md-12 pt-lg-2 pb-lg-3'>
                        <span className="pr-lg-0 pt-lg-1">{i18n.t('static.placeholder.monthlyForecastReport')}</span>
                    </div>
                    {/* <div className="Card-header-reporticon ">
                        <div className="card-header-actions">
                            <a className="pr-lg-0 pt-lg-1">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.continueToForecastSummary() }}><i className="fa fa-long-arrow-right" style={{ color: '#20a8d8', fontSize: '13px' }}></i> <small className="supplyplanformulas">{'Continue To Forecast Summary'}</small></span>
                            </a>
                        </div>
                    </div> */}
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.versionFinal*')}</Label>
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span>
                                                    <i> (Forecast: {this.state.forecastPeriod})</i>
                                                </Label>
                                                <div className="controls edit">

                                                    <Picker
                                                        ref="pickRange"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                        value={rangeValue}
                                                        lang={pickerLang}
                                                        //theme="light"
                                                        key={JSON.stringify(rangeValue)}
                                                        onChange={this.handleRangeChange}
                                                        onDismiss={this.handleRangeDissmis}
                                                    >
                                                        <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                    </Picker>
                                                </div>
                                            </FormGroup>

                                            {/* <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="text"
                                                            name="forecastPeriod"
                                                            id="forecastPeriod"
                                                            value={this.state.forecastPeriod}
                                                            bsSize="sm"
                                                            disabled={true}

                                                        >
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup> */}



                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.forecastReport.yAxisInEquivalencyUnit')}  <i class="fa fa-info-circle icons pl-lg-2" id="Popover1" onClick={this.toggleEu} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="yaxisEquUnit"
                                                            id="yaxisEquUnit"
                                                            bsSize="sm"
                                                            value={this.state.yaxisEquUnit}
                                                            // onChange={this.filterData}
                                                            onChange={(e) => { this.yAxisChange(e); }}
                                                        >
                                                            <option value="-1">{i18n.t('static.program.no')}</option>
                                                            {equivalencyUnitList1}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpen} target="Popover1" trigger="hover" toggle={this.toggleEu}>
                                                    <PopoverBody>{i18n.t('static.tooltip.yAxisInEquivalencyUnit')}</PopoverBody>
                                                </Popover>
                                            </div>

                                            {/* <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Y axis in equivalency unit</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="yaxisEquUnit"
                                                            id="yaxisEquUnit"
                                                            bsSize="sm"
                                                            value={this.state.yaxisEquUnit}
                                                            // onChange={this.filterData}
                                                            onChange={(e) => { this.yAxisChange(e); }}
                                                        >
                                                            <option value="1">{i18n.t('static.program.yes')}</option>
                                                            <option value="2">{i18n.t('static.program.no')}</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3" id="equivalencyUnitDiv" style={{ display: "none" }}>
                                                <Label htmlFor="appendedInputButton">Equivalency Unit</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="equivalencyUnitId"
                                                            id="equivalencyUnitId"
                                                            value={this.state.equivalencyUnitId}
                                                            onChange={this.getPlanningUnitForecastingUnit}
                                                            bsSize="sm"
                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {equivalencyUnitList1}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup> */}

                                            <FormGroup className="col-md-3">
                                                {/* <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}  <i class="fa fa-info-circle icons pl-lg-2" id="Popover2" onClick={this.toggleRv} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label> */}
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
                                            {/* <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpen1} target="Popover2" trigger="hover" toggle={this.toggleRv}>
                                                    <PopoverBody>Need to add Info.</PopoverBody>
                                                </Popover>
                                            </div> */}
                                            <FormGroup className="col-md-3" id="forecastingUnitDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.product.unit1')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls ">
                                                    {/* <InputGroup className="box"> */}
                                                    <MultiSelect
                                                        name="foreccastingUnitId"
                                                        id="forecastingUnitId"
                                                        onChange={(e) => this.setForecastingUnit(e)}
                                                        options={forecastingUnitList && forecastingUnitList.length > 0 ? forecastingUnitList : []}
                                                        value={this.state.forecastingUnitValues}
                                                        filterOptions={this.filterOptions}
                                                        labelledBy={i18n.t('static.common.select')}
                                                        disabled={this.state.loading}
                                                    />

                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3" id="planningUnitDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls ">
                                                    {/* <InputGroup className="box"> */}
                                                    <MultiSelect
                                                        name="planningUnitId"
                                                        id="planningUnitId"
                                                        options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                        value={this.state.planningUnitValues}
                                                        filterOptions={this.filterOptions}
                                                        onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                        labelledBy={i18n.t('static.common.select')}
                                                        disabled={this.state.loading}
                                                    />

                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.forecastReport.xAxisAggregateByYear')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="xaxis"
                                                            id="xaxis"
                                                            bsSize="sm"
                                                            value={this.state.xaxis}
                                                            onChange={(e) => { this.xAxisChange(e); }}
                                                        // onChange={this.filterData}
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
                                <br></br>

                                <br></br>
                                <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div className="row">
                                        {this.state.consumptionData.length > 0
                                            &&
                                            <div className="col-md-12 p-0">
                                                <div className="col-md-12 pl-lg-0">
                                                    <div className="chart-wrapper chart-graph-report pl-lg-4">
                                                        <Bar id="cool-canvas" data={bar} options={chartOptions}
                                                        // datasetKeyProvider={this.getIndexAsKey}
                                                        />
                                                        <div>

                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <button className="mr-1 mb-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                                        {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                                    </button>

                                                </div>
                                            </div>
                                        }




                                    </div>



                                    <div className="row">
                                        <div className="col-md-12 pl-3 pr-3">
                                            {this.state.show &&
                                                <div className="table-scroll1">
                                                    <div className="table-wrap table-responsive">
                                                        {this.state.consumptionData.length > 0 &&
                                                            <Table className="table-bordered table-bordered1 text-center mt-2 overflowhide main-table " bordered size="sm" options={this.options} id="forecastOutputId">
                                                                <thead>
                                                                    <tr>
                                                                        <th className='Firstcolum'>{i18n.t('static.forecastReport.display')}</th>
                                                                        <th className=''>{i18n.t('static.program.region')}</th>
                                                                        <th className='Secondcolum'>{this.state.viewById == 1 ? i18n.t('static.product.product') : i18n.t('static.forecastingunit.forecastingunit')}</th>
                                                                        <th className='MonthlyForecastdWidth Thirdcolum'>{i18n.t('static.consumption.forcast')}</th>
                                                                        {this.state.xaxis == 2 && this.state.monthArrayList.map(item => (
                                                                            <th>{moment(item).format(DATE_FORMAT_CAP_WITHOUT_DATE)}</th>
                                                                        ))}
                                                                        {this.state.xaxis == 1 && this.state.monthArrayList.map(item => (
                                                                            <th>{moment(item).format("YYYY")}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {this.state.xaxis == 2 && this.state.consumptionData.map((item, index) => (
                                                                        <tr>
                                                                            <td className="sticky-col first-col clone Firstcolum" align="center"><input type="checkbox" id={"planningUnitCheckbox" + item.objUnit.id} checked={item.display} onChange={() => this.planningUnitCheckedChanged(item.objUnit.id, item.region.regionId)} /></td>
                                                                            <td className="" style={{ textAlign: 'left' }}>{item.region.label.label_en}</td>
                                                                            {/* <td className="sticky-col first-col clone Secondcolum" style={{ textAlign: 'left' }}>{item.display && <i class="fa fa-circle" style={{ color: backgroundColor[countVar] }} aria-hidden="true"></i>} {" "} {item.objUnit.label.label_en}</td> */}
                                                                            <td className="sticky-col first-col clone Secondcolum" style={{ textAlign: 'left' }}>{item.graphId != -1 && <i class="fa fa-circle" style={{ color: backgroundColor[item.graphId] }} aria-hidden="true"></i>} {" "} {item.objUnit.label.label_en}</td>
                                                                            <td className='text-left sticky-col first-col clone Thirdcolum'>{item.scenario.label}</td>
                                                                            {this.state.monthArrayList.map(item1 => (
                                                                                <td>{item.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? <NumberFormat displayType={'text'} thousandSeparator={true} value={item.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty} /> : ""}</td>
                                                                            ))}
                                                                            {/* <td style={{ display: 'none' }}>{(item.display == true ? countVar++ : '')}</td> */}
                                                                            {/* <td style={{ display: 'none' }}>{(this.state.consumptionData[index + 1] != undefined ? (this.state.consumptionData[index + 1].objUnit.id == item.objUnit.id || item.display == false ? '' : countVar++) : '')}{(item.display == false ? (this.state.consumptionData[index - 1] != undefined ? (this.state.consumptionData[index - 1].objUnit.id == item.objUnit.id ? countVar++ : '') : '') : '')}</td> */}
                                                                            <td></td>
                                                                        </tr>
                                                                    ))}
                                                                    {this.state.yaxisEquUnit > 0 && this.state.xaxis == 2 &&
                                                                        <tr>
                                                                            <td className="sticky-col first-col clone Firstcolum"></td>
                                                                            <td className=""></td>
                                                                            <td style={{ textAlign: 'left' }} className="sticky-col first-col clone Secondcolum"><b>{i18n.t('static.supplyPlan.total')} {" " + this.state.equivalencyUnitLabel}</b></td>
                                                                            <td className='text-left sticky-col first-col clone Thirdcolum'></td>
                                                                            {this.state.monthArrayList.map(item1 => (
                                                                                <td><b>{this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? <NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty} /> : ""}</b></td>
                                                                            ))}

                                                                        </tr>
                                                                    }

                                                                    {this.state.xaxis == 1 && this.state.consumptionData.map((item, index) => (
                                                                        <tr>
                                                                            <td className="sticky-col first-col clone Firstcolum" align="center"><input type="checkbox" id={"planningUnitCheckbox" + item.objUnit.id} checked={item.display} onChange={() => this.planningUnitCheckedChanged(item.objUnit.id, item.region.regionId)} /></td>
                                                                            <td className="" style={{ textAlign: 'left' }}>{item.region.label.label_en}</td>
                                                                            {/* <td className="sticky-col first-col clone Secondcolum" style={{ textAlign: 'left' }}>{item.display && <i class="fa fa-circle" style={{ color: backgroundColor[countVar1] }} aria-hidden="true"></i>} {" "} {item.objUnit.label.label_en}</td> */}
                                                                            <td className="sticky-col first-col clone Secondcolum" style={{ textAlign: 'left' }}>{item.graphId != -1 && <i class="fa fa-circle" style={{ color: backgroundColor[item.graphId] }} aria-hidden="true"></i>} {" "} {item.objUnit.label.label_en}</td>
                                                                            <td className='text-left sticky-col first-col clone Thirdcolum'>{item.scenario.label}</td>
                                                                            {this.state.monthArrayList.map(item1 => (
                                                                                <td>{item.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY")).length > 0 ? <NumberFormat displayType={'text'} thousandSeparator={true} value={item.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY"))[0].consumptionQty} /> : ""}</td>
                                                                            ))}
                                                                            {/* <td style={{ display: 'none' }}>{(item.display == true ? countVar1++ : '')}</td> */}
                                                                            {/* <td style={{ display: 'none' }}>{(this.state.consumptionData[index + 1] != undefined ? (this.state.consumptionData[index + 1].objUnit.id == item.objUnit.id ? '' : countVar1++) : '')}</td> */}
                                                                            {/* <td style={{ display: 'none' }}>{(this.state.consumptionData[index + 1] != undefined ? (this.state.consumptionData[index + 1].objUnit.id == item.objUnit.id || item.display == false ? '' : countVar1++) : '')}{(item.display == false ? (this.state.consumptionData[index - 1] != undefined ? (this.state.consumptionData[index - 1].objUnit.id == item.objUnit.id ? countVar1++ : '') : '') : '')}</td> */}
                                                                            <td></td>
                                                                        </tr>
                                                                    ))}
                                                                    {this.state.yaxisEquUnit > 0 && this.state.xaxis == 1 &&
                                                                        <tr>
                                                                            <td className="sticky-col first-col clone Firstcolum"></td>
                                                                            <td className=""></td>
                                                                            <td className="sticky-col first-col clone Secondcolum" style={{ textAlign: 'left' }}><b>Total {" " + this.state.equivalencyUnitLabel}</b></td>
                                                                            <td className='text-left sticky-col first-col clone Thirdcolum'></td>
                                                                            {this.state.monthArrayList.map(item1 => (
                                                                                <td>{this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY")).length > 0 ? <NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY"))[0].consumptionQty} /> : ""}</td>
                                                                            ))}

                                                                        </tr>
                                                                    }

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
                <Modal isOpen={this.state.showGuidance}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                        <strong className="TextWhite">Show Guidance</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                           <div>
                               <h3 className='ShowGuidanceHeading'>Monthly Forecast</h3>
                           </div>
                            <p>
                                <p style={{fontSize:'13px'}}><span className="UnderLineText">Purpose :</span> Enable users to view the final (selected) forecasts for a single program, and displays the forecast by product and month. This output aggregates all regional forecasts into one total forecast. If you want to view disaggregated regional forecasts, you can do so by exporting the output as a CSV.</p>
                            </p>
                            <p style={{fontSize:'13px'}}>
                                <p style={{fontSize:'13px'}}><span className="UnderLineText">Using this screen :</span></p>
                               <p>
                                   <ul>
                                       <li>Only selected forecasts will be shown in this output. To select a forecast for a product, go to the '<a href='/#/report/compareAndSelectScenario' target="_blank" style={{textDecoration:'underline'}}>Compare and Select Forecast</a>' screen. To see total forecasts across products, go to the '<a href='/#/forecastReport/forecastSummary' target="_blank" style={{textDecoration:'underline'}}>Forecast Summary</a>' screen.</li>
                                       <li>The <b>Report Period</b> will be used to determine the period of time that you would like to see in the graphical/tabular output and must be within the forecast period. </li>
                                       <li>Use the parameters to view the graph/tabular data either by forecasting units or planning units as well as showing the y-axis in equivalency units. </li>
                                       <li><b>Equivalency Units </b>(EUs) allow users to aggregate data across planning units or forecasting units that are different but have the same equivalency unit. For a further explanation of Equivalency Units, refer to the show guidance in the <a href='/#/equivalancyUnit/listEquivalancyUnit' target="_blank" style={{textDecoration:'underline'}}>Equivalency Units</a> screen.</li>
                                       <li>The 'X-axis Aggregate By Year' filter allows you to view the data aggregated by year instead of by month.</li>
                                       <li>For the graph view, there are 3 ways you can hide which products are being displayed: 
                                            <ul style={{listStyle:'none'}}>
                                               <li>1. Use the filter at the top to select the product(s). </li>
                                               <li>2. Click on a product in the legend of the graph. </li>
                                               <li>3. Uncheck the 'Display' checkbox on the far left of the tabular view.</li>
                                           </ul>
                                       </li>
                                   </ul>
                               </p>
                            </p>
 
                        </ModalBody>
                    </div>
                </Modal>
            </div >
        );
    }
}

export default ForecastOutput;