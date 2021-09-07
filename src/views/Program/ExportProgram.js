import React, { Component } from 'react';
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form
    , FormFeedback
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import getLabelText from '../../CommonComponent/getLabelText.js';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js'
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import i18n from '../../i18n';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import AuthenticationService from '../Common/AuthenticationService';

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


const entityname = i18n.t('static.dashboard.exportprogram')
export default class ExportProgram extends Component {

    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            message: '',
            selectProgramMessage: '',
            loading: true,
        }
        this.formSubmit = this.formSubmit.bind(this)
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }

    componentDidMount() {
        const lan = 'en'
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            console.log("in success");
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var prgList = [];
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                console.log("in success")
                var json = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < json.length; i++) {
                    var bytes = CryptoJS.AES.decrypt(json[i].programName, SECRET_KEY);
                    var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                    console.log("ProgramNameLabel", programNameLabel);
                    var bytes1 = CryptoJS.AES.decrypt(json[i].programData.generalData, SECRET_KEY);
                    var programData = bytes1.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    if (json[i].userId == userId) {
                        if (programNameLabel != "") {
                            prgList.push({ value: json[i].id, label: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + json[i].version })
                        } else {
                            prgList.push({ value: json[i].id, label: programJson.programCode + "~v" + json[i].version })
                        }
                    }
                }
            }.bind(this)
            transaction.oncomplete = function (event) {
                console.log("ProgramList", prgList)
                this.setState({
                    programList: prgList.sort(function (a, b) {
                        a = a.label.toLowerCase();
                        b = b.label.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    }),
                    loading: false
                })
                console.log("ProgramList", this.state.programList);
            }.bind(this)
        }.bind(this)
    }

    formSubmit() {
        this.setState({ loading: true });
        var zip = new JSZip();
        var programId = this.state.programId;
        console.log("ProgramId", programId)
        if (programId != "" && programId != undefined) {
            this.setState({
                selectProgramMessage: ""
            })
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var program = transaction.objectStore('programData');
                var getRequest = program.getAll();
                getRequest.onerror = function (event) {
                    // Handle errors!
                };
                getRequest.onsuccess = function (event) {
                    var myResult = [];
                    myResult = getRequest.result;
                    var dTransaction = db1.transaction(['downloadedProgramData'], 'readwrite');
                    var dProgram = dTransaction.objectStore('downloadedProgramData');
                    var dGetRequest = dProgram.getAll();
                    dGetRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    dGetRequest.onsuccess = function (event) {
                        var programQPLDetailsTransaction1 = db1.transaction(['programQPLDetails'], 'readwrite');
                        var programQPLDetailsOs1 = programQPLDetailsTransaction1.objectStore('programQPLDetails');
                        var programQPLDetailsGetRequest = programQPLDetailsOs1.getAll();
                        programQPLDetailsGetRequest.onsuccess = function (event) {
                            var programQPLResult = [];
                            programQPLResult = programQPLDetailsGetRequest.result;
                            var dMyResult = [];
                            dMyResult = dGetRequest.result;
                            var countryTransaction = db1.transaction(['country'], 'readwrite');
                            var countryOs = countryTransaction.objectStore('country');
                            var countryRequest = countryOs.getAll();
                            countryRequest.onsuccess = function (event) {
                                var countryList = [];
                                countryList = countryRequest.result;
                                console.log("Country List--------------->", countryList);
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
                                                                                        var programQPLResultFiltered = programQPLResult.filter(c => c.id == programId[j].value)[0];
                                                                                        myResult[i].programModified = programQPLResultFiltered.programModified;
                                                                                        myResult[i].openCount = programQPLResultFiltered.openCount;
                                                                                        myResult[i].addressedCount = programQPLResultFiltered.addressedCount;

                                                                                        var txt = JSON.stringify(myResult[i]);
                                                                                        var dArray = dMyResult.filter(c => c.id == programId[j].value)[0];
                                                                                        var txt1 = JSON.stringify(dArray)
                                                                                        // var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                                                                                        // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                                                                        var labelName = (programId[j].label).replaceAll("/", "-")
                                                                                        // zip.file(labelName + "_" + parseInt(j + 1) + ".txt", programData);
                                                                                        console.log("Txt ", txt);
                                                                                        console.log("Txt 1", txt1);
                                                                                        zip.file(labelName + "_" + parseInt(j + 1) + ".txt", txt + "@~-~@" + txt1);
                                                                                    }
                                                                                }
                                                                                if (i == myResult.length - 1) {
                                                                                    zip.generateAsync({
                                                                                        type: "blob"
                                                                                    }).then(function (content) {
                                                                                        FileSaver.saveAs(content, "download.zip");
                                                                                        let id = AuthenticationService.displayDashboardBasedOnRole();
                                                                                        this.setState({ loading: false });
                                                                                        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.program.dataexportsuccess'))

                                                                                    }.bind(this));
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
        } else {
            console.log("in ekse")
            this.setState({
                selectProgramMessage: i18n.t('static.program.validselectprogramtext')
            })
            this.setState({ loading: false });
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
        if (value != "" && value != undefined) {
            this.setState({
                selectProgramMessage: ""
            })
        } else {
            this.setState({
                selectProgramMessage: i18n.t('static.program.validselectprogramtext')
            })
        }
        console.log("Value", value);
        // console.log(event.value)
        this.setState({ programId: value });
    }

    render() {
        return (
            <div className="animated fadeIn">
                {/* <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5> */}
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
                                    {/* <CardHeader>
                                            <strong>{i18n.t('static.program.export')}</strong>
                                        </CardHeader> */}
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

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        this.state.programId = '';
        // this.setState({ programId }, () => { });
        this.setState({ programId: '' });
    }

}