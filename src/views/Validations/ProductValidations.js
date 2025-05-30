
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import moment from "moment";
import React, { Component } from 'react';
import {
    Card,
    CardBody,
    Col,
    Form,
    FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions';
import { decompressJson, decryptFCData } from '../../CommonComponent/JavascriptCommonFunctions';
import { LOGO } from '../../CommonComponent/Logo';
import getLabelText from '../../CommonComponent/getLabelText';
import { DATE_FORMAT_CAP, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, ROUNDING_NUMBER, SECRET_KEY, TITLE_FONT } from '../../Constants.js';
import DatasetService from '../../api/DatasetService';
import ProgramService from '../../api/ProgramService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * This component is used to display the product validation for a tree
 */
class ProductValidation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datasetId: "",
            datasetList: [],
            lang: localStorage.getItem("lang"),
            versionId: "",
            versionList: [],
            datasetData: {},
            localProgramId: '',
            treeList: [],
            treeId: "",
            scenarioList: [],
            scenarioId: "",
            loading: false,
            currencyId: 1,
            currencyList: []
        };
        this.setDatasetId = this.setDatasetId.bind(this);
        this.getOfflineDatasetList = this.getOfflineDatasetList.bind(this);
        this.getVersionList = this.getVersionList.bind(this);
        this.setVersionId = this.setVersionId.bind(this);
        this.getTreeList = this.getTreeList.bind(this);
        this.getDatasetData = this.getDatasetData.bind(this);
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
                loading: false
            }, () => {
                this.getDatasetData()
            })
        } else {
            this.setState({
                versionId: versionId,
                treeList: [],
                treeId: "",
                scenarioList: [],
                scenarioId: "",
                loading: false
            }, () => {
                this.getData()
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
                    var datasetJson = decryptFCData(myResult.programData);
                    this.setState({
                        datasetData: datasetJson,
                        localProgramId: datasetId,
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
                        localProgramId: "",
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
                    this.setState({
                        datasetData: {},
                        localProgramId: "",
                        treeList: [],
                        treeId: "",
                        scenarioList: [],
                        scenarioId: "",
                        loading: false
                    })
                }
            );
        } else {
            this.setState({
                datasetData: {},
                localProgramId: "",
                treeList: [],
                treeId: "",
                scenarioList: [],
                scenarioId: "",
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
        var treeId = e.target.value;
        localStorage.setItem("sesTreeId", treeId);
        if (treeId > 0) {
            this.setState({
                treeId: treeId
            }, () => {
                this.getScenarioList()
            })
        } else {
            this.setState({
                treeId: treeId,
                scenarioList: [],
                scenarioId: ""
            }, () => {
                this.getData()
            })
        }
    }
    /**
     * This function is used to get the list of scenarios for a tree
     */
    getScenarioList() {
        var treeList = this.state.treeList;
        if (this.state.treeId > 0) {
            this.setState({ loading: true })
            var treeListFiltered = treeList.filter(c => c.treeId == this.state.treeId)[0];
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
            this.setState({
                scenarioList: treeListFiltered.scenarioList.filter(c => c.active.toString() == "true"),
                treeListFiltered: treeListFiltered,
                loading: false
            }, () => {
                this.setScenarioId(event);
            })
        } else {
            this.setState({
                scenarioList: [],
                scenarioId: ""
            })
        }
    }
    /**
     * This function is used to set the scenario Id selected by the user
     * @param {*} e This is the event value
     */
    setScenarioId(e) {
        var scenarioId = e.target.value;
        localStorage.setItem("sesScenarioId", scenarioId);
        this.setState({
            scenarioId: scenarioId
        }, () => {
            this.getData()
        })
    }
    /**
     * This function is used to set the dataset(program) Id selected by the user
     * @param {*} e This is the event value
     */
    setDatasetId(e) {
        var datasetId = e.target.value;
        localStorage.setItem("sesLiveDatasetId", datasetId);
        if (datasetId > 0) {
            this.setState({
                datasetId: datasetId,
                versionList: [],
                versionId: "",
                treeList: [],
                treeId: "",
                scenarioList: [],
                scenarioId: "",
                dataEl: ""
            }, () => {
                this.getVersionList();
                this.el = jexcel(document.getElementById("tableDiv"), '');
                jexcel.destroy(document.getElementById("tableDiv"), true);
            })
        } else {
            this.setState({
                datasetId: datasetId,
                versionList: [],
                versionId: "",
                scenarioList: [],
                scenarioId: "",
                treeList: [],
                treeId: ""
            }, () => {
                this.getData();
            })
        }
    }
    /**
     * This function is used to add commas to a number and display it till 8 decimals
     * @param {*} cell1 This is value of the number that needs to be formatted
     * @returns This function returns the comma separted value with 8 decimals
     */
    addCommasWith8Decimals(cell1) {
        if (cell1 != null && cell1 != "") {
            cell1 += '';
            var x = cell1.replaceAll(",", "").split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1].slice(0, 8) : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        } else {
            return "";
        }
    }
    /**
     * This function is used to get the data for the product validation
     */
    getData() {
        if (this.state.scenarioId > 0) {
            this.setState({
                loading: true
            })
            var datasetData = this.state.datasetData;
            var treeList = datasetData.treeList;
            var selectedTree = treeList.filter(c => c.treeId == this.state.treeId)[0];
            var flatList = selectedTree.tree.flatList;
            var sortOrderArray = [...new Set(flatList.map(ele => (ele.sortOrder)))];
            var sortedArray = sortOrderArray.sort();
            var items = [];
            for (var i = 0; i < sortedArray.length; i++) {
                items.push(flatList.filter(c => c.sortOrder == sortedArray[i])[0]);
            }
            var nodeDataList = []
            for (var f = 0; f < items.length; f++) {
                var nodeDataMap = items[f].payload.nodeDataMap[this.state.scenarioId][0];
                nodeDataList.push({ nodeDataMap: nodeDataMap, flatItem: items[f] });
            }
            var planningUnitList = nodeDataList.filter(c => c.flatItem.payload.nodeType.id == 5);
            var fuListThatDoesNotHaveChildren = nodeDataList.filter(c => c.flatItem.payload.nodeType.id == 4 && nodeDataList.filter(f => f.flatItem.parent == c.flatItem.id).length == 0);
            planningUnitList = planningUnitList.concat(fuListThatDoesNotHaveChildren);
            var finalData = [];
            for (var i = 0; i < planningUnitList.length; i++) {
                var parentLabelList = [];
                if (planningUnitList[i].flatItem.payload.nodeType.id == 5) {
                    var fuNode = nodeDataList.filter(c => c.flatItem.id == planningUnitList[i].flatItem.parent)[0];
                    var node = nodeDataList.filter(c => c.flatItem.id == planningUnitList[i].flatItem.parent)[0];
                    var levelForNode = node.flatItem.level
                    for (var j = 0; j < (levelForNode); j++) {
                        var parentNode = nodeDataList.filter(c => c.flatItem.id == node.flatItem.parent)[0];
                        if (parentNode != undefined) {
                            parentLabelList.push(getLabelText(parentNode.flatItem.payload.label, this.state.lang));
                            node = parentNode;
                        }
                    }
                    var name = "";
                    for (var p = parentLabelList.length; p > 0; p--) {
                        if (p != 1) {
                            name = name.concat(parentLabelList[p - 1]) + " > "
                        } else {
                            name = name.concat(parentLabelList[p - 1])
                        }
                    }
                    finalData.push({ name: name, nodeDataMap: planningUnitList[i].nodeDataMap, flatItem: planningUnitList[i].flatItem, parentNodeNodeDataMap: fuNode.nodeDataMap, parentNodeFlatItem: fuNode.flatItem, parent: fuNode.flatItem.parent })
                } else {
                    var node = nodeDataList.filter(c => c.flatItem.id == planningUnitList[i].flatItem.parent)[0];
                    var levelForNode = node.flatItem.level
                    parentLabelList.push(getLabelText(node.flatItem.payload.label, this.state.lang));
                    for (var j = 0; j < levelForNode; j++) {
                        var parentNode = nodeDataList.filter(c => c.flatItem.id == node.flatItem.parent)[0];
                        parentLabelList.push(getLabelText(parentNode.flatItem.payload.label, this.state.lang));
                        node = parentNode;
                    }
                    var name = "";
                    for (var p = parentLabelList.length; p > 0; p--) {
                        if (p != 1) {
                            name = name.concat(parentLabelList[p - 1]) + " > "
                        } else {
                            name = name.concat(parentLabelList[p - 1])
                        }
                    }
                    finalData.push({ name: name, nodeDataMap: "", flatItem: "", parentNodeNodeDataMap: planningUnitList[i].nodeDataMap, parentNodeFlatItem: planningUnitList[i].flatItem, parent: planningUnitList[i].flatItem.parent })
                }
            }
            var dataArray = [];
            var data = [];
            var parentId = 0;
            var totalCost = 0;
            for (var i = 0; i < finalData.length; i++) {
                parentId = finalData[i].parentNodeFlatItem.id
                var usageText = '';
                var noOfPersons;
                var noOfForecastingUnitsPerPerson;
                var usageFrequency;
                var selectedText;
                var selectedText1;
                var selectedText2;
                noOfPersons = finalData[i].parentNodeNodeDataMap.fuNode.noOfPersons;
                noOfForecastingUnitsPerPerson = finalData[i].parentNodeNodeDataMap.fuNode.noOfForecastingUnitsPerPerson;
                usageFrequency = finalData[i].parentNodeNodeDataMap.fuNode.usageFrequency;
                var unitList = this.state.unitList;
                try {
                    selectedText = getLabelText(unitList.filter(c => c.unitId == nodeDataList.filter(c => c.flatItem.id == finalData[i].parentNodeFlatItem.parent)[0].flatItem.payload.nodeUnit.id)[0].label, this.state.lang);
                } catch (err) {
                }
                try {
                    if (this.state.versionId.toString().includes("Local")) {
                        selectedText1 = getLabelText(this.state.fuList.filter(c => c.forecastingUnitId == finalData[i].parentNodeNodeDataMap.fuNode.forecastingUnit.id)[0].unit.label, this.state.lang)
                    } else {
                        selectedText1 = getLabelText(finalData[i].parentNodeNodeDataMap.fuNode.forecastingUnit.label, this.state.lang)
                    }
                } catch (error) {
                    selectedText1 = "";
                }
                if (finalData[i].parentNodeNodeDataMap.fuNode.usageType.id == 2 || finalData[i].parentNodeNodeDataMap.fuNode.oneTimeUsage != "true") {
                    var upListFiltered = this.state.upList.filter(c => finalData[i].parentNodeNodeDataMap.fuNode.usagePeriod != null && c.usagePeriodId == finalData[i].parentNodeNodeDataMap.fuNode.usagePeriod.usagePeriodId);
                    if (upListFiltered.length > 0) {
                        selectedText2 = getLabelText(upListFiltered[0].label, this.state.lang);
                    }
                }
                if (finalData[i].parentNodeNodeDataMap.fuNode.usageType.id == 1) {
                    if (finalData[i].parentNodeNodeDataMap.fuNode.oneTimeUsage.toString() != "true") {
                        var selectedText3 = finalData[i].parentNodeNodeDataMap.fuNode.repeatUsagePeriod != null && finalData[i].parentNodeNodeDataMap.fuNode.repeatUsagePeriod.usagePeriodId != '' ? this.state.upList.filter(c => c.usagePeriodId == finalData[i].parentNodeNodeDataMap.fuNode.repeatUsagePeriod.usagePeriodId)[0].label.label_en : '';
                        usageText = i18n.t('static.usageTemplate.every') + " " + noOfPersons + " " + selectedText + " " + i18n.t('static.usageTemplate.requires') + " " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s), " + " " + usageFrequency + " " + i18n.t('static.tree.timesPer') + " " + selectedText2 + " " + i18n.t('static.tree.for') + " " + (finalData[i].parentNodeNodeDataMap.fuNode.repeatCount != null ? finalData[i].parentNodeNodeDataMap.fuNode.repeatCount : '') + " " + selectedText3;
                    } else {
                        usageText = i18n.t('static.usageTemplate.every') + " " + noOfPersons + " " + selectedText + " " + i18n.t('static.usageTemplate.requires') + " " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s)";
                    }
                } else {
                    usageText = i18n.t('static.usageTemplate.every') + " " + noOfPersons + " " + selectedText + "" + i18n.t('static.usageTemplate.requires') + " " + noOfForecastingUnitsPerPerson + " " + selectedText1 + "(s) " + i18n.t('static.usageTemplate.every') + " " + usageFrequency + " " + selectedText2 + " indefinitely";
                }
                var usageTextPU = "";
                if (finalData[i].nodeDataMap != "") {
                    var planningUnitObj = this.state.datasetData.planningUnitList.filter(c => c.planningUnit.id == finalData[i].nodeDataMap.puNode.planningUnit.id);
                    var planningUnit = ""
                    if (planningUnitObj.length > 0) {
                        planningUnit = getLabelText(planningUnitObj[0].planningUnit.label, this.state.lang);
                    }
                    var usagePeriodId;
                    var usageTypeId;
                    var usageFrequency;
                    usageTypeId = finalData[i].parentNodeNodeDataMap.fuNode.usageType.id;
                    usagePeriodId = finalData[i].parentNodeNodeDataMap.fuNode.usagePeriod != null ? finalData[i].parentNodeNodeDataMap.fuNode.usagePeriod.usagePeriodId : "";
                    usageFrequency = finalData[i].parentNodeNodeDataMap.fuNode.usageFrequency;
                    var noOfMonthsInUsagePeriod = 0;
                    if (usagePeriodId != null && usagePeriodId != "") {
                        var usagePeriodObj = this.state.upList.filter(c => c.usagePeriodId == finalData[i].parentNodeNodeDataMap.fuNode.usagePeriod.usagePeriodId);
                        var convertToMonth = usagePeriodObj[0].convertToMonth;
                        if (usageTypeId == 2) {
                            var div = (convertToMonth * usageFrequency);
                            if (div != 0) {
                                noOfMonthsInUsagePeriod = usageFrequency / convertToMonth;
                            }
                        } else {
                            var noOfFUPatient;
                            noOfFUPatient = (finalData[i].parentNodeNodeDataMap.fuNode.noOfForecastingUnitsPerPerson / finalData[i].parentNodeNodeDataMap.fuNode.noOfPersons);
                            noOfMonthsInUsagePeriod = finalData[i].parentNodeNodeDataMap.fuNode.oneTimeUsage != "true" ? convertToMonth * usageFrequency * noOfFUPatient : noOfFUPatient;
                        }
                    }
                    if (finalData[i].parentNodeNodeDataMap.fuNode.usageType.id == 1) {
                        var sharePu;
                        // if (finalData[i].nodeDataMap.puNode.sharePlanningUnit != "true") {
                        sharePu = parseFloat(finalData[i].nodeDataMap.puNode.puPerVisit).toFixed(8);
                        // } else {
                        // sharePu = parseFloat(noOfMonthsInUsagePeriod / finalData[i].nodeDataMap.puNode.planningUnit.multiplier).toFixed(8);
                        // }
                        usageTextPU = i18n.t('static.tree.forEach') + " " + selectedText + " " + i18n.t('static.tree.weNeed') + " " + sharePu + " " + planningUnit;
                    } else {
                        var puPerInterval = parseFloat(finalData[i].nodeDataMap.puNode.puPerVisit).toFixed(8);
                        usageTextPU = i18n.t('static.tree.forEach') + " " + selectedText + " " + i18n.t('static.tree.weNeed') + " " + this.addCommasWith8Decimals((puPerInterval)) + " " + planningUnit + " " + i18n.t('static.usageTemplate.every') + " " + finalData[i].nodeDataMap.puNode.refillMonths + " " + i18n.t('static.report.month');
                    }
                    var currency = this.state.currencyList.filter(c => c.id == this.state.currencyId)[0];
                    var cost = 0;
                    var selectedPlanningUnit = datasetData.planningUnitList.filter(c => c.planningUnit.id == finalData[i].nodeDataMap.puNode.planningUnit.id);
                    var price = "";
                    if (selectedPlanningUnit.length > 0) {
                        price = Number(selectedPlanningUnit[0].price);
                    }
                    var qty = Number(finalData[i].nodeDataMap.puNode.puPerVisit);
                    if (finalData[i].parentNodeNodeDataMap.fuNode.usageType.id == 2) {
                        qty = Number(qty) / Number(finalData[i].nodeDataMap.puNode.refillMonths)
                    }
                    cost = (Number(qty) * price) / currency.conversionRateToUsd;
                }
                if (i > 0 && finalData[i].parent != finalData[i - 1].parent) {
                    data = [];
                    data[0] = "";
                    data[1] = "";
                    data[2] = "";
                    data[3] = "";
                    data[4] = "";
                    data[5] = "";
                    data[6] = "";
                    data[7] = i18n.t('static.productValidation.subTotal');
                    data[8] = totalCost.toFixed(8);
                    data[9] = 1;
                    totalCost = 0;
                    dataArray.push(data);
                }
                data = [];
                data[0] = finalData[i].name;
                data[1] = getLabelText(this.state.utList.filter(c => c.id == finalData[i].parentNodeNodeDataMap.fuNode.usageType.id)[0].label, this.state.lang);
                data[2] = getLabelText(finalData[i].parentNodeNodeDataMap.fuNode.forecastingUnit.label, this.state.lang) + " | " + finalData[i].parentNodeNodeDataMap.fuNode.forecastingUnit.id;
                data[3] = usageText;
                var planningUnitObj = finalData[i].nodeDataMap != "" ? this.state.datasetData.planningUnitList.filter(c => c.planningUnit.id == finalData[i].nodeDataMap.puNode.planningUnit.id) : [];
                data[4] = finalData[i].nodeDataMap != "" && planningUnitObj.length > 0 && planningUnitObj[0].planningUnit.forecastingUnit.id == finalData[i].parentNodeNodeDataMap.fuNode.forecastingUnit.id ? getLabelText(planningUnitObj[0].planningUnit.label, this.state.lang) + " | " + planningUnitObj[0].planningUnit.id : "";
                data[5] = usageTextPU;
                data[6] = selectedPlanningUnit != undefined && selectedPlanningUnit.length > 0 && finalData[i].nodeDataMap != "" ? qty.toFixed(8) : "";
                data[7] = selectedPlanningUnit != undefined && selectedPlanningUnit.length > 0 && finalData[i].nodeDataMap != "" ? this.formatter((price / currency.conversionRateToUsd).toFixed(8)) : "";
                data[8] = selectedPlanningUnit != undefined && selectedPlanningUnit.length > 0 && finalData[i].nodeDataMap != "" ? ((qty * price) / currency.conversionRateToUsd).toFixed(8) : "";
                data[9] = 0;
                totalCost += Number(data[8])
                dataArray.push(data);
            }
            if (finalData.length > 0) {
                data = [];
                data[0] = "";
                data[1] = "";
                data[2] = "";
                data[3] = "";
                data[4] = "";
                data[5] = "";
                data[6] = "";
                data[7] = i18n.t('static.productValidation.subTotal');
                data[8] = totalCost.toFixed(8);
                data[9] = 1;
                totalCost = 0;
                dataArray.push(data);
            }
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            var options = {
                data: dataArray,
                columnDrag: false,
                colWidths: [150, 80, 100, 150, 100, 100],
                colHeaderClasses: ["Reqasterisk"],
                columns: [
                    {
                        title: i18n.t('static.common.level'),
                        type: 'text'
                    },
                    {
                        title: i18n.t('static.supplyPlan.type'),
                        type: 'text'
                    },
                    {
                        title: i18n.t('static.forecastingunit.forecastingunit'),
                        type: 'text'
                    },
                    {
                        title: i18n.t('static.forecastingunit.forecastingunit') + " " + i18n.t('static.common.text'),
                        type: 'text'
                    },
                    {
                        title: i18n.t('static.common.product'),
                        type: 'text'
                    },
                    {
                        title: i18n.t('static.common.product') + " " + i18n.t('static.common.text'),
                        type: 'text'
                    },
                    {
                        title: i18n.t('static.report.qty') + "/" + i18n.t('static.common.person'),
                        type: 'numeric', mask: '#,##.00000000', decimal: '.'
                    },
                    {
                        title: i18n.t('static.supplyPlan.pricePerPlanningUnit'),
                        type: 'text'
                    },
                    {
                        title: i18n.t('static.productValidation.cost') + "/" + i18n.t("static.common.person"),
                        type: 'numeric', mask: '#,##.00000000', decimal: '.'
                    },
                    {
                        title: "IsTotal",
                        type: 'hidden'
                    },
                ],
                onload: this.loaded,
                pagination: false,
                search: false,
                columnSorting: false,
                defaultColWidth: 120,
                wordWrap: true,
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: false,
                copyCompatibility: true,
                allowExport: false,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: 'top',
                filters: true,
                license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
                editable: false,
                contextMenu: function (obj, x, y, e) {
                    return [];
                }.bind(this),
            };
            var dataEl = jexcel(document.getElementById("tableDiv"), options);
            this.el = dataEl;
            this.setState({
                dataEl: dataEl,
                dataList: finalData,
                loading: false
            })
        } else {
            this.el = jexcel(document.getElementById("tableDiv"), '');
            jexcel.destroy(document.getElementById("tableDiv"), true);
            this.setState({
                loading: false,
                dataEl: ""
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
        var json = instance.worksheets[0].getJson(null, false);
        var colArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
        for (var j = 0; j < json.length; j++) {
            if (json[j][9] == 1) {
                for (var i = 0; i < colArr.length; i++) {
                    var cell = instance.worksheets[0].getCell(colArr[i] + (j + 1))
                    cell.classList.add('productValidationSubTotalClass');
                }
            }
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
                versionList.push({ "versionId": newVList[v].versionId, "createdDate": newVList[v].createdDate })
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
            this.setState({
                versionList: [],
                versionId: "",
                loading: false,
                treeList: [],
                treeId: "",
                scenarioList: [],
                scenarioId: ""
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
                    var upTransaction = db1.transaction(['usagePeriod'], 'readwrite');
                    var upOs = upTransaction.objectStore('usagePeriod');
                    var upRequest = upOs.getAll();
                    upRequest.onerror = function (event) {
                    }.bind(this);
                    upRequest.onsuccess = function (event) {
                        var utTransaction = db1.transaction(['usageType'], 'readwrite');
                        var utOs = utTransaction.objectStore('usageType');
                        var utRequest = utOs.getAll();
                        utRequest.onerror = function (event) {
                        }.bind(this);
                        utRequest.onsuccess = function (event) {
                            var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                            var currencyOs = currencyTransaction.objectStore('currency');
                            var currencyRequest = currencyOs.getAll();
                            currencyRequest.onerror = function (event) {
                            }.bind(this);
                            currencyRequest.onsuccess = function (event) {
                                var fuTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                                var fuOs = fuTransaction.objectStore('forecastingUnit');
                                var fuRequest = fuOs.getAll();
                                fuRequest.onerror = function (event) {
                                }.bind(this);
                                fuRequest.onsuccess = function (event) {
                                    var fuList = fuRequest.result;
                                    var unitList = unitRequest.result;
                                    var upList = upRequest.result;
                                    var utList = utRequest.result;
                                    var myResult = [];
                                    myResult = getRequest.result;
                                    var currencyResult = [];
                                    currencyResult = currencyRequest.result;
                                    var currencyList = [];
                                    currencyResult.map(item => {
                                        currencyList.push({ id: item.currencyId, name: getLabelText(item.label, this.state.lang), currencyCode: item.currencyCode, conversionRateToUsd: item.conversionRateToUsd })
                                    })
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
                                                var programNameJson = JSON.parse(programNameLabel);
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
                                        currencyList: currencyList,
                                        unitList: unitList,
                                        upList: upList,
                                        utList: utList,
                                        fuList: fuList,
                                        loading: false
                                    }, () => {
                                        this.setDatasetId(event);
                                    })
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
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
                doc.text(getLabelText(this.state.datasetData.label, this.state.lang), doc.internal.pageSize.width - 40, 60, {
                    align: 'right'
                })
                doc.setFontSize(TITLE_FONT)
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.productValidation'), doc.internal.pageSize.width / 2, 80, {
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
        var planningText = doc.splitTextToSize(i18n.t('static.common.treeName') + ': ' + document.getElementById("treeId").selectedOptions[0].text, doc.internal.pageSize.width * 3 / 4);
        y = y + 10;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 100;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 5;
        }
        planningText = doc.splitTextToSize((i18n.t('static.whatIf.scenario') + ': ' + document.getElementById("scenarioId").selectedOptions[0].text), doc.internal.pageSize.width * 3 / 4);
        y = y + 5;
        for (var i = 0; i < planningText.length; i++) {
            if (y > doc.internal.pageSize.height - 100) {
                doc.addPage();
                y = 100;
            }
            doc.text(doc.internal.pageSize.width / 20, y, planningText[i]);
            y = y + 5;
        }
        y = y + 5;
        doc.text(i18n.t('static.country.currency') + ': ' + document.getElementById("currencyId").selectedOptions[0].text, doc.internal.pageSize.width / 20, y, {
            align: 'left'
        })
        y = y + 5;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        let startY = y + 10
        let pages = Math.ceil(startY / height)
        for (var j = 1; j < pages; j++) {
            doc.addPage()
        }
        let startYtable = startY - ((height - h1) * (pages - 1))
        var columns = [];
        columns.push(i18n.t('static.common.level'));
        columns.push(i18n.t('static.supplyPlan.type'));
        columns.push(i18n.t('static.forecastingunit.forecastingunit'));
        columns.push(i18n.t('static.forecastingunit.forecastingunit') + " " + i18n.t('static.common.text'));
        columns.push(i18n.t('static.common.product'));
        columns.push(i18n.t('static.common.product') + " " + i18n.t('static.common.text'));
        columns.push(i18n.t('static.report.qty') + "/" + i18n.t('static.common.person'));
        columns.push(i18n.t('static.supplyPlan.pricePerPlanningUnit'));
        columns.push(i18n.t('static.productValidation.cost') + "/" + i18n.t("static.common.person"));
        const headers = [columns]
        const data = this.state.dataEl.getJson(null, false).map(ele => [ele[0], ele[1], ele[2], ele[3], ele[4], ele[5], this.formatter(ele[6]), this.formatter(ele[7]), ele[8] != "" ? this.formatter(Number(ele[8]).toFixed(2)) : ""]);
        let content = {
            margin: { top: 100, bottom: 50 },
            startY: startYtable,
            head: headers,
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' },
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(this.state.datasetData.programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.dashboard.productValidation') + "-" + document.getElementById("treeId").selectedOptions[0].text + "-" + document.getElementById("scenarioId").selectedOptions[0].text + ".pdf")
    }
    /**
     * This function is used to export the data in CSV format
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.supplyPlan.runDate') + " " + moment(new Date()).format(`${DATE_FORMAT_CAP}`)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.supplyPlan.runTime') + " " + moment(new Date()).format('hh:mm A')).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.user.user') + ': ' + AuthenticationService.getLoggedInUsername()).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (this.state.datasetData.programCode + " " + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (getLabelText(this.state.datasetData.label, this.state.lang)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.common.treeName') + ': ' + document.getElementById("treeId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.whatIf.scenario') + ': ' + document.getElementById("scenarioId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.country.currency') + ': ' + document.getElementById("currencyId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;
        var columns = [];
        columns.push(i18n.t('static.common.level'));
        columns.push(i18n.t('static.supplyPlan.type'));
        columns.push(i18n.t('static.forecastingunit.forecastingunit'));
        columns.push(i18n.t('static.forecastingunit.forecastingunit') + " " + i18n.t('static.common.text'));
        columns.push(i18n.t('static.common.product'));
        columns.push(i18n.t('static.common.product') + " " + i18n.t('static.common.text'));
        columns.push(i18n.t('static.report.qty') + "/" + i18n.t('static.common.person'));
        columns.push(i18n.t('static.supplyPlan.pricePerPlanningUnit'));
        columns.push(i18n.t('static.productValidation.cost') + "/" + i18n.t("static.common.person"));
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });
        var A = [this.addDoubleQuoteToRowContent(headers)];
        this.state.dataEl.getJson(null, false).map(ele => A.push(this.addDoubleQuoteToRowContent([ele[0].replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''), ele[1].replaceAll(',', ' ').replaceAll(' ', '%20'), ele[2].replaceAll(',', ' ').replaceAll(' ', '%20'), ele[3].replaceAll(',', ' ').replaceAll(' ', '%20'), ele[4].replaceAll(',', ' ').replaceAll(' ', '%20'), ele[5].replaceAll(',', ' ').replaceAll(' ', '%20'), ele[6].toString().replaceAll(',', ' ').replaceAll(' ', '%20'), ele[7].toString().replaceAll(',', ' ').replaceAll(' ', '%20'), ele[8].toString().replaceAll(',', ' ').replaceAll(' ', '%20')])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = this.state.datasetData.programCode + "-" + i18n.t("static.supplyPlan.v") + (document.getElementById("versionId").selectedOptions[0].text) + "-" + i18n.t('static.dashboard.productValidation') + "-" + document.getElementById("treeId").selectedOptions[0].text + "-" + document.getElementById("scenarioId").selectedOptions[0].text + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * This function is used to set the currency Id selected by the user
     * @param {*} e This is the event value
     */
    setCurrencyId(e) {
        var currencyId = e.target.value;
        this.setState({
            currencyId: currencyId
        }, () => {
            if (currencyId > 0) {
                this.getData();
            }
        })
    }
    /**
     * This is used to display the content
     * @returns The product validation data in tabular format along with the different filters
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
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
        const { currencyList } = this.state;
        let currencies = currencyList.length > 0
            && currencyList.map((item, i) => {
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
                        <div className="card-header-actions BacktoLink col-md-12 pl-lg-0 pr-lg-0 pt-lg-3">
                            <a className="pr-lg-0 pt-lg-3">
                                <span className="compareAndSelect-larrow"> <i className="cui-arrow-left icons " > </i></span>
                                <span className="compareAndSelect-rarrow"> <i className="cui-arrow-right icons " > </i></span>
                                <span className="compareAndSelect-larrowText"> {i18n.t('static.common.backTo')} <a href={this.state.datasetId != -1 && this.state.datasetId != "" && this.state.datasetId != undefined && this.state.localProgramId != "" ? "/#/dataSet/buildTree/tree/0/" + this.state.datasetId : "/#/dataSet/buildTree"} className="supplyplanformulas">{i18n.t('static.common.managetree')}</a> </span>
                                <span className="compareAndSelect-rarrowText"> {i18n.t('static.common.continueTo')} <a href="/#/report/compareAndSelectScenario" className="supplyplanformulas">{i18n.t('static.dashboard.compareAndSelect')}</a> {i18n.t('static.tree.or')} <a href="/#/validation/modelingValidation" className='supplyplanformulas'>{i18n.t('static.dashboard.modelingValidation')}</a></span>
                            </a>
                        </div>
                        <div className="Card-header-reporticon pb-0">
                            <a className="pr-lg-0 pt-lg-2 float-right">
                                {this.state.dataEl != "" && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
                            </a>
                            <a className="pr-lg-2 pt-lg-2 float-right">
                                {this.state.dataEl != "" && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />}
                            </a>
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
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.treeName')}</Label>
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
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.country.currency')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="currencyId"
                                                        id="currencyId"
                                                        bsSize="sm"
                                                        onChange={(e) => { this.setCurrencyId(e); }}
                                                        value={this.state.currencyId}
                                                    >
                                                        {currencies}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </div>
                            </Form>
                            <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                <div className="row">
                                    <div className="col-md-12 pl-0 pr-0">
                                        <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: !this.state.loading ? "block" : "none" }}>
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
                    </CardBody>
                </Card>
            </div >
        );
    }
}
export default ProductValidation;