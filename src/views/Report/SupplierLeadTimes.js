import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { Component, lazy } from 'react';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import {
    Card, CardBody,
    // CardFooter,
    CardHeader, Col, Form, FormGroup, InputGroup, Label, Table, Input
} from 'reactstrap';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import csvicon from '../../assets/img/csv.png';
import pdfIcon from '../../assets/img/pdf.png';
import getLabelText from '../../CommonComponent/getLabelText';
import { LOGO } from '../../CommonComponent/Logo.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// const { getToggledOptions } = utils;
const Widget04 = lazy(() => import('../../views/Widgets/Widget04'));
// const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));
const ref = React.createRef();

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
class SupplierLeadTimes extends Component {
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

        var A = [[("Program Name").replaceAll(' ', '%20'), ("Freight Cost Sea (%)").replaceAll(' ', '%20'), ("Freight Cost Air (%)").replaceAll(' ', '%20'), ("Plan to Draft LT (Months)").replaceAll(' ', '%20'), ("Draft to Submitted LT (Months)").replaceAll(' ', '%20'), ("Submitted to Approved LT (Months)").replaceAll(' ', '%20'), ("Approved to Shipped LT (Months)").replaceAll(' ', '%20'), ("Shipped to Arrived by Sea LT (Months)").replaceAll(' ', '%20'), ("Shipped to Arrived by Air LT (Months)").replaceAll(' ', '%20'), ("Arrived to Delivered LT (Months)").replaceAll(' ', '%20'), ("Total LT By Sea (Months)").replaceAll(' ', '%20'), ("Total LT By Air (Months)").replaceAll(' ', '%20')]]

        re = this.state.procurementAgents

