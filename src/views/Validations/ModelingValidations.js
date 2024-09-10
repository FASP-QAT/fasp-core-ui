import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { DatePicker } from "antd";
import "antd/dist/antd.css";
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import { MultiSelect } from "react-multi-select-component";
import {
    Card,
    CardBody,
    Col,
    Form,
    FormGroup, Input, InputGroup,
    Label,
    Popover,
    PopoverBody
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions';
import { decompressJson, filterOptions } from '../../CommonComponent/JavascriptCommonFunctions';
import { LOGO } from '../../CommonComponent/Logo';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { DATE_FORMAT_CAP, DATE_FORMAT_CAP_WITHOUT_DATE, DATE_FORMAT_CAP_WITHOUT_DATE_FOUR_DIGITS, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, SECRET_KEY, TITLE_FONT } from '../../Constants.js';
import DatasetService from '../../api/DatasetService';
import ProgramService from '../../api/ProgramService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const { RangePicker } = DatePicker;
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
/**
 * This component is used to display the modeling validation for a tree
 */
class ModelingValidation extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - 10);
        this.state = {
            popoverOpenLevelFeild: false,
            datasetId: "",
            datasetList: [],
            lang: localStorage.getItem("lang"),
            versionId: "",
            versionList: [],
            datasetData: {},
            treeList: [],
            treeId: "",
            scenarioList: [],
            scenarioId: "",
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            levelList: [],
            levelId: "",
            levelUnit: "",
            displayBy: 1,
            nodeVal: [],
            nodeList: [],
            nodeIdArr: [],
            nodeLabelArr: [],
            nodeDataModelingList: [],
            loading: false,
            monthList: [],
            show: true,
            xAxisDisplayBy: 1
        };
        this.toggleLevelFeild = this.toggleLevelFeild.bind(this);
        this.setDatasetId = this.setDatasetId.bind(this);
        this.getOfflineDatasetList = this.getOfflineDatasetList.bind(this);
        this.getVersionList = this.getVersionList.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.getTreeList = this.getTreeList.bind(this);
        this.getDatasetData = this.getDatasetData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleYearRangeChange = this.handleYearRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.toggledata = this.toggledata.bind(this)
    }
    /**
     * This function is used to set the node value selected by the user
     * @param {*} e This is the event value
     */
    setNodeVal(e) {
        this.setState({ loading: true })
        var nodeIdArr = [];
        var nodeLabelArr = [];
        for (var i = 0; i < e.length; i++) {
            nodeIdArr.push(e[i].value);
            nodeLabelArr.push(e[i].label);
        }
        this.setState({
            nodeVal: e,
            nodeIdArr,
            nodeLabelArr,
            loading: false
        }, () => {
            this.getData()
        })
    }
    /**
     * This function is used to set the display by value selected by the user
     * @param {*} e This is the event value
     */
    setDisplayBy(e) {
        this.setState({ loading: true })
        var displayBy = e.target.value;
        this.setState({
            displayBy: displayBy,
            loading: false
        }, () => {
            this.getData()
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
            val = this.state.rangeValue;
        } else if (displayBy == 2) {
            val = {
                from: {
                    year: this.state.rangeValue.from.year,
                    month: 1,
                },
                to: {
                    year: this.state.rangeValue.to.year,
                    month: 12,
                }
            }
        } else {
            val = {
                from: {
                    year: this.state.rangeValue.from.year,
                    month: (Number(displayBy) + 4) % 12 == 0 ? 12 : (Number(displayBy) + 4) % 12,
                },
                to: {
                    year: this.state.rangeValue.to.year,
                    month: (Number(displayBy) + 3) % 12 == 0 ? 12 : (Number(displayBy) + 3) % 12,
                }
            }
        }
        this.setState({
            xAxisDisplayBy: displayBy,
            rangeValue: val,
            loading: false
        }, () => {
            this.getData()
        })
    }
    /**
     * This function is used to show the text for the date picker
     * @param {*} m 
     * @returns 
     */
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    /**
     * This function is used to toggle the data
     */
    toggledata() {
        var show = this.state.show;
        this.setState({
            show: !show
        })
    }
    /**
     * This function is used to toggle the info icon for the level field
     */
    toggleLevelFeild() {
        this.setState({
            popoverOpenLevelFeild: !this.state.popoverOpenLevelFeild,
        });
    }
    /**
     * This function is used to set the version Id selected by the user
     * @param {*} e This is the event value
     */
    setVersionId(e) {
        this.setState({ loading: true })
        var versionId = e.target.value;
        localStorage.setItem("sesDatasetVersionId", versionId);
        if (versionId != "") {
            this.setState({
                versionId: versionId,
                treeList: [],
                treeId: "",
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                dataEl: "",
                dataEl2: "",
                levelId: "",
                levelUnit: "",
                nodeList: [],
                nodeVal: [],
                nodeIdArr: [],
                nodeLabelArr: [],
                loading: false
            }, () => {
                this.getDatasetData()
            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            this.el = jexcel(document.getElementById("tableDiv2"), '');
            jexcel.destroy(document.getElementById("tableDiv2"), true);
            this.setState({
                versionId: versionId,
                datasetData: {},
                treeList: [],
                treeId: "",
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                dataEl: "",
                dataEl2: "",
                levelId: "",
                levelUnit: "",
                nodeList: [],
                nodeVal: [],
                nodeIdArr: [],
                nodeLabelArr: [],
                loading: false
            })
        }
    }
    /**
     * This function is used to get the dataset data
     */
    getDatasetData() {
        this.setState({
            loading: true
        })
        var versionId = this.state.versionId.toString();
        if (versionId != "" && versionId.includes("Local")) {
            var actualVersionId = (versionId.split('(')[0]).trim();
            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var datasetId = this.state.datasetId + "_v" + actualVersionId + "_uId_" + userId;
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
                var datasetOs = datasetTransaction.objectStore('datasetData');
                var getRequest = datasetOs.get(datasetId);
                getRequest.onerror = function (event) {
                }.bind(this);
                getRequest.onsuccess = function (event) {
                    var myResult = [];
                    myResult = getRequest.result;
                    var datasetDataBytes = CryptoJS.AES.decrypt(myResult.programData, SECRET_KEY);
                    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                    var datasetJson = JSON.parse(datasetData);
                    this.setState({
                        datasetData: datasetJson,
                        loading: false
                    }, () => {
                        this.getTreeList();
                    })
                }.bind(this)
            }.bind(this)
        } else if (versionId != "" && !versionId.includes("Local")) {
            var json = [{ programId: this.state.datasetId, versionId: versionId }]
            DatasetService.getAllDatasetData(json).then(response => {
                if (response.status == 200) {
                    response.data = decompressJson(response.data);
                    var responseData = response.data[0];
                    this.setState({
                        datasetData: responseData,
                        loading: false
                    }, () => {
                        this.getTreeList();
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    }, () => {
                        this.hideSecondComponent();
                    })
                }
            }).catch(
                error => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                    this.el = jexcel(document.getElementById("tableDiv2"), '');
                    jexcel.destroy(document.getElementById("tableDiv2"), true);
                    this.setState({
                        datasetData: {},
                        treeList: [],
                        treeId: "",
                        scenarioList: [],
                        scenarioId: "",
                        levelList: [],
                        dataEl: "",
                        dataEl2: "",
                        levelId: "",
                        levelUnit: "",
                        nodeList: [],
                        nodeVal: [],
                        nodeIdArr: [],
                        nodeLabelArr: [],
                        loading: false
                    })
                }
            );
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            this.el = jexcel(document.getElementById("tableDiv2"), '');
            jexcel.destroy(document.getElementById("tableDiv2"), true);
            this.setState({
                datasetData: {},
                treeList: [],
                treeId: "",
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                levelId: "",
                levelUnit: "",
                nodeList: [],
                nodeVal: [],
                nodeIdArr: [],
                nodeLabelArr: [],
                dataEl: "",
                dataEl2: "",
                loading: false
            })
        }
    }
    /**
     * This function is used to get the tree list
     */
    getTreeList() {
        this.setState({ loading: true })
        var datasetJson = this.state.datasetData;
        var treeList = datasetJson.treeList.filter(c => c.active.toString() == "true");
        var rangeValue = { from: { year: Number(moment(datasetJson.currentVersion.forecastStartDate).startOf('month').format("YYYY")), month: Number(moment(datasetJson.currentVersion.forecastStartDate).startOf('month').format("M")) }, to: { year: Number(moment(datasetJson.currentVersion.forecastStopDate).startOf('month').format("YYYY")), month: Number(moment(datasetJson.currentVersion.forecastStopDate).startOf('month').format("M")) } }
        var treeId = "";
        var event = {
            target: {
                value: ""
            }
        };
        if (treeList.length == 1) {
            treeId = treeList[0].treeId;
            event.target.value = treeList[0].treeId;
        } else if (localStorage.getItem("sesTreeId") != "" && treeList.filter(c => c.treeId == localStorage.getItem("sesTreeId")).length > 0) {
            treeId = localStorage.getItem("sesTreeId");
            event.target.value = localStorage.getItem("sesTreeId");
        }
        this.setState({
            treeList: treeList,
            rangeValue: rangeValue,
            loading: false
        }, () => {
            this.setTreeId(event);
        })
    }
    /**
     * This function is used to set the tree Id selected by the user
     * @param {*} e This is the event value
     */
    setTreeId(e) {
        this.setState({ loading: true })
        var treeId = e.target.value;
        localStorage.setItem("sesTreeId", treeId);
        if (treeId > 0) {
            this.setState({
                treeId: treeId,
                loading: false,
            }, () => {
                this.getScenarioList()
            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            this.el = jexcel(document.getElementById("tableDiv2"), '');
            jexcel.destroy(document.getElementById("tableDiv2"), true);
            this.setState({
                treeId: treeId,
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                dataEl: "",
                dataEl2: "",
                levelId: "",
                levelUnit: "",
                nodeList: [],
                nodeVal: [],
                nodeIdArr: [],
                nodeLabelArr: [],
                loading: false
            })
        }
    }
    /**
     * This function is used to get the list of scenarios for a tree
     */
    getScenarioList() {
        this.setState({ loading: true })
        var treeList = this.state.treeList;
        if (this.state.treeId > 0) {
            var treeListFiltered = treeList.filter(c => c.treeId == this.state.treeId)[0];
            var levelList = [...new Set(treeListFiltered.tree.flatList.map(ele => (ele.level)))]
            if (treeListFiltered.tree.flatList.filter(c => c.payload.nodeType.id == 4).length > 0) {
                levelList.push(-1);
            }
            if (treeListFiltered.tree.flatList.filter(c => c.payload.nodeType.id == 5).length > 0) {
                levelList.push(-2);
            }
            var scenarioList = treeListFiltered.scenarioList.filter(c => c.active.toString() == "true");
            var scenarioId = "";
            var event = {
                target: {
                    value: ""
                }
            };
            if (scenarioList.length == 1) {
                scenarioId = scenarioList[0].id;
                event.target.value = scenarioList[0].id;
            } else if (localStorage.getItem("sesScenarioId") != "" && scenarioList.filter(c => c.id == localStorage.getItem("sesScenarioId")).length > 0) {
                scenarioId = localStorage.getItem("sesScenarioId");
                event.target.value = localStorage.getItem("sesScenarioId");
            }
            var levelId = "";
            var levelEvent = {
                target: {
                    value: ""
                }
            };
            if (levelList.length == 1) {
                levelId = levelList[0];
                levelEvent.target.value = levelList[0];
            } else if (localStorage.getItem("sesLevelId") != "" && levelList.filter(c => c == localStorage.getItem("sesLevelId")).length > 0) {
                levelId = localStorage.getItem("sesLevelId");
                levelEvent.target.value = localStorage.getItem("sesLevelId");
            }
            this.setState({
                scenarioList: treeListFiltered.scenarioList.filter(c => c.active.toString() == "true"),
                levelList: levelList,
                treeListFiltered: treeListFiltered,
                loading: false
            }, () => {
                this.setScenarioId(event);
                this.setLevelId(levelEvent);
            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            this.el = jexcel(document.getElementById("tableDiv2"), '');
            jexcel.destroy(document.getElementById("tableDiv2"), true);
            this.setState({
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                dataEl: "",
                dataEl2: "",
                levelId: "",
                levelUnit: "",
                nodeList: [],
                nodeVal: [],
                nodeIdArr: [],
                nodeLabelArr: [],
                loading: false,
            })
        }
    }
    /**
     * This function is used to set the scenario Id selected by the user
     * @param {*} e This is the event value
     */
    setScenarioId(e) {
        this.setState({ loading: true })
        var scenarioId = e.target.value;
        localStorage.setItem("sesScenarioId", scenarioId);
        if (scenarioId != "") {
            this.setState({
                scenarioId: scenarioId,
                loading: false
            }, () => {
                this.getData()
            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            this.el = jexcel(document.getElementById("tableDiv2"), '');
            jexcel.destroy(document.getElementById("tableDiv2"), true);
            this.setState({
                scenarioId: scenarioId,
                loading: false,
                dataEl: "",
                dataEl2: ""
            })
        }
    }
    /**
     * This function is used to set the dataset(program) Id selected by the user
     * @param {*} e This is the event value
     */
    setDatasetId(e) {
        this.setState({ loading: true })
        var datasetId = e.target.value;
        localStorage.setItem("sesLiveDatasetId", datasetId);
        if (datasetId > 0) {
            this.setState({
                datasetId: datasetId,
                loading: false
            }, () => {
                this.getVersionList();
            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            this.el = jexcel(document.getElementById("tableDiv2"), '');
            jexcel.destroy(document.getElementById("tableDiv2"), true);
            this.setState({
                datasetId: datasetId,
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                dataEl: "",
                dataEl2: "",
                levelId: "",
                levelUnit: "",
                nodeList: [],
                nodeVal: [],
                nodeIdArr: [],
                nodeLabelArr: [],
                treeList: [],
                treeId: "",
                versionList: [],
                versionId: "",
                loading: false
            })
        }
    }
    /**
     * This function is used to build the modeling validation data in tabular format
     */
    getData() {
        if (this.state.scenarioId > 0 && this.state.levelId != "" && this.state.nodeVal.length > 0) {
            this.setState({
                loading: true,
                show: true
            })
            var datasetData = this.state.datasetData;
            var treeList = datasetData.treeList;
            var tree = treeList.filter(c => c.treeId == this.state.treeId)[0];
            var flatList = tree.tree.flatList;
            var rangeValue = this.state.rangeValue;
            let startDate;
            let stopDate;
            if (this.state.xAxisDisplayBy > 2 && this.state.xAxisDisplayBy < 9) {
                startDate = rangeValue.from.year - 1 + '-' + rangeValue.from.month + '-01';
                stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
            } else if (this.state.xAxisDisplayBy > 8) {
                startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
                stopDate = rangeValue.to.year + 1 + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
            } else {
                startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
                stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
            }
            var displayBy = this.state.displayBy;
            var monthList = [];
            var curDate = startDate;
            for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
                curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                monthList.push(curDate)
            }
            let columns = [];
            let columns2 = [];
            columns.push({ title: this.state.xAxisDisplayBy == 1 ? i18n.t('static.inventoryDate.inventoryReport') : this.state.xAxisDisplayBy == 2 ? i18n.t('static.modelingValidation.calendarYear') : i18n.t('static.modelingValidation.fiscalYear'), type: 'calendar', options: { format: this.state.xAxisDisplayBy == 1 ? JEXCEL_MONTH_PICKER_FORMAT : "YYYY", type: 'year-month-picker' } });
            columns2.push({ title: i18n.t('static.inventoryDate.inventoryReport'), type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' } });
            var nodeVal = [...new Set(this.state.nodeVal.map(ele => (ele.label)))];
            for (var k = 0; k < nodeVal.length; k++) {
                columns.push({ title: nodeVal[k], type: displayBy == 1 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,##.00 %', decimal: '.' });
                columns2.push({ title: nodeVal[k], type: displayBy == 1 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,##.00 %', decimal: '.' });
            }
            columns.push({ title: i18n.t('static.supplyPlan.total'), type: displayBy == 1 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,## %' });
            columns2.push({ title: i18n.t('static.supplyPlan.total'), type: displayBy == 1 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,## %' });
            for (var k = 0; k < nodeVal.length; k++) {
                columns.push({ title: nodeVal[k], type: displayBy == 2 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,##.00 %', decimal: '.' });
                columns2.push({ title: nodeVal[k], type: displayBy == 2 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,##.00 %', decimal: '.' });
            }
            columns.push({ title: i18n.t('static.supplyPlan.total'), type: displayBy == 2 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,## %' });
            columns2.push({ title: i18n.t('static.supplyPlan.total'), type: displayBy == 2 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,## %' });
            var data = [];
            var dataArr = [];
            var dataArr2 = [];
            var nodeVal = [...new Set(this.state.nodeVal.map(ele => (ele.label)))];
            if (this.state.xAxisDisplayBy == 1) {
                for (var j = 0; j < monthList.length; j++) {
                    data = [];
                    data[0] = moment(monthList[j]).format("YYYY-MM-DD");
                    var total = 0;
                    var totalPer = 0;
                    for (var k = 0; k < nodeVal.length; k++) {
                        var flatListFiltered = flatList.filter(c => getLabelText(c.payload.label, this.state.lang) == nodeVal[k] && (this.state.levelId == -1 ? c.payload.nodeType.id == 4 : this.state.levelId == -2 ? c.payload.nodeType.id == 5 : c.level == this.state.levelId));
                        var calculatedValueTotal = 0;
                        for (var fl = 0; fl < flatListFiltered.length; fl++) {
                            var nodeMomList = flatListFiltered[fl].payload.nodeDataMap[this.state.scenarioId][0].nodeDataMomList;
                            var checkIfPuNode = flatList.filter(c => c.id == flatListFiltered[fl].id)[0].payload.nodeType.id;
                            var cvList = nodeMomList != undefined ? nodeMomList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(monthList[j]).format("YYYY-MM-DD")) : [];
                            if (cvList.length > 0) {
                                calculatedValueTotal += (checkIfPuNode == 5 ? cvList[0].calculatedMmdValue : cvList[0].calculatedValue);
                            } else {
                            }
                        }
                        data[k + 1] = calculatedValueTotal != "" ? Number(calculatedValueTotal).toFixed(2) : "";
                        total += Number(calculatedValueTotal);
                    }
                    data[nodeVal.length + 1] = Number(total) == 0 ? "" : Number(total).toFixed(2);
                    for (var k = 0; k < nodeVal.length; k++) {
                        var flatListFiltered = flatList.filter(c => getLabelText(c.payload.label, this.state.lang) == nodeVal[k] && (this.state.levelId == -1 ? c.payload.nodeType.id == 4 : this.state.levelId == -2 ? c.payload.nodeType.id == 5 : c.level == this.state.levelId));
                        var calculatedValueTotal = 0;
                        for (var fl = 0; fl < flatListFiltered.length; fl++) {
                            var nodeMomList = flatListFiltered[fl].payload.nodeDataMap[this.state.scenarioId][0].nodeDataMomList;
                            var checkIfPuNode = flatList.filter(c => c.id == flatListFiltered[fl].id)[0].payload.nodeType.id;
                            var cvList = nodeMomList != undefined ? nodeMomList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(monthList[j]).format("YYYY-MM-DD")) : [];
                            if (cvList.length > 0) {
                                calculatedValueTotal += checkIfPuNode == 5 ? cvList[0].calculatedMmdValue : cvList[0].calculatedValue;
                            } else {
                            }
                        }
                        var val = ""
                        if (calculatedValueTotal != "") {
                            val = (Number(calculatedValueTotal) / Number(total)) * 100;
                        }
                        data[nodeVal.length + 1 + k + 1] = val != "" ? Number(val).toFixed(2) : 0;
                        totalPer += calculatedValueTotal != "" ? val : 0;
                    }
                    data[nodeVal.length + 1 + nodeVal.length + 1] = totalPer != 0 ? Number(totalPer).toFixed(2) : 0;
                    dataArr.push(data);
                }
            } else {
                let mL = this.state.xAxisDisplayBy == 9 ? monthList.length - 12 : monthList.length;
                for (var j = 0; j < mL; j += 12) {
                    data = [];
                    if (this.state.xAxisDisplayBy > 2 && this.state.xAxisDisplayBy < 9) {
                        data[0] = moment(monthList[j]).add(12, "months").format("YYYY-MM-DD");
                    } else {
                        data[0] = moment(monthList[j]).format("YYYY-MM-DD");
                    }
                    var total = 0;
                    var totalPer = 0;
                    for (var k = 0; k < nodeVal.length; k++) {
                        var flatListFiltered = flatList.filter(c => getLabelText(c.payload.label, this.state.lang) == nodeVal[k] && (this.state.levelId == -1 ? c.payload.nodeType.id == 4 : this.state.levelId == -2 ? c.payload.nodeType.id == 5 : c.level == this.state.levelId));
                        var calculatedValueTotal = 0;
                        for (var fl = 0; fl < flatListFiltered.length; fl++) {
                            var nodeMomList = flatListFiltered[fl].payload.nodeDataMap[this.state.scenarioId][0].nodeDataMomList;
                            var checkIfPuNode = flatList.filter(c => c.id == flatListFiltered[fl].id)[0].payload.nodeType.id;
                            var cvList = nodeMomList != undefined ? nodeMomList.filter(c => moment(c.month).isBetween(moment(monthList[j]), moment(monthList[j]).add(12, "months"), null, '[)')) : [];
                            if (cvList.length > 0) {
                                calculatedValueTotal += (checkIfPuNode == 5 ? cvList.reduce((accumulator, currentValue) => currentValue.calculatedMmdValue == "" ? accumulator : accumulator + Number(currentValue.calculatedMmdValue), 0) : cvList.reduce((accumulator, currentValue) => currentValue.calculatedValue == "" ? accumulator : accumulator + Number(currentValue.calculatedValue), 0));
                            } else {
                            }
                        }
                        data[k + 1] = calculatedValueTotal != "" ? Number(calculatedValueTotal).toFixed(2) : "";
                        total += Number(calculatedValueTotal);
                    }
                    data[nodeVal.length + 1] = Number(total) == 0 ? "" : Number(total).toFixed(2);
                    for (var k = 0; k < nodeVal.length; k++) {
                        var flatListFiltered = flatList.filter(c => getLabelText(c.payload.label, this.state.lang) == nodeVal[k] && (this.state.levelId == -1 ? c.payload.nodeType.id == 4 : this.state.levelId == -2 ? c.payload.nodeType.id == 5 : c.level == this.state.levelId));
                        var calculatedValueTotal = 0;
                        for (var fl = 0; fl < flatListFiltered.length; fl++) {
                            var nodeMomList = flatListFiltered[fl].payload.nodeDataMap[this.state.scenarioId][0].nodeDataMomList;
                            var checkIfPuNode = flatList.filter(c => c.id == flatListFiltered[fl].id)[0].payload.nodeType.id;
                            var cvList = nodeMomList != undefined ? nodeMomList.filter(c => moment(c.month).isBetween(moment(monthList[j]), moment(monthList[j]).add(12, "months"), null, '[)')) : [];
                            if (cvList.length > 0) {
                                calculatedValueTotal += checkIfPuNode == 5 ? cvList.reduce((accumulator, currentValue) => currentValue.calculatedMmdValue == "" ? accumulator : accumulator + Number(currentValue.calculatedMmdValue), 0) : cvList.reduce((accumulator, currentValue) => currentValue.calculatedValue == "" ? accumulator : accumulator + Number(currentValue.calculatedValue), 0);
                            } else {
                            }
                        }
                        var val = ""
                        if (calculatedValueTotal != "") {
                            val = (Number(calculatedValueTotal) / Number(total)) * 100;
                        }
                        data[nodeVal.length + 1 + k + 1] = val != "" ? Number(val).toFixed(2) : 0;
                        totalPer += calculatedValueTotal != "" ? val : 0;
                    }
                    data[nodeVal.length + 1 + nodeVal.length + 1] = totalPer != 0 ? Number(totalPer).toFixed(2) : 0;
                    dataArr.push(data);
                }
                for (var j = 0; j < monthList.length; j++) {
                    data = [];
                    data[0] = moment(monthList[j]).format("YYYY-MM-DD");
                    var total = 0;
                    var totalPer = 0;
                    for (var k = 0; k < nodeVal.length; k++) {
                        var flatListFiltered = flatList.filter(c => getLabelText(c.payload.label, this.state.lang) == nodeVal[k] && (this.state.levelId == -1 ? c.payload.nodeType.id == 4 : this.state.levelId == -2 ? c.payload.nodeType.id == 5 : c.level == this.state.levelId));
                        var calculatedValueTotal = 0;
                        for (var fl = 0; fl < flatListFiltered.length; fl++) {
                            var nodeMomList = flatListFiltered[fl].payload.nodeDataMap[this.state.scenarioId][0].nodeDataMomList;
                            var checkIfPuNode = flatList.filter(c => c.id == flatListFiltered[fl].id)[0].payload.nodeType.id;
                            var cvList = nodeMomList != undefined ? nodeMomList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(monthList[j]).format("YYYY-MM-DD")) : [];
                            if (cvList.length > 0) {
                                calculatedValueTotal += (checkIfPuNode == 5 ? cvList[0].calculatedMmdValue : cvList[0].calculatedValue);
                            } else {
                            }
                        }
                        data[k + 1] = calculatedValueTotal != "" ? Number(calculatedValueTotal).toFixed(2) : "";
                        total += Number(calculatedValueTotal);
                    }
                    data[nodeVal.length + 1] = Number(total) == 0 ? "" : Number(total).toFixed(2);
                    for (var k = 0; k < nodeVal.length; k++) {
                        var flatListFiltered = flatList.filter(c => getLabelText(c.payload.label, this.state.lang) == nodeVal[k] && (this.state.levelId == -1 ? c.payload.nodeType.id == 4 : this.state.levelId == -2 ? c.payload.nodeType.id == 5 : c.level == this.state.levelId));
                        var calculatedValueTotal = 0;
                        for (var fl = 0; fl < flatListFiltered.length; fl++) {
                            var nodeMomList = flatListFiltered[fl].payload.nodeDataMap[this.state.scenarioId][0].nodeDataMomList;
                            var checkIfPuNode = flatList.filter(c => c.id == flatListFiltered[fl].id)[0].payload.nodeType.id;
                            var cvList = nodeMomList != undefined ? nodeMomList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(monthList[j]).format("YYYY-MM-DD")) : [];
                            if (cvList.length > 0) {
                                calculatedValueTotal += checkIfPuNode == 5 ? cvList[0].calculatedMmdValue : cvList[0].calculatedValue;
                            } else {
                            }
                        }
                        var val = ""
                        if (calculatedValueTotal != "") {
                            val = (Number(calculatedValueTotal) / Number(total)) * 100;
                        }
                        data[nodeVal.length + 1 + k + 1] = val != "" ? Number(val).toFixed(2) : 0;
                        totalPer += calculatedValueTotal != "" ? val : 0;
                    }
                    data[nodeVal.length + 1 + nodeVal.length + 1] = totalPer != 0 ? Number(totalPer).toFixed(2) : 0;
                    dataArr2.push(data);
                }
            }
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            this.el = jexcel(document.getElementById("tableDiv2"), '');
            jexcel.destroy(document.getElementById("tableDiv2"), true);
            var json = [];
            var options = {
                data: dataArr,
                columnDrag: false,
                colHeaderClasses: ["Reqasterisk"],
                columns: columns,
                onload: this.loaded,
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
                filters: true,
                license: JEXCEL_PRO_KEY,
                contextMenu: function (obj, x, y, e) {
                    return [];
                }.bind(this),
            };
            var dataEl = jexcel(document.getElementById("tableDiv"), options);
            this.el = dataEl;
            var options2 = {
                data: dataArr2,
                columnDrag: false,
                colHeaderClasses: ["Reqasterisk"],
                columns: columns2,
                onload: this.loaded,
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
                filters: true,
                license: JEXCEL_PRO_KEY,
                contextMenu: function (obj, x, y, e) {
                    return [];
                }.bind(this),
            };
            var dataEl2 = jexcel(document.getElementById("tableDiv2"), options2);
            this.el = dataEl2;
            this.setState({
                nodeDataModelingList: [{}],
                monthList: monthList,
                dataEl: dataEl,
                dataEl2: dataEl2,
                loading: false,
                show: true,
                columns: columns,
                columns2: columns2
            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            this.el = jexcel(document.getElementById("tableDiv2"), '');
            jexcel.destroy(document.getElementById("tableDiv2"), true);
            this.setState({
                nodeDataModelingList: [],
                loading: false,
                dataEl: "",
                dataEl2: ""
            })
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }
    /**
     * This function is used to set the level Id selected by the user
     * @param {*} e This is the event value
     */
    setLevelId(e) {
        this.setState({ loading: true })
        var levelId = e.target.value;
        localStorage.setItem("sesLevelId", levelId);
        var levelUnit = "";
        if (levelId !== "") {
            var treeListFiltered = this.state.treeListFiltered;
            var flatDataForLevel = [];
            if (levelId == -1) {
                flatDataForLevel = treeListFiltered.tree.flatList.filter(c => c.payload.nodeType.id == 4);
            } else if (levelId == -2) {
                flatDataForLevel = treeListFiltered.tree.flatList.filter(c => c.payload.nodeType.id == 5);
            } else {
                flatDataForLevel = treeListFiltered.tree.flatList.filter(c => c.level == levelId);
            }
            var flatData = flatDataForLevel[0];
            var levelListFilter = treeListFiltered.levelList != undefined ? treeListFiltered.levelList.filter(c => c.levelNo == levelId)[0] : undefined;
            levelUnit = levelListFilter != undefined && levelListFilter.unit != null ? getLabelText(levelListFilter.unit.label, this.state.lang) : "";
            var nodeList = [];
            var nodeVal = [];
            var nodeIdArr = [];
            var nodeLabelArr = [];
            for (var fdfl = 0; fdfl < flatDataForLevel.length; fdfl++) {
                if (nodeList.findIndex(c => c.label == getLabelText(flatDataForLevel[fdfl].payload.label, this.state.lang)) == -1) {
                    nodeList.push({
                        value: flatDataForLevel[fdfl].id,
                        label: getLabelText(flatDataForLevel[fdfl].payload.label, this.state.lang)
                    })
                    nodeVal.push({
                        value: flatDataForLevel[fdfl].id,
                        label: getLabelText(flatDataForLevel[fdfl].payload.label, this.state.lang)
                    })
                    nodeIdArr.push(flatDataForLevel[fdfl].id)
                    nodeLabelArr.push(getLabelText(flatDataForLevel[fdfl].payload.label, this.state.lang))
                }
            }
            this.setState({
                levelId: levelId,
                levelUnit: levelUnit != null ? levelUnit : "",
                nodeList: nodeList.sort(function (a, b) {
                    a = a.label.toLowerCase();
                    b = b.label.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                }),
                nodeIdArr: nodeIdArr,
                nodeLabelArr: nodeLabelArr,
                nodeVal: nodeVal,
                loading: false
            }, () => {
                this.getData();
            })
        } else {
            this.setState({
                levelId: levelId,
                levelUnit: "",
                nodeList: [],
                nodeIdArr: [],
                nodeLabelArr: [],
                nodeVal: [],
                loading: false
            }, () => {
                this.getData()
            })
        }
    }
    /**
     * This function is used to get the version list based on dataset(program) Id
     */
    getVersionList() {
        this.setState({
            loading: true
        })
        var datasetList = this.state.datasetList;
        if (this.state.datasetId > 0) {
            var selectedDataset = datasetList.filter(c => c.id == this.state.datasetId)[0];
            var versionList = [];
            var vList = selectedDataset.versionList;
            var onlineVersionList = vList.filter(c => !c.versionId.toString().includes("Local")).sort(function (a, b) {
                a = a.versionId;
                b = b.versionId;
                return a > b ? -1 : a < b ? 1 : 0;
            });
            var offlineVersionList = vList.filter(c => c.versionId.toString().includes("Local")).sort(function (a, b) {
                a = a.versionId.split(" ")[0];
                b = b.versionId.split(" ")[0];
                return a > b ? -1 : a < b ? 1 : 0;
            });
            var newVList = offlineVersionList.concat(onlineVersionList)
            for (var v = 0; v < newVList.length; v++) {
                versionList.push({ versionId: newVList[v].versionId, createdDate: newVList[v].createdDate })
            }
            var versionId = "";
            var event = {
                target: {
                    value: ""
                }
            };
            if (versionList.length == 1) {
                versionId = versionList[0].versionId;
                event.target.value = versionList[0].versionId;
            } else if (localStorage.getItem("sesDatasetVersionId") != "" && versionList.filter(c => c.versionId == localStorage.getItem("sesDatasetVersionId")).length > 0) {
                versionId = localStorage.getItem("sesDatasetVersionId");
                event.target.value = localStorage.getItem("sesDatasetVersionId");
            }
            this.setState({
                versionList: versionList,
                loading: false
            }, () => {
                this.setVersionId(event)
            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            this.el = jexcel(document.getElementById("tableDiv2"), '');
            jexcel.destroy(document.getElementById("tableDiv2"), true);
            this.setState({
                versionList: [],
                versionId: "",
                loading: false,
                treeList: [],
                treeId: "",
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                dataEl: "",
                dataEl2: "",
                levelId: "",
                levelUnit: "",
                nodeList: [],
                nodeVal: [],
                nodeIdArr: [],
                nodeLabelArr: [],
            })
        }
    }
    /**
     * This function is used to get the list of dataset(programs)
     */
    componentDidMount() {
        this.setState({ loading: true });
        ProgramService.getDataSetList().then(response => {
            if (response.status == 200) {
                var responseData = response.data;
                var datasetList = [];
                for (var rd = 0; rd < responseData.length; rd++) {
                    var json = {
                        id: responseData[rd].programId,
                        name: getLabelText(responseData[rd].label, this.state.lang),
                        code: responseData[rd].programCode,
                        versionList: responseData[rd].versionList
                    }
                    datasetList.push(json);
                }
                this.setState({
                    datasetList: datasetList,
                    loading: false
                }, () => {
                    this.getOfflineDatasetList();
                })
            } else {
                this.setState({
                    message: response.data.messageCode, loading: false
                }, () => {
                    this.hideSecondComponent();
                })
            }
        }).catch(
            error => {
                this.getOfflineDatasetList();
            }
        );
    }
    /**
     * This function is used to get the list of datasets that are downloaded by user
     */
    getOfflineDatasetList() {
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
                var unitTransaction = db1.transaction(['unit'], 'readwrite');
                var unitOs = unitTransaction.objectStore('unit');
                var unitRequest = unitOs.getAll();
                unitRequest.onerror = function (event) {
                }.bind(this);
                unitRequest.onsuccess = function (event) {
                    var unitList = unitRequest.result;
                    var myResult = [];
                    myResult = getRequest.result;
                    var datasetList = this.state.datasetList;
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    for (var mr = 0; mr < myResult.length; mr++) {
                        if (myResult[mr].userId == userId) {
                            var index = datasetList.findIndex(c => c.id == myResult[mr].programId);
                            var databytes = CryptoJS.AES.decrypt(myResult[mr].programData, SECRET_KEY);
                            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
                            if (index == -1) {
                                var programNameBytes = CryptoJS.AES.decrypt(myResult[mr].programName, SECRET_KEY);
                                var programNameLabel = programNameBytes.toString(CryptoJS.enc.Utf8);
                                var programNameJson = JSON.parse(programNameLabel)
                                var json = {
                                    id: myResult[mr].programId,
                                    name: getLabelText(programNameJson, this.state.lang),
                                    code: myResult[mr].programCode,
                                    versionList: [{ versionId: myResult[mr].version + "  (Local)", createdDate: programData.currentVersion.createdDate }]
                                }
                                datasetList.push(json)
                            } else {
                                var existingVersionList = datasetList[index].versionList;
                                existingVersionList.push({ versionId: myResult[mr].version + "  (Local)", createdDate: programData.currentVersion.createdDate })
                                datasetList[index].versionList = existingVersionList
                            }
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
                    } else if (localStorage.getItem("sesLiveDatasetId") != "" && datasetList.filter(c => c.id == localStorage.getItem("sesLiveDatasetId")).length > 0) {
                        datasetId = localStorage.getItem("sesLiveDatasetId");
                        event.target.value = localStorage.getItem("sesLiveDatasetId");
                    }
                    this.setState({
                        datasetList: datasetList.sort(function (a, b) {
                            a = a.code.toLowerCase();
                            b = b.code.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }),
                        unitList: unitList,
                        loading: false
                    }, () => {
                        this.setDatasetId(event);
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
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
                    month: this.state.rangeValue.from.month,
                },
                to: {
                    year: value[1].year(),
                    month: this.state.rangeValue.to.month,
                }
            }
        }
        this.setState({ rangeValue: val }, () => {
            this.getData()
        })
    }
    /**
     * This function is used to set the value of the data range that is selected by the user
     * @param {*} value This is the value of the daterange selected by the user
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.getData()
        })
    }
    /**
     * This function is called to show the date range picker
     * @param {*} e 
     */
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    /**
     * This function is used to add the double quotes to the row
     * @param {*} arr This is the arr of the row elements
     * @returns This function returns the row with double quotes
     */
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    /**
     * This function is used to format a number
     * @param {*} value This is the value that needs to be formatted
     * @returns This function returns the formatted value
     */
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
    /**
     * This function is used to export the data in PDF format
     */
    exportPDF() {
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
                doc.text(this.state.datasetData.programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text), doc.internal.pageSize.width - 40, 50, {
                    align: 'right'
                })
                doc.text(document.getElementById("datasetId").selectedOptions[0].text, doc.internal.pageSize.width - 40, 60, {
                    align: 'right'
                })
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.modelingValidation'), doc.internal.pageSize.width / 2, 60, {
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
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal')
        doc.setTextColor("#002f6c");
        var y = 110;
        var planningText = doc.splitTextToSize(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize(i18n.t('static.common.treeName') + ' : ' + document.getElementById("treeId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize(i18n.t('static.whatIf.scenario') + ' : ' + document.getElementById("scenarioId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize(i18n.t('static.modelingValidation.levelUnit1') + ' : ' + document.getElementById("levelId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize(i18n.t('static.common.node') + ' : ' + this.state.nodeLabelArr.join('; '), doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }
        planningText = doc.splitTextToSize(i18n.t('static.modelingValidation.xAxisDisplay') + ' : ' + document.getElementById("xAxisDisplayBy").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }
        let rVFrom = this.state.xAxisDisplayBy == 1 ? this.makeText(this.state.rangeValue.from) : this.state.rangeValue.from.year;
        let rVTo = this.state.xAxisDisplayBy == 1 ? this.makeText(this.state.rangeValue.to) : this.state.rangeValue.to.year;
        planningText = doc.splitTextToSize(i18n.t('static.report.dateRange') + ' : ' + rVFrom + ' ~ ' + rVTo, doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }
        y = y + 10;
        doc.text(i18n.t('static.modelingValidation.yAxisDisplay') + ' : ' + document.getElementById("displayBy").selectedOptions[0].text, doc.internal.pageSize.width / 20, y, {
            align: 'left'
        })
        y = y + 10;
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
        if (startYtable > (height - 400)) {
            doc.addPage()
            startYtable = 80
        }
        doc.addImage(canvasImg, 'png', 50, startYtable, 750, 260, 'CANVAS');
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
                        if (this.state.xAxisDisplayBy == 1)
                            dataArr.push(moment(ele[idx]).format(DATE_FORMAT_CAP_WITHOUT_DATE));
                        else
                            dataArr.push(moment(ele[idx]).format("YYYY"));
                    } else {
                        dataArr.push(ele[idx]);
                    }
                }
            })
            dataArr1.push(dataArr);
        })
        const data = dataArr1;
        doc.addPage()
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: startYtable,
            head: [columns],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', overflow: "hidden" }
        };
        doc.autoTable(content);
        if (this.state.xAxisDisplayBy > 1) {
            var columns2 = [];
            this.state.columns2.filter(c => c.type != 'hidden').map((item, idx) => { columns2.push(item.title) });
            var dataArr = [];
            var dataArr1 = [];
            this.state.dataEl2.getJson(null, false).map(ele => {
                dataArr = [];
                this.state.columns2.map((item, idx) => {
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
            const data2 = dataArr1;
            let content2 = {
                margin: { top: 80, bottom: 50 },
                startY: 40 + doc.autoTable.previous.finalY,
                head: [columns2],
                body: data2,
                styles: { lineWidth: 1, fontSize: 8, halign: 'center', overflow: "hidden" }
            };
            doc.autoTable(content2);
        }
        addHeaders(doc)
        addFooters(doc)
        doc.save(this.state.datasetData.programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.dashboard.modelingValidation') + "-" + document.getElementById("treeId").selectedOptions[0].text + "-" + document.getElementById("scenarioId").selectedOptions[0].text + ".pdf")
    }
    /**
     * This function is used to export the data in CSV format
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + ' : ' + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + ' : ' + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.user.user') + ' : ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (this.state.datasetData.programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (document.getElementById("datasetId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.dashboard.programheader') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.treeName') + ' : ' + document.getElementById("treeId").selectedOptions[0].text).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.whatIf.scenario') + ' : ' + document.getElementById("scenarioId").selectedOptions[0].text).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.modelingValidation.levelUnit1') + ' : ' + document.getElementById("levelId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        this.state.nodeLabelArr.map(ele =>
            csvRow.push('"' + (i18n.t('static.common.node')).replaceAll(' ', '%20') + ' : ' + (ele.toString()).replaceAll(' ', '%20').replaceAll('#', '%23') + '"'))
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.modelingValidation.xAxisDisplay') + ' : ' + document.getElementById("xAxisDisplayBy").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        let rVFrom = this.state.xAxisDisplayBy == 1 ? this.makeText(this.state.rangeValue.from) : this.state.rangeValue.from.year;
        let rVTo = this.state.xAxisDisplayBy == 1 ? this.makeText(this.state.rangeValue.to) : this.state.rangeValue.to.year;
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + rVFrom + ' ~ ' + rVTo).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.modelingValidation.yAxisDisplay') + ' : ' + document.getElementById("displayBy").selectedOptions[0].text).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        this.state.columns.filter(c => c.type != 'hidden').map((item, idx) => { headers[idx] = (item.title).replaceAll(' ', '%20').replaceAll('#', '%23') });
        var A = [this.addDoubleQuoteToRowContent(headers)];
        var B = []
        this.state.dataEl.getJson(null, false).map(ele => {
            B = [];
            this.state.columns.map((item, idx) => {
                if (item.type != 'hidden') {
                    if (item.mask != undefined && item.mask.toString().includes("%")) {
                        B.push((ele[idx] + (" %")).toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll(' ', '%20'));
                    } else if (item.type == 'calendar') {
                        if (this.state.xAxisDisplayBy == 1)
                            B.push(moment(ele[idx]).format(DATE_FORMAT_CAP_WITHOUT_DATE_FOUR_DIGITS).toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll(' ', '%20'));
                        else
                            B.push(moment(ele[idx]).format("YYYY").toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll(' ', '%20'));
                    } else {
                        B.push(ele[idx].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll(' ', '%20'));
                    }
                }
            })
            A.push(this.addDoubleQuoteToRowContent(B));
        })
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        csvRow.push('')
        if (this.state.xAxisDisplayBy > 1) {
            const headers2 = [];
            this.state.columns2.filter(c => c.type != 'hidden').map((item, idx) => { headers2[idx] = (item.title).replaceAll(' ', '%20').replaceAll('#', '%23') });
            var A = [this.addDoubleQuoteToRowContent(headers2)];
            var B = []
            this.state.dataEl2.getJson(null, false).map(ele => {
                B = [];
                this.state.columns2.map((item, idx) => {
                    if (item.type != 'hidden') {
                        if (item.mask != undefined && item.mask.toString().includes("%")) {
                            B.push((ele[idx] + (" %")).toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll(' ', '%20'));
                        } else if (item.type == 'calendar') {
                            if (this.state.xAxisDisplayBy == 1)
                                B.push(moment(ele[idx]).format(DATE_FORMAT_CAP_WITHOUT_DATE_FOUR_DIGITS).toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll(' ', '%20'));
                            else
                                B.push(moment(ele[idx]).format("YYYY").toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll(' ', '%20'));
                        } else {
                            B.push(ele[idx].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll(' ', '%20'));
                        }
                    }
                })
                A.push(this.addDoubleQuoteToRowContent(B));
            })
            for (var i = 0; i < A.length; i++) {
                csvRow.push(A[i].join(","))
            }
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = this.state.datasetData.programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.dashboard.modelingValidation') + "-" + document.getElementById("treeId").selectedOptions[0].text + "-" + document.getElementById("scenarioId").selectedOptions[0].text + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * This is used to display the content
     * @returns The modeling validation data in tabular format along with the different filters
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        var chartOptions = {
            title: {
                display: true,
                text: (this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "") ? i18n.t("static.dashboard.modelingValidation") + " - " + this.state.datasetData.programCode + "~" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + " - " + (document.getElementById("levelId").selectedOptions[0].text) : ""
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.state.levelId != -1 && this.state.levelId != -2 ? this.state.levelUnit : i18n.t('static.dashboard.unit'),
                        fontColor: 'black'
                    },
                    stacked: true,
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black',
                        callback: function (value) {
                            return this.state.displayBy == 1 ? value.toLocaleString() : value.toLocaleString() + " %";
                        }.bind(this)
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    },
                    position: 'left',
                }],
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
                            callback: function (label) {
                                var monthArrayList = [...new Set(this.state.monthList.map(ele => moment(ele).format("MMM-YYYY")))];
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
            maintainAspectRatio: false,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                }
            },
            tooltips: {
                enabled: false,
                custom: CustomTooltips,
                callbacks: {
                    label: function (tooltipItem, data) {
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
                        if (this.state.displayBy == 1) {
                            return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                        } else {
                            return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2 + " %";
                        }
                    }.bind(this)
                }
            },
        }
        let bar = {}
        var datasetListForGraph = [];
        var colourArray = ["#002F6C", "#BA0C2F", "#118B70", "#EDB944", "#A7C6ED", "#651D32", "#6C6463", "#F48521", "#49A4A1", "#212721"]
        if (this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "") {
            var elInstance = this.state.dataEl;
            if (elInstance != undefined && this.state.dataEl != "") {
                var colourCount = 0;
                var nodeValSet = [...new Set(this.state.nodeVal.map(ele => (ele.label)))];
                nodeValSet.map((item, count) => {
                    if (colourCount > 10) {
                        colourCount = 0;
                    }
                    datasetListForGraph.push({
                        label: item,
                        data: this.state.displayBy == 1 ? elInstance.getColumnData([count + 1]) : elInstance.getColumnData([count + nodeValSet.length + 1 + 1]),
                        backgroundColor: colourArray[colourCount],
                        stack: 1,
                    })
                    colourCount++;
                })
            }
        }
        if (this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "") {
            if (this.state.xAxisDisplayBy == 1) {
                bar = {
                    labels: [...new Set(this.state.monthList.map(ele => moment(ele).format("MMM-YYYY")))],
                    datasets: datasetListForGraph
                };
            } else {
                if (this.state.xAxisDisplayBy > 2 && this.state.xAxisDisplayBy < 9) {
                    let arr = [...new Set(this.state.monthList.map(ele => moment(ele).add(12, 'months').format("YYYY")))];
                    arr.pop();
                    bar = {
                        labels: arr,
                        datasets: datasetListForGraph
                    };
                } else if (this.state.xAxisDisplayBy > 8) {
                    let arr = [...new Set(this.state.monthList.map(ele => moment(ele).format("YYYY")))];
                    arr.pop();
                    bar = {
                        labels: arr,
                        datasets: datasetListForGraph
                    };
                } else {
                    bar = {
                        labels: [...new Set(this.state.monthList.map(ele => moment(ele).format("YYYY")))],
                        datasets: datasetListForGraph
                    };
                }
            }
        }
        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.code}
                    </option>
                )
            }, this);
        const { versionList } = this.state;
        let versions = versionList.length > 0
            && versionList.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId} ({(moment(item.createdDate).format(`MMM DD YYYY`))})
                    </option>
                )
            }, this);
        const { treeList } = this.state;
        let trees = treeList.length > 0
            && treeList.map((item, i) => {
                return (
                    <option key={i} value={item.treeId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { scenarioList } = this.state;
        let scenarios = scenarioList.length > 0
            && scenarioList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { levelList } = this.state;
        const levelListForNames = this.state.levelList.length > 0 && this.state.treeListFiltered.levelList != undefined ? this.state.treeListFiltered.levelList : [];
        let levels = levelList.length > 0
            && levelList.map((item, i) => {
                if (item != -1 && item != -2) {
                    var levelListFilter = this.state.treeListFiltered.levelList != undefined ? this.state.treeListFiltered.levelList.filter(c => c.levelNo == item)[0] : undefined;
                    let levelUnit = levelListFilter != undefined && levelListFilter.unit != null ? " (" + getLabelText(levelListFilter.unit.label, this.state.lang) + ")" : "";
                    return (
                        <option key={i} value={item}>
                            {levelListForNames.filter(c => c.levelNo == item).length > 0 ? getLabelText(levelListForNames.filter(c => c.levelNo == item)[0].label, this.state.lang) + levelUnit : i18n.t("static.common.level") + " " + item}
                        </option>
                    )
                } else {
                    return (
                        <option key={i} value={item}>
                            {item == -1 ? i18n.t('static.modelingValidation.fuLevel') : i18n.t('static.modelingValidation.puLevel')}
                        </option>
                    )
                }
            }, this);
        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon pb-2">
                        <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                        <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                        <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href={this.state.datasetId != -1 && this.state.datasetId != "" && this.state.datasetId != undefined ? "/#/dataSet/buildTree/tree/0/" + this.state.datasetId : "/#/dataSet/buildTree"} className="supplyplanformulas">{i18n.t('static.common.managetree')}</a> </span>
                        <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/report/compareAndSelectScenario" className="supplyplanformulas">{i18n.t('static.dashboard.compareAndSelect')}</a> {i18n.t('static.tree.or')} <a href="/#/validation/productValidation" className='supplyplanformulas'>{i18n.t('static.dashboard.productValidation')}</a></span>
                    </div>
                    <div className="card-header-actions pr-lg-3">
                        {this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "" && <img style={{ height: '25px', width: '25px', cursor: 'pointer', float: 'right', marginTop: '3px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
                        <a className="card-header-action" style={{ float: 'right' }}>
                            {this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "" && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />}
                        </a>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0 ">
                        <div>
                            <div ref={ref}>
                                <Form >
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.programheader')}</Label>
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
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.version')}</Label>
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
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {versions}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.forecastMethod.tree')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="treeId"
                                                            id="treeId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.setTreeId(e); }}
                                                            value={this.state.treeId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {trees}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.whatIf.scenario')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="scenarioId"
                                                            id="scenarioId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.setScenarioId(e); }}
                                                            value={this.state.scenarioId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {scenarios}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <div>
                                                <Popover placement="top" isOpen={this.state.popoverOpenLevelFeild} target="Popover5" trigger="hover" toggle={this.toggleLevelFeild}>
                                                    <PopoverBody>{i18n.t('static.Tooltip.levelModelingValdation')}</PopoverBody>
                                                </Popover>
                                            </div>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.modelingValidation.levelUnit1')}<i class="fa fa-info-circle icons pl-lg-2" id="Popover5" onClick={this.toggleLevelFeild} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="levelId"
                                                            id="levelId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.setLevelId(e); }}
                                                            value={this.state.levelId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {levels}
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.node')}</Label>
                                                <span className="reportdown-box-icon fa fa-angle-down ml-1"></span>
                                                <div className="controls svgdropdown">
                                                    <MultiSelect
                                                        name="nodeId"
                                                        id="nodeId"
                                                        filterOptions={filterOptions}
                                                        options={this.state.nodeList && this.state.nodeList.length > 0 ? this.state.nodeList : []}
                                                        value={this.state.nodeVal}
                                                        onChange={(e) => { this.setNodeVal(e) }}
                                                        labelledBy={i18n.t('static.common.select')}
                                                    />
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.modelingValidation.xAxisDisplay')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="xAxisDisplayBy"
                                                            id="xAxisDisplayBy"
                                                            bsSize="sm"
                                                            value={this.state.xAxisDisplayBy}
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
                                            <FormGroup className="col-md-3 pickerRangeBox">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}
                                                    <span className="stock-box-icon ModelingIcon fa fa-angle-down ml-1"></span>
                                                </Label>
                                                {(this.state.xAxisDisplayBy == 1 || this.state.xAxisDisplayBy == "") && (
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
                                                )}
                                                {(this.state.xAxisDisplayBy == 2) && (
                                                    <div className="controls box">
                                                        <RangePicker
                                                            picker="year"
                                                            allowClear={false}
                                                            id="date"
                                                            name="date"
                                                            onChange={this.handleYearRangeChange}
                                                            value={[
                                                                moment(rangeValue.from.year.toString()),
                                                                moment(rangeValue.to.year.toString()),
                                                            ]}
                                                        />
                                                    </div>
                                                )}
                                                {(this.state.xAxisDisplayBy != 1 && this.state.xAxisDisplayBy != 2) && (
                                                    <div className="controls box">
                                                        <RangePicker
                                                            picker="year"
                                                            allowClear={false}
                                                            id="date"
                                                            name="date"
                                                            onChange={this.handleYearRangeChange}
                                                            value={[
                                                                moment(rangeValue.from.year.toString()),
                                                                moment(rangeValue.to.year.toString()),
                                                            ]}
                                                        />
                                                    </div>
                                                )}
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.modelingValidation.yAxisDisplay')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="displayBy"
                                                            id="displayBy"
                                                            bsSize="sm"
                                                            value={this.state.displayBy}
                                                            onChange={(e) => { this.setDisplayBy(e); }}
                                                        >
                                                            <option value="1">{i18n.t('static.modelingValidation.number')}</option>
                                                            <option value="2">{i18n.t('static.whatIf.percentage')}</option>
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>
                                <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div className="row">
                                        {this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != ""
                                            &&
                                            <div className="col-md-12 p-0">
                                                <div className="col-md-12">
                                                    <div className="chart-wrapper chart-graph-report">
                                                        <Bar id="cool-canvas" data={bar} options={chartOptions} />
                                                        <div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <button className="mr-1 mb-2 float-right btn btn-info btn-md" onClick={this.toggledata}>
                                                        {this.state.show ? i18n.t('static.common.hideData') : i18n.t('static.common.showData')}
                                                    </button>
                                                </div>
                                            </div>}
                                    </div>
                                    <div className="row">
                                        <div className="pl-0 pr-0 ModelingValidationTable ModelingTableMargin TableWidth100">
                                            <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: this.state.show && !this.state.loading ? "block" : "none" }}>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row displayBlock">
                                        <div className="pl-0 pr-0 ModelingValidationTable ModelingTableMargin">
                                            <div id="tableDiv2" className="jexcelremoveReadonlybackground consumptionDataEntryTable TableWidth100" style={{ display: this.state.show && !this.state.loading && this.state.xAxisDisplayBy > 1 ? "block" : "none" }}>
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
export default ModelingValidation;