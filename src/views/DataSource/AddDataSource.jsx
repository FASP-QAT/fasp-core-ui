import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import AuthenticationService from '../common/AuthenticationService.js';
import DataSourceService from '../../api/DataSourceService';
import DataSourceTypeService from '../../api/DataSourceTypeService';
import i18n from '../../i18n';

const initialValues = {
    label: '',
    dataSourceTypeId: '',
    dataSourceTypeList: []
}


const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .required('Please enter country name'),
        dataSourceTypeId: Yup.string()
            .required('Please select data source type')
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


export default class AddDataSource extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            label: {
                label_en: ''
                // freLabel: '',
                // spaLabel: '',
                // porLabel: ''
            },
            dataSourceType: {
                dataSourceTypeId: ''
            },
            dataSourceTypeList: []
        }
        this.Capitalize = this.Capitalize.bind(this);

        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        if (event.target.name === "label") {
            //console.log("inside if")
            this.state.label.label_en = event.target.value
        }
        // if (event.target.name === "label.freLabel") {
        //     //console.log("inside if")
        //     this.state.label.freLabel = event.target.value
        // } if (event.target.name === "label.spaLabel") {
        //     //console.log("inside if")
        //     this.state.label.spaLabel = event.target.value
        // } if (event.target.name === "label.porLabel") {
        //     //console.log("inside if")
        //     this.state.label.porLabel = event.target.value
        // }
        else if (event.target.name === "dataSourceTypeId") {
            this.state.dataSourceType.dataSourceTypeId = event.target.value
        }

        let { dataSource } = this.state
        this.setState(
            {
                dataSource
            }
        )

    };

    touchAll(setTouched, errors) {
        setTouched({
            'label': true,
            'dataSourceTypeId': true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('dataSourceForm', (fieldName) => {
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
        DataSourceTypeService.getDataSourceTypeListActive().then(response => {
            //console.log(response.data)
            this.setState({
                dataSourceTypeList: response.data
            })
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
                                message: error.message
                            })
                            break
                    }
                }
            );
        // $("#dataSourceForm").validate({
        //     ignore: [],
        //     rules: {
        //         'label.label_en': {
        //             required: true,
        //             lettersonlywhitespace: true,
        //             maxlength: 255
        //         },
        // 'label.freLabel': {

        //     lettersonly: true,
        //     maxlength: 255
        // },
        // 'label.spaLabel': {

        //     lettersonly: true,
        //     maxlength: 255
        // },
        // 'label.porLabel': {

        //     lettersonly: true,
        //     maxlength: 255
        // },
        //         'dataSourceType.dataSourceTypeId': {
        //             required: true
        //         }
        //     },
        //     errorPlacement: function (error, element) {
        //         error.insertAfter(element);
        //     }
        // });

    }

    // updateFieldData(event) {
    //     if (event.target.name === "label.label_en") {
    //         //console.log("inside if")
    //         this.state.label.label_en = event.target.value
    //     }
    //     // if (event.target.name === "label.freLabel") {
    //     //     //console.log("inside if")
    //     //     this.state.label.freLabel = event.target.value
    //     // } if (event.target.name === "label.spaLabel") {
    //     //     //console.log("inside if")
    //     //     this.state.label.spaLabel = event.target.value
    //     // } if (event.target.name === "label.porLabel") {
    //     //     //console.log("inside if")
    //     //     this.state.label.porLabel = event.target.value
    //     // }
    //     else if (event.target.name === "dataSourceType.dataSourceTypeId") {
    //         this.state.dataSourceType.dataSourceTypeId = event.target.value
    //     }

    //     let { dataSource } = this.state
    //     this.setState(
    //         {
    //             dataSource
    //         }
    //     )


    // }
    Capitalize(str) {
        this.state.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    // submitForm() {

    //     if (navigator.onLine) {
    //         // if ($("#dataSourceForm").valid()) {
    //         console.log(this.state);
    //         //delete this.state["dataSourceTypeList"];
    //         DataSourceService.addDataSource(this.state).then(response => {
    //             this.props.history.push(`/dataSourceList/${response.data.message}`)
    //             //console.log("success");
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
    //     const { dataSourceTypeList } = this.state;
    //     let dataSourceTypes = dataSourceTypeList.length > 0
    //         && dataSourceTypeList.map((item, i) => {
    //             return (
    //                 <option key={i} value={item.dataSourceTypeId}>{item.label.label_en}</option>
    //             )
    //         }, this);
    //     return (
    //         // <>
    //         //     <div><h5>{this.state.message}</h5></div>
    //         //     <h3>{myConst.ADD_DATASOURCE}</h3>
    //         //     <form name="dataSourceForm" id="dataSourceForm">
    //         //         <div>
    //         //             <label>{myConst.DATASOURCE_NAME_EN}:-</label>
    //         //             <input type="text" name="label.label_en" value={this.Capitalize(this.state.label.label_en)} onChange={this.updateFieldData} />
    //         //         </div>
    //         //         <br /><br />


    //         //         <div>
    //         //             {myConst.SELECT_DATA_SOURCE_TYPE} : <select id="dataSourceTypeId" name="dataSourceType.dataSourceTypeId" onChange={this.updateFieldData}>
    //         //                 <option value="">-Nothing Selected-</option>
    //         //                 {dataSourceTypes}
    //         //             </select>
    //         //         </div>
    //         //         <br></br>
    //         //         <div>
    //         //             <button type="button" onClick={this.submitForm}>{myConst.SUBMIT_BUTTON}</button>
    //         //         </div>
    //         //     </form>
    //         // </>

    //         <div className="page-content-wrap">


    //             <div className="row">

    //                 <div className="">
    //                     <ul class="breadcrumb text-left">
    //                         <li><a href="#">Home</a></li>
    //                         <li><a href="#">Admin</a></li>
    //                         <li><a href="#">Data Source</a></li>
    //                         <li><a href="#">Add Data Source</a></li>
    //                     </ul>
    //                 </div>
    //                 <div className="help-block"></div>

    //                 <div className="col-md-8 col-md-offset-2">

    //                     <div className="login mt-2 block">


    //                         <div className="panel panel-default">


    //                             <div className="panel-heading">
    //                                 <h3 className="panel-title">Add Data Source</h3>
    //                             </div>
    //                             <div className="panel-body">
    //                                 <div className="col-md-8 col-md-offset-2">
    //                                     <div className="block">

    //                                         <form className="form-horizontal" name="dataSourceForm" id="dataSourceForm">


    //                                             <div className="form-group">
    //                                                 <label className="col-md-5 control-label">Data source name (English):</label>
    //                                                 <div className="col-md-7">
    //                                                     <input className="form-control" type="text" name="label.engLabel" onChange={this.updateFieldData} ></input>
    //                                                     <span className="help-block"></span>
    //                                                 </div>
    //                                             </div>



    //                                             <div className="form-group">
    //                                                 <label className="col-md-5 control-label"> Select Data Source Type : </label>
    //                                                 <div className="col-md-7">
    //                                                     <select className="form-control select" id="dataSourceTypeId" name="dataSourceType.dataSourceTypeId" onChange={this.updateFieldData}>
    //                                                         <option value="" disabled>-Nothing Selected-</option>
    //                                                         {dataSourceTypes}
    //                                                     </select>
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

        const { dataSourceTypeList } = this.state;
        let dataSourceTypes = dataSourceTypeList.length > 0
            && dataSourceTypeList.map((item, i) => {
                return (
                    <option key={i} value={item.dataSourceTypeId}>{item.label.label_en}</option>
                )
            }, this);

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
        <i className="icon-note"></i><strong>{i18n.t('static.datasource.datasourceadd')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    // alert("----"+this.state.label.label_en);
                                    // console.log("------IN SUBMIT------", this.state.country)
                                    DataSourceService.addDataSource(this.state)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/dataSource/listDataSource/${response.data.message}`)
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
                                            <Form onSubmit={handleSubmit} noValidate name='dataSourceForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.datasource.datasource')}</Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.label.label_en}
                                                            required />
                                                        <FormFeedback>{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="dataSourceTypeId">{i18n.t('static.datasource.datasourcetype')}</Label>
                                                        <Input
                                                            type="select"
                                                            name="dataSourceTypeId"
                                                            id="dataSourceTypeId"
                                                            bsSize="lg"
                                                            valid={!errors.dataSourceTypeId}
                                                            invalid={touched.dataSourceTypeId && !!errors.dataSourceTypeId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            // value={this.state.dataSourceType.dataSourceTypeId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {dataSourceTypes}
                                                        </Input>
                                                        <FormFeedback>{errors.dataSourceTypeId}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="submit" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)}>{i18n.t('static.common.submit')}</Button>
                                                        <Button type="reset" color="danger" className="mr-1" onClick={this.cancelClicked}>{i18n.t('static.common.cancel')}</Button>
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
        this.props.history.push(`/dataSource/listDataSource/` + "Action Canceled")
    }

}