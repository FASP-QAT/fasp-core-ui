import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX } from '../../Constants';
import HealthAreaService from '../../api/HealthAreaService';
import JiraTikcetService from '../../api/JiraTikcetService';
import ProgramService from '../../api/ProgramService';
import i18n from '../../i18n';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.dashboad.regioncountry"))
let summaryText_2 = "Add Realm Country Region"
/**
 * This const is used to define the validation schema for realm country region ticket component
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
        realmCountryId: Yup.string()
            .required(i18n.t('static.healtharea.countrytext')),
        regionId: Yup.string()
            .required(i18n.t('static.region.validregion')),
        capacity: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            .required(i18n.t('static.region.capacitycbmtext')),
        glnCode: Yup.string()
            .required(i18n.t('static.region.glntext')),
    })
}
/**
 * This component is used to display the realm country region form and allow user to submit the add master request in jira
 */
export default class RealmCountryRegionTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realmCountryRegion: {
                summary: summaryText_1,
                realmId: '',
                realmCountryId: "",
                regionId: "",
                capacity: "",
                glnCode: "",
                notes: ""
            },
            lang: localStorage.getItem('lang'),
            message: '',
            realmCountries: [],
            realmCountryId: '',
            loading: true,
            realmId: '',
            realmList: [],
            countryList: []
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getDependentLists = this.getDependentLists.bind(this);
        this.changeRealmCountry = this.changeRealmCountry.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { realmCountryRegion } = this.state
        if (event.target.name == "summary") {
            realmCountryRegion.summary = event.target.value;
        }
        if (event.target.name == "realmId") {
            realmCountryRegion.realmId = event.target.value !== "" ? this.state.realmList.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.state.realmId = event.target.value
        }
        if (event.target.name == "realmCountryId") {
            realmCountryRegion.realmCountryId = event.target.value !== "" ? this.state.realmCountries.filter(c => c.realmCountryId == event.target.value)[0].country.label.label_en : "";
            this.setState({
                realmCountryId: event.target.value
            })
        }
        if (event.target.name == "regionId") {
            realmCountryRegion.regionId = event.target.value;
        }
        if (event.target.name == "capacity") {
            realmCountryRegion.capacity = event.target.value;
        }
        if (event.target.name == "glnCode") {
            realmCountryRegion.glnCode = event.target.value;
        }
        if (event.target.name == "notes") {
            realmCountryRegion.notes = event.target.value;
        }
        this.setState({
            realmCountryRegion
        }, () => { })
    };
    /**
     * This function is called realm country is changed
     * @param {*} event This is the on change event
     */
    changeRealmCountry(event) {
        if (event === null) {
            let { realmCountryRegion } = this.state;
            realmCountryRegion.realmCountryId = ''
            this.setState({
                realmCountryRegion: realmCountryRegion,
                realmCountryId: ''
            });
        } else {
            let { realmCountryRegion } = this.state;
            var outText = "";
            if (event.value !== "") {
                var realmCountryT = this.state.realmCountries.filter(c => c.realmCountryId == event.value)[0];
                outText = realmCountryT.country.label.label_en;
            }
            realmCountryRegion.realmCountryId = outText;
            this.setState({
                realmCountryRegion: realmCountryRegion,
                realmCountryId: event.value
            });
        }
    }
    /**
     * This function is used to get realm country list
     * @param {*} realmId This the realm Id for which the list should appear
     */
    getDependentLists(realmId) {
        if (realmId != "") {
            ProgramService.getRealmCountryList(realmId)
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); 
                            var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); 
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        var countryList = [];
                        for (var i = 0; i < listArray.length; i++) {
                            countryList[i] = { value: listArray[i].realmCountryId, label: getLabelText(listArray[i].country.label, this.state.lang) }
                        }
                        this.setState({
                            realmCountries: listArray,
                            countryList: countryList,
                            loading: false
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
     * This function is used to get the realm list on page load
     */
    componentDidMount() {
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmList: listArray,
                        realmId: this.props.items.userRealmId, loading: false
                    });
                    if (this.props.items.userRealmId !== "") {
                        this.setState({
                            realms: (response.data).filter(c => c.realmId == this.props.items.userRealmId)
                        })
                        let { realmCountryRegion } = this.state;
                        realmCountryRegion.realmId = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                        this.setState({
                            realmCountryRegion
                        }, () => {
                            this.getDependentLists(this.props.items.userRealmId);
                        })
                    }
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
     * This function is called when reset button is clicked to reset the realm country region details
     */
    resetClicked() {
        let { realmCountryRegion } = this.state;
        realmCountryRegion.realmCountryId = '';
        realmCountryRegion.regionId = '';
        realmCountryRegion.realmId = this.props.items.userRealmId !== "" ? this.state.realmList.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        realmCountryRegion.capacity = '';
        realmCountryRegion.glnCode = '';
        realmCountryRegion.notes = '';
        this.setState({
            realmCountryRegion: realmCountryRegion,
            realmCountryId: '',
            realmId: this.props.items.userRealmId
        },
            () => { });
    }
    /**
     * This is used to display the content
     * @returns This returns realm country region details form
     */
    render() {
        const { realmList } = this.state;
        const { realmCountries } = this.state;
        let realms = realmList.length > 0
            && realmList.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.dashboad.regioncountry')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            realmId: this.props.items.userRealmId,
                            realmCountryId: "",
                            regionId: "",
                            capacity: "",
                            glnCode: "",
                            notes: ""
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.realmCountryRegion.summary = summaryText_2;
                            this.state.realmCountryRegion.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.realmCountryRegion).then(response => {
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
                                            valid={!errors.summary && this.state.realmCountryRegion.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegion.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="realmId">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realmId" id="realmId"
                                            bsSize="sm"
                                            valid={!errors.realmId && this.state.realmCountryRegion.realmId != ''}
                                            invalid={touched.realmId && !!errors.realmId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDependentLists(e.target.value) }}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realms}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="realmCountryId">{i18n.t('static.dashboard.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                        <Select
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.realmCountryId && this.state.realmCountryRegion.realmCountryId != '' },
                                                { 'is-invalid': (touched.realmCountryId && !!errors.realmCountryId) }
                                            )}
                                            bsSize="sm"
                                            name="realmCountryId"
                                            id="realmCountryId"
                                            isClearable={false}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("realmCountryId", e);
                                                this.changeRealmCountry(e)
                                            }}
                                            onBlur={() => setFieldTouched("realmCountryId", true)}
                                            required
                                            min={1}
                                            options={this.state.countryList}
                                            value={this.state.realmCountryId}
                                        />
                                        <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="regionId">{i18n.t('static.region.regionName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="regionId" id="regionId"
                                            bsSize="sm"
                                            valid={!errors.regionId && this.state.realmCountryRegion.regionId != ''}
                                            invalid={touched.regionId && !!errors.regionId}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegion.regionId}
                                            required />
                                        <FormFeedback className="red">{errors.regionId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="capacity">{i18n.t('static.region.capacitycbm')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="number" name="capacity" id="capacity"
                                            bsSize="sm"
                                            valid={!errors.capacity && this.state.realmCountryRegion.capacity != ''}
                                            invalid={touched.capacity && !!errors.capacity}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegion.capacity}
                                            required />
                                        <FormFeedback className="red">{errors.capacity}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="glnCode">{i18n.t('static.region.gln')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="glnCode" id="glnCode"
                                            bsSize="sm"
                                            valid={!errors.glnCode && this.state.realmCountryRegion.glnCode != ''}
                                            invalid={touched.glnCode && !!errors.glnCode}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.realmCountryRegion.glnCode}
                                            required />
                                        <FormFeedback className="red">{errors.glnCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.realmCountryRegion.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.realmCountryRegion.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" disabled={!isValid}><i className="fa fa-check "></i> {i18n.t('static.common.submit')}</Button>
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