        for (var item = 0; item < re.length; item++) {
            let totalSeaLeadTime = re[item].plannedToDraftLeadTime + re[item].draftToSubmittedLeadTime + re[item].submittedToApprovedLeadTime + re[item].approvedToShippedLeadTime + re[item].shippedToArrivedBySeaLeadTime + re[item].arrivedToDeliveredLeadTime;
            let totalAirLeadTime = re[item].plannedToDraftLeadTime + re[item].draftToSubmittedLeadTime + re[item].submittedToApprovedLeadTime + re[item].approvedToShippedLeadTime + re[item].shippedToArrivedByAirLeadTime + re[item].arrivedToDeliveredLeadTime;
            A.push([[getLabelText(re[item].label), re[item].seaFreightPerc, re[item].airFreightPerc, re[item].plannedToDraftLeadTime, re[item].draftToSubmittedLeadTime, re[item].submittedToApprovedLeadTime, re[item].approvedToShippedLeadTime, re[item].shippedToArrivedBySeaLeadTime, re[item].shippedToArrivedByAirLeadTime, re[item].arrivedToDeliveredLeadTime, totalSeaLeadTime, totalAirLeadTime]])
        }
        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = "Procurement Agent Report.csv"
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
                doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
                    align: 'center'
                })


            }
        }
        const addHeaders = doc => {

            const pageCount = doc.internal.getNumberOfPages()
            doc.setFont('helvetica', 'bold')
            for (var i = 1; i <= pageCount; i++) {
                doc.setFontSize(12)
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text("Procurement Agent Report", doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    var planningText = doc.splitTextToSize(i18n.t('static.program.program') + ' : ' + this.state.programLabels.toString(), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, 90, planningText)

                }

            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(8);

        const title = "Procurement Agent Report";
        // var canvas = document.getElementById("cool-canvas");
        //creates image

        // var canvasImg = canvas.toDataURL("image/png", 1.0);
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;
        // var aspectwidth1 = (width - h1);

        // doc.addImage(canvasImg, 'png', 50, 200, 750, 290, 'CANVAS');

        const headers = [["Program Name", "Freight Cost Sea (%)", "Freight Cost Air (%)", "Plan to Draft LT (Months)", "Draft to Submitted LT (Months)", "Submitted to Approved LT (Months)", "Approved to Shipped LT (Months)", "Shipped to Arrived by Sea LT (Months)", "Shipped to Arrived by Air LT (Months)", "Arrived to Delivered LT (Months)", "Total LT By Sea (Months)", "Total LT By Air (Months)"]]
        const data = this.state.procurementAgents.map(elt => [getLabelText(elt.label), elt.seaFreightPerc, elt.airFreightPerc, elt.plannedToDraftLeadTime, elt.draftToSubmittedLeadTime, elt.submittedToApprovedLeadTime, elt.approvedToShippedLeadTime, elt.shippedToArrivedBySeaLeadTime, elt.shippedToArrivedByAirLeadTime, elt.arrivedToDeliveredLeadTime, (elt.plannedToDraftLeadTime + elt.draftToSubmittedLeadTime + elt.submittedToApprovedLeadTime + elt.approvedToShippedLeadTime + elt.shippedToArrivedBySeaLeadTime + elt.arrivedToDeliveredLeadTime), (elt.plannedToDraftLeadTime + elt.draftToSubmittedLeadTime + elt.submittedToApprovedLeadTime + elt.approvedToShippedLeadTime + elt.shippedToArrivedByAirLeadTime + elt.arrivedToDeliveredLeadTime)]);

        let content = {
            margin: { top: 80 },
            startY: 150,
            head: headers,
            body: data,
            styles: { lineWidth: 1, fontSize: 8 }

        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save("Procurement Agent Report.pdf")
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
        if (programIds.length > 0) {
            AuthenticationService.setupAxiosInterceptors();

            ReportService.getProcurementAgentExportData(programIds)
                .then(response => {
                    console.log(JSON.stringify(response.data));
                    this.setState({
                        procurementAgents: response.data,
                        message: ''
                    })
                }).catch(
                    error => {
                        this.setState({
                            procurementAgents: []
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
                        <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.supplierLeadTimes')}</strong>
                        {/* {this.state.procurementAgents.length > 0 &&  */}
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </a>
                        </div>
                        {/* } */}
                    </CardHeader>
                    <CardBody className="pb-lg-0">
                        {/* <div ref={ref}> */}
                        <br />
                        <Form >
                            <Col md="6 pl-0">
                                <div className="d-md-flex Selectdiv2">
                                    <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">Country</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="tracerCategoryId"
                                                    id="tracerCategoryId"
                                                    bsSize="sm"
                                                // onChange={this.filterData}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">Program</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="tracerCategoryId"
                                                    id="tracerCategoryId"
                                                    bsSize="sm"
                                                // onChange={this.filterData}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">Planning Unit</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="tracerCategoryId"
                                                    id="tracerCategoryId"
                                                    bsSize="sm"
                                                // onChange={this.filterData}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">Procurement Agent</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="tracerCategoryId"
                                                    id="tracerCategoryId"
                                                    bsSize="sm"
                                                // onChange={this.filterData}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    {/* <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">Shipping Method</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="tracerCategoryId"
                                                    id="tracerCategoryId"
                                                    bsSize="sm"
                                                // onChange={this.filterData}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                </Input>
                                            </InputGroup>
                                        </div>
                                    </FormGroup> */}
                                </div>
                            </Col>
                        </Form><br /><br /><br />
                        <Col md="12 pl-0">

                            <div className="row">
                                <div className="col-md-12">
                                    {this.state.procurementAgents.length == 0 &&

                                        <Table responsive className="table-striped  table-hover table-bordered text-center mt-2">

                                            <thead>
                                                <tr>
                                                    <th colSpan="4" className="text-center "></th>
                                                    <th colSpan="10" className="text-center ">Lead Time In Months</th>
                                                </tr>
                                                <tr>
                                                    <th className="text-center " style={{ 'width': '79px' }}> Country </th>
                                                    <th className="text-center "style={{ 'width': '300px' }}> Program </th>
                                                    <th className="text-center " style={{ 'width': '300px' }}> Planning Unit </th>
                                                    <th className="text-center"> Procurement Agent</th>
                                                    <th className="text-center" style={{ 'width': '102px' }}> Plan to Draft</th>
                                                    <th className="text-center" style={{ 'width': '79px' }}> Draft to Submitted</th>
                                                    <th className="text-center" style={{ 'width': '79px' }}> Submitted to Approved</th>
                                                    <th className="text-center" style={{ 'width': '79px' }}> Approved to Shipped</th>
                                                    <th className="text-center" style={{ 'width': '79px' }}> Shipped to Arrived by Sea</th>
                                                    <th className="text-center" style={{ 'width': '79px' }}> Shipped to Arrived by Air</th>
                                                    <th className="text-center" style={{ 'width': '79px' }}> Arrived to Delivered</th>
                                                    <th className="text-center" style={{ 'width': '79px' }}> Total LT By Sea</th>
                                                    <th className="text-center" style={{ 'width': '79px' }}> Total LT By Air</th>
                                                    <th className="text-center" style={{ 'width': '78px' }}> Local Procurement</th>
                                                </tr>
                                            </thead>

                                            <tbody>


                                                <tr id="addr0" key={1} >
                                                    <td>Malawi</td>
                                                    <td>HIV/AIDS - Malawi - National</td>
                                                    <td>Abacavir 20 mg/mL Solution, 240 mL</td>
                                                    <td>PEPFAR</td>
                                                    <td>0.5</td>
                                                    <td>0.5</td>
                                                    <td>1.25</td>
                                                    <td>0.75</td>
                                                    <td>1</td>
                                                    <td>0.25</td>
                                                    <td>0.75</td>
                                                    <td>4.75</td>
                                                    <td>4</td>
                                                    <td>0.5</td>

                                                </tr>
                                            </tbody>
                                        </Table>
                                    }

                                </div>
                            </div>
                        </Col>

                        {/* </div> */}

                    </CardBody>
                </Card>

            </div>
        );
    }
}
export default SupplierLeadTimes
