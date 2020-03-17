import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
// import AuthenticationService from '../common/AuthenticationService.js';
import DataSourceTypeService from '../../api/DataSourceTypeService.js'

const initialValues = {
    label: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .required('Please enter country name')
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


export default class AddDataSourceTypeComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataSourceType:
            {
                active: '',
                
                label: {
                    label_en: '',
                    // spaLabel: '',
                    // freLabel: '',
                    // porLabel: '',
                    labelId: 0,
                }
            }
        }

        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);

    }

    dataChange(event) {
        // this.setState(
        //     {
        //         [event.target.name]: event.target.value
        //     }
        // )
        let { dataSourceType } = this.state
        if (event.target.name === "label") {
            dataSourceType.label.label_en = event.target.value
        }

        this.setState(
            {
                dataSourceType
            }, () => {
                // console.log(this.state)
            }
        )
    };

    touchAll(setTouched, errors) {
        setTouched({
            'label': true,
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('dataSourceType', (fieldName) => {
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
        // $("#dataSourceTypeForm").validate({
        //     ignore: [],
        //     rules: {
        //         'label_en': {
        //             required: true,
        //             lettersonlywhitespace: true,
        //             maxlength: 255
        //         },
        // 'freLabel': {

        //     lettersonly: true,
        //     maxlength: 255
        // },
        // 'spaLabel': {

        //     lettersonly: true,
        //     maxlength: 255
        // },
        // 'porLabel': {

        //     lettersonly: true,
        //     maxlength: 255
        // }
        //     },
        //     errorPlacement: function (error, element) {
        //         error.insertAfter(element);
        //     }
        // });


    }

    Capitalize(str) {
        let { dataSourceType } = this.state
        dataSourceType.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    // updateFieldData(event) {
    //     //console.log(event.target.name); 
    //     this.setState(
    //         {
    //             [event.target.name]: event.target.value
    //         }
    //     )

    // }

    // submitForm() {
    //     if (navigator.onLine) {

    //         console.log(this.state);
    //         DataSourceTypeService.addDataSourceType(this.state).then(response => {
    //             this.props.history.push(`/dataSourceTypeList/${response.data.message}`)
    //             console.log("success");
    //         }
    //         )
    //             .catch(
    //                 error => {
    //                     switch (error.message) {
    //                         case "Network Error":
    //                             this.setState({
    //                                 message: error.message
    //                             })
    //                             break
    //                         default:
    //                             this.setState({
    //                                 message: error.message
    //                             })
    //                             break
    //                     }
    //                 }
    //             )




    //     } else {
    //         alert("To perform this action you must be online.");
    //     }
    // }

    // render() {
    //     return (

    //         <div className="page-content-wrap">


    //             <div className="row">

    //                 <div className="">
    //                     <ul class="breadcrumb text-left">
    //                         <li><a href="#">Home</a></li>
    //                         <li><a href="#">Admin</a></li>
    //                         <li><a href="#">Data source type</a></li>
    //                         <li><a href="#">Add Datasource type</a></li>
    //                     </ul>
    //                 </div>
    //                 <div className="help-block"></div>

    //                 <div className="col-md-8 col-md-offset-2">

    //                     <div className="login mt-2 block">


    //                         <div className="panel panel-default">


    //                             <div className="panel-heading">
    //                                 <h3 className="panel-title">Add Data Source Type</h3>
    //                             </div>
    //                             <div className="panel-body">
    //                                 <div className="col-md-8 col-md-offset-2">
    //                                     <div className="block">

    //                                         <form className="form-horizontal" name="dataSourceTypeForm" id="dataSourceTypeForm">

    //                                             <div className="form-group">
    //                                                 <label className="col-md-5 control-label ">Data source type name (English):</label>
    //                                                 <div className="col-md-7">
    //                                                     <input className="form-control" type="text" name="label_en" value={this.Capitalize(this.state.label_en)} onChange={this.updateFieldData} ></input>
    //                                                     <span className="help-block"></span>
    //                                                 </div>
    //                                             </div>




    //                                         </form>

    //                                     </div>
    //                                 </div>

    //                             </div>
    //                             <div className="panel-footer">




    //                                 <button type="button" className="btn btn-success pull-right" onClick={this.submitForm}>Submit</button>


    //                             </div>


    //                         </div>


    //                     </div>


    //                 </div>


    //             </div>


    //         </div>

    //     );
    // }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Add DataSource Type</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    // alert("----"+this.state.label.label_en);
                                    // console.log("------IN SUBMIT------", this.state.dataSourceType.label)
                                    DataSourceTypeService.addDataSourceType(this.state.dataSourceType.label)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/dataSourceType/listDataSourceType/${response.data.message}`)
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
                                            <Form onSubmit={handleSubmit} noValidate name='dataSourceType'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="label">Country name (English):</Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.dataSourceType.label.label_en}
                                                            required />
                                                        <FormFeedback>{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="submit" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)}>Submit</Button>
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
        this.props.history.push(`/dataSourceType/listDataSourceType/` + "Action Canceled")
    }
}