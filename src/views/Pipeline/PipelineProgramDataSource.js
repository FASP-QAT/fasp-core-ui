import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import DataSourceService from '../../api/DataSourceService'
import i18n from '../../i18n';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import { textFilter } from 'react-bootstrap-table2-filter';
import { jExcelLoadedFunctionWithoutPagination, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
import DataSourceTypeService from '../../api/DataSourceTypeService';

export default class PipelineProgramDataSource extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSourceList: [],
            mapDataSourceEl: '',
        }
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.saveDataSource = this.saveDataSource.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
    }
    
  
    dropdownFilter = function (instance, cell, c, r, source) {
        console.log('activeDataSourceList',this.state.activeDataSourceList)
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[c - 1];
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
    loaded() {
        var list = this.state.dataSourceList;
        var json = this.el.getJson();

        for (var y = 0; y < json.length; y++) {
            var col = ("D").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[3]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].pipelineDataSource).concat(" Does not exist."));
            }
        }

    }

    changed = function (instance, cell, x, y, value) {
      

        //Planning Unit
        if (x == 3) {
            var json = this.el.getJson();
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var dataSourceValue = map.get("3");
                    if (dataSourceValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, "Planning Unit aready exist");
                        i = json.length;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }
            }
            // var columnName = jexcel.getColumnNameFromId([x + 1, y]);
            // instance.jexcel.setValue(columnName, '');
        }
        
       
    }

    checkValidation() {

        var reg = /^[0-9\b]+$/;
        var regDec = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;

        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);

            var currentDataSource = this.el.getRowData(y)[1];

            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                // this.el.setStyle(col, "background-color", "transparent");
                // this.el.setComments(col, "");
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var dataSourceValue = map.get("3");
                    // console.log("currentvalues---", currentDataSource);
                    // console.log("dataSourceValue-->", dataSourceValue);
                    if (dataSourceValue == currentDataSource && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, "Planning Unit aready exist");
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

    saveDataSource() {
        var list = this.state.DataSourceList;
        var json = this.el.getJson();
        var dataSourceArray = []
        console.log(json.length)
        console.log(json)
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var dataSourceId = map.get("3");
            if (dataSourceId != "" && !isNaN(parseInt(dataSourceId))) {
                dataSourceId = map.get("3");
            } else {
                dataSourceId = list[i].id;
            }

            var dataSourceJson = {
                // pipelineId: {
                //     id: this.props.pipelineId
                // },
                // active: true,
                
                dataSourceId: dataSourceId,
               pipelineDataSourceId:map.get("4")
               

            }
            dataSourceArray.push(dataSourceJson);
        }
        return dataSourceArray;

    }


    componentDidMount() {
        var dataSourceTypeList = [];
        AuthenticationService.setupAxiosInterceptors();
        DataSourceTypeService.getDataSourceTypeListActive(AuthenticationService.getRealmId())
            .then(response => {
                // productCategoryList = response.data;
                for (var k = 0; k < (response.data).length; k++) {
                    //var spaceCount = response.data[k].sortOrder.split(".").length;
                   // console.log("spaceCOunt--->", spaceCount);
                    // var indendent = "";
                    // for (var p = 1; p <= spaceCount - 1; p++) {
                    //     if (p == 1) {
                    //         indendent = indendent.concat("|_");
                    //     } else {
                    //         indendent = indendent.concat("_");
                    //     }
                    // }
                   // console.log("ind", indendent);
                    var dataSourceTypeJson = {
                        name: (response.data[k].label.label_en),
                        id: response.data[k].dataSourceTypeId
                    }
                    dataSourceTypeList.push(dataSourceTypeJson);

                }

        // var realmId = document.getElementById("realmId").value;
                var DataSourceListQat = [];
                // var activeDataSourceList=[];
                AuthenticationService.setupAxiosInterceptors();
                DataSourceService.getActiveDataSourceList()
                    .then(response => {
                        if (response.status == 200) {
                            // dataSourceListQat = response.data
                            this.setState({ activeDataSourceList: response.data });
                            for (var k = 0; k < (response.data).length; k++) {
                                var dataSourceJson = {
                                    name: response.data[k].label.label_en,
                                    id: response.data[k].dataSourceId
                                }
                                DataSourceListQat.push(dataSourceJson);
                            }
                            this.setState({ DataSourceListQat: DataSourceListQat });

                            AuthenticationService.setupAxiosInterceptors();
                            PipelineService.getQatTempDataSourceList(this.props.pipelineId)
                                .then(response => {
                                    if (response.status == 200) {
                                        if (response.data.length > 0) {

                                            var dataSourceList = response.data;
                                            var data = [];
                                            var productDataArr = []
                                            //seting this for loaded function
                                            this.setState({ dataSourceList: dataSourceList });
                                            //seting this for loaded function
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
                                                console.log("datasource list length is 0.");
                                            }

                                            this.el = jexcel(document.getElementById("mapDataSource"), '');
                                            this.el.destroy();
                                            var json = [];
                                            var data = productDataArr;
                                            // var data = []
                                            var options = {
                                                data: data,
                                                columnDrag: true,
                                                colWidths: [160, 190, 190, 190],
                                                columns: [

                                                    {
                                                        title: i18n.t('static.pipeline.pplndatasourcetype'),
                                                        type: 'text',
                                                        readonly: true
                                                    }, {
                                                        title:  i18n.t('static.pipeline.pplndatasource'),
                                                        type: 'text',
                                                        readonly: true
                                                    },
                                                    {
                                                        title:  i18n.t('static.datasource.datasourcetype'),
                                                        type: 'dropdown',
                                                        source: dataSourceTypeList,
                                                        // filter: this.dropdownFilter
                                                    },
                                                    {
                                                        title:  i18n.t('static.dashboard.datasourcehaeder'),
                                                        type: 'autocomplete',
                                                        source: DataSourceListQat,
                                                        filter: this.dropdownFilter
                                                    }, {
                                                        title:  i18n.t('static.inventory.dataSource'),
                                                        type: 'hidden',
                                                        readonly: true
                                                    }
                                                ],
                                                pagination: 10,
                                                search: true,
                                                columnSorting: true,
                                                tableOverflow: true,
                                                wordWrap: true,
                                                paginationOptions: [10, 25, 50, 100],
                                                // position: 'top',
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onchange: this.changed,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                    text: {
                                                    show: '',
                                                    entries: '',
                                                },
                                                onload: this.loadedJexcelCommonFunction,
                                                // onload: this.loaded

                                            };
                                            var elVar = jexcel(document.getElementById("mapDataSource"), options);
                                            this.el = elVar;
                                            this.loaded();

                                        }
                                    } else {
                                        this.setState({ message: response.data.messageCode })
                                    }
                                });

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


            });


    }

    loadedJexcelCommonFunction = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    render() {
        return (
            <>
                <h4 className="red">{this.props.message}</h4>
                <div className="table-responsive" >

                    <div id="mapDataSource">
                    </div>
                </div>
            </>
        );
    }

}
