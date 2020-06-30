import React, { Component } from 'react';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row, Form, FormFeedback

} from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProcurementUnitService from "../../api/ProcurementUnitService";
import i18n from '../../i18n';
const entityname = i18n.t('static.dashboard.procurementAgentProcurementUnit')

export default class AddProcurementAgentProcurementUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        // if (this.props.location.state.procurementAgentProcurementUnit.length > 0) {
        //     rows = this.props.location.state.procurementAgentProcurementUnit;
        // }
        this.state = {
            // procurementAgentProcurementUnit: this.props.location.state.procurementAgentProcurementUnit,
            procurementUnitId: '',
            procurementUnitName: '',
            skuCode: '',
            vendorPrice: '',
            approvedToShippedLeadTime: '',
            gtin: '',
            procurementAgentProcurementUnitId: 0,
            isNew: true,
            rows: rows,
            procurementAgentList: [],
            procurementUnitList: [],
            rowErrorMessage: '',
            lang: localStorage.getItem('lang'),
            procurementAgentId: this.props.match.params.procurementAgentId,
            updateRowStatus: 0,
            loading: true,
            isValidData:true
        }
        // this.addRow = this.addRow.bind(this);
        // this.deleteLastRow = this.deleteLastRow.bind(this);
        // this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        // this.setTextAndValue = this.setTextAndValue.bind(this);
        // this.enableRow = this.enableRow.bind(this);
        // this.disableRow = this.disableRow.bind(this);
        // this.updateRow = this.updateRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.changed = this.changed.bind(this);

    }

    addRowInJexcel = function () {
        // $('#my').jexcel('insertRow', [ 'Pears', 10, 0.59, '=B2*C2' ], 1);
        // this.el.insertRow();
        // var json = this.el.getJson();
        var json = this.el.getJson();
        var data = [];
        data[0] = this.props.match.params.procurementAgentId;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = 0;
        data[7] = 1;
        this.el.insertRow(
            data
        );
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    capitalize(event) {
        if (event.target.name === "skuCode") {
            let { skuCode } = this.state
            skuCode = event.target.value.toUpperCase()
            this.setState({
                skuCode: skuCode
            })
        } else if (event.target.name === "gtin") {
            let { gtin } = this.state
            gtin = event.target.value.toUpperCase()
            this.setState({
                gtin: gtin
            })

        }
    }

    submitForm() {
        // var validRows = this.checkValidation();
        // if (validRows == true) {
        var json = this.el.getJson();
        console.log("Rows on submit", json)
        var procurementUnitArray = []
        for (var i = 0; i < json.length; i++) {
            var map = new Map(Object.entries(json[i]));
            if (map.get("7") == 1) {
                if (map.get("6") == "") {
                    var pId = 0;
                } else {
                    var pId = map.get("6");
                }
                var procurementUnitJson = {
                    procurementAgentProcurementUnitId: pId,
                    procurementAgent: {
                        id: map.get("0")
                    },
                    procurementUnit: {
                        id: map.get("1"),
                    },
                    skuCode: map.get("2"),
                    vendorPrice: map.get("3"),
                    approvedToShippedLeadTime: map.get("4"),
                    gtin: map.get("5")
                }
                procurementUnitArray.push(procurementUnitJson);
            }

        }
        console.log("procurementUnitArray----->", procurementUnitArray);
        AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.addprocurementAgentProcurementUnitMapping(procurementUnitArray)
            .then(response => {
                if (response.status == "200") {
                    this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                   
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
        // } else {
        //     alert("please validate all rows and continue");
        // }
    }

    // checkValidation() {
    //     var reg = /^[0-9\b]+$/;
    //     var valid = true;
    //     var json = this.el.getJson();
    //     // console.log("check json--->",json);
    //     var checkJson=[];
    //     for (var y = 0; y < json.length; y++) {
    //         var map = new Map(Object.entries(json[y]));
    //         if(map.get("7")==true){
    //             checkJson.push(json[y]);
    //         }
    //     }
    //     console.log("check changed json entries-->",checkJson);

    //     for (var y = 0; y < checkJson.length; y++) {
    //         var col = ("B").concat(parseInt(y) + 1);
    //         var value = this.el.getValueFromCoords(1, y);
    //         if (value == "") {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setStyle(col, "background-color", "yellow");
    //             this.el.setComments(col, i18n.t('static.label.fieldRequired'));
    //             valid = false;
    //         } else {
    //             for (var i = 0; i < checkJson.length; i++) {
    //                 var map = new Map(Object.entries(checkJson[i]));
    //                 var planningUnitValue = map.get("1");
    //                 if (planningUnitValue == value && y != i) {
    //                     this.el.setStyle(col, "background-color", "transparent");
    //                     this.el.setStyle(col, "background-color", "yellow");
    //                     this.el.setComments(col, "Procurement Unit Allready Exists");
    //                     i = checkJson.length;
    //                     valid = false;
    //                 } else {
    //                     this.el.setStyle(col, "background-color", "transparent");
    //                     this.el.setComments(col, "");
    //                     // this.el.setValueFromCoords(7, y, 1, true);
    //                 }
    //             }
    //         }

    //         var col = ("C").concat(parseInt(y) + 1);
    //         var value = this.el.getValueFromCoords(2, y);
    //         if (value == "") {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setStyle(col, "background-color", "yellow");
    //             this.el.setComments(col, i18n.t('static.label.fieldRequired'));
    //             valid = false;
    //         } else {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setComments(col, "");
    //         }


    //         var col = ("E").concat(parseInt(y) + 1);
    //         var value = this.el.getValueFromCoords(4, y);
    //         if (value == "") {
    //             this.el.setStyle(col, "background-color", "transparent");
    //             this.el.setStyle(col, "background-color", "yellow");
    //             this.el.setComments(col, i18n.t('static.label.fieldRequired'));
    //             valid = false;
    //         } else {
    //             if (isNaN(parseInt(value)) || !(reg.test(value))) {
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setStyle(col, "background-color", "yellow");
    //                 this.el.setComments(col, i18n.t('static.message.invalidnumber'));
    //                 valid = false;
    //             } else {
    //                 this.el.setStyle(col, "background-color", "transparent");
    //                 this.el.setComments(col, "");
    //                 // this.el.setValueFromCoords(7, y, 1, true);
    //             }
    //         }

    //     }
    //     return valid;
    // }
    changed = function (instance, cell, x, y, value) {
        var valid = true;
        if (x == 1) {
            var json = this.el.getJson();
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(7, y, 1, true);
                valid = false;
            } else {
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    var planningUnitValue = map.get("1");
                    if (planningUnitValue == value && y != i) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, "Procurement Unit Allready Exists");
                        i = json.length;
                        this.el.setValueFromCoords(7, y, 1, true);
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        this.el.setValueFromCoords(7, y, 1, true);
                        valid = true;
                    }
                }

            }
        }
        if (x == 2) {
            // var json = this.el.getJson();
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(7, y, 1, true);
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
                this.el.setValueFromCoords(7, y, 1, true);
                valid = true;
            }
        }

        if (x == 4) {
            var reg = /^[0-9\b]+$/;
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                this.el.setValueFromCoords(7, y, 1, true);
                valid = false;
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    this.el.setValueFromCoords(7, y, 1, true);
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    this.el.setValueFromCoords(7, y, 1, true);
                    valid = true;
                }
            }
        }

        this.setState({ isValidData: valid });
    }

    componentDidMount() {
        var procurmentAgentListJexcel = [];
        var procurmentUnitListJexcel = [];

        AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.getProcurementAgentProcurementUnitList(this.state.procurementAgentId)
            .then(response => {
                if (response.status == 200) {
                    // console.log("first---->", response.data);
                    let myResponse = response.data;
                    if (myResponse.length > 0) {
                        this.setState({ rows: myResponse });
                    }
                    AuthenticationService.setupAxiosInterceptors();
                    ProcurementAgentService.getProcurementAgentListAll().then(response => {
                        if (response.status == "200") {
                            // console.log("second--->", response.data);
                            this.setState({
                                procurementAgentList: response.data
                            });
                            for (var k = 0; k < (response.data).length; k++) {
                                var procurementAgentJson = {
                                    name: response.data[k].label.label_en,
                                    id: response.data[k].procurementAgentId
                                }
                                procurmentAgentListJexcel.push(procurementAgentJson);
                            }
                            AuthenticationService.setupAxiosInterceptors();
                            ProcurementUnitService.getProcurementUnitListActive().then(response => {
                                if (response.status == 200) {
                                    // console.log("third ffff---->", response.data);
                                    this.setState({
                                        procurementUnitList: response.data
                                    });

                                    for (var k = 0; k < (response.data).length; k++) {
                                        var procurementUnitListJson = {
                                            name: response.data[k].label.label_en,
                                            id: response.data[k].procurementUnitId
                                        }
                                        procurmentUnitListJexcel.push(procurementUnitListJson);
                                    }

                                    var procurmentAgentProcurmentUnitList = this.state.rows;
                                    var data = [];
                                    var productDataArr = []

                                    //seting this for loaded function
                                    // this.setState({ planningUnitList: planningUnitList });
                                    //seting this for loaded function

                                    if (procurmentAgentProcurmentUnitList.length != 0) {
                                        for (var j = 0; j < procurmentAgentProcurmentUnitList.length; j++) {
                                            data = [];
                                            data[0] = procurmentAgentProcurmentUnitList[j].procurementAgent.id;
                                            data[1] = procurmentAgentProcurmentUnitList[j].procurementUnit.id;
                                            data[2] = procurmentAgentProcurmentUnitList[j].skuCode;
                                            data[3] = procurmentAgentProcurmentUnitList[j].vendorPrice;
                                            data[4] = procurmentAgentProcurmentUnitList[j].approvedToShippedLeadTime;
                                            data[5] = procurmentAgentProcurmentUnitList[j].gtin;
                                            data[6] = procurmentAgentProcurmentUnitList[j].procurementAgentProcurementUnitId;
                                            data[7] = 0;
                                            productDataArr.push(data);
                                        }
                                    } else {
                                        console.log("list length is 0.");
                                    }
                                    this.el = jexcel(document.getElementById("mapPlanningUnit"), '');
                                    this.el.destroy();
                                    var json = [];
                                    // var data = [{}];
                                    var data = productDataArr;
                                    var options = {
                                        data: data,
                                        columnDrag: true,
                                        colWidths: [200, 290, 170, 170, 170, 170, 200, 50],
                                        columns: [
                                            {
                                                title: i18n.t('static.procurementagent.procurementagent'),
                                                type: 'dropdown',
                                                source: procurmentAgentListJexcel,
                                                readOnly: true
                                            },
                                            {
                                                title: i18n.t('static.procurementUnit.procurementUnit'),
                                                type: 'dropdown',
                                                source: procurmentUnitListJexcel
                                            },
                                            {
                                                title: i18n.t('static.procurementAgentProcurementUnit.skuCode'),
                                                type: 'text'
                                            },
                                            {
                                                title: i18n.t('static.procurementAgentProcurementUnit.vendorPrice'),
                                                type: 'number'

                                            },
                                            {
                                                title: i18n.t('static.procurementAgentProcurementUnit.approvedToShippedLeadTime'),
                                                type: 'number'
                                            },
                                            {
                                                title: i18n.t('static.procurementAgentProcurementUnit.gtin'),
                                                type: 'text'
                                            },
                                            {
                                                title: 'Procurment Agent Procurment Unit Id',
                                                type: 'hidden',
                                                // readOnly: true
                                            },
                                            {
                                                title: 'Changed Flag',
                                                type: 'hidden'
                                            },

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
                                        copyCompatibility: true,
                                        text: {
                                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                            show: '',
                                            entries: '',
                                        },

                                    };
                                    var elVar = jexcel(document.getElementById("mapPlanningUnit"), options);
                                    this.el = elVar;
                                    this.setState({ mapPlanningUnitEl: elVar,loading: false });
                                  

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
                                                console.log("Error code unkown 1");
                                                break;
                                        }
                                    }
                                }
                            );
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
                                        console.log("Error code unkown 2");
                                        break;
                                }
                            }
                        }
                    );
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
                                console.log("Error code unkown 3", error.response.data.messageCode);
                                break;
                        }
                    }
                }
            );
    }

    render() {
        return (
            <div className="animated fadeIn">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
               <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col xs="12" sm="12">
                        <Card  >

                            <CardHeader>
                                <strong>{i18n.t('static.procurementAgentProcurementUnit.mapProcurementUnit')}</strong>
                            </CardHeader>
                            <CardBody>

                                <h4 className="red">{this.props.message}</h4>
                                <div className="table-responsive" >
                                    <div id="mapPlanningUnit">
                                    </div>
                                </div>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                    {this.state.isValidData && <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                                    &nbsp;
                                    <Button color="info" size="md" className="float-right mr-1" type="button" onClick={this.addRowInJexcel}> <i className="fa fa-plus"></i> Add Row</Button>
                                    &nbsp;
                                </FormGroup>

                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
                 <Row style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </Row>
            </div>

        );
    }
    cancelClicked() {
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}




