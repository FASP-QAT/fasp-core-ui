import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from '../../api/PlanningUnitService'
import i18n from '../../i18n';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
import { textFilter } from 'react-bootstrap-table2-filter';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'

export default class PipelineProgramPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            planningUnitList: [],
            mapPlanningUnitEl: '',
        }
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.savePlanningUnits = this.savePlanningUnits.bind(this);
        this.dropdownFilter = this.dropdownFilter.bind(this);
    }

    dropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[c - 1];
        var puList = (this.state.activePlanningUnitList).filter(c => c.forecastingUnit.productCategory.id == value);

        for (var k = 0; k < puList.length; k++) {
            var planningUnitJson = {
                name: puList[k].label.label_en,
                id: puList[k].planningUnitId
            }
            mylist.push(planningUnitJson);
        }
        return mylist;
    }


    loaded() {
        var list = this.state.planningUnitList;
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
                this.el.setComments(col, (list[y].pipelineProductName).concat(" Does not exist."));
            }
        }

    }

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
            var columnName = jexcel.getColumnNameFromId([parseInt(x) + 1, y]);
            instance.jexcel.setValue(columnName, '');
        }


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
                    var planningUnitValue = map.get("3");
                    if (planningUnitValue == value && y != i) {
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
        if (x == 4) {
            var reg = /^[0-9\b]+$/;
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 5) {
            var reg = /^[0-9\b]+$/;
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
    }

    checkValidation() {

        var reg = /^[0-9\b]+$/;
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);

            var currentPlanningUnit = this.el.getRowData(y)[1];

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
                    var planningUnitValue = map.get("3");
                    // console.log("currentvalues---", currentPlanningUnit);
                    // console.log("planningUnitValue-->", planningUnitValue);
                    if (planningUnitValue == currentPlanningUnit && y != i) {
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
            var reg = /^[0-9\b]+$/;
            var col = ("E").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(4, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }


            var reg = /^[0-9\b]+$/;
            var col = ("F").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(5, y);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }

        }
        return valid;
    }

    savePlanningUnits() {
        var list = this.state.planningUnitList;
        var json = this.el.getJson();
        var planningUnitArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            var planningUnitId = map.get("3");
            if (planningUnitId != "" && !isNaN(parseInt(planningUnitId))) {
                planningUnitId = map.get("3");
            } else {
                planningUnitId = list[i].planningUnitId;
            }

            var planningUnitJson = {
                // pipelineId: {
                //     id: this.props.pipelineId
                // },
                // active: true,
                program: {
                    id: 0
                },
                planningUnitId: planningUnitId,
                reorderFrequencyInMonths: map.get("4"),
                minMonthsOfStock: map.get("5"),
                programPlanningUnitId: map.get("6")
            }
            planningUnitArray.push(planningUnitJson);
        }
        return planningUnitArray;

    }


    componentDidMount() {
        var productCategoryList = [];
        // var realmId = document.getElementById("realmId").value;
        AuthenticationService.setupAxiosInterceptors();
        ProductCategoryServcie.getProductCategoryListByRealmId(1)
            .then(response => {
                // productCategoryList = response.data;
                for (var k = 0; k < (response.data).length; k++) {
                    var spaceCount = response.data[k].sortOrder.split(".").length;
                    console.log("spaceCOunt--->", spaceCount);
                    var indendent = "";
                    for (var p = 1; p <= spaceCount - 1; p++) {
                        if (p == 1) {
                            indendent = indendent.concat("|_");
                        } else {
                            indendent = indendent.concat("_");
                        }
                    }
                    console.log("ind", indendent);
                    console.log("indendent.concat(response.data[k].payload.label.label_en)-->", indendent.concat(response.data[k].payload.label.label_en));
                    var productCategoryJson = {
                        name: indendent.concat(response.data[k].payload.label.label_en),
                        id: response.data[k].payload.productCategoryId
                    }
                    productCategoryList.push(productCategoryJson);

                }

                console.log("category response---->", productCategoryList);



                var planningUnitListQat = [];
                // var activePlanningUnitList=[];
                AuthenticationService.setupAxiosInterceptors();
                PlanningUnitService.getActivePlanningUnitList()
                    .then(response => {
                        if (response.status == 200) {
                            // planningUnitListQat = response.data
                            this.setState({ activePlanningUnitList: response.data });
                            for (var k = 0; k < (response.data).length; k++) {
                                var planningUnitJson = {
                                    name: response.data[k].label.label_en,
                                    id: response.data[k].planningUnitId
                                }
                                planningUnitListQat.push(planningUnitJson);
                            }
                            this.setState({ planningUnitListQat: planningUnitListQat });

                            AuthenticationService.setupAxiosInterceptors();
                            PipelineService.getQatTempPlanningUnitList(this.props.pipelineId)
                                .then(response => {
                                    if (response.status == 200) {
                                        if (response.data.length > 0) {

                                            var planningUnitList = response.data;
                                            var data = [];
                                            var productDataArr = []
                                            //seting this for loaded function
                                            this.setState({ planningUnitList: planningUnitList });
                                            //seting this for loaded function
                                            if (planningUnitList.length != 0) {
                                                for (var j = 0; j < planningUnitList.length; j++) {
                                                    data = [];

                                                    data[0] = planningUnitList[j].pipelineProductCategoryName;
                                                    data[1] = planningUnitList[j].pipelineProductName;

                                                    data[2] = planningUnitList[j].productCategoryId;
                                                    data[3] = planningUnitList[j].planningUnitId;
                                                    data[4] = planningUnitList[j].reorderFrequencyInMonths;
                                                    data[5] = planningUnitList[j].minMonthsOfStock;
                                                    data[6] = planningUnitList[j].programPlanningUnitId
                                                    productDataArr.push(data);

                                                }
                                            } else {
                                                console.log("product list length is 0.");
                                            }

                                            this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                            this.el.destroy();
                                            var json = [];
                                            var data = productDataArr;
                                            // var data = []
                                            var options = {
                                                data: data,
                                                columnDrag: true,
                                                colWidths: [290, 290, 290, 290, 170, 170],
                                                columns: [

                                                    {
                                                        title: 'Pipeline Product Category',
                                                        type: 'text',
                                                        readonly: true
                                                    }, {
                                                        title: 'Pipeline Product',
                                                        type: 'text',
                                                        readonly: true
                                                    },
                                                    {
                                                        title: 'Product Category',
                                                        type: 'dropdown',
                                                        source: productCategoryList,
                                                        // filter: this.dropdownFilter
                                                    },
                                                    {
                                                        title: 'Planning Unit',
                                                        type: 'autocomplete',
                                                        source: planningUnitListQat,
                                                        filter: this.dropdownFilter
                                                    },
                                                    {
                                                        title: 'Reorder frequency in months',
                                                        type: 'number',

                                                    },
                                                    {
                                                        title: 'Min month of stock',
                                                        type: 'number'
                                                    },
                                                    {
                                                        title: 'Pipeline Product Id',
                                                        type: 'hidden'
                                                    },
                                                ],
                                                pagination: 10,
                                                search: true,
                                                columnSorting: true,
                                                tableOverflow: true,
                                                wordWrap: true,
                                                // paginationOptions: [10, 25, 50, 100],
                                                // position: 'top',
                                                allowInsertColumn: false,
                                                allowManualInsertColumn: false,
                                                allowDeleteRow: false,
                                                onchange: this.changed,
                                                oneditionend: this.onedit,
                                                copyCompatibility: true,
                                                text: {
                                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                    show: '',
                                                    entries: '',
                                                },
                                                onload: this.loadedJexcelCommonFunction,
                                                // onload: this.loaded

                                            };
                                            var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                            this.el = elVar;
                                            this.loaded();

                                            // } else {

                                            //     PipelineService.getPipelineProductListById(this.props.pipelineId)
                                            //         .then(response => {
                                            //             if (response.status == 200) {
                                            //                 var planningUnitList = response.data;
                                            //                 var data = [];
                                            //                 var productDataArr = []
                                            //                 //seting this for loaded function
                                            //                 this.setState({ planningUnitList: planningUnitList });
                                            //                 //seting this for loaded function
                                            //                 if (planningUnitList.length != 0) {
                                            //                     for (var j = 0; j < planningUnitList.length; j++) {
                                            //                         data = [];
                                            //                         data[0] = planningUnitList[j].methodid;
                                            //                         data[1] = planningUnitList[j].productname;
                                            //                         data[2] = '';
                                            //                         data[3] = planningUnitList[j].productminmonths;
                                            //                         data[4] = planningUnitList[j].productid
                                            //                         productDataArr.push(data);

                                            //                     }
                                            //                 } else {
                                            //                     console.log("product list length is 0.");
                                            //                 }

                                            //                 this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                            //                 this.el.destroy();
                                            //                 var json = [];
                                            //                 var data = productDataArr;
                                            //                 // var data = []
                                            //                 var options = {
                                            //                     data: data,
                                            //                     columnDrag: true,
                                            //                     colWidths: [290, 290, 170, 170],
                                            //                     columns: [
                                            //                         {
                                            //                             title: 'Product Category',
                                            //                             type: 'dropdown',
                                            //                             source: productCategoryList,
                                            //                             // filter: this.dropdownFilter
                                            //                         },
                                            //                         {
                                            //                             title: 'Planning Unit',
                                            //                             type: 'autocomplete',
                                            //                             source: planningUnitListQat,
                                            //                             filter: this.dropdownFilter
                                            //                         },
                                            //                         {
                                            //                             title: 'Reorder frequency in months',
                                            //                             type: 'number',

                                            //                         },
                                            //                         {
                                            //                             title: 'Min month of stock',
                                            //                             type: 'number'
                                            //                         },
                                            //                         {
                                            //                             title: 'Pipeline Product Id',
                                            //                             type: 'hidden'
                                            //                         },
                                            //                     ],
                                            //                     pagination: 10,
                                            //                     search: true,
                                            //                     columnSorting: true,
                                            //                     tableOverflow: true,
                                            //                     wordWrap: true,
                                            //                     // paginationOptions: [10, 25, 50, 100],
                                            //                     // position: 'top',
                                            //                     allowInsertColumn: false,
                                            //                     allowManualInsertColumn: false,
                                            //                     allowDeleteRow: false,
                                            //                     onchange: this.changed,
                                            //                     oneditionend: this.onedit,
                                            //                     copyCompatibility: true,
                                            //                     // onload: this.loaded

                                            //                 };
                                            //                 var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                            //                 this.el = elVar;
                                            //                 this.loaded();

                                            //             } else {
                                            //                 this.setState({ message: response.data.messageCode })
                                            //             }
                                            //         });
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

                    <div id="mapPlanningUnit">
                    </div>
                </div>
            </>
        );
    }

}
