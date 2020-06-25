// import React from "react";
// import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Form } from 'reactstrap';
// import i18n from '../../i18n'
// import RealmService from '../../api/RealmService';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import getLabelText from '../../CommonComponent/getLabelText';
// import ProcurementUnitService from "../../api/ProcurementUnitService";
// import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import csvicon from '../../assets/img/csv.png'
// import pdfIcon from '../../assets/img/pdf.png';
// import TracerCategoryService from '../../api/TracerCategoryService';
// import PlanningUnitService from '../../api/PlanningUnitService';


// const entityname = i18n.t('static.dashboard.productcatalog');
// const { ExportCSVButton } = CSVExport;
// const ref = React.createRef();
// export default class ProductCatalog extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             realms: [],
//             data: [],
//             tracerCategories: [],
//             planningUnits: [],
//             selSource: [],
//             loading: true


//         }
//         this.filterData = this.filterData.bind(this);
//         this.filterDataForRealm = this.filterDataForRealm.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.callFunction = this.callFunction.bind(this);
//     }

//     callFunction() {

//         this.setState({
//             data: this.state.selSource
//         },
//             () => {
//                 this.filterData();
//             });
//     }

//     filterDataForRealm() {
//         console.log("IN filterDataForRealm-----------------------------------");
//         // let realmId = document.getElementById("realmId").value;

//         let realmId = AuthenticationService.getRealmId();

//         AuthenticationService.setupAxiosInterceptors();
//         ProcurementUnitService.getProcurementUnitByRealmId(realmId)
//             .then(response => {
//                 if (response.status == 200) {
//                     console.log("JSON----->", JSON.stringify(response.data))
//                     this.setState({
//                         data: response.data,
//                         selSource: response.data
//                     })
//                 } else {
//                     this.setState({ message: response.data.messageCode })
//                 }
//             }).catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response ? error.response.status : "") {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.data.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );

//     }

//     filterData() {

//         let planningUnitId = document.getElementById("planningUnitId").value;
//         let tracerCategoryId = document.getElementById("tracerCategoryId").value;

//         if (planningUnitId != 0 && tracerCategoryId != 0) {
//             console.log("1");
//             const data = this.state.data.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tracerCategoryId && c.planningUnit.planningUnitId == planningUnitId)
//             this.setState({
//                 data
//             });
//         } else if (planningUnitId != 0) {
//             console.log("2");
//             const data = this.state.data.filter(c => c.planningUnit.planningUnitId == planningUnitId)
//             this.setState({
//                 data
//             });
//         } else if (tracerCategoryId != 0) {
//             console.log("3");
//             const data = this.state.data.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tracerCategoryId)
//             this.setState({
//                 data
//             });
//         }
//         else {
//             this.filterDataForRealm();
//         }

//     }

//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         this.filterDataForRealm();

//         let realmId = AuthenticationService.getRealmId();
//         TracerCategoryService.getTracerCategoryByRealmId(1)
//             .then(response => {
//                 this.setState({
//                     tracerCategories: response.data,loading: false
//                 })
//             }).catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response ? error.response.status : "") {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.data.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );

//         PlanningUnitService.getPlanningUnitByRealmId(realmId).then(response => {
//             console.log(response.data)
//             this.setState({
//                 planningUnits: response.data,

//             })
//         }).catch(
//             error => {
//                 if (error.message === "Network Error") {
//                     this.setState({ message: error.message });
//                 } else {
//                     switch (error.response ? error.response.status : "") {
//                         case 500:
//                         case 401:
//                         case 404:
//                         case 406:
//                         case 412:
//                             this.setState({ message: error.response.data.messageCode });
//                             break;
//                         default:
//                             this.setState({ message: 'static.unkownError' });
//                             break;
//                     }
//                 }
//             }
//         );

//     }
//     formatLabel(cell, row) {
//         return getLabelText(cell, this.state.lang);
//     }
//     exportCSV(columns) {

//         var csvRow = [];
//         const headers = [];
//         columns.map((item, idx) => { headers[idx] = item.text });


//         var A = [headers]

