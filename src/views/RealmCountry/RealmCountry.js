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
import CountryService from "../../api/CountryService";
import AuthenticationService from "../Common/AuthenticationService";
import RealmService from "../../api/RealmService";
import RealmCountryService from "../../api/RealmCountryService";
import CurrencyService from "../../api/CurrencyService";
import UnitService from "../../api/UnitService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
let initialValues = {
    palletUnit: {
        unitId: '',
        label: {
            label_en: ''
        }
    },
    defaultCurrency: {
        currencyId: '',
        label: {
            label_en: ''
        }
    },
    country: {
        countryId: '',
        label: {
            label_en: ''
        }
    }, countryName: '',
    airFreightPercentage: '0.0',
    seaFreightPercentage: '0.0',
    shippedToArrivedByAirLeadTime: '0',
    shippedToArrivedBySeaLeadTime: '0',
    arrivedToDeliveredLeadTime: '0',


}
const entityname = i18n.t('static.dashboard.realmcountry')
const validationSchema = function (values, t) {
    return Yup.object().shape({
        countryId: Yup.string()
            .required(i18n.t('static.region.validcountry')),
        currencyId: Yup.number()
            .required(i18n.t('static.country.currencytext')),
        unitId: Yup.string()
            .required(i18n.t('static.common.realmtext'))
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

class RealmCountry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            countries: [],
            currencies: [],
            units: [],
            palletUnit: {
                unitId: '',
                label: {
                    label_en: ''
                }
            },
            defaultCurrency: {
                currencyId: '',
                label: {
                    label_en: ''
                }
            },
            country: {
                countryId: '',
                label: {
                    label_en: ''
                }
            }, countryName: '',
            airFreightPercentage: '0.0',
            seaFreightPercentage: '0.0',
            shippedToArrivedByAirLeadTime: '0',
            shippedToArrivedBySeaLeadTime: '0',
            arrivedToDeliveredLeadTime: '0',
            rows: [],
            realm: {
                label: {
                    label_en: ''
                }
            }, isNew: true,
            updateRowStatus: 0
        }
        this.currentDate = this.currentDate.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.deleteLastRow = this.deleteLastRow.bind(this);
        this.disableRow = this.disableRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.enableRow = this.enableRow.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this)
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
            console.log(JSON.stringify(this.state.rows[idx]))
            initialValues = {
                realmId: this.state.rows[idx].realmId,
                countryId: this.state.rows[idx].country.countryId,
                country: {
                    countryId: this.state.rows[idx].country.countryId,
                    label: {
                        label_en: this.state.rows[idx].country.label.label_en
                    }
                }, defaultCurrency: {
                    currencyId: this.state.rows[idx].defaultCurrency.currencyId,
                    label: {
                        label_en: this.state.rows[idx].defaultCurrency.label.label_en
                    }
                }, currencyId: this.state.rows[idx].defaultCurrency.currencyId, palletUnit: {
                     unitId: this.state.rows[idx].palletUnit.unitId,
                    label: {
                        label_en: this.state.rows[idx].palletUnit.label.label_en
                    }
                }, unitId: this.state.rows[idx].palletUnit.unitId,
                airFreightPercentage: this.state.rows[idx].airFreightPercentage,
                seaFreightPercentage: this.state.rows[idx].seaFreightPercentage,
                shippedToArrivedByAirLeadTime: this.state.rows[idx].shippedToArrivedByAirLeadTime,
                shippedToArrivedBySeaLeadTime: this.state.rows[idx].shippedToArrivedBySeaLeadTime,
                arrivedToDeliveredLeadTime: this.state.rows[idx].arrivedToDeliveredLeadTime

            }
            const rows = [...this.state.rows]
            this.setState({
                realmId: this.state.rows[idx].realmId,
                countryId: this.state.rows[idx].country.countryId,
                country: {
                    countryId: this.state.rows[idx].country.countryId,
                    label: {
                        label_en: this.state.rows[idx].country.label.label_en
                    }
                }, defaultCurrency: {
                    currencyId: this.state.rows[idx].defaultCurrency.currencyId,
                    label: {
                        label_en: this.state.rows[idx].defaultCurrency.label.label_en
                    }
                }, currencyId: this.state.rows[idx].defaultCurrency.currencyId, palletUnit: {
                    unitId: this.state.rows[idx].palletUnit.unitId,
                    label: {
                        label_en: this.state.rows[idx].palletUnit.label.label_en
                    }
                },
                 unitId: this.state.rows[idx].palletUnit.unitId,
                airFreightPercentage: this.state.rows[idx].airFreightPercentage,
                seaFreightPercentage: this.state.rows[idx].seaFreightPercentage,
                shippedToArrivedByAirLeadTime: this.state.rows[idx].shippedToArrivedByAirLeadTime,
                shippedToArrivedBySeaLeadTime: this.state.rows[idx].shippedToArrivedBySeaLeadTime,
                arrivedToDeliveredLeadTime: this.state.rows[idx].arrivedToDeliveredLeadTime,
                isNew: false,
                updateRowStatus: 1
            }
            );

            rows.splice(idx, 1);
            this.setState({ rows });
        }
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
            country: true,
            currency: true,
            // unit: true

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
        if (event.target.name === "countryId") {
            this.state.country.countryId = event.target.value;
            this.state.country.label.label_en = event.target[event.target.selectedIndex].text;
        }
        if (event.target.name === "currencyId") {
            this.state.defaultCurrency.currencyId = event.target.value;
            this.state.defaultCurrency.label.label_en = event.target[event.target.selectedIndex].text;
        }
        if (event.target.name === "unitId") {
            this.state.palletUnit.unitId = event.target.value;
            this.state.palletUnit.label.label_en = event.target[event.target.selectedIndex].text;
        }
        if (event.target.name === "airFreightPercentage") {
            this.state.airFreightPercentage = event.target.value;
        }
        if (event.target.name === "seaFreightPercentage") {
            this.state.seaFreightPercentage = event.target.value;
        }
        if (event.target.name === "shippedToArrivedByAirLeadTime") {
            this.state.shippedToArrivedByAirLeadTime = event.target.value;
        }
        if (event.target.name === "shippedToArrivedBySeaLeadTime") {
            this.state.shippedToArrivedBySeaLeadTime = event.target.value;
        }
        if (event.target.name === "arrivedToDeliveredLeadTime") {
            this.state.arrivedToDeliveredLeadTime = event.target.value;
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
        var realmCountry = this.state.rows


        AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.addRealmCountry(realmCountry)
            .then(response => {
                if (response.status == 200) {
                    this.props.history.push(`/realm/realmlist/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))

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
        RealmService.getRealmById(this.props.match.params.realmId).then(response => {
            if (response.status == 200) {
                console.log(response.data);
                this.setState({
                    realm: response.data,
                    //  rows:response.data
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
        RealmCountryService.getRealmCountryrealmIdById(this.props.match.params.realmId).then(response => {
            if (response.status == 200) {
                console.log("getRealmCountryrealmIdById---", response.data);
            this.setState({
                realmCountry: response.data,
                rows: response.data
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
        CountryService.getCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    console.log(response.data)
                    this.setState({
                        countries: response.data
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
                                this.setState({ message: error.response.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );
        CurrencyService.getCurrencyListActive().then(response => {
            if (response.status == 200) {
                this.setState({
                    currencies: response.data
                })
            } else {
                this.setState({
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                });
        UnitService.getUnitListAll()
            .then(response => {
                this.setState({
                    units: response.data
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
    render() {
        const { countries } = this.state;
        let countryList = countries.length > 0 && countries.map((item, i) => {
            return (
                <option key={i} value={item.countryId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        const { currencies } = this.state;
        let currencyList = currencies.length > 0 && currencies.map((item, i) => {
            return (
                <option key={i} value={item.currencyId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>
            )
        }, this);
        const { units } = this.state;
        let unitList = units.length > 0
            && units.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
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
                            <strong>{i18n.t('static.dashboard.realmcountry')}</strong>
                        </CardHeader>
                        <CardBody>
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors, resetForm }) => {
                                    if (this.state.country.countryId != "" && this.state.defaultCurrency.currencyId != "") {
                                        var json =
                                        {
                                            realmCountryId: this.state.realmCountryId,
                                            realm: {
                                                realmId: this.props.match.params.realmId
                                            }
                                            ,
                                            country: {
                                                countryId: this.state.country.countryId,
                                                label: {
                                                    label_en: this.state.country.label.label_en
                                                }
                                            }
                                            , defaultCurrency: {
                                                currencyId: this.state.defaultCurrency.currencyId,
                                                label: {
                                                    label_en: this.state.defaultCurrency.label.label_en
                                                }
                                            }
                                            , palletUnit: {
                                                unitId: this.state.palletUnit.unitId,
                                                label: {
                                                    label_en: this.state.palletUnit.label.label_en
                                                }
                                            }
                                            ,
                                            airFreightPercentage: this.state.airFreightPercentage,
                                            seaFreightPercentage: this.state.seaFreightPercentage,
                                            shippedToArrivedByAirLeadTime: this.state.shippedToArrivedByAirLeadTime,
                                            shippedToArrivedBySeaLeadTime: this.state.shippedToArrivedBySeaLeadTime,
                                            arrivedToDeliveredLeadTime: this.state.arrivedToDeliveredLeadTime,
                                            isNew: this.state.isNew,
                                            active: true

                                        }
                                        this.state.rows.push(json)
                                        this.setState({ rows: this.state.rows })
                                        this.setState({
                                            realmCountryId: this.state.realmCountryId,

                                            country: {
                                                countryId: '',
                                                label: {
                                                    label_en: ''
                                                }
                                            }
                                            , defaultCurrency: {
                                                currencyId: '',
                                                label: {
                                                    label_en: ''
                                                }
                                            }
                                            , palletUnit: {
                                                unitId: '',
                                                label: {
                                                    label_en:''
                                                }
                                            }
                                            ,
                                            airFreightPercentage: '0.0',
                                            seaFreightPercentage: '0.0',
                                            shippedToArrivedByAirLeadTime: '0',
                                            shippedToArrivedBySeaLeadTime: '0',
                                            arrivedToDeliveredLeadTime: '0',
                                            active: true
                                        })
                                    }
                                    resetForm({
                                        realmCountryId: this.state.realmCountryId,
                                        realm: {
                                            realmId: this.props.match.params.realmId
                                        }
                                        ,
                                        country: {
                                            countryId: '',
                                            label: {
                                                label_en: ''
                                            }
                                        }
                                        , defaultCurrency: {
                                            currencyId: '',
                                            label: {
                                                label_en: ''
                                            }
                                        }
                                        , palletUnit: {
                                            unitId: '',
                                            label: {
                                                label_en:''
                                            }
                                        }
                                        ,
                                        airFreightPercentage: '0.0',
                                        seaFreightPercentage: '0.0',
                                        shippedToArrivedByAirLeadTime: '0',
                                        shippedToArrivedBySeaLeadTime: '0',
                                        arrivedToDeliveredLeadTime: '0',
                                        active: true
                                    })
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
                                        <Row>
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="select">{i18n.t('static.realm.realm')}</Label>
                                                <Input
                                                    type="text"
                                                    name="realmId"
                                                    id="progrealmIdramId"
                                                    bsSize="sm"
                                                    readOnly
                                                    valid={!errors.realmId && this.state.realm.label != ''}
                                                    invalid={touched.realmId && !!errors.realmId}
                                                    onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                    onBlur={handleBlur}

                                                    value={getLabelText(this.state.realm.label, this.state.lang)}
                                                >
                                                </Input>
                                            </FormGroup>
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="select">{i18n.t('static.dashboard.country')}<span class="red Reqasterisk">*</span></Label>
                                                <Input type="select" name="countryId" id="countryId" bsSize="sm"
                                                    valid={!errors.countryId && this.state.country.countryId != ''}
                                                    invalid={touched.countryId && !!errors.countryId}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                    value={this.state.country.countryId} required>
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {countryList}
                                                </Input> <FormFeedback className="red">{errors.countryId}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup className="col-md-6">
                                                <Label htmlFor="select">{i18n.t('static.dashboard.currency')}<span class="red Reqasterisk">*</span></Label>
                                                <Input type="select" name="currencyId" id="currencyId" bsSize="sm"
                                                    valid={!errors.currencyId && this.state.defaultCurrency.currencyId != ''}
                                                    invalid={touched.currencyId && !!errors.currencyId}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                    value={this.state.defaultCurrency.currencyId} required>
                                                    <option value="">{i18n.t('static.common.select')}</option>
                                                    {currencyList}
                                                </Input> <FormFeedback className="red">{errors.currencyId}</FormFeedback>
                                            </FormGroup>
                                             <FormGroup className="col-md-6">
                                            <Label htmlFor="unitId">{i18n.t('static.unit.unit')}</Label>
                                            <Input
                                                type="select"
                                                name="unitId"
                                                id="unitId"
                                                bsSize="sm"
                                                valid={!errors.unitId}
                                                invalid={touched.unitId && !!errors.unitId}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                onBlur={handleBlur}
                                                value={this.state.palletUnit.unitId}
                                                >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {unitList}
                                            </Input>
                                            <FormFeedback className="red">{errors.unitId}</FormFeedback>
                                        </FormGroup> 

                                            <FormGroup className="col-md-6">
                                                <Label for="airFreightPercentage">{i18n.t('static.realmcountry.airFreightPercentage')}</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    name="airFreightPercentage"
                                                    id="airFreightPercentage"
                                                    bsSize="sm"
                                                    valid={!errors.airFreightPercentage && this.state.airFreightPercentage != '0.0' && this.state.airFreightPercentage != ''}
                                                    invalid={touched.airFreightPercentage && !!errors.airFreightPercentage}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                    type="number"
                                                    value={this.state.airFreightPercentage}
                                                    placeholder={i18n.t('static.realmcountry.airFreightPercentagetext')}
                                                />
                                                <FormFeedback className="red">{errors.airFreightPercentage}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup className="col-md-6">
                                                <Label for="seaFreightPercentage">{i18n.t('static.realmcountry.seaFreightPercentage')}</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    name="seaFreightPercentage"
                                                    id="seaFreightPercentage"
                                                    bsSize="sm"
                                                    valid={!errors.seaFreightPercentage && this.state.seaFreightPercentage != '0.0' && this.state.seaFreightPercentage != ''}
                                                    invalid={touched.seaFreightPercentage && !!errors.seaFreightPercentage}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                    type="number"
                                                    value={this.state.seaFreightPercentage}
                                                    placeholder={i18n.t('static.realmcountry.seaFreightPercentagetext')}
                                                />
                                                <FormFeedback className="red">{errors.seaFreightPercentage}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup className="col-md-6">
                                                <Label for="shippedToArrivedByAirLeadTime">{i18n.t('static.realmcountry.shippedToArrivedAirLeadTime')}</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    name="shippedToArrivedByAirLeadTime"
                                                    id="shippedToArrivedByAirLeadTime"
                                                    bsSize="sm"
                                                    valid={!errors.shippedToArrivedByAirLeadTime && this.state.shippedToArrivedByAirLeadTime != '0' && this.state.shippedToArrivedByAirLeadTime != ''}
                                                    invalid={touched.shippedToArrivedByAirLeadTime && !!errors.shippedToArrivedByAirLeadTime}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                    type="number"
                                                    value={this.state.shippedToArrivedByAirLeadTime}
                                                    placeholder={i18n.t('static.realmcountry.shippedToArrivedAirLeadTimetext')}
                                                />
                                                <FormFeedback className="red">{errors.shippedToArrivedByAirLeadTime}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup className="col-md-6">
                                                <Label for="shippedToArrivedBySeaLeadTime">{i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime')}</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    name="shippedToArrivedBySeaLeadTime"
                                                    id="shippedToArrivedBySeaLeadTime"
                                                    bsSize="sm"
                                                    valid={!errors.shippedToArrivedBySeaLeadTime && this.state.shippedToArrivedBySeaLeadTime != '0' && this.state.shippedToArrivedBySeaLeadTime != ''}
                                                    invalid={touched.shippedToArrivedBySeaLeadTime && !!errors.shippedToArrivedBySeaLeadTime}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                    type="number"
                                                    value={this.state.shippedToArrivedBySeaLeadTime}
                                                    placeholder={i18n.t('static.realmcountry.shippedToArrivedSeaLeadTimetext')}
                                                />
                                                <FormFeedback className="red">{errors.shippedToArrivedBySeaLeadTime}</FormFeedback>
                                            </FormGroup>
                                            <FormGroup className="col-md-6">
                                                <Label for="arrivedToDeliveredLeadTime">{i18n.t('static.realmcountry.arrivedToDeliveredLeadTime')}</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    name="arrivedToDeliveredLeadTime"
                                                    id="arrivedToDeliveredLeadTime"
                                                    bsSize="sm"
                                                    valid={!errors.arrivedToDeliveredLeadTime && this.state.arrivedToDeliveredLeadTime != '0' && this.state.arrivedToDeliveredLeadTime != ''}
                                                    invalid={touched.arrivedToDeliveredLeadTime && !!errors.arrivedToDeliveredLeadTime}
                                                    onBlur={handleBlur}
                                                    onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                    type="number"
                                                    value={this.state.arrivedToDeliveredLeadTime}
                                                    placeholder={i18n.t('static.realmcountry.arrivedToDeliveredLeadTimetext')}
                                                />
                                                <FormFeedback className="red">{errors.arrivedToDeliveredLeadTime}</FormFeedback>
                                            </FormGroup>

                                            <FormGroup className="col-md-12 ">
                                                {/* <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> {i18n.t('static.common.rmlastrow')}</Button>*/}
                                                <Button type="submit" size="sm" color="success" onClick={() => this.touchAll(setTouched, errors)} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                                &nbsp;
                                        </FormGroup>
                                        </Row></Form>)} />
                            <h5 className="red">{this.state.rowErrorMessage}</h5>
                            <Table responsive className="table-striped table-hover table-bordered text-center">

                                <thead>
                                    <tr>
                                        <th className="text-left"> {i18n.t('static.dashboard.country')} </th>
                                        <th className="text-center"> {i18n.t('static.dashboard.currency')}</th>
                                        {/* <th className="text-center"> {i18n.t('static.dashboard.unit')} </th> */}
                                        <th className="text-center">{i18n.t('static.realmcountry.airFreightPercentage')}</th>
                                        <th className="text-center">{i18n.t('static.realmcountry.seaFreightPercentage')}</th>
                                        <th className="text-center">{i18n.t('static.realmcountry.shippedToArrivedAirLeadTime')}</th>
                                        <th className="text-center">{i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime')}</th>
                                        <th className="text-center">{i18n.t('static.realmcountry.arrivedToDeliveredLeadTime')}</th>
                                        <th className="text-center">{i18n.t('static.common.status')}</th>
                                        <th className="text-center">{i18n.t('static.common.action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.rows.length > 0
                                        &&
                                        this.state.rows.map((item, idx) =>

                                            <tr id="addr0" key={idx}>
                                                <td className="text-left">
                                                    {this.state.rows[idx].country.label.label_en}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].defaultCurrency.label.label_en}
                                                </td>
                                                 <td>
                                                    {this.state.rows[idx].palletUnit.label.label_en}
                                                </td> 
                                                <td className="text-right">
                                                    {this.state.rows[idx].airFreightPercentage}
                                                </td>
                                                <td className="text-right">
                                                    {this.state.rows[idx].seaFreightPercentage}
                                                </td>
                                                <td  className="text-right">
                                                    {this.state.rows[idx].shippedToArrivedByAirLeadTime}
                                                </td>
                                                <td  className="text-right">
                                                    {this.state.rows[idx].shippedToArrivedBySeaLeadTime}
                                                </td> <td className="text-right">
                                                    {this.state.rows[idx].arrivedToDeliveredLeadTime}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')}
                                                </td>
                                                <td>
                                                    {/* <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} /> */}
                                                    <div className="forInlinebtnMapping">
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
        this.props.history.push(`/realm/realmlist/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default RealmCountry

