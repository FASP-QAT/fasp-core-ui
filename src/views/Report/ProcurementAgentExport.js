import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
import CryptoJS from 'crypto-js';
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { Component, lazy } from 'react';
import Picker from 'react-month-picker';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import {
    Card, CardBody,
    // CardFooter,
    CardHeader, Col, Form, FormGroup, InputGroup, Label, Table
} from 'reactstrap';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import getLabelText from '../../CommonComponent/getLabelText';
import { LOGO } from '../../CommonComponent/Logo.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
class ProcurementAgentExport extends Component {
    constructor(props) {
        super(props);

        this.toggledata = this.toggledata.bind(this);
        this.onRadioBtnClick = this.onRadioBtnClick.bind(this);

        this.state = {
            dropdownOpen: false,
            radioSelected: 2,
            lang: localStorage.getItem('lang'),
            procurementAgents: [],
            programValues: [],
            programLabels: [],
            programs: [],
            message: ''
        };
        this.filterData = this.filterData.bind(this);
        this.getPrograms = this.getPrograms.bind(this)
        this.handleChangeProgram = this.handleChangeProgram.bind(this)
    }

    exportCSV() {

        var csvRow = [];

        this.state.programLabels.map(ele =>
            csvRow.push(i18n.t('static.program.program') + ' , ' + ((ele.toString()).replaceAll(',', '%20')).replaceAll(' ', '%20')))
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        var re;

        var A = [[(i18n.t('static.dashboard.country')).replaceAll(' ', '%20'), (i18n.t('static.report.month')).replaceAll(' ', '%20'), (i18n.t('static.consumption.consumptionqty')).replaceAll(' ', '%20')]]

        re = this.state.procurementAgents

        for (var item = 0; item < re.length; item++) {
            A.push([[getLabelText(re[item].realmCountry.label), re[item].consumptionDateString, re[item].planningUnitQty]])
        }
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.report.consumption_') + this.makeText(this.state.rangeValue.from) + ' ~ ' + this.makeText(this.state.rangeValue.to) + ".csv"
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
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(18)
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.report.consumptionReport'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(12)
                    doc.text(i18n.t('static.program.program') + ' : ' + this.state.programLabels.toString(), doc.internal.pageSize.width / 8, 90, {
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

        const title = "Funder Export";
        var canvas = document.getElementById("cool-canvas");
        //creates image

        var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        var aspectwidth1 = (width - h1);

        doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');

        const headers = [[i18n.t('static.dashboard.country'), i18n.t('static.report.month'), i18n.t('static.consumption.consumptionqty')]]
        const data = this.state.procurementAgents.map(elt => [getLabelText(elt.realmCountry.label), elt.consumptionDateString, elt.planningUnitQty]);

        let content = {
            margin: { top: 80 },
            startY: height,
            head: headers,
            body: data,

        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save("Funder Export.pdf")
    }
    handleChangeProgram(programIds) {

        this.setState({
            programValues: programIds.map(ele => ele.value),
            programLabels: programIds.map(ele => ele.label)
        }, () => {

            this.filterData(this.state.rangeValue)
        })

    }
    filterData(rangeValue) {
        setTimeout('', 10000);
        let programIds = this.state.programValues;
        let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
        let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        if (programIds.length > 0) {

            var inputjson = {
                "programIds": programIds
            }
            console.log('***' + inputjson)
            AuthenticationService.setupAxiosInterceptors();

            // ReportService.getGlobalConsumptiondata(inputjson)
            //     .then(response => {
            //         console.log(JSON.stringify(response.data));
            //         this.setState({
            //             procurementAgents: response.data,
            //             message: ''
            //         })
            //     }).catch(
            //         error => {
            //             this.setState({
            //                 procurementAgents: []
            //             })

            //             if (error.message === "Network Error") {
            //                 this.setState({ message: error.message });
            //             } else {
            //                 switch (error.response ? error.response.status : "") {
            //                     case 500:
            //                     case 401:
            //                     case 404:
            //                     case 406:
            //                     case 412:
            //                         this.setState({ message: i18n.t(error.response.data.messageCode, { entityname: i18n.t('static.dashboard.Country') }) });
            //                         break;
            //                     default:
            //                         this.setState({ message: 'static.unkownError' });
            //                         break;
            //                 }
            //             }
            //         }
            //     );
        } else if (programIds.length == 0) {
            this.setState({ message: i18n.t('static.common.selectProgram'), procurementAgents: [] });

        } else {
            this.setState({ message: i18n.t('static.procurementUnit.validPlanningUnitText'), procurementAgents: [] });

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


    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        this.getPrograms()
    }

    toggledata = () => this.setState((currentState) => ({ show: !currentState.show }));

    onRadioBtnClick(radioSelected) {
        this.setState({
            radioSelected: radioSelected,
        });
    }
    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
    render() {

        const { programs } = this.state;
        let programList = [];
        programList = programs.length > 0
            && programs.map((item, i) => {
                return (

                    { label: getLabelText(item.label, this.state.lang), value: item.programId }

                )
            }, this);
        let consumptiondata = [];

        return (
            <div className="animated fadeIn" >
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5>{i18n.t(this.state.message)}</h5>

                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.procurementAgentExport')}</strong>
                        {this.state.procurementAgents.length > 0 && <div className="card-header-actions">
                            <a className="card-header-action">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </a>
                        </div>}
                    </CardHeader>
                    <CardBody>
                        <div ref={ref}>
                            <Form >
                                <Col md="2 pl-0">
                                    <div className="row">
                                        <FormGroup className="col-md-1">
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
                                    </div>
                                </Col>
                            </Form>
                            <Col md="12 pl-0">

                                <div className="row">
                                    <div className="col-md-12">
                                        {/* {this.state.show && this.state.procurementAgents.length > 0 && */}

                                        <Table responsive className="table-striped  table-hover table-bordered text-center mt-2">

                                            <thead>
                                                <tr>
                                                    <th className="text-center"> Program Code </th>
                                                    <th className="text-center "> Program Name </th>
                                                    <th className="text-center"> Procurement Agent </th>
                                                    <th className="text-center"> Procurement Agent Code</th>
                                                    <th className="text-center"> Is Procurement Agent Program Specific?</th>
                                                    <th className="text-center"> Freight Cost</th>
                                                    <th className="text-center"> Plan to Order LT(Months)</th>
                                                    <th className="text-center"> Order to Ship LT(Months)</th>
                                                    <th className="text-center"> Ship to Receive LT(Months)</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {/* {
                                                    this.state.procurementAgents.length > 0
                                                    &&
                                                    this.state.procurementAgents.map((item, idx) =>

                                                        <tr id="addr0" key={idx} >

                                                            <td>{getLabelText(this.state.procurementAgents[idx].realmCountry.label, this.state.lang)}</td>
                                                            <td>

                                                                {this.state.procurementAgents[idx].consumptionDateString}
                                                            </td>
                                                            <td >
                                                                {this.state.procurementAgents[idx].planningUnitQty}
                                                            </td>
                                                        </tr>)

                                                } */}
                                            </tbody>
                                        </Table>
                                        {/* } */}

                                    </div>
                                </div>
                            </Col>

                        </div>

                    </CardBody>
                </Card>

            </div>
        );
    }
}
export default ProcurementAgentExport
