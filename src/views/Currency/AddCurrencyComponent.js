// import React, { Component } from 'react';
// import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
// import { Formik } from 'formik';
// import * as Yup from 'yup'
// import AuthenticationService from '../Common/AuthenticationService.js';
// import CurrencyService from '../../api/CurrencyService.js';
// import i18n from '../../i18n';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// import {LABEL_REGEX,ALPHABETS_REGEX} from '../../Constants.js';

// const entityname = i18n.t('static.currency.currencyMaster');
// const initialValues = {
//     currencyCode: '',
//     // currencySymbol: '',
//     label: '',
//     conversionRate: '',
//     isSync: 'true'
// }

// const validationSchema = function (values) {
//     return Yup.object().shape({
//         currencyCode: Yup.string()
//             .matches(ALPHABETS_REGEX, i18n.t('static.common.alphabetsOnly'))
//             .required(i18n.t('static.currency.currencycodetext')),
//         // max(4, i18n.t('static.currency.currencycodemax4digittext')),
//         // currencySymbol: Yup.string()
//         //     .required(i18n.t('static.currency.currencysymboltext')).
//         //     max(3, i18n.t('static.country.countrycodemax3digittext')).
//         //     // matches(/^[A-Z@~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]*$/i, i18n.t('static.currency.numbernotallowedtext')),
//         //     matches(/^([^0-9]*)$/, i18n.t('static.currency.numbernotallowedtext')),
//         label: Yup.string()
//             .matches(LABEL_REGEX, i18n.t('static.message.rolenamevalidtext'))
//             .required(i18n.t('static.currency.currencytext')),
//         conversionRate: Yup.string()
//             .required(i18n.t('static.currency.conversionrateNumber')).min(0, i18n.t('static.currency.conversionrateMin'))
//     })
// }

// const validate = (getValidationSchema) => {
//     return (values) => {
//         const validationSchema = getValidationSchema(values)
//         try {
//             validationSchema.validateSync(values, { abortEarly: false })
//             return {}
//         } catch (error) {
//             return getErrorsFromValidationError(error)
//         }
//     }
// }

// const getErrorsFromValidationError = (validationError) => {
//     const FIRST_ERROR = 0
//     return validationError.inner.reduce((errors, error) => {
//         return {
//             ...errors,
//             [error.path]: error.errors[FIRST_ERROR],
//         }
//     }, {})
// }


// export default class AddCurrencyComponent extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             currencyCode: '',
//             // currencySymbol: '',
//             label: {
//                 label_en: ''

//             },
//             conversionRateToUsd: '',
//             isSync: true
//         }
//         this.Capitalize = this.Capitalize.bind(this);
//         this.cancelClicked = this.cancelClicked.bind(this);
//         this.dataChange = this.dataChange.bind(this);
//         this.resetClicked = this.resetClicked.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }
//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }


//     dataChange(event) {
//         console.log(event.target.name)
//         if (event.target.name === "currencyCode") {
//             this.state.currencyCode = event.target.value.toUpperCase();
//         }
//         // if (event.target.name === "currencySymbol") {
//         //     this.state.currencySymbol = event.target.value;
//         // } 
//         if (event.target.name === "label") {
//             this.state.label.label_en = event.target.value;
//         }
//         else if (event.target.name === "conversionRate") {
//             this.state.conversionRateToUsd = event.target.value;
//         } else if (event.target.name === "isSync") {
//             this.state.isSync = event.target.id === "active2" ? false : true;
//         }
//         let { currency } = this.state
//         this.setState(
//             {
//                 currency
//             }
//         )
//     };

//     touchAll(setTouched, errors) {
//         setTouched({
//             currencyCode: true,
//             // currencySymbol: true,
//             label: true,
//             conversionRate: true,
//             isSync: true
//         }
//         )
//         this.validateForm(errors)
//     }
//     validateForm(errors) {
//         this.findFirstError('currencyForm', (fieldName) => {
//             return Boolean(errors[fieldName])
//         })
//     }
//     findFirstError(formName, hasError) {
//         const form = document.forms[formName]
//         for (let i = 0; i < form.length; i++) {
//             if (hasError(form[i].name)) {
//                 form[i].focus()
//                 break
//             }
//         }
//     }


