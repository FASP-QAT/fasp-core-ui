import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import Picker from 'react-month-picker';
import { MultiSelect } from 'react-multi-select-component';
import {
    Card,
    CardBody,
    Col,
    Form,
    FormGroup, Input, InputGroup,
    Label,
    Table
} from 'reactstrap';
import { LOGO } from '../../CommonComponent/Logo.js';
import MonthBox from '../../CommonComponent/MonthBox.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP_FOUR_DIGITS, MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, PROGRAM_TYPE_SUPPLY_PLAN, REPORT_DATEPICKER_END_MONTH, REPORT_DATEPICKER_START_MONTH } from '../../Constants.js';
import DropdownService from '../../api/DropdownService';
import FundingSourceService from '../../api/FundingSourceService';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import ProductService from '../../api/ProductService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { addDoubleQuoteToRowContent, dateFormatterLanguage, makeText } from '../../CommonComponent/JavascriptCommonFunctions.js';
const ref = React.createRef();
const backgroundColor = [
    '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
    '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
    '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
    '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
    '#205493', '#651D32', '#6C6463', '#BC8985', '#cfcdc9',
    '#49A4A1', '#118B70', '#EDB944', '#F48521', '#ED5626',
    '#002F6C', '#BA0C2F', '#212721', '#0067B9', '#A7C6ED',
]
/**
 * Component for Shipment Global View Report.
 */
