import React, { Component } from 'react';
import {
    Row, Col, Card, CardHeader,
    CardFooter, Button, FormFeedback, CardBody,
    Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText,FormText
} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css';
import RealmServcie from '../../api/RealmService';
import UnitService from '../../api/UnitService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText'
import ProductService from '../../api/ProductService';
import i18n from "../../i18n"

const initialValues = {
    productName: '',
    genericName: '',
    realmId: '',
    productCategoryId: '',
    unitId: ''
}
const validationSchema = function (values) {
    return Yup.object().shape({
        productName: Yup.string()
            .required(i18n.t('static.product.productnametext')),
        genericName: Yup.string()
            .required(i18n.t('static.product.generictext')),
        realmId: Yup.string()
            .required(i18n.t('static.product.realmtext')),
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


export default class AddProduct extends Component {

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
                    realmid: ''
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
            unitList: []
        }
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getDependentLists = this.getDependentLists.bind(this);
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RealmServcie.getRealmListAll()
            .then(response => {
                if (response.status == "Success") {   this.setState({
                    realmList: response.data.data
                })} else {
                    this.setState({ message: response.data.messageCode })
                }
            }).catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.response.data.message
                            })
                            break
                    }
                }
            );

        UnitService.getUnitListAll()
            .then(response => {
                this.setState({
                    unitList: response.data.data
                })
            }).catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.response.data.message
                            })
                            break
                    }
                }
            );
    }

    getDependentLists(event) {
        AuthenticationService.setupAxiosInterceptors();
        ProductService.getProdcutCategoryListByRealmId(event.target.value)
            .then(response => {
                console.log(response);
                this.setState({
                    productCategoryList: response.data.data
                })
            }).catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.response.data.message
                            })
                            break
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
        this.setState({
            product
        },
            () => { console.log(product) });
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
                                <i className="icon-note"></i><strong>{i18n.t('static.product.productadd')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    // AuthenticationService.setupAxiosInterceptors();
                                    // console.log("==============",this.state.product);
                                    ProductService.addProduct(this.state.product)
                                        .then(response => {
                                            if (response.status == "200") {
                                                console.log(response);
                                                this.props.history.push(`/product/listProduct/${response.data.message}`)
                                            } else {
                                                this.setState({
                                                    message: response.data.message
                                                })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                switch (error.message) {
                                                    case "Network Error":
                                                        this.setState({
                                                            message: error.message
                                                        })
                                                        break
                                                    default:
                                                        this.setState({
                                                            message: error.response.data.message
                                                        })
                                                        break
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
                                                            <Input type="text"
                                                                name="productName"
                                                                id="productName"
                                                                bsSize="sm"
                                                                valid={!errors.productName}
                                                                invalid={touched.productName && !!errors.productName}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required />
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.productName}</FormText>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="product">{i18n.t('static.product.productgenericname')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText>
                                                            <Input type="text"
                                                                name="genericName"
                                                                id="genericName"
                                                                bsSize="sm"
                                                                valid={!errors.genericName}
                                                                invalid={touched.genericName && !!errors.genericName}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required />
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.genericName}</FormText>
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
                                                                value={this.state.realmId}
                                                            >
                                                                <option value="">Please select</option>
                                                                {realms}
                                                            </Input>
                                                        </InputGroupAddon>

                                                        <FormText className="red">{errors.realmId}</FormText>
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
                                                                value={this.state.productCategoryId}
                                                            >
                                                                <option value="">Please select</option>
                                                                {/* <option value="1">Product Category One</option>
                                                            <option value="2">Product Category Two</option>
                                                            <option value="3">Product Category Three</option> */}
                                                                {productCategories}
                                                            </Input>
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.productCategoryId}</FormText>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="unitId">{i18n.t('static.product.unit')}</Label>
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
                                                                value={this.state.unitId}
                                                            >
                                                                <option value="">Please select</option>
                                                                {units}
                                                            </Input>
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.unitId}</FormText>
                                                    </FormGroup>

                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>

                                                        {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> Reset</Button> */}
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
    cancelClicked() {
        this.props.history.push(`/product/listProduct/` + "Action Canceled")
    }

}