import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPACE_REGEX } from '../../Constants';
import JiraTikcetService from '../../api/JiraTikcetService';
import ProductService from '../../api/ProductService';
import RealmService from '../../api/RealmService';
import TracerCategoryService from '../../api/TracerCategoryService';
import UnitService from '../../api/UnitService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.forecastingunit.forecastingunit"))
let summaryText_2 = "Add Forecasting Unit"
const initialValues = {
    summary: "",
    realm: "",
    tracerCategory: "",
    productCategory: "",
    forecastingUnitDesc: "",
    genericName: "",
    unit: "",
    notes: "",
    priority: 3
}
/**
 * This const is used to define the validation schema for forecasting unit ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        realm: Yup.string()
            .required(i18n.t('static.common.realmtext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.realm.realmName')))),
        tracerCategory: Yup.string()
            .required(i18n.t('static.tracercategory.tracercategoryText').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.tracercategory.tracercategory')))),
        productCategory: Yup.string()
            .required(i18n.t('static.common.selectProductCategory').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.productcategory.productcategory')))),
        forecastingUnitDesc: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.forecastingunit.forecastingunittext')),
        genericName: Yup.string()
            .required(i18n.t('static.product.generictext'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string')),
        unit: Yup.string()
            .required(i18n.t('static.procurementUnit.validUnitIdText')),
    })
}
/**
 * This component is used to display the forecasting unit form and allow user to submit the add master request in jira
 */
