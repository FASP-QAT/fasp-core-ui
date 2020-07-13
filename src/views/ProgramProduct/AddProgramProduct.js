import React, { Component } from "react";
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row, Form, FormFeedback

} from 'reactstrap';

import ProgramService from "../../api/ProgramService";
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from "../../api/PlanningUnitService";
import i18n from '../../i18n';
import ProductCategoryServcie from '../../api/PoroductCategoryService.js';
const entityname = i18n.t('static.dashboard.programPlanningUnit');



class AddprogramPlanningUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        // if (this.props.location.state.programPlanningUnit.length > 0) {
        //     rows = this.props.location.state.programPlanningUnit;
        // }
        this.state = {
            // programPlanningUnit: this.props.location.state.programPlanningUnit,
            programPlanningUnit: [],
            planningUnitId: '',
            planningUnitName: '',
            reorderFrequencyInMonths: '',
            minMonthsOfStock: '',
            rows: rows,
            programList: [],
            planningUnitList: [],
            rowErrorMessage: '',
            programPlanningUnitId: 0,
            isNew: true,
            programId: this.props.match.params.programId,
            updateRowStatus: 0,
            lang: localStorage.getItem('lang'),
            batchNoRequired: false,
            localProcurementLeadTime: '',
            isValidData: true

        }
        // this.addRow = this.addRow.bind(this);
        // this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        // this.setTextAndValue = this.setTextAndValue.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        // this.enableRow = this.enableRow.bind(this);
        // this.disableRow = this.disableRow.bind(this);
        // this.updateRow = this.updateRow.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.changed = this.changed.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    addRowInJexcel = function () {
        var json = this.el.getJson();
        var data = [];
        data[0] = 0;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = 0;
        data[7] = "";
        data[8] = 1;
        data[9] = 1;
        data[10] = this.props.match.params.programId;
        this.el.insertRow(
            data
        );
    }

    changed = function (instance, cell, x, y, value) {
        var valid = true;
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(9, y, 1, true);
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                this.el.setValueFromCoords(9, y, 1, true);
                valid = true;
            }
            var columnName = jexcel.getColumnNameFromId([parseInt(x) + 1, y]);
            instance.jexcel.setValue(columnName, '');
        }


        if (x == 1) {
            var json = this.el.getJson();
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(9, y, 1, true);
                valid = false;
            } else {
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, "Planning Unit aready exist");
                        i = json.length;
                        this.el.setValueFromCoords(9, y, 1, true);
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(9, y, 1, true);
                        valid = true;
                    }
                }
            }
            // var columnName = jexcel.getColumnNameFromId([x + 1, y]);
            // instance.jexcel.setValue(columnName, '');
        }

        if (x == 2) {
            var reg = /^[0-9\b]+$/;
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(9, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(9, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(9, y, 1, true);
                    valid = true;
                }
            }
        }
        if (x == 3) {
            var reg = /^[0-9\b]+$/;
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(9, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(9, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(9, y, 1, true);
                    valid = true;
                }
            }
        }
        if (x == 4) {
            var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(9, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(9, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(9, y, 1, true);
                    valid = true;
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
                this.el.setValueFromCoords(9, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(9, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(9, y, 1, true);
                    valid = true;
                }
            }
        }
        if (x == 6) {
            var reg = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/;
            var col = ("G").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(9, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(9, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(9, y, 1, true);
                    valid = true;
                }
            }
        }
        this.setState({ isValidData: valid });
    }

    submitForm() {

        var json = this.el.getJson();
        console.log("Rows on submit", json)
        var planningUnitArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            if (map.get("9") == 1) {
                if (map.get("7") == "") {
                    var pId = 0;
                } else {
                    var pId = map.get("7");
                }
                var planningUnitJson = {
                    programPlanningUnitId: pId,
                    program: {
                        id: map.get("10")
                    },
                    planningUnit: {
                        id: map.get("1"),
                    },
                    reorderFrequencyInMonths: map.get("2"),
                    minMonthsOfStock: map.get("3"),
                    localProcurementLeadTime: map.get("4"),
                    shelfLife: map.get("5"),
                    catalogPrice:map.get("6"),
                    active:map.get("8")
                }
                planningUnitArray.push(planningUnitJson);
            }

        }
        AuthenticationService.setupAxiosInterceptors();
        console.log("SUBMIT----",planningUnitArray);
        ProgramService.addprogramPlanningUnitMapping(planningUnitArray)
            .then(response => {
                if (response.status == "200") {
                    this.props.history.push(`/program/listProgram/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                } else {
                    this.setState({
                        message: response.data.messageCode
                    },
                        () => {
                            this.hideSecondComponent();
                        })
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );
    }
    componentDidMount() {
        var list = [];
        var productCategoryList = [];
        // var realmId = document.getElementById("realmId").value;

        AuthenticationService.setupAxiosInterceptors();
        ProductCategoryServcie.getProductCategoryListByRealmId(1)
            .then(response => {

                if (response.status == 200) {
                    console.log("productCategory response----->", response.data);
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
                            name: (response.data[k].payload.label.label_en),
                            id: response.data[k].payload.productCategoryId
                        }
                        productCategoryList.push(productCategoryJson);

                    }

                    PlanningUnitService.getActivePlanningUnitList()
                        .then(response => {
                            if (response.status == 200) {
                                this.setState({
                                    planningUnitList: response.data
                                });
                                for (var k = 0; k < (response.data).length; k++) {
                                    var planningUnitJson = {
                                        name: response.data[k].label.label_en,
                                        id: response.data[k].planningUnitId
                                    }
                                    list.push(planningUnitJson);
                                }


                                AuthenticationService.setupAxiosInterceptors();
                                ProgramService.getProgramPlaningUnitListByProgramId(this.state.programId)
                                    .then(response => {
                                        if (response.status == 200) {
                                            // alert("hi");
                                            let myReasponse = response.data;
                                            var productDataArr = []
                                            // if (myReasponse.length > 0) {
                                                this.setState({ rows: myReasponse });
                                                var data = [];
                                                if (myReasponse.length != 0) {
                                                    for (var j = 0; j < myReasponse.length; j++) {
                                                        data = [];
                                                        data[0] = 0;
                                                        data[1] = myReasponse[j].planningUnit.id;
                                                        data[2] = myReasponse[j].reorderFrequencyInMonths;
                                                        data[3] = myReasponse[j].minMonthsOfStock;
                                                        data[4] = myReasponse[j].localProcurementLeadTime;
                                                        data[5] = myReasponse[j].shelfLife;
                                                        data[6] = myReasponse[j].catalogPrice;
                                                        data[7] = myReasponse[j].programPlanningUnitId;
                                                        data[8] = myReasponse[j].active;
                                                        data[9] = 0;
                                                        data[10] = myReasponse[j].program.id;
                                                        productDataArr.push(data);
                                                    }
                                                } else {
                                                    console.log("list length is 0.");
                                                }

                                                this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                                this.el.destroy();
                                                var json = [];
                                                var data = productDataArr;
                                                var options = {
                                                    data: data,
                                                    columnDrag: true,
                                                    colWidths: [290, 290, 100, 100, 100, 100, 100, 100, 100],
                                                    columns: [
                                                        {
                                                            title: 'Product Category',
                                                            type: 'dropdown',
                                                            source: productCategoryList
                                                        },
                                                        {
                                                            title: 'Planning Unit',
                                                            type: 'autocomplete',
                                                            source: list,
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
                                                            title: 'Local Procurment Lead Time',
                                                            type: 'number'
                                                        },
                                                        {
                                                            title: 'Shelf Life',
                                                            type: 'number'
                                                        },
                                                        {
                                                            title: 'Catalog Price',
                                                            type: 'number'
                                                        },
                                                        {
                                                            title: 'Id',
                                                            type: 'hidden'
                                                        },
                                                        {
                                                            title: 'Active',
                                                            type: 'hidden'
                                                        },
                                                        {
                                                            title: 'Changed Flag',
                                                            type: 'hidden'
                                                        },
                                                        {
                                                            title: 'ProgramId',
                                                            type: 'hidden'
                                                        }


                                                    ],
                                                    pagination: 10,
                                                    search: true,
                                                    columnSorting: true,
                                                    tableOverflow: true,
                                                    wordWrap: true,
                                                    paginationOptions: [10, 25, 50, 100],
                                                    position: 'top',
                                                    allowInsertColumn: false,
                                                    allowManualInsertColumn: false,
                                                    allowDeleteRow: false,
                                                    onchange: this.changed,
                                                    oneditionend: this.onedit,
                                                    copyCompatibility: true

                                                };
                                                var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                                this.el = elVar;
                                                this.setState({ mapPlanningUnitEl: elVar });
                                            // }
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode
                                            })
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
                                                        console.log("Error code unkown");
                                                        break;
                                                }
                                            }
                                        }
                                    );

                            } else {
                                list = [];
                            }
                        });
                } else {
                    productCategoryList = []
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            });

    }

    render() {

        return (
            <div className="animated fadeIn">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
               
                    <div style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <strong>{i18n.t('static.program.mapPlanningUnit')}</strong>
                            </CardHeader> */}
                            <CardBody className="p-0">
                            <Col sm={12} md={12}>
                                <h4 className="red">{this.props.message}</h4>
                                <div className="table-responsive" >
                                    <div id="mapPlanningUnit">
                                    </div>
                                </div>
                                </Col>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.isValidData && <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
                                    &nbsp;
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRowInJexcel}> <i className="fa fa-plus"></i> Add Row</Button>
                                    &nbsp;
                                </FormGroup>
                            </CardFooter>
                        </Card>
                    </div>
                
            </div>

        );
    }
    cancelClicked() {
        this.props.history.push(`/program/listProgram/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}
export default AddprogramPlanningUnit;