import CryptoJS from 'crypto-js';
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import {
    Card,
    CardBody,
    Form,
    FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import { DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import CompareVersionTableCompareVersion from './CompareVersionTableCompareVersion';
import { decryptFCData } from '../../CommonComponent/JavascriptCommonFunctions.js';
/**
 * Component for comparing versions.
 */
class CompareVersion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasetId: "",
            datasetList: [],
            lang: localStorage.getItem("lang"),
            versionId: "",
            versionList: [],
            versionList1: [],
            versionId1: "",
            datasetData: {},
            firstDataSet: 0,
            secondDataSet: 0,
            loading: false
        };
        this.setDatasetId = this.setDatasetId.bind(this);
        this.getOfflineDatasetList = this.getOfflineDatasetList.bind(this);
        this.getVersionList = this.getVersionList.bind(this);
        this.getVersionList1 = this.getVersionList1.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.setVersionId1 = this.setVersionId1.bind(this);
        this.updateState = this.updateState.bind(this);
    }
    /**
     * Sets the version ID in local storage and updates the component state.
     * @param {Event} e The event object containing the selected version ID.
     */
    setVersionId(e) {
        var versionId = e.target.value;
        localStorage.setItem("sesDatasetVersionId", versionId);
        localStorage.setItem("sesForecastVersionIdReport", versionId);
        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        localStorage.setItem("sesDatasetId", parseInt(localStorage.getItem("sesForecastProgramIdReport")) + '_v' + (versionId).toString().replace('(Local)', '').trim() + '_uId_' + userId);
        this.setState({
            versionId: versionId,
            versionList1: [],
            firstDataSet: 0
        }, () => {
            if (versionId != "") {
                this.getData();
            }
        })
    }
    /**
     * Sets the version ID in local storage and updates the component state.
     * @param {Event} e The event object containing the selected version ID.
     */
    setVersionId1(e) {
        var versionId = e.target.value;
        localStorage.setItem("sesDatasetCompareVersionId", versionId);
        this.setState({
            versionId1: versionId,
            secondDataSet: 0
        }, () => {
            this.getData1();
        })
    }
    /**
     * Sets the dataset ID in local storage and updates the component state.
     * @param {Event} e The event object containing the selected dataset ID.
     */
    setDatasetId(e) {
        var datasetId = e.target.value;
        localStorage.setItem("sesLiveDatasetId", datasetId);
        localStorage.setItem("sesForecastProgramIdReport", parseInt(datasetId));
        this.setState({
            datasetId: datasetId,
            versionList: [],
            versionList1: [],
            versionId: "",
            versionId1: ""
        }, () => {
            this.getVersionList();
        })
    }
    /**
     * Reterives version list
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
                versionList.push({ id: newVList[v].versionId, name: (newVList[v].versionId + (newVList[v].versionType.id == 2 ? "*" : "") + " (" + moment(newVList[v].createdDate).format(`DD-MMM-YYYY`) + ")") })
            }
            var versionId = "";
            var event = {
                target: {
                    value: ""
                }
            };
            if (versionList.length == 1) {
                versionId = versionList[0].id;
                event.target.value = versionList[0].id;
            } else if (localStorage.getItem("sesDatasetVersionId") != "" && versionList.filter(c => c.id == localStorage.getItem("sesDatasetVersionId")).length > 0) {
                versionId = localStorage.getItem("sesDatasetVersionId");
                event.target.value = localStorage.getItem("sesDatasetVersionId");
            }
            this.setState({
                versionList: versionList,
                loading: false
            }, () => {
                if (versionId != "") {
                    this.setVersionId(event)
                } else {
                    this.setState({
                        firstDataSet: 0
                    })
                }
            })
        } else {
            this.setState({
                versionList: [],
                versionList1: [],
                versionId: "",
                versionId1: "",
                firstDataSet: 0,
                secondDataSet: 0,
                loading: false
            })
        }
    }
    /**
     * Reterives version list for compare
     */
    getVersionList1() {
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
                versionList.push({ id: newVList[v].versionId, name: (newVList[v].versionId + (newVList[v].versionType.id == 2 ? "*" : "") + " (" + moment(newVList[v].createdDate).format(`DD-MMM-YYYY`) + ")") })
            }
            versionList = versionList.filter(c => c.id != this.state.versionId);
            var versionId1 = "";
            var event1 = {
                target: {
                    value: ""
                }
            };
            if (versionList.length == 1) {
                versionId1 = versionList[0].id;
                event1.target.value = versionList[0].id;
            } else if (localStorage.getItem("sesDatasetCompareVersionId") != "" && versionList.filter(c => c.id == localStorage.getItem("sesDatasetCompareVersionId")).length > 0) {
                versionId1 = localStorage.getItem("sesDatasetCompareVersionId");
                event1.target.value = localStorage.getItem("sesDatasetCompareVersionId");
            }
            this.setState({
                versionList1: versionList,
                loading: false
            }, () => {
                if (versionId1 != "") {
                    this.setVersionId1(event1)
                } else {
                    this.setState({
                        secondDataSet: 0
                    })
                }
            })
        } else {
            this.setState({
                versionList: [],
                versionList1: [],
                versionId: "",
                versionId1: "",
                firstDataSet: 0,
                secondDataSet: 0,
                loading: false
            })
        }
    }
    /**
     * This function is used to update the state of this component from any other component
     * @param {*} parameterName This is the name of the key
     * @param {*} value This is the value for the key
     */
    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })
    }
    /**
     * Reterives forecast programs list
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
                        versionList: responseData[rd].versionList,
                        regionList: responseData[rd].regionList,
                        label: responseData[rd].label
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
     * Reterives forecast programs from indexed db
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
                var myResult = getRequest.result;
                var datasetList = this.state.datasetList;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var mr = 0; mr < myResult.length; mr++) {
                    if (myResult[mr].userId == userId) {
                        var index = datasetList.findIndex(c => c.id == myResult[mr].programId);
                        var programData = decryptFCData(myResult[mr].programData);
                        if (index == -1) {
                            var programNameBytes = CryptoJS.AES.decrypt(myResult[mr].programName, SECRET_KEY);
                            var programNameLabel = programNameBytes.toString(CryptoJS.enc.Utf8);
                            var programNameJson = JSON.parse(programNameLabel)
                            var json = {
                                id: myResult[mr].programId,
                                name: getLabelText(programNameJson, this.state.lang),
                                code: myResult[mr].programCode,
                                versionList: [{ versionId: myResult[mr].version + " (Local)", createdDate: programData.currentVersion.createdDate, versionType: programData.currentVersion.versionType }]
                            }
                            datasetList.push(json)
                        } else {
                            var existingVersionList = datasetList[index].versionList;
                            existingVersionList.push({ versionId: myResult[mr].version + " (Local)", createdDate: programData.currentVersion.createdDate, versionType: programData.currentVersion.versionType })
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
                        a = a.name.toLowerCase();
                        b = b.name.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }),
                    loading: false
                }, () => {
                    if (datasetId != "") {
                        this.setDatasetId(event);
                    }
                })
            }.bind(this)
        }.bind(this)
    }
    /**
     * Retrieves dataset data based on the selected version ID and updates the component state accordingly.
     * This function retrieves dataset data either from local storage or from the server, depending on the selected version.
     */
    getData() {
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
                    var datasetJson = decryptFCData(myResult.programData);
                    var planningUnitList = datasetJson.planningUnitList;
                    var regionList = datasetJson.regionList
                    var list = [];
                    var treeList = datasetJson.treeList;
                    var consumptionExtrapolation = datasetJson.consumptionExtrapolation;
                    for (var pu = 0; pu < planningUnitList.length; pu++) {
                        for (var r = 0; r < regionList.length; r++) {
                            var total = 0;
                            var label = { label_en: "", label_fr: "", label_pr: "", label_sp: "" };
                            if (planningUnitList[pu].selectedForecastMap != undefined && planningUnitList[pu].selectedForecastMap[regionList[r].regionId] != undefined) {
                                if (planningUnitList[pu].selectedForecastMap[regionList[r].regionId].treeAndScenario!=undefined && planningUnitList[pu].selectedForecastMap[regionList[r].regionId].treeAndScenario.length > 0) {
                                    var treeAndScenario = planningUnitList[pu].selectedForecastMap[regionList[r].regionId].treeAndScenario;
                                    var count = 0;
                                    var selectedScenarioId_en = "";
                                    var selectedScenarioId_fr = "";
                                    var selectedScenarioId_sp = "";
                                    var selectedScenarioId_pr = "";
                                    for (var tas = 0; tas < treeAndScenario.length; tas++) {
                                        var selectedTree = treeList.filter(c => treeAndScenario[tas].treeId == c.treeId)[0];
                                        if (selectedTree != undefined) {
                                            count+=1;
                                            var scenarioLabel = selectedTree.scenarioList.filter(c => c.id == treeAndScenario[tas].scenarioId && c.active.toString() == "true")[0];
                                            if (selectedScenarioId_en != "") {
                                                selectedScenarioId_en += ", ";
                                                selectedScenarioId_fr += ", ";
                                                selectedScenarioId_sp += ", ";
                                                selectedScenarioId_pr += ", ";
                                            }
                                            selectedScenarioId_en += selectedTree.label.label_en + " - " + scenarioLabel.label.label_en;
                                            selectedScenarioId_fr += selectedTree.label.label_fr + " - " + scenarioLabel.label.label_fr;
                                            selectedScenarioId_sp += selectedTree.label.label_sp + " - " + scenarioLabel.label.label_sp;
                                            selectedScenarioId_pr += selectedTree.label.label_pr + " - " + scenarioLabel.label.label_pr;
                                            var flatList = selectedTree.tree.flatList;
                                            var flatListFilter = flatList.filter(c => c.payload.nodeType.id == 5 && c.payload.nodeDataMap[treeAndScenario[tas].scenarioId][0].puNode != null && c.payload.nodeDataMap[treeAndScenario[tas].scenarioId][0].puNode.planningUnit.id == planningUnitList[pu].planningUnit.id);
                                            var nodeDataMomList = [];
                                            for (var fl = 0; fl < flatListFilter.length; fl++) {
                                                nodeDataMomList = nodeDataMomList.concat(flatListFilter[fl].payload.nodeDataMap[treeAndScenario[tas].scenarioId][0].nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") >= moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM")));
                                            }
                                            nodeDataMomList.map(ele => {
                                                total += Number(ele.calculatedMmdValue);
                                            });
                                        }
                                    }
                                    if (count == 0) {
                                        total = null;
                                    }
                                    label = {
                                        label_en: selectedScenarioId_en,
                                        label_sp: selectedScenarioId_sp,
                                        label_pr: selectedScenarioId_pr,
                                        label_fr: selectedScenarioId_fr,
                                    };
                                } else if (planningUnitList[pu].selectedForecastMap[regionList[r].regionId].consumptionExtrapolationId != null && planningUnitList[pu].selectedForecastMap[regionList[r].regionId].consumptionExtrapolationId != "") {
                                    var ceFilter = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == planningUnitList[pu].selectedForecastMap[regionList[r].regionId].consumptionExtrapolationId);
                                    if (ceFilter.length > 0) {
                                        ceFilter[0].extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM-DD") >= moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD") && moment(c.month).format("YYYY-MM-DD") <= moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD")).map(ele => {
                                            total += Number(ele.amount);
                                        });
                                        label = {
                                            label_en: getLabelText(ceFilter[0].extrapolationMethod.label, this.state.lang),
                                            label_sp: getLabelText(ceFilter[0].extrapolationMethod.label, this.state.lang),
                                            label_pr: getLabelText(ceFilter[0].extrapolationMethod.label, this.state.lang),
                                            label_fr: getLabelText(ceFilter[0].extrapolationMethod.label, this.state.lang),
                                        }
                                    } else {
                                        total = null
                                    }
                                } else {
                                    total = null;
                                }
                            } else {
                                total = null;
                            }
                            list.push({
                                selectedForecast: label,
                                totalForecast: planningUnitList[pu].selectedForecastMap != undefined && planningUnitList[pu].selectedForecastMap[regionList[r].regionId] != undefined && total != null ? Number(total).toFixed(2) : "",
                                notes: { label_en: planningUnitList[pu].selectedForecastMap != undefined && planningUnitList[pu].selectedForecastMap[regionList[r].regionId] != undefined ? planningUnitList[pu].selectedForecastMap[regionList[r].regionId].notes : "" },
                                planningUnit: planningUnitList[pu].planningUnit,
                                region: {
                                    id: regionList[r].regionId,
                                    label: regionList[r].label
                                }
                            })
                        }
                    }
                    var json = {
                        currentVersion: {
                            forecastStartDate: datasetJson.currentVersion.forecastStartDate,
                            forecastStopDate: datasetJson.currentVersion.forecastStopDate,
                            notes: datasetJson.currentVersion.notes,
                        },
                        planningUnitList: list,
                        regionList: datasetJson.regionList,
                        programCode: datasetJson.programCode,
                        label: datasetJson.label
                    }
                    this.setState({
                        datasetData: json,
                        firstDataSet: 1,
                        loading: false
                    }, () => {
                        this.getVersionList1()
                    })
                }.bind(this)
            }.bind(this)
        } else if (versionId != "" && !versionId.includes("Local")) {
            var datasetFiltered = this.state.datasetList.filter(c => c.id == this.state.datasetId)[0];
            var versonListFilter = datasetFiltered.versionList.filter(c => c.versionId == versionId)[0];
            let inputJson = {
                "programId": this.state.datasetId,
                "versionId": versionId,
                "reportView": 1
            }
            ReportService.forecastSummary(inputJson).then(response => {
                if (response.status == 200) {
                    var responseData = response.data;
                    var json = {
                        currentVersion: {
                            forecastStartDate: versonListFilter.forecastStartDate,
                            forecastStopDate: versonListFilter.forecastStopDate,
                            notes: versonListFilter.notes,
                        },
                        planningUnitList: responseData,
                        regionList: datasetFiltered.regionList,
                        programCode: datasetFiltered.code,
                        label: datasetFiltered.label
                    }
                    this.setState({
                        datasetData: json,
                        firstDataSet: 1,
                        loading: false,
                    }, () => {
                        this.getVersionList1()
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
                    this.setState({
                        datasetData: {},
                        firstDataSet: 0,
                        loading: false
                    })
                }
            );
        } else {
            this.setState({
                datasetData: {},
                firstDataSet: 0,
                loading: false
            })
        }
    }
    /**
     * Retrieves dataset data based on the selected version ID and updates the component state accordingly.
     * This function retrieves dataset data either from local storage or from the server, depending on the selected version.
     */
    getData1() {
        this.setState({
            loading: true
        })
        var versionId = this.state.versionId1.toString();
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
                    var datasetJson = decryptFCData(myResult.programData);
                    var planningUnitList = datasetJson.planningUnitList;
                    var regionList = datasetJson.regionList
                    var list = [];
                    var treeList = datasetJson.treeList;
                    var consumptionExtrapolation = datasetJson.consumptionExtrapolation;
                    for (var pu = 0; pu < planningUnitList.length; pu++) {
                        for (var r = 0; r < regionList.length; r++) {
                            var total = 0;
                            var label = { label_en: "", label_fr: "", label_pr: "", label_sp: "" };
                            if (planningUnitList[pu].selectedForecastMap != undefined && planningUnitList[pu].selectedForecastMap[regionList[r].regionId] != undefined) {
                                if (planningUnitList[pu].selectedForecastMap[regionList[r].regionId].treeAndScenario!=undefined && planningUnitList[pu].selectedForecastMap[regionList[r].regionId].treeAndScenario.length > 0) {
                                    var treeAndScenario = planningUnitList[pu].selectedForecastMap[regionList[r].regionId].treeAndScenario;
                                    var count = 0;
                                    var selectedScenarioId_en = "";
                                    var selectedScenarioId_fr = "";
                                    var selectedScenarioId_sp = "";
                                    var selectedScenarioId_pr = "";
                                    for (var tas = 0; tas < treeAndScenario.length; tas++) {
                                        var selectedTree = treeList.filter(c => treeAndScenario[tas].treeId == c.treeId)[0];
                                        if (selectedTree != undefined) {
                                            count+=1;
                                            var scenarioLabel = selectedTree.scenarioList.filter(c => c.id == treeAndScenario[tas].scenarioId && c.active.toString() == "true")[0];
                                            if (selectedScenarioId_en != "") {
                                                selectedScenarioId_en += ", ";
                                                selectedScenarioId_fr += ", ";
                                                selectedScenarioId_sp += ", ";
                                                selectedScenarioId_pr += ", ";
                                            }
                                            selectedScenarioId_en += selectedTree.label.label_en + " - " + scenarioLabel.label.label_en;
                                            selectedScenarioId_fr += selectedTree.label.label_fr + " - " + scenarioLabel.label.label_fr;
                                            selectedScenarioId_sp += selectedTree.label.label_sp + " - " + scenarioLabel.label.label_sp;
                                            selectedScenarioId_pr += selectedTree.label.label_pr + " - " + scenarioLabel.label.label_pr;
                                            var flatList = selectedTree.tree.flatList;
                                            var flatListFilter = flatList.filter(c => c.payload.nodeType.id == 5 && c.payload.nodeDataMap[treeAndScenario[tas].scenarioId][0].puNode != null && c.payload.nodeDataMap[treeAndScenario[tas].scenarioId][0].puNode.planningUnit.id == planningUnitList[pu].planningUnit.id);
                                            var nodeDataMomList = [];
                                            for (var fl = 0; fl < flatListFilter.length; fl++) {
                                                nodeDataMomList = nodeDataMomList.concat(flatListFilter[fl].payload.nodeDataMap[treeAndScenario[tas].scenarioId][0].nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") >= moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM")));
                                            }
                                            nodeDataMomList.map(ele => {
                                                total += Number(ele.calculatedMmdValue);
                                            });
                                        }
                                    }
                                    if (count == 0) {
                                        total = null;
                                    }
                                    label = {
                                        label_en: selectedScenarioId_en,
                                        label_sp: selectedScenarioId_sp,
                                        label_pr: selectedScenarioId_pr,
                                        label_fr: selectedScenarioId_fr,
                                    };
                                } else if (planningUnitList[pu].selectedForecastMap[regionList[r].regionId].consumptionExtrapolationId != null && planningUnitList[pu].selectedForecastMap[regionList[r].regionId].consumptionExtrapolationId != "") {
                                    var ceFilter = consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == planningUnitList[pu].selectedForecastMap[regionList[r].regionId].consumptionExtrapolationId);
                                    if (ceFilter.length > 0) {
                                        ceFilter[0].extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM-DD") >= moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD") && moment(c.month).format("YYYY-MM-DD") <= moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD")).map(ele => {
                                            total += Number(ele.amount);
                                        });
                                        label = {
                                            label_en: getLabelText(ceFilter[0].extrapolationMethod.label, this.state.lang),
                                            label_sp: getLabelText(ceFilter[0].extrapolationMethod.label, this.state.lang),
                                            label_pr: getLabelText(ceFilter[0].extrapolationMethod.label, this.state.lang),
                                            label_fr: getLabelText(ceFilter[0].extrapolationMethod.label, this.state.lang),
                                        }
                                    } else {
                                        total = null
                                    }
                                } else {
                                    total = null
                                }
                            } else {
                                total = null
                            }
                            list.push({
                                selectedForecast: label,
                                totalForecast: planningUnitList[pu].selectedForecastMap != undefined && planningUnitList[pu].selectedForecastMap[regionList[r].regionId] != undefined && total != null ? Number(total).toFixed(2) : "",
                                notes: { label_en: planningUnitList[pu].selectedForecastMap != undefined && planningUnitList[pu].selectedForecastMap[regionList[r].regionId] != undefined ? planningUnitList[pu].selectedForecastMap[regionList[r].regionId].notes : "" },
                                planningUnit: planningUnitList[pu].planningUnit,
                                region: {
                                    id: regionList[r].regionId,
                                    label: regionList[r].label
                                }
                            })
                        }
                    }
                    var json = {
                        currentVersion: {
                            forecastStartDate: datasetJson.currentVersion.forecastStartDate,
                            forecastStopDate: datasetJson.currentVersion.forecastStopDate,
                            notes: datasetJson.currentVersion.notes,
                        },
                        planningUnitList: list,
                        regionList: datasetJson.regionList,
                        programCode: datasetJson.programCode,
                        label: datasetJson.label
                    }
                    this.setState({
                        datasetData1: json,
                        secondDataSet: 1,
                        loading: false
                    }, () => {
                    })
                }.bind(this)
            }.bind(this)
        } else if (versionId != "" && !versionId.includes("Local")) {
            var datasetFiltered = this.state.datasetList.filter(c => c.id == this.state.datasetId)[0];
            var versonListFilter = datasetFiltered.versionList.filter(c => c.versionId == versionId)[0];
            let inputJson = {
                "programId": this.state.datasetId,
                "versionId": versionId,
                "reportView": 1
            }
            ReportService.forecastSummary(inputJson).then(response => {
                if (response.status == 200) {
                    var responseData = response.data;
                    var json = {
                        currentVersion: {
                            forecastStartDate: versonListFilter.forecastStartDate,
                            forecastStopDate: versonListFilter.forecastStopDate,
                            notes: versonListFilter.notes,
                        },
                        planningUnitList: responseData,
                        regionList: datasetFiltered.regionList,
                        programCode: datasetFiltered.code,
                        label: datasetFiltered.label
                    }
                    this.setState({
                        datasetData1: json,
                        secondDataSet: 1,
                        loading: false
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
                    this.setState({
                        datasetData1: {},
                        secondDataSet: 0,
                        loading: false
                    })
                }
            );
        } else {
            this.setState({
                datasetData1: {},
                secondDataSet: 0,
                loading: false
            })
        }
    }
    /**
     * Renders the compare version screen.
     * @returns {JSX.Element} - Compare version screen.
     */
    render() {
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
                    <option key={i} value={item.id}>
                        {item.name}
                    </option>
                )
            }, this);
        const { versionList1 } = this.state;
        let versions1 = versionList1.length > 0
            && versionList1.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.name}
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
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                {(this.state.firstDataSet == 1 && this.state.secondDataSet == 1) && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.refs.compareVersionTable.exportPDF()} />}
                            </a>
                            {(this.state.firstDataSet == 1 && this.state.secondDataSet == 1) && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.refs.compareVersionTable.exportCSV()} />}
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0 ">
                        <div>
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
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {versions}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        {this.state.firstDataSet == 1 && <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="forecastPeriod"
                                                        id="forecastPeriod"
                                                        bsSize="sm"
                                                        readonly={true}
                                                        className="disabledColor"
                                                        value={moment(this.state.datasetData.currentVersion.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " - " + moment(this.state.datasetData.currentVersion.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)}
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>}
                                        {this.state.firstDataSet == 1 && <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.note')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="textarea"
                                                        name="forecastPeriod"
                                                        id="forecastPeriod"
                                                        bsSize="sm"
                                                        readonly={true}
                                                        value={this.state.datasetData.currentVersion.notes}
                                                        className="disabledColor"
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>}
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.compareVersion.compareWithVersion')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="versionId1"
                                                        id="versionId1"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.setVersionId1(e); }}
                                                        value={this.state.versionId1}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {versions1}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        {this.state.secondDataSet == 1 && <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.forecastPeriod')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="text"
                                                        name="forecastPeriod"
                                                        id="forecastPeriod"
                                                        bsSize="sm"
                                                        readonly={true}
                                                        value={moment(this.state.datasetData1.currentVersion.forecastStartDate).format(DATE_FORMAT_CAP_WITHOUT_DATE) + " - " + moment(this.state.datasetData1.currentVersion.forecastStopDate).format(DATE_FORMAT_CAP_WITHOUT_DATE)}
                                                        className="disabledColor"
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>}
                                        {this.state.secondDataSet == 1 && <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.note')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="textarea"
                                                        name="forecastPeriod"
                                                        id="forecastPeriod"
                                                        bsSize="sm"
                                                        readonly={true}
                                                        value={this.state.datasetData1.currentVersion.notes}
                                                        className="disabledColor"
                                                    >
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>}
                                    </div>
                                </div>
                            </Form>
                            <div style={{ display: !this.state.loading ? "block" : "none" }}>
                                {(this.state.firstDataSet == 1 && this.state.secondDataSet == 1) &&
                                    <>
                                        <CompareVersionTableCompareVersion ref="compareVersionTable" datasetData={this.state.datasetData} datasetData1={this.state.datasetData1} datasetData2={this.state.datasetData} page="compareVersion" versionLabel={"V" + document.getElementById("versionId").selectedOptions[0].text} versionLabel1={"V" + document.getElementById("versionId1").selectedOptions[0].text} updateState={this.updateState} />
                                        <div className="consumptionDataEntryTable ForecastSummaryTable">
                                            <div id="tableDiv" className="compareVersion" style={{ display: !this.state.loading ? "block" : "none" }} />
                                        </div>
                                    </>
                                }
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
                    </CardBody>
                </Card>
            </div >
        );
    }
}
export default CompareVersion;