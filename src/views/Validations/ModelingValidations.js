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
import i18n from '../../i18n'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { DATE_FORMAT_CAP_WITHOUT_DATE, SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME, JEXCEL_PRO_KEY, JEXCEL_PAGINATION_OPTION, JEXCEL_MONTH_PICKER_FORMAT } from '../../Constants.js'
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
            nodeDataModelingList: [],
            loading: false,
            show: false
        };
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
        console.log("e+++", e);
        var nodeIdArr = [];
        for (var i = 0; i < e.length; i++) {
            nodeIdArr.push(e[i].value);
        }
        this.setState({
            nodeVal: e,
            nodeIdArr
        }, () => {
            this.getData()
        })
    }

    setDisplayBy(e) {
        var displayBy = e.target.value;
        this.setState({
            displayBy: displayBy
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

    setVersionId(e) {
        var versionId = e.target.value;
        if (versionId != "") {
            this.setState({
                versionId: versionId
            }, () => {
                this.getDatasetData()
            })
        } else {
            this.setState({
                versionId: versionId
            }, () => {
                this.getData()
            })
        }
    }

    getDatasetData() {
        this.setState({
            loading: true
        })
        var versionId = this.state.versionId.toString();
        if (versionId != "") {
            var actualVersionId = (versionId.split('(')[0]).trim();
            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var datasetId = this.state.datasetId + "_v" + actualVersionId + "_uId_" + userId;
            console.log("DatasetId+++", datasetId);
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
                    console.log("MyResult+++", myResult);
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
        } else {
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
                loading: false
            })
        }
    }

    getTreeList() {
        var datasetJson = this.state.datasetData;
        console.log("datasetJson+++", datasetJson);
        var treeList = datasetJson.treeList;
        var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
        var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
        var rangeValue = { from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(stopDate).getFullYear(), month: new Date(stopDate).getMonth() + 1 } }
        this.setState({
            treeList: treeList,
            rangeValue: rangeValue
        })

    }

    setTreeId(e) {
        var treeId = e.target.value;
        if (treeId > 0) {
            this.setState({
                treeId: treeId
            }, () => {
                this.getScenarioList()
            })
        } else {
            this.setState({
                treeId: treeId
            }, () => {
                this.getData()
            })
        }
    }

    getScenarioList() {
        var treeList = this.state.treeList;
        if (this.state.treeId > 0) {
            var treeListFiltered = treeList.filter(c => c.treeId == this.state.treeId)[0];
            var levelList = [...new Set(treeListFiltered.tree.flatList.map(ele => (ele.level)))]
            this.setState({
                scenarioList: treeListFiltered.scenarioList,
                levelList: levelList,
                treeListFiltered: treeListFiltered
            })
        } else {
            this.setState({
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                levelId: "",
                levelUnit: "",
                nodeList: [],
                nodeVal: [],
                nodeIdArr: []
            })
        }
    }

    setScenarioId(e) {
        var scenarioId = e.target.value;
        this.setState({
            scenarioId: scenarioId
        }, () => {
            this.getData()
        })
    }

    getOtherFiltersData() {

    }

    setDatasetId(e) {

        var datasetId = e.target.value;
        if (datasetId > 0) {
            this.setState({
                datasetId: datasetId
            }, () => {
                this.getVersionList();
            })
        } else {
            this.setState({
                datasetId: datasetId
            }, () => {
                this.getData();
            })
        }
    }

    getData() {
        if (this.state.scenarioId > 0 && this.state.levelId >= 0 && this.state.nodeVal.length > 0) {
            this.setState({
                loading: true,
                show: true
            })
            var datasetData = this.state.datasetData;
            var nodeDataModelingList = datasetData.nodeDataModelingList;
            var nodeIdArr = this.state.nodeIdArr;
            var rangeValue = this.state.rangeValue;
            var displayBy = this.state.displayBy;
            let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
            let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
            var nodeDataModelingListFilter = nodeDataModelingList.filter(c => nodeIdArr.includes(c.id) && c.scenarioId == this.state.scenarioId && moment(c.month).format("YYYY-MM-DD") >= moment(startDate).format("YYYY-MM-DD") && moment(c.month).format("YYYY-MM-DD") <= moment(stopDate).format("YYYY-MM-DD"));
            console.log("NodeDataModelingList+++", nodeDataModelingListFilter);
            var monthList = [...new Set(nodeDataModelingListFilter.map(ele => (ele.month)))];
            let columns = [];
            columns.push({ title: i18n.t('static.inventoryDate.inventoryReport'), type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100, readOnly: true });
            var nodeVal = this.state.nodeVal;
            for (var k = 0; k < nodeVal.length; k++) {
                columns.push({ title: nodeVal[k].label, width: 100, readOnly: true, type: displayBy == 1 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,##.00 %', decimal: '.' });
            }
            columns.push({ title: i18n.t('static.supplyPlan.total'), width: 100, readOnly: true, type: displayBy == 1 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,## %' });
            for (var k = 0; k < nodeVal.length; k++) {
                columns.push({ title: nodeVal[k].label, width: 100, readOnly: true, type: displayBy == 2 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,##.00 %', decimal: '.' });
            }
            columns.push({ title: i18n.t('static.supplyPlan.total'), width: 100, readOnly: true, type: displayBy == 2 ? 'numeric' : 'hidden', mask: displayBy == 1 ? '#,##.00' : '#,## %' });
            var data = [];
            var dataArr = [];
            var nodeVal = this.state.nodeVal;
            for (var j = 0; j < monthList.length; j++) {
                data = [];
                data[0] = moment(monthList[j]).format("YYYY-MM-DD");
                var nodeDataListForMonth = nodeDataModelingListFilter.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(monthList[j]).format("YYYY-MM-DD"));
                var total = 0;
                var totalPer = 0;
                for (var k = 0; k < nodeVal.length; k++) {
                    var calculatedValue = nodeDataListForMonth.filter(c => c.id == nodeVal[k].value)[0].calculatedValue;
                    data[k + 1] = Number(calculatedValue).toFixed(2);
                    total += Number(calculatedValue);
                }
                data[nodeVal.length + 1] = Number(total).toFixed(2);

                for (var k = 0; k < nodeVal.length; k++) {
                    var calculatedValue = nodeDataListForMonth.filter(c => c.id == nodeVal[k].value)[0].calculatedValue;
                    var val = (Number(calculatedValue) / Number(total)) * 100;
                    data[nodeVal.length + 1 + k + 1] = calculatedValue != 0 ? Number(val).toFixed(2) : 0;
                    totalPer += calculatedValue != 0 ? val : 0;
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
                pagination: false,
                search: false,
                columnSorting: false,
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
                contextMenu: function (obj, x, y, e) {
                    return [];
                }.bind(this),
            };
            var dataEl = jexcel(document.getElementById("tableDiv"), options);
            this.el = dataEl;

            this.setState({
                nodeDataModelingList: nodeDataModelingListFilter,
                dataEl: dataEl,
            })
            this.setState({
                loading: false,
                show: false
            })
        } else {
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
        var levelId = e.target.value;
        console.log("Level Id+++", levelId);
        var levelUnit = "";
        if (levelId != "") {
            var treeListFiltered = this.state.treeListFiltered;
            console.log("TreeListFiltered+++", treeListFiltered)
            var flatDataForLevel = treeListFiltered.tree.flatList.filter(c => c.level == levelId);
            var flatData = flatDataForLevel[0];
            console.log("FlatData+++", flatData)
            levelUnit = getLabelText(flatData.payload.nodeUnit.label, this.state.lang)
            console.log("LevelUnit+++", levelUnit)
            var nodeList = [];
            var nodeVal = [];
            var nodeIdArr = [];
            for (var fdfl = 0; fdfl < flatDataForLevel.length; fdfl++) {
                nodeList.push({
                    value: flatDataForLevel[fdfl].payload.nodeId,
                    label: getLabelText(flatDataForLevel[fdfl].payload.label, this.state.lang)
                })
                nodeVal.push({
                    value: flatDataForLevel[fdfl].payload.nodeId,
                    label: getLabelText(flatDataForLevel[fdfl].payload.label, this.state.lang)
                })
                nodeIdArr.push(flatDataForLevel[fdfl].payload.nodeId)
            }
            this.setState({
                levelId: levelId,
                levelUnit: levelUnit != null ? levelUnit : "",
                nodeList: nodeList,
                nodeIdArr: nodeIdArr,
                nodeVal: nodeVal
            }, () => {
                this.getData();
            })

        } else {
            this.setState({
                levelId: levelId,
                levelUnit: "",
                nodeList: [],
                nodeIdArr: [],
                nodeVal: []
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
        console.log("datsetlist+++", datasetList);
        console.log("this.state.datasetId+++", this.state.datasetId)
        if (this.state.datasetId > 0) {
            var selectedDataset = datasetList.filter(c => c.id == this.state.datasetId)[0];
            var versionList = [];
            var vList = selectedDataset.versionList;
            for (var v = 0; v < vList.length; v++) {
                versionList.push(vList[v].versionId)
            }
            this.setState({
                versionList: versionList,
                loading: false
            })
        } else {
            this.setState({
                versionList: [],
                versionId: "",
                loading: false,
                treeList: [],
                treeId: "",
                scenarioList: [],
                scenarioId: "",
                levelList: [],
                levelId: "",
                levelUnit: "",
                nodeList: [],
                nodeVal: [],
                nodeIdArr: []
            })
        }
    }

    componentDidMount() {
        this.setState({ loading: true });
        this.getOfflineDatasetList();
        // ProgramService.getDataSetList().then(response => {
        //     if (response.status == 200) {
        //         console.log("resp--------------------", response.data);
        //         var responseData = response.data;
        //         var datasetList = [];
        //         for (var rd = 0; rd < responseData.length; rd++) {
        //             var json = {
        //                 id: responseData[rd].programId,
        //                 name: getLabelText(responseData[rd].label, this.state.lang),
        //                 versionList: responseData[rd].versionList
        //             }
        //             datasetList.push(json);
        //         }
        //         this.setState({
        //             datasetList: datasetList,
        //             loading: false
        //         }, () => {
        //             this.getOfflineDatasetList();
        //         })
        //     } else {
        //         this.setState({
        //             message: response.data.messageCode, loading: false
        //         }, () => {
        //             this.hideSecondComponent();
        //         })
        //     }
        // }).catch(
        //     error => {
        //         this.getOfflineDatasetList();
        //     }
        // );
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
                var myResult = [];
                myResult = getRequest.result;
                console.log("MyResult+++", myResult);
                var datasetList = this.state.datasetList;
                for (var mr = 0; mr < myResult.length; mr++) {
                    var index = datasetList.findIndex(c => c.id == myResult[mr].programId);
                    if (index == -1) {
                        var programNameBytes = CryptoJS.AES.decrypt(myResult[mr].programName, SECRET_KEY);
                        var programNameLabel = programNameBytes.toString(CryptoJS.enc.Utf8);
                        console.log("programNamelabel+++", programNameLabel);
                        var programNameJson = JSON.parse(programNameLabel)
                        var json = {
                            id: myResult[mr].programId,
                            name: getLabelText(programNameJson, this.state.lang),
                            versionList: [{ versionId: myResult[mr].version + "  (Local)" }]
                        }
                        datasetList.push(json)
                    } else {
                        var existingVersionList = datasetList[index].versionList;
                        console.log("existingVersionList+++", datasetList[index].versionList)
                        existingVersionList.push({ versionId: myResult[mr].version + "  (Local)" })
                        datasetList[index].versionList = existingVersionList
                    }
                }
                this.setState({
                    datasetList: datasetList,
                    loading: false
                })
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

    render() {
        var chartOptions = {
            title: {
                display: false
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
                            return value.toLocaleString();
                        }
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    },
                    position: 'left',
                }],
                xAxes: [{
                    ticks: {
                        fontColor: 'black'
                    },
                    gridLines: {
                        drawBorder: true, lineWidth: 0
                    },
                    stacked: true
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
            }
        }

        let bar = {}
        var datasetListForGraph = [];
        var colourArray = ["#002F6C", "#BA0C2F", "#65ID32", "#49A4A1", "#A7C6ED", "#212721", "#6C6463", "#49A4A1", "#EDB944", "#F48521"]
        if (this.state.nodeDataModelingList.length > 0 && this.state.dataEl != undefined) {
            var elInstance = this.state.dataEl;
            if (elInstance != undefined) {
                var colourCount = 0;
                this.state.nodeVal.map((item, count) => {
                    if (colourCount > 10) {
                        colourCount = 0;
                    }
                    console.log("elInstance.getColumnData([count+1])+++", elInstance.getColumnData([count + 1]));
                    datasetListForGraph.push({
                        label: item.label,
                        data: this.state.displayBy == 1 ? elInstance.getColumnData([count + 1]) : elInstance.getColumnData([count + this.state.nodeVal.length + 1 + 1]),
                        backgroundColor: colourArray[colourCount]
                    })
                    colourCount++;
                })
            }
        }
        if (this.state.nodeDataModelingList.length > 0) {
            bar = {

                labels: [...new Set(this.state.nodeDataModelingList.map(ele => moment(ele.month).format(DATE_FORMAT_CAP_WITHOUT_DATE)))],
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
                        {item.name}
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
        let levels = levelList.length > 0
            && levelList.map((item, i) => {
                return (
                    <option key={i} value={item}>
                        {item}
                    </option>
                )
            }, this);

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>

                <Card>
                    <div className="Card-header-reporticon pb-2">
                        {/* {this.state.dataList.length > 0 && */}
                        <div className="card-header-actions">
                            <a className="card-header-action">

                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />


                            </a>
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>
                        {/* } */}
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
                                                <Label htmlFor="appendedInputButton">Tree Name</Label>
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
                                                <Label htmlFor="appendedInputButton">Scenario</Label>
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
                                                        //theme="light"
                                                        onChange={this.handleRangeChange}
                                                        onDismiss={this.handleRangeDissmis}
                                                    >
                                                        <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                    </Picker>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Levels</Label>
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
                                                <Label htmlFor="appendedInputButton">Level Unit</Label>
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
                                                <Label htmlFor="appendedInputButton">Node</Label>
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
                                                <Label htmlFor="appendedInputButton">Display By</Label>
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
                                                            <option value="1">Number</option>
                                                            <option value="2">Percentage</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>
                                <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div className="row">
                                        {this.state.nodeDataModelingList.length > 0
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



                                    {/* {this.state.show && */}
                                    <div className="row">
                                        <div className="col-md-12 pl-0 pr-0">

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