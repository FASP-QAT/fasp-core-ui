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
            countryArray: [],
            puList: [],
            puId: [],
            programList: [],
            programId: [],
            singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + 10, month: new Date().getMonth() + 1 },
            loading: true,
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

        if(value == null){
            return null;
        }
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

        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.forecastReport.display') + ' : ' + (this.state.CostOfInventoryInput.displayId == 1 ? i18n.t('static.country.countryMaster') : i18n.t('static.productCategory.productCategory'))).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (this.state.CostOfInventoryInput.displayId == 1 ? i18n.t('static.country.countryMaster') + ' : ' + this.state.countryId.map(e => {return e.label}) : i18n.t('static.productCategory.productCategory')  + ' : ' + this.state.puId.map(e => {return e.label})).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + this.state.programId.map(e => {return e.label})).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

        var A = [this.addDoubleQuoteToRowContent(headers)]
        // this.state.costOfInventory.map(ele => A.push(this.addDoubleQuoteToRowContent([ele.planningUnit.id, (getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.totalConsumption, this.round(ele.avergeStock), ele.noOfMonths, this.roundN(ele.inventoryTurns)])));

        {this.state.costOfCountry.map(item => {

            A.push(this.addDoubleQuoteToRowContent([(item.countryName).replaceAll(',', ' '), this.state.CostOfInventoryInput.displayId==1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id).length : this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id).length, this.formatter(item.totalConsumption), this.round(item.avergeStock), "",  "", "", this.roundN(item.inventoryTurns), this.roundN(item.plannedInventoryTurns), this.roundN(item.mape), this.roundN(item.mse)])) 
                    
            {this.state.costOfProgram.filter(e => e.id == item.id).map(r => {
                
                A.push(this.addDoubleQuoteToRowContent([(r.programName).replaceAll(',', ' '), this.state.CostOfInventoryInput.displayId==1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId ).length : this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id && arr.program.id == r.programId ).length, this.formatter(r.totalConsumption), this.round(r.avergeStock), "", "", "", this.roundN(r.inventoryTurns), this.roundN(r.plannedInventoryTurns), this.roundN(r.mape), this.roundN(r.mse)]))
                        
                {this.state.CostOfInventoryInput.displayId==1 && this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId ).map(arr1 => {
                    A.push(this.addDoubleQuoteToRowContent([getLabelText(arr1.planningUnit.label).replaceAll(',', ' '), " ", this.formatter(arr1.totalConsumption), this.round(arr1.avergeStock), arr1.noOfMonths >= 6 ? arr1.noOfMonths : "", arr1.reorderFrequencyInMonths, arr1.minMonthsOfStock, this.roundN(arr1.inventoryTurns), this.roundN(arr1.plannedInventoryTurns), this.roundN(arr1.mape), this.roundN(arr1.mse)]))          
                })}

                {this.state.CostOfInventoryInput.displayId==2 && this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id && arr.program.id == r.programId ).map(arr1 => {
                    A.push(this.addDoubleQuoteToRowContent([getLabelText(arr1.planningUnit.label).replaceAll(',', ' '), " ", this.formatter(arr1.totalConsumption), this.round(arr1.avergeStock), arr1.noOfMonths >= 6 ? arr1.noOfMonths : "", arr1.reorderFrequencyInMonths, arr1.minMonthsOfStock, this.roundN(arr1.inventoryTurns), this.roundN(arr1.plannedInventoryTurns), this.roundN(arr1.mape), this.roundN(arr1.mse)]))  
                })}
                
            })}
        
        })}

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.inventoryTurns') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    exportPDF = (columns) => {
        const addFooters = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(6)
            for (var i = 1; i <= pageCount; i++) {
                doc.setPage(i)

                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
                doc.text('Copyright © 2020 ' + i18n.t('static.footer'), doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')

                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.dashboard.inventoryTurns'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.forecastReport.display') + ' : ' + (this.state.CostOfInventoryInput.displayId == 1 ? i18n.t('static.country.countryMaster') : i18n.t('static.productCategory.productCategory')) , doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })

                    var level1Text = doc.splitTextToSize((this.state.CostOfInventoryInput.displayId == 1 ? i18n.t('static.country.countryMaster') + ' : ' + this.state.countryId.map(e => {return e.label}) : i18n.t('static.productCategory.productCategory')  + ' : ' + this.state.puId.map(e => {return e.label})), doc.internal.pageSize.width * 3 / 4)
                    doc.text(doc.internal.pageSize.width / 8, 150, level1Text)
                    
                    var level2Text = doc.splitTextToSize((i18n.t('static.program.program') + ' : ' + this.state.programId.map(e => {return e.label})), doc.internal.pageSize.width * 3 / 4)
                    doc.text(doc.internal.pageSize.width / 8, this.state.CostOfInventoryInput.displayId == 1 ? 170 + this.state.countryId.length*1.5 : 170 + this.state.puId.length*2, level2Text)
                    
                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        // var canvas = document.getElementById("cool-canvas");
        //creates image

        // var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        // var aspectwidth1 = (width - h1);

        // doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');

        const headers = columns.map((item, idx) => (item.text));
        
        // const data = this.state.costOfInventory.map(ele => [ele.planningUnit.id, getLabelText(ele.planningUnit.label), this.formatter(ele.totalConsumption), this.formatter(ele.avergeStock), this.formatter(ele.noOfMonths), this.formatterDouble(ele.inventoryTurns)]);

        const data=[];
        {this.state.costOfCountry.map(item => {

            data.push([" "+item.countryName, this.state.CostOfInventoryInput.displayId==1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id).length : this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id).length, this.formatter(item.totalConsumption), this.formatter(item.avergeStock), "",  "", "", this.formatterDouble(item.inventoryTurns), this.formatterDouble(item.plannedInventoryTurns), this.formatterDouble(item.mape), this.formatterDouble(item.mse)])  
                    
            {this.state.costOfProgram.filter(e => e.id == item.id).map(r => {
                
                data.push(["      "+r.programName, this.state.CostOfInventoryInput.displayId==1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId ).length : this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id && arr.program.id == r.programId ).length, this.formatter(r.totalConsumption), this.formatter(r.avergeStock), "",  "", "", this.formatterDouble(r.inventoryTurns), this.formatterDouble(r.plannedInventoryTurns), this.formatterDouble(r.mape), this.formatterDouble(r.mse)])
                
                {this.state.CostOfInventoryInput.displayId==1 && this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId ).map(arr1 => {
                    data.push([getLabelText(arr1.planningUnit.label), "", this.formatter(arr1.totalConsumption), this.formatter(arr1.avergeStock), arr1.noOfMonths >= 6 ? this.formatter(arr1.noOfMonths) : "", this.formatter(arr1.reorderFrequencyInMonths), this.formatter(arr1.minMonthsOfStock), this.formatterDouble(arr1.inventoryTurns), this.formatterDouble(arr1.plannedInventoryTurns), this.formatterDouble(arr1.mape), this.formatterDouble(arr1.mse)])          
                })}

                {this.state.CostOfInventoryInput.displayId==2 && this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id && arr.program.id == r.programId ).map(arr1 => {
                    data.push([getLabelText(arr1.planningUnit.label), "", this.formatter(arr1.totalConsumption), this.formatter(arr1.avergeStock), arr1.noOfMonths >= 6 ? this.formatter(arr1.noOfMonths) : "", this.formatter(arr1.reorderFrequencyInMonths), this.formatter(arr1.minMonthsOfStock), this.formatterDouble(arr1.inventoryTurns), this.formatterDouble(arr1.plannedInventoryTurns), this.formatterDouble(arr1.mape), this.formatterDouble(arr1.mse)])  
                })}
                
            })}
        
        })}
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: this.state.CostOfInventoryInput.displayId == 1 ? 170 + this.state.countryId.length*1.5 + this.state.programId.length*2 : 170 + this.state.puId.length*2 + this.state.programId.length*2,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 60, textColor: [0,0,0] },
            columnStyles: {
                0: { cellWidth: 170, halign: 'left'},
            },
            didParseCell: function (data) {

                var row = data.row;
                var colCount = row.length;
                    console.log("Hello "+JSON.stringify(data))
                if (row.raw[0] === " " && row.raw[1] === " ") {
                    
                        row.styles.fillColor = [255, 0, 0];
                    
                }
                if(data.section=="body" && data.column.index == 0){
                    if(data.cell.raw[0]!=" "){
                        data.cell.styles.cellPadding = {left: 30,right: 5, top: 5, bottom: 5};
                    }
                }
            }
        };
        var maxSecondColumnWidth = 0;
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.inventoryTurns') + ".pdf")
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
                regList[i] = { value: json[i].id, label: json[i].code }
            }
            var listArray = regList;
            listArray.sort((a, b) => {
                var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            listArray.unshift({ value: "-1", label: i18n.t("static.common.all") });
                        
            console.log("getProgramListByRealmCountryIdList=====>", programIdArray);
            this.setState( prevState => ({ programList: listArray, programId: listArray.slice(1), CostOfInventoryInput : { ...prevState.CostOfInventoryInput, programIds: programIdArray} } ),
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

        if (selectedArray.includes(0)) {
            this.setState({ puId: [] });
            var list = this.state.puList.filter(c => c.value != 0)
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
                regList[i] = { value: json[i].id, label: json[i].code }
            }
            var listArray = regList;
            listArray.sort((a, b) => {
                var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
                var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            listArray.unshift({ value: "-1", label: i18n.t("static.common.all") });

            console.log("getProgramListByProductCategoryIdList=====>", programIdArray);
            this.setState( prevState => ({ programList:listArray, programId: listArray.slice(1), CostOfInventoryInput : { ...prevState.CostOfInventoryInput, programIds: programIdArray} } ),
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
                this.formSubmit();
            })    
        }else{
            this.setState( prevState => ({ programList:[], programId:[], costOfInventory: [], costOfCountry:[], costOfProgram:[], CostOfInventoryInput : { ...prevState.CostOfInventoryInput, displayId: parseInt(2), pu: [], country: [], programIds:[] }}
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
                        
                        var countryArray = [];
                        for (var i = 0; i < response.data.length; i++) {
                            countryArray[i] = response.data[i].realmCountryId;
                        }
                        this.setState({
                            countryList: listArray,
                            countryArray: countryArray, 
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
                            regList[i] = { value: json[i].payload.productCategoryId, label: json[i].payload.label.label_en }
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
        this.setState({loading: true})
        var inputJson = {
            "country": this.state.CostOfInventoryInput.country,
            "programIds": this.state.CostOfInventoryInput.programIds,
            "productCategoryIds": this.state.CostOfInventoryInput.pu,
            "viewBy": this.state.CostOfInventoryInput.displayId,
            "dt": moment(this.state.CostOfInventoryInput.dt).startOf('month').format('YYYY-MM-DD'),
            "includePlannedShipments": this.state.CostOfInventoryInput.includePlanningShipments.toString() == "true" ? 1 : 0
        }
        // AuthenticationService.setupAxiosInterceptors();

        if(inputJson.programIds.length > 0){
            ReportService.inventoryTurns(inputJson).then(response => {
                console.log("costOfInentory=====>", (response.data));
                console.log("Hello "+JSON.stringify(inputJson))
                if(response.data.length > 0){
                    const level1Data = [];
                    const level2Data = [];
                    
                    if(this.state.CostOfInventoryInput.displayId == 1){
                        for(let i=0; i < this.state.CostOfInventoryInput.country.length; i++){
                            let tempData = response.data.filter(e => e.realmCountry.id == this.state.CostOfInventoryInput.country[i]);
                            if(tempData.length > 0){
                                let level1Consumption = tempData.reduce((prev,curr,index) => prev + curr.totalConsumption, 0);
                                let unique = [...new Set(tempData.map((item) => item.program.id))];
                                let level1NoOfMonths = tempData.reduce((prev,curr,index) => prev + curr.noOfMonths, 0);
                                let level1AverageStock = tempData.reduce((prev,curr,index) => prev + curr.avergeStock * curr.noOfMonths, 0);
                                level1AverageStock = level1AverageStock / level1NoOfMonths;
                                let level1InventoryTurns = tempData.reduce((prev,curr,index) => prev + curr.inventoryTurns, 0) / tempData.length;
                                let level1PlannedInventoryTurns = this.mode(tempData.map(arr => arr.plannedInventoryTurns));
                                let level1Mape = tempData.reduce((prev,curr,index) => prev + curr.mape, 0) / (tempData.filter(arr => arr.mape != null).length);
                                let level1Mse = tempData.reduce((prev,curr,index) => prev + curr.mse, 0) / (tempData.filter(arr => arr.mse != null).length);
                                level1Data.push({
                                    id: this.state.CostOfInventoryInput.country[i],
                                    countryName: tempData[0].realmCountry.label.label_en,
                                    totalConsumption: level1Consumption,
                                    programIds: unique,
                                    avergeStock: level1AverageStock,
                                    inventoryTurns: level1InventoryTurns,
                                    plannedInventoryTurns: level1PlannedInventoryTurns,
                                    mape: level1Mape,
                                    mse: level1Mse
                                })
                            
                                for(let j=0; j<unique.length; j++){
                                    let temp = response.data.filter(e =>  e.realmCountry.id == this.state.CostOfInventoryInput.country[i] && e.program.id == unique[j])
                                    let level2Consumption = temp.reduce((prev,curr,index) => prev + curr.totalConsumption, 0);
                                    let level2NoOfMonths = temp.reduce((prev,curr,index) => prev + curr.noOfMonths, 0);
                                    let level2AverageStock = temp.reduce((prev,curr,index) => prev + curr.avergeStock * curr.noOfMonths, 0);
                                    level2AverageStock = level2AverageStock / level2NoOfMonths;
                                    let level2InventoryTurns = temp.reduce((prev,curr,index) => prev + curr.inventoryTurns, 0) / temp.length;
                                    let level2PlannedInventoryTurns = this.mode(temp.map(arr => arr.plannedInventoryTurns));
                                    let level2Mape = temp.reduce((prev,curr,index) => prev + curr.mape, 0) / (temp.filter(arr => arr.mape != null).length);
                                    let level2Mse = temp.reduce((prev,curr,index) => prev + curr.mse, 0) / (temp.filter(arr => arr.mse != null).length);
                                    level2Data.push({
                                        id: this.state.CostOfInventoryInput.country[i],
                                        programId: unique[j],
                                        programName: temp[0].program.code,
                                        totalConsumption: level2Consumption,
                                        avergeStock: level2AverageStock,
                                        inventoryTurns: level2InventoryTurns,
                                        plannedInventoryTurns: level2PlannedInventoryTurns,
                                        mape: level2Mape,
                                        mse: level2Mse
                                    })
                                }
                            }
                        }
                    }else{
                        console.log("Try",this.state.CostOfInventoryInput)
                        for(let i=0; i < this.state.CostOfInventoryInput.pu.length; i++){
                            let tempData = response.data.filter(e => e.productCategory.id == this.state.CostOfInventoryInput.pu[i]);
                            if(tempData.length > 0){
                                let level1Consumption = tempData.reduce((prev,curr,index) => prev + curr.totalConsumption, 0);
                                let unique = [...new Set(tempData.map((item) => item.program.id))];
                                let level1NoOfMonths = tempData.reduce((prev,curr,index) => prev + curr.noOfMonths, 0);
                                let level1AverageStock = tempData.reduce((prev,curr,index) => prev + curr.avergeStock * curr.noOfMonths, 0);
                                level1AverageStock = level1AverageStock / level1NoOfMonths;
                                let level1InventoryTurns = tempData.reduce((prev,curr,index) => prev + curr.inventoryTurns, 0) / tempData.length;
                                let level1PlannedInventoryTurns = this.mode(tempData.map(arr => arr.plannedInventoryTurns));
                                let level1Mape = tempData.reduce((prev,curr,index) => prev + curr.mape, 0) / (tempData.filter(arr => arr.mape != null).length);
                                let level1Mse = tempData.reduce((prev,curr,index) => prev + curr.mse, 0) / tempData.filter(arr => arr.mse != null).length;
                                level1Data.push({
                                    id: this.state.CostOfInventoryInput.pu[i],
                                    countryName: tempData[0].productCategory.label.label_en,
                                    totalConsumption: level1Consumption,
                                    programIds: unique,
                                    avergeStock: level1AverageStock,
                                    inventoryTurns: level1InventoryTurns,
                                    plannedInventoryTurns: level1PlannedInventoryTurns,
                                    mape: level1Mape,
                                    mse: level1Mse
                                })
                            
                                for(let j=0; j<unique.length; j++){
                                    let temp = response.data.filter(e =>  e.productCategory.id == this.state.CostOfInventoryInput.pu[i] && e.program.id == unique[j])
                                    let level2Consumption = temp.reduce((prev,curr,index) => prev + curr.totalConsumption, 0);
                                    let level2NoOfMonths = temp.reduce((prev,curr,index) => prev + curr.noOfMonths, 0);
                                    let level2AverageStock = temp.reduce((prev,curr,index) => prev + curr.avergeStock * curr.noOfMonths, 0);
                                    level2AverageStock = level2AverageStock / level2NoOfMonths;
                                    let level2InventoryTurns = temp.reduce((prev,curr,index) => prev + curr.inventoryTurns, 0) / temp.length;
                                    let level2PlannedInventoryTurns = this.mode(temp.map(arr => arr.plannedInventoryTurns));
                                    let level2Mape = temp.reduce((prev,curr,index) => prev + curr.mape, 0) / (temp.filter(arr => arr.mape != null).length);
                                    let level2Mse = temp.reduce((prev,curr,index) => prev + curr.mse, 0) / (temp.filter(arr => arr.mse != null).length);
                                    level2Data.push({
                                        id: this.state.CostOfInventoryInput.pu[i],
                                        programId: unique[j],
                                        programName: temp[0].program.code,
                                        totalConsumption: level2Consumption,
                                        avergeStock: level2AverageStock,
                                        inventoryTurns: level2InventoryTurns,
                                        plannedInventoryTurns: level2PlannedInventoryTurns,
                                        mape: level2Mape,
                                        mse: level2Mse
                                    })
                                }
                            }
                        }
                    } 

                    this.setState({
                        costOfInventory: response.data, 
                        costOfCountry: level1Data,
                        costOfProgram: level2Data,
                        loading: false,
                        message: ''
                    }, () => {
                        this.setState({
                        isTableLoaded: this.getTableDiv()
                        })
                    });
                }
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
                loading: false
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
    
    mode(numbers) {
        // Create an object to store the count of each number
        var counts = {};
        var maxCount = 0;
        var mode;
      
        // Loop through the array of numbers
        for (var i = 0; i < numbers.length; i++) {
            var num = numbers[i];
        
            // If this is the first time we've seen this number, initialize its count to 1
            if (counts[num] === undefined) {
                counts[num] = 1;
            }
            // Otherwise, increment its count
            else {
                counts[num]++;
            }
      
            // Update the maximum count and mode if necessary
            if (counts[num] > maxCount) {
                maxCount = counts[num];
                mode = num;
            }
        }
        return mode;
    }      

    getTableDiv() {
        return (
          <Table className="table-bordered text-center overflowhide main-table inventoryTurnsTable inventoryTurnsTableZindex" bordered size="sm" options={this.options}>
            <thead>
              <tr>
                {/* <th className="BorderNoneSupplyPlan sticky-col first-col clone1"></th> */}
                <th className="sticky-col first-col clone1" style={{zIndex:'4'}} ></th>
                <th className="FixedWdthcolumn sticky-col first-col clone" align="left" style={{whiteSpace:'inherit', zIndex:'5'}} ></th>
                <th>{i18n.t('static.planningunit.planningunit')}</th>
                <th>{i18n.t('static.report.totconsumption')}</th>
                <th>{i18n.t('static.report.avergeStock')}</th>
                <th>{i18n.t('static.report.noofmonth')}</th>
                <th>{i18n.t('static.supplyPlan.reorderInterval')}</th>
                <th>{i18n.t('static.product.minMonthOfStock')}</th>
                <th>{i18n.t('static.inventoryTurns.actual')}</th>
                <th>{i18n.t('static.inventoryTurns.planned')}</th>
                <th>{i18n.t('static.extrapolation.mape')}</th>
                <th>{i18n.t('static.extrapolation.mse')}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.costOfCountry.map(item => {

                return (<>
                  <tr>
                    <td className="sticky-col first-col clone1" onClick={() => this.toggleAccordion(item.id)}>
                        {item.id in this.state.childShowArr ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                    </td>
                    <td className="sticky-col first-col clone" align="left">
                        {item.countryName}  
                    </td>
                    <td>{this.state.CostOfInventoryInput.displayId==1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id).length : this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id).length }</td>
                    {/* <td>{this.formatter(item.totalConsumption)}</td> */}
                    {/* <td>{this.formatter(item.avergeStock)}</td> */}
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{this.formatterDouble(item.inventoryTurns)}</td>
                    {/* <td>{this.formatterDouble(this.mode(this.state.CostOfInventoryInput.displayId==1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id).map(arr => arr.plannedInventoryTurns) : this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id).map(arr => arr.plannedInventoryTurns)))}</td> */}
                    <td>{this.formatterDouble(item.plannedInventoryTurns)}</td>
                    <td>{this.formatterDouble(item.mape)}</td>
                    <td>{this.formatterDouble(item.mse)}</td>
                  </tr>
                  {this.state.costOfProgram.filter(e => e.id == item.id).map(r => {

                    return (<>
                    <tr style={{ display: r.id in this.state.childShowArr ? "" : "none" }}>
                      <td className="sticky-col first-col clone1" onClick={() => this.toggleAccordion1(r.programId, item.id)}>
                        {this.state.childShowArr[item.id] ? this.state.childShowArr[item.id].includes(r.programId) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i> : ""}
                      </td>
                      <td className="sticky-col first-col clone text-left" style={{ textIndent: '30px' }}>{r.programName}</td>  
                      <td>{this.state.CostOfInventoryInput.displayId==1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId ).length : this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id && arr.program.id == r.programId ).length }</td>
                      {/* <td>{this.formatter(r.totalConsumption)}</td> */}
                      {/* <td>{this.formatter(r.avergeStock)}</td> */}
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td>{this.formatterDouble(r.inventoryTurns)}</td>
                      {/* <td>{this.formatterDouble(this.mode(this.state.CostOfInventoryInput.displayId==1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId ).map( arr => arr.plannedInventoryTurns ) : this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id && arr.program.id == r.programId ).map( arr => arr.plannedInventoryTurns) ))}</td> */}
                      <td>{this.formatterDouble(r.plannedInventoryTurns)}</td>
                      <td>{this.formatterDouble(r.mape)}</td>
                      <td>{this.formatterDouble(r.mse)}</td>
                    </tr>

                    {this.state.CostOfInventoryInput.displayId==1 && this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId ).map(arr1 => {

                        return (<tr style={{ display: this.state.childShowArr[item.id] ? this.state.childShowArr[item.id].includes(arr1.program.id) ? "" : "none" : "none" }}>
                        <td className="sticky-col first-col clone1"></td>
                        <td className="sticky-col first-col clone text-left" style={{ textIndent: '60px' }}>{arr1.planningUnit.label.label_en}</td>  
                        <td></td>
                        <td>{this.formatter(arr1.totalConsumption)}</td>
                        <td>{this.formatter(arr1.avergeStock)}</td>
                        <td>{arr1.noOfMonths >= 6 ? arr1.noOfMonths : ""}</td>
                        <td>{arr1.reorderFrequencyInMonths}</td>
                        <td>{arr1.minMonthsOfStock}</td>
                        <td>{this.formatterDouble(arr1.inventoryTurns)}</td>
                        <td>{this.formatterDouble(arr1.plannedInventoryTurns)}</td>
                        <td>{this.formatterDouble(arr1.mape)}</td>
                        <td>{this.formatterDouble(arr1.mse)}</td>
                        </tr>)
                    })}
                    {this.state.CostOfInventoryInput.displayId==2 && this.state.costOfInventory.filter(arr => arr.productCategory.id == item.id && arr.program.id == r.programId ).map(arr1 => {

                        return (<tr style={{ display: this.state.childShowArr[item.id] ? this.state.childShowArr[item.id].includes(arr1.program.id) ? "" : "none" : "none" }}>
                        <td className="sticky-col first-col clone1"></td>
                        <td className="sticky-col first-col clone text-left" style={{ textIndent: '60px' }}>{arr1.planningUnit.label.label_en}</td>  
                        <td></td>
                        <td>{this.formatter(arr1.totalConsumption)}</td>
                        <td>{this.formatter(arr1.avergeStock)}</td>
                        <td>{arr1.noOfMonths}</td>
                        <td>{arr1.reorderFrequencyInMonths}</td>
                        <td>{arr1.minMonthsOfStock}</td>
                        <td>{this.formatterDouble(arr1.inventoryTurns)}</td>
                        <td>{this.formatterDouble(arr1.plannedInventoryTurns)}</td>
                        <td>{this.formatterDouble(arr1.mape)}</td>
                        <td>{this.formatterDouble(arr1.mse)}</td>
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
                dataField: 'planningUnit.label',
                text: "",
                sort: true,
                align: 'left',
                headerAlign: 'left',
                style: { align: 'left', width: '380px' },
                formatter: this.formatLabel
            },
            {
                dataField: 'noOfPlanningUnits',
                text: i18n.t('static.planningunit.planningunit'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '170px' },
                formatter: this.formatter

            },
            {
                dataField: 'totalConsumption',
                text: i18n.t('static.report.totconsumption'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '170px' },
                formatter: this.formatter

            },
            {
                dataField: 'avergeStock',
                text: i18n.t('static.report.avergeStock'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '170px' },
                formatter: this.formatter
            },
            {
                dataField: 'noOfMonths',
                text: i18n.t('static.report.noofmonth'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '170px' },
                formatter: this.formatter
            },
            {
                dataField: 'reorderInterval',
                text: i18n.t('static.supplyPlan.reorderInterval'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '170px' },
                formatter: this.formatter
            },
            {
                dataField: 'minMonthOfStock',
                text: i18n.t('static.product.minMonthOfStock'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '170px' },
                formatter: this.formatter
            },
            {
                dataField: 'inventoryTurns',
                text: i18n.t('static.inventoryTurns.actual'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '170px' },
                formatter: this.formatterDouble
            },
            {
                dataField: 'plannedInventoryTurns',
                text: i18n.t('static.inventoryTurns.planned'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '170px' },
                formatter: this.formatterDouble
            },
            {
                dataField: 'mape',
                text: i18n.t('static.extrapolation.mape'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '170px' },
                formatter: this.formatterDouble
            },
            {
                dataField: 'mse',
                text: i18n.t('static.extrapolation.mse'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center', width: '170px' },
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
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.ManageTree.Month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
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
                                        
                                        <div className="row">
                                            <FormGroup className="col-md-12" id="hideProductDiv">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.productCategory.productCategory')}</Label>
                                                <div className="controls zIndexField1">
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
                                                <div className="controls zIndexField2">
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
                                                <div className="controls zIndexField3">
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
                        <div className="TableWidthCoumnBorder table-scroll">
                            <div className="table-wrap TableWidthCoumn DataEntryTable ZindexInventory table-responsive fixTableHeadSupplyPlan">
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