// import React, { Component } from 'react';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import CountryService from '../../api/CountryService.js';
// import { NavLink } from 'react-router-dom'
// import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
// import BootstrapTable from 'react-bootstrap-table-next';
// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import getLabelText from '../../CommonComponent/getLabelText';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

// import i18n from '../../i18n';
// import { boolean } from 'yup';



// const entityname = i18n.t('static.country.countryMaster');
// export default class CountryListComponent extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             countryList: [],
//             message: '',
//             selCountry: [],
//             loading: true
//         }
//         this.addNewCountry = this.addNewCountry.bind(this);
//         this.editCountry = this.editCountry.bind(this);
//         this.filterData = this.filterData.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.hideFirstComponent = this.hideFirstComponent.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }
//     hideFirstComponent() {
//         this.timeout = setTimeout(function () {
//             document.getElementById('div1').style.display = 'none';
//         }, 8000);
//     }
//     componentWillUnmount() {
//         clearTimeout(this.timeout);
//     }

//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }

//     filterData() {
//         var selStatus = document.getElementById("active").value;
//         if (selStatus != "") {
//             if (selStatus == "true") {
//                 const selCountry = this.state.countryList.filter(c => c.active == true);
//                 this.setState({
//                     selCountry: selCountry
//                 });
//             } else if (selStatus == "false") {
//                 const selCountry = this.state.countryList.filter(c => c.active == false);
//                 this.setState({
//                     selCountry: selCountry
//                 });
//             }

//         } else {
//             this.setState({
//                 selCountry: this.state.countryList
//             });
//         }
//     }


//     addNewCountry() {
//         if (navigator.onLine) {
//             this.props.history.push(`/country/addCountry`)
//         } else {
//             alert("You must be Online.")
//         }

//     }
//     editCountry(country) {
//         if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_COUNTRY')) {
//             console.log(country);
//             this.props.history.push({
//                 pathname: `/country/editCountry/${country.countryId}`,
//                 // state: { country: country }
//             });
//         }
//     }

//     componentDidMount() {
//         this.hideFirstComponent();
//         CountryService.getCountryListAll().then(response => {
//             if (response.status == 200) {
//                 console.log("response--->", response.data);
//                 this.setState({
//                     countryList: response.data,
//                     selCountry: response.data, loading: false
//                 })

//             } else {

//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }
//         })
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

//         const columns = [
//             {
//                 dataField: 'label',
//                 text: i18n.t('static.country.countryMaster'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatLabel
//             },
//             {
//                 dataField: 'countryCode',
//                 text: i18n.t('static.country.countrycode'),
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'countryCode2',
//                 text: 'Country Code2',
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
//             // firstPageText: i18n.t('static.common.first'),
//             // prePageText: i18n.t('static.common.back'),
//             // nextPageText: i18n.t('static.common.next'),
//             // lastPageText: i18n.t('static.common.last'),

//             // nextPageTitle: i18n.t('static.common.firstPage'),
//             // prePageTitle: i18n.t('static.common.prevPage'),
//             // firstPageTitle: i18n.t('static.common.nextPage'),
//             // lastPageTitle: i18n.t('static.common.lastPage'),
//             withFirstAndLast: false,

//             paginationSize: 10,
//             pageStartIndex: 1,
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
//                 text: '100', value: 100
//             },
//                 // {
//                 //     text: 'All', value: this.state.selCountry.length
//                 // }
//             ]
//         }
//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card style={{ display: this.state.loading ? "none" : "block" }}>
//                     <div className="Card-header-addicon">
//                         {/* <i className="icon-menu"></i>{i18n.t('static.country.countrylist')} */}
//                         {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.countrylist')}</strong>{' '} */}

//                         <div className="card-header-actions">
//                             <div className="card-header-action">
//                                 {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MANAGE_COUNTRY') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewCountry}><i className="fa fa-plus-square"></i></a>}
//                             </div>
//                         </div>

