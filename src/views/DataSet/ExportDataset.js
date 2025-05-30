import CryptoJS from 'crypto-js';
import FileSaver from 'file-saver';
import { Formik } from 'formik';
import JSZip from 'jszip';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import {
    Button,
    Card, CardBody,
    CardFooter,
    Form,
    FormGroup,
    Input,
    Label
} from 'reactstrap';
import * as Yup from 'yup';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY, ENCRYPTION_EXPORT_PASSWORD } from '../../Constants.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import Minizip from 'minizip-asm.js';
import { decryptFCData } from '../../CommonComponent/JavascriptCommonFunctions.js';
// Initial values for form fields
const initialValues = {
    programId: ''
}
// Localized entity name
const entityname = i18n.t('static.dashboard.exportprogram')
/**
 * Component for exporting the forecast program into zip.
 */
export default class ExportDataset extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            message: '',
            selectProgramMessage: '',
            loading: true,
            encryptCheck: true,
        }
        this.formSubmit = this.formSubmit.bind(this)
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }
    /**
     * Handles the change in the encrypt check state.
     * @param {Event} e - The change event.
     */
    setEncryptCheck(e) {
        var encryptCheck = e.target.checked;
        this.setState({
            encryptCheck: encryptCheck,
        })
    }
    /**
     * Reterives programs from indexed db on component mount
     */
    componentDidMount() {
        const lan = 'en'
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['datasetData'], 'readwrite');
            var program = transaction.objectStore('datasetData');
            var prgList = [];
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var json = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < json.length; i++) {
                    var bytes = CryptoJS.AES.decrypt(json[i].programName, SECRET_KEY);
                    var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                    var programJson = decryptFCData(json[i].programData);
                    if (json[i].userId == userId) {
                        prgList.push({ value: json[i].id, label: programJson.programCode + "~v" + json[i].version })
                    }
                }
            }.bind(this)
            transaction.oncomplete = function (event) {
                this.setState({
                    programList: prgList.sort(function (a, b) {
                        a = a.label.toLowerCase();
                        b = b.label.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }),
                    loading: false
                })
            }.bind(this)
        }.bind(this)
    }
    /**
     * Handles form submission, processing data from indexedDB and generating a downloadable zip file.
     */
    formSubmit() {
        this.setState({ loading: true });
        const mz = new Minizip();
        var programId = this.state.programId;
        if (programId != "" && programId != undefined) {
            this.setState({
                selectProgramMessage: ""
            })
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['datasetData'], 'readwrite');
                var program = transaction.objectStore('datasetData');
                var getRequest = program.getAll();
                getRequest.onerror = function (event) {
                };
                getRequest.onsuccess = function (event) {
                    var myResult = [];
                    myResult = getRequest.result;
                    var programQPLDetailsTransaction1 = db1.transaction(['datasetDetails'], 'readwrite');
                    var programQPLDetailsOs1 = programQPLDetailsTransaction1.objectStore('datasetDetails');
                    var programQPLDetailsGetRequest = programQPLDetailsOs1.getAll();
                    programQPLDetailsGetRequest.onsuccess = function (event) {
                        var programQPLResult = [];
                        programQPLResult = programQPLDetailsGetRequest.result;
                        var countryTransaction = db1.transaction(['country'], 'readwrite');
                        var countryOs = countryTransaction.objectStore('country');
                        var countryRequest = countryOs.getAll();
                        countryRequest.onsuccess = function (event) {
                            var countryList = [];
                            countryList = countryRequest.result;
                            var forecastingUnitTransaction = db1.transaction(['forecastingUnit'], 'readwrite');
                            var forecastingUnitOs = forecastingUnitTransaction.objectStore('forecastingUnit');
                            var forecastingUnitRequest = forecastingUnitOs.getAll();
                            forecastingUnitRequest.onsuccess = function (event) {
                                var forecastingUnitList = [];
                                forecastingUnitList = forecastingUnitRequest.result;
                                var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                                var planningUnitOs = planningUnitTransaction.objectStore('planningUnit');
                                var planningUnitRequest = planningUnitOs.getAll();
                                planningUnitRequest.onsuccess = function (event) {
                                    var planningUnitList = [];
                                    planningUnitList = planningUnitRequest.result;
                                    var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                                    var procurementUnitOs = procurementUnitTransaction.objectStore('procurementUnit');
                                    var procurementUnitRequest = procurementUnitOs.getAll();
                                    procurementUnitRequest.onsuccess = function (event) {
                                        var procurementUnitList = [];
                                        procurementUnitList = procurementUnitRequest.result;
                                        var realmCountryTransaction = db1.transaction(['realmCountry'], 'readwrite');
                                        var realmCountryOs = realmCountryTransaction.objectStore('realmCountry');
                                        var realmCountryRequest = realmCountryOs.getAll();
                                        realmCountryRequest.onsuccess = function (event) {
                                            var realmCountryList = [];
                                            realmCountryList = realmCountryRequest.result;
                                            var realmCountryPlanningUnitTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                                            var realmCountryPlanningUnitOs = realmCountryPlanningUnitTransaction.objectStore('realmCountryPlanningUnit');
                                            var realmCountryPlanningUnitRequest = realmCountryPlanningUnitOs.getAll();
                                            realmCountryPlanningUnitRequest.onsuccess = function (event) {
                                                var realmCountryPlanningUnitList = [];
                                                realmCountryPlanningUnitList = realmCountryPlanningUnitRequest.result;
                                                var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                                                var procurementAgentPlanningUnitOs = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                                                var procurementAgentPlanningUnitRequest = procurementAgentPlanningUnitOs.getAll();
                                                procurementAgentPlanningUnitRequest.onsuccess = function (event) {
                                                    var procurementAgentPlanningUnitList = [];
                                                    procurementAgentPlanningUnitList = procurementAgentPlanningUnitRequest.result;
                                                    var procurementAgentProcurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                                                    var procurementAgentProcurementUnitOs = procurementAgentProcurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                                                    var procurementAgentProcurementUnitRequest = procurementAgentProcurementUnitOs.getAll();
                                                    procurementAgentProcurementUnitRequest.onsuccess = function (event) {
                                                        var procurementAgentProcurementUnitList = [];
                                                        procurementAgentProcurementUnitList = procurementAgentProcurementUnitRequest.result;
                                                        var programTransaction = db1.transaction(['program'], 'readwrite');
                                                        var programOs = programTransaction.objectStore('program');
                                                        var programRequest = programOs.getAll();
                                                        programRequest.onsuccess = function (event) {
                                                            var programList = [];
                                                            programList = programRequest.result;
                                                            var programPlanningUnitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                                                            var programPlanningUnitOs = programPlanningUnitTransaction.objectStore('programPlanningUnit');
                                                            var programPlanningUnitRequest = programPlanningUnitOs.getAll();
                                                            programPlanningUnitRequest.onsuccess = function (event) {
                                                                var programPlanningUnitList = [];
                                                                programPlanningUnitList = programPlanningUnitRequest.result;
                                                                var regionTransaction = db1.transaction(['region'], 'readwrite');
                                                                var regionOs = regionTransaction.objectStore('region');
                                                                var regionRequest = regionOs.getAll();
                                                                regionRequest.onsuccess = function (event) {
                                                                    var regionList = [];
                                                                    regionList = regionRequest.result;
                                                                    var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                                                    var budgetOs = budgetTransaction.objectStore('budget');
                                                                    var budgetRequest = budgetOs.getAll();
                                                                    budgetRequest.onsuccess = function (event) {
                                                                        var budgetList = [];
                                                                        budgetList = budgetRequest.result;
                                                                        var usageTemplateTransaction = db1.transaction(['usageTemplate'], 'readwrite');
                                                                        var usageTemplateOs = usageTemplateTransaction.objectStore('usageTemplate');
                                                                        var usageTemplateRequest = usageTemplateOs.getAll();
                                                                        usageTemplateRequest.onsuccess = function (event) {
                                                                            var usageTemplateList = [];
                                                                            usageTemplateList = usageTemplateRequest.result;
                                                                            var equivalencyUnitTransaction = db1.transaction(['equivalencyUnit'], 'readwrite');
                                                                            var equivalencyUnitOs = equivalencyUnitTransaction.objectStore('equivalencyUnit');
                                                                            var equivalencyUnitRequest = equivalencyUnitOs.getAll();
                                                                            equivalencyUnitRequest.onsuccess = function (event) {
                                                                                var equivalencyUnitList = [];
                                                                                equivalencyUnitList = equivalencyUnitRequest.result;
                                                                                var isUnEncrepted = false;
                                                                                var checkboxValue = document.getElementById('isExportData').checked;
                                                                                if (checkboxValue) {
                                                                                    isUnEncrepted = true;
                                                                                } else {
                                                                                    isUnEncrepted = false;
                                                                                }
                                                                                for (var i = 0; i < myResult.length; i++) {
                                                                                    for (var j = 0; j < programId.length; j++) {
                                                                                        if (myResult[i].id == programId[j].value) {
                                                                                            myResult[i].countryList = countryList;
                                                                                            myResult[i].forecastingUnitList = forecastingUnitList;
                                                                                            myResult[i].planningUnitList = planningUnitList;
                                                                                            myResult[i].procurementUnitList = procurementUnitList;
                                                                                            myResult[i].realmCountryList = realmCountryList;
                                                                                            myResult[i].realmCountryPlanningUnitList = realmCountryPlanningUnitList;
                                                                                            myResult[i].procurementAgentPlanningUnitList = procurementAgentPlanningUnitList;
                                                                                            myResult[i].procurementAgentProcurementUnitList = procurementAgentProcurementUnitList;
                                                                                            myResult[i].programList = programList;
                                                                                            myResult[i].programPlanningUnitList = programPlanningUnitList;
                                                                                            myResult[i].regionList = regionList;
                                                                                            myResult[i].budgetList = budgetList;
                                                                                            myResult[i].usageTemplateList = usageTemplateList;
                                                                                            myResult[i].equivalencyUnitList = equivalencyUnitList;
                                                                                            var programQPLResultFiltered = programQPLResult.filter(c => c.id == programId[j].value)[0];
                                                                                            if (programQPLResultFiltered != undefined) {
                                                                                                myResult[i].changed = programQPLResultFiltered.changed;
                                                                                                myResult[i].readonly = programQPLResultFiltered.readonly;
                                                                                            } else {
                                                                                                myResult[i].changed = 1;
                                                                                                myResult[i].readonly = 0;
                                                                                            }
                                                                                            if (isUnEncrepted) {
                                                                                                var programJson1 = decryptFCData(myResult[i].programData);
                                                                                                myResult[i].programData = programJson1;
                                                                                                var txt = JSON.stringify(myResult[i]);
                                                                                                var txt1 = "";
                                                                                                var labelName = (programId[j].label).replaceAll("/", "-")
                                                                                                mz.append(labelName + "_" + parseInt(j + 1) + ".txt", txt + "@~-~@" + txt1, { password: ENCRYPTION_EXPORT_PASSWORD });
                                                                                            } else {
                                                                                                var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                                                                                                var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                                                                                                var programNameLabel1 = JSON.parse(programNameLabel);
                                                                                                var programJson1 = decryptFCData(myResult[i].programData);
                                                                                                myResult[i].programName = programNameLabel1;
                                                                                                myResult[i].programData = programJson1;
                                                                                                var txt = JSON.stringify(myResult[i]);
                                                                                                var txt1 = ""
                                                                                                var labelName = (programId[j].label).replaceAll("/", "-")
                                                                                                mz.append(labelName + "_" + parseInt(j + 1) + ".txt", txt);
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    if (i == myResult.length - 1) {
                                                                                        const zipBlob = new Blob([mz.zip()], { type: "application/zip" });
                                                                                        const link = document.createElement('a');
                                                                                        link.href = URL.createObjectURL(zipBlob);
                                                                                        link.download = 'download.zip';
                                                                                        document.body.appendChild(link);
                                                                                        link.click();
                                                                                        document.body.removeChild(link);
                                                                                        let id = AuthenticationService.displayDashboardBasedOnRole();
                                                                                        this.setState({ loading: false });
                                                                                        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.program.dataexportsuccess'))
                                                                                    }
                                                                                }
                                                                            }.bind(this)
                                                                        }.bind(this)
                                                                    }.bind(this)
                                                                }.bind(this)
                                                            }.bind(this)
                                                        }.bind(this)
                                                    }.bind(this)
                                                }.bind(this)
                                            }.bind(this)
                                        }.bind(this)
                                    }.bind(this)
                                }.bind(this)
                            }.bind(this);
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                selectProgramMessage: i18n.t('static.program.validselectprogramtext')
            })
            this.setState({ loading: false });
        }
    }
    /**
     * Updates the field data and sets the program ID in the component state.
     * @param {string} value - The value to be set as the program ID.
     */
    updateFieldData(value) {
        if (value != "" && value != undefined) {
            this.setState({
                selectProgramMessage: ""
            })
        } else {
            this.setState({
                selectProgramMessage: i18n.t('static.program.validselectprogramtext')
            })
        }
        this.setState({ programId: value });
    }
    /**
     * Renders the export forecast program screen.
     * @returns {JSX.Element} - Export forecast Program screen.
     */
    render() {
        return (
            <div className="animated fadeIn">
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
                                        <FormGroup className="col-md-4" >
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
                                            <span className="red">{this.state.selectProgramMessage}</span>
                                        </FormGroup>
                                    </CardBody>
                                    <FormGroup className="col-md-3" id="hideCalculationDiv">
                                        <div className="controls pl-lg-4 pt-lg-0">
                                            <Input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="isExportData"
                                                name="isExportData"
                                                style={{ marginTop: '3' }}
                                                checked={this.state.encryptCheck}
                                                onClick={(e) => { this.setEncryptCheck(e); }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-radio2" style={{ fontSize: '12px' }}>
                                                {i18n.t('static.common.encryptData')}
                                            </Label>
                                        </div>
                                    </FormGroup>
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
                                            <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.formSubmit()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                            &nbsp;
                                        </FormGroup>
                                    </CardFooter>
                                </Form>
                            )} />
                </Card>
            </div>
        )
    }
    /**
     * Redirects to the application dashboard screen when cancel button is clicked.
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the export details when reset button is clicked.
     */
    resetClicked() {
        this.state.programId = '';
        this.setState({ programId: '' });
    }
}