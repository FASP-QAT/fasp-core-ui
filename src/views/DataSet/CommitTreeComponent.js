import React from "react";
import ReactDOM from 'react-dom';
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody, Row, Table, PopoverBody, Popover
} from 'reactstrap';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, SECRET_KEY, PENDING_APPROVAL_VERSION_STATUS } from "../../Constants";
import i18n from '../../i18n';
import CryptoJS from 'crypto-js'
import getLabelText from "../../CommonComponent/getLabelText";
import jexcel from 'jexcel-pro';
import { DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import csvicon from '../../assets/img/csv.png';
import { Bar, Line, Pie } from 'react-chartjs-2';
import moment from "moment"
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import DatasetService from "../../api/DatasetService";
import CompareVersionTable from '../CompareVersion/CompareVersionTable.js';
import "../../../node_modules/react-step-progress-bar/styles.css"
import { ProgressBar, Step } from "react-step-progress-bar";
import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../Common/AuthenticationService.js';
const entityname = 'Commit';

export default class CommitTreeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            programId: -1,
            programName: '',
            programList: [],
            showValidation: false,
            versionTypeId: -1,
            programDataLocal: '',
            programDataServer: '',
            programDataDownloaded: '',
            showCompare: false,
            forecastStartDate: '',
            forecastStopDate: '',
            notSelectedPlanningUnitList: [],
            lang: localStorage.getItem("lang"),
            treeScenarioList: [],
            childrenWithoutHundred: [],
            nodeWithPercentageChildren: [],
            consumptionListlessTwelve: [],
            missingMonthList: [],
            treeNodeList: [],
            missingBranchesList: [],
            noForecastSelectedList: [],
            datasetPlanningUnit: [],
            progressPer: 0
        }
        this.synchronize = this.synchronize.bind(this);
        this.updateState = this.updateState.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    componentDidMount = function () {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
            // this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['datasetData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('datasetData');
            var programRequest = programDataOs.getAll();
            programRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
                // this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programList = [];
                var myResult = programRequest.result;
                for (var i = 0; i < myResult.length; i++) {
                    var datasetDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                    var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                    var datasetJson = JSON.parse(datasetData);
                    var programJson = {
                        name: datasetJson.programCode,
                        id: myResult[i].id,
                        version: datasetJson.currentVersion.versionId,
                        datasetJson: datasetJson
                    }
                    programList.push(programJson)
                }
                this.setState({
                    programList: programList
                })
            }.bind(this)
        }.bind(this)
    }

    setProgramId(e) {
        var programId = e.target.value;
        var myResult = [];
        myResult = this.state.programList;
        this.setState({
            programId: programId
        })

        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
            // this.hideFirstComponent()
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['downloadedDatasetData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('downloadedDatasetData');
            var programRequest = programDataOs.get(programId);
            programRequest.onsuccess = function (e) {
                var myResult1 = programRequest.result;
                var datasetDataBytes = CryptoJS.AES.decrypt(myResult1.programData, SECRET_KEY);
                var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                var datasetJson = JSON.parse(datasetData);

                let programData = myResult.filter(c => (c.id == programId));
                this.setState({
                    programDataLocal: programData[0].datasetJson,
                    programDataDownloaded: datasetJson,
                    programName: programData[0].name + 'v' + programData[0].version + ' (local)',
                    forecastStartDate: programData[0].datasetJson.currentVersion.forecastStartDate,
                    forecastStopDate: programData[0].datasetJson.currentVersion.forecastStopDate
                })

                var PgmTreeList = programData[0].datasetJson.treeList;
                console.log("Program --", programData[0].datasetJson);

                var treePlanningUnitList = [];
                var treeNodeList = [];
                var treeScenarioList = [];
                var missingBranchesList = [];
                for (var tl = 0; tl < PgmTreeList.length; tl++) {
                    var treeList = PgmTreeList[tl];
                    var flatList = treeList.tree.flatList;
                    for (var fl = 0; fl < flatList.length; fl++) {
                        var payload = flatList[fl].payload;
                        var nodeDataMap = payload.nodeDataMap;
                        var scenarioList = treeList.scenarioList;
                        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                            if (payload.nodeType.id == 5) {
                                var nodePlanningUnit = ((nodeDataMap[scenarioList[ndm].id])[0].puNode.planningUnit);
                                treePlanningUnitList.push(nodePlanningUnit);
                            }

                            //Tree scenario and node notes
                            var nodeNotes = ((nodeDataMap[scenarioList[ndm].id])[0].notes);
                            var modelingList = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataModelingList);
                            var madelingNotes = "";
                            for (var ml = 0; ml < modelingList.length; ml++) {
                                madelingNotes = madelingNotes.concat(modelingList[ml].notes)
                            }
                            treeNodeList.push({
                                tree: PgmTreeList[tl].label,
                                scenario: scenarioList[ndm].label,
                                node: payload.label,
                                notes: nodeNotes,
                                madelingNotes: madelingNotes,
                                scenarioNotes: scenarioList[ndm].notes
                            });
                        }
                        // Tree Forecast : branches missing PU
                        var flatListFiltered = flatList.filter(c => flatList.filter(f => f.parent == c.id).length == 0);
                        var flatListArray = []
                        for (var flf = 0; flf < flatListFiltered.length; flf++) {
                            var nodeTypeId = flatListFiltered[flf].payload.nodeType.id;
                            if (nodeTypeId != 5) {
                                flatListArray.push(flatListFiltered[flf]);
                            }
                        }
                    }
                    missingBranchesList.push({
                        treeId: PgmTreeList[tl].treeId,
                        treeLabel: PgmTreeList[tl].label,
                        flatList: flatListArray
                    })

                    //Nodes less than 100%
                    var scenarioList = PgmTreeList[tl].scenarioList;
                    var treeId = PgmTreeList[tl].treeId;
                    for (var sc = 0; sc < scenarioList.length; sc++) {
                        treeScenarioList.push(
                            {
                                "treeId": treeId,
                                "treeLabel": PgmTreeList[tl].label,
                                "scenarioId": scenarioList[sc].id,
                                "scenarioLabel": scenarioList[sc].label
                            });
                    }
                }
                this.setState({
                    treeNodeList: treeNodeList,
                    treeScenarioList: treeScenarioList,
                    missingBranchesList: missingBranchesList
                })

                // Tree Forecast : planing unit missing on tree
                var puRegionList = []
                var datasetRegionList = programData[0].datasetJson.regionList;
                for (var drl = 0; drl < datasetRegionList.length; drl++) {
                    for (var ptl = 0; ptl < PgmTreeList.length; ptl++) {
                        let regionListFiltered = PgmTreeList[ptl].regionList.filter(c => (c.id == datasetRegionList[drl].regionId));
                        if (regionListFiltered.length == 0) {
                            var regionIndex = puRegionList.findIndex(i => i == getLabelText(datasetRegionList[drl].label, this.state.lang))
                            if (regionIndex == -1) {
                                puRegionList.push(getLabelText(datasetRegionList[drl].label, this.state.lang))
                            }
                        }
                    }
                }
                var datasetPlanningUnit = programData[0].datasetJson.planningUnitList;
                var notSelectedPlanningUnitList = [];
                for (var dp = 0; dp < datasetPlanningUnit.length; dp++) {
                    var puId = datasetPlanningUnit[dp].planningUnit.id;
                    let planningUnitNotSelected = treePlanningUnitList.filter(c => (c.id == puId));
                    if (planningUnitNotSelected.length == 0) {
                        notSelectedPlanningUnitList.push({
                            planningUnit: datasetPlanningUnit[dp].planningUnit,
                            regionsArray: datasetRegionList.map(c => getLabelText(c.label, this.state.lang))
                        });
                    } else {
                        notSelectedPlanningUnitList.push({
                            planningUnit: datasetPlanningUnit[dp].planningUnit,
                            regionsArray: puRegionList
                        });
                    }
                }
                this.setState({
                    notSelectedPlanningUnitList: notSelectedPlanningUnitList,
                    datasetPlanningUnit: datasetPlanningUnit
                })
                //*** */

                this.setState({
                }, () => {
                    var startDate = moment(programData[0].datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
                    var stopDate = moment(programData[0].datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
                    var curDate = startDate;
                    var nodeDataModelingList = programData[0].datasetJson.nodeDataModelingList;
                    var childrenWithoutHundred = [];
                    var nodeWithPercentageChildren = [];

                    for (var i = 0; curDate < stopDate; i++) {
                        curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                        for (var tl = 0; tl < PgmTreeList.length; tl++) {
                            var treeList = PgmTreeList[tl];
                            var flatList = treeList.tree.flatList;
                            for (var fl = 0; fl < flatList.length; fl++) {
                                var payload = flatList[fl].payload;
                                var nodeDataMap = payload.nodeDataMap;
                                var scenarioList = treeList.scenarioList;
                                for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                                    // var nodeModellingList = nodeDataModelingList.filter(c => c.month == curDate);
                                    var nodeChildrenList = flatList.filter(c => flatList[fl].id == c.parent && (c.payload.nodeType.id == 3 || c.payload.nodeType.id == 4 || c.payload.nodeType.id == 5));
                                    if (nodeChildrenList.length > 0) {
                                        var totalPercentage = 0;
                                        for (var ncl = 0; ncl < nodeChildrenList.length; ncl++) {
                                            var payloadChild = nodeChildrenList[ncl].payload;
                                            var nodeDataMapChild = payloadChild.nodeDataMap;
                                            var nodeDataMapForScenario = (nodeDataMapChild[scenarioList[ndm].id])[0];

                                            var nodeModellingList = nodeDataMapForScenario.nodeDataMomList.filter(c => c.month == curDate);
                                            var nodeModellingListFiltered = nodeModellingList;
                                            if (nodeModellingListFiltered.length > 0) {
                                                totalPercentage += nodeModellingListFiltered[0].endValue;
                                            }
                                        }
                                        childrenWithoutHundred.push(
                                            {
                                                "treeId": PgmTreeList[tl].treeId,
                                                "scenarioId": scenarioList[ndm].id,
                                                "month": curDate,
                                                "label": payload.label,
                                                "id": flatList[fl].id,
                                                "percentage": totalPercentage
                                            }
                                        )
                                        if (i == 0) {
                                            var index = nodeWithPercentageChildren.findIndex(c => c.id == flatList[fl].id);
                                            if (index == -1) {
                                                nodeWithPercentageChildren.push(
                                                    {
                                                        "id": flatList[fl].id,
                                                        "label": payload.label,
                                                        "treeId": PgmTreeList[tl].treeId,
                                                        "scenarioId": scenarioList[ndm].id,
                                                    }
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    this.setState({
                        childrenWithoutHundred: childrenWithoutHundred,
                        nodeWithPercentageChildren: nodeWithPercentageChildren,
                        startDate: startDate,
                        stopDate: stopDate
                    })
                })

                var programVersionJson = [];
                var json = {
                    programId: programData[0].datasetJson.programId,
                    versionId: '-1'
                }
                programVersionJson = programVersionJson.concat([json]);
                DatasetService.getAllDatasetData(programVersionJson)
                    .then(response => {
                        this.setState({
                            programDataServer: response.data[0],
                            showCompare: true,
                            comparedLatestVersion: response.data[0].currentVersion.versionId
                        })
                    })

                // Consumption Forecast
                var startDate = moment(programData[0].datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
                var stopDate = moment(programData[0].datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");

                var consumptionList = programData[0].datasetJson.actualConsumptionList;
                var missingMonthList = [];

                //Consumption : planning unit less 24 month
                var consumptionListlessTwelve = [];
                var noForecastSelectedList = [];
                for (var dpu = 0; dpu < datasetPlanningUnit.length; dpu++) {
                    for (var drl = 0; drl < datasetRegionList.length; drl++) {
                        var curDate = startDate;
                        var monthsArray = [];
                        var puId = datasetPlanningUnit[dpu].planningUnit.id;
                        var regionId = datasetRegionList[drl].regionId;
                        var consumptionListFiltered = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId);
                        if (consumptionListFiltered.length < 24) {
                            consumptionListlessTwelve.push({
                                planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
                                planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
                                regionId: datasetRegionList[drl].regionId,
                                regionLabel: datasetRegionList[drl].label,
                                noOfMonths: consumptionListFiltered.length
                            })
                        }

                        //Consumption : missing months
                        for (var i = 0; curDate < stopDate; i++) {
                            curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                            var consumptionListFilteredForMonth = consumptionList.filter(c => c.planningUnit.id == puId && c.region.id == regionId && c.month == curDate);
                            if (consumptionListFilteredForMonth.length == 0) {
                                monthsArray.push(moment(curDate).format(DATE_FORMAT_CAP_WITHOUT_DATE));
                            }
                        }

                        if (monthsArray.length > 0) {
                            missingMonthList.push({
                                planningUnitId: datasetPlanningUnit[dpu].planningUnit.id,
                                planningUnitLabel: datasetPlanningUnit[dpu].planningUnit.label,
                                regionId: datasetRegionList[drl].regionId,
                                regionLabel: datasetRegionList[drl].label,
                                monthsArray: monthsArray
                            })
                        }
                    }
                    //No Forecast selected
                    var selectedForecast = datasetPlanningUnit[dpu].selectedForecastMap;
                    var regionArray = [];
                    for (var drl = 0; drl < datasetRegionList.length; drl++) {
                        if (selectedForecast[datasetRegionList[drl].regionId] == undefined) {
                            regionArray.push(getLabelText(datasetRegionList[drl].label, this.state.lang));
                        }
                    }
                    noForecastSelectedList.push({
                        planningUnit: datasetPlanningUnit[dpu],
                        regionList: regionArray
                    })
                }
                this.setState({
                    consumptionListlessTwelve: consumptionListlessTwelve,
                    missingMonthList: missingMonthList,
                    noForecastSelectedList: noForecastSelectedList,
                    progressPer: 25
                })

            }.bind(this)
        }.bind(this)
        //*** */
    }


    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })
    }


    buildJxl() {
        var treeScenarioList = this.state.treeScenarioList;
        var treeScenarioListFilter = treeScenarioList;
        for (var tsl = 0; tsl < treeScenarioListFilter.length; tsl++) {
            var nodeWithPercentageChildren = this.state.nodeWithPercentageChildren.filter(c => c.treeId == treeScenarioListFilter[tsl].treeId && c.scenarioId == treeScenarioListFilter[tsl].scenarioId);
            if (nodeWithPercentageChildren.length > 0) {
                let childrenList = this.state.childrenWithoutHundred;
                let childrenArray = [];
                var data = [];
                let startDate = this.state.startDate;
                let stopDate = this.state.stopDate;
                var curDate = startDate;
                var nodeWithPercentageChildrenWithHundredCent = [];
                for (var i = 0; curDate < stopDate; i++) {
                    curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                    data = [];
                    data[0] = curDate;
                    for (var nwp = 0; nwp < nodeWithPercentageChildren.length; nwp++) {
                        var child = childrenList.filter(c => c.id == nodeWithPercentageChildren[nwp].id && c.month == curDate);
                        data[nwp + 1] = child.length > 0 ? (child[0].percentage).toFixed(2) : '';
                        nodeWithPercentageChildrenWithHundredCent[nwp] = nodeWithPercentageChildrenWithHundredCent[nwp] != 1 ? (child.length > 0 && (child[0].percentage).toFixed(2) != 100) ? 1 : 0 : 1;
                    }
                    childrenArray.push(data);
                }

                this.el = jexcel(document.getElementById("tableDiv" + tsl), '');
                this.el.destroy();

                var columnsArray = [];
                columnsArray.push({
                    title: "Month",
                    type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100,
                    // readOnly: true
                });
                for (var nwp = 0; nwp < nodeWithPercentageChildren.length; nwp++) {
                    columnsArray.push({
                        title: nodeWithPercentageChildren[nwp].label.label_en,
                        type: nodeWithPercentageChildrenWithHundredCent[nwp] == 1 ? 'numeric' : 'hidden',
                        mask: '#,##.00%', decimal: '.'
                        // readOnly: true
                    });
                }
                var options = {
                    data: childrenArray,
                    columnDrag: true,
                    colWidths: [0, 150, 150, 150, 100, 100, 100],
                    colHeaderClasses: ["Reqasterisk"],
                    columns: columnsArray,
                    text: {
                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                        show: '',
                        entries: '',
                    },
                    onload: function (instance, cell, x, y, value) {
                        jExcelLoadedFunction(instance);
                    },
                    updateTable: function (el, cell, x, y, source, value, id) {
                        if (y != null && x != 0) {
                            if (value != "100.00%") {
                                var elInstance = el.jexcel;
                                cell.classList.add('red');
                            }
                        }
                    },

                    pagination: localStorage.getItem("sesRecordCount"),
                    search: false,
                    columnSorting: true,
                    tableOverflow: true,
                    wordWrap: true,
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    allowDeleteRow: false,
                    onselection: this.selected,
                    oneditionend: this.onedit,
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
                var languageEl = jexcel(document.getElementById("tableDiv" + tsl), options);
                this.el = languageEl;
            }
        }
    }

    toggleShowValidation() {
        this.setState({
            showValidation: !this.state.showValidation
        }, () => {
            if (this.state.showValidation) {
                this.setState({
                    loading: true
                }, () => {
                    this.buildJxl();
                })
            }
        })
    }

    setVersionTypeId(e) {
        var versionTypeId = e.target.value;
        this.setState({
            versionTypeId: versionTypeId
        })
    }

    redirectToDashbaord(commitRequestId) {
        this.setState({ loading: true });

        const sendGetRequest = async () => {
            try {
                AuthenticationService.setupAxiosInterceptors();
                const resp = await ProgramService.sendNotificationAsync(commitRequestId);
                var curUser = AuthenticationService.getLoggedInUserId();
                if (resp.data.createdBy.userId == curUser && resp.data.status == 2) {
                    this.setState({
                        progressPer: 75
                        , message: i18n.t('static.commitVersion.serverProcessingCompleted'), color: 'green'
                    }, () => {
                        // this.hideFirstComponent();
                        this.getLatestProgram({ openModal: true, notificationDetails: resp.data });
                    })
                }
            } catch (err) {
                // Handle Error Here
                console.error("Error+++", err);
            }
        };
        sendGetRequest();
    }

    getLatestProgram(notificationDetails) {
        var updatedJson = [];
        this.setState({ loading: true });
        var checkboxesChecked = [];
        var programIdsToSyncArray = [];
        var notificationArray = [];
        notificationArray.push(notificationDetails)
        var programIdsSuccessfullyCommitted = notificationArray;
        for (var i = 0; i < programIdsSuccessfullyCommitted.length; i++) {
            var index = checkboxesChecked.findIndex(c => c.programId == programIdsSuccessfullyCommitted[i].notificationDetails.program.id);
            if (index == -1) {
                checkboxesChecked.push({ programId: programIdsSuccessfullyCommitted[i].notificationDetails.program.id, versionId: -1 })
            }
        }
        DatasetService.getAllDatasetData(checkboxesChecked)
            .then(response => {
                var json = response.data;

                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                    // this.hideFirstComponent()
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;

                    var datasetDataTransaction = db1.transaction(['datasetData'], 'readwrite');
                    var datasetDataOs = datasetDataTransaction.objectStore('datasetData');
                    var datasetRequest = datasetDataOs.delete(this.state.programId);

                    datasetDataTransaction.oncomplete = function (event) {
                        var datasetDataTransaction1 = db1.transaction(['downloadedDatasetData'], 'readwrite');
                        var datasetDataOs1 = datasetDataTransaction1.objectStore('downloadedDatasetData');
                        var datasetRequest1 = datasetDataOs1.delete(this.state.programId);

                        datasetDataTransaction1.oncomplete = function (event) {
                            var programDataTransaction2 = db1.transaction(['downloadedDatasetData'], 'readwrite');
                            programDataTransaction2.oncomplete = function (event) {

                                var transactionForSavingData = db1.transaction(['datasetData'], 'readwrite');
                                var programSaveData = transactionForSavingData.objectStore('datasetData');
                                for (var r = 0; r < json.length; r++) {
                                    json[r].actionList = [];
                                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                    // var version = json[r].requestedProgramVersion;
                                    // if (version == -1) {
                                    var version = json[r].currentVersion.versionId
                                    // }
                                    var item = {
                                        id: json[r].programId + "_v" + version + "_uId_" + userId,
                                        programId: json[r].programId,
                                        version: version,
                                        programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                        programData: (CryptoJS.AES.encrypt(JSON.stringify((json[r])), SECRET_KEY)).toString(),
                                        userId: userId,
                                        programCode: json[r].programCode
                                    };
                                    programIdsToSyncArray.push(json[r].programId + "_v" + version + "_uId_" + userId)
                                    var putRequest = programSaveData.put(item);

                                }
                                transactionForSavingData.oncomplete = function (event) {
                                    var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedDatasetData'], 'readwrite');
                                    var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedDatasetData');
                                    for (var r = 0; r < json.length; r++) {
                                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                        var version = json[r].requestedProgramVersion;
                                        if (version == -1) {
                                            version = json[r].currentVersion.versionId
                                        }
                                        var item = {
                                            id: json[r].programId + "_v" + version + "_uId_" + userId,
                                            programId: json[r].programId,
                                            version: version,
                                            programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                            programData: (CryptoJS.AES.encrypt(JSON.stringify((json[r])), SECRET_KEY)).toString(),
                                            userId: userId
                                        };
                                        var putRequest = downloadedProgramSaveData.put(item);

                                    }
                                    transactionForSavingDownloadedProgramData.oncomplete = function (event) {
                                        //     var programQPLDetailsTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                                        //     var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('programQPLDetails');
                                        //     var programIds = []
                                        //     for (var r = 0; r < json.length; r++) {
                                        //         var programQPLDetailsJson = {
                                        //             id: json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId,
                                        //             programId: json[r].programId,
                                        //             version: json[r].currentVersion.versionId,
                                        //             userId: userId,
                                        //             programCode: json[r].programCode,
                                        //             openCount: 0,
                                        //             addressedCount: 0,
                                        //             programModified: 0,
                                        //             readonly: 0
                                        //         };
                                        //         programIds.push(json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId);
                                        //         var programQPLDetailsRequest = programQPLDetailsOs.put(programQPLDetailsJson);
                                        //     }
                                        //     programQPLDetailsTransaction.oncomplete = function (event) {
                                        this.setState({
                                            progressPer: 100
                                        })
                                        this.goToMasterDataSync(programIdsToSyncArray);
                                        //     }.bind(this)
                                    }.bind(this)
                                }.bind(this);
                            }.bind(this);
                        }.bind(this);
                    }.bind(this);
                }.bind(this);
            })

    }

    goToMasterDataSync(programIds) {
        this.props.history.push({ pathname: `/syncProgram/green/` + i18n.t('static.message.commitSuccess'), state: { "programIds": programIds } });
    }


    synchronize() {
        this.toggleShowValidation();
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext')
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['datasetData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('datasetData');
            var programRequest = programDataOs.get((this.state.programId));
            programRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
            }.bind(this);
            programRequest.onsuccess = function (e) {

                var datasetDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                var datasetJson = JSON.parse(datasetData);
                var programJson = datasetJson;
                programJson.versionType = { id: document.getElementById("versionTypeId").value };
                programJson.versionStatus = { id: 2 };
                programJson.notes = document.getElementById("notesId").value;

                //create saveDatasetData in ProgramService
                DatasetService.saveDatasetData(programJson, this.state.comparedLatestVersion).then(response => {
                    if (response.status == 200) {

                        this.setState({
                            progressPer: 50
                            , message: i18n.t('static.commitVersion.sendLocalToServerCompleted'), color: 'green'
                        }, () => {
                            // this.hideFirstComponent();
                            // getLatestProgram also copy , use getAllDatasetData instead getAllProgramData
                            this.redirectToDashbaord(response.data);
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode,
                            color: "red",
                            loading: false
                        })
                        // this.hideFirstComponent();
                    }
                })
                    .catch(
                        error => {
                            console.log("@@@Error4", error);
                            console.log("@@@Error4", error.message);
                            console.log("@@@Error4", error.response ? error.response.status : "")
                            if (error.message === "Network Error") {
                                console.log("+++in catch 7")
                                this.setState({
                                    message: 'static.common.networkError',
                                    color: "red",
                                    loading: false
                                }, () => {
                                    // this.hideFirstComponent();
                                });
                            } else {
                                switch (error.response ? error.response.status : "") {

                                    case 401:
                                        this.props.history.push(`/login/static.message.sessionExpired`)
                                        break;
                                    case 403:
                                        this.props.history.push(`/accessDenied`)
                                        break;
                                    case 406:
                                        if (error.response.data.messageCode == 'static.commitVersion.versionIsOutDated') {
                                            alert(i18n.t("static.commitVersion.versionIsOutDated"));
                                        }
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            color: "red",
                                            loading: false
                                        }, () => {
                                            // this.hideFirstComponent()
                                            if (error.response.data.messageCode == 'static.commitVersion.versionIsOutDated') {
                                                this.checkLastModifiedDateForProgram(this.state.programId);
                                            }
                                        });
                                        break;
                                    case 500:
                                    case 404:
                                    case 412:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            loading: false,
                                            color: "red"
                                        }, () => {
                                            // this.hideFirstComponent()
                                        });
                                        break;
                                    default:
                                        console.log("+++in catch 8")
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false,
                                            color: "red"
                                        }, () => {
                                            // this.hideFirstComponent()
                                        });
                                        break;
                                }
                            }
                        }
                    );
            }.bind(this)
        }.bind(this)
    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    render() {
        const { programList } = this.state;
        let programs = programList.length > 0 && programList.map((item, i) => {
            return (
                <option key={i} value={item.id}>
                    {item.name}-v{item.version}
                </option>
            )
        }, this);

        //No forecast selected
        const { noForecastSelectedList } = this.state;
        let noForecastSelected = noForecastSelectedList.length > 0 && noForecastSelectedList.map((item, i) => {
            return (
                <li key={i}>
                    <div>{getLabelText(item.planningUnit.planningUnit.label, this.state.lang) + " - " + item.regionList}</div>
                </li>
            )
        }, this);

        //Consumption : missing months
        const { missingMonthList } = this.state;
        let missingMonths = missingMonthList.length > 0 && missingMonthList.map((item, i) => {
            return (
                <li key={i}>
                    <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b>{"" + item.monthsArray}</span></div>
                </li>
            )
        }, this);

        //Consumption : planning unit less 12 month
        const { consumptionListlessTwelve } = this.state;
        let consumption = consumptionListlessTwelve.length > 0 && consumptionListlessTwelve.map((item, i) => {
            return (
                <li key={i}>
                    <div><span><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b></span><span>{item.noOfMonths + " month(s)"}</span></div>
                </li>
            )
        }, this);

        // Tree Forecast : planing unit missing on tree
        const { notSelectedPlanningUnitList } = this.state;
        let pu = notSelectedPlanningUnitList.length > 0 && notSelectedPlanningUnitList.map((item, i) => {
            return (
                <li key={i}>
                    <div>{getLabelText(item.planningUnit.label, this.state.lang) + " - " + item.regionsArray}</div>
                </li>
            )
        }, this);

        // Tree Forecast : branches missing PU
        const { missingBranchesList } = this.state;
        let missingBranches = missingBranchesList.length > 0 && missingBranchesList.map((item, i) => {
            return (
                <ul>
                    <li key={i}>
                        <div><span>{getLabelText(item.treeLabel, this.state.lang)}</span></div>
                        {item.flatList.length > 0 && item.flatList.map((item1, j) => {
                            return (
                                <ul>
                                    <li key={j}>
                                        <div><span className={item1.payload.nodeType.id == 4 ? "red" : ""}>{getLabelText(item1.payload.label, this.state.lang)}</span></div>
                                    </li>
                                </ul>
                            )
                        }, this)}
                    </li>
                </ul>
            )
        }, this);

        //Nodes less than 100%
        let jxlTable = this.state.treeScenarioList.map((item1, count) => {
            var nodeWithPercentageChildren = this.state.nodeWithPercentageChildren.filter(c => c.treeId == item1.treeId && c.scenarioId == item1.scenarioId);
            if (nodeWithPercentageChildren.length > 0) {
                return (<><span>{item1.treeLabel.label_en + " / " + item1.scenarioLabel.label_en}</span><div className="table-responsive">
                    <div id={"tableDiv" + count} className="jexcelremoveReadonlybackground consumptionDataEntryTable" />
                </div><br /></>)
            }
        }, this)

        //Consumption Notes
        const { datasetPlanningUnit } = this.state;
        let consumtionNotes = datasetPlanningUnit.length > 0 && datasetPlanningUnit.map((item, i) => {
            return (
                <tr key={i}>
                    <td>{getLabelText(item.planningUnit.label, this.state.lang)}</td>
                    <td>{item.consumtionNotes}</td>
                </tr>
            )
        }, this);

        //Tree scenario Notes
        const { treeNodeList } = this.state;
        let scenarioNotes = treeNodeList.length > 0 && treeNodeList.map((item, i) => {
            return (
                <tr key={i}>
                    <td>{getLabelText(item.tree, this.state.lang)}</td>
                    <td>{getLabelText(item.scenario, this.state.lang)}</td>
                    <td>{item.scenarioNotes}</td>
                </tr>
            )
        }, this);

        //Tree Nodes Notes
        let treeNodes = treeNodeList.length > 0 && treeNodeList.map((item, i) => {
            return (
                <tr key={i}>
                    <td>{getLabelText(item.tree, this.state.lang)}</td>
                    <td>{getLabelText(item.node, this.state.lang)}</td>
                    <td>{getLabelText(item.scenario, this.state.lang)}</td>
                    <td>{(item.notes != "" && item.notes != null) ? "Main : " + item.notes : ""}<br />
                        {(item.madelingNotes != "" && item.madelingNotes != null) ? "Modeling : " + item.madelingNotes : ""}</td>
                </tr>
            )
        }, this);



        return (
            <div className="animated fadeIn" >
                <Card>
                    <CardBody>
                        <ProgressBar
                            percent={this.state.progressPer}
                            filledBackground="linear-gradient(to right, #fefb72, #f0bb31)"
                            style={{ width: '75%' }}
                        >
                            <Step transition="scale">
                                {({ accomplished }) => (

                                    <img
                                        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                        width="30"
                                        src="../../../../public/assets/img/numbers/number1.png"
                                    />
                                )}

                            </Step>

                            <Step transition="scale">
                                {({ accomplished }) => (
                                    <img
                                        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                        width="30"
                                        src="../../../../public/assets/img/numbers/number2.png"
                                    />
                                )}
                            </Step>
                            <Step transition="scale">
                                {({ accomplished }) => (
                                    <img
                                        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                        width="30"
                                        src="../../../../public/assets/img/numbers/number3.png"
                                    />
                                )}

                            </Step>

                            <Step transition="scale">
                                {({ accomplished }) => (
                                    <img
                                        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                        width="30"
                                        src="../../../../public/assets/img/numbers/number4.png"
                                    />
                                )}

                            </Step>

                            <Step transition="scale">
                                {({ accomplished }) => (
                                    <img
                                        style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                                        width="30"
                                        src="../../../../public/assets/img/numbers/number5.png"
                                    />
                                )}

                            </Step>
                        </ProgressBar>
                        <div className="d-sm-down-none  progressbar">
                            <ul>
                                <li className="quantimedProgressbartext1">Compare Data</li>
                                <li className="quantimedProgressbartext2">Resolve Conflicts</li>
                                <li className="quantimedProgressbartext3">Sending data to server</li>
                                <li className="quantimedProgressbartext4">Server processing</li>
                                <li className="quantimedProgressbartext5">Upgrade local to latest version</li>
                            </ul>
                        </div>
                        <Form name='simpleForm'>
                            <div className=" pl-0">
                                <div className="row">
                                    <FormGroup className="col-md-3 ">
                                        <Label htmlFor="appendedInputButton">Program</Label>
                                        <div className="controls ">
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                value={this.state.programId}
                                                onChange={(e) => { this.setProgramId(e); }}
                                            >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {programs}
                                            </Input>
                                        </div>
                                    </FormGroup>
                                </div>
                            </div>
                            {(this.state.showCompare) &&
                                <>
                                    <CompareVersionTable ref="conflictChild" page="commit" datasetData={this.state.programDataLocal} datasetData1={this.state.programDataServer} datasetData2={this.state.programDataDownloaded} versionLabel={"V" + this.state.programDataLocal.currentVersion.versionId + "(Local)"} versionLabel1={"V" + this.state.programDataServer.currentVersion.versionId + "(Server)"} updateState={this.updateState} />
                                    <div className="table-responsive RemoveStriped">
                                        <div id="tableDiv" />
                                    </div>
                                    <div className="col-md-10 pt-4 pb-3">
                                        <ul className="legendcommitversion">
                                            {/* <li><span className="lightpinklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.conflicts')}</span></li> */}
                                            <li><span className=" greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')} </span></li>
                                            <li><span className="notawesome legendcolor"></span > <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
                                        </ul>
                                    </div>
                                </>
                            }

                            {/* <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.reset}><i className="fa fa-refresh"></i> Cancel</Button>
                                <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-check"></i>Next</Button>
                            </div> */}
                        </Form>

                        <div className="row">
                            <FormGroup className="col-md-3 ">
                                <Label htmlFor="appendedInputButton">Version Type</Label>
                                <div className="controls ">
                                    <Input
                                        type="select"
                                        name="versionTypeId"
                                        id="versionTypeId"
                                        bsSize="sm"
                                        value={this.state.versionTypeId}
                                        onChange={(e) => { this.setVersionTypeId(e); }}
                                    >
                                        <option value="">{i18n.t('static.common.select')}</option>
                                        <option value="1">Draft Version</option>
                                        <option value="2">Final Version</option>
                                    </Input>
                                </div>
                            </FormGroup>
                            <FormGroup className="col-md-4 ">
                                <Label htmlFor="appendedInputButton">Notes</Label>
                                <Input
                                    className="controls"
                                    type="textarea"
                                    id="notesId"
                                    name="notesId"
                                />
                            </FormGroup>

                            <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-refresh"></i> Cancel</Button>
                                {/* <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>Commit</Button> */}
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-check"></i>Commit</Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Modal isOpen={this.state.showValidation}
                    className={'modal-lg ' + this.props.className} >
                    <ModalHeader toggle={() => this.toggleShowValidation()} className="modalHeaderSupplyPlan">
                        <h3><strong>Forecast Validation</strong></h3>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <span><b>{this.state.programName}</b></span><br />
                            <span><b>Forecast Period: </b> {moment(this.state.forecastStartDate).format('MMM-YYYY')} to {moment(this.state.forecastStopDate).format('MMM-YYYY')} </span><br /><br />

                            <span><b>1. No forecast selected: </b>(<a href="/report/compareAndSelectScenario" target="_blank">Compare & Select</a>, <a href="#" target="_blank">Forecast Summary</a>)</span><br />
                            <ul>{noForecastSelected}</ul>

                            <span><b>2. Consumption Forecast: </b>(<a href="/dataentry/consumptionDataEntryAndAdjustment" target="_blank">Data Entry & Adjustment</a>, <a href="/extrapolation/extrapolateData" target="_blank">Extrapolation</a>)</span><br />
                            <span>a. Months missing actual consumption values (gap) :</span><br />
                            <ul>{missingMonths}</ul>
                            <span>b. Planning units that don’t have at least 24 months of actual consumption values:</span><br />
                            <ul>{consumption}</ul>

                            <span><b>3. Tree Forecast(s) </b></span><br />
                            <span>a. Planning unit that doesn’t appear on any Tree </span><br />
                            <ul>{pu}</ul>

                            <span>b. Branches Missing Planning Unit (<a href="/dataset/listTree" target="_blank">Manage Tree</a>)</span><br />
                            {missingBranches}

                            <span>c. Nodes with children that don’t add up to 100%</span><br />
                            {jxlTable}


                            <span><b>4. Notes:</b></span><br />

                            <span><b>a. Consumption:</b></span>
                            <div className="table-scroll">
                                <div className="table-wrap table-responsive">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th><b>Planning Unit</b></th>
                                                <th><b>Notes</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{consumtionNotes}</tbody>
                                    </Table>
                                </div>
                            </div><br />
                            <span><b>b. Tree Scenarios</b></span>
                            <div className="table-scroll">
                                <div className="table-wrap table-responsive">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th><b>Tree</b></th>
                                                <th><b>Scenario</b></th>
                                                <th><b>Notes</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{scenarioNotes}</tbody>
                                    </Table>
                                </div>
                            </div><br />
                            <span><b>c. Tree Nodes</b></span>
                            {/* <div className="table-scroll"> */}
                            <div>
                                <div className="table-wrap table-responsive">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th><b>Tree</b></th>
                                                <th><b>Node</b></th>
                                                <th><b>Scenario</b></th>
                                                <th><b>Notes</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{treeNodes}</tbody>
                                    </Table>
                                </div>
                            </div><br />
                            <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-refresh"></i> Cancel</Button>
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>OK</Button>
                            </div>
                        </ModalBody>
                    </div>
                </Modal>
            </div >
        )
    }
}