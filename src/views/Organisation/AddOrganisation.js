import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, InputGroupAddon, InputGroupText, Input } from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import CountryService from "../../api/CountryService";
import OrganisationService from "../../api/OrganisationService";
import OrganisationTypeService from "../../api/OrganisationTypeService.js";
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import classNames from 'classnames';
import { SPECIAL_CHARECTER_WITH_NUM, ALPHABET_NUMBER_REGEX, SPACE_REGEX } from '../../Constants.js';

const entityname = i18n.t('static.organisation.organisation');

let initialValues = {
    realmId: '',
    realmCountryId: [],
    organisationCode: '',
    organisationName: '',
    organisationTypeId: '',
    organisationTypeList: []
}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        organisationName: Yup.string()
            // .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.organisation.organisationtext')),
        organisationCode: Yup.string()
            // .matches(ALPHABET_NUMBER_REGEX, i18n.t('static.message.alphabetnumerallowed'))
            // .matches(/^[a-zA-Z0-9_'\/-]*$/, i18n.t('static.common.alphabetNumericCharOnly'))
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.common.displayName'))
            .max(4, i18n.t('static.organisation.organisationcodemax4digittext')),
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
        organisationTypeId: Yup.string()
            .required(i18n.t('static.organisationType.organisationTypeValue'))
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

