import jexcel from 'jspreadsheet';
import React, { Component } from "react";
import { Prompt } from 'react-router';
import {
    Button, Card, CardBody, CardFooter, Col, FormGroup, Input, InputGroup,
    Label
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { checkValidation, changed, jExcelLoadedFunction } from "../../CommonComponent/JExcelCommonFunctions";
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, JEXCEL_DECIMAL_CATELOG_PRICE, JEXCEL_DECIMAL_LEAD_TIME, JEXCEL_INTEGER_REGEX, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_AMC, MONTHS_IN_PAST_FOR_AMC, PROGRAM_TYPE_SUPPLY_PLAN, SECRET_KEY } from "../../Constants";
import DropdownService from '../../api/DropdownService';
import PlanningUnitService from "../../api/PlanningUnitService";
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import ProgramService from "../../api/ProgramService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import CryptoJS from 'crypto-js';
import csvicon from '../../assets/img/csv.png';
import { addDoubleQuoteToRowContent } from '../../CommonComponent/JavascriptCommonFunctions.js';
// Localized entity name
const entityname = i18n.t('static.dashboard.programPlanningUnit');
/**
 * Component for mapping program and planning unit.
 */
class AddprogramPlanningUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        this.state = {
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
            color: '',
            tempSortOrder: '',
            sortOrderLoading: true,
            dropdownList: [],
            active: 1,
            hasAccess:false,
        }
        this.submitForm = this.submitForm.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.changed = this.changed.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.setProgramId = this.setProgramId.bind(this);
    }
    /**
     * Function to filter planning unit based on product category
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    dropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        return mylist;
    }
    /**
     * Retrevies the program list on component mount
     */
    componentDidMount() {
        hideFirstComponent();
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getSPProgramBasedOnRealmId(realmId)
            .then(response => {
                if (response.status == 200) {
                    let myReasponse = response.data.sort((a, b) => {
                        var itemLabelA = a.code.toUpperCase();
                        var itemLabelB = b.code.toUpperCase();
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
                            hideSecondComponent();
                        })
                }
            })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false, color: '#BA0C2F'
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
        if (this.props.match.params.programId != null) {
            let programId = this.props.match.params.programId;
            this.setState({
                programId: programId,
                loading: true
            },
                () => {
                    if (programId != 0 && programId != '' && programId != null) {
                        this.buildJexcel();
                    }
                })
        }
    }
    /**
     * Sets the program id in the component state on change and builds data accordingly.
     */
    setProgramId() {
        var programId = document.getElementById("programId").value;
        this.setState({
            programId: programId,
            hasAccess:AuthenticationService.checkUserACL([programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
        },
            () => {
                this.buildJexcel();
            })
    }
    setStatus(event) {
        this.setState({
            active: event.target.value
        }, () => {
            this.buildJexcel();
        })
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    buildJexcel() {
        var list = [];
        var productCategoryListNew = [];
        var programObj;
        let programId = this.state.programId;
        this.setState({
            programId: programId,
            loading: true
        });
        if (programId != 0) {
            ProgramService.getProgramById(programId).then(response => {
                if (response.status == 200) {
                    programObj = response.data;
                    var realmId = programObj.realmCountry.realm.realmId
                    ProductCategoryServcie.getProductCategoryListByRealmId(realmId)
                        .then(response => {
                            if (response.status == 200) {
                                for (var k = 0; k < (response.data).length; k++) {
                                    var spaceCount = response.data[k].sortOrder.split(".").length;
                                    var indendent = "";
                                    for (var p = 1; p <= spaceCount - 1; p++) {
                                        if (p == 1) {
                                            indendent = indendent.concat("|_");
                                        } else {
                                            indendent = indendent.concat("_");
                                        }
                                    }
                                    var productCategoryJson = {};
                                    if (response.data[k].payload.productCategoryId == 0) {
                                        productCategoryJson = {
                                            name: (response.data[k].payload.label.label_en),
                                            id: -1,
                                            sortOrder: "00"
                                        }
                                    } else {
                                        productCategoryJson = {
                                            name: (response.data[k].payload.label.label_en),
                                            id: response.data[k].payload.productCategoryId,
                                            sortOrder: response.data[k].sortOrder
                                        }
                                    }
                                    productCategoryListNew.push(productCategoryJson);
                                }
                                this.setState({ productCategoryList: response.data });
                                ProgramService.getProgramPlaningUnitListByProgramId(this.state.programId)
                                    .then(response => {
                                        if (response.status == 200) {
                                            let myReasponse = response.data.sort((a, b) => {
                                                var itemLabelA = getLabelText(a.planningUnit.label, this.state.lang).toUpperCase();
                                                var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase();
                                                var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase();
                                                var itemLabelB = getLabelText(b.planningUnit.label, this.state.lang).toUpperCase();
                                                return itemLabelA > itemLabelB ? 1 : -1;
                                            });
                                            var productDataArr = []
                                            var productDataArr2 = []
                                            // if(this.state.active!=-1){
                                            //     if(this.state.active==1){
                                            //         myReasponse=myReasponse.filter(c=>c.active.toString()=="true");
                                            //     }else{
                                            //         myReasponse=myReasponse.filter(c=>c.active.toString()=="false");
                                            //     }
                                            // }
                                            this.setState({ rows: myReasponse });
                                            var data = [];
                                            let dropdownList = this.state.dropdownList;
                                            let indexVar = 1;
                                            if (myReasponse.length != 0) {
                                                for (var j = 0; j < myReasponse.length; j++) {
                                                    data = [];
                                                    dropdownList[j] = {
                                                        id: myReasponse[j].planningUnit.id,
                                                        name: myReasponse[j].planningUnit.label.label_en + " | " + myReasponse[j].planningUnit.id
                                                    };
                                                    data[0] = myReasponse[j].productCategory.id;
                                                    data[1] = myReasponse[j].planningUnit.id;
                                                    data[2] = (myReasponse[j].multiplier).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                                                    data[3] = myReasponse[j].planBasedOn;
                                                    data[4] = myReasponse[j].reorderFrequencyInMonths;
                                                    data[5] = myReasponse[j].planBasedOn == 1 ? myReasponse[j].minMonthsOfStock : "";
                                                    data[6] = myReasponse[j].planBasedOn == 2 ? myReasponse[j].minQty : "";
                                                    data[7] = myReasponse[j].monthsInFutureForAmc;
                                                    data[8] = myReasponse[j].monthsInPastForAmc;
                                                    data[9] = myReasponse[j].localProcurementLeadTime;
                                                    data[10] = myReasponse[j].planBasedOn == 2 ? myReasponse[j].distributionLeadTime : "";
                                                    data[11] = myReasponse[j].shelfLife;
                                                    data[12] = myReasponse[j].forecastErrorThreshold;
                                                    data[13] = myReasponse[j].catalogPrice;
                                                    data[14] = myReasponse[j].notes;
                                                    data[15] = myReasponse[j].programPlanningUnitId;
                                                    data[16] = myReasponse[j].active;
                                                    data[17] = 0;
                                                    data[18] = myReasponse[j].program.id;
                                                    data[19] = myReasponse[j].minMonthsOfStock;
                                                    data[20] = myReasponse[j].minQty;
                                                    data[21] = myReasponse[j].distributionLeadTime;
                                                    data[22] = indexVar;//to identify if new row added
                                                    if ((this.state.active == 0 && myReasponse[j].active.toString() == "false") || (this.state.active == 1 && myReasponse[j].active.toString() == "true") || (this.state.active == -1)) {
                                                        productDataArr.push(data);
                                                    } else {
                                                        productDataArr2.push(data);
                                                    }
                                                    indexVar = indexVar + 1;
                                                }
                                            }
                                            if (productDataArr.length == 0) {
                                                data = [];
                                                data[0] = 0;
                                                data[1] = "";
                                                data[2] = "";
                                                data[3] = 1;
                                                data[4] = "";
                                                data[5] = "";
                                                data[6] = "";
                                                data[7] = "";
                                                data[8] = "";
                                                data[9] = "";
                                                data[10] = "";
                                                data[11] = "";
                                                data[12] = 50;
                                                data[13] = 0;
                                                data[14] = "";
                                                data[15] = 0;
                                                data[16] = 1;
                                                data[17] = 1;
                                                data[18] = programId;
                                                data[19] = "";
                                                data[20] = "";
                                                data[21] = "";
                                                data[22] = 0;
                                                productDataArr[0] = data;
                                            }
                                            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
                                            var data = productDataArr;
                                            this.setState({ dropdownList: dropdownList })
                                            var options = {
                                                data: data,
                                                columnDrag: false,
                                                columns: [
                                                    {
                                                        title: i18n.t('static.productCategory.productCategory'),
                                                        type: 'dropdown',
                                                        source: productCategoryListNew,
                                                        width: 150,
                                                        required: true,
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.dashboard.product'),
                                                        type: 'dropdown',
                                                        source: dropdownList,
                                                        options: {
                                                            url: `${API_URL}/api/dropdown/planningUnit/autocomplete/filter/productCategory/searchText/language/sortOrder`,
                                                            autocomplete: true,
                                                            remoteSearch: true,
                                                            onbeforesearch: function (instance, request) {
                                                                if (this.state.sortOrderLoading == false && instance.search.length > 2) {
                                                                    request.method = 'GET';
                                                                    let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                                                    let jwtToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                                                                    request.beforeSend = (httpRequest) => {
                                                                        httpRequest.setRequestHeader('Authorization', 'Bearer ' + jwtToken);
                                                                    }
                                                                    const searchText = instance.search;
                                                                    const language = this.state.lang;
                                                                    const sortOrder = this.state.tempSortOrder;
                                                                    request.url = request.url.replace("searchText/language/sortOrder", `${searchText}/${language}/${sortOrder}`);
                                                                    return request;
                                                                }
                                                            }.bind(this),
                                                        },
                                                        filter: this.dropdownFilter,
                                                        width: 150,
                                                        required: true,
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.conversion.ConversionFactorFUPU'),
                                                        type: 'text',
                                                        readOnly: true,
                                                        tooltip: i18n.t("static.tooltip.conversionFactorPU"),
                                                    },
                                                    {
                                                        title: i18n.t('static.programPU.planBasedOn'),
                                                        type: 'dropdown',
                                                        source: [{ id: 1, name: i18n.t('static.report.mos') }, { id: 2, name: i18n.t('static.report.qty') }],
                                                        tooltip: i18n.t("static.programPU.planByTooltip"),
                                                        width: 120,
                                                        required: true,
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.product.reorderFrequency'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        mask: '#,##',
                                                        disabledMaskOnEdition: true,
                                                        tooltip: i18n.t("static.programPU.reorderFrequencyTooltip"),
                                                        required: true,
                                                        number: true,
                                                        regex: {
                                                            ex: JEXCEL_INTEGER_REGEX,
                                                            text: i18n.t('static.message.invalidnumber')
                                                        },
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.product.minMonthOfStock'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        mask: '#,##',
                                                        disabledMaskOnEdition: true,
                                                        tooltip: i18n.t("static.programPU.minMonthsOfStockTooltip"),
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.product.minQuantity'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        mask: '#,##',
                                                        disabledMaskOnEdition: true,
                                                        tooltip: i18n.t("static.programPU.minQtyTooltip"),
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.program.monthfutureamc'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        mask: '#,##',
                                                        disabledMaskOnEdition: true,
                                                        tooltip: i18n.t("static.programPU.monthsInFutureTooltip"),
                                                        required: true,
                                                        number: true,
                                                        regex: {
                                                            ex: JEXCEL_INTEGER_REGEX,
                                                            text: i18n.t('static.message.invalidnumber')
                                                        },
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.program.monthpastamc'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        mask: '#,##',
                                                        disabledMaskOnEdition: true,
                                                        tooltip: i18n.t("static.programPU.monthsInPastTooltip"),
                                                        required: true,
                                                        number: true,
                                                        regex: {
                                                            ex: JEXCEL_INTEGER_REGEX,
                                                            text: i18n.t('static.message.invalidnumber')
                                                        },
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.product.localProcurementAgentLeadTime'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        decimal: '.',
                                                        mask: '#,##.00',
                                                        disabledMaskOnEdition: true,
                                                        tooltip: i18n.t("static.programPU.localProcurementAgentTooltip"),
                                                        width: 120,
                                                        required: true,
                                                        regex: {
                                                            ex: JEXCEL_DECIMAL_LEAD_TIME,
                                                            text: i18n.t('static.message.invalidnumber')
                                                        },
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.product.distributionLeadTime'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        mask: '#,##',
                                                        disabledMaskOnEdition: true,
                                                        tooltip: i18n.t("static.programPU.distributionLeadTimeTooltip"),
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.report.shelfLife'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        mask: '#,##',
                                                        disabledMaskOnEdition: true,
                                                        tooltip: i18n.t("static.programPU.shelfLifeTooltip"),
                                                        width: 120,
                                                        required: true,
                                                        number: true,
                                                        regex: {
                                                            ex: JEXCEL_INTEGER_REGEX,
                                                            text: i18n.t('static.message.invalidnumber')
                                                        },
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.pu.forecastErrorThresholdPercentage'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        mask: '#,##',
                                                        disabledMaskOnEdition: true,
                                                        width: 140,
                                                        required: true,
                                                        number: true,
                                                        regex: {
                                                            ex: JEXCEL_INTEGER_REGEX,
                                                            text: i18n.t('static.message.invalidnumber')
                                                        },
                                                        tooltip: i18n.t("static.programPlanningUnit.forecastErrorTooltip"),
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.procurementAgentPlanningUnit.catalogPrice'),
                                                        type: 'numeric',
                                                        textEditor: true,
                                                        mask: '#,##.00',
                                                        disabledMaskOnEdition: true,
                                                        tooltip: i18n.t("static.programPU.catalogPriceTooltip"),
                                                        width: 120,
                                                        required: true,
                                                        regex: {
                                                            ex: JEXCEL_DECIMAL_CATELOG_PRICE,
                                                            text: i18n.t('static.message.invalidnumber')
                                                        },
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: i18n.t('static.program.notes'),
                                                        type: 'text',
                                                        width: 200,
                                                        tooltip: i18n.t("static.pu.puNotesTooltip"),
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
                                                    },
                                                    {
                                                        title: 'Id',
                                                        type: 'hidden',
                                                        readOnly: true
                                                    },
                                                    {
                                                        title: i18n.t('static.common.active'),
                                                        type: 'checkbox',
                                                        readonly: !AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT')
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
                                                    },
                                                    {
                                                        title: 'New Row Added Index',
                                                        type: 'hidden'
                                                    }
                                                ],
                                                updateTable: function (el, cell, x, y, source, value, id) {
                                                    var elInstance = el;
                                                    var rowData = elInstance.getRowData(y);
                                                    if(this.state.hasAccess){
                                                    var programPlanningUnitId = rowData[15];
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
                                                    if (rowData[3] == 1) {
                                                        var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                                                        cell1.classList.add('readonly');
                                                        var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
                                                        cell1.classList.add('readonly');
                                                        var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                                                        cell1.classList.remove('readonly');
                                                    } else {
                                                        var cell1 = elInstance.getCell(`G${parseInt(y) + 1}`)
                                                        cell1.classList.remove('readonly');
                                                        var cell1 = elInstance.getCell(`K${parseInt(y) + 1}`)
                                                        cell1.classList.remove('readonly');
                                                        var cell1 = elInstance.getCell(`F${parseInt(y) + 1}`)
                                                        cell1.classList.add('readonly');
                                                    }
                                                }
                                                    var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X']
                                                    if (rowData[16].toString() == "true") {
                                                        for (var c = 0; c < colArr.length; c++) {
                                                            try {
                                                                var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                                                                cell.classList.remove('shipmentEntryDoNotInclude');
                                                            } catch (err) { }
                                                        }
                                                    } else {
                                                        for (var c = 0; c < colArr.length; c++) {
                                                            try {
                                                                var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                                                                cell.classList.add('shipmentEntryDoNotInclude');
                                                            } catch (err) { }
                                                        }
                                                    }
                                                
                                                }.bind(this),
                                                editable: AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT'),
                                                onsearch: function (el) {
                                                },
                                                onfilter: function (el) {
                                                },
                                                oneditionstart: function (instance, cell, x, y, value) {
                                                    this.setState({ sortOrderLoading: true })
                                                    let tempId = data[y][0]
                                                    let sortOrder;
                                                    if (tempId == -1 || tempId == 0) {
                                                        sortOrder = "00"
                                                    } else {
                                                        sortOrder = this.state.productCategoryList.filter(item => item.payload.productCategoryId == tempId)[0].sortOrder
                                                    }
                                                    this.setState({ tempSortOrder: sortOrder }, () => {
                                                        this.setState({ sortOrderLoading: false })
                                                    })
                                                }.bind(this),
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
                                                copyCompatibility: true,
                                                allowManualInsertRow: false,
                                                parseFormulas: true,
                                                onpaste: this.onPaste,
                                                oneditionend: this.oneditionend,
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
                                                                    data[0] = -1;
                                                                    data[1] = "";
                                                                    data[2] = "";
                                                                    data[3] = 1;
                                                                    data[4] = "";
                                                                    data[5] = "";
                                                                    data[6] = "";
                                                                    data[7] = "";
                                                                    data[8] = "";
                                                                    data[9] = "";
                                                                    data[10] = "";
                                                                    data[11] = "";
                                                                    data[12] = 50;
                                                                    data[13] = 0;
                                                                    data[14] = "";
                                                                    data[15] = 0;
                                                                    data[16] = 1;
                                                                    data[17] = 1;
                                                                    data[18] = programId;
                                                                    data[19] = "";
                                                                    data[20] = "";
                                                                    data[21] = "";
                                                                    data[22] = 0;
                                                                    obj.insertRow(data, parseInt(y), 1);
                                                                    obj.getCell(("B").concat(parseInt(y) + 1)).classList.add('typing-' + this.state.lang);
                                                                }.bind(this)
                                                            });
                                                        }
                                                        if (obj.options.allowInsertRow == true) {
                                                            items.push({
                                                                title: i18n.t('static.common.insertNewRowAfter'),
                                                                onclick: function () {
                                                                    var data = [];
                                                                    data[0] = -1;
                                                                    data[1] = "";
                                                                    data[2] = "";
                                                                    data[3] = 1;
                                                                    data[4] = "";
                                                                    data[5] = "";
                                                                    data[6] = "";
                                                                    data[7] = "";
                                                                    data[8] = "";
                                                                    data[9] = "";
                                                                    data[10] = "";
                                                                    data[11] = "";
                                                                    data[12] = 50;
                                                                    data[13] = 0;
                                                                    data[14] = "";
                                                                    data[15] = 0;
                                                                    data[16] = 1;
                                                                    data[17] = 1;
                                                                    data[18] = programId;
                                                                    data[19] = "";
                                                                    data[20] = "";
                                                                    data[21] = "";
                                                                    data[22] = 0;
                                                                    obj.insertRow(data, parseInt(y));
                                                                    obj.getCell(("B").concat(parseInt(y) + 2)).classList.add('typing-' + this.state.lang);
                                                                }.bind(this)
                                                            });
                                                        }
                                                        if (obj.options.allowDeleteRow == true) {
                                                            if (obj.getRowData(y)[15] == 0) {
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
                                                        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES') && AuthenticationService.getProgramListBasedOnBusinessFunction('ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES').includes(programId)) {
                                                            let cordsValue = `${this.el.getValueFromCoords(1, y)}`;
                                                            if (obj.options.allowInsertRow == true) {
                                                                if (cordsValue.length != 0) {
                                                                    items.push({
                                                                        title: i18n.t('static.countrySpecificPrices.addCountrySpecificPrices'),
                                                                        onclick: function () {
                                                                            this.props.history.push({
                                                                                pathname: `/programProduct/addCountrySpecificPrice/${this.el.getValueFromCoords(1, y)}/${programId}`,
                                                                            });
                                                                        }.bind(this)
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    }
                                                    items.push({ type: 'line' });
                                                    return items;
                                                }.bind(this)
                                            };
                                            var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                            this.el = elVar;
                                            if (productDataArr.length == 0) {
                                                this.el.getCell(("B").concat(parseInt(0) + 1)).classList.add('typing-' + this.state.lang);
                                            }
                                            this.setState({ mapPlanningUnitEl: elVar, loading: false, productDataArr2: productDataArr2 });
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode, loading: false, color: '#BA0C2F'
                                            })
                                        }
                                    }).catch(
                                        error => {
                                            if (error.message === "Network Error") {
                                                this.setState({
                                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                                    loading: false, color: '#BA0C2F'
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
                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                        loading: false, color: '#BA0C2F'
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                            loading: false, color: '#BA0C2F'
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
            jexcel.destroy(document.getElementById("mapPlanningUnit"), true);
        }
    }
    /**
     * Function to add a new row to the jexcel table.
     */
    addRowInJexcel = function () {
        var data = [];
        data[0] = "-1";
        data[1] = "";
        data[2] = "";
        data[3] = 1;
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = MONTHS_IN_FUTURE_FOR_AMC;
        data[8] = MONTHS_IN_PAST_FOR_AMC;
        data[9] = "";
        data[10] = "";
        data[11] = "";
        data[12] = 50;
        data[13] = 0;
        data[14] = "";
        data[15] = 0;
        data[16] = 1;
        data[17] = 1;
        data[18] = this.state.programId;
        data[19] = "";
        data[20] = "";
        data[21] = "";
        data[22] = 0;
        this.el.insertRow(
            data, 0, 1
        );
        this.el.getCell(("B").concat(parseInt(0) + 1)).classList.add('typing-' + this.state.lang);
    }
    /**
     * Callback function called when editing of a cell in the jexcel table ends.
     * @param {object} instance - The jexcel instance.
     * @param {object} cell - The cell object.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {any} value - The new value of the cell.
     */
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);
        if (x == 4 && !isNaN(rowData[4]) && rowData[4].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(4, y, parseFloat(rowData[4]), true);
        } else if (x == 5 && !isNaN(rowData[5]) && rowData[5].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(5, y, parseFloat(rowData[5]), true);
        } else if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        } else if (x == 9 && !isNaN(rowData[9]) && rowData[9].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(9, y, parseFloat(rowData[9]), true);
        } else if (x == 11 && !isNaN(rowData[11]) && rowData[11].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(11, y, parseFloat(rowData[11]), true);
        } else if (x == 13 && !isNaN(rowData[13]) && rowData[13].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(13, y, parseFloat(rowData[13]), true);
        } else if (x == 1) {
            PlanningUnitService.getPlanningUnitById(rowData[1]).then(response => {
                if (response.status == 200) {
                    elInstance.setValueFromCoords(2, y, (response.data.multiplier).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), true);
                }
            })
        }
    }
    /**
     * Function to handle paste events in the jexcel table.
     * @param {Object} instance - The jexcel instance.
     * @param {Array} data - The data being pasted.
     */
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`P${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(13, data[i].y, 0, true);
                    (instance).setValueFromCoords(15, data[i].y, 0, true);
                    (instance).setValueFromCoords(16, data[i].y, 1, true);
                    (instance).setValueFromCoords(17, data[i].y, 1, true);
                    (instance).setValueFromCoords(18, data[i].y, this.state.programId, true);
                    z = data[i].y;
                }
            }
            if (data[i].x == 0) {
                var index = (instance).getValue(`Q${parseInt(data[i].y) + 1}`, true);
                if (index == 0) {
                    (instance).setValueFromCoords(0, data[i].y, data[i].value, true);
                }
            }
            if (data[i].x == 1) {
                var index = (instance).getValue(`W${parseInt(data[i].y) + 1}`, true);
                if (index == 0) {
                    let temp = data[i].value.split(" | ");
                    let temp_obj = {
                        id: parseInt(temp[1]),
                        name: data[i].value
                    };
                    let temp_list = this.state.dropdownList;
                    let index = temp_list.findIndex(c => c.id == temp_obj.id);

                    if (index == -1) {
                        //if new planning unit push to list
                        temp_list.push(temp_obj);
                    }

                    // temp_list[data[i].y] = temp_obj;
                    this.setState(
                        {
                            dropdownList: temp_list
                        }, () => {
                            // (instance).setValueFromCoords(1, data[i].y, '', true);//temp added
                            (instance).setValueFromCoords(1, data[i].y, data[i].value, true);
                        }
                    )
                }
            }
        }
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation() {
        var valid = true;
        var json = this.el.getJson(null, false).concat(this.state.productDataArr2);
        valid = checkValidation(this.el)
        for (var y = 0; y < json.length; y++) {
            var value = this.el.getValueFromCoords(17, y);
            if (parseInt(value) == 1) {
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getRowData(parseInt(y))[1];

                for (var i = (json.length - 1); i >= 0; i--) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    if (planningUnitValue == value && y != i && i > y) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = -1;
                        valid = false;
                    }
                }


                var col = ("F").concat(parseInt(y) + 1);
                value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX
                if (json[y][3] == 1 && value == "") {
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
                var col = ("G").concat(parseInt(y) + 1);
                value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX
                if (json[y][3] == 2 && value == "") {
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
                var col = ("K").concat(parseInt(y) + 1);
                value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX
                if (json[y][3] == 2 && value == "") {
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
            }
        }
        return valid;
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
        var valid = true;
        var rowData = this.el.getRowData(y);
        changed(instance, cell, x, y, value)
        this.el.setValueFromCoords(17, y, 1, true);
        if (x == 0) {
            this.el.setValueFromCoords(1, y, "", true);
        }
        else if (x == 1) {
            this.el.getCell(("B").concat(parseInt(y) + 1)).classList.remove('typing-' + this.state.lang);
            var json = this.el.getJson(null, false).concat(this.state.productDataArr2);
            var col = ("B").concat(parseInt(y) + 1);

            var jsonLength = parseInt(json.length) - 1;
            for (var i = jsonLength; i >= 0; i--) {
                var map = new Map(Object.entries(json[i]));
                var planningUnitValue = map.get("1");
                if (planningUnitValue == value && y != i) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                    this.el.setValueFromCoords(17, y, 1, true);
                    valid = false;
                    i = -1;
                }
            }

        }
        else if (x == 3) {
            value = this.el.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(17, y, 1, true);
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                this.el.setValueFromCoords(17, y, 1, true);
                value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX
                var col = ("F").concat(parseInt(y) + 1);
                if (rowData[3] == 1 && value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    this.el.setValueFromCoords(17, y, 1, true);
                    valid = false;
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        this.el.setValueFromCoords(17, y, 1, true);
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(17, y, 1, true);
                    }
                }
                value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX
                var col = ("G").concat(parseInt(y) + 1);
                if (rowData[3] == 2 && value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    this.el.setValueFromCoords(17, y, 1, true);
                    valid = false;
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        this.el.setValueFromCoords(17, y, 1, true);
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(17, y, 1, true);
                    }
                }
                value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
                var reg = JEXCEL_INTEGER_REGEX
                var col = ("K").concat(parseInt(y) + 1);
                if (rowData[3] == 2 && value == "") {
                    this.el.setValueFromCoords(10, y, 0, true);
                    this.el.setValueFromCoords(17, y, 1, true);
                    valid = false;
                } else {
                    if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        this.el.setValueFromCoords(17, y, 1, true);
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(17, y, 1, true);
                    }
                }
            }
            if (rowData[3] == 2) {
                this.el.setValueFromCoords(5, y, "", true);
                this.el.setValueFromCoords(6, y, rowData[20], true);
                this.el.setValueFromCoords(10, y, rowData[21] != "" ? rowData[21] : 0, true);
            } else {
                this.el.setValueFromCoords(6, y, "", true);
                this.el.setValueFromCoords(10, y, "", true);
                this.el.setValueFromCoords(5, y, rowData[19], true);
            }
        }
        else if (x == 5) {
            value = this.el.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("F").concat(parseInt(y) + 1);
            if (rowData[3] == 1 && value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(17, y, 1, true);
                valid = false;
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(17, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(17, y, 1, true);
                }
            }
            if (value !== "") {
                this.el.setValueFromCoords(19, y, value, true);
            }
        }
        else if (x == 6) {
            value = this.el.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("G").concat(parseInt(y) + 1);
            if (rowData[3] == 2 && value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(17, y, 1, true);
                valid = false;
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(17, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(17, y, 1, true);
                }
            }
            if (value !== "") {
                this.el.setValueFromCoords(20, y, value, true);
            }
        }
        else if (x == 10) {
            value = this.el.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll(",", "");
            var reg = JEXCEL_INTEGER_REGEX
            var col = ("K").concat(parseInt(y) + 1);
            if (rowData[3] == 2 && value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(17, y, 1, true);
                valid = false;
            } else {
                if ((isNaN(parseInt(value)) || !(reg.test(value))) && value != "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(17, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(17, y, 1, true);
                }
            }
            if (value !== "") {
                this.el.setValueFromCoords(21, y, value, true);
            }
        }

        if (x != 17) {
            this.el.setValueFromCoords(17, y, 1, true);
        }
        this.setState({ isValidData: valid, isChanged: true });
    }
    /**
     * Function to handle form submission and save the data on server.
     */
    submitForm() {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({ loading: true })
            var json = this.el.getJson(null, false);
            var planningUnitArray = []
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                if (map.get("17") == 1) {
                    if (map.get("15") == "") {
                        var pId = 0;
                    } else {
                        var pId = map.get("15");
                    }
                    var planningUnitJson = {
                        programPlanningUnitId: pId,
                        program: {
                            id: map.get("18")
                        },
                        planningUnit: {
                            id: map.get("1"),
                        },
                        reorderFrequencyInMonths: this.el.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        minMonthsOfStock: this.el.getValue(`T${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        monthsInFutureForAmc: this.el.getValue(`H${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        monthsInPastForAmc: this.el.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        localProcurementLeadTime: this.el.getValue(`J${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        shelfLife: this.el.getValue(`L${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        catalogPrice: this.el.getValue(`N${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        active: map.get("16"),
                        minQty: this.el.getValue(`U${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        distributionLeadTime: this.el.getValue(`V${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        planBasedOn: map.get("3"),
                        forecastErrorThreshold: this.el.getValue(`M${parseInt(i) + 1}`, true).toString().replaceAll(",", ""),
                        notes: map.get("14")
                    }
                    planningUnitArray.push(planningUnitJson);
                }
            }
            ProgramService.addprogramPlanningUnitMapping(planningUnitArray)
                .then(response => {
                    if (response.status == "200") {
                        this.setState({
                            message: i18n.t('static.message.planningUnitUpdate'), loading: false, color: 'green', isChanged: false
                        },
                            () => {
                                hideSecondComponent();
                                this.buildJexcel();
                            })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false, color: '#BA0C2F'
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
                                loading: false, color: '#BA0C2F'
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
                                    },()=>{
                                        hideSecondComponent();
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
                                        loading: false, color: '#BA0C2F'
                                    },
                                        () => {
                                            hideSecondComponent();
                                        });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false, color: '#BA0C2F'
                                    },
                                        () => {
                                            hideSecondComponent();
                                        });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false, color: '#BA0C2F'
                                    },
                                        () => {
                                            hideSecondComponent();
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
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('InfoTr');
        tr.children[5].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[6].classList.add('InfoTr');
        tr.children[7].classList.add('InfoTr');
        tr.children[8].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[9].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[10].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[14].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[12].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[13].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[15].classList.add('InfoTr');
        tr.children[4].classList.add('InfoTrAsteriskTheadtrTdImage');
        tr.children[4].classList.add('InfoTrAsteriskTheadtrTdImagePlanby');
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var planningUnitList;
        // if (response.data.length > 0) {
        var A = [];
        let tableHeadTemp = [];
        tableHeadTemp.push(i18n.t('static.productCategory.productCategory').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.dashboard.product').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.conversion.ConversionFactorFUPU').replaceAll(' ', '%20'));
        tableHeadTemp.push((i18n.t('static.programPU.planBasedOn')).replaceAll(' ', '%20'));
        tableHeadTemp.push((i18n.t('static.product.reorderFrequency')).replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.product.minMonthOfStock').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.product.minQuantity').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.program.monthfutureamc').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.program.monthpastamc').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.product.localProcurementAgentLeadTime').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.product.distributionLeadTime').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.report.shelfLife').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.pu.forecastErrorThresholdPercentage').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.procurementAgentPlanningUnit.catalogPrice').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.program.notes').replaceAll(' ', '%20'));
        tableHeadTemp.push(i18n.t('static.common.active').replaceAll(' ', '%20'));
        A[0] = addDoubleQuoteToRowContent(tableHeadTemp);
        this.state.mapPlanningUnitEl.getJson(null, true).map(ele => A.push(addDoubleQuoteToRowContent([ele[0].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''), ele[1].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''), ele[2].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''), ele[3].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[4].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[5].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[6].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[7].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[8].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[9].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[10].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[11].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[12].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[13].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[14].toString().replaceAll(',', ' ').replaceAll(' ', '%20').replaceAll('#', '%23').replaceAll('\'', '').replaceAll('\"', ''),
        ele[16].toString() == "true" ? i18n.t('static.common.active') : i18n.t('static.common.disabled')])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        // }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + "-" + i18n.t('static.Update.PlanningUnits') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Renders the mapping of program planning unit list.
     * @returns {JSX.Element} - Mapping of program planning unit list.
     */
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
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 style={{ color: this.state.color }} id="div2">{this.state.message}</h5>
                {/* <div style={{ flexBasis: 'auto' }}> */}
                <Card>
                    <CardBody className="pb-lg-5 pt-lg-1">
                        <Col md="12 pl-0">
                            {this.state.programId != "" && this.state.programId != null && this.state.programId != undefined && this.state.programId != 0 && <img className='float-right mr-1' style={{ height: '25px', width: '25px', cursor: 'Pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />}
                            <div className='row'>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                    <div className="controls">
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
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                    <div className="controls">
                                        <InputGroup>
                                            <Input
                                                type="select"
                                                name="active"
                                                id="active"
                                                bsSize="sm"
                                                onChange={(e) => { this.setStatus(e) }}
                                                value={this.state.active}
                                            >
                                                <option value="-1">{i18n.t('static.common.all')}</option>
                                                <option value="1">{i18n.t('static.common.active')}</option>
                                                <option value="0">{i18n.t('static.common.disabled')}</option>
                                            </Input>
                                        </InputGroup>
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <div>
                            <h4 className="red">{this.props.message}</h4>
                            <h5>{i18n.t('static.updatePU.noteText1')} <a href="/#/programProduct/addCountrySpecificPrice">{i18n.t('static.countrySpecificPrices.countrySpecificPrices')}</a> {i18n.t("static.updatePU.noteText2")}</h5>
                            <div className="consumptionDataEntryTable FreezePlaningUnitColumn1 CursorDrag" style={{ display: this.state.loading ? "none" : "block" }}>
                                <div id="mapPlanningUnit" className="RowheightForaddprogaddRow TableWidth100">
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
                            {this.state.isValidData && this.state.programId != 0 && AuthenticationService.checkUserACL([this.state.programId.toString()],'ROLE_BF_ADD_PROGRAM_PRODUCT') && <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRowInJexcel}> <i className="fa fa-plus"></i>{i18n.t('static.common.addRow')}</Button>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>
                {/* </div> */}
            </div>
        );
    }
    /**
     * Redirects to the application dashboard screen when cancel button is clicked.
     */
    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}
export default AddprogramPlanningUnit;