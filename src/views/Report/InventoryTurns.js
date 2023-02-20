import React, { Component } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Form, Table } from 'reactstrap';
import Select from 'react-select';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import ProcurementUnitService from "../../api/ProcurementUnitService";
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import jsPDF from "jspdf";
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import DatePicker from 'react-datepicker';
import "jspdf-autotable";
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js';
import pdfIcon from '../../assets/img/pdf.png';
import moment from 'moment'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { Link } from "react-router-dom";
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, API_URL } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions';
import classNames from 'classnames';
import CountryService from "../../api/CountryService";
import ProductCategoryService from "../../api/PoroductCategoryService";
import RealmCountryService from '../../api/RealmCountryService';
import { json } from 'mathjs';
import { de } from 'date-fns/locale';


export const PSM_PROCUREMENT_AGENT_ID = 1
export const CANCELLED_SHIPMENT_STATUS = 8

const entityname = i18n.t('static.dashboard.inventoryTurns');
const { ExportCSVButton } = CSVExport;
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
export default class InventoryTurns extends Component {

    constructor(props) {
        super(props);
        this.state = {
            CostOfInventoryInput: {
                planningUnitIds: [],
                dt: new Date(),
                includePlanningShipments: true,
                country: [],
                pu: [],
                programIds: [],
                displayId: ''
            },
            costOfInventory: [],
            costOfCountry:[],
            costOfProgram:[],
            versions: [],
            message: '',
            countryList: [],
            countryId: [],
            puList: [],
            puId: [],
            programList: [],
            programId: [],
            singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
            testData: [
                {
                    parentId: 1,
                    name: "Product 1",
                    val1: 25,
                    val2: 35,
                    val3: 25
                },
                {
                    parentId: 2,
                    name: "Product 2",
                    val1: 25,
                    val2: 45,
                    val3: 85
                },
                {
                    parentId: 3,
                    name:"Product 3",
                    val1: 25,
                    val2: 35,
                    val3: 25
                },
                {
                    parentId: 4,
                    name:"Product 4",
                    val1: 25,
                    val2: 35,
                    val3: 25
                },
                {
                    parentId: 5,
                    name:"Product 5",
                    val1: 25,
                    val2: 35,
                    val3: 25
                }

            ],
            testData1: [
                {
                    parentId: 2,
                    name: "Child 1",
                    val1: 58,
                    val2: 68,
                    val3: 87
                }
            ],
            childShowArr: {},
            childShowArr1: []
        }
        this.formSubmit = this.formSubmit.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
        this.radioChange = this.radioChange.bind(this);
        this.filterData = this.filterData.bind(this);
        this.updateCountryData = this.updateCountryData.bind(this);
        this.updatePUData = this.updatePUData.bind(this);
        this.toggleAccordion = this.toggleAccordion.bind(this);
        this.toggleAccordion1 = this.toggleAccordion1.bind(this);


    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    roundN = num => {
        return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
    }
    round = num => {
        return Number(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0));
    }