export default class AddOrganisationComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            countries: [],
            realms: [],
            organisation: {
                label: {
                    label_en: ''
                },
                realm: {
                    id: ""
                },
                realmCountryArray: [],
                organisationCode: '',
                organisationType: {
                    id: ''
                },
            },
            lang: localStorage.getItem('lang'),
            realmCountryId: '',
            realmCountryList: [],
            selCountries: [],
            organisationTypeList: [],
            organisationTypeId: '',
            message: '',
            loading: true,
        }


        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.getRealmCountryList = this.getRealmCountryList.bind(this);
        this.getOrganisationTypeByRealmId = this.getOrganisationTypeByRealmId.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.getDisplayName = this.getDisplayName.bind(this);

    }

    getDisplayName() {
        let realmId = document.getElementById("realmId").value;
        // let realmId = 1;
        let organisationValue = document.getElementById("organisationName").value;
        // let organisationValue = "USAID"
        organisationValue = organisationValue.replace(/[^A-Za-z0-9]/g, "");
        organisationValue = organisationValue.trim().toUpperCase();
        if (realmId != 0 && organisationValue.length != 0) {

            if (organisationValue.length >= 4) {//minus 2
                organisationValue = organisationValue.slice(0, 2);
                console.log("DISPLAYNAME-BEF----->", organisationValue);
                OrganisationService.getOrganisationDisplayName(realmId, organisationValue)
                    .then(response => {
                        console.log("DISPLAYNAME-RESP----->", response);
                        let { organisation } = this.state
                        organisation.organisationCode = response.data;
                        this.setState({
                            organisation
                        });

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

            } else {// not need to minus
                console.log("DISPLAYNAME-BEF-else----->", organisationValue);
                OrganisationService.getOrganisationDisplayName(realmId, organisationValue)
                    .then(response => {
                        console.log("DISPLAYNAME-RESP-else----->", response);
                        let { organisation } = this.state
                        organisation.organisationCode = response.data;
                        this.setState({
                            organisation
                        });

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

    }

    dataChange(event) {
        let { organisation } = this.state
        console.log(event.target.name);
        console.log(event.target.value);
        if (event.target.name === "organisationName") {
            organisation.label.label_en = event.target.value
        } else if (event.target.name === "organisationCode") {
            organisation.organisationCode = event.target.value.toUpperCase();
        } else if (event.target.name === "organisationTypeId") {
            organisation.organisationType.id = event.target.value
        } else if (event.target.name === "realmId") {
            organisation.realm.id = event.target.value
        }
        this.setState({
            organisation
        }, (
        ) => {
            console.log("state after update---", this.state.organisation)
        })
    }

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true,
            organisationName: true,
            organisationCode: true,
            realmCountryId: true,
            organisationTypeId: true
        }
        )
        this.validateForm(errors)
    }

    validateForm(errors) {
        this.findFirstError('organisationForm', (fieldName) => {
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
        console.log("IN componentDidMount------------------");
        // AuthenticationService.setupAxiosInterceptors();
        CountryService.getCountryListAll()
            .then(response => {
                console.log("country list---", response.data);
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    countries: listArray, loading: false,
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

        UserService.getRealmList()
            .then(response => {
                console.log("realm list---", response.data);
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    realms: listArray,
                    loading: false,
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

        let realmId = AuthenticationService.getRealmId();
        if (realmId != -1) {
            // document.getElementById('realmId').value = realmId;
            // initialValues = {
            //     realmId: realmId
            // }

            let { organisation } = this.state
            organisation.realm.id = realmId;
            document.getElementById("realmId").disabled = true;
            this.setState({
                organisation
            },
                () => {
                    this.getRealmCountryList();
                    this.getOrganisationTypeByRealmId();
                })
        }
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    updateFieldData(value) {

        var selectedArray = [];
        for (var p = 0; p < value.length; p++) {
            selectedArray.push(value[p].value);
        }

        if (selectedArray.includes("-1")) {
            this.setState({ realmCountryId: [] });
            var list = this.state.realmCountryList.filter(c => c.value != -1)
            this.setState({ realmCountryId: list });
            var realmCountryId = list;
        } else {
            this.setState({ realmCountryId: value });
            var realmCountryId = value;
        }

        let { organisation } = this.state;
        // this.setState({ realmCountryId: value });
        // var realmCountryId = value;
        var realmCountryIdArray = [];
        for (var i = 0; i < realmCountryId.length; i++) {
            realmCountryIdArray[i] = realmCountryId[i].value;
        }
        organisation.realmCountryArray = realmCountryIdArray;
        this.setState({ organisation: organisation });
    }

    getOrganisationTypeByRealmId() {

        if (this.state.organisation.realm.id != "") {
            OrganisationTypeService.getOrganisationTypeByRealmId(this.state.organisation.realm.id)
                .then(response => {
                    console.log("OrganisationType list------>", response.data);
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            organisationTypeId: '',
                            organisationTypeList: listArray.filter(c => c.active == true),
                            loading: false,
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
        } else {
            this.setState({
                organisationTypeId: '',
                organisationTypeList: [],
                loading: false,
            })
        }

    }

    getRealmCountryList(e) {
        // AuthenticationService.setupAxiosInterceptors();
        if (this.state.organisation.realm.id != "") {
            OrganisationService.getRealmCountryList(this.state.organisation.realm.id)
                .then(response => {
                    console.log("Realm Country List list---", response.data);
                    if (response.status == 200) {
                        var json = (response.data).filter(c => c.active == true);
                        var regList = [{ value: "-1", label: i18n.t("static.common.all") }];
                        for (var i = 0; i < json.length; i++) {
                            regList[i + 1] = { value: json[i].realmCountryId, label: json[i].country.label.label_en }
                        }
                        var listArray = regList;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            realmCountryId: '',
                            realmCountryList: listArray,
                            loading: false,
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
        } else {
            this.setState({
                realmCountryId: '',
                realmCountryList: [],
                loading: false,
            })
        }




    }

    Capitalize(str) {
        this.state.organisation.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    render() {
        const { selCountries } = this.state;
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

        let countryList = selCountries.length > 0
            && selCountries.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {item.country.label.label_en}
                    </option>
                )
            }, this);

        const { organisationTypeList } = this.state;
        let organisationTypes = organisationTypeList.length > 0
            && organisationTypeList.map((item, i) => {
                return (
                    <option key={i} value={item.organisationTypeId}>{item.label.label_en}</option>
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
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                // initialValues={initialValues}
                                enableReinitialize={true}
                                initialValues={{
                                    organisationName: this.state.organisation.label.label_en,
                                    organisationCode: this.state.organisation.organisationCode,
                                    realmId: this.state.organisation.realm.id,
                                    realmCountryId: this.state.realmCountryId,
                                    organisationTypeId: this.state.organisation.organisationType.id,
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {

                                    console.log("ORGANISATION-------------------->1" + JSON.stringify(this.state.organisation));
                                    if (this.state.organisation.organisationCode != '') {
                                        this.setState({
                                            loading: true
                                        })
                                        OrganisationService.addOrganisation(this.state.organisation)
                                            .then(response => {
                                                if (response.status == 200) {
                                                    this.props.history.push(`/organisation/listOrganisation/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        setTouched,
                                        handleReset,
                                        setFieldValue,
                                        setFieldTouched
                                    }) => (
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='organisationForm' autocomplete="off">
                                                <CardBody style={{ display: this.state.loading ? "none" : "block" }}>

                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.organisation.realm')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            value={this.state.organisation.realm.id}
                                                            valid={!errors.realmId && this.state.organisation.realm.id != ''}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.getRealmCountryList(e); this.getOrganisationTypeByRealmId(); }}
                                                            onBlur={handleBlur}
                                                            type="select" name="realmId" id="realmId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback>{errors.realmId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup className="Selectcontrol-bdrNone">
                                                        <Label htmlFor="realmCountryId">{i18n.t('static.organisation.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                                        <Select
                                                            bsSize="sm"
                                                            className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                                { 'is-valid': !errors.realmCountryId && this.state.organisation.realmCountryArray.length != 0 },
                                                                { 'is-invalid': (touched.realmCountryId && !!errors.realmCountryId) }
                                                            )}
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
                                                            value={this.state.realmCountryId}
                                                        // value={this.state.organisation.realmCountryArray}
                                                        />
                                                        <FormFeedback>{errors.realmCountryId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="organisationTypeId">{i18n.t('static.organisationType.organisationType')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="organisationTypeId"
                                                            id="organisationTypeId"
                                                            bsSize="sm"
                                                            valid={!errors.organisationTypeId && this.state.organisation.organisationType.id != ''}
                                                            invalid={touched.organisationTypeId && !!errors.organisationTypeId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.organisation.organisationType.id}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {organisationTypes}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.organisationTypeId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="organisationName">{i18n.t('static.organisation.organisationname')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            type="text" name="organisationName" valid={!errors.organisationName && this.state.organisation.label.label_en != ''}
                                                            invalid={touched.organisationName && !!errors.organisationName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={(e) => { handleBlur(e); this.getDisplayName() }}
                                                            value={this.state.organisation.label.label_en}
                                                            id="organisationName" />
                                                        <FormFeedback className="red">{errors.organisationName}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="organisationCode">{i18n.t('static.organisation.organisationcode')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            type="text" name="organisationCode" valid={!errors.organisationCode && this.state.organisation.organisationCode != ''}
                                                            invalid={touched.organisationCode && !!errors.organisationCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.organisation.organisationCode}
                                                            id="organisationCode" />
                                                        <FormFeedback className="red">{errors.organisationCode}</FormFeedback>
                                                    </FormGroup>



                                                </CardBody>
                                                <div style={{ display: this.state.loading ? "block" : "none" }}>
                                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                        <div class="align-items-center">
                                                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                                            <div class="spinner-border blue ml-4" role="status">

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        {/* <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button> */}
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

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
        this.props.history.push(`/organisation/listOrganisation/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked() {
        let { organisation } = this.state

        organisation.label.label_en = ''
        organisation.organisationCode = ''
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            organisation.realm.id = ''
        }
        organisation.organisationType.id = ''
        this.state.realmCountryId = ''
        organisation.realmCountryArray = []

        this.setState({
            organisation
        }, (
        ) => {
        })
    }

}
