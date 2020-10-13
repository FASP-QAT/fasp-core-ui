import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, FormFeedback, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import classNames from 'classnames';

const initialValues = {
    masterId: '',
    masterRecordId: '',
    notes: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        masterId: Yup.string()
            .required('Select Master'),
        // masterRecordId: Yup.string()
        //     .required('Select Master Record'),
        masterRecordName: Yup.string()
            .required('Enter Master Record Name'),
        notes: Yup.string()
            .required(i18n.t('static.program.validnotestext'))
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

export default class EditMasterTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            editMaster: {
                summary: '',
                masterId: '',
                masterName: '',
                masterRecordId: '',
                masterRecordName: '',
                notes: ''
            },
            masterList : [],
            masterRecordList : []
        }

        this.dataChange = this.dataChange.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.getMasterRecord = this.getMasterRecord.bind(this);
    }

    componentDidMount() {

        let masters = [];        
        masters.push({id:1, name: i18n.t('static.dashboard.budget')});
        masters.push({id:2, name: i18n.t('static.datasource.datasource')});
        masters.push({id:3, name: i18n.t('static.fundingsource.fundingsource')});
        masters.push({id:4, name: i18n.t('static.forecastingunit.forecastingunit')});
        masters.push({id:5, name: i18n.t('static.organisation.organisation')});
        masters.push({id:6, name: i18n.t('static.planningunit.planningunit')});
        masters.push({id:7, name: i18n.t('static.product.productcategory')});
        masters.push({id:8, name: i18n.t('static.procurementagent.procurementagent')});
        masters.push({id:9, name: i18n.t('static.program.programMaster')});
        masters.push({id:10, name: i18n.t('static.realm.realm')});
        masters.push({id:11, name: i18n.t('static.dashboard.realmcountry')});
        masters.push({id:12, name: i18n.t('static.dashboad.regioncountry')});
        masters.push({id:13, name: i18n.t('static.healtharea.healtharea')});
        masters.push({id:14, name: i18n.t('static.tracercategory.tracercategory')});
        this.setState({
            masterList: masters
        })
    }

    dataChange(event) {

        let { editMaster } = this.state

        if (event.target.name === "masterId") {            
            editMaster.masterId = event.target.value;
        }

        if (event.target.name === "masterRecordId") {            
            editMaster.masterRecordId = event.target.value;
        }
       
        if (event.target.name == "notes") {
            editMaster.notes = event.target.value;
        }
        this.setState({
            editMaster
        })

    }

    getMasterRecord(event) {
        var masterId = event.target.value;
    }

    touchAll(setTouched, errors) {
        setTouched({
            masterId: true,
            masterRecordId: true,
            notes: true
        })
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

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { editMaster } = this.state;

        editMaster.summary = '';
        editMaster.masterId = '';
        editMaster.masterName = '';
        editMaster.masterRecordId = '';
        editMaster.masterRecordName = '';
        editMaster.notes = '';

        this.setState({
            editMaster
        });
    }

    render() {        

        const { masterList } = this.state;
        const { masterRecordList } = this.state;

        let masters = masterList.length > 0
            && masterList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {/* {getLabelText(item.label, this.state.lang)} */}
                        {item.name}
                    </option>
                )
            }, this);

        let records = masterRecordList.length > 0
            && masterRecordList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {item.name}
                    </option>
                )
            }, this);

        return (
            <div className="col-md-12">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.ticket.editMasters')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            JiraTikcetService.addEmailRequestIssue(this.state.editMaster).then(response => {
                                console.log("Response :", response.status, ":", JSON.stringify(response.data));
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    this.setState({
                                        message: msg, loading: false
                                    },
                                        () => {
                                            this.resetClicked();
                                            this.hideSecondComponent();
                                        })
                                } else {
                                    this.setState({
                                        message: i18n.t('static.unkownError'), loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }
                                this.props.togglehelp();
                                this.props.toggleSmall(this.state.message);
                            })
                                .catch(
                                    error => {
                                        this.setState({
                                            message: i18n.t('static.unkownError'), loading: false
                                        },
                                            () => {
                                                this.hideSecondComponent();
                                            });
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
                                setTouched,
                                handleReset,
                                setFieldValue,
                                setFieldTouched
                            }) => (
                                    <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">                                        
                                        
                                        <FormGroup>
                                            <Label for="masterId">Master<span class="red Reqasterisk">*</span></Label>
                                            <Input type="select" name="masterId" id="masterId"
                                                bsSize="sm"
                                                valid={!errors.masterId && this.state.editMaster.masterId != ''}
                                                invalid={touched.masterId && !!errors.masterId}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.editMaster.masterId}
                                                required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {masters}
                                            </Input>
                                            <FormFeedback className="red">{errors.masterId}</FormFeedback>
                                        </FormGroup>                                                                               
                                        <FormGroup>
                                            <Label for="masterRecordId">Record Name<span class="red Reqasterisk">*</span></Label>
                                            {/* <Input type="select" name="masterRecordId" id="masterRecordId"
                                                bsSize="sm"
                                                valid={!errors.masterRecordId && this.state.editMaster.masterRecordId != ''}
                                                invalid={touched.masterRecordId && !!errors.masterRecordId}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.editMaster.masterRecordId}
                                                required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {records}
                                            </Input> */}
                                            <Input type="text" name="masterRecordName" id="masterRecordName"
                                                bsSize="sm"
                                                valid={!errors.masterRecordName && this.state.editMaster.masterRecordName != ''}
                                                invalid={touched.masterRecordName && !!errors.masterRecordName}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.editMaster.masterRecordName}
                                                required>                                                
                                            </Input>
                                            <FormFeedback className="red">{errors.masterRecordName}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="notes">{i18n.t('static.common.notes')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="textarea" name="notes" id="notes"
                                                bsSize="sm"
                                                valid={!errors.notes && this.state.editMaster.notes != ''}
                                                invalid={touched.notes && !!errors.notes}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.editMaster.notes}
                                                required 
                                            />
                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                        </FormGroup>
                                        <ModalFooter className="pb-0 pr-0">
                                            <Button type="button" size="md" color="info" className=" mr-1" onClick={this.props.toggleMain}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                            <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" size="md" color="success" className=" mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                        </ModalFooter>                                        
                                    </Form>
                                )} />
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}