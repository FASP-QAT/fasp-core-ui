// import React, { Component } from 'react';
// import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormFeedback, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
// import { Formik } from 'formik';
// import * as Yup from 'yup'
// import '../Forms/ValidationForms/ValidationForms.css'

// import RealmService from "../../api/RealmService";
// import TracerCategoryService from "../../api/TracerCategoryService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// import i18n from '../../i18n';

// import getLabelText from '../../CommonComponent/getLabelText';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// import { BUDGET_NAME_REGEX } from '../../Constants.js';
// const entityname = i18n.t('static.tracercategory.tracercategory');


// const initialValues = {
//     realmId: [],
//     tracerCategoryCode: "",
//     tracerCategoryName: "",
//     submittedToApprovedLeadTime: ""
// }

// const validationSchema = function (values) {
//     return Yup.object().shape({
//         realmId: Yup.string()
//             .required(i18n.t('static.common.realmtext')),
//         tracerCategoryName: Yup.string()
//             .matches(BUDGET_NAME_REGEX, i18n.t('static.message.budgetNameRegex'))
//             .required(i18n.t('static.tracerCategory.tracercategorytext'))
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
// class AddTracerCategoryComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             realms: [],
//             tracerCategory: {
//                 realm: {
//                     id: '',
//                     label: {
//                         label_en: '',
//                         label_fr: '',
//                         label_sp: '',
//                         label_pr: ''
//                     }
//                 },
//                 label: {
//                     label_en: '',
//                     label_fr: '',
//                     label_sp: '',
//                     label_pr: ''
//                 }
//             },
//             message: '',
//             lang: localStorage.getItem('lang')
//         }
//         this.cancelClicked = this.cancelClicked.bind(this);
//         this.dataChange = this.dataChange.bind(this);
//         this.Capitalize = this.Capitalize.bind(this);
//         this.resetClicked = this.resetClicked.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }

//     Capitalize(str) {
//         if (str != null && str != "") {
//             return str.charAt(0).toUpperCase() + str.slice(1);
//         } else {
//             return "";
//         }
//     }


//     dataChange(event) {
//         let { tracerCategory } = this.state;
//         if (event.target.name == "realmId") {
//             tracerCategory.realm.id = event.target.value;
//         }

//         if (event.target.name == "tracerCategoryName") {
//             tracerCategory.label.label_en = event.target.value;
//         }



//         this.setState({
//             tracerCategory
//         },
//             () => { });
//     };

//     touchAll(setTouched, errors) {
//         setTouched({
//             realmId: true,
//             tracerCategoryCode: true,
//             tracerCategoryName: true,
//             submittedToApprovedLeadTime: true
//         }
//         )
//         this.validateForm(errors)
//     }
//     validateForm(errors) {
//         this.findFirstError('tracerCategoryForm', (fieldName) => {
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
//         AuthenticationService.setupAxiosInterceptors();
//         RealmService.getRealmListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realms: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     })
//                 }
//             })

//     }
//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }

//     render() {
//         const { realms } = this.state;
//         let realmList = realms.length > 0
//             && realms.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);
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
//                                     console.log("this.state.tracerCategory---", this.state.tracerCategory);
//                                     TracerCategoryService.addTracerCategory(this.state.tracerCategory)
//                                         .then(response => {
//                                             if (response.status == 200) {
//                                                 this.props.history.push(`/tracerCategory/listTracerCategory/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
//                                             <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='tracerCategoryForm'>
//                                                 <CardBody>
//                                                     <FormGroup>
//                                                         <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span className="red Reqasterisk">*</span></Label>
//                                                         {/* <InputGroupAddon addonType="prepend"> */}
//                                                         {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
//                                                         <Input
//                                                             type="select"
//                                                             bsSize="sm"
//                                                             name="realmId"
//                                                             id="realmId"
//                                                             valid={!errors.realmId && this.state.tracerCategory.realm.id != ''}
//                                                             invalid={touched.realmId && !!errors.realmId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.tracerCategory.realm.id}
//                                                             required
//                                                         >
//                                                             <option value="">{i18n.t('static.common.select')}</option>
//                                                             {realmList}
//                                                         </Input>
//                                                         {/* </InputGroupAddon> */}
//                                                         <FormFeedback className="red">{errors.realmId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label for="tracerCategoryName">{i18n.t('static.tracercategory.tracercategory')}<span className="red Reqasterisk">*</span></Label>
//                                                         {/* <InputGroupAddon addonType="prepend"> */}
//                                                         {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
//                                                         <Input type="text"
//                                                             bsSize="sm"
//                                                             name="tracerCategoryName"
//                                                             id="tracerCategoryName"
//                                                             valid={!errors.tracerCategoryName && this.state.tracerCategory.label.label_en != ''}
//                                                             invalid={touched.tracerCategoryName && !!errors.tracerCategoryName}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             onBlur={handleBlur}
//                                                             required
//                                                             value={this.Capitalize(this.state.tracerCategory.label.label_en)}
//                                                         />
//                                                         {/* </InputGroupAddon> */}
//                                                         <FormFeedback className="red">{errors.tracerCategoryName}</FormFeedback>
//                                                     </FormGroup>

