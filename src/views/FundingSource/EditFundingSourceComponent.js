import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants.js';
import FundingSourceService from "../../api/FundingSourceService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Initial values for form fields
let initialValues = {
    fundingSource: "",
    fundingSourceCode: "",
    fundingSourceTypeId: ""
}
// Localized entity name
const entityname = i18n.t('static.fundingsource.fundingsource');
/**
 * Defines the validation schema for funding source details.
 * @param {*} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        fundingSourceTypeId: Yup.string()
            // .required(i18n.t('static.procurementagent.procurementagenttypetext')),
            .required('Funder Type is required'),
        fundingSource: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.fundingsource.fundingsourcetext')),
        fundingSourceCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .required(i18n.t('static.fundingsource.fundingsourceCodeText')),
    })
}
/**
 * Component for editing funding source details.
 */
class EditFundingSourceComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fundingSourceTypes: [],
            fundingSource: {
                realm: {
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: '',
                    }
                },
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: '',
                },
                fundingSourceCode: '',
                fundingSourceType: {
                    id: ''
                }
            },
            message: '',
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    /**
     * Fetches Funding source details on component mount.
     */
    componentDidMount() {
        //Fetches Funding source details by fundingSourceId
        FundingSourceService.getFundingSourceById(this.props.match.params.fundingSourceId).then(response => {
            if (response.status == 200) {
                this.setState({
                    fundingSource: response.data, loading: false
                });
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
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
        //Fetch realmId
        let realmId = AuthenticationService.getRealmId();

        //Fetch all funding source type list
        //this.state.fundingSource.realm.id
        FundingSourceService.getFundingSourceTypeListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        fundingSourceTypes: listArray.filter(c => c.active == true && realmId == c.realm.id), loading: false,
                    })
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
    /**
     * Hides the message in div2 after 30 seconds.
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * Handles data change in the funding source form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { fundingSource } = this.state;
        if (event.target.name == "fundingSource") {
            fundingSource.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            fundingSource.active = event.target.id === "active2" ? false : true;
        }
        if (event.target.name == "fundingSourceCode") {
            fundingSource.fundingSourceCode = event.target.value.toUpperCase();;
        }
        if (event.target.name == "allowedInBudget") {
            fundingSource.allowedInBudget = event.target.id === "allowedInBudget2" ? false : true;
        }
        if (event.target.name == "fundingSourceTypeId") {
            fundingSource.fundingSourceType.id = event.target.value;
        }
        this.setState({
            fundingSource
        },
            () => { });
    };
    /**
     * Capitalizes the first letter of the funding source name.
     * @param {string} str - The funding source name.
     */
    Capitalize(str) {
        if (str != null && str != "") {
            let { fundingSource } = this.state
            fundingSource.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
        }
    }
    /**
     * Renders the funding source details form.
     * @returns {JSX.Element} - Funding source form.
     */
    render() {
        const { fundingSourceTypes } = this.state;
        let fundingSourceTypeList = fundingSourceTypes.length > 0
            && fundingSourceTypes.map((item, i) => {
                return (
                    <option key={i} value={item.fundingSourceTypeId}>
                        {getLabelText(item.label, this.state.lang)} ({item.fundingSourceTypeCode})
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    fundingSource: this.state.fundingSource.label.label_en,
                                    fundingSourceCode: this.state.fundingSource.fundingSourceCode
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    FundingSourceService.updateFundingSource(this.state.fundingSource)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/fundingSource/listFundingSource/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                                        setTouched
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='fundingSourceForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.fundingsource.realm')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        readOnly
                                                        value={getLabelText(this.state.fundingSource.realm.label, this.state.lang)}
                                                    >
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="fundingSourceTypeId">{i18n.t('static.funderTypeHead.funderType')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        bsSize="sm"
                                                        name="fundingSourceTypeId"
                                                        id="fundingSourceTypeId"
                                                        valid={!errors.fundingSourceTypeId && this.state.fundingSource.fundingSourceType.id != ''}
                                                        invalid={touched.fundingSourceTypeId && !!errors.fundingSourceTypeId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.fundingSource.fundingSourceType.id}
                                                        required
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {fundingSourceTypeList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.fundingSourceTypeId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="fundingSource">{i18n.t('static.fundingsource.fundingsource')}<span className="red Reqasterisk">*</span> </Label>
                                                    <Input type="text"
                                                        name="fundingSource"
                                                        id="fundingSource"
                                                        bsSize="sm"
                                                        valid={!errors.fundingSource}
                                                        invalid={(touched.fundingSource && !!errors.fundingSource) || !!errors.fundingSource}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.fundingSource.label.label_en}
                                                        maxLength={255}
                                                        required />
                                                    <FormFeedback className="red">{errors.fundingSource}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="fundingSource">{i18n.t('static.fundingsource.fundingsourceCode')}<span className="red Reqasterisk">*</span> </Label>
                                                    <Input type="text"
                                                        name="fundingSourceCode"
                                                        id="fundingSourceCode"
                                                        bsSize="sm"
                                                        valid={!errors.fundingSourceCode && this.state.fundingSource.fundingSourceCode != ''}
                                                        invalid={(touched.fundingSourceCode && !!errors.fundingSourceCode) || !!errors.fundingSourceCode}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.fundingSource.fundingSourceCode}
                                                        required
                                                        maxLength={7}
                                                    />
                                                    <FormFeedback className="red">{errors.fundingSourceCode}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label className="P-absltRadio">{i18n.t('static.fundingSource.allowInBudget')}&nbsp;&nbsp;</Label>
                                                    <FormGroup check inline className="ml-5">
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="allowedInBudget1"
                                                            name="allowedInBudget"
                                                            value={true}
                                                            checked={this.state.fundingSource.allowedInBudget === true}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-active1">
                                                            {i18n.t('static.program.yes')}
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup check inline style={{ marginLeft: '-18px' }}>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="allowedInBudget2"
                                                            name="allowedInBudget"
                                                            value={false}
                                                            checked={this.state.fundingSource.allowedInBudget === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-active2">
                                                            {i18n.t('static.program.no')}
                                                        </Label>
                                                    </FormGroup>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label className="P-absltRadio">{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>
                                                    <FormGroup check inline className="ml-5">
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="active1"
                                                            name="active"
                                                            value={true}
                                                            checked={this.state.fundingSource.active === true}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-active1">
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
                                                            checked={this.state.fundingSource.active === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-active2">
                                                            {i18n.t('static.common.disabled')}
                                                        </Label>
                                                    </FormGroup>
                                                </FormGroup>
                                            </CardBody>
                                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                    <div class="align-items-center">
                                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                                        <div class="spinner-border blue ml-4" role="status">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
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
     * Redirects to the list funding source when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/fundingSource/listFundingSource/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the funding source details form when reset button is clicked.
     */
    resetClicked() {
        //Fetch funding source details by fundingSourceId
        FundingSourceService.getFundingSourceById(this.props.match.params.fundingSourceId).then(response => {
            this.setState({
                fundingSource: response.data
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
export default EditFundingSourceComponent;
