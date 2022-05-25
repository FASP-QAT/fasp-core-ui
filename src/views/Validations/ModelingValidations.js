import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import { MultiSelect } from "react-multi-select-component";
import {
    Card,
    CardBody,
    Col,
    Table, FormGroup, Input, InputGroup,PopoverBody, Popover, Label, Form
} from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import i18n from '../../i18n'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { DATE_FORMAT_CAP_WITHOUT_DATE, SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, JEXCEL_PRO_KEY, JEXCEL_PAGINATION_OPTION, JEXCEL_MONTH_PICKER_FORMAT, DATE_FORMAT_CAP, TITLE_FONT } from '../../Constants.js'
import moment from "moment";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import "jspdf-autotable";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import getLabelText from '../../CommonComponent/getLabelText'
import CryptoJS from 'crypto-js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import ProgramService from '../../api/ProgramService';
import DatasetService from '../../api/DatasetService';
import jsPDF from "jspdf";
import { LOGO } from '../../CommonComponent/Logo';
import AuthenticationService from '../Common/AuthenticationService';

const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}


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
            show: false
        };
        this.toggleLevelFeild = this.toggleLevelFeild.bind(this);
        this.setDatasetId = this.setDatasetId.bind(this);
        this.getOfflineDatasetList = this.getOfflineDatasetList.bind(this);
        this.getVersionList = this.getVersionList.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.getTreeList = this.getTreeList.bind(this);
        this.getDatasetData = this.getDatasetData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.toggledata = this.toggledata.bind(this)
    }

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

    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    toggledata() {
        var show = this.state.show;
        this.setState({
            show: !show
        })
    }
    toggleLevelFeild() {
        this.setState({
            popoverOpenLevelFeild: !this.state.popoverOpenLevelFeild,
        });
    }

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
            this.el.destroy();
            this.setState({
                versionId: versionId,
                datasetData: {},
                treeList: [],
                treeId: "",
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                dataEl: "",
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
                    this.el.destroy();
                    this.setState({
                        datasetData: {},
                        treeList: [],
                        treeId: "",
                        scenarioList: [],
                        scenarioId: "",
                        levelList: [],
                        dataEl: "",
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
            this.el.destroy();
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
                loading: false
            })
        }
    }

    getTreeList() {
        this.setState({ loading: true })
        var datasetJson = this.state.datasetData;
        var treeList = datasetJson.treeList.filter(c => c.active.toString() == "true");
        var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
        var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
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
            // if (treeId != "") {
            this.setTreeId(event);
            // }else{

            // }
        })

    }

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
            this.el.destroy();
            this.setState({
                treeId: treeId,
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                dataEl: "",
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
            var scenarioList = treeListFiltered.scenarioList;
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
                // if (scenarioId != "") {
                this.setScenarioId(event);
                // }
                // if (levelId != "") {
                this.setLevelId(levelEvent);
                // }

            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            this.el.destroy();
            this.setState({
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                dataEl: "",
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
            this.el.destroy();
            this.setState({
                scenarioId: scenarioId,
                loading: false,
                dataEl: ""
            })
        }
    }

    getOtherFiltersData() {

    }

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
            this.el.destroy();
            this.setState({
                datasetId: datasetId,
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                dataEl: "",
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
            // var nodeDataModelingList = datasetData.nodeDataModelingList;
            var nodeIdArr = this.state.nodeIdArr;
            var rangeValue = this.state.rangeValue;
            var displayBy = this.state.displayBy;
            let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
            let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
            // var nodeDataModelingListFilter = nodeDataModelingList.filter(c => nodeIdArr.includes(c.id) && c.scenarioId == this.state.scenarioId && moment(c.month).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.month).format("YYYY-MM-DD") <= moment(stopDate).format("YYYY-MM-DD"));
            // var monthList = [...new Set(nodeDataModelingListFilter.map(ele => (ele.month)))];
            var monthList = [];
            var curDate = startDate;
            for (var i = 0; moment(curDate).format("YYYY-MM") < moment(stopDate).format("YYYY-MM"); i++) {
                curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                monthList.push(curDate)
            }
            let columns = [];
            columns.push({ title: i18n.t('static.inventoryDate.inventoryReport'), type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, readOnly: true });
            var nodeVal = [...new Set(this.state.nodeVal.map(ele => (ele.label)))];
            for (var k = 0; k < nodeVal.length; k++) {
                columns.push({ title: nodeVal[k], readOnly: true, type: displayBy == 1 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,##.00 %', decimal: '.' });
            }
            columns.push({ title: i18n.t('static.supplyPlan.total'), readOnly: true, type: displayBy == 1 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,## %' });
            for (var k = 0; k < nodeVal.length; k++) {
                columns.push({ title: nodeVal[k], readOnly: true, type: displayBy == 2 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,##.00 %', decimal: '.' });
            }
            columns.push({ title: i18n.t('static.supplyPlan.total'), readOnly: true, type: displayBy == 2 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,## %' });
            var data = [];
            var dataArr = [];
            var nodeVal = [...new Set(this.state.nodeVal.map(ele => (ele.label)))];
            console.log("flatList###", flatList)
            for (var j = 0; j < monthList.length; j++) {
                data = [];
                data[0] = moment(monthList[j]).format("YYYY-MM-DD");
                // var nodeDataListForMonth = nodeDataModelingListFilter.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(monthList[j]).format("YYYY-MM-DD"));
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
                data[nodeVal.length + 1] = Number(total).toFixed(2);

                for (var k = 0; k < nodeVal.length; k++) {
                    var flatListFiltered = flatList.filter(c => getLabelText(c.payload.label, this.state.lang) == nodeVal[k]);
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
            this.el = jexcel(document.getElementById("tableDiv"), '');
            this.el.destroy();
            var json = [];
            var options = {
                data: dataArr,
                columnDrag: true,
                // colWidths: [0, 150, 150, 150, 100, 100, 100],
                colHeaderClasses: ["Reqasterisk"],
                columns: columns,
                text: {
                    // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                    show: '',
                    entries: '',
                },
                onload: this.loaded,
                pagination: false,
                search: false,
                defaultColWidth: 120,
                columnSorting: false,
                tableOverflow: true,
                // tableWidth: "100%",
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

            this.setState({
                nodeDataModelingList: [{}],
                monthList: monthList,
                dataEl: dataEl,
                loading: false,
                show: false,
                columns: columns
            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            this.el.destroy();
            this.setState({
                nodeDataModelingList: [],
                loading: false,
                dataEl: ""
            })
        }
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

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
            var nodeUnit = this.state.unitList.filter(c => c.unitId == flatData.payload.nodeUnit.id);
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
                versionList.push(newVList[v].versionId)
            }
            var versionId = "";
            var event = {
                target: {
                    value: ""
                }
            };
            if (versionList.length == 1) {
                versionId = versionList[0];
                event.target.value = versionList[0];
            } else if (localStorage.getItem("sesDatasetVersionId") != "" && versionList.filter(c => c == localStorage.getItem("sesDatasetVersionId")).length > 0) {
                versionId = localStorage.getItem("sesDatasetVersionId");
                event.target.value = localStorage.getItem("sesDatasetVersionId");
            }
            this.setState({
                versionList: versionList,
                loading: false
            }, () => {
                // if (versionId != "") {
                this.setVersionId(event)
                // }
            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            this.el.destroy();
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
                levelId: "",
                levelUnit: "",
                nodeList: [],
                nodeVal: [],
                nodeIdArr: [],
                nodeLabelArr: [],
            })
        }
    }

    componentDidMount() {
        this.setState({ loading: true });
        // this.getOfflineDatasetList();
        ProgramService.getDataSetList().then(response => {
            if (response.status == 200) {
                var responseData = response.data;
                console.log("responseData------->", responseData);
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
                    for (var mr = 0; mr < myResult.length; mr++) {
                        var index = datasetList.findIndex(c => c.id == myResult[mr].programId);
                        if (index == -1) {
                            var programNameBytes = CryptoJS.AES.decrypt(myResult[mr].programName, SECRET_KEY);
                            var programNameLabel = programNameBytes.toString(CryptoJS.enc.Utf8);
                            var programNameJson = JSON.parse(programNameLabel)
                            var json = {
                                id: myResult[mr].programId,
                                name: getLabelText(programNameJson, this.state.lang),
                                code: myResult[mr].programCode,
                                versionList: [{ versionId: myResult[mr].version + "  (Local)" }]
                            }
                            datasetList.push(json)
                        } else {
                            var existingVersionList = datasetList[index].versionList;
                            existingVersionList.push({ versionId: myResult[mr].version + "  (Local)" })
                            datasetList[index].versionList = existingVersionList
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
                        // if (datasetId != "") {
                        this.setDatasetId(event);
                        // }
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    handleRangeChange(value, text, listIndex) {

    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.getData()
        })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
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
                doc.text(this.state.datasetData.programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text), doc.internal.pageSize.width - 40, 50, {
                    align: 'right'
                })
                doc.text(document.getElementById("datasetId").selectedOptions[0].text, doc.internal.pageSize.width - 40, 60, {
                    align: 'right'
                })
                doc.setFontSize(TITLE_FONT)

                /*doc.addImage(data, 10, 30, {
                  align: 'justify'
                });*/
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
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal')
        doc.setTextColor("#002f6c");


        var y = 110;
        var planningText = doc.splitTextToSize(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
        // doc.text(doc.internal.pageSize.width / 8, 110, planningText)
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 80;

            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 10;
        }

        planningText = doc.splitTextToSize(i18n.t('static.common.treeName') + ' : ' + document.getElementById("treeId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
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

        planningText = doc.splitTextToSize(i18n.t('static.whatIf.scenario') + ' : ' + document.getElementById("scenarioId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
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

        planningText = doc.splitTextToSize(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width * 3 / 4);
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

        planningText = doc.splitTextToSize(i18n.t('static.common.level') + ' : ' + document.getElementById("levelId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
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

        planningText = doc.splitTextToSize(i18n.t('static.modelingValidation.levelUnit') + ' : ' + document.getElementById("levelUnit").value, doc.internal.pageSize.width * 3 / 4);
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

        planningText = doc.splitTextToSize(i18n.t('static.common.node') + ' : ' + this.state.nodeLabelArr.join('; '), doc.internal.pageSize.width * 3 / 4);
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

        y = y + 10;
        doc.text(i18n.t('static.modelingValidation.displayBy') + ' : ' + document.getElementById("displayBy").selectedOptions[0].text, doc.internal.pageSize.width / 20, y, {
            align: 'left'
        })
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
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: startYtable,
            head: [columns],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' }

        };


        //doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(this.state.datasetData.programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.dashboard.modelingValidation') + "-" + document.getElementById("treeId").selectedOptions[0].text + "-" + document.getElementById("scenarioId").selectedOptions[0].text + ".pdf")
        //creates PDF from img
        /*  var doc = new jsPDF('landscape');
          doc.setFontSize(20);
          doc.text(15, 15, "Cool Chart");
          doc.save('canvas.pdf');*/
    }

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
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.level') + ' : ' + document.getElementById("levelId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.modelingValidation.levelUnit') + ' : ' + document.getElementById("levelUnit").value).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('')
        this.state.nodeLabelArr.map(ele =>
            csvRow.push('"' + (i18n.t('static.common.node')).replaceAll(' ', '%20') + ' : ' + (ele.toString()).replaceAll(' ', '%20').replaceAll('#', '%23') + '"'))
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.modelingValidation.displayBy') + ' : ' + document.getElementById("displayBy").selectedOptions[0].text).replaceAll(' ', '%20').replaceAll('#', '%23') + '"')
        csvRow.push('')


        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;
        var columns = [];
        // columns.push(i18n.t('static.common.level'));
        // columns.push(i18n.t('static.supplyPlan.type'));
        // columns.push(i18n.t('static.forecastingunit.forecastingunit'));
        // columns.push(i18n.t('static.forecastingunit.forecastingunit') + " " + i18n.t('static.common.text'));
        // columns.push(i18n.t('static.common.product'));
        // columns.push(i18n.t('static.common.product') + " " + i18n.t('static.common.text'));
        // columns.push(i18n.t('static.productValidation.cost'));
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
                        B.push(moment(ele[idx]).format(DATE_FORMAT_CAP_WITHOUT_DATE).toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll(' ', '%20'));
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
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = this.state.datasetData.programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.dashboard.modelingValidation') + "-" + document.getElementById("treeId").selectedOptions[0].text + "-" + document.getElementById("scenarioId").selectedOptions[0].text + ".csv"
        document.body.appendChild(a)
        a.click()
    }

    render() {
        var chartOptions = {
            title: {
                display: true,
                text: (this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "") ? i18n.t("static.dashboard.modelingValidation") + " - " + this.state.datasetData.programCode + "~" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + " - " + (document.getElementById("levelId").selectedOptions[0].text) : ""
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.state.levelUnit,
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
                        }
                    },
                    {
                        id: 'xAxis2',
                        gridLines: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
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
        // var aggregatedData = [];
        // for (var i = 0; i < datasetListForGraph.length; i++) {
        //     var index = aggregatedData.findIndex(c => c.label == datasetListForGraph[i].label);
        //     if (index == -1) {
        //         var filter = datasetListForGraph.filter(c => c.label == datasetListForGraph[i].label);
        //         var dataArr = filter[0].data;
        //         for (var f = 1; f < filter.length; f++) {
        //             filter[f].data.map(function (num, idx) {
        //                 dataArr[idx] = (Number(num) + Number(dataArr[idx])).toFixed(2);
        //             })
        //         }
        //         aggregatedData.push({
        //             label: filter[0].label,
        //             data: dataArr,
        //             backgroundColor: filter[0].backgroundColor,
        //             stack: filter[0].stack
        //         })
        //     }
        // }
        if (this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "") {
            bar = {

                labels: [...new Set(this.state.monthList.map(ele => moment(ele).format("MMM-YYYY")))],
                datasets: datasetListForGraph

            };
        }


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

        const { datasetList } = this.state;
        let datasets = datasetList.length > 0
            && datasetList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {/* {item.name} */}
                        {item.code}
                    </option>
                )
            }, this);

        const { versionList } = this.state;
        let versions = versionList.length > 0
            && versionList.map((item, i) => {
                return (
                    <option key={i} value={item}>
                        {item}
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
                    return (
                        <option key={i} value={item}>
                            {levelListForNames.filter(c => c.levelNo == item).length > 0 ? getLabelText(levelListForNames.filter(c => c.levelNo == item)[0].label, this.state.lang) : i18n.t("static.common.level") + " " + item}
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
                        {/* {this.state.dataList.length > 0 && */}
                        {/* <div className="card-header-actions">
                            <a className="card-header-action">

                                {this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "" && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />}


                            </a>
                            {this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "" && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
                        </div> */}
                        {/* } */}
                    </div>
                    <div className="card-header-actions pr-lg-3">
                            <a className="card-header-action" style={{float:'right'}}>

                                {this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "" && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />}


                            </a>
                            {this.state.monthList.length > 0 && this.state.dataEl != undefined && this.state.dataEl != "" && <img style={{ height: '25px', width: '25px', cursor: 'pointer',float:'right',marginTop:'3px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
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
                                                            // onChange={this.filterVersion}
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
                                                            // onChange={this.filterVersion}
                                                            onChange={(e) => { this.setScenarioId(e); }}
                                                            value={this.state.scenarioId}

                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {scenarios}
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
                                                        key={JSON.stringify(rangeValue)}
                                                        //theme="light"
                                                        onChange={this.handleRangeChange}
                                                        onDismiss={this.handleRangeDissmis}
                                                    >
                                                        <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                    </Picker>
                                                </div>
                                            </FormGroup>
                                            <div>
                                            <Popover placement="top" isOpen={this.state.popoverOpenLevelFeild} target="Popover5" trigger="hover" toggle={this.toggleLevelFeild}>
                                                <PopoverBody>{i18n.t('static.Tooltip.levelModelingValdation')}</PopoverBody>
                                            </Popover>
                                        </div>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.level')}<i class="fa fa-info-circle icons pl-lg-2" id="Popover5" onClick={this.toggleLevelFeild} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i></Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="levelId"
                                                            id="levelId"
                                                            bsSize="sm"
                                                            // onChange={this.filterVersion}
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.modelingValidation.levelUnit')}</Label>
                                                <div className="controls">
                                                    <InputGroup>
                                                        <Input
                                                            type="text"
                                                            disabled
                                                            name="levelUnit"
                                                            id="levelUnit"
                                                            bsSize="sm"
                                                            value={this.state.levelUnit}
                                                        >
                                                        </Input>
                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.node')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                                <div className="controls ">
                                                    {/* <InputGroup className="box"> */}
                                                    <MultiSelect
                                                        name="nodeId"
                                                        id="nodeId"
                                                        options={this.state.nodeList && this.state.nodeList.length > 0 ? this.state.nodeList : []}
                                                        value={this.state.nodeVal}
                                                        onChange={(e) => { this.setNodeVal(e) }}
                                                        // onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                        labelledBy={i18n.t('static.common.select')}
                                                    />

                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.modelingValidation.displayBy')}</Label>
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



                                    {/* {this.state.show && */}
                                    <div className="row">
                                        <div className="pl-0 pr-0 ModelingValidationTable ModelingTableMargin">

                                            {/* // <div className="table-scroll">
                                                    // <div className="table-wrap table-responsive"> */}
                                            <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: this.state.show && !this.state.loading ? "block" : "none" }}>
                                            </div>
                                            {/* // </div>
                                                // </div> */}

                                        </div>
                                    </div>
                                    {/* } */}
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