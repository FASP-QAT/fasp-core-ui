import React from "react";
import ReactDOM from 'react-dom';
import {
    Card, CardBody,
    FormFeedback,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody, Row, Table, PopoverBody, Popover
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import pdfIcon from '../../assets/img/pdf.png';

const entityname = i18n.t('static.button.commit');
const initialValues = {
    notes: ''
}

const validationSchema = function (values, t) {
    return Yup.object().shape({
        notes: Yup.string()
            .matches(/^([a-zA-Z0-9\s,\./<>\?;':""[\]\\{}\|`~!@#\$%\^&\*()-_=\+]*)$/, i18n.t("static.label.validData"))
    })
}
const validate = (getValidationSchema) => {
    return (values) => {

        const validationSchema = getValidationSchema(values, i18n.t)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

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
            treeScenarioNotes: [],
            missingBranchesList: [],
            noForecastSelectedList: [],
            datasetPlanningUnit: [],
            progressPer: 0,
            cardStatus: true,
            loading: true
        }
        this.synchronize = this.synchronize.bind(this);
        this.updateState = this.updateState.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    notesChange(event) {
        this.setState({
            notes: event.target.value
        })
    }

    touchAll(setTouched, errors) {
        setTouched({
            notes: true
        }
        );
        this.validateForm(errors);
    }
    validateForm(errors) {
        this.findFirstError('budgetForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
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
                    var programId = "";
                    var event = {
                        target: {
                            value: ""
                        }
                    };
                    if (programList.length == 1) {
                        console.log("in if%%%", programList.length)
                        programId = programList[0].id;
                        event.target.value = programList[0].id;
                    } else if (localStorage.getItem("sesDatasetId") != "" && programList.filter(c => c.id == localStorage.getItem("sesDatasetId")).length > 0) {
                        programId = localStorage.getItem("sesDatasetId");
                        event.target.value = localStorage.getItem("sesDatasetId");
                    }
                    this.setState({
                        programList: programList,
                        loading: false,
                        programId: programId
                    }, () => {
                        if (programId != "") {
                            this.setProgramId(event);
                        }
                    })
                }
            }.bind(this)
        }.bind(this)
    }

    setProgramId(e) {
        this.setState({
            loading: true
        })
        var programId = e.target.value;
        var myResult = [];
        myResult = this.state.programList;
        localStorage.setItem("sesDatasetId", programId);
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

                var treeScenarioNotes = [];
                var missingBranchesList = [];
                for (var tl = 0; tl < PgmTreeList.length; tl++) {
                    var treeList = PgmTreeList[tl];
                    var scenarioList = treeList.scenarioList;
                    for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                        treeScenarioNotes.push({
                            tree: PgmTreeList[tl].label,
                            scenario: scenarioList[ndm].label,
                            treeId: PgmTreeList[tl].treeId,
                            scenarioId: scenarioList[ndm].id,
                            scenarioNotes: scenarioList[ndm].notes
                        });
                    }
                }
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
                                madelingNotes = madelingNotes.concat(modelingList[ml].notes).concat(" ")
                            }
                            treeNodeList.push({
                                tree: PgmTreeList[tl].label,
                                scenario: scenarioList[ndm].label,
                                treeId: PgmTreeList[tl].treeId,
                                scenarioId: scenarioList[ndm].id,
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
                    missingBranchesList: missingBranchesList,
                    treeScenarioNotes: treeScenarioNotes
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
                        console.log("consumptionListFiltered+++", consumptionListFiltered);
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
                        for (var i = 0; moment(curDate).format("YYYY-MM") < moment(Date.now()).format("YYYY-MM"); i++) {
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
                        if (selectedForecast[datasetRegionList[drl].regionId] == undefined || (selectedForecast[datasetRegionList[drl].regionId].scenarioId == null && selectedForecast[datasetRegionList[drl].regionId].consumptionExtrapolationId == null)) {
                            regionArray.push({ id: datasetRegionList[drl].regionId, label: getLabelText(datasetRegionList[drl].label, this.state.lang) });
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
                    progressPer: 25,
                    loading: false
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
        this.setState({ loading: true })
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
                    title: i18n.t('static.inventoryDate.inventoryReport'),
                    type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 100,
                    // readOnly: true
                });
                for (var nwp = 0; nwp < nodeWithPercentageChildren.length; nwp++) {
                    columnsArray.push({
                        title: getLabelText(nodeWithPercentageChildren[nwp].label, this.state.lang),
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
                        jExcelLoadedFunctionOnlyHideRow(instance);
                    },
                    updateTable: function (el, cell, x, y, source, value, id) {
                        if (y != null && x != 0) {
                            if (value != "100.00%") {
                                var elInstance = el.jexcel;
                                cell.classList.add('red');
                            }
                        }
                    },

                    // pagination: localStorage.getItem("sesRecordCount"),
                    pagination: false,
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
        this.setState({ loading: false })
    }

    toggleShowValidation() {
        this.setState({
            showValidation: !this.state.showValidation
        }, () => {
            if (this.state.showValidation) {
                this.setState({
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
                console.log("In get request****")
                AuthenticationService.setupAxiosInterceptors();
                const resp = await ProgramService.sendNotificationAsync(commitRequestId);
                var curUser = AuthenticationService.getLoggedInUserId();
                if (resp.data.createdBy.userId == curUser && resp.data.status == 2) {
                    this.setState({
                        progressPer: 75
                        , message: i18n.t('static.commitVersion.serverProcessingCompleted'), color: 'green'
                    }, () => {
                        this.hideFirstComponent();
                        this.getLatestProgram({ openModal: true, notificationDetails: resp.data });
                    })
                } else if (resp.data.createdBy.userId == curUser && resp.data.status == 3) {
                    var db1;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: 'red'
                        })
                        this.hideFirstComponent()
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var transaction = db1.transaction(['datasetDetails'], 'readwrite');
                        var program = transaction.objectStore('datasetDetails');
                        var getRequest = program.get((this.state.programId));
                        getRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                color: 'red'
                            })
                            this.hideFirstComponent()
                        }.bind(this);
                        getRequest.onsuccess = function (event) {
                            var myResult = [];
                            myResult = getRequest.result;
                            console.log("In readonly 0****")
                            myResult.readonly = 0;
                            var transaction1 = db1.transaction(['datasetDetails'], 'readwrite');
                            var program1 = transaction1.objectStore('datasetDetails');
                            var getRequest1 = program1.put(myResult);
                            getRequest1.onsuccess = function (e) {
                                this.setState({
                                    message: i18n.t('static.commitTree.commitFailed'),
                                    color: 'red',
                                    loading: false
                                })
                                this.hideFirstComponent()
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }
            } catch (err) {
                // Handle Error Here
                console.error("Error+++", err);
                this.setState({ loading: false });
            }
        };
        sendGetRequest();
    }

    getLatestProgram(notificationDetails) {
        this.setState({ loading: true });
        var updatedJson = [];
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
                console.log('json', json);
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

                            var datasetDataTransaction2 = db1.transaction(['datasetDetails'], 'readwrite');
                            var datasetDataOs2 = datasetDataTransaction2.objectStore('datasetDetails');
                            var datasetRequest2 = datasetDataOs2.delete(this.state.programId);

                            datasetDataTransaction2.oncomplete = function (event) {
                                // var programDataTransaction2 = db1.transaction(['downloadedDatasetData'], 'readwrite');
                                // programDataTransaction2.oncomplete = function (event) {

                                var transactionForSavingData = db1.transaction(['datasetData'], 'readwrite');
                                var programSaveData = transactionForSavingData.objectStore('datasetData');
                                for (var r = 0; r < json.length; r++) {
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
                                        // var version = json[r].requestedProgramVersion;
                                        // if (version == -1) {
                                        //     version = json[r].currentVersion.versionId
                                        // }
                                        var version = json[r].currentVersion.versionId
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
                                        var programQPLDetailsTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                        var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('datasetDetails');
                                        var programIds = []
                                        for (var r = 0; r < json.length; r++) {
                                            var programQPLDetailsJson = {
                                                id: json[r].programId + "_v" + json[r].currentVersion.versionId + "_uId_" + userId,
                                                programId: json[r].programId,
                                                version: json[r].currentVersion.versionId,
                                                userId: userId,
                                                programCode: json[r].programCode,
                                                changed: 0
                                            };
                                            var programQPLDetailsRequest = programQPLDetailsOs.put(programQPLDetailsJson);
                                        }
                                        programQPLDetailsTransaction.oncomplete = function (event) {
                                            this.setState({
                                                progressPer: 100,
                                                loading: false
                                            })
                                            this.goToMasterDataSync(programIdsToSyncArray);
                                        }.bind(this)
                                    }.bind(this)
                                }.bind(this);
                            }.bind(this);
                        }.bind(this);
                    }.bind(this);
                }.bind(this);
                // }.bind(this);
            })

    }

    goToMasterDataSync(programIds) {
        this.props.history.push({ pathname: `/syncProgram/green/` + i18n.t('static.message.commitSuccess'), state: { "programIds": programIds } });
    }


    synchronize() {
        this.setState({ showValidation: !this.state.showValidation }, () => {
            this.setState({
                loading: true,
            }, () => {
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
                        var programQPLDetailsTransaction1 = db1.transaction(['datasetDetails'], 'readwrite');
                        var programQPLDetailsOs1 = programQPLDetailsTransaction1.objectStore('datasetDetails');
                        var programQPLDetailsGetRequest = programQPLDetailsOs1.get((this.state.programId));
                        programQPLDetailsGetRequest.onsuccess = function (event) {
                            var programQPLDetails = programQPLDetailsGetRequest.result;
                            var datasetDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                            var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                            var datasetJson = JSON.parse(datasetData);
                            var programJson = datasetJson;
                            programJson.versionType = { id: document.getElementById("versionTypeId").value };
                            programJson.versionStatus = { id: 2 };
                            programJson.notes = document.getElementById("notes").value;

                            //create saveDatasetData in ProgramService
                            DatasetService.saveDatasetData(programJson, this.state.comparedLatestVersion).then(response => {
                                if (response.status == 200) {
                                    var transactionForProgramQPLDetails = db1.transaction(['datasetDetails'], 'readwrite');
                                    var programQPLDetailSaveData = transactionForProgramQPLDetails.objectStore('datasetDetails');
                                    programQPLDetails.readonly = 1;
                                    var putRequest2 = programQPLDetailSaveData.put(programQPLDetails);
                                    localStorage.setItem("sesProgramId", "");
                                    console.log(")))) Made program readonly");
                                    this.setState({
                                        progressPer: 50
                                        , message: i18n.t('static.commitVersion.sendLocalToServerCompleted'), color: 'green'
                                    }, () => {
                                        this.hideFirstComponent();
                                        // getLatestProgram also copy , use getAllDatasetData instead getAllProgramData
                                        this.redirectToDashbaord(response.data);
                                    })
                                } else {
                                    this.setState({
                                        message: response.data.messageCode,
                                        color: "red",
                                        loading: false
                                    })
                                    this.hideFirstComponent();
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
                                                this.hideFirstComponent();
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
                                                        this.hideFirstComponent()
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
                                                        this.hideFirstComponent()
                                                    });
                                                    break;
                                                default:
                                                    console.log("+++in catch 8")
                                                    this.setState({
                                                        message: 'static.unkownError',
                                                        loading: false,
                                                        color: "red"
                                                    }, () => {
                                                        this.hideFirstComponent()
                                                    });
                                                    break;
                                            }
                                        }
                                    }
                                );
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            })
        })

    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    print() {
        this.setState({ loading: true })
        var tableName = document.getElementsByName("jxlTableData")
        for (var t = 0; t < tableName.length; t++) {
            tableName[t].classList.remove('consumptionDataEntryTable');
        }

        var content = document.getElementById("divcontents").innerHTML;
        const styleTags = Array.from(document.getElementsByTagName("style")).map(x => x.outerHTML).join("");
        var pri = document.getElementById("ifmcontentstoprint").contentWindow;
        pri.document.open();
        pri.document.write(content);
        pri.document.write(styleTags);
        pri.document.close();
        pri.focus();
        pri.print();

        for (var t = 0; t < tableName.length; t++) {
            tableName[t].classList.add('consumptionDataEntryTable');
        }


        // var content = document.getElementById("divcontents")
        // html2canvas(content)
        //     .then((canvas) => {
        //         const imgData = canvas.toDataURL('image/png');
        //         const pdf = new jsPDF();
        //         pdf.addImage(imgData, 'JPEG', 0, 0);
        //         // pdf.output('dataurlnewwindow');
        //         pdf.save("download.pdf");
        //     });
        this.setState({ loading: false })
    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    noForecastSelectedClicked(planningUnitId, regionId) {
        localStorage.setItem("sesDatasetPlanningUnitId", planningUnitId);
        localStorage.setItem("sesDatasetRegionId", regionId);
        const win = window.open("/#/report/compareAndSelectScenario", "_blank");
        win.focus();
        // this.props.history.push(``);
    }

    missingMonthsClicked(planningUnitId) {
        const win = window.open("/#/dataentry/consumptionDataEntryAndAdjustment/" + planningUnitId, "_blank");
        win.focus();
    }

    missingBranchesClicked(treeId) {
        const win = window.open(`/#/dataSet/buildTree/tree/${treeId}/${this.state.programId}`, "_blank");
        win.focus();
    }

    nodeWithPercentageChildrenClicked(treeId, scenarioId) {
        const win = window.open(`/#/dataSet/buildTree/tree/${treeId}/${this.state.programId}/${scenarioId}`, "_blank");
        win.focus();
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
        let noForecastSelected = noForecastSelectedList.length > 0 &&
            noForecastSelectedList.map((item, i) => {
                return (
                    item.regionList.map(item1 => {
                        console.log("item1", item1);
                        return (
                            <li key={i}>
                                <div className="hoverDiv" onClick={() => this.noForecastSelectedClicked(item.planningUnit.planningUnit.id, item1.id)}>{getLabelText(item.planningUnit.planningUnit.label, this.state.lang) + " - " + item1.label}</div>
                            </li>
                        )
                    }, this)
                )
            }, this);

        //Consumption : missing months
        const { missingMonthList } = this.state;
        let missingMonths = missingMonthList.length > 0 && missingMonthList.map((item, i) => {
            return (
                <li key={i}>
                    <div><span><div className="hoverDiv" onClick={() => this.missingMonthsClicked(item.planningUnitId)}><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b></div>{"" + item.monthsArray}</span></div>
                </li>
            )
        }, this);

        //Consumption : planning unit less 12 month
        const { consumptionListlessTwelve } = this.state;
        let consumption = consumptionListlessTwelve.length > 0 && consumptionListlessTwelve.map((item, i) => {
            return (
                <li key={i}>
                    <div><span><div className="hoverDiv" onClick={() => this.missingMonthsClicked(item.planningUnitId)}><b>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + " : "}</b></div></span><span>{item.noOfMonths + " month(s)"}</span></div>
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
                        <div className="hoverDiv" onClick={() => this.missingBranchesClicked(item.treeId)}><span>{getLabelText(item.treeLabel, this.state.lang)}</span></div>
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
                return (<><span className="hoverDiv" onClick={() => this.nodeWithPercentageChildrenClicked(item1.treeId, item1.scenarioId)}>{getLabelText(item1.treeLabel, this.state.lang) + " / " + getLabelText(item1.scenarioLabel, this.state.lang)}</span><div className="table-responsive">
                    <div id={"tableDiv" + count} className="jexcelremoveReadonlybackground consumptionDataEntryTable" name='jxlTableData' />
                </div><br /></>)
            }
        }, this)

        //Consumption Notes
        const { datasetPlanningUnit } = this.state;
        let consumtionNotes = datasetPlanningUnit.length > 0 && datasetPlanningUnit.map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => this.missingMonthsClicked(item.planningUnit.id)}>
                    <td>{getLabelText(item.planningUnit.label, this.state.lang)}</td>
                    <td>{item.consumtionNotes}</td>
                </tr>
            )
        }, this);

        //Tree scenario Notes
        const { treeScenarioNotes } = this.state;
        let scenarioNotes = treeScenarioNotes.length > 0 && treeScenarioNotes.map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => this.nodeWithPercentageChildrenClicked(item.treeId, item.scenarioId)}>
                    <td>{getLabelText(item.tree, this.state.lang)}</td>
                    <td>{getLabelText(item.scenario, this.state.lang)}</td>
                    <td>{item.scenarioNotes}</td>
                </tr>
            )
        }, this);

        //Tree Nodes Notes
        const { treeNodeList } = this.state;
        let treeNodes = treeNodeList.length > 0 && treeNodeList.map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => this.nodeWithPercentageChildrenClicked(item.treeId, item.scenarioId)}>
                    <td>{getLabelText(item.tree, this.state.lang)}</td>
                    <td>{getLabelText(item.node, this.state.lang)}</td>
                    <td>{getLabelText(item.scenario, this.state.lang)}</td>
                    <td>{(item.notes != "" && item.notes != null) ? i18n.t('static.commitTree.main') + " : " + item.notes : ""}<br />
                        {(item.madelingNotes != "" && item.madelingNotes != null) ? i18n.t('static.commitTree.modeling') + " : " + item.madelingNotes : ""}</td>
                </tr>
            )
        }, this);



        return (
            <div className="animated fadeIn" >
                <h5 id="div1" className={this.state.color}>{i18n.t(this.state.message, { entityname })}</h5>
                {(this.state.cardStatus) &&
                    <Card id="noniframe">
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
                                    <li className="quantimedProgressbartext1">{i18n.t('static.commitVersion.compareData')}</li>
                                    <li className="quantimedProgressbartext2">{i18n.t('static.commitVersion.resolveConflicts')}</li>
                                    <li className="quantimedProgressbartext3">{i18n.t('static.commitVersion.sendingDataToServer')}</li>
                                    <li className="quantimedProgressbartext4">{i18n.t('static.commitTree.serverProcessing')}</li>
                                    <li className="quantimedProgressbartext5">{i18n.t('static.commitVersion.upgradeLocalToLatest')}</li>
                                </ul>
                            </div>
                            <Form name='simpleForm'>
                                <div className=" pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3 ">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.programheader')}</Label>
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
                            </Form>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                {(this.state.showCompare) &&
                                    <>
                                        <div className="col-md-10 pt-lg-1 pb-lg-0 pl-lg-0">
                                            <ul className="legendcommitversion">
                                                {/* <li><span className="lightpinklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.conflicts')}</span></li> */}
                                                <li><span className=" greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')} </span></li>
                                                <li><span className="notawesome legendcolor"></span > <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
                                            </ul>
                                        </div>
                                        <CompareVersionTable ref="conflictChild" page="commit" datasetData={this.state.programDataLocal} datasetData1={this.state.programDataServer} datasetData2={this.state.programDataDownloaded} versionLabel={"V" + this.state.programDataLocal.currentVersion.versionId + "(Local)"} versionLabel1={"V" + this.state.programDataServer.currentVersion.versionId + "(Server)"} updateState={this.updateState} />
                                        <div className="table-responsive RemoveStriped commitversionTable CommitTableMarginTop">
                                            <div id="tableDiv" />
                                        </div>
                                    </>
                                }

                                {/* <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.reset}><i className="fa fa-refresh"></i> Cancel</Button>
                                <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-check"></i>Next</Button>
                            </div> */}

                                <div>
                                    <Formik
                                        initialValues={initialValues}
                                        validate={validate(validationSchema)}
                                        onSubmit={(values, { setSubmitting, setErrors }) => {
                                            this.toggleShowValidation()
                                        }}
                                        render={
                                            ({
                                                values,
                                                errors,
                                                touched,
                                                handleChange,
                                                handleBlur,
                                                handleSubmit,
                                                isSubmitting,
                                                isValid,
                                                setTouched,
                                                handleReset,
                                                setFieldValue,
                                                setFieldTouched,
                                                setFieldError
                                            }) => (
                                                <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='budgetForm' autocomplete="off">
                                                    <div className="row">
                                                        <FormGroup className="col-md-4">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.versiontype')}</Label>
                                                            <div className="controls ">
                                                                <Input
                                                                    type="select"
                                                                    name="versionTypeId"
                                                                    id="versionTypeId"
                                                                    bsSize="sm"
                                                                    value={this.state.versionTypeId}
                                                                    onChange={(e) => { this.setVersionTypeId(e); }}
                                                                >
                                                                    <option value="1">{i18n.t('static.commitTree.draftVersion')}</option>
                                                                    <option value="2">{i18n.t('static.commitTree.finalVersion')}</option>
                                                                </Input>
                                                            </div>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="appendedInputButton">{i18n.t('static.program.notes')}</Label>
                                                            <Input
                                                                className="controls"
                                                                type="textarea"
                                                                id="notes"
                                                                name="notes"
                                                                valid={!errors.notes && this.state.notes != ''}
                                                                invalid={touched.notes && !!errors.notes}
                                                                onChange={(e) => { handleChange(e); this.notesChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={this.state.notes}

                                                            />
                                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                                        </FormGroup>

                                                        <div className="col-md-12">
                                                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.cancel')}</Button>
                                                            {/* <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>Commit</Button> */}
                                                            <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.button.commit')}</Button>
                                                        </div>
                                                    </div>
                                                </Form>
                                            )} />
                                </div>
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                        <div class="spinner-border blue ml-4" role="status">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                }
                <iframe id="ifmcontentstoprint" style={{ height: '0px', width: '0px', position: 'absolute' }}></iframe>
                <Modal isOpen={this.state.showValidation}
                    className={'modal-lg ' + this.props.className} id='divcontents'>
                    <ModalHeader toggle={() => this.toggleShowValidation()} className="modalHeaderSupplyPlan">
                        <h3><strong>{i18n.t('static.commitTree.forecastValidation')}</strong></h3>
                        <div className="row">
                            <img className=" pull-right iconClass cursor" style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF()} />
                            <i className="fa fa-print pull-right iconClass cursor" onClick={() => this.print()}></i>
                        </div>
                    </ModalHeader>
                    <div>
                        <ModalBody>
                            <span><b>{this.state.programName}</b></span><br />
                            <span><b>{i18n.t('static.common.forecastPeriod')}: </b> {moment(this.state.forecastStartDate).format('MMM-YYYY')} to {moment(this.state.forecastStopDate).format('MMM-YYYY')} </span><br /><br />

                            <span><b>1. {i18n.t('static.commitTree.noForecastSelected')} : </b>(<a href="/#/report/compareAndSelectScenario" target="_blank">{i18n.t('static.commitTree.compare&Select')}</a>, <a href="/#/forecastReport/forecastSummary" target="_blank">{i18n.t('static.commitTree.forecastSummary')}</a>)</span><br />
                            <ul>{noForecastSelected}</ul>

                            <span><b>2. {i18n.t('static.commitTree.consumptionForecast')} : </b>(<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank">{i18n.t('static.commitTree.dataEntry&Adjustment')}</a>, <a href="/#/extrapolation/extrapolateData" target="_blank">{i18n.t('static.commitTree.extrapolation')}</a>)</span><br />
                            <span>a. {i18n.t('static.commitTree.monthsMissingActualConsumptionValues')} :</span><br />
                            <ul>{missingMonths}</ul>
                            <span>b. {i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues')} :</span><br />
                            <ul>{consumption}</ul>

                            <span><b>3. {i18n.t('static.commitTree.treeForecast')} </b>(<a href="/#/dataset/listTree" target="_blank">{i18n.t('static.common.managetree')}</a>)</span><br />
                            <span>a. {i18n.t('static.commitTree.puThatDoesNotAppearOnAnyTree')} </span><br />
                            <ul>{pu}</ul>

                            <span>b. {i18n.t('static.commitTree.branchesMissingPlanningUnit')}</span><br />
                            {missingBranches}

                            <span>c. {i18n.t('static.commitTree.NodesWithChildrenThatDoNotAddUpTo100Prcnt')}</span><br />
                            {jxlTable}


                            <span><b>4. {i18n.t('static.program.notes')}:</b></span><br />

                            <span><b>a. {i18n.t('static.forecastMethod.historicalData')} :</b></span>
                            <div className="table-scroll">
                                <div className="table-wrap table-responsive">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th><b>{i18n.t('static.dashboard.planningunitheader')}</b></th>
                                                <th><b>{i18n.t('static.program.notes')}</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{consumtionNotes}</tbody>
                                    </Table>
                                </div>
                            </div><br />
                            <span><b>b. {i18n.t('static.commitTree.treeScenarios')}</b></span>
                            <div className="table-scroll">
                                <div className="table-wrap table-responsive">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th><b>{i18n.t('static.forecastMethod.tree')}</b></th>
                                                <th><b>{i18n.t('static.whatIf.scenario')}</b></th>
                                                <th><b>{i18n.t('static.program.notes')}</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{scenarioNotes}</tbody>
                                    </Table>
                                </div>
                            </div><br />
                            <span><b>c. {i18n.t('static.commitTree.treeNodes')}</b></span>
                            {/* <div className="table-scroll"> */}
                            <div>
                                <div className="table-wrap table-responsive">
                                    <Table className="table-bordered text-center mt-2 overflowhide main-table " bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th><b>{i18n.t('static.forecastMethod.tree')}</b></th>
                                                <th><b>{i18n.t('static.common.node')}</b></th>
                                                <th><b>{i18n.t('static.whatIf.scenario')}</b></th>
                                                <th><b>{i18n.t('static.program.notes')}</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{treeNodes}</tbody>
                                    </Table>
                                </div>
                            </div>
                            <div className="col-md-12 pb-lg-5 pt-lg-3">
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>{i18n.t('static.report.ok')}</Button>
                            </div>
                        </ModalBody>
                    </div>
                </Modal >
            </div >
        )
    }
}