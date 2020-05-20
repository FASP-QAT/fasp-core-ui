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
import {
    Button, Card, CardBody, CardHeader, Col, Row, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';

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
                    labelString: i18n.t('static.report.stock')
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
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



        };


        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getCountrylist = this.getCountrylist.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this)
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
        this.fetchData = this.fetchData.bind(this);
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        this.getCountrylist();
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


    getProductCategories() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProductService.getProductCategoryList(realmId)
            .then(response => {
                console.log(JSON.stringify(response.data))
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
            console.log('**' + JSON.stringify(response.data))
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
        this.setState({
            matricsList: [{ date: '04-2019', MOS_pass3: 3100, MOS_PF: 45000, MOS_Feature3: 20000 },
            { date: '04-2019', MOS_pass3: 43000, MOS_PF: 47000, MOS_Feature3: 35000 },
            { date: '04-2019', MOS_pass3: 13000, MOS_PF: 25000, MOS_Feature3: 3000 }]
        })
    }



    exportCSV() {

        var csvRow = [];
        csvRow.push((i18n.t('static.report.dateRange') + ' : ' + this.state.rangeValue.from.month + '/' + this.state.rangeValue.from.year + ' to ' + this.state.rangeValue.to.month + '/' + this.state.rangeValue.to.year).replaceAll(' ', '%20'))
        csvRow.push(i18n.t('static.planningunit.planningunit') + ' : ' + ((document.getElementById("planningUnitId").selectedOptions[0].text).replaceAll(',', '%20')).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        var re;

        var A = [[i18n.t('static.dashboard.country')].concat(this.state.matricsList.date)]

        re = this.state.matricsList.countryData

        for (var item = 0; item < re.length; item++) {
            A.push([[re[item].label].concat(re[item].value)])
        }
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

            //  var file = new File('QAT-logo.png','../../../assets/img/QAT-logo.png');
            // var reader = new FileReader();

            //var data='';
            // Use fs.readFile() method to read the file 
            //fs.readFile('../../assets/img/logo.svg', 'utf8', function(err, data){ 
            //}); 
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(18)
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
                    doc.setFontSize(12)
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.state.rangeValue.from.month + '/' + this.state.rangeValue.from.year + ' to ' + this.state.rangeValue.to.month + '/' + this.state.rangeValue.to.year, doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })

                    doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(15);

        const title = "Consumption Report";
        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);

        doc.addImage(canvasImg, 'png', 50, 130, aspectwidth1, height * 2 / 3);
        /*  
          const headers =[ [   i18n.t('static.report.consumptionDate'),
          i18n.t('static.report.forecastConsumption'),
          i18n.t('static.report.actualConsumption')]];
          const data =  navigator.onLine? this.state.consumptions.map( elt =>[ elt.consumption_date,elt.forcast,elt.Actual]):this.state.finalOfflineConsumption.map( elt =>[ elt.consumption_date,elt.forcast,elt.Actual]);
          
          let content = {
          margin: {top: 80},
          startY:  height,
          head: headers,
          body: data,
          
        };
        
         
          //doc.text(title, marginLeft, 40);
          doc.autoTable(content);*/
        addHeaders(doc)
        addFooters(doc)
        doc.save("report.pdf")
        //creates PDF from img
        /*  var doc = new jsPDF('landscape');
          doc.setFontSize(20);
          doc.text(15, 15, "Cool Chart");
          doc.save('canvas.pdf');*/
    }

    handleChange(countrysId) {

        var countryIdArray = [];
        for (var i = 0; i < countrysId.length; i++) {
            countryIdArray[i] = countrysId[i].value;

        }
        console.log(countryIdArray);
        this.setState({
            countryValues: countryIdArray
        })
    }



    render() {
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnitId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { countries } = this.state;
        // console.log(JSON.stringify(countrys))
        let countryList = countries.length > 0 && countries.map((item, i) => {
            console.log(JSON.stringify(item))
            return ({ label: getLabelText(item.country.label, this.state.lang), value: item.country.countryId })
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


        const bar = {
            labels: this.state.matricsList.map((item, index) => (item.date)),
            datasets: [
                {
                    type: "line",
                    label: "MOS pass 3",
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
                    label: "MOS Feature 3",
                    backgroundColor: 'transparent',
                    borderColor: '#ffc107',
                    lineTension: 0,
                    showActualPercentages: true,
                    showInLegend: true,
                    pointStyle: 'line',

                    data: this.state.matricsList.map((item, index) => (item.MOS_Feature3))
                }
            ]
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
                <Row>
                    <Col md="12">
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
                                <div className="" >
                                    <div className="container">
                                        <div >
                                            <div className="col-md-12" >
                                                <Form >
                                                    <Col>
                                                        <div className="row">
                                                            <FormGroup className="col-sm-3">
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
                                                            <FormGroup className="col-sm-3">
                                                                <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}<span className="red Reqasterisk">*</span></Label>
                                                                <InputGroup>
                                                                <ReactMultiSelectCheckboxes
                                                                    bsSize="md"
                                                                    name="countrysId"
                                                                    id="countrysId"
                                                                    onChange={(e) => { this.handleChange(e); this.fetchData() }}
                                                                    options={countryList}
                                                                />
                                                                </InputGroup>
                                                                {!!this.props.error &&
                                                                    this.props.touched && (
                                                                        <div style={{ color: 'red', marginTop: '.5rem' }}>{this.props.error}</div>
                                                                    )}</FormGroup>

                                                            <FormGroup className="col-sm-3">
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
                                                                    <InputGroup>
                                                                        <Input
                                                                            type="select"
                                                                            name="planningUnitId"
                                                                            id="planningUnitId"
                                                                            bsSize="sm"
                                                                            onChange={this.fetchData}
                                                                        >
                                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                                            {planningUnitList}
                                                                        </Input>
                                                                        {/* <InputGroupAddon addonType="append">
                                                                        <Button color="secondary Gobtn btn-sm" onClick={this.fetchData}>{i18n.t('static.common.go')}</Button>
                                                                    </InputGroupAddon> */}
                                                                    </InputGroup>
                                                                </div>
                                                            </FormGroup>

                                                        </div>
                                                    </Col>
                                                </Form>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    {
                                                        this.state.matricsList.length > 0
                                                        &&
                                                        <div className="col-md-12">
                                                            <div className="col-md-9">
                                                                <div className="chart-wrapper chart-graph">
                                                                    <Line id="cool-canvas" data={bar} options={options} />

                                                                </div>
                                                            </div>

                                                        </div>}
                                                    <br></br>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>



            </div>

        );

    }

}



export default StockStatusOverTime