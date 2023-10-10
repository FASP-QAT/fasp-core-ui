import bsCustomFileInput from 'bs-custom-file-input';
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import JSZip from 'jszip';
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col, Form,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from 'reactstrap';
import * as Yup from 'yup';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import getLabelText from '../../CommonComponent/getLabelText.js';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import ProgramService from "../../api/ProgramService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import '../Forms/ValidationForms/ValidationForms.css';
const initialValues = {
    programId: ''
}
const validationSchema = function (values) {
    return Yup.object().shape({
        programId: Yup.string()
            .required(i18n.t('static.program.validselectprogramtext'))
    })
}
const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
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
const entityname = i18n.t('static.dashboard.importprogram')
export default class ImportDataset extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            message: '',
            loading: true,
        }
        this.formSubmit = this.formSubmit.bind(this)
        this.importFile = this.importFile.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.getPrograms = this.getPrograms.bind(this);
        this.checkNewerVersions = this.checkNewerVersions.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
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
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
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
    checkNewerVersions(programs) {
        if (isSiteOnline()) {
            ProgramService.checkNewerVersions(programs)
                .then(response => {
                    localStorage.removeItem("sesLatestDataset");
                    localStorage.setItem("sesLatestDataset", response.data);
                })
        }
    }
    componentDidMount() {
        this.getPrograms();
        bsCustomFileInput.init()
        document.getElementById("programIdDiv").style.display = "none";
        document.getElementById("formSubmitButton").style.display = "none";
        document.getElementById("fileImportDiv").style.display = "block";
        document.getElementById("fileImportButton").style.display = "block";
        this.setState({ loading: false })
    }
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
                                                var transaction2 = db1.transaction(['datasetData'], 'readwrite');
                                                var program2 = transaction2.objectStore('datasetData');
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
                                                                var transaction2 = db1.transaction(['datasetData'], 'readwrite');
                                                                var program2 = transaction2.objectStore('datasetData');
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
                                            this.hideSecondComponent();
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
                                        this.setState({
                                            message: "",
                                            programList: fileName,
                                            programListArray: programListArray,
                                            loading: false
                                        })
                                        document.getElementById("programIdDiv").style.display = "block";
                                        document.getElementById("formSubmitButton").style.display = "block";
                                        document.getElementById("fileImportDiv").style.display = "none";
                                        document.getElementById("fileImportButton").style.display = "none";
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
    touchAll(setTouched, errors) {
        setTouched({
            programId: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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
    updateFieldData(value) {
        this.setState({ programId: value });
    }
    render() {
        return (
            <>
                <h5 style={{ color: "red" }} id="div2">
                    {i18n.t(this.state.message, { entityname })}</h5>
                <AuthenticationServiceComponent history={this.props.history} />
                <Card className="mt-2">
                    <Formik
                        initialValues={initialValues}
                        render={
                            ({
                                errors,
                                touched,
                                handleChange,
                                handleBlur,
                            }) => (
                                <Form noValidate name='simpleForm'>
                                    <CardBody className="pb-lg-2 pt-lg-2">
                                        <FormGroup id="fileImportDiv">
                                            <Col md="3">
                                                <Label className="uploadfilelable" htmlFor="file-input">{i18n.t('static.program.fileinput')}</Label>
                                            </Col>
                                            <Col xs="12" md="4" className="custom-file">
                                                <Input type="file" className="custom-file-input" id="file-input" name="file-input" accept=".zip" />
                                                <label className="custom-file-label" id="file-input" data-browse={i18n.t('static.uploadfile.Browse')}>{i18n.t('static.chooseFile.chooseFile')}</label>
                                            </Col>
                                        </FormGroup>
                                        <FormGroup id="programIdDiv" className="col-md-4">
                                            <Label htmlFor="select">{i18n.t('static.program.program')}</Label>
                                            <Select
                                                bsSize="sm"
                                                valid={!errors.programId}
                                                invalid={touched.programId && !!errors.programId}
                                                onChange={(e) => { handleChange(e); this.updateFieldData(e) }}
                                                onBlur={handleBlur} name="programId" id="programId"
                                                multi
                                                options={this.state.programList}
                                                value={this.state.programId}
                                            />
                                            <FormFeedback>{errors.programId}</FormFeedback>
                                        </FormGroup>
                                    </CardBody>
                                    <div style={{ display: this.state.loading ? "none" : "block" }}></div>
                                    <div style={{ display: this.state.loading ? "block" : "none" }}>
                                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                            <div class="align-items-center">
                                                <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>
                                                <div class="spinner-border blue ml-4" role="status">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <CardFooter>
                                        <FormGroup>
                                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                            <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="button" id="fileImportButton" size="md" color="success" className="float-right mr-1" onClick={() => this.importFile()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                            <Button type="button" id="formSubmitButton" size="md" color="success" className="float-right mr-1" onClick={() => this.formSubmit()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                            &nbsp;
                                        </FormGroup>
                                    </CardFooter>
                                </Form>
                            )} />
                </Card>
            </>
        )
    }
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked() {
        this.state.programId = '';
        this.setState({ programId: '', message: '' });
    }
}