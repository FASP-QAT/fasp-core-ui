import React from "react";
import ReactDOM from 'react-dom';
import {
    Card, CardBody,
    FormFeedback,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody, Row, Table, PopoverBody, Popover, TabContent, NavLink, NavItem, Nav, TabPane
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, SECRET_KEY, PENDING_APPROVAL_VERSION_STATUS, API_URL, LATEST_VERSION_COLOUR, LOCAL_VERSION_COLOUR, DATE_FORMAT_SM } from "../../Constants";
import i18n from '../../i18n';
import CryptoJS from 'crypto-js'
import getLabelText from "../../CommonComponent/getLabelText";
import { DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_SM, JEXCEL_PRO_KEY } from '../../Constants.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import { decompressJson, compressJson, isCompress } from '../../CommonComponent/JavascriptCommonFunctions';
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
import "jspdf-autotable";
import html2canvas from 'html2canvas';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from "../../CommonComponent/Logo";
import { buildJxl1, dataCheck } from '../DataSet/DataCheckComponent.js';
import { buildJxl } from '../DataSet/DataCheckComponent.js';
import { exportPDF, noForecastSelectedClicked, missingMonthsClicked, missingBranchesClicked, nodeWithPercentageChildrenClicked } from '../DataSet/DataCheckComponent.js';
import pako from 'pako';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";

const entityname = i18n.t('static.button.commit');
const initialValues = {
    notes: ''
}

