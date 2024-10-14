import jexcel from 'jspreadsheet';
import React, { Component } from 'react';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunctionPipeline } from '../../CommonComponent/JExcelCommonFunctions.js';
import { API_URL, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
import FundingSourceService from '../../api/FundingSourceService';
import PipelineService from '../../api/PipelineService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * Component for pipeline program import funding source details
 */
export default class PipelineProgramFundingSource extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fundingSourceList: [],
            mapFundingSourceEl: '',
            loading: true
        }
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.saveFundingSource = this.saveFundingSource.bind(this);
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
     * This function is used to format the table like add asterisk or info to the table headers
     */
    loaded() {
        var list = this.state.fundingSourceList;
        var json = this.el.getJson(null, false);
        for (var y = 0; y < json.length; y++) {
            var col = ("B").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[1]).toString();
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].pipelineFundingSource).concat(i18n.t('static.message.notExist')));
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
        if (x == 1) {
            var json = this.el.getJson(null, false);
            var col = ("B").concat(parseInt(y) + 1);
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
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValue(`B${parseInt(y) + 1}`, true);
            var currentFundingSource = this.el.getRowData(y)[1];
            if (value == "" || value == undefined) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        return valid;
    }
    /**
     * Function to handle form submission and save the data on server.
     */
    saveFundingSource() {
        var list = this.state.fundingSourceList;
        var json = this.el.getJson(null, false);
        var fundingSourceArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var fundingSourceId = map.get("1");
            if (fundingSourceId != "" && !isNaN(parseInt(fundingSourceId))) {
                fundingSourceId = map.get("1");
            } else {
                fundingSourceId = list[i].id;
            }
            var fundingSourceJson = {
                fundingSourceId: fundingSourceId,
                pipelineFundingSourceId: map.get("2")
            }
            fundingSourceArray.push(fundingSourceJson);
        }
        return fundingSourceArray;
    }
    /**
     * Reterives funding source list on component mount
     */
    componentDidMount() {
        var FundingSourceListQat = [];
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({ activeDataSourceList: response.data });
                    for (var k = 0; k < (response.data).length; k++) {
                        var dataSourceJson = {
                            name: response.data[k].label.label_en,
                            id: response.data[k].fundingSourceId
                        }
                        FundingSourceListQat.push(dataSourceJson);
                    }
                    this.setState({ FundingSourceListQat: FundingSourceListQat });
                    PipelineService.getQatTempFundingSourceList(this.props.pipelineId)
                        .then(response => {
                            if (response.status == 200) {
                                if (response.data.length > 0) {
                                    var fundingSourceList = response.data;
                                    var data = [];
                                    var productDataArr = []
                                    this.setState({ fundingSourceList: fundingSourceList });
                                    if (fundingSourceList.length != 0) {
                                        for (var j = 0; j < fundingSourceList.length; j++) {
                                            data = [];
                                            data[0] = fundingSourceList[j].pipelineFundingSource;
                                            data[1] = fundingSourceList[j].fundingSourceId;
                                            data[2] = fundingSourceList[j].pipelineFundingSourceId;
                                            productDataArr.push(data);
                                        }
                                    } else {
                                    }
                                    this.el = jexcel(document.getElementById("mapFundingSource"), '');
                                    jexcel.destroy(document.getElementById("mapFundingSource"), true);
                                    var json = [];
                                    var data = productDataArr;
                                    var options = {
                                        data: data,
                                        columnDrag: false,
                                        colWidths: [250, 250],
                                        columns: [
                                            {
                                                title: i18n.t('static.pipeline.pplnfundingsource'),
                                                type: 'text',
                                                readonly: true
                                            },
                                            {
                                                title: i18n.t('static.budget.fundingsource'),
                                                type: 'autocomplete',
                                                source: FundingSourceListQat,
                                            }, {
                                                title: i18n.t('static.inventory.fundingSource'),
                                                type: 'hidden',
                                                // title: 'A',
                                                // type: 'text',
                                                // visible: false,
                                                readonly: true
                                            }
                                        ],
                                        editable: true,
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
                                        onload: this.loadedJexcelCommonFunction,
                                        license: JEXCEL_PRO_KEY,
                                    };
                                    var elVar = jexcel(document.getElementById("mapFundingSource"), options);
                                    this.el = elVar;
                                    this.loaded();
                                    this.setState({
                                        loading: false
                                    })
                                }
                            } else {
                                this.setState({ message: response.data.messageCode, loading: false })
                            }
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
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedJexcelCommonFunction = function (instance, cell) {
        jExcelLoadedFunctionPipeline(instance, 0);
    }
    /**
     * Renders the pipeline program import funding source details screen.
     * @returns {JSX.Element} - Pipeline program import funding source details screen.
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
                <div className="table-responsive consumptionDataEntryTable" style={{ display: this.state.loading ? "none" : "block" }} >
                    <div id="mapFundingSource">
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
