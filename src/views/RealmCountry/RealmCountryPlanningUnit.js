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
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import PlanningUnitService from "../../api/PlanningUnitService";
import UnitService from "../../api/UnitService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
let initialValues = {

    planningUnit: {
        id: '',
        label: {
            label_en: ''
        }
    }
    , label: { label_en: '' },
    skuCode: '',
    unit: {
        unitId: '',
        label: {
            label_en: ''
        }
    },
    multiplier: '',

    gtin: '',
    active: true


}
const entityname = i18n.t('static.dashboad.planningunitcountry')
const validationSchema = function (values, t) {
    return Yup.object().shape({
        planningUnitId: Yup.string()
            .required(i18n.t('static.procurementUnit.validPlanningUnitText')),
        label: Yup.string()
            .required(i18n.t('static.planningunit.Countrytext')),
        skuCode: Yup.string()
            .required(i18n.t('static.procurementAgentProcurementUnit.skuCodeText')),
        multiplier: Yup.string()
            .required(i18n.t('static.planningunit.multipliertext')).min(0, i18n.t('static.program.validvaluetext')),
        unitId: Yup.string()
            .required(i18n.t('static.product.productunittext')),
            gtin: Yup.string()
            .max(14, i18n.t('static.procurementUnit.validMaxValueText'))
            .matches(/^[a-zA-Z0-9]*$/, i18n.t('static.procurementUnit.onlyalphaNumericText')),
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
realmCountryPlanningUnitId:'',
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
            skuCode: '',
            multiplier: '',
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
            }, isNew: true,
            updateRowStatus: 0,
            gtin:''
        }
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.disableRow = this.disableRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.enableRow = this.enableRow.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this)
        this.CapitalizeFull = this.CapitalizeFull.bind(this);
        this.updateRow = this.updateRow.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    updateRow(idx) {
        if (this.state.updateRowStatus == 1) {
            this.setState({ rowErrorMessage: 'One Of the mapped row is already in update.' })
        } else {
         //   document.getElementById('planningUnitId').disabled = true;
         console.log(JSON.stringify(this.state.rows[idx]))
            initialValues = {
                realmCountryPlanningUnitId:this.state.rows[idx].realmCountryPlanningUnitId,
                planningUnitId: this.state.rows[idx].planningUnit.id,
                planningUnit: {
                    id: this.state.rows[idx].planningUnit.id,
                    label: {
                        label_en: this.state.rows[idx].planningUnit.label.label_en
                    }
                },
                label: this.state.rows[idx].label.label_en,
                // , label: { label_en: this.state.rows[idx].label.label_en },
                skuCode: this.state.rows[idx].skuCode,
                unit: {
                    unitId: this.state.rows[idx].unit.unitId,
                    label: {
                        label_en: this.state.rows[idx].unit.label.label_en
                    }
                },
                unitId: this.state.rows[idx].unit.unitId,
                multiplier: this.state.rows[idx].multiplier,
                gtin: this.state.rows[idx].gtin,
                active: this.state.rows[idx].active
            }
            const rows = [...this.state.rows]
            this.setState({
                realmCountryPlanningUnitId:this.state.rows[idx].realmCountryPlanningUnitId,
                planningUnit: {
                    planningUnitId: this.state.rows[idx].planningUnit.id,
                    label: {
                        label_en: this.state.rows[idx].planningUnit.label.label_en
                    }
                }
                , label: { label_en: this.state.rows[idx].label.label_en },
                skuCode: this.state.rows[idx].skuCode,
                unit: {
                    unitId: this.state.rows[idx].unit.unitId,
                    label: {
                        label_en: this.state.rows[idx].unit.label.label_en
                    }
                },
                multiplier: this.state.rows[idx].multiplier,

                gtin: this.state.rows[idx].gtin,
                // active: this.state.rows[idx].active,
                isNew: false,
                updateRowStatus: 1
            }
            );

            rows.splice(idx, 1);
            this.setState({ rows });
        }
    }

    touchAll(setTouched, errors) {
        setTouched({
            planningUnitId: true,
            label: true,
            skuCode: true,
            multiplier: true,
            unitId: true,
            gtin: true

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
        console.log(event.target.name)
        if (event.target.name === "planningUnitId") {
            this.state.planningUnit.planningUnitId = event.target.value;
            this.state.planningUnit.label.label_en = event.target[event.target.selectedIndex].text;
           
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
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }
    CapitalizeFull(str) {
        if (str != null && str != "") {
            return str.toUpperCase()
        } else {
            return "";
        }
    }


    disableRow(idx) {
        const rows = [...this.state.rows]
        rows[idx].active = false

        // rows.splice(idx, 1);
        this.setState({ rows })
    }
    enableRow(idx) {
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
                    this.props.history.push(`/realmCountry/listRealmCountry/` + 'green/'+ i18n.t(response.data.messageCode, { entityname }))

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
                if (response.status == 200) {
                    this.setState({
                        units: response.data
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
            if (response.status == 200) {
                this.setState({
                    realmCountry: response.data,
                    // rows:response.data
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
        RealmCountryService.getPlanningUnitCountryForId(this.props.match.params.realmCountryId).then(response => {
            if (response.status == 200) {
                this.setState({
                    planningUnitCountry: response.data,
                    rows: response.data
                })
            }
            else{
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
        PlanningUnitService.getAllPlanningUnitList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        planningUnits: response.data
                    })
                }
               
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
             <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
            <Row>
                <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                    <Card>
                        <CardHeader>
                            <strong>{i18n.t('static.dashboad.planningunitcountry')}</strong>
                        </CardHeader>
                        <CardBody>
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors, resetForm }) => {
                                    console.log("values", values)
                                    console.log(this.state.planningUnit.planningUnitId + " " + this.state.label.label_en + " " + this.state.skuCode + " " + this.state.unit.unitId + " " + this.state.multiplier + " ")
                                    if (this.state.realmCountry.realmCountryId != "" && this.state.label.label_en != "" && this.state.skuCode != "" && this.state.unit.unitId != "" && this.state.multiplier != "") {
                                        var json =
                                        {realmCountryPlanningUnitId:this.state.realmCountryPlanningUnitId,
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
                                            isNew: this.state.isNew,
                                            active: true

                                        }
                                        this.state.rows.push(json)
                                        this.setState({ rows: this.state.rows,updateRowStatus:0 })
                                        
                                        this.setState({
                                            realmCountryPlanningUnitId:'',
                                            planningUnit: {
                                                planningUnitId: '',
                                                label: {
                                                    label_en: ''
                                                }
                                            }
                                            , label: { label_en: '' },
                                            skuCode: '',
                                            unit: {
                                                unitId: '',
                                                label: {
                                                    label_en: ''
                                                }
                                            },
                                            multiplier: '',
    
                                            gtin: '',
                                            active: true
    
                                        });
                                        
                                    };
                                    resetForm({
                                        realmCountry: {
                                            id: this.props.match.params.realmCountryId
                                        }
                                        ,
                                        planningUnit: {
                                            id: '',
                                            label: {
                                                label_en: ''
                                            }
                                        }
                                        , label: { label_en: '' },
                                        skuCode: '',
                                        unit: {
                                            unitId: '',
                                            label: {
                                                label_en: ''
                                            }
                                        },
                                        multiplier: '',

                                        gtin: '',
                                        active: true

                                    });
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
                                        <Row>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="select">{i18n.t('static.dashboard.realmcountry')}</Label>
                                            <Input
                                                type="text"
                                                name="realmCountry"
                                                id="realmCountry"
                                                bsSize="sm"
                                                readOnly
                                                valid={!errors.realmCountry && this.state.realmCountry.realm.label != ''}
                                                invalid={touched.realmCountry && !!errors.realmCountry}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                onBlur={handleBlur}

                                                value={getLabelText(this.state.realmCountry.realm.label, this.state.lang) + "-" + getLabelText(this.state.realmCountry.country.label, this.state.lang)}
                                            >
                                            </Input>
                                        </FormGroup><FormGroup>
                                        <Input type="hidden" name="realmCountryPlanningUnitId" id="realmCountryPlanningUnitId" value={this.state.realmCountryPlanningUnitId}>
                                       </Input></FormGroup> 
                                       <FormGroup className="col-md-6">
                                            <Label htmlFor="select">{i18n.t('static.planningunit.planningunit')}</Label>
                                            <Input type="select" name="planningUnitId" id="planningUnitId" bsSize="sm"
                                                valid={!errors.planningUnitId && this.state.planningUnit.planningUnitId != ''}
                                                invalid={touched.planningUnitId && !!errors.planningUnitId}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                value={this.state.planningUnit.planningUnitId} required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {planningUnitList}
                                            </Input> <FormFeedback className="red">{errors.planningUnitId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label for="label">{i18n.t('static.planningunit.countrysku')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                name="label"
                                                id="label"
                                                bsSize="sm"
                                                valid={!errors.label && this.state.label.label_en != ''}
                                                invalid={touched.label && !!errors.label}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e); }}
                                                onBlur={handleBlur}
                                                value={this.Capitalize(this.state.label.label_en)}
                                                required />
                                            <FormFeedback className="red">{errors.label}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="skuCode">{i18n.t('static.procurementAgentProcurementUnit.skuCode')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text"
                                                name="skuCode"
                                                id="skuCode" bsSize="sm"
                                                valid={!errors.skuCode && this.state.skuCode != ''}
                                                invalid={touched.skuCode && !!errors.skuCode}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e); }}
                                                onBlur={handleBlur}
                                                placeholder={i18n.t('static.procurementAgentProcurementUnit.skuCodeText')}
                                                value={this.CapitalizeFull(this.state.skuCode)}
                                                required />
                                            <FormFeedback className="red">{errors.skuCode}</FormFeedback>

                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label htmlFor="unitId">{i18n.t('static.unit.unit')}<span class="red Reqasterisk">*</span></Label>
                                            <Input
                                                type="select"
                                                name="unitId"
                                                id="unitId"
                                                bsSize="sm"
                                                value={this.state.unit.unitId}
                                                valid={!errors.unitId && this.state.unit.unitId != ''}
                                                invalid={touched.unitId && !!errors.unitId}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                onBlur={handleBlur}
                                                required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {unitList}
                                            </Input>
                                            <FormFeedback className="red">{errors.unitId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label for="multiplier">{i18n.t('static.unit.multiplier')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="number"
                                                name="multiplier"
                                                id="multiplier"
                                                bsSize="sm"
                                                valid={!errors.multiplier && this.state.multiplier != ''}
                                                invalid={touched.multiplier && !!errors.multiplier}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.multiplier}
                                                required />
                                            <FormFeedback className="red">{errors.multiplier}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup className="col-md-6">
                                            <Label for="gtin">{i18n.t('static.procurementAgentProcurementUnit.gtin')}</Label>
                                            <Input

                                                type="text"
                                                min="0"
                                                name="gtin"
                                                id="gtin"
                                                bsSize="sm"
                                                valid={!errors.gtin && this.state.gtin != ''}
                                                invalid={touched.gtin && !!errors.gtin}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e); }}
                                                value={this.CapitalizeFull(this.state.gtin)}
                                                placeholder={i18n.t('static.procurementAgentProcurementUnit.gtinText')}
                                            />
                                            <FormFeedback className="red">{errors.gtin}</FormFeedback>
                                        </FormGroup>

                                        <FormGroup className="col-md-6 mt-md-4">
                                            <Button type="submit" size="sm" color="success" onClick={() => this.touchAll(setTouched, errors)} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                            &nbsp;
                                           
 </FormGroup></Row></Form>)} />
 <h5 className="red">{this.state.rowErrorMessage}</h5>
                            <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                                <thead>
                                    <tr>
                                        <th className="text-left pl-1"> {i18n.t('static.dashboard.planningunit')} </th>
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

                                            <tr id="addr0" className="realmcountrypUnitTd" key={idx}  >
                                                <td className="text-left">
                                                    {this.state.rows[idx].planningUnit.label.label_en}
                                                </td>
                                                <td >

                                                    {this.state.rows[idx].label.label_en}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].skuCode}
                                                </td><td>
                                                    {this.state.rows[idx].unit.label.label_en}
                                                </td>
                                                <td className="text-right">
                                                    {this.state.rows[idx].multiplier}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].gtin}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].active==true ? i18n.t('static.common.active') : i18n.t('static.common.disabled')}
                                                </td>
                                                <td><div className="forInlinebtnMapping">
                                                     {/* <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} /> */}
                                                     <StatusUpdateButtonFeature removeRow={this.handleRemoveSpecificRow} enableRow={this.enableRow} disableRow={this.disableRow} rowId={idx} status={this.state.rows[idx].active} isRowNew={this.state.rows[idx].isNew} />

                                                <UpdateButtonFeature updateRow={this.updateRow} rowId={idx} isRowNew={this.state.rows[idx].isNew} />
                                                </div>
                                                   
                                                </td>
                                            </tr>)

                                    }
                                </tbody>

                            </Table>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {<Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
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
        this.props.history.push(`/realmCountry/listRealmCountry/`+ 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default PlanningUnitCountry
