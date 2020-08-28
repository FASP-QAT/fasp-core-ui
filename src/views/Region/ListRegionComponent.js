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
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
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
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'


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
            loading: true
        }
        this.editRegion = this.editRegion.bind(this);
        this.addRegion = this.addRegion.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJexcel = this.buildJexcel.bind(this);
    }

    hideSecondComponent() {
        document.getElementById('div2').style.display = 'block';
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    buildJexcel() {
        let regionList = this.state.selRegion;
        // console.log("regionList---->", regionList);
        let regionListArray = [];
        let count = 0;
        for (var j = 0; j < regionList.length; j++) {
            data = [];
            data[0] = regionList[j].regionId
            data[1] = getLabelText(regionList[j].realmCountry.country.label, this.state.lang)
            data[2] = getLabelText(regionList[j].label, this.state.lang)
            data[3] = (regionList[j].capacityCbm).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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
                    type: 'text',
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
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: 10,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
            oneditionend: this.onedit,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: [10, 25, 50],
            position: 'top',
            contextMenu: false,

        };
        var regionEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = regionEl;
        this.setState({
            regionEl: regionEl, loading: false
        })
    }

    filterData() {
        let countryId = document.getElementById("realmCountryId").value;
        if (countryId != 0) {
            const selRegion = this.state.regionList.filter(c => c.realmCountry.realmCountryId == countryId)
            this.setState({
                selRegion: selRegion
            },
                () => { this.buildJexcel() })
        } else {
            this.setState({
                selRegion: this.state.regionList
            },
                () => { this.buildJexcel() })
        }
    }
    editRegion(region) {
        this.props.history.push({
            pathname: `/region/editRegion/${region.regionId}`,
            // state: { region }
        });
    }
    selected = function (instance, cell, x, y, value) {

        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
            if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_LANGUAGE')) {
                this.props.history.push({
                    pathname: `/region/editRegion/${this.el.getValueFromCoords(0, x)}`,
                });
            }
        }
    }.bind(this);
    selected = function (instance, cell, x, y, value) {
        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            if (this.state.selSource.length != 0) {
                if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_ROLE')) {
                    this.props.history.push({
                        pathname: `/region/editRegion/${this.el.getValueFromCoords(0, x)}`,
                        // state: { role }
                    });
                }
            }
        }
    }.bind(this);
    addRegion(region) {
        this.props.history.push({
            pathname: "/region/addRegion"
        });
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        RegionService.getRegionList()
            .then(response => {
                console.log(response.data);
                if (response.status == 200) {

                    this.setState({
                        regionList: response.data,
                        selRegion: response.data,
                        loading: false
                    },
                        () => { this.buildJexcel() })
                } else {
                    this.setState({ message: response.data.messageCode },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })
        // .catch(
        //     error => {
        //         if (error.message === "Network Error") {
        //             this.setState({ message: error.message });
        //         } else {
        //             switch (error.response ? error.response.status : "") {
        //                 case 500:
        //                 case 401:
        //                 case 404:
        //                 case 406:
        //                 case 412:
        //                     this.setState({ message: error.response.data.messageCode });
        //                     break;
        //                 default:
        //                     this.setState({ message: 'static.unkownError' });
        //                     break;
        //             }
        //         }
        //     }
        // );

        RealmCountryService.getRealmCountryListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmCountryList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    }
                        ,
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })
        // .catch(
        //     error => {
        //         if (error.message === "Network Error") {
        //             this.setState({ message: error.message });
        //         } else {
        //             switch (error.response ? error.response.status : "") {
        //                 case 500:
        //                 case 401:
        //                 case 404:
        //                 case 406:
        //                 case 412:
        //                     this.setState({ message: error.response.data.messageCode });
        //                     break;
        //                 default:
        //                     this.setState({ message: 'static.unkownError' });
        //                     console.log("Error code unkown");
        //                     break;
        //             }
        //         }
        //     }
        // );
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

        const { realmCountryList } = this.state;
        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card style={{ display: this.state.loading ? "none" : "block" }}>
                    <div className="Card-header-reporticon">
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.regionreport')}</strong>{' '} */}

                    </div>
                    <CardBody className="pb-lg-0">
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
                                        {/* <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon> */}
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col><div id="tableDiv" className="jexcelremoveReadonlybackground"> </div>
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
            </div>
        );
    }
}
export default RegionListComponent;

