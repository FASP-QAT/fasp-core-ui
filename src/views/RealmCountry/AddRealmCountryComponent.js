import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import RealmService from "../../api/RealmService";
import CountryService from "../../api/CountryService";
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
const entityname = i18n.t('static.program.realmcountry');
const initialValues = {
    realmId: [],
    procurementAgentCode: "",
    procurementAgentName: "",
    submittedToApprovedLeadTime: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required( i18n.t('static.realmcountry.validrealm')),
        procurementAgentCode: Yup.string()
            .required( i18n.t('static.realmcountry.validcode')),
        procurementAgentName: Yup.string()
            .required( i18n.t('static.realmcountry.validname')),
        submittedToApprovedLeadTime: Yup.string()
            .required( i18n.t('static.realmcountry.validsubmittoapprove'))
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
class AddRealmCountryComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            countries: [],
            procurementAgent: {
                realm: {
                },
                label: {

                }
            },
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }


    dataChange(event) {
        let { procurementAgent } = this.state;
        if (event.target.name == "realmId") {
            procurementAgent.realm.realmId = event.target.value;
        }
        if (event.target.name == "procurementAgentCode") {
            procurementAgent.procurementAgentCode = event.target.value;
        }
        if (event.target.name == "procurementAgentName") {
            procurementAgent.label.label_en = event.target.value;
        }
        if (event.target.name == "submittedToApprovedLeadTime") {
            procurementAgent.submittedToApprovedLeadTime = event.target.value;
        }


        this.setState({
            procurementAgent
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true,
            procurementAgentCode: true,
            procurementAgentName: true,
            submittedToApprovedLeadTime: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('procurementAgentForm', (fieldName) => {
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
        RealmService.getRealmListAll()
        .then(response => {
            if (response.status == 200) {
                this.setState({
                    realms: response.data
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
                    this.setState({ message: error.message });
                } else {
                    switch (error.response ? error.response.status : "") {
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

        CountryService.getCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        countries: response.data.data
                    })
                }else{
                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {
                            this.hideSecondComponent();
                        })

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
    }

    render() {
        const { realms } = this.state;
        const { countries } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);
        
        // let countryList = countries.length > 0
        //     && countries.map((item, i) => {
        //         return (
        //             <option key={i} value={item.countryuId}>
        //                 {item.label.label_en}
        //             </option>
        //         )
        //     }, this);
        return (
            <div className="animated fadeIn">
                   <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>

                            <CardHeader>
                                <i className="icon-note"></i><strong>Add Procurement Agent</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    RealmCountryService.addRealmCountry(this.state.procurementAgent)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/procurementAgent/listProcurementAgent/green${response.data.message}`)
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                },
                                                    () => {
                                                        this.hideSecondComponent();
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
                                            <Form onSubmit={handleSubmit} noValidate name='procurementAgentForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">Realm</Label>
                                                        <Input
                                                            type="select"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="lg"
                                                            valid={!errors.realmId}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                        >
                                                            <option value="">Please select</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback>{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="countryId">Country</Label>
                                                        <Input
                                                            type="select"
                                                            name="countryId"
                                                            id="countryId"
                                                            bsSize="lg"
                                                            valid={!errors.countryId}
                                                            invalid={touched.countryId && !!errors.countryId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                        >
                                                            <option value="">Please select</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback>{errors.countryId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="procurementAgentCode">Procurement Agent Code</Label>
                                                        <Input type="text"
                                                            name="procurementAgentCode"
                                                            id="procurementAgentCode"
                                                            valid={!errors.procurementAgentCode}
                                                            invalid={touched.procurementAgentCode && !!errors.procurementAgentCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            maxLength={6}
                                                            value={this.Capitalize(this.state.procurementAgent.procurementAgentCode)}
                                                        />
                                                        <FormFeedback>{errors.procurementAgentCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="procurementAgentName">Procurement Agent Name</Label>
                                                        <Input type="text"
                                                            name="procurementAgentName"
                                                            id="procurementAgentName"
                                                            valid={!errors.procurementAgentName}
                                                            invalid={touched.procurementAgentName && !!errors.procurementAgentName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.Capitalize(this.state.procurementAgent.label.label_en)}
                                                        />
                                                        <FormFeedback>{errors.procurementAgentName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="submittedToApprovedLeadTime">Submitted To Approved Lead Time</Label>
                                                        <Input type="number"
                                                            name="submittedToApprovedLeadTime"
                                                            id="submittedToApprovedLeadTime"
                                                            valid={!errors.submittedToApprovedLeadTime}
                                                            invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            min={1}
                                                        />
                                                        <FormFeedback>{errors.submittedToApprovedLeadTime}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="submit" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}>Submit</Button>
                                                        <Button type="reset" color="danger" className="mr-1" onClick={this.cancelClicked}>Cancel</Button>
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
        this.props.history.push(`/procurementAgent/listProcurementAgent/`+ 'red/' +i18n.t('static.program.actioncancelled'))
    }
}

export default AddRealmCountryComponent;
