import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, FormText, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants';
import RegionService from "../../api/RegionService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Capitalize } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.region.region');
/**
 * Defines the validation schema for region details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        region: Yup.string()
            .required(i18n.t('static.region.validregion'))
    })
}
/**
 * Component for editing region details.
 */
class EditRegionComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            region: {
                realmCountry: {
                    country: {
                        countryCode: '',
                        label: {
                            label_en: '',
                            label_fr: '',
                            label_sp: '',
                            label_pr: ''
                        }
                    },
                },
                label: {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: ''
                },
            },
            message: '',
            lang: localStorage.getItem('lang')
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { region } = this.state;
        if (event.target.name == "region") {
            region.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            region.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            region
        },
            () => { });
    };
    /**
     * Fetches region details on component mount.
     */
    componentDidMount() {
        RegionService.getRegionById(this.props.match.params.regionId).then(response => {
            this.setState({
                region: response.data
            });
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
                            break;
                        case 409:
                            this.setState({
                                message: i18n.t('static.common.accessDenied'),
                                loading: false,
                                color: "#BA0C2F",
                            });
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
    /**
     * Renders the region details form.
     * @returns {JSX.Element} - Region details form.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', entityname)}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ region: getLabelText(this.state.region.label, this.state.lang) }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    RegionService.updateRegion(this.state.region)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/region/listRegion/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }
                                        }).catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({
                                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                                        loading: false
                                                    });
                                                } else {
                                                    switch (error.response ? error.response.status : "") {
                                                        case 401:
                                                            this.props.history.push(`/login/static.message.sessionExpired`)
                                                            break;
                                                        case 409:
                                                            this.setState({
                                                                message: i18n.t('static.common.accessDenied'),
                                                                loading: false,
                                                                color: "#BA0C2F",
                                                            });
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
                                        setTouched
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='regionForm'>
                                            <CardBody>
                                                <FormGroup>
                                                    <Label htmlFor="realmCountryId">{i18n.t('static.region.country')}</Label>
                                                    <Input
                                                        type="text"
                                                        name="realmCountryId"
                                                        id="realmCountryId"
                                                        bsSize="sm"
                                                        readOnly
                                                        value={getLabelText(this.state.region.realmCountry.country.label, this.state.lang)}
                                                    >
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="region">{i18n.t('static.region.region')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="region"
                                                        id="region"
                                                        bsSize="sm"
                                                        valid={!errors.region}
                                                        invalid={touched.region && !!errors.region}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={getLabelText(this.state.region.label, this.state.lang)}
                                                        required />
                                                    <FormText className="red">{errors.region}</FormText>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label className="P-absltRadio">{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active1"
                                                            name="active"
                                                            value={true}
                                                            checked={this.state.region.active === true}
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
                                                            checked={this.state.region.active === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.dataentry.inactive')}
                                                        </Label>
                                                    </FormGroup>
                                                </FormGroup>
                                            </CardBody>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-times"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
    /**
     * Redirects to the list region screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/region/listRegion/` + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the region details when reset button is clicked.
     */
    resetClicked() {
        RegionService.getRegionById(this.props.match.params.regionId).then(response => {
            this.setState({
                region: response.data
            });
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
                            break;
                        case 409:
                            this.setState({
                                message: i18n.t('static.common.accessDenied'),
                                loading: false,
                                color: "#BA0C2F",
                            });
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
export default EditRegionComponent;
