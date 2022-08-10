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
import ProgramService from "../../api/ProgramService";
import AuthenticationService from "../Common/AuthenticationService";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import PlanningUnitService from "../../api/PlanningUnitService";
import UnitService from "../../api/UnitService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DECIMAL_CATELOG_PRICE } from "../../Constants";

const entityname = i18n.t('static.countrySpecificPrices.countrySpecificPrices')

class CountrySpecificPrices extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            programs: [],
            procurementAgents: [],
            procurementAgent: {
                id: '',
                label: {
                    label_en: ''
                }
            },
            planningUnit: {
                id: '',
                label: {
                    label_en: ''
                }
            },
            programPlanningUnit: '',
            rows: [],
            isNew: true,
            updateRowStatus: 0,
            loading: true
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.changed = this.changed.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    filterProgram = function (instance, cell, c, r, source) {
        return this.state.procurementAgentArr.filter(c => c.active.toString() == "true");
    }.bind(this);

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.getCountrySpecificPricesList(this.props.match.params.programPlanningUnitId).then(response => {
            if (response.status == 200) {
                console.log("getProcurementAgentPlaningUnitList---", response.data);
                let myResponse = response.data;
                if (myResponse.length > 0) {
                    this.setState({ rows: myResponse });
                }
                ProgramService.getProgramPlaningUnitListByProgramId(this.props.match.params.programId).then(response => {
                    if (response.status == 200) {
                        console.log(response.data);
                        let programPlanningUnit = response.data.filter(c => c.programPlanningUnitId == this.props.match.params.programPlanningUnitId)[0];
                        console.log("Success-------->", programPlanningUnit);
                        this.setState({
                            programPlanningUnit: programPlanningUnit,
                            //  rows:response.data
                        })

                        ProcurementAgentService.getProcurementAgentListAll().then(response => {
                            if (response.status == 200) {
                                console.log(response.data);
                                console.log("Success-------->1", response.data);
                                this.setState({
                                    procurementAgents: response.data,
                                    //  rows:response.data
                                })

                                const { procurementAgents } = this.state;

                                let procurementAgentArr = [];

                                if (procurementAgents.length > 0) {
                                    for (var i = 0; i < procurementAgents.length; i++) {
                                        var paJson = {
                                            name: getLabelText(procurementAgents[i].label, this.state.lang),
                                            id: parseInt(procurementAgents[i].procurementAgentId),
                                            active: procurementAgents[i].active,
                                            code: procurementAgents[i].procurementAgentCode,
                                        }
                                        procurementAgentArr[i] = paJson
                                    }
                                }
                                console.log("Success-------->2", response.data);
                                procurementAgentArr.sort(function (a, b) {
                                    var itemLabelA = a.name.toUpperCase(); // ignore upper and lowercase
                                    var itemLabelB = b.name.toUpperCase(); // ignore upper and lowercase
                                    if (itemLabelA < itemLabelB) {
                                        return -1;
                                    }
                                    if (itemLabelA > itemLabelB) {
                                        return 1;
                                    }

                                    // names must be equal
                                    return 0;
                                });
                                console.log("Success-------->3", response.data);
                                this.setState({
                                    procurementAgentArr: procurementAgentArr,
                                })
                                // Jexcel starts
                                var papuList = this.state.rows;
                                var data = [];
                                var papuDataArr = [];

                                var count = 0;
                                if (papuList.length != 0) {
                                    for (var j = 0; j < papuList.length; j++) {

                                        data = [];
                                        data[0] = this.state.programPlanningUnit.program.label.label_en;
                                        data[1] = this.state.programPlanningUnit.planningUnit.label.label_en;
                                        data[2] = parseInt(papuList[j].procurementAgent.id);
                                        data[3] = papuList[j].price;
                                        data[4] = papuList[j].active;
                                        data[5] = papuList[j].programPlanningUnitId;
                                        data[6] = papuList[j].programPlanningUnitProcurementAgentId;
                                        data[7] = 0;

                                        papuDataArr[count] = data;
                                        count++;
                                    }
                                }
                                if (papuDataArr.length == 0) {
                                    data = [];
                                    data[0] = this.state.programPlanningUnit.program.label.label_en;
                                    data[1] = this.state.programPlanningUnit.planningUnit.label.label_en;
                                    data[2] = "";
                                    data[3] = "";
                                    data[4] = true;
                                    data[5] = this.props.match.params.programPlanningUnitId;
                                    data[6] = 0;
                                    data[7] = 1;
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
                                            title: i18n.t('static.program.programMaster'),
                                            type: 'text',
                                            readOnly: true
                                        },
                                        {
                                            title: i18n.t('static.product.product'),
                                            type: 'text',
                                            readOnly: true
                                        },

                                        {
                                            title: i18n.t('static.report.procurementAgentName'),
                                            type: 'autocomplete',
                                            source: procurementAgentArr,
                                            filter: this.filterProgram

                                        },
                                        {
                                            title: i18n.t('static.price.prices'),
                                            type: 'numeric',
                                            textEditor: true,
                                            decimal: '.',
                                            mask: '#,##.00',
                                            disabledMaskOnEdition: true
                                        },
                                        {
                                            title: i18n.t('static.checkbox.active'),
                                            type: 'checkbox'
                                        },
                                        {
                                            title: 'programPlanningUnitId',
                                            type: 'hidden'
                                        },
                                        {
                                            title: 'programPlanningUnitProcurementAgentId',
                                            type: 'hidden'
                                        },
                                        {
                                            title: 'isChange',
                                            type: 'hidden'
                                        },

                                    ],
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
                                    oneditionend: this.oneditionend,
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
                                                        data[0] = this.state.programPlanningUnit.program.label.label_en;
                                                        data[1] = this.state.programPlanningUnit.planningUnit.label.label_en;
                                                        data[2] = "";
                                                        data[3] = "";
                                                        data[4] = true;
                                                        data[5] = this.props.match.params.programPlanningUnitId;
                                                        data[6] = 0;
                                                        data[7] = 1;

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
                                                        data[0] = this.state.programPlanningUnit.program.label.label_en;
                                                        data[1] = this.state.programPlanningUnit.planningUnit.label.label_en;
                                                        data[2] = "";
                                                        data[3] = "";
                                                        data[4] = true;
                                                        data[5] = this.props.match.params.programPlanningUnitId;
                                                        data[6] = 0;
                                                        data[7] = 1;

                                                        obj.insertRow(data, parseInt(y));
                                                    }.bind(this)
                                                });
                                            }
                                            // Delete a row
                                            if (obj.options.allowDeleteRow == true) {
                                                // region id
                                                if (obj.getRowData(y)[7] == 0) {
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
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        if (x == 3 && !isNaN(rowData[3]) && rowData[3].toString().indexOf('.') != -1) {
            // console.log("RESP---------", parseFloat(rowData[3]));
            elInstance.setValueFromCoords(3, y, parseFloat(rowData[3]), true);
        }
        elInstance.setValueFromCoords(7, y, 1, true);
        console.log("7 map---11");

    }

    addRow = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = this.state.programPlanningUnit.program.label.label_en;
        data[1] = this.state.programPlanningUnit.planningUnit.label.label_en;
        data[2] = "";
        data[3] = "";
        data[4] = true;
        data[5] = this.props.match.params.programPlanningUnitId;
        data[6] = 0;
        data[7] = 1;


        this.el.insertRow(
            data, 0, 1
        );
    };
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`F${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(0, data[i].y, this.state.programPlanningUnit.program.label.label_en, true);
                    (instance.jexcel).setValueFromCoords(1, data[i].y, this.state.programPlanningUnit.planningUnit.label.label_en, true);
                    (instance.jexcel).setValueFromCoords(6, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(7, data[i].y, 1, true);
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
                console.log("7 map---" + map1.get("7"))
                if (parseInt(map1.get("7")) === 1) {
                    let json = {
                        program: {
                            id: this.props.match.params.programId
                        },
                        planningUnit: {
                            id: this.props.match.params.planningUnitId
                        },
                        procurementAgent: {
                            id: parseInt(map1.get("2"))
                        },
                        price: this.el.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        programPlanningUnitId: parseInt(map1.get("5")),
                        programPlanningUnitProcurementAgentId: parseInt(map1.get("6")),
                        active: map1.get("4"),
                    }
                    changedpapuList.push(json);
                }
            }
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            ProcurementAgentService.savePlanningUnitProgramPriceForProcurementAgent(changedpapuList)
                .then(response => {
                    console.log(response.data);
                    if (response.status == "200") {
                        console.log(response);
                        let programId = this.props.match.params.programId;
                        this.props.history.push(`/programProduct/addProgramProduct/${programId}/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                                        message: i18n.t('static.message.procurementAgentAlreadExists'),
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

        //ProcurementAgent
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
        //catelog price
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = DECIMAL_NO_REGEX;
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }

        //Active
        if (x != 7) {
            this.el.setValueFromCoords(7, y, 1, true);
        }



    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        console.log("------------onedit called")
        this.el.setValueFromCoords(7, y, 1, true);
    }.bind(this);

    checkValidation = function () {
        var valid = true;
        var json = this.el.getJson(null, false);
        console.log("json.length-------", json.length);
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {

                //ProcurementAgent
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
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
                //catelog price
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    // if (isNaN(Number.parseInt(value)) || value < 0 || !(reg.test(value))) {
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
    cancelClicked() {
        // this.props.history.push(`/programProduct/addProgramProduct/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
        // let id = AuthenticationService.displayDashboardBasedOnRole();
        // this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
        let programId = this.props.match.params.programId;
        this.props.history.push(`/programProduct/addProgramProduct/${programId}/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}

export default CountrySpecificPrices