export default class ForecastingUnitTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forecastingUnit: {
                summary: summaryText_1,
                realm: "",
                tracerCategory: "",
                productCategory: "",
                forecastingUnitDesc: "",
                genericName: "",
                unit: "",
                notes: '',
                priority: 3
            },
            lang: localStorage.getItem('lang'),
            message: '',
            realms: [],
            realmId: '',
            units: [],
            unitId: '',
            tracerCategories: [],
            tracerCategoryId: '',
            productCategories: [],
            productCategoryId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getProductCategoryByRealmId = this.getProductCategoryByRealmId.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { forecastingUnit } = this.state
        if (event.target.name == "summary") {
            forecastingUnit.summary = event.target.value;
        }
        if (event.target.name == "realm") {
            forecastingUnit.realm = event.target.value !== "" ? this.state.realms.filter(c => c.realmId == event.target.value)[0].label.label_en : "";
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "tracerCategory") {
            forecastingUnit.tracerCategory = event.target.value !== "" ? this.state.tracerCategories.filter(c => c.tracerCategoryId == event.target.value)[0].label.label_en : "";
            this.setState({
                tracerCategoryId: event.target.value
            })
        }
        if (event.target.name == "productCategory") {
            forecastingUnit.productCategory = event.target.value !== "" ? this.state.productCategories.filter(c => c.payload.productCategoryId == event.target.value)[0].payload.label.label_en : "";
            this.setState({
                productCategoryId: event.target.value
            })
        }
        if (event.target.name == "forecastingUnitDesc") {
            forecastingUnit.forecastingUnitDesc = event.target.value;
        }
        if (event.target.name == "genericName") {
            forecastingUnit.genericName = event.target.value;
        }
        if (event.target.name == "unit") {
            forecastingUnit.unit = this.state.units.filter(c => c.unitId == event.target.value)[0].label.label_en;
            this.setState({
                unitId: event.target.value
            })
        }
        if (event.target.name == "notes") {
            forecastingUnit.notes = event.target.value;
        }
        this.setState({
            forecastingUnit
        }, () => { })
    };
    /**
     * This function is used to get the unit,realm,tracer category, product category list on page load
     */
    componentDidMount() {
        UnitService.getUnitListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    units: listArray, loading: false
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
        RealmService.getRealmListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
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
                    let { forecastingUnit } = this.state;
                    forecastingUnit.realm = (response.data).filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en;
                    this.setState({
                        forecastingUnit
                    }, () => {
                        this.getProductCategoryByRealmId(this.props.items.userRealmId);
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
        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    tracerCategories: listArray, loading: false
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
     * This function is used to get product category list based on realm Id
     * @param {*} realmId This is realm Id for which product category list should appear
     */
    getProductCategoryByRealmId(realmId) {
        if (realmId != "") {
            ProductService.getProductCategoryList(realmId)
                .then(response => {
                    this.setState({
                        productCategories: response.data
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
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { forecastingUnit } = this.state;
        forecastingUnit.priority = newState;
        this.setState(
            {
                forecastingUnit
            }, () => {
                // console.log('priority - state : '+this.state.forecastingUnit.priority);
            }
        );
    }

    /**
     * This function is called when reset button is clicked to reset the forecasting unit details
     */
    resetClicked() {
        let { forecastingUnit } = this.state;
        forecastingUnit.realm = this.props.items.userRealmId !== "" ? this.state.realms.filter(c => c.realmId == this.props.items.userRealmId)[0].label.label_en : "";
        forecastingUnit.tracerCategory = '';
        forecastingUnit.productCategory = '';
        forecastingUnit.forecastingUnitDesc = '';
        forecastingUnit.genericName = '';
        forecastingUnit.unit = '';
        forecastingUnit.notes = '';
        this.setState({
            forecastingUnit: forecastingUnit,
            realmId: this.props.items.userRealmId,
            unitId: '',
            tracerCategoryId: '',
            productCategoryId: ''
        },
            () => { });
    }
    /**
     * This is used to display the content
     * @returns This returns forecasting unit details form
     */
    render() {
        const { units } = this.state;
        let unitList = units.length > 0
            && units.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { tracerCategories } = this.state;
        let tracerCategoryList = tracerCategories.length > 0
            && tracerCategories.map((item, i) => {
                return (
                    <option key={i} value={item.tracerCategoryId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { productCategories } = this.state;
        let productCategoryList = productCategories.length > 0
            && productCategories.map((item, i) => {
                    return (
                        <option key={i} value={item.payloadId}>
                            {getLabelText(item.payload.label, this.state.lang)}
                        </option>
                    )
            }, this);
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.forecastingunit.forecastingunit')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            realm: this.props.items.userRealmId,
                            tracerCategory: "",
                            productCategory: "",
                            forecastingUnitDesc: "",
                            genericName: "",
                            unit: "",
                            notes: "",
                            priority: 3
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.forecastingUnit.summary = summaryText_2;
                            this.state.forecastingUnit.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.forecastingUnit).then(response => {
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
                                handleReset
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.forecastingUnit.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.forecastingUnit.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="realm">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="realm" id="realm"
                                            bsSize="sm"
                                            valid={!errors.realm && this.state.forecastingUnit.realm != ''}
                                            invalid={touched.realm && !!errors.realm}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getProductCategoryByRealmId(e.target.value) }}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        <FormFeedback className="red">{errors.realm}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="tracerCategory">{i18n.t('static.tracercategory.tracercategory')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="tracerCategory" id="tracerCategory"
                                            bsSize="sm"
                                            valid={!errors.tracerCategory && this.state.forecastingUnit.tracerCategory != ''}
                                            invalid={touched.tracerCategory && !!errors.tracerCategory}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.tracerCategoryId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {tracerCategoryList}
                                        </Input>
                                        <FormFeedback className="red">{errors.tracerCategory}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="productCategory">{i18n.t('static.productcategory.productcategory')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="productCategory" id="productCategory"
                                            bsSize="sm"
                                            valid={!errors.productCategory && this.state.forecastingUnit.productCategory != ''}
                                            invalid={touched.productCategory && !!errors.productCategory}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.productCategoryId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {productCategoryList}
                                        </Input>
                                        <FormFeedback className="red">{errors.productCategory}</FormFeedback>
                                    </FormGroup>
                                    < FormGroup >
                                        <Label for="forecastingUnitDesc">{i18n.t('static.forecastingUnit.forecastingUnitName')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="forecastingUnitDesc" id="forecastingUnitDesc"
                                            bsSize="sm"
                                            valid={!errors.forecastingUnitDesc && this.state.forecastingUnit.forecastingUnitDesc != ''}
                                            invalid={touched.forecastingUnitDesc && !!errors.forecastingUnitDesc}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.forecastingUnit.forecastingUnitDesc}
                                            required />
                                        <FormFeedback className="red">{errors.forecastingUnitDesc}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="genericName">{i18n.t('static.product.productgenericname')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="genericName" id="genericName"
                                            bsSize="sm"
                                            valid={!errors.genericName && this.state.forecastingUnit.genericName != ''}
                                            invalid={touched.genericName && !!errors.genericName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.forecastingUnit.genericName}
                                            required />
                                        <FormFeedback className="red">{errors.genericName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="unit">{i18n.t('static.unit.unit')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="select" name="unit" id="unit"
                                            bsSize="sm"
                                            valid={!errors.unit && this.state.forecastingUnit.unit != ''}
                                            invalid={touched.unit && !!errors.unit}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.unitId}
                                            required >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {unitList}
                                        </Input>
                                        <FormFeedback className="red">{errors.unit}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.forecastingUnit.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.forecastingUnit.notes}
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.forecastingUnit.priority} updatePriority={this.updatePriority} errors={errors} touched={touched}/>
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