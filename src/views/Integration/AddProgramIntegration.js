import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
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
import IntegrationService from '../../api/IntegrationService.js';
import ProgramService from "../../api/ProgramService.js";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.integration.programIntegration')
/**
 * Component for mapping program and intergations
 */
class ProgramIntegration extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            rows: [],
            loading: true,
            programs: [],
            integrations: [],
            versionTypes: [],
            versionStatus: [],
            program: {
                label: {
                    label_en: ''
                }
            },
            dataEL: ""
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.onPaste = this.onPaste.bind(this);
    }
    /**
     * Function to filter version status based on version type
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    filterVersionStatus = function (instance, cell, c, r, source) {
        var rowData = (this.state.dataEL.getJson(null, false)[r]);
        return (rowData[2] == 1 ? this.state.versionStatusArr.filter(c => c.id == 1) : this.state.versionStatusArr);
                
    }.bind(this);
    /**
     * Reterives program integartion by programId on component mount
     */
    componentDidMount() {
        IntegrationService.getProgramIntegrationByProgramId(this.props.match.params.programId).then(response => {
            if (response.status == 200) {
                let myResponse = response.data;
                if (myResponse.length > 0) {
                    this.setState({ rows: myResponse });
                }
                ProgramService.getProgramById(this.props.match.params.programId)
                    .then(response => {
                        if (response.status == 200) {
                            this.setState({
                                program: response.data
                            })
                            IntegrationService.getIntegrationListAll().then(response => {
                                if (response.status == 200) {
                                    var listArray = response.data;
                                    listArray.sort((a, b) => {
                                        var itemLabelA = (a.integrationName).toUpperCase(); 
                                        var itemLabelB = (b.integrationName).toUpperCase(); 
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    this.setState({
                                        integrations: listArray
                                    })
                                    ProgramService.getVersionStatusList().then(response => {
                                        if (response.status == 200) {
                                            var listArray = response.data;
                                            listArray.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                                                return itemLabelA > itemLabelB ? 1 : -1;
                                            });
                                            this.setState({
                                                versionStatus: listArray
                                            })
                                            ProgramService.getVersionTypeList().then(response => {
                                                if (response.status == 200) {
                                                    var listArray = response.data;
                                                    listArray.sort((a, b) => {
                                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); 
                                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); 
                                                        return itemLabelA > itemLabelB ? 1 : -1;
                                                    });
                                                    this.setState({
                                                        versionType: listArray
                                                    })
                                                    const { integrations } = this.state;
                                                    const { versionStatus } = this.state;
                                                    const { versionType } = this.state;
                                                    let integrationArr = [];
                                                    let versionStatusArr = [];
                                                    let versionTypeArr = [];
                                                    if (integrations.length > 0) {
                                                        for (var i = 0; i < integrations.length; i++) {
                                                            var paJson = {
                                                                name: integrations[i].integrationName,
                                                                id: parseInt(integrations[i].integrationId),
                                                            }
                                                            integrationArr[i] = paJson
                                                        }
                                                    }
                                                    if (versionStatus.length > 0) {
                                                        for (var i = 0; i < versionStatus.length; i++) {
                                                            var paJson = {
                                                                name: getLabelText(versionStatus[i].label, this.state.lang),
                                                                id: parseInt(versionStatus[i].id),
                                                            }
                                                            versionStatusArr[i] = paJson
                                                        }
                                                    }
                                                    if (versionType.length > 0) {
                                                        for (var i = 0; i < versionType.length; i++) {
                                                            var paJson = {
                                                                name: getLabelText(versionType[i].label, this.state.lang),
                                                                id: parseInt(versionType[i].id),
                                                            }
                                                            versionTypeArr[i] = paJson
                                                        }
                                                    }
                                                    this.setState({
                                                        integrationArr: integrationArr,
                                                        versionStatusArr: versionStatusArr,
                                                        versionTypeArr: versionTypeArr,
                                                    })
                                                    var papuList = this.state.rows;
                                                    var data = [];
                                                    var papuDataArr = [];
                                                    var count = 0;
                                                    if (papuList.length != 0) {
                                                        for (var j = 0; j < papuList.length; j++) {
                                                            data = [];
                                                            data[0] = this.state.program.label.label_en;
                                                            data[1] = parseInt(papuList[j].integration.integrationId);
                                                            data[2] = parseInt(papuList[j].versionType.id);
                                                            data[3] = parseInt(papuList[j].versionStatus.id);
                                                            data[4] = papuList[j].active;
                                                            data[5] = papuList[j].integrationProgramId;
                                                            data[6] = 0;
                                                            papuDataArr[count] = data;
                                                            count++;
                                                        }
                                                    }
                                                    if (papuDataArr.length == 0) {
                                                        data = [];
                                                        data[0] = this.state.program.label.label_en;
                                                        data[1] = "";
                                                        data[2] = "";
                                                        data[3] = "";
                                                        data[4] = true
                                                        data[5] = 0;
                                                        data[6] = 1;
                                                        papuDataArr[0] = data;
                                                    }
                                                    this.el = jexcel(document.getElementById("paputableDiv"), '');
                                                    jexcel.destroy(document.getElementById("paputableDiv"), true);
                                                    var data = papuDataArr;
                                                    var options = {
                                                        data: data,
                                                        columnDrag: false,
                                                        colWidths: [100, 100, 100, 100],
                                                        columns: [
                                                            {
                                                                title: i18n.t('static.budget.program'),
                                                                type: 'text',
                                                                readOnly: true
                                                            },
                                                            {
                                                                title: i18n.t('static.integration.integration'),
                                                                type: 'autocomplete',
                                                                source: integrationArr,
                                                            },
                                                            {
                                                                title: i18n.t('static.report.versiontype'),
                                                                type: 'autocomplete',
                                                                source: versionTypeArr,
                                                            },
                                                            {
                                                                title: i18n.t('static.integration.versionStatus'),
                                                                type: 'autocomplete',
                                                                source: versionStatusArr,
                                                                filter: this.filterVersionStatus
                                                            },
                                                            {
                                                                title: i18n.t('static.checkbox.active'),
                                                                type: 'checkbox'
                                                            },
                                                            {
                                                                title: 'integrationProgramId',
                                                                type: 'hidden'
                                                            },
                                                            {
                                                                title: 'isChange',
                                                                type: 'hidden'
                                                            }
                                                        ],
                                                        updateTable: function (el, cell, x, y, source, value, id) {
                                                            if (y != null) {
                                                                var elInstance = el;
                                                                var rowData = elInstance.getRowData(y);
                                                                var integrationProgramId = rowData[5];
                                                                if (integrationProgramId == 0) {
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
                                                        editable: true,
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
                                                                            data[0] = this.state.program.label.label_en;
                                                                            data[1] = "";
                                                                            data[2] = "";
                                                                            data[3] = "";
                                                                            data[4] = true;
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
                                                                            data[0] = this.state.program.label.label_en;
                                                                            data[1] = "";
                                                                            data[2] = "";
                                                                            data[3] = "";
                                                                            data[4] = true;
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
                                                    var varEL = ""
                                                    this.el = jexcel(document.getElementById("paputableDiv"), options);
                                                    varEL = this.el
                                                    this.setState({
                                                        dataEL: varEL,
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
        var data = [];
        data[0] = this.state.program.label.label_en;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = true;
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
                    (instance).setValueFromCoords(0, data[i].y, this.state.program.label.label_en, true);
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
        var validation = this.checkValidation();
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("6")) === 1) {
                    let json = {
                        integration: {
                            integrationId: parseInt(map1.get("1")),
                        },
                        versionType: {
                            id: parseInt(map1.get("2")),
                        },
                        versionStatus: {
                            id: parseInt(map1.get("3")),
                        },
                        program: {
                            id: this.state.program.programId,
                        },
                        integrationProgramId: parseInt(map1.get("5")),
                        active: map1.get("4")
                    }
                    changedpapuList.push(json);
                }
            }
            IntegrationService.addprogramIntegration(changedpapuList)
                .then(response => {
                    if (response.status == "200") {
                        this.props.history.push(`/program/listProgram/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        message: 'static.unkownError',
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
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
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
        if(x==1 || x==2 || x==3 || x==4){
            var col = ("B").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
            this.el.setComments(col, "");
            var col = ("C").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
            this.el.setComments(col, "");
            var col = ("D").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
            this.el.setComments(col, "");
            var col = ("E").concat(parseInt(y) + 1);
            this.el.setStyle(col, "background-color", "transparent");
            this.el.setComments(col, "");
        }
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
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);
        if (x == 2 && rowData[2] == 1) {
            elInstance.setValueFromCoords(3, y, 1, true);
        }

        // if (x == 2 && rowData[2] == 1) {
        //     elInstance.setValueFromCoords(3, y, 4, true);//i.e versionStatus = 4 (No Review Needed)
        // } else if (x == 2 && rowData[2] != 1) {
        //     elInstance.setValueFromCoords(3, y, '', true);//i.e versionStatus = ''
        // }
    }.bind(this);
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var checkDuplicate=json.filter(c=>c[0]==json[y][0] && c[1]==json[y][1] && c[2]==json[y][2] && c[3]==json[y][3] && c[4].toString()==json[y][4].toString());
            if(checkDuplicate.length>1 && json[y][6] && json[y][4]){
                this.setState({
                    message:'static.programIntegration.duplicateIntegration',
                },()=>{
                    hideSecondComponent();
                })
                valid = false;
            }else{
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
            }
        }
    }
        return valid;
    }
    /**
     * Renders the mapping of program integration.
     * @returns {JSX.Element} - Mapping of program integration.
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
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> {i18n.t('static.common.addRow')}</Button>
                                &nbsp;
                            </FormGroup>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )
    }
    /**
     * Redirects to list program screen on cancel clicked
     */
    cancelClicked() {
        this.props.history.push(`/program/listProgram/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}
export default ProgramIntegration
