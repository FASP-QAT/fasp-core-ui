import React, { Component, lazy } from 'react';
import ProgramService from '../../api/ProgramService';
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';


const entityname = i18n.t('static.program.program');
const validationSchema = function (values) {
    return Yup.object().shape({
        programId: Yup.string()
            .required(i18n.t('static.budget.budgetamountdesc')),
        versionStatusId: Yup.number().typeError(i18n.t('static.program.validstatus'))
            .required(i18n.t('static.program.validstatus')).min(0, i18n.t('static.program.validstatus')),
        // startDate: Yup.string()
        //     .required(i18n.t('static.budget.startdatetext')),
        // stopDate: Yup.string()
        //     .required(i18n.t('static.budget.stopdatetext'))
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


class EditSupplyPlanStatus extends Component {
    constructor(props) {
        super(props);

        this.state = {
            program: {
                programId: this.props.match.params.programId,
                label: {
                    label_en: ''
                }, versionStatus: { id: '', label: { label_en: '' } },
                realmCountry: { country:{id: '', label: { label_en: '' }} },
                organisation: { id: '', label: { label_en: '' } },
                healthArea: { id: '', label: { label_en: '' } },    
                programManager:{
                userId: '',
                username: ''},

                currentVersion:{
                    versionId:'',
                    versionStatus:{
                        id:''
                    }
                },
                 programNotes: '',
                airFreightPerc: '',
                seaFreightPerc: '',
                plannedToDraftLeadTime: '',
                draftToSubmittedLeadTime: '',
                submittedToApprovedLeadTime: '',
                approvedToShippedLeadTime: '',
                shippedToArrivedByAirLeadTime: '',
                shippedToArrivedBySeaLeadTime: '',
                arrivedToDeliveredLeadTime: '',
                monthsInPastForAmc: '',
                monthsInFutureForAmc: '',
                regionArray: [],
                regionList:[]
            },
            statuses: [],
            regionList:[]
        }
    }

    dataChange(event) {
        let { program } = this.state
        if (event.target.name === "versionStatusId") {
            program.currentVersion.versionStatus.id = event.target.value
        }

        this.setState(
            {
                program
            }
        )

    };

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramData({ "programId": this.props.match.params.programId, "versionId": this.props.match.params.versionId })
            .then(response => {
                console.log(response.data)
                let { program } = this.state
                program = response.data
                this.setState({
                    program
                })
                ProgramService.getRegionList(response.data.realmCountry.realmCountryId)
                .then(response => {
                    if (response.status == 200) {
                        console.log("region list---", response.data);
                        var json = response.data;
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lan) }
                        }
                        this.setState({
                            regionList: regList
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode
                        })
                    }
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
                                message: error.response
                            })
                            break
                    }
                }
            )

        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getVersionStatusList().then(response => {
            console.log('**' + JSON.stringify(response.data))
            this.setState({
                statuses: response.data,
            })
        })
            .catch(
                error => {
                    this.setState({
                        statuses: [],
                    })
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



    }
    updateFieldData=(value)=> {
        let { program } = this.state;
        this.setState({ regionId: value });
        var regionId = value;
        var regionIdArray = [];
        for (var i = 0; i < regionId.length; i++) {
            regionIdArray[i] = regionId[i].value;
        }
        program.regionArray = regionIdArray;
        this.setState({ program: program });
    }
    
    touchAll(setTouched, errors) {
        setTouched({
            versionStatusId: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('supplyplanForm', (fieldName) => {
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
        const { statuses } = this.state;
        let statusList = statuses.length > 0
            && statuses.map((item, i) => {
                return (
                    <option key={i} value={item.id} disabled={item.id == 1 ? "disabled" : ""} >
                   
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);


        return (
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    programId: this.props.match.params.programId,
                                    versionId: this.props.match.params.versionId,
                                    statusId: this.state.program.versionStatusId
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    ProgramService.updateProgramStatus(this.state.program)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/report/supplyPlanVersionAndReview/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }

                                        })
                                        .catch(
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
                                            <Form onSubmit={handleSubmit} noValidate name='supplyplanForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="programName">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span> </Label>
                                                        <Input type="text"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                              valid={!errors.programId}
                                                            invalid={touched.programId && !!errors.programId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.state.program.label.label_en}
                                                            disabled />
                                                        <FormFeedback className="red">{errors.programId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.realmcountry')}</Label>

                                                        <Input
                                                            value={getLabelText(this.state.program.realmCountry.country.label, this.state.lang)}
                                                            bsSize="sm"
                                                            valid={!errors.realmCountryId}
                                                            invalid={touched.realmCountryId && !!errors.realmCountryId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            disabled
                                                            type="text" name="realmCountryId" id="realmCountryId">

                                                        </Input>
                                                        <FormFeedback>{errors.realmCountryId}</FormFeedback>

                                                    </FormGroup>
                                                   
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.program.organisation')}</Label>

                                                        <Input
                                                            value={getLabelText(this.state.program.organisation.label, this.state.lang)}
                                                            bsSize="sm"
                                                            valid={!errors.organisationId}
                                                            invalid={touched.organisationId && !!errors.organisationId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            disabled
                                                            type="text" name="organisationId" id="organisationId">

                                                        </Input>
                                                        <FormFeedback>{errors.organisationId}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="select">{i18n.t('static.program.healtharea')}</Label>

                                                        <Input
                                                            value={getLabelText(this.state.program.healthArea.label, this.state.lang)}
                                                            bsSize="sm"
                                                            valid={!errors.healthAreaId}
                                                            invalid={touched.healthAreaId && !!errors.healthAreaId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur} disabled type="text" name="healthAreaId" id="healthAreaId"
                                                            disabled >

                                                        </Input>
                                                        <FormFeedback>{errors.healthAreaId}</FormFeedback>

                                                    </FormGroup>
                                                   
                                                    <FormGroup>

                                                        <Label htmlFor="select">{i18n.t('static.program.notes')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.programNotes}
                                                            bsSize="sm"
                                                            valid={!errors.programNotes}
                                                            invalid={touched.programNotes && !!errors.programNotes}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="textarea" name="programNotes" id="programNotes"
                                                            disabled  />
                                                        <FormFeedback>{errors.programNotes}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.airfreightperc')} (%) <span class="red ">*</span></Label>

                                                        <Input
                                                            value={this.state.program.airFreightPerc}
                                                            bsSize="sm"
                                                            valid={!errors.airFreightPerc}
                                                            invalid={touched.airFreightPerc && !!errors.airFreightPerc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="airFreightPerc" id="airFreightPerc" placeholder={i18n.t('static.program.airfreightperctext')} />
                                                        <FormFeedback>{errors.airFreightPerc}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.seafreightperc')} (%) <span class="red ">*</span></Label>

                                                        <Input
                                                            value={this.state.program.seaFreightPerc}
                                                            bsSize="sm"
                                                            valid={!errors.seaFreightPerc}
                                                            invalid={touched.seaFreightPerc && !!errors.seaFreightPerc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="seaFreightPerc" id="seaFreightPerc" placeholder={i18n.t('static.program.seafreightperctext')} />
                                                        <FormFeedback>{errors.seaFreightPerc}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.draftleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.plannedToDraftLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.plannedToDraftLeadTime}
                                                            invalid={touched.plannedToDraftLeadTime && !!errors.plannedToDraftLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="plannedToDraftLeadTime" id="plannedToDraftLeadTime" placeholder={i18n.t('static.program.draftleadtext')} />
                                                        <FormFeedback>{errors.plannedToDraftLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.drafttosubmitleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.draftToSubmittedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.draftToSubmittedLeadTime}
                                                            invalid={touched.draftToSubmittedLeadTime && !!errors.draftToSubmittedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="draftToSubmittedLeadTime" id="draftToSubmittedLeadTime" placeholder={i18n.t('static.program.drafttosubmittext')} />
                                                        <FormFeedback>{errors.draftToSubmittedLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.submittoapproveleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.submittedToApprovedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.submittedToApprovedLeadTime}
                                                            invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="submittedToApprovedLeadTime" id="submittedToApprovedLeadTime" placeholder={i18n.t('static.program.submittoapprovetext')} />
                                                        <FormFeedback>{errors.submittedToApprovedLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.approvetoshipleadtime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.approvedToShippedLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.approvedToShippedLeadTime}
                                                            invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="approvedToShippedLeadTime" id="approvedToShippedLeadTime" placeholder={i18n.t('static.program.approvetoshiptext')} />
                                                        <FormFeedback>{errors.approvedToShippedLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedAirLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.shippedToArrivedByAirLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.shippedToArrivedByAirLeadTime && this.state.program.shippedToArrivedByAirLeadTime != ''}
                                                            invalid={touched.shippedToArrivedByAirLeadTime && !!errors.shippedToArrivedByAirLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="shippedToArrivedByAirLeadTime" id="shippedToArrivedByAirLeadTime" placeholder={i18n.t('static.realmcountry.shippedToArrivedAirLeadTimetext')} />
                                                        <FormFeedback>{errors.shippedToArrivedByAirLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.shippedToArrivedBySeaLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.shippedToArrivedBySeaLeadTime && this.state.program.shippedToArrivedBySeaLeadTime != ''}
                                                            invalid={touched.shippedToArrivedBySeaLeadTime && !!errors.shippedToArrivedBySeaLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="shippedToArrivedBySeaLeadTime" id="shippedToArrivedBySeaLeadTime" placeholder={i18n.t('static.realmcountry.shippedToArrivedSeaLeadTimetext')} />
                                                        <FormFeedback>{errors.shippedToArrivedBySeaLeadTime}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.realmcountry.arrivedToDeliveredLeadTime')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.arrivedToDeliveredLeadTime}
                                                            bsSize="sm"
                                                            valid={!errors.arrivedToDeliveredLeadTime && this.state.program.arrivedToDeliveredLeadTime != ''}
                                                            invalid={touched.arrivedToDeliveredLeadTime && !!errors.arrivedToDeliveredLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="arrivedToDeliveredLeadTime" id="arrivedToDeliveredLeadTime" placeholder={i18n.t('static.realmcountry.arrivedToDeliveredLeadTimetext')} />
                                                        <FormFeedback>{errors.arrivedToDeliveredLeadTime}</FormFeedback>

                                                    </FormGroup>






                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.monthpastamc')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.monthsInPastForAmc}
                                                            bsSize="sm"
                                                            valid={!errors.monthsInPastForAmc}
                                                            invalid={touched.monthsInPastForAmc && !!errors.monthsInPastForAmc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="monthsInPastForAmc" id="monthsInPastForAmc" placeholder={i18n.t('static.program.monthpastamctext')} />
                                                        <FormFeedback>{errors.monthsInPastForAmc}</FormFeedback>

                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label htmlFor="company">{i18n.t('static.program.monthfutureamc')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.monthsInFutureForAmc}
                                                            bsSize="sm"
                                                            valid={!errors.monthsInFutureForAmc}
                                                            invalid={touched.monthsInFutureForAmc && !!errors.monthsInFutureForAmc}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            type="number"
                                                            min="0"
                                                            disabled 
                                                            name="monthsInFutureForAmc" id="monthsInFutureForAmc" placeholder={i18n.t('static.program.monthfutureamctext')} />
                                                        <FormFeedback>{errors.monthsInFutureForAmc}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>

                                                        <Label htmlFor="select">{i18n.t('static.report.comment')}<span class="red Reqasterisk">*</span></Label>

                                                        <Input
                                                            value={this.state.program.currentVersion.notes}
                                                            bsSize="sm"
                                                            valid={!errors.versionNotes}
                                                            invalid={touched.versionNotes && !!errors.versionNotes}
                                                            onChange={(e) => { handleChange(e);  }}
                                                            onBlur={handleBlur}
                                                            type="textarea" name="versionNotes" id="versionNotes" 
                                                            disabled />
                                                        <FormFeedback>{errors.programNotes}</FormFeedback>

                                                    </FormGroup>
                                                    
                                                    <FormGroup>
                                                        <Label htmlFor="versionStatusId">{i18n.t('static.common.status')}<span className="red Reqasterisk">*</span> </Label>
                                                        <Input
                                                            type="select"
                                                            name="versionStatusId"
                                                            id="versionStatusId"
                                                            bsSize="sm"
                                                            valid={!errors.versionStatusId}
                                                            invalid={touched.versionStatusId && !!errors.versionStatusId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.program.currentVersion.versionStatus.id}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {statusList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.versionStatusId}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> Reset</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>

                                                        &nbsp;
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
    cancelClicked = () => {
        this.props.history.push(`/report/supplyPlanVersionAndReview/`+ i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked = () => {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getProgramData({ "programId": this.props.match.params.programId, "versionId": this.props.match.params.versionId })
            .then(response => {
                console.log(response.data)
                let { program } = this.state
                program.label = response.data.label
                this.setState({
                    program
                })
            })


    }
}
export default EditSupplyPlanStatus