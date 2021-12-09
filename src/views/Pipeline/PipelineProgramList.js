// import React, { Compoent, Component } from 'react';
// import AuthenticationService from '../Common/AuthenticationService.js';
// import PipelineService from '../../api/PipelineService';
// import { NavLink } from 'react-router-dom'
// import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';

// import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
// import data from '../Tables/DataTable/_data';
// import i18n from '../../i18n';
// import getLabelText from '../../CommonComponent/getLabelText'
// import BootstrapTable from 'react-bootstrap-table-next';
// import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
// import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator'
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// import { DATE_FORMAT_CAP } from '../../Constants.js'
// import moment from 'moment';


// const entityname = i18n.t('static.dashboard.pipelineProgramImport');
// export default class PipelineProgramList extends Component {


//     constructor(props) {
//         super(props);
//         this.state = {
//             pipelineProgramList: [],
//             message: '',
//             lang: localStorage.getItem('lang'),

//         }
//         this.getPipelineProgramInfo = this.getPipelineProgramInfo.bind(this);
//         this.importNewProgram = this.importNewProgram.bind(this);
//         this.formatLabel = this.formatLabel.bind(this);
//         this.formatDate = this.formatDate.bind(this);
//         this.hideFirstComponent = this.hideFirstComponent.bind(this);
//     }

//     hideFirstComponent() {
//         this.timeout = setTimeout(function () {
//         document.getElementById('div1').style.display = 'none';
//         }, 8000);
//         }
//         componentWillUnmount() {
//         clearTimeout(this.timeout);
//         }

//     formatDate(cell, row) {
//         if (cell != null && cell != "") {
//             var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
//             return modifiedDate;
//         } else {
//             return "";
//         }
//     }

//     componentDidMount() {
//         this.hideFirstComponent();
//         AuthenticationService.setupAxiosInterceptors();
//         PipelineService.getPipelineProgramList().then(response => {
//             if (response.status == 200) {
//                 this.setState({
//                     pipelineProgramList: response.data,

//                 })
//             } else {
//                 this.setState({ message: response.data.messageCode })
//             }
//         })
//     }

//     getPipelineProgramInfo(program) {
//         this.props.history.push({
//             pathname: `/pipeline/pieplineProgramSetup/${program.PIPELINE_ID}`,
//             // pathname: '/pipeline/pieplineProgramSetup',
//         });

//     }

//     importNewProgram() {

//         if (navigator.onLine) {
//             this.props.history.push(`/pipeline/pipelineProgramImport`)
//         } else {
//             alert("You must be Online.")
//         }

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
//                 dataField: 'PIPELINE_ID',
//                 text: 'Program Id',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center'
//             },
//             {
//                 dataField: 'USERNAME',
//                 text: 'User',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 // formatter: this.formatLabel
//             },

//             {
//                 dataField: 'FILE_NAME',
//                 text: 'File Name',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 // formatter: this.formatLabel
//             },
//             {
//                 dataField: 'CREATED_DATE',
//                 text: 'Import Date',
//                 sort: true,
//                 align: 'center',
//                 headerAlign: 'center',
//                 formatter: this.formatDate
//             },
//             // {
//             //     dataField: 'STATUS',
//             //     text: 'Status',
//             //     align: 'center',
//             //     headerAlign: 'center',

//             // }
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
//                 text: 'All', value: this.state.pipelineProgramList.length
//             }]
//         }

//         return (
//             <div className="animated">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />

//                 <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
//                 <h5>{i18n.t(this.state.message, { entityname })}</h5>
//                 <Card>
//                     <div  style={{padding:'4px 20px 2px 20px'}}>
//                         {/* <i className="icon-menu"></i><strong>Programs</strong>{' '} */}

//                         <div className="card-header-actions">
//                             <div className="card-header-action">
//                                 <a href="javascript:void();" title="Import New program" onClick={this.importNewProgram}><i className="fa fa-plus-square"></i></a>
//                             </div>
//                         </div>
//                     </div>
//                     <CardBody className="pb-lg-2 pt-lg-0">
//                         <ToolkitProvider
//                             keyField="pipelineId"
//                             data={this.state.pipelineProgramList}
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
//                                                     this.getPipelineProgramInfo(row);
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
//             </div>
//         );
//     }

// } 

import React, { Compoent, Component } from 'react';
import AuthenticationService from '../Common/AuthenticationService.js';
import PipelineService from '../../api/PipelineService';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody, FormGroup, Input, InputGroup, InputGroupAddon, Label, Button, Col } from 'reactstrap';

import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import data from '../Tables/DataTable/_data';
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText'
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter, selectFilter, multiSelectFilter } from 'react-bootstrap-table2-filter';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { DATE_FORMAT_CAP, JEXCEL_PRO_KEY } from '../../Constants.js'
import moment from 'moment';
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { JEXCEL_PAGINATION_OPTION } from '../../Constants.js';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';


