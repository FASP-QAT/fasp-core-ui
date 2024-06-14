import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, Col, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import RealmService from '../../api/RealmService';
import TracerCategoryService from '../../api/TracerCategoryService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import csvicon from '../../assets/img/csv.png';
// Localized entity name
const entityname = i18n.t('static.planningunit.planningunit');
/**
 * Component for list of planning unit details.
 */
export default class PlanningUnitListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            forecastingUnits: [],
            planningUnitList: [],
            tracerCategories: [],
            productCategories: [],
            message: '',
            selSource: [],
            realmId: '',
            realms: [],
            loading: true,
            lang: localStorage.getItem('lang'),
            exportModal: false,
            loadingModal: false
        }
        this.addNewPlanningUnit = this.addNewPlanningUnit.bind(this);
        this.filterData = this.filterData.bind(this);
        this.filterDataForRealm = this.filterDataForRealm.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.dataChangeForRealm = this.dataChangeForRealm.bind(this);
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Filters the data based on selected tracer category and product category.
     * Updates the state with the filtered forecasting units and planning units.
     */
    filterData() {
        var tracerCategoryId = document.getElementById("tracerCategoryId").value;
        var productCategoryId = document.getElementById("productCategoryId").value;
        let forecastingUnitId = document.getElementById("forecastingUnitId").value == "" ? null : document.getElementById("forecastingUnitId").value;
        this.setState({
            loading: true
        })
        var json = {
            productCategorySortOrder: productCategoryId,
            tracerCategoryId: tracerCategoryId,
            forecastingUnitId: forecastingUnitId
        }
        PlanningUnitService.getPlanningUnitByTracerCategoryProductCategoryAndForecastingUnit(json).then(response => {
            console.log('planningUnitList[0]: '+JSON.stringify(response.data.filter(c => c.countOfSpPrograms > 29)[2]));
            this.setState({
                planningUnitList: response.data,
                selSource: response.data,
                loading: false
            }, () => {
                this.buildJExcel();
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
    /**
     * Event handler for when the realm selection changes.
     * Sets the loading state to true and calls the filterDataForRealm method to update the data based on the selected realm.
     * @param {Object} event - The event object containing information about the realm selection change.
     */
    dataChangeForRealm(event) {
        this.setState({ loading: true })
        this.filterDataForRealm(event.target.value);
    }
    /**
     * Filters data based on the selected realm.
     * Retrieves and updates product categories, tracer categories, forecasting units, and planning units for the selected realm.
     * @param {string} r - The ID of the selected realm.
     */
    filterDataForRealm(r) {
        let realmId = r;
        if (realmId != 0) {
            ProductService.getProductCategoryList(realmId)
                .then(response => {
                    var listArray = response.data;
                    // listArray.sort((a, b) => {
                    //     var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase();
                    //     var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase();
                    //     return itemLabelA > itemLabelB ? 1 : -1;
                    // });
                    this.setState({
                        productCategories: listArray,
                        productCategoryListAll: listArray
                    })
                    TracerCategoryService.getTracerCategoryByRealmId(realmId)
                        .then(response => {
                            if (response.status == 200) {
                                var listArray = response.data;
                                listArray.sort((a, b) => {
                                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                                    return itemLabelA > itemLabelB ? 1 : -1;
                                });
                                this.setState({
                                    tracerCategories: listArray,
                                    tracerCategoryListAll: listArray
                                })
                                ForecastingUnitService.getForcastingUnitByRealmId(realmId)
                                    .then(response => {
                                        if (response.status == 200) {
                                            var listArray = response.data;
                                            listArray.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                                                return itemLabelA > itemLabelB ? 1 : -1;
                                            });
                                            this.setState({
                                                forecastingUnits: listArray,
                                                forecastingUnitListAll: listArray,
                                                loading: false
                                            })
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
    /**
     * Builds the jexcel component to display role list.
     */
    buildJExcel() {
        let planningUnitList = this.state.selSource;
        let planningUnitArray = [];
        let count = 0;
        for (var j = 0; j < planningUnitList.length; j++) {
            data = [];
            data[0] = planningUnitList[j].planningUnitId
            data[1] = getLabelText(planningUnitList[j].label, this.state.lang) + " | " + planningUnitList[j].planningUnitId
            data[2] = getLabelText(planningUnitList[j].forecastingUnit.label, this.state.lang) + " | " + planningUnitList[j].forecastingUnit.forecastingUnitId
            data[3] = getLabelText(planningUnitList[j].unit.label, this.state.lang)
            data[4] = (planningUnitList[j].multiplier).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");;
            data[5] = planningUnitList[j].countOfSpPrograms + planningUnitList[j].countOfFcPrograms;
            data[6] = planningUnitList[j].lastModifiedBy.username;
            data[7] = (planningUnitList[j].lastModifiedDate ? moment(planningUnitList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[8] = planningUnitList[j].active;
            planningUnitArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = planningUnitArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [70, 150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.dataEntry.planningUnitId'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.product.productName'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.planningUnit.associatedForecastingUnit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.planningUnit.planningUnitOfMeasure'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.planningUnit.labelMultiplier'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.program.noOfProgramsUsingPU'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    options: { format: JEXCEL_DATE_FORMAT_SM },
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },
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
            onselection: this.selected,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                var items = [];
                if (y != null) {
                    if (obj.options.allowInsertRow == true && AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT')) {
                        items.push({
                            title: i18n.t('static.planningunit.capacityupdate'),
                            onclick: function () {
                                this.props.history.push({
                                    pathname: `/planningUnitCapacity/planningUnitCapacity/${this.el.getValueFromCoords(0, y)}`,
                                })
                            }.bind(this)
                        });
                    }
                }
                return items;
            }.bind(this)
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl,
            loading: false
        })
    }
    /**
     * Redirects to the edit planning unit screen on row click.
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                if (this.state.selSource.length != 0) {
                    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT')) {
                        this.props.history.push({
                            pathname: `/planningUnit/editPlanningUnit/${this.el.getValueFromCoords(0, x)}`,
                        });
                    }
                }
            }
        }
    }.bind(this);
    /**
     * Reterives the realm list on component mount
     */
    componentDidMount() {
        hideFirstComponent();
        if (AuthenticationService.getRealmId() == -1) {
            document.getElementById("realmDiv").style.display = "block"
            RealmService.getRealmListAll()
                .then(response => {
                    if (response.status == 200) {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            realms: listArray,
                            loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false, color: "#BA0C2F"
                        })
                        hideFirstComponent()
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
        } else {
            document.getElementById("realmDiv").style.display = "none"
            this.filterDataForRealm(AuthenticationService.getRealmId());
        }
    }
    /**
     * Redirects to the add planning unit screen.
     */
    addNewPlanningUnit() {
        if (localStorage.getItem("sessionType") === 'Online') {
            this.props.history.push(`/planningUnit/addPlanningUnit`)
        } else {
            alert(i18n.t('static.common.online'))
        }
    }
    /**
     * This function is called when user clicks on export to excel and shows the filters for user to select
     */
    toggleExport() {
        this.setState({
            exportModal: !this.state.exportModal,
        })
    }
    /**
     * This function is used to get planning unit list and export that list into csv file
     */
    getDataforExport() {
        this.setState({
            loadingModal: true
        })
        var tracerCategoryId = document.getElementById("tracerCategoryIdExport").value;
        var productCategoryId = document.getElementById("productCategoryIdExport").value;
        let forecastingUnitId = document.getElementById("forecastingUnitIdExport").value == "" ? null : document.getElementById("forecastingUnitIdExport").value;
        var json = {
            productCategorySortOrder: productCategoryId,
            tracerCategoryId: tracerCategoryId,
            forecastingUnitId: forecastingUnitId
        }
        PlanningUnitService.getPlanningUnitByTracerCategoryProductCategoryAndForecastingUnit(json).then(response => {
            if (response.status == 200) {
                var csvRow = [];
                csvRow.push('"' + (i18n.t('static.productcategory.productcategory') + ' : ' + document.getElementById("productCategoryIdExport").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
                csvRow.push('')
                csvRow.push('"' + (i18n.t('static.tracercategory.tracercategory') + ' : ' + document.getElementById("tracerCategoryIdExport").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
                csvRow.push('')
                csvRow.push('"' + (i18n.t('static.forecastingunit.forecastingunit') + ' : ' + document.getElementById("forecastingUnitIdExport").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
                csvRow.push('')
                csvRow.push('')
                csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
                csvRow.push('')
                var planningUnitList;
                this.setState({
                    exportModal: false,
                })
                if (response.data.length > 0) {
                    var A = [];
                    let tableHeadTemp = [];
                    tableHeadTemp.push(i18n.t('static.dataEntry.planningUnitId').replaceAll(' ', '%20'));
                    tableHeadTemp.push(i18n.t('static.product.productName').replaceAll(' ', '%20'));
                    tableHeadTemp.push(i18n.t('static.planningUnit.associatedForecastingUnit').replaceAll(' ', '%20'));
                    tableHeadTemp.push(i18n.t('static.planningUnit.planningUnitOfMeasure').replaceAll(' ', '%20'));
                    tableHeadTemp.push(i18n.t('static.planningUnit.labelMultiplier').replaceAll(' ', '%20'));
                    tableHeadTemp.push(i18n.t('static.common.lastModifiedBy').replaceAll(' ', '%20'));
                    tableHeadTemp.push(i18n.t('static.common.lastModifiedDate').replaceAll(' ', '%20'));
                    tableHeadTemp.push(i18n.t('static.common.status').replaceAll(' ', '%20'));
                    A[0] = addDoubleQuoteToRowContent(tableHeadTemp);
                    planningUnitList = response.data;
                    for (var j = 0; j < planningUnitList.length; j++) {
                        A.push([addDoubleQuoteToRowContent([planningUnitList[j].planningUnitId, (getLabelText(planningUnitList[j].label, this.state.lang) + " | " + planningUnitList[j].planningUnitId).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), (getLabelText(planningUnitList[j].forecastingUnit.label, this.state.lang) + " | " + planningUnitList[j].forecastingUnit.forecastingUnitId).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), getLabelText(planningUnitList[j].unit.label, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), (planningUnitList[j].multiplier).toString(), planningUnitList[j].lastModifiedBy.username.replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), moment(planningUnitList[j].lastModifiedDate).format(DATE_FORMAT_CAP), planningUnitList[j].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')])])
                    }
                    for (var i = 0; i < A.length; i++) {
                        csvRow.push(A[i].join(","))
                    }
                }
                var csvString = csvRow.join("%0A")
                var a = document.createElement("a")
                a.href = 'data:attachment/csv,' + csvString
                a.target = "_Blank"
                a.download = i18n.t('static.dashboard.planningunit') + ".csv"
                document.body.appendChild(a)
                a.click()
                this.setState({
                    loadingModal: false
                })
            } else {
                this.setState({
                    exportModal: false,
                    loadingModal: false
                })
            }
        }).catch(
            error => {
                this.setState({
                    exportModal: false,
                    loadingModal: false
                })
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
     * Renders the planning unit list.
     * @returns {JSX.Element} - Planning Unit list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { forecastingUnits } = this.state;
        let forecastingUnitList = forecastingUnits.length > 0
            && forecastingUnits.map((item, i) => {
                return (
                    <option key={i} value={item.forecastingUnitId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { tracerCategories } = this.state;
        let tracercategoryList = tracerCategories.length > 0
            && tracerCategories.map((item, i) => {
                return (
                    <option key={i} value={item.tracerCategoryId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { productCategories } = this.state;
        let productCategoryList = productCategories.length > 0
            && productCategories.map((item, i) => {
                return (
                    <option key={i} value={item.sortOrder}>
                        {getLabelText(item.payload.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.selSource.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_PLANNING_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewPlanningUnit}><i className="fa fa-plus-square"></i></a>}
                                <img className='ml-2' style={{ height: '25px', width: '25px', cursor: 'Pointer', marginTop: '-10px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.toggleExport()} />
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-5 pt-lg-2">
                        <Col md="9 pl-0" style={{ display: this.state.loading ? "none" : "block" }}>
                            <div className="d-md-flex  Selectdiv2 row">
                                <FormGroup className="col-md-3" id="realmDiv">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="realmId"
                                                id="realmId"
                                                bsSize="sm"
                                                onChange={this.dataChangeForRealm}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {realmList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="productCategoryId"
                                                id="productCategoryId"
                                                bsSize="sm"
                                            // onChange={this.filterData}
                                            >
                                                {productCategoryList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="tracerCategoryId"
                                                id="tracerCategoryId"
                                                bsSize="sm"
                                            // onChange={this.filterData}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                {tracercategoryList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.forecastingunit.forecastingunit')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="forecastingUnitId"
                                                id="forecastingUnitId"
                                                bsSize="sm"
                                            // onChange={this.filterData}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                {forecastingUnitList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup>
                                    <button className="btn btn-info btn-md showdatabtn ml-2" style={{ "marginTop": '20px' }} onClick={this.filterData}>{i18n.t('static.jexcel.search')}</button>
                                </FormGroup>
                            </div>
                        </Col>
                        <div className="consumptionDataEntryTable">
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_PLANNING_UNIT') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
                            </div>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                    <div class="spinner-border blue ml-4" role="status">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                    <Modal isOpen={this.state.exportModal}
                        className={'modal-md'}>
                        <ModalHeader toggle={() => this.toggleExport()} className="modalHeaderSupplyPlan" id="shipmentModalHeader">
                            <strong>{this.state.type == 1 ? i18n.t("static.supplyPlan.exportAsPDF") : i18n.t("static.supplyPlan.exportAsCsv")}</strong>
                        </ModalHeader>
                        <ModalBody>
                            <div style={{ display: this.state.loadingModal ? "none" : "block" }}>
                                <FormGroup className="col-md-12 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="productCategoryIdExport"
                                                id="productCategoryIdExport"
                                                bsSize="sm"
                                            // onChange={this.filterData}
                                            >
                                                {productCategoryList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-12">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="tracerCategoryIdExport"
                                                id="tracerCategoryIdExport"
                                                bsSize="sm"
                                            // onChange={this.filterData}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                {tracercategoryList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-12">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.forecastingunit.forecastingunit')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="forecastingUnitIdExport"
                                                id="forecastingUnitIdExport"
                                                bsSize="sm"
                                            // onChange={this.filterData}
                                            >
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                {forecastingUnitList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                            <div style={{ display: this.state.loadingModal ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "250px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                        <div class="spinner-border blue ml-4" role="status">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.getDataforExport()} ><i className="fa fa-check"></i>{i18n.t("static.common.submit")}</Button>
                        </ModalFooter>
                    </Modal>
                </Card>
            </div>
        );
    }
}
