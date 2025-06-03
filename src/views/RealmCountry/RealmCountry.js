import React, { Component } from "react";
import {
    Card, CardBody, 
    FormGroup,
    CardFooter, Button, Col
} from 'reactstrap';
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';
import CountryService from "../../api/CountryService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import RealmService from "../../api/RealmService";
import RealmCountryService from "../../api/RealmCountryService";
import CurrencyService from "../../api/CurrencyService";
import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import { hideSecondComponent } from "../../CommonComponent/JavascriptCommonFunctions";
// Localized entity name
const entityname = i18n.t('static.dashboard.realmcountry')
/**
 * Component for mapping realm with country.
 */
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
            shippedToArrivedByAirLeadTime: '0',
            shippedToArrivedBySeaLeadTime: '0',
            arrivedToDeliveredLeadTime: '0',
            rows: [],
            realm: {
                label: {
                    label_en: ''
                }
            }, isNew: true,
            updateRowStatus: 0,
            loading: true
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicateCountry = this.checkDuplicateCountry.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }
    /**
     * Function to filter active countries
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    filterCountry = function (instance, cell, c, r, source) {
        return this.state.countryArr.filter(c => c.active.toString() == "true");
    }.bind(this);
    /**
     * Function to filter active currency
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    filterCurrency = function (instance, cell, c, r, source) {
        return this.state.currencyArr.filter(c => c.active.toString() == "true");
    }.bind(this);
    /**
     * Fetches the realm country mapping list from the server and builds the jexcel component on component mount.
     */
    componentDidMount() {
        RealmCountryService.getRealmCountryrealmIdById(this.props.match.params.realmId).then(response => {
            if (response.status == 200) {
                let myResponse = response.data;
                if (myResponse.length > 0) {
                    this.setState({ rows: myResponse });
                }
                RealmService.getRealmById(this.props.match.params.realmId).then(response => {
                    if (response.status == 200) {
                        this.setState({
                            realm: response.data,
                        })
                        CountryService.getCountryListAll()
                            .then(response => {
                                if (response.status == 200) {
                                    var listArray = response.data;
                                    listArray.sort((a, b) => {
                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    this.setState({
                                        countries: listArray
                                    })
                                    CurrencyService.getCurrencyListActive().then(response => {
                                        if (response.status == 200) {
                                            var listArray = response.data;
                                            listArray.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                                                return itemLabelA > itemLabelB ? 1 : -1;
                                            });
                                            this.setState({
                                                currencies: listArray
                                            })
                                            const { countries } = this.state;
                                            const { currencies } = this.state;
                                            let countryArr = [];
                                            let currencyArr = [];
                                            if (countries.length > 0) {
                                                for (var i = 0; i < countries.length; i++) {
                                                    var paJson = {
                                                        name: getLabelText(countries[i].label, this.state.lang),
                                                        id: parseInt(countries[i].countryId),
                                                        active: countries[i].active,
                                                        countryCode: countries[i].countryCode
                                                    }
                                                    countryArr[i] = paJson
                                                }
                                            }
                                            if (currencies.length > 0) {
                                                for (var i = 0; i < currencies.length; i++) {
                                                    var paJson = {
                                                        name: getLabelText(currencies[i].label, this.state.lang),
                                                        id: parseInt(currencies[i].currencyId),
                                                        active: currencies[i].active
                                                    }
                                                    currencyArr[i] = paJson
                                                }
                                            }
                                            countryArr.sort(function (a, b) {
                                                var countryCodeA = a.countryCode.toUpperCase(); 
                                                var countryCodeB = b.countryCode.toUpperCase(); 
                                                if (countryCodeA < countryCodeB) {
                                                    return -1;
                                                }
                                                if (countryCodeA > countryCodeB) {
                                                    return 1;
                                                }
                                                return 0;
                                            });
                                            this.setState({
                                                countryArr: countryArr,
                                                currencyArr: currencyArr
                                            })
                                            var papuList = this.state.rows;
                                            var data = [];
                                            var papuDataArr = [];
                                            var count = 0;
                                            if (papuList.length != 0) {
                                                for (var j = 0; j < papuList.length; j++) {
                                                    data = [];
                                                    data[0] = this.state.realm.label.label_en;
                                                    data[1] = parseInt(papuList[j].country.countryId);
                                                    data[2] = parseInt(papuList[j].defaultCurrency.currencyId);
                                                    data[3] = papuList[j].active;
                                                    data[4] = this.props.match.params.realmId;
                                                    data[5] = papuList[j].realmCountryId;
                                                    data[6] = 0;
                                                    papuDataArr[count] = data;
                                                    count++;
                                                }
                                            }
                                            if (papuDataArr.length == 0) {
                                                data = [];
                                                data[0] = this.state.realm.label.label_en;
                                                data[1] = "";
                                                data[2] = "";
                                                data[3] = true;
                                                data[4] = this.props.match.params.realmId;
                                                data[5] = 0;
                                                data[6] = 1;
                                                papuDataArr[0] = data;
                                            }
                                            this.el = jexcel(document.getElementById("paputableDiv"), '');
                                            jexcel.destroy(document.getElementById("paputableDiv"), true);
                                            var json = [];
                                            var data = papuDataArr;
                                            var options = {
                                                data: data,
                                                columnDrag: false,
                                                colWidths: [100, 100, 100, 100],
                                                columns: [
                                                    {
                                                        title: i18n.t('static.realm.realm'),
                                                        type: 'text',
                                                        readOnly: true
                                                    },
                                                    {
                                                        title: i18n.t('static.dashboard.country'),
                                                        type: 'autocomplete',
                                                        source: countryArr,
                                                        filter: this.filterCountry
                                                    },
                                                    {
                                                        title: i18n.t('static.dashboard.currency'),
                                                        type: 'autocomplete',
                                                        source: currencyArr,
                                                        filter: this.filterCurrency
                                                    },
                                                    {
                                                        title: i18n.t('static.checkbox.active'),
                                                        type: 'checkbox'
                                                    },
                                                    {
                                                        title: 'realmId',
                                                        type: 'hidden'
                                                        // title: 'A',
                                                        // type: 'text',
                                                        // visible: false
                                                    },
                                                    {
                                                        title: 'realmCountryId',
                                                        type: 'hidden'
                                                        // title: 'A',
                                                        // type: 'text',
                                                        // visible: false
                                                    },
                                                    {
                                                        title: 'isChange',
                                                        type: 'hidden'
                                                        // title: 'A',
                                                        // type: 'text',
                                                        // visible: false
                                                    }
                                                ],
                                                updateTable: function (el, cell, x, y, source, value, id) {
                                                    if (y != null) {
                                                        var elInstance = el;
                                                        var rowData = elInstance.getRowData(y);
                                                        var realmCountryId = rowData[5];
                                                        if (realmCountryId == 0) {
                                                            var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                                                            cell1.classList.remove('readonly');
                                                        } else {
                                                            var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                                                            cell1.classList.add('readonly');
                                                        }
                                                    }
                                                },
                                                onsearch: function (el) {
                                                },
                                                onfilter: function (el) {
                                                },
                                                editable: true,
                                                pagination: localStorage.getItem("sesRecordCount"),
                                                filters: true,
                                                search: true,
                                                columnSorting: true,
                                                wordWrap: true,
                                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                                parseFormulas: true,
                                                position: 'top',
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: true,
                                                onchange: this.changed,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
                                                onpaste: this.onPaste,
                                                allowManualInsertRow: false,
                                                license: JEXCEL_PRO_KEY, onopenfilter:onOpenFilter, allowRenameColumn: false,
                                                onload: this.loaded,
                                                contextMenu: function (obj, x, y, e) {
                                                    var items = [];
                                                    if (y == null) {
                                                        if (obj.options.allowInsertColumn == true) {
                                                            items.push({
                                                                title: obj.options.text.insertANewColumnBefore,
                                                                onclick: function () {
                                                                    obj.insertColumn(1, parseInt(x), 1);
                                                                }
                                                            });
                                                        }
                                                        if (obj.options.allowInsertColumn == true) {
                                                            items.push({
                                                                title: obj.options.text.insertANewColumnAfter,
                                                                onclick: function () {
                                                                    obj.insertColumn(1, parseInt(x), 0);
                                                                }
                                                            });
                                                        }
                                                        if (obj.options.columnSorting == true) {
                                                            items.push({ type: 'line' });
                                                            items.push({
                                                                title: obj.options.text.orderAscending,
                                                                onclick: function () {
                                                                    obj.orderBy(x, 0);
                                                                }
                                                            });
                                                            items.push({
                                                                title: obj.options.text.orderDescending,
                                                                onclick: function () {
                                                                    obj.orderBy(x, 1);
                                                                }
                                                            });
                                                        }
                                                    } else {
                                                        if (obj.options.allowInsertRow == true) {
                                                            items.push({
                                                                title: i18n.t('static.common.insertNewRowBefore'),
                                                                onclick: function () {
                                                                    var data = [];
                                                                    data[0] = this.state.realm.label.label_en;
                                                                    data[1] = "";
                                                                    data[2] = "";
                                                                    data[3] = true;
                                                                    data[4] = this.props.match.params.realmId;
                                                                    data[5] = 0;
                                                                    data[6] = 1;
                                                                    obj.insertRow(data, parseInt(y), 1);
                                                                }.bind(this)
                                                            });
                                                        }
                                                        if (obj.options.allowInsertRow == true) {
                                                            items.push({
                                                                title: i18n.t('static.common.insertNewRowAfter'),
                                                                onclick: function () {
                                                                    var data = [];
                                                                    data[0] = this.state.realm.label.label_en;
                                                                    data[1] = "";
                                                                    data[2] = "";
                                                                    data[3] = true;
                                                                    data[4] = this.props.match.params.realmId;
                                                                    data[5] = 0;
                                                                    data[6] = 1;
                                                                    obj.insertRow(data, parseInt(y));
                                                                }.bind(this)
                                                            });
                                                        }
                                                        if (obj.options.allowDeleteRow == true) {
                                                            if (obj.getRowData(y)[5] == 0) {
                                                                items.push({
                                                                    title: i18n.t("static.common.deleterow"),
                                                                    onclick: function () {
                                                                        obj.deleteRow(parseInt(y));
                                                                    }
                                                                });
                                                            }
                                                        }
                                                        if (x) {
                                                        }
                                                    }
                                                    items.push({ type: 'line' });
                                                    return items;
                                                }.bind(this)
                                            };
                                            this.el = jexcel(document.getElementById("paputableDiv"), options);
                                            this.setState({
                                                loading: false
                                            })
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode
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
                                        message: response.data.messageCode
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
                            message: response.data.messageCode
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
                    message: response.data.messageCode
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
     * Function to add a new row to the jexcel table.
     */
    addRow = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = this.state.realm.label.label_en;
        data[1] = "";
        data[2] = "";
        data[3] = true;
        data[4] = this.props.match.params.realmId;
        data[5] = 0;
        data[6] = 1;
        this.el.insertRow(
            data, 0, 1
        );
    };
    /**
     * Function to handle paste events in the jexcel table.
     * @param {Object} instance - The jexcel instance.
     * @param {Array} data - The data being pasted.
     */
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`F${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(0, data[i].y, this.state.realm.label.label_en, true);
                    (instance).setValueFromCoords(5, data[i].y, 0, true);
                    (instance).setValueFromCoords(6, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }
    /**
     * Function to handle form submission and save the data on server.
     */
    formSubmit = function () {
        var duplicateValidation = this.checkDuplicateCountry();
        var validation = this.checkValidation();
        if (validation == true && duplicateValidation == true) {
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("6")) === 1) {
                    let json = {
                        country: {
                            countryId: parseInt(map1.get("1"))
                        },
                        defaultCurrency: {
                            currencyId: parseInt(map1.get("2"))
                        },
                        active: map1.get("3"),
                        realm: {
                            realmId: parseInt(map1.get("4"))
                        },
                        realmCountryId: parseInt(map1.get("5"))
                    }
                    changedpapuList.push(json);
                }
            }
            RealmCountryService.addRealmCountry(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
                        this.props.history.push(`/realm/listRealm/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                    } else {
                        this.setState({
                            message: response.data.messageCode
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
                                case 406:
                                    this.setState({
                                        message: i18n.t('static.message.alreadExists'),
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
        }
    }
    /**
     * Function to check for duplicate countries.
     * @returns Returns true if there are no duplicates, false otherwise.
     */
    checkDuplicateCountry = function () {
        var tableJson = this.el.getJson(null, false);
        let count = 0;
        let tempArray = tableJson;
        var hasDuplicate = false;
        tempArray.map(v => v[Object.keys(v)[1]]).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        if (hasDuplicate) {
            this.setState({
                message: i18n.t('static.country.duplicateCountry'),
                changedFlag: 0,
            },
                () => {
                    hideSecondComponent();
                })
            return false;
        } else {
            return true;
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
    }
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed = function (instance, cell, x, y, value) {
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x != 6) {
            this.el.setValueFromCoords(6, y, 1, true);
        }
    }.bind(this);
    /**
     * Function to handle cell edits in jexcel.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object being edited.
     * @param {number} x - The x-coordinate of the edited cell.
     * @param {number} y - The y-coordinate of the edited cell.
     * @param {any} value - The new value of the edited cell.
     */
    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(6, y, 1, true);
    }.bind(this);
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(6, y);
            if (parseInt(value) == 1) {
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        return valid;
    }
    /**
     * Renders the realm country mapping list.
     * @returns {JSX.Element} - Realm country mapping list.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <div>
                    <Card>
                        <CardBody className="p-0">
                            <Col xs="12" sm="12">
                                <div id="paputableDiv" className="consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> {i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )
    }
    /**
     * Redirects to the list realm screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/realm/listRealm/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}
export default RealmCountry
