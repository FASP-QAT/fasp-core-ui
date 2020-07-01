import React, { Component } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Form } from 'reactstrap';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import ProgramService from '../../api/ProgramService';
import ReportService from '../../api/ReportService';
import DatePicker from 'react-datepicker';
import '../../../node_modules/react-datepicker/dist/react-datepicker.css';
import filterFactory from 'react-bootstrap-table2-filter';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import csvicon from '../../assets/img/csv.png';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { LOGO } from '../../CommonComponent/Logo.js';
import pdfIcon from '../../assets/img/pdf.png';
import moment from 'moment'
import Picker from 'react-month-picker'
import MonthBox from '../../CommonComponent/MonthBox.js'
import { Link } from "react-router-dom";
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";


const entityname = i18n.t('static.dashboard.costOfInventory');
const { ExportCSVButton } = CSVExport;
const ref = React.createRef();
const pickerLang = {
    months: [i18n.t('static.month.jan'), i18n.t('static.month.feb'), i18n.t('static.month.mar'), i18n.t('static.month.apr'), i18n.t('static.month.may'), i18n.t('static.month.jun'), i18n.t('static.month.jul'), i18n.t('static.month.aug'), i18n.t('static.month.sep'), i18n.t('static.month.oct'), i18n.t('static.month.nov'), i18n.t('static.month.dec')],
    from: 'From', to: 'To',
}

