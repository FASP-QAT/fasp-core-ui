import React, { Component } from 'react';
import { Card, CardBody, Col, FormGroup, Label } from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from 'jspreadsheet';
import moment from 'moment';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { HorizontalBar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import { MultiSelect } from 'react-multi-select-component';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions';
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, DATE_FORMAT_CAP_FOUR_DIGITS, JEXCEL_DATE_FORMAT_SM, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, dateFormatterCSV, filterOptions, makeText } from '../../CommonComponent/JavascriptCommonFunctions';
import FundingSourceService from '../../api/FundingSourceService.js';
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

/**
 * Component for Expired Inventory Report.
 */
class Budgets extends Component {  
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            isDarkMode:false,
            budgetList: [],
            lang: localStorage.getItem('lang'),
            message: '',
            selBudget: [],
            programValues: [],
            programLabels: [],
            programs: [],
            show: false,
            loading: true,
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, month: new Date().getMonth() + 1 },
            fundingSourceValues: [],
            fundingSourceLabels: [],
            fundingSources: [],//contains filtered funding sources
            fundingSourcesOriginal: [],
            programId: '',
            programValues: [],
            jexcelDataEl: "",
            fundingSourceTypes: [],
            fundingSourceTypeValues: [],
            fundingSourceTypeLabels: [],
        }
        this.formatDate = this.formatDate.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.buildJexcel = this.buildJexcel.bind(this);
    }
    
    

    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.filterData();
        })
    }
    /**
     * Handles the click event on the range picker box.
     * Shows the range picker component.
     * @param {object} e - The event object containing information about the click event.
     */
    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }
    /**
     * Retrieves the list of funding sources types.
     */
    getFundingSourceType = () => {
        //Fetch realmId
        let programIds = this.state.programValues.map((ele) =>
            Number(ele.value)
        );
                DropdownService.getFundingSourceTypeForProgramsDropdownList(programIds)
            .then(response => {
                if (response.status == 200) {
                    var fundingSourceTypeValues = [];
                    var fundingSourceTypes = response.data;
                    fundingSourceTypes.sort(function (a, b) {
                        a = a.code.toLowerCase();
                        b = b.code.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })

                    fundingSourceTypes.map(ele => {
                        fundingSourceTypeValues.push({ label: ele.code, value: ele.id })
                    })

                    this.setState({
                        fundingSourceTypes: fundingSourceTypes, loading: false,
                        fundingSourceTypeValues: fundingSourceTypeValues,
                        fundingSourceTypeLabels: fundingSourceTypeValues.map(ele => ele.label)
                    },()=>{
                        this.filterData();
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            // this.hideSecondComponent();
                        })
                }
            }).catch(
                error => {
                    this.setState({
                        fundingSourceTypes: [], loading: false
                    }, () => {
                    })
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

    handleFundingSourceTypeChange = (fundingSourceTypeIds) => {

        fundingSourceTypeIds = fundingSourceTypeIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceTypeValues: fundingSourceTypeIds.map(ele => ele),
            fundingSourceTypeLabels: fundingSourceTypeIds.map(ele => ele.label)
        }, () => {
            var filteredFundingSourceArr = [];
            var fundingSources = this.state.fundingSourcesOriginal;//original fs list
            for (var i = 0; i < fundingSourceTypeIds.length; i++) {
                for (var j = 0; j < fundingSources.length; j++) {
                    if (fundingSources[j].fundingSourceType.id == fundingSourceTypeIds[i].value) {
                        filteredFundingSourceArr.push(fundingSources[j]);
                    }
                }
            }

            if (filteredFundingSourceArr.length > 0) {
                filteredFundingSourceArr = filteredFundingSourceArr.sort(function (a, b) {
                    a = a.code.toLowerCase();
                    b = b.code.toLowerCase();
                    return a < b ? -1 : a > b ? 1 : 0;
                });
            }
            this.setState({
                fundingSources: filteredFundingSourceArr,
                fundingSourceValues: [],
                fundingSourceLabels: [],
            }, () => {
                this.filterData();
            });

        })
    }

    /**
     * Retrieves the list of funding sources.
     */
    getFundingSource = () => {
        if (localStorage.getItem("sessionType") === 'Online') {
            let programIds = this.state.programValues.map((ele) =>
            Number(ele.value)
        );
                DropdownService.getFundingSourceForProgramsDropdownList(programIds)
                .then(response => {
                    var fundingSourceValues = [];
                    var fundingSources = response.data;
                    fundingSources.map(ele => {
                        fundingSourceValues.push({ label: ele.code, value: ele.id })
                    })
                    fundingSources.sort(function (a, b) {
                        a = a.code.toLowerCase();
                        b = b.code.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })
                    this.setState({
                        fundingSourcesOriginal: fundingSources, loading: false,
                        fundingSources: fundingSources,
                        fundingSourceValues: fundingSourceValues,//by default all fs will be selected
                        fundingSourceLabels: fundingSourceValues.map(ele => ele.label)
                    }, () => {
                        this.filterData();
                    })
                }).catch(
                    error => {
                        this.setState({
                            fundingSourcesOriginal: [], loading: false
                        }, () => {
                        })
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ loading: false, message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError', loading: false });
                                    break;
                            }
                        }
                    }
                );
        } else {
            this.setState({ loading: false })
        }
    }
    /**
     * Handles the change event for funding sources.
     * @param {Array} fundingSourceIds - An array containing the selected funding source IDs.
     */
    handleFundingSourceChange = (fundingSourceIds) => {
        fundingSourceIds = fundingSourceIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceValues: fundingSourceIds.map(ele => ele),
            fundingSourceLabels: fundingSourceIds.map(ele => ele.label)
        }, () => {
            this.filterData()
        })
    }
    /**
     * Exports the data to a CSV file.
     * @param {array} columns - The columns to be exported.
     */
    exportCSV = (columns) => {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        this.state.programLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        this.state.fundingSourceTypeLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.funderTypeHead.funderType') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        this.state.fundingSourceLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });
        var A = [addDoubleQuoteToRowContent(headers)]
        this.state.selBudget.map(ele => A.push(addDoubleQuoteToRowContent([(getLabelText(ele.budget.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), "\'" + ((ele.budget.code.replaceAll(',', ' ')).replaceAll(' ', '%20')) + "\'", (ele.fundingSource.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), (ele.fundingSourceType.code.replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.currency.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), Math.floor(ele.budgetAmt), Math.floor(ele.plannedBudgetAmt), Math.floor(ele.orderedBudgetAmt), Math.floor((ele.budgetAmt - (ele.plannedBudgetAmt + ele.orderedBudgetAmt))), dateFormatterCSV(ele.startDate), dateFormatterCSV(ele.stopDate)])));
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.budgetheader') + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Exports the data to a PDF file.
     * @param {array} columns - The columns to be exported.
     */
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
                doc.text(i18n.t('static.dashboard.budgetheader'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    var programText = doc.splitTextToSize((i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 105, programText)
                    var fundingSourceTypeText = doc.splitTextToSize((i18n.t('static.funderTypeHead.funderType') + ' : ' + this.state.fundingSourceTypeLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 120, fundingSourceTypeText)
                    var fundingSourceText = doc.splitTextToSize((i18n.t('static.budget.fundingsource') + ' : ' + this.state.fundingSourceLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 135, fundingSourceText)
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        var canvas = document.getElementById("cool-canvas");
        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        doc.addImage(canvasImg, 'png', 50, 200, 750, 260, 'CANVAS');
        const headers = columns.map((item, idx) => (item.text));
        const data = this.state.selBudget.map(ele => [getLabelText(ele.budget.label), ele.budget.code, ele.fundingSource.code, ele.fundingSourceType.code, getLabelText(ele.currency.label), this.formatterValue(ele.budgetAmt), this.formatterValue(ele.plannedBudgetAmt), this.formatterValue(ele.orderedBudgetAmt), this.formatterValue(ele.budgetAmt - (ele.plannedBudgetAmt + ele.orderedBudgetAmt)), this.formatDate(ele.startDate), this.formatDate(ele.stopDate)]);
        let content = {
            margin: { top: 80, bottom: 50 },
            startY: height,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center', cellWidth: 60 },
            columnStyles: {
                0: { cellWidth: 90 },
                2: { cellWidth: 73.5 },
                4: { cellWidth: 73.5 },
                5: { cellWidth: 90 },
                6: { cellWidth: 90 },
                7: { cellWidth: 90 },
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.budgetheader') + ".pdf")
    }
    /**
     * Fetches and filters data based on selected program, version, funsing source, and date range.
     */
    filterData() {
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month + 1, 0).getDate();
        let programId = this.state.programValues.length == this.state.programs.length ? [] : this.state.programValues.map(ele => (ele.value).toString())
        let fundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSourcesOriginal.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value).toString());
        if (this.state.programValues.length > 0 && this.state.fundingSourceValues.length > 0) {
            this.setState({ loading: true })
            var inputjson = { "programIds": programId, "startDate": startDate, "stopDate": endDate, "fundingSourceIds": fundingSourceIds }
            ReportService.budgetReport(inputjson)
                .then(response => {
                    this.setState({
                        selBudget: response.data, message: '', loading: false
                    }, () => {
                        this.buildJexcel();
                    })
                }).catch(
                    error => {
                        this.setState({
                            selBudget: [], loading: false
                        })
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
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
        } else if (this.state.programValues.length == 0) {
            jexcel.destroy(document.getElementById("budgetTable"), true);
            this.setState({ selBudget: [], message: i18n.t('static.common.selectProgram') });
        } else {
            jexcel.destroy(document.getElementById("budgetTable"), true);
            this.setState({ selBudget: [], message: i18n.t('static.fundingSource.selectFundingSource') });
        }
    }
    /**
     * Formats a date value into the format 'DD-MMM-YY' (e.g., '20 Jan 22').
     * @param {Date|string} value - The date value to be formatted. It can be a Date object or a string representing a date.
     * @returns {string} - The formatted date string in the 'DD-MMM-YY' format.
        */
    formatDate(cell) {
        if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
            return modifiedDate;
        } else {
            return "";
        }
    }
    /**
     * Retrieves the list of programs.
     */
    getPrograms = () => {
        if (localStorage.getItem("sessionType") === 'Online') {
            let realmId = AuthenticationService.getRealmId();
            DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
                .then(response => {
                    var proList = []
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].active == true) {
                            var programJson = {
                                programId: response.data[i].id,
                                label: response.data[i].label,
                                programCode: response.data[i].code
                            }
                            proList.push(programJson)
                        }
                    }
                    this.setState({
                        programs: proList.sort(function (a, b) {
                            a = a.programCode.toLowerCase();
                            b = b.programCode.toLowerCase();
                            return a < b ? -1 : a > b ? 1 : 0;
                        }), loading: false
                    }, () => { this.filterData() })
                }).catch(
                    error => {
                        this.setState({
                            programs: [], loading: false
                        }, () => {
                        })
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
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
                                        loading: false
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }),
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
            this.setState({ loading: false })
        }
    }
    /**
     * Calls the get programs and get funding source function on page load
     */
    componentDidMount() {
        this.getPrograms();
        // Detect initial theme
const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
this.setState({ isDarkMode });

// Listening for theme changes
const observer = new MutationObserver(() => {
    const updatedDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    this.setState({ isDarkMode: updatedDarkMode });
});

observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
});
        
    }
    /**
     * Formats a numerical value into a string with thousands separators.
     * @param {*} value - The numerical value to be formatted. 
     * @returns - The formatted string with thousands separators. 
     */
    formatterValue = value => {
        if (value != null) {
            return Number(value).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        }
    }
    /**
     * Handles the change event for program selection.
     * @param {array} programIds - The array of selected program IDs.
     */
    handleChangeProgram = (programIds) => {
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label)
        }, () => {
            this.getFundingSourceType();
            this.getFundingSource();
        })
    }
    /**
     * Renders the budget report table.
     * @returns {JSX.Element} - Budget report table.
     */
    render() {


const darkModeColors = [
    '#d4bbff', // Color 1 
];

const lightModeColors = [
    '#002F6C',  // Color 1
];
const { isDarkMode } = this.state;
const colors = isDarkMode ? darkModeColors : lightModeColors;
const fontColor = isDarkMode ? '#e4e5e6' : '#212721';
const gridLineColor = isDarkMode ? '#444' : '#e0e0e0';

const chartoptions =
{
    title: {
        display: true,
        text: i18n.t('static.dashboard.budget'),
        fontColor:fontColor
    },
    scales: {
        yAxes: [{
            id: 'A',
            position: 'left',
            scaleLabel: {
                display: true,
                fontSize: "12",
                fontColor:fontColor
            },
            ticks: {
                beginAtZero: true,
                fontColor:fontColor
            },
            gridLines: {
                drawBorder: true, 
                lineWidth: 1,
                color: gridLineColor
            },
        }],
        xAxes: [{
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.supplyPlan.amountInUSD'),
                fontColor:fontColor,
                fontStyle: "normal",
                fontSize: "12"
            },
            ticks: {
                fontColor:fontColor,
                callback: function (value) {
                    if (value != null) {
                        return Math.floor(value).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                    }
                }
            },
            gridLines: {
                drawBorder: true, 
                lineWidth: 1,
                color: gridLineColor
            },
        }]
    },
    tooltips: {
        mode: 'index',
        intersect: false,
        enabled: false,
        custom: CustomTooltips,
        callbacks: {
            label: function (tooltipItem, data) {
                let label = data.labels[tooltipItem.index];
                let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                return data.datasets[tooltipItem.datasetIndex].label + ' : ' + Math.floor(value).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
            }
        }
    },
    hover: {
        mode: 'index',
        intersect: false
    },
    maintainAspectRatio: false,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
            fontColor:fontColor
        }
    }
}
        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    { label: (item.programCode), value: item.programId }
                )
            }, this);
        var budgets = this.state.selBudget.map((item, index) => (item.budget))
        const { fundingSourceTypes } = this.state;
        const { fundingSources } = this.state;
        const { rangeValue } = this.state

        let fundingSourceListDD = fundingSources.length > 0 &&
            fundingSources.map((item, i) => {
                return {
                    label: item.code,
                    value: item.id,
                };
            }, this);

        let data1 = []
        let data2 = []
        let data3 = []
        let data4 = []
        for (var i = 0; i < budgets.length; i++) {
            data1 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => Math.floor(ele.orderedBudgetAmt)))
            data2 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => Math.floor(ele.plannedBudgetAmt)))
            data3 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => Math.floor(ele.budgetAmt - (ele.orderedBudgetAmt + ele.plannedBudgetAmt)) > 0 ? (Math.floor(ele.budgetAmt - (ele.orderedBudgetAmt + ele.plannedBudgetAmt))) : 0))
            data4 = (this.state.selBudget.filter(c => c.budget.id = budgets[i].id).map(ele => Math.floor(ele.budgetAmt - (ele.orderedBudgetAmt + ele.plannedBudgetAmt)) < 0 ? (Math.floor(ele.budgetAmt - (ele.orderedBudgetAmt + ele.plannedBudgetAmt))) : 0))
        }
        const bar = {
            labels: budgets.map(ele => getLabelText(ele.label, this.state.lang)),
            datasets: [
                {
                    label: i18n.t('static.budget.allocatedShipmentPlanned'),
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#118b70',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data2
                },
                {
                    label: i18n.t('static.budget.allocatedShipmentOrdered'),
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: colors[0],
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data1
                },
                {
                    label: i18n.t('static.report.overspentBudget'),
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#BA0C2F',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data4
                },
                {
                    label: i18n.t('static.report.budgetRemaining'),
                    type: 'horizontalBar',
                    stack: 1,
                    backgroundColor: '#cfcdc9',
                    borderColor: 'rgba(179,181,198,1)',
                    pointBackgroundColor: 'rgba(179,181,198,1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                    data: data3
                }
            ],
        }
        const { SearchBar, ClearSearchButton } = Search;
        const { fundingSourceList } = this.state;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const columns = [
            {
                text: i18n.t('static.budget.budget'),
            },
            {
                text: i18n.t('static.budget.budgetCode'),
            },
            {
                text: i18n.t('static.budget.fundingsource'),
            },
            {
                text: i18n.t('static.funderTypeHead.funderType'),
            },
            {
                text: i18n.t('static.dashboard.currency'),
            },
            {
                text: i18n.t('static.budget.budgetamount'),
            },
            {
                text: i18n.t('static.report.plannedBudgetAmt'),
            }
            ,
            {
                text: i18n.t('static.report.orderedBudgetAmt'),
            },
            {
                text: i18n.t('static.report.remainingBudgetAmt'),
            },
            {
                text: i18n.t('static.common.startdate'),
            },
            {
                text: i18n.t('static.common.stopdate'),
            }];
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
                text: 'All', value: this.state.selBudget.length
            }]
        }
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon" style={{ "marginBottom": "13px", "marginTop": "7px" }}>
                        <span className="pl-0 pb-lg-2">{i18n.t("static.budget.budgetNoteForCommitingLocalVersion")}</span>
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a className="card-header-action">
                                    {this.state.selBudget.length > 0 && <div className="card-header-actions">
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                    </div>}
                                </a>
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        <Col md="11 pl-0">
                            <div className="row">
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon fa fa-sort-desc"></span></Label>
                                    <div className="controls  Regioncalender">
                                        <Picker
                                            ref="pickRange"
                                            years={{ min: this.state.minDate, max: this.state.maxDate }}
                                            value={rangeValue}
                                            lang={pickerLang}
                                            onDismiss={this.handleRangeDissmis}
                                        >
                                            <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                        </Picker>
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3">
                                    <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls ">
                                        <MultiSelect
                                            filterOptions={filterOptions}
                                            bsSize="sm"
                                            name="programIds"
                                            id="programIds"
                                            value={this.state.programValues}
                                            onChange={(e) => { this.handleChangeProgram(e) }}
                                            options={programList && programList.length > 0 ? programList : []}
                                            disabled={this.state.loading}
                                            overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                            selectSomeItems: i18n.t('static.common.select')}}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3" >
                                    <Label htmlFor="fundingSourceTypeId">{i18n.t('static.funderTypeHead.funderType')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls">
                                        <MultiSelect
                                            name="fundingSourceTypeId"
                                            id="fundingSourceTypeId"
                                            bsSize="md"
                                            filterOptions={filterOptions}
                                            value={this.state.fundingSourceTypeValues}
                                            onChange={(e) => { this.handleFundingSourceTypeChange(e) }}
                                            options={fundingSourceTypes.length > 0
                                                && fundingSourceTypes.map((item, i) => {
                                                    return (
                                                        { label: item.code, value: item.id }
                                                    )
                                                }, this)}
                                            disabled={this.state.loading}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup className="col-md-3" >
                                    <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                    <div className="controls">
                                        <MultiSelect
                                            name="fundingSourceId"
                                            id="fundingSourceId"
                                            bsSize="md"
                                            filterOptions={filterOptions}
                                            value={this.state.fundingSourceValues}
                                            onChange={(e) => { this.handleFundingSourceChange(e) }}
                                            options={
                                                fundingSourceListDD && fundingSourceListDD.length > 0
                                                    ? fundingSourceListDD
                                                    : []
                                            }
                                            disabled={this.state.loading}
                                            overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                            selectSomeItems: i18n.t('static.common.select')}}
                                        />
                                    </div>
                                </FormGroup>
                            </div>
                        </Col>
                        <div style={{ display: this.state.loading ? "none" : "block" }}>
                            <Col md="12 pl-0">
                                <div className="row">
                                    {
                                        this.state.selBudget.length > 0
                                        &&
                                        <div className="col-md-12 p-0">
                                            <div className="col-md-12">
                                                <div className="chart-wrapper chart-graph-report">
                                                    <HorizontalBar id="cool-canvas" data={bar} options={chartoptions} />
                                                </div>
                                            </div>
                                        </div>}
                                </div>
                                {
                                    <div className="dataEnteredTable">
                                        <div id="budgetTable" className='TableWidth100'>
                                        </div>
                                    </div>
                                }
                            </Col>
                        </div>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div className="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                    <div className="spinner-border blue ml-4" role="status">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div >
        )
    }
    /**
     * Builds the jexcel table based on the output list.
     */
    buildJexcel() {
        if (this.state.programValues.length > 0 && this.state.fundingSourceValues.length > 0) {
            jexcel.destroy(document.getElementById("budgetTable"), true);
            var data = this.state.selBudget;
            let outPutListArray = [];
            let count = 0;
            for (var j = 0; j < data.length; j++) {
                var data1 = [];
                data1[0] = getLabelText(data[j].budget.label, this.state.lang)
                data1[1] = data[j].budget.code
                data1[2] = data[j].fundingSource.code
                data1[3] = data[j].fundingSourceType.code
                data1[4] = getLabelText(data[j].currency.label, this.state.lang)
                data1[5] = data[j].budgetAmt;
                data1[6] = data[j].plannedBudgetAmt;
                data1[7] = data[j].orderedBudgetAmt;
                data1[8] = data[j].remainingBudgetAmtUsd;
                data1[9] = data[j].startDate;
                data1[10] = data[j].stopDate;
                data1[11] = data[j].budget.id
                outPutListArray[count] = data1;
                count++;
            }
            var options = {
                data: outPutListArray,
                columnDrag: false,
                columns: [
                    { title: i18n.t('static.budget.budget'), type: 'text' },
                    { title: i18n.t('static.budget.budgetCode'), type: 'text' },
                    { title: i18n.t('static.budget.fundingsource'), type: 'text' },
                    { title: i18n.t('static.funderTypeHead.funderType'), type: 'text' },
                    { title: i18n.t('static.dashboard.currency'), type: 'text' },
                    { title: i18n.t('static.budget.budgetamount'), type: 'numeric', mask: '#,##.00', decimal: '.' },
                    { title: i18n.t('static.report.plannedBudgetAmt'), type: 'numeric', mask: '#,##.00', decimal: '.' },
                    { title: i18n.t('static.report.orderedBudgetAmt'), type: 'numeric', mask: '#,##.00', decimal: '.' },
                    { title: i18n.t('static.report.remainingBudgetAmt'), type: 'numeric', mask: '#,##.00', decimal: '.' },
                    { title: i18n.t('static.common.startdate'), options: { format: JEXCEL_DATE_FORMAT_SM }, type: 'calendar' },
                    { title: i18n.t('static.common.stopdate'), options: { format: JEXCEL_DATE_FORMAT_SM }, type: 'calendar' },
                    { title: 'Budget Id', type: 'hidden' },
                ],
                onload: this.loaded,
                pagination: localStorage.getItem("sesRecordCount"),
                filters: false,
                search: false,
                columnSorting: true,
                wordWrap: true,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                position: 'top',
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: false,
                copyCompatibility: false,
                allowManualInsertRow: false,
                parseFormulas: true,
                editable: false,
                license: JEXCEL_PRO_KEY,
                contextMenu: function (obj, x, y, e) {
                    return false;
                }.bind(this),
            };
            var jexcelDataEl = jexcel(document.getElementById("budgetTable"), options);
            this.el = jexcelDataEl;
        } else {
            jexcel.destroy(document.getElementById("budgetTable"), true);
        }
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }
}
export default Budgets;