//     componentDidMount() {
//     }

//     Capitalize(str) {
//         this.state.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
//     }

//     render() {

//         return (
//             <div className="animated fadeIn">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Row>
//                     <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
//                         <Card>
//                             {/* <CardHeader>
//                                 <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
//                             </CardHeader> */}
//                             <Formik
//                                 initialValues={initialValues}
//                                 validate={validate(validationSchema)}
//                                 onSubmit={(values, { setSubmitting, setErrors }) => {

//                                     CurrencyService.addCurrency(this.state)
//                                         .then(response => {
//                                             if (response.status == 200) {
//                                                 // console.log("----------after add", response.data.messageCode);
//                                                 this.props.history.push(`/currency/listCurrency/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
//                                             } else {
//                                                 this.setState({
//                                                     message: response.data.messageCode
//                                                 },
//                                                     () => {
//                                                         this.hideSecondComponent();
//                                                     })
//                                             }
//                                         })

//                                 }}


//                                 render={
//                                     ({
//                                         values,
//                                         errors,
//                                         touched,
//                                         handleChange,
//                                         handleBlur,
//                                         handleSubmit,
//                                         isSubmitting,
//                                         isValid,
//                                         setTouched,
//                                         handleReset
//                                     }) => (
//                                             <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='currencyForm'>
//                                                 <CardBody className="pb-0">
//                                                     <FormGroup>
//                                                         <Label for="label">{i18n.t('static.currency.currency')}<span class="red Reqasterisk">*</span></Label>
//                                                         {/* <InputGroupAddon addonType="prepend"> */}
//                                                         {/* <InputGroupText><i className="fa fa-money"></i></InputGroupText> */}
//                                                         <Input type="text"
//                                                             name="label"
//                                                             id="label"
//                                                             bsSize="sm"
//                                                             valid={!errors.label && this.state.label.label_en != ''}
//                                                             invalid={touched.label && !!errors.label}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.label.label_en}
//                                                             required />
//                                                         {/* </InputGroupAddon> */}
//                                                         <FormFeedback className="red">{errors.label}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label for="currencyCode">{i18n.t('static.currency.currencycode')}<span class="red Reqasterisk">*</span></Label>
//                                                         {/* <InputGroupAddon addonType="prepend"> */}
//                                                         {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
//                                                         <Input type="text"
//                                                             name="currencyCode"
//                                                             id="currencyCode"
//                                                             bsSize="sm"
//                                                             valid={!errors.currencyCode && this.state.currencyCode != ''}
//                                                             invalid={touched.currencyCode && !!errors.currencyCode}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.currencyCode}
//                                                             required
//                                                             maxLength={4}
//                                                         />
//                                                         {/* </InputGroupAddon> */}
//                                                         <FormFeedback className="red">{errors.currencyCode}</FormFeedback>
//                                                     </FormGroup>
//                                                     {/* <FormGroup>
//                                                         <Label for="currencySymbol">{i18n.t('static.currency.currencysymbol')}<span className="red Reqasterisk">*</span></Label>
//                                                         <Input type="text"
//                                                             name="currencySymbol"
//                                                             id="currencySymbol"
//                                                             bsSize="sm"
//                                                             valid={!errors.currencySymbol}
//                                                             invalid={touched.currencySymbol && !!errors.currencySymbol}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.currencySymbol}
//                                                             required />
//                                                         <FormFeedback className="red">{errors.currencySymbol}</FormFeedback>
//                                                     </FormGroup> */}
//                                                     <FormGroup>
//                                                         <Label for="laconversionRatebel">{i18n.t('static.currency.conversionrateusd')}<span class="red Reqasterisk">*</span></Label>
//                                                         {/* <InputGroupAddon addonType="prepend"> */}
//                                                         {/* <InputGroupText><i className="fa fa-exchange"></i></InputGroupText> */}
//                                                         <Input type="number"
//                                                             name="conversionRate"
//                                                             id="conversionRate"
//                                                             valid={!errors.conversionRate && this.state.conversionRateToUsd != ''}
//                                                             invalid={touched.conversionRate && !!errors.conversionRate}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.conversionRateToUsd}
//                                                             bsSize="sm"
//                                                             required />
//                                                         {/* </InputGroupAddon> */}
//                                                         <FormFeedback className="red">{errors.conversionRate}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label for="isSync">{i18n.t('static.common.issync')}  </Label>
//                                                         <FormGroup check inline>
//                                                             <Input
//                                                                 className="form-check-input"
//                                                                 type="radio"
//                                                                 id="active1"
//                                                                 name="isSync"
//                                                                 value={true}
//                                                                 checked={this.state.isSync === true}
//                                                                 onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             />
//                                                             <Label
//                                                                 className="form-check-label"
//                                                                 check htmlFor="inline-radio1">
//                                                                 {i18n.t('static.program.yes')}
//                                                             </Label>
//                                                         </FormGroup>
//                                                         <FormGroup check inline>
//                                                             <Input
//                                                                 className="form-check-input"
//                                                                 type="radio"
//                                                                 id="active2"
//                                                                 name="isSync"
//                                                                 value={false}
//                                                                 checked={this.state.isSync === false}
//                                                                 onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             />
//                                                             <Label
//                                                                 className="form-check-label"
//                                                                 check htmlFor="inline-radio2">
//                                                                 {i18n.t('static.program.no')}
//                                                             </Label>
//                                                         </FormGroup>
//                                                     </FormGroup>

