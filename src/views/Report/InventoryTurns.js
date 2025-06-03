import classNames from 'classnames';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import { onOpenFilter } from "../../CommonComponent/JExcelCommonFunctions.js";
import moment from 'moment';
import React, { Component } from 'react';
import { CSVExport, Search } from 'react-bootstrap-table2-toolkit';
import Picker from 'react-month-picker';
import Select from 'react-select';
import { Card, CardBody, Form, FormGroup, Input, InputGroup, Label, Table } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ProductCategoryService from "../../api/PoroductCategoryService";
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import SupplyPlanFormulas from '../SupplyPlan/SupplyPlanFormulas';
export const PSM_PROCUREMENT_AGENT_ID = 1
export const CANCELLED_SHIPMENT_STATUS = 8
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
                displayId: '',
                useApprovedSupplyPlanOnly: true
            },
            costOfInventory: [],
            costOfCountry: [],
            costOfProgram: [],
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
            childShowArr1: [],
            minCountForMode: '',
            minPercForMode: ''
        }
        this.formSubmit = this.formSubmit.bind(this);
        this.dataChange = this.dataChange.bind(this);
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
    roundN1 = num => {
        return Number(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(1);
    }
    round = num => {
        return Number(Math.round(num * Math.pow(10, 0)) / Math.pow(10, 0));
    }
    formatterSingle = value => {
        if (value == null) {
            return null;
        }
        var cell1 = this.roundN1(value)
        cell1 += '';
        var x = cell1.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1][0] : '';
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
        csvRow.push('"' + (i18n.t('static.ManageTree.Month') + ' : ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.inventoryTurns.display') + ' : ' + (this.state.CostOfInventoryInput.displayId == 1 ? i18n.t('static.country.countryMaster') : i18n.t('static.productCategory.productCategory'))).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (this.state.CostOfInventoryInput.displayId == 1 ? i18n.t('static.country.countryMaster') + ' : ' + this.state.countryId.map(e => { return e.label }) : i18n.t('static.productCategory.productCategory') + ' : ' + this.state.puId.map(e => { return e.label })).replaceAll(' ', '%20') + '"')
        csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + this.state.programId.map(e => { return e.label })).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });
        var A = [this.addDoubleQuoteToRowContent(headers)]
        {
            this.state.costOfCountry.map(item => {
                let sortOrderList = [];
                let sortOrder = this.state.puList.filter(e => e.value == item.id).length > 0 ? this.state.puList.filter(e => e.value == item.id)[0].sortOrder : "";
                this.state.puList.map(item1 => {
                    if (item1.sortOrder.toString().startsWith(sortOrder.toString())) {
                        sortOrderList.push(item1.value);
                    }
                });
                A.push(this.addDoubleQuoteToRowContent([(item.countryName).replaceAll(',', ' '), this.state.CostOfInventoryInput.displayId == 1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id).length : this.state.costOfInventory.filter(arr => sortOrderList.includes(arr.productCategory.id)).length, "", "", "", "", "", this.roundN1(item.inventoryTurns), this.roundN1(item.plannedInventoryTurns), this.roundN1(item.mape), this.roundN1(item.mse)]))
                {
                    this.state.costOfProgram.filter(e => e.id == item.id).map(r => {
                        A.push(this.addDoubleQuoteToRowContent([(r.programName).replaceAll(',', ' '), this.state.CostOfInventoryInput.displayId == 1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId).length : this.state.costOfInventory.filter(arr => sortOrderList.includes(arr.productCategory.id) && arr.program.id == r.programId).length, "", "", "", "", "", this.roundN1(r.inventoryTurns), this.roundN1(r.plannedInventoryTurns), this.roundN1(r.mape), this.roundN1(r.mse)]))
                        {
                            this.state.CostOfInventoryInput.displayId == 1 && this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId).map(arr1 => {
                                A.push(this.addDoubleQuoteToRowContent([getLabelText(arr1.planningUnit.label).replaceAll(',', ' '), " ", arr1.totalConsumption == 0 ? "" : this.formatter(arr1.totalConsumption), arr1.avergeStock == 0 ? "" : this.round(arr1.avergeStock), arr1.noOfMonths >= 12 ? arr1.noOfMonths : arr1.noOfMonths >= 6 ? arr1.noOfMonths : "", arr1.reorderFrequencyInMonths, arr1.minMonthsOfStock, arr1.reorderFrequencyInMonths <= 12 ? arr1.noOfMonths >= 6 ? this.roundN1(arr1.inventoryTurns) : "" : "", arr1.reorderFrequencyInMonths <= 12 ? this.roundN1(arr1.plannedInventoryTurns) : "", this.roundN1(arr1.mape), this.roundN1(arr1.mse)]))
                            })
                        }
                        {
                            this.state.CostOfInventoryInput.displayId == 2 && this.state.costOfInventory.filter(arr => sortOrderList.includes(item.id) && arr.program.id == r.programId).map(arr1 => {
                                A.push(this.addDoubleQuoteToRowContent([getLabelText(arr1.planningUnit.label).replaceAll(',', ' '), " ", arr1.totalConsumption == 0 ? "" : this.formatter(arr1.totalConsumption), arr1.avergeStock == 0 ? "" : this.round(arr1.avergeStock), arr1.noOfMonths >= 12 ? arr1.noOfMonths : arr1.noOfMonths >= 6 ? arr1.noOfMonths : "", arr1.reorderFrequencyInMonths, arr1.minMonthsOfStock, arr1.reorderFrequencyInMonths <= 12 ? arr1.noOfMonths >= 6 ? this.roundN1(arr1.inventoryTurns) : "" : "", arr1.reorderFrequencyInMonths <= 12 ? this.roundN1(arr1.plannedInventoryTurns) : "", this.roundN1(arr1.mape), this.roundN1(arr1.mse)]))
                            })
                        }
                    })
                }
            })
        }
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
                    doc.text(i18n.t('static.ManageTree.Month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.inventoryTurns.display') + ' : ' + (this.state.CostOfInventoryInput.displayId == 1 ? i18n.t('static.country.countryMaster') : i18n.t('static.productCategory.productCategory')), doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    var level1Text = doc.splitTextToSize((this.state.CostOfInventoryInput.displayId == 1 ? i18n.t('static.country.countryMaster') + ' : ' + this.state.countryId.map(e => { return e.label }) : i18n.t('static.productCategory.productCategory') + ' : ' + this.state.puId.map(e => { return e.label })), doc.internal.pageSize.width * 3 / 4)
                    doc.text(doc.internal.pageSize.width / 8, 170, level1Text)
                    var level2Text = doc.splitTextToSize((i18n.t('static.program.program') + ' : ' + this.state.programId.map(e => { return e.label })), doc.internal.pageSize.width * 3 / 4)
                    doc.text(doc.internal.pageSize.width / 8, this.state.CostOfInventoryInput.displayId == 1 ? 190 + this.state.countryId.length * 1.5 : 190 + this.state.puId.length * 2, level2Text)
                    doc.setDrawColor(0);
                    doc.setFillColor(186, 12, 47);
                    doc.rect(doc.internal.pageSize.width / 8 + 420, this.state.CostOfInventoryInput.displayId == 1 ? 200 + this.state.countryId.length * 1.5 + this.state.programId.length * 2 : 200 + this.state.puId.length * 2 + this.state.programId.length * 2, 15, 12, 'F');
                    doc.text(i18n.t('static.inventoryTurns.months12'), doc.internal.pageSize.width / 8 + 440, this.state.CostOfInventoryInput.displayId == 1 ? 210 + this.state.countryId.length * 1.5 + this.state.programId.length * 2 : 210 + this.state.puId.length * 2 + this.state.programId.length * 2, {
                        align: 'left'
                    })
                    doc.setDrawColor(0);
                    doc.setFillColor(0, 0, 0);
                    doc.rect(doc.internal.pageSize.width / 8 + 570, this.state.CostOfInventoryInput.displayId == 1 ? 200 + this.state.countryId.length * 1.5 + this.state.programId.length * 2 : 200 + this.state.puId.length * 2 + this.state.programId.length * 2, 15, 12, 'F');
                    doc.text(i18n.t('static.inventoryTurns.months13'), doc.internal.pageSize.width / 8 + 590, this.state.CostOfInventoryInput.displayId == 1 ? 210 + this.state.countryId.length * 1.5 + this.state.programId.length * 2 : 210 + this.state.puId.length * 2 + this.state.programId.length * 2, {
                        align: 'left'
                    })
                    doc.setDrawColor(0);
                    doc.setFillColor(0, 0, 0);
                    doc.setTextColor("#BA0C2F");
                    doc.text("!", doc.internal.pageSize.width / 8, this.state.CostOfInventoryInput.displayId == 1 ? 210 + this.state.countryId.length * 1.5 + this.state.programId.length * 2 : 210 + this.state.puId.length * 2 + this.state.programId.length * 2, {
                        align: 'left',
                    });
                    doc.setTextColor("#002f6c");
                    doc.text(i18n.t('static.inventoryTurns.months6'), doc.internal.pageSize.width / 8 + 10, this.state.CostOfInventoryInput.displayId == 1 ? 210 + this.state.countryId.length * 1.5 + this.state.programId.length * 2 : 210 + this.state.puId.length * 2 + this.state.programId.length * 2, {
                        align: 'left',
                    })
                    doc.setDrawColor(0);
                    doc.setFillColor(0, 0, 0);
                    doc.setTextColor("#000000");
                    doc.text("!", doc.internal.pageSize.width / 8 + 250, this.state.CostOfInventoryInput.displayId == 1 ? 210 + this.state.countryId.length * 1.5 + this.state.programId.length * 2 : 210 + this.state.puId.length * 2 + this.state.programId.length * 2, {
                        align: 'left',
                    });
                    doc.setTextColor("#002f6c");
                    doc.text(i18n.t('static.inventoryTurns.reorderError'), doc.internal.pageSize.width / 8 + 260, this.state.CostOfInventoryInput.displayId == 1 ? 210 + this.state.countryId.length * 1.5 + this.state.programId.length * 2 : 210 + this.state.puId.length * 2 + this.state.programId.length * 2, {
                        align: 'left',
                    })
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        const headers = columns.map((item, idx) => (item.text));
        const data = [];
        {
            this.state.costOfCountry.map(item => {
                let sortOrderList = [];
                let sortOrder = this.state.puList.filter(e => e.value == item.id).length > 0 ? this.state.puList.filter(e => e.value == item.id)[0].sortOrder : "";
                this.state.puList.map(item1 => {
                    if (item1.sortOrder.toString().startsWith(sortOrder.toString())) {
                        sortOrderList.push(item1.value);
                    }
                });
                data.push([" " + item.countryName, this.state.CostOfInventoryInput.displayId == 1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id).length : this.state.costOfInventory.filter(arr => sortOrderList.includes(arr.productCategory.id)).length, "", "", "", "", "", this.formatterSingle(item.inventoryTurns), this.formatterSingle(item.plannedInventoryTurns), this.formatterSingle(item.mape), this.formatterSingle(item.mse)])
                {
                    this.state.costOfProgram.filter(e => e.id == item.id).map(r => {
                        data.push(["      " + r.programName, this.state.CostOfInventoryInput.displayId == 1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId).length : this.state.costOfInventory.filter(arr => sortOrderList.includes(arr.productCategory.id) && arr.program.id == r.programId).length, "", "", "", "", "", this.formatterSingle(r.inventoryTurns), this.formatterSingle(r.plannedInventoryTurns), this.formatterSingle(r.mape), this.formatterSingle(r.mse)])
                        {
                            this.state.CostOfInventoryInput.displayId == 1 && this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId).map(arr1 => {
                                data.push([getLabelText(arr1.planningUnit.label), "", arr1.totalConsumption == 0 ? "" : this.formatter(arr1.totalConsumption), arr1.avergeStock == 0 ? "" : this.formatter(arr1.avergeStock), arr1.noOfMonths >= 12 ? this.formatter(arr1.noOfMonths) : arr1.noOfMonths >= 6 ? " " + arr1.noOfMonths : " ", this.formatter(arr1.reorderFrequencyInMonths), this.formatter(arr1.minMonthsOfStock), arr1.reorderFrequencyInMonths <= 12 ? arr1.noOfMonths >= 6 ? this.formatterSingle(arr1.inventoryTurns) : "" : " ", arr1.reorderFrequencyInMonths <= 12 ? this.formatterSingle(arr1.plannedInventoryTurns) : " ", this.formatterSingle(arr1.mape), this.formatterSingle(arr1.mse)])
                            })
                        }
                        {
                            this.state.CostOfInventoryInput.displayId == 2 && this.state.costOfInventory.filter(arr => sortOrderList.includes(item.id) && arr.program.id == r.programId).map(arr1 => {
                                data.push([getLabelText(arr1.planningUnit.label), "", arr1.totalConsumption == 0 ? "" : this.formatter(arr1.totalConsumption), arr1.avergeStock == 0 ? "" : this.formatter(arr1.avergeStock), arr1.noOfMonths >= 12 ? this.formatter(arr1.noOfMonths) : arr1.noOfMonths >= 6 ? " " + arr1.noOfMonths : " ", this.formatter(arr1.reorderFrequencyInMonths), this.formatter(arr1.minMonthsOfStock), arr1.reorderFrequencyInMonths <= 12 ? arr1.noOfMonths >= 6 ? this.formatterSingle(arr1.inventoryTurns) : "" : " ", arr1.reorderFrequencyInMonths <= 12 ? this.formatterSingle(arr1.plannedInventoryTurns) : " ", this.formatterSingle(arr1.mape), this.formatterSingle(arr1.mse)])
                            })
                        }
                    })
                }
            })
        }
        let flag = false;
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: this.state.CostOfInventoryInput.displayId == 1 ? 230 + this.state.countryId.length * 1.5 + this.state.programId.length * 2 : 230 + this.state.puId.length * 2 + this.state.programId.length * 2,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 60, textColor: [0, 0, 0] },
            columnStyles: {
                0: { cellWidth: 170, halign: 'left' },
            },
            didParseCell: function (data) {
                if (data.section == "body" && data.column.index == 0) {
                    if (data.cell.raw[0] != " ") {
                        data.cell.styles.cellPadding = { left: 30, right: 5, top: 5, bottom: 5 };
                        data.cell.styles.fillColor = "#fff";
                    } else {
                        flag = true;
                        data.cell.styles.fillColor = "#e4e5e6";
                    }
                } else {
                    if (flag == true) {
                        data.cell.styles.fillColor = "#e4e5e6";
                    } else {
                        data.cell.styles.fillColor = "#fff";
                    }
                }
                if (data.section == "body" && data.column.index == 4) {
                    if (data.cell.raw[0] == " ") {
                        data.cell.styles.textColor = [186, 12, 47];
                        if (data.cell.raw[1] == undefined) {
                            data.cell.text = "!";
                        }
                    }
                }
                if (data.section == "body" && (data.column.index == 7 || data.column.index == 8)) {
                    if (data.cell.raw) {
                        if (data.cell.raw[0] == " " || data.cell.raw[0] == undefined) {
                            data.cell.styles.textColor = [0, 0, 0];
                            if (data.cell.raw[1] == undefined) {
                                data.cell.text = "!";
                            }
                        }
                    }
                }
                if (data.column.index == 10) {
                    flag = false;
                }
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.inventoryTurns') + ".pdf")
    }
    handleClickMonthBox2 = (e) => {
        this.refs.pickAMonth2.show()
    }
    handleAMonthChange2 = (value, text) => {
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
        if (event.target.name == "includeApprovedVersions") {
            costOfInventoryInput.useApprovedSupplyPlanOnly = event.target.value;
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
        this.setState(prevState => ({ CostOfInventoryInput: { ...prevState.CostOfInventoryInput, country: countryArray } }));
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
                var itemLabelA = a.label.toUpperCase();
                var itemLabelB = b.label.toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            listArray.unshift({ value: "-1", label: i18n.t("static.common.all") });
            this.setState(prevState => ({ programList: listArray, programId: listArray.slice(1), CostOfInventoryInput: { ...prevState.CostOfInventoryInput, programIds: programIdArray } }),
                () => this.formSubmit());
        }).catch(
            error => {
                this.setState({
                    costOfInventory: [],
                    loading: false
                }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                });
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
        this.setState(prevState => ({ CostOfInventoryInput: { ...prevState.CostOfInventoryInput, pu: puArray } }));
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
                var itemLabelA = a.label.toUpperCase();
                var itemLabelB = b.label.toUpperCase();
                return itemLabelA > itemLabelB ? 1 : -1;
            });
            listArray.unshift({ value: "-1", label: i18n.t("static.common.all") });
            this.setState(prevState => ({ programList: listArray, programId: listArray.slice(1), CostOfInventoryInput: { ...prevState.CostOfInventoryInput, programIds: programIdArray } }),
                () => this.formSubmit());
        }).catch(
            error => {
                this.setState({
                    costOfInventory: [],
                    loading: false
                }, () => {
                    this.el = jexcel(document.getElementById("tableDiv"), '');
                    jexcel.destroy(document.getElementById("tableDiv"), true);
                });
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
    updateProgramData(value) {
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
        this.setState(prevState => ({ CostOfInventoryInput: { ...prevState.CostOfInventoryInput, programIds: programArray } }),
            () => this.formSubmit());
    }
    filterData() {
        let displayId = this.state.CostOfInventoryInput.displayId;
        (displayId == 1 ? document.getElementById("hideCountryDiv").style.display = "block" : document.getElementById("hideCountryDiv").style.display = "none");
        (displayId == 2 ? document.getElementById("hideProductDiv").style.display = "block" : document.getElementById("hideProductDiv").style.display = "none");
    }
    radioChange(event) {
        let tempId = event.target.id;
        if (tempId === "displayId1") {
            this.setState(prevState => ({ programList: [], programId: [], costOfInventory: [], costOfCountry: [], costOfProgram: [], CostOfInventoryInput: { ...prevState.CostOfInventoryInput, displayId: parseInt(1), pu: [0], programIds: [] } }
            ),
                () => {
                    this.filterData();
                    this.formSubmit();
                })
        } else {
            this.setState(prevState => ({ programList: [], programId: [], costOfInventory: [], costOfCountry: [], costOfProgram: [], CostOfInventoryInput: { ...prevState.CostOfInventoryInput, displayId: parseInt(2), pu: [], country: [], programIds: [] } }
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
        this.setState(prevState => ({ programList: [], programId: [], costOfInventory: [], costOfCountry: [], costOfProgram: [], CostOfInventoryInput: { ...prevState.CostOfInventoryInput, displayId: parseInt(1), pu: [0], programIds: [] } }),
            () => {
                this.filterData();
                this.formSubmit();
            })
        let realmId = AuthenticationService.getRealmId();
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.setState({
                supplyPlanError: i18n.t('static.program.errortext'),
                loading: false,
                color: "#BA0C2F"
            }, () => {
                this.hideFirstComponent()
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['realm'], 'readwrite');
            var program = transaction.objectStore('realm');
            var getRequest = program.getAll();
            getRequest.onerror = function (event) {
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var minC;
                var minP;
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].realmId == realmId) {
                        minC = myResult[i].minCountForMode;
                        minP = myResult[i].minPercForMode;
                    }
                }
                this.setState({
                    minCountForMode: minC,
                    minPercForMode: minP
                })
            }.bind(this)
        }.bind(this)
        DropdownService.getRealmCountryDropdownList(realmId)
            .then(response => {
                if (response.status == 200) {
                    var json = (response.data);
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].id, label: json[i].label.label_en }
                    }
                    var listArray = regList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase();
                        var itemLabelB = b.label.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    listArray.unshift({ value: "-1", label: i18n.t("static.common.all") });
                    var countryArray = [];
                    for (var i = 0; i < response.data.length; i++) {
                        countryArray[i] = response.data[i].id;
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
        ProductCategoryService.getProductCategoryListByRealmId(AuthenticationService.getRealmId())
            .then(response => {
                if (response.status == 200) {
                    var json = (response.data).filter(c => c.payload.active == true);
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].payload.productCategoryId, label: json[i].payload.label.label_en, sortOrder: json[i].sortOrder }
                    }
                    var listArray = regList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase();
                        var itemLabelB = b.label.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
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
    formSubmit() {
        this.setState({ loading: true })
        var inputJson = {
            "country": this.state.CostOfInventoryInput.country,
            "programIds": this.state.CostOfInventoryInput.programIds,
            "productCategoryIds": this.state.CostOfInventoryInput.pu,
            "viewBy": this.state.CostOfInventoryInput.displayId,
            "dt": moment(this.state.CostOfInventoryInput.dt).startOf('month').format('YYYY-MM-DD'),
            "includePlannedShipments": this.state.CostOfInventoryInput.includePlanningShipments.toString() == "true" ? 1 : 0,
            "useApprovedSupplyPlanOnly": this.state.CostOfInventoryInput.useApprovedSupplyPlanOnly.toString() == "true" ? 1 : 0
        }
        if (inputJson.programIds.length > 0) {
            ReportService.inventoryTurns(inputJson).then(response => {
                if (response.data.length > 0) {
                    const level1Data = [];
                    const level2Data = [];
                    if (this.state.CostOfInventoryInput.displayId == 1) {
                        for (let i = 0; i < this.state.CostOfInventoryInput.country.length; i++) {
                            let tempData = response.data.filter(e => e.realmCountry.id == this.state.CostOfInventoryInput.country[i]);
                            if (tempData.length > 0) {
                                let level1Consumption = tempData.reduce((prev, curr, index) => prev + curr.totalConsumption, 0);
                                let unique = [...new Set(tempData.map((item) => item.program.id))];
                                let level1NoOfMonths = tempData.reduce((prev, curr, index) => prev + curr.noOfMonths, 0);
                                let level1AverageStock = tempData.reduce((prev, curr, index) => prev + curr.avergeStock * curr.noOfMonths, 0);
                                level1AverageStock = level1AverageStock / level1NoOfMonths;
                                let level1InventoryTurns = this.mode(tempData.filter(arr => arr.inventoryTurns != null && arr.reorderFrequencyInMonths <= 12).map(arr => parseFloat(this.formatterSingle(arr.inventoryTurns))));
                                let level1PlannedInventoryTurns = this.mode(tempData.filter(arr => arr.reorderFrequencyInMonths <= 12).map(arr => parseFloat(this.formatterSingle(arr.plannedInventoryTurns))));
                                let level1Mape = tempData.filter(arr => arr.mape != null).length > 0 ? tempData.reduce((prev, curr, index) => prev + curr.mape, 0) / (tempData.filter(arr => arr.mape != null).length) : 0;
                                let level1Mse = tempData.filter(arr => arr.mse != null).length > 0 ? tempData.reduce((prev, curr, index) => prev + curr.mse, 0) / (tempData.filter(arr => arr.mse != null).length) : 0;
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
                                for (let j = 0; j < unique.length; j++) {
                                    let temp = response.data.filter(e => e.realmCountry.id == this.state.CostOfInventoryInput.country[i] && e.program.id == unique[j])
                                    let level2Consumption = temp.reduce((prev, curr, index) => prev + curr.totalConsumption, 0);
                                    let level2NoOfMonths = temp.reduce((prev, curr, index) => prev + curr.noOfMonths, 0);
                                    let level2AverageStock = temp.reduce((prev, curr, index) => prev + curr.avergeStock * curr.noOfMonths, 0);
                                    level2AverageStock = level2AverageStock / level2NoOfMonths;
                                    let level2InventoryTurns = this.mode(temp.filter(arr => arr.inventoryTurns != null && arr.reorderFrequencyInMonths <= 12).map(arr => parseFloat(this.formatterSingle(arr.inventoryTurns))));
                                    let level2PlannedInventoryTurns = this.mode(temp.filter(arr => arr.reorderFrequencyInMonths <= 12).map(arr => parseFloat(this.formatterSingle(arr.plannedInventoryTurns))));
                                    let level2Mape = temp.filter(arr => arr.mape != null).length > 0 ? temp.reduce((prev, curr, index) => prev + curr.mape, 0) / (temp.filter(arr => arr.mape != null).length) : 0;
                                    let level2Mse = temp.filter(arr => arr.mse != null).length > 0 ? temp.reduce((prev, curr, index) => prev + curr.mse, 0) / (temp.filter(arr => arr.mse != null).length) : 0;
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
                    } else {
                        for (let i = 0; i < this.state.CostOfInventoryInput.pu.length; i++) {
                            let sortOrderList = [];
                            let sortOrder = this.state.puList.filter(e => e.value == this.state.CostOfInventoryInput.pu[i])[0].sortOrder;
                            this.state.puList.map(item => {
                                if (item.sortOrder.toString().startsWith(sortOrder.toString())) {
                                    sortOrderList.push(item.value);
                                }
                            });
                            let tempData = response.data.filter(e => sortOrderList.includes(e.productCategory.id));
                            let tempPU = this.state.puList.filter(e => e.value == this.state.CostOfInventoryInput.pu[i])[0].label;
                            if (tempData.length > 0) {
                                let level1Consumption = tempData.reduce((prev, curr, index) => prev + curr.totalConsumption, 0);
                                let unique = [...new Set(tempData.map((item) => item.program.id))];
                                let level1NoOfMonths = tempData.reduce((prev, curr, index) => prev + curr.noOfMonths, 0);
                                let level1AverageStock = tempData.reduce((prev, curr, index) => prev + curr.avergeStock * curr.noOfMonths, 0);
                                level1AverageStock = level1AverageStock / level1NoOfMonths;
                                let level1InventoryTurns = this.mode(tempData.filter(arr => arr.inventoryTurns != null && arr.reorderFrequencyInMonths <= 12).map(arr => parseFloat(this.formatterSingle(arr.inventoryTurns))));
                                let level1PlannedInventoryTurns = this.mode(tempData.filter(arr => arr.reorderFrequencyInMonths <= 12).map(arr => parseFloat(this.formatterSingle(arr.plannedInventoryTurns))));
                                let level1Mape = tempData.filter(arr => arr.mape != null).length > 0 ? tempData.reduce((prev, curr, index) => prev + curr.mape, 0) / (tempData.filter(arr => arr.mape != null).length) : 0;
                                let level1Mse = tempData.filter(arr => arr.mse != null).length > 0 ? tempData.reduce((prev, curr, index) => prev + curr.mse, 0) / tempData.filter(arr => arr.mse != null).length : 0;
                                level1Data.push({
                                    id: this.state.CostOfInventoryInput.pu[i],
                                    countryName: tempPU,
                                    totalConsumption: level1Consumption,
                                    programIds: unique,
                                    avergeStock: level1AverageStock,
                                    inventoryTurns: level1InventoryTurns,
                                    plannedInventoryTurns: level1PlannedInventoryTurns,
                                    mape: level1Mape,
                                    mse: level1Mse
                                })
                                for (let j = 0; j < unique.length; j++) {
                                    let temp = response.data.filter(e => sortOrderList.includes(e.productCategory.id) && e.program.id == unique[j])
                                    let level2Consumption = temp.reduce((prev, curr, index) => prev + curr.totalConsumption, 0);
                                    let level2NoOfMonths = temp.reduce((prev, curr, index) => prev + curr.noOfMonths, 0);
                                    let level2AverageStock = temp.reduce((prev, curr, index) => prev + curr.avergeStock * curr.noOfMonths, 0);
                                    level2AverageStock = level2AverageStock / level2NoOfMonths;
                                    let level2InventoryTurns = this.mode(temp.filter(arr => arr.inventoryTurns != null && arr.reorderFrequencyInMonths <= 12).map(arr => parseFloat(this.formatterSingle(arr.inventoryTurns))));
                                    let level2PlannedInventoryTurns = this.mode(temp.filter(arr => arr.reorderFrequencyInMonths <= 12).map(arr => parseFloat(this.formatterSingle(arr.plannedInventoryTurns))));
                                    let level2Mape = temp.filter(arr => arr.mape != null).length > 0 ? temp.reduce((prev, curr, index) => prev + curr.mape, 0) / (temp.filter(arr => arr.mape != null).length) : 0;
                                    let level2Mse = temp.filter(arr => arr.mse != null).length > 0 ? temp.reduce((prev, curr, index) => prev + curr.mse, 0) / (temp.filter(arr => arr.mse != null).length) : 0;
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
                } else {
                    this.setState({
                        costOfInventory: [],
                        costOfCountry: [],
                        costOfProgram: [],
                        loading: false
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
                        jexcel.destroy(document.getElementById("tableDiv"), true);
                    });
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
                costOfInventory: [],
                costOfCountry: [],
                costOfProgram: [],
                loading: false
            }, () => {
                this.setState({
                    isTableLoaded: this.getTableDiv()
                })
            });
        }
    }
    toggleAccordion(parentId) {
        var childShowArr = this.state.childShowArr;
        if (parentId in childShowArr) {
            delete childShowArr[parentId]
        } else {
            childShowArr[parentId] = []
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
        numbers = numbers.sort();
        var counts = {};
        var maxCount = 0;
        var mode;
        for (var i = 0; i < numbers.length; i++) {
            var num = numbers[i];
            if (counts[num] === undefined) {
                counts[num] = 1;
            }
            else {
                counts[num]++;
            }
            if (counts[num] > maxCount) {
                maxCount = counts[num];
                mode = num;
            }
        }
        var mode_per = (maxCount / numbers.length) * 100;
        if (mode_per < this.state.minPercForMode || maxCount < this.state.minCountForMode) {
            mode = numbers.filter(arr => arr != null).length > 0 ? numbers.reduce((prev, curr, index) => prev + curr, 0) / (numbers.filter(arr => arr != null).length) : 0;
        }
        return mode;
    }
    getTableDiv() {
        return (
            <Table className="table-bordered text-center overflowhide main-table inventoryTurnsTable inventoryTurnsTableZindex" bordered size="sm" options={this.options}>
                <thead>
                    <tr>
                        <>
                            <th className="FirstcolumInventry sticky-col first-col clone1" style={{ zIndex: '4' }} ></th>
                            <th className="supplyplanTdWidthInventry sticky-col first-col clone" align="left" style={{ whiteSpace: 'inherit', zIndex: '5' }} ></th>
                            <th>{i18n.t('static.inventoryTurns.noofplanningunits')}</th>
                            <th>{i18n.t('static.report.totconsumption')}</th>
                            <th>{i18n.t('static.report.avergeStock')}</th>
                            <th>{i18n.t('static.inventoryTurns.noofmonths')}</th>
                            <th>{i18n.t('static.supplyPlan.reorderInterval')}</th>
                            <th>{i18n.t('static.product.minMonthOfStock')}</th>
                            <th>{i18n.t('static.inventoryTurns.actual')}</th>
                            <th>{i18n.t('static.inventoryTurns.planned')}</th>
                            <th>{i18n.t('static.extrapolation.mape')}</th>
                            <th>{i18n.t('static.extrapolation.mse')}</th>
                        </>
                    </tr>
                </thead>
                <tbody>
                    {this.state.costOfCountry.map(item => {
                        let sortOrderList = [];
                        let sortOrder = this.state.puList.filter(e => e.value == item.id).length > 0 ? this.state.puList.filter(e => e.value == item.id)[0].sortOrder : "";
                        let updatedItems = this.state.puList.map(item1 => {
                            if (item1.sortOrder.toString().startsWith(sortOrder.toString())) {
                                sortOrderList.push(item1.value);
                            }
                        });
                        return (<>
                            <tr>
                                <td className="sticky-col first-col clone1" onClick={() => this.toggleAccordion(item.id)}>
                                    {item.id in this.state.childShowArr ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i>}
                                </td>
                                <td className="sticky-col first-col clone" align="left">
                                    {item.countryName}
                                </td>
                                <td className='borderNoneInventry1'>{this.state.CostOfInventoryInput.displayId == 1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id).length : this.state.costOfInventory.filter(arr => sortOrderList.includes(arr.productCategory.id)).length}</td>
                                <td></td>
                                <td></td>
                                <td className='borderNoneInventry'></td>
                                <td></td>
                                <td></td>
                                <td>{this.formatterSingle(item.inventoryTurns)}</td>
                                <td>{this.formatterSingle(item.plannedInventoryTurns)}</td>
                                <td>{this.formatterSingle(item.mape)}</td>
                                <td>{this.formatterSingle(item.mse)}</td>
                            </tr>
                            {this.state.costOfProgram.filter(e => e.id == item.id).map(r => {
                                return (<>
                                    <tr style={{ display: r.id in this.state.childShowArr ? "" : "none" }}>
                                        <td className="sticky-col first-col clone1 borderNoneInventry1" onClick={() => this.toggleAccordion1(r.programId, item.id)}>
                                            {this.state.childShowArr[item.id] ? this.state.childShowArr[item.id].includes(r.programId) ? <i className="fa fa-minus-square-o supplyPlanIcon" ></i> : <i className="fa fa-plus-square-o supplyPlanIcon" ></i> : ""}
                                        </td>
                                        <td className="sticky-col first-col clone text-left " style={{ textIndent: '30px' }}>{r.programName}</td>
                                        <td className='borderNoneInventry1'>{this.state.CostOfInventoryInput.displayId == 1 ? this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId).length : this.state.costOfInventory.filter(arr => sortOrderList.includes(arr.productCategory.id) && arr.program.id == r.programId).length}</td>
                                        <td></td>
                                        <td></td>
                                        <td className='borderNoneInventry'></td>
                                        <td></td>
                                        <td></td>
                                        <td>{this.formatterSingle(r.inventoryTurns)}</td>
                                        <td>{this.formatterSingle(r.plannedInventoryTurns)}</td>
                                        <td>{this.formatterSingle(r.mape)}</td>
                                        <td>{this.formatterSingle(r.mse)}</td>
                                    </tr>
                                    {this.state.CostOfInventoryInput.displayId == 1 && this.state.costOfInventory.filter(arr => arr.realmCountry.id == item.id && arr.program.id == r.programId).map(arr1 => {
                                        return (<tr style={{ display: this.state.childShowArr[item.id] ? this.state.childShowArr[item.id].includes(arr1.program.id) ? "" : "none" : "none" }}>
                                            <td className="sticky-col first-col clone1 borderNoneInventry"></td>
                                            <td className="sticky-col first-col clone text-left PaddingLeftIndent">{arr1.planningUnit.label.label_en}</td>
                                            <td className='borderNoneInventry'></td>
                                            <td>{arr1.totalConsumption == 0 ? "" : this.formatter(arr1.totalConsumption)}</td>
                                            <td>{arr1.avergeStock == 0 ? "" : this.formatter(arr1.avergeStock)}</td>
                                            <td title={arr1.noOfMonths >= 6 ? "" : i18n.t("static.inventoryTurns.months6")} style={{ color: arr1.noOfMonths >= 12 ? "" : "#BA0C2F" }} className='borderNoneInventry1'>{arr1.noOfMonths >= 6 ? arr1.noOfMonths : <i class='fa fa-exclamation-triangle'></i>}</td>
                                            <td>{arr1.reorderFrequencyInMonths}</td>
                                            <td>{arr1.minMonthsOfStock}</td>
                                            <td title={arr1.reorderFrequencyInMonths <= 12 ? "" : i18n.t("static.inventoryTurns.reorderError")} style={{ color: arr1.reorderFrequencyInMonths <= 12 ? "" : "#BA0C2F" }}>{arr1.reorderFrequencyInMonths <= 12 ? arr1.noOfMonths >= 6 ? this.formatterSingle(arr1.inventoryTurns) : "" : <i class='fa fa-exclamation-triangle'></i>}</td>
                                            <td title={arr1.reorderFrequencyInMonths <= 12 ? "" : i18n.t("static.inventoryTurns.reorderError")} style={{ color: arr1.reorderFrequencyInMonths <= 12 ? "" : "#BA0C2F" }}>{arr1.reorderFrequencyInMonths <= 12 ? this.formatterSingle(arr1.plannedInventoryTurns) : <i class='fa fa-exclamation-triangle'></i>}</td>
                                            <td>{this.formatterSingle(arr1.mape)}</td>
                                            <td>{this.formatterSingle(arr1.mse)}</td>
                                        </tr>)
                                    })}
                                    {this.state.CostOfInventoryInput.displayId == 2 && this.state.costOfInventory.filter(arr => sortOrderList.includes(item.id) && arr.program.id == r.programId).map(arr1 => {
                                        return (<tr style={{ display: this.state.childShowArr[item.id] ? this.state.childShowArr[item.id].includes(arr1.program.id) ? "" : "none" : "none" }}>
                                            <td className="sticky-col first-col clone1 "></td>
                                            <td className="sticky-col first-col clone text-left PaddingLeftIndent">{arr1.planningUnit.label.label_en}</td>
                                            <td className='borderNoneInventry'></td>
                                            <td>{arr1.totalConsumption == 0 ? "" : this.formatter(arr1.totalConsumption)}</td>
                                            <td>{arr1.avergeStock == 0 ? "" : this.formatter(arr1.avergeStock)}</td>
                                            <td title={arr1.noOfMonths >= 6 ? "" : i18n.t("static.inventoryTurns.months6")} style={{ color: arr1.noOfMonths >= 12 ? "" : "#BA0C2F" }} className='borderNoneInventry1'>{arr1.noOfMonths >= 6 ? arr1.noOfMonths : <i class='fa fa-exclamation-triangle'></i>}</td>
                                            <td>{arr1.reorderFrequencyInMonths}</td>
                                            <td>{arr1.minMonthsOfStock}</td>
                                            <td title={arr1.reorderFrequencyInMonths <= 12 ? "" : i18n.t("static.inventoryTurns.reorderError")} style={{ color: arr1.reorderFrequencyInMonths <= 12 ? "" : "#BA0C2F" }}>{arr1.reorderFrequencyInMonths <= 12 ? arr1.noOfMonths >= 6 ? this.formatterSingle(arr1.inventoryTurns) : "" : <i class='fa fa-exclamation-triangle'></i>}</td>
                                            <td title={arr1.reorderFrequencyInMonths <= 12 ? "" : i18n.t("static.inventoryTurns.reorderError")} style={{ color: arr1.reorderFrequencyInMonths <= 12 ? "" : "#BA0C2F" }}>{arr1.reorderFrequencyInMonths <= 12 ? this.formatterSingle(arr1.plannedInventoryTurns) : <i class='fa fa-exclamation-triangle'></i>}</td>
                                            <td>{this.formatterSingle(arr1.mape)}</td>
                                            <td>{this.formatterSingle(arr1.mse)}</td>
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
                text: "",
            },
            {
                text: i18n.t('static.inventoryTurns.noofplanningunits'),
            },
            {
                text: i18n.t('static.report.totconsumption'),
            },
            {
                text: i18n.t('static.report.avergeStock'),
            },
            {
                text: i18n.t('static.inventoryTurns.noofmonths'),
            },
            {
                text: i18n.t('static.supplyPlan.reorderInterval'),
            },
            {
                text: i18n.t('static.product.minMonthOfStock'),
            },
            {
                text: i18n.t('static.inventoryTurns.actual'),
            },
            {
                text: i18n.t('static.inventoryTurns.planned'),
            },
            {
                text: i18n.t('static.extrapolation.mape'),
            },
            {
                text: i18n.t('static.extrapolation.mse'),
            }
        ];
        
        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <SupplyPlanFormulas ref="formulaeChild" />
                <Card>
                    <div className="Card-header-reporticon">
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
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.inventoryTurns.display')}</Label>
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
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.includeapproved')}</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="includeApprovedVersions"
                                                            id="includeApprovedVersions"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e) }}
                                                        >
                                                            <option value="true">{i18n.t('static.program.yes')}</option>
                                                            <option value="false">{i18n.t('static.program.no')}</option>
                                                        </Input>
                                                    </InputGroup>
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
                                                        placeholder={i18n.t('static.common.select')}
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
                                                        placeholder={i18n.t('static.common.select')}
                                                    />
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-12 mt-2 " style={{ display: this.state.display }}>
                                                <ul className="legendcommitversion list-group">
                                                    <li><span className="legendcolor" style={{ backgroundColor: "#BA0C2F" }}></span> <span className="legendcommitversionText">{i18n.t('static.inventoryTurns.months12')}</span></li>
                                                    <li><span className="legendcolor text-blackDBg"></span> <span className="legendcommitversionText">{i18n.t('static.inventoryTurns.months13')}</span></li>
                                                </ul>
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