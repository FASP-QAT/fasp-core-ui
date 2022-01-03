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

    getDatasetData() {
        console.log("In get dataset data+++")
        this.setState({
            loading: true
        })
        var versionId = this.state.versionId.toString();
        console.log("In get dataset data+++", versionId);
        if (versionId != "" && versionId.includes("Local")) {
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
                    console.log("resp--------------------", response.data);
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

    getTreeList() {
        this.setState({ loading: true })
        var datasetJson = this.state.datasetData;
        console.log("datasetJson+++", datasetJson);
        var treeList = datasetJson.treeList;
        var treeId = "";
        var event = {
            target: {
                value: ""
            }
        };
        if (treeList.length == 1) {
            treeId = treeList[0].treeId;
            event.target.value = treeList[0].treeId;
        } else if (localStorage.getItem("sesTreeId") != "") {
            treeId = localStorage.getItem("sesTreeId");
            event.target.value = localStorage.getItem("sesTreeId");
        }
        this.setState({
            treeList: treeList,
            loading: false
        }, () => {
            if (treeId != "") {
                this.setTreeId(event);
            }
        })

    }

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

    getScenarioList() {
        var treeList = this.state.treeList;
        if (this.state.treeId > 0) {
            this.setState({ loading: true })
            var treeListFiltered = treeList.filter(c => c.treeId == this.state.treeId)[0];
            // var levelList = [...new Set(treeListFiltered.tree.flatList.map(ele => (ele.level)))]
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
            } else if (localStorage.getItem("sesScenarioId") != "") {
                scenarioId = localStorage.getItem("sesScenarioId");
                event.target.value = localStorage.getItem("sesScenarioId");
            }
            this.setState({
                scenarioList: treeListFiltered.scenarioList,
                // levelList: levelList,
                treeListFiltered: treeListFiltered,
                loading: false
            }, () => {
                if (scenarioId != "") {
                    this.setScenarioId(event);
                }
            })
        } else {
            this.setState({
                scenarioList: [],
                scenarioId: ""
            })
        }
    }

    setScenarioId(e) {
        var scenarioId = e.target.value;
        localStorage.setItem("sesScenarioId", scenarioId);
        this.setState({
            scenarioId: scenarioId
        }, () => {
            this.getData()
        })
    }

    setDatasetId(e) {

        var datasetId = e.target.value;
        localStorage.setItem("sesLiveDatasetId", datasetId);
        if (datasetId > 0) {
            this.setState({
                datasetId: datasetId
            }, () => {
                this.getVersionList();
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

    getData() {
        if (this.state.scenarioId > 0) {
            this.setState({
                loading: true
            })
            var datasetData = this.state.datasetData;
            console.log("DatasetData+++", datasetData);
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
                console.log("NodeDataMap+++", nodeDataMap)
                nodeDataList.push({ nodeDataMap: nodeDataMap, flatItem: items[f] });
            }
            var maxLevel = Math.max.apply(Math, flatList.map(function (o) { return o.level; }))
            console.log("MaxLevel+++", maxLevel);
            var planningUnitList = nodeDataList.filter(c => c.nodeDataMap.puNode != null);
            var fuListThatDoesNotHaveChildren = nodeDataList.filter(c => c.nodeDataMap.fuNode != null && nodeDataList.filter(f => f.parent == c.id).length == 0);
            planningUnitList = planningUnitList.concat(fuListThatDoesNotHaveChildren);
            console.log("PlanningUnitList+++", planningUnitList);
            console.log("fuListThatDoesNotHaveChildren+++", fuListThatDoesNotHaveChildren);
            var finalData = [];
            for (var i = 0; i < planningUnitList.length; i++) {
                if (planningUnitList[i].nodeDataMap.puNode != null) {
                    var fuNode = nodeDataList.filter(c => c.flatItem.id == planningUnitList[i].flatItem.parent)[0];
                    var node = nodeDataList.filter(c => c.flatItem.id == planningUnitList[i].flatItem.parent)[0];
                    var parentLabelList = [];
                    for (var j = 0; j < maxLevel - 1; j++) {
                        var parentNode = nodeDataList.filter(c => c.flatItem.id == node.flatItem.parent)[0];
                        console.log("ParentNode+++", parentNode)
                        console.log("+++Id++", node.flatItem.parent)
                        parentLabelList.push(getLabelText(parentNode.flatItem.payload.label, this.state.lang));
                        node = parentNode;
                    }
                    console.log("Parent Label list+++", parentLabelList)
                    var name = "";
                    console.log("Length+++", parentLabelList.length)
                    for (var p = parentLabelList.length; p > 0; p--) {
                        console.log("In for+++")
                        if (p != 1) {
                            name = name.concat(parentLabelList[p - 1]) + " > "
                        } else {
                            name = name.concat(parentLabelList[p - 1])
                        }
                    }
                    console.log("Name+++", name);
                    finalData.push({ name: name, nodeDataMap: planningUnitList[i].nodeDataMap, flatItem: planningUnitList[i].flatItem, parentNodeNodeDataMap: fuNode.nodeDataMap, parentNodeFlatItem: fuNode.flatItem })
                } else {
                    for (var j = 0; j < maxLevel - 2; j++) {
                        var parentNode = nodeDataList.filter(c => c.flatItem.id == node.flatItem.parent)[0];
                        parentLabelList.push(getLabelText(parentNode.flatItem.payload.label, this.state.lang));
                        node = parentNode;
                    }
                    var name = "";
                    console.log("Length+++", parentLabelList.length)
                    for (var p = parentLabelList.length; p > 0; p--) {
                        console.log("In for+++")
                        if (p != 1) {
                            name = name.concat(parentLabelList[p - 1]) + " > "
                        } else {
                            name = name.concat(parentLabelList[p - 1])
                        }
                    }
                    finalData.push({ name: name, nodeDataMap: "", flatItem: "", parentNodeNodeDataMap: planningUnitList[i].nodeDataMap, parentNodeFlatItem: planningUnitList[i].flatItem })
                }
            }
            console.log("FinalData+++", finalData);
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
                // selectedText = this.state.currentItemConfig.parentItem.payload.nodeUnit.label.label_en
                selectedText = getLabelText(nodeDataList.filter(c => c.flatItem.id == finalData[i].parentNodeFlatItem.parent)[0].flatItem.payload.nodeUnit.label, this.state.lang);
                console.log("+++UNit Label", getLabelText(nodeDataList.filter(c => c.flatItem.id == finalData[i].parentNodeFlatItem.parent)[0].flatItem.payload.nodeUnit.label, this.state.lang));
                selectedText1 = getLabelText(finalData[i].parentNodeNodeDataMap.fuNode.forecastingUnit.unit.label, this.state.lang);
                if (finalData[i].parentNodeNodeDataMap.fuNode.usageType.id == 2 || finalData[i].parentNodeNodeDataMap.fuNode.oneTimeUsage != "true") {
                    selectedText2 = getLabelText(finalData[i].parentNodeNodeDataMap.fuNode.usagePeriod.label, this.state.lang);
                }
                if (finalData[i].parentNodeNodeDataMap.fuNode.usageType.id == 1) {
                    if (finalData[i].parentNodeNodeDataMap.fuNode.oneTimeUsage != "true") {
                        var selectedText3 = finalData[i].parentNodeNodeDataMap.fuNode.repeatUsagePeriod != null ? finalData[i].parentNodeNodeDataMap.fuNode.repeatUsagePeriod.label.label_en : '';
                        usageText = "Every " + noOfPersons + " " + selectedText + " requires " + noOfForecastingUnitsPerPerson + " " + selectedText1 + ", " + usageFrequency + " times per " + selectedText2 + " for " + this.state.currentScenario.fuNode.repeatCount + " " + selectedText3;
                    } else {
                        usageText = "Every " + noOfPersons + " " + selectedText + " requires " + noOfForecastingUnitsPerPerson + " " + selectedText1;
                    }
                } else {
                    usageText = "Every " + noOfPersons + " " + selectedText + " - requires " + noOfForecastingUnitsPerPerson + " " + selectedText1 + " every " + usageFrequency + " " + selectedText2;
                }
                var usageTextPU = "";
                if (finalData[i].nodeDataMap != "") {
                    var planningUnit = getLabelText(finalData[i].nodeDataMap.puNode.planningUnit.label);
                    var usagePeriodId;
                    var usageTypeId;
                    var usageFrequency;

                    usageTypeId = finalData[i].parentNodeNodeDataMap.fuNode.usageType.id;
                    usagePeriodId = finalData[i].parentNodeNodeDataMap.fuNode.usagePeriod.usagePeriodId;
                    usageFrequency = finalData[i].parentNodeNodeDataMap.fuNode.usageFrequency;
                    var noOfMonthsInUsagePeriod = 0;
                    if (usagePeriodId != null && usagePeriodId != "") {
                        var convertToMonth = finalData[i].parentNodeNodeDataMap.fuNode.usagePeriod.convertToMonth;
                        console.log("convertToMonth---", convertToMonth);
                        if (usageTypeId == 2) {
                            var div = (convertToMonth * usageFrequency);
                            console.log("duv---", div);
                            if (div != 0) {
                                noOfMonthsInUsagePeriod = 1 / (convertToMonth * usageFrequency);
                                console.log("noOfMonthsInUsagePeriod---", noOfMonthsInUsagePeriod);
                            }
                        } else {
                            // var noOfFUPatient = this.state.noOfFUPatient;
                            var noOfFUPatient;
                            noOfFUPatient = (finalData[i].parentNodeNodeDataMap.fuNode.noOfForecastingUnitsPerPerson / finalData[i].parentNodeNodeDataMap.fuNode.noOfPersons);
                            noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
                        }
                    }
                    if (finalData[i].parentNodeNodeDataMap.fuNode.usageType.id == 1) {
                        var sharePu;
                        if (finalData[i].nodeDataMap.puNode.sharePlanningUnit == "true") {
                            sharePu = (noOfMonthsInUsagePeriod / finalData[i].nodeDataMap.puNode.planningUnit.multiplier);
                        } else {
                            sharePu = Math.round((noOfMonthsInUsagePeriod / finalData[i].nodeDataMap.puNode.planningUnit.multiplier));
                        }
                        usageTextPU = "For each " + selectedText + " we need " + sharePu + " " + planningUnit;
                    } else {
                        console.log("finalData[i].parentNodeNodeDataMap.fuNode.noOfForecastingUnitsPerPerson+++", finalData[i].parentNodeNodeDataMap.fuNode.noOfForecastingUnitsPerPerson);
                        console.log("noOfMonthsInUsagePeriod+++", noOfMonthsInUsagePeriod);
                        console.log("finalData[i].nodeDataMap.puNode.refillMonths+++", finalData[i].nodeDataMap.puNode.refillMonths);
                        var puPerInterval = (((finalData[i].parentNodeNodeDataMap.fuNode.noOfForecastingUnitsPerPerson / noOfMonthsInUsagePeriod) / 1) / finalData[i].nodeDataMap.puNode.refillMonths);
                        usageTextPU = "For each " + selectedText + " we need " + puPerInterval.toFixed(2) + " " + planningUnit + " every " + finalData[i].nodeDataMap.puNode.refillMonths + " months";
                    }
                    var currency = this.state.currencyList.filter(c => c.id == this.state.currencyId)[0];
                    var cost = 0;
                    var selectedPlanningUnit = datasetData.planningUnitList.filter(c => c.planningUnit.id == finalData[i].nodeDataMap.puNode.planningUnit.id);
                    var price = "";
                    if (selectedPlanningUnit.length > 0) {
                        price = selectedPlanningUnit[0].price;
                    }

                    if (finalData[i].parentNodeNodeDataMap.fuNode.usageType.id == 1) {
                        cost = (sharePu * price) / currency.conversionRateToUsd;
                    } else {
                        if (finalData[i].nodeDataMap.puNode.sharePlanningUnit == "true") {
                            console.log("puPerInterval+++", puPerInterval)
                            console.log("REfill+++", finalData[i].nodeDataMap.puNode.refillMonths);
                            console.log("currency.conversionRateToUsd+++", currency.conversionRateToUsd)
                            cost = ((puPerInterval * (12 / finalData[i].nodeDataMap.puNode.refillMonths)) * price) / currency.conversionRateToUsd;
                        } else {
                            cost = ((12 / finalData[i].nodeDataMap.puNode.refillMonths) * puPerInterval * price) / currency.conversionRateToUsd;
                        }
                    }
                    totalCost += cost;
                }
                data = [];
                data[0] = finalData[i].name;
                data[1] = getLabelText(finalData[i].parentNodeNodeDataMap.fuNode.usageType.label, this.state.lang);
                data[2] = getLabelText(finalData[i].parentNodeNodeDataMap.fuNode.forecastingUnit.label, this.state.lang);
                data[3] = usageText;
                data[4] = finalData[i].nodeDataMap != "" ? getLabelText(finalData[i].nodeDataMap.puNode.planningUnit.label, this.state.lang) : "";
                data[5] = usageTextPU;
                data[6] = selectedPlanningUnit.length > 0 ? cost.toFixed(2) : "";
                data[7] = 0;

                dataArray.push(data);
                if (parentId != finalData[i].parentNodeFlatItem.id || i == finalData.length - 1) {
                    data = [];
                    data[0] = "";
                    data[1] = "";
                    data[2] = "";
                    data[3] = "";
                    data[4] = "";
                    data[5] = i18n.t('static.productValidation.subTotal');
                    data[6] = totalCost.toFixed(2);
                    data[7] = 1;
                    totalCost = 0;
                    dataArray.push(data);
                }
            }
            console.log("DataArray+++", dataArray)
            this.el = jexcel(document.getElementById("tableDiv"), '');
            this.el.destroy();
            var options = {
                data: dataArray,
                columnDrag: true,
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
                        title: i18n.t('static.productValidation.cost'),
                        type: 'numeric'
                    },
                    {
                        title: "IsTotal",
                        type: 'hidden'
                    },
                ],
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
            this.el.destroy();
            this.setState({
                loading: false,
                dataEl: ""
            })
        }
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var json = instance.jexcel.getJson(null, false);
        var colArr = ["A", "B", "C", "D", "E", "F", "G"]
        for (var j = 0; j < json.length; j++) {
            if (json[j][7] == 1) {
                for (var i = 0; i < colArr.length; i++) {
                    instance.jexcel.setStyle(colArr[i] + (j + 1), "background-color", "#808080")
                }
            }
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
            var versionId = "";
            var event = {
                target: {
                    value: ""
                }
            };
            if (versionList.length == 1) {
                versionId = versionList[0];
                event.target.value = versionList[0];
            } else if (localStorage.getItem("sesDatasetVersionId") != "") {
                versionId = localStorage.getItem("sesDatasetVersionId");
                event.target.value = localStorage.getItem("sesDatasetVersionId");
            }
            this.setState({
                versionList: versionList,
                loading: false
            }, () => {
                if (versionId != "") {
                    this.setVersionId(event)
                }
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

    componentDidMount() {
        this.setState({ loading: true });
        ProgramService.getDataSetList().then(response => {
            if (response.status == 200) {
                console.log("resp--------------------", response.data);
                var responseData = response.data;
                var datasetList = [];
                for (var rd = 0; rd < responseData.length; rd++) {
                    var json = {
                        id: responseData[rd].programId,
                        name: getLabelText(responseData[rd].label, this.state.lang),
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


                var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                var currencyOs = currencyTransaction.objectStore('currency');
                var currencyRequest = currencyOs.getAll();
                currencyRequest.onerror = function (event) {
                }.bind(this);
                currencyRequest.onsuccess = function (event) {
                    var myResult = [];
                    myResult = getRequest.result;

                    var currencyResult = [];
                    currencyResult = currencyRequest.result;
                    var currencyList = [];
                    currencyResult.map(item => {
                        currencyList.push({ id: item.currencyId, name: getLabelText(item.label), currencyCode: item.currencyCode, conversionRateToUsd: item.conversionRateToUsd })
                    })
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
                    var datasetId = "";
                    var event = {
                        target: {
                            value: ""
                        }
                    };
                    if (datasetList.length == 1) {
                        console.log("in if%%%", datasetList.length)
                        datasetId = datasetList[0].id;
                        event.target.value = datasetList[0].id;
                    } else if (localStorage.getItem("sesLiveDatasetId") != "") {
                        datasetId = localStorage.getItem("sesLiveDatasetId");
                        event.target.value = localStorage.getItem("sesLiveDatasetId");
                    }
                    this.setState({
                        datasetList: datasetList,
                        currencyList: currencyList,
                        loading: false
                    }, () => {
                        if (datasetId != "") {
                            this.setDatasetId(event);
                        }
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }

    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.dashboard.programheader') + ' : ' + document.getElementById("datasetId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.treeName') + ' : ' + document.getElementById("treeId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.whatIf.scenario') + ' : ' + document.getElementById("scenarioId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.country.currency') + ' : ' + document.getElementById("currencyId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')

        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;
        var columns=[];
        columns.push(i18n.t('static.common.level'));
        columns.push(i18n.t('static.supplyPlan.type'));
        columns.push(i18n.t('static.forecastingunit.forecastingunit'));
        columns.push(i18n.t('static.forecastingunit.forecastingunit') + " " + i18n.t('static.common.text'));
        columns.push(i18n.t('static.common.product'));
        columns.push(i18n.t('static.common.product') + " " + i18n.t('static.common.text'));
        columns.push(i18n.t('static.productValidation.cost'));
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item).replaceAll(' ', '%20') });

        var A = [this.addDoubleQuoteToRowContent(headers)];
        this.state.dataEl.getJson(null,false).map(ele => A.push(this.addDoubleQuoteToRowContent([ele[0].replaceAll(',', ' ').replaceAll(' ', '%20'),ele[1].replaceAll(',', ' ').replaceAll(' ', '%20'),ele[2].replaceAll(',', ' ').replaceAll(' ', '%20'),ele[3].replaceAll(',', ' ').replaceAll(' ', '%20'),ele[4].replaceAll(',', ' ').replaceAll(' ', '%20'),ele[5].replaceAll(',', ' ').replaceAll(' ', '%20'),ele[6].replaceAll(',', ' ').replaceAll(' ', '%20') ])));

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.productValidation') + ".csv"
        document.body.appendChild(a)
        a.click()
    }

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

    render() {
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
                        {/* {this.state.dataList.length > 0 && */}
                        <div className="card-header-actions">
                            {this.state.treeId > 0 && this.state.scenarioId > 0 && this.state.localProgramId != "" && <a className="card-header-action">
                                <a href={`/#/dataSet/buildTree/tree/` + this.state.treeId + `/` + this.state.localProgramId + `/` + this.state.scenarioId}><span style={{ cursor: 'pointer' }}><small className="supplyplanformulas">{i18n.t('static.common.managetree')}</small></span></a>
                            </a>}
                            <a className="card-header-action">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                            </a>
                            {this.state.dataEl!="" && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
                        </div>
                        {/* } */}
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
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.treeName')}</Label>
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
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.country.currency')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="currencyId"
                                                        id="currencyId"
                                                        bsSize="sm"
                                                        // onChange={this.filterVersion}
                                                        onChange={(e) => { this.setCurrencyId(e); }}
                                                        value={this.state.currencyId}

                                                    >
                                                        {/* <option value="">{i18n.t('static.common.select')}</option> */}
                                                        {currencies}
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </div>
                            </Form>
                            <Col md="12 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                {/* {this.state.show && */}
                                <div className="row">
                                    <div className="col-md-12 pl-0 pr-0">

                                        {/* // <div className="table-scroll">
                                                    // <div className="table-wrap table-responsive"> */}
                                        <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: !this.state.loading ? "block" : "none" }}>
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
                        {/* </div> */}
                    </CardBody>
                </Card>
            </div >
        );
    }
}

export default ProductValidation;