// import React, { Component } from 'react';
// import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import CountryService from '../../api/CountryService.js';
// import LanguageService from '../../api/LanguageService.js';
// import CurrencyService from '../../api/CurrencyService.js';
// import { Formik } from 'formik';
// import * as Yup from 'yup'
// import '../Forms/ValidationForms/ValidationForms.css'
// import i18n from '../../i18n';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// import getLabelText from '../../CommonComponent/getLabelText';
// import {LABEL_REGEX,ALPHABETS_REGEX} from '../../Constants.js';


// const entityname = i18n.t('static.country.countryMaster');
// let initialValues = {
//     label: '',
//     countryCode: '',
//     countryCode2: '',
//     // languageId: '',
//     currencyId: '',
//     // languageList: [],
//     // currencyList: [],
// }

// const validationSchema = function (values) {
//     return Yup.object().shape({
//         label: Yup.string()
//             .matches(LABEL_REGEX, i18n.t('static.message.rolenamevalidtext'))
//             .required(i18n.t('static.country.countrytext')),
//         countryCode: Yup.string()
//             // .max(3, i18n.t('static.country.countrycodemax3digittext'))
//             .matches(ALPHABETS_REGEX, i18n.t('static.common.alphabetsOnly'))
//             .required(i18n.t('static.country.countrycodetext')),
//         countryCode2: Yup.string()
//             // .max(2, 'Country code 2 is 2 digit number')
//             .matches(ALPHABETS_REGEX, i18n.t('static.common.alphabetsOnly'))
//             .required(i18n.t('static.country.countrycodetext')),
//         // languageId: Yup.string()
//         //     .required(i18n.t('static.country.languagetext')),
//         currencyId: Yup.string()
//             .required(i18n.t('static.country.currencytext')),
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

// export default class UpdateCountryComponent extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             // country: this.props.location.state.country,
//             country: {
//                 countryCode: '',
//                 countryCode2: '',
//                 label: {
//                     label_en: '',
//                     label_fr: '',
//                     label_sp: '',
//                     label_pr: ''
//                 },
//                 currency: {
//                     id: ''
//                 }
//                 // ,
//                 // language: {
//                 //     languageId: ''
//                 // }
//             },
//             // languageList: [],
//             currencyList: [],
//             lang: localStorage.getItem('lang'),
//             message: ''
//         }

//         this.Capitalize = this.Capitalize.bind(this);
//         this.cancelClicked = this.cancelClicked.bind(this);
//         this.dataChange = this.dataChange.bind(this);
//         this.resetClicked = this.resetClicked.bind(this);
//         this.changeMessage = this.changeMessage.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }
//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }
//     changeMessage(message) {
//         this.setState({ message: message })
//     }

//     dataChange(event) {
//         let { country } = this.state
//         if (event.target.name === "label") {
//             country.label.label_en = event.target.value
//         }
//         if (event.target.name === "countryCode") {
//             country.countryCode = event.target.value.toUpperCase();
//         }
//         if (event.target.name === "countryCode2") {
//             country.countryCode2 = event.target.value.toUpperCase();
//         }
//         if (event.target.name === "currencyId") {
//             country.currency.id = event.target.value
//         }
//         // if (event.target.name === "languageId") {
//         //     country.language.languageId = event.target.value
//         // } 
//         else if (event.target.name === "active") {
//             country.active = event.target.id === "active2" ? false : true
//         }

//         this.setState(
//             {
//                 country
//             }
//         )

//     };


//     touchAll(setTouched, errors) {
//         setTouched({
//             label: true,
//             countryCode: true,
//             countryCode2: true,
//             // languageId: true,
//             currencyId: true
//         }
//         )
//         this.validateForm(errors)
//     }
//     validateForm(errors) {
//         this.findFirstError('countryForm', (fieldName) => {
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
//         CountryService.getCountryById(this.props.match.params.countryId).then(response => {
//             if (response.status == 200) {
//                 this.setState({
//                     country: response.data
//                 });
//             }
//             else {
//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }

