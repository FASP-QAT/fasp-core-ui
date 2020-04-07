import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, Input, FormFeedback,InputGroupAddon, InputGroupText, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
// import * as myConst from '../../Labels.js';
import UnitService from '../../api/UnitService.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import '../Forms/ValidationForms/ValidationForms.css';
import getLabelText from '../../CommonComponent/getLabelText.js';

let initialValues = {
    unit: ""
}
const entityname=i18n.t('static.unit.unit');
const validationSchema = function (values) {
    return Yup.object().shape({

        unit: Yup.string()
            .required(i18n.t('static.unit.unittext')),
        unitCode: Yup.string().required(i18n.t('static.unit.unitcodetext'))

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

export default class EditUnitComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unit: this.props.location.state.unit,
            message: ''
        }

        // this.Capitalize = this.Capitalize.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
    }
    Capitalize(str) {
        console.log("capitalize");
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }

    dataChange(event) {
        let { unit } = this.state
        if (event.target.name === "unitName") {
            unit.unitName = event.target.value
        } else if (event.target.name === "unitCode") {
            unit.unitCode = event.target.value
        } else if (event.target.name === "active") {
            unit.active = event.target.id === "active2" ? false : true
        }

        this.setState(
            {
                unit
            },
            () => { }
        );
    };

    touchAll(setTouched, errors) {
        setTouched({
            unitName: true,
            unitCode: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('unitForm', (fieldName) => {
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

    }

    // Capitalize(str) {
    //     let { unit } = this.state
    //     unit.unitName = str.charAt(0).toUpperCase() + str.slice(1)
    // }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity',{entityname})}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ unit: this.state.unit,unitName:this.state.unit.unitName,unitCode:this.state.unit.unitCode }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    UnitService.updateUnit(this.state.unit).then(response => {
                                        console.log(response)
                                        if (response.status == 200) {
                                            this.props.history.push(`/unit/listUnit/`+i18n.t(response.data.messageCode,{entityname}))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode
                                            })
                                        }

                                    }
                                    )
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({ message: error.message });
                                                } else {
                                                    switch (error.response.status) {
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
                                            <Form onSubmit={handleSubmit} noValidate name='unitForm'>
                                                <CardBody>
                                                <FormGroup>
                                                        <Label htmlFor="dimensionId">{i18n.t('static.dimension.dimension')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                            {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                            <Input
                                                                type="text"
                                                                bsSize="sm"
                                                                name="dimensionId"
                                                                id="dimensionId"
                                                                valid={!errors.dimensionId}
                                                                invalid={touched.dimensionId && !!errors.dimensionId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                readOnly={true}
                                                                value={getLabelText(this.state.unit.dimension.label,this.state.lang)}
                                                                >
                                                               
                                                            </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.dimensionId}</FormFeedback>
                                                    </FormGroup>
                                                  
                                                    <FormGroup>
                                                        <Label for="unitName">{i18n.t('static.unit.unit')}</Label>
                                                        <Input type="text"
                                                            name="unitName"
                                                            id="unitName"
                                                            bsSize="sm"
                                                            valid={!errors.unitName}
                                                            invalid={touched.unitName && !!errors.unitName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.Capitalize(getLabelText(this.state.unit.label,this.state.lang))}
                                                            required />
                                                        <FormFeedback className="red">{errors.unitName}</FormFeedback>
                                                    </FormGroup>
                                                <FormGroup>
                                                        <Label for="unitCode">{i18n.t('static.unit.unitCode')}</Label>
                                                         <Input type="text"
                                                            name="unitCode"
                                                            id="unitCode"
                                                            bsSize="sm"
                                                            valid={!errors.unitCode}
                                                            invalid={touched.unitCode && !!errors.unitCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.unit.unitCode}
                                                             />
                                                              <FormFeedback className="red">{errors.unitCode}</FormFeedback>
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
                                                                checked={this.state.unit.active === true}
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
                                                                checked={this.state.unit.active === false}
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
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />
                        </Card>
                    </Col>
                </Row>
                <div>
        <h6>{i18n.t(this.state.message)}</h6>
       <h6>{i18n.t(this.props.match.params.message)}</h6>
        </div>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/unit/listUnit/` +i18n.t('static.message.cancelled',{entityname}))
    }

}