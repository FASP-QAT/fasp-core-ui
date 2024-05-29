import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX } from '../../Constants';
import CountryService from '../../api/CountryService';
import CurrencyService from '../../api/CurrencyService';
import JiraTikcetService from '../../api/JiraTikcetService';
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.ticket.realmcountry"))
let summaryText_2 = "Add Realm Country"
/**
 * This const is used to define the validation schema for realm country ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.realm.realmName')))),
        countryId: Yup.string()
            .required(i18n.t('static.healtharea.countrytext')),
        currencyId: Yup.string()
            .required(i18n.t('static.country.currencytext')),
    })
}
/**
 * This component is used to display the realm country form and allow user to submit the add master request in jira
 */
export default class RealmCountryTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realmCountry: {
                summary: summaryText_1,
                realmId: "",
                countryId: "",
                currencyId: "",
                notes: "",
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            message: '',
            realms: [],
            countries: [],
            currencies: [],
            realm: '',
            country: '',
            currency: '',
            countriesList: [],
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changeCountry = this.changeCountry.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { realmCountry } = this.state
        if (event.target.name == "summary") {
            realmCountry.summary = event.target.value;
        }
        if (event.target.name == "realmId") {
            realmCountry.realmId = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realm: event.target.value
            })
        }
        if (event.target.name == "countryId") {
            realmCountry.countryId = event.target.value !== "" ? this.state.countries.filter(c => c.countryId == event.target.value)[0].label.label_en : "";
            this.setState({
                country: event.target.value
            })
        }
        if (event.target.name == "currencyId") {
            realmCountry.currencyId = event.target.value !== "" ? this.state.currencies.filter(c => c.currencyId == event.target.value)[0].label.label_en : "";
            this.setState({
                currency: event.target.value
            })
        }
        if (event.target.name == "notes") {
            realmCountry.notes = event.target.value;
        }
        this.setState({
            realmCountry
        }, () => { })
    };
    /**
     * This function is called when realm country is changed
     * @param {*} event This is the on change event
     */
    changeCountry(event) {
        if (event === null) {
            let { realmCountry } = this.state;
            realmCountry.countryId = ''
            this.setState({
                realmCountry: realmCountry,
                country: ''
            });
        } else {
            let { realmCountry } = this.state;
            var outText = "";
            if (event.value !== "") {
                var countryT = this.state.countries.filter(c => c.countryId == event.value)[0];
                outText = countryT.label.label_en;
            }
            realmCountry.countryId = outText;
            this.setState({
                realmCountry: realmCountry,
                country: event.value
            });
        }
    }
    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        console.log('priority - : '+newState);
        let { realmCountry } = this.state;
        realmCountry.priority = newState;
        this.setState(
            {
                realmCountry
            }, () => {

                console.log('priority - state : '+this.state.realmCountry.priority);
            }
        );
    }

    /**
     * This function is used to get realm, country and currency lists on page load
     */
    componentDidMount() {
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
                        realms: listArray,
                        realm: this.props.items.userRealmId, loading: false
                    });
                    if (this.props.items.userRealmId !== "") {
                        this.setState({
                            realms: (response.data).filter(c => c.realmId == this.props.items.userRealmId)
                        })
                        let { realmCountry } = this.state;
                        realmCountry.realmId = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                        this.setState({
                            realmCountry
                        }, () => {
                        })
                    }
                } else {
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
        CountryService.getCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    var countryList = [];
                    for (var i = 0; i < listArray.length; i++) {
                        countryList[i] = { value: listArray[i].countryId, label: getLabelText(listArray[i].label, this.state.lang) }
                    }
                    this.setState({
                        countries: listArray,
                        countriesList: countryList,
                        loading: false
                    })
                } else {
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
        CurrencyService.getCurrencyListActive().then(response => {
            if (response.status == 200) {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    currencies: listArray, loading: false
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
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when reset button is clicked to reset the realm country details
     */
    resetClicked() {
        let { realmCountry } = this.state;
        realmCountry.realmId = this.props.items.userRealmId !== "" ? this.state.realms.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        realmCountry.countryId = '';
        realmCountry.currencyId = '';
        realmCountry.notes = '';
        realmCountry.priority = 3;
        this.setState({
            realmCountry: realmCountry,
            realm: this.props.items.userRealmId,
            country: '',
            currency: ''
        },
            () => { });
    }
    /**
     * This is used to display the content
     * @returns This returns realm country details form
     */
    render() {
        const { realms } = this.state;
        const { currencies } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        let currencyList = currencies.length > 0
            && currencies.map((item, i) => {
                return (
                    <option key={i} value={item.currencyId}>{getLabelText(item.label, this.state.lang)}</option>
                )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.ticket.realmcountry')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            realmId: this.props.items.userRealmId,
                            countryId: "",
                            currencyId: "",
                            notes: "",
                            priority: 3
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.realmCountry.summary = summaryText_2;
                            this.state.realmCountry.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.realmCountry).then(response => {
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
                                            valid={!errors.summary && this.state.realmCountry.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountry.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmId">{i18n.t('static.realm.realmName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmId" id="realmId"
                                            bsSize="sm"
                                            valid={!errors.realmId && this.state.realmCountry.realmId != ''}
                                            invalid={touched.realmId && !!errors.realmId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realm}
                                            required>
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="countryId">{i18n.t('static.dashboard.country')}<span class="red Reqasterisk">*</span></Label>
                                        <Select
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.countryId && this.state.realmCountry.countryId != '' },
                                                { 'is-invalid': (touched.countryId && !!errors.countryId) }
                                            )}
                                            bsSize="sm"
                                            name="countryId"
                                            id="countryId"
                                            isClearable={false}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("countryId", e);
                                                this.changeCountry(e)
                                            }}
                                            onBlur={() => setFieldTouched("countryId", true)}
                                            required
                                            min={1}
                                            options={this.state.countriesList}
                                            value={this.state.country}
                                        />
                                        <FormFeedback className="red">{errors.countryId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="currencyId">{i18n.t('static.country.currency')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="currencyId" id="currencyId"
                                            bsSize="sm"
                                            valid={!errors.currencyId && this.state.realmCountry.currencyId != ''}
                                            invalid={touched.currencyId && !!errors.currencyId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.currency}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {currencyList}
                                        </Input>
                                        <FormFeedback className="red">{errors.currencyId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.realmCountry.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.realmCountry.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.realmCountry.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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