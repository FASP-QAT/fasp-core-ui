import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import PipelineService from '../../api/PipelineService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from '../../api/PlanningUnitService'
import i18n from '../../i18n';
export default class PipelineProgramPlanningUnits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            planningUnitList: [],
            mapPlanningUnitEl: '',
        }
        this.loaded = this.loaded.bind(this);
        this.changed=this.changed.bind(this);
    }

    loaded() {
        var list = this.state.planningUnitList;
        var json = this.el.getJson();

        for (var y = 0; y < json.length; y++) {
            var col = ("A").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[0]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].productname).concat(" Does not exist."));
            }
        }

    }

    changed = function (instance, cell, x, y, value) {
        if (x == 0) {
            var json = this.el.getJson();
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 1) {
            var reg = /^[0-9\b]+$/;
            var col = ("B").concat(parseInt(y) + 1);
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
        if (x == 2) {
            var reg = /^[0-9\b]+$/;
            var col = ("C").concat(parseInt(y) + 1);
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


    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        PipelineService.getPipelineProductListById(this.props.pipelineId)
            .then(response => {
                if (response.status == 200) {

                    var planningUnitList = response.data;
                    var data = [];
                    var productDataArr = []

                    //seting this for loaded function
                    this.setState({ planningUnitList: planningUnitList });
                    //seting this for loaded function

                    if (planningUnitList.length != 0) {
                        for (var j = 0; j < planningUnitList.length; j++) {
                            data = [];
                            data[0] = planningUnitList[j].productname;
                            data[1] = '';
                            data[2] = planningUnitList[j].productminmonths;
                            productDataArr.push(data);

                        }
                    } else {
                        console.log("product list length is 0.");
                    }

                    var planningUnitListQat = []
                    AuthenticationService.setupAxiosInterceptors();
                    PlanningUnitService.getActivePlanningUnitList()
                        .then(response => {
                            if (response.status == 200) {
                                // planningUnitListQat = response.data

                                for (var k = 0; k < (response.data).length; k++) {
                                    var planningUnitJson = {
                                        name: response.data[k].label.label_en,
                                        id: response.data[k].planningUnitId
                                    }
                                    planningUnitListQat.push(planningUnitJson);
                                }

                                this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                this.el.destroy();
                                var json = [];
                                var data = productDataArr;
                                // var data = []
                                var options = {
                                    data: data,
                                    columnDrag: true,
                                    colWidths: [290, 290, 170, 170],
                                    columns: [
                                        {
                                            title: 'Planning Unit',
                                            type: 'autocomplete',
                                            source: planningUnitListQat,
                                            // filter: this.dropdownFilter
                                        },
                                        {
                                            title: 'Reorder frequency in months',
                                            type: 'number',

                                        },
                                        {
                                            title: 'Min month of stock',
                                            type: 'number'
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
                                    // onload: this.loaded

                                };
                                var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                this.el = elVar;
                                this.loaded();

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