import bsCustomFileInput from 'bs-custom-file-input';
import 'chartjs-plugin-annotation';
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import JSZip from 'jszip';
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-select/dist/react-select.min.css';
import { ProgressBar, Step } from "react-step-progress-bar";
import Select from 'react-select';
import {
    Row,
    Button,
    Card, CardBody,
    CardFooter,
    Col, Form,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from 'reactstrap';
import "../../../node_modules/react-step-progress-bar/styles.css";
import * as Yup from 'yup';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import getLabelText from '../../CommonComponent/getLabelText.js';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import ProgramService from "../../api/ProgramService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import StepOneImport from './StepOneImportDataset';
import StepTwoImport from './StepTwoImportDataset';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Initial values for form fields
const initialValues = {
    programId: ''
}
// Localized entity name
const entityname = i18n.t('static.dashboard.importprogram')
/**
 * Component for importing the forecast program from zip.
 */
export default class ImportDataset extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progressPer: 0,
            programList: [],
            message: '',
            loading: true,
        }
        this.formSubmit = this.formSubmit.bind(this)
        this.importFile = this.importFile.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.checkNewerVersions = this.checkNewerVersions.bind(this);
        this.finishedStepOne = this.finishedStepOne.bind(this);
        this.previousToStepOne = this.previousToStepOne.bind(this);
        this.removeMessageText = this.removeMessageText.bind(this);
        this.updateStepOneData = this.updateStepOneData.bind(this);
        this.redirectToDashboard = this.redirectToDashboard.bind(this);
    }
    /**
     * Redirects to the dashboard based on the user's role.
     */
    redirectToDashboard(color, msg) {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/'+color+'/' + msg)
    }
    /**
     * Updates the state with the provided key-value pair.
     * @param {String} key The key of the state to be updated.
     * @param {any} value The value to be assigned to the specified key in the state.
     */
    updateStepOneData(key, value) {
        this.setState({
            [key]: value
        },
            () => {
            })
    }
    /**
     * Handles the completion of step one and updates the display to show step two.
     */
    finishedStepOne() {
        this.setState({ progressPer: 100, loading: true });
        document.getElementById('stepOneImport').style.display = 'none';
        document.getElementById('stepTwoImport').style.display = 'block';
        this.refs.stepTwoChild.filterData();
    }
    /**
     * Updates the state of message to blank
     */
    removeMessageText() {
        this.setState({ message: '' });
    }
    /**
     * Handles moving back to step one from any subsequent step and updates the display accordingly.
     */
    previousToStepOne() {
        this.setState({ progressPer: 0, loading: true });
        document.getElementById('stepOneImport').style.display = 'block';
        document.getElementById('stepTwoImport').style.display = 'none';
        this.refs.stepOneChild.filterData();
    }
     /**
     * Retrieves programs from the indexedDB.
     */
    getPrograms() {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red',
                    loading: false
                })
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson1 = JSON.parse(programData);
                        var programJson = {
                            programId: programJson1.programId,
                            versionId: myResult[i].version
                        }
                        proList.push(programJson)
                    }
                }
                this.checkNewerVersions(proList);
            }.bind(this);
        }.bind(this)
    }
    /**
     * Checks for newer versions of programs.
     * @param {Array} programs - An array of programs to check for newer versions.
     */
    checkNewerVersions(programs) {
        if (localStorage.getItem("sessionType") === 'Online') {
            ProgramService.checkNewerVersions(programs)
                .then(response => {
                    localStorage.removeItem("sesLatestDataset");
                    localStorage.setItem("sesLatestDataset", response.data);
                })
        }
    }
    /**
     * Calls the get programs function on component mount
     */
    componentDidMount() {
        this.getPrograms();
        bsCustomFileInput.init()
        this.setState({ loading: false })
        hideSecondComponent();
        document.getElementById('stepOneImport').style.display = 'block';
        document.getElementById('stepTwoImport').style.display = 'none';
    }
    /**
     * Reads the data from the file and stores in indexed db
     */
    formSubmit() {
        this.setState({ loading: true })
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var selectedPrgArr = this.state.programId;
            if (selectedPrgArr == undefined || selectedPrgArr.length == 0) {
                this.setState({ loading: false })
                alert(i18n.t('static.budget.programtext'));
            } else {
                var file = document.querySelector('input[type=file]').files[0];
                var db1;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var transaction = db1.transaction(['datasetData'], 'readwrite');
                    var program = transaction.objectStore('datasetData');
                    var count = 0;
                    var getRequest = program.getAll();
                    getRequest.onerror = function (event) {
                    };
                    getRequest.onsuccess = function (event) {
                        var myResult = [];
                        myResult = getRequest.result;
                        var programDataJson = this.state.programListArray;
                        for (var i = 0; i < myResult.length; i++) {
                            for (var j = 0; j < programDataJson.length; j++) {
                                for (var k = 0; k < selectedPrgArr.length; k++) {
                                    if (programDataJson[j].filename == selectedPrgArr[k].value) {
                                        var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                        var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                        if (myResult[i].id == programDataJson[j].programId + "_v" + programDataJson[j].version + "_uId_" + userId) {
                                            count++;
                                        }
                                    }
                                }
                            }
                        }
                        if (count == 0) {
                            JSZip.loadAsync(file).then(function (zip) {
                                Object.keys(zip.files).forEach(function (filename) {
                                    zip.files[filename].async('string').then(function (fileData) {
                                        for (var j = 0; j < selectedPrgArr.length; j++) {
                                            if (selectedPrgArr[j].value == filename) {
                                                db1 = e.target.result;
                                                var json = JSON.parse(fileData.split("@~-~@")[0]);
                                                var countryList = json.countryList;
                                                delete json.countryList;
                                                var forecastingUnitList = json.forecastingUnitList;
                                                delete json.forecastingUnitList;
                                                var planningUnitList = json.planningUnitList;
                                                delete json.planningUnitList;
                                                var procurementUnitList = json.procurementUnitList;
                                                delete json.procurementUnitList;
                                                var realmCountryList = json.realmCountryList;
                                                delete json.realmCountryList;
                                                var realmCountryPlanningUnitList = json.realmCountryPlanningUnitList;
                                                delete json.realmCountryPlanningUnitList;
                                                var procurementAgentPlanningUnitList = json.procurementAgentPlanningUnitList;
                                                delete json.procurementAgentPlanningUnitList;
                                                var procurementAgentProcurementUnitList = json.procurementAgentProcurementUnitList;
                                                delete json.procurementAgentProcurementUnitList;
                                                var programList = json.programList;
                                                delete json.programList;
                                                var programPlanningUnitList = json.programPlanningUnitList;
                                                delete json.programPlanningUnitList;
                                                var regionList = json.regionList;
                                                delete json.regionList;
                                                var budgetList = json.budgetList;
                                                delete json.budgetList;
                                                var usageTemplateList = json.usageTemplateList != undefined ? json.usageTemplateList : [];
                                                delete json.usageList;
                                                var equivalencyUnitList = json.equivalencyUnitList != undefined ? json.equivalencyUnitList : [];
                                                delete json.equivalencyUnitList;
                                                var countryTransaction = db1.transaction(['country'], 'readwrite');
                                                var countryObjectStore = countryTransaction.objectStore('country');
                                                for (var i = 0; i < countryList.length; i++) {
                                                    countryObjectStore.put(countryList[i]);
                                                }
                                                var forecastingUnitTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                                                var forecastingUnitObjectStore = forecastingUnitTransaction.objectStore('forecastingUnit');
                                                for (var i = 0; i < forecastingUnitList.length; i++) {
                                                    forecastingUnitObjectStore.put(forecastingUnitList[i]);
                                                }
                                                var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                                                var planningUnitObjectStore = planningUnitTransaction.objectStore('planningUnit');
                                                for (var i = 0; i < planningUnitList.length; i++) {
                                                    planningUnitObjectStore.put(planningUnitList[i]);
                                                }
                                                var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                                                var procurementUnitObjectStore = procurementUnitTransaction.objectStore('procurementUnit');
                                                for (var i = 0; i < procurementUnitList.length; i++) {
                                                    procurementUnitObjectStore.put(procurementUnitList[i]);
                                                }
                                                var realmCountryTransaction = db1.transaction(['realmCountry'], 'readwrite');
                                                var realmCountryObjectStore = realmCountryTransaction.objectStore('realmCountry');
                                                for (var i = 0; i < realmCountryList.length; i++) {
                                                    realmCountryObjectStore.put(realmCountryList[i]);
                                                }
                                                var realmCountryPlanningUnitTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                                var realmCountryPlanningUnitObjectStore = realmCountryPlanningUnitTransaction.objectStore('realmCountryPlanningUnit');
                                                for (var i = 0; i < realmCountryPlanningUnitList.length; i++) {
                                                    realmCountryPlanningUnitObjectStore.put(realmCountryPlanningUnitList[i]);
                                                }
                                                var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                                                var procurementAgentPlanningUnitObjectStore = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                                                for (var i = 0; i < procurementAgentPlanningUnitList.length; i++) {
                                                    procurementAgentPlanningUnitObjectStore.put(procurementAgentPlanningUnitList[i]);
                                                }
                                                var procurementAgentProcurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                                                var procurementAgentProcurementUnitObjectStore = procurementAgentProcurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                                                for (var i = 0; i < procurementAgentProcurementUnitList.length; i++) {
                                                    procurementAgentProcurementUnitObjectStore.put(procurementAgentProcurementUnitList[i]);
                                                }
                                                var programTransaction = db1.transaction(['program'], 'readwrite');
                                                var programObjectStore = programTransaction.objectStore('program');
                                                for (var i = 0; i < programList.length; i++) {
                                                    programObjectStore.put(programList[i]);
                                                }
                                                var programPlanningUnitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                                var programPlanningUnitObjectStore = programPlanningUnitTransaction.objectStore('programPlanningUnit');
                                                for (var i = 0; i < programPlanningUnitList.length; i++) {
                                                    programPlanningUnitObjectStore.put(programPlanningUnitList[i]);
                                                }
                                                var regionTransaction = db1.transaction(['region'], 'readwrite');
                                                var regionObjectStore = regionTransaction.objectStore('region');
                                                for (var i = 0; i < regionList.length; i++) {
                                                    regionObjectStore.put(regionList[i]);
                                                }
                                                var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                                var budgetObjectStore = budgetTransaction.objectStore('budget');
                                                for (var i = 0; i < budgetList.length; i++) {
                                                    budgetObjectStore.put(budgetList[i]);
                                                }
                                                var usageTemplateTransaction = db1.transaction(['usageTemplate'], 'readwrite');
                                                var usageTemplateObjectStore = usageTemplateTransaction.objectStore('usageTemplate');
                                                for (var i = 0; i < usageTemplateList.length; i++) {
                                                    usageTemplateObjectStore.put(usageTemplateList[i]);
                                                }
                                                var equivalencyUnitTransaction = db1.transaction(['equivalencyUnit'], 'readwrite');
                                                var equivalencyUnitObjectStore = equivalencyUnitTransaction.objectStore('equivalencyUnit');
                                                for (var i = 0; i < equivalencyUnitList.length; i++) {
                                                    equivalencyUnitObjectStore.put(equivalencyUnitList[i]);
                                                }
                                                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                                json.userId = userId;
                                                json.id = json.programId + "_v" + json.version + "_uId_" + userId;
                                                var programDataBytes = CryptoJS.AES.decrypt(json.programData, SECRET_KEY);
                                                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                                var programJson = JSON.parse(programData);
                                                json.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                                var transactionn = db1.transaction(['datasetData'], 'readwrite');
                                                var programn = transactionn.objectStore('datasetData');
                                                var addProgramDataRequest = programn.put(json);
                                                transactionn.oncomplete = function (event) {
                                                    var item = {
                                                        id: json.programId + "_v" + json.version + "_uId_" + userId,
                                                        programId: json.programId,
                                                        version: json.version,
                                                        userId: userId,
                                                        programCode: programJson.programCode,
                                                        changed: json.changed,
                                                        readonly: json.readonly
                                                    }
                                                    var programQPLDetailsTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                                    var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('datasetDetails');
                                                    var programQPLDetailsRequest = programQPLDetailsOs.put(item);
                                                    programQPLDetailsTransaction.oncomplete = function (event) {
                                                        this.setState({
                                                            message: i18n.t('static.program.dataimportsuccess'),
                                                            loading: false
                                                        })
                                                        let id = AuthenticationService.displayDashboardBasedOnRole();
                                                        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.program.dataimportsuccess'))
                                                    }.bind(this)
                                                }.bind(this)
                                            }
                                        }
                                    }.bind(this))
                                }.bind(this))
                            }.bind(this))
                        } else {
                            confirmAlert({
                                title: i18n.t('static.program.confirmsubmit'),
                                message: i18n.t('static.program.programwithsameversion'),
                                buttons: [
                                    {
                                        label: i18n.t('static.program.yes'),
                                        onClick: () => {
                                            JSZip.loadAsync(file).then(function (zip) {
                                                Object.keys(zip.files).forEach(function (filename) {
                                                    zip.files[filename].async('string').then(function (fileData) {
                                                        for (var j = 0; j < selectedPrgArr.length; j++) {
                                                            if (selectedPrgArr[j].value == filename) {
                                                                db1 = e.target.result;
                                                                var json = JSON.parse(fileData.split("@~-~@")[0]);
                                                                var countryList = json.countryList;
                                                                delete json.countryList;
                                                                var forecastingUnitList = json.forecastingUnitList;
                                                                delete json.forecastingUnitList;
                                                                var planningUnitList = json.planningUnitList;
                                                                delete json.planningUnitList;
                                                                var procurementUnitList = json.procurementUnitList;
                                                                delete json.procurementUnitList;
                                                                var realmCountryList = json.realmCountryList;
                                                                delete json.realmCountryList;
                                                                var realmCountryPlanningUnitList = json.realmCountryPlanningUnitList;
                                                                delete json.realmCountryPlanningUnitList;
                                                                var procurementAgentPlanningUnitList = json.procurementAgentPlanningUnitList;
                                                                delete json.procurementAgentPlanningUnitList;
                                                                var procurementAgentProcurementUnitList = json.procurementAgentProcurementUnitList;
                                                                delete json.procurementAgentProcurementUnitList;
                                                                var programList = json.programList;
                                                                delete json.programList;
                                                                var programPlanningUnitList = json.programPlanningUnitList;
                                                                delete json.programPlanningUnitList;
                                                                var regionList = json.regionList;
                                                                delete json.regionList;
                                                                var budgetList = json.budgetList;
                                                                delete json.budgetList;
                                                                var usageTemplateList = json.usageTemplateList;
                                                                delete json.usageList;
                                                                var equivalencyUnitList = json.equivalencyUnitList;
                                                                delete json.equivalencyUnitList;
                                                                var countryTransaction = db1.transaction(['country'], 'readwrite');
                                                                var countryObjectStore = countryTransaction.objectStore('country');
                                                                for (var i = 0; i < countryList.length; i++) {
                                                                    countryObjectStore.put(countryList[i]);
                                                                }
                                                                var forecastingUnitTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                                                                var forecastingUnitObjectStore = forecastingUnitTransaction.objectStore('forecastingUnit');
                                                                for (var i = 0; i < forecastingUnitList.length; i++) {
                                                                    forecastingUnitObjectStore.put(forecastingUnitList[i]);
                                                                }
                                                                var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                                                                var planningUnitObjectStore = planningUnitTransaction.objectStore('planningUnit');
                                                                for (var i = 0; i < planningUnitList.length; i++) {
                                                                    planningUnitObjectStore.put(planningUnitList[i]);
                                                                }
                                                                var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                                                                var procurementUnitObjectStore = procurementUnitTransaction.objectStore('procurementUnit');
                                                                for (var i = 0; i < procurementUnitList.length; i++) {
                                                                    procurementUnitObjectStore.put(procurementUnitList[i]);
                                                                }
                                                                var realmCountryTransaction = db1.transaction(['realmCountry'], 'readwrite');
                                                                var realmCountryObjectStore = realmCountryTransaction.objectStore('realmCountry');
                                                                for (var i = 0; i < realmCountryList.length; i++) {
                                                                    realmCountryObjectStore.put(realmCountryList[i]);
                                                                }
                                                                var realmCountryPlanningUnitTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                                                var realmCountryPlanningUnitObjectStore = realmCountryPlanningUnitTransaction.objectStore('realmCountryPlanningUnit');
                                                                for (var i = 0; i < realmCountryPlanningUnitList.length; i++) {
                                                                    realmCountryPlanningUnitObjectStore.put(realmCountryPlanningUnitList[i]);
                                                                }
                                                                var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                                                                var procurementAgentPlanningUnitObjectStore = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                                                                for (var i = 0; i < procurementAgentPlanningUnitList.length; i++) {
                                                                    procurementAgentPlanningUnitObjectStore.put(procurementAgentPlanningUnitList[i]);
                                                                }
                                                                var procurementAgentProcurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                                                                var procurementAgentProcurementUnitObjectStore = procurementAgentProcurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                                                                for (var i = 0; i < procurementAgentProcurementUnitList.length; i++) {
                                                                    procurementAgentProcurementUnitObjectStore.put(procurementAgentProcurementUnitList[i]);
                                                                }
                                                                var programTransaction = db1.transaction(['program'], 'readwrite');
                                                                var programObjectStore = programTransaction.objectStore('program');
                                                                for (var i = 0; i < programList.length; i++) {
                                                                    programObjectStore.put(programList[i]);
                                                                }
                                                                var programPlanningUnitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                                                var programPlanningUnitObjectStore = programPlanningUnitTransaction.objectStore('programPlanningUnit');
                                                                for (var i = 0; i < programPlanningUnitList.length; i++) {
                                                                    programPlanningUnitObjectStore.put(programPlanningUnitList[i]);
                                                                }
                                                                var regionTransaction = db1.transaction(['region'], 'readwrite');
                                                                var regionObjectStore = regionTransaction.objectStore('region');
                                                                for (var i = 0; i < regionList.length; i++) {
                                                                    regionObjectStore.put(regionList[i]);
                                                                }
                                                                var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                                                var budgetObjectStore = budgetTransaction.objectStore('budget');
                                                                for (var i = 0; i < budgetList.length; i++) {
                                                                    budgetObjectStore.put(budgetList[i]);
                                                                }
                                                                var usageTemplateTransaction = db1.transaction(['usageTemplate'], 'readwrite');
                                                                var usageTemplateObjectStore = usageTemplateTransaction.objectStore('usageTemplate');
                                                                for (var i = 0; i < usageTemplateList.length; i++) {
                                                                    usageTemplateObjectStore.put(usageTemplateList[i]);
                                                                }
                                                                var equivalencyUnitTransaction = db1.transaction(['equivalencyUnit'], 'readwrite');
                                                                var equivalencyUnitObjectStore = equivalencyUnitTransaction.objectStore('equivalencyUnit');
                                                                for (var i = 0; i < equivalencyUnitList.length; i++) {
                                                                    equivalencyUnitObjectStore.put(equivalencyUnitList[i]);
                                                                }
                                                                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                                                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                                                json.userId = userId;
                                                                json.id = json.programId + "_v" + json.version + "_uId_" + userId;
                                                                var programDataBytes = CryptoJS.AES.decrypt(json.programData, SECRET_KEY);
                                                                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                                                var programJson = JSON.parse(programData);
                                                                json.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                                                var transactionn = db1.transaction(['datasetData'], 'readwrite');
                                                                var programn = transactionn.objectStore('datasetData');
                                                                var addProgramDataRequest = programn.put(json);
                                                                transactionn.oncomplete = function (event) {
                                                                    var item = {
                                                                        id: json.programId + "_v" + json.version + "_uId_" + userId,
                                                                        programId: json.programId,
                                                                        version: json.version,
                                                                        userId: userId,
                                                                        programCode: programJson.programCode,
                                                                        changed: json.changed,
                                                                        readonly: json.readonly
                                                                    }
                                                                    var programQPLDetailsTransaction = db1.transaction(['datasetDetails'], 'readwrite');
                                                                    var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('datasetDetails');
                                                                    var programQPLDetailsRequest = programQPLDetailsOs.put(item);
                                                                    programQPLDetailsTransaction.oncomplete = function (event) {
                                                                        this.setState({
                                                                            message: i18n.t('static.program.dataimportsuccess'),
                                                                            loading: false
                                                                        })
                                                                        let id = AuthenticationService.displayDashboardBasedOnRole();
                                                                        this.getPrograms();
                                                                        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.program.dataimportsuccess'))
                                                                    }.bind(this)
                                                                }.bind(this)
                                                            }
                                                        }
                                                    }.bind(this))
                                                }.bind(this))
                                            }.bind(this))
                                        }
                                    },
                                    {
                                        label: i18n.t('static.program.no'),
                                        onClick: () => {
                                            this.setState({
                                                message: i18n.t('static.program.actioncancelled'),
                                                loading: false
                                            })
                                            let id = AuthenticationService.displayDashboardBasedOnRole();
                                            this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.program.actioncancelled'))
                                        }
                                    }
                                ]
                            });
                        }
                    }.bind(this)
                }.bind(this)
            }
        }
    }
    /**
     * Imports forecast program data from a zip file.
     * This function allows users to upload a zip file containing program data. It reads the contents
     * of the zip file asynchronously, decrypts the program data, and displays the program information
     * for further processing.
     */
    importFile() {
        this.setState({ loading: true })
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            if (document.querySelector('input[type=file]').files[0] == undefined) {
                alert(i18n.t('static.program.selectfile'));
                this.setState({
                    loading: false
                })
            } else {
                var file = document.querySelector('input[type=file]').files[0];
                var fileName = file.name;
                var fileExtenstion = fileName.split(".");
                if (fileExtenstion[fileExtenstion.length - 1] == "zip") {
                    const lan = 'en'
                    JSZip.loadAsync(file).then(function (zip) {
                        var i = 0;
                        var fileName = []
                        var programListArray = []
                        var size = 0;
                        Object.keys(zip.files).forEach(function (filename) {
                            size++;
                        })
                        Object.keys(zip.files).forEach(function (filename) {
                            zip.files[filename].async('string').then(function (fileData) {
                                var programDataJson;
                                try {
                                    programDataJson = JSON.parse(fileData.split("@~-~@")[0]);
                                }
                                catch (err) {
                                    this.setState({ message: i18n.t('static.program.zipfilereaderror'), loading: false },
                                        () => {
                                            hideSecondComponent();
                                        })
                                }
                                var bytes = CryptoJS.AES.decrypt(programDataJson.programData, SECRET_KEY);
                                var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                                if (plaintext == "") {
                                    this.setState({
                                        message: i18n.t('static.program.zipfilereaderror'),
                                        loading: false
                                    })
                                } else {
                                    var programDataJsonDecrypted = JSON.parse(plaintext);
                                    programDataJson.filename = filename;
                                    fileName[i] = {
                                        value: filename, label: (getLabelText((programDataJsonDecrypted.label), lan)) + "~v" + programDataJson.version
                                    }
                                    programListArray[i] = programDataJson;
                                    i++;
                                    if (i === size) {
                                        this.updateStepOneData("loading", false);
                                        this.setState({
                                            message: "",
                                            programList: fileName,
                                            programListArray: programListArray,
                                            loading: false
                                        }, () => {
                                            this.finishedStepOne();
                                        })
                                    }
                                }
                            }.bind(this))
                        }.bind(this))
                    }.bind(this))
                } else {
                    this.setState({ loading: false })
                    alert(i18n.t('static.program.selectzipfile'))
                }
            }
        }
    }
    /**
     * Updates program Ids
     * @param {*} value Program Id selected by the user
     */
    updateFieldData(value) {
        this.updateStepOneData("programId", value);
    }
    /**
     * Renders the import forecast program screen.
     * @returns {JSX.Element} - Import forecast Program screen.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">
                    {i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardBody>
                                <Row className='justify-content-center'>
                                    <Col sm={6} md={6}>
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
                                        </ProgressBar>
                                    </Col>
                                </Row>
                                <div className="d-sm-down-none  progressbar mr-4">
                                    <ul>
                                        <li className="progresdatatext2 ml-4">{i18n.t('static.chooseFile.chooseFile')}</li>
                                        <li className="progresdatatext4 ml-2">{i18n.t('static.common.selectProgram')}</li>
                                    </ul>
                                </div>
                                <br></br>
                                <div>
                                    <div id="stepOneImport">
                                        <StepOneImport ref='stepOneChild' importFile={this.importFile} cancelClicked={this.cancelClicked} resetClicked={this.resetClicked} finishedStepOne={this.finishedStepOne} updateStepOneData={this.updateStepOneData} redirectToDashboard={this.redirectToDashboard} loading={this.state.loading} items={this.state}></StepOneImport>
                                    </div>
                                    <div id="stepTwoImport">
                                        <StepTwoImport ref='stepTwoChild' formSubmit={this.formSubmit} updateFieldData={this.updateFieldData} cancelClicked={this.cancelClicked} resetClicked={this.resetClicked} updateStepOneData={this.updateStepOneData} previousToStepOne={this.previousToStepOne} redirectToDashboard={this.redirectToDashboard} loading={this.state.loading} items={this.state}></StepTwoImport>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
    /**
     * Redirects to the application dashboard screen when cancel button is clicked.
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.redirectToDashboard('red', i18n.t('static.message.cancelled', { entityname }));
    }
    /**
     * Resets the import details when reset button is clicked.
     */
    resetClicked() {
        this.state.programId = '';
        this.updateStepOneData("message", "");
        this.setState({ programId: '', message: '' });
    }
}