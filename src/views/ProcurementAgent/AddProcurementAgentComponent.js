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
import RealmService from "../../api/RealmService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Localized entity name
const entityname = i18n.t('static.procurementagent.procurementagent')
/**
 * Defines the validation schema for procurement agent details.
 * @param {*} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
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
        ,
        approvedToShippedLeadTime: Yup.string()
            .matches(/^\d{0,2}(\.\d{1,2})?$/, i18n.t('static.message.2digitDecimal'))
    })
}
/**
 * Component for adding procurement agent details.
 */
class AddProcurementAgentComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayColorPicker: false,
            displayColorPickerDarkMode: false,
            background: '#000000',
            color: {
                r: '241',
                g: '112',
                b: '19',
                a: '1',
            },
            colorDarkMode: {
                r: '241',
                g: '112',
                b: '19',
                a: '1',
            },
            realms: [],
            procurementAgentTypes: [],
            programId: '',
            programList: [],
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
                colorHtmlDarkCode: '#F17013',
                procurementAgentType: {
                    id: ''
                },
                programList: [],
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
     * Handles click event on color code picker for dark mode. Toggle color picker according to displayColorPickerDarkMode value. 
     */
    handleClickDarkMode = () => {
        this.setState({ displayColorPickerDarkMode: !this.state.displayColorPickerDarkMode })
    };
    /**
     * Close color picker.
     */
    handleClose = () => {
        this.setState({ displayColorPicker: false })
    };
    /**
     * Close color picker for dark mode.
     */
    handleCloseDarkMode = () => {
        this.setState({ displayColorPickerDarkMode: false })
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
     * Handles color change in color picker for dark mode.
     * @param {*} colorDarkMode - selected color for dark mode.
     */
    handleChangeColorDarkMode = (colorDarkMode) => {
        let { procurementAgent } = this.state;
        procurementAgent.colorHtmlDarkCode = colorDarkMode.hex.toUpperCase();
        let rgbaDarkMode = 'rgba(' + colorDarkMode.rgb.r + "," + colorDarkMode.rgb.g + "," + colorDarkMode.rgb.b + "," + colorDarkMode.rgb.a + ')';
        this.setState({
            colorDarkMode: colorDarkMode.rgb,
            rgbaDarkMode,
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
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }
    /**
     * Fetch procurement agent display name on blur event of procurement agent name
     */
    getDisplayName() {
        let realmId = document.getElementById("realmId").value;
        let procurementAgentValue = document.getElementById("procurementAgentName").value;
        procurementAgentValue = procurementAgentValue.replace(/[^A-Za-z0-9]/g, "");
        procurementAgentValue = procurementAgentValue.trim().toUpperCase();
        if (realmId != '' && procurementAgentValue.length != 0) {
            if (procurementAgentValue.length >= 10) {
                procurementAgentValue = procurementAgentValue.slice(0, 8);
                //Fetch procurement agent display name
                ProcurementAgentService.getProcurementAgentDisplayName(realmId, procurementAgentValue)
                    .then(response => {
                        let { procurementAgent } = this.state;
                        procurementAgent.procurementAgentCode = response.data;
                        this.setState({
                            procurementAgent
                        });
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
            } else {
                //Fetch procurement agent display name
                ProcurementAgentService.getProcurementAgentDisplayName(realmId, procurementAgentValue)
                    .then(response => {
                        let { procurementAgent } = this.state;
                        procurementAgent.procurementAgentCode = response.data;
                        this.setState({
                            procurementAgent
                        });
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
    }
    /**
     * Handles data change in the procurement agent form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { procurementAgent } = this.state;
        if (event.target.name == "realmId") {
            procurementAgent.realm.id = event.target.value;
        }
        if (event.target.name == "procurementAgentTypeId") {
            procurementAgent.procurementAgentType.id = event.target.value;
        }
        if (event.target.name == "programId") {
            procurementAgent.programList.id = event.target.value;
        }
        if (event.target.name == "colorHtmlCode") {
            procurementAgent.colorHtmlCode = event.target.value.toUpperCase();
        }
        if (event.target.name == "procurementAgentCode") {
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
            //Fetch program list by realmId
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
     * Fetches Realm list, RealmId, Program list & procurement agent type list on component mount.
     */
    componentDidMount() {
        //Fetch all realm list
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
        if (realmId != -1) {
            let { procurementAgent } = this.state;
            procurementAgent.realm.id = realmId;
            document.getElementById("realmId").disabled = true;
            this.setState({
                procurementAgent
            },
                () => {
                    //Fetch program list by realmId
                    this.getProgramByRealmId(realmId)
                })
        }
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
                    background: `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`,
                },
                colorDarkMode: {
                    width: '100px',
                    height: '17px',
                    borderRadius: '2px',
                    background: `rgba(${this.state.colorDarkMode.r}, ${this.state.colorDarkMode.g}, ${this.state.colorDarkMode.b}, ${this.state.colorDarkMode.a})`,
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
                <h5 style={{ color: "#BA0C2F" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={
                                    {
                                        realmId: this.state.procurementAgent.realm.id,
                                        procurementAgentCode: this.state.procurementAgent.procurementAgentCode,
                                        procurementAgentName: this.state.procurementAgent.label.label_en,
                                        submittedToApprovedLeadTime: this.state.procurementAgent.submittedToApprovedLeadTime,
                                        approvedToShippedLeadTime: this.state.procurementAgent.approvedToShippedLeadTime,
                                        colorHtmlCode: this.state.procurementAgent.colorHtmlCode,
                                        colorHtmlDarkCode: this.state.procurementAgent.colorHtmlDarkCode,
                                        procurementAgentTypeId: this.state.procurementAgent.procurementAgentType.id,
                                        programId: this.state.procurementAgent.programList.id
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
                                    ProcurementAgentService.addProcurementAgent(pAgent)
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
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='procurementAgentForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realmName')}<span className="red Reqasterisk">*</span></Label>
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
                                                    <FormFeedback className="red">{errors.realmId}</FormFeedback>
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
                                                        required
                                                        options={this.state.programList}
                                                        value={this.state.programId}
                                                        placeholder={i18n.t('static.common.select')}
                                                    />
                                                    <FormFeedback className="red">{errors.programId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="procurementAgentTypeId">{i18n.t('static.dashboard.procurementagenttype')}<span className="red Reqasterisk">*</span></Label>
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
                                                        valid={!errors.procurementAgentName && this.state.procurementAgent.label.label_en != ''}
                                                        invalid={touched.procurementAgentName && !!errors.procurementAgentName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={(e) => { handleBlur(e); this.getDisplayName() }}
                                                        maxLength={255}
                                                        required
                                                        value={this.Capitalize(this.state.procurementAgent.label.label_en)}
                                                    />
                                                    <FormFeedback className="red">{errors.procurementAgentName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="procurementAgentCode">{i18n.t('static.procurementagent.procurementagentcode')}<span className="red Reqasterisk">*</span></Label>
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
                                                        value={this.state.procurementAgent.procurementAgentCode}
                                                    />
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
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="colorHtmlCode">{i18n.t('static.procurementagent.procurementAgentColorCodeDarkMode')}</Label>
                                                    <div bsSize="sm">
                                                        <div style={styles.swatch} onClick={this.handleClickDarkMode}>
                                                            <div style={styles.colorDarkMode} />
                                                        </div>
                                                    </div>
                                                    {this.state.displayColorPickerDarkMode ? <div style={styles.popover}>
                                                        <div style={styles.cover} onClick={this.handleCloseDarkMode} />
                                                        <SketchPicker color={this.state.colorDarkMode} onChange={this.handleChangeColorDarkMode} />
                                                    </div> : null}
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="submittedToApprovedLeadTime">{i18n.t('static.procurementagent.procurementagentsubmittoapprovetimeLabel')}</Label>
                                                    <Input type="number"
                                                        bsSize="sm"
                                                        name="submittedToApprovedLeadTime"
                                                        id="submittedToApprovedLeadTime"
                                                        valid={!errors.submittedToApprovedLeadTime}
                                                        invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementAgent.submittedToApprovedLeadTime}
                                                    />
                                                    <FormFeedback className="red">{errors.submittedToApprovedLeadTime}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="approvedToShippedLeadTime">{i18n.t('static.procurementagent.procurementagentapprovetoshippedtimeLabel')}</Label>
                                                    <Input type="number"
                                                        bsSize="sm"
                                                        name="approvedToShippedLeadTime"
                                                        id="approvedToShippedLeadTime"
                                                        valid={!errors.approvedToShippedLeadTime}
                                                        invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementAgent.approvedToShippedLeadTime}
                                                    />
                                                    <FormFeedback className="red">{errors.approvedToShippedLeadTime}</FormFeedback>
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
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
        let { procurementAgent } = this.state;
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            procurementAgent.realm.id = ''
        }
        procurementAgent.procurementAgentCode = ''
        procurementAgent.label.label_en = ''
        procurementAgent.submittedToApprovedLeadTime = ''
        procurementAgent.approvedToShippedLeadTime = ''
        procurementAgent.colorHtmlCode = ''
        procurementAgent.colorHtmlDarkCode = ''
        this.setState({
            procurementAgent
        },
            () => { });
    }
}
export default AddProcurementAgentComponent;
