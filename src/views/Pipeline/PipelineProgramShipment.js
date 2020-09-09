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
import FundingSourceService from '../../api/FundingSourceService';
import { Link } from 'react-router-dom';
import { jExcelLoadedFunction, jExcelLoadedFunctionPipeline } from '../../CommonComponent/JExcelCommonFunctions.js'
import { CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS } from '../../Constants.js'
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

export default class PipelineProgramShipment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pipelineShipmentData: [],
            dataSourceList: [],
            planningUnitList: [],
            procurementAgentList: [],
            supplierList: [],
            fundingSourceList: [],
            shipModes: ["Air", "Sea/Land"],
            shipmentStatusList: [],
            lang: localStorage.getItem('lang'),
            isValidData: false,
            changedData: false,
            loading: true

        }

        this.initialiseshipment = this.initialiseshipment.bind(this)
        this.loaded = this.loaded.bind(this);
        this.changed = this.changed.bind(this);
        this.SubmitShipment = this.SubmitShipment.bind(this);
        this.SubmitProgram = this.SubmitProgram.bind(this)
    }

    loaded() {
        var valid = true;
        var list = this.state.pipelineShipmentData;
        console.log(list)
        var json = this.el.getJson();
        console.log(json)
        for (var y = 0; y < json.length; y++) {


            // var list = this.state.planningUnitList;

            var col = ("A").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[0]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].planningUnit).concat(" Does not exist."));
            }
            var col = ("B").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[1]).toString();
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].dataSource).concat(" Does not exist."));
            }

            var col = ("C").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[2]).toString();

            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].procurementAgent).concat(" Does not exist."));
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
                this.el.setComments(col, (list[y].fundingSource).concat(" Does not exist."));
            }
            var col = ("E").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[4]).toString();
            var shipmentStatusId = (this.el.getRowData(y)[4]).toString();
            if (value != "" && value > 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, (list[y].shipmentStatus).concat(" Does not exist."));
            }
            var col = ("F").concat(parseInt(y) + 1);
            var value = (this.el.getRowData(y)[5]).toString();

            if (value != "") {
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

            if (value != "" && value >= 0) {
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

            if (value != "" && value >= 0) {
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

            if (value != "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            } else {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));

                var col = ("J").concat(parseInt(y) + 1);
            }
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

            if ((value == "Invalid date" || value === "") && (shipmentStatusId == PLANNED_SHIPMENT_STATUS || shipmentStatusId == SUBMITTED_SHIPMENT_STATUS || shipmentStatusId == APPROVED_SHIPMENT_STATUS || shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
                valid = false;
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));

                // } else {
                //     this.el.setStyle(col, "background-color", "transparent");
                //     this.el.setComments(col, "");

                // }
                var col = ("L").concat(parseInt(y) + 1);
                var value = (this.el.getRowData(y)[11]).toString();

                if ((value == "Invalid date" || value === "") && (shipmentStatusId == PLANNED_SHIPMENT_STATUS || shipmentStatusId == SUBMITTED_SHIPMENT_STATUS || shipmentStatusId == APPROVED_SHIPMENT_STATUS || shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
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

                if ((value == "Invalid date" || value === "") && (shipmentStatusId == PLANNED_SHIPMENT_STATUS || shipmentStatusId == SUBMITTED_SHIPMENT_STATUS || shipmentStatusId == APPROVED_SHIPMENT_STATUS || shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
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

                if ((value == "Invalid date" || value === "") && (shipmentStatusId == SUBMITTED_SHIPMENT_STATUS || shipmentStatusId == APPROVED_SHIPMENT_STATUS || shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
                    valid = false;
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));

                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");

                }
                var col = ("O").concat(parseInt(y) + 1);
                var value = (this.el.getRowData(y)[14]).toString();

                if ((value == "Invalid date" || value === "") && (shipmentStatusId == APPROVED_SHIPMENT_STATUS || shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
                    valid = false;
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));

                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");

                }
                var col = ("P").concat(parseInt(y) + 1);
                var value = (this.el.getRowData(y)[15]).toString();

                if ((value == "Invalid date" || value === "") && (shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
                    valid = false;
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));

                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");

                }
                var col = ("Q").concat(parseInt(y) + 1);
                var value = (this.el.getRowData(y)[16]).toString();

                if ((value == "Invalid date" || value === "") && (shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
                    valid = false;
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));

                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");

                }
                var col = ("R").concat(parseInt(y) + 1);
                var value = (this.el.getRowData(y)[17]).toString();

                if ((value == "Invalid date" || value === "") && (shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
                    valid = false;
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));

                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");

                }





            }
            this.setState({
                isValidData: valid
            })

        }
    }

    changed = function (instance, cell, x, y, value) {
        this.setState({ changedData: true })
        var regexDecimal = /^[0-9]+.[0-9]+$/
        var shipmentStatusId = 0;
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

                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

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
            shipmentStatusId = value
            var reg = /^[0-9\b]+$/;
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

                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");

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
                if (!(reg.test(value) || regexDecimal.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        } if (x == 8) {
            var reg = /^[0-9\b]+$/;
            var col = ("I").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(reg.test(value) || regexDecimal.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        if (x == 9) {
            var col = ("J").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (!(reg.test(value) || regexDecimal.test(value))) {
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
            var col = ("K").concat(parseInt(y) + 1);
            if ((value === "") && shipmentStatusId != "" && (shipmentStatusId == PLANNED_SHIPMENT_STATUS || shipmentStatusId == SUBMITTED_SHIPMENT_STATUS || shipmentStatusId == APPROVED_SHIPMENT_STATUS || shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
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
            if ((value === "") && shipmentStatusId != "" && (shipmentStatusId == PLANNED_SHIPMENT_STATUS || shipmentStatusId == SUBMITTED_SHIPMENT_STATUS || shipmentStatusId == APPROVED_SHIPMENT_STATUS || shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
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
            if ((value === "") && shipmentStatusId != "" && (shipmentStatusId == PLANNED_SHIPMENT_STATUS || shipmentStatusId == SUBMITTED_SHIPMENT_STATUS || shipmentStatusId == APPROVED_SHIPMENT_STATUS || shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
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
        if (x == 13) {
            var col = ("N").concat(parseInt(y) + 1);
            if ((value === "") && shipmentStatusId != "" && (shipmentStatusId == SUBMITTED_SHIPMENT_STATUS || shipmentStatusId == APPROVED_SHIPMENT_STATUS || shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
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
        if (x == 14) {
            var col = ("O").concat(parseInt(y) + 1);
            if ((value === "") && shipmentStatusId != "" && (shipmentStatusId == APPROVED_SHIPMENT_STATUS || shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
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
        if (x == 15) {
            var col = ("P").concat(parseInt(y) + 1);
            if ((value === "") && shipmentStatusId != "" && (shipmentStatusId == SHIPPED_SHIPMENT_STATUS || shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
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
        if (x == 16) {
            var col = ("Q").concat(parseInt(y) + 1);
            if ((value === "") && shipmentStatusId != "" && (shipmentStatusId == ARRIVED_SHIPMENT_STATUS || shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
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
        if (x == 17) {
            var col = ("R").concat(parseInt(y) + 1);
            if ((value === "") && shipmentStatusId != "" && (shipmentStatusId == DELIVERED_SHIPMENT_STATUS)) {
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
    }


    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        PlanningUnitService.getAllPlanningUnitList()
            .then(response => {
                if (response.status == 200) {

                    this.setState({
                        planningUnitList: response.data.map(ele => ({
                            name: getLabelText(ele.label, this.state.lang),
                            id: ele.planningUnitId
                        }))
                    })
                    ShipmentStatusService.getShipmentStatusListActive()
                        .then(response => {
                            if (response.status == 200) {
                                // console.log(response.data)
                                this.setState({
                                    shipmentStatusList: response.data.map(ele => ({
                                        name: getLabelText(ele.label, this.state.lang),
                                        id: ele.shipmentStatusId
                                    }))
                                });

                                DataSourceService.getAllDataSourceList()
                                    .then(response => {
                                        if (response.status == 200) {
                                            // console.log(response.data)
                                            this.setState({
                                                dataSourceList: response.data.map(ele => ({
                                                    name: getLabelText(ele.label, this.state.lang),
                                                    id: ele.dataSourceId
                                                }))
                                            });

                                            ProcurementAgentService.getProcurementAgentListAll()
                                                .then(response => {
                                                    if (response.status == 200) {
                                                        console.log(response.data)
                                                        this.setState({
                                                            procurementAgentList: response.data.map(ele => ({
                                                                name: getLabelText(ele.label, this.state.lang),
                                                                id: ele.procurementAgentId
                                                            }))
                                                        });

                                                        ManufaturerService.getSupplierListAll()
                                                            .then(response => {
                                                                if (response.status == 200) {
                                                                    console.log(response.data)
                                                                    this.setState({
                                                                        supplierList: response.data.map(ele => ({
                                                                            name: getLabelText(ele.label, this.state.lang),
                                                                            id: ele.supplierId
                                                                        }))
                                                                    });
                                                                    FundingSourceService.getFundingSourceListAll()
                                                                        .then(response => {
                                                                            if (response.status == 200) {
                                                                                this.setState({
                                                                                    fundingSourceList: response.data.map(ele => ({
                                                                                        name: getLabelText(ele.label, this.state.lang),
                                                                                        id: ele.fundingSourceId
                                                                                    }))
                                                                                })
                                                                                PipelineService.getShipmentDataById(this.props.match.params.pipelineId)
                                                                                    .then(response => {
                                                                                        if (response.status == 200) {
                                                                                            console.log("pipeline shipment data my console--->", response.data);
                                                                                            this.setState({
                                                                                                pipelineShipmentData: response.data
                                                                                            }, () => { this.initialiseshipment() })

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


                                                                            } else {
                                                                                this.setState({ message: response.data.messageCode })
                                                                            }
                                                                        })
                                                                        .catch(
                                                                            error => {
                                                                                if (error.message === "Network Error") {
                                                                                    this.setState({ message: error.message });
                                                                                } else {
                                                                                    switch (error.response.status) {
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
        console.log('initialiseshipment' + JSON.stringify(this.state.pipelineShipmentData))
        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
        this.el.destroy();

        var data = this.state.pipelineShipmentData.map((item, index) => [item.planningUnit, item.dataSource, item.procurementAgent, item.fundingSource, item.shipmentStatus, item.shipmentMode == '' ? this.state.shipModes[1] : item.shipmentMode, item.quantity, item.rate, item.freightCost == 0 ? item.quantity * this.props.items.program.seaFreightPerc : item.freightCost, item.quantity * item.rate, moment(item.expectedDeliveryDate).format("YYYY-MM-DD"), moment(item.orderedDate).format("YYYY-MM-DD"), moment(item.plannedDate).format("YYYY-MM-DD"), moment(item.submittedDate).format("YYYY-MM-DD"), moment(item.approvedDate).format("YYYY-MM-DD"), moment(item.shippedDate).format("YYYY-MM-DD"), moment(item.arrivedDate).format("YYYY-MM-DD"), moment(item.receivedDate).format("YYYY-MM-DD"), item.notes]);
        // json[0] = data;
        var options = {
            data: data,
            columnDrag: true,
            colWidths: [150, 150, 150, 150, 150, 80, 80, 80, 80, 100, 100, 100, 100, 100, 100, 100, 100, 100, 180],
            columns: [

                {
                    title: i18n.t('static.dashboard.planningunit'),
                    type: 'autocomplete',
                    source: this.state.planningUnitList
                    // readOnly: true
                }, {
                    title: i18n.t('static.datasource.datasource'),
                    type: 'dropdown',
                    source: this.state.dataSourceList
                },
                {
                    title: i18n.t('static.dashboard.procurementagent'),
                    type: 'dropdown',
                    source: this.state.procurementAgentList
                }, {
                    title: i18n.t('static.dashboard.fundingsource'),
                    type: 'dropdown',
                    source: this.state.fundingSourceList
                },
                {
                    title: i18n.t('static.common.status'),
                    type: 'dropdown',
                    source: this.state.shipmentStatusList
                }, {
                    title: i18n.t('static.shipment.mode'),
                    type: 'dropdown',
                    source: this.state.shipModes
                },
                {
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
                    title: i18n.t('static.shipment.freightcost'),
                    type: 'text',
                    // source: dataSourceList
                }, {
                    title: i18n.t('static.shipment.productcost'),
                    type: 'text',
                    // source: dataSourceList
                }, {
                    title: i18n.t('static.shipment.edd'),
                    type: 'calendar',
                    options: { format: 'DD-MMM-YYYY' }

                },
                {
                    title: i18n.t('static.shipment.ordereddate'),
                    type: 'hidden',
                    // options: { format: 'DD-MMM-YYYY' }

                }, {
                    title: i18n.t('static.supplyPlan.plannedDate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                }, {
                    title: i18n.t('static.supplyPlan.submittedDate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                }, {
                    title: i18n.t('static.supplyPlan.approvedDate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                }, {
                    title: i18n.t('static.shipment.shipdate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                }, {
                    title: i18n.t('static.supplyPlan.arrivedDate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                }, {
                    title: i18n.t('static.shipment.receiveddate'),
                    type: 'calendar',
                    options: { format: 'MM-DD-YYYY' }

                },

                {
                    title: i18n.t('static.program.notes'),
                    type: 'text'
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
            paginationOptions: [10, 25, 50],
            position: 'top',
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            onchange: this.changed,
            oneditionend: this.onedit,
            copyCompatibility: true,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                show: '',
                entries: '',
            },
            onload: this.loadedCommonFunctionJExcel,

        };

        this.el = jexcel(document.getElementById("shipmenttableDiv"), options);
        this.loaded();
        this.setState({
            loading: false
        })
    }

    loadedCommonFunctionJExcel = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionPipeline(instance, 0);
    }


    SubmitShipment() {
        this.loaded()

        var data = this.el.getJson().map(ele => ({
            "shipmentId": null,
            "procurementUnit": null,

            "planningUnit": ele[0],
            "dataSource": ele[1],
            "procurementAgent": ele[2],
            "fundingSource": ele[3],
            "shipmentStatus": ele[4],
            "shipmentMode": ele[5],
            "suggestedQty": ele[6],
            "quantity": ele[6],
            "rate": ele[7],
            "freightCost": ele[8],
            "productCost": ele[9],
            "expectedDeliveryDate": ele[10],
            "orderedDate": ele[11],
            "plannedDate": ele[12],
            "submittedDate": ele[13],
            "approvedDate": ele[14],
            "shippedDate": ele[15],
            "arrivedDate": ele[16],
            "receivedDate": ele[17],
            "notes": ele[18],
            "accountFlag": false,
            "erpFlag": false,
            "versionId": 0,

            "active": true
        }))
        console.log(JSON.stringify(data))
        PipelineService.submitShipmentData(this.props.match.params.pipelineId, data)
            .then(response => {
                console.log("==========>", response.data)
                this.setState({
                    message: response.data.messageCode,
                    changedData: false,
                }, () => console.log("=====", this.state));
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


    }
    SubmitProgram() {
        this.SubmitShipment()
        PipelineService.getPlanningUnitListWithFinalInventry(this.props.match.params.pipelineId)
            .then(response => {
                var planningUnitListFinalInventory = response.data;
                console.log("planningUnitListFinalInventory====", planningUnitListFinalInventory);
                var negtiveInventoryList = (planningUnitListFinalInventory).filter(c => c.inventory < 0);
                console.log("negtive inventory list=====", negtiveInventoryList);
                if (negtiveInventoryList.length > 0) {
                    console.log("my page------");
                    this.props.history.push({
                        pathname: `/pipeline/planningUnitListFinalInventory/${this.props.match.params.pipelineId}`
                    });
                } else {
                    PipelineService.submitProgram(this.props.match.params.pipelineId)
                        .then(response => {
                            console.log(response.data.messageCode)
                            this.setState({
                                message: response.data.messageCode,
                                changedData: false,loading:false
                            })
                            this.props.history.push({
                                pathname: `/pipeline/pieplineProgramList`
                            });
                        }
                        ).catch(
                            error => {
                                if (error.message === "Network Error") {
                                    this.setState({ message: error.message ,loading:false});
                                } else {
                                    switch (error.response ? error.response.status : "") {
                                        case 500:
                                        case 401:
                                        case 404:
                                        case 406:
                                        case 412:
                                            this.setState({ message: error.response.data.messageCode ,loading:false});
                                            break;
                                        default:
                                            this.setState({ message: 'static.unkownError',loading:false });
                                            break;
                                    }
                                }
                            }
                        );


                    console.log('You have submitted the program');
                }

            });




    }

    render() {

        return (
            <>

                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <div className="table-responsive" style={{ display: this.state.loading ? "none" : "block" }}>
                    <h5>{i18n.t(this.state.message)}</h5>
                    <div id="shipmenttableDiv">
                    </div>
                    <div className="ml-2" >
                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepFour} > <i className="fa fa-angle-double-left"></i> Back</Button>
                        &nbsp;
                                       {this.state.changedData && <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.SubmitShipment}>Save<i className="fa fa-angle-double-right"></i></Button>}
                        {this.state.isValidData && !this.state.changedData && <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.SubmitProgram}>Submit Program</Button>}
                        &nbsp;
                                        </div>
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
