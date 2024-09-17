import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Col,
    Form,
    FormGroup, Input, InputGroup, Label,
    Modal,
    ModalBody,
    ModalHeader,
    Popover,
    PopoverBody,
    Table
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import compareAndSelectScenarioEn from '../../../src/ShowGuidanceFiles/compareAndSelectScenarioEn.html';
import compareAndSelectScenarioFr from '../../../src/ShowGuidanceFiles/compareAndSelectScenarioFr.html';
import compareAndSelectScenarioPr from '../../../src/ShowGuidanceFiles/compareAndSelectScenarioPr.html';
import compareAndSelectScenarioSp from '../../../src/ShowGuidanceFiles/compareAndSelectScenarioSp.html';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions';
import { LOGO } from '../../CommonComponent/Logo';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, DATE_FORMAT_CAP_WITHOUT_DATE_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SECRET_KEY, TITLE_FONT } from '../../Constants.js';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, formatter, hideFirstComponent, makeText } from '../../CommonComponent/JavascriptCommonFunctions';
import { DatePicker } from 'antd';
import "antd/dist/antd.css";
const ref = React.createRef();
const { RangePicker } = DatePicker;
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

const filterDataByFiscalYear = (data, fiscalStartMonth) => {
    // fiscalStartMonth is 6 because July is the 7th month, so zero-indexed it is 6
    const result = {};
    const yearWiseData = {};

    data.forEach(item => {
        const date = new Date(item[0]);
        let fiscalYearStart;
        let fiscalYearEnd;

        const year = date.getFullYear();
        const month = date.getMonth(); // 0 = Jan, 11 = Dec

        if (month >= (fiscalStartMonth - 1)) {
            fiscalYearStart = year;
            fiscalYearEnd = year + 1;
        } else {
            fiscalYearStart = year - 1;
            fiscalYearEnd = year;
        }

        const fiscalYearKey = `${fiscalYearEnd}`;
        if (yearWiseData[fiscalYearKey]) {
            yearWiseData[fiscalYearKey] += 1;
        } else {
            yearWiseData[fiscalYearKey] = 1;
        }
        // Aggregate values based on the fiscal year
        if (!result[fiscalYearKey]) {
            result[fiscalYearKey] = new Array(item.length).fill(0);
        }

        for (let i = 1; i < item.length; i++) {
            const value = parseFloat(item[i]) || 0; // Convert to float and handle empty strings
            result[fiscalYearKey][i] += value;
        }
        // result[fiscalYearKey] += item.value;
    });
    for (const year in result) {
        result[year].push(yearWiseData[year]);
    }
    return result;
}


const calculateSums = (data) => {
    const yearSums = {};
    const yearWiseData = {};

    data.forEach((row) => {
        const year = moment(row[0]).format("YYYY");

        // Ensure the year is present in the sums object
        if (!yearSums[year]) {
            yearSums[year] = new Array(row.length).fill(0);
        }
        if (yearWiseData[year]) {
            yearWiseData[year] += 1;
        } else {
            yearWiseData[year] = 1;
        }

        // Start from the 2nd column (index 1) and sum each value
        for (let i = 1; i < row.length; i++) {
            const value = parseFloat(row[i]) || 0; // Convert to float and handle empty strings
            yearSums[year][i] += value;
        }
    });
    for (const year in yearWiseData) {
        //     const total = yearSums[year].reduce((sum, val) => sum + val, 0);
        yearSums[year].push(yearWiseData[year]);
    }
    return yearSums;
};
// Localized entity name
const entityname = i18n.t('static.dashboard.compareAndSelect')
/**
 * Component for comparing and selecting the scenario for different forecasts.
 */
