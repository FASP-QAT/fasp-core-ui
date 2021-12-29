import React, { Component, lazy } from 'react';
import { Bar } from 'react-chartjs-2';
import MultiSelect from "react-multi-select-component";
import {
    Card,
    CardBody,
    Col,
    Table, FormGroup, Input, InputGroup, Label, Form, Button, CardFooter
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
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling, DATE_FORMAT_CAP_WITHOUT_DATE, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_MONTH_PICKER_FORMAT } from '../../Constants.js'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions';
import NumberFormat from 'react-number-format';
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}


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
            versionListAll: [{ versionId: 1, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 1, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }, { versionId: 1, program: { label: "Benin Malaria Forecast Dataset", programId: 3 } }, { versionId: 2, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 2, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }],
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
            showForecastPeriod: false
        };
        this.getDatasets = this.getDatasets.bind(this);
        this.filterData = this.filterData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.setViewById = this.setViewById.bind(this);
        // this.getProductCategories = this.getProductCategories.bind(this);
        //this.pickRange = React.createRef()
        this.setDatasetId = this.setDatasetId.bind(this);
        this.setRegionId = this.setRegionId.bind(this);
        this.setForecastingUnit = this.setForecastingUnit.bind(this);
        this.toggleAccordionTotalActual = this.toggleAccordionTotalActual.bind(this);
        this.toggleAccordionTotalF = this.toggleAccordionTotalForecast.bind(this);
        this.toggleAccordionTotalDiffernce = this.toggleAccordionTotalDiffernce.bind(this);
        this.setPlanningUnitId = this.setPlanningUnitId.bind(this);
        this.setEquivalencyUnit = this.setEquivalencyUnit.bind(this);
        this.submitScenario = this.submitScenario.bind(this);
        this.loaded = this.loaded.bind(this)
        this.onchangepage=this.onchangepage.bind(this)

    }

    handleClickMonthBox2 = (e) => {
        this.refs.pickAMonth2.show()
    }
    handleAMonthChange2 = (value, text) => {
        //
        //
    }
    handleAMonthDissmis2 = (value) => {
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
        var rangeValue = this.state.singleValue2;
        console.log("RangeValue+++",rangeValue)
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
        for (var i = 0; curDate < stopDate; i++) {
            curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
            monthList.push(curDate);
        }
        monthList.pop();
        this.setState({
            monthList1: monthList
        }, () => {
            this.showData();
        })
    }

    showData() {
        if (this.state.planningUnitId != "") {
            var datasetJson = this.state.datasetJson;
            var multiplier = 1;
            var selectedPlanningUnit = this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId);
            if (this.state.viewById == 2) {
                multiplier = selectedPlanningUnit.length > 0 ? selectedPlanningUnit[0].planningUnit.multiplier : 1;
            }
            if (this.state.viewById == 3) {
                var selectedEquivalencyUnit = this.state.equivalencyUnitList.filter(c => c.equivalencyUnitMappingId == this.state.equivalencyUnitId);
                multiplier = selectedEquivalencyUnit.length > 0 ? selectedEquivalencyUnit[0].convertToEu : 1;
            }
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
            var colourArray = ["#002F6C", "#BA0C2F", "#65ID32", "#49A4A1", "#A7C6ED", "#212721", "#6C6463", "#49A4A1", "#EDB944", "#F48521"]
            var colourArrayCount = 0;
            // var compareToConsumptionForecast = ["","","","22.7% above the highest consumption forecast.","7.9% below the lowest consumption forecast.","In between the highest and lowest consumption forecast."];
            var count = 0;
            var consumptionExtrapolation = datasetJson.consumptionExtrapolation.filter(c => c.planningUnit.id == this.state.planningUnitId);
            for (var ce = 0; ce < consumptionExtrapolation.length; ce++) {
                if (colourArrayCount > 9) {
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
                    if (colourArrayCount > 9) {
                        colourArrayCount = 0;
                    }
                    var readonly = flatList.length > 0 ? false : true
                    var dataForPlanningUnit = treeList[tl].tree.flatList.filter(c => (c.payload.nodeDataMap[scenarioList[sl].id])[0].puNode != null && (c.payload.nodeDataMap[scenarioList[sl].id])[0].puNode.planningUnit.id == this.state.planningUnitId);
                    treeScenarioList.push({ id: treeList[tl].treeId + "~" + scenarioList[sl].id, tree: treeList[tl], scenario: scenarioList[sl], checked: readonly ? false : true, color: colourArray[colourArrayCount], type: "T", data: dataForPlanningUnit.length > 0 ? (dataForPlanningUnit[0].payload.nodeDataMap[scenarioList[sl].id])[0].nodeDataMomList : [], readonly: readonly });
                    colourArrayCount += 1;
                    count += 1;
                }
            }
            if (selectedPlanningUnit.length > 0 && selectedPlanningUnit[0].selectedForecastMap != undefined) {
            }
            var selectedTreeScenarioId = selectedPlanningUnit.length > 0 && selectedPlanningUnit[0].selectedForecastMap != undefined ? selectedPlanningUnit[0].selectedForecastMap[this.state.regionId] != undefined && selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].scenarioId != null && selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].scenarioId != "" ? treeScenarioList.filter(c => c.scenario.id == selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].scenarioId)[0].id : selectedPlanningUnit[0].selectedForecastMap[this.state.regionId] != undefined ? selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].consumptionExtrapolationId : 0 : 0;
            var forecastNotes = selectedPlanningUnit.length > 0 && selectedPlanningUnit[0].selectedForecastMap != undefined ? selectedPlanningUnit[0].selectedForecastMap[this.state.regionId] != undefined && selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].notes != undefined ? selectedPlanningUnit[0].selectedForecastMap[this.state.regionId].notes : "" : "";
            this.setState({
                treeScenarioList,
                actualConsumptionList: datasetJson.actualConsumptionList.filter(c => c => c.planningUnit.id == this.state.planningUnitId && c.region.id == this.state.regionId),
                multiplier: multiplier,
                selectedTreeScenarioId: selectedTreeScenarioId,
                forecastNotes: forecastNotes,
                // singleValue2: rangeValue,
                // monthList1: monthList1,
                showAllData: true
            }, () => {
                this.scenarioOrderChanged(selectedTreeScenarioId)
                this.buildJexcel()
            })
        }
    }

    buildJexcel() {
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var columns = [];
        columns.push({ title: "Month", width: 100, type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' } });
        columns.push({ title: "Actuals (Adjusted)", width: 100, type: 'numeric', mask: '#,##.00' });
        var treeScenarioList = this.state.treeScenarioList.filter(c => c.checked);
        for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
            if (treeScenarioList[tsl].type == "T") {
                columns.push({ title: getLabelText(treeScenarioList[tsl].tree.label) + " - " + getLabelText(treeScenarioList[tsl].scenario.label), width: 100, type: 'numeric', mask: '#,##.00', decimal: "." });
            } else {
                columns.push({ title: getLabelText(treeScenarioList[tsl].scenario.extrapolationMethod.label), width: 100, type: 'numeric', mask: '#,##.00', decimal: "." });
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
        monthArrayForError.push(moment(actualMax).format("YYYY-MM-DD"));
        monthArrayForError.push(moment(actualMax).add(-1, 'months').format("YYYY-MM-DD"));
        monthArrayForError.push(moment(actualMax).add(-2, 'months').format("YYYY-MM-DD"));
        monthArrayForError.push(moment(actualMax).add(-3, 'months').format("YYYY-MM-DD"));
        monthArrayForError.push(moment(actualMax).add(-4, 'months').format("YYYY-MM-DD"));
        monthArrayForError.push(moment(actualMax).add(-5, 'months').format("YYYY-MM-DD"));
        var totalActual = 0;
        var actualDiff = [];
        var countArray = [];
        var multiplier = 1;
        for (var m = 0; m < monthArrayListWithoutFormat.length; m++) {
            data = [];
            data[0] = monthArrayListWithoutFormat[m];

            var actualFilter = consumptionData.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));

            data[1] = actualFilter.length > 0 ? actualFilter[0].amount.toFixed(2) * multiplier : "";
            actualConsumptionListForMonth.push(actualFilter.length > 0 ? actualFilter[0].amount * multiplier : null);
            var monthArrayForErrorFilter = monthArrayForError.filter(c => moment(c).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
            if (monthArrayForErrorFilter.length > 0) {
                totalActual += actualFilter.length > 0 ? Number(actualFilter[0].amount.toFixed(2)) * multiplier : 0;
            }
            for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                // if (tsl == 0) {
                //     totalArray[tsl] = 0;
                //     actualDiff[tsl] = 0;
                //     countArray[tsl] = 0;
                // }
                if (treeScenarioList[tsl].type == "T") {
                    var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                    data[tsl + 2] = scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedValue).toFixed(2) * multiplier : "";
                    totalArray[tsl] = (totalArray[tsl] != undefined ? totalArray[tsl] : 0) + (scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedValue).toFixed(2) * multiplier : 0);

                    if (monthArrayForErrorFilter.length > 0) {
                        var diff = ((actualFilter.length > 0 ? Number(actualFilter[0].amount.toFixed(2)) * multiplier : 0) - (scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedValue).toFixed(2) * multiplier : ""));
                        if (diff < 0) {
                            diff = 0 - diff;
                        }
                        actualDiff[tsl] = scenarioFilter.length > 0 ? (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0) + diff : (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0);
                        if (scenarioFilter.length > 0) {
                            countArray[tsl] = countArray[tsl] != undefined ? countArray[tsl] + 1 : 0;
                        }
                    }

                    consumptionDataForTree.push({ id: treeScenarioList[tsl].id, value: scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedValue).toFixed(2) * multiplier : null });
                } else {
                    var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));

                    data[tsl + 2] = scenarioFilter.length > 0 ? Number(scenarioFilter[0].amount).toFixed(2) * multiplier : "";
                    totalArray[tsl] = (totalArray[tsl] != undefined ? totalArray[tsl] : 0) + (scenarioFilter.length > 0 ? Number(scenarioFilter[0].amount).toFixed(2) * multiplier : 0);

                    if (monthArrayForErrorFilter.length > 0) {
                        var diff = ((actualFilter.length > 0 ? Number(actualFilter[0].amount.toFixed(2)) * multiplier : 0) - (scenarioFilter.length > 0 ? Number(scenarioFilter[0].amount).toFixed(2) * multiplier : ""));
                        if (diff < 0) {
                            diff = 0 - diff;
                        }
                        actualDiff[tsl] = scenarioFilter.length > 0 ? (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0) + diff : (actualDiff[tsl] != undefined ? Number(actualDiff[tsl]) : 0);

                        if (scenarioFilter.length > 0) {
                            countArray[tsl] = countArray[tsl] != undefined ? countArray[tsl] + 1 : 0;
                        }
                    }

                    consumptionDataForTree.push({ id: treeScenarioList[tsl].id, value: scenarioFilter.length > 0 ? Number(scenarioFilter[0].amount).toFixed(2) * multiplier : null });
                }
            }
            // dataArr.push(data)
        }

        var monthArrayListWithoutFormat = this.state.monthList1;
        for (var m = 0; m < monthArrayListWithoutFormat.length; m++) {
            data = [];
            data[0] = monthArrayListWithoutFormat[m];

            var actualFilter = consumptionData.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));

            data[1] = actualFilter.length > 0 ? actualFilter[0].amount.toFixed(2) * this.state.multiplier : "";
            for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                // if (tsl == 0) {
                //     totalArray[tsl] = 0;
                //     actualDiff[tsl] = 0;
                //     countArray[tsl] = 0;
                // }
                if (treeScenarioList[tsl].type == "T") {
                    var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                    data[tsl + 2] = scenarioFilter.length > 0 ? Number(scenarioFilter[0].calculatedValue).toFixed(2) * this.state.multiplier : "";
                } else {
                    var scenarioFilter = treeScenarioList[tsl].data.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));

                    data[tsl + 2] = scenarioFilter.length > 0 ? Number(scenarioFilter[0].amount).toFixed(2) * this.state.multiplier : "";
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
            loading: false
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
        this.setState({ loading: true })
        if (e.target.value > 0) {
            var name = this.state.planningUnitList.filter(c => c.planningUnit.id == e.target.value);
            var planningUnitId = e.target.value;
            var equivalencyUnit = this.state.equivalencyUnitList.filter(c => c.forecastingUnit.id == name[0].planningUnit.forecastingUnit.id);
            this.setState({
                planningUnitId: planningUnitId,
                planningUnitLabel: name.length > 0 ? name[0].planningUnit.label : "",
                forecastingUnitId: name.length > 0 ? name[0].planningUnit.forecastingUnit.id : "",
                equivalencyUnitId: equivalencyUnit.length > 0 ? equivalencyUnit[0].equivalencyUnitMappingId : 0
            }, () => {
                if (planningUnitId > 0) {
                    this.showData();
                }
            })
        } else {
            this.setState({
                planningUnitId: planningUnitId
            })
        }


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
        let viewById = document.getElementById("viewById").value;
        let versionId = document.getElementById("versionId").value;
        let planningUnitId = document.getElementById("planningUnitId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        if (planningUnitId > 0 && programId > 0 && versionId != 0) {
        }
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
                    var datasetList = this.state.datasetList;
                    for (var mr = 0; mr < myResult.length; mr++) {
                        var json = {
                            id: myResult[mr].id,
                            name: myResult[mr].programCode + "~v" + myResult[mr].version,
                            programJson: myResult[mr].programData
                        }
                        datasetList.push(json)
                    }
                    this.setState({
                        datasetList: datasetList,
                        equivalencyUnitList: euList,
                        loading: false
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
        var tList = this.state.treeScenarioList.filter(c => c.checked);
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
        var tList = this.state.treeScenarioList.filter(c => c.checked);
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
        this.setState({ loading: true })
        var datasetId = event.target.value;
        this.setState({
            datasetId: datasetId,
        }, () => {
            if (datasetId != "") {
                var datasetFiltered = this.state.datasetList.filter(c => c.id == datasetId)[0];
                var datasetDataBytes = CryptoJS.AES.decrypt(datasetFiltered.programJson, SECRET_KEY);
                var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                var datasetJson = JSON.parse(datasetData);
                var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
                var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");

                var curDate = moment(startDate).format("YYYY-MM-DD");
                var monthList = [];
                for (var i = 0; curDate < stopDate; i++) {
                    curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                    monthList.push(curDate);
                }
                monthList.pop();
                var monthList1 = [];
                // let rangeValue1=this.state.singleValue2;
                // let startDate = rangeValue1.from.year + '-' + rangeValue1.from.month + '-01';
                // let stopDate = rangeValue1.to.year + '-' + rangeValue1.to.month + '-' + new Date(rangeValue1.to.year, rangeValue1.to.month, 0).getDate();

                curDate = moment(startDate).format("YYYY-MM-DD");
                for (var i = 0; curDate < stopDate; i++) {
                    curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                    monthList1.push(curDate);
                }
                monthList1.pop();
                var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 } }

                var maxDateForSingleValue = { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 }
                var regionList = datasetJson.regionList;
                var forecastingUnitList = [];
                var planningUnitList = datasetJson.planningUnitList
                for (var pu = 0; pu < planningUnitList.length; pu++) {
                    var index = forecastingUnitList.findIndex(c => c.id == planningUnitList[pu].planningUnit.forecastingUnit.id);
                    if (index == -1) {
                        forecastingUnitList.push(planningUnitList[pu].planningUnit.forecastingUnit);
                    }
                }
                this.setState({
                    datasetJson: datasetJson,
                    rangeValue: rangeValue,
                    singleValue2: rangeValue,
                    maxDateForSingleValue: maxDateForSingleValue,
                    regionList: regionList,
                    planningUnitList: datasetJson.planningUnitList,
                    forecastingUnitList: forecastingUnitList,
                    monthList: monthList,
                    monthList1: monthList1,
                    startDate: startDate,
                    stopDate: stopDate,
                    forecastStartDate: moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD"),
                    forecastStopDate: moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD"),
                    loading: false
                }, () => {
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
                    loading: false
                })
            }
            // localStorage.setItem("sesVersionIdReport", '');
            // this.getVersionIds();
        })
    }

    setRegionId(event) {
        var regionName = this.state.regionList.filter(c => c.regionId == event.target.value);
        this.setState({
            regionId: event.target.value,
            regionName: regionName.length > 0 ? regionName[0].label.label_en : ""
        }, () => {
            this.showData()
            // localStorage.setItem("sesVersionIdReport", '');
            // this.filterVersion();
        })
    }

    scenarioCheckedChanged(id) {
        var treeScenarioList = this.state.treeScenarioList;
        var index = this.state.treeScenarioList.findIndex(c => c.id == id);
        treeScenarioList[index].checked = !treeScenarioList[index].checked;
        this.setState({
            treeScenarioList
        }, () => {
            this.buildJexcel()
        })

    }

    scenarioOrderChanged(id) {
        var treeScenarioList = this.state.treeScenarioList;
        var filteredScenarioList = treeScenarioList.filter(c => c.id == id);
        var remainingScenarioList = treeScenarioList.filter(c => c.id != id);
        var finalList = [];
        finalList = finalList.concat(filteredScenarioList).concat(remainingScenarioList)
        this.setState({
            treeScenarioList: finalList,
            selectedTreeScenarioId: id
        }, () => {
            this.buildJexcel();
        })
    }

    getVersionIds() {
        this.setState({ loading: true })
        var versionListAll = this.state.versionListAll;
        var planningUnitListAll = this.state.planningUnitListAll;
        var reportPeriod = [{ programId: 1, startDate: '2020-09-01', endDate: '2021-08-30' }, { programId: 2, startDate: '2020-07-01', endDate: '2021-06-30' }, { programId: 3, startDate: '2020-11-01', endDate: '2021-10-30' }];
        var startDate = reportPeriod.filter(c => c.programId == this.state.programId)[0].startDate;
        var endDate = reportPeriod.filter(c => c.programId == this.state.programId)[0].endDate;

        var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } }
        let stopDate = endDate;
        var monthArrayList = [];
        let cursorDate = startDate;
        for (var i = 0; moment(cursorDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"); i++) {
            var dt = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
            cursorDate = moment(cursorDate).add(1, 'months').format("YYYY-MM-DD");
            monthArrayList.push(dt);
        }
        // var scenarioList = [{ scenarioId: 1, label: "A. Consumption High", checked: true, color: "#4f81bd" }, { scenarioId: 2, label: "B. Consumption Med", checked: true, color: "#f79646" }, { scenarioId: 3, label: "C. Consumption Low", checked: true, color: "#000000" }, { scenarioId: 4, label: "D. Morbidity - assumption Y", checked: true, color: "#ff0000" }, { scenarioId: 5, label: "E. Demographic", checked: true, color: "#604a7b" }]
        this.setState({ versions: versionListAll.filter(c => c.program.programId == this.state.programId), loading: false, planningUnits: planningUnitListAll.filter(c => c.program.programId == this.state.programId), rangeValue: rangeValue, monthArrayList: monthArrayList });
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
            this.showData()
        })
    }

    submitScenario() {
        this.setState({ loading: true })
        var scenarioId = this.state.selectedTreeScenarioId.toString().split("~")[1];
        if (scenarioId == undefined) {
            scenarioId = "";
        }
        var consumptionExtrapolationId = "";
        if (!this.state.selectedTreeScenarioId.toString().includes("~")) {
            consumptionExtrapolationId = this.state.selectedTreeScenarioId
        }

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
                let map1 = new Map();
                map1.set(Number(this.state.regionId), { "scenarioId": scenarioId, "consumptionExtrapolationId": consumptionExtrapolationId, "totalForecast": this.state.totalArray[0] / this.state.multiplier })

                var pu = planningUnitList1[index];
                pu.selectedForecastMap[this.state.regionId] = { "scenarioId": scenarioId, "consumptionExtrapolationId": consumptionExtrapolationId, "totalForecast": this.state.totalArray[0] / this.state.multiplier, notes: this.state.forecastNotes };
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
                    let id = AuthenticationService.displayDashboardBasedOnRole();
                    this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + "Data saved successfully");
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    setForecastNotes(e) {
        this.setState({
            forecastNotes: e.target.value
        })
    }

    render() {
        var chartOptions = {
            title: {
                display: true,
                text: this.state.planningUnitLabel.label_en + " ( " + this.state.regionName + " )"
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: this.state.viewById == 1 && this.state.planningUnitId > 0 ? this.state.planningUnitList.filter(c => c.planningUnit.id == this.state.planningUnitId)[0].planningUnit.unit.label.label_en : this.state.viewById == 2 && this.state.forecastingUnitId > 0 ? this.state.forecastingUnitList.filter(c => c.id == this.state.forecastingUnitId)[0].unit.label.label_en : this.state.equivalencyUnitId > 0 ? this.state.equivalencyUnitList.filter(c => c.equivalencyUnitMappingId == this.state.equivalencyUnitId)[0].unit.label.label_en : "",
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
                                var xAxis2 = label
                                xAxis2 += '';
                                var month = xAxis2.split('-')[0];
                                var year = xAxis2.split('-')[1];
                                if (month === "Jul") {
                                    return year;
                                } else {
                                    return "";
                                }
                            },
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
                }
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
                    label: "Actuals (Adjusted)",
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
                datasetsArr.push(
                    {
                        label: item.type == "T" ? getLabelText(item.tree.label) + " - " + getLabelText(item.scenario.label) : getLabelText(item.scenario.extrapolationMethod.label),
                        type: 'line',
                        stack: idx + 2,
                        backgroundColor: 'transparent',
                        borderColor: item.color,
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0.1,
                        borderWidth: idx == 0 ? 5 : 3,
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
                        {getLabelText(item.label, this.state.lang)}
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
                        {getLabelText(item.planningUnit.label, this.state.lang)}
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
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon pb-2">
                        <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                        <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                        <span className="compareAndSelect-larrowText"> Back to <a href="/#/dataset/listTree/">Manage Tree</a> or <a href="/#/extrapolation/extrapolateData">Cons Extrapolation</a></span>
                        <span className="compareAndSelect-rarrowText"> Continue to <a href="/#/forecastReport/forecastOutput">Monthly Forecast</a></span><br />
                        {checkOnline === 'Online' &&
                            this.state.showAllData &&
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
                                                <Label htmlFor="appendedInputButton">Forecast Period<span className="stock-box-icon fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">

                                                    <Picker
                                                        ref="pickRange"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                        value={this.state.rangeValue}
                                                        lang={pickerLang}
                                                        readOnly
                                                        className="greyColor"

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
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
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
                                <br></br>
                                {this.state.showAllData &&
                                    <>
                                        <ul className="legendcommitversion">
                                            <li><i class="fa fa-exclamation-triangle"></i><i> Missing Data</i></li>
                                        </ul><br />
                                        <b>{"Select one forecast for " + this.state.planningUnitLabel.label_en + " and Region " + this.state.regionName}</b>
                                        <br />
                                        <Table hover responsive className="table-outline mb-0 d-sm-table table-bordered">
                                            <thead><tr>
                                                <th style={{ "textAlign": "center" }}>Display?</th>
                                                <th style={{ "textAlign": "center" }} title={"C indicates a consumption forecast, T indicates a Tree Forecast."}>Type</th>
                                                <th style={{ "textAlign": "center" }}>Forecast</th>
                                                <th style={{ "textAlign": "center" }}>Select as forecast?</th>
                                                <th style={{ "textAlign": "center" }} title={"For the forecast period " + moment(this.state.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " to " + moment(this.state.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)}>Total Forecast</th>
                                                <th style={{ "textAlign": "center" }}>Forecast Error (%)</th>
                                                <th style={{ "textAlign": "center" }}>Forecast Error (# Months Used)</th>
                                                <th style={{ "textAlign": "center" }}>Compare to Consumption Forecast</th>
                                            </tr></thead>
                                            <tbody>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td><i class="fa fa-circle" style={{ color: "#808080" }} aria-hidden="true"></i> Actuals (Adjusted)</td>
                                                    <td></td>
                                                    <td align="center"></td>
                                                    <td align="center"></td>
                                                    <td align="center"></td>
                                                    <td align="center"></td>
                                                </tr>
                                                {this.state.treeScenarioList.map((item, idx) => (
                                                    <tr id="addr0" style={{ backgroundColor: item.readonly ? "#CFCDC9" : "" }}>
                                                        <td align="center"><input type="checkbox" id={"scenarioCheckbox" + item.id} checked={item.checked} onChange={() => this.scenarioCheckedChanged(item.id)} disabled={item.readonly} /></td>
                                                        <td style={{ "textAlign": "center" }} >{item.type}</td>
                                                        <td><i class="fa fa-circle" style={{ color: item.color }} aria-hidden="true"></i> {" "}{item.type == "T" ? getLabelText(item.tree.label, this.state.lang) + " - " + getLabelText(item.scenario.label, this.state.lang) : getLabelText(item.scenario.extrapolationMethod.label)}{"  "}{item.readonly && <i class="fa fa-exclamation-triangle"></i>}</td>
                                                        <td align="center"><input type="radio" id="selectAsForecast" name="selectAsForecast" checked={this.state.selectedTreeScenarioId == item.id ? true : false} onClick={() => this.scenarioOrderChanged(item.id)} disabled={item.readonly}></input></td>
                                                        <td align="center">{item.readonly ? "" : <NumberFormat displayType={'text'} thousandSeparator={true} value={Math.round(this.state.totalArray[idx])} />}</td>
                                                        <td align="center" style={{ color: Math.min(...this.state.actualDiff.filter(c => c != 0)) == this.state.actualDiff[idx] ? "#118b70" : "#000000" }}>{item.readonly ? "NA" : this.state.totalArray[idx] > 0 && this.state.actualDiff.length > 0 ? <NumberFormat displayType={'text'} thousandSeparator={true} value={((this.state.actualDiff[idx]) / this.state.totalActual).toFixed(4)} /> : ""}</td>
                                                        <td align="center">{item.readonly ? "NA" : <NumberFormat displayType={'text'} thousandSeparator={true} value={this.state.countArray.length > 0 && this.state.countArray[idx] != undefined ? this.state.countArray[idx] + 1 : ""} />}</td>
                                                        {item.type == "T" ? <td align="center" className={!item.readonly && this.state.totalArray[idx] > 0 && this.state.lowerThenConsumptionThreshold != "" && this.state.higherThenConsumptionThreshold != "" && this.state.lowerThenConsumptionThreshold > 0 && this.state.higherThenConsumptionThreshold > 0 ? this.state.totalArray[idx] < this.state.lowerThenConsumptionThreshold ? (((Number(this.state.lowerThenConsumptionThreshold) - Number(this.state.totalArray[idx])) / Number(this.state.lowerThenConsumptionThreshold)) * 100).toFixed(2) > this.state.lowerThenConsumptionThresholdPU && (((Number(this.state.lowerThenConsumptionThreshold) - Number(this.state.totalArray[idx])) / Number(this.state.lowerThenConsumptionThreshold)) * 100).toFixed(2) < this.state.higherThenConsumptionThresholdPU ? "" : "red" : this.state.totalArray[idx] > this.state.higherThenConsumptionThreshold ? (((Number(this.state.totalArray[idx]) - Number(this.state.higherThenConsumptionThreshold)) / Number(this.state.higherThenConsumptionThreshold)) * 100).toFixed(2) > this.state.lowerThenConsumptionThresholdPU && (((Number(this.state.totalArray[idx]) - Number(this.state.higherThenConsumptionThreshold)) / Number(this.state.higherThenConsumptionThreshold)) * 100).toFixed(2) < this.state.higherThenConsumptionThresholdPU ? "" : "red" : "" : ""}>{!item.readonly && this.state.totalArray[idx] > 0 && this.state.lowerThenConsumptionThreshold != "" && this.state.higherThenConsumptionThreshold != "" && this.state.lowerThenConsumptionThreshold > 0 && this.state.higherThenConsumptionThreshold > 0 ? this.state.totalArray[idx] < this.state.lowerThenConsumptionThreshold ? (((Number(this.state.lowerThenConsumptionThreshold) - Number(this.state.totalArray[idx])) / Number(this.state.lowerThenConsumptionThreshold)) * 100).toFixed(2) + "% below the lowest consumption forecast." : this.state.totalArray[idx] > this.state.higherThenConsumptionThreshold ? (((Number(this.state.totalArray[idx]) - Number(this.state.higherThenConsumptionThreshold)) / Number(this.state.higherThenConsumptionThreshold)) * 100).toFixed(2) + "% above the highest consumption forecast." : "N/A" : "N/A"}</td> : <td align="center" >N/A</td>}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </>
                                }
                                <br></br>
                                {this.state.planningUnitId > 0 && <FormGroup className="col-md-12">
                                    <Label htmlFor="appendedInputButton">Notes</Label>
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
                                </FormGroup>}
                                <br></br>

                                <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div className="row">
                                        {this.state.showAllData
                                            &&
                                            <>
                                                <FormGroup>

                                                    <Label className="P-absltRadio">Y-axis in&nbsp;&nbsp;</Label>

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
                                                    <FormGroup check inline>
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
                                                            {"Equivalency Unit"}
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
                                                                className="selectWrapText"
                                                            >
                                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                                {forecastingUnits}
                                                            </Input>

                                                        </InputGroup>
                                                    </div>
                                                </FormGroup>
                                                <FormGroup className="col-md-4" id="equivalencyUnitDiv" style={{ display: "none" }}>
                                                    <Label htmlFor="appendedInputButton">Equivalency Unit</Label>
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
                                                        <b>Show only Forecast Period</b>
                                                    </Label>
                                                </FormGroup>
                                                <FormGroup className="col-md-3">
                                                    <Label htmlFor="appendedInputButton">Start Month for Graph/Table<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                    <div className="controls edit">
                                                        <Picker
                                                            ref="pickAMonth2"
                                                            years={{ min: this.state.minDate, max: this.state.maxDateForSingleValue }}
                                                            value={this.state.singleValue2}
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
                                                </FormGroup>
                                                <div className="col-md-12 p-0">
                                                    <div className="col-md-12">
                                                        <div className="chart-wrapper chart-graph-report">
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
                                                </div>
                                            </>
                                        }




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
                            <Button type="button" size="md" color="danger" className="float-right mr-1"><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.submitScenario}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>
            </div >
        );
    }
}

export default CompareAndSelectScenario;