    dateformatter = value => {
        var dt = new Date(value)
        return moment(dt).format('DD-MMM-YY');
    }
    formatterDouble = value => {

        var cell1 = this.roundN(value)
        cell1 += '';
        var x = cell1.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    formatter = value => {

        var cell1 = this.round(value)
        cell1 += '';
        var x = cell1.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV = (columns) => {

        // var csvRow = [];
        // csvRow.push('"' + (i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20') + '"')
        // csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('"' + (i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('"' + (i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        // csvRow.push('')
        // csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        // csvRow.push('')
        // var re;

        // const headers = [];
        // columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

        // var A = [this.addDoubleQuoteToRowContent(headers)]
        // this.state.costOfInventory.map(ele => A.push(this.addDoubleQuoteToRowContent([ele.planningUnit.id, (getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.totalConsumption, this.round(ele.avergeStock), ele.noOfMonths, this.roundN(ele.inventoryTurns)])));

        // for (var i = 0; i < A.length; i++) {
        //     csvRow.push(A[i].join(","))
        // }
        // var csvString = csvRow.join("%0A")
        // var a = document.createElement("a")
        // a.href = 'data:attachment/csv,' + csvString
        // a.target = "_Blank"
        // a.download = i18n.t('static.dashboard.inventoryTurns') + ".csv"
        // document.body.appendChild(a)
        // a.click()
    }
    exportPDF = (columns) => {
        // const addFooters = doc => {

        //     const pageCount = doc.internal.getNumberOfPages()

        //     doc.setFont('helvetica', 'bold')
        //     doc.setFontSize(6)
        //     for (var i = 1; i <= pageCount; i++) {
        //         doc.setPage(i)

        //         doc.setPage(i)
        //         doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
        //             align: 'center'
        //         })
        //         doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
        //             align: 'center'
        //         })


        //     }
        // }
        // const addHeaders = doc => {

        //     const pageCount = doc.internal.getNumberOfPages()
        //     for (var i = 1; i <= pageCount; i++) {
        //         doc.setFontSize(12)
        //         doc.setFont('helvetica', 'bold')

        //         doc.setPage(i)
        //         doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
        //         doc.setTextColor("#002f6c");
        //         doc.text(i18n.t('static.dashboard.inventoryTurns'), doc.internal.pageSize.width / 2, 60, {
        //             align: 'center'
        //         })
        //         if (i == 1) {
        //             doc.setFontSize(8)
        //             doc.setFont('helvetica', 'normal')
        //             doc.text(i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
        //                 align: 'left'
        //             })
        //             doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
        //                 align: 'left'
        //             })
        //             doc.text(i18n.t('static.report.versionFinal*') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
        //                 align: 'left'
        //             })
        //             doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
        //                 align: 'left'
        //             })

        //         }

        //     }
        // }
        // const unit = "pt";
        // const size = "A4"; // Use A1, A2, A3 or A4
        // const orientation = "landscape"; // portrait or landscape

        // const marginLeft = 10;
        // const doc = new jsPDF(orientation, unit, size, true);

        // doc.setFontSize(8);

        // // var canvas = document.getElementById("cool-canvas");
        // //creates image

        // // var canvasImg = canvas.toDataURL("image/png", 1.0);
        // var width = doc.internal.pageSize.width;
        // var height = doc.internal.pageSize.height;
        // var h1 = 50;
        // // var aspectwidth1 = (width - h1);

        // // doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');

        // const headers = columns.map((item, idx) => (item.text));
        // const data = this.state.costOfInventory.map(ele => [ele.planningUnit.id, getLabelText(ele.planningUnit.label), this.formatter(ele.totalConsumption), this.formatter(ele.avergeStock), this.formatter(ele.noOfMonths), this.formatterDouble(ele.inventoryTurns)]);

        // let content = {
        //     margin: { top: 80, bottom: 50 },
        //     startY: 170,
        //     head: [headers],
        //     body: data,
        //     styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 96 },
        //     columnStyles: {
        //         1: { cellWidth: 281.89 },
        //     }
        // };
        // doc.autoTable(content);
        // addHeaders(doc)
        // addFooters(doc)
        // doc.save(i18n.t('static.dashboard.inventoryTurns') + ".pdf")
    }

    handleClickMonthBox2 = (e) => {
        this.refs.pickAMonth2.show()
    }
    handleAMonthChange2 = (value, text) => {
        //
        //
    }
    handleAMonthDissmis2 = (value) => {
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        var dt = new Date(`${value.year}`, `${value.month - 1}`, 1)
        costOfInventoryInput.dt = dt
        this.setState({ singleValue2: value, costOfInventoryInput }, () => {
            this.formSubmit();
        })

    }


    dataChange(event) {
        let costOfInventoryInput = this.state.CostOfInventoryInput;

        if (event.target.name == "includePlanningShipments") {
            costOfInventoryInput.includePlanningShipments = event.target.value;

        }
        
        this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
    }

    updateCountryData(value) {

        var selectedArray = [];
        for (var p = 0; p < value.length; p++) {
            selectedArray.push(value[p].value);
        }

        if (selectedArray.includes("-1")) {
            this.setState({ countryId: [] });
            var list = this.state.countryList.filter(c => c.value != -1)
            this.setState({ countryId: list });
            var countryId = list;
        } else {
            this.setState({ countryId: value });
            var countryId = value;
        }

        var countryArray = [];
        for (var i = 0; i < countryId.length; i++) {
            countryArray[i] = countryId[i].value;
        }
        this.setState( prevState => ({ CostOfInventoryInput : { ...prevState.CostOfInventoryInput, country: countryArray} } ));
        ProgramService.getProgramListByRealmCountryIdList(countryArray).then(response => {
            let programIdArray = [];
            response.data.map(e => programIdArray.push(e.id));
            var json = (response.data).filter(c => c.label.active == true);
            var regList = [];
            for (var i = 0; i < json.length; i++) {
                regList[i] = { value: json[i].id, label: json[i].label.label_en }
            }
            var listArray = regList;
            listArray.sort((a, b) => {
                var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            listArray.unshift({ value: "-1", label: i18n.t("static.common.all") });
                        
            console.log("getProgramListByRealmCountryIdList=====>", programIdArray);
            this.setState( prevState => ({ programList: listArray, CostOfInventoryInput : { ...prevState.CostOfInventoryInput, programIds: programIdArray} } ),
            () => this.formSubmit());            
        }).catch(
            error => {
                this.setState({
                    costOfInventory: [],
                    loading: false
                }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    // this.el.destroy();
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                });
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

    updatePUData(value) {

        var selectedArray = [];
        for (var p = 0; p < value.length; p++) {
            selectedArray.push(value[p].value);
        }

        if (selectedArray.includes("-1")) {
            this.setState({ puId: [] });
            var list = this.state.puList.filter(c => c.value != -1)
            this.setState({ puId: list });
            var puId = list;
        } else {
            this.setState({ puId: value });
            var puId = value;
        }

        var puArray = [];
        for (var i = 0; i < puId.length; i++) {
            puArray[i] = puId[i].value;
        }
        this.setState( prevState => ({ CostOfInventoryInput : { ...prevState.CostOfInventoryInput, pu: puArray} }));
        ProgramService.getProgramListByProductCategoryIdList(puArray).then(response => {
            let programIdArray = [];
            response.data.map(e => programIdArray.push(e.id));

            var json = (response.data).filter(c => c.label.active == true);
            var regList = [];
            for (var i = 0; i < json.length; i++) {
                regList[i] = { value: json[i].id, label: json[i].label.label_en }
            }
            var listArray = regList;
            listArray.sort((a, b) => {
                var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            listArray.unshift({ value: "-1", label: i18n.t("static.common.all") });

            console.log("getProgramListByProductCategoryIdList=====>", programIdArray);
            this.setState( prevState => ({ programList:listArray, CostOfInventoryInput : { ...prevState.CostOfInventoryInput, programIds: programIdArray} } ),
            () => this.formSubmit());
        }).catch(
            error => {
                this.setState({
                    costOfInventory: [],
                    loading: false
                }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    // this.el.destroy();
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                });
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

    updateProgramData(value){
        var selectedArray = [];
        for (var p = 0; p < value.length; p++) {
            selectedArray.push(value[p].value);
        }

        if (selectedArray.includes("-1")) {
            this.setState({ programId: [] });
            var list = this.state.programList.filter(c => c.value != -1)
            this.setState({ programId: list });
            var programId = list;
        } else {
            this.setState({ programId: value });
            var programId = value;
        }

        var programArray = [];
        for (var i = 0; i < programId.length; i++) {
            programArray[i] = programId[i].value;
        }
        this.setState( prevState => ({ CostOfInventoryInput : { ...prevState.CostOfInventoryInput, programIds: programArray} } ),
        ()=>this.formSubmit());
    }

    filterData() {
        let displayId = this.state.CostOfInventoryInput.displayId;
        (displayId == 1 ? document.getElementById("hideCountryDiv").style.display = "block" : document.getElementById("hideCountryDiv").style.display = "none");
        (displayId == 2 ? document.getElementById("hideProductDiv").style.display = "block" : document.getElementById("hideProductDiv").style.display = "none");

    }

    radioChange(event) {
        let tempId = event.target.id;

        if(tempId === "displayId1"){
            this.setState( prevState => ({ programList:[], programId:[], costOfInventory: [], costOfCountry:[], costOfProgram:[], CostOfInventoryInput : { ...prevState.CostOfInventoryInput, displayId: parseInt(1), pu: [0], programIds:[] }}
        ),
            () => {
                this.filterData();
            })    
        }else{
            this.setState( prevState => ({ programList:[], programId:[], costOfInventory: [], costOfCountry:[], costOfProgram:[], CostOfInventoryInput : { ...prevState.CostOfInventoryInput, displayId: parseInt(2), country: [], programIds:[] }}
        ),
            () => {
                this.filterData();
                this.formSubmit();
            })
        }
    }

    componentDidMount() {
       
        document.getElementById("hideProductDiv").style.display = "none";
        document.getElementById("hideCountryDiv").style.display = "none";

        RealmCountryService.getRealmCountryListAll()
                .then(response => {
                    console.log("Realm Country List list---", response.data);
                    if (response.status == 200) {
                        var json = (response.data).filter(c => c.active == true);
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].realmCountryId, label: json[i].country.label.label_en }
                        }
                        var listArray = regList;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        listArray.unshift({ value: "-1", label: i18n.t("static.common.all") });
                        this.setState({
                            countryList: listArray,
                            loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        })
                    }
                }).catch(
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

                ProductCategoryService.getProductCategoryListByRealmId(AuthenticationService.getRealmId())
                .then(response => {
                    console.log("Planning Unit List list---", response.data);
                    if (response.status == 200) {
                        // var json = response.data;
                        var json = (response.data).filter(c => c.payload.active == true);
                        var regList = [];
                        for (var i = 0; i < json.length; i++) {
                            regList[i] = { value: json[i].id, label: json[i].payload.label.label_en }
                        }
                        var listArray = regList;
                        
                        listArray.sort((a, b) => {
                            var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        // listArray.unshift({ value: "-1", label: i18n.t("static.common.all") });
                        this.setState({
                            puList: listArray,
                            loading: false
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode, loading: false
                        })
                    }
                }).catch(
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


    getMonthArray = (currentDate) => {
        var month = [];
        var curDate = currentDate.subtract(0, 'months');
        month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')) })
        for (var i = 1; i < 12; i++) {
            var curDate = currentDate.add(1, 'months');
            month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')) })
        }

        return month;
    }

    buildJExcel() {
        let costOfInventory = this.state.costOfInventory;
        // console.log("costOfInventory---->", costOfInventory);
        let costOfInventoryArray = [];
        let count = 0;

        for (var j = 0; j < costOfInventory.length; j++) {
            data = [];
            data[0] = getLabelText(costOfInventory[j].planningUnit.label, this.state.lang);
            data[1] = (costOfInventory[j].totalConsumption);
            data[2] = Number(costOfInventory[j].avergeStock).toFixed(2);
            data[3] = (costOfInventory[j].noOfMonths);
            data[4] = (costOfInventory[j].inventoryTurns);

            costOfInventoryArray[count] = data;
            count++;
        }
        if (costOfInventory.length == 0) {
            data = [];
            costOfInventoryArray[0] = data;
        }
        // console.log("costOfInventoryArray---->", costOfInventoryArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = costOfInventoryArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [

                {
                    title: i18n.t('static.report.planningUnit'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.report.totconsumption'),
                    type: 'numeric', mask: '#,##',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.report.avergeStock'),
                    type: 'numeric', mask: '#,##',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.report.noofmonth'),
                    type: 'numeric', mask: '#,##',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.dashboard.inventoryTurns'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    // readOnly: true
                },
            ],
            // text: {
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            editable: false,
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,


            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }


    formSubmit() {

        var inputJson = {
            "country": this.state.CostOfInventoryInput.country,
            "programIds": this.state.CostOfInventoryInput.programIds,
            "productCategoryIds": this.state.CostOfInventoryInput.pu,
            "viewBy": this.state.CostOfInventoryInput.displayId,
            "dt": moment(this.state.CostOfInventoryInput.dt).startOf('month').format('YYYY-MM-DD'),
            "includePlannedShipments": this.state.CostOfInventoryInput.includePlanningShipments.toString() == "true" ? 1 : 0
        }
        console.log("Hello "+JSON.stringify(inputJson))
        // AuthenticationService.setupAxiosInterceptors();

        if(inputJson.programIds.length > 0){
            ReportService.inventoryTurns(inputJson).then(response => {
                console.log("costOfInentory=====>", JSON.stringify(response.data));

                const level1Data = [];
                const level2Data = [];
                
                if(this.state.CostOfInventoryInput.displayId == 1){
                    for(let i=0; i < this.state.CostOfInventoryInput.country.length; i++){
                        let tempData = response.data.filter(e => e.realmCountry.id == this.state.CostOfInventoryInput.country[i]);
                        let level1Consumption = tempData.reduce((prev,curr,index) => prev + curr.totalConsumption, 0);
                        let unique = [...new Set(tempData.map((item) => item.program.id))];
                    
                        level1Data.push({
                            id: this.state.CostOfInventoryInput.country[i],
                            countryName: tempData[0].realmCountry.label.label_en,
                            totalConsumption: level1Consumption,
                            programIds: unique
                        })
                    
                        for(let j=0; j<unique.length; j++){
                            let temp = response.data.filter(e =>  e.realmCountry.id == this.state.CostOfInventoryInput.country[i] && e.program.id == unique[j])
                            let level2Consumption = temp.reduce((prev,curr,index) => prev + curr.totalConsumption, 0);
                            
                            level2Data.push({
                                id: this.state.CostOfInventoryInput.country[i],
                                programId: unique[j],
                                programName: temp[0].program.label.label_en,
                                totalConsumption: level2Consumption
                            })
                        }
                    }
                }else{
                    for(let i=0; i < this.state.CostOfInventoryInput.pu.length; i++){
                        let tempData = response.data.filter(e => e.productCategory.id == this.state.CostOfInventoryInput.pu[i]);
                        console.log("Hello1 "+JSON.stringify(tempData));
                        let level1Consumption = tempData.reduce((prev,curr,index) => prev + curr.totalConsumption, 0);
                        let unique = [...new Set(tempData.map((item) => item.program.id))];
                    
                        level1Data.push({
                            id: this.state.CostOfInventoryInput.pu[i],
                            countryName: tempData[0].productCategory.label.label_en,
                            totalConsumption: level1Consumption,
                            programIds: unique
                        })
                    
                        for(let j=0; j<unique.length; j++){
                            let temp = response.data.filter(e =>  e.productCategory.id == this.state.CostOfInventoryInput.pu[i] && e.program.id == unique[j])
                            let level2Consumption = temp.reduce((prev,curr,index) => prev + curr.totalConsumption, 0);
                            
                            level2Data.push({
                                id: this.state.CostOfInventoryInput.pu[i],
                                programId: unique[j],
                                programName: temp[0].program.label.label_en,
                                totalConsumption: level2Consumption
                            })
                        }
                    }
                } 

                this.setState({
                    costOfInventory: response.data, 
                    costOfCountry: level1Data,
                    costOfProgram: level2Data,
                    message: ''
                }, () => {
                    this.setState({
                      isTableLoaded: this.getTableDiv()
                    })
                  });
            }).catch(
                error => {
                    this.setState({
                        costOfInventory: [],
                        loading: false
                    }, () => {
                        this.el = jexcel(document.getElementById("tableDiv"), '');
                        // this.el.destroy();
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    });
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
        }else{
            this.setState({
                costOfInventory: [],
                costOfCountry: [],
                costOfProgram: [],
            },() => {
                this.setState({
                    isTableLoaded: this.getTableDiv()
                })
            });
            
        }
    }
    formatLabel(cell, row) {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        }
    }

      toggleAccordion(parentId) {
        var childShowArr = this.state.childShowArr;
        if (parentId in childShowArr) {
          delete childShowArr[parentId]
        } else {
          childShowArr[parentId]=[]
        }
        this.setState({
            childShowArr: childShowArr
        }, () => {
          this.setState({
            isTableLoaded: this.getTableDiv()
          })
        })
        
      }

      toggleAccordion1(childId, parentId) {
        var childShowArr = this.state.childShowArr;
        var temp = childShowArr[parentId];
        if (temp.includes(childId)) {
          childShowArr[parentId] = temp.filter(c => c != childId);
        } else {
          childShowArr[parentId].push(childId)
        }
        this.setState({
            childShowArr: childShowArr
        }, () => {
          this.setState({
            isTableLoaded: this.getTableDiv()
          })
        })
        
      }

    getTableDiv() {
        return (
          <Table className="table-bordered text-center overflowhide main-table " bordered size="sm" options={this.options}>
            <thead>
              <tr>
                {/* <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th> */}
                <th></th>
                <th className="dataentryTdWidth sticky-col first-col clone">{i18n.t('static.dashboard.Productmenu')}</th>
                <th>{i18n.t('static.report.totconsumption')}</th>
                <th>{i18n.t('static.report.avergeStock')}</th>
                <th>{i18n.t('static.dashboard.months')}</th>
                <th>{i18n.t('static.dashboard.inventoryTurns')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.costOfCountry.map(item => {

                return (<>
                  <tr className="hoverTd">
                    <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion(item.id)}>
                        {item.id in this.state.childShowArr ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                    </td>
                    <td className="sticky-col first-col clone hoverTd" align="left">
                        {item.countryName}  
                    </td>
                    <td>{item.totalConsumption}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  {this.state.costOfProgram.filter(e => e.id == item.id).map(r => {

                    return (<>
                    <tr className="hoverTd" style={{ display: r.id in this.state.childShowArr ? "" : "none" }}>
                      <td className="BorderNoneSupplyPlan sticky-col first-col clone1" onClick={() => this.toggleAccordion1(r.programId, item.id)}>
                        {this.state.childShowArr[item.id] ? this.state.childShowArr[item.id].includes(r.programId) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i> : ""}
                      </td>
                      <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{r.programName}</td>  
                      <td>{r.totalConsumption}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    {this.state.CostOfInventoryInput.displayId==1 && this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId ).map(arr1 => {

                        return (<tr style={{ display: this.state.childShowArr[item.id] ? this.state.childShowArr[item.id].includes(arr1.program.id) ? "" : "none" : "none" }}>
                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                        <td className="sticky-col first-col clone text-left" style={{ textIndent: '60px' }}>{arr1.planningUnit.label.label_en}</td>  
                        <td>{arr1.totalConsumption}</td>
                        <td>{arr1.avergeStock}</td>
                        <td>{arr1.noOfMonths}</td>
                        <td>{arr1.inventoryTurns}</td>
                        </tr>)
                    })}
                    {this.state.CostOfInventoryInput.displayId==2 && this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id && arr.program.id == r.programId ).map(arr1 => {

                        return (<tr style={{ display: this.state.childShowArr[item.id] ? this.state.childShowArr[item.id].includes(arr1.program.id) ? "" : "none" : "none" }}>
                        <td className="BorderNoneSupplyPlan sticky-col first-col clone1"></td>
                        <td className="sticky-col first-col clone text-left" style={{ textIndent: '60px' }}>{arr1.planningUnit.label.label_en}</td>  
                        <td>{arr1.totalConsumption}</td>
                        <td>{arr1.avergeStock}</td>
                        <td>{arr1.noOfMonths}</td>
                        <td>{arr1.inventoryTurns}</td>
                        </tr>)
                    })}
                    </>)

                  })}

                </>)
              }
              )}
    
            </tbody>
          </Table>
        )
      }


    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        const { singleValue2 } = this.state

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [
            {
                dataField: 'planningUnit.id',
                text: i18n.t('static.report.qatPID'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center' }
            },
            {
                dataField: 'planningUnit.label',
                text: i18n.t('static.planningunit.planningunit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '480px' },
                formatter: this.formatLabel
            },
            {
                dataField: 'totalConsumption',
                text: i18n.t('static.report.totconsumption'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatter

            },
            {
                dataField: 'avergeStock',
                text: i18n.t('static.report.avergeStock'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatter
            },
            {
                dataField: 'noOfMonths',
                text: i18n.t('static.report.noofmonth'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatter
            },
            {
                dataField: 'inventoryTurns',
                text: i18n.t('static.dashboard.inventoryTurns'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '200px' },
                formatter: this.formatterDouble
            }
        ];
        const options = {
            hidePageListOnlyOnePage: true,
            firstPageText: i18n.t('static.common.first'),
            prePageText: i18n.t('static.common.back'),
            nextPageText: i18n.t('static.common.next'),
            lastPageText: i18n.t('static.common.last'),
            nextPageTitle: i18n.t('static.common.firstPage'),
            prePageTitle: i18n.t('static.common.prevPage'),
            firstPageTitle: i18n.t('static.common.nextPage'),
            lastPageTitle: i18n.t('static.common.lastPage'),
            showTotal: true,
            paginationTotalRenderer: customTotal,
            disablePageTitle: true,
            sizePerPageList: [{
                text: '10', value: 10
            }, {
                text: '30', value: 30
            }
                ,
            {
                text: '50', value: 50
            },
            {
                text: 'All', value: this.state.costOfInventory.length
            }]
        }
        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.inventoryTurns')}</strong> */}

                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <span style={{ cursor: 'pointer' }} onClick={() => { this.refs.formulaeChild.toggleInventoryTurns() }}><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></span>
                            </a>
                            <a className="card-header-action">
                                {this.state.costOfInventory.length > 0 && <div className="card-header-actions">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                </div>}
                            </a>
                        </div>
                    </div>
                    <CardBody className="pt-lg-0 pb-lg-2">
                        <div>
                            <div ref={ref}>

                                <Form >
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3 pl-0">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">
                                                    <Picker
                                                        ref="pickAMonth2"
                                                        years={{ min: this.state.minDate, max: this.state.maxDate }}
                                                        value={singleValue2}
                                                        lang={pickerLang.months}
                                                        theme="dark"
                                                        onChange={this.handleAMonthChange2}
                                                        onDismiss={this.handleAMonthDissmis2}
                                                    >
                                                        <MonthBox value={this.makeText(singleValue2)} onClick={this.handleClickMonthBox2} />
                                                    </Picker>
                                                </div>

                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.isincludeplannedshipment')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="includePlanningShipments"
                                                            id="includePlanningShipments"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e); }}
                                                        >
                                                            <option value="true">{i18n.t('static.program.yes')}</option>
                                                            <option value="false">{i18n.t('static.program.no')}</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.forecastReport.display')}</Label>
                                                <div className="controls " style={{ marginLeft: '-51px' }}>

                                                    <FormGroup check inline style={{ marginRight: '-36px' }}>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="displayId1"
                                                            name="displayId"
                                                            value={1}
                                                            checked={this.state.CostOfInventoryInput.displayId == 1}
                                                            onChange={(e) => { this.radioChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio1">
                                                            {i18n.t('static.country.countryMaster')}
                                                        </Label>
                                                    </FormGroup>
                                                    <FormGroup check inline>
                                                        <Input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="displayId2"
                                                            name="displayId"
                                                            value={2}
                                                            checked={this.state.CostOfInventoryInput.displayId == 2}
                                                            onChange={(e) => { this.radioChange(e) }}
                                                        />
                                                        <Label
                                                            className="form-check-label"
                                                            check htmlFor="inline-radio2">
                                                            {i18n.t('static.productCategory.productCategory')}
                                                        </Label>
                                                    </FormGroup>
                                                </div>
                                            </FormGroup>

                                        </div>
                                        
                                        <div>
                                            <FormGroup className="col-md-12" id="hideProductDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.productCategory.productCategory')}</Label>
                                                <div className="controls ">
                                                    <Select
                                                        bsSize="sm"
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light')}
                                                        name="puId"
                                                        id="puId"
                                                        onChange={(e) => {
                                                            this.updatePUData(e);
                                                        }}
                                                        
                                                        multi
                                                        options={this.state.puList}
                                                        value={this.state.CostOfInventoryInput.pu}
                                                    />
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-12" id="hideCountryDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.country.countryMaster')}</Label>
                                                <div className="controls ">
                                                <Select
                                                        bsSize="sm"
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light')}
                                                        name="countryId"
                                                        id="countryId"
                                                        onChange={(e) => {
                                                            this.updateCountryData(e);
                                                        }}
                                                        
                                                        multi
                                                        options={this.state.countryList}
                                                        value={this.state.CostOfInventoryInput.country}
                                                    />
                                                </div>
                                            </FormGroup>

                                            <FormGroup className="col-md-12" id="programDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                                <div className="controls ">
                                                <Select
                                                        bsSize="sm"
                                                        className={classNames('form-control', 'd-block', 'w-100', 'bg-light')}
                                                        name="programId"
                                                        id="programId"
                                                        onChange={(e) => {
                                                            this.updateProgramData(e);
                                                        }}
                                                        
                                                        multi
                                                        options={this.state.programList}
                                                        value={this.state.CostOfInventoryInput.programIds}
                                                    />
                                                </div>
                                            </FormGroup>



                                        </div>
                                    </div>
                                </Form>
                            </div>
                        </div>
                        <div className="table-scroll">
                            <div className="table-wrap DataEntryTable table-responsive fixTableHeadSupplyPlan">
                                {this.state.isTableLoaded}
                            </div>
                        </div>
                        <div id="tableDiv" className="jexcelremoveReadonlybackground consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
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

                    </CardBody>
                </Card>

            </div >

        );
    }

}