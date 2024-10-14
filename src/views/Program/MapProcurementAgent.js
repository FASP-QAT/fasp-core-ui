import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import { API_URL } from '../../Constants.js';
import ProcurementAgentService from '../../api/ProcurementAgentService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions.js';
// Localized entity name
const entityname = i18n.t('static.report.procurementAgentName');
/**
 * Defines the validation schema for map procurement agent.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
    })
}
/**
 * This component allows users to map procurement agents in a program.
 * It displays a form where users can select procurement agents for the program and update the selection.
 */
export default class AddDimensionComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            program: {
                id: this.props.match.params.programId,
                code: '',
                procurementAgents: []
            },
            message: '',
            loading: true,
            isHide: true,
            bodyParameter: '',
            selectedProcurementAgentList: [],
            procurementAgentList: []
        }
        this.resetClicked = this.resetClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
    }
    /**
     * Reterives the mapping of program and procurement agent
     */
    componentDidMount() {
        this.setState({ loading: false })
        ProcurementAgentService.getProcurementAgentForProgram(this.state.program.id)
            .then(response => {
                this.setState({
                    program: {
                        id: response.data.program.id,
                        code: response.data.program.code
                    },
                    loading: false
                })
                var procurementAgentListArray = [];
                for (var i = 0; i < response.data.procurementAgentList.length; i++) {
                    if (this.state.procurementAgentList.id != 0) {
                        procurementAgentListArray[i] = { value: response.data.procurementAgentList[i].id, label: response.data.procurementAgentList[i].label.label_en }
                    }
                }
                var listArray = procurementAgentListArray;
                listArray.sort((a, b) => {
                    var itemLabelA = a.label.toUpperCase();
                    var itemLabelB = b.label.toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                var paJson = {
                    value: -1,
                    label: "All",
                }
                listArray.unshift(paJson);
                this.setState({
                    procurementAgentList: listArray
                })
                var selectedProcurementAgentListArray = [];
                for (var i = 0; i < response.data.selectedProcurementAgentList.length; i++) {
                    selectedProcurementAgentListArray[i] = { value: response.data.selectedProcurementAgentList[i].id, label: response.data.selectedProcurementAgentList[i].label.label_en }
                }
                var listArray = selectedProcurementAgentListArray;
                listArray.sort((a, b) => {
                    var itemLabelA = a.label.toUpperCase();
                    var itemLabelB = b.label.toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    program: {
                        ...this.state.program,
                        procurementAgents: listArray
                    },
                    selectedProcurementAgentList: listArray
                })
            })
            .catch(
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
     * Handles the change event for procurement agents.
     * @param {Array} event - An array containing the selected procurement agent IDs.
     */
    procurementAgentChange(selectedProcurementAgentList) {
        var selectedArray = [];
        for (var p = 0; p < selectedProcurementAgentList.length; p++) {
            selectedArray.push(selectedProcurementAgentList[p].value);
        }
        if (selectedArray.includes(-1)) {
            this.setState({ selectedProcurementAgentList: [] });
            var list = this.state.procurementAgentList.filter(c => c.value != -1)
            this.setState({ selectedProcurementAgentList: list });
            var selectedProcurementAgentList = list;
        } else {
            this.setState({ selectedProcurementAgentList: selectedProcurementAgentList });
            var selectedProcurementAgentList = selectedProcurementAgentList;
        }
    }
    /**
     * Renders the map program procurement agent screen.
     * @returns {JSX.Element} - Map program procurement agent screen.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "#BA0C2F" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={
                                    {
                                        procurementAgentId: this.state.selectedProcurementAgentList
                                    }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    let selectedProcurementAgentListArray = [];
                                    selectedProcurementAgentListArray = this.state.selectedProcurementAgentList.map(e => e.value);
                                    AuthenticationService.setupAxiosInterceptors();
                                    ProcurementAgentService.updateProcurementAgentsForProgram(this.state.program.id, selectedProcurementAgentListArray)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/program/listProgram/` + 'green/' + i18n.t("static.mt.dataUpdateSuccess", { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode, loading: false
                                                },
                                                    () => {
                                                        hideSecondComponent();
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
                                        handleReset,
                                        setFieldTouched,
                                        setFieldValue
                                    }) => (
                                        <Form onSubmit={handleSubmit} noValidate name='procurementAgentForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="programId">{i18n.t('static.program.program')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text"
                                                        name="programId"
                                                        id="programId"
                                                        bsSize="sm"
                                                        readOnly={true}
                                                        value={this.state.program.code}
                                                    >
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup className="Selectcontrol-bdrNone">
                                                    <Label htmlFor="procurementAgentId">{i18n.t('static.report.procurementAgentName')}</Label>
                                                    <Select
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                            { 'is-valid': !errors.procurementAgentId && this.state.procurementAgentList.length != 0 },
                                                            { 'is-invalid': (touched.procurementAgentId && !!errors.procurementAgentId) }
                                                        )}
                                                        bsSize="sm"
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            setFieldValue("procurementAgentId", e);
                                                            this.procurementAgentChange(e);
                                                        }}
                                                        onBlur={() => setFieldTouched("procurementAgentId", true)}
                                                        name="procurementAgentId"
                                                        id="procurementAgentId"
                                                        multi
                                                        options={this.state.procurementAgentList}
                                                        value={this.state.selectedProcurementAgentList}
                                                    />
                                                    <FormFeedback className="red">{errors.procurementAgentId}</FormFeedback>
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
     * Redirects to the list program screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/program/listProgram/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the mapping details when reset button is clicked.
     */
    resetClicked() {
        this.state.selectedProcurementAgentList = this.state.program.procurementAgents
        let { selectedProcurementAgentList } = this.state
        this.setState(
            {
                selectedProcurementAgentList
            }
        )
    }
} 