//         this.state.data.map(elt => A.push([(elt.planningUnit.forecastingUnit.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.planningUnit.forecastingUnit.productCategory.label.label_en.replaceAll(' ', '%20'), elt.planningUnit.forecastingUnit.tracerCategory.label.label_en.replaceAll(' ', '%20')
//             , (elt.planningUnit.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.planningUnit.multiplier, elt.planningUnit.unit.label.label_en.replaceAll(' ', '%20'), (elt.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.multiplier, elt.unit.label.label_en.replaceAll(' ', '%20'), elt.supplier.label.label_en ?( elt.supplier.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20') : '%20', elt.labeling ? (elt.labeling.replaceAll(' ', '%20')).replaceAll(',','%20') : '%20', elt.active ? 'Active' : 'disabled']));


//         for (var i = 0; i < A.length; i++) {
//             csvRow.push(A[i].join(','))
//         }

//         var csvString = csvRow.join("%0A")
//         var a = document.createElement("a")
//         a.href = 'data:attachment/csv,' + csvString
//         a.target = "_Blank"
//         a.download = "productCatalog.csv"
//         document.body.appendChild(a)
//         a.click()
//     }


//     exportPDF = (columns) => {
//         const unit = "pt";
//         const size = "A4"; // Use A1, A2, A3 or A4
//         const orientation = "landscape"; // portrait or landscape

//         const marginLeft = 10;
//         const doc = new jsPDF(orientation, unit, size,true);

//         doc.setFontSize(15);

//         const title = "Product Catalog";
//         const headers = [];
//         columns.map((item, idx) => { headers[idx] = item.text });
//         const header = [headers];
//         console.log(header);
//         const data = this.state.data.map(elt => [elt.planningUnit.forecastingUnit.label.label_en, elt.planningUnit.forecastingUnit.productCategory.label.label_en, elt.planningUnit.forecastingUnit.tracerCategory.label.label_en
//             , elt.planningUnit.label.label_en, elt.planningUnit.multiplier, elt.planningUnit.unit.label.label_en, elt.label.label_en, elt.multiplier, elt.unit.label.label_en, elt.supplier.label.label_en, elt.labeling, elt.active ? 'Active' : 'disabled']);

//         let content = {
//             startY: 50,
//             head: header,
//             body: data,
//             styles: { lineWidth: 1, fontSize: 8 },
//             columnStyles: {
//                 0: { cellWidth: '8%' },
//                 2: { cellWidth: '8%' },
//                 3: { cellWidth: '8%' },
//                 4: { cellWidth: '8%' },
//                 5: { cellWidth: '8%' },
//                 6: { cellWidth: '8%' },
//                 7: { cellWidth: '8%' },
//                 8: { cellWidth: '8%' },
//                 9: { cellWidth: '8%' },
//                 10: { cellWidth: '8%' },
//                 11: { cellWidth: '8%' },
//                 12: { cellWidth: '8%' },

//             }
//         };

//         doc.text(title, marginLeft, 40);
//         doc.autoTable(content);
//         doc.save("ProductCatalog.pdf")
//     }


//     render() {

//         const { tracerCategories } = this.state;
//         let tracercategoryList = tracerCategories.length > 0
//             && tracerCategories.map((item, i) => {
//                 return (
//                     <option key={i} value={item.tracerCategoryId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const { planningUnits } = this.state;
//         let planningUnitList = planningUnits.length > 0
//             && planningUnits.map((item, i) => {
//                 return (
//                     <option key={i} value={item.planningUnitId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);


//         const { SearchBar, ClearSearchButton } = Search;
//         const customTotal = (from, to, size) => (
//             <span className="react-bootstrap-table-pagination-total">
//                 {i18n.t('static.common.result', { from, to, size })}
//             </span>
//         );

//         const columns = [
//             {
//                 dataField: 'planningUnit.forecastingUnit.label',
//                 text: i18n.t('static.forecastingunit.forecastingunit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             }, {
//                 dataField: 'planningUnit.forecastingUnit.productCategory.label',
//                 text: i18n.t('static.dashboard.productcategory'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             }, {
//                 dataField: 'planningUnit.forecastingUnit.tracerCategory.label',
//                 text: i18n.t('static.dashboard.tracercategory'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             }, {
//                 dataField: 'planningUnit.label',
//                 text: i18n.t('static.procurementUnit.planningUnit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             }, {
//                 dataField: 'planningUnit.multiplier',
//                 text: i18n.t('static.procurementUnit.multiplier'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             }, {
//                 dataField: 'planningUnit.unit.label',
//                 text: i18n.t('static.procurementUnit.unit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'label',
//                 text: i18n.t('static.procurementUnit.procurementUnit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'multiplier',
//                 text: i18n.t('static.procurementUnit.multiplier'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'unit.label',
//                 text: i18n.t('static.procurementUnit.unit'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             }
//             ,
//             {
//                 dataField: 'supplier.label',
//                 text: i18n.t('static.procurementUnit.supplier'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'labeling',
//                 text: i18n.t('static.procurementUnit.labeling'),
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
//             }
//         ];
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
//                 text: 'All', value: this.state.data.length
//             }]
//         }

