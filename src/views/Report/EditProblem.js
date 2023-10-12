import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import '../../../node_modules/react-datepicker/dist/react-datepicker.css';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import getProblemDesc from '../../CommonComponent/getProblemDesc';
import getSuggestion from '../../CommonComponent/getSuggestion';
import { DATE_FORMAT_CAP, INDEXED_DB_NAME, INDEXED_DB_VERSION, SECRET_KEY } from '../../Constants.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
let initialValues = {
    problemStatusInputId: '',
    notes: ''
}
const entityname = i18n.t('static.report.problem');
const validationSchema = function (values) {
    return Yup.object().shape({
        problemStatusInputId: Yup.string()
            .required(i18n.t('static.report.selectProblemStatus')),
        needNotesValidation: Yup.boolean(),
        notes: Yup.string()
            .when("needNotesValidation", {
                is: val => {
                    return document.getElementById("needNotesValidation").value === "true";
                },
                then: Yup.string().required(i18n.t('static.program.validnotestext')),
                otherwise: Yup.string().notRequired()
            }),
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
export default class EditLanguageComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editable: true,
            loading: true,
            problemStatusInputId: '',
            problemActionIndex: '',
            problemStatusId: '',
            problemTypeId: '',
            notes: '',
            message: '',
            data: [],
            problemStatusList: [],
            problemReport: {
                "problemReportId": "",
                "program": {
                    "id": "",
                    "label": {
                        "active": true,
                        "labelId": "",
                        "label_en": "",
                        "label_sp": "",
                        "label_fr": "",
                        "label_pr": ""
                    },
                    "code": ""
                },
                "versionId": "",
                "realmProblem": {
                    "active": true,
                    "realmProblemId": "",
                    "realm": {
                        "id": "",
                        "label": {
                            "active": true,
                            "labelId": "",
                            "label_en": "",
                            "label_sp": "",
                            "label_fr": "",
                            "label_pr": ""
                        },
                        "code": ""
                    },
                    "problem": {
                        "active": true,
                        "problemId": "",
                        "label": {
                            "active": true,
                            "labelId": "",
                            "label_en": "",
                            "label_sp": null,
                            "label_fr": null,
                            "label_pr": null
                        },
                        "actionUrl": "",
                        "actionLabel": {
                            "active": true,
                            "labelId": "",
                            "label_en": "",
                            "label_sp": null,
                            "label_fr": null,
                            "label_pr": null
                        }
                    },
                    "criticality": {
                        "id": "",
                        "label": {
                            "active": true,
                            "labelId": "",
                            "label_en": "",
                            "label_sp": null,
                            "label_fr": null,
                            "label_pr": null
                        },
                        "colorHtmlCode": ""
                    },
                    "data1": "",
                    "data2": null,
                    "data3": null,
                    "problemId": ""
                },
                "dt": "",
                "region": {
                    "id": "",
                    "label": {
                        "active": true,
                        "labelId": "",
                        "label_en": "",
                        "label_sp": "",
                        "label_fr": "",
                        "label_pr": ""
                    }
                },
                "planningUnit": {
                    "id": "",
                    "label": {
                        "active": true,
                        "labelId": "",
                        "label_en": "",
                        "label_sp": null,
                        "label_fr": null,
                        "label_pr": null
                    }
                },
                "shipmentId": "",
                "data5": "",
                "problemStatus": {
                    "id": "",
                    "label": {
                        "active": true,
                        "labelId": "",
                        "label_en": "",
                        "label_sp": null,
                        "label_fr": null,
                        "label_pr": null
                    }
                },
                "problemType": {
                    "id": "",
                    "label": {
                        "label_en": ""
                    }
                },
                "createdBy": {
                    "userId": "",
                    "username": ""
                },
                "createdDate": "",
                "lastModifiedBy": {
                    "userId": "",
                    "username": ""
                },
                "lastModifiedDate": "",
                "problemTransList": [
                    {
                        "problemReportTransId": "",
                        "problemStatus": {
                            "id": "",
                            "label": {
                                "active": true,
                                "labelId": "",
                                "label_en": "",
                                "label_sp": null,
                                "label_fr": null,
                                "label_pr": null
                            }
                        },
                        "notes": "",
                        "createdBy": {
                            "userId": "",
                            "username": ""
                        },
                        "createdDate": ""
                    },
                    {
                        "problemReportTransId": "",
                        "problemStatus": {
                            "id": '',
                            "label": {
                                "active": true,
                                "labelId": '',
                                "label_en": "",
                                "label_sp": null,
                                "label_fr": null,
                                "label_pr": null
                            }
                        },
                        "notes": "",
                        "createdBy": {
                            "userId": "",
                            "username": ""
                        },
                        "createdDate": ""
                    }
                ]
            },
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getProblemStatusById = this.getProblemStatusById.bind(this);
        this.getProblemStatus = this.getProblemStatus.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.getNote = this.getNote.bind(this);
    }
    changeMessage(message) {
        this.setState({ message: message })
    }
    getNote(row, lang) {
        var transList = row.problemTransList.filter(c => c.reviewed == false);
        var listLength = transList.length;
        return transList[listLength - 1].notes;
    }
    Capitalize(str) {
        var notes = str.charAt(0).toUpperCase() + str.slice(1)
        this.setState({ notes: notes });
    }
    dataChange(event) {
        let { problemReport } = this.state;
        if (event.target.name === "problemStatusInputId") {
            let problemStatusInputId = event.target.value;
            problemReport.problemStatus.id = event.target.value;
            this.setState(
                {
                    problemReport: problemReport,
                    problemStatusInputId: problemStatusInputId,
                },
                () => {
                    this.getProblemStatusById(problemStatusInputId);
                });
        }
        if (event.target.name === "notes") {
            let notes = event.target.value;
            this.setState(
                {
                    notes: notes
                })
        }
    };
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    getProblemStatusById(problemStatusInputId) {
        var problemStatusObject = {};
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(this.state.programId);
            programRequest.onsuccess = function (event) {
                var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
                var problemStatusRequest = problemStatusOs.getAll();
                problemStatusRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = problemStatusRequest.result;
                    for (var i = 0; i < myResult.length; i++) {
                        if (myResult[i].id == problemStatusInputId) {
                            problemStatusObject = {
                                "id": myResult[i].id,
                                "label": myResult[i].label
                            }
                        }
                    }
                    this.setState(
                        {
                            problemStatusObject: problemStatusObject
                        },
                        () => {
                        });
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }
    getProblemStatus() {
        var db1;
        const lan = 'en';
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(this.state.programId);
            programRequest.onsuccess = function (event) {
                var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
                var problemStatusRequest = problemStatusOs.getAll();
                problemStatusRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = problemStatusRequest.result;
                    var proList = []
                    for (var i = 0; i < myResult.length; i++) {
                        var Json = {
                            name: getLabelText(myResult[i].label, lan),
                            id: myResult[i].id
                        }
                        proList[i] = Json
                    }
                    this.setState({
                        problemStatusList: proList
                    })
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }
    touchAll(setTouched, errors) {
        setTouched({
            problemStatusInputId: true,
            notes: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('languageForm', (fieldName) => {
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
    componentDidMount() {
        this.getProblemStatus();
        this.getProblemStatusById(this.props.match.params.problemStatusId);
        let problemReportId = this.props.match.params.problemReportId;
        let programId = this.props.match.params.programId;
        let problemActionIndex = this.props.match.params.index;
        let problemStatusId = this.props.match.params.problemStatusId;
        let problemTypeId = this.props.match.params.problemTypeId;
        programId = programId.trim();
        this.setState({
            programId: programId,
            problemReportId: problemReportId,
            problemActionIndex: problemActionIndex,
            problemStatusId: problemStatusId,
            problemTypeId: problemTypeId,
            editable: problemStatusId == 4 || problemStatusId == 2 ? false : true
        })
        if (programId != null) {
            const lan = 'en';
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');
                var programRequest = programTransaction.get(programId);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var problemReportList = (programJson.problemReportList);
                    if (problemReportId != 0) {
                        const problemReport = problemReportList.filter(c => c.problemReportId == problemReportId)[0];
                        this.setState({
                            problemReport: problemReport,
                            data: problemReport.problemTransList,
                            notes: this.getNote(problemReport),
                            loading: false
                        },
                            () => {
                            });
                    } else {
                        const problemReport = problemReportList.filter(c => c.problemActionIndex == problemActionIndex)[0];
                        this.setState({
                            problemReport: problemReport,
                            data: problemReport.problemTransList,
                            notes: this.getNote(problemReport),
                            loading: false
                        },
                            () => {
                            });
                    }
                    var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                    var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
                    var problemStatusRequest = problemStatusOs.getAll();
                    problemStatusRequest.onerror = function (event) {
                    };
                    problemStatusRequest.onsuccess = function (e) {
                        var myResult = [];
                        myResult = problemStatusRequest.result;
                        myResult = myResult.filter(c => c.userManaged == true);
                        var hasRole = false;
                        AuthenticationService.getLoggedInUserRole().map(c => {
                            if (c.roleId == 'ROLE_SUPPLY_PLAN_REVIEWER') {
                                hasRole = true;
                            }
                        });
                        var proList = []
                        for (var i = 0; i < myResult.length; i++) {
                            var Json = {
                                name: getLabelText(myResult[i].label, lan),
                                id: myResult[i].id
                            }
                            proList[i] = Json
                        }
                        this.setState({
                            problemStatusList: hasRole == true ? proList : proList.filter(c => c.id != 2)
                        })
                    }.bind(this);
                }.bind(this)
            }.bind(this)
        }
    }
    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const lan = 'en';
        const { problemStatusList } = this.state;
        let problemStatus = problemStatusList.length > 0
            && problemStatusList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);
        const columns = [
            {
                dataField: 'problemStatus.label',
                text: i18n.t('static.report.problemStatus'),
                sort: true,
                align: 'center',
                style: { width: '80px' },
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return getLabelText(cell, this.state.lang);
                }
            },
            {
                dataField: 'notes',
                text: i18n.t('static.program.notes'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '170px' },
            },
            {
                dataField: 'reviewed',
                text: i18n.t('static.supplyPlanReview.review'),
                sort: true,
                align: 'center',
                style: { width: '80px' },
                headerAlign: 'center',
                formatter: (cell, row) => {
                    return cell == true ? i18n.t('static.program.yes') : i18n.t('static.program.no');
                }
            },
            {
                dataField: 'createdBy.username',
                text: i18n.t('static.report.lastmodifiedby'),
                sort: true,
                align: 'center',
                style: { width: '80px' },
                headerAlign: 'center',
            },
            {
                dataField: 'createdDate',
                text: i18n.t('static.report.lastmodifieddate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    return new moment(cell).format(DATE_FORMAT_CAP);
                }
            },
        ];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '15', value: 15
            }, {
                text: '25', value: 25
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.data.length
            }]
        }
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card className="EditproblemCard" style={{ display: this.state.loading ? "none" : "block" }}>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    problemStatusInputId: this.state.problemReport.problemStatus.id,
                                    notes: this.state.notes
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    var db1;
                                    var storeOS;
                                    getDatabase();
                                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                                    openRequest.onerror = function (event) {
                                        this.setState({
                                            message: i18n.t('static.program.errortext'),
                                            color: '#BA0C2F'
                                        })
                                    }.bind(this);
                                    openRequest.onsuccess = function (e) {
                                        db1 = e.target.result;
                                        var transaction = db1.transaction(['programData'], 'readwrite');
                                        var programTransaction = transaction.objectStore('programData');
                                        var programId = this.state.programId;
                                        var programRequest = programTransaction.get(programId);
                                        programRequest.onsuccess = function (event) {
                                            var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                            var programJson = JSON.parse(programData);
                                            var problemReportList = (programJson.problemReportList);
                                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                            var userId = userBytes.toString(CryptoJS.enc.Utf8);
                                            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                            let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                                            let username = decryptedUser.username;
                                            let otherProblemReport = [];
                                            let filterObj = {};
                                            if (this.state.problemReportId != 0) {
                                                otherProblemReport = problemReportList.filter(c => c.problemReportId != this.state.problemReportId);
                                                filterObj = problemReportList.filter(c => c.problemReportId == this.state.problemReportId)[0];
                                            } else {
                                                otherProblemReport = problemReportList.filter(c => c.problemActionIndex != this.state.problemActionIndex);
                                                filterObj = problemReportList.filter(c => c.problemActionIndex == this.state.problemActionIndex)[0];
                                            }
                                            var curDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
                                            filterObj.lastModifiedBy = { userId: userId, username: username }
                                            filterObj.lastModifiedDate = curDate;
                                            let tempProblemTransList = filterObj.problemTransList;
                                            let tempProblemTransObj = {
                                                "problemReportTransId": '',
                                                "problemStatus": this.state.problemStatusObject,
                                                "notes": this.state.notes,
                                                reviewed: false,
                                                "createdBy": {
                                                    "userId": userId,
                                                    "username": username
                                                },
                                                "createdDate": curDate
                                            }
                                            tempProblemTransList.push(tempProblemTransObj);
                                            filterObj.problemTransList = tempProblemTransList;
                                            filterObj.problemStatus = this.state.problemStatusObject;
                                            otherProblemReport.push(filterObj);
                                            programJson.problemReportList = otherProblemReport;
                                            programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                            var putRequest = programTransaction.put(programRequest.result);
                                            putRequest.onerror = function (event) {
                                                this.setState({
                                                    message: i18n.t('static.program.errortext'),
                                                    color: '#BA0C2F'
                                                })
                                            };
                                            putRequest.onsuccess = function (event) {
                                                this.setState({
                                                    changedFlag: 0,
                                                    color: 'green'
                                                })
                                                let programId = this.props.match.params.programId;
                                                this.props.history.push(`/report/problemList/` + programId + '/' + false + '/green/' + i18n.t('static.problem.updatedSuccessFully'));
                                            }.bind(this)
                                        }.bind(this);
                                    }.bind(this);
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
                                        setTouched
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='languageForm' autocomplete="off">
                                            <CardBody className="pb-0">
                                                <div className="col-md-12 bg-white pb-1  mb-2">
                                                    <ul class="navbar-nav"><li class="nav-item pl-0"><a aria-current="page" class="nav-link active" ><b >{i18n.t('static.report.problemDescription')}</b></a></li></ul>
                                                    <div className="row">
                                                        <FormGroup className="col-md-6 ">
                                                            <Label for="program">{i18n.t('static.program.program')}</Label>
                                                            <Input type="text"
                                                                name="program"
                                                                id="program"
                                                                bsSize="sm"
                                                                readOnly
                                                                valid={!errors.program}
                                                                invalid={(touched.program && !!errors.program)}
                                                                onChange={(e) => { handleChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={this.state.problemReport.program.code}
                                                                required />
                                                            <FormFeedback className="red">{errors.program}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6 ">
                                                            <Label for="planningunit">{i18n.t('static.planningunit.planningunit')}</Label>
                                                            <Input type="text"
                                                                name="planningunit"
                                                                id="planningunit"
                                                                bsSize="sm"
                                                                readOnly
                                                                valid={!errors.planningunit}
                                                                invalid={(touched.planningunit && !!errors.planningunit)}
                                                                onChange={(e) => { handleChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={getLabelText(this.state.problemReport.planningUnit.label, this.state.lang)}
                                                                required />
                                                            <FormFeedback className="red">{errors.program}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6 ">
                                                            <Label for="versionId">{i18n.t('static.program.versionId')}</Label>
                                                            <Input type="text"
                                                                name="versionId"
                                                                id="versionId"
                                                                bsSize="sm"
                                                                readOnly
                                                                valid={!errors.versionId}
                                                                invalid={(touched.versionId && !!errors.versionId)}
                                                                onChange={(e) => { handleChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={this.state.problemReport.versionId}
                                                                required />
                                                            <FormFeedback className="red">{errors.versionId}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6 ">
                                                            <Label for="createdDate">{i18n.t('static.report.createdDate')}</Label>
                                                            <Input type="text"
                                                                name="createdDate"
                                                                id="createdDate"
                                                                bsSize="sm"
                                                                readOnly
                                                                valid={!errors.createdDate}
                                                                invalid={(touched.createdDate && !!errors.createdDate)}
                                                                onChange={(e) => { handleChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={this.state.problemReport.createdDate != '' ? moment(this.state.problemReport.createdDate).format('yyyy-MM-DD') : ''}
                                                                className="form-control-sm form-control date-color"
                                                            />
                                                            <FormFeedback className="red">{errors.createdDate}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6 ">
                                                            <Label for="problemDescription">{i18n.t('static.report.problemDescription')}</Label>
                                                            <Input
                                                                type="textarea"
                                                                name="problemDescription"
                                                                id="problemDescription"
                                                                bsSize="sm"
                                                                readOnly
                                                                valid={!errors.problemDescription}
                                                                invalid={(touched.problemDescription && !!errors.problemDescription)}
                                                                onChange={(e) => { handleChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={getProblemDesc(this.state.problemReport, this.state.lang)}
                                                                required />
                                                            <FormFeedback className="red">{errors.problemDescription}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6 ">
                                                            <Label for="problemDescription">Suggestion</Label>
                                                            <Input
                                                                type="textarea"
                                                                name="problemSuggestion"
                                                                id="problemSuggestion"
                                                                bsSize="sm"
                                                                readOnly
                                                                valid={!errors.problemSuggestion}
                                                                invalid={(touched.problemSuggestion && !!errors.problemSuggestion)}
                                                                onChange={(e) => { handleChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={getSuggestion(this.state.problemReport, this.state.lang)}
                                                                required />
                                                            <FormFeedback className="red">{errors.problemSuggestion}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6 ">
                                                            <Label for="problemDescription">{i18n.t('static.report.problemStatus')}</Label>
                                                            <Input type="text"
                                                                name="problemDescription"
                                                                id="problemDescription"
                                                                bsSize="sm"
                                                                readOnly
                                                                valid={!errors.problemDescription}
                                                                invalid={(touched.problemDescription && !!errors.problemDescription)}
                                                                onChange={(e) => { handleChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={getLabelText(this.state.problemReport.problemStatus.label, this.state.lang)}
                                                                required />
                                                            <FormFeedback className="red">{errors.problemDescription}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6 ">
                                                            <Label for="problemType">{i18n.t('static.report.problemType')}</Label>
                                                            <Input type="text"
                                                                name="problemType"
                                                                id="problemType"
                                                                bsSize="sm"
                                                                readOnly
                                                                valid={!errors.problemType}
                                                                invalid={(touched.problemType && !!errors.problemType)}
                                                                onChange={(e) => { handleChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={getLabelText(this.state.problemReport.problemType.label, this.state.lang)}
                                                                required />
                                                            <FormFeedback className="red">{errors.problemType}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6 ">
                                                            <Label for="criticality">{i18n.t('static.report.Criticality')}</Label>
                                                            <Input type="text"
                                                                name="criticality"
                                                                id="criticality"
                                                                readOnly
                                                                bsSize="sm"
                                                                valid={!errors.criticality}
                                                                invalid={(touched.criticality && !!errors.criticality)}
                                                                onChange={(e) => { handleChange(e); }}
                                                                onBlur={handleBlur}
                                                                value={getLabelText(this.state.problemReport.realmProblem.criticality.label, this.state.lang)}
                                                                required />
                                                            <FormFeedback className="red">{errors.criticality}</FormFeedback>
                                                        </FormGroup>
                                                    </div>
                                                </div>
                                                <ToolkitProvider
                                                    keyField="problemReportId"
                                                    data={this.state.data}
                                                    columns={columns}
                                                    search={{ searchFormatted: true }}
                                                    hover
                                                    filter={filterFactory()}
                                                >
                                                    {
                                                        props => (
                                                            <div className="col-md-12 bg-white pb-1 mb-2">
                                                                <ul class="navbar-nav"><li class="nav-item pl-0"><a aria-current="page" class="nav-link active" ><b>{i18n.t('static.report.problemTransDetails')}</b></a></li></ul>
                                                                <div className="TableCust">
                                                                    <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
                                                                        <SearchBar {...props.searchProps} />
                                                                        <ClearSearchButton {...props.searchProps} />
                                                                    </div>
                                                                    <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                                                        pagination={paginationFactory(options)}
                                                                        rowEvents={{
                                                                            onClick: (e, row, rowIndex) => {
                                                                                this.editProblem(row);
                                                                            }
                                                                        }}
                                                                        {...props.baseProps}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </ToolkitProvider>
                                                {this.state.editable && <div className="col-md-12 bg-white pb-1">
                                                    <ul class="navbar-nav"><li class="nav-item pl-0"><a aria-current="page" class="nav-link active"><b>{i18n.t('static.report.updateDetails')}</b></a></li></ul>
                                                    <div className="row">
                                                        <FormGroup className="col-md-3 ">
                                                            <Label htmlFor="action">{i18n.t('static.report.problemStatus')}<span class="red Reqasterisk">*</span></Label>
                                                            <Input type="select"
                                                                bsSize="sm"
                                                                name="problemStatusInputId" id="problemStatusInputId"
                                                                valid={!errors.problemStatusInputId && this.state.problemStatusInputId != ''}
                                                                invalid={(touched.problemStatusInputId && !!errors.problemStatusInputId)}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required
                                                                value={this.state.problemReport.problemStatus.id}
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {problemStatus}
                                                            </Input>
                                                            <FormFeedback className="red">{errors.problemStatusInputId}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6 ">
                                                            <Label for="notes">{i18n.t('static.program.notes')}</Label>
                                                            <Input
                                                                type="textarea"
                                                                class="form-control"
                                                                rows="3"
                                                                name="notes"
                                                                id="notes"
                                                                bsSize="sm"
                                                                autocomplete="off"
                                                                valid={!errors.notes}
                                                                invalid={touched.notes && !!errors.notes || this.state.problemReport.problemStatus.id == 3 ? this.state.notes == '' : false}
                                                                onBlur={handleBlur}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                                required
                                                                value={this.state.notes}
                                                            />
                                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                                        </FormGroup>
                                                        <Input
                                                            type="hidden"
                                                            name="needNotesValidation"
                                                            id="needNotesValidation"
                                                            value={(this.state.problemReport.problemStatus.id == 3 ? true : false)}
                                                        />
                                                    </div>
                                                </div>
                                                }
                                                <div className="col-md-12 card-footer">
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        {this.state.editable && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>}
                                                        &nbsp;
                                                    </FormGroup>
                                                </div>
                                            </CardBody>
                                        </Form>
                                    )} />
                        </Card>
                    </Col>
                </Row>
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
        );
    }
    cancelClicked() {
        let programId = this.props.match.params.programId;
        this.props.history.push(`/report/problemList/` + programId + '/' + false + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked() {
    }
}