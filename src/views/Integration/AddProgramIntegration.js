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
import IntegrationService from '../../api/IntegrationService.js';
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ProgramService from "../../api/ProgramService.js";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";

const entityname = i18n.t('static.integration.programIntegration')

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
            }
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
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

    filterVersionStatus = function (instance, cell, c, r, source) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(r);
        console.log("RESPO---------2", rowData[2]);
        // return this.state.countryArr.filter(c => c.active.toString() == "true");
        // if (rowData[2] == 1) {
        //     elInstance.setValueFromCoords(3, r, 1, true);
        // }
        return (rowData[2] == 1 ? this.state.versionStatusArr.filter(c => c.id == 1) : this.state.versionStatusArr);
    }.bind(this);

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        IntegrationService.getProgramIntegrationByProgramId(this.props.match.params.programId).then(response => {
            if (response.status == 200) {
                console.log("getProgramIntegrationByProgramId---", response.data);
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
                            //A
                            IntegrationService.getIntegrationListAll().then(response => {
                                if (response.status == 200) {
                                    var listArray = response.data;
                                    listArray.sort((a, b) => {
                                        var itemLabelA = (a.integrationName).toUpperCase(); // ignore upper and lowercase
                                        var itemLabelB = (b.integrationName).toUpperCase(); // ignore upper and lowercase                   
                                        return itemLabelA > itemLabelB ? 1 : -1;
                                    });
                                    this.setState({
                                        integrations: listArray
                                    })
                                    //B
                                    ProgramService.getVersionStatusList().then(response => {
                                        if (response.status == 200) {
                                            var listArray = response.data;
                                            listArray.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                                var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                                return itemLabelA > itemLabelB ? 1 : -1;
                                            });
                                            this.setState({
                                                versionStatus: listArray
                                            })

                                            //C
                                            ProgramService.getVersionTypeList().then(response => {
                                                if (response.status == 200) {
                                                    var listArray = response.data;
                                                    listArray.sort((a, b) => {
                                                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                                        return itemLabelA > itemLabelB ? 1 : -1;
                                                    });
                                                    this.setState({
                                                        versionType: listArray
                                                    })
                                                    //-----------------------

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
                                                    // Jexcel starts
                                                    var papuList = this.state.rows;
                                                    var data = [];
                                                    var papuDataArr = [];
                                                    console.log("Success-----------", papuList);
                                                    var count = 0;
                                                    if (papuList.length != 0) {
                                                        for (var j = 0; j < papuList.length; j++) {

                                                            // data = [];
                                                            // data[0] = this.state.realm.label.label_en;
                                                            // data[1] = parseInt(papuList[j].country.countryId);
                                                            // data[2] = parseInt(papuList[j].defaultCurrency.currencyId);
                                                            // data[3] = papuList[j].active;
                                                            // data[4] = this.props.match.params.realmId;
                                                            // data[5] = papuList[j].realmCountryId;
                                                            // data[6] = 0;
                                                            // papuDataArr[count] = data;
                                                            // count++;

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
                                                    this.el.destroy();
                                                    var json = [];
                                                    var data = papuDataArr;
                                                    var options = {
                                                        data: data,
                                                        columnDrag: true,
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
                                                                var elInstance = el.jexcel;
                                                                var rowData = elInstance.getRowData(y);
                                                                // var productCategoryId = rowData[0];
                                                                var integrationProgramId = rowData[5];
                                                                if (integrationProgramId == 0) {
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
                                                                // after
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

                                                    //---------------------
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
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`F${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(0, data[i].y, this.state.program.label.label_en, true);
                    (instance.jexcel).setValueFromCoords(5, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(6, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }
    formSubmit = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            var tableJson = this.el.getJson(null, false);
            console.log("tableJson---", tableJson);
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                console.log("6 map---" + map1.get("6"))
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
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            IntegrationService.addprogramIntegration(changedpapuList)
                .then(response => {
                    console.log(response.data);
                    if (response.status == "200") {
                        console.log(response);
                        this.props.history.push(`/program/listProgram/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        message: 'static.unkownError',
                                        // message: i18n.t('static.message.alreadExists'),
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

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        // tr.children[].classList.add('AsteriskTheadtrTd');
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

        //Integration
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
        //VersionType
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
        //VersionStatus
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
        //Active
        if (x != 6) {
            this.el.setValueFromCoords(6, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        console.log("------------onedit called")
        this.el.setValueFromCoords(6, y, 1, true);

        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);
        if (x == 2 && rowData[2] == 1) {
            elInstance.setValueFromCoords(3, y, 1, true);
        }
    }.bind(this);

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(6, y);
            if (parseInt(value) == 1) {

                //Integration
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

                //VersionType
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

                //VersionStatus
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
        return valid;
    }
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
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
        this.props.history.push(`/program/listProgram/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}

export default ProgramIntegration