//         const MyExportCSV = (props) => {
//             const handleClick = () => {
//                 props.onExport();
//             };
//             return (
//                 <img style={{ height: '40px', width: '40px' }} src={csvicon} title="Export CSV" onClick={() => handleClick()} />
//             );
//         };


//         return (

//             <div className="animated">
//                 <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5>{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <CardHeader className="mb-md-3 pb-lg-1">
//                         <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '}
//                         {  this.state.data.length > 0 && <div className="card-header-actions">
//                         <img style={{ height: '25px', width: '25px',cursor:'pointer' }} src={pdfIcon} title="Export PDF"  onClick={() => this.exportPDF(columns)}/>
//                         <img style={{ height: '25px', width: '25px', cursor:'pointer' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV(columns)} />                  

//                         </div>}
//                     </CardHeader>
//                     <CardBody className="pb-lg-0">
//                         <Form >
//                             <Col md="6 pl-0">
//                                 <div className="d-md-flex Selectdiv2">
//                                     {/* <FormGroup>
//                                         <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
//                                         <div className="controls SelectGo">
//                                             <InputGroup>
//                                                 <Input
//                                                     type="select"
//                                                     name="realmId"
//                                                     id="realmId"
//                                                     bsSize="sm"
//                                                 >
//                                                     {realmList}
//                                                 </Input>
//                                                 <InputGroupAddon addonType="append">
//                                                     <Button color="secondary Gobtn btn-sm" onClick={this.filterDataForRealm}>{i18n.t('static.common.go')}</Button>
//                                                 </InputGroupAddon>
//                                             </InputGroup>
//                                         </div>
//                                     </FormGroup> */}
//                                     {/* &nbsp; */}
//                                     <FormGroup className="tab-ml-1">
//                                         <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
//                                         <div className="controls SelectGo">
//                                             <InputGroup>
//                                                 <Input
//                                                     type="select"
//                                                     name="planningUnitId"
//                                                     id="planningUnitId"
//                                                     bsSize="sm"
//                                                     onChange={this.callFunction}
//                                                 >
//                                                     <option value="0">{i18n.t('static.common.all')}</option>
//                                                     {planningUnitList}
//                                                 </Input>

//                                             </InputGroup>
//                                         </div>
//                                     </FormGroup>
//                                     <FormGroup className="tab-ml-1">
//                                         <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
//                                         <div className="controls SelectGo">
//                                             <InputGroup>
//                                                 <Input
//                                                     type="select"
//                                                     name="tracerCategoryId"
//                                                     id="tracerCategoryId"
//                                                     bsSize="sm"
//                                                     onChange={this.callFunction}
//                                                 // onChange={this.filterData}
//                                                 >
//                                                     <option value="0">{i18n.t('static.common.all')}</option>
//                                                     {tracercategoryList}
//                                                 </Input>
//                                             </InputGroup>
//                                         </div>
//                                     </FormGroup>
//                                 </div>
//                             </Col>
//                         </Form>
//                         <ToolkitProvider
//                             keyField="procurementUnitId"
//                             data={this.state.data}
//                             columns={columns}
//                             exportCSV exportCSV
//                             search={{ searchFormatted: true }}
//                             hover
//                             filter={filterFactory()}

//                         >
//                             {
//                                 props => (
//                                     <div className="TableCust prodCatlogAlignThtd">
//                                         <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left">
//                                             <SearchBar {...props.searchProps} />
//                                             <ClearSearchButton {...props.searchProps} /></div>
//                                         <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
//                                             pagination={paginationFactory(options)}

//                                             {...props.baseProps}
//                                         /></div>

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

//             </div>)
//     }
// }









import React from "react";
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col, Form, Table } from 'reactstrap';
import i18n from '../../i18n'
import RealmService from '../../api/RealmService';
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import ProcurementUnitService from "../../api/ProcurementUnitService";
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import jsPDF from "jspdf";
import "jspdf-autotable";
import csvicon from '../../assets/img/csv.png'
import pdfIcon from '../../assets/img/pdf.png';
import TracerCategoryService from '../../api/TracerCategoryService';
import PlanningUnitService from '../../api/PlanningUnitService';


