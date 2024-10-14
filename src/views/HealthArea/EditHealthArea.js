import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import HealthAreaService from "../../api/HealthAreaService";
import UserService from "../../api/UserService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Initial values for form fields
let initialValues = {
    realmId: '',
    healthAreaName: '',
    healthAreaCode: '',
    realmCountryId: [],
}
// Localized entity name
const entityname = i18n.t('static.healtharea.healtharea');
/**
 * Defines the validation schema for health/technical area details.
 * @param {*} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        healthAreaName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.healtharea.healthareatext')),
        healthAreaCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .max(6, i18n.t('static.organisation.organisationcodemax6digittext'))
            .required(i18n.t('static.common.displayName')),
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext'))
    })
}
/**
 * Component for editing health area details.
 */
export default class EditHealthAreaComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countries: [],
            realms: [],
            healthArea: {
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                realmCountryArray: [],
                healthAreaCode: '',
            },
            message: '',
            lang: localStorage.getItem('lang'),
            realmCountryId: '',
            realmCountryList: [],
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    /**
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Handles data change in the health area form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { healthArea } = this.state
        if (event.target.name === "healthAreaName") {
            healthArea.label.label_en = event.target.value
        } else if (event.target.name === "realmId") {
            healthArea.realm.id = event.target.value
        } else if (event.target.name === "active") {
            healthArea.active = event.target.id === "active2" ? false : true
        } else if (event.target.name === "healthAreaCode") {
            healthArea.healthAreaCode = event.target.value.toUpperCase();
        }
        this.setState({
            healthArea
        }, (
        ) => {
        })
    }
    /**
     * Fetches all Country list, Realm list, RealmId & realm country list on component mount.
     */
    componentDidMount() {
        //Fetch health area details by healthAreaId
        HealthAreaService.getHealthAreaById(this.props.match.params.healthAreaId).then(response => {
            if (response.status == 200) {
                this.setState({
                    healthArea: response.data, loading: false
                })
            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }
            //Fetch Realm list
            UserService.getRealmList()
                .then(response => {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realms: listArray, loading: false
                    })
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
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
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
            //Fetch Realm country dropdown list by realmId
            DropdownService.getRealmCountryDropdownList(this.state.healthArea.realm.id)
                .then(response => {
                    if (response.status == 200) {
                        var json = response.data;
                        var regList = [{ value: "-1", label: i18n.t("static.common.all") }];
                        for (var i = 0; i < json.length; i++) {
                            regList[i + 1] = { value: json[i].id, label: json[i].label.label_en }
                        }
                        var listArray = regList;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.label.toUpperCase();
                            var itemLabelB = b.label.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            realmCountryList: listArray, loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
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
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
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
                        case 409:
                            this.setState({
                                message: i18n.t('static.common.accessDenied'),
                                loading: false,
                                color: "#BA0C2F",
                            });
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
     * Handles change event on realm country dropdown & filters the dropdown list
     * @param {Event} value - The change event.
     */
    updateFieldData(value) {
        var selectedArray = [];
        for (var p = 0; p < value.length; p++) {
            selectedArray.push(value[p].value);
        }
        if (selectedArray.includes("-1")) {
            this.setState({ realmCountryId: [] });
            var list = this.state.realmCountryList.filter(c => c.value != -1)
            this.setState({ realmCountryId: list });
            var realmCountryId = list;
        } else {
            this.setState({ realmCountryId: value });
            var realmCountryId = value;
        }
        let { healthArea } = this.state;
        var realmCountryIdArray = [];
        for (var i = 0; i < realmCountryId.length; i++) {
            realmCountryIdArray[i] = realmCountryId[i].value;
        }
        healthArea.realmCountryArray = realmCountryIdArray;
        this.setState({ healthArea: healthArea });
    }
    /**
     * Capitalizes the first letter of the health area name.
     * @param {string} str - The health area name.
     */
    Capitalize(str) {
        this.state.healthArea.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    /**
     * Renders the health/technical area details form.
     * @returns {JSX.Element} - health area details form.
     */
    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {(() => {
                            switch (this.state.languageId) {
                                case 2: return (item.label.label_pr !== null && item.label.label_pr !== "" ? item.label.label_pr : item.label.label_en);
                                case 3: return (item.label.label_fr !== null && item.label.label_fr !== "" ? item.label.label_fr : item.label.label_en);
                                case 4: return (item.label.label_sp !== null && item.label.label_sp !== "" ? item.label.label_sp : item.label.label_en);
                                default: return item.label.label_en;
                            }
                        })()}
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
                                initialValues={{
                                    healthAreaName: this.state.healthArea.label.label_en,
                                    healthAreaCode: this.state.healthArea.healthAreaCode,
                                    realmId: this.state.healthArea.realm.id,
                                    realmCountryId: this.state.healthArea.realmCountryArray
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    HealthAreaService.editHealthArea(this.state.healthArea)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/healthArea/listHealthArea/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                                        case 409:
                                                            this.setState({
                                                                message: i18n.t('static.common.accessDenied'),
                                                                loading: false,
                                                                color: "#BA0C2F",
                                                            });
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
                                        setFieldValue,
                                        setFieldTouched
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='healthAreaForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.healtharea.realm')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        bsSize="sm"
                                                        value={this.state.healthArea.realm.id}
                                                        valid={!errors.realmId}
                                                        invalid={touched.realmId && !!errors.realmId || this.state.healthArea.realm.realmId == ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        disabled
                                                        type="select" name="realmId" id="realmId">
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {realmList}
                                                    </Input>
                                                    <FormFeedback>{errors.realmId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup className="Selectcontrol-bdrNone">
                                                    <Label htmlFor="select">{i18n.t('static.healtharea.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.realmCountryId },
                                                            { 'is-invalid': (touched.realmCountryId && !!errors.realmCountryId || !!errors.realmCountryId) }
                                                        )}
                                                        bsSize="sm"
                                                        name="realmCountryId"
                                                        id="realmCountryId"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("realmCountryId", e);
                                                            this.updateFieldData(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("realmCountryId", true)}
                                                        multi
                                                        options={this.state.realmCountryList}
                                                        value={this.state.healthArea.realmCountryArray}
                                                    />
                                                    <FormFeedback>{errors.realmCountryId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="company">{i18n.t('static.healthArea.healthAreaName')}<span class="red Reqasterisk">*</span> </Label>
                                                    <Input
                                                        bsSize="sm"
                                                        valid={!errors.healthAreaName}
                                                        invalid={touched.healthAreaName && !!errors.healthAreaName || !!errors.healthAreaName}
                                                        type="text" name="healthAreaName"
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.healthArea.label.label_en}
                                                        id="healthAreaName" />
                                                    <FormFeedback className="red">{errors.healthAreaName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="company">{i18n.t('static.technicalArea.technicalAreaDisplayName')}<span class="red Reqasterisk">*</span> </Label>
                                                    <Input
                                                        bsSize="sm"
                                                        type="text" name="healthAreaCode"
                                                        valid={!errors.healthAreaCode}
                                                        invalid={touched.healthAreaCode && !!errors.healthAreaCode || !!errors.healthAreaCode}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        maxLength={6}
                                                        value={this.state.healthArea.healthAreaCode}
                                                        id="healthAreaCode" />
                                                    <FormFeedback className="red">{errors.healthAreaCode}</FormFeedback>
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
                                                            checked={this.state.healthArea.active === true}
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
                                                            checked={this.state.healthArea.active === false}
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
                                                    <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                    <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
     * Redirects to the list technical/health area when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/healthArea/listHealthArea/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the health area details form when reset button is clicked.
     */
    resetClicked() {
        //Fetch health area details by Id
        HealthAreaService.getHealthAreaById(this.props.match.params.healthAreaId).then(response => {
            this.setState({
                healthArea: response.data
            })
            initialValues = {
                healthAreaName: this.state.healthArea.label.label_en,
                realmId: this.state.healthArea.realm.id
            }
            //Fetch realm list
            UserService.getRealmList()
                .then(response => {
                    this.setState({
                        realms: response.data
                    })
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
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
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
            //Fetch realm country list by realmId
            HealthAreaService.getRealmCountryList(this.state.healthArea.realm.id)
                .then(response => {
                    if (response.status == 200) {
                        var json = response.data;
                        json = json.filter(c => c.active)
                        var regList = [{ value: "-1", label: i18n.t("static.common.all") }];
                        for (var i = 0; i < json.length; i++) {
                            regList[i + 1] = { value: json[i].realmCountryId, label: json[i].country.label.label_en }
                        }
                        this.setState({
                            realmCountryList: regList
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode
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
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
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
                        case 409:
                            this.setState({
                                message: i18n.t('static.common.accessDenied'),
                                loading: false,
                                color: "#BA0C2F",
                            });
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