//                                                 </CardBody>
//                                                 <CardFooter>
//                                                     <FormGroup>
//                                                         <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
//                                                         <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
//                                                         <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

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
//         this.props.history.push(`/tracerCategory/listTracerCategory/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
//     }

//     resetClicked() {
//         let { tracerCategory } = this.state;

//         tracerCategory.realm.id = ''
//         tracerCategory.label.label_en = ''

//         this.setState({
//             tracerCategory
//         },
//             () => { });
//     }
// }

// export default AddTracerCategoryComponent;


// Loader


import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormFeedback, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import RealmService from "../../api/RealmService";
import TracerCategoryService from "../../api/TracerCategoryService";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';

import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { BUDGET_NAME_REGEX } from '../../Constants.js';
const entityname = i18n.t('static.tracercategory.tracercategory');


let initialValues = {
    realmId: [],
    tracerCategoryCode: "",
    tracerCategoryName: "",
    submittedToApprovedLeadTime: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        tracerCategoryName: Yup.string()
            // .matches(BUDGET_NAME_REGEX, i18n.t('static.message.budgetNameRegex'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.tracerCategory.tracercategorytext'))
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
class AddTracerCategoryComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            realms: [],
            tracerCategory: {
                realm: {
                    id: '',
                    label: {
                        label_en: '',
                        label_fr: '',
                        label_sp: '',
                        label_pr: ''
                    }
                },
                label: {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: ''
                }
            },
            message: '',
            lang: localStorage.getItem('lang')
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }


    dataChange(event) {
        let { tracerCategory } = this.state;
        if (event.target.name == "realmId") {
            tracerCategory.realm.id = event.target.value;
        }

        if (event.target.name == "tracerCategoryName") {
            tracerCategory.label.label_en = event.target.value;
        }



        this.setState({
            tracerCategory
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true,
            tracerCategoryCode: true,
            tracerCategoryName: true,
            submittedToApprovedLeadTime: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('tracerCategoryForm', (fieldName) => {
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
        RealmService.getRealmListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realms: listArray, loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
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
        let realmId = AuthenticationService.getRealmId();
        if (realmId != -1) {
            // document.getElementById('realmId').value = realmId;
            initialValues = {
                realmId: realmId
            }

            let { tracerCategory } = this.state;
            tracerCategory.realm.id = realmId;
            document.getElementById("realmId").disabled = true;
            this.setState({
                tracerCategory
            },
                () => {

                })
        }

    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

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
                                    console.log("this.state.tracerCategory---", this.state.tracerCategory);
                                    TracerCategoryService.addTracerCategory(this.state.tracerCategory)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/tracerCategory/listTracerCategory/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode, loading: false
                                                },
                                                    () => {
                                                        this.hideSecondComponent();
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
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='tracerCategoryForm' autocomplete="off">
                                                <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input
                                                            type="select"
                                                            bsSize="sm"
                                                            name="realmId"
                                                            id="realmId"
                                                            valid={!errors.realmId && this.state.tracerCategory.realm.id != ''}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.tracerCategory.realm.id}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="tracerCategoryName">{i18n.t('static.tracercategory.tracercategory')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            bsSize="sm"
                                                            name="tracerCategoryName"
                                                            id="tracerCategoryName"
                                                            valid={!errors.tracerCategoryName && this.state.tracerCategory.label.label_en != ''}
                                                            invalid={touched.tracerCategoryName && !!errors.tracerCategoryName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.Capitalize(this.state.tracerCategory.label.label_en)}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.tracerCategoryName}</FormFeedback>
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
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
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
        this.props.history.push(`/tracerCategory/listTracerCategory/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { tracerCategory } = this.state;
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            tracerCategory.realm.id = ''
        }

        tracerCategory.label.label_en = ''

        this.setState({
            tracerCategory
        },
            () => { });
    }
}

export default AddTracerCategoryComponent;
