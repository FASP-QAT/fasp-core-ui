import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants';
import CountryService from '../../api/CountryService';
import HealthAreaService from '../../api/HealthAreaService';
import JiraTikcetService from '../../api/JiraTikcetService';
import RealmCountryService from '../../api/RealmCountryService';
import UserService from '../../api/UserService';
import i18n from '../../i18n';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.healtharea.healtharea"))
let summaryText_2 = "Add Technical Area"
/**
 * This const is used to define the validation schema for technical area ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.realm.realmName')))),
        countryName: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
        technicalAreaName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.healtharea.healthareatext')),
        technicalAreaCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .max(6, i18n.t('static.organisation.organisationcodemax6digittext'))
            .required(i18n.t('static.common.displayName')),
    })
}
/**
 * This component is used to display the technial area form and allow user to submit the add master request in jira
 */
export default class TechnicalAreaTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            technicalArea: {
                summary: summaryText_1,
                realmName: "",
                countryName: [],
                technicalAreaName: "",
                technicalAreaCode: "",
                notes: ""
            },
            lang: localStorage.getItem('lang'),
            message: '',
            realms: [],
            countryList: [],
            realmId: '',
            countryId: '',
            countries: [],
            realmCountryList: [],
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.getRealmCountryList = this.getRealmCountryList.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.getDisplayName = this.getDisplayName.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { technicalArea } = this.state
        if (event.target.name == "summary") {
            technicalArea.summary = event.target.value;
        }
        if (event.target.name == "realmName") {
            technicalArea.realmName = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "technicalAreaName") {
            technicalArea.technicalAreaName = event.target.value;
        }
        if (event.target.name == "technicalAreaCode") {
            technicalArea.technicalAreaCode = event.target.value.toUpperCase();
        }
        if (event.target.name == "notes") {
            technicalArea.notes = event.target.value;
        }
        this.setState({
            technicalArea
        }, () => { })
    };
    /**
     * This function is used to get country and realm list on page load
     */
    componentDidMount() {
        CountryService.getCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        countries: response.data, loading: false
                    })
                }
                else {
                    this.setState({
                        message: response.data.messageCode
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
        UserService.getRealmList()
            .then(response => {
                this.setState({
                    realms: response.data,
                    realmId: this.props.items.userRealmId, loading: false
                });
                if (this.props.items.userRealmId !== "") {
                    this.setState({
                        realms: (response.data).filter(c => c.realmId == this.props.items.userRealmId)
                    })
                    let { technicalArea } = this.state;
                    technicalArea.realmName = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                    this.setState({
                        technicalArea
                    }, () => {
                        this.getRealmCountryList(this.props.items.userRealmId)
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
     * This function is called realm country is changed
     * @param {*} value This is value of realm country that is selected by the user
     */
    updateFieldData(value) {
        let { technicalArea } = this.state;
        this.setState({ countryId: value });
        var realmCountryId = value;
        var realmCountryIdArray = [];
        for (var i = 0; i < realmCountryId.length; i++) {
            realmCountryIdArray[i] = realmCountryId[i].label;
        }
        technicalArea.countryName = realmCountryIdArray;
        this.setState({ technicalArea: technicalArea });
    }
    /**
     * This function is used to get the realm country list based on realm
     * @param {*} realmId This is the realm Id for which realm country list will appear
     */
    getRealmCountryList(realmId) {
        if (realmId !== "") {
            RealmCountryService.getRealmCountryForProgram(realmId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.realmCountry.label, this.state.lang).toUpperCase(); 
                            var itemLabelB = getLabelText(b.realmCountry.label, this.state.lang).toUpperCase(); 
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        var json = listArray;
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].realmCountry.id, label: getLabelText(json[i].realmCountry.label, this.state.lang) }
                        }
                        this.setState({
                            countryId: '',
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
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when reset button is clicked to reset the technical area details
     */
    resetClicked() {
        let { technicalArea } = this.state;
        technicalArea.realmName = this.props.items.userRealmId !== "" ? this.state.realms.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        technicalArea.countryName = '';
        technicalArea.technicalAreaName = '';
        technicalArea.technicalAreaCode = '';
        technicalArea.notes = '';
        this.setState({
            technicalArea: technicalArea,
            realmId: this.props.items.userRealmId,
            countryId: ''
        },
            () => { });
    }
    /**
     * This function is used to capitalize the first letter of the unit name
     * @param {*} str This is the name of the unit
     */
    Capitalize(str) {
        this.state.technicalArea.technicalAreaName = str.charAt(0).toUpperCase() + str.slice(1)
    }
    /**
     * This function is used to get the display name for technical area
     * @param {*} event This is the on change event
     */
    getDisplayName(event) {
        let realmId = this.state.realmId;
        let healthAreaValue = this.state.technicalArea.technicalAreaName;
        healthAreaValue = healthAreaValue.replace(/[^A-Za-z0-9]/g, "");
        healthAreaValue = healthAreaValue.trim().toUpperCase();
        if (realmId != 0 && healthAreaValue.length != 0) {
            if (healthAreaValue.length >= 6) {
                healthAreaValue = healthAreaValue.slice(0, 4);
                HealthAreaService.getHealthAreaDisplayName(realmId, healthAreaValue)
                    .then(response => {
                        let { technicalArea } = this.state
                        technicalArea.technicalAreaCode = response.data;
                        this.setState({
                            technicalArea
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
                HealthAreaService.getHealthAreaDisplayName(realmId, healthAreaValue)
                    .then(response => {
                        let { technicalArea } = this.state
                        technicalArea.technicalAreaCode = response.data;
                        this.setState({
                            technicalArea
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
     * This is used to display the content
     * @returns This returns technical area details form
     */
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
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.healtharea.healtharea')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            realmName: this.state.realmId,
                            countryName: this.state.countryId,
                            technicalAreaName: this.state.technicalArea.technicalAreaName,
                            technicalAreaCode: this.state.technicalArea.technicalAreaCode,
                            notes: this.state.technicalArea.notes
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.technicalArea.summary = summaryText_2;
                            this.state.technicalArea.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.technicalArea).then(response => {
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
                                setFieldValue,
                                setFieldTouched
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.technicalArea.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.technicalArea.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmName">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmName" id="realmName"
                                            bsSize="sm"
                                            valid={!errors.realmName && this.state.technicalArea.realmName != ''}
                                            invalid={touched.realmName && !!errors.realmName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getRealmCountryList(e.target.value) }}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup className="Selectcontrol-bdrNone">
                                        <Label for="countryName">{i18n.t('static.country.countryName')}<span class="red Reqasterisk">*</span></Label>
                                        <Select
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.countryName && this.state.technicalArea.countryName.length != 0 },
                                                { 'is-invalid': (touched.countryName && !!errors.countryName) }
                                            )}
                                            name="countryName" id="countryName"
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); setFieldValue("countryName", e); this.updateFieldData(e); }}
                                            onBlur={() => setFieldTouched("countryName", true)}
                                            multi
                                            options={this.state.realmCountryList}
                                            value={this.state.countryId}
                                            required />
                                        <FormFeedback className="red">{errors.countryName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="technicalAreaName">{i18n.t('static.healthArea.healthAreaName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="technicalAreaName" id="technicalAreaName"
                                            bsSize="sm"
                                            valid={!errors.technicalAreaName && this.state.technicalArea.technicalAreaName != ''}
                                            invalid={touched.technicalAreaName && !!errors.technicalAreaName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value); this.getDisplayName() }}
                                            onBlur={(e) => { handleBlur(e); }}
                                            value={this.state.technicalArea.technicalAreaName}
                                            required />
                                        <FormFeedback className="red">{errors.technicalAreaName}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="technicalAreaCode">{i18n.t('static.technicalArea.technicalAreaCode')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="technicalAreaCode" id="technicalAreaCode"
                                            bsSize="sm"
                                            valid={!errors.technicalAreaCode && this.state.technicalArea.technicalAreaCode !== ""}
                                            invalid={touched.technicalAreaCode && !!errors.technicalAreaCode}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={6}
                                            value={this.state.technicalArea.technicalAreaCode}
                                            required
                                        />
                                        <FormFeedback className="red">{errors.technicalAreaCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.technicalArea.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.technicalArea.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1"><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
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