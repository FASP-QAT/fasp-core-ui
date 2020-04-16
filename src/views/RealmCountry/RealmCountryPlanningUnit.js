import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import { Date } from 'core-js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import PlanningUnitService from "../../api/PlanningUnitService";
import UnitService from "../../api/UnitService";
const initialValues = {
    startDate: '',
    stopDate: '',
    realmCountry: [],
    country: ''

}
const entityname = i18n.t('static.dashboad.planningunitcountry')
const validationSchema = function (values, t) {
    return Yup.object().shape({
        planningUnit: Yup.string()
            .required(i18n.t('static.procurementUnit.validPlanningUnitText')),
        label: Yup.string()
            .required(i18n.t('static.planningunit.Countrytext')),
        skuCode: Yup.string()
            .required(i18n.t('static.procurementAgentProcurementUnit.skuCodeText')),
        multiplier: Yup.number()
            .required(i18n.t('static.planningunit.multipliertext')).min(0, i18n.t('static.program.validvaluetext')),
        unitId: Yup.string()
            .required(i18n.t('static.product.productunittext'))
    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values, i18n.t)
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

class PlanningUnitCountry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            units: [],
            lang: localStorage.getItem('lang'),
            planningUnitCountry: {},
            planningUnits: [],
            realmCountry: {
                realmCountryId: '',
                country: {
                    countryId: '',
                    label: {
                        label_en: ''
                    }
                },
                realm: {
                    realmId: '',
                    label: {
                        label_en: ''
                    }
                }
            }, realmCountryName: '',
            label: {
                label_en: ''
            },
            rows: [],
            planningUnit: {
                planningUnitId: '',
                label: {
                    label_en: ''
                }
            },
            unit: {
                unitId: '',
                label: {
                    label_en: ''
                }
            }
        }
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.handleDisableSpecificRow = this.handleDisableSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.handleEnableSpecificRow = this.handleEnableSpecificRow.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this)
    }
  
    touchAll(setTouched, errors) {
        setTouched({
            planningUnit: true,
            startDate: true,
            stopDate: true,
            country: true,

        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('countryForm', (fieldName) => {
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

    setTextAndValue = (event) => {
        // let { budget } = this.state;
        if (event.target.name === "planningUnit") {
            this.state.planningUnit.planningUnitId = event.target.value;
            this.state.planningUnit.label.label_en = event.target[event.target.selectedIndex].text;
            console.log(event.target.value)
        }
        if (event.target.name === "label") {
            this.state.label.label_en = event.target.value;
        }
        if (event.target.name === "skuCode") {
            this.state.skuCode = event.target.value;

        }
        if (event.target.name === "unitId") {
            this.state.unit.unitId = event.target.value;
            this.state.unit.label.label_en = event.target[event.target.selectedIndex].text;
            console.log(event.target.value)
        }
        if (event.target.name === "multiplier") {
            this.state.multiplier = event.target.value;

        }
        if (event.target.name === "gtin") {
            this.state.gtin = event.target.value;

        }
    }
    Capitalize(str) {

        return str.charAt(0).toUpperCase() + str.slice(1)
    }


    handleDisableSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows[idx].active = false

        // rows.splice(idx, 1);
        this.setState({ rows })
    }
    handleEnableSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows[idx].active = true

        // rows.splice(idx, 1);
        this.setState({ rows })
    }
    handleRemoveSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows.splice(idx, 1);
        this.setState({ rows })
    }

    submitForm() {
        console.log(JSON.stringify(this.state.rows))
        var planningUnitCountry = this.state.rows


        AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.editPlanningUnitCountry(planningUnitCountry)
            .then(response => {
                if (response.status == 200) {
                    this.props.history.push(`/realmCountry/listRealmCountry/` + i18n.t(response.data.messageCode, { entityname }))

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
                                this.setState({ message: error.response.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );



    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        UnitService.getUnitListAll()
            .then(response => {
                this.setState({
                    units: response.data
                })
            }).catch(
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
            );
        RealmCountryService.getRealmCountryById(this.props.match.params.realmCountryId).then(response => {
            console.log(JSON.stringify(response.data))
            this.setState({
                realmCountry: response.data,
                //  rows:response.data
            })
        }).catch(
            error => {
                console.log(JSON.stringify(error))
                if (error.message === "Network Error") {
                    this.setState({ message: error.message });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 500:
                        case 401:
                        case 404:
                        case 406:
                        case 412:
                            this.setState({ message: error.response.messageCode });
                            break;
                        default:
                            this.setState({ message: 'static.unkownError' });
                            console.log("Error code unkown");
                            break;
                    }
                }
            }
        );
        RealmCountryService.getPlanningUnitCountryForId(this.props.match.params.realmCountryId).then(response => {
            console.log(response.data);
            this.setState({
                planningUnitCountry: response.data,
                rows: response.data
            })
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
        PlanningUnitService.getAllPlanningUnitList()
            .then(response => {
                console.log(response.data)
                this.setState({
                    planningUnits: response.data
                })
            }).catch(
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
                                this.setState({ message: error.response.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
    render() {
        const { units } = this.state;
        let unitList = units.length > 0
            && units.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnitId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);

        return (<div className="animated fadeIn">
            <h5>{i18n.t(this.state.message)}</h5>
            <Row>
                <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                    <Card>
                        <CardHeader>
                            <strong>{i18n.t('static.dashboad.planningunitcountry')}</strong>
                        </CardHeader>
                        <CardBody>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log(this.state.planningUnit.planningUnitId + " " + this.state.label.label_en + " " + this.state.skuCode + " " + this.state.unit.unitId + " " + this.state.multiplier + " ")
                                    if (this.state.realmCountry.realmCountryId != "" && this.state.label.label_en != "" && this.state.skuCode != "" && this.state.unit.unitId != "" && this.state.multiplier != "") {
                                        var json =
                                        {
                                            realmCountry: {
                                                id: this.props.match.params.realmCountryId
                                            }
                                            ,
                                            planningUnit: {
                                                id: this.state.planningUnit.planningUnitId,
                                                label: {
                                                    label_en: this.state.planningUnit.label.label_en
                                                }
                                            }
                                            , label: { label_en: this.state.label.label_en },
                                            skuCode: this.state.skuCode,
                                            unit: {
                                                unitId: this.state.unit.unitId,
                                                label: {
                                                    label_en: this.state.unit.label.label_en
                                                }
                                            },
                                            multiplier: this.state.multiplier,

                                            gtin: this.state.gtin,
                                            active: true

                                        }
                                        this.state.rows.push(json)
                                        this.setState({ rows: this.state.rows })
                                    }
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
                                    }) => (<Form onSubmit={handleSubmit} noValidate name='countryForm'>
                                        <FormGroup>
                                            <Label htmlFor="select">{i18n.t('static.dashboard.realmcountry')}</Label>
                                            <Input
                                                type="text"
                                                name="realmCountry"
                                                id="realmCountry"
                                                bsSize="sm"
                                                readOnly
                                                valid={!errors.realmCountry}
                                                invalid={touched.realmCountry && !!errors.realmCountry}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                onBlur={handleBlur}

                                                value={getLabelText(this.state.realmCountry.realm.label, this.state.lang) + "-" + getLabelText(this.state.realmCountry.country.label, this.state.lang)}
                                            >
                                            </Input>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="select">{i18n.t('static.planningunit.planningunit')}</Label>
                                            <Input type="select" name="planningUnit" id="planningUnit" bsSize="sm"
                                                valid={!errors.planningUnit}
                                                invalid={touched.planningUnit && !!errors.planningUnit}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }} required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {planningUnitList}
                                            </Input> <FormFeedback className="red">{errors.planningUnit}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="label">{i18n.t('static.planningunit.countrysku')}</Label>
                                            <Input type="text"
                                                name="label"
                                                id="label"
                                                bsSize="sm"
                                                valid={!errors.label}
                                                invalid={touched.label && !!errors.label}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e); this.Capitalize(e.target.value) }}
                                                onBlur={handleBlur}
                                                required />
                                            <FormFeedback className="red">{errors.label}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="skuCode">{i18n.t('static.procurementAgentProcurementUnit.skuCode')}</Label>
                                            <Input type="text"
                                                name="skuCode"
                                                id="skuCode" bsSize="sm"
                                                valid={!errors.skuCode}
                                                invalid={touched.skuCode && !!errors.skuCode}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e); this.Capitalize(e.target.value) }}
                                                onBlur={handleBlur}
                                                placeholder={i18n.t('static.procurementAgentProcurementUnit.skuCodeText')}
                                                required />
                                            <FormFeedback className="red">{errors.skuCode}</FormFeedback>

                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="unitId">{i18n.t('static.unit.unit')}</Label>
                                            <Input
                                                type="select"
                                                name="unitId"
                                                id="unitId"
                                                bsSize="sm"
                                                valid={!errors.unitId}
                                                invalid={touched.unitId && !!errors.unitId}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                onBlur={handleBlur}
                                                required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {unitList}
                                            </Input>
                                            <FormFeedback className="red">{errors.unitId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="multiplier">{i18n.t('static.unit.multiplier')}</Label>
                                            <Input type="number"
                                                name="multiplier"
                                                id="multiplier"
                                                bsSize="sm"
                                                valid={!errors.multiplier}
                                                invalid={touched.multiplier && !!errors.multiplier}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e); }}
                                                onBlur={handleBlur}
                                                required />
                                            <FormFeedback className="red">{errors.multiplier}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="gtin">{i18n.t('static.procurementAgentProcurementUnit.gtin')}</Label>
                                            <Input

                                                type="text"
                                                min="0"
                                                name="gtin"
                                                id="gtin"
                                                bsSize="sm"
                                                valid={!errors.gtin}
                                                invalid={touched.gtin && !!errors.gtin}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                placeholder={i18n.t('static.procurementAgentProcurementUnit.gtinText')}
                                            />
                                            <FormFeedback className="red">{errors.gtin}</FormFeedback>
                                        </FormGroup>

                                        <FormGroup>
                                            <Button type="submit" size="sm" color="success" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                            &nbsp;

                </FormGroup></Form>)} />
                            <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                                <thead>
                                    <tr>
                                        <th className="text-center"> {i18n.t('static.dashboard.planningunit')} </th>
                                        <th className="text-center"> {i18n.t('static.planningunit.countrysku')}</th>
                                        <th className="text-center"> {i18n.t('static.procurementAgentProcurementUnit.skuCode')} </th>
                                        <th className="text-center">{i18n.t('static.unit.unit')}</th>
                                        <th className="text-center">{i18n.t('static.unit.multiplier')}</th>
                                        <th className="text-center">{i18n.t('static.procurementAgentProcurementUnit.gtin')}</th>
                                        <th className="text-center">{i18n.t('static.common.status')}</th>
                                        <th className="text-center">{i18n.t('static.common.action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.rows.length > 0
                                        &&
                                        this.state.rows.map((item, idx) =>

                                            <tr id="addr0" key={idx} >
                                                <td>
                                                    {this.state.rows[idx].planningUnit.label.label_en}
                                                </td>
                                                <td>

                                                    {this.state.rows[idx].label.label_en}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].skuCode}
                                                </td><td>
                                                    {this.state.rows[idx].unit.label.label_en}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].multiplier}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].gtin}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].active == true && <Button type="button" size="sm" color="danger" onClick={() => { this.handleDisableSpecificRow(idx) }} ><i className="fa fa-times"></i>Disable</Button>}
                                                    {this.state.rows[idx].active == false && <Button type="button" size="sm" color="success" onClick={() => { this.handleEnableSpecificRow(idx) }}><i className="fa fa-check"></i>Activate</Button>}
                                                    {!this.state.rows[idx].realmCountryPlanningUnitId && <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} />}

                                                </td>
                                            </tr>)

                                    }
                                </tbody>

                            </Table>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                { <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                &nbsp;
                        </FormGroup>

                        </CardFooter>
                    </Card>
                </Col>
            </Row>
        </div>

        );
    }
    cancelClicked() {
        this.props.history.push(`/realmCountry/listRealmCountry/` + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default PlanningUnitCountry