//                                                 </CardBody>

//                                                 <CardFooter>
//                                                     <FormGroup>
//                                                         <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
//                                                         <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
//                                                         <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

//                                                         &nbsp;
//                                                     </FormGroup>
//                                                 </CardFooter>
//                                             </Form>

//                                         )} />

//                         </Card>
//                     </Col>
//                 </Row>
//             </div>
//         );
//     }

//     cancelClicked() {
//         this.props.history.push(`/currency/listCurrency/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
//     }

//     resetClicked() {
//         this.state.currencyCode = ''
//         this.state.currencySymbol = ''
//         this.state.label.label_en = ''
//         this.state.conversionRateToUsd = ''

//         let { currency } = this.state
//         this.setState(
//             {
//                 currency
//             }
//         )
//     }
// }




// LOADER


import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import AuthenticationService from '../Common/AuthenticationService.js';
import CurrencyService from '../../api/CurrencyService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { SPECIAL_CHARECTER_WITH_NUM, SPACE_REGEX, ALPHABETS_REGEX, DECIMAL_NO_REGEX } from '../../Constants.js';

const entityname = i18n.t('static.currency.currencyMaster');
const initialValues = {
    currencyCode: '',
    // currencySymbol: '',
    label: '',
    conversionRate: '',
    isSync: 'true'
}

