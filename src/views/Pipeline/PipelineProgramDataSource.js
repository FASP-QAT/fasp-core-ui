import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunctionPipeline } from '../../CommonComponent/JExcelCommonFunctions.js';
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import DataSourceService from '../../api/DataSourceService';
import DataSourceTypeService from '../../api/DataSourceTypeService';
import PipelineService from '../../api/PipelineService.js';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * Component for pipeline program import data source details
 */
export default class PipelineProgramDataSource extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSourceList: [],
            mapDataSourceEl: '',
            loading: true
        }
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.saveDataSource = this.saveDataSource.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
        this.startLoading = this.startLoading.bind(this);
        this.stopLoading = this.stopLoading.bind(this);
    }
    /**
     * Sets loading to true
     */
    startLoading() {
        this.setState({ loading: true });
    }
    /**
     * Sets loading to false
     */
    stopLoading() {
        this.setState({ loading: false });
    }
    /**
     * Function to filter data source based on data source type
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The jexcel cell object.
     * @param {number} c - Column index.
     * @param {number} r - Row index.
     * @param {Array} source - The source array for autocomplete options (unused).
     * @returns {Array} - Returns an array of active countries.
     */
    dropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (this.state.mapDataSourceEl.getJson(null, false)[r])[c - 1];
        var puList = (this.state.activeDataSourceList).filter(c => c.dataSourceType.id == value);
        for (var k = 0; k < puList.length; k++) {
            var planningUnitJson = {
                name: puList[k].label.label_en,
                id: puList[k].dataSourceId
            }
            mylist.push(planningUnitJson);
        }
        return mylist;
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     */
    loaded() {
        var list = this.state.dataSourceList;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var col = ("D").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[3]).toString();
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].pipelineDataSource).concat(i18n.t('static.message.notExist')));
            }
        }
    }
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changed = function (instance, cell, x, y, value) {
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 3) {
            var json = this.el.getJson(null, false);
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
    }
    /**
     * Function to check validation of the jexcel table.
     * @returns {boolean} - True if validation passes, false otherwise.
     */
    checkValidation() {
        var reg = /^[0-9\b]+$/;
        var regDec = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
        var valid = true;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValue(`D${parseInt(y) + 1}`, true);
            var currentDataSource = this.el.getRowData(y)[1];
            if (value == "" || value == undefined) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var dataSourceValue = map.get("3");
                    if (dataSourceValue == currentDataSource && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.planningUnitAlreadyExists'));
                        i = json.length;
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
        }
        return valid;
    }
    /**
     * Function to handle form submission and save the data on server.
     */
    saveDataSource() {
        var list = this.state.dataSourceList;
        var json = this.el.getJson(null, false);
        var dataSourceArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var dataSourceId = map.get("3");
            if (dataSourceId != "" && !isNaN(parseInt(dataSourceId))) {
                dataSourceId = map.get("3");
            } else {
                dataSourceId = list[i].id;
            }
            var dataSourceJson = {
                dataSourceId: dataSourceId,
                pipelineDataSourceId: map.get("4")
            }
            dataSourceArray.push(dataSourceJson);
        }
        return dataSourceArray;
    }
    /**
     * Reterives data source type, data source, pipeline data source list and builds jexcel table on component mount
     */
    componentDidMount() {
        var dataSourceTypeList = [];
        DataSourceTypeService.getDataSourceTypeListActive(AuthenticationService.getRealmId())
            .then(response => {
                for (var k = 0; k < (response.data).length; k++) {
                    var dataSourceTypeJson = {
                        name: (response.data[k].label.label_en),
                        id: response.data[k].dataSourceTypeId
                    }
                    dataSourceTypeList.push(dataSourceTypeJson);
                }
                var DataSourceListQat = [];
                DataSourceService.getAllDataSourceList()
                    .then(response => {
                        if (response.status == 200) {
                            this.setState({ activeDataSourceList: response.data });
                            for (var k = 0; k < (response.data).length; k++) {
                                var dataSourceJson = {
                                    name: response.data[k].label.label_en,
                                    id: response.data[k].dataSourceId
                                }
                                DataSourceListQat.push(dataSourceJson);
                            }
                            this.setState({ DataSourceListQat: DataSourceListQat });
                            PipelineService.getQatTempDataSourceList(this.props.pipelineId)
                                .then(response => {
                                    if (response.status == 200) {
                                        if (response.data.length > 0) {
                                            var dataSourceList = response.data;
                                            var data = [];
                                            var productDataArr = []
                                            this.setState({ dataSourceList: dataSourceList });
                                            if (dataSourceList.length != 0) {
                                                for (var j = 0; j < dataSourceList.length; j++) {
                                                    data = [];
                                                    data[0] = dataSourceList[j].pipelineDataSourceType;
                                                    data[1] = dataSourceList[j].pipelineDataSource;
                                                    data[2] = dataSourceList[j].dataSourceTypeId;
                                                    data[3] = dataSourceList[j].dataSourceId;
                                                    data[4] = dataSourceList[j].pipelineDataSourceId;
                                                    productDataArr.push(data);
                                                }
                                            } else {
                                            }
                                            this.el = jexcel(document.getElementById("mapDataSource"), '');
                                            jexcel.destroy(document.getElementById("mapDataSource"), true);
                                            var json = [];
                                            var data = productDataArr;
                                            var options = {
                                                data: data,
                                                columnDrag: false,
                                                colWidths: [160, 190, 190, 190],
                                                columns: [
                                                    {
                                                        title: i18n.t('static.pipeline.pplndatasourcetype'),
                                                        type: 'text',
                                                        readonly: true
                                                    }, {
                                                        title: i18n.t('static.pipeline.pplndatasource'),
                                                        type: 'text',
                                                        readonly: true
                                                    },
                                                    {
                                                        title: i18n.t('static.datasource.datasourcetype'),
                                                        type: 'dropdown',
                                                        source: dataSourceTypeList,
                                                    },
                                                    {
                                                        title: i18n.t('static.dashboard.datasourcehaeder'),
                                                        type: 'autocomplete',
                                                        source: DataSourceListQat,
                                                        filter: this.dropdownFilter
                                                    }, {
                                                        title: i18n.t('static.inventory.dataSource'),
                                                        type: 'hidden',
                                                        readonly: true
                                                    }
                                                ],
                                                pagination: localStorage.getItem("sesRecordCount"),
                                                filters: true,
                                                contextMenu: function (obj, x, y, e) {
                                                    return false;
                                                }.bind(this),
                                                search: true,
                                                columnSorting: true,
                                                wordWrap: true,
                                                paginationOptions: JEXCEL_PAGINATION_OPTION,
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onchange: this.changed,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
                                                editable: true,
                                                onload: this.loadedJexcelCommonFunction,
                                                license: JEXCEL_PRO_KEY,
                                            };
                                            var elVar = jexcel(document.getElementById("mapDataSource"), options);
                                            this.el = elVar;
                                            this.loaded();
                                            this.setState({
                                                loading: false,
                                                mapDataSourceEl: elVar
                                            })
                                        }
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
            })
            .catch(
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
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedJexcelCommonFunction = function (instance, cell) {
        jExcelLoadedFunctionPipeline(instance, 0);
    }
    /**
     * Renders the pipeline program import data source details screen.
     * @returns {JSX.Element} - Pipeline program import data source details screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }}>
                    <div id="mapDataSource">
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
            </>
        );
    }
}