//                     </div>
//                     <CardBody className="">
//                         <Col md="3 pl-0">
//                             <FormGroup className="Selectdiv">
//                                 <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
//                                 <div className="controls SelectGo">
//                                     <InputGroup>
//                                         <Input
//                                             type="select"
//                                             name="active"
//                                             id="active"
//                                             bsSize="sm"
//                                             onChange={this.filterData}
//                                         >
//                                             <option value="">{i18n.t('static.common.all')}</option>
//                                             <option value="true">{i18n.t('static.common.active')}</option>
//                                             <option value="false">{i18n.t('static.common.disabled')}</option>

//                                         </Input>
//                                         {/* <InputGroupAddon addonType="append">
//                                             <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
//                                         </InputGroupAddon> */}
//                                     </InputGroup>
//                                 </div>
//                             </FormGroup>
//                         </Col>
//                         <ToolkitProvider
//                             keyField="countryId"
//                             data={this.state.selCountry}
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
//                                             rowEvents={{
//                                                 onClick: (e, row, rowIndex) => {
//                                                     this.editCountry(row);
//                                                 }
//                                             }}
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



//---------------------------JEXCEL CONVERSION FROM BOOTSTRAP-------------------------------//



import React, { Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import CountryService from '../../api/CountryService.js';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import getLabelText from '../../CommonComponent/getLabelText';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import moment from 'moment';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'


import i18n from '../../i18n';
import { boolean } from 'yup';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, JEXCEL_DATE_FORMAT_SM } from '../../Constants.js';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';



const entityname = i18n.t('static.country.countryMaster');

const sortArray = (sourceArray) => {
    // const sortByName = (a, b) => getLabelText(a.label, this.state.lang).localeCompare(getLabelText(b.label, this.state.lang), 'en', { numeric: true });
    const sortByName = (a, b) => a.label.label_en.localeCompare(b.label.label_en, 'en', { numeric: true });
    return sourceArray.sort(sortByName);
};

