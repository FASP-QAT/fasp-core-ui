import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormFeedback, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import RealmService from "../../api/RealmService";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { SketchPicker } from 'react-color';
import { SPECIAL_CHARECTER_WITH_NUM, ALPHABET_NUMBER_REGEX, SPACE_REGEX } from '../../Constants.js';
import reactCSS from 'reactcss'

import getLabelText from '../../CommonComponent/getLabelText';
const entityname = i18n.t('static.dashboard.procurementagenttype')

let initialValues = {
    procurementAgentTypeCode: "",
    procurementAgentTypeName: "",
}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        procurementAgentTypeCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.procurementagenttype.codetext')),
        procurementAgentTypeName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.procurementAgenTtype.procurementagenttypenametext'))
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
class AddProcurementAgentTypeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            procurementAgentType: {
                realm: {
                    realmId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: '',
                    }
                },
                label: {
                    label_en: ''
                },
                procurementAgentTypeCode: '',
            },
            message: '',
            lang: localStorage.getItem('lang'),
            loading: true,
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }


    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }

    dataChange(event) {
        let { procurementAgentType } = this.state;
        if (event.target.name == "procurementAgentTypeCode") {
            procurementAgentType.procurementAgentTypeCode = event.target.value;
        }
        if (event.target.name == "procurementAgentTypeName") {
            procurementAgentType.label.label_en = event.target.value;
        }
        this.setState({
            procurementAgentType
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            procurementAgentTypeCode: true,
            procurementAgentTypeName: true,
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('procurementAgentTypeForm', (fieldName) => {
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
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realms: listArray, loading: false,
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
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

        let realmId = AuthenticationService.getRealmId();
        if (realmId != -1) {
            // document.getElementById('realmId').value = realmId;
            // initialValues = {
            //     realmId: realmId
            // }

            let { procurementAgentType } = this.state;
            procurementAgentType.realm.id = realmId;
            document.getElementById("realmId").disabled = true;
            this.setState({
                procurementAgentType
            },
                () => {

                })
        }
        // this.setState({
        //     loading: false,
        // })
    }

    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "#BA0C2F" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>

                            <Formik
                                enableReinitialize={true}
                                initialValues={
                                    {
                                        procurementAgentTypeCode: this.state.procurementAgentType.procurementAgentTypeCode,
                                        procurementAgentTypeName: this.state.procurementAgentType.label.label_en,
                                    }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    console.log("on submit---", this.state.procurementAgentType)
                                    ProcurementAgentService.addProcurementAgentType(this.state.procurementAgentType)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/procurementAgentType/listProcurementAgentType/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode, loading: false
                                                },
                                                    () => {
                                                        this.hideSecondComponent();
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
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='procurementAgentTypeForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realmName')}<span className="red Reqasterisk">*</span></Label>
                                                    {/* <InputGroupAddon addonType="prepend"> */}
                                                    {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                    <Input
                                                        type="select"
                                                        bsSize="sm"
                                                        name="realmId"
                                                        id="realmId"
                                                        valid={!errors.realmId && this.state.procurementAgentType.realm.id != ''}
                                                        invalid={touched.realmId && !!errors.realmId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementAgentType.realm.id}
                                                        required
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {realmList}
                                                    </Input>
                                                    {/* </InputGroupAddon> */}
                                                    <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="procurementTypeName">{i18n.t('static.procurementagenttype.procurementtypename')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        bsSize="sm"
                                                        name="procurementAgentTypeName"
                                                        id="procurementAgentTypeName"
                                                        valid={!errors.procurementAgentTypeName && this.state.procurementAgentType.label.label_en != ''}
                                                        invalid={touched.procurementAgentTypeName && !!errors.procurementAgentTypeName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        // onBlur={handleBlur}
                                                        onBlur={(e) => { handleBlur(e); this.dataChange(e) }}
                                                        maxLength={255}
                                                        required
                                                        value={this.Capitalize(this.state.procurementAgentType.label.label_en)}
                                                    />
                                                    {/* </InputGroupAddon> */}
                                                    <FormFeedback className="red">{errors.procurementAgentTypeName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="procurementAgentTypeCode">{i18n.t('static.procurementagenttype.procurementagenttypecode')}<span className="red Reqasterisk">*</span></Label>
                                                    {/* <InputGroupAddon addonType="prepend"> */}
                                                    {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                    <Input type="text"
                                                        bsSize="sm"
                                                        name="procurementAgentTypeCode"
                                                        id="procurementAgentTypeCode"
                                                        valid={!errors.procurementAgentTypeCode && this.state.procurementAgentType.procurementAgentTypeCode != ''}
                                                        invalid={touched.procurementAgentTypeCode && !!errors.procurementAgentTypeCode}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        maxLength={10}
                                                        // value={this.Capitalize(this.state.procurementAgent.procurementAgentCode)}
                                                        value={this.state.procurementAgentType.procurementAgentTypeCode}
                                                    />
                                                    {/* </InputGroupAddon> */}
                                                    <FormFeedback className="red">{errors.procurementAgentTypeCode}</FormFeedback>
                                                </FormGroup>
                                            </CardBody>
                                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                    <div class="align-items-center">
                                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                                        <div class="spinner-border blue ml-4" role="status">

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
        this.props.history.push(`/procurementAgentType/listProcurementAgentType/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked() {
        let { procurementAgentType } = this.state;

        procurementAgentType.procurementAgentTypeCode = ''
        procurementAgentType.label.label_en = ''

        this.setState({
            procurementAgentType
        },
            () => { });
    }
}

export default AddProcurementAgentTypeComponent;
