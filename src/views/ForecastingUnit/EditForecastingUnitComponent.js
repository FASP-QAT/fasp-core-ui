import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import ForecastingUnitService from '../../api/ForecastingUnitService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import UnitService from '../../api/UnitService.js';
import AuthenticationService from '../Common/AuthenticationService';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import DropdownService from '../../api/DropdownService';
import ProductService from '../../api/ProductService';
import { loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
// Localized entity name
const entityname = i18n.t('static.forecastingunit.forecastingunit');
/**
 * Defines the validation schema for forecasting unit details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.forecastingunit.forecastingunittext')),
        tracerCategoryId: Yup.string()
            .required(i18n.t('static.tracercategory.tracercategoryText')),
        productCategoryId: Yup.string()
            .required(i18n.t('static.productcategory.productcategorytext')),
        genericLabel: Yup.string()
            .matches(/^$|^\S+(?: \S+)*$/, i18n.t('static.validSpace.string')),
        unitId: Yup.string()
            .required(i18n.t('static.unit.unittext'))
    })
}
/**
 * Component for editing forecasting unit details.
 */
export default class EditForecastingUnitComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            productcategories: [],
            tracerCategories: [],
            forecastingUnit:
            {
                active: '',
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: '',
                    labelId: ''
                }, genericLabel: {
                    label_en: '',
                    labelId: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                productCategory: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                tracerCategory: {
                    tracerCategoryId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                unit: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
            },
            spProgramList: [],
            fcProgramList: [],
            sortedProgramList: [],
            lang: localStorage.getItem('lang'),
            loading: true,
            units: []
        }
        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
    }
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
    dataChange(event) {
        let { forecastingUnit } = this.state
        if (event.target.name === "label") {
            forecastingUnit.label.label_en = event.target.value
        }
        if (event.target.name == "realmId") {
            forecastingUnit.realm.realmId = event.target.value;
        }
        if (event.target.name == "tracerCategoryId") {
            forecastingUnit.tracerCategory.id = event.target.value;
        }
        if (event.target.name == "productCategoryId") {
            forecastingUnit.productCategory.id = event.target.value;
        }
        if (event.target.name == "genericLabel") {
            forecastingUnit.genericLabel.label_en = event.target.value;
        }
        if (event.target.name == "unitId") {
            forecastingUnit.unit.id = event.target.value;
        }
        else if (event.target.name === "active") {
            forecastingUnit.active = event.target.id === "active2" ? false : true
        }
        this.setState(
            {
                forecastingUnit
            }
        )
    };
    /**
     * Reterives unit list and forecasting unit details on component mount
     */
    componentDidMount() {
        UnitService.getUnitListAll().then(response => {
            var listArray = response.data;
            listArray.sort((a, b) => {
                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
                units: listArray
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
        // ForecastingUnitService.getForcastingUnitById(this.props.match.params.forecastingUnitId).then(response => {
        ForecastingUnitService.getForcastingUnitByIdWithPrograms(this.props.match.params.forecastingUnitId).then(response => {
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
                    forecastingUnit: response.data.forecastingUnit,
                    // spProgramList: response.data.spProgramList,
                    // fcProgramList: response.data.fcProgramList,
                    sortedProgramList: finalProgramList,
                    loading: false
                }, () => {
                    this.getProductCategoryByRealmId()
                });
                this.buildJExcel();
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
        DropdownService.getTracerCategoryDropdownList()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    tracerCategories: listArray,
                    loading: false
                })
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
     * Reterives product category list based on realm Id from server
     */
    getProductCategoryByRealmId() {
        this.setState({
            loading: true
        })
        let realmId = this.state.forecastingUnit.realm.id;
        if (realmId != "") {
            ProductService.getProductCategoryList(realmId)
                .then(response => {
                    var listArray = response.data.slice(1);
                    listArray = listArray.filter(c => c.payload.active.toString() == "true");
                    // listArray.sort((a, b) => {
                    //     var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase();
                    //     var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase();
                    //     return itemLabelA > itemLabelB ? 1 : -1;
                    // });
                    this.setState({
                        productcategories: listArray,
                        loading: false
                    })
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
        } else {
            this.setState({
                productcategories: []
            })
        }
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
            license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    /**
     * Renders the forecasting unit details form.
     * @returns {JSX.Element} - Forecasting unit details form.
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
        const { tracerCategories } = this.state;
        let tracerCategoryList = tracerCategories.length > 0
            && tracerCategories.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { productcategories } = this.state;
        let productCategoryList = productcategories.length > 0
            && productcategories.map((item, i) => {
                return (
                    <option key={i} value={item.payload.productCategoryId}>
                        {getLabelText(item.payload.label, this.state.lang)}
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
                                    label: this.state.forecastingUnit.label.label_en,
                                    genericLabel: this.state.forecastingUnit.genericLabel.label_en==null?'':this.state.forecastingUnit.genericLabel.label_en,
                                    unitId: this.state.forecastingUnit.unit.id,
                                    tracerCategoryId: this.state.forecastingUnit.tracerCategory.id,
                                    productCategoryId: this.state.forecastingUnit.productCategory.id
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    ForecastingUnitService.editForecastingUnit(this.state.forecastingUnit)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/forecastingUnit/listForecastingUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode, loading: false
                                                },
                                                    () => {
                                                        hideSecondComponent();
                                                    })
                                            }
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
                                                            this.setState({
                                                                message: error.response.data.messageCode,
                                                                loading: false
                                                            });
                                                            break;
                                                        case 406:
                                                            this.setState({
                                                                message: i18n.t('static.message.forecastingUnitAlreadExists'),
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
                                        <Form onSubmit={handleSubmit} noValidate name='forecastingUnitForm' autocomplete="off">
                                            <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="realmId">{i18n.t('static.realm.realm')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text"
                                                        name="realmId"
                                                        id="realmId"
                                                        bsSize="sm"
                                                        readOnly
                                                        value={getLabelText(this.state.forecastingUnit.realm.label, this.state.lang)}
                                                    >
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="tracerCategoryId">{i18n.t('static.tracercategory.tracercategory')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="tracerCategoryId"
                                                        id="tracerCategoryId"
                                                        bsSize="sm"
                                                        valid={!errors.tracerCategoryId && this.state.forecastingUnit.tracerCategory.id != ''}
                                                        invalid={touched.tracerCategoryId && !!errors.tracerCategoryId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.forecastingUnit.tracerCategory.id}
                                                        disabled={!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_UPDATE_TRACER_CATEGORY_FOR_FU')}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {tracerCategoryList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.tracerCategoryId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="productCategoryId">{i18n.t('static.productcategory.productcategory')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="productCategoryId"
                                                        id="productCategoryId"
                                                        bsSize="sm"
                                                        valid={!errors.productCategoryId && this.state.forecastingUnit.productCategory.id != ''}
                                                        invalid={touched.productCategoryId && !!errors.productCategoryId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.forecastingUnit.productCategory.id}
                                                        disabled={!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_UPDATE_PLANNING_UNIT_CATEGORY_FOR_FU')}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {productCategoryList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.productCategoryId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="label">{i18n.t('static.forecastingunit.forecastingunit')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="label"
                                                        id="label"
                                                        bsSize="sm"
                                                        valid={!errors.label}
                                                        invalid={(touched.label && !!errors.label) || !!errors.label}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.forecastingUnit.label.label_en}
                                                        required />
                                                    <FormFeedback className="red">{errors.label}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="genericLabel">{i18n.t('static.product.productgenericname')}</Label>
                                                    <Input type="text"
                                                        name="genericLabel"
                                                        id="genericLabel"
                                                        bsSize="sm"
                                                        valid={!errors.genericLabel}
                                                        invalid={(touched.genericLabel && !!errors.genericLabel) || !!errors.genericLabel}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.forecastingUnit.genericLabel.label_en}
                                                        required />
                                                    <FormFeedback className="red">{errors.genericLabel}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="unitId">{i18n.t('static.unit.unit')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="unitId"
                                                        id="unitId"
                                                        bsSize="sm"
                                                        value={this.state.forecastingUnit.unit.id}
                                                        valid={!errors.unitId && this.state.forecastingUnit.unit.id != ''}
                                                        invalid={touched.unitId && !!errors.unitId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        disabled={!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_UPDATE_UNIT_FOR_FU')}
                                                        required
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {unitList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.unitId}</FormFeedback>
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
                                                            checked={this.state.forecastingUnit.active === true}
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
                                                            checked={this.state.forecastingUnit.active === false}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.dataentry.inactive')}
                                                        </Label>
                                                    </FormGroup>
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
                                                    <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}>{i18n.t('static.common.cancel')}</Button>
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
                    <h6>{i18n.t(this.state.message, { entityname })}</h6>
                    <h6>{i18n.t(this.props.match.params.message, { entityname })}</h6>
                </div>
            </div>
        );
    }
    /**
     * Redirects to the list forecasting unit screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/forecastingUnit/listForecastingUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the forecasting unit details when reset button is clicked.
     */
    resetClicked() {
        ForecastingUnitService.getForcastingUnitById(this.props.match.params.forecastingUnitId).then(response => {
            this.setState({
                forecastingUnit: response.data
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