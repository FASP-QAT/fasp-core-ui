import React, { Component } from 'react';
import { Row, Col, Card, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import PlanningUnitService from '../../api/PlanningUnitService';
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import UnitService from '../../api/UnitService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import { loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import jexcel from 'jspreadsheet';
// Localized entity name
const entityname = i18n.t('static.planningunit.planningunit');
/**
 * Defines the validation schema for planning unit details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.planningUnit.plannignUnitName')),
        multiplier: Yup.string()
            .matches(/^\d{1,10}(\.\d{1,2})?$/, i18n.t('static.planningUnit.conversionFactor'))
            .required(i18n.t('static.planningUnit.multiplier'))
            .min(0, i18n.t('static.program.validvaluetext')),
        unitId: Yup.string()
            .required(i18n.t('static.planningUnit.plannignUnitMeasure')),
    })
}
/**
 * Component for editing planning unit details.
 */
export default class EditPlanningUnitComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            units: [],
            lang: localStorage.getItem("lang"),
            planningUnit: {
                message: '',
                active: '',
                planningUnitId: '',
                label: {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: '',
                    labelId: '',
                },
                forecastingUnit: {
                    forecastingUnitId: '',
                    label: {
                        label_en: ''
                    }
                }, unit: {
                    id: '',
                    label: {
                        label_en: ''
                    }
                }
            },
            spProgramList: [],
            fcProgramList: [],
            sortedProgramList: [],
            loading: true
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.changeLoading = this.changeLoading.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
    }
    /**
     * Updates the loading state of the component.
     * @param {boolean} loading - The loading state to be set.
     */
    changeLoading(loading) {
        this.setState({ loading: loading })
    }
    /**
     * Updates the message state with the provided message.
     * @param {string} message - The message to be set in the component state.
     */
    changeMessage(message) {
        this.setState({ message: message })
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { planningUnit } = this.state
        if (event.target.name === "label") {
            planningUnit.label.label_en = event.target.value
        }
        else if (event.target.name === "forecastingUnitId") {
            planningUnit.forecastingUnit.forecastingUnitId = event.target.value
        }
        if (event.target.name === "unitId") {
            planningUnit.unit.id = event.target.value;
        }
        if (event.target.name === "multiplier") {
            planningUnit.multiplier = event.target.value;
        } if (event.target.name === "active") {
            planningUnit.active = event.target.id === "active2" ? false : true
        }
        this.setState(
            {
                planningUnit
            }
        )
    };
    /**
     * Redirects to the list planning unit screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/planningUnit/listPlanningUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Reterives unit list on component will mount
     */
    componentWillMount() {
        UnitService.getUnitListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        units: listArray, loading: false
                    })
                    // PlanningUnitService.getPlanningUnitById(this.props.match.params.planningUnitId).then(response => {
                    PlanningUnitService.getPlanningUnitByIdWithPrograms(this.props.match.params.planningUnitId).then(response => {
                        if (response.status == 200) {
                            //combine program list
                            var combinedProgramList = [];
                            var finalProgramList = [];

                            //add spProgramList to main list
                            response.data.spProgramListActive.map(item => {
                                var json = {
                                    "code": item.code,
                                    "module": "Supply Planning",
                                    "status": 1
                                }
                                combinedProgramList.push(json);
                            });

                            //add fcProgramList to main list
                            response.data.fcProgramListActive.map(item => {
                                var json = {
                                    "code": item.code,
                                    "module": "Forecasting",
                                    "status": 1
                                }
                                combinedProgramList.push(json);
                            });

                            //sorted combinedProgram array
                            combinedProgramList.sort((a, b) => {
                                return a.code > b.code ? 1 : -1;
                            });

                            var inActivePrograms = [];
                            //add spProgramList disabled
                            response.data.spProgramListDisabled.map(item => {
                                var json = {
                                    "code": item.code,
                                    "module": "Supply Planning",
                                    "status": 0
                                }
                                inActivePrograms.push(json);
                            });
                            //add fcProgramList disabled
                            response.data.fcProgramListDisabled.map(item => {
                                var json = {
                                    "code": item.code,
                                    "module": "Forecasting",
                                    "status": 0
                                }
                                inActivePrograms.push(json);
                            });
                            //sorted combinedProgram array
                            inActivePrograms.sort((a, b) => {
                                return a.code > b.code ? 1 : -1;
                            });

                            //merged active & inactive programs
                            finalProgramList = [...combinedProgramList, ...inActivePrograms];

                            this.setState({
                                planningUnit: response.data.planningUnit,
                                // spProgramList: response.data.spProgramList,
                                // fcProgramList: response.data.fcProgramList,
                                sortedProgramList: finalProgramList,
                                loading: false
                            });
                            this.buildJExcel();
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
                else {
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
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildJExcel() {
        let sortedProgramList = this.state.sortedProgramList;
        let programArray = [];
        let count = 0;

        for (var j = 0; j < sortedProgramList.length; j++) {
            data = [];
            data[0] = sortedProgramList[j].code;
            data[1] = sortedProgramList[j].module;
            data[2] = sortedProgramList[j].status ? i18n.t('static.common.active') : i18n.t('static.common.disabled');
            programArray[count] = data;
            count++;
        }

        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = programArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.program.programMaster'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.module'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.status'),
                    type: 'text',
                }

            ],
            editable: false,
            onload: loadedForNonEditableTables,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    /**
     * Renders the planning unit details form.
     * @returns {JSX.Element} - Planning unit details form.
     */
    render() {
        const { units } = this.state;
        let unitList = units.length > 0
            && units.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
                        {item.label.label_en}
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
                                    label: this.state.planningUnit.label.label_en,
                                    forecastingUnitId: this.state.planningUnit.forecastingUnit.forecastingUnitId,
                                    multiplier: this.state.planningUnit.multiplier,
                                    unitId: this.state.planningUnit.unit.id,
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    PlanningUnitService.editPlanningUnit(this.state.planningUnit)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/planningUnit/listPlanningUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        <Form onSubmit={handleSubmit} noValidate name='planningUnitForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="forecastingUnitId">{i18n.t('static.planningUnit.associatedForecastingUnit')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text"
                                                        name="forecastingUnitId"
                                                        id="forecastingUnitId"
                                                        bsSize="sm"
                                                        readOnly
                                                        value={this.state.planningUnit.forecastingUnit.label.label_en + "-" + this.state.planningUnit.unit.label.label_en}
                                                    >
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="multiplier">{i18n.t('static.planningUnit.labelMultiplier')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="multiplier"
                                                        id="multiplier"
                                                        bsSize="sm"
                                                        valid={!errors.multiplier}
                                                        invalid={(touched.multiplier && !!errors.multiplier) || !!errors.multiplier}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.planningUnit.multiplier}
                                                        required />
                                                    <FormFeedback className="red">{errors.multiplier}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="label">{i18n.t('static.product.productName')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text"
                                                        name="label"
                                                        id="label"
                                                        bsSize="sm"
                                                        valid={!errors.label}
                                                        invalid={(touched.label && !!errors.label) || !!errors.label}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.planningUnit.label.label_en}
                                                        required
                                                    >
                                                    </Input>
                                                    <FormFeedback className="red">{errors.label}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="unitId">{i18n.t('static.planningUnit.planningUnitOfMeasure')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="unitId"
                                                        id="unitId"
                                                        bsSize="sm"
                                                        valid={!errors.unitId && this.state.planningUnit.unit.id != ''}
                                                        invalid={touched.unitId && !!errors.unitId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        disabled={!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_UPDATE_UNIT_FOR_PU')}
                                                        value={this.state.planningUnit.unit.id}
                                                        required>
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {unitList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.unitId}</FormFeedback>
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
                                                            checked={this.state.planningUnit.active === true}
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
                                                            checked={this.state.planningUnit.active === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.common.disabled')}
                                                        </Label>
                                                    </FormGroup>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="unitId">{i18n.t('static.planningUnit.plannignUniteg')}</Label>
                                                </FormGroup>
                                                <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                                                </div>
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
                                                    <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                    <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                    &nbsp;
                                                </FormGroup>
                                            </CardFooter>
                                        </Form>
                                    )} />
                        </Card>
                    </Col>
                </Row>
                <div>
                    {/* <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6> */}
                </div>
            </div>
        );
    }
    /**
     * Resets the planning unit details when reset button is clicked.
     */
    resetClicked() {
        PlanningUnitService.getPlanningUnitById(this.props.match.params.planningUnitId).then(response => {
            this.setState({
                planningUnit: response.data
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