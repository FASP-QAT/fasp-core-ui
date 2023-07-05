import jexcel from 'jspreadsheet';
import React, { Component } from "react";
import { Prompt } from 'react-router';
import {
    Button, Card, CardBody, CardFooter, Col, FormGroup, Input, InputGroup,
    Label
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import PlanningUnitService from "../../api/PlanningUnitService";
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import ProgramService from "../../api/ProgramService";
import getLabelText from '../../CommonComponent/getLabelText';
import { jExcelLoadedFunction } from "../../CommonComponent/JExcelCommonFunctions";
import CryptoJS from 'crypto-js'
import { API_URL, SECRET_KEY, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_INTEGER_REGEX, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC } from "../../Constants";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
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
            isChanged: false,
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
        var value = (this.state.mapPlanningUnitEl.getJson(null, false)[r])[c - 1];
        var puList = []
        if (value != -1) {
            console.log("in if=====>");
            var pc = this.state.productCategoryList.filter(c => c.payload.productCategoryId == value)[0]
            var pcList = this.state.productCategoryList.filter(c => c.payload.productCategoryId == pc.payload.productCategoryId || c.parentId == pc.id);
            var pcIdArray = [];
            for (var pcu = 0; pcu < pcList.length; pcu++) {
                pcIdArray.push(pcList[pcu].payload.productCategoryId);
            }
            puList = (this.state.planningUnitList).filter(c => pcIdArray.includes(c.forecastingUnit.productCategory.id));
        } else {
            console.log("in else=====>");
            puList = this.state.planningUnitList
        }

        for (var k = 0; k < puList.length; k++) {
            var planningUnitJson = {
                name: puList[k].label.label_en + ' | ' + puList[k].id,
                id: puList[k].id
            }
            mylist.push(planningUnitJson);
        }
        return mylist;
    }
    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }

    componentDidMount() {
        this.hideFirstComponent();
        ProgramService.getProgramForDropDown(AuthenticationService.getRealmId(),1)//supply plan programs
            .then(response => {
                if (response.status == 200) {
                    console.log("response.data", response.data)
                    let myReasponse = response.data.sort((a, b) => {
                        var itemLabelA = a.code.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.code.toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        programs: myReasponse, loading: false
                    })
                }

                else {

                    this.setState({
                        message: response.data.messageCode, loading: false, color: '#BA0C2F'
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
                            loading: false, color: '#BA0C2F'
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
                                    loading: false, color: '#BA0C2F'
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false, color: '#BA0C2F'
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false, color: '#BA0C2F'
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
                                PlanningUnitService.getPlanningUnitListBasic()
                                    .then(response => {
                                        console.log("PlanningUnitResponse------->", response.data);
                                        if (response.status == 200) {
                                            this.setState({
                                                planningUnitList: response.data
                                            });
                                            for (var k = 0; k < (response.data).length; k++) {
                                                var planningUnitJson = {
                                                    name: response.data[k].label.label_en + ' | ' + response.data[k].id,
                                                    id: response.data[k].id,
                                                    active: response.data[k].active
                                                }
                                                list.push(planningUnitJson);
                                            }


                                            // AuthenticationService.setupAxiosInterceptors();
                                            ProgramService.getProgramPlaningUnitListByProgramId(this.state.programId)
                                                .then(response => {
                                                    if (response.status == 200) {
                                                        // alert("hi");
                                                        let myReasponse = response.data.sort((a, b) => {
                                                            var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                                                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                                            var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                                                            return itemLabelA > itemLabelB ? 1 : -1;
                                                        });
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
                                                                data[2] = myReasponse[j].planBasedOn;
                                                                data[3] = myReasponse[j].reorderFrequencyInMonths;
                                                                data[4] = myReasponse[j].planBasedOn == 1 ? myReasponse[j].minMonthsOfStock : "";
                                                                data[5] = myReasponse[j].planBasedOn == 2 ? myReasponse[j].minQty : "";
                                                                data[6] = myReasponse[j].monthsInFutureForAmc;
                                                                data[7] = myReasponse[j].monthsInPastForAmc;
                                                                data[8] = myReasponse[j].localProcurementLeadTime;
                                                                data[9] = myReasponse[j].planBasedOn == 2 ? myReasponse[j].distributionLeadTime : "";
                                                                data[10] = myReasponse[j].shelfLife;
                                                                data[11] = myReasponse[j].catalogPrice;
                                                                data[12] = myReasponse[j].programPlanningUnitId;
                                                                data[13] = myReasponse[j].active;
                                                                data[14] = 0;
                                                                data[15] = myReasponse[j].program.id;
                                                                data[16] = myReasponse[j].minMonthsOfStock;
                                                                data[17] = myReasponse[j].minQty;
                                                                data[18] = myReasponse[j].distributionLeadTime;
                                                                productDataArr.push(data);
                                                            }
                                                        }

                                                        if (productDataArr.length == 0) {
                                                            data = [];
                                                            data[0] = 0;
                                                            data[1] = "";
                                                            data[2] = 1;
                                                            data[3] = "";
                                                            data[4] = "";
                                                            data[5] = "";
                                                            data[6] = "";
                                                            data[7] = "";
                                                            data[8] = "";
                                                            data[9] = "";
                                                            data[10] = "";
                                                            data[11] = 0;
                                                            data[12] = 0;
                                                            data[13] = 1;
                                                            data[14] = 1;
                                                            data[15] = programId;
                                                            data[16] = "";
                                                            data[17] = "";
                                                            data[18] = "";
                                                            productDataArr[0] = data;
                                                        }


                                                        this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                                        // this.el.destroy();
                                                        jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
                                                        var json = [];
                                                        var data = productDataArr;
                                                        var options = {
                                                            data: data,
                                                            columnDrag: true,
                                                            // colWidths: [290, 290, 100, 100, 100, 100, 100, 100, 150, 100, 150,150],
                                                            columns: [
                                                                {
                                                                    title: i18n.t('static.productCategory.productCategory'),
                                                                    type: 'dropdown',
                                                                    source: productCategoryListNew
                                                                },
                                                                {
                                                                    title: i18n.t('static.dashboard.product'),
                                                                    type: 'dropdown',
                                                                    options: {
                                                                        url: `${API_URL}/api/dropdown/planningUnit/autocomplete/filter/productCategory`,
                                                                        autocomplete: true,
                                                                        remoteSearch: true,
                                                                        onbeforesearch: function(instance, request) {
                                                                            request.method = 'POST';
                                                                            request.data = { productCategorySortOrder: "", searchText: instance.search, language: "en" };
                                                                            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                                                            let jwtToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                                                            request.beforeSend = (httpRequest) => {
                                                                                httpRequest.setRequestHeader('Authorization', 'Bearer '+jwtToken);
                                                                            }
                                                                            return request;
                                                                        }
                                                                    },
                                                                },
                                                                {
                                                                    title: i18n.t('static.programPU.planBasedOn'),
                                                                    type: 'dropdown',
                                                                    source: [{ id: 1, name: i18n.t('static.report.mos') }, { id: 2, name: i18n.t('static.report.qty') }],
                                                                    tooltip: i18n.t("static.programPU.planByTooltip")
                                                                },
                                                                {
                                                                    title: i18n.t('static.product.reorderFrequency'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##',
                                                                    disabledMaskOnEdition: true,
                                                                    tooltip: i18n.t("static.programPU.reorderFrequencyTooltip")

                                                                },
                                                                {
                                                                    title: i18n.t('static.product.minMonthOfStock'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##',
                                                                    disabledMaskOnEdition: true,
                                                                    tooltip: i18n.t("static.programPU.minMonthsOfStockTooltip")
                                                                },
                                                                {
                                                                    title: i18n.t('static.product.minQuantity'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##',
                                                                    disabledMaskOnEdition: true,
                                                                    tooltip: i18n.t("static.programPU.minQtyTooltip")
                                                                },
                                                                {
                                                                    title: i18n.t('static.program.monthfutureamc'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##',
                                                                    disabledMaskOnEdition: true,
                                                                    tooltip: i18n.t("static.programPU.monthsInFutureTooltip")
                                                                },
                                                                {
                                                                    title: i18n.t('static.program.monthpastamc'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##',
                                                                    disabledMaskOnEdition: true,
                                                                    tooltip: i18n.t("static.programPU.monthsInPastTooltip")
                                                                },
                                                                {
                                                                    title: i18n.t('static.product.localProcurementAgentLeadTime'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    decimal: '.',
                                                                    mask: '#,##.00',
                                                                    disabledMaskOnEdition: true,
                                                                    tooltip: i18n.t("static.programPU.localProcurementAgentTooltip"),
                                                                    width: 120
                                                                },
                                                                {
                                                                    title: i18n.t('static.product.distributionLeadTime'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##',
                                                                    disabledMaskOnEdition: true,
                                                                    tooltip: i18n.t("static.programPU.distributionLeadTimeTooltip")
                                                                },
                                                                {
                                                                    title: i18n.t('static.report.shelfLife'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##',
                                                                    disabledMaskOnEdition: true,
                                                                    tooltip: i18n.t("static.programPU.shelfLifeTooltip"),
                                                                    width: 120
                                                                },
                                                                {
                                                                    title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                                                                    type: 'numeric',
                                                                    textEditor: true,
                                                                    // decimal:'.',
                                                                    mask: '#,##.00',
                                                                    disabledMaskOnEdition: true,
                                                                    tooltip: i18n.t("static.programPU.catalogPriceTooltip"),
                                                                    width: 120
                                                                },
                                                                {
                                                                    title: 'Id',
                                                                    type: 'hidden',
                                                                    readOnly: true
                                                                },
                                                                {
                                                                    title: i18n.t('static.common.active'),
                                                                    type: 'checkbox'
                                                                },
                                                                {
                                                                    title: 'Changed Flag',
                                                                    type: 'hidden'
                                                                },
                                                                {
                                                                    title: 'ProgramId',
                                                                    type: 'hidden'
                                                                },
                                                                {
                                                                    title: 'Min Mos',
                                                                    type: 'hidden'
                                                                },
                                                                {
                                                                    title: 'Min Qty',
                                                                    type: 'hidden'
                                                                },
                                                                {
                                                                    title: 'Distribution Lead Time',
                                                                    type: 'hidden'
                                                                }


                                                            ],
                                                            updateTable: function (el, cell, x, y, source, value, id) {
                                                                var elInstance = el;
                                                                var rowData = elInstance.getRowData(y);
                                                                // var productCategoryId = rowData[0];
                                                                var programPlanningUnitId = rowData[12];
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
                                                                if (rowData[2] == 1) {
                                                                    var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                                                                    cell1.classList.add('readonly');
                                                                    var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                                                                    cell1.classList.add('readonly');
                                                                    var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                                                                    cell1.classList.remove('readonly');

                                                                } else {
                                                                    var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                                                                    cell1.classList.remove('readonly');
                                                                    var cell1 = elInstance.getCell(`J${parseInt(y) + 1}`)
                                                                    cell1.classList.remove('readonly');
                                                                    var cell1 = elInstance.getCell(`E${parseInt(y) + 1}`)
                                                                    cell1.classList.add('readonly');
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
                                                            // oneditionend: this.onedit,
                                                            copyCompatibility: true,
                                                            allowManualInsertRow: false,
                                                            parseFormulas: true,
                                                            onpaste: this.onPaste,
                                                            oneditionend: this.oneditionend,
                                                            // text: {
                                                            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                                            //     show: '',
                                                            //     entries: '',
                                                            // },
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
                                                                                data[0] = -1;
                                                                                data[1] = "";
                                                                                data[2] = 1;
                                                                                data[3] = "";
                                                                                data[4] = "";
                                                                                data[5] = "";
                                                                                data[6] = "";
                                                                                data[7] = "";
                                                                                data[8] = "";
                                                                                data[9] = "";
                                                                                data[10] = "";
                                                                                data[11] = 0;
                                                                                data[12] = 0;
                                                                                data[13] = 1;
                                                                                data[14] = 1;
                                                                                data[15] = programId;
                                                                                data[16] = "";
                                                                                data[17] = "";
                                                                                data[18] = "";
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
                                                                                data[0] = -1;
                                                                                data[1] = "";
                                                                                data[2] = 1;
                                                                                data[3] = "";
                                                                                data[4] = "";
                                                                                data[5] = "";
                                                                                data[6] = "";
                                                                                data[7] = "";
                                                                                data[8] = "";
                                                                                data[9] = "";
                                                                                data[10] = "";
                                                                                data[11] = 0;
                                                                                data[12] = 0;
                                                                                data[13] = 1;
                                                                                data[14] = 1;
                                                                                data[15] = programId;
                                                                                data[16] = "";
                                                                                data[17] = "";
                                                                                data[18] = "";
                                                                                obj.insertRow(data, parseInt(y));
                                                                            }.bind(this)
                                                                        });
                                                                    }
                                                                    // Delete a row
                                                                    if (obj.options.allowDeleteRow == true) {
                                                                        // region id
                                                                        if (obj.getRowData(y)[12] == 0) {
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
                                                                        let cordsValue = `${this.el.getValueFromCoords(12, y)}`;
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
                                                                                        // console.log("onclick------>", this.el.getValueFromCoords(0, y));                      
                                                                                        // console.log("onclick------>", this.el.getValueFromCoords(0, y));                      
                                                                                        // console.log("onclick------>", this.el.getValueFromCoords(0, y));                      
                                                                                        // console.log("onclick------>", this.el.getValueFromCoords(0, y));                      
                                                                                        // console.log("onclick------>", this.el.getValueFromCoords(0, y));                      
                                                                                        // console.log("onclick------>", this.el.getValueFromCoords(0, y));                      
                                                                                        // console.log("onclick------>", this.el.getValueFromCoords(0, y));                      
                                                                                        // console.log("onclick------>", this.el.getValueFromCoords(0, y));                      
                                                                                        this.props.history.push({
                                                                                            pathname: `/programProduct/addCountrySpecificPrice/${this.el.getValueFromCoords(12, y)}/${programId}`,
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
                                                            message: response.data.messageCode, loading: false, color: '#BA0C2F'
                                                        })
                                                    }
                                                }).catch(
                                                    error => {
                                                        if (error.message === "Network Error") {
                                                            this.setState({
                                                                // message: 'static.unkownError',
                                                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                                                loading: false, color: '#BA0C2F'
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
                                                                        loading: false, color: '#BA0C2F'
                                                                    });
                                                                    break;
                                                                case 412:
                                                                    this.setState({
                                                                        message: error.response.data.messageCode,
                                                                        loading: false, color: '#BA0C2F'
                                                                    });
                                                                    break;
                                                                default:
                                                                    this.setState({
                                                                        message: 'static.unkownError',
                                                                        loading: false, color: '#BA0C2F'
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
                                                    // message: 'static.unkownError',
                                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                                    loading: false, color: '#BA0C2F'
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
                                                            loading: false, color: '#BA0C2F'
                                                        });
                                                        break;
                                                    case 412:
                                                        this.setState({
                                                            message: error.response.data.messageCode,
                                                            loading: false, color: '#BA0C2F'
                                                        });
                                                        break;
                                                    default:
                                                        this.setState({
                                                            message: 'static.unkownError',
                                                            loading: false, color: '#BA0C2F'
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
                                    loading: false, color: '#BA0C2F'
                                })
                            }
                        }).catch(
                            error => {
                                if (error.message === "Network Error") {
                                    this.setState({
                                        // message: 'static.unkownError',
                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                        loading: false, color: '#BA0C2F'
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
                                                loading: false, color: '#BA0C2F'
                                            });
                                            break;
                                        case 412:
                                            this.setState({
                                                message: error.response.data.messageCode,
                                                loading: false, color: '#BA0C2F'
                                            });
                                            break;
                                        default:
                                            this.setState({
                                                message: 'static.unkownError',
                                                loading: false, color: '#BA0C2F'
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
                        loading: false, color: '#BA0C2F'
                    })
                }

            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            // message: 'static.unkownError',
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false, color: '#BA0C2F'
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
                                    loading: false, color: '#BA0C2F'
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false, color: '#BA0C2F'
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false, color: '#BA0C2F'
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
            // this.el.destroy();
            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);

        }



    }

    addRowInJexcel = function () {
        var json = this.el.getJson(null, false);
        var data = [];
        data[0] = "-1";
        data[1] = "";
        data[2] = 1;
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = MONTHS_IN_FUTURE_FOR_AMC;
        data[7] = MONTHS_IN_PAST_FOR_AMC;
        data[8] = "";
        data[9] = "";
        data[10] = "";
        data[11] = 0;
        data[12] = 0;
        data[13] = 1;
        data[14] = 1;
        data[15] = this.state.programId;
        data[16] = "";
        data[17] = "";
        data[18] = "";
        this.el.insertRow(
            data, 0, 1
        );
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);

        if (x == 3 && !isNaN(rowData[3]) && rowData[3].toString().indexOf('.') != -1) {
            console.log("RESP---------", parseFloat(rowData[3]));
            elInstance.setValueFromCoords(3, y, parseFloat(rowData[3]), true);
        } else if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        } else if (x == 6 && !isNaN(rowData[6]) && rowData[6].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        } else if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        } else if (x == 10 && !isNaN(rowData[10]) && rowData[10].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(10, y, parseFloat(rowData[10]), true);
        } else if (x == 11 && !isNaN(rowData[11]) && rowData[11].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(11, y, parseFloat(rowData[11]), true);
        }

    }

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`M${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(11, data[i].y, 0, true);
                    (instance).setValueFromCoords(12, data[i].y, 0, true);
                    (instance).setValueFromCoords(13, data[i].y, 1, true);
                    (instance).setValueFromCoords(14, data[i].y, 1, true);
                    (instance).setValueFromCoords(15, data[i].y, this.state.programId, true);
                    z = data[i].y;
                }
            }
        }
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {


            var value = this.el.getValueFromCoords(14, y);
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

                //Plan Based On
                var col = ("C").concat(parseInt(y) + 1);
                value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //Reorder frequency
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

                //Min months of stock
                var col = ("E").concat(parseInt(y) + 1);
                value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                // console.log("value-----", value);
                if (json[y][2] == 1 && value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                //Min Qty
                var col = ("F").concat(parseInt(y) + 1);
                value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                // console.log("value-----", value);
                if (json[y][2] == 2 && value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
                //Distribution Lead Time
                var col = ("J").concat(parseInt(y) + 1);
                value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                // console.log("value-----", value);
                if (json[y][2] == 2 && value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
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
                var col = ("G").concat(parseInt(y) + 1);
                value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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

                //Local procurement lead time
                var col = ("I").concat(parseInt(y) + 1);
                value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
                var col = ("K").concat(parseInt(y) + 1);
                value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
                var col = ("L").concat(parseInt(y) + 1);
                value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
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
            console.log("changed 3");
            var col = ("A").concat(parseInt(y) + 1);
            // alert("value--->",value);
            console.log("value--->", rowData[0]);
            console.log("rowData===>", this.el.getRowData(y));
            if (rowData[0] == "") {
                console.log("============in if when category is changed ");
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                console.log("============in else when category is changed ");
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                this.el.setValueFromCoords(14, y, 1, true);
                valid = true;
            }
            console.log("test11111", jexcel);

            // var columnName = jexcel.getColumnNameFromId([parseInt(x) + 1, y]);
            // instance.worksheets[0].setValue(columnName, '');
        }

        //Planning Unit
        if (x == 1) {
            console.log("changed 4");
            var json = this.el.getJson(null, false);
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
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
                        this.el.setValueFromCoords(14, y, 1, true);
                        valid = false;
                        i = -1;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(14, y, 1, true);
                        valid = true;
                    }
                }
            }

            // var columnName = jexcel.getColumnNameFromId([x + 1, y]);
            // instance.jexcel.setValue(columnName, '');
        }

        if (x == 2) {
            // var reg = /^[0-9\b]+$/;
            value = this.el.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                this.el.setValueFromCoords(14, y, 1, true);
                valid = true;
                console.log("changed 7");
                value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                var col = ("E").concat(parseInt(y) + 1);
                if (rowData[2] == 1 && value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        this.el.setValueFromCoords(14, y, 1, true);
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(14, y, 1, true);
                        valid = true;
                    }
                }
                value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                var col = ("F").concat(parseInt(y) + 1);
                if (rowData[2] == 2 && value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        this.el.setValueFromCoords(14, y, 1, true);
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(14, y, 1, true);
                        valid = true;
                    }
                }
                value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                // var reg = /^[0-9\b]+$/;
                var reg = JEXCEL_INTEGER_REGEX
                var col = ("J").concat(parseInt(y) + 1);
                if (rowData[2] == 2 && value == "") {
                    // this.el.setStyle(col, "background-color", "transparent");
                    // this.el.setStyle(col, "background-color", "yellow");
                    // this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    this.el.setValueFromCoords(9, y, 0, true);
                    this.el.setValueFromCoords(14, y, 1, true);

                    valid = false;
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        this.el.setValueFromCoords(14, y, 1, true);
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(14, y, 1, true);
                        valid = true;
                    }
                }


            }
            if (rowData[2] == 2) {
                this.el.setValueFromCoords(4, y, "", true);
                this.el.setValueFromCoords(5, y, rowData[17], true);
                this.el.setValueFromCoords(9, y, rowData[18] != "" ? rowData[18] : 0, true);
            } else {
                this.el.setValueFromCoords(5, y, "", true);
                this.el.setValueFromCoords(9, y, "", true);
                this.el.setValueFromCoords(4, y, rowData[16], true);
            }
        }
        //Reorder frequency
        if (x == 3) {
            console.log("changed 6");
            // var reg = /^[0-9\b]+$/;
            value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = true;
                }
            }
        }
        //Min months of stock
        if (x == 4) {
            console.log("changed 7");
            value = this.el.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("E").concat(parseInt(y) + 1);
            if (rowData[2] == 1 && value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = true;
                }
            }
            if (value !== "") {
                this.el.setValueFromCoords(16, y, value, true);
            }
        }
        //Min Qty
        if (x == 5) {
            console.log("changed 7");
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("F").concat(parseInt(y) + 1);
            if (rowData[2] == 2 && value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = true;
                }
            }
            if (value !== "") {
                this.el.setValueFromCoords(17, y, value, true);
            }
        }

        //Distribution Lead Time
        if (x == 9) {
            console.log("changed 7");
            value = this.el.getValue(`J${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("J").concat(parseInt(y) + 1);
            if (rowData[2] == 2 && value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = true;
                }
            }
            if (value !== "") {
                this.el.setValueFromCoords(18, y, value, true);
            }
        }
        //Months in future for AMC
        if (x == 6) {
            console.log("changed 8");
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("G").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = true;
                }
            }
        }
        //Months in past for AMC
        if (x == 7) {
            console.log("changed 10");
            value = this.el.getValue(`H${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = true;
                }
            }
        }
        //Local procurement lead time
        if (x == 8) {
            console.log("changed 11");
            // var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            value = this.el.getValue(`I${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_LEAD_TIME
            var col = ("I").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                // if (isNaN(parseInt(value)) || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = true;
                }
            }
        }
        //Shelf life
        if (x == 10) {
            console.log("changed 12");
            value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            // var reg = /^[0-9\b]+$/;
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("K").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = true;
                }
            }
        }
        //Catalog price
        if (x == 11) {
            console.log("changed 13");
            // var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            value = this.el.getValue(`L${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_DECIMAL_CATELOG_PRICE;
            var col = ("L").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(14, y, 1, true);
                valid = false;
            } else {
                // if (isNaN(parseInt(value)) || !(reg.test(value))) {
                if (!(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(14, y, 1, true);
                    valid = true;
                }
            }
        }

        if (x != 14) {
            this.el.setValueFromCoords(14, y, 1, true);
        }
        this.setState({ isValidData: valid, isChanged: true });
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
                console.log("(map.get(14)---" + map.get("14"));
                if (map.get("14") == 1) {
                    if (map.get("12") == "") {
                        var pId = 0;
                    } else {
                        var pId = map.get("12");
                    }
                    var planningUnitJson = {
                        programPlanningUnitId: pId,
                        program: {
                            id: map.get("15")
                        },
                        planningUnit: {
                            id: map.get("1"),
                        },
                        reorderFrequencyInMonths: this.el.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        minMonthsOfStock: this.el.getValue(`Q${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        monthsInFutureForAmc: this.el.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        monthsInPastForAmc: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        localProcurementLeadTime: this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        shelfLife: this.el.getValue(`K${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        catalogPrice: this.el.getValue(`L${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: map.get("13"),
                        minQty: this.el.getValue(`R${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        distributionLeadTime: this.el.getValue(`S${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        planBasedOn: map.get("2")
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
                            message: i18n.t('static.message.planningUnitUpdate'), loading: false, color: 'green', isChanged: false
                        },
                            () => {
                                this.hideSecondComponent();
                                this.buildJexcel();
                            })
                        // this.props.history.push(`/programProduct/addProgramProduct/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false, color: '#BA0C2F'
                        },
                            () => {
                                this.hideSecondComponent();
                            })
                    }

                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                // message: 'static.unkownError',
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false, color: '#BA0C2F'
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
                                        loading: false, color: '#BA0C2F'
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false, color: '#BA0C2F'
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false, color: '#BA0C2F'
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
        // var asterisk = document.getElementsByClassName("resizable")[0];
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[5].classList.add('InfoTr');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[8].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[9].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[10].classList.add('InfoTr');
        tr.children[11].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[12].classList.add('InfoTrAsteriskTheadtrTdImage');
        // tr.children[3].title = i18n.t('static.programPU.planBasedOnTooltip');
        tr.children[3].classList.add('InfoTrAsteriskTheadtrTdImage');
    }

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {/* {getLabelText(item.label, this.state.lang)} */}
                        {item.code}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <Prompt
                    when={this.state.isChanged == true}
                    message={i18n.t("static.dataentry.confirmmsg")}
                />
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
                                <div className="consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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
                                {this.state.isChanged && this.state.isValidData && this.state.programId != 0 && <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
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