export default class CostOfInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            CostOfInventoryInput: {
                programId: '',
                planningUnitIds: [],
                regionIds: [],
                versionId: -1,
                dt: new Date(),
                includePlanningShipments: true
            },
            programs: [],
            regions: [],
            planningUnitList: [],
            costOfInventory: [],
            versions: [],
            message: '',
            singleValue2: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },

        }
        this.formSubmit = this.formSubmit.bind(this);
        // this.filterRegionList = this.filterRegionList.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.formatLabel = this.formatLabel.bind(this);

    }
    makeText = m => {
        if (m && m.year && m.month) return (pickerLang.months[m.month - 1] + '. ' + m.year)
        return '?'
    }

    getPrograms = () => {
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            let realmId = AuthenticationService.getRealmId();
            ProgramService.getProgramByRealmId(realmId)
                .then(response => {
                    console.log(JSON.stringify(response.data))
                    this.setState({
                        programs: response.data
                    }, () => { this.consolidatedProgramList() })
                }).catch(
                    error => {
                        this.setState({
                            programs: []
                        }, () => { this.consolidatedProgramList() })
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

        } else {
            console.log('offline')
            this.consolidatedProgramList()
        }

    }
    consolidatedProgramList = () => {
        const lan = 'en';
        const { programs } = this.state
        var proList = programs;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8))
                        console.log(programNameLabel)

                        var f = 0
                        for (var k = 0; k < this.state.programs.length; k++) {
                            if (this.state.programs[k].programId == programData.programId) {
                                f = 1;
                                console.log('already exist')
                            }
                        }
                        if (f == 0) {
                            proList.push(programData)
                        }
                    }


                }

                this.setState({
                    programs: proList
                })

            }.bind(this);

        }.bind(this);


    }


    filterVersion = () => {
        let programId = document.getElementById("programId").value;
        if (programId != 0) {

            const program = this.state.programs.filter(c => c.programId == programId)
            console.log(program)
            if (program.length == 1) {
                if (navigator.onLine) {
                    this.setState({
                        versions: []
                    }, () => {
                        this.setState({
                            versions: program[0].versionList.filter(function (x, i, a) {
                                return a.indexOf(x) === i;
                            })
                        }, () => { this.consolidatedVersionList(programId) });
                    });


                } else {
                    this.setState({
                        versions: []
                    }, () => { this.consolidatedVersionList(programId) })
                }
            } else {

                this.setState({
                    versions: []
                })

            }
        } else {
            this.setState({
                versions: []
            })
        }
    }
    consolidatedVersionList = (programId) => {
        const lan = 'en';
        const { versions } = this.state
        var verList = versions;

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();

            getRequest.onerror = function (event) {
                // Handle errors!
            };
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId && myResult[i].programId == programId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var databytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = databytes.toString(CryptoJS.enc.Utf8)
                        var version = JSON.parse(programData).currentVersion

                        version.versionId = `${version.versionId} (Local)`
                        verList.push(version)

                    }


                }

                console.log(verList)
                this.setState({
                    versions: verList.filter(function (x, i, a) {
                        return a.indexOf(x) === i;
                    })
                })

            }.bind(this);



        }.bind(this)


    }

    dateformatter = value => {
        var dt = new Date(value)
        return moment(dt).format('MMM-DD-YYYY');
    }
    formatter = value => {

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
    exportCSV = (columns) => {

        var csvRow = [];

        csvRow.push((i18n.t('static.program.program') + ' , ' + (document.getElementById("programId").selectedOptions[0].text).replaceAll(' ', '%20')))
        csvRow.push((i18n.t('static.report.version') + ' , ' + document.getElementById("versionId").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.program.isincludeplannedshipment') + ' , ' + document.getElementById("includePlanningShipments").selectedOptions[0].text).replaceAll(' ', '%20'))
        csvRow.push((i18n.t('static.report.month') + ' , ' + this.makeText(this.state.singleValue2)).replaceAll(' ', '%20'))
        csvRow.push('')
        csvRow.push('')
        csvRow.push((i18n.t('static.common.youdatastart')).replaceAll(' ', '%20'))
        csvRow.push('')
        var re;

        const headers = [];
        columns.map((item, idx) => { headers[idx] = (item.text).replaceAll(' ', '%20') });

        var A = [headers]
        this.state.costOfInventory.map(ele => A.push([(getLabelText(ele.planningUnit.label).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.batchNo, this.dateformatter(ele.expiryDate).replaceAll(' ', '%20'), ele.stock, getLabelText(ele.currency.label, this.state.lang) + '%20' + ele.rate, getLabelText(ele.currency.label, this.state.lang) + '%20' + ele.cost]));

        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(","))
        }
        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = "Cost Of Inventory Report.csv"
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
                doc.text('Copyright © 2020 Quantification Analytics Tool', doc.internal.pageSize.width * 6 / 7, doc.internal.pageSize.height - 30, {
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
                doc.text("Cost Of Inventory ", doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    doc.text(i18n.t('static.program.program') + ' : ' + document.getElementById("programId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 90, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.version') + ' : ' + document.getElementById("versionId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.program.isincludeplannedshipment') + ' : ' + document.getElementById("includePlanningShipments").selectedOptions[0].text, doc.internal.pageSize.width / 8, 130, {
                        align: 'left'
                    })
                    doc.text(i18n.t('static.report.month') + ' : ' + this.makeText(this.state.singleValue2), doc.internal.pageSize.width / 8, 150, {
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
        const data = this.state.costOfInventory.map(ele => [getLabelText(ele.planningUnit.label), ele.batchNo, this.dateformatter(ele.expiryDate), this.formatter(ele.stock), getLabelText(ele.currency.label, this.state.lang) + " " + this.formatter(ele.rate), getLabelText(ele.currency.label, this.state.lang) + " " + this.formatter(ele.cost)]);

        let content = {
            margin: { top: 80 },
            startY: 170,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, halign: 'center' }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save("Cost Of Inventory Report.pdf")
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
        var dt = new Date(`${value.year}-${value.month}-01`)
        costOfInventoryInput.dt = dt
        this.setState({ singleValue2: value, costOfInventoryInput }, () => {
            this.formSubmit();
        })

    }


    dataChange(event) {
        let costOfInventoryInput = this.state.CostOfInventoryInput;
        if (event.target.name == "programId") {
            costOfInventoryInput.programId = event.target.value;

        }
        if (event.target.name == "includePlanningShipments") {
            costOfInventoryInput.includePlanningShipments = event.target.value;

        }
        if (event.target.name == "versionId") {
            costOfInventoryInput.versionId = event.target.value;

        }
        this.setState({ costOfInventoryInput }, () => { this.formSubmit() })
    }

    componentDidMount() {
        this.getPrograms()

    }

    formSubmit() {
        var programId = this.state.CostOfInventoryInput.programId;
        var versionId = this.state.CostOfInventoryInput.versionId
        if (programId != 0 && versionId != -1) {
            if (versionId.includes('Local')) {
                var startDate = new moment(this.state.CostOfInventoryInput.dt).subtract(1, 'months').format('MM-YYYY');
                var endDate = new moment(this.state.CostOfInventoryInput.dt).format('MM-YYYY');
                var db1;
                var storeOS;
                getDatabase();
                var openRequest = indexedDB.open('fasp', 1);
                openRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var programDataTransaction = db1.transaction(['programData'], 'readwrite');
                    var version = (versionId.split('(')[0]).trim()
                    var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                    var userId = userBytes.toString(CryptoJS.enc.Utf8);
                    var program = `${programId}_v${version}_uId_${userId}`
                    var programDataOs = programDataTransaction.objectStore('programData');
                    console.log(program)
                    var programRequest = programDataOs.get(program);
                    programRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    programRequest.onsuccess = function (e) {
                        console.log(programRequest)
                        var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var inventoryList = []
                       
                            inventoryList = ((programJson.inventoryList).filter(c => c.active == true && moment(new moment(c.inventoryDate).format('MM-YYYY')).isBetween(startDate, endDate, null, '[)')));
                        var dates = new Set(inventoryList.map(ele => ele.inventoryDate))
                        var data = []

                        console.log(data)
                        this.setState({
                            data: data
                            , message: ''
                        })
                    }.bind(this)
                }.bind(this)
            } else {
                AuthenticationService.setupAxiosInterceptors();
                ReportService.costOfInventory(this.state.CostOfInventoryInput).then(response => {
                    console.log("costOfInentory=====>", response.data);
                    this.setState({
                        costOfInventory: [{ "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "batchNo": "A1001", "expiryDate": "2020-04-01", "cost": 3800.0, "stock": 3800, currency: { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "USD", "label_sp": null, "label_fr": null, "label_pr": null } }, rate: 1.00 },
                        { "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "batchNo": "T2480", "expiryDate": "2020-04-01", "cost": 1000.0, "stock": 1000, currency: { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "USD", "label_sp": null, "label_fr": null, "label_pr": null } }, rate: 1.00 },
                        { "planningUnit": { "id": 152, "label": { "active": false, "labelId": 9098, "label_en": "Abacavir 20 mg/mL Solution, 240 mL", "label_sp": null, "label_fr": null, "label_pr": null } }, "batchNo": "Z4051", "expiryDate": "2020-04-01", "cost": 50000.0, "stock": 50000, currency: { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "USD", "label_sp": null, "label_fr": null, "label_pr": null } }, rate: 1.00 },
                        { "planningUnit": { "id": 154, "label": { "active": false, "labelId": 9100, "label_en": "Abacavir 300 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "batchNo": null, "expiryDate": "2099-12-31", "cost": 15865.0, "stock": 15865, currency: { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "USD", "label_sp": null, "label_fr": null, "label_pr": null } }, rate: 1.00 },
                        { "planningUnit": { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "Abacavir 60 mg Tablet, 1000 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "batchNo": null, "expiryDate": "2099-12-31", "cost": 28648.0, "stock": 28648, currency: { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "USD", "label_sp": null, "label_fr": null, "label_pr": null } }, rate: 1.00 },
                        { "planningUnit": { "id": 157, "label": { "active": false, "labelId": 9103, "label_en": "Abacavir 60 mg Tablet, 60 Tablets", "label_sp": null, "label_fr": null, "label_pr": null } }, "batchNo": null, "expiryDate": "2099-12-31", "cost": 21653.0, "stock": 21653, currency: { "id": 156, "label": { "active": false, "labelId": 9102, "label_en": "USD", "label_sp": null, "label_fr": null, "label_pr": null } }, rate: 1.00 }], message: ''
                    });
                });
            }
        } else if (this.state.CostOfInventoryInput.programId == 0) {
            this.setState({ costOfInventory: [], message: i18n.t('static.common.selectProgram') });
        } else {
            this.setState({ costOfInventory: [], message: i18n.t('static.program.validversion') });
        }
    }
    formatLabel(cell, row) {
        // console.log("celll----", cell);
        if (cell != null && cell != "") {
            return getLabelText(cell, this.state.lang);
        }
    }

    render() {
        const { singleValue2 } = this.state

        const { programs } = this.state;
        let programList = programs.length > 0
            && programs.map((item, i) => {
                return (
                    <option key={i} value={item.programId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { versions } = this.state;
        let versionList = versions.length > 0
            && versions.map((item, i) => {
                return (
                    <option key={i} value={item.versionId}>
                        {item.versionId}
                    </option>
                )
            }, this);


        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        const columns = [

            {
                dataField: 'planningUnit.label',
                text: 'Planning Unit',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center' },
                formatter: this.formatLabel
            },
            {
                dataField: 'batchNo',
                text: 'Batch No',
                sort: true,
                align: 'center',
                headerAlign: 'center'

            },
            {
                dataField: 'expiryDate',
                text: 'Expiry Date',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.dateformatter
            },
            {
                dataField: 'stock',
                text: 'Stock',
                sort: true,
                align: 'center',
                headerAlign: 'center',
                style: { align: 'center' },
                formatter: this.formatter
            }, {
                dataField: 'rate',
                text: 'Rate (USD)',
                sort: true,
                align: 'center',
                style: { align: 'center' },
                headerAlign: 'center',
                formatter: this.formatter
            },
            {
                dataField: 'cost',
                text: 'Cost (USD)',
                sort: true,
                align: 'center',
                style: { align: 'center' },
                headerAlign: 'center',
                formatter: this.formatter
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
                <h6 className="mt-success">{i18n.t(this.props.match.params.message)}</h6>
                <h5>{i18n.t(this.state.message)}</h5>

                <Card>
                    <CardHeader>
                        <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.costOfInventory')}</strong>

                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">{i18n.t('static.supplyplan.supplyplanformula')}</small></Link>
                            </a>
                            <a className="card-header-action">
                                {this.state.costOfInventory.length > 0 && <div className="card-header-actions">
                                    <img style={{ height: '25px', width: '25px' }} src={pdfIcon} title={i18n.t('static.report.exportPdf')} onClick={() => this.exportPDF(columns)} />
                                    <img style={{ height: '25px', width: '25px' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV(columns)} />
                                </div>}
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
                                                <Label htmlFor="appendedInputButton">Program</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="programId"
                                                            id="programId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e); this.filterVersion(); this.formSubmit() }}
                                                        >
                                                            <option value="0">{i18n.t('static.common.select')}</option>
                                                            {programList}
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">Version</Label>
                                                <div className="controls ">
                                                    <InputGroup>
                                                        <Input
                                                            type="select"
                                                            name="versionId"
                                                            id="versionId"
                                                            bsSize="sm"
                                                            onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="-1">{i18n.t('static.common.select')}</option>
                                                            {versionList}
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
                                                            onChange={(e) => { this.dataChange(e); this.formSubmit() }}
                                                        >
                                                            <option value="true">{i18n.t('static.program.yes')}</option>
                                                            <option value="false">{i18n.t('static.program.no')}</option>
                                                        </Input>

                                                    </InputGroup>
                                                </div>
                                            </FormGroup>


                                            <FormGroup className="col-md-3">
                                                <Label htmlFor="appendedInputButton">{i18n.t('static.report.month')}<span className="stock-box-icon  fa fa-sort-desc ml-1"></span></Label>
                                                <div className="controls edit">
                                                    <Picker
                                                        ref="pickAMonth2"
                                                        years={{ min: { year: 2010, month: 1 }, max: { year: 2021, month: 12 } }}
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
                                        </div>
                                    </Col>
                                </Form>
                            </div>
                        </div>
                        {this.state.costOfInventory.length > 0 && <ToolkitProvider
                            keyField="planningUnitId"
                            data={this.state.costOfInventory}
                            columns={columns}
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}
                        >
                            {
                                props => (
                                    <div className="TableCust">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">

                                        </div>
                                        <BootstrapTable
                                            hover
                                            striped
                                            // tabIndexCell
                                            pagination={paginationFactory(options)}
                                            // rowEvents={{
                                            //     onClick: (e, row, rowIndex) => {
                                            //         // row.startDate = moment(row.startDate).format('YYYY-MM-DD');
                                            //         // row.stopDate = moment(row.stopDate).format('YYYY-MM-DD');
                                            //         // row.startDate = moment(row.startDate);
                                            //         // row.stopDate = moment(row.stopDate);
                                            //         // this.editBudget(row);
                                            //     }
                                            // }}
                                            {...props.baseProps}
                                        />
                                        {/* <h5>*Row is in red color indicates there is no money left or budget hits the end date</h5> */}
                                    </div>
                                )
                            }
                        </ToolkitProvider>}


                    </CardBody>
                </Card>

            </div >

        );
    }

}