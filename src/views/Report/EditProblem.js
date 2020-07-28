import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, Input, InputGroupAddon, InputGroupText, Label, Row, FormFeedback } from 'reactstrap';
import * as Yup from 'yup';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import moment from "moment";
// import * as myConst from '../../Labels.js';
import getLabelText from '../../CommonComponent/getLabelText';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import "jspdf-autotable";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import '../Forms/ValidationForms/ValidationForms.css';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import DatePicker from 'react-datepicker';
import '../../../node_modules/react-datepicker/dist/react-datepicker.css';
import { DATE_FORMAT_SM, DATE_PLACEHOLDER_TEXT } from '../../Constants.js';


let initialValues = {
    problemStatusId: '',
    notes: ''
}
const entityname = i18n.t('static.report.problem');
const validationSchema = function (values) {
    return Yup.object().shape({

        problemStatusId: Yup.string()
            .required(i18n.t('static.report.selectProblemStatus')),

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
            // language: this.props.location.state.language,
            // language: {
            //     languageName: ''
            // },
            problemStatusId: '',
            notes: '',
            message: '',
            data: [],
            problemReport: {
                "problemReportId": '',
                "program": {
                    "id": '',
                    "label": {
                        "active": true,
                        "labelId": '',
                        "label_en": "",
                        "label_sp": "",
                        "label_fr": "",
                        "label_pr": ""
                    },
                    "code": ""
                },
                "versionId": '',
                "realmProblem": {
                    "active": true,
                    "realmProblemId": '',
                    "realm": {
                        "id": '',
                        "label": {
                            "active": true,
                            "labelId": '',
                            "label_en": "",
                            "label_sp": "",
                            "label_fr": "",
                            "label_pr": ""
                        },
                        "code": ""
                    },
                    "problem": {
                        "active": true,
                        "problemId": '',
                        "label": {
                            "active": true,
                            "labelId": '',
                            "label_en": "",
                            "label_sp": null,
                            "label_fr": null,
                            "label_pr": null
                        },
                        "actionUrl": ""
                    },
                    "criticality": {
                        "id": '',
                        "label": {
                            "active": true,
                            "labelId": '',
                            "label_en": "",
                            "label_sp": null,
                            "label_fr": null,
                            "label_pr": null
                        },
                        "colorHtmlCode": ""
                    },
                    "data1": "",
                    "data2": null,
                    "data3": null
                },
                "data1": "",
                "data2": "",
                "data3": "",
                "data4": "",
                "data5": "",
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
                "problemType": {
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
                "createdBy": {
                    "userId": '',
                    "username": ""
                },
                "createdDate": "",
                "lastModifiedBy": {
                    "userId": '',
                    "username": ""
                },
                "lastModifiedDate": "",
                "problemTransList": [
                    {
                        "problemReportTransId": '',
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
                            "userId": '',
                            "username": ""
                        },
                        "createdDate": ""
                    },
                    {
                        "problemReportTransId": '',
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
                            "userId": '',
                            "username": ""
                        },
                        "createdDate": ""
                    }
                ]
            }

        }

        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getProblemStatusById = this.getProblemStatusById.bind(this);
    }
    changeMessage(message) {
        this.setState({ message: message })
    }

    dataChange(event) {

        if (event.target.name === "problemStatusId") {
            let problemStatusId = event.target.value;

            this.setState(
                {
                    problemStatusId: problemStatusId,
                },
                () => {
                    this.getProblemStatusById(problemStatusId);
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
        }, 8000);
    }

    getProblemStatusById(problemStatusId) {
        var problemStatusObject = {};
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;

            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(this.state.programId);

            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);

                var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
                var problemStatusRequest = problemStatusOs.getAll();


                problemStatusRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = problemStatusRequest.result;
                    for (var i = 0; i < myResult.length; i++) {
                        if (myResult[i].id == problemStatusId) {
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
                            console.log("problemStatusObject------>", this.state.problemStatusObject)
                        });

                }.bind(this);
            }.bind(this);
        }.bind(this);

    }
    touchAll(setTouched, errors) {
        setTouched({
            problemStatusId: true,
            // languageCode: true
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
        AuthenticationService.setupAxiosInterceptors();
        let problemReportId = this.props.match.params.problemReportId;
        // let programId = this.props.match.params.programId;

        let programId = '3_v2_uId_1';
        this.setState({
            programId: programId,
            problemReportId: problemReportId
        })

        console.log("programId----->", programId);
        console.log("programId param ----->", this.props.match.params.programId);

        const lan = 'en';
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
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

                console.log("EDIT problemReportList---->", problemReportList);

                const problemReport = problemReportList.filter(c => c.problemReportId == problemReportId)[0];
                console.log("problemReport--->", problemReport);
                this.setState({
                    problemReport: problemReport,
                    data: problemReport.problemTransList
                },
                    () => {

                    });


            }.bind(this)
        }.bind(this)

    }


    render() {
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const lan = 'en';

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
                dataField: 'createdBy.username',
                text: i18n.t('static.report.createdBy'),
                sort: true,
                align: 'center',
                style: { width: '80px' },
                headerAlign: 'center',
            },
            {
                dataField: 'createdDate',
                text: i18n.t('static.report.createdDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { width: '80px' },
                formatter: (cell, row) => {
                    return new moment(cell).format('yyyy-MM-DD');
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
                text: '10', value: 10
            }, {
                text: '30', value: 30
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
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                // enableReinitialize={true}
                                // initialValues={{
                                //     languageName: this.state.language.languageName,
                                //     languageCode: this.state.language.languageCode
                                // }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();

                                    var db1;
                                    var storeOS;
                                    getDatabase();
                                    var openRequest = indexedDB.open('fasp', 1);
                                    openRequest.onerror = function (event) {
                                        this.setState({
                                            message: i18n.t('static.program.errortext'),
                                            color: 'red'
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

                                            // var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                                            // var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
                                            // var problemStatusRequest = problemStatusOs.getAll();
                                            // let problemStatusObject = {};

                                            // problemStatusRequest.onsuccess = function (e) {
                                            //     var myResult = [];
                                            //     myResult = problemStatusRequest.result;
                                            //     for (var i = 0; i < myResult.length; i++) {
                                            //         if (myResult[i].id == this.state.problemStatusId) {
                                            //             problemStatusObject = {
                                            //                 "id": myResult[i].id,
                                            //                 "label": myResult[i].label
                                            //             }
                                            //         }
                                            //     }


                                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                            var userId = userBytes.toString(CryptoJS.enc.Utf8);

                                            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                            let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                                            let username = decryptedUser.username;


                                            let otherProblemReport = problemReportList.filter(c => c.problemReportId != this.state.problemReportId);

                                            let filterObj = problemReportList.filter(c => c.problemReportId == this.state.problemReportId)[0];

                                            // var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                            // var userId = userBytes.toString(CryptoJS.enc.Utf8);

                                            filterObj.lastModifiedBy = { userId: userId, username: username }
                                            filterObj.lastModifiedDate = moment();

                                            let tempProblemTransList = filterObj.problemTransList;

                                            let tempProblemTransObj = {
                                                "problemReportTransId": '',
                                                "problemStatus": this.state.problemStatusObject,
                                                "notes": this.state.notes,
                                                "createdBy": {
                                                    "userId": userId,
                                                    "username": username
                                                },
                                                "createdDate": moment()
                                            }

                                            tempProblemTransList.push(tempProblemTransObj);

                                            filterObj.problemTransList = tempProblemTransList;


                                            otherProblemReport.push(filterObj);
                                            programJson.problemReportList = otherProblemReport;
                                            programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                            var putRequest = programTransaction.put(programRequest.result);

                                            putRequest.onerror = function (event) {
                                                this.setState({
                                                    message: i18n.t('static.program.errortext'),
                                                    color: 'red'
                                                })
                                            };

                                            putRequest.onsuccess = function (event) {
                                                this.setState({
                                                    // message: 'static.message.consumptionSaved',
                                                    changedFlag: 0,
                                                    color: 'green'
                                                })

                                                this.props.history.push(`/report/problemList/` + i18n.t('static.message.consumptionSuccess'));
                                            }.bind(this)

                                            // }.bind(this);
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
                                            <Form onSubmit={handleSubmit} noValidate name='languageForm'>
                                                <CardBody className="pb-0">
                                                    <FormGroup>
                                                        <Label for="programCode">{i18n.t('static.program.programCode')}</Label>
                                                        <Input type="text"
                                                            name="programCode"
                                                            id="programCode"
                                                            bsSize="sm"
                                                            readOnly
                                                            valid={!errors.programCode}
                                                            invalid={(touched.programCode && !!errors.programCode)}
                                                            onChange={(e) => { handleChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.problemReport.program.code}
                                                            required />
                                                        <FormFeedback className="red">{errors.programCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
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

                                                    <FormGroup>
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
                                                            value={moment(this.state.problemReport.createdDate).format('yyyy-MM-DD')}
                                                            // selected={new moment(this.state.problemReport.createdDate)}
                                                            className="form-control-sm form-control date-color"
                                                        />
                                                        <FormFeedback className="red">{errors.createdDate}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="problemDescription">{i18n.t('static.report.problemDescription')}</Label>
                                                        <Input type="text"
                                                            name="problemDescription"
                                                            id="problemDescription"
                                                            bsSize="sm"
                                                            readOnly
                                                            valid={!errors.problemDescription}
                                                            invalid={(touched.problemDescription && !!errors.problemDescription)}
                                                            onChange={(e) => { handleChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={getLabelText(this.state.problemReport.realmProblem.problem.label, this.state.lang)}
                                                            required />
                                                        <FormFeedback className="red">{errors.problemDescription}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
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
                                                            value={this.state.problemReport.problemStatus.label}
                                                            value={getLabelText(this.state.problemReport.problemStatus.label, this.state.lang)}
                                                            required />
                                                        <FormFeedback className="red">{errors.problemDescription}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
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

                                                    <FormGroup>
                                                        <Label for="action">{i18n.t('static.common.action')}</Label>
                                                        <Input type="text"
                                                            name="action"
                                                            id="action"
                                                            bsSize="sm"
                                                            readOnly
                                                            valid={!errors.action}
                                                            invalid={(touched.action && !!errors.action)}
                                                            onChange={(e) => { handleChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.problemReport.realmProblem.problem.actionUrl}
                                                            required />
                                                        <FormFeedback className="red">{errors.action}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
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

                                                                <div className="TableCust">
                                                                    <div className="col-md-3 pr-0 offset-md-9 text-right mob-Left">
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
                                                            )
                                                        }
                                                    </ToolkitProvider>



                                                    <FormGroup>
                                                        <Label htmlFor="action">Problem Status<span class="red Reqasterisk">*</span></Label>

                                                        <Input type="select"
                                                            bsSize="sm"
                                                            name="problemStatusId" id="problemStatusId"
                                                            valid={!errors.problemStatusId && this.state.problemStatusId != ''}
                                                            invalid={(touched.problemStatusId && !!errors.problemStatusId)}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.problemStatusId}
                                                        >
                                                            <option value="">Please select</option>
                                                            <option value="1">Open</option>
                                                            <option value="2">Closed</option>
                                                            <option value="3">Received</option>
                                                        </Input>
                                                        <FormFeedback className="red">{errors.problemStatusId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="notes">{i18n.t('static.program.notes')}</Label>
                                                        <Input type="text"
                                                            name="notes"
                                                            id="notes"
                                                            bsSize="sm"
                                                            valid={!errors.notes && this.state.notes != ''}
                                                            invalid={(touched.notes && !!errors.notes)}
                                                            onBlur={handleBlur}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.notes}
                                                        />
                                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                                    </FormGroup>

                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        {/* <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> Reset</Button> */}
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />
                        </Card>
                    </Col>
                </Row>

            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/ApplicationDashboard/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {

    }

}