export default class CountryListComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            countryList: [],
            message: '',
            selCountry: [],
            loading: true,
            lang: localStorage.getItem('lang'),
        }
        this.addNewCountry = this.addNewCountry.bind(this);
        this.editCountry = this.editCountry.bind(this);
        this.filterData = this.filterData.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
    }
    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 30000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    filterData() {
        var selStatus = document.getElementById("active").value;
        if (selStatus != "") {
            if (selStatus == "true") {
                const selCountry = this.state.countryList.filter(c => c.active == true);
                this.setState({
                    selCountry: selCountry
                }, () => {
                    this.buildJExcel();
                });
            } else if (selStatus == "false") {
                const selCountry = this.state.countryList.filter(c => c.active == false);
                this.setState({
                    selCountry: selCountry
                }, () => {
                    this.buildJExcel();
                });
            }

        } else {
            this.setState({
                selCountry: this.state.countryList
            }, () => {
                this.buildJExcel();
            });
        }
    }


    addNewCountry() {
        if (isSiteOnline()) {
            this.props.history.push(`/country/addCountry`)
        } else {
            alert("You must be Online.")
        }

    }
    editCountry(country) {
        if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_COUNTRY')) {
            console.log(country);
            this.props.history.push({
                pathname: `/country/editCountry/${country.countryId}`,
                // state: { country: country }
            });
        }
    }

    buildJExcel() {
        let countryList = this.state.selCountry;
        // console.log("countryList---->", countryList);
        let countryArray = [];
        let count = 0;

        for (var j = 0; j < countryList.length; j++) {
            data = [];
            data[0] = countryList[j].countryId
            data[1] = getLabelText(countryList[j].label, this.state.lang)
            data[2] = countryList[j].countryCode;
            data[3] = countryList[j].countryCode2;
            data[4] = countryList[j].lastModifiedBy.username;
            data[5] = (countryList[j].lastModifiedDate ? moment(countryList[j].lastModifiedDate).format("YYYY-MM-DD") : null)
            data[6] = countryList[j].active;

            countryArray[count] = data;
            count++;
        }
        // if (countryList.length == 0) {
        //     data = [];
        //     countryArray[0] = data;
        // }
        // console.log("countryArray---->", countryArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = countryArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [0, 120, 150, 100, 100, 100, 100, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: 'countryId',
                    type: 'hidden',
                    readOnly: true
                },
                {
                    title: i18n.t('static.country.countryMaster'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.country.countrycode'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.country.countrycode2'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedBy'),
                    type: 'text',
                    // readOnly: true
                },
                {
                    title: i18n.t('static.common.lastModifiedDate'),
                    type: 'calendar',
                    // readOnly: true,
                    options: { format: JEXCEL_DATE_FORMAT_SM }
                },
                {
                    type: 'dropdown',
                    title: i18n.t('static.common.status'),
                    // readOnly: true,
                    source: [
                        { id: true, name: i18n.t('static.common.active') },
                        { id: false, name: i18n.t('static.common.disabled') }
                    ]
                },
            ],
            // text: {
            //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
            //     show: '',
            //     entries: '',
            // },
            onload: this.loaded,
            editable: false,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            // tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onselection: this.selected,
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
        var countryEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = countryEl;
        this.setState({
            countryEl: countryEl, loading: false
        })
    }

    componentDidMount() {
        this.hideFirstComponent();
        CountryService.getCountryListAll().then(response => {
            if (response.status == 200) {
                console.log("response.data---->", response.data)
                // this.setState({
                //     countryList: response.data,
                //     selCountry: response.data, loading: false
                // })
                var listArray = response.data;

                if (listArray.length > 0) {
                    sortArray(listArray);
                }
                this.setState({
                    countryList: listArray,
                    selCountry: listArray
                },
                    () => {
                        this.buildJExcel();

                    })

            } else {

                this.setState({
                    message: response.data.messageCode, loading: false
                },
                    () => {
                        this.hideSecondComponent();
                    })
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
    selected = function (instance, cell, x, y, value) {

        if ((x == 0 && value != 0) || (y == 0)) {
            // console.log("HEADER SELECTION--------------------------");
        } else {
            // console.log("Original Value---->>>>>", this.el.getValueFromCoords(0, x));
            if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_COUNTRY')) {
                this.props.history.push({
                    pathname: `/country/editCountry/${this.el.getValueFromCoords(0, x)}`,
                });
            }
        }
    }.bind(this);
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );

        return (
            <div className="animated">
                {/* <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} /> */}
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div className="Card-header-addicon">
                        {/* <i className="icon-menu"></i>{i18n.t('static.country.countrylist')} */}
                        {/* <i className="icon-menu"></i><strong>{i18n.t('static.dashboard.countrylist')}</strong>{' '} */}

                        <div className="card-header-actions">
                            <div className="card-header-action">
                                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_COUNTRY') && <a href="javascript:void();" title={i18n.t('static.common.addEntity', { entityname })} onClick={this.addNewCountry}><i className="fa fa-plus-square"></i></a>}
                            </div>
                        </div>

                    </div>
                    <CardBody className="pb-lg-0 pt-lg-0">
                        <Col md="3 pl-0">
                            <FormGroup className="Selectdiv mt-md-2 mb-md-0">
                                <Label htmlFor="appendedInputButton">{i18n.t('static.common.status')}</Label>
                                <div className="controls SelectGo">
                                    <InputGroup>
                                        <Input
                                            type="select"
                                            name="active"
                                            id="active"
                                            bsSize="sm"
                                            onChange={this.filterData}
                                        >
                                            <option value="">{i18n.t('static.common.all')}</option>
                                            <option value="true">{i18n.t('static.common.active')}</option>
                                            <option value="false">{i18n.t('static.common.disabled')}</option>

                                        </Input>
                                        {/* <InputGroupAddon addonType="append">
                                            <Button color="secondary Gobtn btn-sm" onClick={this.filterData}>{i18n.t('static.common.go')}</Button>
                                        </InputGroupAddon> */}
                                    </InputGroup>
                                </div>
                            </FormGroup>
                        </Col>


                        <div id="tableDiv" className={AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_EDIT_COUNTRY') ? "jexcelremoveReadonlybackground RowClickable" : "jexcelremoveReadonlybackground"} style={{ display: this.state.loading ? "none" : "block" }}>
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

                    </CardBody>
                </Card>
            </div>
        );
    }

}