import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import UnitService from '../../api/UnitService';
import TracerCategoryService from '../../api/TracerCategoryService';
import getLabelText from '../../CommonComponent/getLabelText';
import ProductService from '../../api/ProductService';
import RealmService from '../../api/RealmService';

const initialValues = {
    summary: "Add / Update Forecasting Unit",
    realm: "",
    tracerCategory: "",
    productCategory: "",
    forecastingUnitDesc: "",
    genericName: "",
    unit: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .required(i18n.t('static.common.summarytext')),
        realm: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        tracerCategory: Yup.string()
            .required(i18n.t('static.tracercategory.tracercategoryText')),
        productCategory: Yup.string()
            .required(i18n.t('static.common.selectProductCategory')),
        forecastingUnitDesc: Yup.string()
            .required(i18n.t('static.forecastingunit.forecastingunittext')),
        genericName: Yup.string()
            .required(i18n.t('static.product.generictext')),
        unit: Yup.string()
            .required(i18n.t('static.procurementUnit.validUnitIdText')),
        // notes: Yup.string()
        //     .required(i18n.t('static.common.notestext'))
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

export default class ForecastingUnitTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            forecastingUnit: {
                summary: 'Add / Update Forecasting Unit',
                realm: "",
                tracerCategory: "",
                productCategory: "",
                forecastingUnitDesc: "",
                genericName: "",
                unit: "",
                notes: ''
            },
            message: '',
            realms: [],
            realmId: '',
            units: [],
            unitId: '',
            tracerCategories: [],
            tracerCategoryId: '',
            productCategories: [],
            productCategoryId: ''
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getProductCategoryByRealmId = this.getProductCategoryByRealmId.bind(this);
    }

    dataChange(event) {
        let { forecastingUnit } = this.state
        if (event.target.name == "summary") {
            forecastingUnit.summary = event.target.value;
        }
        if (event.target.name == "realm") {
            forecastingUnit.realm = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realmId: event.target.value
            })
        }
        if (event.target.name == "tracerCategory") {
            forecastingUnit.tracerCategory = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                tracerCategoryId: event.target.value
            })
        }
        if (event.target.name == "productCategory") {
            forecastingUnit.productCategory = event.target.options[event.target.selectedIndex].innerHTML;
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
            forecastingUnit.unit = event.target.options[event.target.selectedIndex].innerHTML;
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

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            realm: "",
            tracerCategory: "",
            productCategory: "",
            forecastingUnitDesc: "",
            genericName: "",
            unit: "",
            notes: true
        })
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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
        AuthenticationService.setupAxiosInterceptors();
        UnitService.getUnitListAll()
            .then(response => {
                this.setState({
                    units: response.data
                })
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response.status) {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );
        RealmService.getRealmListAll()
            .then(response => {
                this.setState({
                    realms: response.data
                })
            })

        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                this.setState({
                    tracerCategories: response.data
                })
            })
    }

    getProductCategoryByRealmId() {
        let realmId = document.getElementById("realm").value;
        ProductService.getProductCategoryList(realmId)
            .then(response => {                
                this.setState({
                    productCategories: response.data
                })
            })
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { forecastingUnit } = this.state;
        forecastingUnit.summary = '';
        forecastingUnit.tracerCategory = '';
        forecastingUnit.productCategory = '';
        forecastingUnit.forecastingUnitDesc = '';
        forecastingUnit.genericName = '';
        forecastingUnit.unit = '';
        forecastingUnit.notes = '';
        this.setState({
            forecastingUnit
        },
            () => { });
    }

    render() {

        const { units } = this.state;
        let unitList = units.length > 0
            && units.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
                        {item.label.label_en}
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
                    <option key={i} value={item.payload.productCategoryId}>
                        {getLabelText(item.payload.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (
            <div className="col-md-12">
                <h5 style={{ color: "green" }} id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.forecastingunit.forecastingunit')}</h4>
                <br></br>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        JiraTikcetService.addEmailRequestIssue(this.state.forecastingUnit).then(response => {
                            var msg = "Your query has been raised. Ticket Code: "+response.data.key;
                            if (response.status == 200 || response.status == 201) {
                                this.setState({
                                    message: msg
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })
                                alert(this.state.message);
                            } else {
                                this.setState({
                                    // message: response.data.messageCode
                                    message: 'Error while creating query'
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })
                                alert(this.state.message);
                            }
                            this.props.togglehelp();
                        })
                            .catch(
                                error => {
                                    switch (error.message) {
                                        case "Network Error":
                                            this.setState({
                                                message: 'Network Error'
                                            })
                                            break
                                        default:
                                            this.setState({
                                                message: 'Error'
                                            })
                                            break
                                    }
                                    alert(this.state.message);
                                    this.props.togglehelp();
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
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm'>
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary"
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
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getProductCategoryByRealmId() }}
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
                                            value={this.state.forecastingUnit.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter>
                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.props.toggleMaster}>{i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
            </div>
        );
    }

}