//             // initialValues = {
//             //     label: getLabelText(this.state.country.label, this.state.lang),
//             //     countryCode: this.state.country.countryCode,
//             //     languageId: this.state.country.language.languageId,
//             //     currencyId: this.state.country.currency.currencyId
//             // }
//             // LanguageService.getLanguageListActive().then(response => {
//             //     if (response.status == 200) {
//             //         this.setState({
//             //             languageList: response.data
//             //         })
//             //     } else {
//             //         this.setState({
//             //             message: response.data.messageCode
//             //         })
//             //     }
//             // })
//             // .catch(
//             //     error => {
//             //         if (error.message === "Network Error") {
//             //             this.setState({ message: error.message });
//             //         } else {
//             //             switch (error.response ? error.response.status : "") {
//             //                 case 500:
//             //                 case 401:
//             //                 case 404:
//             //                 case 406:
//             //                 case 412:
//             //                     this.setState({ message: error.response.data.messageCode });
//             //                     break;
//             //                 default:
//             //                     this.setState({ message: 'static.unkownError' });
//             //                     console.log("Error code unkown");
//             //                     break;
//             //             }
//             //         }
//             //     });

//             CurrencyService.getCurrencyListActive().then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         currencyList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     })
//                 }
//             })
//             // .catch(
//             //     error => {
//             //         if (error.message === "Network Error") {
//             //             this.setState({ message: error.message });
//             //         } else {
//             //             switch (error.response ? error.response.status : "") {
//             //                 case 500:
//             //                 case 401:
//             //                 case 404:
//             //                 case 406:
//             //                 case 412:
//             //                     this.setState({ message: error.response.data.messageCode });
//             //                     break;
//             //                 default:
//             //                     this.setState({ message: 'static.unkownError' });
//             //                     console.log("Error code unkown");
//             //                     break;
//             //             }
//             //         }
//             //     });

//         })
//         // .catch(
//         //     error => {
//         //         if (error.message === "Network Error") {
//         //             this.setState({ message: error.message });
//         //         } else {
//         //             switch (error.response ? error.response.status : "") {
//         //                 case 500:
//         //                 case 401:
//         //                 case 404:
//         //                 case 406:
//         //                 case 412:
//         //                     this.setState({ message: error.response.data.messageCode });
//         //                     break;
//         //                 default:
//         //                     this.setState({ message: 'static.unkownError' });
//         //                     console.log("Error code unkown");
//         //                     break;
//         //             }
//         //         }
//         //     }
//         // );

//     }
//     Capitalize(str) {
//         if (str != null && str != "") {
//             let { country } = this.state
//             country.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
//         }
//     }

//     render() {
//         // const { languageList } = this.state;
//         // let languageItems = languageList.length > 0
//         //     && languageList.map((item, i) => {
//         //         return (
//         //             <option key={i} value={item.languageId}>{item.languageName}</option>
//         //         )
//         //     }, this);

