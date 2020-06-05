import React, { Component, lazy } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png'
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import RealmCountryService from '../../api/RealmCountryService';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import ReportService from '../../api/ReportService';
import {
    Button, Card, CardBody, CardHeader, Col, Row, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import ProgramService from '../../api/ProgramService';

const options = {
    title: {
        display: true,
        text: i18n.t('static.dashboard.stockstatusovertime')
    },
    scales: {
        yAxes: [
            {
                scaleLabel: {
                    display: true,
                    labelString: i18n.t('static.report.mos')
                },
                ticks: {
                    beginAtZero: true,
                    Max: 900
                }
            }
        ]
    },
    tooltips: {
        mode: 'index',
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            usePointStyle: true,
        }
    }
}


class StockStatusOverTime extends Component {

    constructor(props) {
        super(props);

        this.state = {
            matricsList: [],
            dropdownOpen: false,
            radioSelected: 2,
            productCategories: [],
            planningUnits: [],
            countries: [],
            programs: [],
            planningUnitValues: [],
            planningUnitLabels: [],
            countryValues: [],
            countryLabels: [],
            programValues: [],
            programLabels: [],
            planningUnitlines: [],
            lineData: [],
            lineDates: [],
            planningUnitMatrix: {
                date: []
            },
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



        }


        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getCountrylist = this.getCountrylist.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this)
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.handlePlanningUnitChange = this.handlePlanningUnitChange.bind(this)
        this.getPrograms = this.getPrograms.bind(this);
        this.handleChangeProgram = this.handleChangeProgram.bind(this)
    }
    roundN = num => {
        return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
    }
    handlePlanningUnitChange(planningUnitIds) {


        var planningUnitIdArray = [];
        var planningUnitLabel = [];
        planningUnitIdArray = planningUnitIds.map(ele => ele.value)
        planningUnitLabel = planningUnitIds.map(ele => ele.label)
        /* for (var i = 0; i < planningUnitIds.length; i++) {
           planningUnitIdArray[i] = planningUnitIds[i].value;
           planningUnitLabel[i] = planningUnitIds[i].label
     
         }*/

        this.setState({
            planningUnitValues: planningUnitIds.map(ele => ele.value),
            planningUnitLabels: planningUnitIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })


    }
    handleChangeProgram(programIds) {

        this.setState({
            programValues: programIds.map(ele => ele.value),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            this.fetchData()
        })

    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        this.getPrograms()
        this.getProductCategories()
    }

    show() {
    }
    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value })
        this.fetchData();
    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    getCountrylist() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        RealmCountryService.getRealmCountryrealmIdById(realmId)
            .then(response => {
                this.setState({
                    countries: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        countries: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }

    getPrograms() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProgramService.getProgramByRealmId(realmId)
            .then(response => {
                // console.log(JSON.stringify(response.data))
                this.setState({
                    programs: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        programs: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.program') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }

    getProductCategories() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                //  console.log(JSON.stringify(response.data))
                this.setState({
                    productCategories: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        productCategories: []
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.productcategory') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
    getPlanningUnit() {
        AuthenticationService.setupAxiosInterceptors();
        let productCategoryId = document.getElementById("productCategoryId").value;
        PlanningUnitService.getPlanningUnitByProductCategoryId(productCategoryId).then(response => {
            // console.log('**' + JSON.stringify(response.data))
            this.setState({
                planningUnits: response.data,
            })
        })
            .catch(
                error => {
                    this.setState({
                        planningUnits: [],
                    })
                    if (error.message === "Network Error") {
                        this.setState({ message: error.message });
                    } else {
                        switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                                this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
    fetchData() {
        let productCategoryId = document.getElementById("productCategoryId").value;
        let planningUnitIds = this.state.planningUnitValues;
        let programIds = this.state.programValues
        let startDate = this.state.rangeValue.from.year + '-' + this.state.rangeValue.from.month + '-01';
        let stopDate = this.state.rangeValue.to.year + '-' + this.state.rangeValue.to.month + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate();

        var programAndPlanningUnitList = (programIds.flatMap(d => planningUnitIds.map(v => ({ "programId": d, "planningUnitId": v }))));
        if (planningUnitIds.length > 0 && programIds.length > 0) {

            var input = {
                "programAndPlanningUnitList": programAndPlanningUnitList,
                "mosPast": document.getElementById("mosPast").selectedOptions[0].value == 0 ? null : document.getElementById("mosPast").selectedOptions[0].value,
                "mosFuture": document.getElementById("mosFuture").selectedOptions[0].value == 0 ? null : document.getElementById("mosFuture").selectedOptions[0].value,
                "startDate": startDate,
                "stopDate": stopDate
            }

            /*var inputjson={
            "realmCountryIds":CountryIds,"programIds":programIds,"planningUnitIds":planningUnitIds,"startDate": startDate
           }*/
            AuthenticationService.setupAxiosInterceptors();

            ReportService.getStockOverTime(input)
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    var lineData = [];
                    var lineDates = [];
                    var planningUnitlines = [];
                    for (var i = 0; i < response.data.length; i++) {
                        lineData[i] = response.data[i].map(ele => (ele.mos))
                    }
                    lineDates = response.data[0].map(ele => (ele.dt))
                    planningUnitlines = response.data.map(ele1 => [...new Set(ele1.map(ele => (getLabelText(ele.program.label, this.state.lang)+'-'+getLabelText(ele.planningUnit.label, this.state.lang))))])

                    this.setState({
                        matricsList: response.data,
                        message: '',
                        planningUnitlines: planningUnitlines,
                        lineData: lineData,
                        lineDates: lineDates
                    }, () => {
                        console.log('##' + JSON.stringify(this.state.lineData[0] + this.state.planningUnitlines))
                    })
                }).catch(
                    error => {
                        this.setState({
                            consumptions: []
                        })

                        if (error.message === "Network Error") {
                            this.setState({ message: error.message });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 500:
                                case 401:
                                case 404:
                                case 406:
                                case 412:
                                    this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );
        } else if (programIds.length == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), consumptions: [] });

        } else if (productCategoryId == -1) {
            this.setState({ message: i18n.t('static.common.selectProductCategory'), consumptions: [] });

        } else {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), consumptions: [] });

        }

        
    }


    exportCSV() {

        var csvRow = [];
        csvRow.push((i18n.t('static.report.dateRange') + ' : ' + this.state.rangeValue.from.month + '/' + this.state.rangeValue.from.year + ' to ' + this.state.rangeValue.to.month + '/' + this.state.rangeValue.to.year).replaceAll(' ', '%20'))
        this.state.programLabels.map(ele => csvRow.push(i18n.t('static.program.program') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push((i18n.t('static.dashboard.productcategory')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("productCategoryId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.report.mospast')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("mosPast").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.report.mosfuture')).replaceAll(' ', '%20') + ' , ' + ((document.getElementById("mosFuture").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        this.state.planningUnitLabels.map(ele =>
            csvRow.push((i18n.t('static.planningunit.planningunit')).replaceAll(' ', '%20') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push('')
        csvRow.push('')
        var re;

        var A = [[i18n.t('static.report.month'),i18n.t('static.program.program'), i18n.t('static.planningunit.planningunit'), i18n.t('static.report.stock'), i18n.t('static.report.consupmtionqty'), i18n.t('static.report.amc'), i18n.t('static.report.noofmonth'), i18n.t('static.report.mos')]]


        this.state.matricsList.map(ele => ele.map(elt => A.push([elt.dt,((getLabelText(elt.program.label,this.state.lang)).replaceAll(',', '%20')).replaceAll(' ', '%20'), ((getLabelText(elt.planningUnit.label,this.state.lang)).replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.stock, elt.consumptionQty, this.roundN(elt.amc), elt.amcMonthCount, this.roundN(elt.mos)])));


        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.dashboard.stockstatusovertime') + '_' + this.state.rangeValue.from.year + this.state.rangeValue.from.month + i18n.t('static.report.consumptionTo') + this.state.rangeValue.to.year + this.state.rangeValue.to.month + ".csv"
        document.body.appendChild(a)
        a.click()
    }






    exportPDF = () => {
        const addFooters = doc => {

            const pageCount = doc.internal.getNumberOfPages()

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            for (var i = 1; i <= pageCount; i++) {
                doc.setPage(i)

                doc.setPage(i)
                doc.text('Page ' + String(i) + ' of ' + String(pageCount), doc.internal.pageSize.width / 9, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })
                doc.text('Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()
            doc.setFont('helvetica', 'bold')

            // var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
            // var reader = new FileReader();

            //var data='';
            // Use fs.readFile() method to read the file 
            //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
            //}); 
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 200, 50, 'FAST');
                /*doc.addImage(data, 10, 30, {
                align: 'justify'
                });*/
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.stockstatusovertimeReport'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.state.rangeValue.from.month + '/' + this.state.rangeValue.from.year + ' to ' + this.state.rangeValue.to.month + '/' + this.state.rangeValue.to.year, doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    var planningText = doc.splitTextToSize((i18n.t('static.program.program') + ' : ' + this.state.programLabels.toString()), doc.internal.pageSize.width * 3 / 4);

                    doc.text(doc.internal.pageSize.width / 8, 110, planningText)

                    doc.text(i18n.t('static.productcategory.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.mospast') + ' : ' + document.getElementById("mosPast").selectedOptions[0].text, doc.internal.pageSize.width / 8, 140, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.mosfuture') + ' : ' + document.getElementById("mosFuture").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
                        align: 'left'
                    })
                    planningText = doc.splitTextToSize((i18n.t('static.planningunit.planningunit') + ' : ' + this.state.planningUnitLabels.toString()), doc.internal.pageSize.width * 3 / 4);

                    doc.text(doc.internal.pageSize.width / 8, 160, planningText)
                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        const title = "Consumption Report";
        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);

        // doc.addImage(canvasImg, 'png', 50, 130, aspectwidth1, height * 2 / 3);
        doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');

        const headers = [[i18n.t('static.report.month'), i18n.t('static.program.program'), i18n.t('static.planningunit.planningunit'), i18n.t('static.report.stock'), i18n.t('static.report.consupmtionqty'), i18n.t('static.report.amc'), i18n.t('static.report.noofmonth'), i18n.t('static.report.mos')]];

        const data = [];
        this.state.matricsList.map(ele => ele.map(elt => data.push([elt.dt,getLabelText(elt.program.label,this.state.lang),getLabelText(elt.planningUnit.label,this.state.lang), elt.stock, elt.consumptionQty, this.roundN(elt.amc), elt.amcMonthCount, this.roundN(elt.mos)])));

        let content = {
            margin: { top: 80 },
            startY: height,
            head: headers,
            body: data,
            styles: { lineWidth: 1, fontSize: 8 }

        };


        //doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save("StockStatusOverTime.pdf")
        //creates PDF from img
        /* var doc = new jsPDF('landscape');
        doc.setFontSize(20);
        doc.text(15, 15, "Cool Chart");
        doc.save('canvas.pdf');*/
    }



    render() {
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return ({ label: getLabelText(item.label, this.state.lang), value: item.planningUnitId })

            }, this);
        const { programs } = this.state;
        let programList = [];
        programList = programs.length > 0
            && programs.map((item, i) => {
                return (

                    { label: getLabelText(item.label, this.state.lang), value: item.programId }

                )
            }, this);
        const { productCategories } = this.state;
        let productCategoryList = productCategories.length > 0
            && productCategories.map((item, i) => {
                return (
                    <option key={i} value={item.payload.productCategoryId}>
                        {getLabelText(item.payload.label, this.state.lang)}
                    </option>
                )
            }, this);
        const getRandomColor = () => {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        console.log(this.state.lineData)
        const bar = {
            labels: this.state.lineDates,
            datasets: this.state.planningUnitlines.map((item, index) => ({ type: "line", pointStyle: 'line', lineTension: 0.8, backgroundColor: 'transparent', label: item, data: this.state.lineData[index], borderColor: getRandomColor() }))
            /*  [
             {
                   type: "line",
                   label: "MOS past 3",
                   backgroundColor: 'transparent',
                   borderColor: '#ffc107',
                   lineTension: 0,
                   showActualPercentages: true,
                   showInLegend: true,
                   pointStyle: 'line',

                   data: this.state.matricsList.map((item, index) => (item.MOS_pass3))
               },
               {
                   type: "line",
                   label: "MOS P+F",
                   backgroundColor: 'transparent',
                   borderColor: '#4dbd74',
                   lineTension: 0,
                   showActualPercentages: true,
                   showInLegend: true,
                   pointStyle: 'line',

                   data: this.state.matricsList.map((item, index) => (item.MOS_PF))
               },
               {
                   type: "line",
                   label: "MOS Future 3",
                   backgroundColor: 'transparent',
                   borderColor: '#ed5626',
                   lineTension: 0,
                   showActualPercentages: true,
                   showInLegend: true,
                   pointStyle: 'line',

                   data: this.state.matricsList.map((item, index) => (item.MOS_Feature3))
               }
           ]*/
        }


        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }


        return (
            <div className="animated fadeIn" >
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5>{i18n.t(this.state.message)}</h5>
                <Card>
                    <CardHeader className="pb-1">
                        <i className="icon-menu"></i><strong>{i18n.t('static.report.stockstatusovertimeReport')}</strong>
                        {
                            this.state.matricsList.length > 0 &&
                            <div className="card-header-actions">
                            <a className="card-header-action">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />

                                {/* <Pdf targetRef={ref} filename={i18n.t('static.report.consumptionpdfname')}>
 
 {({ toPdf }) =>
 <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => toPdf()} />

 }
 </Pdf>*/}
                            </a>
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                        </div>
                        }
                    </CardHeader>
                    <CardBody>

                        <div>
                            <Form >
                                <Col md="12 pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.dateRange')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                            <div className="controls edit">

                                                <Picker
                                                    ref="pickRange"
                                                    years={{ min: 2013 }}
                                                    value={rangeValue}
                                                    lang={pickerLang}
                                                    //theme="light"
                                                    onChange={this.handleRangeChange}
                                                    onDismiss={this.handleRangeDissmis}
                                                >
                                                    <MonthBox value={makeText(rangeValue.from) + ' ~ ' + makeText(rangeValue.to)} onClick={this._handleClickRangeBox} />
                                                </Picker>
                                            </div>

                                        </FormGroup>

                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="programIds">{i18n.t('static.program.program')}<span className="red Reqasterisk">*</span></Label>
                                            <InputGroup>
                                                <ReactMultiSelectCheckboxes

                                                    bsSize="sm"
                                                    name="programIds"
                                                    id="programIds"
                                                    onChange={(e) => { this.handleChangeProgram(e) }}
                                                    options={programList && programList.length > 0 ? programList : []}
                                                />
                                                {!!this.props.error &&
                                                    this.props.touched && (
                                                        <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                                                    )}
                                            </InputGroup>
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
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {productCategoryList}
                                                    </Input>
                                                </InputGroup></div>
                                        </FormGroup>
                                        <FormGroup className="col-sm-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                            <div className="controls">
                                                <InputGroup>   <ReactMultiSelectCheckboxes
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="md"
                                                    onChange={(e) => { this.handlePlanningUnitChange(e) }}
                                                    options={planningUnitList && planningUnitList.length > 0 ? planningUnitList : []}
                                                /> </InputGroup>    </div></FormGroup>
                                        <FormGroup className="col-sm-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.mospast')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="mosPast"
                                                        id="mosPast"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}
                                                    >
                                                        <option value="0">-</option>
                                                        <option value="1">{1}</option>
                                                        <option value="2">{2}</option>
                                                        <option value="3">{3}</option>
                                                        <option value="4">{4}</option>
                                                        <option value="5">{5}</option>
                                                        <option value="6">{6}</option>
                                                        <option value="7">{7}</option>
                                                        <option value="8">{8}</option>
                                                        <option value="9">{9}</option>
                                                        <option value="10">10}</option>
                                                        <option value="11">{11}</option>
                                                        <option value="12">{12}</option>
                                                    </Input></InputGroup></div>

                                        </FormGroup>
                                        <FormGroup className="col-sm-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.report.mosfuture')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="mosFuture"
                                                        id="mosFuture"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}
                                                    >
                                                        <option value="0">-</option>
                                                        <option value="1">{1}</option>
                                                        <option value="2">{2}</option>
                                                        <option value="3">{3}</option>
                                                        <option value="4">{4}</option>
                                                        <option value="5">{5}</option>
                                                        <option value="6">{6}</option>
                                                        <option value="7">{7}</option>
                                                        <option value="8">{8}</option>
                                                        <option value="9">{9}</option>
                                                        <option value="10">10}</option>
                                                        <option value="11">{11}</option>
                                                        <option value="12">{12}</option>
                                                    </Input></InputGroup></div>

                                        </FormGroup>

                                    </div>
                                </Col>
                            </Form>
                        </div>
                        <div className="row">
                            <div className="col-md-12">{this.state.matricsList.length > 0}
                                {
                                    (this.state.matricsList.length > 0 )
                                    &&

                                    <div className="col-md-12">
                                        <div className="chart-wrapper chart-graph-report">
                                            <Line id="cool-canvas" data={bar} options={options} />

                                        </div>
                                    </div>

                                }
                                <br></br>
                            </div></div>
                    </CardBody></Card>
            </div>


        );

    }

}



export default StockStatusOverTime
