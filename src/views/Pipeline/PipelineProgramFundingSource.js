import React, { Component } from 'react';
import jexcel from 'jspreadsheet-pro';
import "../../../node_modules/jspreadsheet-pro/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import FundingSourceService from '../../api/FundingSourceService'
import i18n from '../../i18n';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import { textFilter } from 'react-bootstrap-table2-filter';
import { jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunction, jExcelLoadedFunctionPipeline } from '../../CommonComponent/JExcelCommonFunctions.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants.js';
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
        //this.dropdownFilter = this.dropdownFilter.bind(this);
        this.startLoading=this.startLoading.bind(this);
        this.stopLoading=this.stopLoading.bind(this);
    }

    startLoading(){
        this.setState({loading:true});
    }
    stopLoading(){
        this.setState({loading:false});
    }

    loaded() {
        var list = this.state.fundingSourceList;
        var json = this.el.getJson(null,false);

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

    changed = function (instance, cell, x, y, value) {


        //Planning Unit
        if (x == 1) {
            var json = this.el.getJson(null,false);
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {

                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

            }
            // var columnName = jexcel.getColumnNameFromId([x + 1, y]);
            // instance.jexcel.setValue(columnName, '');
        }


    }

    checkValidation() {

        var reg = /^[0-9\b]+$/;
        var regDec = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;

        var valid = true;
        var json = this.el.getJson(null,false);
        for (var y = 0; y < json.length; y++) {
            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValue(`B${parseInt(y) + 1}`, true);

            var currentFundingSource = this.el.getRowData(y)[1];

            if (value == "" || value==undefined) {
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

    saveFundingSource() {
        var list = this.state.fundingSourceList;
        var json = this.el.getJson(null,false);
        var fundingSourceArray = []
        console.log(json.length)
        console.log(json)
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var fundingSourceId = map.get("1");
            if (fundingSourceId != "" && !isNaN(parseInt(fundingSourceId))) {
                fundingSourceId = map.get("1");
            } else {
                fundingSourceId = list[i].id;
            }

            var fundingSourceJson = {
                // pipelineId: {
                //     id: this.props.pipelineId
                // },
                // active: true,

                fundingSourceId: fundingSourceId,
                pipelineFundingSourceId: map.get("2")


            }
            fundingSourceArray.push(fundingSourceJson);
        }
        return fundingSourceArray;

    }


    componentDidMount() {
        var FundingSourceListQat = [];
        // var activeDataSourceList=[];
        // AuthenticationService.setupAxiosInterceptors();
        FundingSourceService.getFundingSourceListAll()
            .then(response => {
                if (response.status == 200) {
                    // dataSourceListQat = response.data
                    this.setState({ activeDataSourceList: response.data });
                    for (var k = 0; k < (response.data).length; k++) {
                        var dataSourceJson = {
                            name: response.data[k].label.label_en,
                            id: response.data[k].fundingSourceId
                        }
                        FundingSourceListQat.push(dataSourceJson);
                    }
                    this.setState({ FundingSourceListQat: FundingSourceListQat });


                    // AuthenticationService.setupAxiosInterceptors();
                    PipelineService.getQatTempFundingSourceList(this.props.pipelineId)
                        .then(response => {
                            if (response.status == 200) {
                                if (response.data.length > 0) {

                                    var fundingSourceList = response.data;
                                    var data = [];
                                    var productDataArr = []
                                    //seting this for loaded function
                                    this.setState({ fundingSourceList: fundingSourceList });
                                    //seting this for loaded function
                                    if (fundingSourceList.length != 0) {
                                        for (var j = 0; j < fundingSourceList.length; j++) {
                                            data = [];

                                            data[0] = fundingSourceList[j].pipelineFundingSource;
                                            data[1] = fundingSourceList[j].fundingSourceId;
                                            data[2] = fundingSourceList[j].pipelineFundingSourceId;
                                            productDataArr.push(data);

                                        }
                                    } else {
                                        console.log("fundingsource list length is 0.");
                                    }

                                    this.el = jexcel(document.getElementById("mapFundingSource"), '');
                                    this.el.destroy();
                                    var json = [];
                                    var data = productDataArr;
                                    // var data = []
                                    var options = {
                                        data: data,
                                        columnDrag: true,
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
                                                //filter: this.dropdownFilter
                                            }, {
                                                title: i18n.t('static.inventory.fundingSource'),
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
                                        tableOverflow: true,
                                        wordWrap: true,
                                        paginationOptions: JEXCEL_PAGINATION_OPTION,
                                        // position: 'top',
                                        allowInsertColumn: false,
                                        allowManualInsertColumn: false,
                                        allowDeleteRow: false,
                                        onchange: this.changed,
                                        oneditionend: this.onedit,
                                        copyCompatibility: true,
                                        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                        text: {
                                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
                                            show: '',
                                            entries: '',
                                        },
                                        onload: this.loadedJexcelCommonFunction,
                                        license: JEXCEL_PRO_KEY,
                                        // onload: this.loaded

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

    loadedJexcelCommonFunction = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionPipeline(instance, 0);
    }

    render() {
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive" style={{ display: this.state.loading ? "none" : "block" }} >

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
