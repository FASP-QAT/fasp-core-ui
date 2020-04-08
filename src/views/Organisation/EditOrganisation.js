import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { lang } from "moment";
import CountryService from "../../api/CountryService";
import OrganisationService from "../../api/OrganisationService";
import UserService from "../../api/UserService";
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService.js';

let initialValues = {
    realmId: '',
    organisationName: '',
    organisationCode: '',
}
const entityname = i18n.t('static.organisation.organisation');
const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        organisationName: Yup.string()
            .required(i18n.t('static.organisation.organisationtext')),
        organisationCode: Yup.string()
            .required(i18n.t('static.organisation.organisationcodetext'))
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


export default class EditOrganisationComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            countries: [],
            realms: [],
            organisation: this.props.location.state.organisation,
            message: '',
            lang: localStorage.getItem('lang'),
            realmCountryId: '',
            realmCountryList: []
        }
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);

        initialValues = {
            // label: this.props.location.state.healthArea.label.label_en,
            organisationName: getLabelText(this.state.organisation.label, lang),
            organisationCode: this.state.organisation.organisationCode,
            realmId: this.state.organisation.realm.realmId
        }
    }
    dataChange(event) {
        let { organisation } = this.state
        console.log(event.target.name);
        console.log(event.target.value);
        if (event.target.name === "organisationName") {
            organisation.label.label_en = event.target.value
        } else if (event.target.name === "organisationCode") {
            organisation.organisationCode = event.target.value
        } else if (event.target.name === "realmId") {
            organisation.realm.realmId = event.target.value
        } else if (event.target.name === "active") {
            organisation.active = event.target.id === "active2" ? false : true
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
            organisationCode: true
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
        console.log("check---", this.state.organisation);
        if (!AuthenticationService.checkTypeOfSession()) {
            alert("You can't change your session from online to offline or vice versa.");
            this.props.history.push(`/`)
        }
        AuthenticationService.setupAxiosInterceptors();

        UserService.getRealmList()
            .then(response => {
                console.log("realm list---", response.data);
                this.setState({
                    realms: response.data
                })
            }).catch(
                error => {
                    switch (error.message) {
                        case "Network Error":
                            this.setState({
                                message: error.message
                            })
                            break
                        default:
                            this.setState({
                                message: error.response.data.message
                            })
                            break
                    }
                }
            );

        OrganisationService.getRealmCountryList(this.props.location.state.organisation.realm.realmId)
            .then(response => {
                console.log("Realm Country List list---", response.data);
                if (response.status == 200) {
                    var json = response.data;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].realmCountryId, label: getLabelText(json[i].country.label, this.state.lang) }
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );

    }

    updateFieldData(value) {
        let { organisation } = this.state;
        this.setState({ realmCountryId: value });
        var realmCountryId = value;
        var realmCountryIdArray = [];
        for (var i = 0; i < realmCountryId.length; i++) {
            realmCountryIdArray[i] = realmCountryId[i].value;
        }
        organisation.realmCountryArray = realmCountryIdArray;
        this.setState({ organisation: organisation });
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


        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                            <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    // console.log("-------------------->" + this.state.healthArea);
                                    OrganisationService.editOrganisation(this.state.organisation)
                                        .then(response => {
                                            if (response.data.message != "Failed") {
                                                this.props.history.push(`/organisation/listOrganisation/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.message
                                                })
                                            }
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
                                                            message: error.response.data.message
                                                        })
                                                        break
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
                                            <Form onSubmit={handleSubmit} noValidate name='organisationForm'>
                                                <CardBody>

                                                    <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.organisation.realm')}</Label>
                                                        <Input
                                                            value={this.state.organisation.realm.realmId}
                                                            valid={!errors.realmId}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            disabled
                                                            type="select" name="realmId" id="realmId">
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        <FormFeedback>{errors.realmId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                    <Label htmlFor="realmCountryId">{i18n.t('static.organisation.realmcountry')}</Label>
                                                        <Select
                                                            valid={!errors.realmCountryId}
                                                            invalid={touched.realmCountryId && !!errors.realmCountryId}
                                                            onChange={(e) => { handleChange(e); this.updateFieldData(e) }}
                                                            onBlur={handleBlur} name="realmCountryId" id="realmCountryId"
                                                            multi
                                                            options={this.state.realmCountryList}
                                                            value={this.state.organisation.realmCountryArray}
                                                        />
                                                        <FormFeedback>{errors.realmCountryId}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                    <Label htmlFor="organisationCode">{i18n.t('static.organisation.organisationcode')} </Label>
                                                        <Input
                                                            type="text" name="organisationCode" valid={!errors.organisationCode}
                                                            invalid={touched.organisationCode && !!errors.organisationCode}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.organisation.organisationCode}
                                                            id="organisationCode" placeholder="organisation Code" />
                                                        <FormFeedback className="red">{errors.organisationCode}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                    <Label htmlFor="organisationName">{i18n.t('static.organisation.organisationname')} </Label>
                                                        <Input
                                                            type="text" name="organisationName" valid={!errors.organisationName}
                                                            invalid={touched.organisationName && !!errors.organisationName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.organisation.label.label_en}
                                                            id="organisationName" placeholder="Organisation Name" />
                                                        <FormFeedback className="red">{errors.organisationName}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label>{i18n.t('static.common.status')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.organisation.active === true}
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
                                                                checked={this.state.organisation.active === false}
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
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-check"></i>{i18n.t('static.common.cancel')}</Button>
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
        this.props.history.push(`/organisation/listOrganisation/` + i18n.t('static.message.cancelled', { entityname }))
    }

}
