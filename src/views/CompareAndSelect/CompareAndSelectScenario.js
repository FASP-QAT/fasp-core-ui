import React, { Component, lazy } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Card,
    CardBody,
    Col,
    Table, FormGroup, Input, InputGroup, Label, Form, Button, CardFooter
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_MONTH_PICKER_FORMAT, TITLE_FONT, DATE_FORMAT_CAP } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions';
import NumberFormat from 'react-number-format';
import jsPDF from "jspdf";
import { LOGO } from '../../CommonComponent/Logo';

const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
const entityname = i18n.t('static.dashboard.compareAndSelect')

class CompareAndSelectScenario extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
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
            selectedTreeScenarioId: 0,
            actualConsumptionList: [],
            showAllData: false,
            consumptionDataForTree: [],
            totalArray: [],
            actualDiff: [],
            countArray: [],
            regionName: "",
            singleValue2: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            maxDateForSingleValue: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            showForecastPeriod: false,
            treeScenarioList: []
        };
        this.getDatasets = this.getDatasets.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.setViewById = this.setViewById.bind(this);
        // this.getProductCategories = this.getProductCategories.bind(this);
        //this.pickRange = React.createRef()
        this.setDatasetId = this.setDatasetId.bind(this);
        this.setRegionId = this.setRegionId.bind(this);
        this.setForecastingUnit = this.setForecastingUnit.bind(this);
        this.setPlanningUnitId = this.setPlanningUnitId.bind(this);
        this.setEquivalencyUnit = this.setEquivalencyUnit.bind(this);
        this.submitScenario = this.submitScenario.bind(this);
        this.loaded = this.loaded.bind(this)
        this.onchangepage = this.onchangepage.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);

    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    handleClickMonthBox2 = (e) => {
        this.refs.pickAMonth2.show()
    }
    handleAMonthChange2 = (value, text) => {
        //
        //
    }
    handleAMonthDissmis2 = (value) => {
        console.log("Value@@@", value)
        this.setState({ singleValue2: value, }, () => {
            this.setMonth1List()
        })

    }

    setShowForecastPeriod(e) {
        this.setState({
            showForecastPeriod: e.target.checked
        }, () => {
            this.setMonth1List()
        })
    }

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
        for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
            curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
            monthList.push(curDate);
        }
        // monthList.pop();
        this.setState({
            monthList1: monthList,
            loading: false
        }, () => {
            this.buildJexcel();
        })
    }

    showData() {

        if (this.state.planningUnitId != "" && this.state.regionId != "") {
            this.setState({ loading: true })
            var datasetJson = this.state.datasetJson;
            var multiplier = 1;
            var selectedPlanningUnit = this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId);
            // if (this.state.viewById == 2) {
            //     multiplier = selectedPlanningUnit.length > 0 ? selectedPlanningUnit[0].planningUnit.multiplier : 1;
            // }
            // if (this.state.viewById == 3) {
            //     var selectedEquivalencyUnit = this.state.equivalencyUnitList.filter(c => c.equivalencyUnitMappingId == this.state.equivalencyUnitId);
            //     multiplier = selectedEquivalencyUnit.length > 0 ? selectedEquivalencyUnit[0].convertToEu : 1;
            // }
            // let startDate = moment.min(datasetJson.actualConsumptionList.filter(c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId).map(d => moment(d.month)));
            // let curDate = moment(startDate).format("YYYY-MM-DD");
            // let stopDate = this.state.stopDate;
            // let monthList1 = []
            // for (var i = 0; curDate < stopDate; i++) {
            // curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
            // monthList1.push(curDate);
            // }
            // monthList1.pop();
            // if (this.state.showForecastPeriod) {
            //     monthList1 = this.state.monthList1
            // }
            // var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 } }

            var treeScenarioList = [];
            var treeList = datasetJson.treeList;
            var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
            var colourArrayCount = 0;
            // var compareToConsumptionForecast = ["","","","22.7% above the highest consumption forecast.","7.9% below the lowest consumption forecast.","In between the highest and lowest consumption forecast."];
            var count = 0;
            var consumptionExtrapolation = datasetJson.consumptionExtrapolation.filter(c => c.planningUnit.id == this.state.planningUnitId);
            for (var ce = 0; ce < consumptionExtrapolation.length; ce++) {
                if (colourArrayCount > 10) {
                    colourArrayCount = 0;
                }
                treeScenarioList.push({ id: consumptionExtrapolation[ce].consumptionExtrapolationId, tree: consumptionExtrapolation[ce], scenario: consumptionExtrapolation[ce], checked: true, color: colourArray[colourArrayCount], type: "C", data: consumptionExtrapolation[ce].extrapolationDataList, readonly: false });
                colourArrayCount += 1;
            }
            for (var tl = 0; tl < treeList.length; tl++) {
                var tree = treeList[tl];


                var scenarioList = treeList[tl].scenarioList;
                for (var sl = 0; sl < scenarioList.length; sl++) {
                    var flatList = tree.tree.flatList.filter(c => c.payload.nodeDataMap[scenarioList[sl].id][0].puNode != null && c.payload.nodeDataMap[scenarioList[sl].id][0].puNode.planningUnit.id == this.state.planningUnitId);
                    if (colourArrayCount > 10) {
                        colourArrayCount = 0;
                    }
                    var readonly = flatList.length > 0 ? false : true
                    var dataForPlanningUnit = treeList[tl].tree.flatList.filter(c => (c.payload.nodeDataMap[scenarioList[sl].id])[0].puNode != null && (c.payload.nodeDataMap[scenarioList[sl].id])[0].puNode.planningUnit.id == this.state.planningUnitId);
                    console.log("dataForPlanningUnit####", dataForPlanningUnit);
                    var data = [];
                    if (dataForPlanningUnit.length > 0) {
                        if ((dataForPlanningUnit[0].payload.nodeDataMap[scenarioList[sl].id])[0].nodeDataMomList != undefined) {
                            data = (dataForPlanningUnit[0].payload.nodeDataMap[scenarioList[sl].id])[0].nodeDataMomList;
                        }
                    }
                    treeScenarioList.push({ id: treeList[tl].treeId + "~" + scenarioList[sl].id, tree: treeList[tl], scenario: scenarioList[sl], checked: readonly ? false : true, color: colourArray[colourArrayCount], type: "T", data: data, readonly: readonly });
                    colourArrayCount += 1;
                    count += 1;
                }
            }
            if (selectedPlanningUnit.length > 0 && selectedPlanningUnit[0].selectedForecastMap != undefined) {
            }
            var selectedTreeScenarioId = selectedPlanningUnit.length > 0 && selectedPlanningUnit[0].selectedForecastMap != undefined ? selectedPlanningUnit[0].selectedForecastMap[this.state.regionId] != undefined && selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].scenarioId != null && selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].scenarioId != "" ? treeScenarioList.filter(c => c.scenario.id == selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].scenarioId && c.tree.treeId == selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].treeId).length > 0 ? treeScenarioList.filter(c => c.scenario.id == selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].scenarioId && c.tree.treeId == selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].treeId)[0].id : 0 : selectedPlanningUnit[0].selectedForecastMap[this.state.regionId] != undefined ? selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].consumptionExtrapolationId : 0 : 0;
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
                // singleValue2: rangeValue,
                // monthList1: monthList1,
                showAllData: true,
                loading: false
            }, () => {
                this.scenarioOrderChanged(selectedTreeScenarioId)
                // this.buildJexcel()
            })
        } else {
            this.setState({
                loading: false,
                showAllData: false
            })
        }
    }

    buildJexcel() {
        this.setState({
            loading: true
        })
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var columns = [];
        columns.push({ title: i18n.t('static.inventoryDate.inventoryReport'), width: 100, type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' } });
        columns.push({ title: i18n.t('static.compareAndSelect.actuals'), width: 100, type: 'numeric', mask: '#,##.00' });
        var treeScenarioList = this.state.treeScenarioList;
        for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
            if (treeScenarioList[tsl].type == "T") {
                columns.push({ title: getLabelText(treeScenarioList[tsl].tree.label, this.state.lang) + " - " + getLabelText(treeScenarioList[tsl].scenario.label, this.state.lang), width: 100, type: treeScenarioList[tsl].checked ? 'numeric' : 'hidden', mask: '#,##.00', decimal: "." });
            } else {
                columns.push({ title: getLabelText(treeScenarioList[tsl].scenario.extrapolationMethod.label, this.state.lang), width: 100, type: treeScenarioList[tsl].checked ? 'numeric' : 'hidden', mask: '#,##.00', decimal: "." });
            }
        }
        var data = [];
        var dataArr = [];
        var consumptionData = this.state.actualConsumptionList;
        var monthArrayListWithoutFormat = this.state.monthList;
        var actualConsumptionListForMonth = [];
        var consumptionDataForTree = [];
        var totalArray = [];
        var forecastError = [];
        let actualMax = moment.max(consumptionData.map(d => moment(d.month)));
        var monthArrayForError = [];
        if (consumptionData.length > 0) {
            monthArrayForError.push(moment(actualMax).format("YYYY-MM-DD"));
            monthArrayForError.push(moment(actualMax).add(-1, 'months').format("YYYY-MM-DD"));
            monthArrayForError.push(moment(actualMax).add(-2, 'months').format("YYYY-MM-DD"));
            monthArrayForError.push(moment(actualMax).add(-3, 'months').format("YYYY-MM-DD"));
            monthArrayForError.push(moment(actualMax).add(-4, 'months').format("YYYY-MM-DD"));
            monthArrayForError.push(moment(actualMax).add(-5, 'months').format("YYYY-MM-DD"));
        }
        var multiplier = 1;
        var selectedPlanningUnit = this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId);
        if (this.state.viewById == 2) {
            multiplier = selectedPlanningUnit.length > 0 ? selectedPlanningUnit[0].planningUnit.multiplier : 1;
        }
        if (this.state.viewById == 3) {
            var selectedEquivalencyUnit = this.state.equivalencyUnitList.filter(c => c.equivalencyUnitMappingId == this.state.equivalencyUnitId);
            multiplier = selectedEquivalencyUnit.length > 0 ? selectedEquivalencyUnit[0].convertToEu : 1;
        }
        var actualCalculationDataType = selectedPlanningUnit.consumptionDataType;
        var actualMultiplier = 1;
        if (actualCalculationDataType == 1) {
            actualMultiplier = selectedPlanningUnit.planningUnit.multiplier;
        } else if (selectedPlanningUnit.consumptionDataType == 2) {
            actualMultiplier = 1;
        } else if (selectedPlanningUnit.consumptionDataType == 3) {
            actualMultiplier = selectedPlanningUnit.otherUnit.multiplier
        }
        var totalActual = 0;
        for (var mo = 0; mo < monthArrayForError.length; mo++) {
            var actualFilter = consumptionData.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayForError[mo]).format("YYYY-MM"));
            if (actualFilter.length > 0) {
                totalActual += Number(actualFilter.length > 0 ? (Number(actualFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : 0);
            }
        }
        var actualDiff = [];
        var countArray = [];

        for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
            totalArray.push(0);
            actualDiff.push(0);
        }
        for (var m = 0; m < monthArrayListWithoutFormat.length; m++) {
            data = [];
            data[0] = monthArrayListWithoutFormat[m];

            var actualFilter = consumptionData.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));

            data[1] = actualFilter.length > 0 ? (Number(actualFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : "";
            actualConsumptionListForMonth.push(actualFilter.length > 0 ? (Number(actualFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)) : null);
            var monthArrayForErrorFilter = monthArrayForError.filter(c => moment(c).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
            if (monthArrayForErrorFilter.length > 0) {
                // totalActual += actualFilter.length > 0 ? (Number(actualFilter[0].amount) * Number(multiplier)).toFixed(2) : 0;
            }
            console.log("TreeScenarioList###", treeScenarioList)
            for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                // if (tsl == 0) {
                //     totalArray[tsl] = 0;
                //     actualDiff[tsl] = 0;
                //     countArray[tsl] = 0;
                // }
                if (treeScenarioList[tsl].type == "T") {
                    var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                    data[tsl + 2] = scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedMmdValue).toFixed(2) * multiplier : "";
                    totalArray[tsl] = Number(totalArray[tsl] != undefined ? totalArray[tsl] : 0) + Number(scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedMmdValue).toFixed(2) * multiplier : 0);

                    if (monthArrayForErrorFilter.length > 0) {
                        var diff = ((actualFilter.length > 0 ? (Number(actualFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : 0) - (scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedMmdValue).toFixed(2) * multiplier : ""));
                        if (diff < 0) {
                            diff = 0 - diff;
                        }
                        actualDiff[tsl] = scenarioFilter.length > 0 ? (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0) + diff : (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0);
                        if (scenarioFilter.length > 0) {
                            countArray[tsl] = countArray[tsl] != undefined ? countArray[tsl] + 1 : 0;
                        }
                    }

                    // consumptionDataForTree.push({ id: treeScenarioList[tsl].id, value: scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedValue).toFixed(2) * multiplier : null });
                } else {
                    var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                    data[tsl + 2] = scenarioFilter.length > 0 ? (Number(scenarioFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : "";
                    totalArray[tsl] = Number(totalArray[tsl] != undefined ? totalArray[tsl] : 0) + Number(scenarioFilter.length > 0 ? (Number(scenarioFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : 0);

                    if (monthArrayForErrorFilter.length > 0) {
                        var diff = ((actualFilter.length > 0 ? (Number(actualFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : 0) - (scenarioFilter.length > 0 ? (Number(scenarioFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : ""));
                        if (diff < 0) {
                            diff = 0 - diff;
                        }
                        actualDiff[tsl] = scenarioFilter.length > 0 ? (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0) + diff : (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0);

                        if (scenarioFilter.length > 0) {
                            countArray[tsl] = countArray[tsl] != undefined ? countArray[tsl] + 1 : 0;
                        }
                    }

                    // consumptionDataForTree.push({ id: treeScenarioList[tsl].id, value: scenarioFilter.length > 0 ? Number(scenarioFilter[0].amount).toFixed(2) * multiplier : null });
                }
            }
            // dataArr.push(data)
        }

        var monthArrayListWithoutFormat = this.state.monthList1;
        for (var m = 0; m < monthArrayListWithoutFormat.length; m++) {
            data = [];
            data[0] = monthArrayListWithoutFormat[m];

            var actualFilter = consumptionData.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));

            data[1] = actualFilter.length > 0 ? (Number(actualFilter[0].amount) * Number(actualMultiplier) * Number(multiplier)).toFixed(2) : "";
            for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                // if (tsl == 0) {
                //     totalArray[tsl] = 0;
                //     actualDiff[tsl] = 0;
                //     countArray[tsl] = 0;
                // }
                if (treeScenarioList[tsl].type == "T") {
                    var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                    data[tsl + 2] = scenarioFilter.length > 0 ? (Number(scenarioFilter[0].calculatedMmdValue) * multiplier).toFixed(2) : "";
                    consumptionDataForTree.push({ id: treeScenarioList[tsl].id, value: scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedMmdValue).toFixed(2) * multiplier : null });
                } else {
                    var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));

                    data[tsl + 2] = scenarioFilter.length > 0 ? (Number(scenarioFilter[0].amount) * Number(actualMultiplier) * multiplier).toFixed(2) : "";
                    consumptionDataForTree.push({ id: treeScenarioList[tsl].id, value: scenarioFilter.length > 0 ? Number(scenarioFilter[0].amount).toFixed(2) * Number(actualMultiplier) * multiplier : null });
                }
            }
            dataArr.push(data)
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
        var sortedArray = arrayForTotal.sort();
        higherThenConsumptionThreshold = sortedArray.length > 0 && sortedArray[sortedArray.length - 1] != "" && sortedArray[sortedArray.length - 1] != null && sortedArray[sortedArray.length - 1] != undefined ? sortedArray[sortedArray.length - 1] : 0;
        lowerThenConsumptionThreshold = sortedArray.length > 0 && sortedArray[0] != "" && sortedArray[0] != null && sortedArray[0] != undefined ? sortedArray[0] : 0;

        // lowerThenConsumptionThreshold = 8496014.97
        // higherThenConsumptionThreshold = 17829570.83

        higherThenConsumptionThresholdPU = this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].higherThenConsumptionThreshold;
        lowerThenConsumptionThresholdPU = this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].lowerThenConsumptionThreshold;
        var finalData = [];
        var min = Math.min(...actualDiff.filter(c => c != 0))
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
                totalForecast: treeScenarioList[tsList].readonly ? "" : Math.round(totalArray[tsList]),
                isLowest: min == actualDiff[tsList] ? 1 : 0,
                forecastError: treeScenarioList[tsList].readonly ? i18n.t('static.supplyPlanFormula.na') : totalArray[tsList] > 0 && actualDiff.length > 0 && actualDiff[tsList] > 0 && totalActual > 0 ? (((actualDiff[tsList]) / totalActual) * 100).toFixed(4) : "",
                noOfMonths: treeScenarioList[tsList].readonly ? i18n.t('static.supplyPlanFormula.na') : countArray.length > 0 && countArray[tsList] != undefined ? countArray[tsList] + 1 : "",
                compareToConsumptionForecastClass:
                    treeScenarioList[tsList].type == 'T' ?
                        !treeScenarioList[tsList].readonly
                            && totalArray[tsList] > 0
                            && lowerThenConsumptionThreshold != ""
                            && higherThenConsumptionThreshold != ""
                            && lowerThenConsumptionThreshold > 0
                            && higherThenConsumptionThreshold > 0 ?
                            totalArray[tsList] < lowerThenConsumptionThreshold ? (((Number(lowerThenConsumptionThreshold) - Number(totalArray[tsList])) / Number(lowerThenConsumptionThreshold)) * 100).toFixed(2) > lowerThenConsumptionThresholdPU && (((Number(lowerThenConsumptionThreshold) - Number(totalArray[tsList])) / Number(lowerThenConsumptionThreshold)) * 100).toFixed(2) < higherThenConsumptionThresholdPU ? "" : "red" : totalArray[tsList] > higherThenConsumptionThreshold ? (((Number(totalArray[tsList]) - Number(higherThenConsumptionThreshold)) / Number(higherThenConsumptionThreshold)) * 100).toFixed(2) > lowerThenConsumptionThresholdPU && (((Number(totalArray[tsList]) - Number(higherThenConsumptionThreshold)) / Number(higherThenConsumptionThreshold)) * 100).toFixed(2) < higherThenConsumptionThresholdPU ? "" : "red" : "" : "" : "",
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
                        i18n.t('static.supplyPlanFormula.na')
            })
        }

        var options = {
            data: dataArr,
            columnDrag: true,
            colWidths: [0, 150, 150, 150, 100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: columns,
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
            // nodeDataModelingList: nodeDataModelingListFilter,
            dataEl: dataEl,
            actualConsumptionListForMonth: actualConsumptionListForMonth,
            consumptionDataForTree: consumptionDataForTree,
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
            columns: columns
        })
    }

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

    setPlanningUnitId(e) {
        localStorage.setItem("sesDatasetPlanningUnitId", e.target.value);
        this.setState({
            loading: true
        })
        if (e.target.value > 0) {
            var name = this.state.planningUnitList.filter(c => c.planningUnit.id == e.target.value);
            var planningUnitId = e.target.value;
            console.log("Forecasting Unit^^^", name[0].planningUnit.forecastingUnit.id);
            console.log("this.state.equivalencyUnitList^^^", this.state.equivalencyUnitList);
            var equivalencyUnit = this.state.equivalencyUnitList.filter(c => c.forecastingUnit.id == name[0].planningUnit.forecastingUnit.id && c.equivalencyUnit.active);
            console.log("Equivalency Unit^^^", equivalencyUnit)
            var viewById = this.state.viewById;
            this.setState({
                planningUnitId: planningUnitId,
                planningUnitLabel: name.length > 0 ? name[0].planningUnit.label : "",
                forecastingUnitId: name.length > 0 ? name[0].planningUnit.forecastingUnit.id : "",
                equivalencyUnitId: equivalencyUnit.length > 0 ? equivalencyUnit[0].equivalencyUnitMappingId : 0,
                loading: false,
                viewById: viewById == 3 && equivalencyUnit.length == 0 ? 1 : viewById
            }, () => {
                if (planningUnitId > 0) {
                    this.showData();
                }
                if ((viewById == 3 && equivalencyUnit.length == 0 ? 1 : viewById) == 3) {
                    document.getElementById("equivalencyUnitDiv").style.display = "block";
                } else if (viewById == 3) {
                    document.getElementById("equivalencyUnitDiv").style.display = "none";
                }
            })
        } else {
            this.setState({
                planningUnitId: planningUnitId,
                showAllData: false,
                loading: false
            })
        }


    }

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

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportCSV() {
        var csvRow = [];

        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' : ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' : ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + " " + (document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1])).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (getLabelText(this.state.datasetJson.label, this.state.lang)).replaceAll(' ', '%20') + '"')
        csvRow.push('')

        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.forecastPeriod') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.program.region') + ' : ' + document.getElementById("regionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.planningUnit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push(('"' + (i18n.t('static.compareAndSelect.yAxisIn') + ' : ' + (this.state.viewById == 1 ? i18n.t('static.report.planningUnit') : this.state.viewById == 2 ? i18n.t('static.dashboard.forecastingunit') : i18n.t('static.equivalancyUnit.equivalancyUnit')) + '"')).replaceAll(' ', '%20'))
        csvRow.push('')
        if (this.state.viewById == 2) {
            csvRow.push('"' + (i18n.t('static.product.unit1') + ' : ' + document.getElementById("forecastingUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
            csvRow.push('')
        } else if (this.state.viewById == 3) {
            csvRow.push('"' + (i18n.t('static.equivalancyUnit.equivalancyUnit') + ' : ' + document.getElementById("equivalencyUnitId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
            csvRow.push('')
        }
        csvRow.push('"' + (i18n.t('static.compareAndSelect.showOnlyForecastPeriod') + ' : ' + (this.state.showForecastPeriod == 1 ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'))).replaceAll(' ', '%20') + '"')
        csvRow.push('')

        if (!this.state.showForecastPeriod) {
            csvRow.push('"' + (i18n.t('static.compareAndSelect.startMonthForGraph') + ' : ' + this.makeText(this.state.singleValue2.from) + ' ~ ' + this.makeText(this.state.singleValue2.to)).replaceAll(' ', '%20') + '"')
            csvRow.push('')
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

        var A = [this.addDoubleQuoteToRowContent(headers)];
        // A.push(this.addDoubleQuoteToRowContent(["",
        //     i18n.t('static.compareAndSelect.actuals'),
        //     "",
        //     "",
        //     "",
        //     "",
        //     ""]))
        this.state.finalData.map(ele =>
            A.push(this.addDoubleQuoteToRowContent([ele.type == "T" ? i18n.t('static.forecastMethod.tree') : i18n.t('static.compareAndSelect.cons'),
            ele.type == "T" ? (getLabelText(ele.tree.label, this.state.lang) + " - " + getLabelText(ele.scenario.label, this.state.lang)).replaceAll(',', ' ').replaceAll(' ', '%20') : getLabelText(ele.scenario.extrapolationMethod.label, this.state.lang).replaceAll(',', ' ').replaceAll(' ', '%20'),
            ele.id == this.state.selectedTreeScenarioId ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'),
            !ele.readonly ? ele.totalForecast.toString().replaceAll(',', ' ').replaceAll(' ', '%20') : "",
            ele.forecastError.toString().replaceAll(',', ' ').replaceAll(' ', '%20'),
            ele.noOfMonths.toString().replaceAll(',', ' ').replaceAll(' ', '%20'),
            ele.compareToConsumptionForecast.toString().replaceAll(',', ' ').replaceAll(' ', '%20')])));

        csvRow.push('')
        csvRow.push('')

        headers = [];
        this.state.columns.filter(c => c.type != 'hidden').map((item, idx) => { headers[idx] = (item.title).replaceAll(' ', '%20') });

        var C = []
        C.push([this.addDoubleQuoteToRowContent(headers)]);
        var B = []
        this.state.dataEl.getJson(null, false).map(ele => {
            B = [];
            this.state.columns.map((item, idx) => {
                if (item.type != 'hidden') {
                    if (item.type == 'numeric') {
                        if (item.mask != undefined && item.mask.toString().includes("%")) {
                            B.push((ele[idx] + " %").toString().replaceAll(',', ' ').replaceAll(' ', '%20'));
                        } else {
                            B.push(ele[idx] != "" ? "" + Number(ele[idx]).toFixed(2).toString().replaceAll(',', ' ').replaceAll(' ', '%20') : "");
                        }
                    } else if (item.type == 'calendar') {
                        B.push(moment(ele[idx]).format(DATE_FORMAT_CAP_WITHOUT_DATE).toString().replaceAll(',', ' ').replaceAll(' ', '%20'));
                    } else {
                        B.push(ele[idx] != "" ? Number(ele[idx]).toFixed(2).toString().replaceAll(',', ' ').replaceAll(' ', '%20') : "");
                    }
                }
            })
            C.push(this.addDoubleQuoteToRowContent(B));
        })

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
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
        // a.download = i18n.t('static.dashboard.compareAndSelect') + ".csv"
        a.download = document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.compareAndSelect') + "-" + document.getElementById("planningUnitId").selectedOptions[0].text + "-" + document.getElementById("regionId").selectedOptions[0].text + ".csv"
        document.body.appendChild(a)
        a.click()
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

                /*doc.addImage(data, 10, 30, {
                  align: 'justify'
                });*/
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.compareAndSelect'), doc.internal.pageSize.width / 2, 60, {
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
        doc.setTextColor("#002f6c");


        var y = 110;
        var planningText = doc.splitTextToSize(i18n.t('static.common.forecastPeriod') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }

        planningText = doc.splitTextToSize(i18n.t('static.program.region') + ' : ' + document.getElementById("regionId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
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

        planningText = doc.splitTextToSize(i18n.t('static.report.planningUnit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
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

        planningText = doc.splitTextToSize(i18n.t('static.compareAndSelect.yAxisIn') + ' : ' + (this.state.viewById == 1 ? i18n.t('static.report.planningUnit') : this.state.viewById == 2 ? i18n.t('static.dashboard.forecastingunit') : i18n.t('static.equivalancyUnit.equivalancyUnit')), doc.internal.pageSize.width * 3 / 4);
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

        if (this.state.viewById == 2) {
            planningText = doc.splitTextToSize(i18n.t('static.product.unit1') + ' : ' + document.getElementById("forecastingUnitId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
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
        } else if (this.state.viewById == 3 && document.getElementById("equivalancyUnitId") != null) {
            planningText = doc.splitTextToSize(i18n.t('static.equivalancyUnit.equivalancyUnit') + ' : ' + document.getElementById("equivalancyUnitId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
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
        }

        planningText = doc.splitTextToSize(i18n.t('static.compareAndSelect.showOnlyForecastPeriod') + ' : ' + (this.state.showForecastPeriod == 1 ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False')), doc.internal.pageSize.width * 3 / 4);
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
        if (!this.state.showForecastPeriod) {
            y = y + 10;
            doc.text(i18n.t('static.compareAndSelect.startMonthForGraph') + ' : ' + this.makeText(this.state.singleValue2.from) + ' ~ ' + this.makeText(this.state.singleValue2.to), doc.internal.pageSize.width / 20, y, {
                align: 'left'
            })
        }
        y = y + 10;



        //   const title = i18n.t('static.dashboard.globalconsumption');
        var canvas = document.getElementById("cool-canvas");
        //   //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);
        let startY = y + 10
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        doc.setTextColor("#fff");
        // if (startYtable > (height - 400)) {
        //     doc.addPage()
        //     startYtable = 80
        // }
        let col1 = []
        let dataArr2 = [];
        let dataArr3 = [];
        col1.push(i18n.t('static.common.display?'));
        col1.push(i18n.t('static.equivalancyUnit.type'));
        col1.push(i18n.t('static.consumption.forcast'));
        col1.push(i18n.t('static.compareAndSelect.selectAsForecast'));
        col1.push(i18n.t('static.compareAndSelect.totalForecast'));
        col1.push(i18n.t('static.compareAndSelect.forecastError'));
        col1.push(i18n.t('static.compareAndSelect.forecastErrorMonths'));
        col1.push(i18n.t('static.compareAndSelect.compareToConsumptionForecast'));

        // dataArr2.push("");
        // dataArr2.push("");
        // dataArr2.push(i18n.t('static.compareAndSelect.actuals'))
        // dataArr2.push("");
        // dataArr2.push("");
        // dataArr2.push("");
        // dataArr2.push("");
        // dataArr2.push("");
        // dataArr3.push(["", "",
        //     i18n.t('static.compareAndSelect.actuals'),
        //     "",
        //     "",
        //     "",
        //     "",
        //     ""])
        console.log("this.state.finalData%%%", this.state.finalData)
        this.state.finalData.map(ele =>
            dataArr3.push([ele.checked == 1 ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'), ele.type == "T" ? i18n.t('static.forecastMethod.tree') : i18n.t('static.compareAndSelect.cons'),
            ele.type == "T" ? (getLabelText(ele.tree.label, this.state.lang) + " - " + getLabelText(ele.scenario.label, this.state.lang)) : getLabelText(ele.scenario.extrapolationMethod.label, this.state.lang),
            ele.id == this.state.selectedTreeScenarioId ? i18n.t('static.dataEntry.True') : i18n.t('static.dataEntry.False'),
            this.formatter(ele.totalForecast),
            ele.forecastError != i18n.t('static.supplyPlanFormula.na') ? ele.forecastError != "" ? this.formatter(ele.forecastError) : "" : ele.forecastError,
            ele.noOfMonths.toString(),
            ele.compareToConsumptionForecast != i18n.t('static.supplyPlanFormula.na') ? this.formatter(ele.compareToConsumptionForecast) : ele.compareToConsumptionForecast])
        )

        let data2 = dataArr3;
        let content1 = {
            margin: { top: 80, bottom: 50 },
            startY: startYtable,
            head: [col1],
            body: data2,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
            didParseCell: function (data) {
                if (data.row.section != "head" && data.column.index == 7) {
                    if (this.state.finalData[data.row.index].compareToConsumptionForecastClass == "red") {
                        data.cell.styles.textColor = '#BA0C2F';
                    }
                }
                if (data.row.section != "head" && data.column.index == 5) {
                    if (this.state.finalData[data.row.index].isLowest) {
                        data.cell.styles.textColor = '#118b70';
                    }
                }
            }.bind(this)
        };
        doc.autoTable(content1);
        doc.addPage();
        doc.addImage(canvasImg, 'png', 50, 80, 750, 260, 'CANVAS');
        var columns = [];
        this.state.columns.filter(c => c.type != 'hidden').map((item, idx) => { columns.push(item.title) });
        var dataArr = [];
        var dataArr1 = [];
        this.state.dataEl.getJson(null, false).map(ele => {
            dataArr = [];
            this.state.columns.map((item, idx) => {
                if (item.type != 'hidden') {
                    if (item.type == 'numeric') {
                        if (item.mask != undefined && item.mask.toString().includes("%")) {
                            dataArr.push(this.formatter(ele[idx]) + " %");
                        } else {
                            dataArr.push(this.formatter(ele[idx]));
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
        startYtable = 80
        let content = {
            margin: { top: 80, bottom: 50 },
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

        //doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[0] + "-" + document.getElementById("datasetId").selectedOptions[0].text.toString().split("~")[1] + "-" + i18n.t('static.dashboard.compareAndSelect') + "-" + document.getElementById("planningUnitId").selectedOptions[0].text + "-" + document.getElementById("regionId").selectedOptions[0].text + '.pdf');
        //creates PDF from img
        /*  var doc = new jsPDF('landscape');
          doc.setFontSize(20);
          doc.text(15, 15, "Cool Chart");
          doc.save('canvas.pdf');*/
    }

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
                    for (var mr = 0; mr < myResult.length; mr++) {
                        var json = {
                            id: myResult[mr].id,
                            name: myResult[mr].programCode + "~v" + myResult[mr].version,
                            programJson: myResult[mr].programData
                        }
                        datasetList.push(json)
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
                        datasetList: datasetList.sort(function (a, b) {
                            a = a.name.toLowerCase();
                            b = b.name.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        equivalencyUnitList: euList,
                        loading: false,
                        datasetId: datasetId
                    }, () => {
                        if (datasetId != "") {
                            this.setDatasetId(event);
                        }
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
        // this.setState({ programs: [{ label: "Benin PRH,Condoms Forecast Dataset", programId: 1 }, { label: "Benin ARV Forecast Dataset", programId: 2 }, { label: "Benin Malaria Forecast Dataset", programId: 3 }], loading: false });
    }

    componentDidMount() {
        this.getDatasets();
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var elInstance = instance.jexcel;
        var json = elInstance.getJson(null, false);
        var jsonLength;
        if ((document.getElementsByClassName("jexcel_pagination_dropdown")[0] != undefined)) {
            jsonLength = 1 * (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
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
            console.log("rowData[0]****", this.state.monthList.includes(rowData[0]));
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG'];
            if (index != -1) {
                var cell = elInstance.getCell((colArr[0]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelBoldCell');
                var cell = elInstance.getCell((colArr[1]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelBoldCell');
                for (var c = 2; c <= tList.length + 1; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('jexcelBoldPurpleCell');
                    // var element = document.getElementById("tableDiv");
                    // element.classList.remove("jexcelremoveReadonlybackground");
                }
            } else {
                for (var c = 2; c <= tList.length + 1; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('jexcelPurpleCell');
                    // var element = document.getElementById("tableDiv");
                    // element.classList.remove("jexcelremoveReadonlybackground");
                }
            }

        }
    }

    onchangepage(el, pageNo, oldPageNo) {
        var elInstance = el.jexcel;
        var json = elInstance.getJson(null, false);
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
        var tList = this.state.treeScenarioList;
        for (var y = start; y < jsonLength; y++) {
            var rowData = elInstance.getRowData(y);
            var index = this.state.monthList.findIndex(c => moment(c).format("YYYY-MM") == moment(rowData[0]).format("YYYY-MM"))
            console.log("rowData[0]****", this.state.monthList.includes(rowData[0]));
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG'];
            if (index != -1) {
                var cell = elInstance.getCell((colArr[0]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelBoldCell');
                var cell = elInstance.getCell((colArr[1]).concat(parseInt(y) + 1))
                cell.classList.add('jexcelBoldCell');
                for (var c = 2; c <= tList.length + 1; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('jexcelBoldPurpleCell');
                    // var element = document.getElementById("tableDiv");
                    // element.classList.remove("jexcelremoveReadonlybackground");
                }
            } else {
                for (var c = 2; c <= tList.length + 1; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('jexcelPurpleCell');
                    // var element = document.getElementById("tableDiv");
                    // element.classList.remove("jexcelremoveReadonlybackground");
                }
            }
        }
    }

    setDatasetId(event) {
        console.log("In datasetId@@@")
        this.setState({ loading: true })
        var datasetId = event.target.value;
        localStorage.setItem("sesDatasetId", datasetId);
        this.setState({
            datasetId: datasetId,
        }, () => {
            if (datasetId != "") {
                console.log("in if for set@@@", this.state.datasetList);
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
                // monthList.pop();
                var monthList1 = [];
                // let rangeValue1=this.state.singleValue2;
                // let startDate = rangeValue1.from.year + '-' + rangeValue1.from.month + '-01';
                // let stopDate = rangeValue1.to.year + '-' + rangeValue1.to.month + '-' + new Date(rangeValue1.to.year, rangeValue1.to.month, 0).getDate();

                curDate = moment(startDate).format("YYYY-MM-DD");
                for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
                    curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                    monthList1.push(curDate);
                }
                // monthList1.pop();
                // var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 } }
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
                } else if (localStorage.getItem("sesDatasetPlanningUnitId") != "" && planningUnitList.filter(c => c.planningUnit.id == localStorage.getItem("sesDatasetPlanningUnitId")).length > 0) {
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
                } else if (localStorage.getItem("sesDatasetRegionId") != "" && regionList.filter(c => c.regionId == localStorage.getItem("sesDatasetRegionId")).length > 0) {
                    regionId = localStorage.getItem("sesDatasetRegionId");
                    regionEvent.target.value = localStorage.getItem("sesDatasetRegionId");
                }
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
                    planningUnitList: datasetJson.planningUnitList.sort(function (a, b) {
                        a = getLabelText(a.planningUnit.label, this.state.lang).toLowerCase();
                        b = getLabelText(b.planningUnit.label, this.state.lang).toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }.bind(this)),
                    forecastingUnitList: forecastingUnitList,
                    monthList: monthList,
                    monthList1: monthList1,
                    startDate: startDate,
                    stopDate: stopDate,
                    forecastStartDate: moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD"),
                    forecastStopDate: moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD"),
                    planningUnitId: planningUnitId,
                    loading: false
                }, () => {
                    if (planningUnitId != "") {
                        this.setPlanningUnitId(event);
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
                    showAllData: false
                })
            }
            // localStorage.setItem("sesVersionIdReport", '');
            // this.getVersionIds();
        })
    }

    setRegionId(event) {
        console.log("In region Id@@@")
        localStorage.setItem("sesDatasetRegionId", event.target.value);
        var regionName = this.state.regionList.filter(c => c.regionId == event.target.value);
        var regionId = event.target.value;
        this.setState({
            regionId: event.target.value,
            regionName: regionName.length > 0 ? getLabelText(regionName[0].label, this.state.lang) : ""
        }, () => {
            if (regionId > 0) {
                this.showData()
            }
            // localStorage.setItem("sesVersionIdReport", '');
            // this.filterVersion();
        })
    }

    scenarioCheckedChanged(id) {
        this.setState({
            loading: true
        })
        var treeScenarioList = this.state.treeScenarioList;
        var index = this.state.treeScenarioList.findIndex(c => c.id == id);
        treeScenarioList[index].checked = !treeScenarioList[index].checked;
        this.setState({
            treeScenarioList,
            loading: false
        }, () => {
            this.buildJexcel()
        })

    }

    scenarioOrderChanged(id) {
        console.log("@@@in scenarioOrder changed", this.state.treeScenarioList)
        console.log("@@@in scenarioOrder changed", id)
        this.setState({
            loading: true
        })
        // var treeScenarioList = this.state.treeScenarioList;
        // var filteredScenarioList = treeScenarioList.filter(c => c.id == id);
        // var remainingScenarioList = treeScenarioList.filter(c => c.id != id);
        // var finalList = [];
        // finalList = finalList.concat(filteredScenarioList).concat(remainingScenarioList)
        this.setState({
            // treeScenarioList: finalList,
            selectedTreeScenarioId: id,
            loading: false
        }, () => {
            this.buildJexcel();
        })
    }

    show() {

    }
    handleRangeChange(value, text, listIndex) {

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
        var viewById = e.target.value;
        this.setState({
            viewById: viewById,
        }, () => {
            if (viewById == 2) {
                document.getElementById("forecastingUnitDiv").style.display = "block";
            } else {
                document.getElementById("forecastingUnitDiv").style.display = "none";
            }
            if (viewById == 3) {
                document.getElementById("equivalencyUnitDiv").style.display = "block";
            } else {
                document.getElementById("equivalencyUnitDiv").style.display = "none";
            }
            this.buildJexcel()
        })
    }

    submitScenario() {
        this.setState({ loading: true })
        var scenarioId = this.state.selectedTreeScenarioId.toString().split("~")[1];
        var treeId = this.state.selectedTreeScenarioId.toString().split("~")[0];
        if (scenarioId == undefined) {
            scenarioId = null;
            treeId = null;
        }
        var consumptionExtrapolationId = "";
        if (!this.state.selectedTreeScenarioId.toString().includes("~")) {
            consumptionExtrapolationId = this.state.selectedTreeScenarioId
        }
        var totalIndex = this.state.treeScenarioList.findIndex(c => c.id == this.state.selectedTreeScenarioId);
        var db1;
        var storeOS;
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
                var index = planningUnitList.findIndex(c => c.planningUnit.id == this.state.planningUnitId);
                // let map1 = new Map();
                // map1.set(Number(this.state.regionId), { "scenarioId": scenarioId, "consumptionExtrapolationId": consumptionExtrapolationId, "totalForecast": this.state.totalArray[0] / this.state.multiplier })

                var pu = planningUnitList1[index];
                pu.selectedForecastMap[this.state.regionId] = { "scenarioId": scenarioId, "treeId": treeId, "consumptionExtrapolationId": consumptionExtrapolationId, "totalForecast": this.state.totalArray[totalIndex], notes: this.state.forecastNotes };
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
                    this.setState({
                        message: 'static.compareAndSelect.dataSaved',
                        color: 'green'
                    }, () => {
                        this.hideFirstComponent()
                        this.componentDidMount();
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    setForecastNotes(e) {
        this.setState({
            forecastNotes: e.target.value
        })
    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    render() {
        var chartOptions = {
            title: {
                display: true,
                text: (this.state.viewById == 1 && this.state.planningUnitId > 0 ? getLabelText(this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].planningUnit.label, this.state.lang) : this.state.viewById == 2 && this.state.forecastingUnitId > 0 && this.state.planningUnitId > 0 ? getLabelText(this.state.forecastingUnitList.filter(c => c.id == this.state.forecastingUnitId)[0].label, this.state.lang) : this.state.equivalencyUnitId > 0 && this.state.planningUnitId > 0 ? getLabelText(this.state.equivalencyUnitList.filter(c => c.equivalencyUnitMappingId == this.state.equivalencyUnitId)[0].equivalencyUnit.label, this.state.lang) : "") + " ( " + this.state.regionName + " )"
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: this.state.viewById == 1 && this.state.planningUnitId > 0 ? getLabelText(this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].planningUnit.unit.label, this.state.lang) : this.state.viewById == 2 && this.state.forecastingUnitId > 0 && this.state.planningUnitId > 0 ? getLabelText(this.state.forecastingUnitList.filter(c => c.id == this.state.forecastingUnitId)[0].unit.label, this.state.lang) : this.state.equivalencyUnitId > 0 && this.state.planningUnitId > 0 ? getLabelText(this.state.equivalencyUnitList.filter(c => c.equivalencyUnitMappingId == this.state.equivalencyUnitId)[0].equivalencyUnit.label, this.state.lang) : "",
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
                    }
                ],
                xAxes: [
                    {
                        id: 'xAxis1',
                        gridLines: {
                            color: "rgba(0, 0, 0, 0)",
                        },
                        ticks: {
                            fontColor: 'black',
                            autoSkip: false,
                            callback: function (label) {
                                var xAxis1 = label
                                xAxis1 += '';
                                var month = xAxis1.split('-')[0];
                                return month;
                            }
                        }
                    },
                    {
                        id: 'xAxis2',
                        gridLines: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                        },
                        ticks: {
                            callback: function (label) {
                                var monthArrayList = [...new Set(this.state.monthList1.map(ele => moment(ele).format("MMM-YYYY")))];
                                var xAxis2 = label
                                xAxis2 += '';
                                var month = xAxis2.split('-')[0];
                                var year = xAxis2.split('-')[1];
                                var filterByYear = monthArrayList.filter(c => moment(c).format("YYYY") == moment(year).format("YYYY"));
                                var divideByTwo = Math.round(filterByYear.length / 2);
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

                // options: {
                //     interaction: {
                //         mode: 'nearest'
                //     }
                // }
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
        if (this.state.showAllData) {
            var monthArrayList = [...new Set(this.state.monthList1.map(ele => moment(ele).format("MMM-YYYY")))];
            var monthArrayListWithoutFormat = [...new Set(this.state.monthList1.map(ele => moment(ele).format("YYYY-MM-DD")))];
            var datasetsArr = [];
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
                    pointRadius: 0,
                    showInLegend: true,
                    data: this.state.actualConsumptionListForMonth
                }
            )
            this.state.treeScenarioList.filter(c => c.checked).map((item, idx) => {
                console.log("Check data for grpah@@@", this.state.consumptionDataForTree.filter(c => c.id == item.id))
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
                        borderWidth: (this.state.selectedTreeScenarioId == item.id) ? 5 : 3,
                        pointStyle: 'line',
                        pointRadius: 0,
                        showInLegend: true,
                        data: this.state.consumptionDataForTree.filter(c => c.id == item.id).map((ele, index) => (ele.value))
                    }
                )
            })
            bar = {

                labels: monthArrayList,
                datasets: datasetsArr
            };
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
        console.log("%%%", this.state.treeScenarioList.filter(c => c.checked));
        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                {/* <h6 className="mt-success" id="div1" className={this.props.match.params.color}>{i18n.t(this.props.match.params.message)}</h6> */}
                <h5 className="red" id="div1" className={this.state.color}>{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon pb-2">
                        <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                        <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                        <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href={this.state.datasetId != -1 && this.state.datasetId != "" && this.state.datasetId != undefined ? "/#/dataSet/buildTree/tree/0/" + this.state.datasetId : "/#/dataSet/buildTree"} className="supplyplanformulas">{i18n.t('static.common.managetree')}</a> {i18n.t('static.tree.or')} <a href="/#/extrapolation/extrapolateData" className='supplyplanformulas'>{i18n.t('static.dashboard.consExtrapolation')}</a></span>
                        <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href={this.state.datasetId != -1 && this.state.datasetId != "" && this.state.datasetId != undefined ? "/#/forecastReport/forecastOutput/" + this.state.datasetId.toString().split("_")[0] + "/" + (this.state.datasetId.toString().split("_")[1]).toString().substring(1) : "/#/forecastReport/forecastOutput/"} className="supplyplanformulas">{i18n.t('static.dashboard.monthlyForecast')}</a></span><br />
                        {
                            this.state.showAllData &&
                            <div className="card-header-actions">
                                <a className="card-header-action">

                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t("static.report.exportPdf")} onClick={() => this.exportPDF()} />


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
                                            <FormGroup className="col-md-4">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
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
                                            <FormGroup className="col-md-4">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">

                                                    <Picker
                                                        ref="pickRange"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                        value={this.state.rangeValue}
                                                        lang={pickerLang}
                                                        readOnly
                                                        className="disabledColor"

                                                    //theme="light"
                                                    // onChange={this.handleRangeChange}
                                                    // onDismiss={this.handleRangeDissmis}
                                                    >
                                                        <MonthBox value={makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)} />
                                                    </Picker>
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
                                                            // onChange={this.filterVersion}
                                                            onChange={(e) => { this.setRegionId(e); }}
                                                            value={this.state.regionId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {regions}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-4">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.planningUnit')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="planningUnitId"
                                                            id="planningUnitId"
                                                            bsSize="sm"
                                                            onChange={(e) => this.setPlanningUnitId(e)}
                                                            value={this.state.planningUnitId}
                                                            className="selectWrapText"
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {planningUnits}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                        </div>
                                    </div>
                                </Form>
                                {/* <br></br> */}
                                <div style={{ display: this.state.loading ? "none" : "block" }}>
                                    {this.state.showAllData &&
                                        <>
                                            <ul style={{ marginLeft: '-2.5rem' }}><b style={{ color: this.state.treeScenarioList.filter(c => c.id == this.state.selectedTreeScenarioId).length > 0 ? "#000" : "#BA0C2F" }}>{i18n.t('static.compareAndSelect.selectOne') + " " + getLabelText(this.state.planningUnitLabel, this.state.lang) + " " + i18n.t('static.compareAndSelect.andRegion') + " " + this.state.regionName}</b><br /></ul>
                                            <ul className="legendcommitversion">
                                                <li><i class="fa fa-exclamation-triangle"></i><i> {i18n.t('static.compareAndSelect.missingData')}</i></li>
                                                <li><span className=" greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.extrapolation.lowestError')} </span></li>
                                            </ul><br />
                                            <Table hover responsive className="table-outline mb-0 d-sm-table table-bordered">
                                                <thead><tr>
                                                    <th style={{ "textAlign": "center" }}>{i18n.t('static.common.display?')}</th>
                                                    <th style={{ "textAlign": "center" }} title={i18n.t('static.compareAndSelect.typeTitle')}>{i18n.t('static.equivalancyUnit.type')}</th>
                                                    <th style={{ "textAlign": "center" }}>{i18n.t('static.consumption.forcast')}</th>
                                                    <th style={{ "textAlign": "center" }}>{i18n.t('static.compareAndSelect.selectAsForecast')}</th>
                                                    <th style={{ "textAlign": "center" }} title={i18n.t('static.common.forForecastPeriod') + " " + moment(this.state.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " " + i18n.t('static.jexcel.to') + " " + moment(this.state.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)}>{i18n.t('static.compareAndSelect.totalForecast')}</th>
                                                    <th style={{ "textAlign": "center" }}>{i18n.t('static.compareAndSelect.forecastError')}</th>
                                                    <th style={{ "textAlign": "center" }}>{i18n.t('static.compareAndSelect.forecastErrorMonths')}</th>
                                                    <th style={{ "textAlign": "center" }}>{i18n.t('static.compareAndSelect.compareToConsumptionForecast')}</th>
                                                </tr></thead>
                                                <tbody>
                                                    {/* <tr>
                                                        <td></td>
                                                        <td></td>
                                                        <td><i class="fa fa-circle" style={{ color: "#808080" }} aria-hidden="true"></i>{i18n.t('static.compareAndSelect.actuals')}</td>
                                                        <td></td>
                                                        <td align="center"></td>
                                                        <td align="center"></td>
                                                        <td align="center"></td>
                                                        <td align="center"></td>
                                                    </tr> */}
                                                    {this.state.treeScenarioList.map((item, idx) => (
                                                        <tr id="addr0" style={{ backgroundColor: item.readonly ? "#CFCDC9" : "" }}>
                                                            <td align="center"><input type="checkbox" id={"scenarioCheckbox" + item.id} checked={item.checked} onChange={() => this.scenarioCheckedChanged(item.id)} disabled={item.readonly} /></td>
                                                            <td align="center" >{item.type == "T" ? i18n.t('static.forecastMethod.tree') : i18n.t('static.compareAndSelect.cons')}</td>
                                                            <td><i class="fa fa-circle" style={{ color: item.color }} aria-hidden="true"></i> {" "}{item.type == "T" ? getLabelText(item.tree.label, this.state.lang) + " - " + getLabelText(item.scenario.label, this.state.lang) : getLabelText(item.scenario.extrapolationMethod.label, this.state.lang)}{"  "}{item.readonly && <i class="fa fa-exclamation-triangle"></i>}</td>
                                                            <td align="center"><input type="radio" id="selectAsForecast" name="selectAsForecast" checked={this.state.selectedTreeScenarioId == item.id ? true : false} onClick={() => this.scenarioOrderChanged(item.id)} disabled={item.readonly}></input></td>
                                                            <td align="center">{item.readonly ? "" : <NumberFormat displayType={'text'} thousandSeparator={true} value={Math.round(this.state.totalArray[idx])} />}</td>
                                                            <td align="center" style={{ color: Math.min(...this.state.actualDiff.filter(c => c != 0)) == this.state.actualDiff[idx] ? "#118b70" : "#000000" }}>{item.readonly ? i18n.t('static.supplyPlanFormula.na') : this.state.totalArray[idx] > 0 && this.state.actualDiff.length > 0 ? <NumberFormat displayType={'text'} thousandSeparator={true} value={(((this.state.actualDiff[idx]) / this.state.totalActual) * 100).toFixed(4)} /> : ""}</td>
                                                            <td align="center">{item.readonly ? i18n.t('static.supplyPlanFormula.na') : <NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.countArray.length > 0 && this.state.countArray[idx] != undefined ? this.state.countArray[idx] + 1 : ""} />}</td>
                                                            {item.type == "T" ? <td align="center" className={!item.readonly && this.state.totalArray[idx] > 0 && this.state.lowerThenConsumptionThreshold != "" && this.state.higherThenConsumptionThreshold != "" && this.state.lowerThenConsumptionThreshold > 0 && this.state.higherThenConsumptionThreshold > 0 ? this.state.totalArray[idx] < this.state.lowerThenConsumptionThreshold ? (((Number(this.state.lowerThenConsumptionThreshold) - Number(this.state.totalArray[idx])) / Number(this.state.lowerThenConsumptionThreshold)) * 100).toFixed(2) > this.state.lowerThenConsumptionThresholdPU && (((Number(this.state.lowerThenConsumptionThreshold) - Number(this.state.totalArray[idx])) / Number(this.state.lowerThenConsumptionThreshold)) * 100).toFixed(2) < this.state.higherThenConsumptionThresholdPU ? "" : "red" : this.state.totalArray[idx] > this.state.higherThenConsumptionThreshold ? (((Number(this.state.totalArray[idx]) - Number(this.state.higherThenConsumptionThreshold)) / Number(this.state.higherThenConsumptionThreshold)) * 100).toFixed(2) > this.state.lowerThenConsumptionThresholdPU && (((Number(this.state.totalArray[idx]) - Number(this.state.higherThenConsumptionThreshold)) / Number(this.state.higherThenConsumptionThreshold)) * 100).toFixed(2) < this.state.higherThenConsumptionThresholdPU ? "" : "red" : "" : ""}>{!item.readonly && this.state.totalArray[idx] > 0 && this.state.lowerThenConsumptionThreshold != "" && this.state.higherThenConsumptionThreshold != "" && this.state.lowerThenConsumptionThreshold > 0 && this.state.higherThenConsumptionThreshold > 0 ? this.state.totalArray[idx] < this.state.lowerThenConsumptionThreshold ? (((Number(this.state.lowerThenConsumptionThreshold) - Number(this.state.totalArray[idx])) / Number(this.state.lowerThenConsumptionThreshold)) * 100).toFixed(2) + i18n.t('static.compareAndSelect.belowLowestConsumption') : this.state.totalArray[idx] > this.state.higherThenConsumptionThreshold ? (((Number(this.state.totalArray[idx]) - Number(this.state.higherThenConsumptionThreshold)) / Number(this.state.higherThenConsumptionThreshold)) * 100).toFixed(2) + i18n.t('static.compareAndSelect.aboveHighestConsumption') : i18n.t('static.supplyPlanFormula.na') : i18n.t('static.supplyPlanFormula.na')}</td> : <td align="center" >{i18n.t('static.supplyPlanFormula.na')}</td>}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>

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
                                                        <FormGroup check inline style={{ display: this.state.equivalencyUnitId > 0 ? 'block' : 'none' }}>
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
                                                                    className="selectWrapText"
                                                                    name="equivalencyUnitId"
                                                                    id="equivalencyUnitId"
                                                                    disabled={true}
                                                                    value={this.state.equivalencyUnitId}
                                                                    onChange={this.setEquivalencyUnit}
                                                                    bsSize="sm"
                                                                    className="selectWrapText removeDropdownArrow"
                                                                >
                                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                                    {equivalencies}
                                                                </Input>

                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3">
                                                        <Input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="showForecastPeriod"
                                                            name="showForecastPeriod"
                                                            checked={this.state.showForecastPeriod}
                                                            onClick={(e) => { this.setShowForecastPeriod(e); }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                            {i18n.t('static.compareAndSelect.showOnlyForecastPeriod')}
                                                        </Label>
                                                    </FormGroup>
                                                    {!this.state.showForecastPeriod && <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.compareAndSelect.startMonthForGraph')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                        <div className="controls edit">
                                                            <Picker
                                                                ref="pickAMonth2"
                                                                years={{ min: this.state.minDate, max: this.state.maxDateForSingleValue }}
                                                                value={this.state.singleValue2}
                                                                key={JSON.stringify(this.state.singleValue2)}
                                                                lang={pickerLang}
                                                                onChange={this.handleAMonthChange2}
                                                                onDismiss={this.handleAMonthDissmis2}
                                                            //theme="light"
                                                            // onChange={this.handleRangeChange}
                                                            // onDismiss={this.handleRangeDissmis}
                                                            >
                                                                <MonthBox value={makeText(this.state.singleValue2.from) + ' ~ ' + makeText(this.state.singleValue2.to)} onClick={this.handleClickMonthBox2} />
                                                            </Picker>
                                                        </div>
                                                    </FormGroup>}
                                                    <div className="col-md-12 p-0">
                                                        <div className="col-md-12">
                                                            <div className="chart-wrapper chart-graph-report">
                                                                <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                                                <div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-12">
                                                            <button className="mr-1 mb-2 mt-2 float-right btn btn-info btn-md showdatabtn" onClick={this.toggledata}>
                                                                {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                                            </button>

                                                        </div>
                                                    </div>




                                                </div>



                                                {/* <div className="row"> */}
                                                {/* <div className="col-md-12 pl-0 pr-0"> */}
                                                <div className="row" style={{ display: this.state.show ? "block" : "none" }}>
                                                    <div className="col-md-12 pl-0 pr-0">
                                                        <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: this.state.show && !this.state.loading ? "block" : "none" }}>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* </div> */}
                                                {/* </div> */}

                                            </Col>
                                        </>}</div>
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
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.showAllData && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.submitScenario}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>
            </div >
        );
    }
}

export default CompareAndSelectScenario;