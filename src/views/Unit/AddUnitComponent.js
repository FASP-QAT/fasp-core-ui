import { Formik } from 'formik';
import React, { Component } from 'react';
import 'react-select/dist/react-select.min.css';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants.js';
import DimensionService from '../../api/DimensionService';
import UnitService from '../../api/UnitService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const initialValues = {
    unitName: "",
    unitCode: "",
    dimensionId: []
}
const entityname = i18n.t('static.unit.unit');
/**
 * This const is used to define the validation schema for unit
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        dimensionId: Yup.string()
            .required(i18n.t('static.unit.dimensiontext')),
        unitName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.unit.unittext')),
        unitCode: Yup.string()
            .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
            .max(20, i18n.t('static.common.max20digittext'))
            .required(i18n.t('static.unit.unitcodetext'))
    })
}
/**
 * This component is used to display the unit details in a form and allow user to add the details
 */
class AddUnitComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unit: {
                dimension: {
                    id: ''
                },
                label: {
                    label_en: ''
                },
                unitCode: ''
            },
            loading: true,
            message: '',
            dimensions: []
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { unit } = this.state;
        if (event.target.name == "dimensionId") {
            unit.dimension.id = event.target.value;
        }
        if (event.target.name == "unitName") {
            unit.label.label_en = event.target.value;
        }
        if (event.target.name == "unitCode") {
            unit.unitCode = event.target.value;
        }
        this.setState({
            unit
        },
            () => { });
    };
    /**
     * This function is used to capitalize the first letter of the unit name
     * @param {*} str This is the name of the unit
     */
    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
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
     * This function is used get dimension list
     */
    componentDidMount() {
        DimensionService.getDimensionListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        dimensions: listArray, loading: false,
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
     * This is used to display the content
     * @returns This returns unit details form
     */
    render() {
        const { dimensions } = this.state;
        let dimensionList = dimensions.length > 0
            && dimensions.map((item, i) => {
                return (
                    <option key={i} value={item.dimensionId}>
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
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    UnitService.addUnit(this.state.unit).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/unit/listUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        setTouched,
                                        handleReset
                                    }) => (
                                        <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                            <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="dimensionId">{i18n.t('static.dimension.dimension')}<span class="red Reqasterisk">*</span></Label>
                                                                                                                                                            <Input
                                                        type="select"
                                                        bsSize="sm"
                                                        name="dimensionId"
                                                        id="dimensionId"
                                                        valid={!errors.dimensionId && this.state.unit.dimension.id != ''}
                                                        invalid={touched.dimensionId && !!errors.dimensionId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.unit.dimension.id}
                                                        required
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {dimensionList}
                                                    </Input>
                                                                                                        <FormFeedback className="red">{errors.dimensionId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="unitName">{i18n.t('static.unit.unit')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="unitName"
                                                        id="unitName"
                                                        bsSize="sm"
                                                        valid={!errors.unitName && this.state.unit.label.label_en != ''}
                                                        invalid={touched.unitName && !!errors.unitName}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.Capitalize(this.state.unit.label.label_en)}
                                                        required />
                                                    <FormFeedback className="red">{errors.unitName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="unitCode">{i18n.t('static.unit.unitCode')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="unitCode"
                                                        id="unitCode"
                                                        bsSize="sm"
                                                        valid={!errors.unitCode && this.state.unit.unitCode != ''}
                                                        invalid={touched.unitCode && !!errors.unitCode}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.unit.unitCode}
                                                        required />
                                                    <FormFeedback className="red">{errors.unitCode}</FormFeedback>
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
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                    &nbsp;
                                                </FormGroup>
                                            </CardFooter>
                                        </Form>
                                    )} />
                        </Card>
                    </Col>
                </Row>
                <div>
                    <h6>{i18n.t(this.state.message, { entityname })}</h6>
                    <h6>{i18n.t(this.props.match.params.message, { entityname })}</h6>
                </div>
            </div>
        );
    }
    /**
     * This function is called when cancel button is clicked and is redirected to list unit screen
     */
    cancelClicked() {
        this.props.history.push(`/unit/listUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * This function is called when reset button is clicked to reset the unit details
     */
    resetClicked() {
        let { unit } = this.state;
        unit.dimension.id = ''
        unit.label.label_en = ''
        unit.unitCode = ''
        this.setState({
            unit
        },
            () => { });
    }
}
export default AddUnitComponent;