import React, { Component } from 'react';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row, Form, FormFeedback

} from 'reactstrap';
import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
import StatusUpdateButtonFeature from '../../CommonComponent/StatusUpdateButtonFeature';
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
import AuthenticationService from '../Common/AuthenticationService.js';
import ProcurementUnitService from "../../api/ProcurementUnitService";
import getLabelText from '../../CommonComponent/getLabelText'
import i18n from '../../i18n';
import * as Yup from 'yup';
import { Formik } from "formik";
const entityname = i18n.t('static.dashboard.procurementAgentProcurementUnit')

let initialValues = {
    procurementUnitId: '',
    skuCode: '',
    vendorPrice: '',
    approvedToShippedLeadTime: '',
    gtin: '',
}

const validationSchema = function (values, t) {
    console.log("made by us schema--->", values)
    return Yup.object().shape({
        procurementUnitId: Yup.string()
            .required(i18n.t('static.mapProcurementUnit.validProcurementUnitText')),
        skuCode: Yup.string()
            .required(i18n.t('static.mapProcurementUnit.validSKUCodeText')),
        gtin: Yup.string()
            .required(i18n.t('static.mapProcurementUnit.validGtinText'))
            .max(14, i18n.t('static.procurementUnit.validMaxValueText'))
            .matches(/^[a-zA-Z0-9]*$/, i18n.t('static.procurementUnit.onlyalphaNumericText')),
        approvedToShippedLeadTime: Yup.number().
            typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.mapProcurementUnit.validApprovedToShippedLeadTimeText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        vendorPrice: Yup.number().
            typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.mapProcurementUnit.validVendorPriceText'))
            .min(0, i18n.t('static.procurementUnit.validValueText'))
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

export default class AddProcurementAgentProcurementUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        // if (this.props.location.state.procurementAgentProcurementUnit.length > 0) {
        //     rows = this.props.location.state.procurementAgentProcurementUnit;
        // }
        this.state = {
            // procurementAgentProcurementUnit: this.props.location.state.procurementAgentProcurementUnit,
            procurementUnitId: '',
            procurementUnitName: '',
            skuCode: '',
            vendorPrice: '',
            approvedToShippedLeadTime: '',
            gtin: '',
            procurementAgentProcurementUnitId: 0,
            isNew: true,
            rows: rows,
            procurementAgentList: [],
            procurementUnitList: [],
            rowErrorMessage: '',
            lang: localStorage.getItem('lang'),
            procurementAgentId: this.props.match.params.procurementAgentId,
            updateRowStatus: 0,
            loading: true
        }
        this.addRow = this.addRow.bind(this);
        // this.deleteLastRow = this.deleteLastRow.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.enableRow = this.enableRow.bind(this);
        this.disableRow = this.disableRow.bind(this);
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
            this.setState({ rowErrorMessage: i18n.t('static.mapProcurementUnit.mappedRowAlreadyExistsInUpdate') })
        } else {
            document.getElementById('procurementUnitId').disabled = true;
            initialValues = {
                procurementUnitId: this.state.rows[idx].procurementUnit.id,
                skuCode: this.state.rows[idx].skuCode,
                vendorPrice: this.state.rows[idx].vendorPrice,
                approvedToShippedLeadTime: this.state.rows[idx].approvedToShippedLeadTime,
                gtin: this.state.rows[idx].gtin,
            }
            const rows = [...this.state.rows]
            this.setState({
                procurementUnitId: this.state.rows[idx].procurementUnit.id,
                procurementUnitName: this.state.rows[idx].procurementUnit.label.label_en,
                skuCode: this.state.rows[idx].skuCode,
                vendorPrice: this.state.rows[idx].vendorPrice,
                approvedToShippedLeadTime: this.state.rows[idx].approvedToShippedLeadTime,
                gtin: this.state.rows[idx].gtin,
                procurementAgentProcurementUnitId: this.state.rows[idx].procurementAgentProcurementUnitId,
                isNew: false,
                updateRowStatus: 1
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
    addRow() {
        let addRow = true;
        if (addRow) {
            this.state.rows.map(item => {
                if (item.procurementUnit.id == this.state.procurementUnitId) {
                    addRow = false;
                }
            })
        }
        if (addRow == true) {
            var procurementAgentName = document.getElementById("procurementAgentId");
            var value = procurementAgentName.selectedIndex;
            var selectedProcurementAgentName = procurementAgentName.options[value].text;
            this.state.rows.push(
                {
                    procurementUnit: {
                        id: this.state.procurementUnitId,
                        label:
                        {
                            label_en: this.state.procurementUnitName
                        },
                    },
                    procurementAgent: {
                        id: this.state.procurementAgentId,
                        label: {
                            label_en: selectedProcurementAgentName
                        }
                    },
                    skuCode: this.state.skuCode,
                    vendorPrice: this.state.vendorPrice,
                    approvedToShippedLeadTime: this.state.approvedToShippedLeadTime,
                    gtin: this.state.gtin,
                    active: true,
                    isNew: this.state.isNew,
                    procurementAgentProcurementUnitId: this.state.procurementAgentProcurementUnitId
                })
            this.setState({ rows: this.state.rows, rowErrorMessage: '' })
        } else {
            this.state.rowErrorMessage = i18n.t('static.procurementAgentProcurementUnit.procurementUnitAlreadyExists')
        }
        this.setState({
            procurementUnitId: '',
            procurementUnitName: '',
            skuCode: '',
            vendorPrice: '',
            approvedToShippedLeadTime: '',
            gtin: '',
            procurementAgentProcurementUnitId: 0,
            isNew: true,
            updateRowStatus: 0
        });
        document.getElementById('procurementUnitId').disabled = false;
    }
    // deleteLastRow() {
    //     this.setState({
    //         rows: this.state.rows.slice(0, -1)
    //     });
    // }

    handleRemoveSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows.splice(idx, 1);
        this.setState({ rows })
    }

    capitalize(event) {
        if (event.target.name === "skuCode") {
            let { skuCode } = this.state
            skuCode = event.target.value.toUpperCase()
            this.setState({
                skuCode: skuCode
            })
        } else if (event.target.name === "gtin") {
            let { gtin } = this.state
            gtin = event.target.value.toUpperCase()
            this.setState({
                gtin: gtin
            })

        }
    }

    setTextAndValue = (event) => {
        if (event.target.name === 'skuCode') {
            this.setState({ skuCode: event.target.value });
        }
        if (event.target.name === 'vendorPrice') {
            this.setState({ vendorPrice: event.target.value });
        }
        if (event.target.name === 'approvedToShippedLeadTime') {
            this.setState({ approvedToShippedLeadTime: event.target.value });
        }
        if (event.target.name === 'gtin') {
            this.setState({ gtin: event.target.value });
        } else if (event.target.name === 'procurementUnitId') {
            this.setState({ procurementUnitName: event.target[event.target.selectedIndex].text });
            this.setState({ procurementUnitId: event.target.value })
        }
    };

    submitForm() {
        console.log("Rows on submit", this.state.rows)
        // var procurementAgentProcurementUnit = {
        //     procurementAgentId: this.state.procurementAgentId,
        //     procurementUnits: this.state.rows
        // }

        AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.addprocurementAgentProcurementUnitMapping(this.state.rows)
            .then(response => {
                if (response.status == "200") {
                    this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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

        ProcurementAgentService.getProcurementAgentProcurementUnitList(this.state.procurementAgentId)
            .then(response => {
                if (response.status == 200) {
                    let myResponse = response.data;
                    if (myResponse.length > 0) {
                        this.setState({ rows: myResponse, loading: false });
                    }
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


        ProcurementAgentService.getProcurementAgentListAll().then(response => {
            console.log(response.data);
            if (response.status == "200") {
                this.setState({
                    procurementAgentList: response.data
                });
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
        AuthenticationService.setupAxiosInterceptors();
        ProcurementUnitService.getProcurementUnitListActive().then(response => {
            // console.log(response.data.data);
            if (response.status == 200) {
                this.setState({
                    procurementUnitList: response.data
                });
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
        this.findFirstError('procurementAgentPlanningUnitForm', (fieldName) => {
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
        const { procurementUnitList } = this.state;
        let procurementUnits = procurementUnitList.length > 0 && procurementUnitList.map((item, i) => {
            return (
                <option key={i} value={item.procurementUnitId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);

        const { procurementAgentList } = this.state;
        let procurementAgents = procurementAgentList.length > 0 && procurementAgentList.map((item, i) => {
            return (
                <option key={i} value={item.procurementAgentId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
                <Row>
                    <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
                        <Card  >

                            <CardHeader>
                                <strong>{i18n.t('static.procurementAgentProcurementUnit.mapProcurementUnit')}</strong>
                            </CardHeader>
                            <CardBody>
                                <Formik
                                    enableReinitialize={true}
                                    initialValues={initialValues}
                                    validate={validate(validationSchema)}
                                    onSubmit={(values, { setSubmitting, setErrors, resetForm }) => {
                                        this.addRow();
                                        resetForm({
                                            procurementUnitId: '',
                                            skuCode: '',
                                            vendorPrice: '',
                                            approvedToShippedLeadTime: '',
                                            gtin: '',
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
                                        }) => (
                                                <Form onSubmit={handleSubmit} noValidate name='procurementAgentPlanningUnitForm'>
                                                    <Row>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="select">{i18n.t('static.procurementagent.procurementagent')}<span className="red Reqasterisk">*</span></Label>
                                                            <Input type="select" value={this.state.procurementAgentId} name="procurementAgentId" id="procurementAgentId" disabled>
                                                                {procurementAgents}
                                                            </Input>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="select">{i18n.t('static.procurementUnit.procurementUnit')}<span className="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                type="select"
                                                                name="procurementUnitId"
                                                                id="procurementUnitId"
                                                                bsSize="sm"
                                                                valid={!errors.procurementUnitId && this.state.procurementUnitId != ''}
                                                                invalid={touched.procurementUnitId && !!errors.procurementUnitId}
                                                                onBlur={handleBlur}
                                                                value={this.state.procurementUnitId}
                                                                onChange={event => { handleChange(event); this.setTextAndValue(event) }}>
                                                                <option value="">{i18n.t('static.common.select')}</option>
                                                                {procurementUnits}
                                                            </Input>
                                                            <FormFeedback className="red">{errors.procurementUnitId}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="skuCode">{i18n.t('static.procurementAgentProcurementUnit.skuCode')}<span className="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                type="text"
                                                                name="skuCode"
                                                                id="skuCode"
                                                                value={this.state.skuCode}
                                                                bsSize="sm"
                                                                valid={!errors.skuCode && this.state.skuCode != ''}
                                                                invalid={touched.skuCode && !!errors.skuCode}
                                                                // placeholder={i18n.t('static.procurementAgentProcurementUnit.skuCodeText')}
                                                                onBlur={handleBlur}
                                                                onChange={(event) => { handleChange(event); this.setTextAndValue(event); this.capitalize(event) }} />
                                                            <FormFeedback className="red">{errors.skuCode}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="vendorPrice">{i18n.t('static.procurementAgentProcurementUnit.vendorPrice')}<span className="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                name="vendorPrice"
                                                                id="vendorPrice"
                                                                bsSize="sm"
                                                                valid={!errors.vendorPrice && this.state.vendorPrice != ''}
                                                                invalid={touched.vendorPrice && !!errors.vendorPrice}
                                                                value={this.state.vendorPrice}
                                                                // placeholder={i18n.t('static.procurementAgentProcurementUnit.vendorPriceText')}
                                                                onBlur={handleBlur}
                                                                onChange={event => { handleChange(event); this.setTextAndValue(event) }} />
                                                            <FormFeedback className="red">{errors.vendorPrice}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="leadTime">{i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTime')}<span className="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                name="approvedToShippedLeadTime"
                                                                id="approvedToShippedLeadTime"
                                                                bsSize="sm"
                                                                valid={!errors.approvedToShippedLeadTime && this.state.approvedToShippedLeadTime != ''}
                                                                invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                                                value={this.state.approvedToShippedLeadTime}
                                                                // placeholder={i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTimeText')}
                                                                onBlur={handleBlur}
                                                                onChange={event => { handleChange(event); this.setTextAndValue(event) }} />
                                                            <FormFeedback className="red">{errors.approvedToShippedLeadTime}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-6">
                                                            <Label htmlFor="gtin">{i18n.t('static.procurementAgentProcurementUnit.gtin')}<span className="red Reqasterisk">*</span></Label>
                                                            <Input
                                                                type="text"
                                                                name="gtin"
                                                                id="gtin"
                                                                bsSize="sm"
                                                                valid={!errors.gtin && this.state.gtin != ''}
                                                                invalid={touched.gtin && !!errors.gtin}
                                                                value={this.state.gtin} 
                                                                // placeholder={i18n.t('static.procurementAgentProcurementUnit.gtinText')}
                                                                onBlur={handleBlur}
                                                                onChange={event => { handleChange(event); this.setTextAndValue(event); this.capitalize(event) }} />
                                                            <FormFeedback className="red">{errors.gtin}</FormFeedback>
                                                        </FormGroup>
                                                        <FormGroup className="col-md-12 md-mt-4">
                                                            {/* <Button type="button" size="md" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> {i18n.t('static.common.rmlastrow')}</Button> */}
                                                            <Button type="submit" size="sm" color="success" onClick={() => this.touchAll(errors)} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                                            &nbsp;

                        </FormGroup></Row>
                                                </Form>
                                            )} />
                                <h5 className="red">{this.state.rowErrorMessage}</h5>
                                <Table responsive className="table-striped table-hover table-bordered text-center mt-2" >
                                    <thead>
                                        <tr>
                                            <th className="text-center">{i18n.t('static.procurementagent.procurementagent')}</th>
                                            <th className="text-center">{i18n.t('static.procurementUnit.procurementUnit')}</th>
                                            <th className="text-center">{i18n.t('static.procurementAgentProcurementUnit.skuCode')}</th>
                                            <th className="text-center">{i18n.t('static.procurementAgentProcurementUnit.vendorPrice')}</th>
                                            <th className="text-center">{i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTime')}</th>
                                            <th className="text-center">{i18n.t('static.procurementAgentProcurementUnit.gtin')}</th>
                                            <th className="text-center">{i18n.t('static.common.status')}</th>
                                            <th className="text-center">{i18n.t('static.common.update')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.rows.map((item, idx) => (
                                                <tr id="addr0" key={idx}>
                                                    <td>
                                                        {this.state.rows[idx].procurementAgent.label.label_en}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].procurementUnit.label.label_en}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].skuCode}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].vendorPrice}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].approvedToShippedLeadTime}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].gtin}
                                                    </td>
                                                    <td>
                                                        {/* <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} /> */}
                                                        <StatusUpdateButtonFeature removeRow={this.handleRemoveSpecificRow} enableRow={this.enableRow} disableRow={this.disableRow} rowId={idx} status={this.state.rows[idx].active} isRowNew={this.state.rows[idx].isNew} />
                                                    </td>
                                                    <td>
                                                        <UpdateButtonFeature updateRow={this.updateRow} rowId={idx} isRowNew={this.state.rows[idx].isNew} />
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                    {/* <div id="loader" class="center"></div> */}
                                </Table>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                                    &nbsp;
                                </FormGroup>

                            </CardFooter>
                        </Card>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>Loading...</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

        );
    }
    cancelClicked() {
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}




