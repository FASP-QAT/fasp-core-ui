import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import AuthenticationService from '../common/AuthenticationService.js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import UnitTypeService from '../../api/UnitTypeService.js';

let initialValues = {
    label: ""
}
const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .required('Please enter Diamension')
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


export default class UpdateUnitTypeComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            unitType: {
                unitTypeId: '',
                label: {
                    labelId: '',
                    label_en: ''
                }
            }
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }

    dataChange(event) {
        let { unitType } = this.state
        if (event.target.name === "label") {
            //console.log("inside if")
            unitType.label.label_en = event.target.value
        }
        this.setState(
            {
                unitType
            }
        )
    };

    touchAll(setTouched, errors) {
        setTouched({
            label: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('diamensionForm', (fieldName) => {
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
        // console.log(this.props.location.state.unitType);
        this.setState({
            unitType: this.props.location.state.unitType
        });

    }

    Capitalize(str) {
        this.state.unitType.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    cancelClicked() {
        this.props.history.push(`/diamension/diamensionlist/` + "Action Canceled")
    }

    // render() {

    //     return (
    //         <>
    //             <h3>Update Unit Type</h3>
    //             <form name="updateUnitTypeForm" id="updateUnitTypeForm">
    //                 <div>
    //                     <label>Unit Type Name:-</label>
    //                     <input type="text" name="unitType.label.label_en" value={this.Capitalize(this.state.unitType.label.label_en)} onChange={this.updateFieldData} />
    //                 </div>
    //                 <br /><br />
    //                 {/*                   
    //                 <div>
    //                     {myConst.ACTIVE}:
    //                 <input type="radio" id="dataSourceType.active1" name="dataSourceType.active" value={true} checked={this.state.dataSourceType.active === true} onChange={this.updateFieldData} /> Active
    //                 <input type="radio" id="dataSourceType.active2" name="dataSourceType.active" value={false} checked={this.state.dataSourceType.active === false} onChange={this.updateFieldData} /> Disabled
    //                  </div> */}

    //                 <div>
    //                     <button type="button" onClick={this.updateForm}>Update</button>
    //                     <button type="button" onClick={this.cancelClicked}>Cancel</button><br></br><br></br>
    //                 </div>
    //             </form>


    //         </>

    //     );
    // }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Edit Diamension</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ language: this.state.language }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    // AuthenticationService.setupAxiosInterceptors();
                                    UnitTypeService.updateUnitType(this.state.unitType).then(response => {
                                        if (response.data.status == "Success") {
                                            this.props.history.push(`/diamension/diamensionlist/${response.data.message}`)
                                        } else {
                                            this.setState({
                                                message: response.data.message
                                            })
                                        }

                                    }
                                    )
                                        .catch(
                                            error => {
                                                switch (error.message) {
                                                    case "Network Error":
                                                        this.setState({
                                                            message: error.response.data
                                                        })
                                                        break
                                                    default:
                                                        this.setState({
                                                            message: error.response.data.message
                                                        })
                                                        break
                                                }
                                            }
                                        )

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
                                            <Form onSubmit={handleSubmit} noValidate name='diamensionForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="label">Dimension</Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.unitType.label.label_en}
                                                            required />
                                                        <FormFeedback>{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                    <Button type="reset" color="danger" className="mr-1 float-right"size="sm" onClick={this.cancelClicked}><i className="fa fa-times"></i> Cancel</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right"size="sm" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>Update</Button>
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

}