class CompareAndSelectScenario extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.pickAMonth3 = React.createRef()
        this.state = {
            isDarkMode: false,
            datasetList: [],
            planningUnitList: [],
            versions: [],
            show: false,
            message: '',
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            forecastingUnitList: [],
            forecastingUnitId: "",
            regionList: [],
            regionId: "",
            loading: true,
            datasetId: '',
            versionId: '',
            planningUnitLabel: '',
            viewById: 1,
            equivalencyUnitId: "",
            equivalencyUnitList: [],
            showTotalForecast: true,
            showTotalActual: true,
            showTotalDifference: true,
            monthArrayList: [],
            planningUnitId: "",
            scenarioList: [],
            selectedTreeScenarioId: [],
            actualConsumptionList: [],
            showAllData: false,
            consumptionDataForTree: [],
            totalArray: [],
            actualDiff: [],
            countArray: [],
            regionName: "",
            singleValue2: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            singleValue3: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            maxDateForSingleValue: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            showForecastPeriod: false,
            treeScenarioList: [],
            actualConsumptionListForMonth: [],
            changed: false,
            dataChangedFlag: 0,
            showFits: false,
            minActualMonth: '',
            maxActualMonth: '',
            xAxisDisplayBy: 1,
            yearArray: [],
            consolidatedData: [],
            collapsedExpandArr: [],
            expandCompressBtn: true,
            consumptionUnitShowArr: [],
            uniqueProductCategories: [],
            planningUnitListForTable: [],
            expandCompressPUBtn: true,
            showHidePU: true,
            actualMinDate: "",
            calendarMonthList: ""
        };
        this.getDatasets = this.getDatasets.bind(this);
        this.setViewById = this.setViewById.bind(this);
        this.setDatasetId = this.setDatasetId.bind(this);
        this.setRegionId = this.setRegionId.bind(this);
        this.setForecastingUnit = this.setForecastingUnit.bind(this);
        this.setPlanningUnitId = this.setPlanningUnitId.bind(this);
        this.setEquivalencyUnit = this.setEquivalencyUnit.bind(this);
        this.submitScenario = this.submitScenario.bind(this);
        this.loaded = this.loaded.bind(this)
        this.onchangepage = this.onchangepage.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.loadedTable1 = this.loadedTable1.bind(this)
        this.changeTable1 = this.changeTable1.bind(this)
        this.handleYearRangeChange = this.handleYearRangeChange.bind(this);
        this.getPlanningUnitsForTable = this.getPlanningUnitsForTable.bind(this);
        this.loadedCalendar = this.loadedCalendar.bind(this);
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox2 = (e) => {
        this.refs.pickRange.show()
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    handleClickMonthBox3 = (e) => {
        this.pickAMonth3.current.show()
    }
    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleAMonthDissmis2 = (value) => {
        this.setState({ singleValue2: value, }, () => {
            this.setMonth1List()
        })
    }
    /**
     * Sets the state to show or hide the forecast period and show fits based on the checked status of the target element.
     * @param {Event} e - The change event.
     * @returns {void}
     */
    setShowForecastPeriodOrFits(e) {
        var checked = e.target.checked;
        var stopDate = this.state.singleValue2.to.year + '-' + this.state.singleValue2.to.month + '-' + new Date(this.state.singleValue2.to.year, this.state.singleValue2.to.month, 0).getDate();
        if (e.target.name == "showForecastPeriod") {
            this.setState({
                xAxisDisplayBy: 1,
                showForecastPeriod: checked,
                showFits: checked ? false : this.state.showFits,
                minDate: checked ? this.state.minDate : { year: Number(moment(this.state.actualMinDate).startOf('month').format("YYYY")), month: Number(moment(this.state.actualMinDate).startOf('month').format("M")) },
                singleValue2: checked ? this.state.rangeValue : { from: { year: Number(moment(this.state.actualMinDate).startOf('month').format("YYYY")), month: Number(moment(this.state.actualMinDate).startOf('month').format("M")) }, to: { year: Number(moment(stopDate).startOf('month').format("YYYY")), month: Number(moment(stopDate).startOf('month').format("M")) } },
            }, () => {
                this.setMonth1List()
            })
        } else if (e.target.name == "showFits") {
            this.setState({
                showFits: checked,
                minDate: checked ? this.state.minDate : { year: Number(moment(this.state.actualMinDate).startOf('month').format("YYYY")), month: Number(moment(this.state.actualMinDate).startOf('month').format("M")) },
                singleValue2: { from: { year: Number(moment(checked ? this.state.minDate : this.state.actualMinDate).startOf('month').format("YYYY")), month: Number(moment(checked ? this.state.minDate : this.state.actualMinDate).startOf('month').format("M")) }, to: { year: Number(moment(stopDate).startOf('month').format("YYYY")), month: Number(moment(stopDate).startOf('month').format("M")) } },
                showForecastPeriod: checked ? false : this.state.showForecastPeriod
            }, () => {
                this.setMonth1List()
            })
        }
    }
    /**
     * Sets the month list based on the selected range value or forecast period.
     * If the forecast period is shown, it uses the forecast start and stop dates.
     * If not, it calculates the month list based on the selected range value.
     */
    setMonth1List() {
        this.setState({
            loading: true
        })
        var rangeValue = this.state.singleValue2;
        let startDate = "";
        let stopDate = ""
        if (!this.state.showForecastPeriod) {
            startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
            stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        } else {
            startDate = this.state.forecastStartDate;
            stopDate = this.state.forecastStopDate
        }
        var curDate = moment(startDate).format("YYYY-MM-DD");
        var monthList = [];
        monthList.push(curDate);
        for (var i = 1; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
            curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
            monthList.push(curDate);
        }
        var rangeValue1 = { from: { year: Number(moment(startDate).startOf('month').format("YYYY")), month: Number(moment(startDate).startOf('month').format("M")) }, to: { year: Number(moment(stopDate).startOf('month').format("YYYY")), month: Number(moment(stopDate).startOf('month').format("M")) } }

        this.setState({
            monthList1: monthList,
            loading: false,
            singleValue2: rangeValue1
        }, () => {
            this.buildJexcel();
        })
    }

    /**
         * This function is used to build the modeling validation data in tabular format
         */
    getData() {
        var rangeValue = this.state.singleValue2;
        let startDate;
        let stopDate;
        var displayBy = this.state.xAxisDisplayBy;
        if (displayBy > 2 && displayBy < 9) {
            startDate = moment(this.state.forecastStartDate).format("YYYY-MM-DD");
            stopDate = moment(this.state.forecastStopDate).format("YYYY-MM-DD");
        } else if (displayBy > 8) {
            startDate = rangeValue.from.year < moment(this.state.forecastStartDate).format("YYYY") ? moment(this.state.forecastStartDate).format("YYYY-MM-DD") : (rangeValue.from.year + '-' + rangeValue.from.month + '-01');
            stopDate = moment(this.state.forecastStopDate).add(1, "year").format("YYYY-MM-DD");
        } else {
            startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
            stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        }
        var monthList = [];
        var curDate = startDate;
        for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
            curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
            monthList.push(curDate)
        }
        var dataArr = [];
        var data = "";
        if (displayBy != 1) {
            let mL = displayBy == 9 ? monthList.length - 12 : monthList.length;
            for (var j = 0; j < mL; j += 12) {
                data = moment(monthList[j]).format("YYYY");
                dataArr.push(data);
            }
        }
        this.setState({ yearArray: dataArr, calendarMonthList: monthList }, () => {
            this.setMonth1List()
        })
    }

    /**
     * Retrieves and processes data to be displayed based on the selected planning unit and region.
     * Updates component state with the retrieved data for rendering.
     */
    showData() {
        if (this.state.planningUnitId != "" && this.state.regionId != "") {
            this.setState({ loading: true })
            var datasetJson = this.state.datasetJson;
            var multiplier = 1;
            var selectedPlanningUnit = this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId);
            let startDate = moment.min(datasetJson.actualConsumptionList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId).map(d => moment(d.month)));
            let actualMinDate = startDate;
            let forecastStartDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD")
            if (moment(actualMinDate).format("YYYY-MM") > moment(forecastStartDate).format("YYYY-MM")) {
                actualMinDate = forecastStartDate;
            }
            let stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD")
            var rangeValue = { from: { year: Number(moment(actualMinDate).startOf('month').format("YYYY")), month: Number(moment(actualMinDate).startOf('month').format("M")) }, to: { year: Number(moment(stopDate).startOf('month').format("YYYY")), month: Number(moment(stopDate).startOf('month').format("M")) } }
            var treeScenarioList = [];
            var treeList = datasetJson.treeList.filter(c => c.active.toString() == "true");
            var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
            var colourArrayCount = 0;
            var count = 0;
            var consumptionExtrapolation = datasetJson.consumptionExtrapolation.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId);
            var minActualMonth = '';
            var maxActualMonth = '';
            if (selectedPlanningUnit[0].consuptionForecast.toString() == "true") {
                for (var ce = 0; ce < consumptionExtrapolation.length; ce++) {
                    if (colourArrayCount > 10) {
                        colourArrayCount = 0;
                    }
                    minActualMonth = consumptionExtrapolation[ce].jsonProperties.startDate;
                    maxActualMonth = consumptionExtrapolation[ce].jsonProperties.stopDate;
                    treeScenarioList.push({ id: consumptionExtrapolation[ce].consumptionExtrapolationId, tree: consumptionExtrapolation[ce], scenario: consumptionExtrapolation[ce], checked: true, color: colourArray[colourArrayCount], type: "C", data: consumptionExtrapolation[ce].extrapolationDataList, readonly: false });
                    colourArrayCount += 1;
                }
            }
            if (selectedPlanningUnit[0].treeForecast.toString() == "true") {
                for (var tl = 0; tl < treeList.length; tl++) {
                    var tree = treeList[tl];
                    var regionList = tree.regionList.filter(c => c.id == this.state.regionId);
                    var scenarioList = regionList.length > 0 ? treeList[tl].scenarioList.filter(c => c.active.toString() == "true") : [];
                    for (var sl = 0; sl < scenarioList.length; sl++) {
                        try {
                            var flatList = tree.tree.flatList.filter(c => c.payload.nodeDataMap[scenarioList[sl].id] != undefined && c.payload.nodeDataMap[scenarioList[sl].id][0].puNode != null && c.payload.nodeDataMap[scenarioList[sl].id][0].puNode.planningUnit.id == this.state.planningUnitId && (c.payload).nodeType.id == 5);
                        } catch (err) {
                            flatList = []
                        }
                        if (colourArrayCount > 10) {
                            colourArrayCount = 0;
                        }
                        var readonly = flatList.length > 0 ? false : true;
                        dataForPlanningUnit = [];
                        try {
                            var dataForPlanningUnit = treeList[tl].tree.flatList.filter(c => (c.payload.nodeDataMap[scenarioList[sl].id])[0].puNode != null && (c.payload.nodeDataMap[scenarioList[sl].id])[0].puNode.planningUnit.id == this.state.planningUnitId && (c.payload).nodeType.id == 5);
                        } catch (err) {
                            dataForPlanningUnit = []
                        }
                        var data = [];
                        if (dataForPlanningUnit.length > 0) {
                            for (var dfpu = 0; dfpu < dataForPlanningUnit.length; dfpu++) {
                                if ((dataForPlanningUnit[dfpu].payload.nodeDataMap[scenarioList[sl].id])[0].nodeDataMomList != undefined) {
                                    data = data.concat((dataForPlanningUnit[dfpu].payload.nodeDataMap[scenarioList[sl].id])[0].nodeDataMomList);
                                }
                            }
                        }
                        let resultTrue = Object.values(data.reduce((a, { month, calculatedMmdValue }) => {
                            if (!a[month])
                                a[month] = Object.assign({}, { month, calculatedMmdValue });
                            else
                                a[month].calculatedMmdValue += calculatedMmdValue;
                            return a;
                        }, {}));
                        treeScenarioList.push({ id: treeList[tl].treeId + "~" + scenarioList[sl].id, tree: treeList[tl], scenario: scenarioList[sl], checked: readonly ? false : true, color: colourArray[colourArrayCount], type: "T", data: resultTrue, readonly: readonly });
                        colourArrayCount += 1;
                        count += 1;
                    }
                }
            }
            if (selectedPlanningUnit.length > 0 && selectedPlanningUnit[0].selectedForecastMap != undefined) {
            }
            var selectedTreeScenarioId = [];
            if (selectedPlanningUnit.length > 0 && selectedPlanningUnit[0].selectedForecastMap != undefined && selectedPlanningUnit[0].selectedForecastMap[this.state.regionId] != undefined) {
                if (selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].treeAndScenario != undefined && selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].treeAndScenario.length > 0) {
                    var treeAndScenario = selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].treeAndScenario;
                    for (var tas = 0; tas < treeAndScenario.length; tas++) {
                        if (treeScenarioList.filter(c => c.scenario.id == treeAndScenario[tas].scenarioId && c.tree.treeId == treeAndScenario[tas].treeId).length > 0) {
                            selectedTreeScenarioId.push((treeScenarioList.filter(c => c.scenario.id == treeAndScenario[tas].scenarioId && c.tree.treeId == treeAndScenario[tas].treeId)[0].id).toString());
                        }
                    }
                } else if ((selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].consumptionExtrapolationId) != undefined) {
                    selectedTreeScenarioId.push((selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].consumptionExtrapolationId).toString());
                }
            }
            var forecastNotes = selectedPlanningUnit.length > 0 && selectedPlanningUnit[0].selectedForecastMap != undefined ? selectedPlanningUnit[0].selectedForecastMap[this.state.regionId] != undefined && selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].notes != undefined ? selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].notes : "" : "";
            var readonlyList = treeScenarioList.filter(c => c.readonly).sort(function (a, b) {
                a = (a.type == "T" ? getLabelText(a.tree.label, this.state.lang) + " - " + getLabelText(a.scenario.label, this.state.lang) : getLabelText(a.scenario.extrapolationMethod.label, this.state.lang)).toLowerCase();
                b = (b.type == "T" ? getLabelText(b.tree.label, this.state.lang) + " - " + getLabelText(b.scenario.label, this.state.lang) : getLabelText(b.scenario.extrapolationMethod.label, this.state.lang)).toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            }.bind(this));
            var nonReadonlyList = treeScenarioList.filter(c => !c.readonly).sort(function (a, b) {
                a = (a.type == "T" ? getLabelText(a.tree.label, this.state.lang) + " - " + getLabelText(a.scenario.label, this.state.lang) : getLabelText(a.scenario.extrapolationMethod.label, this.state.lang)).toLowerCase();
                b = (b.type == "T" ? getLabelText(b.tree.label, this.state.lang) + " - " + getLabelText(b.scenario.label, this.state.lang) : getLabelText(b.scenario.extrapolationMethod.label, this.state.lang)).toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            }.bind(this));
            var sortedTreeScenraioList = nonReadonlyList.concat(readonlyList);
            this.setState({
                treeScenarioList: sortedTreeScenraioList,
                actualConsumptionList: datasetJson.actualConsumptionList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId),
                multiplier: multiplier,
                selectedTreeScenarioId: selectedTreeScenarioId,
                forecastNotes: forecastNotes,
                singleValue2: rangeValue,
                minDate: { year: Number(moment(actualMinDate).startOf('month').format("YYYY")), month: Number(moment(actualMinDate).startOf('month').format("M")) },
                actualMinDate: actualMinDate,
                showAllData: true,
                loading: false,
                minActualMonth: minActualMonth,
                maxActualMonth: maxActualMonth
            }, () => {
                this.getPlanningUnitsForTable(this.state.datasetJson, this.state.regionId)
                this.setMonth1List();
                // if (this.state.viewById == 1) {
                //     document.getElementById("planningUnitDiv").style.display = "block";
                // } else {
                //     document.getElementById("planningUnitDiv").style.display = "none";
                // }
                this.scenarioOrderChanged(selectedTreeScenarioId)
            })
        } else {
            this.setState({
                loading: false,
                showAllData: false
            })
        }
    }
    /**
     * Builds the jexcel table based on the tree scenario list.
     */
    buildJexcel() {
        if (this.state.planningUnitId > 0 && this.state.regionId != "") {
            this.setState({
                loading: true
            })
            jexcel.destroy(document.getElementById("tableDiv"), true);
            jexcel.destroy(document.getElementById("calendarTable"), true);
            var columns1 = [];
            var calendarTableCol = [];
            var calendarTableRowData = [];

            calendarTableCol.push({ title: this.state.xAxisDisplayBy == 1 ? i18n.t('static.inventoryDate.inventoryReport') : this.state.xAxisDisplayBy == 2 ? i18n.t('static.modelingValidation.calendarYear') : i18n.t('static.modelingValidation.fiscalYear'), type: 'text' });
            calendarTableCol.push({ title: "", type: 'hidden' });
            columns1.push({ title: i18n.t('static.inventoryDate.inventoryReport'), width: 100, type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' } });
            columns1.push({ title: i18n.t('static.compareAndSelect.actuals'), width: 100, type: 'numeric', mask: '#,##.00' });
            var treeScenarioList = this.state.treeScenarioList;
            for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                if (treeScenarioList[tsl].type == "T") {
                    columns1.push({ title: getLabelText(treeScenarioList[tsl].tree.label, this.state.lang) + " - " + getLabelText(treeScenarioList[tsl].scenario.label, this.state.lang), width: 100, type: treeScenarioList[tsl].checked ? 'numeric' : 'hidden', mask: '#,##.00', decimal: "." });
                    if (treeScenarioList[tsl].checked) {
                        calendarTableCol.push({ title: getLabelText(treeScenarioList[tsl].tree.label, this.state.lang) + " - " + getLabelText(treeScenarioList[tsl].scenario.label, this.state.lang), width: 100, type: treeScenarioList[tsl].checked ? 'numeric' : 'hidden', mask: '#,##.00', decimal: "." });
                    }
                } else {
                    columns1.push({ title: getLabelText(treeScenarioList[tsl].scenario.extrapolationMethod.label, this.state.lang), width: 100, type: treeScenarioList[tsl].checked ? 'numeric' : 'hidden', mask: '#,##.00', decimal: "." });
                    if (treeScenarioList[tsl].checked) {
                        calendarTableCol.push({ title: getLabelText(treeScenarioList[tsl].scenario.extrapolationMethod.label, this.state.lang), width: 100, type: treeScenarioList[tsl].checked ? 'numeric' : 'hidden', mask: '#,##.00', decimal: "." });
                    }
                }
            }
            columns1.push({ title: i18n.t("static.compareAndSelect.totalAggregated"), width: 100, type: this.state.selectedTreeScenarioId.length > 1 ? 'numeric' : 'hidden', mask: '#,##.00', decimal: "." });
            // calendarTableCol.push({ title: i18n.t("static.compareAndSelect.totalAggregated"), width: 100, type: this.state.selectedTreeScenarioId.length>1 ? 'numeric' : 'hidden', mask: '#,##.00', decimal: "." });
            // calendarTableCol.push({ title: i18n.t('static.supplyPlan.total'), type: 'numeric', mask: '#,##.00' });
            calendarTableCol.push({ title: i18n.t("static.compareAndSelect.noOfMonths"), type: "numeric", width: 100 })
            var data = [];
            var data1 = [];
            var dataArr = [];
            var dataArr1 = [];
            var collapsedExpandArr = [];
            var consumptionData = this.state.actualConsumptionList;
            var monthArrayListWithoutFormat = this.state.monthList;
            var actualConsumptionListForMonth = [];
            var consumptionDataForTree = [];
            var totalArray = [];
            var monthArrayForError = [];
            if (this.state.minActualMonth == '') {
                if (consumptionData.length > 0) {
                    for (var i = 0; i < consumptionData.length; i++) {
                        monthArrayForError.push(moment(consumptionData[i].month).format("YYYY-MM-DD"));
                    }
                }
            } else {
                var createdDate = moment(this.state.minActualMonth).format("YYYY-MM-DD");
                var minDate = moment(this.state.minActualMonth).format("YYYY-MM-DD");
                for (var i = 0; moment(createdDate).format("YYYY-MM") < moment(this.state.maxActualMonth).format("YYYY-MM"); i++) {
                    createdDate = moment(minDate).add(i, 'months').format("YYYY-MM-DD");
                    monthArrayForError.push(createdDate);
                }
            }
            var multiplier = 1;
            var actualMultiplier = 1;
            var actualDiff = [];
            var countArray = [];
            var useForLowestError = [];
            for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                totalArray.push(0);
                actualDiff.push(0);
                useForLowestError.push(false);
            }
            var totalActual = 0;
            for (var mo = 0; mo < monthArrayForError.length; mo++) {
                var actualFilter = consumptionData.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayForError[mo]).format("YYYY-MM"));
                if (actualFilter.length > 0) {
                    totalActual += Number(actualFilter.length > 0 ? (Number(actualFilter[0].puAmount) * Number(actualMultiplier) * Number(multiplier)) : 0);
                }
                for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                    if (treeScenarioList[tsl].type == "T") {
                        var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayForError[mo]).format("YYYY-MM"));
                        if (scenarioFilter.length > 0 && (useForLowestError[tsl] == undefined || useForLowestError[tsl] == null || useForLowestError[tsl] == false)) {
                            useForLowestError[tsl] = true;
                        }
                        var diff = scenarioFilter.length > 0 ? ((actualFilter.length > 0 ? (Number(actualFilter[0].puAmount) * Number(actualMultiplier) * Number(multiplier)) : 0) - (scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedMmdValue) * multiplier : "")) : 0;
                        if (diff < 0) {
                            diff = 0 - diff;
                        }
                        actualDiff[tsl] = scenarioFilter.length > 0 ? (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0) + diff : (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0);
                        if (scenarioFilter.length > 0) {
                            countArray[tsl] = countArray[tsl] != undefined ? countArray[tsl] + 1 : 0;
                        }
                    } else {
                        var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayForError[mo]).format("YYYY-MM"));
                        if (scenarioFilter.length > 0 && (useForLowestError[tsl] == undefined || useForLowestError[tsl] == null || useForLowestError[tsl] == false)) {
                            useForLowestError[tsl] = true;
                        }
                        var diff = scenarioFilter.length > 0 ? ((actualFilter.length > 0 ? (Number(actualFilter[0].puAmount) * Number(actualMultiplier) * Number(multiplier)) : 0) - (scenarioFilter.length > 0 ? (Number(scenarioFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)) : "")) : 0;
                        if (diff < 0) {
                            diff = 0 - diff;
                        }
                        actualDiff[tsl] = scenarioFilter.length > 0 ? (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0) + diff : (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0);
                        if (scenarioFilter.length > 0) {
                            countArray[tsl] = countArray[tsl] != undefined ? countArray[tsl] + 1 : 0;
                        }
                    }
                }
            }
            for (var m = 0; m < monthArrayListWithoutFormat.length; m++) {
                data = [];
                data[0] = monthArrayListWithoutFormat[m];
                var actualFilter = consumptionData.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                data[1] = actualFilter.length > 0 ? (Number(actualFilter[0].puAmount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : "";
                for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                    if (treeScenarioList[tsl].type == "T") {
                        var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                        data[tsl + 2] = scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedMmdValue).toFixed(2) * multiplier : "";
                        totalArray[tsl] = Number(totalArray[tsl] != undefined ? totalArray[tsl] : 0) + Number(scenarioFilter.length > 0 ? (Number(scenarioFilter[0].calculatedMmdValue) * multiplier) : 0);
                    } else {
                        var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                        data[tsl + 2] = scenarioFilter.length > 0 ? (Number(scenarioFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : "";
                        totalArray[tsl] = Number(totalArray[tsl] != undefined ? totalArray[tsl] : 0) + Number(scenarioFilter.length > 0 ? (Number(scenarioFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)) : 0);
                    }
                }
            }
            var monthArrayListWithoutFormat = this.state.monthList1;
            var multiplier = 1;
            var selectedPlanningUnit = this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId);
            if (this.state.viewById == 2) {
                multiplier = selectedPlanningUnit.length > 0 ? selectedPlanningUnit[0].planningUnit.multiplier : 1;
            }
            if (this.state.viewById == 3) {
                var selectedEquivalencyUnit = this.state.equivalencyUnitListAll.filter(c => c.equivalencyUnitMappingId == this.state.equivalencyUnitId);
                multiplier = selectedEquivalencyUnit.length > 0 ? selectedEquivalencyUnit[0].convertToEu : 1;
            }
            var actualMultiplier = 1;
            for (var m = 0; m < monthArrayListWithoutFormat.length; m++) {
                data = [];

                data[0] = monthArrayListWithoutFormat[m];
                var actualFilter = consumptionData.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                data[1] = actualFilter.length > 0 ? (Number(actualFilter[0].puAmount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : "";
                var total = 0;
                var count = 0;
                if (actualFilter.length > 0) {
                    actualConsumptionListForMonth.push({ year: moment(actualFilter[0].month).format("YYYY"), value: Number(Number(actualFilter[0].puAmount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) });
                }
                for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                    if (treeScenarioList[tsl].type == "T") {
                        var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                        data[tsl + 2] = scenarioFilter.length > 0 ? (Number(scenarioFilter[0].calculatedMmdValue) * multiplier).toFixed(2) : "";
                        if (this.state.selectedTreeScenarioId.includes(treeScenarioList[tsl].id.toString())) {
                            total += scenarioFilter.length > 0 ? Number((Number(scenarioFilter[0].calculatedMmdValue) * multiplier).toFixed(2)) : Number(0)
                            if (scenarioFilter.length > 0) {
                                count += 1;
                            }
                        }
                        consumptionDataForTree.push({ id: treeScenarioList[tsl].id, value: scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedMmdValue).toFixed(2) * multiplier : null, month: moment(monthArrayListWithoutFormat[m]).format("YYYY-MM-DD") });
                        collapsedExpandArr.push({ id: treeScenarioList[tsl].id, year: moment(monthArrayListWithoutFormat[m]).format("YYYY"), actual: scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedMmdValue).toFixed(2) * multiplier : null })
                    } else {
                        var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                        data[tsl + 2] = scenarioFilter.length > 0 ? (Number(scenarioFilter[0].amount) * Number(actualMultiplier) * multiplier).toFixed(2) : "";
                        if (this.state.selectedTreeScenarioId.includes(treeScenarioList[tsl].id.toString())) {
                            total += scenarioFilter.length > 0 ? Number((Number(scenarioFilter[0].amount) * Number(actualMultiplier) * multiplier).toFixed(2)) : Number(0);
                            if (scenarioFilter.length > 0) {
                                count += 1;
                            }
                        }
                        consumptionDataForTree.push({ id: treeScenarioList[tsl].id, value: scenarioFilter.length > 0 ? Number(scenarioFilter[0].amount).toFixed(2) * Number(actualMultiplier) * multiplier : null, month: moment(monthArrayListWithoutFormat[m]).format("YYYY-MM-DD") });
                        collapsedExpandArr.push({ id: treeScenarioList[tsl].id, year: moment(monthArrayListWithoutFormat[m]).format("YYYY"), actual: scenarioFilter.length > 0 ? Number(scenarioFilter[0].amount).toFixed(2) * Number(actualMultiplier) * multiplier : null })
                    }
                }
                data[tsl + 2] = count > 0 ? Number(total).toFixed(2) : "";
                consumptionDataForTree.push({ id: "-1", value: count > 0 ? Number(total).toFixed(2) : "", month: moment(monthArrayListWithoutFormat[m]).format("YYYY-MM-DD") })
                collapsedExpandArr.push({ id: "-1", year: moment(monthArrayListWithoutFormat[m]).format("YYYY"), actual: count > 0 ? Number(total).toFixed(2) : "" })
                dataArr.push(data)
            }
            var monthArrayListWithoutFormat = this.state.calendarMonthList;
            for (var m = 0; m < monthArrayListWithoutFormat.length; m++) {
                data1 = [];
                data1[0] = monthArrayListWithoutFormat[m];
                var total = 0;
                var count = 0;
                for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                    if (treeScenarioList[tsl].checked) {
                        if (treeScenarioList[tsl].type == "T") {
                            var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                            data1[tsl + 1] = scenarioFilter.length > 0 ? (Number(scenarioFilter[0].calculatedMmdValue) * multiplier).toFixed(2) : "";
                        } else {
                            var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                            data1[tsl + 1] = scenarioFilter.length > 0 ? (Number(scenarioFilter[0].amount) * Number(actualMultiplier) * multiplier).toFixed(2) : "";
                        }
                    }
                }
                dataArr1.push(data1)
            }
            if (this.state.xAxisDisplayBy != 1) {
                var displayBy = this.state.xAxisDisplayBy;
                var fiscalStartMonth = (Number(displayBy) + 4) % 12 == 0 ? 12 : (Number(displayBy) + 4) % 12
                var originalData = this.state.xAxisDisplayBy > 2 ? filterDataByFiscalYear(dataArr1, fiscalStartMonth) : calculateSums(dataArr1);

                // Convert the object to an array
                const transformedData = Object.keys(originalData).map((year, index) => ({
                    [index]: [parseInt(year), ...originalData[year]]
                }));

                // Flatten the array of objects into a single object
                calendarTableRowData = Object.assign({}, ...transformedData);
            }
            var higherThenConsumptionThreshold = 0;
            var lowerThenConsumptionThreshold = 0;
            var higherThenConsumptionThresholdPU = 0;
            var lowerThenConsumptionThresholdPU = 0;
            var arrayForTotal = [];
            for (var t = 0; t < treeScenarioList.length; t++) {
                if (treeScenarioList[t].type == 'C' && totalArray[t] > 0) {
                    arrayForTotal.push(totalArray[t])
                }
            }
            var sortedArray = arrayForTotal.sort(function (a, b) {
                return a - b;
            });
            higherThenConsumptionThreshold = sortedArray.length > 0 && sortedArray[sortedArray.length - 1] != "" && sortedArray[sortedArray.length - 1] != null && sortedArray[sortedArray.length - 1] != undefined ? sortedArray[sortedArray.length - 1] : 0;
            lowerThenConsumptionThreshold = sortedArray.length > 0 && sortedArray[0] != "" && sortedArray[0] != null && sortedArray[0] != undefined ? sortedArray[0] : 0;
            higherThenConsumptionThresholdPU = Number(this.state.datasetJson.currentVersion.forecastThresholdHighPerc);
            lowerThenConsumptionThresholdPU = Number(this.state.datasetJson.currentVersion.forecastThresholdLowPerc);
            var finalData = [];
            var min = Math.min(...actualDiff.filter((c, index) => useForLowestError[index]))
            var treeScenarioList = this.state.treeScenarioList;
            for (var tsList = 0; tsList < treeScenarioList.length; tsList++) {
                finalData.push({
                    type: treeScenarioList[tsList].type,
                    id: treeScenarioList[tsList].id,
                    checked: treeScenarioList[tsList].checked,
                    readonly: treeScenarioList[tsList].readonly,
                    color: treeScenarioList[tsList].color,
                    tree: treeScenarioList[tsList].tree,
                    scenario: treeScenarioList[tsList].scenario,
                    totalForecast: treeScenarioList[tsList].readonly ? "" : Number(totalArray[tsList]).toFixed(2),
                    isLowest: min == actualDiff[tsList] && useForLowestError[tsList] ? 1 : 0,
                    forecastError: treeScenarioList[tsList].readonly ? i18n.t('static.supplyPlanFormula.na') : totalArray[tsList] > 0 && actualDiff.length > 0 && actualDiff[tsList] > 0 && totalActual > 0 && useForLowestError[tsList] ? (((actualDiff[tsList]) / totalActual)).toFixed(4) : "",
                    noOfMonths: treeScenarioList[tsList].readonly ? i18n.t('static.supplyPlanFormula.na') : countArray.length > 0 && countArray[tsList] != undefined && useForLowestError[tsList] ? countArray[tsList] + 1 : "",
                    compareToConsumptionForecastClass:
                        treeScenarioList[tsList].type == 'T' ?
                            !treeScenarioList[tsList].readonly
                                && totalArray[tsList] > 0
                                && lowerThenConsumptionThreshold != ""
                                && higherThenConsumptionThreshold != ""
                                && lowerThenConsumptionThreshold > 0
                                && higherThenConsumptionThreshold > 0 ?
                                totalArray[tsList] < lowerThenConsumptionThreshold ? (((Number(lowerThenConsumptionThreshold) - Number(totalArray[tsList])) / Number(lowerThenConsumptionThreshold)) * 100).toFixed(2) > lowerThenConsumptionThresholdPU ? "red" : "" : totalArray[tsList] > higherThenConsumptionThreshold ? (((Number(totalArray[tsList]) - Number(higherThenConsumptionThreshold)) / Number(higherThenConsumptionThreshold)) * 100).toFixed(2) > higherThenConsumptionThresholdPU ? "red" : "" : "" : "" : "",
                    compareToConsumptionForecast:
                        treeScenarioList[tsList].type == 'T' ?
                            !treeScenarioList[tsList].readonly
                                && totalArray[tsList] > 0
                                && lowerThenConsumptionThreshold != ""
                                && higherThenConsumptionThreshold != ""
                                && lowerThenConsumptionThreshold > 0
                                && higherThenConsumptionThreshold > 0 ?
                                totalArray[tsList] < lowerThenConsumptionThreshold ?
                                    (((Number(lowerThenConsumptionThreshold) - Number(totalArray[tsList])) / Number(lowerThenConsumptionThreshold)) * 100).toFixed(2) + i18n.t('static.compareAndSelect.belowLowestConsumption') :
                                    totalArray[tsList] > higherThenConsumptionThreshold ? (((Number(totalArray[tsList]) - Number(higherThenConsumptionThreshold)) / Number(higherThenConsumptionThreshold)) * 100).toFixed(2) + i18n.t('static.compareAndSelect.aboveHighestConsumption') :
                                        i18n.t('static.supplyPlanFormula.na') :
                                i18n.t('static.supplyPlanFormula.na') :
                            i18n.t('static.supplyPlanFormula.na'),
                    // actualTotalYear: actualTotalYear
                })
            }
            var options = {
                data: dataArr,
                columnDrag: false,
                colWidths: [0, 150, 150, 150, 100, 100, 100],
                colHeaderClasses: ["Reqasterisk"],
                columns: columns1,
                onload: this.loaded,
                pagination: localStorage.getItem("sesRecordCount"),
                search: true,
                columnSorting: true,
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
                onchangepage: this.onchangepage,
                editable: false,
                contextMenu: function (obj, x, y, e) {
                    return [];
                }.bind(this),
            };
            var dataEl = jexcel(document.getElementById("tableDiv"), options);
            this.el = dataEl;
            this.setState({
                actualDiff: actualDiff,
                finalData: finalData,
                useForLowestError: useForLowestError,
                columns1: columns1
            }, () => {
                let treeScenarioList1 = this.state.treeScenarioList;
                let dataArray = [];
                let count = 0;
                var total = 0;
                var count1 = 0;
                for (var j = 0; j < treeScenarioList1.length; j++) {
                    data = [];
                    if (this.state.selectedTreeScenarioId.includes(treeScenarioList1[j].id.toString())) {
                        count1 += 1;
                        total += Number(Number(totalArray[j]).toFixed(2))
                    }
                    data[0] = this.state.selectedTreeScenarioId.includes(treeScenarioList1[j].id.toString()) ? true : false
                    data[1] = treeScenarioList1[j].checked;
                    data[2] = treeScenarioList1[j].type == "T" ? i18n.t('static.forecastMethod.tree') : i18n.t('static.compareAndSelect.cons')
                    data[3] = `<i class="fa fa-circle" style="color:${treeScenarioList1[j].color}"  aria-hidden="true"></i> ${(treeScenarioList1[j].type == "T" ? getLabelText(treeScenarioList1[j].tree.label, this.state.lang) + " - " + getLabelText(treeScenarioList1[j].scenario.label, this.state.lang) : getLabelText(treeScenarioList1[j].scenario.extrapolationMethod.label, this.state.lang))}`
                    data[4] = `${treeScenarioList1[j].readonly ? "" : Number(totalArray[j]).toFixed(2)}`
                    data[5] = treeScenarioList1[j].readonly ? i18n.t('static.supplyPlanFormula.na') : totalArray[j] > 0 && actualDiff.length > 0 && useForLowestError[j] ? formatter((((actualDiff[j]) / totalActual) * 100).toFixed(2), 0) : ""
                    data[6] = treeScenarioList1[j].readonly ? i18n.t('static.supplyPlanFormula.na') : countArray.length > 0 && countArray[j] != undefined && totalArray[j] > 0 && actualDiff.length > 0 && useForLowestError[j] ? countArray[j] + 1 : ""
                    data[7] = finalData[j].compareToConsumptionForecast
                    data[8] = finalData[j].id
                    dataArray.push(data)
                    count++;
                }
                // data=[];
                // data[0] ="";
                // data[1] = "";
                // data[2] ="";
                // data[3] = "Total Aggregated Trees";
                // data[4] = "1234";
                // data[5]="";
                // data[6] ="";
                // data[7] ="";
                // data[8] ="";
                // dataArray.push(data);
                let columns = [];
                columns.push({ title: i18n.t('static.common.select'), type: 'checkbox', width: 50 });
                columns.push({ title: i18n.t('static.common.display?'), type: 'checkbox', width: 50 });
                columns.push({ title: i18n.t('static.equivalancyUnit.type'), type: 'text', readOnly: true, width: 50 });
                columns.push({ title: i18n.t('static.consumption.forcast'), type: 'html', readOnly: true, width: 150 });
                columns.push({ type: 'numeric', title: i18n.t('static.compareAndSelect.totalForecast'), readOnly: true, mask: '#,##0.00', decimal: '.', width: 100 });
                columns.push({ type: 'text', title: i18n.t('static.compareAndSelect.forecastError'), readOnly: true, width: 80 });
                columns.push({ type: 'text', title: i18n.t('static.compareAndSelect.forecastErrorMonths'), readOnly: true, width: 80 });
                columns.push({ type: 'text', title: i18n.t('static.compareAndSelect.compareToConsumptionForecast'), readOnly: true, width: 150 });
                columns.push({ type: 'hidden', title: 'tree scenario id' });

                try {
                    jexcel.destroy(document.getElementById("table1"), true);
                    jexcel.destroy(document.getElementById("calendarTable"), true);

                } catch (error) {
                }
                var calendarOptions = {
                    data: Object.values(calendarTableRowData),
                    columnDrag: false,
                    colHeaderClasses: ["Reqasterisk"],
                    columns: calendarTableCol,
                    onload: this.loadedCalendar,
                    pagination: false,
                    search: false,
                    defaultColWidth: 120,
                    columnSorting: false,
                    editable: false,
                    wordWrap: true,
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    allowDeleteRow: false,
                    copyCompatibility: true,
                    allowExport: false,
                    paginationOptions: JEXCEL_PAGINATION_OPTION,
                    position: 'top',
                    filters: false,
                    license: JEXCEL_PRO_KEY,
                    contextMenu: function (obj, x, y, e) {
                        return [];
                    }.bind(this),
                };
                var calendarDataEl = jexcel(document.getElementById("calendarTable"), calendarOptions);
                this.el = calendarDataEl;
                var data = dataArray;
                var options = {
                    data: data,
                    columnDrag: false,
                    colHeaderClasses: ["Reqasterisk"],
                    columns: columns,
                    onload: this.loadedTable1,
                    onchange: this.changeTable1,
                    footers: [
                        [
                            '',
                            '',
                            '',
                            i18n.t("static.compareAndSelect.totalAggregated"),
                            count1 > 0 ? formatter(Number(total).toFixed(2)) : "",
                            '',
                            '',
                            '',
                            ''
                        ]
                    ],
                    pagination: false,
                    search: false,
                    columnSorting: true,
                    wordWrap: true,
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    allowDeleteRow: false,
                    copyCompatibility: true,
                    allowExport: false,
                    position: 'top',
                    filters: false,
                    license: JEXCEL_PRO_KEY,
                    contextMenu: function (obj, x, y, e) {
                        return false;
                    }.bind(this),
                    editable: AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_COMPARE_AND_SELECT') ? true : false
                };
                var languageEl = jexcel(document.getElementById("table1"), options);
                this.el = languageEl;
                this.setState({
                    dataEl: dataEl,
                    actualConsumptionListForMonth: actualConsumptionListForMonth,
                    consumptionDataForTree: consumptionDataForTree,
                    collapsedExpandArr: collapsedExpandArr,
                    totalArray: totalArray,
                    actualDiff: actualDiff,
                    totalActual: totalActual,
                    countArray: countArray,
                    lowerThenConsumptionThreshold: lowerThenConsumptionThreshold,
                    lowerThenConsumptionThresholdPU: lowerThenConsumptionThresholdPU,
                    higherThenConsumptionThreshold: higherThenConsumptionThreshold,
                    higherThenConsumptionThresholdPU: higherThenConsumptionThresholdPU,
                    finalData: finalData,
                    loading: false,
                    columns: columns,
                    languageEl: languageEl,
                    calendarDataEl: calendarDataEl
                })
            })
        }
    }
    /**
     * Sets the equivalency unit ID in the component state based on the selected value.
     * Triggers a data refresh if the view mode is set to 3 (specific condition) and a valid equivalency unit ID is selected.
     * @param {object} e - The event object containing the selected value.
     */
    setEquivalencyUnit(e) {
        var equivalencyUnitId = e.target.value;
        this.setState({
            equivalencyUnitId
        }, () => {
            if (this.state.viewById == 3 && equivalencyUnitId > 0) {
                this.showData();
            }
        })
    }

    // Function to remove 'compareAndSelectPU' class from all <tr> elements
    removeSelectedClass() {
        var allTrElements = document.querySelectorAll('.planingUnitClass');
        allTrElements.forEach(function (tr) {
            tr.classList.remove('compareAndSelectPU');
        });
    }

    /**
     * Sets the planning unit ID in the component state based on the selected value.
     * @param {object} e - The event object containing the selected value.
     * @returns {void}
     */
    setPlanningUnitId(e) {
        var trElement = document.querySelector('.planingUnitId-' + e);
        // Check if the element exists before adding the class
        if (trElement) {
            this.removeSelectedClass();
            trElement.classList.add('compareAndSelectPU');
        } else {
            // var pu = localStorage.getItem("sesDatasetPlanningUnitId")
            // var trElement1 = document.querySelector('.planingUnitId-' + pu);
            // trElement1.classList.add('compareAndSelectPU');
        }

        var cont = false;
        if (this.state.dataChangedFlag == 1) {
            var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
            if (cf == true) {
                cont = true;
            } else {
            }

        } else {
            cont = true;
        }

        if (cont == true) {
            localStorage.setItem("sesDatasetPlanningUnitId", e);
            this.setState({
                dataChangedFlag: 0,
                loading: true
            })
            if (e > 0) {
                var name = this.state.planningUnitList.filter(c => c.planningUnit.id == e);
                var planningUnitId = e;
                var equivalencyUnit = this.state.equivalencyUnitListAll.filter(c => c.forecastingUnit.id == name[0].planningUnit.forecastingUnit.id && c.equivalencyUnit.active);
                var viewById = this.state.viewById;
                this.setState({
                    planningUnitId: planningUnitId,
                    planningUnitLabel: name.length > 0 ? name[0].planningUnit.label : "",
                    forecastingUnitId: name.length > 0 ? name[0].planningUnit.forecastingUnit.id : "",
                    equivalencyUnitId: equivalencyUnit.length == 1 ? equivalencyUnit[0].equivalencyUnitMappingId : 0,
                    loading: false,
                    viewById: viewById == 3 && equivalencyUnit.length == 0 ? 1 : viewById,
                    equivalencyUnitList: equivalencyUnit,
                    changed: false
                }, () => {
                    if (planningUnitId > 0) {
                        this.showData();
                    }
                    // if ((viewById == 3 && equivalencyUnit.length == 0 ? 1 : viewById) == 3) {
                    //     document.getElementById("equivalencyUnitDiv").style.display = "block";
                    // } else if (viewById == 3) {
                    //     document.getElementById("equivalencyUnitDiv").style.display = "none";
                    // }
                })
            } else {
                this.setState({
                    planningUnitId: planningUnitId,
                    showAllData: false,
                    loading: false
                })
            }
        }
    }
    /**
     * Sets the forecasting unit ID in the component state based on the selected value.
     * @param {object} e - The event object containing the selected value.
     * @returns {void}
     */
    setForecastingUnit(e) {
        var forecastingUnitId = e.target.value;
        var viewById = this.state.viewById;
        this.setState({
            forecastingUnitId
        }, () => {
            if (viewById == 2 && forecastingUnitId > 0) {
                this.showData()
            }
        })
    }
    /**
     * Toggles the 'show' state in the component, changing its value to the opposite of the current state.
     */
    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' : ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' : ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + " " + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1])).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (getLabelText(this.state.datasetJson.label, this.state.lang)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.region') + ' : ' + document.getElementById("regionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.planningUnit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push(('"' + (i18n.t('static.compareAndSelect.yAxisIn') + ' : ' + (this.state.viewById == 1 ? i18n.t('static.report.planningUnit') : this.state.viewById == 2 ? i18n.t('static.dashboard.forecastingunit') : i18n.t('static.equivalancyUnit.equivalancyUnit')) + '"')).replaceAll(' ', '%20'))
        if (this.state.viewById == 2) {
            csvRow.push('"' + (i18n.t('static.product.unit1') + ' : ' + document.getElementById("forecastingUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        } else if (this.state.viewById == 3) {
            csvRow.push('"' + (i18n.t('static.equivalancyUnit.equivalancyUnit') + ' : ' + document.getElementById("equivalencyUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        }
        csvRow.push('"' + (i18n.t('static.compareAndSelect.showOnlyForecastPeriod') + ' : ' + (this.state.showForecastPeriod == 1 ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'))).replaceAll(' ', '%20') + '"')
        if (!this.state.showForecastPeriod) {
            csvRow.push('"' + (i18n.t('static.compareAndSelect.startMonthForGraph') + ' : ' + makeText(this.state.singleValue2.from) + ' ~ ' + makeText(this.state.singleValue2.to)).replaceAll(' ', '%20') + '"')
        }
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;
        var columns = [];
        columns.push(i18n.t('static.equivalancyUnit.type'));
        columns.push(i18n.t('static.consumption.forcast'));
        columns.push(i18n.t('static.compareAndSelect.selectAsForecast'));
        columns.push(i18n.t('static.compareAndSelect.totalForecast'));
        columns.push(i18n.t('static.compareAndSelect.forecastError'));
        columns.push(i18n.t('static.compareAndSelect.forecastErrorMonths').replaceAll('#', '%23'));
        columns.push(i18n.t('compareToConsumptionForecast'));
        let headers = [];
        columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
        var A = [addDoubleQuoteToRowContent(headers)];

        this.state.finalData.map(ele =>
            A.push(addDoubleQuoteToRowContent([ele.type == "T" ? i18n.t('static.forecastMethod.tree') : i18n.t('static.compareAndSelect.cons'),
            ele.type == "T" ? (getLabelText(ele.tree.label, this.state.lang) + " - " + getLabelText(ele.scenario.label, this.state.lang)).replaceAll(',', ' ').replaceAll(' ', '%20') : getLabelText(ele.scenario.extrapolationMethod.label, this.state.lang).replaceAll(',', ' ').replaceAll(' ', '%20'),
            this.state.selectedTreeScenarioId.includes(ele.id.toString()) ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'),
            !ele.readonly ? ele.totalForecast.toString().replaceAll(',', ' ').replaceAll(' ', '%20') : "",
            ele.forecastError.toString().replaceAll(',', ' ').replaceAll(' ', '%20'),
            ele.noOfMonths.toString().replaceAll(',', ' ').replaceAll(' ', '%20'),
            ele.compareToConsumptionForecast.toString().replaceAll(',', ' ').replaceAll(' ', '%20')])));

        if (this.state.xAxisDisplayBy != 1) {
            headers = [];
            var C1 = []
            let calendarColumns = this.state.calendarDataEl.options.columns.filter(c => c.type != "hidden")
            let calendarColumnsArr = [];
            for (var i = 0; i < calendarColumns.length; i++) {
                calendarColumnsArr.push(calendarColumns[i].title);
            }
            calendarColumnsArr.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
            C1.push([addDoubleQuoteToRowContent(headers)]);

            var B1 = []
            Object.values(this.state.calendarDataEl.options.data).map(ele => {
                B1 = [];
                this.state.calendarDataEl.options.columns.map((item, idx) => {
                    if (item.type != 'hidden') {
                        B1.push(ele[idx].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23'));
                    }
                })
                C1.push(addDoubleQuoteToRowContent(B1));
            })
        }
        headers = [];
        this.state.columns1.filter(c => c.type != 'hidden').map((item, idx) => { headers[idx] = (item.title).replaceAll(' ', '%20') });
        var C = []
        C.push([addDoubleQuoteToRowContent(headers)]);
        var B = []
        this.state.dataEl.getJson(null, false).map(ele => {
            B = [];
            this.state.columns1.map((item, idx) => {
                if (item.type != 'hidden') {
                    if (item.type == 'numeric') {
                        if (item.mask != undefined && item.mask.toString().includes("%")) {
                            B.push((ele[idx] + " %").toString().replaceAll(',', ' ').replaceAll(' ', '%20'));
                        } else {
                            B.push(ele[idx] != "" ? "" + Number(ele[idx]).toFixed(2).toString().replaceAll(',', ' ').replaceAll(' ', '%20') : "");
                        }
                    } else if (item.type == 'calendar') {
                        B.push(moment(ele[idx]).format(DATE_FORMAT_CAP_WITHOUT_DATE_FOUR_DIGITS).toString().replaceAll(',', ' ').replaceAll(' ', '%20'));
                    } else {
                        B.push(ele[idx] != "" ? Number(ele[idx]).toFixed(2).toString().replaceAll(',', ' ').replaceAll(' ', '%20') : "");
                    }
                }
            })
            C.push(addDoubleQuoteToRowContent(B));
        })
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        csvRow.push('');
        csvRow.push('');
        if (this.state.xAxisDisplayBy != 1) {
            for (var i = 0; i < C1.length; i++) {
                csvRow.push(C1[i].join(","))
            }
        }
        csvRow.push('');
        csvRow.push('');
        for (var i = 0; i < C.length; i++) {
            csvRow.push(C[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.compareAndSelect') + "-" + document.getElementById("planningUnitId").selectedOptions[0].text + "-" + document.getElementById("regionId").selectedOptions[0].text + ".csv"
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
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
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
                doc.text(document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + " " + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1]), doc.internal.pageSize.width - 40, 50, {
                    align: 'right'
                })
                doc.text(getLabelText(this.state.datasetJson.label, this.state.lang), doc.internal.pageSize.width - 40, 60, {
                    align: 'right'
                })
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.compareAndSelect'), doc.internal.pageSize.width / 2, 80, {
                    align: 'center'
                })
                if (i == 1) {
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
        var y = 100;
        var planningText = doc.splitTextToSize(i18n.t('static.common.forecastPeriod') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to), doc.internal.pageSize.width * 3 / 4);
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 100;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 5;
        }
        planningText = doc.splitTextToSize(i18n.t('static.program.region') + ' : ' + document.getElementById("regionId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
        y = y + 5;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 100;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 5;
        }
        planningText = doc.splitTextToSize(i18n.t('static.report.planningUnit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
        y = y + 5;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 100;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 5;
        }
        planningText = doc.splitTextToSize(i18n.t('static.compareAndSelect.yAxisIn') + ' : ' + (this.state.viewById == 1 ? i18n.t('static.report.planningUnit') : this.state.viewById == 2 ? i18n.t('static.dashboard.forecastingunit') : i18n.t('static.equivalancyUnit.equivalancyUnit')), doc.internal.pageSize.width * 3 / 4);
        y = y + 5;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 100;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 5;
        }
        if (this.state.viewById == 2) {
            planningText = doc.splitTextToSize(i18n.t('static.product.unit1') + ' : ' + document.getElementById("forecastingUnitId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
            y = y + 5;
            for (var i = 0; i < planningText.length; i++) {
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 100;
                }
                doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
                y = y + 5;
            }
        } else if (this.state.viewById == 3 && document.getElementById("equivalancyUnitId") != null) {
            planningText = doc.splitTextToSize(i18n.t('static.equivalancyUnit.equivalancyUnit') + ' : ' + document.getElementById("equivalancyUnitId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
            y = y + 5;
            for (var i = 0; i < planningText.length; i++) {
                if (y > doc.internal.pageSize.height - 100) {
                    doc.addPage();
                    y = 100;
                }
                doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
                y = y + 5;
            }
        }
        planningText = doc.splitTextToSize(i18n.t('static.compareAndSelect.showOnlyForecastPeriod') + ' : ' + (this.state.showForecastPeriod == 1 ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False')), doc.internal.pageSize.width * 3 / 4);
        y = y + 5;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 100;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 5;
        }
        if (!this.state.showForecastPeriod) {
            y = y + 5;
            doc.text(i18n.t('static.compareAndSelect.startMonthForGraph') + ' : ' + makeText(this.state.singleValue2.from) + ' ~ ' + makeText(this.state.singleValue2.to), doc.internal.pageSize.width / 20, y, {
                align: 'left'
            })
        }
        y = y + 5;
        var canvas = document.getElementById("cool-canvas");
        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        let startY = y + 10
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        doc.setTextColor("#fff");
        let col1 = []
        let dataArr3 = [];
        col1.push(i18n.t('static.common.display?'));
        col1.push(i18n.t('static.equivalancyUnit.type'));
        col1.push(i18n.t('static.consumption.forcast'));
        col1.push(i18n.t('static.compareAndSelect.selectAsForecast'));
        col1.push(i18n.t('static.compareAndSelect.totalForecast'));
        col1.push(i18n.t('static.compareAndSelect.forecastError'));
        col1.push(i18n.t('static.compareAndSelect.forecastErrorMonths'));
        col1.push(i18n.t('static.compareAndSelect.compareToConsumptionForecast'));

        this.state.finalData.map(ele =>
            dataArr3.push([ele.checked == 1 ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'), ele.type == "T" ? i18n.t('static.forecastMethod.tree') : i18n.t('static.compareAndSelect.cons'),
            ele.type == "T" ? (getLabelText(ele.tree.label, this.state.lang) + " - " + getLabelText(ele.scenario.label, this.state.lang)) : getLabelText(ele.scenario.extrapolationMethod.label, this.state.lang),
            this.state.selectedTreeScenarioId.includes(ele.id.toString()) ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'),
            formatter(ele.totalForecast, 0),
            ele.forecastError != i18n.t('static.supplyPlanFormula.na') ? ele.forecastError != "" ? formatter(ele.forecastError, 0) : "" : ele.forecastError,
            ele.noOfMonths.toString(),
            ele.compareToConsumptionForecast != i18n.t('static.supplyPlanFormula.na') ? formatter(ele.compareToConsumptionForecast, 0) : ele.compareToConsumptionForecast])
        )
        let data2 = dataArr3;
        let content1 = {
            margin: { top: 100, bottom: 50 },
            startY: startYtable,
            head: [col1],
            body: data2,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            didParseCell: function (data) {
                if (data.row.section != "head" && data.column.index == col1.length - 1) {
                    if (this.state.finalData[data.row.index].compareToConsumptionForecastClass == "red") {
                        data.cell.styles.textColor = '#BA0C2F';
                    }
                }
                if (data.row.section != "head" && data.column.index == (col1.length - 3)) {
                    if (this.state.finalData[data.row.index].isLowest) {
                        data.cell.styles.textColor = '#118b70';
                    }
                }
            }.bind(this)
        };
        doc.autoTable(content1);
        doc.addPage();
        doc.addImage(canvasImg, 'png', 50, 100, 750, 260, 'CANVAS');
        if (this.state.xAxisDisplayBy != 1) {
            var C1 = []
            var B1 = []
            let calendarColumns = this.state.calendarDataEl.options.columns.filter(c => c.type != "hidden")
            // Convert object to array while skipping the second cell data
            Object.values(this.state.calendarDataEl.options.data).map(ele => {
                B1 = [];
                this.state.calendarDataEl.options.columns.map((item, idx) => {
                    if (item.type != 'hidden') {
                        B1.push(ele[idx].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23'));
                    }
                })
                C1.push(B1);
            })

            // Object.values(this.state.calendarDataEl.options.data).filter(c => c.type != "hidden");

            let calendarColumnsArr = [];
            for (var i = 0; i < calendarColumns.length; i++) {
                calendarColumnsArr.push(calendarColumns[i].title);
            }
            doc.addPage()
            startYtable = 100
            let calendarContent = {
                margin: { top: 100, bottom: 50 },
                startY: startYtable,
                head: [calendarColumnsArr],
                body: C1,
                styles: { lineWidth: 1, fontSize: 8, halign: 'center' }
            };
            doc.autoTable(calendarContent);
        }
        var columns = [];
        this.state.columns1.filter(c => c.type != 'hidden').map((item, idx) => { columns.push(item.title) });
        var dataArr = [];
        var dataArr1 = [];
        this.state.dataEl.getJson(null, false).map(ele => {
            dataArr = [];
            this.state.columns1.map((item, idx) => {
                if (item.type != 'hidden') {
                    if (item.type == 'numeric') {
                        if (item.mask != undefined && item.mask.toString().includes("%")) {
                            dataArr.push(formatter(ele[idx], 0) + " %");
                        } else {
                            dataArr.push(formatter(ele[idx], 0));
                        }
                    } else if (item.type == 'calendar') {
                        dataArr.push(moment(ele[idx]).format(DATE_FORMAT_CAP_WITHOUT_DATE));
                    } else {
                        dataArr.push(ele[idx]);
                    }
                }
            })
            dataArr1.push(dataArr);
        })
        const data = dataArr1;
        doc.addPage()
        startYtable = 100
        let content = {
            margin: { top: 100, bottom: 50 },
            startY: startYtable,
            head: [columns],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            didParseCell: function (data) {
                if (data.row.section != "head") {
                    var index = this.state.monthList.findIndex(c => moment(c).format("YYYY-MM") == moment((this.state.dataEl.getJson(null, false)[data.row.index])[0]).format("YYYY-MM"))
                    if (index != -1) {
                        data.cell.styles.fontStyle = 'bold';
                        if (data.column.index === 0 || data.column.index === 1) {
                        } else {
                            data.cell.styles.fontStyle = 'bolditalic';
                            data.cell.styles.textColor = 'rgb(170, 85, 161)'
                        }
                    } else {
                        if (data.column.index === 0 || data.column.index === 1) {
                        } else {
                            data.cell.styles.textColor = 'rgb(170, 85, 161)'
                        }
                    }
                }
            }.bind(this)
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.compareAndSelect') + "-" + document.getElementById("planningUnitId").selectedOptions[0].text + "-" + document.getElementById("regionId").selectedOptions[0].text + '.pdf');
    }
    /**
     * Retrieves datasets from IndexedDB and updates the component state accordingly.
     */
    getDatasets() {
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
                var euTransaction = db1.transaction(['equivalencyUnit'], 'readwrite');
                var euOs = euTransaction.objectStore('equivalencyUnit');
                var euRequest = euOs.getAll();
                euRequest.onerror = function (event) {
                }.bind(this);
                euRequest.onsuccess = function (event) {
                    var euList = euRequest.result;
                    var myResult = [];
                    myResult = getRequest.result;
                    var datasetList = [];
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    for (var mr = 0; mr < myResult.length; mr++) {
                        if (myResult[mr].userId == userId) {
                            var json = {
                                id: myResult[mr].id,
                                name: myResult[mr].programCode + "~v" + myResult[mr].version,
                                programJson: myResult[mr].programData
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
                    } else if (this.props.match.params.programId != "" && datasetList.filter(c => c.id == this.props.match.params.programId).length > 0) {
                        datasetId = this.props.match.params.programId;
                        event.target.value = this.props.match.params.programId;
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
                        datasetList: datasetList.sort(function (a, b) {
                            a = a.name.toLowerCase();
                            b = b.name.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        equivalencyUnitList: euList,
                        loading: false,
                        datasetId: datasetId,
                        equivalencyUnitListAll: euList
                    }, () => {
                        if (datasetId != "") {
                            this.setDatasetId(event);
                        }
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
    /**
     * Calls getDatasets function on component mount
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

        this.getDatasets();
    }
    /**
     * This function is triggered when this component is about to unmount
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
        window.onbeforeunload = null;
    }
    /**
     * This function is trigged when this component is updated and is being used to display the warning for leaving unsaved changes
     */
    componentDidUpdate = () => {
        if (this.state.dataChangedFlag == 1) {
            window.onbeforeunload = () => true
        } else {
            window.onbeforeunload = undefined
        }
    }

    /**
     * This function is used to expand and compress the year columns in table
     */
    expandCompressFuntion = () => {
        var e = this.state.languageEl;
        var count = 4
        if (this.state.expandCompressBtn) {
            for (var i = 0; i < this.state.yearArray.length; i++) {
                e.hideColumn(count + i);
            }
        } else {
            for (var i = 0; i < this.state.yearArray.length; i++) {
                e.showColumn(count + i);
            }
        }
        this.setState({ expandCompressBtn: !this.state.expandCompressBtn });
    }

    /**
     * This function is used to expand and compress the planning unit table
     */
    expandCompressPUFuntion = () => {
        this.setState({ expandCompressPUBtn: !this.state.expandCompressPUBtn, showHidePU: !this.state.showHidePU });
    }

    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedTable1 = function (instance, cell) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var elInstance = instance.worksheets[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('InfoTr');
        tr.children[1].title = i18n.t('static.tooltip.SelectAsForecast');
        tr.children[2].classList.add('InfoTr');
        tr.children[2].title = i18n.t('static.tooltip.Display');
        tr.children[3].classList.add('InfoTr');
        tr.children[3].title = i18n.t('static.tooltip.CompareandSelectType');
        tr.children[4].classList.add('InfoTr');
        tr.children[4].title = i18n.t('static.tooltip.Forecst');
        tr.children[5].title = i18n.t('static.common.forForecastPeriod') + " " + moment(this.state.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " " + i18n.t('static.jexcel.to') + " " + moment(this.state.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE);
        tr.children[6].classList.add('InfoTr');
        tr.children[6].title = i18n.t('static.tooltip.ForecastError');
        tr.children[7].classList.add('InfoTr');
        tr.children[7].title = i18n.t('static.tooltip.ForecastErrorMonthUsed');
        tr.children[8].classList.add('InfoTr');
        tr.children[8].title = i18n.t('static.tooltip.ComparetoConsumptionForecast');
        var json = elInstance.getJson(null, false);
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        for (var j = 0; j < json.length; j++) {
            var rowData = elInstance.getRowData(j);
            if (this.state.treeScenarioList[j].readonly) {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                    cell.classList.add('readonlyForecast');
                    cell.classList.add('readonly');
                }
            } else if (this.state.selectedTreeScenarioId.includes(rowData[8].toString())) {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                    cell.classList.add('selectedForecast');
                }
            } else {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                    cell.classList.add('notSelectedForecast');
                }
            }
            if (Math.min(...this.state.actualDiff.filter((c, index) => this.state.useForLowestError[index])) == this.state.actualDiff[j] && this.state.useForLowestError[j]) {
                var cell = elInstance.getCell(("F").concat(parseInt(j) + 1))
                cell.classList.add('lowestError');
            } else {
                var cell = elInstance.getCell(("F").concat(parseInt(j) + 1))
                cell.classList.add('notLowestError');
            }
            if (this.state.finalData[j].compareToConsumptionForecastClass != "") {
                var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                cell.classList.add(this.state.finalData[j].compareToConsumptionForecastClass == "red" ? "compareAndSelectRed" : this.state.finalData[j].compareToConsumptionForecastClass);
            }
        }
    }
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changeTable1 = function (instance, cell, x, y, value) {
        // this.setState({
        //     loading: true
        // })
        var elInstance = instance;
        // elInstance.setColumnGroup(0, this.state.yearArray.length)

        if (x == 1) {
            var treeScenarioList = this.state.treeScenarioList;
            var index = this.state.treeScenarioList.findIndex(c => c.id == elInstance.getRowData(y)[8]);
            treeScenarioList[index].checked = !treeScenarioList[index].checked;
            this.setState({
                treeScenarioList: treeScenarioList,
                loading: true
            }, () => {
                this.buildJexcel()
            })
        }
        if (x == 0) {
            if (value.toString() == "true") {
                var selectedTreeScenarioId = this.state.selectedTreeScenarioId;
                selectedTreeScenarioId.push(elInstance.getRowData(y)[8].toString());
                if (selectedTreeScenarioId.length > 1) {
                    var checkIfLatestIsConsumption = this.state.treeScenarioList.filter(c => c.id == elInstance.getRowData(y)[8].toString())[0].type;
                    if (checkIfLatestIsConsumption == "C") {
                        selectedTreeScenarioId = selectedTreeScenarioId.filter(c => c == elInstance.getRowData(y)[8].toString());
                    } else {
                        var treeAndScenarioList = this.state.treeScenarioList.filter(c => selectedTreeScenarioId.includes(c.id.toString()) && c.type == "T");
                        selectedTreeScenarioId = [];
                        treeAndScenarioList.map(item => {
                            selectedTreeScenarioId.push(item.id.toString());
                        });
                    }
                }
            } else {
                var selectedTreeScenarioId = this.state.selectedTreeScenarioId;
                selectedTreeScenarioId = selectedTreeScenarioId.filter(c => c != elInstance.getRowData(y)[8].toString());
            }
            var json = instance.getJson(null, false);
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            var total = 0;
            var count = 0;
            for (var j = 0; j < json.length; j++) {
                var rowData = elInstance.getRowData(j);
                var treeScenarioFilter = this.state.treeScenarioList.filter(c => c.id == elInstance.getRowData(j)[8].toString() && selectedTreeScenarioId.includes(c.id.toString()));
                if (treeScenarioFilter.length > 0) {
                    count += 1;
                    total += Number(rowData[4].toString().replaceAll(",", ""));
                }
                instance.setFooter(
                    [
                        [
                            '',
                            '',
                            '',
                            i18n.t("static.compareAndSelect.totalAggregated"),
                            count > 0 ? formatter(Number(total).toFixed(2)) : "",
                            '',
                            '',
                            '',
                            ''
                        ]
                    ]
                )
                if (j != y) {
                    instance.setValueFromCoords(x, j, (selectedTreeScenarioId.includes(elInstance.getRowData(j)[8].toString()) ? true : false), true);
                }
                var rowData = elInstance.getRowData(j);
                if (this.state.treeScenarioList[j].readonly) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                        try {
                            cell.classList.remove('notSelectedForecast');
                        } catch (err) { }
                        try {
                            cell.classList.remove('selectedForecast');
                        } catch (err) { }
                        cell.classList.add('readonlyForecast');
                        cell.classList.add('readonly');
                    }
                } else if (selectedTreeScenarioId.includes(rowData[8].toString())) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                        try {
                            cell.classList.remove('notSelectedForecast');
                        } catch (err) { }
                        cell.classList.add('selectedForecast');
                    }
                } else {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                        try {
                            cell.classList.remove('selectedForecast');
                        } catch (err) { }
                        cell.classList.add('notSelectedForecast');
                    }
                }
                if (Math.min(...this.state.actualDiff.filter((c, index) => this.state.useForLowestError[index])) == this.state.actualDiff[j] && this.state.useForLowestError[j]) {
                    var cell = elInstance.getCell(("F").concat(parseInt(j) + 1))
                    try {
                        cell.classList.remove('notLowestError');
                    } catch (err) { }
                    cell.classList.add('lowestError');
                } else {
                    var cell = elInstance.getCell(("F").concat(parseInt(j) + 1))
                    try {
                        cell.classList.remove('lowestError');
                    } catch (err) { }
                    cell.classList.add('notLowestError');
                }
                if (this.state.finalData[j].compareToConsumptionForecastClass != "") {
                    var cell = elInstance.getCell(("H").concat(parseInt(j) + 1))
                    try {
                        cell.classList.remove(this.state.finalData[j].compareToConsumptionForecastClass == "red" ? this.state.finalData[j].compareToConsumptionForecastClass : "compareAndSelectRed");
                    } catch (err) { }
                    cell.classList.add(this.state.finalData[j].compareToConsumptionForecastClass == "red" ? "compareAndSelectRed" : this.state.finalData[j].compareToConsumptionForecastClass);
                }
            }
            this.setState({
                dataChangedFlag: 1,
                changed: true,
                selectedTreeScenarioId: selectedTreeScenarioId
            }, () => {
                // this.buildJexcel();
            })
        }
    }
    /**
         * This function is used to format the table like add asterisk or info to the table headers
         * @param {*} instance This is the DOM Element where sheet is created
         * @param {*} cell This is the object of the DOM element
         */
    loadedCalendar = function (instance, cell) {
        jExcelLoadedFunction(instance);
    }

    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunction(instance);
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson(null, false);
        var jsonLength;
        if ((document.getElementsByClassName("jss_pagination_dropdown")[0] != undefined)) {
            jsonLength = 1 * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        }
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var tList = this.state.treeScenarioList;
        for (var y = 0; y < jsonLength; y++) {
            var rowData = elInstance.getRowData(y);
            var index = this.state.monthList.findIndex(c => moment(c).format("YYYY-MM") == moment(rowData[0]).format("YYYY-MM"))
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ', 'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ', 'CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'CI', 'CJ', 'CK', 'CL', 'CM', 'CN', 'CO', 'CP', 'CQ', 'CR', 'CS', 'CT', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DA', 'DB', 'DC', 'DD', 'DE', 'DF', 'DG', 'DH', 'DI', 'DJ', 'DK', 'DL', 'DM', 'DN', 'DO', 'DP', 'DQ', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX', 'DY', 'DZ', 'EA', 'EB', 'EC', 'ED', 'EE', 'EF', 'EG', 'EH', 'EI', 'EJ', 'EK', 'EL', 'EM', 'EN', 'EO', 'EP', 'EQ', 'ER', 'ES', 'ET', 'EU', 'EV', 'EW', 'EX', 'EY', 'EZ', 'FA', 'FB', 'FC', 'FD', 'FE', 'FF', 'FG', 'FH', 'FI', 'FJ', 'FK', 'FL', 'FM', 'FN', 'FO', 'FP', 'FQ', 'FR', 'FS', 'FT', 'FU', 'FV', 'FW', 'FX', 'FY', 'FZ', 'GA', 'GB', 'GC', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GJ', 'GK', 'GL', 'GM', 'GN', 'GO', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GV', 'GW', 'GX', 'GY', 'GZ', 'HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG', 'HH', 'HI', 'HJ', 'HK', 'HL', 'HM', 'HN', 'HO', 'HP', 'HQ', 'HR', 'HS', 'HT', 'HU', 'HV', 'HW', 'HX', 'HY', 'HZ', 'IA', 'IB', 'IC', 'ID', 'IE', 'IF', 'IG', 'IH', 'II', 'IJ', 'IK', 'IL', 'IM', 'IN', 'IO', 'IP', 'IQ', 'IR', 'IS', 'IT', 'IU', 'IV', 'IW', 'IX', 'IY', 'IZ'];
            if (index != -1) {
                var cell = elInstance.getCell((colArr[0]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelBoldCell');
                var cell = elInstance.getCell((colArr[1]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelBoldCell');
                for (var c = 2; c <= tList.length + 1; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('jexcelBoldPurpleCell');
                }
                var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelBoldPurpleCell');
            } else {
                for (var c = 2; c <= tList.length + 1; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('jexcelPurpleCell');
                }
                var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelPurpleCell');
            }
        }
    }
    /**
     * This function is called when page is changed to make some cells readonly based on multiple condition
     * @param {*} el This is the DOM Element where sheet is created
     * @param {*} pageNo This the page number which is clicked
     * @param {*} oldPageNo This is the last page number that user had selected
     */
    onchangepage(el, pageNo, oldPageNo) {
        var elInstance = el;
        var json = elInstance.getJson(null, false);
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        var tList = this.state.treeScenarioList;
        for (var y = start; y < jsonLength; y++) {
            var rowData = elInstance.getRowData(y);
            var index = this.state.monthList.findIndex(c => moment(c).format("YYYY-MM") == moment(rowData[0]).format("YYYY-MM"))
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ', 'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ', 'CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'CI', 'CJ', 'CK', 'CL', 'CM', 'CN', 'CO', 'CP', 'CQ', 'CR', 'CS', 'CT', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DA', 'DB', 'DC', 'DD', 'DE', 'DF', 'DG', 'DH', 'DI', 'DJ', 'DK', 'DL', 'DM', 'DN', 'DO', 'DP', 'DQ', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX', 'DY', 'DZ', 'EA', 'EB', 'EC', 'ED', 'EE', 'EF', 'EG', 'EH', 'EI', 'EJ', 'EK', 'EL', 'EM', 'EN', 'EO', 'EP', 'EQ', 'ER', 'ES', 'ET', 'EU', 'EV', 'EW', 'EX', 'EY', 'EZ', 'FA', 'FB', 'FC', 'FD', 'FE', 'FF', 'FG', 'FH', 'FI', 'FJ', 'FK', 'FL', 'FM', 'FN', 'FO', 'FP', 'FQ', 'FR', 'FS', 'FT', 'FU', 'FV', 'FW', 'FX', 'FY', 'FZ', 'GA', 'GB', 'GC', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GJ', 'GK', 'GL', 'GM', 'GN', 'GO', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GV', 'GW', 'GX', 'GY', 'GZ', 'HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG', 'HH', 'HI', 'HJ', 'HK', 'HL', 'HM', 'HN', 'HO', 'HP', 'HQ', 'HR', 'HS', 'HT', 'HU', 'HV', 'HW', 'HX', 'HY', 'HZ', 'IA', 'IB', 'IC', 'ID', 'IE', 'IF', 'IG', 'IH', 'II', 'IJ', 'IK', 'IL', 'IM', 'IN', 'IO', 'IP', 'IQ', 'IR', 'IS', 'IT', 'IU', 'IV', 'IW', 'IX', 'IY', 'IZ'];
            if (index != -1) {
                var cell = elInstance.getCell((colArr[0]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelBoldCell');
                var cell = elInstance.getCell((colArr[1]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelBoldCell');
                for (var c = 2; c <= tList.length + 1; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('jexcelBoldPurpleCell');
                }
                var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelBoldPurpleCell');
            } else {
                for (var c = 2; c <= tList.length + 1; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('jexcelPurpleCell');
                }
                var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelPurpleCell');
            }
        }
    }

    /**
    * Build the Planning unit list based on forecast selected or not
    * @param {object} datasetJson - The datasetJson object containing the dataset json.
    * @param {object} regionId - The regionId object containing the region ID value.
    */
    getPlanningUnitsForTable(datasetJson, regionId) {
        var puList = datasetJson.planningUnitList.filter(c => c.active.toString() == "true");
        var planningUnitListForTable = []
        for (var p = 0; p < puList.length; p++) {
            var map = puList[p].selectedForecastMap[regionId];
            var selectedForecastString = "";
            if (map != undefined && map.consumptionExtrapolationId > 0) {
                var obj = datasetJson.consumptionExtrapolation.filter(c => c.planningUnit.id == puList[p].planningUnit.id && c.consumptionExtrapolationId == map.consumptionExtrapolationId)[0];
                selectedForecastString = obj != undefined ? getLabelText(obj.extrapolationMethod.label, this.state.lang) : "";
                planningUnitListForTable.push({ planningUnit: puList[p].planningUnit, selectedForecast: selectedForecastString })
            } else if (map != undefined && map.treeAndScenario != undefined && map.treeAndScenario.length > 0) {
                var treeAndScenario = map.treeAndScenario;
                for (var tas = 0; tas < treeAndScenario.length; tas++) {
                    var t = datasetJson.treeList.filter(c => c.active.toString() == "true" && treeAndScenario[tas].treeId == c.treeId)[0];
                    var s = t != undefined ? t.scenarioList.filter(s => s.id == treeAndScenario[tas].scenarioId)[0] : undefined;
                    selectedForecastString = selectedForecastString.concat(t != undefined && s != undefined ? getLabelText(t.label, this.state.lang) + " - " + getLabelText(s.label, this.state.lang) : "");
                }
                planningUnitListForTable.push({ planningUnit: puList[p].planningUnit, selectedForecast: selectedForecastString })
            } else {
                selectedForecastString = ""
                planningUnitListForTable.push({ planningUnit: puList[p].planningUnit, selectedForecast: selectedForecastString })
            }
        }
        this.setState({
            planningUnitListForTable: planningUnitListForTable.sort(function (a, b) {
                a = getLabelText(a.planningUnit.label, this.state.lang).toLowerCase();
                b = getLabelText(b.planningUnit.label, this.state.lang).toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
            }.bind(this))
        })
    }

    /**
     * Sets the dataset ID and updates the component state with associated data.
     * @param {object} event - The event object containing the dataset ID value.
     */
    setDatasetId(event) {
        var cont = false;
        if (this.state.dataChangedFlag == 1) {
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
                dataChangedFlag: 0
            });
            var datasetId = event.target.value;
            this.setState({ loading: true })
            this.setState({
                datasetId: datasetId,
                changed: false,
                consumptionUnitShowArr: []
            }, () => {
                if (datasetId != "") {
                    localStorage.setItem("sesDatasetId", datasetId);
                    localStorage.setItem("sesForecastProgramIdReport", parseInt(datasetId.split('_')[0]));
                    let versionIdSes = (datasetId.split('_')[1]).replace('v', '') + ' (Local)';
                    localStorage.setItem("sesForecastVersionIdReport", versionIdSes);

                    localStorage.setItem("sesLiveDatasetId", parseInt(datasetId.split('_')[0]));
                    localStorage.setItem("sesDatasetCompareVersionId", versionIdSes);
                    localStorage.setItem("sesDatasetVersionId", versionIdSes);
                    var datasetFiltered = this.state.datasetList.filter(c => c.id == datasetId)[0];
                    var datasetDataBytes = CryptoJS.AES.decrypt(datasetFiltered.programJson, SECRET_KEY);
                    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                    var datasetJson = JSON.parse(datasetData);
                    var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
                    var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
                    var curDate = moment(startDate).format("YYYY-MM-DD");
                    var monthList = [];
                    for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
                        curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                        monthList.push(curDate);
                    }
                    var monthList1 = [];
                    curDate = moment(startDate).format("YYYY-MM-DD");
                    for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
                        curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                        monthList1.push(curDate);
                    }
                    var rangeValue = { from: { year: Number(moment(startDate).startOf('month').format("YYYY")), month: Number(moment(startDate).startOf('month').format("M")) }, to: { year: Number(moment(stopDate).startOf('month').format("YYYY")), month: Number(moment(stopDate).startOf('month').format("M")) } }
                    var maxDateForSingleValue = { year: Number(moment(stopDate).startOf('month').format("YYYY")), month: Number(moment(stopDate).startOf('month').format("M")) }
                    var regionList = datasetJson.regionList;
                    var forecastingUnitList = [];
                    var planningUnitList = datasetJson.planningUnitList
                    for (var pu = 0; pu < planningUnitList.length; pu++) {
                        var index = forecastingUnitList.findIndex(c => c.id == planningUnitList[pu].planningUnit.forecastingUnit.id);
                        if (index == -1) {
                            forecastingUnitList.push(planningUnitList[pu].planningUnit.forecastingUnit);
                        }
                    }
                    var planningUnitId = "";
                    var event = {
                        target: {
                            value: ""
                        }
                    };
                    if (planningUnitList.length == 1) {
                        planningUnitId = planningUnitList[0].planningUnit.id;
                        event.target.value = planningUnitList[0].planningUnit.id;
                    } else if (this.props.match.params.planningUnitId != "" && planningUnitList.filter(c => c.planningUnit.id == this.props.match.params.planningUnitId && c.active.toString() == "true").length > 0) {
                        planningUnitId = this.props.match.params.planningUnitId;
                        event.target.value = this.props.match.params.planningUnitId;
                    } else if (localStorage.getItem("sesDatasetPlanningUnitId") != "" && planningUnitList.filter(c => c.planningUnit.id == localStorage.getItem("sesDatasetPlanningUnitId") && c.active.toString() == "true").length > 0) {
                        planningUnitId = localStorage.getItem("sesDatasetPlanningUnitId");
                        event.target.value = localStorage.getItem("sesDatasetPlanningUnitId");
                    }
                    var regionId = "";
                    var regionEvent = {
                        target: {
                            value: ""
                        }
                    };
                    if (regionList.length == 1) {
                        regionId = regionList[0].regionId;
                        regionEvent.target.value = regionList[0].regionId;
                    } else if (this.props.match.params.regionId != "" && regionList.filter(c => c.regionId == this.props.match.params.regionId).length > 0) {
                        regionId = this.props.match.params.regionId;
                        regionEvent.target.value = this.props.match.params.regionId;
                    } else if (localStorage.getItem("sesDatasetRegionId") != "" && regionList.filter(c => c.regionId == localStorage.getItem("sesDatasetRegionId")).length > 0) {
                        regionId = localStorage.getItem("sesDatasetRegionId");
                        regionEvent.target.value = localStorage.getItem("sesDatasetRegionId");
                    }
                    this.getPlanningUnitsForTable(datasetJson, regionId);
                    this.setState({
                        datasetJson: datasetJson,
                        rangeValue: rangeValue,
                        singleValue2: rangeValue,
                        maxDateForSingleValue: maxDateForSingleValue,
                        regionList: regionList.sort(function (a, b) {
                            a = getLabelText(a.label, this.state.lang).toLowerCase();
                            b = getLabelText(b.label, this.state.lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }.bind(this)),
                        planningUnitList: datasetJson.planningUnitList.filter(c => c.active.toString() == "true").sort(function (a, b) {
                            a = getLabelText(a.planningUnit.label, this.state.lang).toLowerCase();
                            b = getLabelText(b.planningUnit.label, this.state.lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }.bind(this)),
                        forecastingUnitList: forecastingUnitList,
                        monthList: monthList,
                        monthList1: monthList1,
                        calendarMonthList: monthList1,
                        startDate: startDate,
                        stopDate: stopDate,
                        forecastStartDate: moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD"),
                        forecastStopDate: moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD"),
                        planningUnitId: planningUnitId,
                        loading: false,
                    }, () => {
                        if (planningUnitId != "") {
                            this.setPlanningUnitId(event.target.value);
                        } else {
                            this.setState({
                                planningUnitId: "",
                                showAllData: false
                            })
                        }
                        if (regionId != "") {
                            this.setRegionId(regionEvent);
                        } else {
                            this.setState({
                                regionId: "",
                                showAllData: false
                            })
                        }
                    })
                } else {
                    this.setState({
                        regionList: [],
                        regionId: "",
                        planningUnitList: [],
                        planningUnitId: "",
                        forecastingUnitList: [],
                        forecastingUnitId: "",
                        equivalencyUnitId: "",
                        equivalencyUnitList: [],
                        loading: false,
                        showAllData: false,
                        datasetId: ""
                    })
                }
            })
        }
    }
    /**
     * Sets the region ID and updates the component state with associated data.
     * @param {object} event - The event object containing the region ID value.
     */
    setRegionId(event) {
        var cont = false;
        if (this.state.dataChangedFlag == 1) {
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
                dataChangedFlag: 0,
                consumptionUnitShowArr: []
            });
            localStorage.setItem("sesDatasetRegionId", event.target.value);
            var regionName = this.state.regionList.filter(c => c.regionId == event.target.value);
            // }
            var regionId = event.target.value;
            this.setState({
                regionId: event.target.value,
                regionName: regionName.length > 0 ? getLabelText(regionName[0].label, this.state.lang) : "",
                changed: false
            }, () => {
                if (regionId > 0) {
                    this.showData()
                }
            })
        }
    }
    /**
     * Updates the selected tree scenario ID and triggers the rebuilding of Jexcel.
     * @param {number} id - The ID of the selected tree scenario.
     */
    scenarioOrderChanged(id) {
        this.setState({
            loading: true
        })
        this.setState({
            // selectedTreeScenarioId: id,
            loading: false
        }, () => {
            this.buildJexcel();
        })
    }
    /**
     * Displays a loading indicator while data is being loaded.
     */
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
    /**
     * Sets the view mode ID and updates the display of related elements.
     * @param {Object} e - The event object containing the selected value.
     */
    setViewById(e) {
        var viewById = e.target.value;
        this.setState({
            viewById: viewById,
        }, () => {
            // if (viewById == 1) {
            //     document.getElementById("planningUnitDiv").style.display = "block";
            // } else {
            //     document.getElementById("planningUnitDiv").style.display = "none";
            // }
            // if (viewById == 2) {
            //     document.getElementById("forecastingUnitDiv").style.display = "block";
            // } else {
            //     document.getElementById("forecastingUnitDiv").style.display = "none";
            // }
            // if (viewById == 3) {
            //     document.getElementById("equivalencyUnitDiv").style.display = "block";
            // } else {
            //     document.getElementById("equivalencyUnitDiv").style.display = "none";
            // }
            this.buildJexcel()
        })
    }
    /**
     * Submits the selected scenario and updates the dataset accordingly.
     */
    submitScenario() {
        this.setState({ dataChangedFlag: 0, loading: true })
        var selectedTreeScenarioId = this.state.selectedTreeScenarioId;
        var treeAndScenario = [];
        var consumptionExtrapolationId = "";
        if (selectedTreeScenarioId.length > 1) {
            for (var tas = 0; tas < selectedTreeScenarioId.length; tas++) {
                treeAndScenario.push({
                    "treeId": selectedTreeScenarioId[tas].toString().split("~")[0],
                    "scenarioId": selectedTreeScenarioId[tas].toString().split("~")[1]
                })
            }
        } else if (selectedTreeScenarioId.length == 1) {
            var scenarioId = this.state.selectedTreeScenarioId[0].toString().split("~")[1];
            if (scenarioId == undefined) {
                treeAndScenario = []
            } else {
                treeAndScenario.push({
                    "treeId": this.state.selectedTreeScenarioId[0].toString().split("~")[0],
                    "scenarioId": this.state.selectedTreeScenarioId[0].toString().split("~")[1]
                })
            }
            var consumptionExtrapolationId = "";
            if (!this.state.selectedTreeScenarioId[0].toString().includes("~")) {
                consumptionExtrapolationId = this.state.selectedTreeScenarioId[0]
            }
        }
        let total = 0;
        this.state.treeScenarioList.forEach((c, index) => {
            if (this.state.selectedTreeScenarioId.includes(c.id.toString())) {
                total += Number(this.state.totalArray[index]);
            } else {
                total += 0;
            }
        });
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var programTransaction = transaction.objectStore('datasetData');
            var programRequest = programTransaction.get(this.state.datasetId);
            programRequest.onerror = function (event) {
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var dataset = programRequest.result;
                var programDataJson = programRequest.result.programData;
                var datasetDataBytes = CryptoJS.AES.decrypt(programDataJson, SECRET_KEY);
                var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                var datasetJson = JSON.parse(datasetData);
                var datasetForEncryption = datasetJson;
                var planningUnitList = datasetJson.planningUnitList;
                var planningUnitList1 = planningUnitList;
                var index = planningUnitList.findIndex(c => c.planningUnit.id == this.state.planningUnitId && c.active.toString() == "true");
                var pu = planningUnitList1[index];
                pu.selectedForecastMap[this.state.regionId] = { treeAndScenario: treeAndScenario, "consumptionExtrapolationId": consumptionExtrapolationId, "totalForecast": total, notes: this.state.forecastNotes };
                planningUnitList1[index] = pu;
                datasetForEncryption.planningUnitList = planningUnitList1;
                var encryptedDatasetJson = (CryptoJS.AES.encrypt(JSON.stringify(datasetForEncryption), SECRET_KEY)).toString();
                dataset.programData = encryptedDatasetJson;
                var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
                var datasetOs = datasetTransaction.objectStore('datasetData');
                var putRequest = datasetOs.put(dataset);
                putRequest.onerror = function (event) {
                }.bind(this);
                putRequest.onsuccess = function (event) {
                    db1 = e.target.result;
                    var detailTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                    var datasetDetailsTransaction = detailTransaction.objectStore('datasetDetails');
                    var datasetDetailsRequest = datasetDetailsTransaction.get(this.state.datasetId);
                    datasetDetailsRequest.onsuccess = function (e) {
                        var datasetDetailsRequestJson = datasetDetailsRequest.result;
                        datasetDetailsRequestJson.changed = 1;
                        var datasetDetailsRequest1 = datasetDetailsTransaction.put(datasetDetailsRequestJson);
                        datasetDetailsRequest1.onsuccess = function (event) {
                        }
                    }
                    this.setState({
                        message: 'static.compareAndSelect.dataSaved',
                        changed: false,
                        color: 'green',
                        datasetJson: datasetForEncryption,
                        planningUnitList: planningUnitList1.filter(c => c.active.toString() == "true").sort(function (a, b) {
                            a = getLabelText(a.planningUnit.label, this.state.lang).toLowerCase();
                            b = getLabelText(b.planningUnit.label, this.state.lang).toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }.bind(this))
                    }, () => {
                        hideFirstComponent()
                        this.showData();
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
    /**
     * Updates the forecast notes in the component state.
     * @param {Object} e - The event object representing the input field change event.
     */
    setForecastNotes(e) {
        this.setState({
            forecastNotes: e.target.value,
            changed: true,
            dataChangedFlag: 1
        })
    }
    /**
     * Redirects to the application dashboard screen when cancel button is clicked.
     */
    cancelClicked() {
        var cont = false;
        if (this.state.dataChangedFlag == 1) {
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
                dataChangedFlag: 0,
                changed: false
            }, () => {
                let id = AuthenticationService.displayDashboardBasedOnRole();
                this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
            })
        }
    }
    /**
     * Toggles the visibility of guidance in the component state.
     */
    toggleShowGuidance() {
        this.setState({
            showGuidance: !this.state.showGuidance
        })
    }
    /**
     * This function is used to set the x axis display by value selected by the user
     * @param {*} e This is the event value
     */
    setXAxisDisplayBy(e) {
        this.setState({ loading: true })
        let displayBy = e.target.value;
        let val;
        if (displayBy == 1) {
            val = this.state.singleValue2;
        } else {
            val = {
                from: {
                    year: this.state.singleValue2.from.year,
                    month: 1,
                },
                to: {
                    year: this.state.singleValue2.to.year,
                    month: 12,
                }
            }
            // } else {
            //     val = {
            //         from: {
            //             year: this.state.singleValue2.from.year,
            //             month: (Number(displayBy) + 4) % 12 == 0 ? 12 : (Number(displayBy) + 4) % 12,
            //         },
            //         to: {
            //             year: this.state.singleValue2.to.year,
            //             month: (Number(displayBy) + 3) % 12 == 0 ? 12 : (Number(displayBy) + 3) % 12,
            //         }
            //     }
        }
        this.setState({
            xAxisDisplayBy: displayBy,
            singleValue2: val,
            loading: false
        }, () => {
            this.getData();
        })
    }

    /**
     * This function is called when the date range is changed
     * @param {*} value This is the value of the daterange selected by the user
     */
    handleYearRangeChange(value) {
        let val;
        if (this.state.xAxisDisplayBy == 2) {
            val = {
                from: {
                    year: value[0].year(),
                    month: 1,
                },
                to: {
                    year: value[1].year(),
                    month: 12,
                }
            }
        } else {
            val = {
                from: {
                    year: value[0].year(),
                    month: this.state.singleValue2.from.month,
                },
                to: {
                    year: value[1].year(),
                    month: this.state.singleValue2.to.month,
                }
            }
        }
        this.setState({ singleValue2: val }, () => {
            this.getData();
        })
    }
    /**
     * Renders the compare and select screen.
     * @returns {JSX.Element} - Compare and select screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        const { isDarkMode } = this.state;
        const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
        const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';
        var chartOptions = {
            title: {
                display: true,
                text: ((this.state.viewById == 1 || this.state.viewById == 3) && this.state.planningUnitId > 0 ? getLabelText(this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].planningUnit.label, this.state.lang) : this.state.viewById == 2 && this.state.forecastingUnitId > 0 && this.state.planningUnitId > 0 ? getLabelText(this.state.forecastingUnitList.filter(c => c.id == this.state.forecastingUnitId)[0].label, this.state.lang) : "") + " ( " + this.state.regionName + " )",
                fontColor: fontColor
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: this.state.viewById == 1 && this.state.planningUnitId > 0 ? getLabelText(this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].planningUnit.unit.label, this.state.lang) : this.state.viewById == 2 && this.state.forecastingUnitId > 0 && this.state.planningUnitId > 0 ? getLabelText(this.state.forecastingUnitList.filter(c => c.id == this.state.forecastingUnitId)[0].unit.label, this.state.lang) : this.state.equivalencyUnitId > 0 && this.state.planningUnitId > 0 ? getLabelText(this.state.equivalencyUnitList.filter(c => c.equivalencyUnitMappingId == this.state.equivalencyUnitId)[0].equivalencyUnit.label, this.state.lang) : "",
                            fontColor: fontColor
                        },
                        stacked: false,
                        ticks: {
                            beginAtZero: true,
                            fontColor: fontColor,
                            callback: function (value) {
                                return value.toLocaleString();
                            }
                        },
                        gridLines: {
                            drawBorder: true,
                            lineWidth: 0,
                            color: gridLineColor,
                            zeroLineColor: gridLineColor
                        },
                        position: 'left',
                    }
                ],
                xAxes: [
                    {
                        id: 'xAxis1',
                        gridLines: {
                            lineWidth: 0,
                            color: gridLineColor,
                            zeroLineColor: gridLineColor
                        },
                        ticks: {
                            fontColor: fontColor,
                            autoSkip: false,
                            callback: function (label) {
                                var xAxis1 = label
                                xAxis1 += '';
                                var month = xAxis1.split('-')[0];
                                return month;
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: this.state.xAxisDisplayBy == 2 ? i18n.t('static.modelingValidation.calendarYear') : this.state.xAxisDisplayBy == 1 ? "" : i18n.t('static.modelingValidation.fiscalYear'),
                            fontColor: 'black'
                        }
                    },
                    {
                        id: 'xAxis2',
                        gridLines: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            fontColor: fontColor,
                            callback: function (label) {
                                var monthArrayList = [...new Set(this.state.monthList1.map(ele => moment(ele).format("MMM-YYYY")))];
                                var xAxis2 = label
                                xAxis2 += '';
                                var month = xAxis2.split('-')[0];
                                var year = xAxis2.split('-')[1];
                                var filterByYear = monthArrayList.filter(c => moment(c).format("YYYY") == moment(year).format("YYYY"));
                                var divideByTwo = Math.floor(filterByYear.length / 2);
                                if (moment(filterByYear[divideByTwo]).format("MMM") === month) {
                                    return year;
                                } else {
                                    return "";
                                }
                            }.bind(this),
                            maxRotation: 0,
                            minRotation: 0,
                            autoSkip: false
                        }
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
                },
                intersect: false,
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: fontColor
                }
            }
        }
        let bar = {}
        let i = 0;
        if (this.state.showAllData) {
            var monthArrayList = [...new Set(this.state.monthList1.map(ele => moment(ele).format("MMM-YYYY")))];
            var datasetsArr = [];
            var consolidatedActualData = this.state.actualConsumptionListForMonth;
            if (this.state.xAxisDisplayBy != 1) {
                var a = consolidatedActualData.reduce((acc, current) => {
                    const { year, value } = current;
                    if (!acc[year]) {
                        acc[year] = { year, value: 0 };
                    }
                    acc[year].value += Number(value);
                    return acc;
                }, {});
                // Convert the result to an array
                consolidatedActualData = Object.values(a);
            }
            datasetsArr.push(
                {
                    label: i18n.t('static.compareAndSelect.actuals'),
                    type: 'line',
                    stack: 1,
                    backgroundColor: 'transparent',
                    borderColor: '#808080',
                    ticks: {
                        fontSize: 2,
                        fontColor: 'transparent',
                    },
                    lineTension: 0.1,
                    pointStyle: 'line',
                    pointRadius: 3,
                    showInLegend: true,
                    data: consolidatedActualData.map(ele => ele != null ? (ele.value) : "")
                }
            )
            this.state.treeScenarioList.filter(c => c.checked).map((item, idx) => {
                i = idx;
                var collapsedExpandArray = [];
                if (this.state.xAxisDisplayBy != 1) {
                    var collapsedExpandArray = this.state.collapsedExpandArr.filter(ar => ar.id == item.id);
                    if (collapsedExpandArray.length > 0) {
                        collapsedExpandArray = collapsedExpandArray.map(i => ({ year: i.year, actual: i.actual }));
                        var consolidatedData = collapsedExpandArray.reduce((acc, current) => {
                            const { year, actual } = current;
                            if (!acc[year]) {
                                acc[year] = { year, totalActual: 0 };
                            }
                            acc[year].totalActual += actual;
                            return acc;
                        }, {});

                        // Convert the result to an array
                        collapsedExpandArray = Object.values(consolidatedData);
                    }
                }
                datasetsArr.push(
                    {
                        label: item.type == "T" ? getLabelText(item.tree.label, this.state.lang) + " - " + getLabelText(item.scenario.label, this.state.lang) : getLabelText(item.scenario.extrapolationMethod.label, this.state.lang),
                        type: 'line',
                        stack: idx + 2,
                        backgroundColor: 'transparent',
                        borderColor: item.color,
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0.1,
                        borderWidth: (this.state.selectedTreeScenarioId.includes(item.id.toString()) && this.state.selectedTreeScenarioId.length == 1) ? 5 : 3,
                        pointStyle: 'line',
                        pointRadius: 3,
                        showInLegend: true,
                        data: this.state.xAxisDisplayBy == 1 ?
                            this.state.consumptionDataForTree.filter(c => c.id == item.id).map((ele, index) => (this.state.showFits ? ele.value : (moment(ele.month).format("YYYY-MM") >= moment(this.state.forecastStartDate).format("YYYY-MM") ? ele.value : null))) :
                            collapsedExpandArray.map((ele, index) => (moment(ele.year).format("YYYY") >= moment(this.state.forecastStartDate).format("YYYY") ? Number(ele.totalActual).toFixed(2) : null))
                    }
                )
            })
            if (this.state.selectedTreeScenarioId.length > 1) {
                var collapsedExpandArray = this.state.collapsedExpandArr.filter(ar => ar.id == -1);
                if (collapsedExpandArray.length > 0) {
                    collapsedExpandArray = collapsedExpandArray.map(i => ({ year: i.year, actual: i.actual }));
                    var consolidatedData = collapsedExpandArray.reduce((acc, current) => {
                        const { year, actual } = current;
                        if (!acc[year]) {
                            acc[year] = { year, totalActual: 0 };
                        }
                        acc[year].totalActual += Number(actual);
                        return acc;
                    }, {});

                    // Convert the result to an array
                    collapsedExpandArray = Object.values(consolidatedData);
                }
                datasetsArr.push(
                    {
                        label: i18n.t("static.compareAndSelect.totalAggregated"),
                        type: 'line',
                        stack: i + 2,
                        backgroundColor: 'transparent',
                        borderColor: "#BA0C2F",
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0.1,
                        borderWidth: 5,
                        pointStyle: 'line',
                        pointRadius: 3,
                        showInLegend: true,
                        data: this.state.xAxisDisplayBy == 1 ?
                            this.state.consumptionDataForTree.filter(c => c.id == -1).map((ele, index) => (this.state.showFits ? ele.value : (moment(ele.month).format("YYYY-MM") >= moment(this.state.forecastStartDate).format("YYYY-MM") ? ele.value : null))) :
                            collapsedExpandArray.map((ele, index) => (moment(ele.year).format("YYYY") >= moment(this.state.forecastStartDate).format("YYYY") ? Number(ele.totalActual).toFixed(2) : null))
                    }
                )
            }
            // bar = {
            //     labels: monthArrayList,
            //     datasets: datasetsArr
            // };
            if (this.state.xAxisDisplayBy == 1) {
                bar = {
                    labels: monthArrayList,
                    datasets: datasetsArr
                };
            } else {
                if (this.state.xAxisDisplayBy > 2 && this.state.xAxisDisplayBy < 9) {
                    let arr = [...new Set(this.state.monthList1.map(ele => moment(ele).add(12, 'months').format("YYYY")))];
                    arr.pop();
                    bar = {
                        labels: arr,
                        datasets: datasetsArr
                    };
                } else if (this.state.xAxisDisplayBy > 8) {
                    let arr = [...new Set(this.state.monthList1.map(ele => moment(ele).format("YYYY")))];
                    arr.pop();
                    bar = {
                        labels: arr,
                        datasets: datasetsArr
                    };
                } else {
                    bar = {
                        labels: [...new Set(this.state.monthList1.map(ele => moment(ele).format("YYYY")))],
                        datasets: datasetsArr
                    };
                }
            }
        }
        const { forecastingUnitList } = this.state;
        let forecastingUnits = forecastingUnitList.length > 0
            && forecastingUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang) + " | " + item.id}
                    </option>
                )
            }, this);
        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.name}
                    </option>
                )
            }, this);
        const { planningUnitList } = this.state;
        let planningUnits = planningUnitList.length > 0
            && planningUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnit.id}>
                        {getLabelText(item.planningUnit.label, this.state.lang) + " | " + item.planningUnit.id}
                    </option>
                )
            }, this);
        const { regionList } = this.state;
        let regions = regionList.length > 0
            && regionList.map((item, i) => {
                return (
                    <option key={i} value={item.regionId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { equivalencyUnitList } = this.state;
        let equivalencies = equivalencyUnitList.length > 0
            && equivalencyUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.equivalencyUnitMappingId}>
                        {getLabelText(item.equivalencyUnit.label, this.state.lang)}
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
                <h5 id="div1" className={this.state.color}>{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon pb-0">
                        <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                        <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                        <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href={this.state.datasetId != -1 && this.state.datasetId != "" && this.state.datasetId != undefined ? "/#/dataSet/buildTree/tree/0/" + this.state.datasetId : "/#/dataSet/buildTree"} className="supplyplanformulas">{i18n.t('static.common.managetree')}</a> {i18n.t('static.tree.or')} <a href="/#/extrapolation/extrapolateData" className='supplyplanformulas'>{i18n.t('static.dashboard.consExtrapolation')}</a></span>
                        <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href={this.state.datasetId != -1 && this.state.datasetId != "" && this.state.datasetId != undefined ? "/#/forecastReport/forecastOutput/" + this.state.datasetId.toString().split("_")[0] + "/" + (this.state.datasetId.toString().split("_")[1]).toString().substring(1) : "/#/forecastReport/forecastOutput/"} className="supplyplanformulas">{i18n.t('static.dashboard.monthlyForecast')}</a></span><br />
                        {
                            this.state.showAllData &&
                            <div className="col-md-12 card-header-actions">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer', float: 'right', marginTop: '4px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                                <a className="card-header-action" style={{ float: 'right' }}>
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t("static.report.exportPdf")} onClick={() => {
                                        var curTheme = localStorage.getItem("theme");
                                        if (curTheme == "dark") {
                                            this.setState({
                                                isDarkMode: false
                                            }, () => {
                                                setTimeout(() => {
                                                    this.exportPDF();
                                                    if (curTheme == "dark") {
                                                        this.setState({
                                                            isDarkMode: true
                                                        })
                                                    }
                                                }, 0)
                                            })
                                        } else {
                                            this.exportPDF();
                                        }
                                    }}
                                    />
                                </a>
                            </div>
                        }
                    </div>
                    <div className="card-header-action pr-lg-4">
                        <a style={{ float: 'right' }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => { this.toggleShowGuidance() }}><small className="supplyplanformulas">{i18n.t('static.common.showGuidance')}</small></span>
                        </a>
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
                                                            name="datasetId"
                                                            id="datasetId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.setDatasetId(e); }}
                                                            value={this.state.datasetId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {datasets}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-4">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.region')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="regionId"
                                                            id="regionId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.setRegionId(e); }}
                                                            value={this.state.regionId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {regions}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>
                                <div class="pl-0">
                                    {this.state.datasetId != "" && this.state.regionId != "" &&
                                        <div onClick={this.expandCompressPUFuntion} style={{ display: this.state.loading ? "none" : "block", height: "45px" }}>
                                            {this.state.expandCompressPUBtn ? <div><i className="fa fa-minus-square-o supplyPlanIcon" ></i> <span className="WhiteText">{i18n.t("static.compareAndSelect.selectForecast")}<br /> ✅ {i18n.t("static.compareAndSelect.forecastSelected")} <i class="fa fa-exclamation-triangle"></i> {i18n.t("static.compareAndSelect.forecastNotSelected")}</span></div> : <div><i className="fa fa-plus-square-o supplyPlanIcon" ></i>  <span style={{ color: "#20a8d8" }}><b>{i18n.t("static.compareAndSelect.showPUPanel")}</b></span></div>}
                                        </div>
                                    }
                                    <div className="row">
                                        {this.state.datasetId != "" && this.state.regionId != "" && this.state.showHidePU &&
                                            <div className="col-md-3" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <div class="table-scroll">
                                                    <div class="table-wrap DataEntryTable table-responsive">
                                                        <Table className="table-bordered text-center overflowhide main-table " bordered size="sm">
                                                            <thead>
                                                                <tr>
                                                                    <th class="compareAndSelectPlanningUnitTableTdWidth sticky-col first-col clone ">{i18n.t('static.report.planningUnit')}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {this.state.planningUnitListForTable.map((ele, index) => {
                                                                    return (<>
                                                                        <tr>
                                                                            <td className={"planingUnitId-" + ele.planningUnit.id + " planingUnitClass sticky-col first-col clone text-left hoverTd"} onClick={() => this.setPlanningUnitId(ele.planningUnit.id)}>
                                                                                {ele.selectedForecast != "" ? <span>✅</span> : <i class="fa fa-exclamation-triangle"></i>}{" " + getLabelText(ele.planningUnit.label, this.state.lang) + " | " + ele.planningUnit.id}
                                                                            </td>
                                                                        </tr>
                                                                    </>)
                                                                })}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        <div className={this.state.showHidePU ? "col-md-9" : "col-md-12"} style={{ display: this.state.loading ? "none" : "block" }}>
                                            {this.state.showAllData &&
                                                <>
                                                    <ul style={{ marginLeft: '-2.5rem' }}><span className='DarkThColr' style={{ color: this.state.treeScenarioList.filter(c => this.state.selectedTreeScenarioId.includes(c.id.toString())).length > 0 ? "#000" : "#BA0C2F" }}>{i18n.t('static.compareAndSelect.selectOneOrMore') + " "}<b>{getLabelText(this.state.planningUnitLabel, this.state.lang)}</b>{" "}{i18n.t('static.compareAndSelect.andRegion')}{" "}<b>{this.state.regionName}</b></span><br /></ul>
                                                    <ul className="legendcommitversion">
                                                        <li><span className="readonlylegend legendcolor"></span><span className="legendcommitversionText">{i18n.t('static.compareAndSelect.missingData')} </span></li>
                                                        <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.extrapolation.lowestError')} </span></li>
                                                        <li><span className="bluelegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.compareVersion.selectedForecast')} </span></li>
                                                    </ul><br />
                                                    <ul style={{ marginLeft: '-2.5rem', marginTop: '-7px' }}><span className='DarkThColr'><b>{i18n.t("static.versionSettings.note") + ": "}</b>{i18n.t('static.compareAndSelect.topNote')}</span><br /></ul>
                                                    <div className="RemoveStriped removeOddColor">
                                                        <div id="table1" className="compareAndSelect TableWidth100 compareAndSelectCollapsecol"></div>
                                                    </div>
                                                    {/* <span><b>Total Forecast Qty</b> : 1234</span> */}
                                                    <br></br>
                                                    <FormGroup className="col-md-12">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.program.notes')}</Label>
                                                        <div className="controls">
                                                            <InputGroup>
                                                                <Input
                                                                    type="textarea"
                                                                    name="forecastNotes"
                                                                    id="forecastNotes"
                                                                    value={this.state.forecastNotes}
                                                                    onChange={(e) => { this.setForecastNotes(e); }}
                                                                    readOnly={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_COMPARE_AND_SELECT') ? false : true}
                                                                    bsSize="sm"
                                                                >
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <br></br>
                                                    <Col md="12 pl-0">
                                                        <div className="row">
                                                            <FormGroup>
                                                                <Label className="P-absltRadio">{i18n.t('static.compareAndSelect.yAxisIn')}&nbsp;&nbsp;</Label>
                                                                <FormGroup check inline>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        id="viewById1"
                                                                        name="viewById"
                                                                        value={1}
                                                                        checked={this.state.viewById == 1}
                                                                        onChange={this.setViewById}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-active1">
                                                                        {i18n.t('static.report.planningUnit')}
                                                                    </Label>
                                                                </FormGroup><br />
                                                                <FormGroup check inline>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        id="viewById2"
                                                                        name="viewById"
                                                                        value={2}
                                                                        checked={this.state.viewById == 2}
                                                                        onChange={this.setViewById}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-active1">
                                                                        {i18n.t('static.dashboard.forecastingunit')}
                                                                    </Label>
                                                                </FormGroup><br />
                                                                <FormGroup check inline style={{ display: this.state.equivalencyUnitList.length > 0 ? 'block' : 'none' }}>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        id="viewById3"
                                                                        name="viewById"
                                                                        value={3}
                                                                        checked={this.state.viewById == 3}
                                                                        onChange={this.setViewById}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-active1">
                                                                        {i18n.t('static.equivalancyUnit.equivalancyUnit')}
                                                                    </Label>
                                                                </FormGroup>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-4" id="planningUnitDiv" style={{ display: "none" }}>
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                                                                <div className="controls">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="planningUnitId"
                                                                            id="planningUnitId"
                                                                            bsSize="sm"
                                                                            disabled={true}
                                                                            value={this.state.planningUnitId}
                                                                            className="selectWrapText removeDropdownArrow"
                                                                        >
                                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                                            {planningUnits}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-4" id="forecastingUnitDiv" style={{ display: "none" }}>
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.product.unit1')}</Label>
                                                                <div className="controls">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="foreccastingUnitId"
                                                                            id="forecastingUnitId"
                                                                            value={this.state.forecastingUnitId}
                                                                            disabled={true}
                                                                            onChange={this.setForecastingUnit}
                                                                            bsSize="sm"
                                                                            className="selectWrapText removeDropdownArrow"
                                                                        >
                                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                                            {forecastingUnits}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>
                                                            <FormGroup className="col-md-4" id="equivalencyUnitDiv" style={{ display: "none" }}>
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.equivalancyUnit.equivalancyUnit')}</Label>
                                                                <div className="controls">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            className="selectWrapText removeDropdownArrow"
                                                                            name="equivalencyUnitId"
                                                                            id="equivalencyUnitId"
                                                                            value={this.state.equivalencyUnitId}
                                                                            onChange={this.setEquivalencyUnit}
                                                                            bsSize="sm"
                                                                        >
                                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                                            {equivalencies}
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>

                                                            <FormGroup className="col-md-4">
                                                                <div className="col-md-12">
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id="showForecastPeriod"
                                                                        name="showForecastPeriod"
                                                                        checked={this.state.showForecastPeriod}
                                                                        onClick={(e) => { this.setShowForecastPeriodOrFits(e); }}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                        {i18n.t('static.compareAndSelect.showOnlyForecastPeriod')}
                                                                    </Label>
                                                                </div>
                                                                <div className="col-md-12">
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id="showFits"
                                                                        name="showFits"
                                                                        checked={this.state.showFits}
                                                                        onClick={(e) => { this.setShowForecastPeriodOrFits(e); }}
                                                                    />
                                                                    <Label
                                                                        className="form-check-label"
                                                                        check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                                        {i18n.t('static.extrapolations.showFits')}
                                                                    </Label>
                                                                </div>
                                                            </FormGroup>
                                                            {/* {this.state.xAxisDisplayBy == 1 && !this.state.showForecastPeriod &&
                                                                <FormGroup className="col-md-3 compareAndSelectDatePicker">
                                                                    <Label htmlFor="appendedInputButton">{i18n.t('static.compareAndSelect.startMonthForGraph')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                                    <div className="controls edit">
                                                                        <Picker
                                                                            ref={this.pickAMonth3}
                                                                            years={{ min: this.state.minDate, max: this.state.maxDateForSingleValue }}
                                                                            value={this.state.singleValue2}
                                                                            key={JSON.stringify(this.state.singleValue2)}
                                                                            lang={pickerLang}
                                                                            onDismiss={this.handleAMonthDissmis2}
                                                                        >
                                                                            <MonthBox value={makeText(this.state.singleValue2.from) + ' ~ ' + makeText(this.state.singleValue2.to)} onClick={this.handleClickMonthBox3} />
                                                                        </Picker>
                                                                    </div>
                                                                </FormGroup>
                                                            } */}
                                                            <FormGroup className="col-md-5">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.modelingValidation.displayBy')} : <i>({i18n.t('static.common.forecastPeriod')} = {makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)})</i></Label>
                                                                <div className="controls ">
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="xAxisDisplayBy"
                                                                            id="xAxisDisplayBy"
                                                                            bsSize="sm"
                                                                            value={this.state.xAxisDisplayBy}
                                                                            disabled={this.state.showForecastPeriod}
                                                                            onChange={(e) => { this.setXAxisDisplayBy(e); }}
                                                                        >
                                                                            <option value="1">{i18n.t('static.ManageTree.Month')}</option>
                                                                            <option value="2">{i18n.t('static.modelingValidation.calendarYear')}</option>
                                                                            <option value="3">{i18n.t('static.modelingValidation.fyJul')}</option>
                                                                            <option value="4">{i18n.t('static.modelingValidation.fyAug')}</option>
                                                                            <option value="5">{i18n.t('static.modelingValidation.fySep')}</option>
                                                                            <option value="6">{i18n.t('static.modelingValidation.fyOct')}</option>
                                                                            <option value="7">{i18n.t('static.modelingValidation.fyNov')}</option>
                                                                            <option value="8">{i18n.t('static.modelingValidation.fyDec')}</option>
                                                                            <option value="9">{i18n.t('static.modelingValidation.fyJan')}</option>
                                                                            <option value="10">{i18n.t('static.modelingValidation.fyFeb')}</option>
                                                                            <option value="11">{i18n.t('static.modelingValidation.fyMar')}</option>
                                                                            <option value="12">{i18n.t('static.modelingValidation.fyApr')}</option>
                                                                            <option value="13">{i18n.t('static.modelingValidation.fyMay')}</option>
                                                                            <option value="14">{i18n.t('static.modelingValidation.fyJun')}</option>
                                                                        </Input>
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>
                                                            {!this.state.showForecastPeriod && <FormGroup className="col-md-3 pickerRangeBox">
                                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}
                                                                    <span className="stock-box-icon ModelingIcon fa fa-angle-down ml-1"></span>
                                                                </Label>
                                                                {(this.state.xAxisDisplayBy == 1 || this.state.xAxisDisplayBy == "") && (
                                                                    <div className="controls edit">
                                                                        <Picker
                                                                            ref="pickRange"
                                                                            years={{ min: this.state.minDate, max: this.state.maxDateForSingleValue }}
                                                                            value={this.state.singleValue2}
                                                                            lang={pickerLang}
                                                                            key={JSON.stringify(this.state.singleValue2)}
                                                                            onDismiss={this.handleAMonthDissmis2}
                                                                        >
                                                                            <MonthBox value={makeText(this.state.singleValue2.from) + ' ~ ' + makeText(this.state.singleValue2.to)} onClick={this.handleClickMonthBox2} />
                                                                        </Picker>
                                                                    </div>
                                                                )}
                                                                {(this.state.xAxisDisplayBy == 2) && (
                                                                    <div className="controls box">
                                                                        <RangePicker
                                                                            picker="year"
                                                                            allowClear={false}
                                                                            disabledDate={(current) => current && (current.year() < this.state.minDate.year || current.year() > this.state.maxDateForSingleValue.year)}
                                                                            id="date"
                                                                            name="date"
                                                                            onChange={this.handleYearRangeChange}
                                                                            value={[
                                                                                moment(this.state.singleValue2.from.year.toString()),
                                                                                moment(this.state.singleValue2.to.year.toString()),
                                                                            ]}
                                                                        />
                                                                    </div>
                                                                )}
                                                                {(this.state.xAxisDisplayBy != 1 && this.state.xAxisDisplayBy != 2) && (
                                                                    <div className="controls box">
                                                                        <RangePicker
                                                                            picker="year"
                                                                            allowClear={false}
                                                                            disabledDate={(current) => current && (current.year() < this.state.minDate.year || current.year() > this.state.maxDateForSingleValue.year)}
                                                                            id="date"
                                                                            name="date"
                                                                            onChange={this.handleYearRangeChange}
                                                                            value={[
                                                                                moment(this.state.singleValue2.from.year.toString()),
                                                                                moment(this.state.singleValue2.to.year.toString()),
                                                                            ]}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </FormGroup>}
                                                        </div>

                                                        <div className={"row check inline pt-lg-3 pl-lg-3"}>

                                                            {((this.state.viewById == 3 && this.state.equivalencyUnitId > 0) || (this.state.viewById == 1 || this.state.viewById == 2)) && <div className="col-md-12 p-0">
                                                                <div className="col-md-12">
                                                                    <div className="chart-wrapper chart-graph-report">
                                                                        <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                                                        <div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <b className='text-blackD'>{i18n.t('static.compareAndSelect.note')}</b>
                                                                <div className="col-md-12">
                                                                    <button className="mr-1 mb-2 mt-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                                                        {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                                                    </button>
                                                                </div>
                                                            </div>}
                                                        </div>
                                                        <div style={{ display: this.state.show ? "block" : "none" }}>
                                                            <div className="row">
                                                                <div className="pl-0 pr-0 ModelingValidationTable ModelingTableMargin TableWidth100">
                                                                    <div id="calendarTable" className="jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: this.state.xAxisDisplayBy != 1 && !this.state.loading ? "block" : "none" }}>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-12 pl-0 pr-0">
                                                                    <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable PeginationBottom DarkColorOK" style={{ display: this.state.show && !this.state.loading ? "block" : "none" }}>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </>
                                            }
                                        </div>
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
                            </div>
                        </div>
                    </CardBody >
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_COMPARE_AND_SELECT') && this.state.showAllData && this.state.changed && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.submitScenario}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card >
                <Modal isOpen={this.state.showGuidance}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleShowGuidance()} className="ModalHead modal-info-Headher">
                        <strong className="TextWhite">{i18n.t('static.common.showGuidance')}</strong>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <div dangerouslySetInnerHTML={{
                                __html: localStorage.getItem('lang') == 'en' ?
                                    compareAndSelectScenarioEn :
                                    localStorage.getItem('lang') == 'fr' ?
                                        compareAndSelectScenarioFr :
                                        localStorage.getItem('lang') == 'sp' ?
                                            compareAndSelectScenarioSp :
                                            compareAndSelectScenarioPr
                            }} />
                        </ModalBody>
                    </div>
                </Modal>
            </div >
        );
    }
}
export default CompareAndSelectScenario;