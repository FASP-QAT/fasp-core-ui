import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import { SketchPicker } from 'react-color';
import Select from 'react-select';
import reactCSS from 'reactcss';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants.js';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import ProgramService from "../../api/ProgramService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.procurementagent.procurementagent');
// Initial values for form fields
const initialValues = {
    procurementAgentName: "",
    submittedToApprovedLeadTime: "",
    approvedToShippedLeadTime: "",
    procurementAgentTypeId: [],
    programId: []
}
/**
 * Defines the validation schema for procurement agent details.
 * @param {*} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        procurementAgentTypeId: Yup.string()
            .required(i18n.t('static.procurementagent.procurementagenttypetext')),
        procurementAgentCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.procurementagent.codetext')),
        procurementAgentName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.procurementAgent.procurementagentnametext')),
        submittedToApprovedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.procurementagent.submitToApproveLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext')),
        approvedToShippedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
            .required(i18n.t('static.procurementagent.approvedToShippedLeadTime'))
            .min(0, i18n.t('static.program.validvaluetext'))
    })
}
/**
 * Component for editing procurement agent details.
 */
class EditProcurementAgentComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayColorPicker: false,
            rgba: '',
            color: {
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
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.programChange = this.programChange.bind(this);
        this.getProgramByRealmId = this.getProgramByRealmId.bind(this);
    }
    /**
     * Handles click event on color code picker. Toggle color picker according to displayColorPicker value. 
     */
    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    };
    /**
     * Close color picker.
     */
    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };
    /**
     * Handles color change in color picker.
     * @param {*} color - selected color.
     */
    handleChangeColor = (color) => {
        let { procurementAgent } = this.state;
        procurementAgent.colorHtmlCode = color.hex.toUpperCase();
        let rgba = 'rgba(' + color.rgb.r + "," + color.rgb.g + "," + color.rgb.b + "," + color.rgb.a + ')';
        this.setState({
            color: color.rgb,
            rgba,
            procurementAgent
        },
            () => {
            });
    };
    /**
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Capitalizes the first letter of the procurement agent name
     * @param {*} str - The procurement agent name
     * @returns {string} - Capitalized procurement agent name.
     */
    Capitalize(str) {
        if (str != null && str != "") {
            let { procurementAgent } = this.state;
            procurementAgent.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
        } else {
            return "";
        }
    }
    /**
     * Handles data change in the procurement agent form.
     * @param {Event} event - The change event.
     */
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
    /**
     * Handles change in Program dropdown & filters the program list
     * @param {*} programId - The change event.
     */
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
    /**
     * Fetch program list by realmId
     * @param {*} e - The realmId
     */
    getProgramByRealmId(e) {
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
                            var itemLabelA = a.label.toUpperCase();
                            var itemLabelB = b.label.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
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
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
    /**
     * Fetches Procurement agent details, RealmId, Procurement agent type list & Program list on component mount.
     */
    componentDidMount() {
        //Fetch procurement agent details by Id
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
                    if (this.state.procurementAgent.programList[i].id != 0) {
                        proramListArray[i] = { value: this.state.procurementAgent.programList[i].id, label: getLabelText(this.state.procurementAgent.programList[i].label, this.state.lang) }
                    }
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
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
        //Fetch realmId
        let realmId = AuthenticationService.getRealmId();
        //Fetch all procurement agent type list
        ProcurementAgentService.getProcurementAgentTypeListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        procurementAgentTypes: listArray.filter(c => c.active == true && realmId == c.realm.id), loading: false,
                    }, () => {
                        //Fetch program list by realmId
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
    /**
     * Renders the procurement agent details form.
     * @returns {JSX.Element} - the procurement agent details form.
     */
    render() {
        const styles = reactCSS({
            'default': {
                color: {
                    width: '100px',
                    height: '17px',
                    borderRadius: '2px',
                    background: `${this.state.rgba}`,
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
                        {getLabelText(item.label, this.state.lang)} ({item.procurementAgentTypeCode})
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
                                validationSchema={validationSchema}

                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    var pAgent = this.state.procurementAgent;
                                    for (var i = 0; i < pAgent.programList.length; i++) {
                                        if (pAgent.programList[i].id == 0) {
                                            pAgent.programList = []
                                        }
                                    }
                                    ProcurementAgentService.updateProcurementAgent(pAgent)
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
                                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                                                    <Input
                                                        type="text"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={getLabelText(this.state.procurementAgent.realm.label, this.state.lang)}
                                                    >
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className="Selectcontrol-bdrNone">
                                                    <Label htmlFor="programId">{i18n.t('static.dataSource.program')}</Label>
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
                                                    <Label htmlFor="procurementAgentTypeId">{i18n.t('static.dashboard.procurementagenttype')}</Label>
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
                                                    <FormFeedback className="red">{errors.procurementAgentTypeId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="procurementAgentName">{i18n.t('static.procurementagent.procurementagentname')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        bsSize="sm"
                                                        name="procurementAgentName"
                                                        id="procurementAgentName"
                                                        valid={!errors.procurementAgentName}
                                                        invalid={(touched.procurementAgentName && !!errors.procurementAgentName) || !!errors.procurementAgentName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        maxLength={255}
                                                        required
                                                        value={getLabelText(this.state.procurementAgent.label, this.state.lang)}
                                                    />
                                                    <FormFeedback className="red">{errors.procurementAgentName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="procurementAgentCode">{i18n.t('static.procurementagent.procurementagentcode')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        bsSize="sm"
                                                        name="procurementAgentCode"
                                                        id="procurementAgentCode"
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        valid={!errors.procurementAgentCode}
                                                        invalid={(touched.procurementAgentCode && !!errors.procurementAgentCode) || !!errors.procurementAgentCode}
                                                        maxLength={10}
                                                        value={this.state.procurementAgent.procurementAgentCode}
                                                    />
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
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="submittedToApprovedLeadTime">{i18n.t('static.procurementagent.procurementagentsubmittoapprovetimeLabel')}<span className="red Reqasterisk">*</span></Label>
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
                                                    <FormFeedback className="red">{errors.submittedToApprovedLeadTime}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="approvedToShippedLeadTime">{i18n.t('static.procurementagent.procurementagentapprovetoshippedtimeLabel')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        bsSize="sm"
                                                        name="approvedToShippedLeadTime"
                                                        id="approvedToShippedLeadTime"
                                                        valid={!errors.approvedToShippedLeadTime && this.state.procurementAgent.approvedToShippedLeadTime != ''}
                                                        invalid={(touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime) || !!errors.approvedToShippedLeadTime}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.procurementAgent.approvedToShippedLeadTime}
                                                        min="0"
                                                    />
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
                                                            {i18n.t('static.dataentry.inactive')}
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
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
    /**
     * Redirects to the list procurement agent when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the procurement agent details form when reset button is clicked.
     */
    resetClicked() {
        //Fetch procurement agent details by id.
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
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
