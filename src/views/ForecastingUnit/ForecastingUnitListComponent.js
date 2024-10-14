import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Button, Card, CardBody, Col, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, loadedForNonEditableTables } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_SM, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import DropdownService from '../../api/DropdownService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import ProductService from '../../api/ProductService';
import RealmService from '../../api/RealmService';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import csvicon from '../../assets/img/csv.png';
// Localized entity name
const entityname = i18n.t('static.forecastingunit.forecastingunit');
/**
 * Component for list of forecasting unit details.
 */
export default class ForecastingUnitListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            productCategories: [],
            tracerCategories: [],
            forecastingUnitList: [],
            message: '',
            selSource: [],
            lang: localStorage.getItem('lang'),
            realmId: '',
            loading: true,
            exportModal: false,
            loadingModal:false
        }
        this.addNewForecastingUnit = this.addNewForecastingUnit.bind(this);
        this.filterData = this.filterData.bind(this);
        this.filterDataForRealm = this.filterDataForRealm.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.dataChange=this.dataChange.bind(this);
    }
    /**
     * Builds the jexcel component to display forecasting unit list.
     */
    buildJexcel() {
        let forecastingUnitList = this.state.selSource;
        let forecastingUnitListArray = [];
        let count = 0;
        for (var j = 0; j < forecastingUnitList.length; j++) {           
            data = [];
            data[0] = forecastingUnitList[j].forecastingUnitId
            data[1] = getLabelText(forecastingUnitList[j].realm.label, this.state.lang)
            data[2] = getLabelText(forecastingUnitList[j].productCategory.label, this.state.lang)
            data[3] = getLabelText(forecastingUnitList[j].tracerCategory.label, this.state.lang)
            data[4] = getLabelText(forecastingUnitList[j].unit.label, this.state.lang)
            data[5] = getLabelText(forecastingUnitList[j].genericLabel, this.state.lang)
            data[6] = getLabelText(forecastingUnitList[j].label, this.state.lang) + " | " + forecastingUnitList[j].forecastingUnitId
            data[7] = forecastingUnitList[j].countOfSpPrograms + forecastingUnitList[j].countOfFcPrograms;
            data[8] = forecastingUnitList[j].lastModifiedBy.username;
            data[9] = (forecastingUnitList[j].lastModifiedDate ? moment(forecastingUnitList[j].lastModifiedDate).format(`YYYY-MM-DD`) : null)
            data[10] = forecastingUnitList[j].active;
            forecastingUnitListArray[count] = data;
            count++;
        }
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var data = forecastingUnitListArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [60, 150, 60, 100, 60, 60, 60, 100, 60],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.forecastingUnit.forecastingUnitId'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.realm.realm'),
                    type: (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') ? 'text' : 'hidden'),
                },
                {
                    title: i18n.t('static.productcategory.productcategory'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.tracercategory.tracercategory'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.unit.unit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.product.productgenericname'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.forecastingunit.forecastingunit'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.program.noOfProgramsUsingFU'),
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
                        { id: false, name: i18n.t('static.dataentry.inactive') }
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
                return false;
            }.bind(this),
        };
        var forecastingUnitListEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = forecastingUnitListEl;
        this.setState({
            forecastingUnitListEl: forecastingUnitListEl, loading: false
        })
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Filters data based on realm Id
     */
    filterDataForRealm() {
        this.setState({ loading: true })
        let realmId = document.getElementById("realmId").value;
        this.getProductCategories(realmId);
    }
    /**
     * Filters data based on product category and tracer category
     */
    filterData() {
        this.setState({
            loading: true
        })
        var json = {
            productCategorySortOrder: document.getElementById("productCategoryId").value,
            tracerCategoryId: document.getElementById("tracerCategoryId").value
        }
        ForecastingUnitService.getForecastingUnitListByProductCategoryAndTracerCategory(json)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        forecastingUnitList: response.data,
                        selSource: response.data,
                        loading: false
                    }, () => {
                        this.buildJexcel();
                    })
                } else {
                    this.setState({
                        forecastingUnitList: [],
                        selSource: [],
                        loading: false
                    },
                        () => {
                            this.buildJexcel();
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
     * Reterives product categories list from server
     */
    getProductCategories(realmId) {
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                this.setState({
                    productCategories: response.data,
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
     * Reterives Product category, real, tracer category and forecasting unit list on component mount
     */
    componentDidMount() {
        hideFirstComponent();
        if (!AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
            let realmId = AuthenticationService.getRealmId();
            this.getProductCategories(realmId);
        }
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
                        realmId: response.data[0].realmId,
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
                if (response.status == 200) {
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
    }
    /**
     * Redirects to the edit forecasting unit screen on row click.
     */
    selected = function (instance, cell, x, y, value, e) {
        if (e.buttons == 1) {
            if ((x == 0 && value != 0) || (y == 0)) {
            } else {
                if (this.state.selSource.length != 0) {
                    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECASTING_UNIT')) {
                        this.props.history.push({
                            pathname: `/forecastingUnit/editForecastingUnit/${this.el.getValueFromCoords(0, x)}`,
                        });
                    }
                }
            }
        }
    }.bind(this);
    /**
     * Redirects to the add forecasting unit screen.
     */
    addNewForecastingUnit() {
        if (localStorage.getItem("sessionType") === 'Online') {
            this.props.history.push(`/forecastingUnit/addForecastingUnit`)
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
            productCategoryIdExport:document.getElementById("productCategoryId").value,
            tracerCategoryIdExport:document.getElementById("tracerCategoryId").value
        },()=>{
        })
    }
    dataChange(e){
        if(e.target.name=="productCategoryIdExport"){
            this.setState({
                "productCategoryIdExport":e.target.value
            })
        }else if(e.target.name=="tracerCategoryIdExport"){
            this.setState({
                "tracerCategoryIdExport":e.target.value
            })
        }
    }
    /**
     * This function is used to get forecasting unit list and export that list into csv file
     */
    getDataforExport() {
        this.setState({
            loadingModal:true
        })
        var json = {
            productCategorySortOrder: document.getElementById("productCategoryIdExport").value,
            tracerCategoryId: document.getElementById("tracerCategoryIdExport").value
        }
        ForecastingUnitService.getForecastingUnitListByProductCategoryAndTracerCategory(json)
            .then(response => {
                if (response.status == 200) {
                    var csvRow = [];
                    csvRow.push('"' + (i18n.t('static.productcategory.productcategory') + ' : ' + document.getElementById("productCategoryIdExport").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
                    csvRow.push('')
                    csvRow.push('"' + (i18n.t('static.tracercategory.tracercategory') + ' : ' + document.getElementById("tracerCategoryIdExport").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
                    csvRow.push('')
                    csvRow.push('')
                    csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
                    csvRow.push('')
                    var forecastingUnitList;
                    this.setState({
                        exportModal: false,
                    })
                    if (response.data.length > 0) {
                        var A = [];
                        let tableHeadTemp = [];
                        tableHeadTemp.push(i18n.t('static.forecastingUnit.forecastingUnitId').replaceAll(' ', '%20'));
                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
                            tableHeadTemp.push(i18n.t('static.realm.realm').replaceAll(' ', '%20'));
                        }
                        tableHeadTemp.push(i18n.t('static.productcategory.productcategory').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.tracercategory.tracercategory').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.unit.unit').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.product.productgenericname').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.forecastingunit.forecastingunit').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.program.noOfProgramsUsingFU').replaceAll('#', '%23').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.common.lastModifiedBy').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.common.lastModifiedDate').replaceAll(' ', '%20'));
                        tableHeadTemp.push(i18n.t('static.common.status').replaceAll(' ', '%20'));
                        A[0] = addDoubleQuoteToRowContent(tableHeadTemp);
                        forecastingUnitList = response.data;
                        for (var j = 0; j < forecastingUnitList.length; j++) {
                            if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
                                A.push([addDoubleQuoteToRowContent([forecastingUnitList[j].forecastingUnitId, getLabelText(forecastingUnitList[j].realm.label, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), getLabelText(forecastingUnitList[j].productCategory.label, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), getLabelText(forecastingUnitList[j].tracerCategory.label, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), getLabelText(forecastingUnitList[j].unit.label, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), getLabelText(forecastingUnitList[j].genericLabel, this.state.lang) != null && getLabelText(forecastingUnitList[j].genericLabel, this.state.lang) != '' ? getLabelText(forecastingUnitList[j].genericLabel, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20') : "", (getLabelText(forecastingUnitList[j].label, this.state.lang) + " | " + forecastingUnitList[j].forecastingUnitId).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'),(forecastingUnitList[j].countOfSpPrograms + forecastingUnitList[j].countOfFcPrograms), forecastingUnitList[j].lastModifiedBy.username.replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), moment(forecastingUnitList[j].lastModifiedDate).format(DATE_FORMAT_CAP), forecastingUnitList[j].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')])])
                            } else {
                                A.push([addDoubleQuoteToRowContent([forecastingUnitList[j].forecastingUnitId, getLabelText(forecastingUnitList[j].productCategory.label, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), getLabelText(forecastingUnitList[j].tracerCategory.label, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), getLabelText(forecastingUnitList[j].unit.label, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), getLabelText(forecastingUnitList[j].genericLabel, this.state.lang) != null && getLabelText(forecastingUnitList[j].genericLabel, this.state.lang) != '' ? getLabelText(forecastingUnitList[j].genericLabel, this.state.lang).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20') : "", (getLabelText(forecastingUnitList[j].label, this.state.lang) + " | " + forecastingUnitList[j].forecastingUnitId).replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), (forecastingUnitList[j].countOfSpPrograms + forecastingUnitList[j].countOfFcPrograms), forecastingUnitList[j].lastModifiedBy.username.replaceAll('#', '%23').replaceAll(',', ' ').replaceAll(' ', '%20'), moment(forecastingUnitList[j].lastModifiedDate).format(DATE_FORMAT_CAP), forecastingUnitList[j].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')])])
                            }
                        }
                        for (var i = 0; i < A.length; i++) {
                            csvRow.push(A[i].join(","))
                        }
                    }
                    var csvString = csvRow.join("%0A")
                    var a = document.createElement("a")
                    a.href = 'data:attachment/csv,' + csvString
                    a.target = "_Blank"
                    a.download = i18n.t('static.dashboard.forecastingunit') + ".csv"
                    document.body.appendChild(a)
                    a.click()
                    this.setState({
                        loadingModal:false
                    })
                } else {
                    this.setState({
                        exportModal: false,
                        loadingModal:false
                    })
                }
            }).catch(
                error => {
                    this.setState({
                        exportModal: false,
                        loadingModal:false
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
     * Renders the forecasting unit list.
     * @returns {JSX.Element} - Forecasting unit list.
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
        const { tracerCategories } = this.state;
        let tracercategoryList = tracerCategories.length > 0
            && tracerCategories.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
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
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5 className={this.props.match.params.color} id="div1"><strong></strong>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_FORECASTING_UNIT') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewForecastingUnit}><i className="fa fa-plus-square"></i></a>}
                                <img className='ml-2' style={{ height: '25px', width: '25px', cursor: 'Pointer', marginTop: '-10px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.toggleExport()} />
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-5 pt-lg-2">
                        <Col md="9 pl-0">
                            <div className="d-md-flex  Selectdiv2">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN') &&
                                    <FormGroup className="mt-md-2 mb-md-0 ">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                        <div className="controls SelectField">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="realmId"
                                                    id="realmId"
                                                    bsSize="sm"
                                                    onChange={this.filterDataForRealm}
                                                >
                                                    <option value="-1">{i18n.t('static.common.all')}</option>
                                                    {realmList}
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                }
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                    <div className="controls SelectField">
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
                                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                    <div className="controls SelectField ">
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
                                <FormGroup>
                                    <button className="btn btn-info btn-md showdatabtn ml-4" style={{ "marginTop": '28px' }} onClick={this.filterData}>{i18n.t('static.jexcel.search')}</button>
                                </FormGroup>
                            </div>
                        </Col>
                        <div className='consumptionDataEntryTable'>
                            <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_FORECASTING_UNIT') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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
                                <FormGroup className="col-md-12">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="productCategoryIdExport"
                                                id="productCategoryIdExport"
                                                bsSize="sm"
                                                value={this.state.productCategoryIdExport}
                                                onChange={this.dataChange}
                                            >
                                                {/* <option value="">{i18n.t('static.common.select')}</option> */}
                                                {productCategoryList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-12">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                    <div className="controls ">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="tracerCategoryIdExport"
                                                id="tracerCategoryIdExport"
                                                bsSize="sm"
                                                value={this.state.tracerCategoryIdExport}
                                                onChange={this.dataChange}
                                            >
                                                {/* <option value="">{i18n.t('static.common.select')}</option> */}
                                                <option value="">{i18n.t('static.common.all')}</option>
                                                {tracercategoryList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                            <div style={{ display: this.state.loadingModal ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "200px" }} >
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
            </div >
        );
    }
}