class ShipmentGlobalView extends Component {
    constructor(props) {
        super(props);
        var dt = new Date();
        dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
        this.state = {
            labels: ['GF', 'Govt', 'Local', 'PSM'],
            datasets: [{
                data: [13824000, 26849952, 0, 5615266],
                backgroundColor: ['#F48521', '#118b70', '#002f6c', '#EDB944']
            }],
            dropdownOpen: false,
            radioSelected: 2,
            lang: localStorage.getItem('lang'),
            countrys: [],
            planningUnits: [],
            consumptions: [],
            productCategories: [],
            countryValues: [],
            procurementAgents: [],
            procurementAgentTypes: [],
            fundingSources: [],
            countryLabels: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            programValues: [],
            programLabels: [],
            programs: [],
            message: '',
            fundingSourceValues: [],
            procurementAgentValues: [],
            procurementAgentTypeValues: [],
            shipmentList: [],
            dateSplitList: [],
            countrySplitList: [],
            countryShipmentSplitList: [],
            data:
            {
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: []
            },
            lab: [],
            val: [],
            realmList: [],
            table1Body: [],
            table1Headers: [],
            viewby: 1,
            rangeValue: { from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } },
            minDate: { year: new Date().getFullYear() - 10, month: new Date().getMonth() + 1 },
            maxDate: { year: new Date().getFullYear() + MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS, month: new Date().getMonth() + 1 },
            loading: true,
            programLst: [],
            puUnit: {
                label: {
                    label_en: ''
                }
            },
            fundingSourceTypes: [],
            fundingSourceTypeValues: [],
            fundingSourceTypeLabels: [],
        };
        this.getCountrys = this.getCountrys.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
        this.handleChange = this.handleChange.bind(this)
        this.handleChangeProgram = this.handleChangeProgram.bind(this)
        this.getProductCategories = this.getProductCategories.bind(this)
        this.filterProgram = this.filterProgram.bind(this);
    }
    /**
     * Exports the data to a CSV file.
     */
    exportCSV() {
        var csvRow = [];
        csvRow.push('"' + (i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        this.state.countryLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        this.state.programLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.program.program') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.dashboard.productcategory') + ' : ' + (document.getElementById("productCategoryId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.planningunit.planningunit') + ' : ' + (document.getElementById("planningUnitId").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        var viewby = document.getElementById("viewById").value;
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.display') + ' : ' + (document.getElementById("viewById").selectedOptions[0].text)).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        if (viewby == 1) {
            this.state.fundingSourceLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.budget.fundingsource') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        } else if (viewby == 2) {
            this.state.procurementAgentLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.procurementagent.procurementagent') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        } else if (viewby == 3) {
            this.state.procurementAgentTypeLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.dashboard.procurementagentType') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        } else if (viewby == 4) {
            this.state.fundingSourceTypeLabels.map(ele =>
                csvRow.push('"' + (i18n.t('static.funderTypeHead.funderType') + ' : ' + (ele.toString())).replaceAll(' ', '%20') + '"'))
        }
        csvRow.push('')
        csvRow.push('"' + ((i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('"' + ((i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20') + '"'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push('"' + (i18n.t('static.common.youdatastart')).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        var re;
        if (this.state.table1Body.length > 0) {
            var A = [];
            let tableHead = this.state.table1Headers;
            let tableHeadTemp = [];
            for (var i = 0; i < tableHead.length; i++) {
                tableHeadTemp.push((tableHead[i].replaceAll(',', ' ')).replaceAll(' ', '%20'));
            }
            A[0] = addDoubleQuoteToRowContent(tableHeadTemp);
            re = this.state.table1Body
            for (var item = 0; item < re.length; item++) {
                A.push([[('"' + getLabelText(re[item].country.label, this.state.lang)).replaceAll(' ', '%20') + '"', addDoubleQuoteToRowContent(re[item].amount)]])
            }
            for (var i = 0; i < A.length; i++) {
                csvRow.push(A[i].join(","))
            }
        }
        csvRow.push('')
        csvRow.push('')
        csvRow.push('')
        if (this.state.shipmentList.length > 0) {
            let tempLabel = '';
            if (viewby == 1) {
                tempLabel = i18n.t('static.budget.fundingsource');
            } else if (viewby == 2) {
                tempLabel = i18n.t('static.procurementagent.procurementagent');
            } else if (viewby == 3) {
                tempLabel = i18n.t('static.dashboard.procurementagentType');
            } else if (viewby == 4) {
                tempLabel = i18n.t('static.funderTypeHead.funderType');
            }
            var B = [addDoubleQuoteToRowContent([(i18n.t('static.dashboard.months').replaceAll(',', ' ')).replaceAll(' ', '%20'), (i18n.t('static.program.realmcountry').replaceAll(',', ' ')).replaceAll(' ', '%20'), (i18n.t('static.supplyPlan.amountInUSD').replaceAll(',', ' ')).replaceAll(' ', '%20'), (tempLabel.replaceAll(',', ' ')).replaceAll(' ', '%20'), (i18n.t('static.common.status').replaceAll(',', ' ')).replaceAll(' ', '%20')])];
            re = this.state.shipmentList;
            for (var item = 0; item < re.length; item++) {
                B.push([addDoubleQuoteToRowContent([(moment(re[item].transDate, 'YYYY-MM-dd').format(DATE_FORMAT_CAP_FOUR_DIGITS).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(re[item].country.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), re[item].amount, (getLabelText(re[item].fundingSourceProcurementAgent.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(re[item].shipmentStatus.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20')])])
            }
            for (var i = 0; i < B.length; i++) {
                csvRow.push(B[i].join(","))
            }
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.shipmentGlobalViewheader') + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to) + ".csv"
        document.body.appendChild(a)
        a.click()
    }
    /**
     * Exports the data to a PDF file.
     */
    exportPDF = () => {
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
                doc.text(i18n.t('static.dashboard.shipmentGlobalViewheader'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + makeText(this.state.rangeValue.from) + ' ~ ' + makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    var countryLabelsText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 110, countryLabelsText)
                    var len = 120 + countryLabelsText.length * 10
                    var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, len, planningText)
                    len = len + 10 + planningText.length * 10
                    doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
                        align: 'left'
                    })
                    len = len + 20
                    doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
                        align: 'left'
                    })
                    len = len + 20
                    doc.text(i18n.t('static.common.display') + ' : ' + document.getElementById("viewById").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
                        align: 'left'
                    })
                    len = len + 20
                    doc.text(i18n.t('static.report.includeapproved') + ' : ' + document.getElementById("includeApprovedVersions").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
                        align: 'left'
                    })
                    len = len + 20
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, len, {
                        align: 'left'
                    })
                    len = len + 20
                    var viewby = document.getElementById("viewById").value;
                    if (viewby == 1) {
                        var fundingSourceText = doc.splitTextToSize((i18n.t('static.budget.fundingsource') + ' : ' + this.state.fundingSourceLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        doc.text(doc.internal.pageSize.width / 8, len, fundingSourceText)
                    } else if (viewby == 2) {
                        var procurementAgentText = doc.splitTextToSize((i18n.t('static.procurementagent.procurementagent') + ' : ' + this.state.procurementAgentLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        doc.text(doc.internal.pageSize.width / 8, len, procurementAgentText)
                    } else if (viewby == 3) {
                        var procurementAgentTypeText = doc.splitTextToSize((i18n.t('static.dashboard.procurementagentType') + ' : ' + this.state.procurementAgentTypeLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        doc.text(doc.internal.pageSize.width / 8, len, procurementAgentTypeText)
                    } else if (viewby == 4) {
                        var fundingSourceTypeText = doc.splitTextToSize((i18n.t('static.funderTypeHead.funderType') + ' : ' + this.state.fundingSourceTypeLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
                        doc.text(doc.internal.pageSize.width / 8, len, fundingSourceTypeText)
                    }
                }
            }
        }
        const unit = "pt";
        const size = "A4";
        const orientation = "landscape";
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(10);
        const title = i18n.t('static.dashboard.shipmentGlobalViewheader');
        var canvas = document.getElementById("cool-canvas1");
        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        doc.addImage(canvasImg, 'png', 50, 260, 300, 200, 'a', 'CANVAS');
        canvas = document.getElementById("cool-canvas2");
        canvasImg = canvas.toDataURL("image/png", 1.0);
        doc.addImage(canvasImg, 'png', width / 2, 260, 300, 200, 'b', 'CANVAS');
        let displaylabel = [];
        displaylabel = this.state.dateSplitList.filter((i, index) => (index < 1)).map(ele => (Object.keys(ele.amount)));
        if (displaylabel.length > 0) {
            displaylabel = displaylabel[0];
        }
        let length = displaylabel.length + 1;
        let content1 = {
            margin: { top: 80, bottom: 50 },
            startY: height,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 520 / displaylabel.length, halign: 'center' },
            columnStyles: {
            },
            html: '#mytable1',
            didDrawCell: function (data) {
                if (data.column.index === length && data.cell.section === 'body') {
                    var td = data.cell.raw;
                    var img = td.getElementsByTagName('img')[0];
                    var dim = data.cell.height - data.cell.padding('vertical');
                    var textPos = data.cell.textPos;
                    doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
                }
            }
        };
        doc.autoTable(content1);
        let content2 = {
            margin: { top: 80, bottom: 50 },
            startY: doc.autoTableEndPosY() + 50,
            pageBreak: 'auto',
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 120, halign: 'center' },
            columnStyles: {
                3: { cellWidth: 281.89 },
            },
            html: '#mytable2',
            didDrawCell: function (data) {
                if (data.column.index === 5 && data.cell.section === 'body') {
                    var td = data.cell.raw;
                    var img = td.getElementsByTagName('img')[0];
                    var dim = data.cell.height - data.cell.padding('vertical');
                    var textPos = data.cell.textPos;
                    doc.addImage(img.src, textPos.x, textPos.y, dim, dim);
                }
            }
        };
        doc.autoTable(content2);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.dashboard.shipmentGlobalViewheader').concat('.pdf'));
    }
    /**
     * Handles the change event for program selection.
     * @param {array} programIds - The array of selected program IDs.
     */
    handleChangeProgram(programIds) {
        this.getProcurementAgent(programIds.map(ele => ele.value));
        programIds = programIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            programValues: programIds.map(ele => ele),
            programLabels: programIds.map(ele => ele.label)
        }, () => {
            this.fetchData()
        })
    }
    /**
     * Retrieves the list of countries based on the realm ID and updates the state with the list.
     */
    getCountrys() {
        this.setState({
            loading: true
        })
        let realmId = AuthenticationService.getRealmId();
        DropdownService.getRealmCountryDropdownList(realmId)
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    countrys: listArray, loading: false
                })
            }).catch(
                error => {
                    this.setState({
                        countrys: []
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
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }),
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
     * Retrieves the list of planning units for a selected product category.
     */
    getPlanningUnit() {
        this.setState({ loading: true })
        let productCategoryId = document.getElementById("productCategoryId").value;
        var lang = this.state.lang
        if (productCategoryId != -1) {
            PlanningUnitService.getActivePlanningUnitByProductCategoryId(productCategoryId).then(response => {
                (response.data).sort(function (a, b) {
                    return getLabelText(a.label, lang).localeCompare(getLabelText(b.label, lang));
                });
                this.setState({
                    planningUnits: response.data, loading: false
                }, () => {
                    this.fetchData()
                });
            }).catch(
                error => {
                    this.setState({
                        planningUnits: [],
                        planningUnitValues: []
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
    }
    /**
     * Toggles the view based on the selected option.
     */
    toggleView = () => {
        let viewby = document.getElementById("viewById").value;
        this.setState({
            viewby: viewby
        });
        if (viewby == 1) {
            document.getElementById("fundingSourceDiv").style.display = "block";
            document.getElementById("fundingSourceTypeDiv").style.display = "none";
            document.getElementById("procurementAgentDiv").style.display = "none";
            document.getElementById("procurementAgentTypeDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
            })
        } else if (viewby == 2) {
            document.getElementById("procurementAgentDiv").style.display = "block";
            document.getElementById("fundingSourceDiv").style.display = "none";
            document.getElementById("fundingSourceTypeDiv").style.display = "none";
            document.getElementById("procurementAgentTypeDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
            })
        } else if (viewby == 3) {
            document.getElementById("procurementAgentTypeDiv").style.display = "block";
            document.getElementById("procurementAgentDiv").style.display = "none";
            document.getElementById("fundingSourceDiv").style.display = "none";
            document.getElementById("fundingSourceTypeDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
            })
        } else if (viewby == 4) {
            document.getElementById("fundingSourceTypeDiv").style.display = "block";
            document.getElementById("procurementAgentTypeDiv").style.display = "none";
            document.getElementById("procurementAgentDiv").style.display = "none";
            document.getElementById("fundingSourceDiv").style.display = "none";
            this.setState({
                data: []
            }, () => {
                this.fetchData();
            })
        }
    }
    /**
     * Calls the get countrys function on page load
     */
    componentDidMount() {
        this.getCountrys();
        document.getElementById("procurementAgentDiv").style.display = "none";
        document.getElementById("procurementAgentTypeDiv").style.display = "none";
        document.getElementById("fundingSourceTypeDiv").style.display = "none";
    }
    /**
     * Retrieves the list of planning units for a selected programs.
     */
    getProcurementAgent = (programIds) => {
        this.setState({ loading: true })
        var programJson = programIds
        DropdownService.getProcurementAgentDropdownListForFilterMultiplePrograms(programJson)
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = a.code.toUpperCase();
                    var itemLabelB = b.code.toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    procurementAgents: listArray, loading: false
                })
            }).catch(
                error => {
                    this.setState({
                        procurementAgents: [], loading: false
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
    }
    /**
     * Retrieves the list of procurement agent types.
     */
    getProcurementAgentType = () => {
        this.setState({ loading: true })
        ProcurementAgentService.getProcurementAgentTypeListAll()
            .then(response => {
                let realmId = AuthenticationService.getRealmId();
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                    var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    procurementAgentTypes: listArray.filter(c => c.active == true && realmId == c.realm.id), loading: false,
                }, () => { this.fetchData(); })
            }).catch(
                error => {
                    this.setState({
                        procurementAgentTypes: [], loading: false
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
    }
    /**
     * Retrieves the list of funding sources.
     */
    getFundingSource = () => {
        this.setState({ loading: true })
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                    var itemLabelA = a.fundingSourceCode.toUpperCase();
                    var itemLabelB = b.fundingSourceCode.toUpperCase();
                    return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState({
                    fundingSources: listArray, loading: false
                }, () => { this.getProcurementAgentType(); this.getFundingSourceType();})
            }).catch(
                error => {
                    this.setState({
                        fundingSources: []
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
    }
    /**
     * Retrieves the list of product categories based on the realm ID and updates the state with the list.
     */
    getProductCategories() {
        this.setState({
            loading: true
        })
        let realmId = AuthenticationService.getRealmId();
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                var list = response.data;
                // list.sort((a, b) => {
                //     var itemLabelA = getLabelText(a.payload.label, this.state.lang).toUpperCase(); 
                //     var itemLabelB = getLabelText(b.payload.label, this.state.lang).toUpperCase(); 
                //     return itemLabelA > itemLabelB ? 1 : -1;
                // });
                this.setState({
                    productCategories: list, loading: false
                }, () => { this.getFundingSource(); })
            }).catch(
                error => {
                    this.setState({
                        productCategories: [], loading: false
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
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }),
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }),
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
     * Retrieves the list of funding sources types.
     */
    getFundingSourceType = () => {
        //Fetch realmId
        let realmId = AuthenticationService.getRealmId();
        //Fetch all funding source type list
        FundingSourceService.getFundingsourceTypeListByRealmId(realmId)
            .then(response => {
                if (response.status == 200) {
                    var fundingSourceTypeValues = [];
                    var fundingSourceTypes = response.data;
                    fundingSourceTypes.sort(function (a, b) {
                        a = a.fundingSourceTypeCode.toLowerCase();
                        b = b.fundingSourceTypeCode.toLowerCase();
                        return a < b ? -1 : a > b ? 1 : 0;
                    })                    

                    this.setState({
                        fundingSourceTypes: fundingSourceTypes, loading: false,
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

    /**
     * Handles the dismiss of the range picker component.
     * Updates the component state with the new range value and triggers a data fetch.
     * @param {object} value - The new range value selected by the user.
     */
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
        this.fetchData();
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
     * Displays a loading indicator while data is being loaded.
     */
    loading = () => <div className="animated fadeIn pt-1 text-center">{i18n.t('static.common.loading')}</div>
    /**
     * Fetches data based on selected filters.
     */
    fetchData = () => {
        let viewby = document.getElementById("viewById").value;
        let realmId = AuthenticationService.getRealmId()
        let procurementAgentIds = this.state.procurementAgentValues.length == this.state.procurementAgents.length ? [] : this.state.procurementAgentValues.map(ele => (ele.value).toString());
        let procurementAgentTypeIds = this.state.procurementAgentTypeValues.length == this.state.procurementAgentTypes.length ? [] : this.state.procurementAgentTypeValues.map(ele => (ele.value).toString());
        let fundingSourceIds = this.state.fundingSourceValues.length == this.state.fundingSources.length ? [] : this.state.fundingSourceValues.map(ele => (ele.value).toString());
        let fundingSourcetypeIds = this.state.fundingSourceTypeValues.length == this.state.fundingSourceTypes.length ? [] : this.state.fundingSourceTypeValues.map(ele => (ele.value).toString());
        let productCategoryId = document.getElementById("productCategoryId").value;
        let CountryIds = this.state.countryValues.length == this.state.countrys.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
        let useApprovedVersion = document.getElementById("includeApprovedVersions").value
        let includePlanningShipments = document.getElementById("includePlanningShipments").value
        let programIds = this.state.programValues.length == this.state.programLst.length ? [] : this.state.programValues.map(ele => (ele.value).toString());
        let planningUnitId = document.getElementById("planningUnitId").value;
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let endDate = this.state.rangeValue.to.year + '-' + String(this.state.rangeValue.to.month).padStart(2, '0') + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();
        let fundingSourceProcurementAgentIds = [];
        if (viewby == 1) {
            fundingSourceProcurementAgentIds = fundingSourceIds;
        } else if (viewby == 2) {
            fundingSourceProcurementAgentIds = procurementAgentIds;
        } else if (viewby == 3){
            fundingSourceProcurementAgentIds = procurementAgentTypeIds;
        } else if (viewby == 4){//for funding source type
            fundingSourceProcurementAgentIds = fundingSourcetypeIds;
        }

        if (realmId > 0 && planningUnitId != 0 && productCategoryId != -1 && this.state.countryValues.length > 0 && this.state.programValues.length > 0 && ((viewby == 2 && this.state.procurementAgentValues.length > 0) || (viewby == 3 && this.state.procurementAgentTypeValues.length > 0) || (viewby == 1 && this.state.fundingSourceValues.length > 0) || (viewby == 4 && this.state.fundingSourceTypeValues.length > 0))) {
            let planningUnitUnit = this.state.planningUnits.filter(c => c.planningUnitId == planningUnitId)[0].unit;
            this.setState({
                message: '',
                loading: true,
                puUnit: planningUnitUnit
            })
            var inputjson = {
                realmId: realmId,
                startDate: startDate,
                stopDate: endDate,
                realmCountryIds: CountryIds,
                programIds: programIds,
                planningUnitId: planningUnitId,
                reportView: viewby,
                fundingSourceProcurementAgentIds: fundingSourceProcurementAgentIds
                , useApprovedSupplyPlanOnly: useApprovedVersion,
                includePlannedShipments: includePlanningShipments
            }
            ReportService.ShipmentGlobalView(inputjson)
                .then(response => {
                    if (response.data.countrySplitList.length != 0) {
                        var table1Headers = [];
                        var lab = [];
                        var val = [];
                        var table1Body = [];
                        table1Headers = Object.keys(response.data.countrySplitList[0].amount);
                        table1Headers.unshift(i18n.t('static.dashboard.country'));
                        for (var item = 0; item < response.data.countrySplitList.length; item++) {
                            let obj = {
                                country: response.data.countrySplitList[item].country,
                                amount: Object.values(response.data.countrySplitList[item].amount),
                            }
                            table1Body.push(obj);
                        }
                        this.setState({
                            data: response.data,
                            shipmentList: response.data.shipmentList,
                            dateSplitList: response.data.dateSplitList,
                            countrySplitList: response.data.countrySplitList,
                            countryShipmentSplitList: response.data.countryShipmentSplitList,
                            table1Headers: table1Headers,
                            table1Body: table1Body,
                            lab: lab,
                            val: val,
                            loading: false
                        }, () => {
                        })
                    }
                    else {
                        this.setState({
                            data: response.data,
                            shipmentList: response.data.shipmentList,
                            dateSplitList: response.data.dateSplitList,
                            countrySplitList: response.data.countrySplitList,
                            countryShipmentSplitList: response.data.countryShipmentSplitList,
                            table1Headers: [],
                            table1Body: [],
                            lab: [],
                            val: [],
                            loading: false
                        }, () => { }
                        )
                    }
                }).catch(
                    error => {
                        this.setState({
                            loading: false
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
        } else if (realmId <= 0) {
            this.setState({
                message: i18n.t('static.common.realmtext'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (this.state.countryValues.length == 0) {
            this.setState({
                message: i18n.t('static.program.validcountrytext'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (this.state.programValues.length == 0) {
            this.setState({
                message: i18n.t('static.common.selectProgram'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (productCategoryId == -1) {
            this.setState({
                message: i18n.t('static.common.selectProductCategory'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (planningUnitId == 0) {
            this.setState({
                message: i18n.t('static.procurementUnit.validPlanningUnitText'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (viewby == 1 && this.state.fundingSourceValues.length == 0) {
            this.setState({
                message: i18n.t('static.fundingSource.selectFundingSource'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (viewby == 2 && this.state.procurementAgentValues.length == 0) {
            this.setState({
                message: i18n.t('static.procurementAgent.selectProcurementAgent'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (viewby == 3 && this.state.procurementAgentTypeValues.length == 0) {
            this.setState({
                message: i18n.t('static.shipment.shipmentProcurementAgentType'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        } else if (viewby == 4 && this.state.fundingSourceTypeValues.length == 0) {
            this.setState({
                message: i18n.t('static.shipment.selectFundingSourceType'),
                data: [],
                shipmentList: [],
                dateSplitList: [],
                countrySplitList: [],
                countryShipmentSplitList: [],
                table1Headers: [],
                table1Body: [],
                lab: [],
                val: []
            });
        }
    }
    /**
     * Handles the change event for procurement agents.
     * @param {Array} procurementAgentIds - An array containing the selected procurement agent IDs.
     */
    handleProcurementAgentChange(procurementAgentIds) {
        procurementAgentIds = procurementAgentIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            procurementAgentValues: procurementAgentIds.map(ele => ele),
            procurementAgentLabels: procurementAgentIds.map(ele => ele.label),
            fundingSourceValues: [],
            fundingSourceLabels: [],
            procurementAgentTypeValues: [],
            procurementAgentTypeLabels: [],
            fundingSourceTypeValues: [],
            fundingSourceTypeLabels: []
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Handles the change event for procurement agent types.
     * @param {Array} procurementAgentTypeIds - An array containing the selected procurement agent type IDs.
     */
    handleProcurementAgentTypeChange(procurementAgentTypeIds) {
        procurementAgentTypeIds = procurementAgentTypeIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            procurementAgentTypeValues: procurementAgentTypeIds.map(ele => ele),
            procurementAgentTypeLabels: procurementAgentTypeIds.map(ele => ele.label),
            fundingSourceValues: [],
            fundingSourceLabels: [],
            procurementAgentValues: [],
            procurementAgentLabels: [],
            fundingSourceTypeValues: [],
            fundingSourceTypeLabels: []
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Handles the change event for funding sources.
     * @param {Array} fundingSourceIds - An array containing the selected funding source IDs.
     */
    handleFundingSourceChange(fundingSourceIds) {
        fundingSourceIds = fundingSourceIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceValues: fundingSourceIds.map(ele => ele),
            fundingSourceLabels: fundingSourceIds.map(ele => ele.label),
            procurementAgentValues: [],
            procurementAgentLabels: [],
            procurementAgentTypeValues: [],
            procurementAgentTypeLabels: [],
            fundingSourceTypeValues: [],
            fundingSourceTypeLabels: []
        }, () => {
            this.fetchData();
        })
    }
    handleFundingSourceTypeChange = (fundingSourceTypeIds) => {

        fundingSourceTypeIds = fundingSourceTypeIds.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            fundingSourceTypeValues: fundingSourceTypeIds.map(ele => ele),
            fundingSourceTypeLabels: fundingSourceTypeIds.map(ele => ele.label),
            fundingSourceValues: [],
            fundingSourceLabels: [],
            procurementAgentValues: [],
            procurementAgentLabels: [],
            procurementAgentTypeValues: [],
            procurementAgentTypeLabels: []
        }, () => {
            this.fetchData();
        })
    }
    /**
     * Handles the change event for countries.
     * @param {Array} countrysId - An array containing the selected country IDs.
     */
    handleChange(countrysId) {
        countrysId = countrysId.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            countryValues: countrysId.map(ele => ele),
            countryLabels: countrysId.map(ele => ele.label)
        }, () => {
            this.filterProgram();
        })
    }
    /**
     * Filters programs based on selected countries.
     */
    filterProgram = () => {
        let countryIds = this.state.countryValues.map(ele => ele.value);
        this.setState({
            programLst: [],
            programValues: [],
            programLabels: [],
            procurementAgentValues: [],
            procurementAgents: [],
        }, () => {
            if (countryIds.length != 0) {
                let newCountryList = [... new Set(countryIds)];
                DropdownService.getProgramWithFilterForMultipleRealmCountryForDropdown(PROGRAM_TYPE_SUPPLY_PLAN, newCountryList)
                    .then(response => {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = a.code.toUpperCase();
                            var itemLabelB = b.code.toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        if (listArray.length > 0) {
                            this.setState({
                                programLst: listArray
                            }, () => {
                                this.getProductCategories();
                            });
                        } else {
                            this.setState({
                                programLst: []
                            }, () => {
                                this.getProductCategories()
                            });
                        }
                    }).catch(
                        error => {
                            this.setState({
                                programLst: [], loading: false
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
                this.setState({
                    programLst: []
                }, () => {
                    this.fetchData()
                });
            }
        })
    }
    /**
     * Renders the Shipment Global View report table.
     * @returns {JSX.Element} - Shipment Global View report table.
     */
    render() {
        const { planningUnits } = this.state;
        let planningUnitList = [];
        planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    { label: getLabelText(item.label, this.state.lang), value: item.planningUnitId }
                )
            }, this);
        const { procurementAgents } = this.state;
        let procurementAgentList = [];
        procurementAgentList = procurementAgents.length > 0
            && procurementAgents.map((item, i) => {
                return (
                    { label: item.code, value: item.id }
                )
            }, this);
        const { procurementAgentTypes } = this.state;
        let procurementAgentTypeList = [];
        procurementAgentTypeList = procurementAgentTypes.length > 0
            && procurementAgentTypes.map((item, i) => {
                return (
                    { label: item.procurementAgentTypeCode, value: item.procurementAgentTypeId }
                )
            }, this);
        const { fundingSources } = this.state;
        let fundingSourceList = [];
        fundingSourceList = fundingSources.length > 0
            && fundingSources.map((item, i) => {
                return (
                    { label: item.fundingSourceCode, value: item.fundingSourceId }
                )
            }, this);
        const { fundingSourceTypes } = this.state;
        let fundingSourceTypeList = [];
        fundingSourceTypeList = fundingSourceTypes.length > 0
        && fundingSourceTypes.map((item, i) => {
            return (
                { label: item.fundingSourceTypeCode, value: item.fundingSourceTypeId }
            )
        }, this);

        const { countrys } = this.state;
        let countryList = countrys.length > 0 && countrys.map((item, i) => {
            return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
        }, this);
        const { productCategories } = this.state;
        const { programLst } = this.state;
        let programList = [];
        programList = programLst.length > 0
            && programLst.map((item, i) => {
                return (
                    { label: (item.code), value: item.id }
                )
            }, this);
        const pickerLang = {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state
        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }
        const options = {
            title: {
                display: true,
                text: i18n.t('static.dashboard.shipmentGlobalViewheader'),
                fontColor: 'black'
            },
            scales: {
                xAxes: [{
                    labelMaxWidth: 100,
                    stacked: true,
                    gridLines: {
                        display: false
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.state.puUnit.label.label_en,
                        fontColor: 'black'
                    },
                    stacked: true,
                    labelString: i18n.t('static.shipment.amount'),
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black',
                        callback: function (value) {
                            var cell1 = value
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
                    }
                }
                ],
            },
            tooltips: {
                enabled: false,
                custom: CustomTooltips,
                callbacks: {
                    label: function (tooltipItem, data) {
                        let label = data.labels[tooltipItem.index];
                        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                            x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                    }
                }
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                }
            }
        }
        const options1 = {
            title: {
                display: true,
                text: i18n.t('static.shipment.shipmentfundingSource'),
                fontColor: 'black'
            },
            scales: {
                xAxes: [{
                    labelMaxWidth: 100,
                    stacked: true,
                    gridLines: {
                        display: false
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.state.puUnit.label.label_en,
                        fontColor: 'black'
                    },
                    stacked: true,
                    labelString: i18n.t('static.shipment.amount'),
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black',
                        callback: function (value) {
                            var cell1 = value
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
                    }
                }],
            },
            tooltips: {
                enabled: false,
                custom: CustomTooltips,
                callbacks: {
                    label: function (tooltipItem, data) {
                        let label = data.labels[tooltipItem.index];
                        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                            x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                    }
                }
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                }
            }
        }
        const options2 = {
            title: {
                display: true,
                text: i18n.t('static.shipment.shipmentProcurementAgent'),
                fontColor: 'black'
            },
            scales: {
                xAxes: [{
                    labelMaxWidth: 100,
                    stacked: true,
                    gridLines: {
                        display: false
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.state.puUnit.label.label_en,
                        fontColor: 'black'
                    },
                    stacked: true,
                    labelString: i18n.t('static.shipment.amount'),
                }],
            },
            tooltips: {
                enabled: false,
                custom: CustomTooltips
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                }
            }
        }
        const options3 = {
            title: {
                display: true,
                text: i18n.t('static.shipment.shipmentProcurementAgentType'),
                fontColor: 'black'
            },
            scales: {
                xAxes: [{
                    labelMaxWidth: 100,
                    stacked: true,
                    gridLines: {
                        display: false
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.state.puUnit.label.label_en,
                        fontColor: 'black'
                    },
                    stacked: true,
                    labelString: i18n.t('static.shipment.amount'),
                }],
            },
            tooltips: {
                enabled: false,
                custom: CustomTooltips
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                }
            }
        }

        const options4 = {
            title: {
                display: true,
                text: i18n.t('static.shipment.shipmentFundingSourceType'),
                fontColor: 'black'
            },
            scales: {
                xAxes: [{
                    labelMaxWidth: 100,
                    stacked: true,
                    gridLines: {
                        display: false
                    },
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.state.puUnit.label.label_en,
                        fontColor: 'black'
                    },
                    stacked: true,
                    labelString: i18n.t('static.shipment.amount'),
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'black',
                        callback: function (value) {
                            var cell1 = value
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
                    }
                }],
            },
            tooltips: {
                enabled: false,
                custom: CustomTooltips,
                callbacks: {
                    label: function (tooltipItem, data) {
                        let label = data.labels[tooltipItem.index];
                        let value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        var cell1 = value
                        cell1 += '';
                        var x = cell1.split('.');
                        var x1 = x[0];
                        var x2 = x.length > 1 ? '.' + x[1] : '';
                        var rgx = /(\d+)(\d{3})/;
                        while (rgx.test(x1)) {
                            x1 = x1.replace(rgx, '$1' + ',' + '$2');
                        }
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + x1 + x2;
                    }
                }
            },
            maintainAspectRatio: false
            ,
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    fontColor: 'black'
                }
            }
        }

        const bar = {
            labels: this.state.countryShipmentSplitList.map(ele => (ele.country.label.label_en)),
            datasets: [{
                label: i18n.t('static.shipment.orderedShipment'),
                data: this.state.countryShipmentSplitList.map(ele => (ele.orderedShipmentAmt)),
                backgroundColor: '#0067B9',
                borderWidth: 0
            },
            {
                label: i18n.t('static.shipment.plannedShipment'),
                data: this.state.countryShipmentSplitList.map(ele => (ele.plannedShipmentAmt)),
                backgroundColor: '#A7C6ED',
                borderWidth: 0,
            }
            ]
        }
        let displaylabel = (this.state.dateSplitList.length > 0 ? Object.keys(this.state.dateSplitList[0].amount) : []);
        let dateSplitList = this.state.dateSplitList;
        let displayObject = [];
        for (var i = 0; i < displaylabel.length; i++) {
            let holdArray = [];
            for (var j = 0; j < dateSplitList.length; j++) {
                let subArraylab = Object.keys(dateSplitList[j].amount);
                let subArrayval = Object.values(dateSplitList[j].amount);
                for (var x = 0; x < subArraylab.length; x++) {
                    if (displaylabel[i].localeCompare(subArraylab[x]) == 0) {
                        holdArray.push(subArrayval[x]);
                        x = subArraylab.length;
                    }
                }
            }
            displayObject.push(holdArray);
        }
        var bar1 = []
        const dataSet = displaylabel.map((item, index) => ({ label: item, data: displayObject[index], borderWidth: 0, backgroundColor: backgroundColor[index] }))
        bar1 = {
            labels: [...new Set(this.state.dateSplitList.map(ele => (dateFormatterLanguage(moment(ele.transDate, 'YYYY-MM-dd')))))],
            datasets: dataSet
        }
        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5 className="red">{i18n.t(this.state.message)}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {(this.state.shipmentList.length > 0 || this.state.dateSplitList.length > 0 || this.state.countrySplitList.length > 0 || this.state.countryShipmentSplitList.length > 0) &&
                            <div className="card-header-actions">
                                <a className="card-header-action">
                                    <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                    {(this.state.shipmentList.length > 0 || this.state.countrySplitList.length > 0) &&
                                        <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                                    }
                                </a>
                            </div>
                        }
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        <div ref={ref}>
                            <Form >
                                <div className="pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                            <div className="controls edit">
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
                                            <Label htmlFor="programIds">{i18n.t('static.program.realmcountry')}</Label>
                                            <span className="reportdown-box-icon fa fa-sort-desc ml-1"></span>
                                            <MultiSelect
                                                bsSize="sm"
                                                name="countryIds"
                                                id="countryIds"
                                                value={this.state.countryValues}
                                                onChange={(e) => { this.handleChange(e) }}
                                                options={countryList && countryList.length > 0 ? countryList : []}
                                                disabled={this.state.loading}
                                                overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                selectSomeItems: i18n.t('static.common.select')}}
                                            />
                                            {!!this.props.error &&
                                                this.props.touched && (
                                                    <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                                                )}
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="programIds">{i18n.t('static.program.program')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <MultiSelect
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
                                            {!!this.props.error &&
                                                this.props.touched && (
                                                    <div style={{ color: '#BA0C2F', marginTop: '.5rem' }}>{this.props.error}</div>
                                                )}
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.productcategory.productcategory')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="productCategoryId"
                                                        id="productCategoryId"
                                                        bsSize="sm"
                                                        onChange={this.getPlanningUnit}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.select')}</option>
                                                        {productCategories.length > 0
                                                            && productCategories.map((item, i) => {
                                                                return (
                                                                    <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
                                                                        {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
                                                                    </option>
                                                                )
                                                            }, this)}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-sm-3" id="hideDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="planningUnitId"
                                                        id="planningUnitId"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}
                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {planningUnits.length > 0
                                                            && planningUnits.map((item, i) => {
                                                                return (
                                                                    <option key={i} value={item.planningUnitId}>
                                                                        {getLabelText(item.label, this.state.lang)}
                                                                    </option>
                                                                )
                                                            }, this)}
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.display')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="viewById"
                                                        id="viewById"
                                                        bsSize="sm"
                                                        onChange={this.toggleView}
                                                    >
                                                        <option value="1">{i18n.t('static.dashboard.fundingsource')}</option>
                                                        <option value="4">{i18n.t('static.funderTypeHead.funderType')}</option>
                                                        <option value="2">{i18n.t('static.procurementagent.procurementagent')}</option>
                                                        <option value="3">{i18n.t('static.dashboard.procurementagentType')}</option>
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3" id="procurementAgentDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.procurementagent.procurementagent')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">
                                                <MultiSelect
                                                    name="procurementAgentId"
                                                    id="procurementAgentId"
                                                    bsSize="sm"
                                                    value={this.state.procurementAgentValues}
                                                    onChange={(e) => { this.handleProcurementAgentChange(e) }}
                                                    options={procurementAgentList && procurementAgentList.length > 0 ? procurementAgentList : []}
                                                    overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                    selectSomeItems: i18n.t('static.common.select')}}
                                                />
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3" id="procurementAgentTypeDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.dashboard.procurementagentType')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">
                                                <MultiSelect
                                                    name="procurementAgentTypeId"
                                                    id="procurementAgentTypeId"
                                                    bsSize="sm"
                                                    value={this.state.procurementAgentTypeValues}
                                                    onChange={(e) => { this.handleProcurementAgentTypeChange(e) }}
                                                    options={procurementAgentTypeList && procurementAgentTypeList.length > 0 ? procurementAgentTypeList : []}
                                                    overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                    selectSomeItems: i18n.t('static.common.select')}}
                                                />
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3" id="fundingSourceDiv">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.budget.fundingsource')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls ">
                                                <MultiSelect
                                                    name="fundingSourceId"
                                                    id="fundingSourceId"
                                                    bsSize="sm"
                                                    value={this.state.fundingSourceValues}
                                                    onChange={(e) => { this.handleFundingSourceChange(e) }}
                                                    options={fundingSourceList && fundingSourceList.length > 0 ? fundingSourceList : []}
                                                    disabled={this.state.loading}
                                                    overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                                                    selectSomeItems: i18n.t('static.common.select')}}
                                                />
                                            </div>
                                        </FormGroup>
                                        <FormGroup id="fundingSourceTypeDiv" className="col-md-3" style={{ zIndex: "1" }} >
                                            <Label htmlFor="fundingSourceTypeId">{i18n.t('static.funderTypeHead.funderType')}</Label>
                                            <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                                            <div className="controls">
                                                <MultiSelect
                                                    name="fundingSourceTypeId"
                                                    id="fundingSourceTypeId"
                                                    bsSize="md"
                                                    value={this.state.fundingSourceTypeValues}
                                                    onChange={(e) => { this.handleFundingSourceTypeChange(e) }}
                                                    options={fundingSourceTypeList && fundingSourceTypeList.length > 0 ? fundingSourceTypeList : []}
                                                    disabled={this.state.loading}
                                                />
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
                                                        onChange={(e) => { this.fetchData() }}
                                                    >
                                                        <option value="true">{i18n.t('static.program.yes')}</option>
                                                        <option value="false">{i18n.t('static.program.no')}</option>
                                                    </Input>
                                                </InputGroup>
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
                                                        onChange={(e) => { this.fetchData() }}
                                                    >
                                                        <option value="true">{i18n.t('static.program.yes')}</option>
                                                        <option value="false">{i18n.t('static.program.no')}</option>
                                                    </Input>
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                    </div>
                                </div>
                            </Form>
                            <div style={{ display: this.state.loading ? "none" : "block" }}>
                                <Col md="12 pl-0">
                                    <div className="row grid-divider">
                                        {this.state.countryShipmentSplitList.length > 0 &&
                                            <div className="col-md-6">
                                                <div className="chart-wrapper chart-graph-report">
                                                    <Bar id="cool-canvas1" data={bar} options={options} />
                                                </div>
                                            </div>
                                        }
                                        {this.state.dateSplitList.length > 0 &&
                                            <div className="col-md-6">
                                                <div className="chart-wrapper chart-graph-report">
                                                    <Bar id="cool-canvas2" data={bar1} options={this.state.viewby == 1 ? options1 : this.state.viewby == 2 ? options2 : this.state.viewby == 3 ? options3 : options4} />
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </Col>
                                <Col md="12 pl-0">
                                    <div className="globalviwe-scroll">
                                        <div className="row">
                                            <div className="col-md-12">
                                                {this.state.table1Body.length > 0 &&
                                                    <div className="table-responsive ">
                                                        <Table id="mytable1" responsive className="table-striped  table-fixed table-bordered text-center mt-2">
                                                            <thead>
                                                                <tr>
                                                                    {
                                                                        this.state.table1Headers.map((item, idx) =>
                                                                            <th id="addr0" key={idx} className="text-center" style={{ width: '350px' }}>
                                                                                {this.state.table1Headers[idx]}
                                                                            </th>
                                                                        )
                                                                    }
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    this.state.table1Body.map((item, idx) =>
                                                                        <tr id="addr0" key={idx} >
                                                                            <td>{getLabelText(this.state.table1Body[idx].country.label, this.state.lang)}</td>
                                                                            {
                                                                                this.state.table1Body[idx].amount.map((item, idx1) =>
                                                                                    <td id="addr1" key={idx1}>
                                                                                        {this.state.table1Body[idx].amount[idx1].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}
                                                                                    </td>
                                                                                )
                                                                            }
                                                                        </tr>
                                                                    )}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                }
                                                {this.state.shipmentList.length > 0 &&
                                                    <div className="table-responsive ">
                                                        <Table id="mytable2" responsive className="table-striped  table-fixed table-bordered text-center mt-2">
                                                            <thead>
                                                                <tr>
                                                                    <th className="text-center" style={{ width: '350px' }}> {i18n.t('static.dashboard.months')} </th>
                                                                    <th className="text-center " style={{ width: '350px' }}> {i18n.t('static.program.realmcountry')} </th>
                                                                    <th className="text-center" style={{ width: '350px' }}>{i18n.t('static.supplyPlan.amountInUSD')}</th>
                                                                    {
                                                                        this.state.viewby == 1 &&
                                                                        <th className="text-center" style={{ width: '350px' }}>{i18n.t('static.budget.fundingsource')}</th>
                                                                    }
                                                                    {
                                                                        this.state.viewby == 2 &&
                                                                        <th className="text-center" style={{ width: '350px' }}>{i18n.t('static.procurementagent.procurementagent')}</th>
                                                                    }
                                                                    {
                                                                        this.state.viewby == 3 &&
                                                                        <th className="text-center" style={{ width: '350px' }}>{i18n.t('static.dashboard.procurementagentType')}</th>
                                                                    }
                                                                    {
                                                                        this.state.viewby == 4 &&
                                                                        <th className="text-center" style={{ width: '350px' }}>{i18n.t('static.funderTypeHead.funderType')}</th>
                                                                    }
                                                                    <th className="text-center" style={{ width: '350px' }}>{i18n.t('static.common.status')}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    this.state.shipmentList.map((item, idx) =>
                                                                        <tr id="addr0" key={idx} >
                                                                            <td>{moment(this.state.shipmentList[idx].transDate, 'YYYY-MM-dd').format('MMM YYYY')}</td>
                                                                            <td>{getLabelText(this.state.shipmentList[idx].country.label, this.state.lang)}</td>
                                                                            <td>{this.state.shipmentList[idx].amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                                            <td>{getLabelText(this.state.shipmentList[idx].fundingSourceProcurementAgent.label, this.state.lang)}</td>
                                                                            <td>{getLabelText(this.state.shipmentList[idx].shipmentStatus.label, this.state.lang)}</td>
                                                                        </tr>
                                                                    )}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </Col>
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
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default ShipmentGlobalView;