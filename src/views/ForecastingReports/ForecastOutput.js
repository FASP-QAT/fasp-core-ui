import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import NumberFormat from 'react-number-format';
import {
    Card,
    CardBody,
    Col,
    Form,
    FormGroup, Input, InputGroup,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Popover,
    PopoverBody,
    Table
} from 'reactstrap';
import showguidanceforecastOutputEn from '../../../src/ShowGuidanceFiles/ForecastOutputEn.html';
import showguidanceforecastOutputFr from '../../../src/ShowGuidanceFiles/ForecastOutputFr.html';
import showguidanceforecastOutputPr from '../../../src/ShowGuidanceFiles/ForecastOutputPr.html';
import showguidanceforecastOutputSp from '../../../src/ShowGuidanceFiles/ForecastOutputSp.html';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, PROGRAM_TYPE_DATASET, SECRET_KEY, TITLE_FONT } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import EquivalancyUnitService from "../../api/EquivalancyUnitService";
import ForecastingUnitService from '../../api/ForecastingUnitService';
import PlanningUnitService from '../../api/PlanningUnitService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, makeText } from '../../CommonComponent/JavascriptCommonFunctions';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
/**
 * Component for forecast output report
 */
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
            allForecastingUnits:[],
            forecastingUnitValues: [],
            forecastingUnitLabels: [],
            downloadedProgramData: [],
            equivalencyUnitList: [],
            equivalencyUnitListFull: [],
            programEquivalencyUnitList: [],
            equivalencyUnitLabel: '',
            calculateEquivalencyUnitTotal: [],
            lang: localStorage.getItem('lang'),
            allProgramList: [],
            filteredProgramEQList: [],
            graphConsumptionData: [],
        };
        this.getPrograms = this.getPrograms.bind(this);
        this.filterData = this.filterData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setViewById = this.setViewById.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.setForecastingUnit = this.setForecastingUnit.bind(this);
        this.yAxisChange = this.yAxisChange.bind(this);
        this.xAxisChange = this.xAxisChange.bind(this);
        this.getEquivalencyUnitData = this.getEquivalencyUnitData.bind(this);
        this.calculateEquivalencyUnitTotal = this.calculateEquivalencyUnitTotal.bind(this);
        this.toggleEu = this.toggleEu.bind(this);
        this.setForecastPeriod = this.setForecastPeriod.bind(this);
        this.addGraphConsumptionData = this.addGraphConsumptionData.bind(this);
        this.addGraphId = this.addGraphId.bind(this);
    }
    /**
     * Calculates the total consumption quantity for each consumption date.
     * Updates the state with the calculated total consumption quantities.
     */
    calculateEquivalencyUnitTotal() {
        let consumptionData = this.state.consumptionData;
        let consumptionList = consumptionData.filter(c => c.display == true).map(v => v.consumptionList);
        let monthDataList = [];
        for (var i = 0; i < consumptionList.length; i++) {
            monthDataList = monthDataList.concat(consumptionList[i]);
        }
        let resultTrue = Object.values(monthDataList.reduce((a, { consumptionDate, consumptionQty }) => {
            if (!a[consumptionDate])
                a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
            else
                a[consumptionDate].consumptionQty = parseInt(a[consumptionDate].consumptionQty) + parseInt(consumptionQty);
            return a;
        }, {}));
        let result1 = resultTrue.map(m => {
            return {
                consumptionDate: m.consumptionDate,
                consumptionQty: parseInt(m.consumptionQty)
            }
        });
        if (this.state.xaxis == 2) {
            this.setState({
                calculateEquivalencyUnitTotal: result1
            }, () => {
            })
        } else {
            let tempConsumptionListData = resultTrue;
            let resultTrue1 = Object.values(tempConsumptionListData.reduce((a, { consumptionDate, consumptionQty }) => {
                if (!a[consumptionDate])
                    a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                else
                    a[consumptionDate].consumptionQty = parseInt(a[consumptionDate].consumptionQty) + parseInt(consumptionQty);
                return a;
            }, {}));
            let result = resultTrue1.map(m => {
                return {
                    consumptionDate: m.consumptionDate,
                    consumptionQty: parseInt(m.consumptionQty)
                }
            });
            this.setState({
                calculateEquivalencyUnitTotal: result
            }, () => {
            })
        }
    }
    /**
     * Handles the change in checked state of a planning unit.
     * Updates the display property of the corresponding consumption data entry.
     * Recalculates total consumption quantities and updates the state.
     * @param {number} id - The ID of the planning unit.
     * @param {number} regionId - The ID of the region associated with the planning unit.
     */
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
    /**
     * Fetches the equivalency unit data based on the selected program ID and version ID.
     * Updates the state with the fetched data and triggers data filtering.
     */
    getEquivalencyUnitData() {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        this.setState({
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
                        planningunitRequest.onerror = function (event) {
                        };
                        planningunitRequest.onsuccess = function (e) {
                            var myResult = [];
                            myResult = planningunitRequest.result;
                            var filteredEquList = []
                            for (var i = 0; i < myResult.length; i++) {
                                if (myResult[i].program != null) {
                                    if (myResult[i].program.id == programId && myResult[i].active == true) {
                                        filteredEquList.push(myResult[i]);
                                    }
                                } else {
                                    filteredEquList.push(myResult[i]);
                                }
                            }
                            let fuList = this.state.allForecastingUnits;
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
                            var lang = this.state.lang;
                            this.setState({
                                equivalencyUnitList: filteredEQUnit.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                equivalencyUnitListFull:filteredEQUnit,
                                programEquivalencyUnitList: filteredEquList,
                            }, () => {
                                this.filterData();
                            })
                        }.bind(this);
                    }.bind(this)
                } else {
                    EquivalancyUnitService.getEquivalancyUnitMappingList().then(response => {
                        if (response.status == 200) {
                            var listArray = response.data;
                            listArray.sort((a, b) => {
                                var itemLabelA = getLabelText(a.equivalencyUnit.label, this.state.lang).toUpperCase();
                                var itemLabelB = getLabelText(b.equivalencyUnit.label, this.state.lang).toUpperCase();
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
                            let fuList = this.state.allForecastingUnits;
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
                            var lang = this.state.lang;
                            this.setState({
                                equivalencyUnitList: filteredEQUnit.sort(function (a, b) {
                                    a = getLabelText(a.label, lang).toLowerCase();
                                    b = getLabelText(b.label, lang).toLowerCase();
                                    return a < b ? -1 : a > b ? 1 : 0;
                                }),
                                equivalencyUnitListFull:listArray,
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
                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
    /**
     * Handles the change event when the user selects a new value for the y-axis equivalency unit.
     * Updates the state with the new y-axis equivalency unit value and triggers data retrieval and filtering.
     * @param {Object} e - The event object containing the selected value for the y-axis equivalency unit.
     */
    yAxisChange(e) {
        var yaxisEquUnit = e.target.value;
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
            if (yaxisEquUnit > 0) {
                this.getPlanningUnitForecastingUnit();
            } else {
                this.getPlanningUnitForecastingUnit();
                this.filterData();
            }
        })
    }
    /**
     * Handles the change event when the user selects a new value for the x-axis equivalency unit.
     * Updates the state with the new x-axis equivalency unit value and triggers data filtering.
     * @param {Object} e - The event object containing the selected value for the x-axis equivalency unit.
     */
    xAxisChange(e) {
        var xaxisEquUnit = e.target.value;
        this.setState({
            xaxis: xaxisEquUnit
        }, () => {
            this.filterData();
        })
    }
    /**
     * Sets the selected forecasting unit values and labels based on the user's selection.
     * Sorts the forecasting unit values in ascending order by their numeric values.
     * Updates the state with the selected forecasting unit values and labels, then triggers data filtering.
     * @param {Array} event - An array containing the selected forecasting unit values and labels.
     */
    setForecastingUnit = (event) => {
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
    /**
     * Toggles the 'show' state between true and false.
     * This function is used to toggle the visibility of a component or element.
     */
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (this.state.programs.filter(c => c.id == this.state.programId)[0].code + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ': ' + this.state.forecastPeriod).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ': ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.forecastReport.yAxisInEquivalencyUnit') + ': ' + document.getElementById("yaxisEquUnit").selectedOptions[0].text).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('"' + (i18n.t('static.common.display') + ': ' + document.getElementById("viewById").selectedOptions[0].text).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('"' + (i18n.t('static.forecastReport.xAxisAggregateByYear') + ': ' + document.getElementById("xaxis").selectedOptions[0].text).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('')
        const headers = [];
        (this.state.viewById == 1 ? headers.push((i18n.t('static.product.product')).replaceAll(' ', '%20')) : headers.push((i18n.t('static.forecastingunit.forecastingunit')).replaceAll(' ', '%20')));
        headers.push(i18n.t('static.consumption.forcast'));
        {
            this.state.xaxis == 2 && this.state.monthArrayList.map(item => (
                headers.push(("\'").concat(moment(item).format(DATE_FORMAT_CAP_WITHOUT_DATE)))
            ))
        }
        {
            this.state.xaxis == 1 && this.state.monthArrayList.map(item => (
                headers.push(moment(item).format("YYYY"))
            ))
        }
        var A = [addDoubleQuoteToRowContent(headers)]
        this.state.xaxis == 2 && this.state.consumptionData.map(ele => {
            let propertyName = this.state.monthArrayList.map(item1 => (
                ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? ((ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty) == 'NAN' || Number.isNaN((ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty)) ? '' : (ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty)) : ''
            ));
            propertyName = propertyName.map(ele1 => ele1 == '' ? '' : Number(ele1).toFixed(2))
            return (A.push(addDoubleQuoteToRowContent([
                ((getLabelText(ele.objUnit.label, this.state.lang)).replaceAll(',', ' ')).replaceAll(' ', '%20').replaceAll('#', '%23'),
                ((ele.scenario.label != null ? ele.scenario.label : "").replaceAll(',', ' ')).replaceAll(' ', '%20').replaceAll('#', '%23'),
            ].concat(propertyName))))
        }
        );
        if (this.state.yaxisEquUnit > 0 && this.state.xaxis == 2) {
            let propertyName = this.state.monthArrayList.map(item1 => (
                this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty : ''
            ));
            propertyName = propertyName.map(ele1 => ele1 == '' ? '' : Number(ele1).toFixed(2))
            A.push(addDoubleQuoteToRowContent([
                ((i18n.t('static.supplyPlan.total') + this.state.equivalencyUnitLabel).replaceAll(',', ' ')).replaceAll(' ', '%20').replaceAll('#', '%23'),
                '',
            ].concat(propertyName)));
        }
        this.state.xaxis == 1 && this.state.consumptionData.map(ele => {
            let propertyName = this.state.monthArrayList.map(item1 => (
                ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY")).length > 0 ? ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY"))[0].consumptionQty : ''
            ));
            propertyName = propertyName.map(ele1 => ele1 == '' ? '' : Number(ele1).toFixed(2))
            return (
                A.push(addDoubleQuoteToRowContent([
                    ((getLabelText(ele.objUnit.label, this.state.lang)).replaceAll(',', ' ')).replaceAll(' ', '%20').replaceAll('#', '%23'),
                    ((ele.scenario.label).replaceAll(',', ' ')).replaceAll(' ', '%20').replaceAll('#', '%23'),
                ].concat(propertyName)))
            )
        }
        );
        if (this.state.yaxisEquUnit > 0 && this.state.xaxis == 1) {
            let propertyName = this.state.monthArrayList.map(item1 => (
                this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY")).length > 0 ? this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY"))[0].consumptionQty : ''
            ));
            propertyName = propertyName.map(ele1 => ele1 == '' ? '' : Number(ele1).toFixed(2))
            A.push(addDoubleQuoteToRowContent([
                ((i18n.t('static.supplyPlan.total') + this.state.equivalencyUnitLabel).replaceAll(',', ' ')).replaceAll(' ', '%20').replaceAll('#', '%23'),
                '',
            ].concat(propertyName)));
        }
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = this.state.programs.filter(c => c.id == this.state.programId)[0].code + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.dashboard.monthlyForecast') + ".csv"
        document.body.appendChild(a)
        a.click();
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
                doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.supplyPlan.runDate') + "</b> " + moment(new Date()).format(`${DATE_FORMAT_CAP}`) + "</font></span>", doc.internal.pageSize.width - 150, 20)
                doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.supplyPlan.runTime') + "</b> " + moment(new Date()).format('hh:mm A') + "</font></span>", doc.internal.pageSize.width - 150, 30)
                doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.user.user') + ":</b> " + AuthenticationService.getLoggedInUsername() + "</font></span>", doc.internal.pageSize.width - 150, 40)
                doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + this.state.programs.filter(c => c.id == this.state.programId)[0].code + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "</b> " + "</font></span>", doc.internal.pageSize.width - 150, 50)
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.monthlyForecast'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.common.forecastPeriod') + ":</b> " + this.state.forecastPeriod + "</font></span>", (doc.internal.pageSize.width / 8) - 50, 100)
                    doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.report.dateRange') + ":</b> " + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to) + "</font></span>", (doc.internal.pageSize.width / 8) - 50, 110)
                    doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.forecastReport.yAxisInEquivalencyUnit') + ":</b> " + document.getElementById("yaxisEquUnit").selectedOptions[0].text + "</font></span>", (doc.internal.pageSize.width / 8) - 50, 120)
                    doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.common.display') + ":</b> " + document.getElementById("viewById").selectedOptions[0].text + "</font></span>", (doc.internal.pageSize.width / 8) - 50, 130)
                    doc.fromHTML("<span style = 'font-family:helvetica;'><font size = '1' color = '#002f6c'><b>" + i18n.t('static.forecastReport.xAxisAggregateByYear') + ":</b> " + document.getElementById("xaxis").selectedOptions[0].text + "</font></span>", (doc.internal.pageSize.width / 8) - 50, 140)
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size);
        doc.setFontSize(8);
        var canvas = document.getElementById("cool-canvas");
        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 100;
        var aspectwidth1 = (width - h1);
        doc.addImage(canvasImg, 'png', 50, 170, 750, 260, 'CANVAS');
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
                ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? ((ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty) == 'NAN' || (ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty) == null || Number.isNaN((ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty)) ? '' : (ele.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")) : ''
            ));
            propertyName = propertyName.map(ele1 => ele1 == '' ? '' : Number(ele1.replace(',', '')).toFixed(2))
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
        if (this.state.yaxisEquUnit > 0 && this.state.xaxis == 2) {
            A = [];
            let propertyName = this.state.monthArrayList.map(item1 => (
                this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? (this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : ''
            ));
            propertyName = propertyName.map(ele1 => ele1 == '' ? '' : Number(ele1.replace(',', '')).toFixed(2))
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
            propertyName = propertyName.map(ele1 => ele1 == '' ? '' : Number(ele1.replace(',', '')).toFixed(2))
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
            propertyName = propertyName.map(ele1 => ele1 == '' ? '' : Number(ele1.replace(',', '')).toFixed(2))
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
        doc.save(this.state.programs.filter(c => c.id == this.state.programId)[0].code + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.dashboard.monthlyForecast') + ".pdf")
    }
    /**
     * Adds a unique graph ID to each item in the consumption data.
     * The graph ID is used for identifying items in the graph.
     */
    addGraphId() {
        let consumptionData1 = this.state.consumptionData;
        if (consumptionData1.length > 0) {
            let planningUnitIdList = consumptionData1.map(c => c.objUnit.id);
            let uniquePlanningUnitIdList = [...new Set(planningUnitIdList)];
            let tempConsumptionData = [];
            let count = 0;
            for (var i = 0; i < consumptionData1.length; i++) {
                let index = uniquePlanningUnitIdList.findIndex(c => c == consumptionData1[i].objUnit.id);
                index = index - count;
                let jsonTemp = { objUnit: consumptionData1[i].objUnit, scenario: consumptionData1[i].scenario, display: consumptionData1[i].display, color: consumptionData1[i].color, consumptionList: consumptionData1[i].consumptionList, region: consumptionData1[i].region, graphId: (consumptionData1[i].display == false || consumptionData1[i].scenario.id == 0 ? -1 : index) }
                tempConsumptionData.push(jsonTemp);
            }
            this.setState({
                consumptionData: tempConsumptionData
            }, () => {
            });
        }
    }
    /**
     * Constructs graph consumption data from the filtered consumption data.
     * Filters out items with display set to false and scenarios with ID equal to 0.
     */
    addGraphConsumptionData() {
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
                let resultTrue1 = Object.values(localConsumptionList.reduce((a, { consumptionDate, consumptionQty }) => {
                    if (!a[consumptionDate])
                        a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                    else
                        a[consumptionDate].consumptionQty += consumptionQty;
                    return a;
                }, {}));
                let jsonTemp = { objUnit: tempData[0].objUnit, scenario: tempData[0].scenario, display: tempData[0].display, color: tempData[0].color, consumptionList: resultTrue1, region: tempData[0].region, graphId: i }
                graphConsumptionData.push(jsonTemp);
            }
            this.setState({
                graphConsumptionData: graphConsumptionData
            }, () => {
            })
        }
    }
    /**
     * Builds the data based on the selected filters
     */
    filterData() {
        let planningUnitIds = this.state.planningUnitValues.map(ele => (ele.value).toString())
        let forecastingUnitIds = this.state.forecastingUnitValues.map(ele => (ele.value))
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        let viewById = document.getElementById("viewById").value;
        let yaxisEquUnitId = document.getElementById("yaxisEquUnit").value;
        let xaxisId = document.getElementById("xaxis").value;
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
                    };
                    getRequest.onsuccess = function (event) {
                        var myResult = [];
                        myResult = getRequest.result;
                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                        var filteredGetRequestList = myResult.filter(c => c.userId == userId);
                        for (var i = 0; i < filteredGetRequestList.length; i++) {
                            var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson1 = JSON.parse(programData);
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
                                regionList: programJson1.regionList,
                                label: programJson1.label,
                                realmCountry: programJson1.realmCountry,
                            });
                            datasetList1.push(filteredGetRequestList[i])
                        }
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
                            let filteredProgram = this.state.datasetList.filter(c => c.programId == programId && c.versionId == (versionId.split('(')[0]).trim())[0];
                            var monthArrayList = [];
                            let cursorDate = startDate;
                            for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(endDate).format("YYYY-MM"); i++) {
                                var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                                cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
                                monthArrayList.push(dt);
                            }
                            let consumptionData = [];
                            if (viewById == 1) {
                                let planningUnitList = filteredProgram.planningUnitList;
                                let selectedPlanningUnit = this.state.planningUnitValues;
                                let treeList = filteredProgram.treeList;
                                let consumptionExtrapolation = filteredProgram.consumptionExtrapolation;
                                for (let i = 0; i < selectedPlanningUnit.length; i++) {
                                    let nodeDataMomList = [];
                                    let planningUniObj = planningUnitList.filter(c => c.planningUnit.id == selectedPlanningUnit[i].value)[0];
                                    let selectedForecastMap = planningUniObj.selectedForecastMap;
                                    let keys = Object.keys(selectedForecastMap);
                                    if (keys.length > 0) {
                                        for (let j = 0; j < keys.length; j++) {
                                            if (selectedForecastMap[keys[j]] != undefined && selectedForecastMap[keys[j]] != null && selectedForecastMap[keys[j]] != '') {
                                                let selectedForecastMapObjIn = (selectedForecastMap[keys[j]]);
                                                let treeId = selectedForecastMapObjIn.treeId;
                                                let scenarioId = selectedForecastMapObjIn.scenarioId;
                                                let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;
                                                if (scenarioId != null) {
                                                    for (let m = 0; m < treeList.length; m++) {
                                                        let filteredScenario = (treeList[m].treeId == treeId ? treeList[m].scenarioList.filter(c => c.id == scenarioId) : []);
                                                        if (filteredScenario.length > 0) {
                                                            let flatlist = treeList[m].tree.flatList;
                                                            let listContainNodeType5 = flatlist.filter(c => c.payload.nodeType.id == 5);
                                                            let myTempData = [];
                                                            for (let k = 0; k < listContainNodeType5.length; k++) {
                                                                let arrayOfNodeDataMap = (listContainNodeType5[k].payload.nodeDataMap[scenarioId]).filter(c => c.puNode.planningUnit.id == selectedPlanningUnit[i].value);
                                                                if (arrayOfNodeDataMap.length > 0) {
                                                                    nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;
                                                                    if (yaxisEquUnitId != -1) {
                                                                        let consumptionList = nodeDataMomList.map(m => {
                                                                            return {
                                                                                consumptionDate: m.month,
                                                                                consumptionQty: m.calculatedMmdValue
                                                                            }
                                                                        });
                                                                        myTempData = myTempData.concat(consumptionList);
                                                                    } else {
                                                                        let consumptionList = nodeDataMomList.map(m => {
                                                                            return {
                                                                                consumptionDate: m.month,
                                                                                consumptionQty: m.calculatedMmdValue
                                                                            }
                                                                        });
                                                                        myTempData = myTempData.concat(consumptionList);
                                                                    }
                                                                }
                                                            }
                                                            let resultTrue = Object.values(myTempData.reduce((a, { consumptionDate, consumptionQty }) => {
                                                                if (!a[consumptionDate])
                                                                    a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                                                else
                                                                    a[consumptionDate].consumptionQty += consumptionQty;
                                                                return a;
                                                            }, {}));
                                                            if (yaxisEquUnitId != -1) {
                                                                for (var rt = 0; rt < resultTrue.length; rt++) {
                                                                    let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUniObj.planningUnit.forecastingUnit.id)[0].convertToEu;
                                                                    resultTrue[rt].consumptionQty = (Number(resultTrue[rt].consumptionQty) * Number(planningUniObj.planningUnit.multiplier)) / Number(convertToEu);
                                                                }
                                                            }
                                                            if (resultTrue.length > 0) {
                                                                let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: resultTrue, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                consumptionData.push(jsonTemp);
                                                            } else {
                                                                let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: [], region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                consumptionData.push(jsonTemp);
                                                            }
                                                        }
                                                    }
                                                } else if (consumptionExtrapolationId != null) {
                                                    let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                    if (consumptionExtrapolationObj.length > 0) {
                                                        if (yaxisEquUnitId != -1) {
                                                            let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == planningUniObj.planningUnit.forecastingUnit.id)[0].convertToEu;
                                                            let consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                return {
                                                                    consumptionDate: m.month,
                                                                    consumptionQty: (m.amount == null ? 0 : (m.amount * Number(planningUniObj.planningUnit.multiplier) / convertToEu))
                                                                }
                                                            });
                                                            let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: consumptionExtrapolationObj[0].extrapolationMethod.id, label: '(' + consumptionExtrapolationObj[0].extrapolationMethod.label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: consumptionList, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                            consumptionData.push(jsonTemp);
                                                        } else {
                                                            let consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                return {
                                                                    consumptionDate: m.month,
                                                                    consumptionQty: (m.amount == null ? 0 : (m.amount))
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
                                    } else {
                                        let jsonTemp = { objUnit: planningUniObj.planningUnit, scenario: { id: 0, label: 'No forecast selected' }, display: false, color: "#ba0c2f", consumptionList: [], region: { label: { label_en: '' } }, graphId: 0 }
                                        consumptionData.push(jsonTemp);
                                    }
                                }
                            } else {
                                let planningUnitList = filteredProgram.planningUnitList;
                                let selectedForecastingUnit = this.state.forecastingUnitValues;
                                let treeList = filteredProgram.treeList;
                                let consumptionExtrapolation = filteredProgram.consumptionExtrapolation;
                                for (let i = 0; i < selectedForecastingUnit.length; i++) {
                                    let nodeDataMomList = [];
                                    let forecastingUniObj = planningUnitList.filter(c => c.planningUnit.forecastingUnit.id == selectedForecastingUnit[i].value);
                                    for (let l = 0; l < forecastingUniObj.length; l++) {
                                        let selectedForecastMap = forecastingUniObj[l].selectedForecastMap;
                                        let keys = Object.keys(selectedForecastMap);
                                        if (keys.length > 0) {
                                            for (let j = 0; j < keys.length; j++) {
                                                if (selectedForecastMap[keys[j]] != undefined && selectedForecastMap[keys[j]] != '' && selectedForecastMap[keys[j]] != null) {
                                                    let selectedForecastMapObjIn = (selectedForecastMap[keys[j]]);
                                                    let treeId = selectedForecastMapObjIn.treeId;
                                                    let scenarioId = selectedForecastMapObjIn.scenarioId;
                                                    let consumptionExtrapolationId = selectedForecastMapObjIn.consumptionExtrapolationId;
                                                    if (scenarioId != null) {
                                                        for (let m = 0; m < treeList.length; m++) {
                                                            let filteredScenario = (treeList[m].treeId == treeId ? treeList[m].scenarioList.filter(c => c.id == scenarioId) : []);
                                                            if (filteredScenario.length > 0) {
                                                                let flatlist = treeList[m].tree.flatList;
                                                                let listContainNodeType4 = flatlist.filter(c => c.payload.nodeType.id == 5);
                                                                let myTempData = [];
                                                                for (let k = 0; k < listContainNodeType4.length; k++) {
                                                                    let arrayOfNodeDataMap = (listContainNodeType4[k].payload.nodeDataMap[scenarioId]).filter(c => c.puNode.planningUnit.id == forecastingUniObj[l].planningUnit.id);
                                                                    if (arrayOfNodeDataMap.length > 0) {
                                                                        nodeDataMomList = arrayOfNodeDataMap[0].nodeDataMomList;
                                                                        if (yaxisEquUnitId != -1) {
                                                                            let consumptionList = nodeDataMomList.map(m => {
                                                                                return {
                                                                                    consumptionDate: m.month,
                                                                                    consumptionQty: m.calculatedMmdValue
                                                                                }
                                                                            });
                                                                            myTempData = myTempData.concat(consumptionList);
                                                                        } else {
                                                                            let consumptionList = nodeDataMomList.map(m => {
                                                                                return {
                                                                                    consumptionDate: m.month,
                                                                                    consumptionQty: m.calculatedMmdValue
                                                                                }
                                                                            });
                                                                            myTempData = myTempData.concat(consumptionList);
                                                                        }
                                                                    }
                                                                }
                                                                let resultTrue = Object.values(myTempData.reduce((a, { consumptionDate, consumptionQty }) => {
                                                                    if (!a[consumptionDate])
                                                                        a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                                                    else
                                                                        a[consumptionDate].consumptionQty += consumptionQty;
                                                                    return a;
                                                                }, {}));
                                                                for (var rt = 0; rt < resultTrue.length; rt++) {
                                                                    if (yaxisEquUnitId != -1) {
                                                                        let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == selectedForecastingUnit[i].value)[0].convertToEu;
                                                                        resultTrue[rt].consumptionQty = Number(Number(resultTrue[rt].consumptionQty) * Number(forecastingUniObj[l].planningUnit.multiplier)) / Number(convertToEu);
                                                                    } else {
                                                                        resultTrue[rt].consumptionQty = Number(resultTrue[rt].consumptionQty) * Number(forecastingUniObj[l].planningUnit.multiplier);
                                                                    }
                                                                }
                                                                if (resultTrue.length > 0) {
                                                                    let checkIdPresent = consumptionData.filter(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.treeId == treeId && c.scenarioId == scenarioId && c.region.regionId == keys[j]);
                                                                    if (checkIdPresent.length > 0) {
                                                                        let findIndex = consumptionData.findIndex(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.treeId == treeId && c.scenarioId == scenarioId && c.region.regionId == keys[j]);
                                                                        let alreadyPresentConsumptionList = consumptionData[findIndex].consumptionList.concat(resultTrue);
                                                                        let newAddedConsumptionList = Object.values(alreadyPresentConsumptionList.reduce((a, { consumptionDate, consumptionQty }) => {
                                                                            if (!a[consumptionDate])
                                                                                a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                                                            else
                                                                                a[consumptionDate].consumptionQty += consumptionQty;
                                                                            return a;
                                                                        }, {}));
                                                                        consumptionData[findIndex].consumptionList = newAddedConsumptionList;
                                                                    } else {
                                                                        let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: resultTrue, treeId: treeId, scenarioId: scenarioId, consumptionExtrapolationId: 0, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                        consumptionData.push(jsonTemp);
                                                                    }
                                                                } else {
                                                                    let checkIdPresent = consumptionData.filter(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.treeId == treeId && c.scenarioId == scenarioId && c.region.regionId == keys[j]);
                                                                    if (checkIdPresent.length > 0) {
                                                                    } else {
                                                                        let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 1, label: '(' + treeList[m].label.label_en + ' - ' + filteredScenario[0].label.label_en + ')' }, display: true, color: "#ba0c2f", consumptionList: [], treeId: treeId, scenarioId: scenarioId, consumptionExtrapolationId: 0, region: filteredProgram.regionList.filter(c => c.regionId == keys[j])[0], graphId: 0 }
                                                                        consumptionData.push(jsonTemp);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    } else if (consumptionExtrapolationId != null) {
                                                        let consumptionExtrapolationObj = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == consumptionExtrapolationId);
                                                        if (consumptionExtrapolationObj.length > 0) {
                                                            if (yaxisEquUnitId != -1) {
                                                                let convertToEu = this.state.filteredProgramEQList.filter(c => c.forecastingUnit.id == selectedForecastingUnit[i].value)[0].convertToEu;
                                                                let consumptionList = consumptionExtrapolationObj[0].extrapolationDataList.map(m => {
                                                                    return {
                                                                        consumptionDate: m.month,
                                                                        consumptionQty: (m.amount * forecastingUniObj[l].planningUnit.multiplier / convertToEu)
                                                                    }
                                                                });
                                                                let checkIdPresent = consumptionData.filter(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.consumptionExtrapolationId == consumptionExtrapolationId && c.region.regionId == keys[j]);
                                                                if (checkIdPresent.length > 0) {
                                                                    let findIndex = consumptionData.findIndex(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.consumptionExtrapolationId == consumptionExtrapolationId && c.region.regionId == keys[j]);
                                                                    let alreadyPresentConsumptionList = consumptionData[findIndex].consumptionList.concat(consumptionList);
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
                                                                        consumptionQty: (m.amount * forecastingUniObj[l].planningUnit.multiplier)
                                                                    }
                                                                });
                                                                let checkIdPresent = consumptionData.filter(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.consumptionExtrapolationId == consumptionExtrapolationId && c.region.regionId == keys[j]);
                                                                if (checkIdPresent.length > 0) {
                                                                    let findIndex = consumptionData.findIndex(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.consumptionExtrapolationId == consumptionExtrapolationId && c.region.regionId == keys[j]);
                                                                    let alreadyPresentConsumptionList = consumptionData[findIndex].consumptionList.concat(consumptionList);
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
                                                            let checkIdPresent = consumptionData.filter(c => c.objUnit.id == forecastingUniObj[l].planningUnit.forecastingUnit.id && c.consumptionExtrapolationId == consumptionExtrapolationId && c.region.regionId == keys[j]);
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
                                        } else {
                                            let jsonTemp = { objUnit: { id: forecastingUniObj[l].planningUnit.forecastingUnit.id, label: forecastingUniObj[l].planningUnit.forecastingUnit.label }, scenario: { id: 0, label: 'No forecast selected' }, display: false, color: "#ba0c2f", consumptionList: [], treeId: 0, scenarioId: 0, consumptionExtrapolationId: 0, region: { label: { label_en: '' } }, graphId: 0 }
                                            consumptionData.push(jsonTemp);
                                        }
                                    }
                                }
                            }
                            consumptionData.sort(function (a, b) {
                                a = a.objUnit.label.label_en.toLowerCase();
                                b = b.objUnit.label.label_en.toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            })
                            if (this.state.xaxis == 2) {
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
                            } else {
                                let min = moment(startDate).format("YYYY");
                                let max = moment(endDate).format("YYYY");
                                let years = [];
                                for (var i = min; i <= max; i++) {
                                    years.push("" + i)
                                }
                                let nextStartDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
                                let nextEndDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-28';
                                for (let i = 0; i < consumptionData.length; i++) {
                                    let nextConsumptionListData = consumptionData[i].consumptionList.filter(c => moment(c.consumptionDate).isBetween(nextStartDate, nextEndDate, null, '[)'))
                                    let tempConsumptionListData = nextConsumptionListData.map(m => {
                                        return {
                                            consumptionDate: moment(m.consumptionDate).format("YYYY"),
                                            consumptionQty: m.consumptionQty
                                        }
                                    });
                                    let resultTrue = Object.values(tempConsumptionListData.reduce((a, { consumptionDate, consumptionQty }) => {
                                        if (!a[consumptionDate])
                                            a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                        else
                                            a[consumptionDate].consumptionQty = Number(a[consumptionDate].consumptionQty) + Number(consumptionQty);
                                        return a;
                                    }, {}));
                                    consumptionData[i].consumptionList = resultTrue;
                                }
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
                        })
                    }.bind(this);
                }.bind(this);
            } else {
                let planningUnitsByFus = [];
                for (var fu = 0; fu < forecastingUnitIds.length; fu++) {
                    var puList = this.state.planningUnits.filter(c => c.forecastingUnit.id == forecastingUnitIds[fu]);
                    planningUnitsByFus = planningUnitsByFus.concat(puList);
                }
                let planningUnitIdsFu = planningUnitsByFus.map(ele => (ele.id).toString())
                let consumptionData = [];
                let inputJson = {
                    "programId": programId,
                    "versionId": versionId,
                    "startDate": startDate,
                    "stopDate": endDate,
                    "reportView": viewById == 1 ? viewById : 1,
                    "aggregateByYear": (xaxisId == 1 ? true : false),
                    "unitIds": (viewById == 1 ? planningUnitIds : planningUnitIdsFu)
                }
                ReportService.forecastOutput(inputJson)
                    .then(response => {
                        let primaryConsumptionData = response.data;
                        for (let i = 0; i < primaryConsumptionData.length; i++) {
                            var convertToEU=1;
                            if(yaxisEquUnitId != -1){
                                convertToEU=this.state.equivalencyUnitListFull.filter(c=>c.equivalencyUnit.equivalencyUnitId==yaxisEquUnitId && c.forecastingUnit.id==primaryConsumptionData[i].forecastingUnit.id)[0].convertToEu;
                            }
                            if (primaryConsumptionData[i].selectedForecast != null) {
                                let consumptionList = primaryConsumptionData[i].monthlyForecastData.map(m => {
                                    return {
                                        consumptionDate: m.month,
                                        consumptionQty: viewById == 1 ? (yaxisEquUnitId != -1?Number(m.consumptionQty)*Number(primaryConsumptionData[i].planningUnit.multiplier)/Number(convertToEU):m.consumptionQty) : yaxisEquUnitId != -1?Number(m.consumptionQty) * Number(primaryConsumptionData[i].planningUnit.multiplier)/Number(convertToEU):Number(m.consumptionQty) * Number(primaryConsumptionData[i].planningUnit.multiplier)
                                    }
                                });
                                let jsonTemp = { objUnit: (viewById == 1 ? primaryConsumptionData[i].planningUnit : primaryConsumptionData[i].forecastingUnit), scenario: { id: 1, label: primaryConsumptionData[i].selectedForecast.label_en }, display: true, color: "#ba0c2f", consumptionList: consumptionList, region: primaryConsumptionData[i].region, graphId: 0 }
                                consumptionData.push(jsonTemp);
                            } else {
                                let consumptionList = primaryConsumptionData[i].monthlyForecastData.map(m => {
                                    return {
                                        consumptionDate: m.month,
                                        consumptionQty: viewById == 1 ? (yaxisEquUnitId != -1?Number(m.consumptionQty)*Number(primaryConsumptionData[i].planningUnit.multiplier)/Number(convertToEU):m.consumptionQty) : yaxisEquUnitId != -1?Number(m.consumptionQty) * Number(primaryConsumptionData[i].planningUnit.multiplier)/Number(convertToEU):Number(m.consumptionQty) * Number(primaryConsumptionData[i].planningUnit.multiplier)                                        
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
                        consumptionData.sort(function (a, b) {
                            a = a.objUnit.label.label_en.toLowerCase();
                            b = b.objUnit.label.label_en.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        })
                        if (xaxisId == 1) {
                            let min = moment(startDate).format("YYYY");
                            let max = moment(endDate).format("YYYY");
                            let years = [];
                            for (var i = min; i <= max; i++) {
                                years.push("" + i)
                            }
                            let nextStartDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
                            let nextEndDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-28';
                            for (let i = 0; i < consumptionData.length; i++) {
                                let nextConsumptionListData = consumptionData[i].consumptionList.filter(c => moment(c.consumptionDate).isBetween(nextStartDate, nextEndDate, null, '[)'))
                                let tempConsumptionListData = nextConsumptionListData.map(m => {
                                    return {
                                        consumptionDate: moment(m.consumptionDate).format("YYYY"),
                                        consumptionQty: Number(m.consumptionQty)
                                    }
                                });
                                let resultTrue = Object.values(tempConsumptionListData.reduce((a, { consumptionDate, consumptionQty }) => {
                                    if (!a[consumptionDate])
                                        a[consumptionDate] = Object.assign({}, { consumptionDate, consumptionQty });
                                    else
                                        a[consumptionDate].consumptionQty = parseInt(a[consumptionDate].consumptionQty) + parseInt(consumptionQty);
                                    return a;
                                }, {}));
                                consumptionData[i].consumptionList = resultTrue;
                            }
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
                        } else {
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
        } else if (programId == -1) {
            this.setState({ message: i18n.t('static.common.selectProgram'), consumptionData: [], graphConsumptionData: [], monthArrayList: [], datasetList: [], datasetList1: [], versions: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnits: [], allForecastingUnits:[], forecastingUnitValues: [], forecastingUnitLabels: [], equivalencyUnitList: [], equivalencyUnitListFull:[], programId: '', versionId: '', forecastPeriod: '', yaxisEquUnit: -1 });
        } else if (versionId == -1) {
            this.setState({ message: i18n.t('static.program.validversion'), consumptionData: [], graphConsumptionData: [], monthArrayList: [], datasetList: [], datasetList1: [], planningUnits: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnits: [], allForecastingUnits:[], forecastingUnitValues: [], forecastingUnitLabels: [], equivalencyUnitList: [], equivalencyUnitListFull:[], versionId: '', forecastPeriod: '', yaxisEquUnit: -1 });
        } else if (viewById == 1 && planningUnitIds.length == 0) {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptionData: [], graphConsumptionData: [], monthArrayList: [], datasetList: [], datasetList1: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnitValues: [], forecastingUnitLabels: [] });
        } else if (viewById == 2 && forecastingUnitIds.length == 0) {
            this.setState({ message: i18n.t('static.planningunit.forcastingunittext'), consumptionData: [], graphConsumptionData: [], monthArrayList: [], datasetList: [], datasetList1: [], planningUnitValues: [], planningUnitLabels: [], forecastingUnitValues: [], forecastingUnitLabels: [] });
        }
    }
    /**
     * Reterives forecast programs from server
     */
    getPrograms() {
        if (localStorage.getItem("sessionType") === 'Online') {
            let realmId = AuthenticationService.getRealmId();
            DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_DATASET)
                .then(response => {
                    let datasetList = response.data;
                    this.setState({
                        programs: datasetList,
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => { this.consolidatedProgramList() })
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
            this.consolidatedProgramList()
            this.setState({ loading: false })
        }
    }
    /**
     * Consolidates server and local programs from indexed db
     */
    consolidatedProgramList = () => {
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
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                let downloadedProgramData = [];
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        programData.code = programData.programCode;
                        programData.id = programData.programId;
                        var f = 0
                        for (var k = 0; k < this.state.programs.length; k++) {
                            if (this.state.programs[k].id == programData.programId) {
                                f = 1;
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                        downloadedProgramData.push(programData);
                    }
                }
                if (proList.length == 1) {
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = (a.code).toLowerCase();
                            b = (b.code).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        downloadedProgramData: downloadedProgramData,
                        programId: proList[0].programId,
                    }, () => {
                        this.getVersionIds();
                    })
                } else {
                    if (this.props.match.params.programId != "" && this.props.match.params.programId != undefined) {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = (a.code).toLowerCase();
                                b = (b.code).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            programId: this.props.match.params.programId,
                            downloadedProgramData: downloadedProgramData,
                            loading: false
                        }, () => {
                            this.getVersionIds();
                        })
                    }
                    else if (localStorage.getItem("sesForecastProgramIdReport") != '' && localStorage.getItem("sesForecastProgramIdReport") != undefined) {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = (a.code).toLowerCase();
                                b = (b.code).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            downloadedProgramData: downloadedProgramData,
                            programId: localStorage.getItem("sesForecastProgramIdReport"),
                        }, () => {
                            this.getVersionIds();
                        })
                    } else {
                        this.setState({
                            programs: proList.sort(function (a, b) {
                                a = (a.code).toLowerCase();
                                b = (b.code).toLowerCase();
                                return a < b ? -1 : a > b ? 1 : 0;
                            }),
                            downloadedProgramData: downloadedProgramData
                        }, () => {
                            this.filterData();
                        })
                    }
                }
            }.bind(this);
        }.bind(this);
    }
    /**
     * Calls getPrograms function on component mount
     */
    componentDidMount() {
        this.getPrograms();
        document.getElementById("forecastingUnitDiv").style.display = "none";
    }
    /**
     * Sets the program ID in the component's state, resets related state variables, and triggers data filtering and version ID retrieval. 
     * @param {Event} event - The event object containing the selected program ID.
     */
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
            allForecastingUnits:[],
            foreastingUnitValues: [],
            foreastingUnitLabels: []
        }, () => {
            this.filterData();
            this.getVersionIds();
        })
    }
    /**
     * Reterives the planning unit and forecasting unit list
     */
    getPlanningUnitForecastingUnit = () => {
        let programId = document.getElementById("programId").value;
        let versionId = document.getElementById("versionId").value;
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
                    if (versionId.includes('Local')) {
                        let programData = this.state.downloadedProgramData.filter(c => c.programId == programId && c.currentVersion.versionId == (versionId.split('(')[0]).trim())[0];
                        let forecastingUnitListTemp = [];
                        var lang = this.state.lang;
                        let planningUnitActiveList = programData.planningUnitList.filter(c => c.active == true);
                        let planningUnitList = planningUnitActiveList.map(o => {
                            let planningUnitObj1 = o.planningUnit;
                            let planningUnitObj2 = { selectedForecastMap: o.selectedForecastMap };
                            return {
                                ...planningUnitObj1, ...planningUnitObj2
                            }
                        });
                        for (var i = 0; i < planningUnitList.length; i++) {
                            forecastingUnitListTemp.push(planningUnitList[i].forecastingUnit);
                        }
                        const ids = forecastingUnitListTemp.map(o => o.id);
                        const forecastingUnitList = forecastingUnitListTemp.filter(({ id }, index) => !ids.includes(id, index + 1));
                        let yaxisEquUnitId = document.getElementById("yaxisEquUnit").value;
                        if (yaxisEquUnitId != -1) {
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
                                allForecastingUnits:forecastingUnitList,
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
                        } else {
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
                                allForecastingUnits:forecastingUnitList,
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
                            }, () => {
                                this.getEquivalencyUnitData();
                                this.filterData();
                            })
                        }
                    }
                    else {
                        PlanningUnitService.getPlanningUnitListByProgramVersionIdForSelectedForecastMap(programId, versionId).then(response => {
                            var listArray = response.data;
                            listArray = listArray.map(c => c.planningUnit);
                            listArray.sort((a, b) => {
                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                                return itemLabelA > itemLabelB ? 1 : -1;
                            });
                            this.setState({
                                planningUnits: listArray,
                                message: ''
                            }, () => {
                                ForecastingUnitService.getForecastingUnitListByProgramVersionIdForSelectedForecastMap(programId, versionId).then(response => {
                                    var listArray = response.data;
                                    listArray = listArray.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i)
                                    listArray.sort((a, b) => {
                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    this.setState({
                                        forecastingUnits: listArray,
                                        allForecastingUnits:listArray,
                                        message: ''
                                    }, () => {
                                        let yaxisEquUnitId = document.getElementById("yaxisEquUnit").value;
                                        if (yaxisEquUnitId != -1) {
                                            let filteredProgramEQList = this.state.programEquivalencyUnitList.filter(c => c.equivalencyUnit.equivalencyUnitId == yaxisEquUnitId);
                                            let newPlanningUnitList = [];
                                            let newForecastingUnitList = [];
                                            let forecastingUnitList = this.state.allForecastingUnits;
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
                                                allForecastingUnits:listArray,
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
                                        } else {
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
    /**
     * Sets the forecast period based on the selected program ID and version ID, updating the component's state accordingly.
     */
    setForecastPeriod() {
        let programId = this.state.programId;
        let versionId = this.state.versionId;
        if (programId != -1 && (versionId.toString().includes('(') ? versionId.split('(')[0] : versionId) != -1) {
            if (versionId.toString().includes('Local')) {
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
                let forecastStopDate = new Date((month[d1.getMonth()] + '-' + d1.getFullYear()));
                forecastStopDate.setMonth(forecastStopDate.getMonth() - 1);
                let forecastStartDateNew = selectedForecastProgram.currentVersion.forecastStartDate;
                let forecastStopDateNew = selectedForecastProgram.currentVersion.forecastStopDate;
                let beforeEndDateDisplay = new Date(selectedForecastProgram.forecastStartDate);
                beforeEndDateDisplay.setMonth(beforeEndDateDisplay.getMonth() - 1);
                this.setState({
                    rangeValue: { from: { year: Number(moment(forecastStartDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStartDateNew).startOf('month').format("M")) }, to: { year: Number(moment(forecastStopDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStopDateNew).startOf('month').format("M")) } },
                    minDate: { year: Number(moment(forecastStartDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStartDateNew).startOf('month').format("M")) },
                    maxDate: { year: Number(moment(forecastStopDateNew).startOf('month').format("YYYY")), month: Number(moment(forecastStopDateNew).startOf('month').format("M")) },
                    forecastPeriod: month[Number(moment(forecastStartDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStartDateNew).startOf('month').format("YYYY")) + ' ~ ' + month[Number(moment(forecastStopDateNew).startOf('month').format("M")) - 1] + ' ' + Number(moment(forecastStopDateNew).startOf('month').format("YYYY")),
                }, () => { })
            } else {
                let currentProgramVersion = this.state.versions.filter(c => c.versionId == versionId)[0];
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
    /**
     * Sets the version ID based on the selected event, updating the component's state accordingly.
     * If the event is null, empty, or undefined, the function extracts the version ID from the current state.
     * @param {Event | null | string} event - The event triggered by selecting a version ID or null if not triggered by an event.
     */
    setVersionId(event) {
        var versionId = ((event == null || event == '' || event == undefined) ? ((this.state.versionId).toString().split('(')[0]) : (event.target.value.split('(')[0]).trim());
        versionId = parseInt(versionId);
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
                this.getPlanningUnitForecastingUnit();
            })
        } else {
            this.setState({
                versionId: event.target.value
            }, () => {
                this.setForecastPeriod();
                this.filterData();
                this.getPlanningUnitForecastingUnit()
            })
        }
    }
    /**
     * Reterives version list based on selected program
     */
    getVersionIds() {
        let programId = this.state.programId;
        if (programId != 0) {
            const program = this.state.programs.filter(c => c.id == programId)
            if (program.length == 1) {
                if (localStorage.getItem("sessionType") === 'Online') {
                    DropdownService.getVersionListForProgram(PROGRAM_TYPE_DATASET, programId)
                        .then(response => {
                            this.setState({
                                versions: []
                            }, () => {
                                this.setState({
                                    versions: response.data
                                }, () => { this.consolidatedVersionList(programId) });
                            });
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
    /**
     * Retrieves and consolidates the list of versions for the specified program ID, including local versions stored in indexedDB.
     * Updates the component's state with the retrieved version list, sets the version ID based on various conditions, and triggers data filtering and related updates.
     * @param {string} programId - The ID of the program for which to retrieve the version list.
     */
    consolidatedVersionList = (programId) => {
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
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].programId == programId) {
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion
                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)
                    }
                }
                let versionList = verList.filter(function (x, i, a) {
                    return a.indexOf(x) === i;
                })
                versionList.reverse();
                if (this.props.match.params.versionId != "" && this.props.match.params.versionId != undefined) {
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
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
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
     * Sets the view mode based on the selected option. Updates the component's state accordingly and triggers related data retrieval and filtering operations.
     * @param {object} e - The event object representing the change in the selected view mode.
     */
    setViewById(e) {
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
    /**
     * Handles the change in selected planning units. Updates the component's state with the selected planning unit IDs and labels, and triggers data filtering accordingly.
     * @param {object} event - The event object representing the change in selected planning units.
     */
    handlePlanningUnitChange = (event) => {
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
    /**
     * Toggles the visibility of the popover.
     */
    toggleEu() {
        this.setState({
            popoverOpen: !this.state.popoverOpen,
        });
    }
    /**
     * Filters the options based on the provided filter string.
     * @param {Array} options - The array of options to filter.
     * @param {string} filter - The filter string used to match option labels.
     * @returns {Promise<Array>} - A promise that resolves to the filtered options.
     */
    filterOptions = async (options, filter) => {
        if (filter) {
            return options.filter((i) =>
                i.label.toLowerCase().includes(filter.toLowerCase())
            );
        } else {
            return options;
        }
    };
    /**
     * Toggles the visibility of guidance.
     */
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }
    /**
     * Renders the Forecast output report table.
     * @returns {JSX.Element} - Forecast output report table.
     */
    render() {
        const backgroundColor = [
            "#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED",
            "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
            "#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED",
            "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
            "#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED",
            "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
            "#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED",
            "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
            "#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED",
            "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
            "#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED",
            "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721",
        ]
        var chartOptions = {
            title: {
                display: true,
                text: i18n.t('static.dashboard.monthlyForecast') + ' - ' + (this.state.programs.filter(c => c.id == this.state.programId).length > 0 ? this.state.programs.filter(c => c.id == this.state.programId)[0].code : '') + ' - ' + (this.state.versions.filter(c => c.versionId == this.state.versionId).length > 0 ? this.state.versions.filter(c => c.versionId == this.state.versionId)[0].versionId : '')
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
                enabled: false,
                intersect: false,
                custom: CustomTooltips
            },
            options: {
                // other chart options
                maintainAspectRatio: false, // to allow dynamic resizing
                responsive: true,
              },
            // maintainAspectRatio: false,
            // responsive: true,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black',
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
                                consumptionValue.push(value[0].consumptionQty != null && value[0].consumptionQty !== "" ? Number(value[0].consumptionQty).toFixed(2) : "")
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
                            backgroundColor: (this.state.yaxisEquUnit > 0 ? backgroundColor[item.graphId] : 'transparent'),
                            borderColor: backgroundColor[item.graphId],
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
                                consumptionValue.push(value[0].consumptionQty != null && value[0].consumptionQty !== "" ? Number(value[0].consumptionQty).toFixed(2) : "")
                            } else {
                            }
                        }
                    })
                    datasetsArr.push(
                        {
                            label: item.objUnit.label.label_en,
                            type: 'line',
                            stack: 3,
                            yAxisID: 'A',
                            backgroundColor: (this.state.yaxisEquUnit > 0 ? backgroundColor[index] : 'transparent'),
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
                            pointRadius: 4,
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
                    <option key={i} value={item.id}>
                        {item.code}
                    </option>
                )
            }, this);
        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {((item.versionStatus.id == 2 && item.versionType.id == 2) ? item.versionId + '*' : item.versionId)} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
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
                        {this.state.consumptionData.length > 0 &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                                </a>
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                    </div>
                    <div className="Card-header-reporticon ">
                        <div className="card-header-actions BacktoLink col-md-12 pl-lg-0 pr-lg-0 pt-lg-2">
                            <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                            <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                            <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href="/#/report/compareAndSelectScenario" className='supplyplanformulas'>{i18n.t('static.forecastOutput.compareAndSelectForecast')}</a> </span>
                            <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/forecastReport/forecastSummary" className='supplyplanformulas'>{i18n.t('static.commitTree.forecastSummary')}</a></span><br />
                        </div>
                    </div>
                    <div className="card-header-actions">
                        <div className="card-header-action pr-lg-4">
                            <a style={{ float: 'right' }}>
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                            </a>
                        </div>
                    </div>
                    <div className='col-md-12 pt-lg-2 pb-lg-3'>
                        <span className="pr-lg-0 pt-lg-1">{i18n.t('static.placeholder.monthlyForecastReport')}</span>
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}
                                                    <i> (Forecast: {this.state.forecastPeriod})</i>
                                                </Label>
                                                <div className="controls edit">
                                                    <Picker
                                                        ref="pickRange"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                        value={rangeValue}
                                                        lang={pickerLang}
                                                        key={JSON.stringify(rangeValue)}
                                                        onDismiss={this.handleRangeDissmis}
                                                    >
                                                        <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                    </Picker>
                                                </div>
                                            </FormGroup>
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
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="viewById"
                                                            id="viewById"
                                                            bsSize="sm"
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
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls ">
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
                                                    <div className="chart-wrapper chart-graph-report-forecastOutput pl-lg-4">
                                                        <Bar id="cool-canvas" data={bar} options={chartOptions}
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
                                                    <div className="table-wrap table-responsive fixTableHeadSupplyPlan BorderTopForcastOutput">
                                                        {this.state.consumptionData.length > 0 &&
                                                            <Table className="table-bordered table-bordered1 text-center mt-0 overflowhide main-table " bordered size="sm" options={this.options} id="forecastOutputId">
                                                                <thead>
                                                                    <tr>
                                                                        <th className='whitebg_inforecastOutput sticky-col Firstcolum'>{i18n.t('static.forecastReport.display')}</th>
                                                                        <th className='whitebg_inforecastOutput sticky-col Secondcolum'>{i18n.t('static.program.region')}</th>
                                                                        <th className='whitebg_inforecastOutput sticky-col Thirdcolum'>{this.state.viewById == 1 ? i18n.t('static.product.product') : i18n.t('static.forecastingunit.forecastingunit')}</th>
                                                                        <th className='whitebg_inforecastOutput sticky-col MonthlyForecastdWidth fourthcolum'>{i18n.t('static.consumption.forcast')}</th>
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
                                                                            <td className="Secondcolum sticky-col first-col clone" style={{ textAlign: 'left' }}>{item.region.label.label_en}</td>
                                                                            <td className="sticky-col first-col clone Thirdcolum" style={{ textAlign: 'left' }}>{item.graphId != -1 && <i class="fa fa-circle" style={{ color: backgroundColor[this.state.graphConsumptionData.filter(c => c.display == true && c.objUnit.id == item.objUnit.id).length > 0 ? this.state.graphConsumptionData.filter(c => c.display == true && c.objUnit.id == item.objUnit.id)[0].graphId : 0] }} aria-hidden="true"></i>} {" "} {item.objUnit.label.label_en}</td>
                                                                            <td className='text-left sticky-col first-col clone fourthcolum'>{item.scenario.label}</td>
                                                                            {this.state.monthArrayList.map(item1 => (
                                                                                <td>{item.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? <NumberFormat displayType={'text'} thousandSeparator={true} value={Number(item.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty).toFixed(2)} /> : ""}</td>
                                                                            ))}
                                                                            <td></td>
                                                                        </tr>
                                                                    ))}
                                                                    {this.state.yaxisEquUnit > 0 && this.state.xaxis == 2 &&
                                                                        <tr>
                                                                            <td className="sticky-col first-col clone Firstcolum"></td>
                                                                            <td className="Secondcolum sticky-col first-col clone"></td>
                                                                            <td style={{ textAlign: 'left' }} className="sticky-col first-col clone Thirdcolum"><b>{i18n.t('static.supplyPlan.total')} {" " + this.state.equivalencyUnitLabel}</b></td>
                                                                            <td className='text-left sticky-col first-col clone fourthcolum'></td>
                                                                            {this.state.monthArrayList.map(item1 => (
                                                                                <td><b>{this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM")).length > 0 ? <NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.calculateEquivalencyUnitTotal.filter(c => moment(c.consumptionDate).format("YYYY-MM") == moment(item1).format("YYYY-MM"))[0].consumptionQty} /> : ""}</b></td>
                                                                            ))}
                                                                        </tr>
                                                                    }
                                                                    {this.state.xaxis == 1 && this.state.consumptionData.map((item, index) => (
                                                                        <tr>
                                                                            <td className="sticky-col first-col clone Firstcolum" align="center"><input type="checkbox" id={"planningUnitCheckbox" + item.objUnit.id} checked={item.display} onChange={() => this.planningUnitCheckedChanged(item.objUnit.id, item.region.regionId)} /></td>
                                                                            <td className="Secondcolum sticky-col first-col clone" style={{ textAlign: 'left' }}>{item.region.label.label_en}</td>
                                                                            <td className="sticky-col first-col clone Thirdcolum" style={{ textAlign: 'left' }}>{item.graphId != -1 && <i class="fa fa-circle" style={{ color: backgroundColor[this.state.graphConsumptionData.filter(c => c.display == true && c.objUnit.id == item.objUnit.id).length > 0 ? this.state.graphConsumptionData.filter(c => c.display == true && c.objUnit.id == item.objUnit.id)[0].graphId : 0] }} aria-hidden="true"></i>} {" "} {item.objUnit.label.label_en}</td>
                                                                            <td className='text-left sticky-col first-col clone fourthcolum'>{item.scenario.label}</td>
                                                                            {this.state.monthArrayList.map(item1 => (
                                                                                <td>{item.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY")).length > 0 ? <NumberFormat displayType={'text'} thousandSeparator={true} value={Number(item.consumptionList.filter(c => moment(c.consumptionDate).format("YYYY") == moment(item1).format("YYYY"))[0].consumptionQty).toFixed(2)} /> : ""}</td>
                                                                            ))}
                                                                            <td></td>
                                                                        </tr>
                                                                    ))}
                                                                    {this.state.yaxisEquUnit > 0 && this.state.xaxis == 1 &&
                                                                        <tr>
                                                                            <td className="sticky-col first-col clone Firstcolum"></td>
                                                                            <td className="Secondcolum sticky-col first-col clone"></td>
                                                                            <td className="sticky-col first-col clone Thirdcolum" style={{ textAlign: 'left' }}><b>Total {" " + this.state.equivalencyUnitLabel}</b></td>
                                                                            <td className='text-left sticky-col first-col clone fourthcolum'></td>
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
                        <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <div dangerouslySetInnerHTML={{
                                __html: localStorage.getItem('lang') == 'en' ?
                                    showguidanceforecastOutputEn :
                                    localStorage.getItem('lang') == 'fr' ?
                                        showguidanceforecastOutputFr :
                                        localStorage.getItem('lang') == 'sp' ?
                                            showguidanceforecastOutputSp :
                                            showguidanceforecastOutputPr
                            }} />
                        </ModalBody>
                    </div>
                </Modal>
            </div >
        );
    }
}
export default ForecastOutput;