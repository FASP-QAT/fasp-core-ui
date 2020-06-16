import React, { Component } from 'react';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import Picker from 'react-month-picker'
import i18n from '../../i18n'
import MonthBox from '../../CommonComponent/MonthBox.js'
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProductService from '../../api/ProductService';
import ProgramService from '../../api/ProgramService';
import ShipmentStatusService from '../../api/ShipmentStatusService';
import ProcurementAgentService from '../../api/ProcurementAgentService';
import FundingSourceService from '../../api/FundingSourceService';
import moment from "moment";
import {
    Card,
    CardBody,
    // CardFooter,
    CardHeader,
    Col,
    Row,
    Table, FormGroup, Input, InputGroup, InputGroupAddon, Label, Form
} from 'reactstrap';
import ReportService from '../../api/ReportService';

const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}
class AnnualShipmentCost extends Component {
    constructor(props) {
        super(props);

        this.state = {
            matricsList: [],
            dropdownOpen: false,
            radioSelected: 2,
            productCategories: [],
            planningUnits: [],
            categories: [],
            countries: [],
            procurementAgents: [],
            shipmentStatuses: [],
            fundingSources: [],
            show: false,
            programs: [],
            rangeValue: { from: { year: new Date().getFullYear() - 1, month: new Date().getMonth() + 1 }, to: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 } },



        };
        this.fetchData = this.fetchData.bind(this);
        this._handleClickRangeBox = this._handleClickRangeBox.bind(this)
        this.handleRangeChange = this.handleRangeChange.bind(this);
        this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
        this.getPlanningUnit = this.getPlanningUnit.bind(this);
        this.getProductCategories = this.getProductCategories.bind(this)
        this.getPrograms = this.getPrograms.bind(this);
        this.getProcurementAgentList = this.getProcurementAgentList.bind(this);
        this.getFundingSourceList = this.getFundingSourceList.bind(this);
        this.getShipmentStatusList = this.getShipmentStatusList.bind(this);
        //this.pickRange = React.createRef()

    }

    fetchData() {

        let json = {
            "reportbaseValue": (document.getElementById("view").selectedOptions[0].value == 0 ? false : true),
            "programId": document.getElementById("programId").selectedOptions[0].value,
            "planningUnitId": document.getElementById("planningUnitId").selectedOptions[0].value,
            "procurementAgentId": document.getElementById("procurementAgentId").selectedOptions[0].value,
            "fundingSourceId": document.getElementById("fundingSourceId").selectedOptions[0].value,
            "shipmentStatusId": document.getElementById("shipmentStatusId").selectedOptions[0].value,
            "startDate": this.state.rangeValue.from.year + '-' + ("00" + this.state.rangeValue.from.month).substr(-2) + '-01',
            "stopDate": this.state.rangeValue.to.year + '-' + ("00" + this.state.rangeValue.to.month).substr(-2) + '-' + new Date(this.state.rangeValue.to.year, this.state.rangeValue.to.month, 0).getDate()
        }
        if (document.getElementById("programId").selectedOptions[0].text == 0) {
            this.setState({
                matricsList: [],
                message: i18n.t('static.common.selectProgram')
            })

        } else if (document.getElementById("productCategoryId").selectedOptions[0].text == 0) {
            this.setState({
                matricsList: [],
                message: i18n.t('static.common.selectProductCategory')
            })

        } else if (document.getElementById("planningUnitId").selectedOptions[0].text == 0) {
            this.setState({
                matricsList: [],
                message: i18n.t('static.procurementUnit.validPlanningUnitText')
            })
        } else {
            AuthenticationService.setupAxiosInterceptors();
            ReportService.getAnnualShipmentCost(json)
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    this.setState({
                        matricsList: response.data
                    })
                }).catch(
                    error => {
                        this.setState({
                            matricsList: []
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
    }

    getPrograms() {
        AuthenticationService.setupAxiosInterceptors();
        let realmId = AuthenticationService.getRealmId();
        ProgramService.getProgramByRealmId(realmId)
            .then(response => {
                console.log(JSON.stringify(response.data))
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

    show() {
        /* if (!this.state.showed) {
             setTimeout(() => {this.state.closeable = true}, 250)
             this.setState({ showed: true })
         }*/
    }
    handleRangeChange(value, text, listIndex) {
        //
    }
    handleRangeDissmis(value) {
        this.setState({ rangeValue: value }, () => {
            this.fetchData();
        })

    }

    _handleClickRangeBox(e) {
        this.refs.pickRange.show()
    }

    initalisedoc = () => {
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

            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(18)
                doc.setPage(i)

                doc.addImage(LOGO, 'png', 0, 10, 180, 50, '', 'FAST');

                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.annualshipmentcost'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(7)
                    var splittext = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8);

                    doc.text(doc.internal.pageSize.width / 8, 70, splittext)
                    splittext = doc.splitTextToSize('Run Date:' + moment(new Date()).format('DD-MMM-YY') + '\n Run Time:' + moment(new Date()).format('hh:mm A'), doc.internal.pageSize.width / 8);

                    doc.text(doc.internal.pageSize.width * 3 / 4, 70, splittext)
                    doc.setFontSize(8)
                    doc.text('Cost of product + Freight', doc.internal.pageSize.width / 2, 80, {
                        align: 'center'
                    })
                    doc.text(i18n.t('static.report.dateRange') + ' : ' + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to), doc.internal.pageSize.width / 2, 90, {
                        align: 'center'
                    })
                    doc.text(i18n.t('static.dashboard.productcategory') + ' : ' + document.getElementById("productCategoryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.procurementagent.procurementagent') + ' : ' + document.getElementById("procurementAgentId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 120, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.dashboard.fundingsource') + ' : ' + document.getElementById("fundingSourceId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.planningunit.planningunit') + ' : ' + document.getElementById("planningUnitId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 140, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.common.status') + ' : ' + document.getElementById("shipmentStatusId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 150, {
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

        doc.setFontSize(9);
        doc.setTextColor("#002f6c");
        doc.setFont('helvetica', 'bold')
        doc.text(i18n.t('static.procurementagent.procurementagent'), doc.internal.pageSize.width / 8, 180, {
            align: 'left'
        })
        doc.text(i18n.t(i18n.t('static.fundingsource.fundingsource')), doc.internal.pageSize.width / 8, 190, {
            align: 'left'
        })
        doc.text(i18n.t('static.planningunit.planningunit'), doc.internal.pageSize.width / 8, 200, {
            align: 'left'
        })
        doc.line(50, 210, doc.internal.pageSize.width - 50, 210);
        var year = [];
        for (var from = this.state.rangeValue.from.year, to = this.state.rangeValue.to.year; from <= to; from++)
            year.push(from);
        // var year = ['2019', '2020']//[...new Set(this.state.matricsList.map(ele=>(ele.YEAR)))]//;
         var data =this.state.matricsList;
        //  var data= [{2019: 17234, 2020: 0, PROCUREMENT_AGENT_ID: 1, FUNDING_SOURCE_ID: 1, PLANNING_UNIT_ID: 1191, fundingsource: "USAID", procurementAgent: "PSM",planningUnit: "Ceftriaxone 1 gm Powder Vial, 50"},
        // {2019: 17234, 2020: 0, PROCUREMENT_AGENT_ID: 1, FUNDING_SOURCE_ID: 1, PLANNING_UNIT_ID: 1191, fundingsource: "USAID", procurementAgent: "PSM",planningUnit: "Ceftriaxone 1 gm Powder Vial, 50"},
        // {2019: 17234, 2020: 0, PROCUREMENT_AGENT_ID: 2, FUNDING_SOURCE_ID: 1, PLANNING_UNIT_ID: 1191, fundingsource: "USAID", procurementAgent: "PSM",planningUnit: "Ceftriaxone 1 gm Powder Vial, 50"}      ]
        //this.state.matricsList;//[['GHSC-PSM \n PEPFAR \nplanning unit 1', 200000, 300000], ['PPM \nGF \n planning unit 1', 15826, 2778993]]
        var index = doc.internal.pageSize.width / (year.length + 3);
        var initalvalue = index + 10
        for (var i = 0; i < year.length; i++) {
            initalvalue = initalvalue + index
            doc.text(year[i].toString(), initalvalue, 180, {
                align: 'left'
            })
        }
        initalvalue += index
        doc.text('Total', initalvalue, 180, {
            align: 'left'
        })
        initalvalue = 10
        var yindex = 250
        var totalAmount = []
        var GrandTotalAmount=[]
        for (var j = 0; j < data.length; j++) {
           if( yindex> doc.internal.pageSize.height-50){doc.addPage();yindex=90}else{yindex=yindex}
            var record = data[j]

            var keys = Object.entries(record).map(([key, value]) => (key)
            )

            var values = Object.entries(record).map(([key, value]) => (value)
            )
            var total = 0
            var splittext = doc.splitTextToSize(record.procurementAgent + '\n' + record.fundingsource + '\n' + record.planningUnit, index);

            doc.text(doc.internal.pageSize.width / 8,  yindex, splittext)
            initalvalue=initalvalue+index
            for (var x = 0; x < year.length; x++){
                for (var n = 0; n < keys.length; n++) {
                    if (year[x] == keys[n]) {
                        total = total + values[n]
                        initalvalue=initalvalue+index
                        totalAmount[x] = totalAmount[x] == null ? values[n] : totalAmount[x] + values[n]
                        GrandTotalAmount[x] = GrandTotalAmount[x] == null ? values[n] : GrandTotalAmount[x] + values[n]
                        doc.text(values[n].toString(), initalvalue, yindex, {
                            align: 'left'
                        })
                    }
                }
            }
            doc.text(total.toString(), initalvalue + index, yindex, {
                align: 'left'
            });
            totalAmount[year.length] = totalAmount[x] == null ? total : totalAmount[year.length] +total
            GrandTotalAmount[year.length] = GrandTotalAmount[year.length] == null ? total : GrandTotalAmount[year.length] + total
            if(j<data.length-1){
                if(data[j].PROCUREMENT_AGENT_ID!=data[j+1].PROCUREMENT_AGENT_ID ||data[j].FUNDING_SOURCE_ID!=data[j+1].FUNDING_SOURCE_ID  ){
                    yindex = yindex + 40
                    initalvalue = 10
                    doc.setLineDash([2, 2], 0);
                    doc.line(doc.internal.pageSize.width / 8, yindex, doc.internal.pageSize.width - 50, yindex);
                    yindex += 20
                    initalvalue=initalvalue+index
                    doc.text("Total", doc.internal.pageSize.width / 8, yindex, {
                        align: 'left'
                    });
                    var Gtotal = 0
                    for (var l = 0; l < totalAmount.length; l++) {
                        initalvalue += index;
                        Gtotal = Gtotal + totalAmount[l]
                        doc.text(totalAmount[l].toString(), initalvalue, yindex, {
                            align: 'left'
                        })
                        totalAmount[l]=0;
                    } 
                }else{
                    
                }
            }if(j==data.length-1){
                yindex = yindex + 40
                initalvalue = 10
                doc.setLineDash([2, 2], 0);
                doc.line(doc.internal.pageSize.width / 8, yindex, doc.internal.pageSize.width - 50, yindex);
                yindex += 20
                initalvalue=initalvalue+index
                doc.text("Total", doc.internal.pageSize.width / 8, yindex, {
                    align: 'left'
                });
                var Gtotal = 0
                for (var l = 0; l < totalAmount.length; l++) {
                    initalvalue += index;
                    Gtotal = Gtotal + totalAmount[l]
                    doc.text(totalAmount[l].toString(), initalvalue, yindex, {
                        align: 'left'
                    })
                }    
            }
            yindex = yindex + 40
            initalvalue = 10
           
        }
        initalvalue = 10
        initalvalue += index;
        doc.line(doc.internal.pageSize.width / 8, yindex, doc.internal.pageSize.width - 50, yindex);
        yindex += 20
        doc.setFontSize(9);
        doc.text("Grand Total", doc.internal.pageSize.width / 8, yindex, {
            align: 'left'
        });
        var Gtotal = 0
        for (var l = 0; l < GrandTotalAmount.length; l++) {
            initalvalue += index;
            Gtotal = Gtotal + GrandTotalAmount[l]
            doc.text(GrandTotalAmount[l].toString(), initalvalue, yindex, {
                align: 'left'
            })
        }
        doc.text(Gtotal.toString(), initalvalue + index, yindex, {
            align: 'left'
        });
        doc.setFontSize(8);
        

        /* var canvas = document.getElementById("cool-canvas");
         //creates image
         
         var canvasImg = canvas.toDataURL("image/png",1.0);
         var width = doc.internal.pageSize.width;    
         var height = doc.internal.pageSize.height;
         var h1=50;
         var aspectwidth1= (width-h1);*/

        // doc.addHTML(document.getElementById('div_id'), 10, 120);
        addHeaders(doc)
        addFooters(doc)
        doc.autoTable({pagesplit: true})
        return doc;
    }
    exportPDF = () => {
        var doc = this.initalisedoc()
        doc.save("AnnualShipmentCost.pdf")

    }
    previewPDF = () => {
        var doc = this.initalisedoc()
        var string = doc.output('datauristring');
        var embed = "<embed width='100%' height='100%' src='" + string + "'/>"
        document.getElementById("pdf").innerHTML = embed
        /* var x = window.open();
         x.document.open();
         x.document.write(embed);
         x.document.close();*/
    }



    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }
    roundN = num => {
        return parseFloat(Math.round(num * Math.pow(10, 2)) / Math.pow(10, 2)).toFixed(2);
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
        this.fetchData();
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

    getFundingSourceList() {

        AuthenticationService.setupAxiosInterceptors();
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                this.setState({
                    fundingSources: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        countrys: []
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
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.fundingsource.fundingsource') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
    getProcurementAgentList() {

        AuthenticationService.setupAxiosInterceptors();

        ProcurementAgentService.getProcurementAgentListAll()
            .then(response => {
                this.setState({
                    procurementAgents: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        countrys: []
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
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.procurementagent.procurementagent') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
    getShipmentStatusList() {

        AuthenticationService.setupAxiosInterceptors();
        ShipmentStatusService.getShipmentStatusListActive()
            .then(response => {
                this.setState({
                    shipmentStatuses: response.data
                })
            }).catch(
                error => {
                    this.setState({
                        countrys: []
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
                                this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.common.status') }) });
                                break;
                            default:
                                this.setState({ message: 'static.unkownError' });
                                break;
                        }
                    }
                }
            );

    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        this.getPrograms();
        this.getProcurementAgentList()
        this.getFundingSourceList()
        this.getShipmentStatusList()
        this.getProductCategories()
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
            }, this)
        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnitId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        const { procurementAgents } = this.state;
        // console.log(JSON.stringify(countrys))
        let procurementAgentList = procurementAgents.length > 0 && procurementAgents.map((item, i) => {
            console.log(JSON.stringify(item))
            return (
                <option key={i} value={item.procurementAgentId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>

            )
        }, this);
        const { fundingSources } = this.state;
        let fundingSourceList = fundingSources.length > 0 && fundingSources.map((item, i) => {
            console.log(JSON.stringify(item))
            return (
                <option key={i} value={item.fundingSourceId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>

            )
        }, this);
        const { shipmentStatuses } = this.state;
        let shipmentStatusList = shipmentStatuses.length > 0 && shipmentStatuses.map((item, i) => {
            return (
                <option key={i} value={item.shipmentStatusId}>
                    {getLabelText(item.label, this.state.lang)}
                </option>

            )
        }, this);
        const { productCategories } = this.state;
        let productCategoryList = productCategories.length > 0
            && productCategories.map((item, i) => {
                return (
                    <option key={i} value={item.payload.productCategoryId} disabled={item.payload.active ? "" : "disabled"}>
                        {Array(item.level).fill(' ').join('') + (getLabelText(item.payload.label, this.state.lang))}
                    </option>
                )
            }, this);

        const pickerLang = {
            months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
            from: 'From', to: 'To',
        }
        const { rangeValue } = this.state

        const makeText = m => {
            if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
            return '?'
        }



        return (<div className="animated fadeIn" >
            <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>

            <Card>
                <CardHeader className="pb-1">
                    <i className="icon-menu"></i><strong>{i18n.t('static.report.annualshipmentcost')}</strong>
                    <div className="card-header-actions">

                        <a className="card-header-action">

                            {this.state.matricsList.length > 0 && <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />}
                        </a>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="TableCust" >
                        <div ref={ref}>
                            <Form >
                                <Col md="12 pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.common.reportbase')}</Label>
                                            <div className="controls">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="view"
                                                        id="view"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}
                                                    >
                                                        <option value="0">{i18n.t('static.common.shippingdate')}</option>
                                                        <option value="1">{i18n.t('static.common.receivedate')}</option>

                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>
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
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.program.program')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="programId"
                                                        id="programId"
                                                        bsSize="sm"
                                                        onChange={this.getProductCategories}

                                                    >
                                                        <option value="0">{i18n.t('static.common.select')}</option>
                                                        {programList}
                                                    </Input>

                                                </InputGroup>
                                            </div>
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

                                                </InputGroup>
                                            </div>

                                        </FormGroup>
                                        <FormGroup className="col-md-3">
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


                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.procurementagent.procurementagent')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="procurementAgentId"
                                                        id="procurementAgentId"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}

                                                    >
                                                        <option value="-1">{i18n.t('static.common.all')}</option>
                                                        {procurementAgentList}
                                                    </Input>

                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                        <FormGroup className="col-md-3">
                                            <Label htmlFor="appendedInputButton">{i18n.t('static.fundingsource.fundingsource')}</Label>
                                            <div className="controls ">
                                                <InputGroup>
                                                    <Input
                                                        type="select"
                                                        name="fundingSourceId"
                                                        id="fundingSourceId"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}

                                                    >
                                                        <option value="-1">{i18n.t('static.common.all')}</option>
                                                        {fundingSourceList}
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
                                                        name="shipmentStatusId"
                                                        id="shipmentStatusId"
                                                        bsSize="sm"
                                                        onChange={this.fetchData}
                                                    >
                                                        <option value="-1">{i18n.t('static.common.all')}</option>
                                                        {shipmentStatusList}
                                                    </Input>
                                                  
                                                </InputGroup>
                                            </div>
                                        </FormGroup>
                                       
                                       
                                    </div>
                                </Col>
                            </Form>
                            <Col md="12 pl-0">

                                <div className="row">
                                    <div className="col-md-12 p-0" id="div_id">
                                  { this.state.matricsList.length>0 &&  
                                  <div className="col-md-12">

                                     <button className="mr-1 float-right btn btn-info btn-md showdatabtn mt-1 mb-3" onClick={this.previewPDF}>Preview</button>
                              
                                        <p  style={{ width: '100%', height: '700px' }} id='pdf'></p>   </div>}

                                    </div>
                                </div>
                            </Col>



                        </div>
                    </div>
                    </CardBody>
            </Card>
            </div>
        );
    }
}
export default AnnualShipmentCost;