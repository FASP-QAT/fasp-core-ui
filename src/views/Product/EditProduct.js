import { Formik } from 'formik';
import React, { Component } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input, InputGroupAddon, InputGroupText,
    Label,
    Row
} from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants';
import ProductService from '../../api/ProductService';
import RealmServcie from '../../api/RealmService';
import UnitService from '../../api/UnitService';
import i18n from '../../i18n';
import '../Forms/ValidationForms/ValidationForms.css';
let initialValues = {
    productName: '',
    genericName: '',
    realmId: '',
    productCategoryId: '',
    unitId: ''
}
const entityname = i18n.t('static.product.product')
const validationSchema = function (values) {
    return Yup.object().shape({
        productName: Yup.string()
            .required(i18n.t('static.product.productnametext')),
        genericName: Yup.string()
            .required(i18n.t('static.product.generictext')),
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        productCategoryId: Yup.string()
            .required(i18n.t('static.product.productcategorytext')),
        unitId: Yup.string()
            .required(i18n.t('static.product.productunittext'))
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
export default class EditProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            product: {
                label: {
                    label_en: ''
                },
                genericLabel: {
                    label_en: ''
                },
                realm: {
                    realmId: ''
                },
                productCategory: {
                    productCategoryId: ''
                },
                forecastingUnit: {
                    unitId: ''
                }
            },
            lan: localStorage.getItem('lang'),
            realmList: [],
            productCategoryList: [],
            unitList: [],
            message: ''
        }
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getDependentLists = this.getDependentLists.bind(this);
    }
    componentDidMount() {
        ProductService.getProductDataById(this.props.match.params.productId)
            .then(response => {
                if (response.status == 200) {
                    var product = response.data;
                    this.setState({ product: product });
                    initialValues = {
                        productName: getLabelText(product.label, this.state.lan),
                        genericName: getLabelText(product.genericLabel, this.state.lan),
                        realmId: product.realm.realmId,
                        productCategoryId: product.productCategory.productCategoryId,
                        unitId: product.forecastingUnit.unitId,
                    }
                    ProductService.getProdcutCategoryListByRealmId(this.state.product.realm.realmId)
                        .then(response => {
                            if (response.status == 200) {
                                this.setState({
                                    productCategoryList: response.data
                                })
                            } else {
                                this.setState({ message: response.data.messageCode })
                            }
                        })
                        .catch(
                            error => {
                                if (error.message === "Network Error") {
                                    this.setState({
                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                    });
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
                } else {
                    this.setState({ message: response.data.messageCode })
                }
            })
            .catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            })
                            break
                        default:
                            this.setState({
                                message: error.message
                            })
                            break
                    }
                }
            );
        RealmServcie.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmList: response.data
                    })
                } else {
                    this.setState({ message: response.data.messageCode })
                }
            })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        });
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
        UnitService.getUnitListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        unitList: response.data
                    })
                } else {
                    this.setState({ message: response.data.messageCode })
                }
            })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        });
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
    }
    getDependentLists(event) {
        ProductService.getProdcutCategoryListByRealmId(event.target.value)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        productCategoryList: response.data
                    })
                } else {
                    this.setState({ message: response.data.messageCode })
                }
            })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        });
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
    }
    dataChange(event) {
        let { product } = this.state;
        if (event.target.name === "productName") {
            product.label.label_en = event.target.value;
        }
        if (event.target.name === "genericName") {
            product.genericLabel.label_en = event.target.value;
        }
        if (event.target.name === "realmId") {
            product.realm.realmId = event.target.value;
        }
        if (event.target.name === "productCategoryId") {
            product.productCategory.productCategoryId = event.target.value;
        }
        if (event.target.name === "unitId") {
            product.forecastingUnit.unitId = event.target.value;
        }
        if (event.target.name === "stopDate") {
            product.stopDate = event.target.value;
        }
        if (event.target.name === "active") {
            product.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            product
        },
            () => {
            });
    };
    touchAll(setTouched, errors) {
        setTouched({
            productName: true,
            genericName: true,
            realmId: true,
            productCategoryId: true,
            unitId: true,
        }
        );
        this.validateForm(errors);
    }
    validateForm(errors) {
        this.findFirstError('productForm', (fieldName) => {
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
    render() {
        const { realmList } = this.state;
        const { unitList } = this.state;
        const { productCategoryList } = this.state;
        let realms = realmList.length > 0 && realmList.map((item, i) => {
            return (
                <option key={i} value={item.realmId}>
                    {getLabelText(item.label, this.state.lan)}
                </option>
            )
        }, this);
        let units = unitList.length > 0 && unitList.map((item, i) => {
            return (
                <option key={i} value={item.unitId}>
                    {getLabelText(item.label, this.state.lan)}
                </option>
            )
        }, this);
        let productCategories = productCategoryList.length > 0 && productCategoryList.map((item, i) => {
            return (
                <option key={i} value={item.productCategoryId}>
                    {getLabelText(item.label, this.state.lan)}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    ProductService.editProduct(this.state.product)
                                        .then(response => {
                                            if (response.status == "200") {
                                                this.props.history.push(`/product/listProduct/${response.data.message}`)
                                            } else {
                                                this.setState({
                                                    message: response.data.message
                                                })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({
                                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                                    });
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
                                        setTouched
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='productForm'>
                                            <CardBody>
                                                <FormGroup>
                                                    <Label for="product">{i18n.t('static.product.product')}</Label>
                                                    <InputGroupAddon addonType="prepend">
                                                        <InputGroupText><i className="fa fa-pencil"></i></InputGroupText>
                                                        <Input
                                                            value={this.state.product.label.label_en}
                                                            type="text"
                                                            name="productName"
                                                            id="productName"
                                                            bsSize="sm"
                                                            valid={!errors.productName}
                                                            invalid={touched.productName && !!errors.productName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required />
                                                        <FormFeedback className="red" back>{errors.productName}</FormFeedback>
                                                    </InputGroupAddon>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="product">{i18n.t('static.product.productgenericname')}</Label>
                                                    <InputGroupAddon addonType="prepend">
                                                        <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText>
                                                        <Input type="text"
                                                            value={this.state.product.genericLabel.label_en}
                                                            name="genericName"
                                                            id="genericName"
                                                            bsSize="sm"
                                                            valid={!errors.genericName}
                                                            invalid={touched.genericName && !!errors.genericName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required />
                                                        <FormFeedback className="red">{errors.genericName}</FormFeedback>
                                                    </InputGroupAddon>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.product.realm')}</Label>
                                                    <InputGroupAddon addonType="prepend">
                                                        <InputGroupText><i className="fa fa-th-large"></i></InputGroupText>
                                                        <Input
                                                            type="select"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            valid={!errors.realmId}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getDependentLists(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            disabled
                                                            value={this.state.product.realm.realmId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {realms}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </InputGroupAddon>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="">{i18n.t('static.product.productcategory')}</Label>
                                                    <InputGroupAddon addonType="prepend">
                                                        <InputGroupText><i className="fa fa-bar-chart"></i></InputGroupText>
                                                        <Input
                                                            type="select"
                                                            name="productCategoryId"
                                                            id="productCategoryId"
                                                            bsSize="sm"
                                                            valid={!errors.productCategoryId}
                                                            invalid={touched.productCategoryId && !!errors.productCategoryId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.product.productCategory.productCategoryId}
                                                        >
                                                            {productCategories}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.productCategoryId}</FormFeedback>
                                                    </InputGroupAddon>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="unitId">{i18n.t('static.product.unit1')}</Label>
                                                    <InputGroupAddon addonType="prepend">
                                                        <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText>
                                                        <Input
                                                            type="select"
                                                            name="unitId"
                                                            id="unitId"
                                                            bsSize="sm"
                                                            valid={!errors.unitId}
                                                            invalid={touched.unitId && !!errors.unitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.product.forecastingUnit.unitId}
                                                        >
                                                            {units}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.unitId}</FormFeedback>
                                                    </InputGroupAddon>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label>{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active1"
                                                            name="active"
                                                            value={true}
                                                            checked={this.state.product.active === true}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-active1">
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
                                                            checked={this.state.product.active === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-active2">
                                                            {i18n.t('static.common.disabled')}
                                                        </Label>
                                                    </FormGroup>
                                                </FormGroup>
                                            </CardBody>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
        this.props.history.push(`/product/listProduct/` + i18n.t('static.message.cancelled', { entityname }))
    }
}