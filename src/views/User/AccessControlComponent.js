import jexcel from 'jspreadsheet';
import React, { Component } from "react";
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col,
    FormGroup
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import DatasetService from "../../api/DatasetService";
import HealthAreaService from "../../api/HealthAreaService";
import OrganisationService from "../../api/OrganisationService";
import ProgramService from "../../api/ProgramService";
import RealmCountryService from "../../api/RealmCountryService";
import UserService from "../../api/UserService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
class AccessControlComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            lang: localStorage.getItem('lang'),
            countries: [],
            organisations: [],
            healthAreas: [],
            programs: [],
            realmCountryId: '-1',
            organisationId: '-1',
            healthAreaId: '-1',
            programId: '-1',
            countryName: 'All',
            healthAreaName: 'All',
            organisationName: 'All',
            programName: 'All',
            productName: '',
            selRealmCountry: [],
            realmCountryList: [],
            selOrganisation: [],
            selHealthArea: [],
            selProgram: [],
        }
        this.addRow = this.addRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.filterData = this.filterData.bind(this);
        this.filterOrganisation = this.filterOrganisation.bind(this);
        this.filterHealthArea = this.filterHealthArea.bind(this);
        this.filterProgram = this.filterProgram.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    filterProgram() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selProgram = this.state.programs.filter(c => c.realmCountry.realm.realmId == realmId && c.active.toString() == "true")
            this.setState({
                selProgram
            });
        } else {
            this.setState({
                selProgram: this.state.programs
            });
        }
    }
    filterHealthArea() {
        let realmId = this.state.user.realm.realmId;
        let selHealthArea;
        if (realmId != 0 && realmId != null) {
            selHealthArea = this.state.healthAreas.filter(c => c.realm.realmId == realmId)
        } else {
            selHealthArea = this.state.healthAreas
        }
        this.setState({
            selHealthArea
        });
    }
    filterOrganisation() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selOrganisation = this.state.organisations.filter(c => c.realm.realmId == realmId && c.active.toString() == "true")
            this.setState({
                selOrganisation
            });
        } else {
            this.setState({
                selOrganisation: this.state.organisations
            });
        }
    }
    filterData() {
        let realmId = this.state.user.realm.realmId;
        if (realmId != 0 && realmId != null) {
            const selRealmCountry = this.state.realmCountryList.filter(c => c.realm.realmId == realmId && c.active.toString() == "true")
            this.setState({
                selRealmCountry
            });
        } else {
            this.setState({
                selRealmCountry: this.state.realmCountryList
            });
        }
    }
    buildJexcel() {
        const { selProgram } = this.state;
        const { selRealmCountry } = this.state;
        const { selOrganisation } = this.state;
        const { selHealthArea } = this.state;
        let programList = [];
        let countryList = [];
        let organisationList = [];
        let healthAreaList = [];
        if (selProgram.length > 0) {
            for (var i = 0; i < selProgram.length; i++) {
                var name = selProgram[i].programCode + " (" + (selProgram[i].programTypeId == 1 ? "SP" : selProgram[i].programTypeId == 2 ? "FC" : "") + ")";
                var paJson = {
                    name: name,
                    id: parseInt(selProgram[i].programId),
                    active: selProgram[i].active
                }
                programList[i] = paJson
            }
            var paJson = {
                name: "All",
                id: -1,
                active: true
            }
            programList.unshift(paJson);
        }
        if (selRealmCountry.length > 0) {
            for (var i = 0; i < selRealmCountry.length; i++) {
                var paJson = {
                    name: getLabelText(selRealmCountry[i].country.label, this.state.lang),
                    id: parseInt(selRealmCountry[i].realmCountryId),
                    active: selRealmCountry[i].active
                }
                countryList[i] = paJson
            }
            var paJson = {
                name: "All",
                id: -1,
                active: true
            }
            countryList.unshift(paJson);
        }
        if (selOrganisation.length > 0) {
            for (var i = 0; i < selOrganisation.length; i++) {
                var paJson = {
                    name: getLabelText(selOrganisation[i].label, this.state.lang),
                    id: parseInt(selOrganisation[i].organisationId),
                    active: selOrganisation[i].active
                }
                organisationList[i] = paJson
            }
            var paJson = {
                name: "All",
                id: -1,
                active: true
            }
            organisationList.unshift(paJson);
        }
        if (selHealthArea.length > 0) {
            for (var i = 0; i < selHealthArea.length; i++) {
                var paJson = {
                    name: getLabelText(selHealthArea[i].label, this.state.lang),
                    id: parseInt(selHealthArea[i].healthAreaId),
                    active: selHealthArea[i].active
                }
                healthAreaList[i] = paJson
            }
            var paJson = {
                name: "All",
                id: -1,
                active: true
            }
            healthAreaList.unshift(paJson);
        }
        var papuList = this.state.rows;
        var data = [];
        var papuDataArr = [];
        var count = 0;
        if (papuList.length != 0) {
            for (var j = 0; j < papuList.length; j++) {
                data = [];
                data[0] = this.state.user.username;
                data[1] = papuList[j].realmCountryId;
                data[2] = papuList[j].healthAreaId;
                data[3] = papuList[j].organisationId;
                data[4] = papuList[j].programId;
                papuDataArr[count] = data;
                count++;
            }
        }
        if (papuDataArr.length == 0) {
            data = [];
            data[0] = this.state.user.username;
            papuDataArr[0] = data;
        }
        this.el = jexcel(document.getElementById("paputableDiv"), '');
        jexcel.destroy(document.getElementById("paputableDiv"), true);
        var json = [];
        var data = papuDataArr;
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
            columns: [
                {
                    title: i18n.t('static.username.username'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.program.realmcountry'),
                    type: 'autocomplete',
                    source: countryList,
                },
                {
                    title: i18n.t('static.dashboard.healthareaheader'),
                    type: 'autocomplete',
                    source: healthAreaList,
                },
                {
                    title: i18n.t('static.organisation.organisation'),
                    type: 'autocomplete',
                    source: organisationList,
                },
                {
                    title: i18n.t('static.dashboard.programheader'),
                    type: 'autocomplete',
                    source: programList,
                },
            ],
            editable: true,
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
            wordWrap: true,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            onchange: this.changed,
            oneditionend: this.onedit,
            copyCompatibility: true,
            parseFormulas: true,
            onpaste: this.onPaste,
            onload: this.loaded,
            license: JEXCEL_PRO_KEY,
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
                                data[0] = this.state.user.username;
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                obj.insertRow(data, parseInt(y), 1);
                            }.bind(this)
                        });
                    }
                    if (obj.options.allowInsertRow == true) {
                        items.push({
                            title: i18n.t('static.common.insertNewRowAfter'),
                            onclick: function () {
                                var data = [];
                                data[0] = this.state.user.username;
                                data[1] = "";
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                obj.insertRow(data, parseInt(y));
                            }.bind(this)
                        });
                    }
                    if (obj.options.allowDeleteRow == true) {
                        items.push({
                            title: i18n.t("static.common.deleterow"),
                            onclick: function () {
                                obj.deleteRow(parseInt(y));
                            }
                        });
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
    }
    addRow() {
        var data = [];
        data[0] = this.state.user.username;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        this.el.insertRow(
            data, 0, 1
        );
    }
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                (instance).setValueFromCoords(0, data[i].y, this.state.user.username, true);
                z = data[i].y;
            }
        }
    }
    submitForm() {
        var validation = this.checkValidation();
        if (validation) {
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                let json =
                {
                    userId: this.state.user.userId,
                    realmCountryId: parseInt(map1.get("1")),
                    healthAreaId: parseInt(map1.get("2")),
                    organisationId: parseInt(map1.get("3")),
                    programId: parseInt(map1.get("4")),
                }
                changedpapuList.push(json);
            }
            var user = {
                userId: this.state.user.userId,
                userAcls: changedpapuList
            }
            UserService.accessControls(user)
                .then(response => {
                    if (response.status == 200) {
                        this.props.history.push(`/user/listUser/green/${response.data.messageCode}`)
                    } else {
                        this.setState({
                            message: response.data.messageCode
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
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                    break;
                            }
                        }
                    }
                );
        }
    }
    componentDidMount() {
        RealmCountryService.getRealmCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.country.label, this.state.lang).toUpperCase(); 
                        var itemLabelB = getLabelText(b.country.label, this.state.lang).toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmCountryList: listArray,
                        selRealmCountry: listArray
                    })
                    OrganisationService.getOrganisationList()
                        .then(response => {
                            if (response.status == "200") {
                                var listArray = response.data;
                                listArray.sort((a, b) => {
                                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                                    return itemLabelA > itemLabelB ? 1 : -1;
                                });
                                this.setState({
                                    organisations: listArray,
                                    selOrganisation: listArray
                                });
                                HealthAreaService.getHealthAreaList()
                                    .then(response => {
                                        if (response.status == "200") {
                                            var listArray = response.data;
                                            listArray.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                                                return itemLabelA > itemLabelB ? 1 : -1;
                                            });
                                            this.setState({
                                                healthAreas: listArray.filter(c => c.active == true),
                                                selHealthArea: listArray.filter(c => c.active == true)
                                            });
                                            ProgramService.getProgramList()
                                                .then(response => {
                                                    if (response.status == "200") {
                                                        DatasetService.getDatasetList()
                                                            .then(response1 => {
                                                                if (response1.status == "200") {
                                                                    var listArray = [...response.data, ...response1.data]
                                                                    listArray.sort((a, b) => {
                                                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                                                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                                                                        return itemLabelA > itemLabelB ? 1 : -1;
                                                                    });
                                                                    this.setState({
                                                                        programs: listArray,
                                                                        selProgram: listArray
                                                                    });
                                                                }
                                                                UserService.getUserByUserId(this.props.match.params.userId)
                                                                    .then(response => {
                                                                        if (response.status == 200) {
                                                                            this.setState({
                                                                                user: response.data,
                                                                                rows: response.data.userAclList
                                                                            }, (
                                                                            ) => {
                                                                                this.filterData();
                                                                                this.filterOrganisation();
                                                                                this.filterHealthArea();
                                                                                this.filterProgram();
                                                                                this.buildJexcel();
                                                                            });
                                                                        } else {
                                                                            this.setState({
                                                                                message: response.data.messageCode
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
                                                            message: response.data.messageCode
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
                                        } else {
                                            this.setState({
                                                message: response.data.message
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
                                    message: response.data.messageCode
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
                } else {
                    this.setState({
                        message: response.data.messageCode
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
    changed = function (instance, cell, x, y, value) {
        this.setState({
            changedFlag: 1
        })
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
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
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
    }.bind(this);
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
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
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
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
        }
        return valid;
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
    }
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message)}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
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
                                <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup>
                        </CardFooter>
                    </Card>
                </div>
            </div >
        );
    }
    cancelClicked() {
        this.props.history.push(`/user/listUser/` + 'red/' + i18n.t('static.actionCancelled'))
    }
}
export default AccessControlComponent;
