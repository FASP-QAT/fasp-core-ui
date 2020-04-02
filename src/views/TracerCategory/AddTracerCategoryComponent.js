import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button,CardBody, Form, FormFeedback, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import RealmService from "../../api/RealmService";
import TracerCategoryService from "../../api/TracerCategoryService";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';

import getLabelText from '../../CommonComponent/getLabelText';
const entityname = i18n.t('static.tracercategory.tracercategory');

const initialValues = {
    realmId: [],
    tracerCategoryCode: "",
    tracerCategoryName: "",
    submittedToApprovedLeadTime: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.tracercategory.realmtext')),
       tracerCategoryName: Yup.string()
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
            realms: [],
            tracerCategory: {
                realm: {
                },
                label: {

                }
            },
            message: '',
            lang: localStorage.getItem('lang')
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
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
            tracerCategory.realm.realmId = event.target.value;
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );
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
                <h5>{i18n.t(this.state.message)}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>

                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity',{entityname})}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log("this.state.tracerCategory---", this.state.tracerCategory);
                                    TracerCategoryService.addTracerCategory(this.state.tracerCategory)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/tracerCategory/listTracerCategory/`+ i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }
                                        })
                                        .catch(
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
                                                            console.log("Error code unkown");
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
                                            <Form onSubmit={handleSubmit} noValidate name='tracerCategoryForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realm')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                            {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                            <Input
                                                                type="select"
                                                                bsSize="sm"
                                                                name="realmId"
                                                                id="realmId"
                                                                valid={!errors.realmId}
                                                                invalid={touched.realmId && !!errors.realmId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required
                                                            >
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {realmList}
                                                            </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="tracerCategoryName">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                            {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                            <Input type="text"
                                                                bsSize="sm"
                                                                name="tracerCategoryName"
                                                                id="tracerCategoryName"
                                                                valid={!errors.tracerCategoryName}
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
                                                <CardFooter>
                                                    <FormGroup>
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
        this.props.history.push(`/tracerCategory/listTracerCategory/`+ i18n.t('static.message.cancelled', { entityname }))
    }
}

export default AddTracerCategoryComponent;