const entityname = i18n.t('static.dashboard.productcatalog');
const { ExportCSVButton } = CSVExport;
const ref = React.createRef();
const data = [{ "pc": "HIV Rapid Test Kits (RTKs)", "tc": "HIV RTK", "fc": "(Campaign Bulk) LLIN 180x160x170 cm (LxWxH) PBO Rectangular (White)", "UOMCode": "Each", "genericName": "", "PlanningUnit": "(Campaign Bulk) LLIN 180x160x170 cm (LxWxH) PBO Rectangular (White) 1 Each", "UOMCodeP": "Each", "MultipliertoForecastingUnit": "1", "ProcurementUnit": "(Campaign Bulk) LLIN 190x180x150 cm (LxWxH) Single Pyrethroid Rectangular (White)", "Supplier": "A To Z TEXTTILE LIMITED", "Weight": "1.115", "Height": "", "Length": "", "Width": "", "gtin": "12345678912345", "Labeling": "Olyset 150 Denier Polyethylene" }];
const data1 = [{ "pc": "HIV Rapid Test Kits (RTKs)", "tc": "HIV RTK", "fc": "(Campaign Bulk) LLIN 180x160x170 cm (LxWxH) PBO Rectangular (White)", "UOMCode": "Each", "genericName": "", "PlanningUnit": "(Campaign Bulk) LLIN 180x160x170 cm (LxWxH) PBO Rectangular (White) 1 Each", "UOMCodeP": "Each", "MultipliertoForecastingUnit": "1", "paskuCode": "100000DGA04S", "PlanningUnitMOQ": "3000", "PlanningUnitsperPallet": "1", "PlanningUnitsperContainer": "0.5", "PlanningUnitVolumem3": "4090", "PlanningUnitWeightkg": "500", "ProcurementUnit": "(Campaign Bulk) LLIN 190x180x150 cm (LxWxH) Single Pyrethroid Rectangular (White)", "Supplier": "A To Z TEXTTILE LIMITED", "Weight": "1.115", "Height": "", "Length": "", "Width": "", "gtin": "12345678912345", "Labeling": "Olyset 150 Denier Polyethylene", "UnitsperCase": "10,000", "UnitsperPallet": "5,000", "UnitsperContainer": "3,000", "ESTPrice": "2,456" }];
export default class ProductCatalog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            data: [],
            tracerCategories: [],
            planningUnits: [],
            selSource: [],
            loading: true


        }
        this.filterData = this.filterData.bind(this);
        this.filterDataForRealm = this.filterDataForRealm.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.callFunction = this.callFunction.bind(this);
    }

    callFunction() {

        this.setState({
            data: this.state.selSource
        },
            () => {
                this.filterData();
            });
    }

    filterDataForRealm() {
        console.log("IN filterDataForRealm-----------------------------------");
        // let realmId = document.getElementById("realmId").value;

        let realmId = AuthenticationService.getRealmId();

        AuthenticationService.setupAxiosInterceptors();
        ProcurementUnitService.getProcurementUnitByRealmId(realmId)
            .then(response => {
                if (response.status == 200) {
                    console.log("JSON----->", JSON.stringify(response.data))
                    this.setState({
                        data: response.data,
                        selSource: response.data
                    })
                } else {
                    this.setState({ message: response.data.messageCode })
                }
            }).catch(
                error => {
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

    filterData() {

        let planningUnitId = document.getElementById("planningUnitId").value;
        let tracerCategoryId = document.getElementById("tracerCategoryId").value;

        if (planningUnitId != 0 && tracerCategoryId != 0) {
            console.log("1");
            const data = this.state.data.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tracerCategoryId && c.planningUnit.planningUnitId == planningUnitId)
            this.setState({
                data
            });
        } else if (planningUnitId != 0) {
            console.log("2");
            const data = this.state.data.filter(c => c.planningUnit.planningUnitId == planningUnitId)
            this.setState({
                data
            });
        } else if (tracerCategoryId != 0) {
            console.log("3");
            const data = this.state.data.filter(c => c.planningUnit.forecastingUnit.tracerCategory.id == tracerCategoryId)
            this.setState({
                data
            });
        }
        else {
            this.filterDataForRealm();
        }

    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        this.filterDataForRealm();

        let realmId = AuthenticationService.getRealmId();
        TracerCategoryService.getTracerCategoryByRealmId(realmId)
            .then(response => {
                this.setState({
                    tracerCategories: response.data, loading: false
                })
            }).catch(
                error => {
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

        PlanningUnitService.getPlanningUnitByRealmId(realmId).then(response => {
            console.log(response.data)
            this.setState({
                planningUnits: response.data,

            })
        }).catch(
            error => {
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
    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }
    exportCSV(columns) {

        var csvRow = [];
        csvRow.push(("Product Category" + ' : ' + "All").replaceAll(' ', '%20'))
        csvRow.push(("Tracer Category" + ' : ' + "All").replaceAll(' ', '%20'))
        csvRow.push(("Procurement Agent" + ' : ' + "All").replaceAll(' ', '%20'))
        const headers = [];
        columns.map((item, idx) => { headers[idx] = item.text.replaceAll(',', '%20') });


        var A = [headers]

        // this.state.data.map(elt => A.push([(elt.planningUnit.forecastingUnit.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.planningUnit.forecastingUnit.productCategory.label.label_en.replaceAll(' ', '%20'), elt.planningUnit.forecastingUnit.tracerCategory.label.label_en.replaceAll(' ', '%20')
        // , (elt.planningUnit.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.planningUnit.multiplier, elt.planningUnit.unit.label.label_en.replaceAll(' ', '%20'), (elt.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20'), elt.multiplier, elt.unit.label.label_en.replaceAll(' ', '%20'), elt.supplier.label.label_en ? (elt.supplier.label.label_en.replaceAll(',', '%20')).replaceAll(' ', '%20') : '%20', elt.labeling ? (elt.labeling.replaceAll(' ', '%20')).replaceAll(',', '%20') : '%20', elt.active ? 'Active' : 'disabled']));
        data.map(elt => A.push([elt.pc.replaceAll(',', '%20'), elt.tc.replaceAll(' ', '%20'), elt.fc.replaceAll(' ', '%20'), elt.UOMCode.replaceAll(',', '%20'), elt.genericName.replaceAll(' ', '%20'), elt.ForecastingUnitActive, elt.PlanningUnit.replaceAll(',', '%20'), elt.UOMCodeP, elt.MultipliertoForecastingUnit, elt.PlanningUnitActive, elt.ProcurementUnit.replaceAll(' ', '%20'), elt.Supplier.replaceAll(',', '%20'), elt.Weight, elt.Height, elt.Length, elt.Width, elt.gtin, elt.Labeling.replaceAll(' ', '%20'), elt.ProcurementUnitActive]));


        for (var i = 0; i < A.length; i++) {
            csvRow.push(A[i].join(','))
        }

        var csvString = csvRow.join("%0A")
        var a = document.createElement("a")
        a.href = 'data:attachment/csv,' + csvString
        a.target = "_Blank"
        a.download = "productCatalog.csv"
        document.body.appendChild(a)
        a.click()
    }


    exportPDF = (columns) => {
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape

        const marginLeft = 10;
        const doc = new jsPDF(orientation, unit, size, true);

        doc.setFontSize(15);

        const title = "Product Catalog";
        const headers = [];
        columns.map((item, idx) => { headers[idx] = item.text });
        const header = [headers];
        console.log(header);
        // const data = this.state.data.map(elt => [elt.planningUnit.forecastingUnit.label.label_en, elt.planningUnit.forecastingUnit.productCategory.label.label_en, elt.planningUnit.forecastingUnit.tracerCategory.label.label_en
        //     , elt.planningUnit.label.label_en, elt.planningUnit.multiplier, elt.planningUnit.unit.label.label_en, elt.label.label_en, elt.multiplier, elt.unit.label.label_en, elt.supplier.label.label_en, elt.labeling, elt.active ? 'Active' : 'disabled']);
        const dt = data.map(elt => [elt.pc, elt.tc, elt.fc
            , elt.UOMCode, elt.genericName, elt.ForecastingUnitActive, elt.PlanningUnit, elt.UOMCodeP, elt.MultipliertoForecastingUnit, elt.PlanningUnitActive, elt.ProcurementUnit, elt.Supplier, elt.Weight, elt.Height, elt.Length, elt.Width, elt.gtin, elt.Labeling, elt.ProcurementUnitActive]);

        let content = {
            startY: 50,
            head: header,
            body: dt,
            styles: { lineWidth: 1, fontSize: 8 },
            columnStyles: {
                0: { cellWidth: '8%' },
                2: { cellWidth: '8%' },
                3: { cellWidth: '8%' },
                4: { cellWidth: '8%' },
                5: { cellWidth: '8%' },
                6: { cellWidth: '8%' },
                7: { cellWidth: '8%' },
                8: { cellWidth: '8%' },
                9: { cellWidth: '8%' },
                10: { cellWidth: '8%' },
                11: { cellWidth: '8%' },
                12: { cellWidth: '8%' },
                13: { cellWidth: '8%' },
                14: { cellWidth: '8%' },
                15: { cellWidth: '8%' },
                16: { cellWidth: '8%' },
                17: { cellWidth: '8%' },
                18: { cellWidth: '8%' },

            }
        };

        doc.text(title, marginLeft, 40);
        doc.autoTable(content);
        doc.save("ProductCatalog.pdf")
    }


    render() {

        const { tracerCategories } = this.state;
        let tracercategoryList = tracerCategories.length > 0
            && tracerCategories.map((item, i) => {
                return (
                    <option key={i} value={item.tracerCategoryId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { planningUnits } = this.state;
        let planningUnitList = planningUnits.length > 0
            && planningUnits.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnitId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);


        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        // const columns = [
        //     {
        //         dataField: 'planningUnit.forecastingUnit.label',
        //         text: i18n.t('static.forecastingunit.forecastingunit'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center',
        //         formatter: this.formatLabel
        //     }, {
        //         dataField: 'planningUnit.forecastingUnit.productCategory.label',
        //         text: i18n.t('static.dashboard.productcategory'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center',
        //         formatter: this.formatLabel
        //     }, {
        //         dataField: 'planningUnit.forecastingUnit.tracerCategory.label',
        //         text: i18n.t('static.dashboard.tracercategory'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center',
        //         formatter: this.formatLabel
        //     }, {
        //         dataField: 'planningUnit.label',
        //         text: i18n.t('static.procurementUnit.planningUnit'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center',
        //         formatter: this.formatLabel
        //     }, {
        //         dataField: 'planningUnit.multiplier',
        //         text: i18n.t('static.procurementUnit.multiplier'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center'
        //     }, {
        //         dataField: 'planningUnit.unit.label',
        //         text: i18n.t('static.procurementUnit.unit'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center',
        //         formatter: this.formatLabel
        //     },
        //     {
        //         dataField: 'label',
        //         text: i18n.t('static.procurementUnit.procurementUnit'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center',
        //         formatter: this.formatLabel
        //     },
        //     {
        //         dataField: 'multiplier',
        //         text: i18n.t('static.procurementUnit.multiplier'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center'
        //     },
        //     {
        //         dataField: 'unit.label',
        //         text: i18n.t('static.procurementUnit.unit'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center',
        //         formatter: this.formatLabel
        //     }
        //     ,
        //     {
        //         dataField: 'supplier.label',
        //         text: i18n.t('static.procurementUnit.supplier'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center',
        //         formatter: this.formatLabel
        //     },
        //     {
        //         dataField: 'labeling',
        //         text: i18n.t('static.procurementUnit.labeling'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center'
        //     },
        //     {
        //         dataField: 'active',
        //         text: i18n.t('static.common.status'),
        //         sort: true,
        //         align: 'center',
        //         headerAlign: 'center',
        //         formatter: (cellContent, row) => {
        //             return (
        //                 (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
        //             );
        //         }
        //     }
        // ];
        const columns = [
            {
                dataField: 'pc',
                text: i18n.t('static.dashboard.productcategory'),
                sort: true,
                align: 'left',
                headerAlign: 'left'
            },
            {
                dataField: 'tc',
                text: i18n.t('static.dashboard.tracercategory'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'fc',
                text: i18n.t('static.forecastingunit.forecastingunit'),
                sort: true,
                align: 'left',
                headerAlign: 'left'
            },
            {
                dataField: 'UOMCode',
                text: "Unit",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'genericName',
                text: "Generic Name",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'PlanningUnit',
                text: "Planning Unit",
                sort: true,
                align: 'left',
                headerAlign: 'left'
            },
            {
                dataField: 'UOMCodeP',
                text: "Unit",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'MultipliertoForecastingUnit',
                text: "Multiplier",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'ProcurementUnit',
                text: "Procurement Unit",
                sort: true,
                align: 'left',
                headerAlign: 'left'
            }
            ,
            {
                dataField: 'Supplier',
                text: "Supplier",
                sort: true,
                align: 'left',
                headerAlign: 'left'
            }
            ,
            {
                dataField: 'Weight',
                text: "Weight(Kg)",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'Height',
                text: "Height(m)",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }
            ,
            {
                dataField: 'Length',
                text: "Length(m)",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }
            ,
            {
                dataField: 'Width',
                text: "Width(m)",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }
            ,
            {
                dataField: 'gtin',
                text: "GTIN",
                sort: true,
                align: 'left',
                headerAlign: 'left'
            }
            ,
            {
                dataField: 'Labeling',
                text: "Labeling",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }



            //  {
            //     dataField: 'planningUnit.unit.label',
            //     text: i18n.t('static.procurementUnit.unit'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: this.formatLabel
            // },
            // {
            //     dataField: 'label',
            //     text: i18n.t('static.procurementUnit.procurementUnit'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: this.formatLabel
            // },
            // {
            //     dataField: 'multiplier',
            //     text: i18n.t('static.procurementUnit.multiplier'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center'
            // },
            // {
            //     dataField: 'unit.label',
            //     text: i18n.t('static.procurementUnit.unit'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: this.formatLabel
            // }
            // ,
            // {
            //     dataField: 'supplier.label',
            //     text: i18n.t('static.procurementUnit.supplier'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: this.formatLabel
            // },
            // {
            //     dataField: 'labeling',
            //     text: i18n.t('static.procurementUnit.labeling'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center'
            // },
            // {
            //     dataField: 'active',
            //     text: i18n.t('static.common.status'),
            //     sort: true,
            //     align: 'center',
            //     headerAlign: 'center',
            //     formatter: (cellContent, row) => {
            //         return (
            //             (row.active ? i18n.t('static.common.active') : i18n.t('static.common.disabled'))
            //         );
            //     }
            // }
        ];
        const columns1 = [
            {
                dataField: 'pc',
                text: i18n.t('static.dashboard.productcategory'),
                sort: true,
                align: 'left',
                headerAlign: 'left'
            },
            {
                dataField: 'tc',
                text: i18n.t('static.dashboard.tracercategory'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'fc',
                text: i18n.t('static.forecastingunit.forecastingunit'),
                sort: true,
                align: 'left',
                headerAlign: 'left'
            },
            {
                dataField: 'UOMCode',
                text: "Unit",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'genericName',
                text: "Generic Name",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'PlanningUnit',
                text: "Planning Unit",
                sort: true,
                align: 'left',
                headerAlign: 'left'
            },
            {
                dataField: 'UOMCodeP',
                text: "Unit",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'MultipliertoForecastingUnit',
                text: "Multiplier",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'paskuCode',
                text: "Procurement Agent SKU Code",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'PlanningUnitMOQ',
                text: "MOQ",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'PlanningUnitsperPallet',
                text: "Planning Units Per Pallet",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'PlanningUnitsperContainer',
                text: "Planning Units Per Container",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'PlanningUnitVolumem3',
                text: "Planning Unit Volume (m3)",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'PlanningUnitWeightkg',
                text: "Planning Unit Weight (Kg)",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },

            {
                dataField: 'ProcurementUnit',
                text: "Procurement Unit",
                sort: true,
                align: 'left',
                headerAlign: 'left'
            }
            ,
            {
                dataField: 'Supplier',
                text: "Supplier",
                sort: true,
                align: 'left',
                headerAlign: 'left'
            }
            ,
            {
                dataField: 'Weight',
                text: "Weight(Kg)",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'Height',
                text: "Height(m)",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }
            ,
            {
                dataField: 'Length',
                text: "Length(m)",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }
            ,
            {
                dataField: 'Width',
                text: "Width(m)",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            }
            ,
            {
                dataField: 'gtin',
                text: "GTIN",
                sort: true,
                align: 'left',
                headerAlign: 'left'
            }
            ,
            {
                dataField: 'Labeling',
                text: "Labeling",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'UnitsperCase',
                text: "Units Per Case",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'UnitsperPallet',
                text: "Units Per Pallet",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'UnitsperContainer',
                text: "Units Per Container",
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'ESTPrice',
                text: "EST Price",
                sort: true,
                align: 'center',
                headerAlign: 'center'
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
                text: 'All', value: this.state.data.length
            }]
        }

        const MyExportCSV = (props) => {
            const handleClick = () => {
                props.onExport();
            };
            return (
                <img style={{ height: '40px', width: '40px' }} src={csvicon} title="Export CSV" onClick={() => handleClick()} />
            );
        };


        return (

            <div className="animated">
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardHeader className="mb-md-3 pb-lg-1">
                        <i className="icon-menu"></i><strong>{i18n.t('static.common.listEntity', { entityname })}</strong>{' '}
                        {this.state.data.length > 0 && <div className="card-header-actions">
                            {/* <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF(columns)} /> */}
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title="Export CSV" onClick={() => this.exportCSV(columns)} />

                        </div>}
                    </CardHeader>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <Form >
                            <Col md="9 pl-0">
                                <div className="d-md-flex prodCatselect">
                                    {/* <FormGroup>
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.realm.realm')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="realmId"
                                                    id="realmId"
                                                    bsSize="sm"
                                                >
                                                    {realmList}
                                                </Input>
                                                <InputGroupAddon addonType="append">
                                                    <Button color="secondary Gobtn btn-sm" onClick={this.filterDataForRealm}>{i18n.t('static.common.go')}</Button>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </div>
                                    </FormGroup> */}
                                    {/* &nbsp; */}
                                    {/* <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">Program</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="sm"
                                                    onChange={this.callFunction}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                    {planningUnitList}
                                                </Input>

                                            </InputGroup>
                                        </div>
                                    </FormGroup> */}
                                    <FormGroup className="">
                                        <Label htmlFor="appendedInputButton">Product Category</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="sm"
                                                    onChange={this.callFunction}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                    {planningUnitList}
                                                </Input>

                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                    {/* <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.planningunit.planningunit')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="sm"
                                                    onChange={this.callFunction}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                    {planningUnitList}
                                                </Input>

                                            </InputGroup>
                                        </div>
                                    </FormGroup> */}
                                    <FormGroup className="tab-ml-1">
                                        <Label htmlFor="appendedInputButton">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                        <div className="controls SelectGo">
                                            <InputGroup>
                                                <Input
                                                    type="select"
                                                    name="tracerCategoryId"
                                                    id="tracerCategoryId"
                                                    bsSize="sm"
                                                    onChange={this.callFunction}
                                                // onChange={this.filterData}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                    {tracercategoryList}
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
                                                    name="planningUnitId"
                                                    id="planningUnitId"
                                                    bsSize="sm"
                                                    onChange={this.callFunction}
                                                >
                                                    <option value="0">{i18n.t('static.common.all')}</option>
                                                    {planningUnitList}
                                                </Input>

                                            </InputGroup>
                                        </div>
                                    </FormGroup>
                                </div>
                            </Col>
                        </Form><br /><br /><br />
                        {/* <Table striped bordered hover responsive="md">
                            <thead>
                                <th>Product Category</th>
                                <th>Tracer Category</th>
                                <th>Forcasting Unit</th>
                                <th>UOM Code</th>
                                <th>Generic Name</th>
                                <th>Forecasting Unit Active</th>
                                <th>Planning Unit</th>
                                <th>UOM Code</th>
                                <th>Multiplier to Forecasting Unit</th>
                                <th>Planning Unit Active</th>
                                <th>Procurement Unit</th>
                                <th>Supplier</th>
                                <th>Weight</th>
                                <th>Height</th>
                                <th>Length</th>
                                <th>Width</th>
                                <th>GTIN</th>
                                <th>Labeling</th>
                                <th>Procurement Unit Active</th>
                            </thead>
                            <tbody>
                                <td>
                                    Long Lasting Insecticide Treated Nets (LLINs)
                                </td>
                                <td>LLINs</td>
                                <td>(Campaign Bulk) LLIN 180x160x170 cm (LxWxH), PBO Rectangular (White)</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                            </tbody>
                        </Table> */}

                        <ToolkitProvider
                            keyField="procurementUnitId"
                            data={data1}
                            columns={columns1}
                            exportCSV exportCSV
                            search={{ searchFormatted: true }}
                            hover
                            filter={filterFactory()}

                        >
                            {
                                props => (
                                    <div className="TableCust prodCatlogAlignThtd">
                                        <div className="col-md-6 pr-0 offset-md-6 text-right mob-Left prductCat-search-align">
                                            <SearchBar {...props.searchProps} />
                                            <ClearSearchButton {...props.searchProps} /></div>
                                        <BootstrapTable hover striped noDataIndication={i18n.t('static.common.noData')} tabIndexCell
                                            pagination={paginationFactory(options)}

                                            {...props.baseProps}
                                        /></div>

                                )
                            }
                        </ToolkitProvider>

                    </CardBody>
                </Card>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>

            </div>)
    }
}