const validationSchema = function (values, t) {
    return Yup.object().shape({
        notes: Yup.string()
            .matches(/^([a-zA-Z0-9\s,\./<>\?;':""[\]\\{}\|`~!@#\$%\^&\*()-_=\+]*)$/, i18n.t("static.commit.consumptionnotesvalid"))
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
            loading: true,
            treeScenarioListNotHaving100PerChild: [],
            includeOnlySelectedForecasts: true,
            datasetPlanningUnitNotes: [],
            activeTab: new Array(3).fill('1'),
            noOfDays: [{ id: "0", name: i18n.t('static.versionSettings.calendardays') }, { id: 15, name: '15' },
            { id: 16, name: '16' },
            { id: 17, name: '17' },
            { id: 18, name: '18' },
            { id: 19, name: '19' },
            { id: 20, name: '20' },
            { id: 21, name: '21' },
            { id: 22, name: '22' },
            { id: 23, name: '23' },
            { id: 24, name: '24' },
            { id: 25, name: '25' },
            { id: 26, name: '26' },
            { id: 27, name: '27' },
            { id: 28, name: '28' },
            { id: 29, name: '29' },
            { id: 30, name: '30' },
            { id: 31, name: '31' }
            ],
            conflictsCountVersionSettings: 0,
            versionSettingsConflictsModal: false,
            conflictsCountPlanningUnits: 0,
            planningUnitsConflictsModal: false,
            conflictsCountConsumption: 0,
            conflictsCountTree: 0,
            conflictsCountSelectedForecast: 0,

        }
        this.synchronize = this.synchronize.bind(this);
        this.updateState = this.updateState.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.toggle = this.toggle.bind(this);
        this.loadedFunctionForVersionSettings = this.loadedFunctionForVersionSettings.bind(this);
        this.toggleVersionSettingsConflictModal = this.toggleVersionSettingsConflictModal.bind(this)
        this.acceptCurrentChangesVersionSettings = this.acceptCurrentChangesVersionSettings.bind(this);
        this.acceptIncomingChangesVersionSettings = this.acceptIncomingChangesVersionSettings.bind(this);
        this.loadedFunctionForPlanningUnits = this.loadedFunctionForPlanningUnits.bind(this);
        this.togglePlanningUnitsConflictModal = this.togglePlanningUnitsConflictModal.bind(this)
        this.acceptCurrentChangesPlanningUnits = this.acceptCurrentChangesPlanningUnits.bind(this);
        this.acceptIncomingChangesPlanningUnits = this.acceptIncomingChangesPlanningUnits.bind(this);
        this.loadedFunctionForConsumption = this.loadedFunctionForConsumption.bind(this);
        this.loadedFunctionForTree = this.loadedFunctionForTree.bind(this);
        this.loadedFunctionForSelectedForecast = this.loadedFunctionForSelectedForecast.bind(this);
    }

    toggleVersionSettingsConflictModal(oldData, latestData, index, page) {
        this.setState({
            versionSettingsConflictsModal: !this.state.versionSettingsConflictsModal
        });
        if (oldData != "") {
            this.showVersionSettingsConflictsData(oldData, latestData, index);
        }
    }

    showVersionSettingsConflictsData(oldData, latestData, index) {
        var data = [];
        data.push(oldData);
        data.push(latestData);
        var options = {
            data: data,
            columns: [
                {
                    title: i18n.t('static.program.forecastStart'),
                    type: 'calendar',
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                    } // 7 H
                },
                {
                    title: i18n.t('static.program.forecastEnd'),
                    type: 'calendar',
                    filterOptions: this.filterStopDate,
                    options: {
                        format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                    }// 9 J
                },
                {
                    title: i18n.t('static.program.noOfDaysInMonth'),
                    type: 'dropdown',
                    source: this.state.noOfDays,
                    // width: '150',
                },//13 N


                {
                    title: i18n.t('static.versionSettings.freight%'),
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                    // readOnly: true
                },//14 O
                {
                    title: i18n.t('static.versionSettings.forecastThresholdHigh'),
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                    // readOnly: true
                },//15 P
                {
                    title: i18n.t('static.versionSettings.ForecastThresholdLow'),
                    type: 'numeric',
                    textEditor: true,
                    mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                    // readOnly: true
                },//16 Q
                {
                    type: 'hidden',
                    title: 'Old Data'
                },
                {
                    type: 'hidden',
                    title: 'Latest Data'
                },
                {
                    type: 'hidden',
                    title: 'Downloaded Data'
                },
                {
                    type: 'hidden'
                }
            ],
            // text: {
            //   showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //   show: '',
            //   entries: '',
            // },
            pagination: false,
            search: false,
            filters: false,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
            columnSorting: false,
            // tableOverflow: false,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            // tableOverflow: false,
            // editable: false,
            onload: this.loadedFunctionForVersionSettingsConflicts
        };
        var resolveConflict = jexcel(document.getElementById("versionSettingsConflictsDiv"), options);
        this.el = resolveConflict;
        this.setState({
            versionSettingsConflictsInstance: resolveConflict,
            loading: false
        })
        document.getElementById("versionSettingsIndex").value = index;
    }

    loadedFunctionForVersionSettingsConflicts = function (instance) {
        let target = document.getElementById('versionSettingsConflictsDiv');
        target.classList.add("removeOddColor")
        jExcelLoadedFunctionOnlyHideRow(instance);
        var elInstance = instance.worksheets[0];
        elInstance.options.editable = true;
        var jsonData = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F']
        for (var j = 0; j < 6; j++) {
            var col = (colArr[j]).concat(1);
            var col1 = (colArr[j]).concat(2);
            var valueToCompare = (jsonData[0])[j];
            var valueToCompareWith = (jsonData[1])[j];
            if ((valueToCompare == valueToCompareWith)) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col1, "background-color", "transparent");
            } else {
                elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
            }
        }
        elInstance.options.editable = false;
    }

    acceptCurrentChangesVersionSettings() {
        this.setState({ loading: true });
        var resolveConflictsInstance = this.state.versionSettingsConflictsInstance;
        var versionSettingsInstance = this.state.versionSettingsInstance;
        var index = document.getElementById("versionSettingsIndex").value;
        versionSettingsInstance.options.editable = true;
        versionSettingsInstance.setRowData(index, resolveConflictsInstance.getRowData(0));
        var jsonData = resolveConflictsInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F']
        for (var j = 0; j < 6; j++) {
            var col = (colArr[j]).concat(parseInt(index) + 1);
            var valueToCompare = (jsonData[0])[j];
            var valueToCompareWith = (jsonData[1])[j];
            if ((valueToCompare == valueToCompareWith)) {
                versionSettingsInstance.setStyle(col, "background-color", "transparent");
            } else {
                versionSettingsInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                versionSettingsInstance.setValueFromCoords(9, index, 2, true);
            }
        }
        this.setState({
            conflictsCountVersionSettings: this.state.conflictsCountVersionSettings - 1
        }, () => {
            this.mergeData()
        })
        versionSettingsInstance.orderBy(9, 0);
        versionSettingsInstance.options.editable = false;
        this.toggleVersionSettingsConflictModal('', '', 0, '');
        this.setState({ loading: false })
    }

    acceptIncomingChangesVersionSettings() {
        this.setState({ loading: true })
        var resolveConflictsInstance = this.state.versionSettingsConflictsInstance;
        var versionSettingsInstance = this.state.versionSettingsInstance;
        var index = document.getElementById("versionSettingsIndex").value;
        versionSettingsInstance.options.editable = true;
        versionSettingsInstance.setRowData(index, resolveConflictsInstance.getRowData(1));
        var jsonData = resolveConflictsInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F']
        for (var j = 0; j < 6; j++) {
            var col = (colArr[j]).concat(parseInt(index) + 1);
            var valueToCompare = (jsonData[0])[j];
            var valueToCompareWith = (jsonData[1])[j];
            if ((valueToCompare == valueToCompareWith)) {
                versionSettingsInstance.setStyle(col, "background-color", "transparent");
            } else {
                versionSettingsInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                versionSettingsInstance.setValueFromCoords(9, (index), 3, true);
            }
        }
        versionSettingsInstance.orderBy(9, 0);
        versionSettingsInstance.options.editable = false;
        this.setState({
            conflictsCountVersionSettings: this.state.conflictsCountVersionSettings - 1
        }, () => {
            this.mergeData()
        })
        this.toggleVersionSettingsConflictModal('', '', 0, '');
        this.setState({ loading: false })
    }

    togglePlanningUnitsConflictModal(oldData, latestData, index, page) {
        this.setState({
            planningUnitsConflictsModal: !this.state.planningUnitsConflictsModal
        });
        if (oldData != "") {
            this.showPlanningUnitsConflictsData(oldData, latestData, index);
        }
    }

    showPlanningUnitsConflictsData(oldData, latestData, index) {
        var data = [];
        data.push(oldData);
        data.push(latestData);
        var options = {
            data: data,
            columns: [
                {
                    title: i18n.t('static.productCategory.productCategory'),
                    type: 'dropdown',
                    source: this.state.productCategoryList,
                    // readOnly: true// 0A
                },
                {
                    title: i18n.t('static.dashboard.planningunitheader'),
                    type: 'dropdown',
                    source: this.state.planningUnitList,
                    width: '170',
                    // readOnly: true //1B
                },
                {
                    title: i18n.t('static.commitTree.consumptionForecast') + ' ?',
                    type: 'checkbox',
                    width: '150',
                    // readOnly: true //2C
                },
                {
                    title: i18n.t('static.TreeForecast.TreeForecast') + ' ?',
                    type: 'checkbox',
                    width: '150'
                    // readOnly: true //3D
                },
                {
                    title: i18n.t('static.planningUnitSetting.stockEndOf'),
                    type: 'numeric',
                    textEditor: true,
                    // decimal: '.',
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true
                    // readOnly: true //4E
                },
                {
                    title: i18n.t('static.planningUnitSetting.existingShipments'),
                    type: 'numeric',
                    textEditor: true,
                    // decimal: '.',
                    mask: '#,##',
                    width: '150',
                    disabledMaskOnEdition: true
                    // readOnly: true //5F
                },
                {
                    title: i18n.t('static.planningUnitSetting.desiredMonthsOfStock'),
                    type: 'numeric',
                    textEditor: true,
                    // decimal: '.',
                    mask: '#,##',
                    disabledMaskOnEdition: true,
                    width: '150'
                    // readOnly: true //6G
                },
                {
                    title: i18n.t('static.forecastReport.priceType'),
                    type: 'dropdown',
                    source: this.state.procurementAgentList,
                    width: '120'
                    // filter: this.filterProcurementAgentByPlanningUnit
                    // readOnly: true //7H
                },
                {
                    title: i18n.t('static.forecastReport.unitPrice'),
                    type: 'numeric',
                    textEditor: true,
                    decimal: '.',
                    mask: '#,##.00',
                    width: '120',
                    disabledMaskOnEdition: true
                    // readOnly: true //8I
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text',
                    // width: 400 //15P
                },
                {
                    title: 'Active',
                    type: 'checkbox',
                    // readOnly: true //16Q
                },
                {
                    type: 'hidden',
                    title: 'Old Data'
                },
                {
                    type: 'hidden',
                    title: 'Latest Data'
                },
                {
                    type: 'hidden',
                    title: 'Downloaded Data'
                },
                {
                    type: 'hidden'
                }
            ],
            // text: {
            //   showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //   show: '',
            //   entries: '',
            // },
            pagination: false,
            search: false,
            filters: false,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
            columnSorting: false,
            // tableOverflow: false,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            // tableOverflow: false,
            // editable: false,
            onload: this.loadedFunctionForPlanningUnitsConflicts
        };
        var resolveConflict = jexcel(document.getElementById("planningUnitsConflictsDiv"), options);
        this.el = resolveConflict;
        this.setState({
            planningUnitsConflictsInstance: resolveConflict,
            loading: false
        })
        document.getElementById("planningUnitsIndex").value = index;
    }

    loadedFunctionForPlanningUnitsConflicts = function (instance) {
        let target = document.getElementById('planningUnitsConflictsDiv');
        target.classList.add("removeOddColor")
        jExcelLoadedFunctionOnlyHideRow(instance);
        var elInstance = instance.worksheets[0];
        elInstance.options.editable = true;
        var jsonData = elInstance.getJson();
        elInstance.setStyle(("C").concat(parseInt(0) + 1), "pointer-events", "");
        elInstance.setStyle(("C").concat(parseInt(0) + 1), "pointer-events", "none");
        elInstance.setStyle(("D").concat(parseInt(0) + 1), "pointer-events", "");
        elInstance.setStyle(("D").concat(parseInt(0) + 1), "pointer-events", "none");
        elInstance.setStyle(("K").concat(parseInt(0) + 1), "pointer-events", "");
        elInstance.setStyle(("K").concat(parseInt(0) + 1), "pointer-events", "none");
        elInstance.setStyle(("C").concat(parseInt(1) + 1), "pointer-events", "");
        elInstance.setStyle(("C").concat(parseInt(1) + 1), "pointer-events", "none");
        elInstance.setStyle(("D").concat(parseInt(1) + 1), "pointer-events", "");
        elInstance.setStyle(("D").concat(parseInt(1) + 1), "pointer-events", "none");
        elInstance.setStyle(("K").concat(parseInt(1) + 1), "pointer-events", "");
        elInstance.setStyle(("K").concat(parseInt(1) + 1), "pointer-events", "none");
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
        for (var j = 0; j < 11; j++) {
            var col = (colArr[j]).concat(1);
            var col1 = (colArr[j]).concat(2);
            var valueToCompare = (jsonData[0])[j];
            var valueToCompareWith = (jsonData[1])[j];
            if ((valueToCompare == valueToCompareWith)) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col1, "background-color", "transparent");
            } else {
                elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                elInstance.setStyle(col1, "background-color", LATEST_VERSION_COLOUR);
            }
        }
        elInstance.options.editable = false;
    }

    acceptCurrentChangesPlanningUnits() {
        this.setState({ loading: true });
        var resolveConflictsInstance = this.state.planningUnitsConflictsInstance;
        var planningUnitsInstance = this.state.planningUnitsInstance;
        var index = document.getElementById("planningUnitsIndex").value;
        planningUnitsInstance.options.editable = true;
        planningUnitsInstance.setRowData(index, resolveConflictsInstance.getRowData(0));
        var jsonData = resolveConflictsInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
        for (var j = 0; j < 11; j++) {
            var col = (colArr[j]).concat(parseInt(index) + 1);
            var valueToCompare = (jsonData[0])[j];
            var valueToCompareWith = (jsonData[1])[j];
            if ((valueToCompare == valueToCompareWith)) {
                planningUnitsInstance.setStyle(col, "background-color", "transparent");
            } else {
                planningUnitsInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                planningUnitsInstance.setValueFromCoords(14, index, 2, true);
            }
        }
        this.setState({
            conflictsCountPlanningUnits: this.state.conflictsCountPlanningUnits - 1
        }, () => {
            this.mergeData()
        })
        planningUnitsInstance.orderBy(14, 0);
        planningUnitsInstance.options.editable = false;
        this.togglePlanningUnitsConflictModal('', '', 0, '');
        this.setState({ loading: false })
    }

    acceptIncomingChangesPlanningUnits() {
        this.setState({ loading: true })
        var resolveConflictsInstance = this.state.planningUnitsConflictsInstance;
        var planningUnitsInstance = this.state.planningUnitsInstance;
        var index = document.getElementById("planningUnitsIndex").value;
        planningUnitsInstance.options.editable = true;
        planningUnitsInstance.setRowData(index, resolveConflictsInstance.getRowData(1));
        var jsonData = resolveConflictsInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
        for (var j = 0; j < 11; j++) {
            var col = (colArr[j]).concat(parseInt(index) + 1);
            var valueToCompare = (jsonData[0])[j];
            var valueToCompareWith = (jsonData[1])[j];
            if ((valueToCompare == valueToCompareWith)) {
                planningUnitsInstance.setStyle(col, "background-color", "transparent");
            } else {
                planningUnitsInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                planningUnitsInstance.setValueFromCoords(14, (index), 3, true);
            }
        }
        planningUnitsInstance.orderBy(14, 0);
        planningUnitsInstance.options.editable = false;
        this.setState({
            conflictsCountPlanningUnits: this.state.conflictsCountPlanningUnits - 1
        }, () => {
            this.mergeData()
        })
        this.togglePlanningUnitsConflictModal('', '', 0, '');
        this.setState({ loading: false })
    }

    toggle(tabPane, tab) {
        const newArray = this.state.activeTab.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab: newArray,
        });
    }

    setIncludeOnlySelectedForecasts(e) {
        this.setState({
            includeOnlySelectedForecasts: e.target.checked
        }, () => {
            dataCheck(this, this.state.programDataLocal);
        })
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
                color: '#BA0C2F'
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
                    color: '#BA0C2F'
                })
                // this.hideFirstComponent()
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programList = [];
                var myResult = programRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
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
                }
                var programId = "";
                var event = {
                    target: {
                        value: ""
                    }
                };
                if (programList.length == 1) {
                    programId = programList[0].id;
                    event.target.value = programList[0].id;
                } else if (localStorage.getItem("sesDatasetId") != "" && programList.filter(c => c.id == localStorage.getItem("sesDatasetId")).length > 0) {
                    programId = localStorage.getItem("sesDatasetId");
                    event.target.value = localStorage.getItem("sesDatasetId");
                }
                programList = programList.sort(function (a, b) {
                    a = a.name.toLowerCase();
                    b = b.name.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                this.setState({
                    programList: programList,
                    loading: false,
                    programId: programId
                }, () => {
                    if (programId != "") {
                        this.setProgramId(event);
                    }
                })
            }.bind(this)
        }.bind(this)
    }

    setProgramId(e) {
        // console.log("In set program Id@@@@@@@@@@@%%%%%%%%%%%%%")
        var programId = e.target.value;
        this.setState({
            loading: true,
            showCompare: false,
        }, () => {
            if (programId != "" && programId != undefined && programId != null) {
                var myResult = [];
                myResult = this.state.programList;
                localStorage.setItem("sesDatasetId", programId);
                localStorage.setItem("sesForecastProgramIdReport", programId.split("_")[0]);
                localStorage.setItem("sesForecastVersionIdReport", programId.split("_")[1].toString().replaceAll("v", ""));
                this.setState({
                    programId: programId
                })

                // var db1;
                // getDatabase();
                // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                // openRequest.onerror = function (event) {
                //     this.setState({
                //         message: i18n.t('static.program.errortext'),
                //         color: '#BA0C2F'
                //     })
                //     // this.hideFirstComponent()
                // }.bind(this);
                // openRequest.onsuccess = function (e) {
                //     db1 = e.target.result;
                //     var programDataTransaction = db1.transaction(['downloadedDatasetData'], 'readwrite');
                //     var programDataOs = programDataTransaction.objectStore('downloadedDatasetData');
                //     var programRequest = programDataOs.get(programId);
                //     programRequest.onsuccess = function (e) {
                //         var myResult1 = programRequest.result;
                //         var datasetDataBytes = CryptoJS.AES.decrypt(myResult1.programData, SECRET_KEY);
                //         var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
                //         var datasetJson = JSON.parse(datasetData);

                let programData = myResult.filter(c => (c.id == programId));
                this.setState({
                    programDataLocal: programData[0].datasetJson,
                    programCode: programData[0].datasetJson.programCode,
                    version: programData[0].version,
                    pageName: i18n.t('static.button.commit'),
                    // programDataDownloaded: datasetJson,
                    programName: programData[0].datasetJson.programCode + '~v' + programData[0].version + ' (local)',
                    programNameOriginal: getLabelText(programData[0].datasetJson.label, this.state.lang),
                    forecastStartDate: programData[0].datasetJson.currentVersion.forecastStartDate,
                    forecastStopDate: programData[0].datasetJson.currentVersion.forecastStopDate,
                    notes: programData[0].datasetJson.currentVersion.notes
                })
                AuthenticationService.setupAxiosInterceptors();
                ProgramService.getLatestVersionForProgram((programData[0].datasetJson.programId)).then(response1 => {
                    //   if (response1.status == 200) {
                    var latestVersion = response1.data;
                    var programVersionJson = [];
                    var json = {
                        programId: programData[0].datasetJson.programId,
                        versionId: '-1'
                    }
                    programVersionJson = programVersionJson.concat([json]);
                    if (latestVersion == programData[0].version) {
                    } else {
                        programVersionJson.push({ programId: programData[0].datasetJson.programId, versionId: programData[0].version });
                    }
                    DatasetService.getAllDatasetData(programVersionJson)
                        .then(response => {
                            response.data = decompressJson(response.data);
                            // console.log("In response@@@@@@@@@@@%%%%%%%%%%%%%")
                            var programDataServer = response.data[0];
                            var programDataDownloaded = response.data.length > 1 ? response.data[1] : response.data[0];
                            var programDataLocal = programData[0].datasetJson;
                            console.log("program data local test@123", programDataLocal)
                            this.setState({
                                programDataServer: response.data[0],
                                programDataDownloaded: response.data.length > 1 ? response.data[1] : response.data[0],
                            })
                            var data = [];
                            data = [];
                            var versionSettings = programDataLocal.currentVersion;
                            var versionSettingsLatest = programDataServer.currentVersion;
                            var versionSettingsDownloaded = programDataDownloaded.currentVersion;
                            data[0] = moment(versionSettings.forecastStartDate).format("YYYY-MM-DD");
                            data[1] = moment(versionSettings.forecastStopDate).format("YYYY-MM-DD");
                            data[2] = versionSettings.daysInMonth != null ? versionSettings.daysInMonth : '0';
                            data[3] = (versionSettings.freightPerc == null ? '' : versionSettings.freightPerc)
                            data[4] = (versionSettings.forecastThresholdHighPerc == null ? '' : versionSettings.forecastThresholdHighPerc)
                            data[5] = (versionSettings.forecastThresholdLowPerc == null ? '' : versionSettings.forecastThresholdLowPerc)
                            data[6] = [moment(versionSettings.forecastStartDate).format("YYYY-MM-DD"), moment(versionSettings.forecastStopDate).format("YYYY-MM-DD"), versionSettings.daysInMonth != null ? versionSettings.daysInMonth : '0', (versionSettings.freightPerc == null ? '' : versionSettings.freightPerc), (versionSettings.forecastThresholdHighPerc == null ? '' : versionSettings.forecastThresholdHighPerc), (versionSettings.forecastThresholdLowPerc == null ? '' : versionSettings.forecastThresholdLowPerc)];
                            data[7] = [moment(versionSettingsLatest.forecastStartDate).format("YYYY-MM-DD"), moment(versionSettingsLatest.forecastStopDate).format("YYYY-MM-DD"), versionSettingsLatest.daysInMonth != null ? versionSettingsLatest.daysInMonth : '0', (versionSettingsLatest.freightPerc == null ? '' : versionSettingsLatest.freightPerc), (versionSettingsLatest.forecastThresholdHighPerc == null ? '' : versionSettingsLatest.forecastThresholdHighPerc), (versionSettingsLatest.forecastThresholdLowPerc == null ? '' : versionSettingsLatest.forecastThresholdLowPerc)];
                            data[8] = [moment(versionSettingsDownloaded.forecastStartDate).format("YYYY-MM-DD"), moment(versionSettingsDownloaded.forecastStopDate).format("YYYY-MM-DD"), versionSettingsDownloaded.daysInMonth != null ? versionSettingsDownloaded.daysInMonth : '0', (versionSettingsDownloaded.freightPerc == null ? '' : versionSettingsDownloaded.freightPerc), (versionSettingsDownloaded.forecastThresholdHighPerc == null ? '' : versionSettingsDownloaded.forecastThresholdHighPerc), (versionSettingsDownloaded.forecastThresholdLowPerc == null ? '' : versionSettingsDownloaded.forecastThresholdLowPerc)];
                            data[9] = 4;
                            var options = {
                                data: [data],
                                columnDrag: true,
                                columns: [
                                    {
                                        title: i18n.t('static.program.forecastStart'),
                                        type: 'calendar',
                                        options: {
                                            format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                                        } // 7 H
                                    },
                                    {
                                        title: i18n.t('static.program.forecastEnd'),
                                        type: 'calendar',
                                        filterOptions: this.filterStopDate,
                                        options: {
                                            format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker'
                                        }// 9 J
                                    },
                                    {
                                        title: i18n.t('static.program.noOfDaysInMonth'),
                                        type: 'dropdown',
                                        source: this.state.noOfDays,
                                        // width: '150',
                                    },//13 N


                                    {
                                        title: i18n.t('static.versionSettings.freight%'),
                                        type: 'numeric',
                                        textEditor: true,
                                        mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                                        // readOnly: true
                                    },//14 O
                                    {
                                        title: i18n.t('static.versionSettings.forecastThresholdHigh'),
                                        type: 'numeric',
                                        textEditor: true,
                                        mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                                        // readOnly: true
                                    },//15 P
                                    {
                                        title: i18n.t('static.versionSettings.ForecastThresholdLow'),
                                        type: 'numeric',
                                        textEditor: true,
                                        mask: '#,##.00', decimal: '.', disabledMaskOnEdition: false
                                        // readOnly: true
                                    },//16 Q
                                    {
                                        type: 'hidden',
                                        title: 'Old Data'
                                    },
                                    {
                                        type: 'hidden',
                                        title: 'Latest Data'
                                    },
                                    {
                                        type: 'hidden',
                                        title: 'Downloaded Data'
                                    },
                                    {
                                        type: 'hidden'
                                    }
                                ],
                                pagination: localStorage.getItem("sesRecordCount"),
                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                search: true,
                                columnSorting: true,
                                // tableOverflow: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                // editable: false,
                                onload: this.loadedFunctionForVersionSettings,
                                // text: {
                                //   showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                //   show: '',
                                //   entries: '',
                                // },
                                filters: true,
                                license: JEXCEL_PRO_KEY,
                                contextMenu: function (obj, x, y, e) {
                                    var items = [];
                                    //Resolve conflicts
                                    var rowData = obj.getRowData(y)
                                    if (rowData[9].toString() == 1) {
                                        items.push({
                                            title: "Resolve conflicts",
                                            onclick: function () {
                                                this.setState({ loading: true })
                                                this.toggleVersionSettingsConflictModal(rowData[6], rowData[7], y, 'versionSettings');
                                            }.bind(this)
                                        })
                                    } else {
                                        return false;
                                    }

                                    // if (rowData[0].toString() > 0) {
                                    //   items.push({
                                    //     title: "Show version history",
                                    //     onclick: function () {
                                    //       this.toggleVersionHistory(rowData[13]);
                                    //     }.bind(this)
                                    //   })
                                    // }
                                    return items;
                                }.bind(this)
                            };

                            var versionSettingsDiv = jexcel(document.getElementById("versionSettingsDiv"), options);
                            this.el = versionSettingsDiv;


                            var data = [];
                            data = [];
                            var planningUnits = programDataLocal.planningUnitList;
                            var planningUnitsLatest = programDataServer.planningUnitList;
                            var planningUnitsDownloaded = programDataDownloaded.planningUnitList;
                            console.log("Planning Units Test@123", planningUnits);
                            console.log("Planning Units 1 Test@123", planningUnitsLatest);
                            console.log("Planning Units 2 Test@123", planningUnitsDownloaded);
                            var mergedPlanningUnitList = [];
                            var existingPlanningUnitIds = [];
                            for (var pu = 0; pu < planningUnits.length; pu++) {
                                if (planningUnits[pu].programPlanningUnitId != 0) {
                                    mergedPlanningUnitList.push(planningUnits[pu]);
                                    existingPlanningUnitIds.push(planningUnits[pu].planningUnit.id);
                                } else {
                                    // If 0 check whether that exists in latest version or not
                                    var index = planningUnitsLatest.findIndex(f =>
                                        f.planningUnit.id == planningUnits[pu].planningUnit.id
                                    );
                                    if (index == -1) { // Does not exists
                                        mergedPlanningUnitList.push(planningUnits[pu]);
                                    } else { // Exists
                                        planningUnits[pu].programPlanningUnitId = planningUnitsLatest[index].programPlanningUnitId;
                                        existingPlanningUnitIds.push(planningUnitsLatest[index].planningUnit.id);
                                        mergedPlanningUnitList.push(planningUnits[pu]);
                                    }

                                }
                            }
                            var latestOtherPlanningUnits = planningUnitsLatest.filter(c => !(existingPlanningUnitIds.includes(c.planningUnit.id)));
                            mergedPlanningUnitList = mergedPlanningUnitList.concat(latestOtherPlanningUnits);
                            var mergedPlanningUnitListArray = [];
                            var productCategoryList = [];
                            var planningUnitList = [];
                            var procurementAgentList = [];
                            procurementAgentList.push({
                                name: 'CUSTOM',
                                id: -1
                            });
                            for (var pul = 0; pul < mergedPlanningUnitList.length; pul++) {
                                if (productCategoryList.findIndex(c => c.id == mergedPlanningUnitList[pul].planningUnit.forecastingUnit.productCategory.id) == -1) {
                                    productCategoryList.push({ id: mergedPlanningUnitList[pul].planningUnit.forecastingUnit.productCategory.id, name: getLabelText(mergedPlanningUnitList[pul].planningUnit.forecastingUnit.productCategory.label, this.state.lang) })
                                }
                                if (planningUnitList.findIndex(c => c.id == mergedPlanningUnitList[pul].planningUnit.id) == -1) {
                                    planningUnitList.push({ id: mergedPlanningUnitList[pul].planningUnit.id, name: getLabelText(mergedPlanningUnitList[pul].planningUnit.label, this.state.lang) });
                                }
                                if (!(mergedPlanningUnitList[pul].price === "" || mergedPlanningUnitList[pul].price == null || mergedPlanningUnitList[pul].price == undefined) ? "" : (mergedPlanningUnitList[pul].procurementAgent == null || mergedPlanningUnitList[pul].procurementAgent == undefined)) {
                                    if(mergedPlanningUnitList[pul].procurementAgent!=null && mergedPlanningUnitList[pul].procurementAgent!="" && mergedPlanningUnitList[pul].procurementAgent!=undefined && mergedPlanningUnitList[pul].procurementAgent.id!=null && mergedPlanningUnitList[pul].procurementAgent.id!=undefined && mergedPlanningUnitList[pul].procurementAgent.id!=""){
                                    if (procurementAgentList.findIndex(c => c.id == mergedPlanningUnitList[pul].procurementAgent.id) == -1) {
                                        procurementAgentList.push({ id: mergedPlanningUnitList[pul].procurementAgent.id, name: getLabelText(mergedPlanningUnitList[pul].procurementAgent.label, this.state.lang) });
                                    }
                                }
                                }
                                data = [];
                                data[0] = mergedPlanningUnitList[pul].planningUnit.forecastingUnit.productCategory.id;
                                data[1] = mergedPlanningUnitList[pul].planningUnit.id;
                                data[2] = mergedPlanningUnitList[pul].consuptionForecast;
                                data[3] = mergedPlanningUnitList[pul].treeForecast;
                                data[4] = mergedPlanningUnitList[pul].stock;
                                data[5] = mergedPlanningUnitList[pul].existingShipments;
                                data[6] = mergedPlanningUnitList[pul].monthsOfStock;
                                data[7] = (mergedPlanningUnitList[pul].price === "" || mergedPlanningUnitList[pul].price == null || mergedPlanningUnitList[pul].price == undefined) ? "" : (mergedPlanningUnitList[pul].procurementAgent == null || mergedPlanningUnitList[pul].procurementAgent == undefined ? -1 : mergedPlanningUnitList[pul].procurementAgent.id)
                                data[8] = mergedPlanningUnitList[pul].price;
                                data[9] = mergedPlanningUnitList[pul].planningUnitNotes;
                                data[10] = mergedPlanningUnitList[pul].active;

                                var oldDataList = planningUnits.filter(c => c.programPlanningUnitId == mergedPlanningUnitList[pul].programPlanningUnitId);
                                var oldData = ""
                                if (oldDataList.length > 0) {
                                    oldData = [oldDataList[0].planningUnit.forecastingUnit.productCategory.id, oldDataList[0].planningUnit.id, oldDataList[0].consumptionForecast, oldDataList[0].treeForecast, oldDataList[0].stock, oldDataList[0].existingShipments, oldDataList[0].monthsOfStock, (oldDataList[0].price === "" || oldDataList[0].price == null || oldDataList[0].price == undefined) ? "" : (oldDataList[0].procurementAgent == null || oldDataList[0].procurementAgent == undefined ? -1 : oldDataList[0].procurementAgent.id), oldDataList[0].price, oldDataList[0].planningUnitNotes, oldDataList[0].active];
                                }

                                data[11] = oldData;

                                var latestDataList = planningUnitsLatest.filter(c => c.programPlanningUnitId == mergedPlanningUnitList[pul].programPlanningUnitId);
                                var latestData = ""
                                if (latestDataList.length > 0) {
                                    latestData = [latestDataList[0].planningUnit.forecastingUnit.productCategory.id, latestDataList[0].planningUnit.id, latestDataList[0].consumptionForecast, latestDataList[0].treeForecast, latestDataList[0].stock, latestDataList[0].existingShipments, latestDataList[0].monthsOfStock, (latestDataList[0].price === "" || latestDataList[0].price == null || latestDataList[0].price == undefined) ? "" : (latestDataList[0].procurementAgent == null || latestDataList[0].procurementAgent == undefined ? -1 : latestDataList[0].procurementAgent.id), latestDataList[0].price, latestDataList[0].planningUnitNotes, latestDataList[0].active];
                                }

                                data[12] = latestData;

                                var downloadedDataList = planningUnitsDownloaded.filter(c => c.programPlanningUnitId == mergedPlanningUnitList[pul].programPlanningUnitId);
                                var downloadedData = "";
                                if (downloadedDataList.length > 0) {
                                    downloadedData = [downloadedDataList[0].planningUnit.forecastingUnit.productCategory.id, downloadedDataList[0].planningUnit.id, downloadedDataList[0].consumptionForecast, downloadedDataList[0].treeForecast, downloadedDataList[0].stock, downloadedDataList[0].existingShipments, downloadedDataList[0].monthsOfStock, (downloadedDataList[0].price === "" || downloadedDataList[0].price == null || downloadedDataList[0].price == undefined) ? "" : (downloadedDataList[0].procurementAgent == null || downloadedDataList[0].procurementAgent == undefined ? -1 : downloadedDataList[0].procurementAgent.id), downloadedDataList[0].price, downloadedDataList[0].planningUnitNotes, downloadedDataList[0].active];
                                }

                                data[13] = downloadedData;
                                data[14] = 4;
                                mergedPlanningUnitListArray.push(data);
                            }
                            var options = {
                                data: mergedPlanningUnitListArray,
                                columnDrag: true,
                                columns: [
                                    {
                                        title: i18n.t('static.productCategory.productCategory'),
                                        type: 'dropdown',
                                        source: productCategoryList,
                                        // readOnly: true// 0A
                                    },
                                    {
                                        title: i18n.t('static.dashboard.planningunitheader'),
                                        type: 'dropdown',
                                        source: planningUnitList,
                                        width: '170',
                                        // readOnly: true //1B
                                    },
                                    {
                                        title: i18n.t('static.commitTree.consumptionForecast') + ' ?',
                                        type: 'checkbox',
                                        width: '150',
                                        // readOnly: true //2C
                                    },
                                    {
                                        title: i18n.t('static.TreeForecast.TreeForecast') + ' ?',
                                        type: 'checkbox',
                                        width: '150'
                                        // readOnly: true //3D
                                    },
                                    {
                                        title: i18n.t('static.planningUnitSetting.stockEndOf'),
                                        type: 'numeric',
                                        textEditor: true,
                                        // decimal: '.',
                                        mask: '#,##',
                                        width: '150',
                                        disabledMaskOnEdition: true
                                        // readOnly: true //4E
                                    },
                                    {
                                        title: i18n.t('static.planningUnitSetting.existingShipments'),
                                        type: 'numeric',
                                        textEditor: true,
                                        // decimal: '.',
                                        mask: '#,##',
                                        width: '150',
                                        disabledMaskOnEdition: true
                                        // readOnly: true //5F
                                    },
                                    {
                                        title: i18n.t('static.planningUnitSetting.desiredMonthsOfStock'),
                                        type: 'numeric',
                                        textEditor: true,
                                        // decimal: '.',
                                        mask: '#,##',
                                        disabledMaskOnEdition: true,
                                        width: '150'
                                        // readOnly: true //6G
                                    },
                                    {
                                        title: i18n.t('static.forecastReport.priceType'),
                                        type: 'dropdown',
                                        source: procurementAgentList,
                                        width: '120'
                                        // filter: this.filterProcurementAgentByPlanningUnit
                                        // readOnly: true //7H
                                    },
                                    {
                                        title: i18n.t('static.forecastReport.unitPrice'),
                                        type: 'numeric',
                                        textEditor: true,
                                        decimal: '.',
                                        mask: '#,##.00',
                                        width: '120',
                                        disabledMaskOnEdition: true
                                        // readOnly: true //8I
                                    },
                                    {
                                        title: i18n.t('static.program.notes'),
                                        type: 'text',
                                        // width: 400 //15P
                                    },
                                    {
                                        title: 'Active',
                                        type: 'checkbox',
                                        // readOnly: true //16Q
                                    },
                                    {
                                        type: 'hidden',
                                        title: 'Old Data'
                                    },
                                    {
                                        type: 'hidden',
                                        title: 'Latest Data'
                                    },
                                    {
                                        type: 'hidden',
                                        title: 'Downloaded Data'
                                    },
                                    {
                                        type: 'hidden'
                                    }
                                ],
                                pagination: localStorage.getItem("sesRecordCount"),
                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                search: true,
                                columnSorting: true,
                                // tableOverflow: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                // editable: false,
                                onload: this.loadedFunctionForPlanningUnits,
                                // text: {
                                //   showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                //   show: '',
                                //   entries: '',
                                // },
                                filters: true,
                                license: JEXCEL_PRO_KEY,
                                contextMenu: function (obj, x, y, e) {
                                    var items = [];
                                    //Resolve conflicts
                                    var rowData = obj.getRowData(y)
                                    if (rowData[14].toString() == 1) {
                                        items.push({
                                            title: "Resolve conflicts",
                                            onclick: function () {
                                                this.setState({ loading: true })
                                                this.togglePlanningUnitsConflictModal(rowData[11], rowData[12], y, 'planningUnits');
                                            }.bind(this)
                                        })
                                    } else {
                                        return false;
                                    }

                                    // if (rowData[0].toString() > 0) {
                                    //   items.push({
                                    //     title: "Show version history",
                                    //     onclick: function () {
                                    //       this.toggleVersionHistory(rowData[13]);
                                    //     }.bind(this)
                                    //   })
                                    // }
                                    return items;
                                }.bind(this)
                            };

                            var planningUnitDiv = jexcel(document.getElementById("planningUnitDiv"), options);
                            this.el = planningUnitDiv;


                            var data = [];
                            data = [];
                            var regionListLocal = programDataLocal.regionList;
                            var regionListServer = programDataServer.regionList;
                            var regionListDownloaded = programDataDownloaded.regionList;
                            var mergedRegionList = regionListLocal;
                            regionListServer.map(item => {
                                if (mergedRegionList.findIndex(c => c.regionId == item.regionId) == -1) {
                                    mergedRegionList.push(item);
                                }
                            });
                            regionListDownloaded.map(item => {
                                if (mergedRegionList.findIndex(c => c.regionId == item.regionId) == -1) {
                                    mergedRegionList.push(item);
                                }
                            })

                            var planningUnitSet = [...new Set(mergedPlanningUnitList.map(ele => (ele.planningUnit.id)))];
                            var regionSet = [...new Set(mergedRegionList.map(ele => (ele.regionId)))];

                            var mergedConsumptionListArray = [];
                            for (var pul = 0; pul < mergedPlanningUnitList.length; pul++) {
                                for (var rl = 0; rl < mergedRegionList.length; rl++) {
                                    var localModifiedDate = "";
                                    var serverModifiedDate = "";
                                    var downloadedModifiedDate = "";
                                    var actualConsumptionListLocal = programDataLocal.actualConsumptionList.filter(c => c.planningUnit.id == mergedPlanningUnitList[pul].planningUnit.id && c.region.id == mergedRegionList[rl].regionId);
                                    var extrapolationListLocal = programDataLocal.consumptionExtrapolation.filter(c => c.planningUnit.id == mergedPlanningUnitList[pul].planningUnit.id && c.region.id == mergedRegionList[rl].regionId);
                                    if (actualConsumptionListLocal.length > 0 || extrapolationListLocal.length > 0) {
                                        var localModifiedDate = moment.max(actualConsumptionListLocal.concat(extrapolationListLocal).map(d => moment(d.createdDate)));
                                    }
                                    var actualConsumptionListServer = programDataServer.actualConsumptionList.filter(c => c.planningUnit.id == mergedPlanningUnitList[pul].planningUnit.id && c.region.id == mergedRegionList[rl].regionId);
                                    var extrapolationListServer = programDataServer.consumptionExtrapolation.filter(c => c.planningUnit.id == mergedPlanningUnitList[pul].planningUnit.id && c.region.id == mergedRegionList[rl].regionId);
                                    if (actualConsumptionListServer.length > 0 || extrapolationListServer.length > 0) {
                                        var serverModifiedDate = moment.max(actualConsumptionListServer.concat(extrapolationListServer).map(d => moment(d.createdDate)));
                                    }
                                    var actualConsumptionListDownloaded = programDataDownloaded.actualConsumptionList.filter(c => c.planningUnit.id == mergedPlanningUnitList[pul].planningUnit.id && c.region.id == mergedRegionList[rl].regionId);
                                    var extrapolationListDownloaded = programDataDownloaded.consumptionExtrapolation.filter(c => c.planningUnit.id == mergedPlanningUnitList[pul].planningUnit.id && c.region.id == mergedRegionList[rl].regionId);
                                    if (actualConsumptionListDownloaded.length > 0 || extrapolationListDownloaded.length > 0) {
                                        var downloadedModifiedDate = moment.max(actualConsumptionListDownloaded.concat(extrapolationListDownloaded).map(d => moment(d.createdDate)));
                                    }
                                    data = [];
                                    data[0] = getLabelText(mergedPlanningUnitList[pul].planningUnit.label, this.state.lang) + " | " + mergedPlanningUnitList[pul].planningUnit.id;
                                    data[1] = getLabelText(mergedRegionList[rl].label, this.state.lang);
                                    data[2] = localModifiedDate != "" ? moment(localModifiedDate).format("YYYY-MM-DD") : "";
                                    data[3] = serverModifiedDate != "" ? moment(serverModifiedDate).format("YYYY-MM-DD") : "";
                                    data[4] = downloadedModifiedDate != "" ? moment(downloadedModifiedDate).format("YYYY-MM-DD") : "";
                                    data[5] = false;
                                    data[6] = 4;
                                    data[7] = localModifiedDate != "" ? moment(localModifiedDate).format("YYYY-MM-DD HH:mm:ss") : "";
                                    data[8] = serverModifiedDate != "" ? moment(serverModifiedDate).format("YYYY-MM-DD HH:mm:ss") : "";
                                    data[9] = downloadedModifiedDate != "" ? moment(downloadedModifiedDate).format("YYYY-MM-DD HH:mm:ss") : "";
                                    data[10] = mergedPlanningUnitList[pul].planningUnit.id
                                    data[11] = mergedRegionList[rl].regionId;
                                    mergedConsumptionListArray.push(data);
                                }
                            }
                            var options = {
                                data: mergedConsumptionListArray,
                                columnDrag: true,
                                columns: [
                                    {
                                        title: i18n.t('static.dashboard.planningunitheader'),
                                        type: 'text',
                                        width: '170',
                                        // readOnly: true //1B
                                    },
                                    {
                                        title: i18n.t('static.dashboard.regionreport'),
                                        type: 'text',
                                        width: '150',
                                        // readOnly: true //2C
                                    },
                                    {
                                        title: i18n.t("static.commitVersion.localV") + programDataLocal.currentVersion.versionId,
                                        type: 'calendar',
                                        options: {
                                            format: JEXCEL_DATE_FORMAT_SM
                                        }// 5 F
                                    },
                                    {
                                        title: i18n.t("static.commitVersion.serverV") + programDataServer.currentVersion.versionId,
                                        type: 'calendar',
                                        options: {
                                            format: JEXCEL_DATE_FORMAT_SM
                                        }// 5 F
                                    },
                                    {
                                        type: 'hidden',
                                        title: "Downloaded v7"
                                    },
                                    {
                                        title: 'Exclude',
                                        type: 'checkbox',
                                        // readOnly: true //16Q
                                    },
                                    {
                                        type: 'hidden'
                                    },
                                    {
                                        type: 'hidden'
                                    },
                                    {
                                        type: 'hidden'
                                    },
                                    {
                                        type: 'hidden'
                                    },
                                    {
                                        type: 'hidden'
                                    },
                                    {
                                        type: 'hidden'
                                    }
                                ],
                                pagination: localStorage.getItem("sesRecordCount"),
                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                search: true,
                                columnSorting: true,
                                // tableOverflow: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                // editable: false,
                                onload: this.loadedFunctionForConsumption,
                                // text: {
                                //   showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                //   show: '',
                                //   entries: '',
                                // },
                                filters: true,
                                license: JEXCEL_PRO_KEY,
                                contextMenu: function (obj, x, y, e) {
                                    var items = [];
                                    //Resolve conflicts
                                    var rowData = obj.getRowData(y)
                                    if (rowData[6].toString() == 1) {
                                        items.push({
                                            title: "Accept Local Version",
                                            onclick: function () {
                                                obj.options.editable = true;
                                                console.log("In on click Test@123", obj);
                                                var col = ("A").concat(parseInt(y) + 1);
                                                console.log("col Test@123", col)
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("B").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("C").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                obj.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                                                var col = ("D").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("E").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("F").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                obj.setValueFromCoords(3, y, "", true);
                                                obj.setValueFromCoords(6, y, 2, true);
                                                obj.options.editable = false;
                                                this.setState({
                                                    conflictsCountConsumption: this.state.conflictsCountConsumption - 1
                                                }, () => {
                                                    this.mergeData()
                                                })
                                            }.bind(this)
                                        })
                                        items.push({
                                            title: "Accept Server Version",
                                            onclick: function () {
                                                obj.options.editable = true;
                                                var col = ("A").concat(parseInt(y) + 1);
                                                console.log("col Test@123", col)
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("B").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("D").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                obj.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                                                var col = ("C").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("E").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("F").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                obj.setValueFromCoords(2, y, "", true);
                                                obj.setValueFromCoords(6, y, 3, true);
                                                obj.options.editable = false;
                                                this.setState({
                                                    conflictsCountConsumption: this.state.conflictsCountConsumption - 1
                                                }, () => {
                                                    this.mergeData()
                                                })
                                            }.bind(this)
                                        })
                                    } else {
                                        return false;
                                    }
                                    return items;
                                }.bind(this)
                            };

                            var consumptionDiv = jexcel(document.getElementById("consumptionDiv"), options);
                            this.el = consumptionDiv;


                            var data = [];
                            data = [];
                            var treeListLocal = programDataLocal.treeList;
                            console.log("treeListLocal 1 test@123", treeListLocal)
                            console.log("program data local test@123", programDataLocal)
                            var treeListServer = programDataServer.treeList;
                            var treeListDownloaded = programDataDownloaded.treeList;
                            var mergedTreeList = [];
                            var treeAnchorIds = [];
                            treeListLocal.map(item => {
                                mergedTreeList.push(item)
                            })
                            mergedTreeList.map((item, index) => {
                                console.log("item test@123", item)
                                var getAnchorTreeIdFromDownloadedVersion = treeListDownloaded.filter(c => c.treeId == item.treeId);
                                var checkIfTreeAnchorIdAlreadyExists = getAnchorTreeIdFromDownloadedVersion.length > 0 ? treeAnchorIds.filter(c => c == getAnchorTreeIdFromDownloadedVersion[0].treeAnchorId) : [];
                                item.treeAnchorId = getAnchorTreeIdFromDownloadedVersion.length > 0 && checkIfTreeAnchorIdAlreadyExists.length == 0 ? getAnchorTreeIdFromDownloadedVersion[0].treeAnchorId : 0;
                                treeListLocal[index].treeAnchorId = getAnchorTreeIdFromDownloadedVersion.length > 0 && checkIfTreeAnchorIdAlreadyExists.length == 0 ? getAnchorTreeIdFromDownloadedVersion[0].treeAnchorId : 0;
                                if (getAnchorTreeIdFromDownloadedVersion.length > 0) {
                                    treeAnchorIds.push(getAnchorTreeIdFromDownloadedVersion[0].treeAnchorId)
                                }
                                if (item.treeAnchorId == 0) {
                                    item.tempTreeAnchorId = item.treeId;
                                    treeListLocal[index].tempTreeAnchorId = item.treeId;
                                }

                            })

                            treeListServer.map(item => {
                                if (mergedTreeList.findIndex(c => c.treeAnchorId == item.treeAnchorId) == -1) {
                                    mergedTreeList.push(item);
                                }
                            });
                            var mergedTreeListArray = [];
                            console.log("mergedTreeListArray Test@123", mergedTreeList)
                            console.log("treeListLocal test@123", treeListLocal)
                            for (var pul = 0; pul < mergedTreeList.length; pul++) {
                                var treeLocal = treeListLocal.filter(c => c.treeAnchorId > 0 ? c.treeAnchorId == mergedTreeList[pul].treeAnchorId : c.tempTreeAnchorId == mergedTreeList[pul].tempTreeAnchorId);
                                console.log("tree local test@123", treeLocal)
                                var treeServer = treeListServer.filter(c => c.treeAnchorId == mergedTreeList[pul].treeAnchorId);
                                var treeDownloaded = treeListDownloaded.filter(c => c.treeAnchorId == mergedTreeList[pul].treeAnchorId);
                                data = [];
                                data[0] = treeLocal.length > 0 ? getLabelText(treeLocal[0].label, this.state.lang) + " (" + treeLocal[0].regionList.map(x => getLabelText(x.label, this.state.lang)).join(", ") + " " + moment(treeLocal[0].lastModifiedDate).format(DATE_FORMAT_CAP) + ")" : "";
                                data[1] = treeServer.length > 0 ? getLabelText(treeServer[0].label, this.state.lang) + " (" + treeServer[0].regionList.map(x => getLabelText(x.label, this.state.lang)).join(", ") + " " + moment(treeServer[0].lastModifiedDate).format(DATE_FORMAT_CAP) + ")" : "";
                                data[2] = treeDownloaded.length > 0 ? getLabelText(treeDownloaded[0].label, this.state.lang) + " (" + treeDownloaded[0].regionList.map(x => getLabelText(x.label, this.state.lang)).join(", ") + " " + moment(treeDownloaded[0].lastModifiedDate).format(DATE_FORMAT_CAP) + ")" : "";
                                data[3] = false;
                                data[4] = mergedTreeList[pul].treeAnchorId;
                                data[5] = mergedTreeList[pul].tempTreeAnchorId != undefined ? mergedTreeList[pul].tempTreeAnchorId : 0;
                                data[6] = 4;
                                data[7] = treeLocal.length > 0 ? moment(treeLocal[0].lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") : "";
                                data[8] = treeServer.length > 0 ? moment(treeServer[0].lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") : "";
                                data[9] = treeDownloaded.length > 0 ? moment(treeDownloaded[0].lastModifiedDate).format("YYYY-MM-DD HH:mm:ss") : "";
                                mergedTreeListArray.push(data);
                            }
                            var options = {
                                data: mergedTreeListArray,
                                columnDrag: true,
                                columns: [
                                    {
                                        title: i18n.t("static.commitVersion.localV") + programDataLocal.currentVersion.versionId,
                                        type: 'text',
                                        options: {
                                            format: JEXCEL_DATE_FORMAT_SM
                                        }// 5 F
                                    },
                                    {
                                        title: i18n.t("static.commitVersion.serverV") + programDataServer.currentVersion.versionId,
                                        type: 'text',
                                        options: {
                                            format: JEXCEL_DATE_FORMAT_SM
                                        }// 5 F
                                    },
                                    {
                                        type: 'hidden',
                                        title: "Downloaded v7"
                                    },
                                    {
                                        title: 'Exclude',
                                        type: 'checkbox',
                                        // readOnly: true //16Q
                                    },
                                    {
                                        type: 'hidden'
                                    },
                                    {
                                        type: 'hidden'
                                    },
                                    {
                                        type: 'hidden'
                                    },
                                    {
                                        type: 'hidden'
                                    },
                                    {
                                        type: 'hidden'
                                    },
                                    {
                                        type: 'hidden'
                                    }
                                ],
                                pagination: localStorage.getItem("sesRecordCount"),
                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                search: true,
                                columnSorting: true,
                                // tableOverflow: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                // editable: false,
                                onload: this.loadedFunctionForTree,
                                // text: {
                                //   showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                //   show: '',
                                //   entries: '',
                                // },
                                filters: true,
                                license: JEXCEL_PRO_KEY,
                                contextMenu: function (obj, x, y, e) {
                                    var items = [];
                                    //Resolve conflicts
                                    var rowData = obj.getRowData(y)
                                    if (rowData[6].toString() == 1) {
                                        items.push({
                                            title: "Accept Local Version",
                                            onclick: function () {
                                                obj.options.editable = true;
                                                var col = ("A").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                obj.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                                                var col = ("B").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("D").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                obj.setValueFromCoords(1, y, "", true);
                                                obj.setValueFromCoords(6, y, 2, true);
                                                obj.options.false = true;
                                                this.setState({
                                                    conflictsCountTree: this.state.conflictsCountTree - 1
                                                }, () => {
                                                    this.mergeData()
                                                })
                                            }.bind(this)
                                        })
                                        items.push({
                                            title: "Accept Server Version",
                                            onclick: function () {
                                                obj.options.editable = true;
                                                var col = ("B").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                obj.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                                                var col = ("A").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("D").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                obj.setValueFromCoords(0, y, "", true);
                                                obj.setValueFromCoords(6, y, 3, true);
                                                obj.options.editable = false;
                                                this.setState({
                                                    conflictsCountTree: this.state.conflictsCountTree - 1
                                                }, () => {
                                                    this.mergeData()
                                                })
                                            }.bind(this)
                                        })
                                    } else {
                                        return false;
                                    }
                                    return items;
                                }.bind(this)
                            };

                            var treeDiv = jexcel(document.getElementById("treeDiv"), options);
                            this.el = treeDiv;

                            let dataArray = [];
                            var data = [];
                            let columns = [];
                            let nestedHeaders = [];
                            nestedHeaders.push(
                                [
                                    {
                                        title: '',
                                        colspan: '1'
                                    },
                                    {
                                        title: '',
                                        colspan: '1'
                                    },
                                    {
                                        title: "V" + programDataLocal.currentVersion.versionId + "(Local)",
                                        colspan: 3,
                                    },
                                    {
                                        title: "V" + programDataServer.currentVersion.versionId + "(Server)",
                                        colspan: 3,
                                    },
                                ]
                            );
                            columns.push({ title: i18n.t('static.consumption.planningunit'), width: 300 })
                            columns.push({ title: i18n.t('static.dashboard.regionreport'), width: 100 })
                            // for (var r = 0; r < regionList.length; r++) {
                            columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), width: 200 })
                            columns.push({ title: i18n.t('static.compareVersion.forecastQty'), width: 120, type: 'numeric', mask: '#,##.00', decimal: '.' })
                            columns.push({ title: i18n.t('static.program.notes'), width: 210 })
                            // }
                            // for (var r = 0; r < regionList1.length; r++) {
                            columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), width: 200 })
                            columns.push({ title: i18n.t('static.compareVersion.forecastQty'), width: 120, type: 'numeric', mask: '#,##.00', decimal: '.' })
                            columns.push({ title: i18n.t('static.program.notes'), width: 210 })
                            // }
                            // for (var r = 0; r < regionList2.length; r++) {
                            columns.push({ title: i18n.t('static.compareVersion.selectedForecast'), width: 200, type: 'hidden' })
                            columns.push({ title: i18n.t('static.compareVersion.forecastQty'), width: 120, type: 'hidden' })
                            columns.push({ title: i18n.t('static.program.notes'), width: 210, type: 'hidden' })
                            columns.push({ title: i18n.t('conflict'), width: 210, type: 'hidden' })
                            columns.push({ title: i18n.t('regional Data local'), width: 210, type: 'hidden' })
                            columns.push({ title: i18n.t('regional Data server'), width: 210, type: 'hidden' })
                            columns.push({ title: i18n.t('regional Data downloaded'), width: 210, type: 'hidden' })
                            columns.push({ title: i18n.t('pu'), width: 210, type: 'hidden' })
                            columns.push({ title: i18n.t('region'), width: 210, type: 'hidden' })
                            // }

                            var scenarioList = [];
                            var treeScenarioList = [];
                            var datasetData = programDataLocal;
                            var datasetData1 = programDataServer;
                            var datasetData2 = programDataDownloaded;
                            for (var t = 0; t < datasetData.treeList.length; t++) {
                                scenarioList = scenarioList.concat(datasetData.treeList[t].scenarioList);
                                var sl = datasetData.treeList[t].scenarioList;
                                for (var s = 0; s < sl.length; s++) {
                                    treeScenarioList.push({ treeLabel: getLabelText(datasetData.treeList[t].label), scenarioId: sl[s].id, treeId: datasetData.treeList[t].treeId, scenarioLabel: getLabelText(sl[s].label) })
                                }

                            }

                            var scenarioList1 = [];
                            var treeScenarioList1 = [];
                            for (var t = 0; t < datasetData1.treeList.length; t++) {
                                scenarioList1 = scenarioList1.concat(datasetData1.treeList[t].scenarioList);
                                var sl = datasetData1.treeList[t].scenarioList;
                                for (var s = 0; s < sl.length; s++) {
                                    treeScenarioList1.push({ treeLabel: getLabelText(datasetData1.treeList[t].label), scenarioId: sl[s].id, treeId: datasetData1.treeList[t].treeId, scenarioLabel: getLabelText(sl[s].label) })
                                }
                            }

                            var scenarioList2 = [];
                            var treeScenarioList2 = [];
                            for (var t = 0; t < datasetData2.treeList.length; t++) {
                                scenarioList2 = scenarioList2.concat(datasetData2.treeList[t].scenarioList);
                                var sl = datasetData2.treeList[t].scenarioList;
                                for (var s = 0; s < sl.length; s++) {
                                    treeScenarioList2.push({ treeLabel: getLabelText(datasetData2.treeList[t].label), scenarioId: sl[s].id, treeId: datasetData2.treeList[t].treeId, scenarioLabel: getLabelText(sl[s].label) })
                                }
                            }

                            var consumptionExtrapolation = datasetData.consumptionExtrapolation;
                            var consumptionExtrapolation1 = datasetData1.consumptionExtrapolation;
                            var consumptionExtrapolation2 = datasetData2.consumptionExtrapolation;
                            var regionList = datasetData.regionList;
                            var regionList1 = datasetData1.regionList;
                            var regionList2 = datasetData2.regionList;
                            for (var j = 0; j < planningUnitSet.length; j++) {
                                for (var k = 0; k < regionSet.length; k++) {
                                    data = [];
                                    var pu = datasetData.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);
                                    var pu1 = datasetData1.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);
                                    var pu2 = datasetData2.planningUnitList.filter(c => c.planningUnit.id == planningUnitSet[j]);

                                    var rg = regionList.filter(c => c.regionId == regionSet[k]);
                                    var rg1 = regionList1.filter(c => c.regionId == regionSet[k]);
                                    var rg2 = regionList2.filter(c => c.regionId == regionSet[k]);

                                    var selectedForecastData = pu.length > 0 ? pu[0].selectedForecastMap : '';
                                    var selectedForecastData1 = pu1.length > 0 ? pu1[0].selectedForecastMap : '';
                                    var selectedForecastData2 = pu2.length > 0 ? pu2[0].selectedForecastMap : '';


                                    // console.log("consumptionExtrapolation", consumptionExtrapolation);

                                    data[0] = pu.length > 0 ? getLabelText(pu[0].planningUnit.label, this.state.lang) + " | " + pu[0].planningUnit.id : getLabelText(pu1[0].planningUnit.label) + " | " + pu1[0].planningUnit.id;
                                    data[1] = rg.length > 0 ? getLabelText(rg[0].label) : getLabelText(rg1[0].label);

                                    // var count = 1;
                                    // for (var r = 0; r < regionList.length; r++) {
                                    var regionalSelectedForecastData = selectedForecastData[regionSet[k]];
                                    // console.log("regionalSelectedForecastData", regionalSelectedForecastData);
                                    var ce = regionalSelectedForecastData != undefined && regionalSelectedForecastData.consumptionExtrapolationId != null ? consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData.consumptionExtrapolationId) : [];
                                    var selectedTreeScenario = [];
                                    if (regionalSelectedForecastData != undefined && regionalSelectedForecastData.scenarioId != "" && regionalSelectedForecastData.scenarioId != null) {
                                        selectedTreeScenario = treeScenarioList.filter(c => c.scenarioId == regionalSelectedForecastData.scenarioId && c.treeId == regionalSelectedForecastData.treeId);
                                    }
                                    var total = 0;
                                    if (regionalSelectedForecastData != undefined && regionalSelectedForecastData.scenarioId != "" && regionalSelectedForecastData.scenarioId != null && selectedTreeScenario.length > 0) {
                                        var tsListFilter = datasetData.treeList.filter(c => c.treeId == regionalSelectedForecastData.treeId);
                                        if (tsListFilter.length > 0) {
                                            var flatList = tsListFilter[0].tree.flatList;
                                            // console.log("Flat List @@@@@@@ Test", flatList)
                                            var flatListFilter = flatList.filter(c => c.payload.nodeType.id == 5 && c.payload.nodeDataMap[regionalSelectedForecastData.scenarioId][0].puNode != null && c.payload.nodeDataMap[regionalSelectedForecastData.scenarioId][0].puNode.planningUnit.id == pu[0].planningUnit.id);
                                            // console.log("Flat List Filter @@@@@@@ Test", flatListFilter)
                                            var nodeDataMomList = [];
                                            for (var fl = 0; fl < flatListFilter.length; fl++) {
                                                nodeDataMomList = nodeDataMomList.concat(flatListFilter[fl].payload.nodeDataMap[regionalSelectedForecastData.scenarioId][0].nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") >= moment(datasetData.currentVersion.forecastStartDate).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(datasetData.currentVersion.forecastStopDate).format("YYYY-MM")));
                                            }
                                            nodeDataMomList.map(ele => {
                                                total += Number(ele.calculatedMmdValue);
                                            });
                                        } else {
                                            total = null;
                                        }

                                    } else if (regionalSelectedForecastData != undefined && regionalSelectedForecastData.consumptionExtrapolationId != "" && regionalSelectedForecastData.consumptionExtrapolationId != null && ce.length > 0) {
                                        var ceFilter = datasetData.consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData.consumptionExtrapolationId);
                                        if (ceFilter.length > 0) {
                                            ceFilter[0].extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM-DD") >= moment(datasetData.currentVersion.forecastStartDate).format("YYYY-MM-DD") && moment(c.month).format("YYYY-MM-DD") <= moment(datasetData.currentVersion.forecastStopDate).format("YYYY-MM-DD")).map(ele => {
                                                total += Number(ele.amount);
                                            });
                                        } else {
                                            total = null;
                                        }
                                    } else {
                                        total = null;
                                    }

                                    data[2] = regionalSelectedForecastData != undefined ? regionalSelectedForecastData.scenarioId != "" && regionalSelectedForecastData.scenarioId != null ? selectedTreeScenario.length > 0 ? selectedTreeScenario[0].treeLabel + " ~ " + selectedTreeScenario[0].scenarioLabel : "" : regionalSelectedForecastData.consumptionExtrapolationId != "" && regionalSelectedForecastData.consumptionExtrapolationId != null && ce.length > 0 ? getLabelText(ce[0].extrapolationMethod.label, this.state.lang) : "" : ""
                                    data[3] = regionalSelectedForecastData != undefined && total != null ? total.toFixed(2) : "";
                                    data[4] = regionalSelectedForecastData != undefined ? regionalSelectedForecastData.notes : "";
                                    // count += 3;
                                    // }
                                    // for (var r = 0; r < regionList1.length; r++) {
                                    var regionalSelectedForecastData1 = selectedForecastData1[regionSet[k]];
                                    var ce1 = regionalSelectedForecastData1 != undefined && regionalSelectedForecastData1.consumptionExtrapolationId != null ? consumptionExtrapolation1.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData1.consumptionExtrapolationId) : [];
                                    var selectedTreeScenario1 = [];
                                    if (regionalSelectedForecastData1 != undefined && regionalSelectedForecastData1.scenarioId != "" && regionalSelectedForecastData1.scenarioId != null) {
                                        selectedTreeScenario1 = treeScenarioList1.filter(c => c.scenarioId == regionalSelectedForecastData1.scenarioId && c.treeId == regionalSelectedForecastData1.treeId);
                                    }

                                    var total1 = 0;
                                    if (regionalSelectedForecastData1 != undefined && regionalSelectedForecastData1.scenarioId != "" && regionalSelectedForecastData1.scenarioId != null && selectedTreeScenario1.length > 0) {
                                        var tsListFilter1 = datasetData1.treeList.filter(c => c.treeId == regionalSelectedForecastData1.treeId);
                                        if (tsListFilter1.length > 0) {
                                            var flatList1 = tsListFilter1[0].tree.flatList;
                                            var flatListFilter1 = flatList1.filter(c => c.payload.nodeType.id == 5 && c.payload.nodeDataMap[regionalSelectedForecastData1.scenarioId][0].puNode != null && c.payload.nodeDataMap[regionalSelectedForecastData1.scenarioId][0].puNode.planningUnit.id == pu1[0].planningUnit.id);
                                            var nodeDataMomList1 = [];
                                            for (var fl1 = 0; fl1 < flatListFilter1.length; fl1++) {
                                                nodeDataMomList1 = nodeDataMomList1.concat(flatListFilter1[fl1].payload.nodeDataMap[regionalSelectedForecastData1.scenarioId][0].nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") >= moment(datasetData1.currentVersion.forecastStartDate).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(datasetData1.currentVersion.forecastStopDate).format("YYYY-MM")));
                                            }
                                            nodeDataMomList1.map(ele1 => {
                                                total1 += Number(ele1.calculatedMmdValue);
                                            });
                                        } else {
                                            total1 = null;
                                        }

                                    } else if (regionalSelectedForecastData1 != undefined && regionalSelectedForecastData1.consumptionExtrapolationId != "" && regionalSelectedForecastData1.consumptionExtrapolationId != null && ce1.length > 0) {
                                        var ceFilter1 = datasetData1.consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData1.consumptionExtrapolationId);
                                        if (ceFilter1.length > 0) {
                                            ceFilter1[0].extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM-DD") >= moment(datasetData1.currentVersion.forecastStartDate).format("YYYY-MM-DD") && moment(c.month).format("YYYY-MM-DD") <= moment(datasetData1.currentVersion.forecastStopDate).format("YYYY-MM-DD")).map(ele1 => {
                                                total1 += Number(ele1.amount);
                                            });
                                        } else {
                                            total1 = null;
                                        }
                                    }

                                    data[5] = regionalSelectedForecastData1 != undefined ? regionalSelectedForecastData1.scenarioId != "" && regionalSelectedForecastData1.scenarioId != null ? selectedTreeScenario1.length > 0 ? selectedTreeScenario1[0].treeLabel + " ~ " + selectedTreeScenario1[0].scenarioLabel : "" : regionalSelectedForecastData1.consumptionExtrapolationId != "" && regionalSelectedForecastData1.consumptionExtrapolationId != null && ce1.length > 0 ? getLabelText(ce1[0].extrapolationMethod.label, this.state.lang) : "" : ""
                                    data[6] = regionalSelectedForecastData1 != undefined && total1 != null ? total1.toFixed(2) : "";
                                    data[7] = regionalSelectedForecastData1 != undefined ? regionalSelectedForecastData1.notes : "";
                                    //     count += 3;
                                    // }
                                    // for (var r = 0; r < regionList2.length; r++) {
                                    var regionalSelectedForecastData2 = selectedForecastData2[regionSet[k]];
                                    var ce2 = regionalSelectedForecastData2 != undefined && regionalSelectedForecastData2.consumptionExtrapolationId != null ? consumptionExtrapolation2.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData2.consumptionExtrapolationId) : [];
                                    var selectedTreeScenario2 = [];
                                    if (regionalSelectedForecastData2 != undefined && regionalSelectedForecastData2.scenarioId != "" && regionalSelectedForecastData2.scenarioId != null) {
                                        selectedTreeScenario2 = treeScenarioList2.filter(c => c.scenarioId == regionalSelectedForecastData2.scenarioId && c.treeId == regionalSelectedForecastData2.treeId);
                                    }
                                    var total2 = 0;
                                    if (regionalSelectedForecastData2 != undefined && regionalSelectedForecastData2.scenarioId != "" && regionalSelectedForecastData2.scenarioId != null && selectedTreeScenario2.length > 0) {
                                        var tsListFilter2 = datasetData2.treeList.filter(c => c.treeId == regionalSelectedForecastData2.treeId);
                                        if (tsListFilter2.length > 0) {
                                            var flatList2 = tsListFilter2[0].tree.flatList;
                                            var flatListFilter2 = flatList2.filter(c => c.payload.nodeType.id == 5 && c.payload.nodeDataMap[regionalSelectedForecastData2.scenarioId][0].puNode != null && c.payload.nodeDataMap[regionalSelectedForecastData2.scenarioId][0].puNode.planningUnit.id == pu2[0].planningUnit.id);
                                            var nodeDataMomList2 = [];
                                            for (var fl2 = 0; fl2 < flatListFilter2.length; fl2++) {
                                                nodeDataMomList2 = nodeDataMomList2.concat(flatListFilter2[fl2].payload.nodeDataMap[regionalSelectedForecastData2.scenarioId][0].nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") >= moment(datasetData2.currentVersion.forecastStartDate).format("YYYY-MM") && moment(c.month).format("YYYY-MM") <= moment(datasetData2.currentVersion.forecastStopDate).format("YYYY-MM")));
                                            }
                                            nodeDataMomList2.map(ele2 => {
                                                total2 += Number(ele2.calculatedMmdValue);
                                            });
                                        } else {
                                            total2 = null;
                                        }

                                    } else if (regionalSelectedForecastData2 != undefined && regionalSelectedForecastData2.consumptionExtrapolationId != "" && regionalSelectedForecastData2.consumptionExtrapolationId != null && ce2.length > 0) {
                                        var ceFilter2 = datasetData2.consumptionExtrapolation.filter(c => c.consumptionExtrapolationId == regionalSelectedForecastData2.consumptionExtrapolationId);
                                        if (ceFilter2.length > 0) {
                                            ceFilter2[0].extrapolationDataList.filter(c => moment(c.month).format("YYYY-MM-DD") >= moment(datasetData2.currentVersion.forecastStartDate).format("YYYY-MM-DD") && moment(c.month).format("YYYY-MM-DD") <= moment(datasetData2.currentVersion.forecastStopDate).format("YYYY-MM-DD")).map(ele2 => {
                                                total2 += Number(ele2.amount);
                                            });
                                        } else {
                                            total2 = null;
                                        }
                                    } else {
                                        total2 = null;
                                    }
                                    data[8] = regionalSelectedForecastData2 != undefined ? regionalSelectedForecastData2.scenarioId != "" && regionalSelectedForecastData2.scenarioId != null ? selectedTreeScenario2.length > 0 ? selectedTreeScenario2[0].treeLabel + " ~ " + selectedTreeScenario2[0].scenarioLabel : "" : regionalSelectedForecastData2.consumptionExtrapolationId != "" && regionalSelectedForecastData2.consumptionExtrapolationId != null && ce2.length > 0 ? getLabelText(ce2[0].extrapolationMethod.label, this.state.lang) : "" : ""
                                    data[9] = regionalSelectedForecastData2 != undefined && total2 != null ? total2.toFixed(2) : "";
                                    data[10] = regionalSelectedForecastData2 != undefined ? regionalSelectedForecastData2.notes : "";
                                    data[11] = 4;
                                    data[12] = regionalSelectedForecastData;
                                    data[13] = regionalSelectedForecastData1;
                                    data[14] = regionalSelectedForecastData2;
                                    data[15] = planningUnitSet[j];
                                    data[16] = regionSet[k];
                                    dataArray.push(data);
                                }
                            }

                            var options = {
                                data: dataArray,
                                columnDrag: true,
                                columns: columns,
                                nestedHeaders: nestedHeaders,
                                onload: this.loadedFunctionForSelectedForecast,
                                pagination: localStorage.getItem("sesRecordCount"),
                                search: true,
                                columnSorting: true,
                                // tableOverflow: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInseditabertColumn: false,
                                allowDeleteRow: false,
                                copyCompatibility: true,
                                allowExport: false,
                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                position: 'top',
                                filters: true,
                                license: JEXCEL_PRO_KEY,
                                contextMenu: function (obj, x, y, e) {
                                    var items = [];
                                    //Resolve conflicts
                                    var rowData = obj.getRowData(y)
                                    if (rowData[11].toString() == 1) {
                                        items.push({
                                            title: "Accept Local Version",
                                            onclick: function () {
                                                obj.options.editable = true;
                                                var col = ("A").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("B").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                if (rowData[2] != rowData[5]) {
                                                    var col = ("C").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    obj.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                                                    var col = ("F").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                } else {
                                                    var col = ("C").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    var col = ("F").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                }
                                                if (rowData[3] != rowData[6]) {
                                                    var col = ("D").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    obj.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                                                    var col = ("G").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                } else {
                                                    var col = ("D").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    var col = ("G").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                }
                                                if (rowData[4] != rowData[7]) {
                                                    var col = ("E").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    obj.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                                                    var col = ("H").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                } else {
                                                    var col = ("E").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    var col = ("H").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                }
                                                obj.setValueFromCoords(11, y, 2, true);
                                                obj.options.editable = false;
                                                this.setState({
                                                    conflictsCountSelectedForecast: this.state.conflictsCountSelectedForecast - 1
                                                }, () => {
                                                    this.mergeData()
                                                })
                                            }.bind(this)
                                        })
                                        items.push({
                                            title: "Accept Server Version",
                                            onclick: function () {
                                                obj.options.editable = true;
                                                var col = ("A").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                var col = ("B").concat(parseInt(y) + 1);
                                                obj.setStyle(col, "background-color", "transparent");
                                                if (rowData[2] != rowData[5]) {
                                                    var col = ("F").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    obj.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                                                    var col = ("C").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                } else {
                                                    var col = ("F").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    var col = ("C").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                }
                                                if (rowData[3] != rowData[6]) {
                                                    var col = ("G").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    obj.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                                                    var col = ("D").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                } else {
                                                    var col = ("G").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    var col = ("D").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                }
                                                if (rowData[4] != rowData[7]) {
                                                    var col = ("H").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    obj.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                                                    var col = ("E").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                } else {
                                                    var col = ("H").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                    var col = ("E").concat(parseInt(y) + 1);
                                                    obj.setStyle(col, "background-color", "transparent");
                                                }
                                                obj.setValueFromCoords(11, y, 3, true);
                                                obj.options.editable = false;
                                                this.setState({
                                                    conflictsCountSelectedForecast: this.state.conflictsCountSelectedForecast - 1
                                                }, () => {
                                                    this.mergeData()
                                                })
                                            }.bind(this)
                                        })
                                    } else {
                                        return false;
                                    }
                                    return items;
                                }.bind(this),
                            };
                            var selectedForecastDiv = jexcel(document.getElementById("selectedForecastDiv"), options);
                            this.el = selectedForecastDiv;
                            this.setState({
                                showCompare: true,
                                comparedLatestVersion: response.data[0].currentVersion.versionId,
                                versionSettingsInstance: versionSettingsDiv,
                                planningUnitsInstance: planningUnitDiv,
                                consumptionInstance: consumptionDiv,
                                treeInstance: treeDiv,
                                selectedForecastInstance: selectedForecastDiv,
                                planningUnitList: planningUnitList,
                                procurementAgentList: procurementAgentList,
                                productCategoryList: productCategoryList,
                                mergedPlanningUnitList: mergedPlanningUnitList,
                                mergedRegionList: mergedRegionList,
                                treeListLocal: treeListLocal,
                                planningUnitSet: planningUnitSet,
                                regionSet: regionSet
                            }, () => {
                                this.mergeData();
                                // dataCheck(this, programData[0].datasetJson)
                            })
                        })
                })


                // }.bind(this)
                // }.bind(this)
            } else {
                if (this.state.versionSettingsInstance != "" && this.state.versionSettingsInstance != undefined) {
                    // this.state.mergedConsumptionJexcel.destroy();
                    jexcel.destroy(document.getElementById("versionSettingsDiv"), true);

                }
                if (this.state.planningUnitsInstance != "" && this.state.planningUnitsInstance != undefined) {
                    // this.state.mergedConsumptionJexcel.destroy();
                    jexcel.destroy(document.getElementById("planningUnitDiv"), true);

                }
                if (this.state.consumptionInstance != "" && this.state.consumptionInstance != undefined) {
                    // this.state.mergedConsumptionJexcel.destroy();
                    jexcel.destroy(document.getElementById("consumptionDiv"), true);

                }
                if (this.state.treeInstance != "" && this.state.treeInstance != undefined) {
                    // this.state.mergedConsumptionJexcel.destroy();
                    jexcel.destroy(document.getElementById("treeDiv"), true);

                }
                if (this.state.selectedForecastInstance != "" && this.state.selectedForecastInstance != undefined) {
                    // this.state.mergedConsumptionJexcel.destroy();
                    jexcel.destroy(document.getElementById("selectedForecastDiv"), true);

                }

                this.setState({
                    loading: false,
                    programId: ""
                })
            }
        })
    }

    mergeData() {
        console.log("In merge data Test@123")
        if (this.state.conflictsCountVersionSettings == 0 && this.state.conflictsCountPlanningUnits == 0 && this.state.conflictsCountConsumption == 0 && this.state.conflictsCountTree == 0 && this.state.conflictsCountSelectedForecast == 0) {
            console.log("In if merge data Test@123")
            // Build json here
            var programDataJson = this.state.programDataLocal;
            var programDataServer = this.state.programDataServer;
            var versionSettingsJson = this.state.versionSettingsInstance.getJson(null, false);
            if (versionSettingsJson[0][9] == 3) {
                programDataJson.currentVersion.forecastStartDate = programDataServer.currentVersion.forecastStartDate;
                programDataJson.currentVersion.forecastStopDate = programDataServer.currentVersion.forecastStopDate;
                programDataJson.currentVersion.daysInMonth = programDataServer.currentVersion.daysInMonth;
                programDataJson.currentVersion.freightPerc = programDataServer.currentVersion.freightPerc;
                programDataJson.currentVersion.forecastThresholdHighPerc = programDataServer.currentVersion.forecastThresholdHighPerc;
                programDataJson.currentVersion.forecastThresholdLowPerc = programDataServer.currentVersion.forecastThresholdLowPerc;
            }
            var planningUnitJson = this.state.planningUnitsInstance.getJson(null, false);
            for (var pu = 0; pu < planningUnitJson.length; pu++) {
                if (planningUnitJson[pu][14] == 3) {
                    var puFromServerIndex = programDataServer.planningUnitList.findIndex(c => c.planningUnit.id == planningUnitJson[pu][1]);
                    if (puFromServerIndex != -1) {
                        var puFromLocalIndex = programDataJson.planningUnitList.findIndex(c => c.planningUnit.id == planningUnitJson[pu][1]);
                        if (puFromLocalIndex == -1) {
                            programDataJson.planningUnitList.push(programDataServer.planningUnitList[puFromServerIndex]);
                        } else {
                            programDataJson.planningUnitList[puFromLocalIndex] = programDataServer.planningUnitList[puFromServerIndex];
                        }
                    }
                }
            }
            var consumptionJson = this.state.consumptionInstance.getJson(null, false);
            console.log("Consumption Json Test@123", consumptionJson)
            for (var c = 0; c < consumptionJson.length; c++) {
                if (consumptionJson[c][6] == 3) {
                    programDataJson.actualConsumptionList = programDataJson.actualConsumptionList.filter(item => (item.planningUnit.id != consumptionJson[c][10]) || (item.planningUnit.id == consumptionJson[c][10] && item.region.id != consumptionJson[c][11]));
                    programDataJson.actualConsumptionList = programDataJson.actualConsumptionList.concat(programDataServer.actualConsumptionList.filter(item => (item.planningUnit.id != consumptionJson[c][10]) || (item.planningUnit.id == consumptionJson[c][10] && item.region.id != consumptionJson[c][11])));
                    programDataJson.consumptionExtrapolation = programDataJson.consumptionExtrapolation.filter(item => (item.planningUnit.id != consumptionJson[c][10]) || (item.planningUnit.id == consumptionJson[c][10] && item.region.id != consumptionJson[c][11]));
                    programDataJson.consumptionExtrapolation = programDataJson.consumptionExtrapolation.concat(programDataServer.consumptionExtrapolation.filter(item => (item.planningUnit.id != consumptionJson[c][10]) || (item.planningUnit.id == consumptionJson[c][10] && item.region.id != consumptionJson[c][11])));
                }
            }

            var treeJson = this.state.treeInstance.getJson(null, false);
            for (var t = 0; t < treeJson.length; t++) {
                if (treeJson[t][6] == 3) {
                    var treeFromServerIndex = programDataServer.treeList.findIndex(c => c.treeAnchorId == treeJson[t][4]);
                    if (treeFromServerIndex != -1) {
                        var treeFromLocalIndex = programDataJson.treeList.findIndex(c => c.treeAnchorId == treeJson[t][4]);
                        if (treeFromLocalIndex == -1) {
                            programDataJson.treeList.push(programDataServer.treeList[treeFromServerIndex]);
                        } else {
                            programDataJson.treeList[treeFromLocalIndex] = programDataServer.treeList[treeFromServerIndex];
                        }
                    }
                }
            }
            for (var tl = 0; tl < programDataJson.treeList.length; tl++) {
                if (programDataJson.treeList[tl].createdDate == undefined) {
                    programDataJson.treeList[tl].createdDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                }
                if (programDataJson.treeList[tl].lastModifiedDate == undefined) {
                    programDataJson.treeList[tl].lastModifiedDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                }
                if (programDataJson.treeList[tl].createdBy == undefined) {
                    programDataJson.treeList[tl].createdBy = {
                        "userId": AuthenticationService.getLoggedInUserId()
                    };
                }
                if (programDataJson.treeList[tl].lastModifiedBy == undefined) {
                    programDataJson.treeList[tl].lastModifiedBy = {
                        "userId": AuthenticationService.getLoggedInUserId()
                    };
                }
            }

            var selectedForecastJson = this.state.selectedForecastInstance.getJson(null, false);
            for (var sf = 0; sf < selectedForecastJson.length; sf++) {
                if (selectedForecastJson[sf][11] == 3) {
                    var planningUnitIndexLocal = programDataJson.planningUnitList.findIndex(c => c.planningUnit.id == selectedForecastJson[sf][15]);
                    var planningUnitIndexServer = programDataServer.planningUnitList.findIndex(c => c.planningUnit.id == selectedForecastJson[sf][15]);
                    if (planningUnitIndexLocal != -1 && planningUnitIndexServer != -1) {
                        programDataJson.planningUnitList[planningUnitIndexLocal].selectedForecastMap[selectedForecastJson[sf][16]] = programDataServer.planningUnitList[planningUnitIndexServer].selectedForecastMap[selectedForecastJson[sf][16]]
                    }
                }
            }
            console.log("program Data json Test@123", programDataJson)
            dataCheck(this, programDataJson)
            this.setState({
                finalProgramJson: programDataJson
            })
        } else {
            this.setState({
                loading: false
            })
        }
    }

    loadedFunctionForVersionSettings = function (instance) {
        let target = document.getElementById('versionSettingsDiv');
        target.classList.add("removeOddColor")
        jExcelLoadedFunction(instance, 0);
        var elInstance = instance.worksheets[0];
        var jsonData = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F']
        elInstance.options.editable = true;
        for (var c = 0; c < jsonData.length; c++) {
            var oldData = (jsonData[c])[6];
            var latestData = (jsonData[c])[7];
            var downloadedData = (jsonData[c])[8];
            for (var j = 0; j < 6; j++) {
                if (oldData[j] == latestData[j]) {
                    var col = (colArr[j]).concat(parseInt(c) + 1);
                    elInstance.setStyle(col, "background-color", "#fff");
                } else if (latestData[j] == downloadedData[j]) {
                    var col = (colArr[j]).concat(parseInt(c) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                    elInstance.setValueFromCoords(9, c, 2, true);
                    (jsonData[c])[9] = 2;
                } else if (oldData[j] == downloadedData[j]) {
                    var col = (colArr[j]).concat(parseInt(c) + 1);
                    elInstance.setValueFromCoords(j, c, latestData[j], true);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                    elInstance.setValueFromCoords(9, c, 3, true);
                    (jsonData[c])[9] = 3;
                } else {
                    this.setState({
                        conflictsCountVersionSettings: this.state.conflictsCountVersionSettings + 1
                    })
                    elInstance.setValueFromCoords(9, c, 1, true);
                    (jsonData[c])[9] = 1;
                    for (var j = 0; j < colArr.length; j++) {
                        var col = (colArr[j]).concat(parseInt(c) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                    }
                }

            }

        }
        elInstance.orderBy(9, 0);
        elInstance.options.editable = false;
    }

    loadedFunctionForPlanningUnits = function (instance) {
        let target = document.getElementById('planningUnitDiv');
        target.classList.add("removeOddColor")
        jExcelLoadedFunction(instance, 1);
        var elInstance = instance.worksheets[0];
        var jsonData = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
        elInstance.options.editable = true;
        for (var c = 0; c < jsonData.length; c++) {
            elInstance.setStyle(("C").concat(parseInt(c) + 1), "pointer-events", "");
            elInstance.setStyle(("C").concat(parseInt(c) + 1), "pointer-events", "none");
            elInstance.setStyle(("D").concat(parseInt(c) + 1), "pointer-events", "");
            elInstance.setStyle(("D").concat(parseInt(c) + 1), "pointer-events", "none");
            elInstance.setStyle(("K").concat(parseInt(c) + 1), "pointer-events", "");
            elInstance.setStyle(("K").concat(parseInt(c) + 1), "pointer-events", "none");
            if ((jsonData[c])[12] == "" && (jsonData[c])[13] == "") {
                for (var i = 0; i < colArr.length; i++) {
                    var col = (colArr[i]).concat(parseInt(c) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                    elInstance.setValueFromCoords(14, c, 2, true);
                }
            } else if ((jsonData[c])[11] == "" && (jsonData[c])[13] == "") {
                for (var i = 0; i < colArr.length; i++) {
                    var col = (colArr[i]).concat(parseInt(c) + 1);

                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                    elInstance.setValueFromCoords(14, c, 3, true);
                }
            } else if ((jsonData[c])[12] != "" && (jsonData[c])[11] != "" && (jsonData[c])[14] != 1) {
                var oldData = (jsonData[c])[11];
                var latestData = (jsonData[c])[12];
                var downloadedData = (jsonData[c])[13];
                for (var j = 0; j < 11; j++) {
                    if ((oldData[j] == latestData[j]) || (oldData[j] == "" && latestData[j] == null) || (oldData[j] == null && latestData[j] == "")) {
                        var col = (colArr[j]).concat(parseInt(c) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                    } else {
                        if ((jsonData[c])[13] != "" && oldData[j] == downloadedData[j]) {
                            var col = (colArr[j]).concat(parseInt(c) + 1);
                            elInstance.setValueFromCoords(j, c, latestData[j], true);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                            elInstance.setValueFromCoords(14, c, 3, true);
                            (jsonData[c])[14] = 3;
                        } else if ((jsonData[c])[13] != "" && latestData[j] == downloadedData[j]) {
                            var col = (colArr[j]).concat(parseInt(c) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                            elInstance.setValueFromCoords(14, c, 2, true);
                            (jsonData[c])[14] = 2;
                        } else {
                            this.setState({
                                conflictsCountPlanningUnits: this.state.conflictsCountPlanningUnits + 1
                            })
                            elInstance.setValueFromCoords(14, c, 1, true);
                            (jsonData[c])[14] = 1;
                            for (var j = 0; j < colArr.length; j++) {
                                var col = (colArr[j]).concat(parseInt(c) + 1);
                                elInstance.setStyle(col, "background-color", "transparent");
                                elInstance.setStyle(col, "background-color", "yellow");
                            }
                        }
                    }
                }
            }
        }
        elInstance.orderBy(14, 0);
        elInstance.options.editable = false;
    }

    loadedFunctionForConsumption = function (instance) {
        let target = document.getElementById('consumptionDiv');
        target.classList.add("removeOddColor")
        var asterisk = document.getElementsByClassName("jss")[2].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[6].classList.add('InfoTr');
        console.log("This.state.program " + this.state.programDataServer)
        var serverVersionId = this.state.programDataServer.currentVersion.versionId + 1;
        tr.children[6].title = i18n.t('static.commitVersion.exculdeConsumptionTooltip', { serverVersionId });
        jExcelLoadedFunction(instance, 2);
        var elInstance = instance.worksheets[0];
        var jsonData = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F']
        elInstance.options.editable = true;
        for (var c = 0; c < jsonData.length; c++) {
            // elInstance.setStyle(("F").concat(parseInt(c) + 1), "pointer-events", "");
            // elInstance.setStyle(("F").concat(parseInt(c) + 1), "pointer-events", "none");
            if ((jsonData[c])[3] == "" && (jsonData[c])[2] != "" && (jsonData[c])[4] == "") {
                for (var i = 0; i < colArr.length; i++) {
                    var col = (colArr[i]).concat(parseInt(c) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                    elInstance.setValueFromCoords(6, c, 2, true);
                }
            } else if ((jsonData[c])[2] == "" && (jsonData[c])[3] != "" && (jsonData[c])[4] == "") {
                for (var i = 0; i < colArr.length; i++) {
                    var col = (colArr[i]).concat(parseInt(c) + 1);

                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                    elInstance.setValueFromCoords(6, c, 3, true);
                }
            } else if ((jsonData[c])[3] != "" && (jsonData[c])[2] != "" && (jsonData[c])[6] != 1) {
                var oldData = (jsonData[c])[7];
                var latestData = (jsonData[c])[8];
                var downloadedData = (jsonData[c])[9];
                // for (var j = 0; j < 11; j++) {
                if ((oldData == latestData) || (oldData == "" && latestData == null) || (oldData == null && latestData == "")) {
                    for (var j = 0; j < colArr.length; j++) {
                        var col = (colArr[j]).concat(parseInt(c) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                    }
                } else {
                    if ((jsonData[c])[4] != "" && oldData == downloadedData) {
                        // for (var j = 0; j < colArr.length; j++) {
                        var col = ("D").concat(parseInt(c) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                        // }
                        elInstance.setValueFromCoords(6, c, 3, true);
                        (jsonData[c])[6] = 3;
                    } else if ((jsonData[c])[4] != "" && latestData == downloadedData) {
                        // for (var j = 0; j < colArr.length; j++) {
                        var col = ("C").concat(parseInt(c) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                        // }
                        elInstance.setValueFromCoords(6, c, 2, true);
                        (jsonData[c])[6] = 2;
                    } else {
                        this.setState({
                            conflictsCountConsumption: this.state.conflictsCountConsumption + 1
                        })
                        elInstance.setValueFromCoords(6, c, 1, true);
                        (jsonData[c])[6] = 1;
                        for (var j = 0; j < colArr.length; j++) {
                            var col = (colArr[j]).concat(parseInt(c) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", "yellow");
                        }
                    }
                }
                // }
            }
        }
        elInstance.orderBy(6, 0);
        elInstance.options.editable = false;
    }

    loadedFunctionForTree = function (instance) {
        let target = document.getElementById('treeDiv');
        target.classList.add("removeOddColor")
        var asterisk = document.getElementsByClassName("jss")[3].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[4].classList.add('InfoTr');
        var serverVersionId = this.state.programDataServer.currentVersion.versionId + 1;
        tr.children[4].title = i18n.t('static.commitVersion.exculdeTreeTooltip', { serverVersionId });
        jExcelLoadedFunction(instance, 3);
        var elInstance = instance.worksheets[0];
        var jsonData = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D']
        elInstance.options.editable = true;
        for (var c = 0; c < jsonData.length; c++) {
            // elInstance.setStyle(("F").concat(parseInt(c) + 1), "pointer-events", "");
            // elInstance.setStyle(("F").concat(parseInt(c) + 1), "pointer-events", "none");
            if ((jsonData[c])[8] == "" && (jsonData[c])[7] != "" && (jsonData[c])[9] == "") {
                for (var i = 0; i < colArr.length; i++) {
                    var col = (colArr[i]).concat(parseInt(c) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                    elInstance.setValueFromCoords(6, c, 2, true);
                }
            } else if ((jsonData[c])[7] == "" && (jsonData[c])[8] != "" && (jsonData[c])[9] == "") {
                for (var i = 0; i < colArr.length; i++) {
                    var col = (colArr[i]).concat(parseInt(c) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                    elInstance.setValueFromCoords(6, c, 3, true);
                }
            } else if ((jsonData[c])[8] != "" && (jsonData[c])[7] != "" && (jsonData[c])[6] != 1) {
                var oldData = (jsonData[c])[7];
                var latestData = (jsonData[c])[8];
                var downloadedData = (jsonData[c])[9];
                // for (var j = 0; j < 11; j++) {
                if ((oldData == latestData) || (oldData == "" && latestData == null) || (oldData == null && latestData == "")) {
                    for (var j = 0; j < colArr.length; j++) {
                        var col = (colArr[j]).concat(parseInt(c) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                    }
                } else {
                    if ((jsonData[c])[9] != "" && oldData == downloadedData) {
                        // for (var j = 0; j < colArr.length; j++) {
                        var col = ("B").concat(parseInt(c) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                        // }
                        elInstance.setValueFromCoords(6, c, 3, true);
                        (jsonData[c])[6] = 3;
                    } else if ((jsonData[c])[9] != "" && latestData == downloadedData) {
                        // for (var j = 0; j < colArr.length; j++) {
                        var col = ("A").concat(parseInt(c) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                        // }
                        elInstance.setValueFromCoords(6, c, 2, true);
                        (jsonData[c])[6] = 2;
                    } else {
                        this.setState({
                            conflictsCountTree: this.state.conflictsCountTree + 1
                        })
                        elInstance.setValueFromCoords(6, c, 1, true);
                        (jsonData[c])[6] = 1;
                        for (var j = 0; j < colArr.length; j++) {
                            var col = (colArr[j]).concat(parseInt(c) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", "yellow");
                        }
                    }
                }
                // }
            }
        }
        elInstance.orderBy(6, 0);
        elInstance.options.editable = false;
    }

    loadedFunctionForSelectedForecast = function (instance) {
        let target = document.getElementById('selectedForecastDiv');
        target.classList.add("removeOddColor")
        jExcelLoadedFunction(instance, 4);
        var elInstance = instance.worksheets[0];
        var jsonData = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        elInstance.options.editable = true;
        for (var c = 0; c < jsonData.length; c++) {
            if (((jsonData[c])[13] == undefined || (jsonData[c])[13] == "") && ((jsonData[c])[12] != undefined && (jsonData[c])[12] != "")) {
                for (var i = 0; i < colArr.length; i++) {
                    var col = (colArr[i]).concat(parseInt(c) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR);
                    elInstance.setValueFromCoords(11, c, 2, true);
                }
            } if (((jsonData[c])[12] == undefined || (jsonData[c])[12] == "") && ((jsonData[c])[13] != undefined && (jsonData[c])[13] != "")) {
                for (var i = 0; i < colArr.length; i++) {
                    var col = (colArr[i]).concat(parseInt(c) + 1);

                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                    elInstance.setValueFromCoords(11, c, 3, true);
                }
            } else if ((jsonData[c])[12] != undefined && (jsonData[c])[12] != "" && (jsonData[c])[13] != undefined && (jsonData[c])[13] != "" && (jsonData[c])[11] != 1) {
                var startPt = 2;
                var startPt1 = 5;
                var startPt2 = 8;
                for (var i = 0; startPt < startPt1 && (jsonData[c])[11] != 1; i++) {
                    var local = (jsonData[c])[startPt]
                    var server = (jsonData[c])[startPt1 + i]
                    var downloaded = (jsonData[c])[startPt2 + i]

                    if (local == server) {
                        var col = (colArr[startPt1 + i]).concat(parseInt(c) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        var col = (colArr[startPt]).concat(parseInt(c) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                    } else {
                        if (local == downloaded) {
                            var col = (colArr[startPt1 + i]).concat(parseInt(c) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LATEST_VERSION_COLOUR);
                            elInstance.setValueFromCoords(11, c, 3, true);
                            (jsonData[c])[11] = 3;

                        } else if (server == downloaded) {
                            var col = (colArr[startPt]).concat(parseInt(c) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", LOCAL_VERSION_COLOUR, true);
                            elInstance.setValueFromCoords(11, c, 2, true);
                            (jsonData[c])[11] = 2;
                        } else {
                            this.setState({
                                conflictsCountSelectedForecast: this.state.conflictsCountSelectedForecast + 1
                            })
                            elInstance.setValueFromCoords(11, c, 1, true);
                            (jsonData[c])[11] = 1;
                            for (var j = 0; j < colArr.length; j++) {
                                var col = (colArr[j]).concat(parseInt(c) + 1);
                                console.log("Col Test@123", col)
                                elInstance.setStyle(col, "background-color", "transparent");
                                elInstance.setStyle(col, "background-color", "yellow");
                            }
                        }
                    }
                    startPt += 1;
                }
            }
        }
        elInstance.orderBy(11, 0);
        elInstance.options.editable = false;
    }

    updateState(parameterName, value) {
        // console.log("In update state@@@@@@@@@@@%%%%%%%%%%%%%")
        // console.log("ParameterName$$$", parameterName)
        // console.log("Value$$$", value)
        this.setState({
            [parameterName]: value
        }, () => {
            if (parameterName == "treeScenarioList") {
                buildJxl1(this)
            }
            if (parameterName == "treeScenarioListNotHaving100PerChild" && this.state.showValidation) {
                buildJxl(this)
            }
        })
    }

    toggleShowValidation() {
        this.setState({
            showValidation: !this.state.showValidation
        }, () => {
            if (this.state.showValidation) {
                this.setState({
                }, () => {
                    buildJxl(this);
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
        // console.log("method called", commitRequestId);
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.sendNotificationAsync(commitRequestId).then(resp => {
            var curUser = AuthenticationService.getLoggedInUserId();
            if (resp.data.createdBy.userId == curUser && resp.data.status == 1) {
                setTimeout(function () {
                    this.redirectToDashbaord(commitRequestId)
                }.bind(this), 10000);
            } else if (resp.data.createdBy.userId == curUser && resp.data.status == 2) {
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
                        myResult.readonly = 0;
                        var transaction1 = db1.transaction(['datasetDetails'], 'readwrite');
                        var program1 = transaction1.objectStore('datasetDetails');
                        var getRequest1 = program1.put(myResult);
                        var message = i18n.t('static.commitTree.commitFailed').concat(" - ").concat(resp.data.failedReason).toString().replaceAll(":", " ");
                        getRequest1.onsuccess = function (e) {
                            this.setState({
                                message: message,
                                color: 'red',
                                loading: false
                            })
                            this.hideFirstComponent()
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }

        }).catch(
            error => {
                this.redirectToDashbaord(commitRequestId)
            })
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
                response.data = decompressJson(response.data);
                var json = response.data;
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: '#BA0C2F'
                    })
                    // this.hideFirstComponent()
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;

                    var datasetDataTransaction = db1.transaction(['datasetData'], 'readwrite');
                    var datasetDataOs = datasetDataTransaction.objectStore('datasetData');
                    var datasetRequest = datasetDataOs.delete(this.state.programId);

                    datasetDataTransaction.oncomplete = function (event) {
                        // var datasetDataTransaction1 = db1.transaction(['downloadedDatasetData'], 'readwrite');
                        // var datasetDataOs1 = datasetDataTransaction1.objectStore('downloadedDatasetData');
                        // var datasetRequest1 = datasetDataOs1.delete(this.state.programId);

                        // datasetDataTransaction1.oncomplete = function (event) {

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
                                    // var transactionForSavingDownloadedProgramData = db1.transaction(['downloadedDatasetData'], 'readwrite');
                                    // var downloadedProgramSaveData = transactionForSavingDownloadedProgramData.objectStore('downloadedDatasetData');
                                    // for (var r = 0; r < json.length; r++) {
                                    //     var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                    //     var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                    //     // var version = json[r].requestedProgramVersion;
                                    //     // if (version == -1) {
                                    //     //     version = json[r].currentVersion.versionId
                                    //     // }
                                    //     var version = json[r].currentVersion.versionId
                                    //     var item = {
                                    //         id: json[r].programId + "_v" + version + "_uId_" + userId,
                                    //         programId: json[r].programId,
                                    //         version: version,
                                    //         programName: (CryptoJS.AES.encrypt(JSON.stringify((json[r].label)), SECRET_KEY)).toString(),
                                    //         programData: (CryptoJS.AES.encrypt(JSON.stringify((json[r])), SECRET_KEY)).toString(),
                                    //         userId: userId
                                    //     };
                                    //     var putRequest = downloadedProgramSaveData.put(item);

                                    // }
                                    // transactionForSavingDownloadedProgramData.oncomplete = function (event) {
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
                    // }.bind(this);
                // }.bind(this);
                // }.bind(this);
            })

    }

    goToMasterDataSync(programIds) {
        this.props.history.push({ pathname: `/syncProgram/green/` + i18n.t('static.message.commitSuccess'), state: { "programIds": programIds } });
    }


    synchronize() {
        var checkIfThereAreTreesWithBlankPU = false;
        var checkIfThereAreTreesWithBlankFU = false;
        var localDatasetData = this.state.finalProgramJson;
        var treeList = localDatasetData.treeList;
        for (var tl = 0; tl < treeList.length && !checkIfThereAreTreesWithBlankPU && !checkIfThereAreTreesWithBlankFU; tl++) {
            var tree = treeList[tl];
            var scenarioList = tree.scenarioList
            for (var ndm = 0; ndm < scenarioList.length && !checkIfThereAreTreesWithBlankPU && !checkIfThereAreTreesWithBlankFU; ndm++) {
                var flatList = (tree.tree).flatList.filter(c => c.payload.nodeType.id == 5 && c.payload.nodeDataMap[scenarioList[ndm].id][0].puNode.planningUnit.id == null);
                if (flatList.length > 0) {
                    checkIfThereAreTreesWithBlankPU = true;
                }
                var flatList1 = (tree.tree).flatList.filter(c => c.payload.nodeType.id == 4 && c.payload.nodeDataMap[scenarioList[ndm].id][0].fuNode.forecastingUnit.id == null);
                if (flatList.length > 0) {
                    checkIfThereAreTreesWithBlankPU = true;
                }
                if (flatList1.length > 0) {
                    checkIfThereAreTreesWithBlankFU = true;
                }
                // var completeFlatList = (tree.tree).flatList;
                // console.log("completeFlatList---", completeFlatList);
                // for (let i = 0; i < completeFlatList.length; i++) {
                //     var node = completeFlatList[i];
                //     console.log("node---", node);
                //     if (node.payload.nodeType == 1 || node.payload.nodeType == 2 || node.payload.nodeType == 3) {
                //         node.payload.nodeDataMap[scenarioList[ndm].id][0].fuNode = null;
                //         node.payload.nodeDataMap[scenarioList[ndm].id][0].puNode = null;
                //     } else if (node.payload.nodeType == 4) {
                //         node.payload.nodeDataMap[scenarioList[ndm].id][0].puNode = null;
                //     } else if (node.payload.nodeType == 5) {
                //         node.payload.nodeDataMap[scenarioList[ndm].id][0].fuNode = null;
                //     }
                // }

            }
        }

        if (checkIfThereAreTreesWithBlankFU || checkIfThereAreTreesWithBlankPU) {
            alert(i18n.t("static.commitTree.noPUorFUMapping"));
        } else {
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
                                var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8).replaceAll("\"null\"", null);
                                var datasetJson = JSON.parse(datasetData);
                                var programJson = this.state.finalProgramJson;
                                programJson.currentVersion.versionType = { id: document.getElementById("versionTypeId").value };
                                programJson.currentVersion.notes = document.getElementById("notes").value;;
                                // console.log("ProgramJson+++", programJson);
                                // console.log("this.state.comparedLatestVersion----", this.state.comparedLatestVersion);
                                var treeList = programJson.treeList;
                                for (var tl = 0; tl < treeList.length; tl++) {
                                    var tree = treeList[tl];
                                    var scenarioList = tree.scenarioList;
                                    var scenarioIdsSet = [...new Set(scenarioList.map(ele => Number(ele.id)))];
                                    // console.log("Scenario Ids Set Test@123", scenarioIdsSet);
                                    var completeFlatList = (tree.tree).flatList;
                                    for (let i = 0; i < completeFlatList.length; i++) {
                                        var node = completeFlatList[i];
                                        var scenarioKeys = Object.keys(node.payload.nodeDataMap);
                                        for (var sk = 0; sk < scenarioKeys.length; sk++) {
                                            // console.log("scenarioKeys[sk] Test@123", scenarioKeys[sk])
                                            if (!(scenarioIdsSet.includes(Number(scenarioKeys[sk])))) {
                                                delete node.payload.nodeDataMap[scenarioKeys[sk]];
                                            }
                                        }
                                    }
                                    for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                                        // console.log("commit*** completeFlatList before---", completeFlatList);
                                        for (let i = 0; i < completeFlatList.length; i++) {
                                            var node = completeFlatList[i];
                                            // console.log("commit*** node before---", node);
                                            if (node.payload.nodeType.id == 1 || node.payload.nodeType.id == 2 || node.payload.nodeType.id == 3) {
                                                node.payload.nodeDataMap[scenarioList[ndm].id][0].fuNode = null;
                                                node.payload.nodeDataMap[scenarioList[ndm].id][0].puNode = null;
                                            } else if (node.payload.nodeType.id == 4) {
                                                node.payload.nodeDataMap[scenarioList[ndm].id][0].puNode = null;
                                            } else if (node.payload.nodeType.id == 5) {
                                                node.payload.nodeDataMap[scenarioList[ndm].id][0].fuNode = null;
                                            }
                                            var nodeDataModelingList = node.payload.nodeDataMap[scenarioList[ndm].id][0].nodeDataModelingList;
                                            var nodeDataModelingListUpdated = [];
                                            for (var nml = 0; nml < nodeDataModelingList.length; nml++) {
                                                if (nodeDataModelingList[nml].dataValue !== "" && nodeDataModelingList[nml].dataValue !== "NaN" && nodeDataModelingList[nml].dataValue !== undefined && nodeDataModelingList[nml].increaseDecrease !== "") {
                                                    if (nodeDataModelingList[nml].transferNodeDataId == "null" || nodeDataModelingList[nml].transferNodeDataId === "") {
                                                        nodeDataModelingList[nml].transferNodeDataId = null;
                                                    }
                                                    nodeDataModelingListUpdated.push(nodeDataModelingList[nml]);
                                                }
                                            }
                                            node.payload.nodeDataMap[scenarioList[ndm].id][0].nodeDataModelingList = nodeDataModelingListUpdated;
                                            // console.log("commit*** node after---", node);
                                            var findNodeIndex = completeFlatList.findIndex(n => n.id == node.id);
                                            // console.log("commit*** findNodeIndex1---", findNodeIndex);
                                            completeFlatList[findNodeIndex] = node;
                                            // console.log("commit*** completeFlatList after---", completeFlatList);
                                        }
                                    }
                                    tree.tree.flatList = completeFlatList;
                                    // console.log("commit*** tree---", tree);
                                    var findTreeIndex = treeList.findIndex(n => n.treeId == tree.treeId);
                                    // console.log("commit*** findTreeIndex---", findTreeIndex);
                                    treeList[findTreeIndex] = tree;
                                    // console.log("commit*** treeList---", treeList);
                                }
                                var consumptionExtrapolationToUpdate = programJson.consumptionExtrapolation;
                                for (var ce = 0; ce < consumptionExtrapolationToUpdate.length; ce++) {
                                    var cel = consumptionExtrapolationToUpdate[ce].extrapolationDataList;
                                    // console.log("Cel Test123", cel)
                                    for (var c = 0; c < cel.length; c++) {
                                        cel[c].amount = cel[c].amount < 0 ? 0 : cel[c].amount;
                                    }
                                    consumptionExtrapolationToUpdate[ce].extrapolationDataList = cel;
                                }
                                programJson.consumptionExtrapolation = consumptionExtrapolationToUpdate;
                                programJson.treeList = treeList;
                                // console.log("commit*** final programJson---", programJson)
                                const compressedData = isCompress(programJson);
                                //create saveDatasetData in ProgramService
                                DatasetService.saveDatasetData(compressedData, this.state.comparedLatestVersion).then(response => {
                                    if (response.status == 200) {
                                        var transactionForProgramQPLDetails = db1.transaction(['datasetDetails'], 'readwrite');
                                        var programQPLDetailSaveData = transactionForProgramQPLDetails.objectStore('datasetDetails');
                                        programQPLDetails.readonly = 1;
                                        var putRequest2 = programQPLDetailSaveData.put(programQPLDetails);
                                        localStorage.setItem("sesProgramId", "");
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
                                            if (error.message === "Network Error") {
                                                this.setState({
                                                    // message: 'static.common.networkError',
                                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                                                                var event = {
                                                                    target: {
                                                                        value: this.state.programId
                                                                    }
                                                                };

                                                                this.setProgramId(event);
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
        }, 30000);
    }

    plusMinusClicked(treeId, scenarioId) {
        var index = this.state.treeScenarioList.findIndex(c => c.treeId == treeId && c.scenarioId == scenarioId);
        var treeScenarioList = this.state.treeScenarioList;
        treeScenarioList[index].checked = !treeScenarioList[index].checked;
        this.setState({
            treeScenarioList: treeScenarioList
        })

    }

    tabPane() {
        return (
            <>
                <TabPane tabId="1">
                    <Row>
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <Col md="12 pl-0 pr-lg-0" id="realmDiv">
                                {i18n.t("static.commitVersion.goTo") + " "} <a href="/#/dataset/versionSettings" target="_blank" style={{ "text-decoration": "underline" }}>{i18n.t("static.UpdateversionSettings.UpdateversionSettings")}</a>
                                <div className="table-responsive RemoveStriped consumptionDataEntryTable">
                                    <div style={{ width: '100%' }} id="versionSettingsDiv" />
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tabId="2">
                    <Row>
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <Col md="12 pl-0 pr-lg-0" id="realmDiv">
                                {i18n.t("static.commitVersion.goTo") + " "} <a href="/#/planningUnitSetting/listPlanningUnitSetting" target="_blank" style={{ "text-decoration": "underline" }}>{i18n.t("static.commitVersion.updatePUSettings")}</a>
                                <div className="table-responsive RemoveStriped consumptionDataEntryTable">
                                    <div style={{ width: '100%' }} id="planningUnitDiv" />
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tabId="3">
                    <Row>
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <Col md="12 pl-0 pr-lg-0" id="realmDiv">
                                {i18n.t("static.commitVersion.goTo") + " "} <a href="/#/dataentry/consumptionDataEntryAndAdjustment/" target="_blank" style={{ "text-decoration": "underline" }}>{i18n.t("static.commitTree.dataEntry&Adjustment")}</a>{" " + i18n.t("static.tree.or") + " "}<a href="/#/extrapolation/extrapolateData" target="_blank" style={{ "text-decoration": "underline" }}>{i18n.t("static.ManageTree.Extrapolation")}</a>
                                <div className="table-responsive RemoveStriped consumptionDataEntryTable">
                                    <div style={{ width: '100%' }} id="consumptionDiv" />
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tabId="4">
                    <Row>
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <Col md="12 pl-0 pr-lg-0" id="realmDiv">
                                {i18n.t("static.commitVersion.goTo") + " "} <a href="/#/dataset/listTree" target="_blank" style={{ "text-decoration": "underline" }}>{i18n.t("static.common.managetree")}</a>
                                <div className="table-responsive RemoveStriped consumptionDataEntryTable">
                                    <div style={{ width: '100%' }} id="treeDiv" />
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tabId="5">
                    <Row>
                        <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                            <Col md="12 pl-0" id="realmDiv">
                                {i18n.t("static.commitVersion.goTo") + " "} <a href="/#/report/compareAndSelectScenario/" target="_blank" style={{ "text-decoration": "underline" }}>{i18n.t("static.commitTree.compare&Select")}</a>{" " + i18n.t("static.tree.or") + " "}<a href="/#/forecastReport/forecastSummary/" target="_blank" style={{ "text-decoration": "underline" }}>{i18n.t("static.commitTree.forecastSummary")}</a>
                                <div className="table-responsive RemoveStriped consumptionDataEntryTable">
                                    <div style={{ width: '100%' }} id="selectedForecastDiv" />
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </TabPane>
            </>
        );
    }

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        // console.log("In render@@@@@@@@@@@%%%%%%%%%%%%%", this.state.loading);
        const { programList } = this.state;
        let programs = programList.length > 0 && programList.map((item, i) => {
            return (
                <option key={i} value={item.id}>
                    {item.name}~v{item.version}
                </option>
            )
        }, this);

        //No forecast selected
        const { noForecastSelectedList } = this.state;
        let noForecastSelected = noForecastSelectedList.length > 0 ?
            noForecastSelectedList.map((item, i) => {
                return (
                    item.regionList.map(item1 => {
                        return (
                            <li key={i}>
                                <a href={"/#/report/compareAndSelectScenario/" + this.state.programId + "/" + item.planningUnit.planningUnit.id + "/" + item1.id} target="_blank"><div className="hoverDiv"><span>{getLabelText(item.planningUnit.planningUnit.label, this.state.lang) + " - " + item1.label}</span></div></a>
                            </li>
                        )
                    }, this)
                )
            }, this) : <span>{i18n.t('static.forecastValidation.noMissingSelectedForecastFound')}</span>;

        //Consumption : missing months
        const { missingMonthList } = this.state;
        let missingMonths = missingMonthList.length > 0 ? missingMonthList.map((item, i) => {
            return (
                <li key={i}>
                    <a href={"/#/dataentry/consumptionDataEntryAndAdjustment/" + item.planningUnitId} target="_blank"><div className="hoverDiv" ><span>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + ": "}</span></div></a>{"" + item.monthsArray}
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMissingGaps')}</span>;

        //Consumption : planning unit less 12 month
        const { consumptionListlessTwelve } = this.state;
        let consumption = consumptionListlessTwelve.length > 0 ? consumptionListlessTwelve.map((item, i) => {
            return (
                <li key={i}>
                    <a href={"/#/dataentry/consumptionDataEntryAndAdjustment/" + item.planningUnitId} target="_blank"><div className="hoverDiv"><span>{getLabelText(item.planningUnitLabel, this.state.lang) + " - " + getLabelText(item.regionLabel, this.state.lang) + ": "}</span></div></a><span>{item.noOfMonths + " month(s)"}</span>
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMonthsHaveLessData')}</span>;

        // Tree Forecast : planing unit missing on tree
        const { notSelectedPlanningUnitList } = this.state;
        let pu = (notSelectedPlanningUnitList.length > 0 && notSelectedPlanningUnitList.filter(c => c.regionsArray.length > 0).length > 0) ? notSelectedPlanningUnitList.filter(c => c.regionsArray.length > 0).map((item, i) => {
            return (
                <li key={i}>
                    <div>{getLabelText(item.planningUnit.label, this.state.lang) + " - " + item.regionsArray}</div>
                </li>
            )
        }, this) : <span>{i18n.t('static.forecastValidation.noMissingPlanningUnitsFound')}</span>;

        // Tree Forecast : branches missing PU
        const { missingBranchesList } = this.state;
        let missingBranches = missingBranchesList.length > 0 ? missingBranchesList.map((item, i) => {
            return (
                <ul>
                    <li key={i}>
                        <a href={`/#/dataSet/buildTree/tree/${item.treeId}/${this.state.programId}`} target="_blank"><div className="hoverDiv"><span>{getLabelText(item.treeLabel, this.state.lang)}</span></div></a>
                        {item.flatList.length > 0 && item.flatList.map((item1, j) => {
                            return (
                                <ul>
                                    <li key={j}>
                                        <div><span>{getLabelText(item1.payload.label, this.state.lang) == "" ? i18n.t('static.forecastValidation.editMe') : getLabelText(item1.payload.label, this.state.lang)}</span></div>
                                    </li>
                                </ul>
                            )
                        }, this)}
                    </li>
                </ul>
            )
        }, this) : <ul><span>{i18n.t('static.forecastValidation.noBranchesMissingPU')}</span></ul>;

        //Nodes less than 100%
        let jxlTable = this.state.treeScenarioList.length > 0 && this.state.treeScenarioListNotHaving100PerChild.length > 0 ? this.state.treeScenarioList.map((item1, count) => {
            if (this.state.treeScenarioListNotHaving100PerChild.filter(c => c.treeId == item1.treeId && c.scenarioId == item1.scenarioId).length > 0) {
                var nodeWithPercentageChildren = this.state.nodeWithPercentageChildren.filter(c => c.treeId == item1.treeId && c.scenarioId == item1.scenarioId);
                if (nodeWithPercentageChildren.length > 0) {
                    return (<><a href={`/#/dataSet/buildTree/tree/${item1.treeId}/${this.state.programId}/${item1.scenarioId}`} target="_blank"><span className="hoverDiv"><span>{getLabelText(item1.treeLabel, this.state.lang) + " / " + getLabelText(item1.scenarioLabel, this.state.lang)}</span></span></a><span className="hoverDiv" onClick={() => this.plusMinusClicked(item1.treeId, item1.scenarioId)}>{item1.checked ? <i className="fa fa-minus treeValidation" ></i> : <i className="fa fa-plus  treeValidation" ></i>}</span><div className="table-responsive">
                        <div id={"tableDiv" + count} className="jexcelremoveReadonlybackground consumptionDataEntryTable" name='jxlTableData' style={{ display: item1.checked ? "block" : "none" }} />
                    </div><br /></>)
                }
            }
        }, this) : <ul><span>{i18n.t('static.forecastValidation.noNodesHaveChildrenLessThanPerc')}</span><br /></ul>

        //Consumption Notes
        const { datasetPlanningUnitNotes } = this.state;
        let consumtionNotes = (datasetPlanningUnitNotes.length > 0 && datasetPlanningUnitNotes.filter(c => c.consuptionForecast.toString() == "true").length > 0) ? datasetPlanningUnitNotes.filter(c => c.consuptionForecast.toString() == "true").map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => missingMonthsClicked(item.planningUnit.id, this)}>
                    <td>{getLabelText(item.planningUnit.label, this.state.lang)}</td>
                    <td>{item.consumptionNotes}</td>
                </tr>
            )
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noConsumptionNotesFound')}</span>;

        //Tree scenario Notes
        const { treeScenarioNotes } = this.state;
        let scenarioNotes = treeScenarioNotes.length > 0 ? treeScenarioNotes.map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => nodeWithPercentageChildrenClicked(item.treeId, item.scenarioId, this)}>
                    <td>{getLabelText(item.tree, this.state.lang)}</td>
                    <td>{getLabelText(item.scenario, this.state.lang)}</td>
                    <td>{item.treeNotes}</td>
                    <td>{item.scenarioNotes}</td>
                </tr>
            )
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noTreeScenarioNotesFound')}</span>;

        //Tree Nodes Notes
        const { treeNodeList } = this.state;
        let treeNodes = treeNodeList.length > 0 && treeNodeList.filter(c => (c.notes != null && c.notes != "") || (c.madelingNotes != null && c.madelingNotes != "")).length > 0 ? treeNodeList.filter(c => (c.notes != null && c.notes != "") || (c.madelingNotes != null && c.madelingNotes != "")).map((item, i) => {
            return (
                <tr key={i} className="hoverTd" onClick={() => nodeWithPercentageChildrenClicked(item.treeId, item.scenarioId, this)}>
                    <td>{getLabelText(item.tree, this.state.lang)}</td>
                    <td>{getLabelText(item.node, this.state.lang)}</td>
                    <td>{getLabelText(item.scenario, this.state.lang)}</td>
                    <td><b>{(item.notes != "" && item.notes != null) ? i18n.t('static.commitTree.main') + ": " : ""}</b> {(item.notes != "" && item.notes != null) ? item.notes : ""}
                        {(item.notes != "" && item.notes != null && item.madelingNotes != "" && item.madelingNotes != null) ? <br /> : ""}<b>{(item.madelingNotes != "" && item.madelingNotes != null) ? i18n.t('static.commitTree.modeling') + ": " : ""}</b> {(item.madelingNotes != "" && item.madelingNotes != null) ? item.madelingNotes : ""}</td>
                </tr>
            )
        }, this) : <span>&emsp;&emsp;&emsp;&ensp;{i18n.t('static.forecastValidation.noTreeNodesNotesFound')}</span>;



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
                            {/* <div style={{ display: (this.state.programId != -1 && this.state.programId != "" && this.state.programId != undefined !== "") ? 'block' : 'none' }}><b><div className="mb-2"> <span>{i18n.t('static.commitTree.note')}</span></div></b></div> */}
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                <Row style={{ display: (this.state.programId != -1 && this.state.programId != "" && this.state.programId != undefined) ? 'block' : 'none' }}>
                                    <Col xs="12" md="12" className="mb-4">
                                        <Nav tabs>
                                            <NavItem>
                                                <NavLink
                                                    style={{ background: this.state.conflictsCountVersionSettings > 0 ? "yellow" : "" }}
                                                    active={this.state.activeTab[0] === '1'}
                                                    onClick={() => { this.toggle(0, '1'); }}
                                                >
                                                    {i18n.t('static.versionSettings.versionSettings')}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    style={{ background: this.state.conflictsCountPlanningUnits > 0 ? "yellow" : "" }}
                                                    active={this.state.activeTab[0] === '2'}
                                                    onClick={() => { this.toggle(0, '2'); }}
                                                >
                                                    {i18n.t('static.ManageTree.PlanningUnit')}
                                                </NavLink>
                                            </NavItem>

                                            <NavItem>
                                                <NavLink
                                                    style={{ background: this.state.conflictsCountConsumption > 0 ? "yellow" : "" }}
                                                    active={this.state.activeTab[0] === '3'}
                                                    onClick={() => { this.toggle(0, '3'); }}
                                                >
                                                    {i18n.t('static.supplyPlan.consumption')}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    style={{ background: this.state.conflictsCountTree > 0 ? "yellow" : "" }}
                                                    active={this.state.activeTab[0] === '4'}
                                                    onClick={() => { this.toggle(0, '4'); }}
                                                >
                                                    {i18n.t('static.forecastMethod.tree')}
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    style={{ background: this.state.conflictsCountSelectedForecast > 0 ? "yellow" : "" }}
                                                    active={this.state.activeTab[0] === '5'}
                                                    onClick={() => { this.toggle(0, '5'); }}
                                                >
                                                    {i18n.t('static.compareVersion.selectedForecast')}
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                        <TabContent activeTab={this.state.activeTab[0]}>
                                            {this.tabPane()}
                                        </TabContent>
                                    </Col>
                                </Row>

                                {/* <div className="col-md-12">
                                <Button type="button" size="md" color="warning" className="float-right mr-1" onClick={this.reset}><i className="fa fa-refresh"></i> Cancel</Button>
                                <Button type="button" color="success" className="mr-1 float-right" size="md" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-check"></i>Next</Button>
                            </div> */}

                                <div style={{ display: (this.state.programId != -1 && this.state.programId != "" && this.state.programId != undefined) ? 'block' : 'none' }}>
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
                                                            {this.state.programId != -1 && this.state.programId != "" && this.state.programId != undefined && <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.button.commit')}</Button>}
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
                    {/* <ModalHeader toggle={() => this.toggleShowValidation()} className="modalHeaderSupplyPlan">
                        <h3 style={{textAlign:'left'}}><strong>{i18n.t('static.commitTree.forecastValidation')}</strong><i className="fa fa-print pull-right iconClass cursor" onClick={() => this.print()}></i></h3>
                    </ModalHeader> */}
                    <ModalHeader toggle={() => this.toggleShowValidation()} className="modalHeaderSupplyPlan">
                        <div>
                            <img className=" pull-right iconClass cursor ml-lg-2" style={{ height: '22px', width: '22px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => exportPDF(this)} />
                            {/* <i className="fa fa-print pull-right iconClassCommit cursor" onClick={() => this.print()}></i> */}
                            <h3><strong>{i18n.t('static.commitTree.forecastValidation')}</strong></h3>
                        </div>
                        <div className={"check inline pl-lg-3"}>
                            <div className="">
                                <Input
                                    style={{ width: '16px', height: '16px', marginTop: '3px' }}
                                    className="form-check-input"
                                    type="checkbox"
                                    id="includeOnlySelectedForecasts"
                                    name="includeOnlySelectedForecasts"
                                    checked={this.state.includeOnlySelectedForecasts}
                                    onClick={(e) => { this.setIncludeOnlySelectedForecasts(e); }}
                                />
                                <Label
                                    className="form-check-label pl-lg-1"
                                    check htmlFor="inline-radio2" style={{ fontSize: '16px' }}>
                                    <b>{i18n.t('static.validation.includeOnlySelectedForecast')}</b>
                                    {/* <i class="fa fa-info-circle icons pl-lg-2" id="Popover5" onClick={() => this.toggle('popoverOpenArima', !this.state.popoverOpenArima)} aria-hidden="true" style={{ color: '#002f6c', cursor: 'pointer' }}></i> */}
                                </Label>
                            </div>
                        </div>
                    </ModalHeader>
                    <div>
                        <ModalBody className="VersionSettingMode">
                            <span><b>{this.state.programName}</b></span><br />
                            <span><b>{i18n.t('static.common.forecastPeriod')}: </b> {moment(this.state.forecastStartDate).format('MMM-YYYY')} to {moment(this.state.forecastStopDate).format('MMM-YYYY')} </span>
                            <br />
                            <br />

                            <span><b>1. {i18n.t('static.commitTree.noForecastSelected')}: </b>(<a href="/#/report/compareAndSelectScenario" target="_blank">{i18n.t('static.commitTree.compare&Select')}</a>, <a href={this.state.programId != -1 && this.state.programId != "" && this.state.programId != undefined ? "/#/forecastReport/forecastSummary/" + this.state.programId.toString().split("_")[0] + "/" + (this.state.programId.toString().split("_")[1]).toString().substring(1) : "/#/forecastReport/forecastSummary/"} target="_blank">{i18n.t('static.commitTree.forecastSummary')}</a>)</span><br />
                            <ul>{noForecastSelected}</ul>

                            <span><b>2. {i18n.t('static.commitTree.consumptionForecast')}: </b>(<a href="/#/dataentry/consumptionDataEntryAndAdjustment" target="_blank">{i18n.t('static.commitTree.dataEntry&Adjustment')}</a>, <a href="/#/extrapolation/extrapolateData" target="_blank">{i18n.t('static.commitTree.extrapolation')}</a>)</span><br />
                            <span>a. {i18n.t('static.commitTree.monthsMissingActualConsumptionValues')}:</span><br />
                            <ul>{missingMonths}</ul>
                            <span>b. {i18n.t('static.commitTree.puThatDoNotHaveAtleast24MonthsOfActualConsumptionValues')}:</span><br />
                            <ul>{consumption}</ul>

                            <span><b>3. {i18n.t('static.commitTree.treeForecast')}: </b>(<a href={"/#/dataSet/buildTree/tree/0/" + this.state.programId} target="_blank">{i18n.t('static.common.managetree')}</a>)</span><br />
                            <span>a. {this.state.includeOnlySelectedForecasts ? i18n.t('static.commitTree.puThatDoesNotAppearOnSelectedForecastTree') : i18n.t('static.commitTree.puThatDoesNotAppearOnAnyTree')}: </span><br />
                            <ul>{pu}</ul>

                            <span>b. {i18n.t('static.commitTree.branchesMissingPlanningUnit')}:</span><br />
                            {missingBranches}

                            <span>c. {i18n.t('static.commitTree.NodesWithChildrenThatDoNotAddUpTo100Prcnt')}:</span><br />
                            {jxlTable}


                            <span><b>4. {i18n.t('static.program.notes')}:</b></span><br />

                            <span>a. {i18n.t('static.forecastMethod.historicalData')}:</span>
                            <div className="mt-2">
                                {(datasetPlanningUnitNotes.length > 0 && datasetPlanningUnitNotes.filter(c => c.consuptionForecast.toString() == "true").length > 0) ?
                                    <div className="table-wrap table-responsive fixTableHead">
                                        <Table className="table-bordered text-center overflowhide main-table table-striped1" bordered size="sm" >
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '30%' }}><b>{i18n.t('static.dashboard.planningunitheader')}</b></th>
                                                    <th style={{ width: '80%' }}><b>{i18n.t('static.program.notes')}</b></th>
                                                </tr>
                                            </thead>
                                            <tbody>{consumtionNotes}</tbody>
                                        </Table>
                                    </div> : <span>{consumtionNotes}</span>}
                            </div><br />
                            <span>b. {i18n.t('static.commitTree.treeScenarios')}:</span>
                            <div className="">
                                {treeScenarioNotes.length > 0 ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center  overflowhide main-table table-striped1" bordered size="sm" >
                                        <thead>
                                            <tr>
                                                <th style={{ width: '15%' }}><b>{i18n.t('static.forecastMethod.tree')}</b></th>
                                                <th style={{ width: '15%' }}><b>{i18n.t('static.whatIf.scenario')}</b></th>
                                                <th style={{ width: '35%' }}><b>{i18n.t('static.dataValidation.treeNotes')}</b></th>
                                                <th style={{ width: '35%' }}><b>{i18n.t('static.dataValidation.scenarioNotes')}</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>{scenarioNotes}</tbody>
                                    </Table>
                                </div> : <span>{scenarioNotes}</span>}
                            </div><br />
                            <span>c. {i18n.t('static.commitTree.treeNodes')}:</span>
                            {/* <div className="table-scroll"> */}
                            <div className="mt-2">
                                {treeNodeList.length > 0 && treeNodeList.filter(c => (c.notes != null && c.notes != "") || (c.madelingNotes != null && c.madelingNotes != "")).length > 0 ? <div className="table-wrap table-responsive fixTableHead">
                                    <Table className="table-bordered text-center overflowhide main-table table-striped1" bordered size="sm" >
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
                                </div> : <span>{treeNodes}</span>}
                            </div>
                            {/* <div className="col-md-12 pb-lg-5 pt-lg-3">
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>{i18n.t('static.report.ok')}</Button>
                            </div> */}
                        </ModalBody>
                        <div className="col-md-12 pb-lg-5 pt-lg-3">
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={() => { this.toggleShowValidation() }}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.programId != -1 && this.state.programId != "" && this.state.programId != undefined && <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.synchronize}><i className="fa fa-check"></i>{i18n.t('static.report.ok')}</Button>}
                        </div>
                    </div>
                </Modal >
                {/* Resolve conflicts modal version Settings */}
                <Modal isOpen={this.state.versionSettingsConflictsModal}
                    className={'modal-lg ' + this.props.className, "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
                    <ModalHeader toggle={() => this.toggleVersionSettingsConflictModal()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
                        <ul className="legendcommitversion">
                            <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
                            <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
                        </ul>
                    </ModalHeader>
                    <ModalBody>
                        <div className="table-responsive RemoveStriped consumptionDataEntryTable">
                            <div id="versionSettingsConflictsDiv" />
                            <input type="hidden" id="versionSettingsIndex" />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChangesVersionSettings}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
                        <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChangesVersionSettings}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
                    </ModalFooter>
                </Modal>
                {/* Resolve conflicts modal */}

                {/* Resolve conflicts planning units modal */}
                <Modal isOpen={this.state.planningUnitsConflictsModal}
                    className={'modal-lg ' + this.props.className, "modalWidth"} style={{ display: this.state.loading ? "none" : "block" }}>
                    <ModalHeader toggle={() => this.togglePlanningUnitsConflictModal()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.commitVersion.resolveConflicts')}</strong>
                        <ul className="legendcommitversion">
                            <li><span className="greenlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInCurrentVersion')}</span></li>
                            <li><span className="notawesome  legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.commitVersion.changedInLatestVersion')}</span></li>
                        </ul>
                    </ModalHeader>
                    <ModalBody>
                        <div className="table-responsive RemoveStriped consumptionDataEntryTable">
                            <div id="planningUnitsConflictsDiv" />
                            <input type="hidden" id="planningUnitsIndex" />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.acceptCurrentChangesPlanningUnits}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptCurrentVersion')}</Button>{' '}
                        <Button type="submit" size="md" className="acceptLocalChnagesButton submitBtn float-right mr-1" onClick={this.acceptIncomingChangesPlanningUnits}> <i className="fa fa-check"></i>{i18n.t('static.commitVersion.acceptLatestVersion')}</Button>{' '}
                    </ModalFooter>
                </Modal>
                {/* Resolve conflicts planning units modal */}
            </div >
        )
    }
}