const entityname = i18n.t('static.dashboard.pipelineProgramImport');
export default class PipelineProgramList extends Component {


    constructor(props) {
        super(props);
        this.state = {
            pipelineProgramList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            loading: true

        }
        this.getPipelineProgramInfo = this.getPipelineProgramInfo.bind(this);
        this.importNewProgram = this.importNewProgram.bind(this);
        this.formatLabel = this.formatLabel.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.buildJExcel = this.buildJExcel.bind(this);
    }

    hideFirstComponent() {
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    formatDate(cell, row) {
        if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
            return modifiedDate;
        } else {
            return "";
        }
    }

    buildJExcel() {
        let pipelineProgramList = this.state.pipelineProgramList;;
        // console.log("pipelineProgramList---->", pipelineProgramList);
        let pipelineProgramArray = [];
        let count = 0;

        for (var j = 0; j < pipelineProgramList.length; j++) {
            data = [];
            data[0] = pipelineProgramList[j].PIPELINE_ID
            data[1] = pipelineProgramList[j].USERNAME;
            data[2] = pipelineProgramList[j].FILE_NAME;
            data[3] = this.formatDate(pipelineProgramList[j].CREATED_DATE);

            pipelineProgramArray[count] = data;
            count++;
        }
        // if (pipelineProgramList.length == 0) {
        //     data = [];
        //     pipelineProgramArray[0] = data;
        // }
        // console.log("pipelineProgramArray---->", pipelineProgramArray);
        this.el = jexcel(document.getElementById("tableDiv"), '');
        this.el.destroy();
        var json = [];
        var data = pipelineProgramArray;

        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [

                {
                    title: i18n.t('static.pipelineProgram.programId'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.pipelineProgram.user'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.pipelineProgram.fileName'),
                    type: 'text',
                    readOnly: true
                },
                {
                    title: i18n.t('static.pipelineProgram.importDate'),
                    type: 'text',
                    readOnly: true
                },

            ],
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
                show: '',
                entries: '',
            },
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
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
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            contextMenu: function (obj, x, y, e) {
                return false;
            }.bind(this),
            license: JEXCEL_PRO_KEY,
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }

    selected = function (instance, x1, y1, x2, y2, value) {
        console.log("Original Value---->>>>>", x1, "---------->", x2);
        console.log("Original Value---->>>>>", y1, "---------->", y2);
        if (y1 == y2) {
            this.props.history.push({
                pathname: `/pipeline/pieplineProgramSetup/${this.el.getValueFromCoords(0, y1)}`,
            });
        }
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    componentDidMount() {
        this.hideFirstComponent();
        // AuthenticationService.setupAxiosInterceptors();
        PipelineService.getPipelineProgramList().then(response => {
            if (response.status == 200) {
                this.setState({
                    pipelineProgramList: response.data
                }, () => {
                    this.buildJExcel();
                });
            } else {
                this.setState({ message: response.data.messageCode, loading: false })
            }
        }).catch(
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

    getPipelineProgramInfo(program) {
        this.props.history.push({
            pathname: `/pipeline/pieplineProgramSetup/${program.PIPELINE_ID}`,
            // pathname: '/pipeline/pieplineProgramSetup',
        });

    }

    importNewProgram() {

        if (isSiteOnline()) {
            this.props.history.push(`/pipeline/pipelineProgramImport`)
        } else {
            alert("You must be Online.")
        }

    }



    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }
    render() {

        const { SearchBar, ClearSearchButton } = Search;
        const customTotal = (from, to, size) => (
            <span className="react-bootstrap-table-pagination-total">
                {i18n.t('static.common.result', { from, to, size })}
            </span>
        );
        const columns = [
            {
                dataField: 'PIPELINE_ID',
                text: i18n.t('static.pipelineProgram.programId'),
                sort: true,
                align: 'center',
                headerAlign: 'center'
            },
            {
                dataField: 'USERNAME',
                text: i18n.t('static.pipelineProgram.user'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },

            {
                dataField: 'FILE_NAME',
                text: i18n.t('static.pipelineProgram.fileName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                // formatter: this.formatLabel
            },
            {
                dataField: 'CREATED_DATE',
                text: i18n.t('static.pipelineProgram.importDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
            // {
            //     dataField: 'STATUS',
            //     text: 'Status',
            //     align: 'center',
            //     headerAlign: 'center',

            // }
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
                text: 'All', value: this.state.pipelineProgramList.length
            }]
        }

        return (
            <div className="animated">
                <AuthenticationServiceComponent history={this.props.history} />

                <h5 className={this.props.match.params.color} id="div1">{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <div style={{ padding: '4px 20px 2px 20px' }}>
                        {/* <i className="icon-menu"></i><strong>Programs</strong>{' '} */}

                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.importProgram.importNewProgram')} onClick={this.importNewProgram}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        <div id="tableDiv" className="jexcelremoveReadonlybackground RowClickable" style={{ display: this.state.loading ? "none" : "block" }}>
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