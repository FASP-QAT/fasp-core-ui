import React, { Component } from 'react';
import jexcel from 'jexcel';
import i18n from '../../i18n';
import PipelineService from '../../api/PipelineService';
import AuthenticationService from '../Common/AuthenticationService';
import DataSourceService from '../../api/DataSourceService';
import PlanningUnitService from '../../api/PlanningUnitService';
import ProcurementAgentService from '../../api/ProcurementAgentService';
import ManufaturerService from '../../api/SupplierService';
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import ShipmentStatusService from '../../api/ShipmentStatusService';
import { Button } from 'reactstrap';

export default class PipelineProgramShipment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pipelineShipmentData: [],
            dataSourceList: [],
            planningUnitList: [],
            procurementAgentList: [],
            supplierList: [],
            shipModes: ["Air", "Sea"],
            shipmentStatusList: [],
            lang: localStorage.getItem('lang'),
            isValidData: false

        }

        this.initialiseshipment = this.initialiseshipment.bind(this)
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.SubmitShipment = this.SubmitShipment.bind(this);
    }

    loaded() {
        var valid = true;
        var list = this.state.pipelineShipmentData;
        console.log(list)
        var json = this.el.getJson();
        console.log(json)
        for (var y = 0; y < json.length; y++) {
            var col = ("A").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[0]).toString();
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].shipdatasourceid).concat(" Does not exist."));
            }

            // var list = this.state.planningUnitList;

            var col = ("B").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[1]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].productid).concat(" Does not exist."));
            }
            var col = ("C").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[2]).toString();

            if (value == "Invalid date" || value === "") {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));

            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

            }

            var col = ("D").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[3]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].supplierid).concat(" Does not exist."));
            }

            var col = ("E").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[4]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }

            var col = ("F").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[5]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            var col = ("G").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[6]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }

            var col = ("H").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[7]).toString();

            if (value != "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            var col = ("I").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[8]).toString();

            if (value != "" && value >= 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }
            var col = ("J").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[9]).toString();

            if (value != "" && value >= 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }

            var col = ("K").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[10]).toString();

            if (value == "Invalid date" || value === "") {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));

            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

            }
            var col = ("L").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[11]).toString();

            if (value == "Invalid date" || value === "") {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));

            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

            }
            var col = ("M").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[12]).toString();

            if (value == "Invalid date" || value === "") {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));

            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

            }

            var col = ("N").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[13]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }

            var col = ("O").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[14]).toString();

            if (value != "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            }

        }
        this.setState({
            isValidData: valid
        })

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
            var json = this.el.getJson();
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
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invaliddate'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 3) {
            var json = this.el.getJson();
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
        if (x == 4) {
            var json = this.el.getJson();
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
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
        if (x == 6) {
            var reg = /^[0-9\b]+$/;
            var col = ("G").concat(parseInt(y) + 1);
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
        if (x == 7) {
            var col = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        if (x == 8) {
            var reg = /^[0-9\b]+$/;
            var col = ("I").concat(parseInt(y) + 1);
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
        }  if (x == 9) {
            var reg = /^[0-9\b]+$/;
            var col = ("J").concat(parseInt(y) + 1);
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
        if (x == 10) {
            var col = ("k").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invaliddate'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 11) {
            var col = ("L").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invaliddate'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 12) {
            var col = ("M").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invaliddate'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        } if (x == 13) {
            var col = ("N").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        } if (x == 14) {
            var col = ("O").concat(parseInt(y) + 1);
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


    componentDidMount() {
        console.log("pipelineProgramId----->", this.props.match.params.pipelineId);
        AuthenticationService.setupAxiosInterceptors();

        PlanningUnitService.getAllPlanningUnitList()
            .then(response => {
                if (response.status == 200) {

                    this.setState({
                        planningUnitList: response.data.map(ele => ({
                            name: getLabelText(ele.label, this.state.lang),
                            id: ele.planningUnitId
                        }))


                    });
                    console.log(response.data)
                    this.initialiseshipment();
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
                                break;
                        }
                    }
                }
            );


        ShipmentStatusService.getShipmentStatusListActive()
            .then(response => {
                if (response.status == 200) {
                    // console.log(response.data)
                    this.setState({
                        shipmentStatusList: response.data.map(ele => ({
                            name: getLabelText(ele.label, this.state.lang),
                            id: ele.shipmentStatusId
                        }))
                    })
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
                                break;
                        }
                    }
                }
            );



        DataSourceService.getAllDataSourceList()
            .then(response => {
                if (response.status == 200) {
                    // console.log(response.data)
                    this.setState({
                        dataSourceList: response.data.map(ele => ({
                            name: getLabelText(ele.label, this.state.lang),
                            id: ele.dataSourceId
                        }))
                    })
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
                                break;
                        }
                    }
                }
            );

        ProcurementAgentService.getProcurementAgentListAll()
            .then(response => {
                if (response.status == 200) {
                    console.log(response.data)
                    this.setState({
                        procurementAgentList: response.data.map(ele => ({
                            name: getLabelText(ele.label, this.state.lang),
                            id: ele.procurementAgentId
                        }))
                    })
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
                                break;
                        }
                    }
                }
            );


        ManufaturerService.getSupplierListAll()
            .then(response => {
                if (response.status == 200) {
                    console.log(response.data)
                    this.setState({
                        supplierList: response.data.map(ele => ({
                            name: getLabelText(ele.label, this.state.lang),
                            id: ele.supplierId
                        }))
                    })
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
                                break;
                        }
                    }
                }
            );
        PipelineService.getShipmentDataById(this.props.match.params.pipelineId)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        pipelineShipmentData: response.data
                    })

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
                                break;
                        }
                    }
                }
            );

    }
    initialiseshipment() {
        setTimeout('', 10000);
        console.log('initialiseshipment')
        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
        this.el.destroy();
        var json = [];
        // var data = shipmentDataArr;

        var shipmentdata = [];
        console.log('**'+this.state.pipelineShipmentData)
        if (this.state.pipelineShipmentData.length != 0) {
            if (this.state.pipelineShipmentData[0].shippo != null) {
                shipmentdata = this.state.pipelineShipmentData.map((item, index) => [item.shipdatasourceid, item.productid, moment(null).format("YYYY-MM-DD"), item.supplierid, "", item.shipamount, "", "", item.shipfreightcost,0, moment(item.shipordereddate).format("YYYY-MM-DD"), moment(item.shipshippeddate).format("YYYY-MM-DD"), moment(item.shipreceiveddate).format("YYYY-MM-DD"), "", item.shipnote, true])
            } else {
                shipmentdata = this.state.pipelineShipmentData.map((item, index) => [item.dataSource.id, item.planningUnit.id, moment(item.expectedDeliveryDate).format("YYYY-MM-DD"), item.procurementAgent.id, item.supplier.id, item.quantity, item.rate, item.shipmentMode, item.freightCost,item.productCost, moment(item.orderedDate).format("YYYY-MM-DD"), moment(item.shippedDate).format("YYYY-MM-DD"), moment(item.receivedDate).format("YYYY-MM-DD"), item.shipmentStatus.id, item.notes, true])
            } console.log(shipmentdata)
        }







        var data = shipmentdata;
        // json[0] = data;
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 100, 150, 150, 80, 80, 80, 80, 100, 100, 100, 100, 180, 80],
            columns: [

                {
                    title: i18n.t('static.datasource.datasource'),
                    type: 'dropdown',
                    source: this.state.dataSourceList
                },
                {
                    title: i18n.t('static.dashboard.planningunit'),
                    type: 'autocomplete',
                    source: this.state.planningUnitList
                    // readOnly: true
                },
                {
                    title: i18n.t('static.shipment.edd'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                },
                {
                    title: i18n.t('static.dashboard.procurementagent'),
                    type: 'dropdown',
                    source: this.state.procurementAgentList
                }, {
                    title: i18n.t('static.dashboard.supplier'),
                    type: 'autocomplete',
                    source: this.state.supplierList
                }, {
                    title: i18n.t('static.shipment.qty'),
                    type: 'text',
                    // source: regionList
                    // readOnly: true
                }, {
                    title: i18n.t('static.shipment.rate'),
                    type: 'text',
                    // source: regionList
                    // readOnly: true
                }, {
                    title: i18n.t('static.shipment.mode'),
                    type: 'dropdown',
                    source: this.state.shipModes
                }, {
                    title: i18n.t('static.shipment.freightcost'),
                    type: 'text',
                    // source: dataSourceList
                }, {
                    title: i18n.t('static.shipment.productcost'),
                    type: 'text',
                    // source: dataSourceList
                },
                {
                    title: i18n.t('static.shipment.ordereddate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                }, {
                    title: i18n.t('static.shipment.shipdate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                }, {
                    title: i18n.t('static.shipment.receiveddate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                },
                {
                    title: i18n.t('static.common.status'),
                    type: 'dropdown',
                    source: this.state.shipmentStatusList
                },
                {
                    title: i18n.t('static.program.notes'),
                    type: 'text'
                }, {
                    title: i18n.t('static.common.active'),
                    type: 'checkbox'
                },
                {
                    title: 'Index',
                    type: 'hidden'
                }

            ],
            pagination: 10,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            // paginationOptions: [10, 25, 50, 100],
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onchange: this.changed,
            oneditionend: this.onedit,
            copyCompatibility: true

        };

        this.el = jexcel(document.getElementById("shipmenttableDiv"), options);
        this.loaded();
    }


    SubmitShipment() {
        this.loaded()

        if (this.state.isValidData) {
            var data = this.el.getJson().map(ele => ({
                "shipmentId": null,
                "procurementUnit": null,
                "productCost": null,
                "dataSource": { "id": ele[0] },
                "planningUnit": { "id": ele[1] },
                "expectedDeliveryDate": ele[2],
                "suggestedQty": ele[6],
                "procurementAgent": { "id": ele[3] },
                "supplier": { "id": ele[4] },
                "quantity": ele[5],
                "rate": ele[6],
                "shipmentMode": ele[7],
                 "productCost": ele[9],
                "freightCost": ele[8],
                "orderedDate": ele[10],
                "shippedDate": ele[11],
                "receivedDate": ele[12],
                "shipmentStatus": { "id": ele[13] },
                "notes": ele[14],
                "accountFlag": false,
                "erpFlag": false,
                "versionId": 0,
                "active":ele[15]
            }))
            console.log(JSON.stringify(data))
            PipelineService.submitShipmentData(this.props.match.params.pipelineId, data)
                .then(response => {
                    // console.log(response.data)
                    this.setState({
                        message: response.data.messageCode
                    })
                }
                ).catch(
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

        } else {
            alert('Please enter valid data')
        }
    }

    render() {

        return (
            <>
                <div className="table-responsive" >

                    <div id="shipmenttableDiv">
                    </div>
                    <div>
                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepFour} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.SubmitShipment}>Save<i className="fa fa-angle-double-right"></i></Button>
                        &nbsp;
                                        </div>
                </div>
            </>
        );
    }
}