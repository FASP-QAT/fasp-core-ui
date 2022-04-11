import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import RealmService from '../../api/RealmService';
import DataSourceTypeService from '../../api/DataSourceTypeService';
import ProgramService from '../../api/ProgramService';
import getLabelText from '../../CommonComponent/getLabelText';
import { SPACE_REGEX } from '../../Constants';

const summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.datasource.datasource"))
const summaryText_2 = "Add Data Source"
const initialValues = {
    summary: "",
    realmName: "",
    programName: "",
    dataSourceType: "",
    dataSourceName: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.realm.realmName')))),
        programName: Yup.string()
            .required(i18n.t('static.budget.programtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.program.programMaster')))),
        dataSourceType: Yup.string()
            .required(i18n.t('static.datasource.datasourcetypetext')),
        dataSourceName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.datasource.datasourcetext')),
        // notes: Yup.string()
        //     .required(i18n.t('static.common.notestext'))
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

export default class DataSourceTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataSource: {
                summary: summaryText_1,
                realmName: "",
                programName: "",
                dataSourceType: "",
                dataSourceName: "",
                notes: ""
            },
            lang: localStorage.getItem('lang'),
            message: '',
            realms: [],
            programs: [],
            dataSourceTypes: [],
            realmId: "",
            programId: '',
            dataSourceTypeId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getDataSourceTypeByRealmId = this.getDataSourceTypeByRealmId.bind(this);
        this.getProgramByRealmId = this.getProgramByRealmId.bind(this);
    }

    dataChange(event) {
        let { dataSource } = this.state
        if (event.target.name == "summary") {
            dataSource.summary = event.target.value;
        }
        if (event.target.name == "realmName") {

            dataSource.realmName = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "programName") {
            dataSource.programName = event.target.value !== "" ? this.state.programs.filter(c => c.programId == event.target.value)[0].label.label_en : "";
            this.setState({
                programId: event.target.value
            })
        }
        if (event.target.name == "dataSourceType") {
            dataSource.dataSourceType = event.target.value !== "" ? this.state.dataSourceTypes.filter(c => c.dataSourceTypeId == event.target.value)[0].label.label_en : "";
            this.setState({
                dataSourceTypeId: event.target.value
            })
        }
        if (event.target.name == "dataSourceName") {
            dataSource.dataSourceName = event.target.value;
        }
        if (event.target.name == "notes") {
            dataSource.notes = event.target.value;
        }
        this.setState({
            dataSource
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            realmName: true,
            programName: true,
            dataSourceType: true,
            dataSourceName: true,
            notes: true
        })
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

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    realms: listArray,
                    realmId: this.props.items.userRealmId, loading: false
                });
                if (this.props.items.userRealmId !== "") {
                    this.setState({
                        realms: (response.data).filter(c => c.realmId == this.props.items.userRealmId)
                    })

                    let { dataSource } = this.state;
                    dataSource.realmName = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                    this.setState({
                        dataSource
                    }, () => {

                        this.getDataSourceTypeByRealmId(this.props.items.userRealmId);
                        this.getProgramByRealmId(this.props.items.userRealmId);

                    })
                }
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
    }

    getDataSourceTypeByRealmId(realmId) {

        if (realmId != "") {
            // AuthenticationService.setupAxiosInterceptors();
            DataSourceTypeService.getDataSourceTypeByRealmId(realmId)
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        dataSourceTypes: listArray
                    })

                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );
        }
    }

    getProgramByRealmId(realmId) {
        // AuthenticationService.setupAxiosInterceptors();
        if (realmId != "") {
            ProgramService.getProgramList(realmId)
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        programs: listArray
                    })
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    });
                                    break;
                            }
                        }
                    }
                );
        }
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { dataSource } = this.state;
        // dataSource.summary = '';
        dataSource.realmName = this.props.items.userRealmId !== "" ? this.state.realms.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        dataSource.programName = '';
        dataSource.dataSourceType = '';
        dataSource.dataSourceName = '';
        dataSource.notes = '';
        this.setState({
            dataSource: dataSource,
            realmId: this.props.items.userRealmId,
            programId: '',
            dataSourceTypeId: ''
        },
            () => { });
    }

    render() {

        const { realms } = this.state;
        const { programs } = this.state;
        const { dataSourceTypes } = this.state;

        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        let dataSourceTypeList = dataSourceTypes.length > 0
            && dataSourceTypes.map((item, i) => {
                return (
                    <option key={i} value={item.dataSourceTypeId}>{getLabelText(item.label, this.state.lang)}</option>
                )
            }, this);

        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.datasource.datasource')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            realmName: this.props.items.userRealmId,
                            programName: "",
                            dataSourceType: "",
                            dataSourceName: "",
                            notes: ""
                        }}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.dataSource.summary = summaryText_2;
                            this.state.dataSource.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.dataSource).then(response => {
                                console.log("Response :", response.status, ":", JSON.stringify(response.data));
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    this.setState({
                                        message: msg, loading: false
                                    },
                                        () => {
                                            this.resetClicked();
                                            this.hideSecondComponent();
                                        })
                                } else {
                                    this.setState({
                                        message: i18n.t('static.unkownError'), loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }
                                this.props.togglehelp();
                                this.props.toggleSmall(this.state.message);
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false
                                        });
                                    } else {
                                        switch (error.response ? error.response.status : "") {

                                            case 401:
                                                this.props.history.push(`/login/static.message.sessionExpired`)
                                                break;
                                            case 403:
                                                this.props.history.push(`/accessDenied`)
                                                break;
                                            case 500:
                                            case 404:
                                            case 406:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                });
                                                break;
                                        }
                                    }
                                }
                            );
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
                                handleReset
                            }) => (
                                    <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                        < FormGroup >
                                            <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text" name="summary" id="summary" readOnly={true}
                                                bsSize="sm"
                                                valid={!errors.summary && this.state.dataSource.summary != ''}
                                                invalid={touched.summary && !!errors.summary}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.dataSource.summary}
                                                required />
                                            <FormFeedback className="red">{errors.summary}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="realmName">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="select" name="realmName" id="realmName"
                                                bsSize="sm"
                                                valid={!errors.realmName && this.state.dataSource.realmName != ''}
                                                invalid={touched.realmName && !!errors.realmName}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); this.getDataSourceTypeByRealmId(e.target.value); this.getProgramByRealmId(e.target.value) }}
                                                onBlur={handleBlur}
                                                value={this.state.realmId}
                                                required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {realmList}
                                            </Input>
                                            <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                        </FormGroup>
                                        < FormGroup >
                                            <Label for="programName">{i18n.t('static.program.programMaster')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="select" name="programName" id="programName"
                                                bsSize="sm"
                                                valid={!errors.programName && this.state.dataSource.programName != ''}
                                                invalid={touched.programName && !!errors.programName}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.programId}
                                                required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>
                                            <FormFeedback className="red">{errors.programName}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="dataSourceType">{i18n.t('static.datasourcetype.datasourcetype')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="select" name="dataSourceType" id="dataSourceType"
                                                bsSize="sm"
                                                valid={!errors.dataSourceType && this.state.dataSource.dataSourceType != ''}
                                                invalid={touched.dataSourceType && !!errors.dataSourceType}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.dataSourceTypeId}
                                                required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {dataSourceTypeList}
                                            </Input>
                                            <FormFeedback className="red">{errors.dataSourceType}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="dataSourceName">{i18n.t('static.datasource.datasource')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text" name="dataSourceName" id="dataSourceName"
                                                bsSize="sm"
                                                valid={!errors.dataSourceName && this.state.dataSource.dataSourceName != ''}
                                                invalid={touched.dataSourceName && !!errors.dataSourceName}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.dataSource.dataSourceName}
                                                required />
                                            <FormFeedback className="red">{errors.dataSourceName}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                            <Input type="textarea" name="notes" id="notes"
                                                bsSize="sm"
                                                valid={!errors.notes && this.state.dataSource.notes != ''}
                                                invalid={touched.notes && !!errors.notes}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                maxLength={600}
                                                value={this.state.dataSource.notes}
                                            // required 
                                            />
                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                        </FormGroup>
                                        <ModalFooter className="pb-0 pr-0">
                                            <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                            <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                        </ModalFooter>
                                        {/* <br></br><br></br>
                                    <div className={this.props.className}>
                                        <p>{i18n.t('static.ticket.drodownvaluenotfound')}</p>
                                    </div> */}
                                    </Form>
                                )} />
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}