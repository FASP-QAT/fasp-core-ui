import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import TracerCategoryService from "../../api/TracerCategoryService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
const entityname = i18n.t('static.tracercategory.tracercategory');
const initialValues = {
    tracerCategoryName: "",
    healthAreaId: "",
    submittedToApprovedLeadTime: ""
}
/**
 * This const is used to define the validation schema for tracer category
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        tracerCategoryName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.tracerCategory.tracercategorytext')),
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
    })
}
/**
 * This component is used to display the tracer category details in a form and allow user to edit the details
 */
class EditTracerCategoryComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            realms: [],
            healthAreas: [],
            tracerCategory: {
                realm: {
                    label: {
                        label_en: '',
                        label_fr: '',
                        label_sp: '',
                        label_pr: ''
                    }
                },
                healthArea: {
                    id: ''
                },
                label: {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: ''
                }
            },
            message: '',
            lang: localStorage.getItem('lang')
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is used to capitalize the first letter of the unit name
     * @param {*} str This is the name of the unit
     */
    Capitalize(str) {
        if (str != null && str != "") {
            let { tracerCategory } = this.state;
            tracerCategory.label.label_en = str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { tracerCategory } = this.state;
        if (event.target.name == "realmId") {
            tracerCategory.realm.id = event.target.value;
        }
        if (event.target.name == "tracerCategoryName") {
            tracerCategory.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            tracerCategory.active = event.target.id === "active2" ? false : true;
        }
        if (event.target.name == "healthAreaId") {
            tracerCategory.healthArea.id = event.target.value;
        }
        this.setState({
            tracerCategory
        },
            () => { });
    };
    /**
     * This function is used get tracer category details and health area list
     */
    componentDidMount() {
        TracerCategoryService.getTracerCategoryById(this.props.match.params.tracerCategoryId).then(response1 => {
            if (response1.status == 200) {
                this.setState({
                    tracerCategory: response1.data, loading: false
                }, 
                () => {
                    let realmId = AuthenticationService.getRealmId();
                    DropdownService.getHealthAreaDropdownList(realmId)
                    .then(response => {
                        if (response.status == 200) {
                            var listArray = response.data;
                            var haArray = response.data;
                            haArray = haArray.filter( (item) => {
                                return item.id === this.state.tracerCategory.healthArea.id;
                            });
                            listArray.sort((a, b) => {
                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                                return itemLabelA > itemLabelB ? 1 : -1;
                            });
                            this.setState({
                                healthAreas: listArray, loading: false
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
                });
            }
            else {
                this.setState({
                    message: response1.data.messageCode, loading: false
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
     * This is used to display the content
     * @returns This returns tracer category details form
     */
    render() {
        const { healthAreas } = this.state;
        let healthAreaList = healthAreas.length > 0
            && healthAreas.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
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
                                initialValues={
                                    {
                                        tracerCategoryCode: this.state.tracerCategory.tracerCategoryCode,
                                        tracerCategoryName: this.state.tracerCategory.label.label_en,
                                        healthAreaId: this.state.tracerCategory.healthArea.id==""?"":this.state.tracerCategory.healthArea.id,
                                        submittedToApprovedLeadTime: this.state.tracerCategory.submittedToApprovedLeadTime
                                    }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    TracerCategoryService.updateTracerCategory(this.state.tracerCategory)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/tracerCategory/listTracerCategory/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        <Form onSubmit={handleSubmit} noValidate name='tracerCategoryForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span class="red Reqasterisk">*</span></Label>
                                                                                                                                                            <Input
                                                        type="text"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={getLabelText(this.state.tracerCategory.realm.label, this.state.lang)}
                                                    >
                                                    </Input>
                                                                                                    </FormGroup>
                                                <FormGroup>
                                                    <Label for="tracerCategoryName">{i18n.t('static.tracercategory.tracercategory')}<span className="red Reqasterisk">*</span></Label>
                                                                                                                                                            <Input type="text"
                                                        bsSize="sm"
                                                        name="tracerCategoryName"
                                                        id="tracerCategoryName"
                                                        valid={!errors.tracerCategoryName}
                                                        invalid={touched.tracerCategoryName && !!errors.tracerCategoryName || this.state.tracerCategory.label.label_en == ''}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={getLabelText(this.state.tracerCategory.label, this.state.lang)}
                                                    />
                                                                                                        <FormFeedback className="red">{errors.tracerCategoryName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                        <Label htmlFor="healthAreaId">{i18n.t('static.healtharea.healtharea')}<span className="red Reqasterisk">*</span></Label>
                                                                                                                                                                        <Input
                                                            type="select"
                                                            bsSize="sm"
                                                            name="healthAreaId"
                                                            id="healthAreaId"
                                                            valid={!errors.healthAreaId && this.state.tracerCategory.healthArea.id != ''}
                                                            invalid={touched.healthAreaId && !!errors.healthAreaId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.tracerCategory.healthArea.id}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {healthAreaList}
                                                        </Input>
                                                                                                                <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
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
                                                            checked={this.state.tracerCategory.active === true}
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
                                                            checked={this.state.tracerCategory.active === false}
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
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1"><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
     * This function is called when cancel button is clicked and is redirected to list tracer category screen
     */
    cancelClicked() {
        this.props.history.push(`/tracerCategory/listTracerCategory/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * This function is called when reset button is clicked to reset the tracer category details
     */
    resetClicked() {
        TracerCategoryService.getTracerCategoryById(this.props.match.params.tracerCategoryId).then(response => {
            this.setState({
                tracerCategory: response.data
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
export default EditTracerCategoryComponent;
