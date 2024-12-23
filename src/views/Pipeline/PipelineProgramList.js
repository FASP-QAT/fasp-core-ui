import jexcel from 'jspreadsheet';
import moment from 'moment';
import React, { Component } from 'react';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import { Search } from 'react-bootstrap-table2-toolkit';
import { Card, CardBody } from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import PipelineService from '../../api/PipelineService';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { hideFirstComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.dashboard.pipelineProgramImport');
/**
 * Component for list of pipeline programs.
 */
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
        this.buildJExcel = this.buildJExcel.bind(this);
    }
    /**
     * Clears the timeout when the component is unmounted.
     */
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }
    /**
     * Formats a date cell in a specific format.
     * @param {string} cell - The date value to be formatted.
     * @param {Object} row - The row object containing the cell value.
     * @returns {string} The formatted date string or an empty string if the cell value is null or empty.
     */
    formatDate(cell, row) {
        if (cell != null && cell != "") {
            var modifiedDate = moment(cell).format(`${DATE_FORMAT_CAP}`);
            return modifiedDate;
        } else {
            return "";
        }
    }
    /**
     * Builds the jexcel component to display role list.
     */
    buildJExcel() {
        let pipelineProgramList = this.state.pipelineProgramList;;
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
        this.el = jexcel(document.getElementById("tableDiv"), '');
        jexcel.destroy(document.getElementById("tableDiv"), true);
        var json = [];
        var data = pipelineProgramArray;
        var options = {
            data: data,
            columnDrag: false,
            colWidths: [150, 150, 100],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                {
                    title: i18n.t('static.pipelineProgram.programId'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.pipelineProgram.user'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.pipelineProgram.fileName'),
                    type: 'text',
                },
                {
                    title: i18n.t('static.pipelineProgram.importDate'),
                    type: 'text',
                },
            ],
            editable: false,
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            filters: true,
            search: true,
            columnSorting: true,
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
            license: JEXCEL_PRO_KEY, allowRenameColumn: false,
        };
        var languageEl = jexcel(document.getElementById("tableDiv"), options);
        this.el = languageEl;
        this.setState({
            languageEl: languageEl, loading: false
        })
    }
    /**
     * Redirects to the edit pipeline program setup screen on row click.
     */
    selected = function (instance, x1, y1, x2, y2, value) {
        if (y1 == y2) {
            this.props.history.push({
                pathname: `/pipeline/pieplineProgramSetup/${this.el.getValueFromCoords(0, y1)}`,
            });
        }
    }.bind(this);
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }
    /**
     * Reterives pipeline program list on component mount
     */
    componentDidMount() {
        hideFirstComponent();
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
                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                        loading: false
                    });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 401:
                            this.props.history.push(`/login/static.message.sessionExpired`)
                            break;
                        case 409:
                            this.setState({
                                message: i18n.t('static.common.accessDenied'),
                                loading: false,
                                color: "#BA0C2F",
                            });
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
    /**
     * Redirects to the pipeline program setup page with the specified program ID.
     * @param {Object} program - The pipeline program object containing the PIPELINE_ID.
     */
    getPipelineProgramInfo(program) {
        this.props.history.push({
            pathname: `/pipeline/pieplineProgramSetup/${program.PIPELINE_ID}`,
        });
    }
    /**
     * Redirects to the pipeline program import page if the session type is 'Online'.
     * Displays an alert message if the session type is not 'Online'.
     */
    importNewProgram() {
        if (localStorage.getItem("sessionType") === 'Online') {
            this.props.history.push(`/pipeline/pipelineProgramImport`)
        } else {
            alert("You must be Online.")
        }
    }
    /**
     * Formats the label using the getLabelText function and the language stored in the component's state.
     * @param {any} cell - The cell value to be formatted.
     * @param {object} row - The row object containing the cell value.
     * @returns {string} The formatted label.
     */
    formatLabel(cell, row) {
        return getLabelText(cell, this.state.lang);
    }
    /**
     * Renders the pipeline program list screen.
     * @returns {JSX.Element} - Pipeline program list screen.
     */
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
            },
            {
                dataField: 'FILE_NAME',
                text: i18n.t('static.pipelineProgram.fileName'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
            },
            {
                dataField: 'CREATED_DATE',
                text: i18n.t('static.pipelineProgram.importDate'),
                sort: true,
                align: 'center',
                headerAlign: 'center',
                formatter: this.formatDate
            },
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
                        <div className="card-header-actions">
                            <div className="card-header-action">
                                <a href="javascript:void();" title={i18n.t('static.importProgram.importNewProgram')} onClick={this.importNewProgram}><i className="fa fa-plus-square"></i></a>
                            </div>
                        </div>
                    </div>
                    <CardBody className="pb-lg-2 pt-lg-0">
                        <div className='consumptionDataEntryTable'>
                            <div id="tableDiv" className="jexcelremoveReadonlybackground RowClickable" style={{ display: this.state.loading ? "none" : "block" }}>
                            </div>
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