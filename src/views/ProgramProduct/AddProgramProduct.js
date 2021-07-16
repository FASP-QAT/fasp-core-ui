import React, { Component } from "react";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import {
    Card, CardBody, CardHeader, InputGroup,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row, Form, FormFeedback

} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from "../../api/PlanningUnitService";
import i18n from '../../i18n';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import { jExcelLoadedFunction } from "../../CommonComponent/JExcelCommonFunctions";
import { JEXCEL_INTEGER_REGEX, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_DECIMAL_CATELOG_PRICE, DECIMAL_NO_REGEX, JEXCEL_PAGINATION_OPTION, MONTHS_IN_PAST_FOR_AMC, MONTHS_IN_FUTURE_FOR_AMC, JEXCEL_PRO_KEY } from "../../Constants";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const entityname = i18n.t('static.dashboard.programPlanningUnit');



class AddprogramPlanningUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        // if (this.props.location.state.programPlanningUnit.length > 0) {
        //     rows = this.props.location.state.programPlanningUnit;
        // }
        this.state = {
            // programPlanningUnit: this.props.location.state.programPlanningUnit,
            programPlanningUnit: [],
            planningUnitId: '',
            planningUnitName: '',
            reorderFrequencyInMonths: '',
            minMonthsOfStock: '',
            monthsInFutureForAmc: '',
            monthsInPastForAmc: '',
            rows: rows,
            programList: [],
            planningUnitList: [],
            rowErrorMessage: '',
            programPlanningUnitId: 0,
            isNew: true,
            // programId: this.props.match.params.programId,
            updateRowStatus: 0,
            lang: localStorage.getItem('lang'),
            batchNoRequired: false,
            localProcurementLeadTime: '',
            isValidData: true,
            loading: true,
            productCategoryList: [],
            programs: [],
            programId: 0,
            color: ''

        }
        // this.addRow = this.addRow.bind(this);
        // this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        // this.setTextAndValue = this.setTextAndValue.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        // this.enableRow = this.enableRow.bind(this);
        // this.disableRow = this.disableRow.bind(this);
        // this.updateRow = this.updateRow.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.changed = this.changed.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
    }

    dropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[c - 1];
        // AuthenticationService.setupAxiosInterceptors();
        // PlanningUnitService.getActivePlanningUnitList()
        //     .then(response => {
        //         if (response.status == 200) {
        // console.log("for my list response---", response.data);
        // this.setState({
        //     planningUnitList: response.data
        // });

        var puList = []
        if (value != -1) {
            console.log("in if=====>");
            var pc = this.state.productCategoryList.filter(c => c.payload.productCategoryId == value)[0]
            var pcList = this.state.productCategoryList.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            puList = (this.state.planningUnitList).filter(c => pcIdArray.includes(c.forecastingUnit.productCategory.id) && c.active.toString() == "true");
        } else {
            console.log("in else=====>");
            puList = this.state.planningUnitList
        }

        for (var k = 0; k < puList.length; k++) {
            var planningUnitJson = {
                name: puList[k].label.label_en,
                id: puList[k].planningUnitId
            }
            mylist.push(planningUnitJson);
        }
        return mylist;
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    componentDidMount() {
        this.hideFirstComponent();
        ProgramService.getProgramList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        programs: response.data, loading: false
                    })
                }

                else {

                    this.setState({
                        message: response.data.messageCode, loading: false, color: 'red'
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
                            loading: false, color: 'red'
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
                                    loading: false, color: 'red'
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false, color: 'red'
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false, color: 'red'
                                });
                                break;
                        }
                    }
                }
            );
        // this.buildJexcel();
        if (this.props.match.params.programId != null) {
            let programId = this.props.match.params.programId;
            this.setState({
                programId: programId,
                loading: true
            },
                () => {
                    if (programId != 0 && programId != '' && programId != null) {
                        console.log("CONSOLE-------->1", programId);
                        this.buildJexcel();
                    }
                })
        }

    }

    setProgramId() {
        var programId = document.getElementById("programId").value;
        this.setState({
            programId: programId,
        },
            () => {
                this.buildJexcel();
            })
    }

    buildJexcel() {
        var list = [];
        var productCategoryListNew = [];
        var programObj;
        // var programId = document.getElementById("programId").value;
        let programId = this.state.programId;
        console.log("CONSOLE-------->2", programId);
        this.setState({
            programId: programId,
            loading: true
        });
        // AuthenticationService.setupAxiosInterceptors();

        if (programId != 0) {

            ProgramService.getProgramById(programId).then(response => {
                if (response.status == 200) {
                    programObj = response.data;
                    var realmId = programObj.realmCountry.realm.realmId
                    console.log("problemObj====>", programObj, "realmId======", realmId);
                    ProductCategoryServcie.getProductCategoryListByRealmId(realmId)
                        .then(response => {

                            if (response.status == 200) {
                                console.log("productCategory response----->", response.data);
                                for (var k = 0; k < (response.data).length; k++) {
                                    var spaceCount = response.data[k].sortOrder.split(".").length;
                                    console.log("spaceCOunt--->", spaceCount);
                                    var indendent = "";
                                    for (var p = 1; p <= spaceCount - 1; p++) {
                                        if (p == 1) {
                                            indendent = indendent.concat("|_");
                                        } else {
                                            indendent = indendent.concat("_");
                                        }
                                    }
                                    console.log("ind", indendent);
                                    console.log("indendent.concat(response.data[k].payload.label.label_en)-->", indendent.concat(response.data[k].payload.label.label_en));

                                    var productCategoryJson = {};
                                    if (response.data[k].payload.productCategoryId == 0) {
                                        productCategoryJson = {
                                            name: (response.data[k].payload.label.label_en),
                                            id: -1
                                        }
                                    } else {
                                        productCategoryJson = {
                                            name: (response.data[k].payload.label.label_en),
                                            id: response.data[k].payload.productCategoryId
                                        }
                                    }

                                    productCategoryListNew.push(productCategoryJson);

                                }
                                console.log("constant product category list====>", productCategoryListNew);
                                this.setState({ productCategoryList: response.data });

                                // PlanningUnitService.getAllPlanningUnitList()
                                PlanningUnitService.getActivePlanningUnitList()
                                    .then(response => {
                                        if (response.status == 200) {
                                            this.setState({
                                                planningUnitList: response.data
                                            });
                                            for (var k = 0; k < (response.data).length; k++) {
                                                var planningUnitJson = {
                                                    name: response.data[k].label.label_en,
                                                    id: response.data[k].planningUnitId,
                                                    active: response.data[k].active
                                                }
                                                list.push(planningUnitJson);
                                            }


                                            // AuthenticationService.setupAxiosInterceptors();
                                            ProgramService.getProgramPlaningUnitListByProgramId(this.state.programId)
                                                .then(response => {
                                                    if (response.status == 200) {
                                                        // alert("hi");
                                                        let myReasponse = response.data;
                                                        var productDataArr = []
                                                        // if (myReasponse.length > 0) {
                                                        this.setState({ rows: myReasponse });
                                                        var data = [];
                                                        if (myReasponse.length != 0) {
                                                            for (var j = 0; j < myReasponse.length; j++) {
                                                                console.log("myReasponse[j]---", myReasponse[j]);
                                                                data = [];
                                                                data[0] = myReasponse[j].productCategory.id;
                                                                data[1] = myReasponse[j].planningUnit.id;
                                                                data[2] = myReasponse[j].reorderFrequencyInMonths;
                                                                data[3] = myReasponse[j].minMonthsOfStock;
                                                                data[4] = myReasponse[j].monthsInFutureForAmc;
                                                                data[5] = myReasponse[j].monthsInPastForAmc;
                                                                data[6] = myReasponse[j].localProcurementLeadTime;
                                                                data[7] = myReasponse[j].shelfLife;
                                                                data[8] = myReasponse[j].catalogPrice;
                                                                data[9] = myReasponse[j].programPlanningUnitId;
                                                                data[10] = myReasponse[j].active;
                                                                data[11] = 0;
                                                                data[12] = myReasponse[j].program.id;
                                                                productDataArr.push(data);
                                                            }
                                                        }

                                                        if (productDataArr.length == 0) {
                                                            data = [];
                                                            data[0] = 0;
                                                            data[1] = "";
                                                            data[2] = "";
                                                            data[3] = "";
                                                            data[4] = "";
                                                            data[5] = "";
                                                            data[6] = "";
                                                            data[7] = "";
                                                            data[8] = 0;
                                                            data[9] = 0;
                                                            data[10] = 1;
                                                            data[11] = 1;
                                                            data[12] = programId;
                                                            productDataArr[0] = data;
                                                        }


                                                        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                                        this.el.destroy();
                                                        var json = [];
                                                        var data = productDataArr;
                                                        var options = {
                                                            data: data,
                                                            columnDrag: true,
                                                            colWidths: [290, 290, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                                            columns: [
                                                                {
                                                                    title: i18n.t('static.productCategory.productCategory'),
                                                                    type: 'dropdown',
                                                                    source: productCategoryListNew
                                                                },
                                                                {
                                                                    title: i18n.t('static.dashboard.product'),
                                                                    type: 'autocomplete',
                                                                    source: list,
                                                                    filter: this.dropdownFilter
                                                                },
                                                                {
                                                                    title: i18n.t('static.product.reorderFrequency'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##.00',
                                                                    disabledMaskOnEdition: true

                                                                },
                                                                {
                                                                    title: i18n.t('static.product.minMonthOfStock'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##.00',
                                                                    disabledMaskOnEdition: true
                                                                },
                                                                {
                                                                    title: i18n.t('static.program.monthfutureamc'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##.00',
                                                                    disabledMaskOnEdition: true
                                                                },
                                                                {
                                                                    title: i18n.t('static.program.monthpastamc'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##.00',
                                                                    disabledMaskOnEdition: true
                                                                },
                                                                {
                                                                    title: i18n.t('static.product.localProcurementAgentLeadTime'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    decimal: '.',
                                                                    mask: '#,##.00',
                                                                    disabledMaskOnEdition: true
                                                                },
                                                                {
                                                                    title: i18n.t('static.report.shelfLife'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##.00',
                                                                    disabledMaskOnEdition: true
                                                                },
                                                                {
                                                                    title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##.00',
                                                                    disabledMaskOnEdition: true
                                                                },
                                                                {
                                                                    title: 'Id',
                                                                    type: 'hidden'
                                                                },
                                                                {
                                                                    title: 'Active',
                                                                    type: 'checkbox'
                                                                },
                                                                {
                                                                    title: 'Changed Flag',
                                                                    type: 'hidden'
                                                                },
                                                                {
                                                                    title: 'ProgramId',
                                                                    type: 'hidden'
                                                                }


                                                            ],
                                                            updateTable: function (el, cell, x, y, source, value, id) {
                                                                var elInstance = el.jexcel;
                                                                var rowData = elInstance.getRowData(y);
                                                                // var productCategoryId = rowData[0];
                                                                var programPlanningUnitId = rowData[9];
                                                                if (programPlanningUnitId == 0) {
                                                                    var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                                                                    cell1.classList.remove('readonly');

                                                                    var cell2 = elInstance.getCell(`A${parseInt(y) + 1}`)
                                                                    cell2.classList.remove('readonly');


                                                                } else {
                                                                    var cell1 = elInstance.getCell(`B${parseInt(y) + 1}`)
                                                                    cell1.classList.add('readonly');

                                                                    var cell2 = elInstance.getCell(`A${parseInt(y) + 1}`)
                                                                    cell2.classList.add('readonly');


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
                                                            position: 'top',
                                                            allowInsertColumn: false,
                                                            allowManualInsertColumn: false,
                                                            allowDeleteRow: true,
                                                            onchange: this.changed,
                                                            // oneditionend: this.onedit,
                                                            copyCompatibility: true,
                                                            allowManualInsertRow: false,
                                                            parseFormulas: true,
                                                            onpaste: this.onPaste,
                                                            oneditionend: this.oneditionend,
                                                            text: {
                                                                // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                                                show: '',
                                                                entries: '',
                                                            },
                                                            onload: this.loaded,
                                                            license: JEXCEL_PRO_KEY,
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
                                                                                data[0] = 0;
                                                                                data[1] = "";
                                                                                data[2] = "";
                                                                                data[3] = "";
                                                                                data[4] = "";
                                                                                data[5] = "";
                                                                                data[6] = "";
                                                                                data[7] = "";
                                                                                data[8] = 0;
                                                                                data[9] = 0;
                                                                                data[10] = 1;
                                                                                data[11] = 1;
                                                                                data[12] = programId;
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
                                                                                data[0] = 0;
                                                                                data[1] = "";
                                                                                data[2] = "";
                                                                                data[3] = "";
                                                                                data[4] = "";
                                                                                data[5] = "";
                                                                                data[6] = "";
                                                                                data[7] = "";
                                                                                data[8] = 0;
                                                                                data[9] = 0;
                                                                                data[10] = 1;
                                                                                data[11] = 1;
                                                                                data[12] = programId;
                                                                                obj.insertRow(data, parseInt(y));
                                                                            }.bind(this)
                                                                        });
                                                                    }
                                                                    // Delete a row
                                                                    if (obj.options.allowDeleteRow == true) {
                                                                        // region id
                                                                        if (obj.getRowData(y)[9] == 0) {
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

                                                                    //wr
                                                                    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES')) {
                                                                        let cordsValue = `${this.el.getValueFromCoords(9, y)}`;
                                                                        // console.log("CHECK--------->", cordsValue);
                                                                        // if (cordsValue.length != 0) {
                                                                        //     console.log("CHECK--------->not empty", cordsValue);
                                                                        // } else {
                                                                        //     console.log("CHECK--------->empty", cordsValue);
                                                                        // }
                                                                        if (obj.options.allowInsertRow == true) {
                                                                            if (cordsValue.length != 0) {
                                                                                items.push({
                                                                                    title: i18n.t('static.countrySpecificPrices.addCountrySpecificPrices'),
                                                                                    onclick: function () {
                                                                                        // console.log("onclick------>", this.el.getValueFromCoords(0, y));                      
                                                                                        this.props.history.push({
                                                                                            pathname: `/programProduct/addCountrySpecificPrice/${this.el.getValueFromCoords(9, y)}/${programId}`,
                                                                                        });

                                                                                    }.bind(this)
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
                                                        var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                                        this.el = elVar;
                                                        this.setState({ mapPlanningUnitEl: elVar, loading: false });
                                                        // }
                                                    } else {
                                                        this.setState({
                                                            message: response.data.messageCode, loading: false, color: 'red'
                                                        })
                                                    }
                                                }).catch(
                                                    error => {
                                                        if (error.message === "Network Error") {
                                                            this.setState({
                                                                message: 'static.unkownError',
                                                                loading: false, color: 'red'
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
                                                                        loading: false, color: 'red'
                                                                    });
                                                                    break;
                                                                case 412:
                                                                    this.setState({
                                                                        message: error.response.data.messageCode,
                                                                        loading: false, color: 'red'
                                                                    });
                                                                    break;
                                                                default:
                                                                    this.setState({
                                                                        message: 'static.unkownError',
                                                                        loading: false, color: 'red'
                                                                    });
                                                                    break;
                                                            }
                                                        }
                                                    }
                                                );
                                        } else {
                                            list = [];
                                            this.setState({ loading: false });
                                        }
                                    }).catch(
                                        error => {
                                            if (error.message === "Network Error") {
                                                this.setState({
                                                    message: 'static.unkownError',
                                                    loading: false, color: 'red'
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
                                                            loading: false, color: 'red'
                                                        });
                                                        break;
                                                    case 412:
                                                        this.setState({
                                                            message: error.response.data.messageCode,
                                                            loading: false, color: 'red'
                                                        });
                                                        break;
                                                    default:
                                                        this.setState({
                                                            message: 'static.unkownError',
                                                            loading: false, color: 'red'
                                                        });
                                                        break;
                                                }
                                            }
                                        }
                                    );
                            } else {
                                productCategoryListNew = []
                                this.setState({
                                    message: response.data.messageCode,
                                    loading: false, color: 'red'
                                })
                            }
                        }).catch(
                            error => {
                                if (error.message === "Network Error") {
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false, color: 'red'
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
                                                loading: false, color: 'red'
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: error.response.data.messageCode,
                                                loading: false, color: 'red'
                                            });
                                            break;
                                        default:
                                            this.setState({
                                                message: 'static.unkownError',
                                                loading: false, color: 'red'
                                            });
                                            break;
                                    }
                                }
                            }
                        );
                } else {
                    productCategoryListNew = []
                    this.setState({
                        message: response.data.messageCode,
                        loading: false, color: 'red'
                    })
                }

            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false, color: 'red'
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
                                    loading: false, color: 'red'
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false, color: 'red'
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false, color: 'red'
                                });
                                break;
                        }
                    }
                }
            );
        } else {
            this.setState({
                loading: false
            });
            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
            this.el.destroy();
        }



    }

    addRowInJexcel = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = "-1";
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = MONTHS_IN_FUTURE_FOR_AMC;
        data[5] = MONTHS_IN_PAST_FOR_AMC;
        data[6] = "";
        data[7] = "";
        data[8] = 0;
        data[9] = 0;
        data[10] = 1;
        data[11] = 1;
        data[12] = this.state.programId;
        this.el.insertRow(
            data, 0, 1
        );
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        if (x == 2 && !isNaN(rowData[2]) && rowData[2].toString().indexOf('.') != -1) {
            console.log("RESP---------", parseFloat(rowData[2]));
            elInstance.setValueFromCoords(2, y, parseFloat(rowData[2]), true);
        } else if (x == 3 && !isNaN(rowData[3]) && rowData[3].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(3, y, parseFloat(rowData[3]), true);
        } else if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        } else if (x == 5 && !isNaN(rowData[5]) && rowData[5].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(5, y, parseFloat(rowData[5]), true);
        } else if (x == 6 && !isNaN(rowData[6]) && rowData[6].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        } else if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        }

    }

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`J${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(8, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(9, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(10, data[i].y, 1, true);
                    (instance.jexcel).setValueFromCoords(11, data[i].y, 1, true);
                    (instance.jexcel).setValueFromCoords(12, data[i].y, this.state.programId, true);
                    z = data[i].y;
                }
            }
        }
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {


            var value = this.el.getValueFromCoords(11, y);
            if (parseInt(value) == 1) {
                // console.log("PROBLEM");


                var col = ("A").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(0, y);
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

                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getRowData(parseInt(y))[1];
                console.log("Vlaue------>", value);
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    for (var i = (json.length - 1); i >= 0; i--) {
                        var map = new Map(Object.entries(json[i]));
                        var planningUnitValue = map.get("1");
                        if (planningUnitValue == value && y != i && i > y) {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setStyle(col, "background-color", "yellow");
                            this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                            i = -1;
                            valid = false;
                        } else {
                            this.el.setStyle(col, "background-color", "transparent");
                            this.el.setComments(col, "");
                        }
                    }
                }

                //Reorder frequency
                var col = ("C").concat(parseInt(y) + 1);
                value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                //Min months of stock
                var col = ("D").concat(parseInt(y) + 1);
                value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                //Months in future for AMC
                var col = ("E").concat(parseInt(y) + 1);
                value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                //Months in past for AMC
                var col = ("F").concat(parseInt(y) + 1);
                value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                //Local procurement lead time
                var col = ("G").concat(parseInt(y) + 1);
                value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
                var reg = JEXCEL_DECIMAL_LEAD_TIME
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    // if (isNaN(parseInt(value)) || !(reg.test(value))) {
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


                //Shelf life
                var col = ("H").concat(parseInt(y) + 1);
                value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }


                //Catalog price
                var col = ("I").concat(parseInt(y) + 1);
                value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
                // var reg = DECIMAL_NO_REGEX;
                var reg = JEXCEL_DECIMAL_CATELOG_PRICE
                // console.log("value-----", value);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    // if (isNaN(parseInt(value)) || !(reg.test(value))) {
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

    changed = function (instance, cell, x, y, value) {
        var valid = true;
        //Product category
        console.log("changed 1");
        var rowData = this.el.getRowData(y);
        if (x == 0) {
            console.log("changed 2");
            var col = ("A").concat(parseInt(y) + 1);
            // alert("value--->",value);
            console.log("value--->", rowData[0]);
            console.log("rowData===>", this.el.getRowData(y));
            if (rowData[0] == "") {
                console.log("============in if when category is changed ");
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                console.log("============in else when category is changed ");
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                this.el.setValueFromCoords(11, y, 1, true);
                valid = true;
            }
            var columnName = jexcel.getColumnNameFromId([parseInt(x) + 1, y]);
            instance.jexcel.setValue(columnName, '');
        }

        //Planning Unit
        if (x == 1) {
            console.log("changed 3");
            var json = this.el.getJson(null, false);
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                console.log("json.length", json.length);
                var jsonLength = parseInt(json.length) - 1;
                console.log("jsonLength", jsonLength);
                for (var i = jsonLength; i >= 0; i--) {
                    console.log("i=---------->", i, "y----------->", y);
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    console.log("Planning Unit value in change", map.get("1"));
                    console.log("Value----->", value);
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        this.el.setValueFromCoords(11, y, 1, true);
                        valid = false;
                        i = -1;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(11, y, 1, true);
                        valid = true;
                    }
                }
            }

            // var columnName = jexcel.getColumnNameFromId([x + 1, y]);
            // instance.jexcel.setValue(columnName, '');
        }

        //Reorder frequency
        if (x == 2) {
            console.log("changed 4");
            // var reg = /^[0-9\b]+$/;
            value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Min months of stock
        if (x == 3) {
            console.log("changed 5");
            value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Months in future for AMC
        if (x == 4) {
            console.log("changed 6");
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Months in past for AMC
        if (x == 5) {
            console.log("changed 7");
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Local procurement lead time
        if (x == 6) {
            console.log("changed 8");
            // var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_LEAD_TIME
            var col = ("G").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                // if (isNaN(parseInt(value)) || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Shelf life
        if (x == 7) {
            console.log("changed 9");
            value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }
        //Catalog price
        if (x == 8) {
            console.log("changed 10");
            // var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            var col = ("I").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(11, y, 1, true);
                valid = false;
            } else {
                // if (isNaN(parseInt(value)) || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(11, y, 1, true);
                    valid = true;
                }
            }
        }

        if (x != 11) {
            this.el.setValueFromCoords(11, y, 1, true);
        }
        this.setState({ isValidData: valid });
    }




    submitForm() {

        var validation = this.checkValidation();
        // var validation = this.state.isValidData;
        if (validation == true) {
            this.setState({ loading: true })
            // console.log("validation---true-->");

            var json = this.el.getJson(null, false);
            console.log("Rows on submit", json)
            var planningUnitArray = []
            console.log("json.length---" + json.length);
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                console.log("(map.get(11)---" + map.get("11"));
                if (map.get("11") == 1) {
                    if (map.get("9") == "") {
                        var pId = 0;
                    } else {
                        var pId = map.get("9");
                    }
                    var planningUnitJson = {
                        programPlanningUnitId: pId,
                        program: {
                            id: map.get("12")
                        },
                        planningUnit: {
                            id: map.get("1"),
                        },
                        reorderFrequencyInMonths: this.el.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        minMonthsOfStock: this.el.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        monthsInFutureForAmc: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        monthsInPastForAmc: this.el.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        localProcurementLeadTime: this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        shelfLife: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        catalogPrice: this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: map.get("10")
                    }
                    planningUnitArray.push(planningUnitJson);
                }

            }
            // AuthenticationService.setupAxiosInterceptors();
            console.log("SUBMIT----", planningUnitArray);
            ProgramService.addprogramPlanningUnitMapping(planningUnitArray)
                .then(response => {
                    if (response.status == "200") {
                        this.setState({
                            message: i18n.t('static.message.planningUnitUpdate'), loading: false, color: 'green'
                        },
                            () => {
                                this.hideSecondComponent();
                                this.buildJexcel();
                            })
                        // this.props.history.push(`/programProduct/addProgramProduct/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false, color: 'red'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }

                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                loading: false, color: 'red'
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
                                        loading: false, color: 'red'
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false, color: 'red'
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false, color: 'red'
                                    },
                                        () => {
                                            this.hideSecondComponent();
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
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
        tr.children[8].classList.add('AsteriskTheadtrTd');
        tr.children[9].classList.add('AsteriskTheadtrTd');
    }

    render() {
        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                {/* <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5> */}
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: this.state.color }} id="div2">{this.state.message}</h5>

                <div style={{ flexBasis: 'auto' }}>
                    <Card>
                        {/* <CardHeader>
                                <strong>{i18n.t('static.program.mapPlanningUnit')}</strong>
                            </CardHeader> */}
                        {/* <CardBody className="p-0">
                            <Col sm={12} md={12}>
                                <h4 className="red">{this.props.message}</h4>
                                <div className="table-responsive" >
                                    <div id="mapPlanningUnit" className="RowheightForaddprogaddRow">
                                    </div>
                                </div>
                            </Col>
                        </CardBody> */}
                        <CardBody className="pb-lg-5">
                            <Col md="3 pl-0">

                                <FormGroup className="Selectdiv mt-md-2 mb-md-0">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls SelectGo">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="programId"
                                                id="programId"
                                                bsSize="sm"
                                                onChange={this.setProgramId}
                                                value={this.state.programId}
                                            >
                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                {programList}
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>

                            </Col>
                            {/* <div id="mapPlanningUnit" className="RowheightForaddprogaddRow">
                            </div> */}
                            <div >
                                <h4 className="red">{this.props.message}</h4>
                                <div className="table-responsive" style={{ display: this.state.loading ? "none" : "block" }}>
                                    <div id="mapPlanningUnit" className="RowheightForaddprogaddRow">
                                    </div>
                                </div>
                                <div style={{ display: this.state.loading ? "block" : "none" }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                        <div class="align-items-center">
                                            <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                            <div class="spinner-border blue ml-4" role="status">

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </CardBody>

                        <CardFooter>
                            <FormGroup>
                                {this.state.isValidData && this.state.programId != 0 && <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>}
                                &nbsp;
                                {this.state.isValidData && this.state.programId != 0 && <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                &nbsp;
                                {this.state.isValidData && this.state.programId != 0 && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRowInJexcel}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>}
                                &nbsp;
                                </FormGroup>
                        </CardFooter>
                    </Card>

                </div>

            </div>

        );
    }
    cancelClicked() {
        // this.props.history.push(`/programProduct/addProgramProduct/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}
export default AddprogramPlanningUnit;