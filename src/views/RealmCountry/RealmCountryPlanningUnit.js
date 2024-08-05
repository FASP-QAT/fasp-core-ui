import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form, InputGroupAddon, InputGroupText, InputGroup

} from 'reactstrap';
import { Date } from 'core-js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService";
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import PlanningUnitService from "../../api/PlanningUnitService";
import UnitService from "../../api/UnitService";
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
import { API_URL, JEXCEL_DECIMAL_NO_REGEX, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
let initialValues = {

    planningUnit: {
        id: '',
        label: {
            label_en: ''
        }
    }
    , label: { label_en: '' },
    skuCode: '',
    unit: {
        unitId: '',
        label: {
            label_en: ''
        }
    },
    multiplier: '',

    // gtin: '',
    active: true


}
const entityname = i18n.t('static.dashboad.planningunitcountry')

class PlanningUnitCountry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            units: [],
            lang: localStorage.getItem('lang'),
            planningUnitCountry: {},
            planningUnits: [],
            realmCountryPlanningUnitId: '',
            realmCountry: {
                realmCountryId: '',
                country: {
                    countryId: '',
                    label: {
                        label_en: ''
                    }
                },
                realm: {
                    realmId: '',
                    label: {
                        label_en: ''
                    }
                }
            }, realmCountryName: '',
            label: {
                label_en: ''
            },
            skuCode: '',
            multiplier: '',
            rows: [],
            planningUnit: {
                planningUnitId: '',
                label: {
                    label_en: ''
                }
            },
            unit: {
                unitId: '',
                label: {
                    label_en: ''
                }
            }, isNew: true,
            updateRowStatus: 0,
            loading: true
            // gtin:''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicatePlanningUnit = this.checkDuplicatePlanningUnit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`I${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(7, data[i].y, this.props.match.params.realmCountryId, true);
                    (instance).setValueFromCoords(8, data[i].y, 0, true);
                    (instance).setValueFromCoords(9, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }


    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        RealmCountryService.getPlanningUnitCountryForId(this.props.match.params.realmCountryId).then(response => {
            if (response.status == 200) {
                let myResponse = response.data;
                if (myResponse.length > 0) {
                    this.setState({ rows: myResponse });
                }
                RealmCountryService.getRealmCountryById(this.props.match.params.realmCountryId).then(response => {
                    if (response.status == 200) {
                        this.setState({
                            realmCountry: response.data
                        })
                        UnitService.getUnitListAll()
                            .then(response => {
                                if (response.status == 200) {
                                    this.setState({
                                        units: response.data
                                    })
                                    // PlanningUnitService.getAllPlanningUnitList()
                                    PlanningUnitService.getActivePlanningUnitList()
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.setState({
                                                    planningUnits: response.data
                                                })
                                            }
                                            const { planningUnits } = this.state;
                                            const { units } = this.state;

                                            let planningUnitArr = [];
                                            let unitArr = [];

                                            if (planningUnits.length > 0) {
                                                for (var i = 0; i < planningUnits.length; i++) {
                                                    var paJson = {
                                                        name: getLabelText(planningUnits[i].label, this.state.lang),
                                                        id: parseInt(planningUnits[i].planningUnitId)
                                                    }
                                                    planningUnitArr[i] = paJson
                                                }
                                            }
                                            if (units.length > 0) {
                                                for (var i = 0; i < units.length; i++) {
                                                    var paJson = {
                                                        name: getLabelText(units[i].label, this.state.lang),
                                                        id: parseInt(units[i].unitId)
                                                    }
                                                    unitArr[i] = paJson
                                                }
                                            }

                                            // Jexcel starts
                                            var papuList = this.state.rows;
                                            var data = [];
                                            var papuDataArr = [];

                                            var count = 0;
                                            if (papuList.length != 0) {
                                                for (var j = 0; j < papuList.length; j++) {

                                                    data = [];
                                                    data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                                                    data[1] = parseInt(papuList[j].planningUnit.id);
                                                    data[2] = papuList[j].label.label_en;
                                                    data[3] = papuList[j].skuCode;
                                                    data[4] = parseInt(papuList[j].unit.unitId);
                                                    data[5] = papuList[j].multiplier;
                                                    data[6] = papuList[j].active;
                                                    data[7] = this.props.match.params.realmCountryId;
                                                    data[8] = papuList[j].realmCountryPlanningUnitId;
                                                    data[9] = 0;
                                                    papuDataArr[count] = data;
                                                    count++;
                                                }
                                            }
                                            if (papuDataArr.length == 0) {
                                                data = [];
                                                data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                                                data[1] = "";
                                                data[2] = "";
                                                data[3] = "";
                                                data[4] = "";
                                                data[5] = "";
                                                data[6] = true;
                                                data[7] = this.props.match.params.realmCountryId;
                                                data[8] = 0;
                                                data[9] = 1;
                                                papuDataArr[0] = data;
                                            }


                                            this.el = jexcel(document.getElementById("paputableDiv"), '');
                                            // this.el.destroy();
                                            jexcel.destroy(document.getElementById("paputableDiv"), true);
                                            var json = [];
                                            var data = papuDataArr;
                                            var options = {
                                                data: data,
                                                columnDrag: true,
                                                colWidths: [100, 100, 100, 100, 100, 100, 100],
                                                columns: [

                                                    {
                                                        title: i18n.t('static.dashboard.realmcountry'),
                                                        type: 'text',
                                                        readOnly: true
                                                    },
                                                    {
                                                        title: i18n.t('static.planningunit.planningunit'),
                                                        type: 'autocomplete',
                                                        source: planningUnitArr

                                                    },
                                                    {
                                                        title: i18n.t('static.planningunit.countrysku'),
                                                        type: 'text',
                                                    },
                                                    {
                                                        title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
                                                        type: 'text',
                                                    },
                                                    {
                                                        title: i18n.t('static.unit.unit'),
                                                        type: 'autocomplete',
                                                        source: unitArr
                                                    },
                                                    {
                                                        title: i18n.t('static.unit.multiplier'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        mask: '#,##.00',
                                                        disabledMaskOnEdition: true

                                                    },

                                                    {
                                                        title: i18n.t('static.checkbox.active'),
                                                        type: 'checkbox'
                                                    },
                                                    {
                                                        title: 'realmCountryId',
                                                        type: 'hidden'
                                                        // title: 'A',
                                                        // type: 'text',
                                                        // visible: false
                                                    },
                                                    {
                                                        title: 'realmCountryPlanningUnitId',
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
                                                onpaste: this.onPaste,
                                                updateTable: function (el, cell, x, y, source, value, id) {
                                                    var elInstance = el;
                                                    var rowData = elInstance.getRowData(y);
                                                    var realmCountryPlanningUnitId = rowData[8];
                                                    if (realmCountryPlanningUnitId == 0) {
                                                        var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                                                        cell.classList.remove('readonly');
                                                    } else {
                                                        var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                                                        cell.classList.add('readonly');
                                                    }

                                                },
                                                onsearch: function (el) {
                                                    // el.jexcel.updateTable();
                                                },
                                                onfilter: function (el) {
                                                    // el.jexcel.updateTable();
                                                },
                                                pagination: localStorage.getItem("sesRecordCount"),
                                                filters: true,
                                                search: true,
                                                columnSorting: true,
                                                // tableOverflow: true,
                                                wordWrap: true,
                                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                                position: 'top',
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: true,
                                                onchange: this.changed,
                                                onblur: this.blur,
                                                onfocus: this.focus,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
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
                                                                    data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                                                                    data[1] = "";
                                                                    data[2] = "";
                                                                    data[3] = "";
                                                                    data[4] = "";
                                                                    data[5] = "";
                                                                    data[6] = true;
                                                                    data[7] = this.props.match.params.realmCountryId;
                                                                    data[8] = 0;
                                                                    data[9] = 1;
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
                                                                    data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
                                                                    data[1] = "";
                                                                    data[2] = "";
                                                                    data[3] = "";
                                                                    data[4] = "";
                                                                    data[5] = "";
                                                                    data[6] = true;
                                                                    data[7] = this.props.match.params.realmCountryId;
                                                                    data[8] = 0;
                                                                    data[9] = 1;
                                                                    obj.insertRow(data, parseInt(y));
                                                                }.bind(this)
                                                            });
                                                        }
                                                        // Delete a row
                                                        if (obj.options.allowDeleteRow == true) {
                                                            // region id
                                                            if (obj.getRowData(y)[8] == 0) {
                                                                items.push({
                                                                    title: i18n.t("static.common.deleterow"),
                                                                    onclick: function () {
                                                                        obj.deleteRow(parseInt(y));
                                                                    }
                                                                });
                                                            }
                                                        }

                                                        if (x) {
                                                            if (obj.options.allowComments == true) {
                                                                items.push({ type: 'line' });

                                                                var title = obj.records[y][x].getAttribute('title') || '';

                                                                items.push({
                                                                    title: title ? obj.options.text.editComments : obj.options.text.addComments,
                                                                    onclick: function () {
                                                                        obj.setComments([x, y], prompt(obj.options.text.comments, title));
                                                                    }
                                                                });

                                                                if (title) {
                                                                    items.push({
                                                                        title: obj.options.text.clearComments,
                                                                        onclick: function () {
                                                                            obj.setComments([x, y], '');
                                                                        }
                                                                    });
                                                                }
                                                            }
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



                                        })
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({
                                                        // message: 'static.unkownError',
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
                                            // message: 'static.unkownError',
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
                                    // message: 'static.unkownError',
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
                            // message: 'static.unkownError',
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
    addRow = function () {
        var json = this.el.getJson();
        var data = [];
        data[0] = this.state.realmCountry.realm.label.label_en + "-" + this.state.realmCountry.country.label.label_en;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = true;
        data[7] = this.props.match.params.realmCountryId;
        data[8] = 0;
        data[9] = 1;

        this.el.insertRow(
            data, 0, 1
        );
    };

    formSubmit = function () {
        var duplicateValidation = this.checkDuplicatePlanningUnit();
        var validation = this.checkValidation();
        if (validation == true) {
            var tableJson = this.el.getJson();
            // console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                // console.log("9 map---" + map1.get("9"))
                if (parseInt(map1.get("9")) === 1) {
                    let json = {
                        planningUnit: {
                            id: parseInt(map1.get("1"))
                        },
                        label: {
                            label_en: map1.get("2"),
                        },
                        skuCode: map1.get("3"),
                        unit: {
                            unitId: parseInt(map1.get("4"))
                        },
                        // multiplier: map1.get("5"),
                        multiplier: this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: map1.get("6"),
                        realmCountry: {
                            id: parseInt(map1.get("7"))
                        },
                        realmCountryPlanningUnitId: parseInt(map1.get("8"))
                    }
                    changedpapuList.push(json);
                }
            }
            // console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            RealmCountryService.editPlanningUnitCountry(changedpapuList)
                .then(response => {
                    // console.log(response.data);
                    if (response.status == "200") {
                        // console.log(response);
                        this.props.history.push(`/realmCountry/listRealmCountry/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                // message: 'static.unkownError',
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
            // console.log("Something went wrong");
        }
    }
    checkDuplicatePlanningUnit = function () {
        var tableJson = this.el.getJson();
        let count = 0;

        let tempArray = tableJson;
        // console.log('hasDuplicate------', tempArray);

        var hasDuplicate = false;
        tempArray.map(v => parseInt(v[Object.keys(v)[1]])).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        // console.log('hasDuplicate', hasDuplicate);
        if (hasDuplicate) {
            this.setState({
                message: i18n.t('static.country.duplicatePlanningUnit'),
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
        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[6].title = i18n.t("static.message.tooltipMultiplier")
    }

    blur = function (instance) {
        // console.log('on blur called');
    }

    focus = function (instance) {
        // console.log('on focus called');
    }
    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {

        //Planning Unit
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // this.el.setValueFromCoords(2, y, value, true);
                var text = this.el.getValueFromCoords(1, y);
                this.el.setValueFromCoords(2, y, text, true);
            }
        }

        //Country sku code
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            // var value = this.el.getValueFromCoords(2, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }


        //Sku code
        if (x == 3) {
            // console.log("-----------------3--------------------");
            var col = ("D").concat(parseInt(y) + 1);
            // var value = this.el.getValueFromCoords(3, y);
            // var reg = /^[a-zA-Z0-9\b]+$/;
            if (value == "") {
                // console.log("-----------------blank--------------------");
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            else {
                // console.log("-----------------3--------------------");
                // if (!(reg.test(value))) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     this.el.setComments(col, i18n.t('static.message.skucodevalid'));
                // } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                // }
            }
        }

        //Unit
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //Multiplier
        // if (x == 5) {
        //     var col = ("F").concat(parseInt(y) + 1);
        //     var reg = /^[0-9\b]+$/;
        //     if (value == "" || isNaN(parseInt(value)) || !(reg.test(value))) {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
        //     }
        //     else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }
        // }

        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            // var reg = /^[0-9\b]+$/;
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_NO_REGEX;
            if (value != "") {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
        }


        //Active
        if (x != 9) {
            this.el.setValueFromCoords(9, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        // console.log("------------onedit called")
        this.el.setValueFromCoords(9, y, 1, true);
    }.bind(this);

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson();
        // console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(9, y);
            if (parseInt(value) == 1) {

                //Planning Unit
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //Country Planning Unit
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

                //Sku Code
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                var reg = /^[a-zA-Z0-9\b]+$/;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    // if (!(reg.test(value))) {
                    //     this.el.setStyle(col, "background-color", "transparent");
                    //     this.el.setStyle(col, "background-color", "yellow");
                    //     this.el.setComments(col, i18n.t('static.message.skucodevalid'));
                    // } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    // }
                }

                // Unit
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(4, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //Multiplier
                // var col = ("F").concat(parseInt(y) + 1);
                // var value = this.el.getValueFromCoords(5, y);
                // // var reg = /^[0-9\b]+$/;
                // var reg = /^\s*(?=.*[1-9])\d{1,10}(?:\.\d{1,2})?\s*$/;
                // // // console.log("---------VAL----------", value);
                // if (value == "" || isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setStyle(col, "background-color", "yellow");
                //     valid = false;
                //     if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                //         this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                //     }
                //     else {
                //         this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                //     }
                // } else {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setComments(col, "");
                // }

                var col = ("F").concat(parseInt(y) + 1);
                value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_NO_REGEX;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (!(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }



            }
        }
        return valid;
    }
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
                                <div className='consumptionDataEntryTable'>
                                    <div id="paputableDiv" style={{ display: this.state.loading ? "none" : "block" }}>
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
    cancelClicked() {
        this.props.history.push(`/realmCountry/listRealmCountryPlanningUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default PlanningUnitCountry
