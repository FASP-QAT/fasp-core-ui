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
const entityname = i18n.t('static.procurementagent.procurementagent')

let initialValues = {
    realmId: [],
    procurementAgentCode: "",
    procurementAgentName: "",
    submittedToApprovedLeadTime: "",
    approvedToShippedLeadTime: "",
    // colorHtmlCode: "",

}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        // procurementAgentCode: Yup.string()
        //     .matches(/^\S*$/, i18n.t('static.validNoSpace.string'))
        //     .required(i18n.t('static.procurementagent.codetext')),
        procurementAgentCode: Yup.string()
            // .matches(ALPHABET_NUMBER_REGEX, i18n.t('static.message.alphabetnumerallowed'))
            // .matches(/^[a-zA-Z0-9_'\/-]*$/, i18n.t('static.common.alphabetNumericCharOnly'))
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.procurementagent.codetext')),
        procurementAgentName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.procurementAgent.procurementagentnametext')),
        // submittedToApprovedLeadTime: Yup.string()
        //     .matches(/^[0-9]*$/, i18n.t('static.procurementagent.onlynumberText'))
        //     .required(i18n.t('static.procurementagent.submitToApproveLeadTime')),
        submittedToApprovedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.procurementagent.submitToApproveLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext'))
        // .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        ,
        approvedToShippedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.procurementagent.approvedToShippedLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext')),
        // .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),

        // submittedToApprovedLeadTime: Yup.number()
        //     .typeError(i18n.t('static.procurementUnit.validNumberText'))
        //     .required(i18n.t('static.procurementagent.submitToApproveLeadTime'))
        //     .min(0, i18n.t('static.program.validvaluetext'))
        // colorHtmlCode: Yup.string()
        //     .max(6, i18n.t('static.common.max6digittext'))
        //     .required(i18n.t('static.procurementAgent.procurementAgentHTMLCode')),


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
class AddProcurementAgentComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayColorPicker: false,
            background: '#000000',
            color: {
                // hex: '#fff'
                r: '241',
                g: '112',
                b: '19',
                a: '1',
            },
            realms: [],
            procurementAgent: {
                realm: {
                    id: ''
                },
                label: {
                    label_en: ''

                },
                procurementAgentCode: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                localProcurementAgent: false,
                colorHtmlCode: '#F17013',
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
        this.getDisplayName = this.getDisplayName.bind(this);
    }
    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };
    handleChangeColor = (color) => {
        console.log("color---", color);
        let { procurementAgent } = this.state;
        procurementAgent.colorHtmlCode = color.hex.toUpperCase();
        let rgba = 'rgba(' + color.rgb.r + "," + color.rgb.g + "," + color.rgb.b + "," + color.rgb.a + ')';
        this.setState({
            color: color.rgb,
            rgba,
            procurementAgent
        },
            () => { console.log("agent--------------", procurementAgent); });
    };
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }

    getDisplayName() {
        let realmId = document.getElementById("realmId").value;
        // let realmId = 1;
        let procurementAgentValue = document.getElementById("procurementAgentName").value;
        // let procurementAgentValue = "USAID"
        procurementAgentValue = procurementAgentValue.replace(/[^A-Za-z0-9]/g, "");
        procurementAgentValue = procurementAgentValue.trim().toUpperCase();
        if (realmId != '' && procurementAgentValue.length != 0) {

            if (procurementAgentValue.length >= 10) {//minus 2
                procurementAgentValue = procurementAgentValue.slice(0, 8);
                console.log("DISPLAYNAME-BEF----->", procurementAgentValue);
                ProcurementAgentService.getProcurementAgentDisplayName(realmId, procurementAgentValue)
                    .then(response => {
                        console.log("DISPLAYNAME-RESP----->", response);
                        let { procurementAgent } = this.state;
                        procurementAgent.procurementAgentCode = response.data;
                        this.setState({
                            procurementAgent
                        });

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

            } else {// not need to minus
                console.log("DISPLAYNAME-BEF-else----->", procurementAgentValue);
                ProcurementAgentService.getProcurementAgentDisplayName(realmId, procurementAgentValue)
                    .then(response => {
                        console.log("DISPLAYNAME-RESP-else----->", response);
                        let { procurementAgent } = this.state;
                        procurementAgent.procurementAgentCode = response.data;
                        this.setState({
                            procurementAgent
                        });

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

    }

    dataChange(event) {
        let { procurementAgent } = this.state;
        if (event.target.name == "realmId") {
            procurementAgent.realm.id = event.target.value;
        }
        if (event.target.name == "colorHtmlCode") {
            procurementAgent.colorHtmlCode = event.target.value.toUpperCase();
        }
        if (event.target.name == "procurementAgentCode") {
            // procurementAgent.procurementAgentCode = event.target.value.toUpperCase();
            procurementAgent.procurementAgentCode = event.target.value;
        }
        if (event.target.name == "procurementAgentName") {
            procurementAgent.label.label_en = event.target.value;
        }
        if (event.target.name == "submittedToApprovedLeadTime") {
            procurementAgent.submittedToApprovedLeadTime = event.target.value;
        }
        if (event.target.name == "approvedToShippedLeadTime") {
            procurementAgent.approvedToShippedLeadTime = event.target.value;
        }
        if (event.target.name === "localProcurementAgent") {
            procurementAgent.localProcurementAgent = event.target.id === "localProcurementAgent2" ? false : true
        }


        this.setState({
            procurementAgent
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true,
            procurementAgentCode: true,
            procurementAgentName: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
            // colorHtmlCode: true,
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('procurementAgentForm', (fieldName) => {
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

            let { procurementAgent } = this.state;
            procurementAgent.realm.id = realmId;
            document.getElementById("realmId").disabled = true;
            this.setState({
                procurementAgent
            },
                () => {

                })
        }
    }

    render() {
        const styles = reactCSS({
            'default': {
                color: {
                    width: '100px',
                    height: '17px',
                    borderRadius: '2px',
                    background: `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`,
                    // background: '#000000',
                },
                swatch: {
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
        });
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
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>

                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                // initialValues={initialValues}
                                enableReinitialize={true}
                                initialValues={
                                    {
                                        realmId: this.state.procurementAgent.realm.id,
                                        procurementAgentCode: this.state.procurementAgent.procurementAgentCode,
                                        procurementAgentName: this.state.procurementAgent.label.label_en,
                                        submittedToApprovedLeadTime: this.state.procurementAgent.submittedToApprovedLeadTime,
                                        approvedToShippedLeadTime: this.state.procurementAgent.approvedToShippedLeadTime,
                                        colorHtmlCode: this.state.procurementAgent.colorHtmlCode,
                                    }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    console.log("on submit---", this.state.procurementAgent)
                                    ProcurementAgentService.addProcurementAgent(this.state.procurementAgent)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='procurementAgentForm' autocomplete="off">
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
                                                            valid={!errors.realmId && this.state.procurementAgent.realm.id != ''}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementAgent.realm.id}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="procurementAgentName">{i18n.t('static.procurementagent.procurementagentname')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            bsSize="sm"
                                                            name="procurementAgentName"
                                                            id="procurementAgentName"
                                                            valid={!errors.procurementAgentName && this.state.procurementAgent.label.label_en != ''}
                                                            invalid={touched.procurementAgentName && !!errors.procurementAgentName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            // onBlur={handleBlur}
                                                            onBlur={(e) => { handleBlur(e); this.getDisplayName() }}
                                                            maxLength={255}
                                                            required
                                                            value={this.Capitalize(this.state.procurementAgent.label.label_en)}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.procurementAgentName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="procurementAgentCode">{i18n.t('static.procurementagent.procurementagentcode')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            bsSize="sm"
                                                            name="procurementAgentCode"
                                                            id="procurementAgentCode"
                                                            valid={!errors.procurementAgentCode && this.state.procurementAgent.procurementAgentCode != ''}
                                                            invalid={touched.procurementAgentCode && !!errors.procurementAgentCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            maxLength={10}
                                                            // value={this.Capitalize(this.state.procurementAgent.procurementAgentCode)}
                                                            value={this.state.procurementAgent.procurementAgentCode}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.procurementAgentCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="colorHtmlCode">{i18n.t('static.procurementagent.procurementAgentColorCode')}</Label>
                                                        <div bsSize="sm">
                                                            <div style={styles.swatch} onClick={this.handleClick}>
                                                                <div style={styles.color} />
                                                            </div>
                                                        </div>
                                                        {this.state.displayColorPicker ? <div style={styles.popover}>
                                                            <div style={styles.cover} onClick={this.handleClose} />
                                                            <SketchPicker color={this.state.color} onChange={this.handleChangeColor} />
                                                        </div> : null}
                                                        {/* <Input type="text"
                                                            bsSize="sm"
                                                            name="colorHtmlCode"
                                                            id="colorHtmlCode"
                                                            valid={!errors.colorHtmlCode && this.state.procurementAgent.colorHtmlCode != ''}
                                                            invalid={touched.colorHtmlCode && !!errors.colorHtmlCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            maxLength={6}
                                                            value={this.state.procurementAgent.colorHtmlCode}
                                                        /> */}
                                                        {/* <FormFeedback className="red">{errors.colorHtmlCode}</FormFeedback> */}

                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="submittedToApprovedLeadTime">{i18n.t('static.procurementagent.procurementagentsubmittoapprovetimeLabel')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-clock-o"></i></InputGroupText> */}
                                                        <Input type="number"
                                                            bsSize="sm"
                                                            name="submittedToApprovedLeadTime"
                                                            id="submittedToApprovedLeadTime"
                                                            valid={!errors.submittedToApprovedLeadTime && this.state.procurementAgent.submittedToApprovedLeadTime != ''}
                                                            invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.procurementAgent.submittedToApprovedLeadTime}
                                                            min="0"
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.submittedToApprovedLeadTime}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="approvedToShippedLeadTime">{i18n.t('static.procurementagent.procurementagentapprovetoshippedtimeLabel')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-clock-o"></i></InputGroupText> */}
                                                        <Input type="number"
                                                            bsSize="sm"
                                                            name="approvedToShippedLeadTime"
                                                            id="approvedToShippedLeadTime"
                                                            valid={!errors.approvedToShippedLeadTime && this.state.procurementAgent.approvedToShippedLeadTime != ''}
                                                            invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.procurementAgent.approvedToShippedLeadTime}
                                                            min="1"
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.approvedToShippedLeadTime}</FormFeedback>
                                                    </FormGroup>
                                                    {/* <FormGroup>
                                                        <Label className="P-absltRadio">{i18n.t('static.procurementAgent.localProcurementAgent')}  </Label>
                                                        <FormGroup check inline className="procurementAgentradiomargin">
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="localProcurementAgent1"
                                                                name="localProcurementAgent"
                                                                value={true}
                                                                checked={this.state.procurementAgent.localProcurementAgent === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.program.yes')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="localProcurementAgent2"
                                                                name="localProcurementAgent"
                                                                value={false}
                                                                checked={this.state.procurementAgent.localProcurementAgent === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.program.no')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup> */}
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
                                                        {/* <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button> */}
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
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked() {
        let { procurementAgent } = this.state;

        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            procurementAgent.realm.id = ''
        }

        procurementAgent.procurementAgentCode = ''
        procurementAgent.label.label_en = ''
        procurementAgent.submittedToApprovedLeadTime = ''
        procurementAgent.approvedToShippedLeadTime = ''
        procurementAgent.colorHtmlCode = ''

        this.setState({
            procurementAgent
        },
            () => { });
    }
}

export default AddProcurementAgentComponent;