//         const { currencyList } = this.state;
//         let currencyItems = currencyList.length > 0
//             && currencyList.map((itemOne, i) => {
//                 return (
//                     <option key={i} value={itemOne.currencyId}>{getLabelText(itemOne.label, this.state.lang)}</option>
//                 )
//             }, this);
//         return (
//             <div className="animated fadeIn">
//                 <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} />
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Row>
//                     <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
//                         <Card>
//                             {/* <CardHeader>
//                                 <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
//                             </CardHeader> */}
//                             <Formik
//                                 enableReinitialize={true}
//                                 initialValues={{
//                                     label: getLabelText(this.state.country.label, this.state.lang),
//                                     countryCode: this.state.country.countryCode,
//                                     countryCode2: this.state.country.countryCode2,
//                                     // languageId: this.state.country.language.languageId,
//                                     currencyId: this.state.country.currency.id
//                                 }}
//                                 validate={validate(validationSchema)}
//                                 onSubmit={(values, { setSubmitting, setErrors }) => {
//                                     CountryService.editCountry(this.state.country)
//                                         .then(response => {
//                                             if (response.status == 200) {
//                                                 this.props.history.push(`/country/listCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
//                                         setTouched
//                                     }) => (
//                                             <Form onSubmit={handleSubmit} noValidate name='countryForm'>
//                                                 <CardBody className="pt-2 pb-0">
//                                                     <FormGroup>
//                                                         <Label for="label">{i18n.t('static.country.countryName')}<span class="red Reqasterisk">*</span></Label>
//                                                         {/* <InputGroupAddon addonType="prepend"> */}
//                                                         {/* <InputGroupText><i className="fa fa-globe"></i></InputGroupText> */}
//                                                         <Input type="text"
//                                                             name="label"
//                                                             id="label"
//                                                             valid={!errors.label}
//                                                             bsSize="sm"
//                                                             invalid={touched.label && !!errors.label || this.state.country.label.label_en == ''}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.country.label.label_en}
//                                                             required />
//                                                         {/* </InputGroupAddon> */}
//                                                         <FormFeedback className="red">{errors.label}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label for="countryCode">{i18n.t('static.country.countrycode')}<span class="red Reqasterisk">*</span></Label>
//                                                         {/* <InputGroupAddon addonType="prepend"> */}
//                                                         {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
//                                                         <Input type="text"
//                                                             name="countryCode"
//                                                             id="countryCode"
//                                                             bsSize="sm"
//                                                             valid={!errors.countryCode}
//                                                             invalid={touched.countryCode && !!errors.countryCode || this.state.country.countryCode == ''}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.country.countryCode}
//                                                             required
//                                                             maxLength={3}
//                                                         />
//                                                         {/* </InputGroupAddon> */}
//                                                         <FormFeedback className="red">{errors.countryCode}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label for="countryCode">Country Code2<span class="red Reqasterisk">*</span></Label>
//                                                         {/* <InputGroupAddon addonType="prepend"> */}
//                                                         {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
//                                                         <Input type="text"
//                                                             name="countryCode2"
//                                                             id="countryCode2"
//                                                             bsSize="sm"
//                                                             valid={!errors.countryCode2}
//                                                             invalid={touched.countryCode2 && !!errors.countryCode2 || this.state.country.countryCode2 == ''}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.country.countryCode2}
//                                                             required
//                                                             maxLength={2}
//                                                         />
//                                                         {/* <Input type="text"
//                                                             name="countryCode2"
//                                                             id="countryCode2"
//                                                             bsSize="sm"
//                                                             valid={!errors.countryCode2}
//                                                             invalid={touched.countryCode2 && !!errors.countryCode2 || this.state.country.countryCode2 == ''}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.country.countryCode2}
//                                                             required /> */}
//                                                         {/* </InputGroupAddon> */}
//                                                         <FormFeedback className="red">{errors.countryCode2}</FormFeedback>
//                                                     </FormGroup>
//                                                     {/* <FormGroup>
//                                                         <Label htmlFor="languageId">{i18n.t('static.country.language')}<span class="red Reqasterisk">*</span></Label> */}
//                                                     {/* <InputGroupAddon addonType="prepend"> */}
//                                                     {/* <InputGroupText><i className="fa fa-language"></i></InputGroupText> */}
//                                                     {/* <Input
//                                                             type="select"
//                                                             name="languageId"
//                                                             id="languageId"
//                                                             bsSize="sm"
//                                                             valid={!errors.languageId}
//                                                             invalid={touched.languageId && !!errors.languageId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             onBlur={handleBlur}
//                                                             required
//                                                             value={this.state.country.language.languageId}
//                                                         >
//                                                             <option value="">{i18n.t('static.common.select')}</option>
//                                                             {languageItems}
//                                                         </Input> */}
//                                                     {/* </InputGroupAddon> */}
//                                                     {/* <FormFeedback className="red">{errors.languageId}</FormFeedback>
//                                                     </FormGroup> */}
//                                                     <FormGroup>
//                                                         <Label htmlFor="currencyId">{i18n.t('static.country.currency')}<span class="red Reqasterisk">*</span></Label>
//                                                         {/* <InputGroupAddon addonType="prepend"> */}
//                                                         {/* <InputGroupText><i className="fa fa-money"></i></InputGroupText> */}
//                                                         <Input
//                                                             type="select"
//                                                             name="currencyId"
//                                                             id="currencyId"
//                                                             bsSize="sm"
//                                                             valid={!errors.currencyId}
//                                                             invalid={touched.currencyId && !!errors.currencyId || this.state.country.currency.id == ''}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             onBlur={handleBlur}
//                                                             required
//                                                             value={this.state.country.currency.id}
//                                                         >
//                                                             <option value="">{i18n.t('static.common.select')}</option>
//                                                             {currencyItems}
//                                                         </Input>
//                                                         {/* </InputGroupAddon> */}
//                                                         <FormFeedback className="red">{errors.currencyId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label className="P-absltRadio">{i18n.t('static.common.status')}  </Label>
//                                                         <FormGroup check inline>
//                                                             <Input
//                                                                 className="form-check-input"
//                                                                 type="radio"
//                                                                 id="active1"
//                                                                 name="active"
//                                                                 value={true}
//                                                                 checked={this.state.country.active === true}
//                                                                 onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             />
//                                                             <Label
//                                                                 className="form-check-label"
//                                                                 check htmlFor="inline-radio1">
//                                                                 {i18n.t('static.common.active')}
//                                                             </Label>
//                                                         </FormGroup>
//                                                         <FormGroup check inline>
//                                                             <Input
//                                                                 className="form-check-input"
//                                                                 type="radio"
//                                                                 id="active2"
//                                                                 name="active"
//                                                                 value={false}
//                                                                 checked={this.state.country.active === false}
//                                                                 onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             />
//                                                             <Label
//                                                                 className="form-check-label"
//                                                                 check htmlFor="inline-radio2">
//                                                                 {i18n.t('static.common.disabled')}
//                                                             </Label>
//                                                         </FormGroup>
//                                                     </FormGroup>
//                                                 </CardBody>
//                                                 <CardFooter>
//                                                     <FormGroup>
//                                                         <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
//                                                         <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
//                                                         <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>  {i18n.t('static.common.update')}</Button>
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
//         this.props.history.push(`/country/listCountry/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
//     }

