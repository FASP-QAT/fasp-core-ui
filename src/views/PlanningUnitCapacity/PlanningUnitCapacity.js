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
import SupplierService from "../../api/SupplierService";
import AuthenticationService from "../Common/AuthenticationService";
import PlanningUnitService from "../../api/PlanningUnitService";
const initialValues = {
    startDate: '',
    stopDate: '',
    supplier: [],
    capacity: ''

}
const entityname=i18n.t('static.dashboad.planningunitcapacity')
const validationSchema = function (values, t) {
    return Yup.object().shape({
        supplier: Yup.string()
            .required(i18n.t('static.planningunit.suppliertext')),
        capacity: Yup.number()
            .required(i18n.t('static.planningunit.capacitytext')).min(0, i18n.t('static.program.validvaluetext')),
        startDate: Yup.string()
            .required(i18n.t('static.budget.startdatetext')),
        stopDate: Yup.string()
            .required(i18n.t('static.budget.stopdatetext'))
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

class PlanningUnitCapacity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            planningUnitCapacity: {},
            suppliers: [],
            supplier: {
                supplierId: '',
                label: {
                    label_en: ''
                }
            }, supplierName: '',
            capacity: '',
            startDate: '',
            stopDate: '',
            rows: [],
            planningUnit: {
                label: {
                    label_en: ''
                }
            }
        }
        this.currentDate = this.currentDate.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.addRow = this.addRow.bind(this);
        this.deleteLastRow = this.deleteLastRow.bind(this);
        this.handleDisableSpecificRow = this.handleDisableSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.handleEnableSpecificRow = this.handleEnableSpecificRow.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.handleRemoveSpecificRow=this.handleRemoveSpecificRow.bind(this)
    }
    currentDate() {
        var todaysDate = new Date();
        var yyyy = todaysDate.getFullYear().toString();
        var mm = (todaysDate.getMonth() + 1).toString();
        var dd = todaysDate.getDate().toString();
        var mmChars = mm.split('');
        var ddChars = dd.split('');
        let date = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
        // console.log("------date", date)
        return date;
    }
    touchAll(setTouched, errors) {
        setTouched({
            supplier: true,
            startDate: true,
            stopDate: true,
            capacity: true,

        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('capacityForm', (fieldName) => {
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
        console.log(event.target.name, event.target.value)
        if (event.target.name === "supplier") {
            this.state.supplier.supplierId = event.target.value;
            this.state.supplier.label.label_en = event.target[event.target.selectedIndex].text;
        }
        if (event.target.name === "capacity") {
            this.state.capacity = event.target.value;
        }
        if (event.target.name === "startDate") {
            this.state.startDate = event.target.value;

        }
        if (event.target.name === "stopDate") {
            this.state.stopDate = event.target.value;
        }
        console.log(JSON.stringify(this.state.supplier))

    }

    addRow() {

        // console.log(JSON.stringify(this.state))

        if (this.state.supplier.supplierId != "" && this.state.startDate != "" && this.state.stopDate != "" && this.state.capacity != "") {
            var json =
            {
                planningUnit: {
                    id: this.props.match.params.planningUnitId
                }
                ,
                supplier: {
                    id: this.state.supplier.supplierId,
                    label: {
                        label_en: this.state.supplier.label.label_en
                    }
                }
                ,
                startDate: this.state.startDate,

                stopDate: this.state.stopDate,

                capacity: this.state.capacity,
                active: true

            }
            this.state.rows.push(json)
            this.setState({ rows: this.state.rows })
        }
    }
    deleteLastRow() {
        const rows = [...this.state.rows]
     /*  rows[this.state.rows.length - 1].active=false
       var row=   rows.slice(-1).pop();
       rows.push(row);*/
        this.setState({
            rows
        });
    }
    handleDisableSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows[idx].active = false
    
        // rows.splice(idx, 1);
        this.setState({ rows })
    }
    handleRemoveSpecificRow(idx) {
        const rows = [...this.state.rows]
         rows.splice(idx, 1);
        this.setState({ rows })
    }
    handleEnableSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows[idx].active = true
    
        // rows.splice(idx, 1);
        this.setState({ rows })
    }

    submitForm() {
        console.log(JSON.stringify(this.state))
        var planningUnitCapacity = this.state.rows


        AuthenticationService.setupAxiosInterceptors();
        PlanningUnitService.editPlanningUnitCapacity(planningUnitCapacity)
            .then(response => {
                if (response.status == 200) {
                    this.props.history.push(`/planningUnit/listPlanningUnit/` + i18n.t(response.data.messageCode))

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
        PlanningUnitService.getPlanningUnitById(this.props.match.params.planningUnitId).then(response => {
            console.log(response.data);
            this.setState({
                planningUnit: response.data,
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
        PlanningUnitService.getPlanningUnitCapacityForId(this.props.match.params.planningUnitId).then(response => {
            console.log(response.data);
            this.setState({
                planningUnitCapacity: response.data,
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
        SupplierService.getSupplierListAll()
            .then(response => {
                console.log(response.data)
                this.setState({
                    suppliers: response.data
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
        const { suppliers } = this.state;
        let supplierList = suppliers.length > 0 && suppliers.map((item, i) => {
            return (
                <option key={i} value={item.supplierId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        return ( <div className="animated fadeIn">
        <h5>{i18n.t(this.state.message)}</h5>
        <Row>
            <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                <Card>
                    <CardHeader>
                            <strong>{i18n.t('static.dashboad.planningunitcapacity')}</strong>
                        </CardHeader>
                        <CardBody>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    if (this.state.supplier.supplierId != "" && this.state.startDate != "" && this.state.stopDate != "" && this.state.capacity != "") {
                                        var json =
                                        {
                                            planningUnit: {
                                                id: this.props.match.params.planningUnitId
                                            }
                                            ,
                                            supplier: {
                                                id: this.state.supplier.supplierId,
                                                label: {
                                                    label_en: this.state.supplier.label.label_en
                                                }
                                            }
                                            ,
                                            startDate: this.state.startDate,

                                            stopDate: this.state.stopDate,

                                            capacity: this.state.capacity,
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
                                    }) => (<Form onSubmit={handleSubmit} noValidate name='capacityForm'>
                                        <FormGroup>
                                            <Label htmlFor="select">{i18n.t('static.planningunit.planningunit')}</Label>
                                            <Input
                                            type="text"
                                            name="planningUnitId"
                                            id="progplanningUnitIdramId"
                                            bsSize="sm"
                                            readOnly
                                            valid={!errors.planningUnitId}
                                            invalid={touched.planningUnitId && !!errors.planningUnitId}
                                            onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                            onBlur={handleBlur}

                                            value={getLabelText(this.state.planningUnit.label, this.state.lang)}
                                     >
                                            </Input>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="select">{i18n.t('static.supplier.supplier')}</Label>
                                            <Input type="select" name="supplier" id="supplier" bsSize="sm"
                                                valid={!errors.supplier}
                                                invalid={touched.realmId && !!errors.supplier}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }} required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {supplierList}
                                            </Input> <FormFeedback className="red">{errors.supplier}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="startDate">{i18n.t('static.common.startdate')}</Label>
                                            <Input
                                                className="fa fa-calendar Fa-right"
                                                name="startDate"
                                                id="startDate"
                                                type="date"
                                                bsSize="sm"
                                                valid={!errors.startDate}
                                                invalid={touched.startDate && !!errors.startDate}
                                                onBlur={handleBlur}
                                                min={this.currentDate()}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                placeholder={i18n.t('static.budget.budgetstartdate')}
                                                required />
                                            <FormFeedback className="red">{errors.startDate}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="stopDate">{i18n.t('static.common.stopdate')}</Label>
                                            <Input

                                                className="fa fa-calendar Fa-right"
                                                name="stopDate"
                                                id="stopDate"
                                                bsSize="sm"
                                                type="date"
                                                valid={!errors.stopDate}
                                                invalid={touched.stopDate && !!errors.stopDate}
                                                onBlur={handleBlur}
                                                min={this.state.startDate}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                placeholder={i18n.t('static.budget.budgetstopdate')}
                                                required /> <FormFeedback className="red">{errors.stopDate}</FormFeedback>

                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="capacity">{i18n.t('static.planningunit.capacity')}</Label>
                                            <Input

                                                type="number"
                                                min="0"
                                                name="capacity"
                                                id="capacity"
                                                bsSize="sm"
                                                valid={!errors.capacity}
                                                invalid={touched.capacity && !!errors.capacity}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                type="number"
                                                placeholder={i18n.t('static.planningunit.capacitytext')}
                                                required />
                                            <FormFeedback className="red">{errors.capacity}</FormFeedback>
                                        </FormGroup>

                                        <FormGroup>
                                           {/* <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> {i18n.t('static.common.rmlastrow')}</Button>*/}
                                            <Button type="submit" size="sm" color="success" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                            &nbsp;

                </FormGroup></Form>)} />
                            <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                                <thead>
                                    <tr>
                                        <th className="text-center"> {i18n.t('static.supplier.supplier')} </th>
                                        <th className="text-center"> {i18n.t('static.common.startdate')}</th>
                                        <th className="text-center"> {i18n.t('static.common.stopdate')} </th>
                                        <th className="text-center">{i18n.t('static.planningunit.capacity')}</th>
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
                                                    {this.state.rows[idx].supplier.label.label_en}
                                                </td>
                                                <td>

                                                    {this.state.rows[idx].startDate}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].stopDate}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].capacity}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')}
                                                </td>
                                                <td>
                                               { this.state.rows[idx].active == true && <Button type="button" size="sm" color="danger" onClick={()=>{this.handleDisableSpecificRow(idx)}} ><i className="fa fa-times"></i>Disable</Button>}
                                               {this.state.rows[idx].active == false && <Button type="button" size="sm" color="success" onClick={()=>{this.handleEnableSpecificRow(idx)}}><i className="fa fa-check"></i>Activate</Button>}
                                               {!this.state.rows[idx].planningUnitCapacityId &&<DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} />}
                                                    </td>
                                            </tr>)

                                    }
                                </tbody>

                            </Table>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                {/*this.state.rows.length > 0 &&*/ <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
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
        this.props.history.push(`/planningUnit/listPlanningUnit/` + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default PlanningUnitCapacity

