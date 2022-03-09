import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import HealthAreaService from '../../api/HealthAreaService';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import classNames from 'classnames';
import { SPECIAL_CHARECTER_WITH_NUM, SPACE_REGEX, ALPHABET_NUMBER_REGEX } from '../../Constants';
import getLabelText from '../../CommonComponent/getLabelText';

let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.equivalancyUnit.equivalancyUnit"))
let summaryText_2 = "Add Equivalency Unit"
const initialValues = {
    summary: "",
    healthAreaId: '',
    equivalencyUnitName: '',
    notes: '',
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
        equivalencyUnitName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.message.spacetext'))
            .required(i18n.t('static.label.fieldRequired')),

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

export default class OrganisationTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            equivalencyUnit: {
                summary: summaryText_1,
                realmId: "",
                healthAreaId: [],
                equivalencyUnitName: "",
                notes: "",
            },
            lang: localStorage.getItem('lang'),
            message: '',
            healthAreaList: [],
            healthAreaId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.getHealthAreaList = this.getHealthAreaList.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
    }

    dataChange(event) {
        let { equivalencyUnit } = this.state
        if (event.target.name == "summary") {
            equivalencyUnit.summary = event.target.value;
        }
        if (event.target.name === "equivalencyUnitName") {
            equivalencyUnit.equivalencyUnitName = event.target.value
        }

        if (event.target.name == "notes") {
            equivalencyUnit.notes = event.target.value;
        }
        this.setState({
            equivalencyUnit
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            healthAreaId: true,
            equivalencyUnitName: true,
            notes: true,
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

    Capitalize(str) {
        this.state.equivalencyUnit.equivalencyUnitName = str.charAt(0).toUpperCase() + str.slice(1)
    }

    componentDidMount() {
        this.getHealthAreaList();
    }


    updateFieldData(value) {
        let { equivalencyUnit } = this.state;
        this.setState({ healthAreaId: value });
        var healthAreaId = value;
        var healthAreaIdArray = [];
        for (var i = 0; i < healthAreaId.length; i++) {
            healthAreaIdArray[i] = healthAreaId[i].label;
        }
        equivalencyUnit.healthAreaId = healthAreaIdArray;
        this.setState({ equivalencyUnit: equivalencyUnit });
    }

    getHealthAreaList(realmId) {
        HealthAreaService.getHealthAreaList()
            .then(response => {
                if (response.status == 200) {
                    console.log("response---", response.data);
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    var json = listArray;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].healthAreaId, label: getLabelText(json[i].label, this.state.lang) }
                    }

                    this.setState({
                        healthAreaId: '',
                        healthAreaList: regList
                    },
                        () => {
                            // this.getTracerCategory();
                        })
                }
                else {

                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }


            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                                break;
                        }
                    }
                }
            );
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
        let { equivalencyUnit } = this.state;
        equivalencyUnit.healthAreaId = '';
        equivalencyUnit.equivalencyUnitName = '';
        equivalencyUnit.notes = '';
        this.setState({
            equivalencyUnit: equivalencyUnit,
            healthAreaId: '',
        },
            () => { });
    }

    render() {

        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.equivalencyUnit.equivalencyUnit')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            healthAreaId: this.state.healthAreaId,
                            equivalencyUnitName: this.state.equivalencyUnit.equivalencyUnitName,
                            notes: this.state.equivalencyUnit.notes,
                        }}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.equivalencyUnit.summary = summaryText_2;
                            this.state.equivalencyUnit.userLanguageCode = this.state.lang;
                            console.log("SUBMIT---------->", this.state.equivalencyUnit);
                            JiraTikcetService.addEmailRequestIssue(this.state.equivalencyUnit).then(response => {
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
                            }).catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false
                                        });
                                    } else {
                                        switch (error.response ? error.response.status : "") {

                                            case 401:
                                                this.props.history.push(`/login/static.message.sessionExpired`)
                                                break;
                                            case 403:
                                                this.props.history.push(`/accessDenied`)
                                                break;
                                            case 500:
                                            case 404:
                                            case 406:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            case 412:
                                                this.setState({
                                                    message: error.response.data.messageCode,
                                                    loading: false
                                                });
                                                break;
                                            default:
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false
                                                });
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
                                setTouched,
                                handleReset,
                                setFieldValue,
                                setFieldTouched
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary" readOnly={true}
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.equivalencyUnit.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.equivalencyUnit.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>

                                    < FormGroup className="Selectcontrol-bdrNone">
                                        <Label for="healthAreaId">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                        <Select
                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                { 'is-valid': !errors.healthAreaId && this.state.equivalencyUnit.healthAreaId.length != 0 },
                                                { 'is-invalid': (touched.healthAreaId && !!errors.healthAreaId) }
                                            )}
                                            name="healthAreaId" id="healthAreaId"
                                            bsSize="sm"
                                            onChange={(e) => { handleChange(e); setFieldValue("healthAreaId", e); this.updateFieldData(e) }}
                                            onBlur={() => setFieldTouched("healthAreaId", true)}
                                            multi
                                            options={this.state.healthAreaList}
                                            value={this.state.healthAreaId}
                                            required />
                                        <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
                                    </FormGroup>

                                    < FormGroup >
                                        <Label for="equivalencyUnitName">{i18n.t('static.equivalancyUnit.equivalancyUnits')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="equivalencyUnitName" id="equivalencyUnitName"
                                            bsSize="sm"
                                            valid={!errors.equivalencyUnitName && this.state.equivalencyUnit.equivalencyUnitName != ''}
                                            invalid={touched.equivalencyUnitName && !!errors.equivalencyUnitName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value); }}
                                            onBlur={(e) => { handleBlur(e); }}
                                            value={this.state.equivalencyUnit.equivalencyUnitName}
                                            required />
                                        <FormFeedback className="red">{errors.equivalencyUnitName}</FormFeedback>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.equivalencyUnit.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.equivalencyUnit.notes}
                                        // required 
                                        />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                    {/* <br></br><br></br>
                                    <div className={this.props.className}>
                                        <p>{i18n.t('static.ticket.drodownvaluenotfound')}</p>
                                    </div> */}
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