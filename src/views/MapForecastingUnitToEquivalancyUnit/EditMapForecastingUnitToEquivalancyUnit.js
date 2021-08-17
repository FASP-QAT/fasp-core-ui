import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';

import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
// import DimensionService from '../../api/DimensionService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { SPACE_REGEX } from '../../Constants.js';

const initialValues = {
    label: ""
}
const entityname = i18n.t('static.mapForecastingUnitToEquivalancyUnit.mapForecastingUnitToEquivalancyUnit');
const validationSchema = function (values) {
    return Yup.object().shape({
        forecastingUnitId: Yup.string()
            .required(i18n.t('static.forecastingunit.forecastingunittext')),
        equivalancyUnitId: Yup.string()
            .required(i18n.t('static.equivalancyUnit.equivalancyUnittext')),
        graphUnitId: Yup.string()
            .required(i18n.t('static.graphUnit.graphUnittext')),
        conversionToFu: Yup.string()
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .required(i18n.t('static.currency.conversionrateNumber')).min(0, i18n.t('static.currency.conversionrateMin')),
        dataSetId: Yup.string()
            .required(i18n.t('static.dataSet.dataSettext'))

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


export default class EditMapForecastingUnitToEquivalancyUnitComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mapForecastingUnitToEquivalancyUnit: {
                forecastingUnit: {
                    id: 3,
                    label: {
                        label_en: 'Artemether/Lumefantrine 20/120 mg Tablet',
                    },
                },
                equivalancyUnit: {
                    id: 1,
                    label: {
                        label_en: 'Patient Month of ARV',
                    },
                },
                graphUnit: {
                    id: 1,
                    label: {
                        label_en: 'Patient Month',
                    },
                },
                dataSet: {
                    id: 3,
                    label: {
                        label_en: 'Zambia ARV',
                    },
                },
                conversionToFu: 0.333,
                note: ''
            },
            message: '',
            loading: true
        }

        this.resetClicked = this.resetClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    dataChange(event) {
        let { mapForecastingUnitToEquivalancyUnit } = this.state
        if (event.target.name === "forecastingUnitId") {
            mapForecastingUnitToEquivalancyUnit.forecastingUnit.id = event.target.value
        } else if (event.target.name === "equivalancyUnitId") {
            mapForecastingUnitToEquivalancyUnit.equivalancyUnit.id = event.target.value
        } else if (event.target.name === "graphUnitId") {
            mapForecastingUnitToEquivalancyUnit.graphUnit.id = event.target.value
        } else if (event.target.name === "conversionToFu") {
            mapForecastingUnitToEquivalancyUnit.conversionToFu = event.target.value
        } else if (event.target.name === "dataSetId") {
            mapForecastingUnitToEquivalancyUnit.dataSet.id = event.target.value
        } else if (event.target.name === "notes") {
            mapForecastingUnitToEquivalancyUnit.note = event.target.value
        }
        this.setState(
            {
                mapForecastingUnitToEquivalancyUnit
            }
        )
    };


    touchAll(setTouched, errors) {
        setTouched({
            forecastingUnitId: true,
            equivalancyUnitId: true,
            graphUnitId: true,
            conversionToFu: true,
            dataSetId: true,
            notes: true,
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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
        this.setState({ loading: false })

    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
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
                                    console.log(this.state.mapForecastingUnitToEquivalancyUnit)
                                    // ScaleUpTypeService.addScaleUpType(this.state.scaleUpType).then(response => {
                                    //     if (response.status == 200) {
                                    //         this.props.history.push(`/scaleUpType/listScaleUpType/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                    //     } else {
                                    //         this.setState({
                                    //             message: response.data.messageCode, loading: false
                                    //         },
                                    //             () => {
                                    //                 this.hideSecondComponent();
                                    //             })
                                    //     }
                                    // }
                                    // )
                                    //     .catch(
                                    //         error => {
                                    //             if (error.message === "Network Error") {
                                    //                 this.setState({
                                    //                     message: 'static.unkownError',
                                    //                     loading: false
                                    //                 });
                                    //             } else {
                                    //                 switch (error.response ? error.response.status : "") {

                                    //                     case 401:
                                    //                         this.props.history.push(`/login/static.message.sessionExpired`)
                                    //                         break;
                                    //                     case 403:
                                    //                         this.props.history.push(`/accessDenied`)
                                    //                         break;
                                    //                     case 500:
                                    //                     case 404:
                                    //                     case 406:
                                    //                         this.setState({
                                    //                             message: error.response.data.messageCode,
                                    //                             loading: false
                                    //                         });
                                    //                         break;
                                    //                     case 412:
                                    //                         this.setState({
                                    //                             message: error.response.data.messageCode,
                                    //                             loading: false
                                    //                         });
                                    //                         break;
                                    //                     default:
                                    //                         this.setState({
                                    //                             message: 'static.unkownError',
                                    //                             loading: false
                                    //                         });
                                    //                         break;
                                    //                 }
                                    //             }
                                    //         }
                                    //     );
                                    setTimeout(() => {
                                        setSubmitting(false)
                                    }, 2000)
                                }
                                }

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
                                            <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                                <CardBody style={{ display: this.state.loading ? "none" : "block" }}>

                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.product.unit1')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            valid={!errors.forecastingUnitId && this.state.mapForecastingUnitToEquivalancyUnit.forecastingUnit.id != ''}
                                                            invalid={touched.forecastingUnitId && !!errors.forecastingUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            bsSize="sm"
                                                            // className="col-md-4"
                                                            value={this.state.mapForecastingUnitToEquivalancyUnit.forecastingUnit.id}
                                                            onBlur={handleBlur}
                                                            type="select" name="forecastingUnitId" id="forecastingUnitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            <option value="1">Abacavir 20 mg/mL Solution</option>
                                                            <option value="2">Abacavir 60 mg Tablet</option>
                                                            <option value="3">Efavirenz/Lamivudine/Tenofovir DF 600/300/300 mg Tablet</option>
                                                            {/* {realmCountries} */}
                                                        </Input>
                                                        <FormFeedback>{errors.forecastingUnitId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.equivalancyUnit.equivalancyUnit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            valid={!errors.equivalancyUnitId}
                                                            invalid={touched.equivalancyUnitId && !!errors.equivalancyUnitId || this.state.mapForecastingUnitToEquivalancyUnit.equivalancyUnit.id == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            bsSize="sm"
                                                            value={this.state.mapForecastingUnitToEquivalancyUnit.equivalancyUnit.id}
                                                            // className="col-md-4"
                                                            onBlur={handleBlur}
                                                            type="select" name="equivalancyUnitId" id="equivalancyUnitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            <option value="1">Patient Month of ARV</option>
                                                            <option value="2">Male Condom (Latex) Lubricated, 53 mm</option>
                                                            <option value="3">Artemether/Lumefantrine 20/120 mg Tablet</option>
                                                            {/* {realmCountries} */}
                                                        </Input>
                                                        <FormFeedback>{errors.equivalancyUnitId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.graphUnit.graphUnit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            valid={!errors.graphUnitId}
                                                            invalid={touched.graphUnitId && !!errors.graphUnitId || this.state.mapForecastingUnitToEquivalancyUnit.graphUnit.id == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            bsSize="sm"
                                                            // className="col-md-4"
                                                            value={this.state.mapForecastingUnitToEquivalancyUnit.graphUnit.id}
                                                            onBlur={handleBlur}
                                                            type="select" name="graphUnitId" id="graphUnitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            <option value="1">Patient Month</option>
                                                            <option value="2"># Condoms</option>
                                                            <option value="3">Tablets</option>
                                                            {/* {realmCountries} */}
                                                        </Input>
                                                        <FormFeedback>{errors.graphUnitId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="conversionToFu">{i18n.t('static.mapForecastingUnitToEquivalancyUnit.conversionToFu')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-exchange"></i></InputGroupText> */}
                                                        <Input type="number"
                                                            name="conversionToFu"
                                                            id="conversionToFu"
                                                            valid={!errors.conversionToFu}
                                                            invalid={touched.conversionToFu && !!errors.conversionToFu || this.state.mapForecastingUnitToEquivalancyUnit.conversionToFu == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.mapForecastingUnitToEquivalancyUnit.conversionToFu}
                                                            bsSize="sm"
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.conversionToFu}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.forecastProgram.forecastProgram')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            valid={!errors.dataSetId}
                                                            invalid={touched.dataSetId && !!errors.dataSetId || this.state.mapForecastingUnitToEquivalancyUnit.dataSet.id == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            bsSize="sm"
                                                            // className="col-md-4"
                                                            value={this.state.mapForecastingUnitToEquivalancyUnit.dataSet.id}
                                                            onBlur={handleBlur}
                                                            type="select" name="dataSetId" id="dataSetId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            <option value="1">Benin PRH,Condoms Forecast Dataset</option>
                                                            <option value="2">Benin ARV Forecast Dataset</option>
                                                            <option value="3">Zambia ARV</option>
                                                            {/* {realmCountries} */}
                                                        </Input>
                                                        <FormFeedback>{errors.dataSetId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.notes')}</Label>
                                                        <Input
                                                            value={this.state.mapForecastingUnitToEquivalancyUnit.note}
                                                            bsSize="sm"
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            // maxLength={600}
                                                            type="textarea" name="notes" id="notes" />
                                                        <FormFeedback>{errors.notes}</FormFeedback>
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

                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;

                                                        {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                                                        &nbsp; */}
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>
                                        )}

                            />

                        </Card>
                    </Col>
                </Row>

            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/mapForecastingUnitToEquivalancyUnit/listMapForecastingUnitToEquivalancyUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { mapForecastingUnitToEquivalancyUnit } = this.state
        mapForecastingUnitToEquivalancyUnit.forecastingUnit.id = '';
        mapForecastingUnitToEquivalancyUnit.equivalancyUnit.id = '';
        mapForecastingUnitToEquivalancyUnit.graphUnit.id = '';
        mapForecastingUnitToEquivalancyUnit.conversionToFu = '';
        mapForecastingUnitToEquivalancyUnit.dataSet.id = '';
        mapForecastingUnitToEquivalancyUnit.note = '';

        this.setState({
            mapForecastingUnitToEquivalancyUnit
        },
            () => { });
    }
} 