const validationSchema = function (values) {
    return Yup.object().shape({
        currencyCode: Yup.string()
            // .matches(ALPHABETS_REGEX, i18n.t('static.common.alphabetsOnly'))
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.currency.currencycodetext')),
        // max(4, i18n.t('static.currency.currencycodemax4digittext')),
        // currencySymbol: Yup.string()
        //     .required(i18n.t('static.currency.currencysymboltext')).
        //     max(3, i18n.t('static.country.countrycodemax3digittext')).
        //     // matches(/^[A-Z@~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]*$/i, i18n.t('static.currency.numbernotallowedtext')),
        //     matches(/^([^0-9]*)$/, i18n.t('static.currency.numbernotallowedtext')),
        label: Yup.string()
            // .matches(SPACE_REGEX, i18n.t('static.message.rolenamevalidtext'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.currency.currencytext')),
        conversionRate: Yup.string()
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .required(i18n.t('static.currency.conversionrateNumber')).min(0, i18n.t('static.currency.conversionrateMin'))
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


export default class AddCurrencyComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currencyCode: '',
            // currencySymbol: '',
            label: {
                label_en: ''

            },
            conversionRateToUsd: '',
            isSync: true,
            loading: true
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    dataChange(event) {
        console.log(event.target.name)
        if (event.target.name === "currencyCode") {
            this.state.currencyCode = event.target.value.toUpperCase();
        }
        // if (event.target.name === "currencySymbol") {
        //     this.state.currencySymbol = event.target.value;
        // } 
        if (event.target.name === "label") {
            this.state.label.label_en = event.target.value;
        }
        else if (event.target.name === "conversionRate") {
            this.state.conversionRateToUsd = event.target.value;
        } else if (event.target.name === "isSync") {
            this.state.isSync = event.target.id === "active2" ? false : true;
        }
        let { currency } = this.state
        this.setState(
            {
                currency
            }
        )
    };

    touchAll(setTouched, errors) {
        setTouched({
            currencyCode: true,
            // currencySymbol: true,
            label: true,
            conversionRate: true,
            isSync: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('currencyForm', (fieldName) => {
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
        this.setState({ loading: false })
    }

    Capitalize(str) {
        this.state.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    render() {

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    CurrencyService.addCurrency(this.state)
                                        .then(response => {
                                            if (response.status == 200) {
                                                // console.log("----------after add", response.data.messageCode);
                                                this.props.history.push(`/currency/listCurrency/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='currencyForm' autocomplete="off">
                                                <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.currency.currency')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-money"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label && this.state.label.label_en != ''}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.label.label_en}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="currencyCode">{i18n.t('static.currency.currencycode')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="currencyCode"
                                                            id="currencyCode"
                                                            bsSize="sm"
                                                            valid={!errors.currencyCode && this.state.currencyCode != ''}
                                                            invalid={touched.currencyCode && !!errors.currencyCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.currencyCode}
                                                            required
                                                            maxLength={4}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.currencyCode}</FormFeedback>
                                                    </FormGroup>
                                                    {/* <FormGroup>
                                                        <Label for="currencySymbol">{i18n.t('static.currency.currencysymbol')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="currencySymbol"
                                                            id="currencySymbol"
                                                            bsSize="sm"
                                                            valid={!errors.currencySymbol}
                                                            invalid={touched.currencySymbol && !!errors.currencySymbol}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.currencySymbol}
                                                            required />
                                                        <FormFeedback className="red">{errors.currencySymbol}</FormFeedback>
                                                    </FormGroup> */}
                                                    <FormGroup>
                                                        <Label for="laconversionRatebel">{i18n.t('static.currency.conversionrateusd')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-exchange"></i></InputGroupText> */}
                                                        <Input type="number"
                                                            name="conversionRate"
                                                            id="conversionRate"
                                                            valid={!errors.conversionRate && this.state.conversionRateToUsd != ''}
                                                            invalid={touched.conversionRate && !!errors.conversionRate}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.conversionRateToUsd}
                                                            bsSize="sm"
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.conversionRate}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="isSync">{i18n.t('static.common.issync')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="isSync"
                                                                value={true}
                                                                checked={this.state.isSync === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.program.yes')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="isSync"
                                                                value={false}
                                                                checked={this.state.isSync === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.program.no')}
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

            </div>
        );
    }

    cancelClicked() {
        this.props.history.push(`/currency/listCurrency/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        this.state.currencyCode = ''
        this.state.currencySymbol = ''
        this.state.label.label_en = ''
        this.state.conversionRateToUsd = ''

        let { currency } = this.state
        this.setState(
            {
                currency
            }
        )
    }
}
