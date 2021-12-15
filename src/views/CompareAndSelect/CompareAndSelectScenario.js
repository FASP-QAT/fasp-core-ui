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
            equivalencyUnitList: [{ id: "1", label: { label_en: "Patients Month" } }],
            versionListAll: [{ versionId: 1, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 1, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }, { versionId: 1, program: { label: "Benin Malaria Forecast Dataset", programId: 3 } }, { versionId: 2, program: { label: "Benin PRH,Condoms Forecast Dataset", programId: 1 } }, { versionId: 2, program: { label: "Benin ARV Forecast Dataset", programId: 2 } }],
            showTotalForecast: true,
            showTotalActual: true,
            showTotalDifference: true,
            monthArrayList: [],
            planningUnitId: "",
            consumptionDataAll: [{ month: "2021-01-01", treeScenarioId: 0, value: '1900000' },
            { month: "2021-02-01", treeScenarioId: 0, value: '1895200' },
            { month: "2021-03-01", treeScenarioId: 0, value: '2100582' },
            { month: "2021-04-01", treeScenarioId: 0, value: '2098036' },
            { month: "2021-05-01", treeScenarioId: 0, value: '2431099' },
            { month: "2021-06-01", treeScenarioId: 0, value: '2318548' },
            { month: "2021-07-01", treeScenarioId: 0, value: '2603034' },
            { month: "2021-08-01", treeScenarioId: 0, value: '2656528' },
            { month: "2021-09-01", treeScenarioId: 0, value: '2558876' },
            { month: "2021-10-01", treeScenarioId: 0, value: '2374687' },
            { month: "2021-11-01", treeScenarioId: 0, value: '2875981' },
            { month: "2021-12-01", treeScenarioId: 0, value: '2657729' },
            { month: "2022-01-01", treeScenarioId: 0, value: '2680430' },
            { month: "2021-01-01", treeScenarioId: "1~1", value: '2000000' },
            { month: "2021-02-01", treeScenarioId: "1~1", value: '2080000' },
            { month: "2021-03-01", treeScenarioId: "1~1", value: '2163200' },
            { month: "2021-04-01", treeScenarioId: "1~1", value: '2249728' },
            { month: "2021-05-01", treeScenarioId: "1~1", value: '2339717' },
            { month: "2021-06-01", treeScenarioId: "1~1", value: '2433306' },
            { month: "2021-07-01", treeScenarioId: "1~1", value: '2530638' },
            { month: "2021-08-01", treeScenarioId: "1~1", value: '2631864' },
            { month: "2021-09-01", treeScenarioId: "1~1", value: '2737138' },
            { month: "2021-10-01", treeScenarioId: "1~1", value: '2846624' },
            { month: "2021-11-01", treeScenarioId: "1~1", value: '2960489' },
            { month: "2021-12-01", treeScenarioId: "1~1", value: '3078908' },
            { month: "2022-01-01", treeScenarioId: "1~1", value: '3202064' },
            { month: "2022-02-01", treeScenarioId: "1~1", value: '3330147' },
            { month: "2022-03-01", treeScenarioId: "1~1", value: '3463353' },
            { month: "2022-04-01", treeScenarioId: "1~1", value: '3601887' },
            { month: "2022-05-01", treeScenarioId: "1~1", value: '3745962' },
            { month: "2022-06-01", treeScenarioId: "1~1", value: '3895801' },
            { month: "2022-07-01", treeScenarioId: "1~1", value: '4051633' },
            { month: "2022-08-01", treeScenarioId: "1~1", value: '4213698' },
            { month: "2022-09-01", treeScenarioId: "1~1", value: '4382246' },
            { month: "2022-10-01", treeScenarioId: "1~1", value: '4557536' },
            { month: "2022-11-01", treeScenarioId: "1~1", value: '4739838' },
            { month: "2021-01-01", treeScenarioId: "1~2", value: '2000000' },
            { month: "2021-02-01", treeScenarioId: "1~2", value: '2060000' },
            { month: "2021-03-01", treeScenarioId: "1~2", value: '2121800' },
            { month: "2021-04-01", treeScenarioId: "1~2", value: '2185454' },
            { month: "2021-05-01", treeScenarioId: "1~2", value: '2251018' },
            { month: "2021-06-01", treeScenarioId: "1~2", value: '2318548' },
            { month: "2021-07-01", treeScenarioId: "1~2", value: '2388105' },
            { month: "2021-08-01", treeScenarioId: "1~2", value: '2459748' },
            { month: "2021-09-01", treeScenarioId: "1~2", value: '2533540' },
            { month: "2021-10-01", treeScenarioId: "1~2", value: '2609546' },
            { month: "2021-11-01", treeScenarioId: "1~2", value: '2687833' },
            { month: "2021-12-01", treeScenarioId: "1~2", value: '2768468' },
            { month: "2022-01-01", treeScenarioId: "1~2", value: '2851522' },
            { month: "2022-02-01", treeScenarioId: "1~2", value: '2937067' },
            { month: "2022-03-01", treeScenarioId: "1~2", value: '3025179' },
            { month: "2022-04-01", treeScenarioId: "1~2", value: '3115935' },
            { month: "2022-05-01", treeScenarioId: "1~2", value: '3209413' },
            { month: "2022-06-01", treeScenarioId: "1~2", value: '3305695' },
            { month: "2022-07-01", treeScenarioId: "1~2", value: '3404866' },
            { month: "2022-08-01", treeScenarioId: "1~2", value: '3507012' },
            { month: "2022-09-01", treeScenarioId: "1~2", value: '3612222' },
            { month: "2022-10-01", treeScenarioId: "1~2", value: '3720589' },
            { month: "2022-11-01", treeScenarioId: "1~2", value: '3832207' },
            { month: "2021-01-01", treeScenarioId: "2~3", value: '2000000' },
            { month: "2021-02-01", treeScenarioId: "2~3", value: '2040000' },
            { month: "2021-03-01", treeScenarioId: "2~3", value: '2080800' },
            { month: "2021-04-01", treeScenarioId: "2~3", value: '2122416' },
            { month: "2021-05-01", treeScenarioId: "2~3", value: '2164864' },
            { month: "2021-06-01", treeScenarioId: "2~3", value: '2208162' },
            { month: "2021-07-01", treeScenarioId: "2~3", value: '2252325' },
            { month: "2021-08-01", treeScenarioId: "2~3", value: '2297371' },
            { month: "2021-09-01", treeScenarioId: "2~3", value: '2343319' },
            { month: "2021-10-01", treeScenarioId: "2~3", value: '2390185' },
            { month: "2021-11-01", treeScenarioId: "2~3", value: '2437989' },
            { month: "2021-12-01", treeScenarioId: "2~3", value: '2486749' },
            { month: "2022-01-01", treeScenarioId: "2~3", value: '2536484' },
            { month: "2022-02-01", treeScenarioId: "2~3", value: '2587213' },
            { month: "2022-03-01", treeScenarioId: "2~3", value: '2638958' },
            { month: "2022-04-01", treeScenarioId: "2~3", value: '2691737' },
            { month: "2022-05-01", treeScenarioId: "2~3", value: '2745571' },
            { month: "2022-06-01", treeScenarioId: "2~3", value: '2800483' },
            { month: "2022-07-01", treeScenarioId: "2~3", value: '2856492' },
            { month: "2022-08-01", treeScenarioId: "2~3", value: '2913622' },
            { month: "2022-09-01", treeScenarioId: "2~3", value: '2971895' },
            { month: "2022-10-01", treeScenarioId: "2~3", value: '3031333' },
            { month: "2022-11-01", treeScenarioId: "2~3", value: '3091959' },
            { month: "2021-12-01", treeScenarioId: "2~4", value: '2600000' },
            { month: "2022-01-01", treeScenarioId: "2~4", value: '2860000' },
            { month: "2022-02-01", treeScenarioId: "2~4", value: '3146000' },
            { month: "2022-03-01", treeScenarioId: "2~4", value: '3460600' },
            { month: "2022-04-01", treeScenarioId: "2~4", value: '3806660' },
            { month: "2022-05-01", treeScenarioId: "2~4", value: '4187326' },
            { month: "2022-06-01", treeScenarioId: "2~4", value: '4606059' },
            { month: "2022-07-01", treeScenarioId: "2~4", value: '5066664' },
            { month: "2022-08-01", treeScenarioId: "2~4", value: '5573331' },
            { month: "2022-09-01", treeScenarioId: "2~4", value: '6130664' },
            { month: "2022-10-01", treeScenarioId: "2~4", value: '6743730' },
            { month: "2022-11-01", treeScenarioId: "2~4", value: '7418103' },
            { month: "2021-12-01", treeScenarioId: "2~5", value: '2600000' },
            { month: "2022-01-01", treeScenarioId: "2~5", value: '2597400' },
            { month: "2022-02-01", treeScenarioId: "2~5", value: '2594803' },
            { month: "2022-03-01", treeScenarioId: "2~5", value: '2592208' },
            { month: "2022-04-01", treeScenarioId: "2~5", value: '2589616' },
            { month: "2022-05-01", treeScenarioId: "2~5", value: '2587026' },
            { month: "2022-06-01", treeScenarioId: "2~5", value: '2584439' },
            { month: "2022-07-01", treeScenarioId: "2~5", value: '2581855' },
            { month: "2022-08-01", treeScenarioId: "2~5", value: '2579273' },
            { month: "2022-09-01", treeScenarioId: "2~5", value: '2576693' },
            { month: "2022-10-01", treeScenarioId: "2~5", value: '2574117' },
            { month: "2022-11-01", treeScenarioId: "2~5", value: '2571543' }],
            consumptionData: [],
            scenarioList: [],
            selectedTreeScenarioId: 0,


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
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this);

    }

    showData() {
        var datasetJson = this.state.datasetJson;
        var treeScenarioList = [];
        var treeList = datasetJson.treeList;
        var colourArray = ["#002F6C", "#BA0C2F", "#65ID32", "#49A4A1", "#A7C6ED", "#212721", "#6C6463", "#49A4A1", "#EDB944", "#F48521"]
        var colourArrayCount = 0;
        var totalForecast = [43184166, 36521708, 30865747, 52999138, 28428971];
        var forecastError = [10.8, 5.9, 8.5, 1.5, 0.9];
        var forecastErrorMonth = [6, 6, 6, 2, 2];
        // var compareToConsumptionForecast = ["","","","22.7% above the highest consumption forecast.","7.9% below the lowest consumption forecast.","In between the highest and lowest consumption forecast."];
        var count = 0;
        for (var tl = 0; tl < treeList.length; tl++) {
            var scenarioList = treeList[tl].scenarioList;
            for (var sl = 0; sl < scenarioList.length; sl++) {
                if (colourArrayCount > 9) {
                    colourArrayCount = 0;
                }
                treeScenarioList.push({ id: treeList[tl].treeId + "~" + scenarioList[sl].id, tree: treeList[tl], scenario: scenarioList[sl], checked: true, color: colourArray[colourArrayCount], type: "T", totalForecast: totalForecast[count], forecastError: forecastError[count], forecastErrorMonth: forecastErrorMonth[count], compareToConsumptionForecast: "" });
                colourArrayCount += 1;
                count += 1;
            }
        }
        var consumptionDataAll = this.state.consumptionDataAll;
        console.log("TreeScenarioList+++", treeScenarioList);
        this.setState({
            treeScenarioList,
            consumptionData: consumptionDataAll
        }, () => {
            this.buildJexcel()
        })
        // var scenarioList = [
        // { scenarioId: 1, label: "A. Consumption High", checked: true, color: "#4f81bd", program: { id: 2 }, errorValue: "10%" }, { scenarioId: 2, label: "B. Consumption Med", checked: true, color: "#f79646", program: { id: 2 }, errorValue: "12%" }, { scenarioId: 3, label: "C. Consumption Low", checked: true, color: "#000000", program: { id: 2 }, errorValue: "15%" }, { scenarioId: 4, label: "D. Morbidity - assumption Y", checked: true, color: "#ff0000", program: { id: 2 }, errorValue: "30%" }, { scenarioId: 5, label: "E. Demographic", checked: true, color: "#604a7b", program: { id: 2 }, errorValue: "20%" },
        // { scenarioId: 1, label: "A. Consumption High", checked: true, color: "#4f81bd", program: { id: 1 }, errorValue: "20%" }, { scenarioId: 2, label: "B. Consumption Med", checked: true, color: "#f79646", program: { id: 1 }, errorValue: "25%" }, { scenarioId: 3, label: "C. Consumption Low", checked: true, color: "#000000", program: { id: 1 }, errorValue: "30%" },
        // { scenarioId: 4, label: "D. Morbidity - assumption Y", checked: true, color: "#ff0000", program: { id: 3 }, errorValue: "10%" }, { scenarioId: 5, label: "E. Demographic", checked: true, color: "#604a7b", program: { id: 3 }, errorValue: "15%" }
        // ]
        // var consumptionData = this.state.consumptionDataAll;
        // this.setState({
        // scenarioList: scenarioList.filter(c => c.program.id == this.state.programId),
        // consumptionData: consumptionData
        // })
    }

    buildJexcel() {
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var columns = [];
        columns.push({ title: "Month", width: 100,type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }  });
        columns.push({ title: "Actuals (Adjusted)", width: 100, readOnly: true, type: 'numeric', mask: '#,##.00' });
        var treeScenarioList = this.state.treeScenarioList;
        for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
            columns.push({ title: getLabelText(treeScenarioList[tsl].tree.label) + " - " + getLabelText(treeScenarioList[tsl].scenario.label), width: 100, readOnly: true, type: 'numeric', mask: '#,##.00' });
        }
        var data = [];
        var dataArr = [];
        var consumptionData = this.state.consumptionData;
        var monthArrayListWithoutFormat = [...new Set(this.state.consumptionData.map(ele => moment(ele.month).format("YYYY-MM-DD")))];
        for (var m = 0; m < monthArrayListWithoutFormat.length; m++) {
            data = [];
            data[0] = monthArrayListWithoutFormat[m];
            var actualFilter = consumptionData.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM") && c.treeScenarioId == 0);
            data[1] = actualFilter.length > 0 ? actualFilter[0].value : "";
            for (var tsl = 0; tsl < treeScenarioList.length; tsl++) {
                var scenarioFilter = consumptionData.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM") && c.treeScenarioId == treeScenarioList[tsl].id);
                data[tsl + 2] = scenarioFilter.length > 0 ? scenarioFilter[0].value : "";
            }
            dataArr.push(data)
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
            editable:false,
            contextMenu: function (obj, x, y, e) {
                return [];
            }.bind(this),
        };
        var dataEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = dataEl;

        this.setState({
            // nodeDataModelingList: nodeDataModelingListFilter,
            dataEl: dataEl,
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
        console.log("E++++++++", e.target)
        var name = this.state.planningUnitList.filter(c => c.planningUnitId == e.target.value);
        var planningUnitId = e.target.value;
        this.setState({
            planningUnitId: planningUnitId,
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
        console.log('values =>', planningUnitId, programId, versionId);
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
                var myResult = [];
                myResult = getRequest.result;
                console.log("MyResult+++", myResult);
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
                    loading: false
                })
            }.bind(this)
        }.bind(this)
        // this.setState({ programs: [{ label: "Benin PRH,Condoms Forecast Dataset", programId: 1 }, { label: "Benin ARV Forecast Dataset", programId: 2 }, { label: "Benin Malaria Forecast Dataset", programId: 3 }], loading: false });
    }

    componentDidMount() {
        this.getDatasets();
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    setDatasetId(event) {
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
                var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 } }
                var regionList = datasetJson.regionList;
                this.setState({
                    datasetJson: datasetJson,
                    rangeValue: rangeValue,
                    regionList: regionList
                }, () => {
                    this.getPlanningUnitList();
                })
            }
            // localStorage.setItem("sesVersionIdReport", '');
            // this.getVersionIds();
        })
    }

    getPlanningUnitList() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
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
                        var datasetJson = this.state.datasetJson;
                        var healthAreaList = [...new Set(datasetJson.healthAreaList.map(ele => (ele.id)))];
                        console.log("MyResult+++", myResult);
                        var tracerCategoryListFilter = myResult.filter(c => healthAreaList.includes(c.healthArea.id));
                        var tracerCategoryIds = [...new Set(tracerCategoryListFilter.map(ele => (ele.tracerCategoryId)))];
                        var forecastingUnitList = fuResult.filter(c => tracerCategoryIds.includes(c.tracerCategory.id));
                        var forecastingUnitIds = [...new Set(forecastingUnitList.map(ele => (ele.forecastingUnitId)))];
                        var planningUnitList = puResult.filter(c => forecastingUnitIds.includes(c.forecastingUnit.forecastingUnitId));
                        this.setState({
                            planningUnitList: planningUnitList,
                            forecastingUnitList: forecastingUnitList
                        })
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    setRegionId(event) {
        this.setState({
            regionId: event.target.value,
        }, () => {
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
        })
    }

    getVersionIds() {
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
        console.log("e.targetvakue+++", e.target.value)
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
        })
    }

    render() {

        var chartOptions = {
            title: {
                display: false,
            },
            scales: {
                yAxes: [
                    {
                        id: 'A',
                        scaleLabel: {
                            display: true,
                            labelString: "Units",
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
                mode: 'index',
                enabled: false,
                custom: CustomTooltips,
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
        if (this.state.consumptionData.length > 0) {
            var monthArrayList = [...new Set(this.state.consumptionData.map(ele => moment(ele.month).format(DATE_FORMAT_CAP_WITHOUT_DATE)))];
            var monthArrayListWithoutFormat = [...new Set(this.state.consumptionData.map(ele => moment(ele.month).format("YYYY-MM-DD")))];
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
                    data: this.state.consumptionData.filter(c => c.treeScenarioId == 0).map(c => (c.value))
                }
            )
            this.state.treeScenarioList.filter(c => c.checked).map((item, idx) => {
                var list = [];
                var filteredList = this.state.consumptionData.filter(c => c.treeScenarioId == item.id);
                console.log("FilteredList+++", filteredList);
                for (var m = 0; m < monthArrayListWithoutFormat.length; m++) {
                    var dataList = filteredList.filter(c => moment(c.month).format("YYYY-MM") == moment(monthArrayListWithoutFormat[m]).format("YYYY-MM"));
                    console.log("DataList+++", dataList)
                    if (dataList.length > 0) {
                        list.push(dataList[0].value)
                    } else {
                        list.push(null)
                    }
                }
                datasetsArr.push(
                    {
                        label: getLabelText(item.tree.label) + " - " + getLabelText(item.scenario.label),
                        type: 'line',
                        stack: idx + 2,
                        backgroundColor: 'transparent',
                        borderColor: item.color,
                        ticks: {
                            fontSize: 2,
                            fontColor: 'transparent',
                        },
                        lineTension: 0.1,
                        borderWidth: idx == 0 ? 7 : 3,
                        pointStyle: 'line',
                        pointRadius: 0,
                        showInLegend: true,
                        data: list
                    }
                )
            })
            console.log("MonthArratyList+++", monthArrayList)
            bar = {

                labels: monthArrayList,
                datasets: datasetsArr
            };
        }

        const { forecastingUnitList } = this.state;
        let forecastingUnits = forecastingUnitList.length > 0
            && forecastingUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.forecastingUnitId}>
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
                    <option key={i} value={item.planningUnitId}>
                        {getLabelText(item.label, this.state.lang)}
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
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
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
                                                            name="datasetId"
                                                            id="datasetId"
                                                            bsSize="sm"
                                                            // onChange={this.filterVersion}
                                                            onChange={(e) => { this.setDatasetId(e); }}
                                                            value={this.state.datasetId}

                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {datasets}
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
                                                        value={this.state.rangeValue}
                                                        lang={pickerLang}
                                                        readOnly

                                                    //theme="light"
                                                    // onChange={this.handleRangeChange}
                                                    // onDismiss={this.handleRangeDissmis}
                                                    >
                                                        <MonthBox value={makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)} />
                                                    </Picker>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
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
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Y-axis in</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="viewById"
                                                            id="viewById"
                                                            bsSize="sm"
                                                            value={this.state.viewById}
                                                            onChange={this.setViewById}
                                                        >
                                                            <option value="1">{i18n.t('static.report.planningUnit')}</option>
                                                            <option value="2">{i18n.t('static.dashboard.forecastingunit')}</option>
                                                            <option value="3">Equivalency Unit</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
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
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {planningUnits}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3" id="forecastingUnitDiv" style={{ display: "none" }}>
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.product.unit1')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="foreccastingUnitId"
                                                            id="forecastingUnitId"
                                                            value={this.state.forecastingUnitId}
                                                            onChange={this.setForecastingUnit}
                                                            bsSize="sm"
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {forecastingUnits}
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
                                                            onChange={this.setEquivalencyUnit}
                                                            bsSize="sm"
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {equivalencies}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>
                                <br></br>
                                {this.state.consumptionData.length > 0 &&
                                    <Table hover responsive className="table-outline mb-0 d-sm-table table-bordered">
                                        <thead><tr>
                                            <th>Display?</th>
                                            <th>Type</th>
                                            <th>Forecast</th>
                                            <th>Select as forecast?</th>
                                            <th>Total Forecast</th>
                                            <th>Forecast Error</th>
                                            <th>Forecast Error (# Months Used)</th>
                                            <th>Compare to Consumption Forecast</th>
                                        </tr></thead>
                                        <tbody>
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td style={{ color: "#808080" }}>Actuals (Adjusted)</td>
                                                <td></td>
                                                <td align="center"></td>
                                                <td align="center"></td>
                                                <td align="center"></td>
                                                <td align="center"></td>
                                            </tr>
                                            {this.state.treeScenarioList.map((item, idx) => (
                                                <tr id="addr0">
                                                    <td align="center"><input type="checkbox" id={"scenarioCheckbox" + item.id} checked={item.checked} onChange={() => this.scenarioCheckedChanged(item.id)} /></td>
                                                    <td>{item.type}</td>
                                                    <td style={{ color: item.color }}>{getLabelText(item.tree.label, this.state.lang) + " - " + getLabelText(item.scenario.label, this.state.lang)}</td>
                                                    <td align="center"><input type="radio" id="selectAsForecast" name="selectAsForecast" checked={this.state.selectedTreeScenarioId == item.id ? true : false} onClick={() => this.scenarioOrderChanged(item.id)}></input></td>
                                                    <td align="center"><NumberFormat displayType={'text'} thousandSeparator={true} value={item.totalForecast} /></td>
                                                    <td align="center">{item.forecastError}</td>
                                                    <td align="center">{item.forecastErrorMonth}</td>
                                                    <td align="center"></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                }
                                <br></br>
                                <br></br>
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
                            <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white"><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                            <Button type="submit" size="md" color="success" className="float-right mr-1"><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>
            </div >
        );
    }
}

export default CompareAndSelectScenario;