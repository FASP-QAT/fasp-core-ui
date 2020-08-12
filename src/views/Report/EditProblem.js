import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, Input, InputGroupAddon, InputGroupText, Label, Row, FormFeedback } from 'reactstrap';
import * as Yup from 'yup';
import CryptoJS from 'crypto-js';
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
    problemStatusInputId: '',
    notes: ''
}
const entityname = i18n.t('static.report.problem');
const validationSchema = function (values) {
    return Yup.object().shape({

        problemStatusInputId: Yup.string()
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
                    "programCode": ""
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
    }
    changeMessage(message) {
        this.setState({ message: message })
    }

    dataChange(event) {

        if (event.target.name === "problemStatusInputId") {
            let problemStatusInputId = event.target.value;

            this.setState(
                {
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
        }, 8000);
    }

    getProblemStatusById(problemStatusInputId) {
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
                            console.log("problemStatusObject------>", this.state.problemStatusObject)
                        });

                }.bind(this);
            }.bind(this);
        }.bind(this);

    }

    getProblemStatus() {

        var db1;
        const lan = 'en';
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
        // var bfList = AuthenticationService.getLoggedInUserRoleBusinessFunctionArray();
        // console.log("bfList#####====>", bfList);
        
        AuthenticationService.setupAxiosInterceptors();
        this.getProblemStatus();
        let problemReportId = this.props.match.params.problemReportId;
        let programId = this.props.match.params.programId;
        let problemActionIndex = this.props.match.params.index;
        let problemStatusId = this.props.match.params.problemStatusId;
        let problemTypeId = this.props.match.params.problemTypeId;

        programId = programId.trim();

        // console.log("programId1--*****--->", programId);

        // let programId = '3_v2_uId_1';
        this.setState({
            programId: programId,
            problemReportId: problemReportId,
            problemActionIndex: problemActionIndex,
            problemStatusId: problemStatusId,
            problemTypeId: problemTypeId
        })

        if (programId != null) {
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

                    // const problemReport = problemReportList.filter(c => c.problemReportId == problemReportId)[0];
                    if (problemReportId != 0) {
                        const problemReport = problemReportList.filter(c => c.problemReportId == problemReportId)[0];
                        console.log("problemReport--->", problemReport);
                        this.setState({
                            problemReport: problemReport,
                            data: problemReport.problemTransList
                        },
                            () => {

                            });
                    } else {
                        const problemReport = problemReportList.filter(c => c.problemActionIndex == problemActionIndex)[0];
                        console.log("problemReport--->", problemReport);
                        this.setState({
                            problemReport: problemReport,
                            data: problemReport.problemTransList
                        },
                            () => {

                            });
                    }


                    var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
                    var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
                    var problemStatusRequest = problemStatusOs.getAll();

                    problemStatusRequest.onerror = function (event) {
                        // Handle errors!
                    };
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


                }.bind(this)
            }.bind(this)
        }

    }


    render() {

        // const { problemStatusList } = this.state;
        // let problemStatus = problemStatusList.length > 0
        //     && problemStatusList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.id}>{item.name}</option>
        //         )
        //     }, this);


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
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card className="EditproblemCard">
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

                                            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                                            var userId = userBytes.toString(CryptoJS.enc.Utf8);

                                            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                            let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                                            let username = decryptedUser.username;




                                            // let otherProblemReport = problemReportList.filter(c => c.problemReportId != this.state.problemReportId);
                                            // let filterObj = problemReportList.filter(c => c.problemReportId == this.state.problemReportId)[0];
                                            let otherProblemReport = [];
                                            let filterObj = {};

                                            if (this.state.problemReportId != 0) {
                                                otherProblemReport = problemReportList.filter(c => c.problemReportId != this.state.problemReportId);
                                                filterObj = problemReportList.filter(c => c.problemReportId == this.state.problemReportId)[0];
                                            } else {
                                                otherProblemReport = problemReportList.filter(c => c.problemActionIndex != this.state.problemActionIndex);
                                                filterObj = problemReportList.filter(c => c.problemActionIndex == this.state.problemActionIndex)[0];

                                            }


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

                                            filterObj.problemStatus = this.state.problemStatusObject;


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
                                                    <div className="col-md-12 bg-white pb-1  mb-2">
                                                        <ul class="navbar-nav"><li class="nav-item pl-0"><a aria-current="page" class="nav-link active" ><b >Problem Details</b></a></li></ul>
                                                        <div className="row">
                                                            <FormGroup className="col-md-6 ">
                                                                <Label for="program">{i18n.t('static.program.programCode')}</Label>
                                                                <Input type="text"
                                                                    name="program"
                                                                    id="program"
                                                                    bsSize="sm"
                                                                    readOnly
                                                                    valid={!errors.program}
                                                                    invalid={(touched.program && !!errors.program)}
                                                                    onChange={(e) => { handleChange(e); }}
                                                                    onBlur={handleBlur}
                                                                    value={this.state.problemReport.program.programCode}
                                                                    // value={getLabelText(this.state.problemReport.program.label, this.state.lang)}
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
                                                                <Label for="month">{i18n.t('static.report.month')}</Label>
                                                                <Input type="text"
                                                                    name="month"
                                                                    id="month"
                                                                    bsSize="sm"
                                                                    readOnly
                                                                    valid={!errors.month}
                                                                    invalid={(touched.month && !!errors.month)}
                                                                    onChange={(e) => { handleChange(e); }}
                                                                    onBlur={handleBlur}
                                                                    value={this.state.problemReport.dt != '' ? moment(this.state.problemReport.dt).format('yyyy-MM-DD') : ''}
                                                                    className="form-control-sm form-control date-color"
                                                                />
                                                                <FormFeedback className="red">{errors.month}</FormFeedback>
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
                                                                    // selected={new moment(this.state.problemReport.createdDate)}
                                                                    className="form-control-sm form-control date-color"
                                                                />
                                                                <FormFeedback className="red">{errors.createdDate}</FormFeedback>
                                                            </FormGroup>

                                                            <FormGroup className="col-md-6 ">
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
                                                                    value={this.state.problemReport.problemStatus.label}
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

                                                            {/* <FormGroup className="col-md-6 ">
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
                                                            </FormGroup> */}

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
                                                                    <ul class="navbar-nav"><li class="nav-item pl-0"><a aria-current="page" class="nav-link active" ><b>Problem Trans Details</b></a></li></ul>
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


                                                    <div className="col-md-12 bg-white pb-1">
                                                        <ul class="navbar-nav"><li class="nav-item pl-0"><a aria-current="page" class="nav-link active"><b>Update Status</b></a></li></ul>

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
                                                                    value={this.state.problemStatusInputId}
                                                                >
                                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                                    {problemStatus}
                                                                </Input>
                                                                <FormFeedback className="red">{errors.problemStatusInputId}</FormFeedback>
                                                            </FormGroup>

                                                            <FormGroup className="col-md-6 ">
                                                                <Label for="notes">{i18n.t('static.program.notes')}</Label>
                                                                {/* <Input type="text" */}
                                                                <textarea
                                                                    class="form-control" id="exampleFormControlTextarea1" rows="3"
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
                                                        </div>
                                                    </div>

                                                    <div className="col-md-12 card-footer">
                                                        <FormGroup>
                                                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                            {/* <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> Reset</Button> */}
                                                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                            &nbsp;
                                                    </FormGroup>
                                                    </div>

                                                </CardBody>


                                            </Form>

                                        )} />
                        </Card>
                    </Col>
                </Row>

            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/report/problemList/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {

    }

}