//     resetClicked() {
//         CountryService.getCountryById(this.props.match.params.countryId).then(response => {
//             this.setState({
//                 country: response.data
//             });

//             LanguageService.getLanguageListActive().then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         languageList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     })
//                 }
//             })
//             // .catch(
//             //     error => {
//             //         if (error.message === "Network Error") {
//             //             this.setState({ message: error.message });
//             //         } else {
//             //             switch (error.response ? error.response.status : "") {
//             //                 case 500:
//             //                 case 401:
//             //                 case 404:
//             //                 case 406:
//             //                 case 412:
//             //                     this.setState({ message: error.response.data.messageCode });
//             //                     break;
//             //                 default:
//             //                     this.setState({ message: 'static.unkownError' });
//             //                     console.log("Error code unkown");
//             //                     break;
//             //             }
//             //         }
//             //     });

//             CurrencyService.getCurrencyListActive().then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         currencyList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     })
//                 }
//             })
//             // .catch(
//             //     error => {
//             //         if (error.message === "Network Error") {
//             //             this.setState({ message: error.message });
//             //         } else {
//             //             switch (error.response ? error.response.status : "") {
//             //                 case 500:
//             //                 case 401:
//             //                 case 404:
//             //                 case 406:
//             //                 case 412:
//             //                     this.setState({ message: error.response.data.messageCode });
//             //                     break;
//             //                 default:
//             //                     this.setState({ message: 'static.unkownError' });
//             //                     console.log("Error code unkown");
//             //                     break;
//             //             }
//             //         }
//             //     });

//         })
//         // .catch(
//         //     error => {
//         //         if (error.message === "Network Error") {
//         //             this.setState({ message: error.message });
//         //         } else {
//         //             switch (error.response ? error.response.status : "") {
//         //                 case 500:
//         //                 case 401:
//         //                 case 404:
//         //                 case 406:
//         //                 case 412:
//         //                     this.setState({ message: error.response.data.messageCode });
//         //                     break;
//         //                 default:
//         //                     this.setState({ message: 'static.unkownError' });
//         //                     console.log("Error code unkown");
//         //                     break;
//         //             }
//         //         }
//         //     }
//         // );

//     }

// }


// loader


import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService.js';
import CountryService from '../../api/CountryService.js';
import LanguageService from '../../api/LanguageService.js';
import CurrencyService from '../../api/CurrencyService.js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import getLabelText from '../../CommonComponent/getLabelText';
import { LABEL_REGEX, ALPHABETS_REGEX } from '../../Constants.js';
import { SPECIAL_CHARECTER_WITHOUT_NUM, ALPHABET_NUMBER_REGEX, SPACE_REGEX } from '../../Constants.js';


const entityname = i18n.t('static.country.countryMaster');
let initialValues = {
    label: '',
    countryCode: '',
    countryCode2: '',
    // languageId: '',
    currencyId: '',
    // languageList: [],
    // currencyList: [],
}

