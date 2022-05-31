// import React, { Component } from 'react';
// import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import i18n from '../../i18n'
// import RegionService from "../../api/RegionService";
// import AuthenticationService from '../Common/AuthenticationService.js';
// import getLabelText from '../../CommonComponent/getLabelText';
// import RealmCountryService from "../../api/RealmCountryService.js";

// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';



// const entityname = i18n.t('static.region.region');

// class RegionListComponent extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             regionList: [],
//             message: '',
//             selRegion: [],
//             realmCountryList: [],
//             lang: localStorage.getItem('lang'),
//             loading: true
//         }
//         this.editRegion = this.editRegion.bind(this);
//         this.addRegion = this.addRegion.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }
//     hideSecondComponent() {
//         document.getElementById('div2').style.display = 'block';
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }

//     filterData() {
//         let countryId = document.getElementById("realmCountryId").value;
//         if (countryId != 0) {
//             const selRegion = this.state.regionList.filter(c => c.realmCountry.realmCountryId == countryId)
//             this.setState({
//                 selRegion: selRegion
//             });
//         } else {
//             this.setState({
//                 selRegion: this.state.regionList
//             });
//         }
//     }
//     editRegion(region) {
//         this.props.history.push({
//             pathname: `/region/editRegion/${region.regionId}`,
//             // state: { region }
//         });
//     }
//     addRegion(region) {
//         this.props.history.push({
//             pathname: "/region/addRegion"
//         });
//     }

//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         RegionService.getRegionList()
//             .then(response => {
//                 console.log(response.data);
//                 if (response.status == 200) {
//                     this.setState({
//                         regionList: response.data,
//                         selRegion: response.data,
//                         loading: false
//                     })
//                 } else {
//                     this.setState({ message: response.data.messageCode },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             })
//         // .catch(
//         //     error => {
//         //         if (error.message === "Network Error") {
//         //             this.setState({ message: error.message });
//         //         } else {
//         //             switch (error.response ? error.response.status : "") {
//         //                 case 500:
//         //                 case 401:
//         //                 case 404:
//         //                 case 406:
//         //                 case 412:
//         //                     this.setState({ message: error.response.data.messageCode });
//         //                     break;
//         //                 default:
//         //                     this.setState({ message: 'static.unkownError' });
//         //                     break;
//         //             }
//         //         }
//         //     }
//         // );

//         RealmCountryService.getRealmCountryListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         realmCountryList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     }
//                         ,
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             })
//         // .catch(
//         //     error => {
//         //         if (error.message === "Network Error") {
//         //             this.setState({ message: error.message });
//         //         } else {
//         //             switch (error.response ? error.response.status : "") {
//         //                 case 500:
//         //                 case 401:
//         //                 case 404:
//         //                 case 406:
//         //                 case 412:
//         //                     this.setState({ message: error.response.data.messageCode });
//         //                     break;
//         //                 default:
//         //                     this.setState({ message: 'static.unkownError' });
//         //                     console.log("Error code unkown");
//         //                     break;
//         //             }
//         //         }
//         //     }
//         // );
//     }

//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }

//     render() {

//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const { realmCountryList } = this.state;
//         let realmCountries = realmCountryList.length > 0
//             && realmCountryList.map((item, i) => {
//                 return (
//                     <option key={i} value={item.realmCountryId}>
//                         {getLabelText(item.country.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const columns = [
//             {
//                 dataField: 'realmCountry.country.label',
//                 text: i18n.t('static.region.country'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'label',
//                 text: i18n.t('static.region.region'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'capacityCbm',
//                 text: i18n.t('static.region.capacitycbm'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'gln',
//                 text: i18n.t('static.region.gln'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'active',
//                 text: i18n.t('static.common.status'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: (cellContent, row) => {
//                     return (
//                         (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
//                     );
//                 }
//             }];
//         const options = {
//             hidePageListOnlyOnePage: true,
//             firstPageText: i18n.t('static.common.first'),
//             prePageText: i18n.t('static.common.back'),
//             nextPageText: i18n.t('static.common.next'),
//             lastPageText: i18n.t('static.common.last'),
//             nextPageTitle: i18n.t('static.common.firstPage'),
//             prePageTitle: i18n.t('static.common.prevPage'),
//             firstPageTitle: i18n.t('static.common.nextPage'),
//             lastPageTitle: i18n.t('static.common.lastPage'),
//             showTotal: true,
//             paginationTotalRenderer: customTotal,
//             disablePageTitle: true,
//             sizePerPageList: [{
//                 text: '10', value: 10
//             }, {
//                 text: '30', value: 30
//             }
//                 ,
//             {
//                 text: '50', value: 50
//             },
//             {
//                 text: 'All', value: this.state.selRegion.length
//             }]
//         }
//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <div className="Card-header-reporticon">
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.regionreport')}</strong>{' '} */}

