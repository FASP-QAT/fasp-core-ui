import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'

import DataSourceTypeService from '../../api/DataSourceTypeService';
import DataSourceService from '../../api/DataSourceService';
import AuthenticationService from '../common/AuthenticationService.js';
import i18n from '../../i18n';
let initialValues = {
    label: '',
    dataSourceTypeId: '',
    dataSourceTypeList: []
}

const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .required(i18n.t('static.datasource.datasourcetext')),
        dataSourceTypeId: Yup.string()
            .required(i18n.t('static.datasource.datasourcetypetext'))
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
export default class UpdateDataSourceComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {

            dataSource: {
                message: '',
                active: '',
                dataSourceId: '',
                label: {
                    label_en: '',
                    // spaLabel: '',
                    // freLabel: '',
                    // porLabel: '',
                    labelId: '',
                },
                dataSourceType: {
                    dataSourceTypeId: ''
                }
            },
            dataSourceTypeList: []
        }

        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        initialValues = {
            label: this.props.location.state.dataSource.label.label_en,
            dataSourceTypeId: this.props.location.state.dataSource.dataSourceType.dataSourceTypeId
        }
    }

    dataChange(event) {
        let { dataSource } = this.state

        if (event.target.name === "label") {
            dataSource.label.label_en = event.target.value
        }

        if (event.target.name === "dataSourceTypeId") {
            this.state.dataSource.dataSourceType.dataSourceTypeId = event.target.value
        } else if (event.target.name === "active") {
            dataSource.active = event.target.id === "active2" ? false : true
        }

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
        this.setState({
            dataSource: this.props.location.state.dataSource
        });

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

        // $("#updatyeDataSourceForm").validate({
        //     ignore: [],
        //     rules: {
        //         'dataSource.label.label_en': {
        //             required: true,
        //             lettersonlywhitespace: true,
        //             maxlength: 255
        //         },
        // 'dataSource.label.freLabel': {

        //     lettersonly: true,
        //     maxlength: 255
        // },
        // 'dataSource.label.spaLabel': {

        //     lettersonly: true,
        //     maxlength: 255
        // },
        // 'dataSource.label.porLabel': {

        //     lettersonly: true,
        //     maxlength: 255
        // },
        //         'dataSource.dataSourceType.dataSourceTypeId': {
        //             required: true
        //         }
        //     },
        //     errorPlacement: function (error, element) {
        //         error.insertAfter(element);
        //     }
        // });
    }

    // updateFieldData(event) {

    //     let { dataSource } = this.state

    //     if (event.target.name === "label") {
    //         // console.log("inside if")
    //         dataSource.label.label_en = event.target.value
    //     }
    //     // if (event.target.name === "dataSource.label.freLabel") {
    //     //     //onsole.log("inside if")
    //     //     dataSource.label.freLabel = event.target.value
    //     // } if (event.target.name === "dataSource.label.spaLabel") {
    //     //     //console.log("inside if")
    //     //     dataSource.label.spaLabel = event.target.value
    //     // } if (event.target.name === "dataSource.label.porLabel") {
    //     //     //console.log("inside if")
    //     //     dataSource.label.porLabel = event.target.value
    //     // } 
    //     if (event.target.name === "dataSourceTypeId") {
    //         this.state.dataSource.dataSourceType.dataSourceTypeId = event.target.value
    //     } else if (event.target.name === "active") {
    //         //console.log("hi----");
    //         dataSource.active = event.target.id === "active2" ? false : true
    //     }


    //     this.setState(
    //         {
    //             dataSource
    //         }
    //     )


    // }
    Capitalize(str) {
        this.state.dataSource.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    cancelClicked() {
        this.props.history.push(`/dataSource/listDataSource/` + "Action Canceled")
    }

    // updateForm() {

    //     if (navigator.onLine) {
    //         // if ($("#updatyeDataSourceForm").valid()) {
    //         //console.log(this.state);
    //         DataSourceService.editDataSource(this.state.dataSource).then(response => {
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

    //         <div className="page-content-wrap">


    //             <div className="row">

    //                 <div className="">
    //                     <ul class="breadcrumb text-left">
    //                         <li><a href="#">Home</a></li>
    //                         <li><a href="#">Admin</a></li>
    //                         <li><a href="#">Data Source</a></li>
    //                         <li><a href="#">Update Data Source</a></li>
    //                     </ul>
    //                 </div>
    //                 <div className="help-block"></div>

    //                 <div className="col-md-8 col-md-offset-2">

    //                     <div className="login mt-2 block">


    //                         <div className="panel panel-default">


    //                             <div className="panel-heading">
    //                                 <h3 className="panel-title">Update Data Source</h3>
    //                             </div>
    //                             <div className="panel-body">
    //                                 <div className="col-md-8 col-md-offset-2">
    //                                     <div className="block">

    //                                         <form className="form-horizontal" name="updatyeDataSourceForm" id="updatyeDataSourceForm">




    //                                             <div className="form-group">
    //                                                 <label className="col-md-5 control-label ">Data source type name (English):</label>
    //                                                 <div className="col-md-7">
    //                                                     <input className="form-control" type="text" name="dataSource.label.label_en" value={this.Capitalize(this.state.dataSource.label.label_en)} onChange={this.updateFieldData}></input>
    //                                                     <span className="help-block"></span>
    //                                                 </div>
    //                                             </div>
    //                                             <div className="form-group">
    //                                                 <label className="col-md-5 control-label ">Data source type name (English):</label>
    //                                                 <div className="col-md-7">
    //                                                     <input className="form-control" type="text" name="dataSource.label.label_en" value={this.Capitalize(this.state.dataSource.label.label_en)} onChange={this.updateFieldData}></input>
    //                                                     <span className="help-block"></span>
    //                                                 </div>
    //                                             </div>

    //                                             <div className="col-md-4">   Status:</div>
    //                                             <div className="col-md-4"> <input type="radio" id="dataSource.active1" name="dataSource.active" value={true} checked={this.state.dataSource.active === true} onChange={this.updateFieldData} /> Active</div>
    //                                             <div className="col-md-4">  <input type="radio" id="dataSource.active2" name="dataSource.active" value={false} checked={this.state.dataSource.active === false} onChange={this.updateFieldData} /> Disabled</div>



    //                                             <div className="form-group">
    //                                                 <label className="col-md-5 control-label "> Select Data Source Type :</label>
    //                                                 <div className="col-md-7">
    //                                                     <select className="select form-control" id="dataSourceTypeId" name="dataSource.dataSourceType.dataSourceTypeId" value={this.state.dataSource.dataSourceType ? this.state.dataSource.dataSourceType.dataSourceTypeId : ''} onChange={this.updateFieldData}>
    //                                                         <option value="">-Nothing Selected-</option>
    //                                                         {dataSourceTypes}
    //                                                     </select>
    //                                                     <span className="help-block"></span>
    //                                                 </div>
    //                                             </div>
    //                                             <div className="form-group">
    //                                                 <div className="col-md-12"><input type="hidden" name="dataSource.dataSourceId" value={this.state.dataSource.dataSourceId} />
    //                                                     <input type="hidden" name="dataSource.label.labelId" value={this.state.dataSource.label.labelId} /></div>

    //                                             </div>




    //                                         </form>

    //                                     </div>
    //                                 </div>

    //                             </div>
    //                             <div className="panel-footer">


    //                                 <button type="button" className="btn btn-primary pull-right ml-1" onClick={this.cancelClicked}>Cancel</button>

    //                                 <button type="button" className="btn btn-success pull-right" onClick={this.updateForm}>Update</button>


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
                                <i className="icon-note"></i><strong>{i18n.t('static.datasource.datasourceedit')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    DataSourceService.editDataSource(this.state.dataSource)
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
                                                        <Label htmlFor="label">{i18n.t('static.datasource.datasource')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="label"
                                                            id="label"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.dataSource.label.label_en}
                                                            required
                                                        >
                                                        </Input>
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
                                                            value={this.state.dataSource.dataSourceType.dataSourceTypeId}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {dataSourceTypes}
                                                        </Input>
                                                        <FormFeedback>{errors.dataSourceTypeId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label>{i18n.t('static.common.status')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.dataSource.active === true}
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
                                                                checked={this.state.dataSource.active === false}
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

}