const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.country.countrytext')),
        countryCode: Yup.string()
            // .max(3, i18n.t('static.country.countrycodemax3digittext'))
            .matches(SPECIAL_CHARECTER_WITHOUT_NUM, i18n.t('static.common.alphabetsOnly'))
            .required(i18n.t('static.country.countrycodetext')),
        countryCode2: Yup.string()
            // .max(2, 'Country code 2 is 2 digit number')
            .matches(SPECIAL_CHARECTER_WITHOUT_NUM, i18n.t('static.common.alphabetsOnly'))
            .required(i18n.t('static.country.countrycodetext2')),
        // languageId: Yup.string()
        //     .required(i18n.t('static.country.languagetext')),
        currencyId: Yup.string()
            .required(i18n.t('static.country.currencytext')),
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

export default class UpdateCountryComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // country: this.props.location.state.country,
            country: {
                countryCode: '',
                countryCode2: '',
                label: {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: ''
                },
                currency: {
                    id: ''
                }
                // ,
                // language: {
                //     languageId: ''
                // }
            },
            // languageList: [],
            currencyList: [],
            lang: localStorage.getItem('lang'),
            message: '',
            loading: true
        }

        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changeLoading = this.changeLoading.bind(this);
    }
    changeLoading(loading) {
        this.setState({ loading: loading })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    changeMessage(message) {
        this.setState({ message: message })
    }

    dataChange(event) {
        let { country } = this.state
        if (event.target.name === "label") {
            country.label.label_en = event.target.value
        }
        if (event.target.name === "countryCode") {
            country.countryCode = event.target.value.toUpperCase();
        }
        if (event.target.name === "countryCode2") {
            country.countryCode2 = event.target.value.toUpperCase();
        }
        if (event.target.name === "currencyId") {
            country.currency.id = event.target.value
        }
        // if (event.target.name === "languageId") {
        //     country.language.languageId = event.target.value
        // } 
        else if (event.target.name === "active") {
            country.active = event.target.id === "active2" ? false : true
        }

        this.setState(
            {
                country
            }
        )

    };


    touchAll(setTouched, errors) {
        setTouched({
            label: true,
            countryCode: true,
            countryCode2: true,
            // languageId: true,
            currencyId: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('countryForm', (fieldName) => {
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
        CountryService.getCountryById(this.props.match.params.countryId).then(response => {
            if (response.status == 200) {
                this.setState({
                    country: response.data, loading: false
                });
            }
            else {
                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }

            // initialValues = {
            //     label: getLabelText(this.state.country.label, this.state.lang),
            //     countryCode: this.state.country.countryCode,
            //     languageId: this.state.country.language.languageId,
            //     currencyId: this.state.country.currency.currencyId
            // }
            // LanguageService.getLanguageListActive().then(response => {
            //     if (response.status == 200) {
            //         this.setState({
            //             languageList: response.data
            //         })
            //     } else {
            //         this.setState({
            //             message: response.data.messageCode
            //         })
            //     }
            // })
            // .catch(
            //     error => {
            //         if (error.message === "Network Error") {
            //             this.setState({ message: error.message });
            //         } else {
            //             switch (error.response ? error.response.status : "") {
            //                 case 500:
            //                 case 401:
            //                 case 404:
            //                 case 406:
            //                 case 412:
            //                     this.setState({ message: error.response.data.messageCode });
            //                     break;
            //                 default:
            //                     this.setState({ message: 'static.unkownError' });
            //                     console.log("Error code unkown");
            //                     break;
            //             }
            //         }
            //     });

            CurrencyService.getCurrencyListActive().then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        currencyList: listArray, loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    })
                }
            })
                .catch(
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

        })
            .catch(
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

    }
    Capitalize(str) {
        if (str != null && str != "") {
            let { country } = this.state
            country.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
        }
    }

    render() {
        // const { languageList } = this.state;
        // let languageItems = languageList.length > 0
        //     && languageList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.languageId}>{item.languageName}</option>
        //         )
        //     }, this);

        const { currencyList } = this.state;
        let currencyItems = currencyList.length > 0
            && currencyList.map((itemOne, i) => {
                return (
                    <option key={i} value={itemOne.currencyId}>{getLabelText(itemOne.label, this.state.lang)}</option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                {/* <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} /> */}
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} loading={this.changeLoading} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    label: getLabelText(this.state.country.label, this.state.lang),
                                    countryCode: this.state.country.countryCode,
                                    countryCode2: this.state.country.countryCode2,
                                    // languageId: this.state.country.language.languageId,
                                    currencyId: this.state.country.currency.id
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    CountryService.editCountry(this.state.country)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/country/listCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        setTouched
                                    }) => (
                                            <Form onSubmit={handleSubmit} noValidate name='countryForm' autocomplete="off">
                                                <CardBody className="pt-2 pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.country.countryName')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-globe"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            valid={!errors.label}
                                                            bsSize="sm"
                                                            // invalid={touched.label && !!errors.label || this.state.country.label.label_en == ''}
                                                            invalid={(touched.label && !!errors.label) || !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.country.label.label_en}
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="countryCode">{i18n.t('static.country.countrycode')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="countryCode"
                                                            id="countryCode"
                                                            bsSize="sm"
                                                            valid={!errors.countryCode}
                                                            // invalid={touched.countryCode && !!errors.countryCode || this.state.country.countryCode == ''}
                                                            invalid={(touched.countryCode && !!errors.countryCode) || !!errors.countryCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.country.countryCode}
                                                            required
                                                            maxLength={3}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.countryCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="countryCode">{i18n.t('static.country.countrycode2')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            name="countryCode2"
                                                            id="countryCode2"
                                                            bsSize="sm"
                                                            valid={!errors.countryCode2}
                                                            // invalid={touched.countryCode2 && !!errors.countryCode2 || this.state.country.countryCode2 == ''}
                                                            invalid={(touched.countryCode2 && !!errors.countryCode2) || !!errors.countryCode2}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.country.countryCode2}
                                                            required
                                                            maxLength={2}
                                                        />
                                                        {/* <Input type="text"
                                                            name="countryCode2"
                                                            id="countryCode2"
                                                            bsSize="sm"
                                                            valid={!errors.countryCode2}
                                                            invalid={touched.countryCode2 && !!errors.countryCode2 || this.state.country.countryCode2 == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.country.countryCode2}
                                                            required /> */}
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.countryCode2}</FormFeedback>
                                                    </FormGroup>
                                                    {/* <FormGroup>
                                                        <Label htmlFor="languageId">{i18n.t('static.country.language')}<span class="red Reqasterisk">*</span></Label> */}
                                                    {/* <InputGroupAddon addonType="prepend"> */}
                                                    {/* <InputGroupText><i className="fa fa-language"></i></InputGroupText> */}
                                                    {/* <Input
                                                            type="select"
                                                            name="languageId"
                                                            id="languageId"
                                                            bsSize="sm"
                                                            valid={!errors.languageId}
                                                            invalid={touched.languageId && !!errors.languageId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.country.language.languageId}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {languageItems}
                                                        </Input> */}
                                                    {/* </InputGroupAddon> */}
                                                    {/* <FormFeedback className="red">{errors.languageId}</FormFeedback>
                                                    </FormGroup> */}
                                                    <FormGroup>
                                                        <Label htmlFor="currencyId">{i18n.t('static.country.currency')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-money"></i></InputGroupText> */}
                                                        <Input
                                                            type="select"
                                                            name="currencyId"
                                                            id="currencyId"
                                                            bsSize="sm"
                                                            valid={!errors.currencyId}
                                                            // invalid={touched.currencyId && !!errors.currencyId || this.state.country.currency.id == ''}
                                                            invalid={(touched.currencyId && !!errors.currencyId) || !!errors.currencyId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.country.currency.id}
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {currencyItems}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.currencyId}</FormFeedback>
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
                                                                checked={this.state.country.active === true}
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
                                                                checked={this.state.country.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.common.disabled')}
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
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>  {i18n.t('static.common.update')}</Button>
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
        this.props.history.push(`/country/listCountry/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        CountryService.getCountryById(this.props.match.params.countryId).then(response => {
            this.setState({
                country: response.data
            });

            LanguageService.getLanguageListActive().then(response => {
                if (response.status == 200) {
                    this.setState({
                        languageList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
                .catch(
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

            CurrencyService.getCurrencyListActive().then(response => {
                if (response.status == 200) {
                    this.setState({
                        currencyList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
                .catch(
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

        })
            .catch(
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
    }

}