//                     </div>
//                     <CardBody className="pb-lg-0">
//                         <Col md="3 pl-0">
//                             <FormGroup className="Selectdiv">
//                                 <Label htmlFor="appendedInputButton">{i18n.t('static.region.country')}</Label>
//                                 <div className="controls SelectGo">
//                                     <InputGroup>
//                                         <Input
//                                             type="select"
//                                             name="realmCountryId"
//                                             id="realmCountryId"
//                                             bsSize="sm"
//                                             onChange={this.filterData}
//                                         >
//                                             <option value="0">{i18n.t('static.common.all')}</option>
//                                             {realmCountries}
//                                         </Input>
//                                         {/* <InputGroupAddon addonType="append">
//                                             <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                                         </InputGroupAddon> */}
//                                     </InputGroup>
//                                 </div>
//                             </FormGroup>
//                         </Col>
//                         <ToolkitProvider
//                             keyField="regionId"
//                             data={this.state.selRegion}
//                             columns={columns}
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}
//                         >
//                             {
//                                 props => (

//                                     <div className="TableCust">
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} />
//                                         </div>
//                                         <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}
//                                             /* rowEvents={{
//                                                  onClick: (e, row, rowIndex) => {
//                                                      this.editRegion(row);
//                                                  }
//                                              }}*/
//                                             {...props.baseProps}
//                                         />
//                                     </div>
//                                 )
//                             }
//                         </ToolkitProvider>
//                     </CardBody>
//                 </Card>
//                 <div style={{ display: this.state.loading ? "block" : "none" }}>
//                     <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
//                         <div class="align-items-center">
//                             <div ><h4> <strong>Loading...</strong></h4></div>

//                             <div class="spinner-border blue ml-4" role="status">

//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }
// export default RegionListComponent;


import React, { Component } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Form } from 'reactstrap';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import i18n from '../../i18n'
import RegionService from "../../api/RegionService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import RealmCountryService from "../../api/RealmCountryService.js";

import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import pdfIcon from '../../assets/img/pdf.png';
import csvicon from '../../assets/img/csv.png';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { LOGO } from '../../CommonComponent/Logo.js';
import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities';
import jsPDF from "jspdf";
import "jspdf-autotable";
import ReportService from '../../api/ReportService';
import MultiSelect from 'react-multi-select-component';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';


const entityname = i18n.t('static.region.region');

class RegionListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regionList: [],
            message: '',
            selRegion: [],
            realmCountryList: [],
            lang: localStorage.getItem('lang'),
            loading: true,
            countryValues: [],
            countryLabels: [],
        }
        this.editRegion = this.editRegion.bind(this);
        this.addRegion = this.addRegion.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
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

    exportPDF = () => {
        const addFooters = doc => {
            const pageCount = doc.internal.getNumberOfPages()

            for (var i = 1; i <= pageCount; i++) {
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(6)
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
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.setPage(i)
                doc.addImage(LOGO, 'png', 0, 10, 180, 50, 'FAST');
                doc.setTextColor("#002f6c");
                doc.text(i18n.t('static.regionHead.region'), doc.internal.pageSize.width / 2, 60, {
                    align: 'center'
                })
                if (i == 1) {
                    doc.setFontSize(8)
                    doc.setFont('helvetica', 'normal')
                    // doc.text(i18n.t('static.region.country') + ' : ' + document.getElementById("realmCountryId").selectedOptions[0].text, doc.internal.pageSize.width / 8, 110, {
                    //     align: 'left'
                    // })

                    var y = 90
                    var planningText = doc.splitTextToSize(i18n.t('static.dashboard.country') + ' : ' + this.state.countryLabels.join('; '), doc.internal.pageSize.width * 3 / 4);
                    doc.text(doc.internal.pageSize.width / 8, y, planningText)
                    for (var i = 0; i < planningText.length; i++) {
                        if (y > doc.internal.pageSize.height - 100) {
                            doc.addPage();
                            y = 80;

                        } else {
                            y = y + 10
                        }
                    }

                }



            }
        }
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape
        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);
        doc.setFontSize(8);
        const title = i18n.t('static.regionHead.region');
        var width = doc.internal.pageSize.width;
        var height = doc.internal.pageSize.height;
        var h1 = 50;

        const headers = [];
        headers.push(i18n.t('static.region.country'));
        headers.push(i18n.t('static.region.region'));
        headers.push(i18n.t('static.region.capacitycbm'));
        headers.push(i18n.t('static.region.gln'));
        headers.push(i18n.t('static.common.status'));

        // columns.map((item, idx) => { headers[idx] = (item.text) });

        let data = this.state.selRegion.map(ele => [
            getLabelText(ele.realmCountry.label, this.state.lang),
            getLabelText(ele.region.label, this.state.lang),
            this.formatter(ele.capacityCbm),
            ele.gln,
            ele.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')
        ]);

        let content = {
            margin: { top: 90, bottom: 70 },
            startY: 130,
            head: [headers],
            body: data,
            styles: { lineWidth: 1, fontSize: 8, cellWidth: 152, halign: 'center' },
            columnStyles: {
                4: { cellWidth: 153.89 },
            }
        };
        doc.autoTable(content);
        addHeaders(doc)
        addFooters(doc)
        doc.save(i18n.t('static.regionHead.region') + '.pdf')
    }
    addDoubleQuoteToRowContent = (arr) => {
        return arr.map(ele => '"' + ele + '"')
    }
    exportCSV() {

        var csvRow = [];

        this.state.countryLabels.map(ele =>
            csvRow.push('"' + (i18n.t('static.dashboard.country') + ' : ' + ele.toString()).replaceAll(' ', '%20') + '"'))

        // csvRow.push('"' + (i18n.t('static.region.country') + ' : ' + document.getElementById("realmCountryId").selectedOptions[0].text).replaceAll(' ', '%20') + '"')
        csvRow.push('')
        csvRow.push('')

        const headers = [];
        // columns.map((item, idx) => { headers[idx] = ((item.text).replaceAll(' ', '%20')) });
        headers.push(i18n.t('static.region.country'));
        headers.push(i18n.t('static.region.region'));
        headers.push(i18n.t('static.region.capacitycbm'));
        headers.push(i18n.t('static.region.gln'));
        headers.push(i18n.t('static.common.status'));

        var A = [this.addDoubleQuoteToRowContent(headers)]
        this.state.selRegion.map(ele => A.push(this.addDoubleQuoteToRowContent([(getLabelText(ele.realmCountry.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), (getLabelText(ele.region.label, this.state.lang).replaceAll(',', ' ')).replaceAll(' ', '%20'), ele.capacityCbm, ele.gln == null ? '' : ele.gln, (ele.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))])));
        for (var i = 0; i < A.length; i++) {
            // console.log(A[i])
            csvRow.push(A[i].join(","))

        }

        var csvString = csvRow.join("%0A")
        // console.log('csvString' + csvString)
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = i18n.t('static.regionHead.region') + ".csv"
        document.body.appendChild(a)
        a.click()
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    handleChange(countrysId) {

        countrysId = countrysId.sort(function (a, b) {
            return parseInt(a.value) - parseInt(b.value);
        })
        this.setState({
            countryValues: countrysId.map(ele => ele),
            countryLabels: countrysId.map(ele => ele.label)
        }, () => {
            this.filterData()

        })
    }

    buildJexcel() {
        let regionList = this.state.selRegion;
        // console.log("regionList---->", regionList);
        let regionListArray = [];
        let count = 0;
        for (var j = 0; j < regionList.length; j++) {
            data = [];
            data[0] = regionList[j].region.id
            data[1] = getLabelText(regionList[j].realmCountry.label, this.state.lang)
            data[2] = getLabelText(regionList[j].region.label, this.state.lang)
            data[3] = (regionList[j].capacityCbm);
            data[4] = regionList[j].gln
            data[5] = regionList[j].active;
            regionListArray[count] = data;
            count++;
        }
        // if (regionList.length == 0) {
        //     data = [];
        //     regionListArray[0] = data;
        // }
        // console.log("regionListArray---->", regionListArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = regionListArray;
        var options = {
            data: data,
            columnDrag: true,
            // colWidths: [150, 150, 100,150, 150, 100,100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'regionListId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.region.country'),
                    type: 'text',
                    readOnly: true
                }
                ,
                {
                    title: i18n.t('static.region.region'),
                    type: 'text',
                    readOnly: true
                }
                ,
                {
                    title: i18n.t('static.region.capacitycbm'),
                    type: 'numeric', mask: '#,##.00', decimal: '.',
                    readOnly: true
                },
                {
                    title: i18n.t('static.region.gln'),
                    type: 'text',
                    readOnly: true
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },
            ],
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            // onselection: this.selected,
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
        var regionEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = regionEl;
        this.setState({
            regionEl: regionEl, loading: false
        })
    }

    filterData() {
        // let countryId = document.getElementById("realmCountryId").value;
        // if (countryId != 0) {
        //     const selRegion = this.state.regionList.filter(c => c.realmCountry.realmCountryId == countryId)
        //     this.setState({
        //         selRegion: selRegion
        //     },
        //         () => { this.buildJexcel() })
        // } else {
        //     this.setState({
        //         selRegion: this.state.regionList
        //     },
        //         () => { this.buildJexcel() })
        // }

        // let CountryIds = this.state.countryValues.length == this.state.realmCountryList.length ? [] : this.state.countryValues.map(ele => (ele.value).toString());
        // console.log("CountryIds---", CountryIds);
        let CountryIds = this.state.countryValues.map(ele => (ele.value).toString());
        console.log("CountryIds123---", this.state.countryValues.map(ele => (ele.value).toString()));
        if (this.state.countryValues.length > 0) {
            this.setState({ loading: true, message: '' })
            // AuthenticationService.setupAxiosInterceptors();
            let inputjson = {
                realmCountryIds: CountryIds
            }
            ReportService.wareHouseCapacityByCountry(inputjson)
                .then(response => {
                    console.log("RESP-------->>", response.data)
                    this.setState({
                        regionList: response.data,
                        selRegion: response.data,
                        loading: false
                    }, () => {
                        this.buildJexcel()
                    })
                }).catch(
                    error => {
                        this.setState({
                            regionList: [],
                            selRegion: [],
                            loading: false
                        }, () => {
                            this.el = jexcel(document.getElementById("tableDiv"), '');
                            this.el.destroy();
                        })
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
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

        } else if (this.state.countryValues.length == 0) {
            this.setState({ message: i18n.t('static.healtharea.countrytext'), data: [] }, () => {
                this.el = jexcel(document.getElementById("tableDiv"), '');
                this.el.destroy();
            });
        }
    }
    editRegion(region) {
        this.props.history.push({
            pathname: `/region/editRegion/${region.regionId}`,
            // state: { region }
        });
    }
    // selected = function (instance, cell, x, y, value) {

    //     if ((x == 0 && value != 0) || (y == 0)) {
    //         // console.log("HEADER SELECTION--------------------------");
    //     } else {
    //         // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
    //         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_LANGUAGE')) {
    //             this.props.history.push({
    //                 pathname: `/region/editRegion/${this.el.getValueFromCoords(0, x)}`,
    //             });
    //         }
    //     }
    // }.bind(this);
    // selected = function (instance, cell, x, y, value) {
    //     if ((x == 0 && value != 0) || (y == 0)) {
    //         // console.log("HEADER SELECTION--------------------------");
    //     } else {
    //         if (this.state.selSource.length != 0) {
    //             if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_ROLE')) {
    //                 this.props.history.push({
    //                     pathname: `/region/editRegion/${this.el.getValueFromCoords(0, x)}`,
    //                     // state: { role }
    //                 });
    //             }
    //         }
    //     }
    // }.bind(this);
    addRegion(region) {
        this.props.history.push({
            pathname: "/region/addRegion"
        });
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        // RegionService.getRegionList()
        //     .then(response => {
        //         console.log(response.data);
        //         if (response.status == 200) {

        //             this.setState({
        //                 regionList: response.data,
        //                 selRegion: response.data,
        //                 loading: false
        //             },
        //                 () => { this.buildJexcel() })
        //         } else {
        //             this.setState({ message: response.data.messageCode },
        //                 () => {
        //                     this.hideSecondComponent();
        //                 })
        //         }
        //     })
        //     .catch(
        //         error => {
        //             if (error.message === "Network Error") {
        //                 this.setState({
        //                     message: 'static.unkownError',
        //                     loading: false
        //                 });
        //             } else {
        //                 switch (error.response ? error.response.status : "") {

        //                     case 401:
        //                         this.props.history.push(`/login/static.message.sessionExpired`)
        //                         break;
        //                     case 403:
        //                         this.props.history.push(`/accessDenied`)
        //                         break;
        //                     case 500:
        //                     case 404:
        //                     case 406:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             loading: false
        //                         });
        //                         break;
        //                     case 412:
        //                         this.setState({
        //                             message: error.response.data.messageCode,
        //                             loading: false
        //                         });
        //                         break;
        //                     default:
        //                         this.setState({
        //                             message: 'static.unkownError',
        //                             loading: false
        //                         });
        //                         break;
        //                 }
        //             }
        //         }
        //     );

        // RealmCountryService.getRealmCountryListAll()
        //     .then(response => {
        //         if (response.status == 200) {
        //             this.setState({
        //                 realmCountryList: response.data
        //             })
        //         } else {
        //             this.setState({
        //                 message: response.data.messageCode
        //             }
        //                 ,
        //                 () => {
        //                     this.hideSecondComponent();
        //                 })
        //         }
        //     })

        let realmId = AuthenticationService.getRealmId();
        RealmCountryService.getRealmCountryForProgram(realmId)
            .then(response => {
                console.log("RealmCountryService---->", response.data)
                if (response.status == 200) {
                    var listArray = response.data.map(ele => ele.realmCountry);
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        // realmCountryList: response.data.map(ele => ele.realmCountry)
                        realmCountryList: listArray,
                        loading: false
                    },
                        () => { })
                } else {
                    this.setState({ message: response.data.messageCode, loading: false },
                        () => { this.hideSecondComponent(); })
                }
            })
            .catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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

    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        // const { realmCountryList } = this.state;
        // let realmCountries = realmCountryList.length > 0
        //     && realmCountryList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.id}>
        //                 {getLabelText(item.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);

        const { realmCountryList } = this.state;
        let countryList = realmCountryList.length > 0 && realmCountryList.map((item, i) => {
            return ({ label: getLabelText(item.label, this.state.lang), value: item.id })
        }, this);

        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-reporticon">
                        {this.state.selRegion.length > 0 &&
                            <div className="card-header-actions">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => this.exportCSV()} />
                            </div>
                        }
                    </div>
                    {/* <CardBody className="pb-lg-0">
                        <Col md="3 pl-0">
                            <FormGroup className="Selectdiv mt-md-2 mb-md-0">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.region.country')}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="realmCountryId"
                                            id="realmCountryId"
                                            bsSize="sm"
                                            onChange={this.filterData}
                                        >
                                            <option value="0">{i18n.t('static.common.all')}</option>
                                            {realmCountries}
                                        </Input>
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col><div id="tableDiv" className="jexcelremoveReadonlybackground"> </div>
                    </CardBody> */}
                    <CardBody className="pb-lg-5 pt-lg-2 ">
                        <div className="" >
                            <div>
                                <Form >
                                    <div className="pl-0">
                                        <div className="row">
                                            <FormGroup className="col-md-3 ">
                                                <Label htmlFor="countrysId">{i18n.t('static.program.realmcountry')}</Label>
                                                <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>

                                                <div className="controls edit">
                                                    <MultiSelect
                                                        bsSize="sm"
                                                        name="countrysId"
                                                        id="countrysId"
                                                        value={this.state.countryValues}
                                                        onChange={(e) => { this.handleChange(e) }}
                                                        options={countryList && countryList.length > 0 ? countryList : []}
                                                    />
                                                </div>
                                            </FormGroup>
                                        </div>
                                    </div>
                                </Form>

                                <div className="werehousecapacitySearchposition" >
                                    <div id="tableDiv" style={{ display: this.state.loading ? "none" : "block" }} className="jexcelremoveReadonlybackground"> </div>
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
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }
}
export default RegionListComponent;

