import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import { Date } from 'core-js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';
import CountryService from "../../api/CountryService";
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import RealmService from "../../api/RealmService";
import RealmCountryService from "../../api/RealmCountryService";
import CurrencyService from "../../api/CurrencyService";
import UnitService from "../../api/UnitService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
let initialValues = {
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
    }, countryName: ''
}
const entityname = i18n.t('static.dashboard.realmcountry')

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
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    filterCountry = function (instance, cell, c, r, source) {
        return this.state.countryArr.filter(c => c.active.toString() == "true");
    }.bind(this);

    filterCurrency = function (instance, cell, c, r, source) {
        return this.state.currencyArr.filter(c => c.active.toString() == "true");
    }.bind(this);

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.getRealmCountryrealmIdById(this.props.match.params.realmId).then(response => {
            if (response.status == 200) {
                console.log("getRealmCountryrealmIdById---", response.data);
                let myResponse = response.data;
                if (myResponse.length > 0) {
                    this.setState({ rows: myResponse });
                }
                RealmService.getRealmById(this.props.match.params.realmId).then(response => {
                    if (response.status == 200) {
                        console.log(response.data);
                        this.setState({
                            realm: response.data,
                            //  rows:response.data
                        })
                        CountryService.getCountryListAll()
                            .then(response => {
                                if (response.status == 200) {
                                    console.log("CountryService--------", response.data)
                                    var listArray = response.data;
                                    listArray.sort((a, b) => {
                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    this.setState({
                                        countries: listArray
                                    })
                                    CurrencyService.getCurrencyListActive().then(response => {
                                        if (response.status == 200) {
                                            var listArray = response.data;
                                            listArray.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                                                var countryCodeA = a.countryCode.toUpperCase(); // ignore upper and lowercase
                                                var countryCodeB = b.countryCode.toUpperCase(); // ignore upper and lowercase
                                                if (countryCodeA < countryCodeB) {
                                                    return -1;
                                                }
                                                if (countryCodeA > countryCodeB) {
                                                    return 1;
                                                }

                                                // names must be equal
                                                return 0;
                                            });
                                            this.setState({
                                                countryArr: countryArr,
                                                currencyArr: currencyArr
                                            })
                                            // Jexcel starts
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
                                            this.el.destroy();
                                            var json = [];
                                            var data = papuDataArr;
                                            var options = {
                                                data: data,
                                                columnDrag: true,
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
                                                    },
                                                    {
                                                        title: 'realmCountryId',
                                                        type: 'hidden'
                                                    },
                                                    {
                                                        title: 'isChange',
                                                        type: 'hidden'
                                                    }

                                                ],
                                                updateTable: function (el, cell, x, y, source, value, id) {
                                                    if (y != null) {
                                                        var elInstance = el.jexcel;
                                                        var rowData = elInstance.getRowData(y);
                                                        // var productCategoryId = rowData[0];
                                                        var realmCountryId = rowData[5];
                                                        if (realmCountryId == 0) {
                                                            var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                                                            cell1.classList.remove('readonly');

                                                            // var cell2 = elInstance.getCell(`C${parseInt(y) + 1}`)
                                                            // cell2.classList.remove('readonly');


                                                        } else {
                                                            var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                                                            cell1.classList.add('readonly');

                                                            // var cell2 = elInstance.getCell(`C${parseInt(y) + 1}`)
                                                            // cell2.classList.add('readonly');


                                                        }
                                                    }
                                                },
                                                onsearch: function (el) {
                                                    el.jexcel.updateTable();
                                                },
                                                onfilter: function (el) {
                                                    el.jexcel.updateTable();
                                                },
                                                pagination: localStorage.getItem("sesRecordCount"),
                                                filters: true,
                                                search: true,
                                                columnSorting: true,
                                                tableOverflow: true,
                                                wordWrap: true,
                                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                                parseFormulas: true,
                                                position: 'top',
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: true,
                                                onchange: this.changed,
                                                onblur: this.blur,
                                                onfocus: this.focus,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
                                                onpaste: this.onPaste,
                                                allowManualInsertRow: false,
                                                license: JEXCEL_PRO_KEY,
                                                text: {
                                                    // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                                    show: '',
                                                    entries: '',
                                                },
                                                onload: this.loaded,
                                                contextMenu: function (obj, x, y, e) {
                                                    var items = [];
                                                    //Add consumption batch info


                                                    if (y == null) {
                                                        // Insert a new column
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

                                                        // Delete a column
                                                        // if (obj.options.allowDeleteColumn == true) {
                                                        //     items.push({
                                                        //         title: obj.options.text.deleteSelectedColumns,
                                                        //         onclick: function () {
                                                        //             obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
                                                        //         }
                                                        //     });
                                                        // }

                                                        // Rename column
                                                        // if (obj.options.allowRenameColumn == true) {
                                                        //     items.push({
                                                        //         title: obj.options.text.renameThisColumn,
                                                        //         onclick: function () {
                                                        //             obj.setHeader(x);
                                                        //         }
                                                        //     });
                                                        // }

                                                        // Sorting
                                                        if (obj.options.columnSorting == true) {
                                                            // Line
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
                                                        // Insert new row before
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
                                                        // after
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
                                                        // Delete a row
                                                        if (obj.options.allowDeleteRow == true) {
                                                            // region id
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
                                                            // if (obj.options.allowComments == true) {
                                                            //     items.push({ type: 'line' });

                                                            //     var title = obj.records[y][x].getAttribute('title') || '';

                                                            //     items.push({
                                                            //         title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                            //         onclick: function () {
                                                            //             obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                            //         }
                                                            //     });

                                                            //     if (title) {
                                                            //         items.push({
                                                            //             title: obj.options.text.clearComments,
                                                            //             onclick: function () {
                                                            //                 obj.setComments([x, y], '');
                                                            //             }
                                                            //         });
                                                            //     }
                                                            // }
                                                        }
                                                    }

                                                    // Line
                                                    items.push({ type: 'line' });

                                                    // // Save
                                                    // if (obj.options.allowExport) {
                                                    //     items.push({
                                                    //         title: i18n.t('static.supplyPlan.exportAsCsv'),
                                                    //         shortcut: 'Ctrl + S',
                                                    //         onclick: function () {
                                                    //             obj.download(true);
                                                    //         }
                                                    //     });
                                                    // }

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
                                                    this.hideSecondComponent();
                                                })
                                        }
                                    })
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({
                                                        message: 'static.unkownError',
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
                                        message: response.data.messageCode
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }

                            })
                            .catch(
                                error => {
                                    if (error.message === "Network Error") {
                                        this.setState({
                                            message: 'static.unkownError',
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
                            message: response.data.messageCode
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }

                })
                    .catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
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
                    message: response.data.messageCode
                },
                    () => {
                        this.hideSecondComponent();
                    })
            }

        })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`F${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(0, data[i].y, this.state.realm.label.label_en, true);
                    (instance.jexcel).setValueFromCoords(5, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(6, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }
    formSubmit = function () {
        var duplicateValidation = this.checkDuplicateCountry();
        var validation = this.checkValidation();
        if (validation == true && duplicateValidation == true) {
            var tableJson = this.el.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("6 map---" + map1.get("6"))
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
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            RealmCountryService.addRealmCountry(changedpapuList)
                .then(response => {
                    console.log(response.data);
                    if (response.status == "200") {
                        console.log(response);
                        this.props.history.push(`/realm/listRealm/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                    } else {
                        this.setState({
                            message: response.data.messageCode
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }

                })
                .catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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
                                        // message: error.response.data.messageCode,
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
            console.log("Something went wrong");
        }
    }
    checkDuplicateCountry = function () {
        var tableJson = this.el.getJson(null, false);
        let count = 0;

        let tempArray = tableJson;
        console.log('hasDuplicate------', tempArray);

        var hasDuplicate = false;
        tempArray.map(v => v[Object.keys(v)[1]]).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        console.log('hasDuplicate', hasDuplicate);
        if (hasDuplicate) {
            this.setState({
                message: i18n.t('static.country.duplicateCountry'),
                changedFlag: 0,

            },
                () => {
                    this.hideSecondComponent();
                })
            return false;
        } else {
            return true;
        }
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
    }

    blur = function (instance) {
        console.log('on blur called');
    }

    focus = function (instance) {
        console.log('on focus called');
    }
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {

        //Country
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
        //Currency
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
        //Active
        if (x != 6) {
            this.el.setValueFromCoords(6, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        console.log("------------onedit called")
        this.el.setValueFromCoords(6, y, 1, true);
    }.bind(this);

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(6, y);
            if (parseInt(value) == 1) {

                //Country
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
                //Currency
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
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <div>
                    <Card>
                        <CardBody className="p-0">

                            <Col xs="12" sm="12">

                                <div id="paputableDiv" style={{ display: this.state.loading ? "none" : "block" }}>
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
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                &nbsp;
</FormGroup>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        )
    }
    cancelClicked() {
        this.props.history.push(`/realm/listRealm/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}

export default RealmCountry

