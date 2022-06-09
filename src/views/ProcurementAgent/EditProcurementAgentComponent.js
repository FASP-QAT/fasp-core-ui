import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, FormFeedback, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';
import RealmService from "../../api/RealmService";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { SketchPicker } from 'react-color';
import reactCSS from 'reactcss'
import getLabelText from '../../CommonComponent/getLabelText';
import { SPECIAL_CHARECTER_WITH_NUM, ALPHABET_NUMBER_REGEX, SPACE_REGEX } from '../../Constants.js';
import ProgramService from "../../api/ProgramService";
import Select from 'react-select';
import classNames from 'classnames';
const entityname = i18n.t('static.procurementagent.procurementagent');

const initialValues = {
    procurementAgentName: "",
    submittedToApprovedLeadTime: "",
    approvedToShippedLeadTime: "",
    // colorHtmlCode: "",
    procurementAgentTypeId: [],
    programId: []
}

const validationSchema = function (values) {
    return Yup.object().shape({
        // programId: Yup.string()
        //     .required(i18n.t('static.procurementagent.programtext')),
        procurementAgentTypeId: Yup.string()
            .required(i18n.t('static.procurementagent.procurementagenttypetext')),
        procurementAgentCode: Yup.string()
            // .matches(ALPHABET_NUMBER_REGEX, i18n.t('static.message.alphabetnumerallowed'))
            // .matches(/^[a-zA-Z0-9_'\/-]*$/, i18n.t('static.common.alphabetNumericCharOnly'))
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.procurementagent.codetext')),
        procurementAgentName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.procurementAgent.procurementagentnametext')),
        submittedToApprovedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.procurementagent.submitToApproveLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext')),
        // .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.program.validBudgetAmount')),
        approvedToShippedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.procurementagent.approvedToShippedLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext'))

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
class EditProcurementAgentComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayColorPicker: false,
            rgba: '',
            color: {
                // hex: '#fff'
                r: '241',
                g: '112',
                b: '19',
                a: '1',
            },
            realms: [],
            procurementAgentTypes: [],
            programId: '',
            programList: [],
            proramListArray: [],
            // procurementAgent: this.props.location.state.procurementAgent,
            procurementAgent: {
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
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: '',
                },
                procurementAgentCode: '',
                colorHtmlCode: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                // localProcurementAgent: false,
                procurementAgentType: {
                    id: ''
                },
                programList: []
            },
            message: '',
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changeLoading = this.changeLoading.bind(this);
        this.programChange = this.programChange.bind(this);
        this.getProgramByRealmId = this.getProgramByRealmId.bind(this);
    }
    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };
    changeLoading(loading) {
        this.setState({ loading: loading })
    }
    handleChangeColor = (color) => {
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
        }, 30000);
    }

    changeMessage(message) {
        this.setState({ message: message })
    }

    Capitalize(str) {
        if (str != null && str != "") {
            let { procurementAgent } = this.state;
            procurementAgent.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
        } else {
            return "";
        }
    }


    dataChange(event) {
        let { procurementAgent } = this.state;
        if (event.target.name == "realmId") {
            procurementAgent.realm.realmId = event.target.value;
        }
        if (event.target.name == "procurementAgentTypeId") {
            procurementAgent.procurementAgentType.id = event.target.value;
        }
        if (event.target.name == "programId") {
            procurementAgent.programList.id = event.target.value;
        }
        if (event.target.name == "procurementAgentCode") {
            procurementAgent.procurementAgentCode = event.target.value;
        }
        if (event.target.name == "colorHtmlCode") {
            procurementAgent.colorHtmlCode = event.target.value.toUpperCase();
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
        if (event.target.name == "active") {
            procurementAgent.active = event.target.id === "active2" ? false : true;
        }


        this.setState({
            procurementAgent
        },
            () => { });
    };

    programChange(programId) {
        var selectedArray = [];
        for (var p = 0; p < programId.length; p++) {
            selectedArray.push(programId[p].value);
        }
        if (selectedArray.includes("-1")) {
            this.setState({ programId: [] });
            var list = this.state.programList.filter(c => c.value != -1)
            this.setState({ programId: list });
            var programId = list;
        } else {
            this.setState({ programId: programId });
            var programId = programId;
        }

        let { procurementAgent } = this.state;
        // this.setState({ roleId });
        var programIdArray = [];
        for (var i = 0; i < programId.length; i++) {
            programIdArray[i] = {
                id: programId[i].value
            }
        }

        procurementAgent.programList = programIdArray;

        this.setState({
            procurementAgent,
        },
            () => { });
    }

    touchAll(setTouched, errors) {
        setTouched({
            procurementAgentName: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
            // colorHtmlCode: true,
            procurementAgentTypeId: true,
            programId: true
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

    getProgramByRealmId(e) {
        // AuthenticationService.setupAxiosInterceptors();
        if (e != 0) {
            ProgramService.getProgramList(e)
                .then(response => {
                    if (response.status == 200) {
                        var programList = [{ value: "-1", label: i18n.t("static.common.all") }];
                        for (var i = 0; i < response.data.length; i++) {
                            programList[i + 1] = { value: response.data[i].programId, label: getLabelText(response.data[i].label, this.state.lang) }
                        }
                        var listArray = programList;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        console.log("listArray", listArray)
                        this.setState({
                            programList: listArray,
                            loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }
                })
                .catch(
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
        } else {
            this.setState({
                programList: {}, loading: false
            })
        }
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.getProcurementAgentById(this.props.match.params.procurementAgentId).then(response => {
            if (response.status == 200) {

                this.setState({
                    procurementAgent: response.data, loading: false
                });
                let color = AuthenticationService.hexToRgbA(this.state.procurementAgent.colorHtmlCode);
                this.setState({ rgba: color })
                var proramListArray = [];
                let { procurementAgent } = this.state;

                for (var i = 0; i < this.state.procurementAgent.programList.length; i++) {
                    proramListArray[i] = { value: this.state.procurementAgent.programList[i].id, label: getLabelText(this.state.procurementAgent.programList[i].label, this.state.lang) }
                }
                this.setState({ programId: proramListArray })
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
        ProcurementAgentService.getProcurementAgentTypeListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        procurementAgentTypes: listArray.filter(c => c.active == true && realmId == c.realm.id), loading: false,

                    }, () => {
                        this.getProgramByRealmId(realmId)
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
    }
    render() {
        const styles = reactCSS({
            'default': {
                color: {
                    width: '100px',
                    height: '17px',
                    borderRadius: '2px',
                    background: `${this.state.rgba}`,
                    // background: `rgba(${AuthenticationService.hexToRgbA(this.state.procurementAgent.colorHtmlCode)})`,
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
        const { procurementAgentTypes } = this.state;
        let procurementAgentTypeList = procurementAgentTypes.length > 0
            && procurementAgentTypes.map((item, i) => {
                return (
                    <option key={i} value={item.procurementAgentTypeId}>
                        {item.procurementAgentTypeCode}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>

                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={
                                    {
                                        procurementAgentCode: this.state.procurementAgent.procurementAgentCode,
                                        procurementAgentName: this.state.procurementAgent.label.label_en,
                                        submittedToApprovedLeadTime: this.state.procurementAgent.submittedToApprovedLeadTime,
                                        approvedToShippedLeadTime: this.state.procurementAgent.approvedToShippedLeadTime,
                                        colorHtmlCode: this.state.procurementAgent.colorHtmlCode,
                                        procurementAgentTypeId: this.state.procurementAgent.procurementAgentType.id,
                                        programId: this.state.procurementAgent.programList
                                    }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    console.log("COLOR----->", this.state.procurementAgent);
                                    // AuthenticationService.setupAxiosInterceptors();
                                    ProcurementAgentService.updateProcurementAgent(this.state.procurementAgent)
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
                                        handleReset,
                                        setFieldTouched,
                                        setFieldValue
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='procurementAgentForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                                    {/* <InputGroupAddon addonType="prepend"> */}
                                                    {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                    <Input
                                                        type="text"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={getLabelText(this.state.procurementAgent.realm.label, this.state.lang)}
                                                    >
                                                    </Input>
                                                    {/* </InputGroupAddon> */}
                                                </FormGroup>
                                                <FormGroup className="Selectcontrol-bdrNone">
                                                    <Label htmlFor="programId">{i18n.t('static.dataSource.program')}<span class="red Reqasterisk">*</span></Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.programId && this.state.procurementAgent.programList.length != 0 },
                                                            { 'is-invalid': (touched.programId && !!errors.programId) }
                                                        )}
                                                        bsSize="sm"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("programId", e);
                                                            this.programChange(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("programId", true)}
                                                        name="programId"
                                                        id="programId"
                                                        multi
                                                        options={this.state.programList}
                                                        value={this.state.programId}

                                                    />
                                                    <FormFeedback className="red">{errors.programId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="procurementAgentTypeId">{i18n.t('static.dashboard.procurementagenttype')}<span className="red Reqasterisk">*</span></Label>
                                                    {/* <InputGroupAddon addonType="prepend"> */}
                                                    {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                    <Input
                                                        type="select"
                                                        bsSize="sm"
                                                        name="procurementAgentTypeId"
                                                        id="procurementAgentTypeId"
                                                        valid={!errors.procurementAgentTypeId && this.state.procurementAgent.procurementAgentType.id != ''}
                                                        invalid={touched.procurementAgentTypeId && !!errors.procurementAgentTypeId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementAgent.procurementAgentType.id}
                                                        required
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {procurementAgentTypeList}
                                                    </Input>
                                                    {/* </InputGroupAddon> */}
                                                    <FormFeedback className="red">{errors.procurementAgentTypeId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="procurementAgentName">{i18n.t('static.procurementagent.procurementagentname')}<span className="red Reqasterisk">*</span></Label>
                                                    {/* <InputGroupAddon addonType="prepend"> */}
                                                    {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                    <Input type="text"
                                                        bsSize="sm"
                                                        name="procurementAgentName"
                                                        id="procurementAgentName"
                                                        valid={!errors.procurementAgentName}
                                                        // invalid={touched.procurementAgentName && !!errors.procurementAgentName || this.state.procurementAgent.label.label_en == ''}
                                                        invalid={(touched.procurementAgentName && !!errors.procurementAgentName) || !!errors.procurementAgentName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        maxLength={255}
                                                        required
                                                        value={getLabelText(this.state.procurementAgent.label, this.state.lang)}
                                                    />
                                                    {/* </InputGroupAddon> */}
                                                    <FormFeedback className="red">{errors.procurementAgentName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="procurementAgentCode">{i18n.t('static.procurementagent.procurementagentcode')}<span class="red Reqasterisk">*</span></Label>
                                                    {/* <InputGroupAddon addonType="prepend"> */}
                                                    {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                    <Input type="text"
                                                        bsSize="sm"
                                                        name="procurementAgentCode"
                                                        id="procurementAgentCode"
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        valid={!errors.procurementAgentCode}
                                                        invalid={(touched.procurementAgentCode && !!errors.procurementAgentCode) || !!errors.procurementAgentCode}
                                                        // readOnly={true}
                                                        maxLength={10}
                                                        value={this.state.procurementAgent.procurementAgentCode}
                                                    />
                                                    {/* </InputGroupAddon> */}
                                                    <FormFeedback className="red">{errors.procurementAgentCode}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="colorHtmlCode">{i18n.t('static.procurementagent.procurementAgentColorCode')}<span className="red Reqasterisk">*</span></Label>
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
                                                            invalid={touched.colorHtmlCode && !!errors.colorHtmlCode || this.state.procurementAgent.colorHtmlCode == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            maxLength={6}
                                                            value={this.state.procurementAgent.colorHtmlCode}
                                                        />
                                                        <FormFeedback className="red">{errors.colorHtmlCode}</FormFeedback> */}
                                                </FormGroup>

                                                <FormGroup>
                                                    <Label for="submittedToApprovedLeadTime">{i18n.t('static.procurementagent.procurementagentsubmittoapprovetimeLabel')}<span className="red Reqasterisk">*</span></Label>
                                                    {/* <InputGroupAddon addonType="prepend"> */}
                                                    {/* <InputGroupText><i className="fa fa-clock-o"></i></InputGroupText> */}
                                                    <Input type="number"
                                                        bsSize="sm"
                                                        name="submittedToApprovedLeadTime"
                                                        id="submittedToApprovedLeadTime"
                                                        valid={!errors.submittedToApprovedLeadTime}
                                                        invalid={(touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime) || !!errors.submittedToApprovedLeadTime}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        min="0"
                                                        value={this.state.procurementAgent.submittedToApprovedLeadTime}
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
                                                        // invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime || this.state.procurementAgent.approvedToShippedLeadTime == ''}
                                                        invalid={(touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime) || !!errors.approvedToShippedLeadTime}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.procurementAgent.approvedToShippedLeadTime}
                                                        min="0"
                                                    />
                                                    {/* </InputGroupAddon> */}
                                                    <FormFeedback className="red">{errors.approvedToShippedLeadTime}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label className="P-absltRadio">{i18n.t('static.common.status')}  </Label>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active1"
                                                            name="active"
                                                            value={true}
                                                            checked={this.state.procurementAgent.active === true}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio1">
                                                            {i18n.t('static.common.active')}
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active2"
                                                            name="active"
                                                            value={false}
                                                            checked={this.state.procurementAgent.active === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.common.disabled')}
                                                        </Label>
                                                    </FormGroup>
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
                                                    <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
        // AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.getProcurementAgentById(this.props.match.params.procurementAgentId).then(response => {
            this.setState({
                procurementAgent: response.data, loading: false
            });
            let color = AuthenticationService.hexToRgbA(this.state.procurementAgent.colorHtmlCode);
            this.setState({ rgba: color })

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

export default EditProcurementAgentComponent;
