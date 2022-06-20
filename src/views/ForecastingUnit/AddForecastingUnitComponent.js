import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ForecastingUnitService from '../../api/ForecastingUnitService.js'
import RealmService from "../../api/RealmService";
import ProductService from '../../api/ProductService';
import TracerCategoryService from '../../api/TracerCategoryService';
import UnitService from "../../api/UnitService";
import { stringify } from 'querystring';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { SPACE_REGEX } from '../../Constants.js';

let initialValues = {
    realmId: [],
    productCategoryId: [],
    tracerCategoryId: [],
    unitId: [],
    label: ''
}
const entityname = i18n.t('static.forecastingunit.forecastingunit');
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        tracerCategoryId: Yup.string()
            .required(i18n.t('static.tracercategory.tracercategoryText')),
        productCategoryId: Yup.string()
            .required(i18n.t('static.productcategory.productcategorytext')),
        label: Yup.string()
            // .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.forecastingunit.forecastingunittext')),
        unitId: Yup.string()
            .required(i18n.t('static.product.productunittext')),
        genericLabel: Yup.string()
            // .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            // .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .matches(/^$|^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
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


export default class AddForecastingUnitComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            units: [],
            productcategories: [],
            tracerCategories: [],
            forecastingUnit:
            {
                active: '',
                realm: {
                    id: ''
                },
                label: {
                    label_en: '',
                    labelId: 0,
                }, genericLabel: {
                    label_en: '',
                    labelId: 0,
                },
                unit: { id: '' },
                productCategory: { id: '' },
                tracerCategory: { id: '' }
            },
            lang: localStorage.getItem('lang'),
            loading: true,
        }

        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.getProductCategoryByRealmId = this.getProductCategoryByRealmId.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    dataChange(event) {
        let { forecastingUnit } = this.state
        if (event.target.name === "label") {
            forecastingUnit.label.label_en = event.target.value
        }
        if (event.target.name == "realmId") {
            forecastingUnit.realm.id = event.target.value;
        }
        if (event.target.name == "tracerCategoryId") {
            forecastingUnit.tracerCategory.id = event.target.value;
        }
        if (event.target.name == "productCategoryId") {
            forecastingUnit.productCategory.id = event.target.value;
        }
        if (event.target.name == "genericLabel") {
            forecastingUnit.genericLabel.label_en = event.target.value;
        }
        if (event.target.name == "unitId") {
            forecastingUnit.unit.id = event.target.value;
        }

        this.setState(
            {
                forecastingUnit
            }, () => {
            }
        )
    };

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true,
            label: true,
            productCategoryId: true,
            tracerCategoryId: true,
            unitId: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('forecastingUnit', (fieldName) => {
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
        UnitService.getUnitListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    units: listArray, loading: false
                })
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
        RealmService.getRealmListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    realms: listArray,
                    loading: false
                })
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

        TracerCategoryService.getTracerCategoryListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    tracerCategories: listArray,
                    loading: false
                })
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

        // ProductService.getProductCategoryList()
        //     .then(response => {
        //         this.setState({
        //             productcategories: response.data
        //         })
        //     })


        let realmId = AuthenticationService.getRealmId();
        if (realmId != -1) {
            // document.getElementById('realmId').value = realmId;
            initialValues = {
                realmId: realmId
            }

            let { forecastingUnit } = this.state
            forecastingUnit.realm.id = realmId;
            document.getElementById("realmId").disabled = true;
            this.setState({
                forecastingUnit
            },
                () => {
                    this.getProductCategoryByRealmId()
                })
        }
    }

    Capitalize(str) {
        let { forecastingUnit } = this.state
        forecastingUnit.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    getProductCategoryByRealmId() {
        // let realmId = document.getElementById("realmId").value;
        let realmId = this.state.forecastingUnit.realm.id;
        if (realmId != "") {
            ProductService.getProductCategoryList(realmId)
                .then(response => {
                    console.log("productCategory------>", response.data.slice(1))
                    var listArray = response.data.slice(1);
                    console.log("RESPO----->1", listArray.length);
                    listArray = listArray.filter(c => c.payload.active.toString() == "true");
                    console.log("RESPO----->2", listArray.length);
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        // productcategories: response.data.slice(1),
                        productcategories: listArray
                    })
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
        } else {
            this.setState({
                productcategories: []
            })
        }
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
        const { productcategories } = this.state;
        let productCategoryList = productcategories.length > 0
            && productcategories.map((item, i) => {
                return (
                    <option key={i} value={item.payload.productCategoryId}>
                        {getLabelText(item.payload.label, this.state.lang)}
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
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    console.log(stringify(this.state.forecastingUnit))
                                    ForecastingUnitService.addForecastingUnit(this.state.forecastingUnit)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/forecastingUnit/listForecastingUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode,
                                                    loading: false
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
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='forecastingUnit' autocomplete="off">
                                                <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            valid={!errors.realmId && this.state.forecastingUnit.realm.id != ''}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getProductCategoryByRealmId() }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.forecastingUnit.realm.id}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="tracerCategoryId">{i18n.t('static.tracercategory.tracercategory')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="tracerCategoryId"
                                                            id="tracerCategoryId"
                                                            bsSize="sm"
                                                            valid={!errors.tracerCategoryId && this.state.forecastingUnit.tracerCategory.id != ''}
                                                            invalid={touched.tracerCategoryId && !!errors.tracerCategoryId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.forecastingUnit.tracerCategory.id}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {tracerCategoryList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.tracerCategoryId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="productCategoryId">{i18n.t('static.productcategory.productcategory')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="productCategoryId"
                                                            id="productCategoryId"
                                                            bsSize="sm"
                                                            valid={!errors.productCategoryId && this.state.forecastingUnit.productCategory.id != ''}
                                                            invalid={touched.productCategoryId && !!errors.productCategoryId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.forecastingUnit.productCategory.id}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {productCategoryList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.productCategoryId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.forecastingunit.forecastingunit')}<span className="red Reqasterisk">*</span></Label> <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label && this.state.forecastingUnit.label.label_en != ''}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.forecastingUnit.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="genericLabel">{i18n.t('static.product.productgenericname')}</Label>
                                                        <Input type="text"
                                                            name="genericLabel"
                                                            id="genericLabel"
                                                            bsSize="sm"
                                                            valid={!errors.genericLabel && this.state.forecastingUnit.genericLabel.label_en != ''}
                                                            invalid={touched.genericLabel && !!errors.genericLabel}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.forecastingUnit.genericLabel.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.genericLabel}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="unitId">{i18n.t('static.unit.unit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="unitId"
                                                            id="unitId"
                                                            bsSize="sm"
                                                            value={this.state.forecastingUnit.unit.id}
                                                            valid={!errors.unitId && this.state.forecastingUnit.unit.id != ''}
                                                            invalid={touched.unitId && !!errors.unitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required>
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {unitList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.unitId}</FormFeedback>
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

                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />

                        </Card>
                    </Col>
                </Row>

                <div>
                    <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6>
                </div>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/forecastingUnit/listForecastingUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { forecastingUnit } = this.state

        forecastingUnit.label.label_en = ''
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            forecastingUnit.realm.id = ''
        }
        forecastingUnit.tracerCategory.id = ''
        forecastingUnit.productCategory.id = ''
        forecastingUnit.genericLabel.label_en = ''

        this.setState(
            {
                forecastingUnit
            }, () => {
            }
        )

    }
}
