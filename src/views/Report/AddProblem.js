import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import moment from "moment";

const initialValues = {
    // roleName: "",

}
const entityname = i18n.t('static.role.role');
const validationSchema = function (values) {
    return Yup.object().shape({
        // roleName: Yup.string()
        //     .required(i18n.t('static.role.roletext'))
        //     .matches(/^([a-zA-Z]+\s)*[a-zA-Z]+$/, i18n.t('static.message.rolenamevalidtext')),

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
class AddRoleComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            problemReport: {
                "problemReportId": "",
                "program": {
                  "id": "",
                  "label": {
                    "active": true,
                    "labelId": "",
                    "label_en": "",
                    "label_sp": "",
                    "label_fr": "",
                    "label_pr": ""
                  }
                },
                "versionId": "",
                "realmProblem": {
                  "active": true,
                  "realmProblemId": "",
                  "realm": {
                    "id": "",
                    "label": {
                      "active": true,
                      "labelId": "",
                      "label_en": "",
                      "label_sp": "",
                      "label_fr": "",
                      "label_pr": ""
                    },
                    "code": ""
                  },
                  "problem": {
                    "active": true,
                    "problemId": "",
                    "label": {
                      "active": true,
                      "labelId": "",
                      "label_en": "",
                      "label_sp": null,
                      "label_fr": null,
                      "label_pr": null
                    },
                    "actionUrl": "",
                    "actionLabel": {
                      "active": true,
                      "labelId": "",
                      "label_en": "",
                      "label_sp": null,
                      "label_fr": null,
                      "label_pr": null
                    }
                  },
                  "criticality": {
                    "id": "",
                    "label": {
                      "active": true,
                      "labelId": "",
                      "label_en": "",
                      "label_sp": null,
                      "label_fr": null,
                      "label_pr": null
                    },
                    "colorHtmlCode": ""
                  },
                  "data1": "",
                  "data2": null,
                  "data3": null,
                  "problemId": ""
                },
                "dt": "",
                "region": {
                  "id": "",
                  "label": {
                    "active": true,
                    "labelId": "",
                    "label_en": "",
                    "label_sp": "",
                    "label_fr": "",
                    "label_pr": ""
                  }
                },
                "planningUnit": {
                  "id": "",
                  "label": {
                    "active": true,
                    "labelId": "",
                    "label_en": "",
                    "label_sp": null,
                    "label_fr": null,
                    "label_pr": null
                  }
                },
                "shipmentId": "",
                "data5": "",
                "problemStatus": {
                  "id": "",
                  "label": {
                    "active": true,
                    "labelId": "",
                    "label_en": "",
                    "label_sp": null,
                    "label_fr": null,
                    "label_pr": null
                  }
                },
                "problemType": {
                  "id": "",
                  "label": {
                    "label_en": ""
                  }
                },
                "createdBy": {
                  "userId": "",
                  "username": ""
                },
                "createdDate": "",
                "lastModifiedBy": {
                  "userId": "",
                  "username": ""
                },
                "lastModifiedDate": "",
                "problemTransList": [
                  {
                    "problemReportTransId": "",
                    "problemStatus": {
                      "id": "",
                      "label": {
                        "active": true,
                        "labelId": "",
                        "label_en": "",
                        "label_sp": null,
                        "label_fr": null,
                        "label_pr": null
                      }
                    },
                    "notes": "",
                    "createdBy": {
                      "userId": "",
                      "username": ""
                    },
                    "createdDate": ""
                  },
                  {
                    "problemReportTransId": "",
                    "problemStatus": {
                      "id": '',
                      "label": {
                        "active": true,
                        "labelId": '',
                        "label_en": "",
                        "label_sp": null,
                        "label_fr": null,
                        "label_pr": null
                      }
                    },
                    "notes": "",
                    "createdBy": {
                      "userId": "",
                      "username": ""
                    },
                    "createdDate": ""
                  }
                ]
              },
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
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
        // let { role } = this.state;
        // if (event.target.name == "roleName") {
        //     role.label.label_en = event.target.value;
        // }
        this.setState({
            // role
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            // roleName: true,
            // businessFunctions: true,
            // canCreateRoles: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('roleForm', (fieldName) => {
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

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    componentDidMount() {



    }

    render() {
        return (
            <div className="animated fadeIn">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {


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
                                        handleReset,
                                        setFieldValue,
                                    }) => (
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='roleForm'>
                                                <CardBody className="pt-2 pb-0">

                                                    <FormGroup>
                                                        <Label for="programCode">{i18n.t('static.program.programCode')}</Label>
                                                        <Input type="text"
                                                            name="programCode"
                                                            id="programCode"
                                                            bsSize="sm"
                                                            valid={!errors.programCode}
                                                            invalid={(touched.programCode && this.state.problemReport.program.code != '')}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.problemReport.program.code}
                                                            required
                                                        /><FormFeedback className="red">{errors.programCode}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="versionId">{i18n.t('static.program.versionId')}</Label>
                                                        <Input type="text"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
                                                            readOnly
                                                            valid={!errors.versionId}
                                                            invalid={(touched.versionId && this.state.problemReport.versionId != '')}
                                                            onChange={(e) => { handleChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.problemReport.versionId}
                                                            required />
                                                        <FormFeedback className="red">{errors.versionId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup className="col-md-6 pl-md-0">
                                                        <Label for="createdDate">{i18n.t('static.report.createdDate')}</Label>
                                                        <Input type="text"
                                                            name="createdDate"
                                                            id="createdDate"
                                                            bsSize="sm"
                                                            readOnly
                                                            valid={!errors.createdDate}
                                                            invalid={(touched.createdDate && this.state.problemReport.createdDate != '')}
                                                            onChange={(e) => { handleChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={moment(this.state.problemReport.createdDate).format('yyyy-MM-DD')}
                                                            className="form-control-sm form-control date-color"
                                                        />
                                                        <FormFeedback className="red">{errors.createdDate}</FormFeedback>
                                                    </FormGroup>


                                                </CardBody>
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
        this.props.history.push(`/role/listRole/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { role } = this.state;
        role.label.label_en = '';
        this.state.businessFunctionId = '';
        this.state.canCreateRoleId = '';

        this.setState(
            {
                role
            }
        )

    }
}

export default AddRoleComponent;