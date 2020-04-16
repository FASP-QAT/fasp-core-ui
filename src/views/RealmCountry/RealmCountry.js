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
const initialValues = {
    country: [],
    currency: [],
    unit: []

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
            shippedToArrivedAirLeadTime: '0',
            shippedToArrivedSeaLeadTime: '0',
            arrivedToDeliveredLeadTime: '0',
            rows: [],
            realm: {
                label: {
                    label_en: ''
                }
            }
        }
        this.currentDate = this.currentDate.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.deleteLastRow = this.deleteLastRow.bind(this);
        this.handleDisableSpecificRow = this.handleDisableSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.handleEnableSpecificRow = this.handleEnableSpecificRow.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
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
            unit: true

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
        if (event.target.name === "shippedToArrivedAirLeadTime") {
            this.state.shippedToArrivedAirLeadTime = event.target.value;
        }
        if (event.target.name === "shippedToArrivedSeaLeadTime") {
            this.state.shippedToArrivedSeaLeadTime = event.target.value;
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
    handleDisableSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows[idx].active = false

        // rows.splice(idx, 1);
        this.setState({ rows })
    }
    handleEnableSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows[idx].active = true

        // rows.splice(idx, 1);
        this.setState({ rows })
    }

    submitForm() {
        console.log(JSON.stringify(this.state.rows))
        var realmCountry = this.state.rows


        AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.addRealmCountry(realmCountry)
            .then(response => {
                if (response.status == 200) {
                    this.props.history.push(`/realm/realmlist/` + i18n.t(response.data.messageCode))

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
        RealmService.getRealmById(this.props.match.params.realmId).then(response => {
            console.log(response.data);
            this.setState({
                realm: response.data,
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
        RealmCountryService.getRealmCountryrealmIdById(this.props.match.params.realmId).then(response => {
            console.log(response.data);
            this.setState({
                realmCountry: response.data,
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
        CountryService.getCountryListAll()
            .then(response => {
                console.log(response.data)
                this.setState({
                    countries: response.data
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
        CurrencyService.getCurrencyListActive().then(response => {
            if (response.status == 200) {
                this.setState({
                    currencies: response.data
                })
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
            <h5>{i18n.t(this.state.message)}</h5>
            <Row>
                <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                    <Card>
                        <CardHeader>
                            <strong>{i18n.t('static.dashboard.realmcountry')}</strong>
                        </CardHeader>
                        <CardBody>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    if (this.state.country.countryId != "" && this.state.defaultCurrency.currencyId != "" && this.state.palletUnit.unitId != "" ) {
                                        var json =
                                        {
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
                                            shippedToArrivedAirLeadTime: this.state.shippedToArrivedAirLeadTime,
                                            shippedToArrivedSeaLeadTime: this.state.shippedToArrivedSeaLeadTime,
                                            arrivedToDeliveredLeadTime: this.state.arrivedToDeliveredLeadTime,
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
                                            <Label htmlFor="select">{i18n.t('static.realm.realm')}</Label>
                                            <Input
                                                type="text"
                                                name="realmId"
                                                id="progrealmIdramId"
                                                bsSize="sm"
                                                readOnly
                                                valid={!errors.realmId}
                                                invalid={touched.realmId && !!errors.realmId}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                onBlur={handleBlur}

                                                value={getLabelText(this.state.realm.label, this.state.lang)}
                                            >
                                            </Input>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="select">{i18n.t('static.dashboard.country')}</Label>
                                            <Input type="select" name="countryId" id="countryId" bsSize="sm"
                                                valid={!errors.countryId}
                                                invalid={touched.countryId && !!errors.countryId}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }} required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {countryList}
                                            </Input> <FormFeedback className="red">{errors.countryId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="select">{i18n.t('static.dashboard.currency')}</Label>
                                            <Input type="select" name="currencyId" id="currencyId" bsSize="sm"
                                                valid={!errors.currencyId}
                                                invalid={touched.currencyId && !!errors.currencyId}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }} required>
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {currencyList}
                                            </Input> <FormFeedback className="red">{errors.currencyId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
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
                                                >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {unitList}
                                            </Input>
                                            <FormFeedback className="red">{errors.unitId}</FormFeedback>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label for="airFreightPercentage">{i18n.t('static.realmcountry.airFreightPercentage')}</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                name="airFreightPercentage"
                                                id="airFreightPercentage"
                                                bsSize="sm"
                                                valid={!errors.airFreightPercentage}
                                                invalid={touched.airFreightPercentage && !!errors.airFreightPercentage}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                type="number"
                                                value={this.state.airFreightPercentage}
                                                placeholder={i18n.t('static.realmcountry.airFreightPercentagetext')}
                                                 />
                                            <FormFeedback className="red">{errors.airFreightPercentage}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="seaFreightPercentage">{i18n.t('static.realmcountry.seaFreightPercentage')}</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                name="seaFreightPercentage"
                                                id="seaFreightPercentage"
                                                bsSize="sm"
                                                valid={!errors.seaFreightPercentage}
                                                invalid={touched.seaFreightPercentage && !!errors.seaFreightPercentage}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                type="number"
                                                value={this.state.seaFreightPercentage}
                                                placeholder={i18n.t('static.realmcountry.seaFreightPercentagetext')}
                                                 />
                                            <FormFeedback className="red">{errors.seaFreightPercentage}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="shippedToArrivedAirLeadTime">{i18n.t('static.realmcountry.shippedToArrivedAirLeadTime')}</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                name="shippedToArrivedAirLeadTime"
                                                id="shippedToArrivedAirLeadTime"
                                                bsSize="sm"
                                                valid={!errors.shippedToArrivedAirLeadTime}
                                                invalid={touched.shippedToArrivedAirLeadTime && !!errors.shippedToArrivedAirLeadTime}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                type="number"
                                                value={this.state.shippedToArrivedAirLeadTime}
                                                placeholder={i18n.t('static.realmcountry.shippedToArrivedAirLeadTimetext')}
                                                 />
                                            <FormFeedback className="red">{errors.shippedToArrivedAirLeadTime}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="shippedToArrivedSeaLeadTime">{i18n.t('static.realmcountry.shippedToArrivedSeaLeadTime')}</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                name="shippedToArrivedSeaLeadTime"
                                                id="shippedToArrivedSeaLeadTime"
                                                bsSize="sm"
                                                valid={!errors.shippedToArrivedSeaLeadTime}
                                                invalid={touched.shippedToArrivedSeaLeadTime && !!errors.shippedToArrivedSeaLeadTime}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                type="number"
                                                value={this.state.shippedToArrivedSeaLeadTime}
                                                placeholder={i18n.t('static.realmcountry.shippedToArrivedSeaLeadTimetext')}
                                                 />
                                            <FormFeedback className="red">{errors.shippedToArrivedSeaLeadTime}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="arrivedToDeliveredLeadTime">{i18n.t('static.realmcountry.arrivedToDeliveredLeadTime')}</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                name="arrivedToDeliveredLeadTime"
                                                id="arrivedToDeliveredLeadTime"
                                                bsSize="sm"
                                                valid={!errors.arrivedToDeliveredLeadTime}
                                                invalid={touched.arrivedToDeliveredLeadTime && !!errors.arrivedToDeliveredLeadTime}
                                                onBlur={handleBlur}
                                                onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
                                                type="number"
                                                value={this.state.arrivedToDeliveredLeadTime}
                                                placeholder={i18n.t('static.realmcountry.arrivedToDeliveredLeadTimetext')}
                                                 />
                                            <FormFeedback className="red">{errors.arrivedToDeliveredLeadTime}</FormFeedback>
                                        </FormGroup>

                                        <FormGroup>
                                            {/* <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> {i18n.t('static.common.rmlastrow')}</Button>*/}
                                            <Button type="submit" size="sm" color="success" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
                                            &nbsp;

                </FormGroup></Form>)} />
                            <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

                                <thead>
                                    <tr>
                                        <th className="text-center"> {i18n.t('static.dashboard.country')} </th>
                                        <th className="text-center"> {i18n.t('static.dashboard.currency')}</th>
                                        <th className="text-center"> {i18n.t('static.dashboard.unit')} </th>
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
                                        this.state.rows.length > 0  &&  this.state.rows.map((item, idx) =>(
                                            <tr id="addr0" key={idx}>
                                                <td>
                                                    {this.state.rows[idx].country.label.label_en}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].defaultCurrency.label.label_en}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].palletUnit.label.label_en}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].airFreightPercentage}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].seaFreightPercentage}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].shippedToArrivedAirLeadTime}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].shippedToArrivedSeaLeadTime}
                                                </td> <td>
                                                    {this.state.rows[idx].arrivedToDeliveredLeadTime}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')}
                                                </td>
                                                <td>
                                                    {this.state.rows[idx].active == true && <Button type="button" size="sm" color="danger" onClick={() => { this.handleDisableSpecificRow(idx) }} ><i className="fa fa-times"></i>Disable</Button>}
                                                    {this.state.rows[idx].active == false && <Button type="button" size="sm" color="success" onClick={() => { this.handleEnableSpecificRow(idx) }}><i className="fa fa-check"></i>Activate</Button>}
                                                </td>
                                            </tr>))

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
        this.props.history.push(`/realm/listRealm/` + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default RealmCountry

