import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row, Form, FormFeedback

} from 'reactstrap';
import DeleteSpecificRow from './TableFeatureTwo';
import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from "../../api/PlanningUnitService";
import StatusUpdateButtonFeature from '../../CommonComponent/StatusUpdateButtonFeature';
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature';
import i18n from '../../i18n';
import * as Yup from 'yup';
import { Formik } from "formik";
import getLabelText from '../../CommonComponent/getLabelText'

const entityname = i18n.t('static.dashboard.programPlanningUnit');

let initialValues = {
    planningUnitId: '',
    reorderFrequencyInMonths: '',
    minMonthsOfStock: '',
    localProcurementLeadTime: ''
}

const validationSchema = function (values, t) {
    // console.log("made by us schema--->", values)
    return Yup.object().shape({
        planningUnitId: Yup.string()
            .required(i18n.t('static.procurementUnit.validPlanningUnitText')),
        reorderFrequencyInMonths: Yup.number().
            typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.programPlanningUnit.validReorderFrequencyText')).min(0, i18n.t('static.procurementUnit.validValueText')),
        minMonthsOfStock: Yup.number().
            typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required('Please enter minimum month of stock').min(0, i18n.t('static.procurementUnit.validValueText')),
        localProcurementLeadTime: Yup.number().
            typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required('Please enter local procurement lead time').min(0, i18n.t('static.procurementUnit.validValueText'))
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

class AddprogramPlanningUnit extends Component {

    constructor(props) {
        super(props);
        let rows = [];
        // if (this.props.location.state.programPlanningUnit.length > 0) {
        //     rows = this.props.location.state.programPlanningUnit;
        // }
        this.state = {
            // programPlanningUnit: this.props.location.state.programPlanningUnit,
            programPlanningUnit: [],
            planningUnitId: '',
            planningUnitName: '',
            reorderFrequencyInMonths: '',
            minMonthsOfStock: '',
            rows: rows,
            programList: [],
            planningUnitList: [],
            rowErrorMessage: '',
            programPlanningUnitId: 0,
            isNew: true,
            programId: this.props.match.params.programId,
            updateRowStatus: 0,
            lang: localStorage.getItem('lang'),
            batchNoRequired: false,
            localProcurementLeadTime: ''

        }
        this.addRow = this.addRow.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.enableRow = this.enableRow.bind(this);
        this.disableRow = this.disableRow.bind(this);
        this.updateRow = this.updateRow.bind(this);

    }
    addRow() {
        let addRow = true;
        if (addRow) {
            this.state.rows.map(item => {
                if (item.planningUnit.id == this.state.planningUnitId) {
                    addRow = false;
                }
            }
            )
        }
        if (addRow == true) {
            var programName = document.getElementById("programId");
            var value = programName.selectedIndex;
            var selectedProgramName = programName.options[value].text;
            this.state.rows.push(
                {
                    planningUnit: {
                        id: this.state.planningUnitId,
                        label: {
                            label_en: this.state.planningUnitName
                        }
                    },
                    program: {
                        id: this.state.programId,
                        label: {
                            label_en: selectedProgramName
                        }
                    },
                    reorderFrequencyInMonths: this.state.reorderFrequencyInMonths,
                    minMonthsOfStock: this.state.minMonthsOfStock,
                    localProcurementLeadTime: this.state.localProcurementLeadTime,
                    batchNoRequired: this.state.batchNoRequired,
                    active: true,
                    isNew: this.state.isNew,
                    programPlanningUnitId: this.state.programPlanningUnitId

                })

            this.setState({ rows: this.state.rows, rowErrorMessage: '' });

        } else {
            this.setState({ rowErrorMessage: 'Planning Unit Already Exist In List.' });
        }
        this.setState({
            planningUnitId: '',
            reorderFrequencyInMonths: '',
            minMonthsOfStock: '',
            planningUnitName: '',
            programPlanningUnitId: 0,
            isNew: true,
            updateRowStatus: 0,
            localProcurementLeadTime: '',
            batchNoRequired: false
        });
        document.getElementById('select').disabled = false;
    }

    updateRow(idx) {
        if (this.state.updateRowStatus == 1) {
            this.setState({ rowErrorMessage: 'One Of the mapped row is already in update.' })
        } else {

            document.getElementById('select').disabled = true;
            initialValues = {
                planningUnitId: this.state.rows[idx].planningUnit.id,
                reorderFrequencyInMonths: this.state.rows[idx].reorderFrequencyInMonths,
                minMonthsOfStock: this.state.rows[idx].minMonthsOfStock,
                localProcurementLeadTime: this.state.rows[idx].localProcurementLeadTime,
                batchNoRequired: this.state.rows[idx].batchNoRequired
            }

            const rows = [...this.state.rows]
            this.setState({
                planningUnitId: this.state.rows[idx].planningUnit.id,
                planningUnitName: this.state.rows[idx].planningUnit.label.label_en,
                reorderFrequencyInMonths: this.state.rows[idx].reorderFrequencyInMonths,
                minMonthsOfStock: this.state.rows[idx].minMonthsOfStock,
                programPlanningUnitId: this.state.rows[idx].programPlanningUnitId,
                isNew: false,
                updateRowStatus: 1,
                localProcurementLeadTime: this.state.rows[idx].localProcurementLeadTime,
                batchNoRequired: this.state.rows[idx].batchNoRequired
            })
            rows.splice(idx, 1);
            this.setState({ rows });
        }
    }

    enableRow(idx) {
        this.state.rows[idx].active = true;
        this.setState({ rows: this.state.rows })
    }

    disableRow(idx) {
        this.state.rows[idx].active = false;
        this.setState({ rows: this.state.rows })
    }

    handleRemoveSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows.splice(idx, 1);
        this.setState({ rows })
    }

    setTextAndValue = (event) => {
        if (event.target.name === 'reorderFrequencyInMonths') {
            this.setState({ reorderFrequencyInMonths: event.target.value });
        }
        if (event.target.name === 'minMonthsOfStock') {
            this.setState({ minMonthsOfStock: event.target.value });
        }
        else if (event.target.name === 'planningUnitId') {
            this.setState({ planningUnitName: event.target[event.target.selectedIndex].text });
            this.setState({ planningUnitId: event.target.value })
        }
        if (event.target.name === 'localProcurementLeadTime') {
            this.setState({ localProcurementLeadTime: event.target.value });
        }
        if (event.target.name === 'batchNoRequired') {
            // this.setState({ batchNoRequired: event.target.value });
            this.setState({ batchNoRequired: event.target.id === "batchNoRequired2" ? false : true })
        }
    };
    submitForm() {
        AuthenticationService.setupAxiosInterceptors();
        console.log("SUBMIT----", this.state.rows);
        ProgramService.addprogramPlanningUnitMapping(this.state.rows)
            .then(response => {
                if (response.status == "200") {
                    this.props.history.push(`/program/listProgram/` + i18n.t(response.data.messageCode, { entityname }))
                } else {
                    this.setState({
                        message: response.data.message
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );



    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();

        ProgramService.getProgramPlaningUnitListByProgramId(this.state.programId)
            .then(response => {
                if (response.status == 200) {
                    let myReasponse = response.data;
                    if (myReasponse.length > 0) {
                        // console.log("myReasponse ---", myReasponse);
                        this.setState({ rows: myReasponse });
                    }
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


        ProgramService.getProgramList().then(response => {
            if (response.status == "200") {
                this.setState({
                    programList: response.data
                });
            } else {
                this.setState({
                    message: response.data.message
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
                            console.log("Error code unkown");
                            break;
                    }
                }
            }
        );
        PlanningUnitService.getActivePlanningUnitList().then(response => {
            if (response.status == 200) {
                this.setState({
                    planningUnitList: response.data
                });
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


    }
    touchAll(errors) {
        this.validateForm(errors);
    }
    validateForm(errors) {
        this.findFirstError('programPlanningUnitForm', (fieldName) => {
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

    render() {
        const { programList } = this.state;
        const { planningUnitList } = this.state;
        let programs = programList.length > 0 && programList.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        let products = planningUnitList.length > 0 && planningUnitList.map((item, i) => {
            return (
                <option key={i} value={item.planningUnitId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <strong>{i18n.t('static.program.mapPlanningUnit')}</strong>
                            </CardHeader>
                            <CardBody>
                                <Formik
                                    enableReinitialize={true}
                                    initialValues={initialValues}
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors, resetForm }) => {
                                        this.addRow();
                                        resetForm({ planningUnitId: "", reorderFrequencyInMonths: "", minMonthsOfStock: "", localProcurementLeadTime: "", batchNoRequired: false });
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
                                                <Form onSubmit={handleSubmit} noValidate name='programPlanningUnitForm'>
                                                    <Row>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="select">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                value={this.state.programId}
                                                                name="programId"
                                                                id="programId"
                                                                disabled>
                                                                {programs}
                                                            </Input>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="select">{i18n.t('static.planningunit.planningunit')}<span className="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="planningUnitId"
                                                                id="select"
                                                                bsSize="sm"
                                                                valid={!errors.planningUnitId && this.state.planningUnitId != ''}
                                                                invalid={touched.planningUnitId && !!errors.planningUnitId}
                                                                value={this.state.planningUnitId}
                                                                onBlur={handleBlur}
                                                                onChange={event => { handleChange(event); this.setTextAndValue(event) }}
                                                                required
                                                            >
                                                                <option value="">Please select</option>
                                                                {products}
                                                            </Input>
                                                            <FormFeedback className="red">{errors.planningUnitId}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="company">{i18n.t('static.program.reorderFrequencyInMonths')}<span className="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                min='0'
                                                                name="reorderFrequencyInMonths"
                                                                id="reorderFrequencyInMonths"
                                                                bsSize="sm"
                                                                valid={!errors.reorderFrequencyInMonths && this.state.reorderFrequencyInMonths != ''}
                                                                invalid={touched.reorderFrequencyInMonths && !!errors.reorderFrequencyInMonths}
                                                                value={this.state.reorderFrequencyInMonths}
                                                                placeholder={i18n.t('static.program.programPlanningUnit.reorderFrequencyText')}
                                                                onBlur={handleBlur}
                                                                onChange={event => { handleChange(event); this.setTextAndValue(event) }}
                                                            />
                                                            <FormFeedback className="red">{errors.reorderFrequencyInMonths}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="company">Minimum Month Of Stock<span className="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                min='0'
                                                                name="minMonthsOfStock"
                                                                id="minMonthsOfStock"
                                                                bsSize="sm"
                                                                valid={!errors.minMonthsOfStock && this.state.minMonthsOfStock != ''}
                                                                invalid={touched.minMonthsOfStock && !!errors.minMonthsOfStock}
                                                                value={this.state.minMonthsOfStock}
                                                                placeholder='Minimum month of stock'
                                                                onBlur={handleBlur}
                                                                onChange={event => { handleChange(event); this.setTextAndValue(event) }}
                                                            />
                                                            <FormFeedback className="red">{errors.minMonthsOfStock}</FormFeedback>
                                                        </FormGroup>



                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="company">Local procurementAgent lead time<span className="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                min='0'
                                                                name="localProcurementLeadTime"
                                                                id="localProcurementLeadTime"
                                                                bsSize="sm"
                                                                valid={!errors.localProcurementLeadTime && this.state.localProcurementLeadTime != ''}
                                                                invalid={touched.localProcurementLeadTime && !!errors.localProcurementLeadTime}
                                                                value={this.state.localProcurementLeadTime}
                                                                placeholder='Local procurementAgent lead time'
                                                                onBlur={handleBlur}
                                                                onChange={event => { handleChange(event); this.setTextAndValue(event) }}
                                                            />
                                                            <FormFeedback className="red">{errors.localProcurementLeadTime}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="company">Batch No Required<span className="red Reqasterisk">*</span></Label>
                                                            <FormGroup check inline>
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    id="batchNoRequired1"
                                                                    name="batchNoRequired"
                                                                    value={true}
                                                                    checked={this.state.batchNoRequired === true}
                                                                    onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio1">
                                                                    {i18n.t('static.program.yes')}
                                                                </Label>
                                                            </FormGroup>
                                                            <FormGroup check inline>
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    id="batchNoRequired2"
                                                                    name="batchNoRequired"
                                                                    value={false}
                                                                    checked={this.state.batchNoRequired === false}
                                                                    onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                                />
                                                                <Label
                                                                    className="form-check-label"
                                                                    check htmlFor="inline-radio2">
                                                                    {i18n.t('static.program.no')}
                                                                </Label>
                                                            </FormGroup>



                                                        </FormGroup>


                                                        <FormGroup className="col-md-12 mt-md-4">
                                                            {/* <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> Remove Last Row</Button> */}
                                                            <Button type="submit" size="sm" color="success" onClick={() => this.touchAll(errors)} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                                            &nbsp;

                                     </FormGroup></Row>
                                                </Form>
                                            )} />
                                <h5 className="red">{this.state.rowErrorMessage}</h5>
                                <Table responsive className="table-striped table-hover table-bordered text-center mt-2">
                                    <thead>
                                        <tr>
                                            <th> {i18n.t('static.program.program')} </th>
                                            <th> {i18n.t('static.planningunit.planningunit')}</th>
                                            <th> {i18n.t('static.program.reorderFrequencyInMonths')} </th>
                                            <th>Minimum month of stock</th>
                                            <th>Local procurementAgent lead time</th>
                                            <th>Batch no required</th>
                                            <th>{i18n.t('static.common.status')}</th>
                                            <th>{i18n.t('static.common.update')}</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.rows.map((item, idx) => (
                                                <tr id="addr0" key={idx}>
                                                    <td>
                                                        {this.state.rows[idx].program.label.label_en}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].planningUnit.label.label_en}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].reorderFrequencyInMonths}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].minMonthsOfStock}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].localProcurementLeadTime}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].batchNoRequired ? 'Yes' : 'No'}
                                                    </td>
                                                    <td>
                                                        <StatusUpdateButtonFeature removeRow={this.handleRemoveSpecificRow} enableRow={this.enableRow} disableRow={this.disableRow} rowId={idx} status={this.state.rows[idx].active} isRowNew={this.state.rows[idx].isNew} />
                                                    </td>
                                                    <td className="whitebtnColor">
                                                        <UpdateButtonFeature updateRow={this.updateRow} rowId={idx} isRowNew={this.state.rows[idx].isNew} />
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
        this.props.history.push(`/program/listProgram/` + i18n.t('static.message.cancelled', { entityname }))
    }

}
export default AddprogramPlanningUnit;