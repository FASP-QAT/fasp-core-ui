import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import CountryService from "../../api/CountryService";
import HealthAreaService from "../../api/HealthAreaService";
import { lang } from "moment";
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import classNames from 'classnames';
import { ALPHABET_NUMBER_REGEX, SPACE_REGEX } from '../../Constants.js';



let initialValues = {
    realmId: '',
    healthAreaName: '',
    healthAreaCode: '',
    realmCountryId: [],
}
const entityname = i18n.t('static.healtharea.healtharea');
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        healthAreaName: Yup.string()
            // .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.healtharea.healthareatext')),
        healthAreaCode: Yup.string()
            .matches(ALPHABET_NUMBER_REGEX, i18n.t('static.message.alphabetnumerallowed'))
            .max(6, 'Display name length should be 6')
            .required(i18n.t('static.common.displayName')),
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext'))
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

export default class EditHealthAreaComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            countries: [],
            realms: [],
            healthArea: {
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                realmCountryArray: [],
                healthAreaCode: '',

            },
            // healthArea: this.props.location.state.healthArea,
            message: '',
            lang: localStorage.getItem('lang'),
            realmCountryId: '',
            realmCountryList: [],
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        // this.getRealmCountryList = this.getRealmCountryList.bind(this);

        // initialValues = {
        //     // label: this.props.location.state.healthArea.label.label_en,
        //     healthAreaName: getLabelText(this.state.healthArea.label, lang),
        //     realmId: this.state.healthArea.realm.realmId
        // }

        console.log("state---", this.state);
    }

    changeMessage(message) {
        this.setState({ message: message })
    }
    changeLoading(loading) {
        this.setState({ loading: loading })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    dataChange(event) {
        let { healthArea } = this.state
        console.log(event.target.name);
        console.log(event.target.value);
        if (event.target.name === "healthAreaName") {
            healthArea.label.label_en = event.target.value
        } else if (event.target.name === "realmId") {
            healthArea.realm.id = event.target.value
        } else if (event.target.name === "active") {
            healthArea.active = event.target.id === "active2" ? false : true
        } else if (event.target.name === "healthAreaCode") {
            healthArea.healthAreaCode = event.target.value.toUpperCase();
        }
        this.setState({
            healthArea
        }, (
        ) => {
            console.log("state after update---", this.state.healthArea)
        })
    }

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true,
            healthAreaName: true,
            healthAreaCode: true,
            realmCountryId: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('healthAreaForm', (fieldName) => {
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
        HealthAreaService.getHealthAreaById(this.props.match.params.healthAreaId).then(response => {
            if (response.status == 200) {
                this.setState({
                    healthArea: response.data, loading: false
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

            // initialValues = {
            //     healthAreaName: this.state.healthArea.label.label_en,
            //     healthAreaCode: this.state.healthArea.healthAreaCode,
            //     realmId: this.state.healthArea.realm.id
            // }

            UserService.getRealmList()
                .then(response => {
                    console.log("realm list---", response.data);
                    this.setState({
                        realms: response.data, loading: false
                    })
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

            HealthAreaService.getRealmCountryList(this.state.healthArea.realm.id)
                .then(response => {
                    console.log("Realm Country List -------list---", response.data);
                    if (response.status == 200) {
                        var json = response.data;
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].realmCountryId, label: json[i].country.label.label_en }
                        }
                        this.setState({
                            realmCountryList: regList, loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
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

    updateFieldData(value) {
        let { healthArea } = this.state;
        this.setState({ realmCountryId: value });
        var realmCountryId = value;
        var realmCountryIdArray = [];
        for (var i = 0; i < realmCountryId.length; i++) {
            realmCountryIdArray[i] = realmCountryId[i].value;
        }
        healthArea.realmCountryArray = realmCountryIdArray;
        this.setState({ healthArea: healthArea });
    }

    Capitalize(str) {
        this.state.healthArea.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    render() {
        const { countries } = this.state;
        const { realms } = this.state;

        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {(() => {
                            switch (this.state.languageId) {
                                case 2: return (item.label.label_pr !== null && item.label.label_pr !== "" ? item.label.label_pr : item.label.label_en);
                                case 3: return (item.label.label_fr !== null && item.label.label_fr !== "" ? item.label.label_fr : item.label.label_en);
                                case 4: return (item.label.label_sp !== null && item.label.label_sp !== "" ? item.label.label_sp : item.label.label_en);
                                default: return item.label.label_en;
                            }
                        })()}
                    </option>
                )
            }, this);

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    healthAreaName: this.state.healthArea.label.label_en,
                                    healthAreaCode: this.state.healthArea.healthAreaCode,
                                    realmId: this.state.healthArea.realm.id,
                                    realmCountryId: this.state.healthArea.realmCountryArray
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    console.log("-------------------->" + this.state.healthArea);
                                    HealthAreaService.editHealthArea(this.state.healthArea)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/healthArea/listHealthArea/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
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
                                        setFieldValue,
                                        setFieldTouched
                                    }) => (
                                            <Form onSubmit={handleSubmit} noValidate name='healthAreaForm'>
                                                <CardBody className="pb-0">
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.healtharea.realm')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            value={this.state.healthArea.realm.id}
                                                            valid={!errors.realmId}
                                                            invalid={touched.realmId && !!errors.realmId || this.state.healthArea.realm.realmId == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            disabled
                                                            type="select" name="realmId" id="realmId">
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback>{errors.realmId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup className="Selectcontrol-bdrNone">
                                                        <Label htmlFor="select">{i18n.t('static.healtharea.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                                        <Select
                                                            // className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            //     { 'is-valid': !errors.realmCountryId },
                                                            //     { 'is-invalid': (touched.realmCountryId && !!errors.realmCountryId || this.state.healthArea.realmCountryArray.length == 0) }
                                                            // )}
                                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                                { 'is-valid': !errors.realmCountryId },
                                                                { 'is-invalid': (touched.realmCountryId && !!errors.realmCountryId || !!errors.realmCountryId) }
                                                            )}
                                                            bsSize="sm"
                                                            name="realmCountryId"
                                                            id="realmCountryId"
                                                            onChange={(e) => {
                                                                handleChange(e);
                                                                setFieldValue("realmCountryId", e);
                                                                this.updateFieldData(e);
                                                            }}
                                                            onBlur={() => setFieldTouched("realmCountryId", true)}
                                                            multi
                                                            options={this.state.realmCountryList}
                                                            value={this.state.healthArea.realmCountryArray}
                                                        />
                                                        <FormFeedback>{errors.realmCountryId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="company">{i18n.t('static.technicalArea.technicalAreaDisplayName')}<span class="red Reqasterisk">*</span> </Label>
                                                        <Input
                                                            bsSize="sm"
                                                            type="text" name="healthAreaCode"
                                                            valid={!errors.healthAreaCode}
                                                            invalid={touched.healthAreaCode && !!errors.healthAreaCode || !!errors.healthAreaCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            maxLength={6}
                                                            value={this.state.healthArea.healthAreaCode}
                                                            id="healthAreaCode" />
                                                        <FormFeedback className="red">{errors.healthAreaCode}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="company">{i18n.t('static.healthArea.healthAreaName')}<span class="red Reqasterisk">*</span> </Label>
                                                        <Input
                                                            bsSize="sm"
                                                            type="text" name="healthAreaName"
                                                            valid={!errors.healthAreaName}
                                                            invalid={touched.healthAreaName && !!errors.healthAreaName || !!errors.healthAreaName}
                                                            type="text" name="healthAreaName"
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.healthArea.label.label_en}
                                                            id="healthAreaName" />
                                                        <FormFeedback className="red">{errors.healthAreaName}</FormFeedback>
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
                                                                checked={this.state.healthArea.active === true}
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
                                                                checked={this.state.healthArea.active === false}
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
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>

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

    cancelClicked() {
        this.props.history.push(`/healthArea/listHealthArea/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        // AuthenticationService.setupAxiosInterceptors();
        HealthAreaService.getHealthAreaById(this.props.match.params.healthAreaId).then(response => {
            this.setState({
                healthArea: response.data
            })

            initialValues = {
                healthAreaName: this.state.healthArea.label.label_en,
                realmId: this.state.healthArea.realm.id
            }

            UserService.getRealmList()
                .then(response => {
                    console.log("realm list---", response.data);
                    this.setState({
                        realms: response.data
                    })
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

            HealthAreaService.getRealmCountryList(this.state.healthArea.realm.id)
                .then(response => {
                    console.log("Realm Country List -------list---", response.data);
                    if (response.status == 200) {
                        var json = response.data;
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].realmCountryId, label: json[i].country.label.label_en }
                        }
                        this.setState({
                            realmCountryList: regList
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode
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

}
