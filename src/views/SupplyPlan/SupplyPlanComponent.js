import React from "react";

import {
    Card, CardBody, CardHeader,
    Col, Table, Modal, ModalBody, ModalFooter, ModalHeader, Button
} from 'reactstrap';
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';

export default class SupplyPlanComponent extends React.Component {

    constructor(props) {
        super(props);
        this.options = {
            onRowDoubleClick: function (row) {
                console.log("row", row);
            }.bind(this)
        }
        this.state = {
            large: false
        }
        this.saveData = this.saveData.bind(this)
        this.cancelClicked = this.cancelClicked.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
    }

    componentDidMount() {
        document.getElementById("shipmentArtmisCard").style.display = "none";
        document.getElementById("actualQATOrdersCard").style.display = "none";
    };

    saveData = function () {
    };

    toggleLarge(supplyPlanType, month, quantity) {
        var supplyPlanType = supplyPlanType;
        this.el = jexcel(document.getElementById("actualQATOrdersDiv"), '');
        console.log("this.el===================", this.el)
        this.el.destroy();
        this.el = jexcel(document.getElementById("shipmentsARTMIS"), '');
        console.log("this.el===================", this.el)
        this.el.destroy();
        document.getElementById("shipmentArtmisCard").style.display = "none";
        document.getElementById("actualQATOrdersCard").style.display = "none";
        if (supplyPlanType == 'Consumption') {
            this.setState({
                consumption: !this.state.consumption,
            });
        } else if (supplyPlanType == 'Actual QAT Orders') {
            document.getElementById("actualQATOrdersCard").style.display = "block";
            var json = [];
            var data = [];
            data[0] = month;
            data[1] = "";
            data[2] = "";
            data[3] = "";
            data[4] = "";
            data[5] = "";
            data[6] = "";
            data[7] = "";
            data[8] = "";
            data[9] = "";
            data[10] = "";
            data[11] = "";
            data[12] = "";
            data[13] = "";
            data[14] = quantity;
            data[15] = "";
            data[16] = "";
            data[17] = "";
            data[18] = "";
            data[19] = "";
            data[20] = "";
            data[21] = "";
            data[22] = "";
            data[23] = "";
            data[24] = "";
            data[25] = "";
            json[0] = data;
            var options = {
                data: json,
                colHeaders: [
                    "Month",
                    "QAT Order No",
                    "Delivery date",
                    "Order Status",
                    "RO No",
                    "Procurement Agent",
                    "Planning Unit",
                    "Suggested Order Qty",
                    "MOQ",
                    "Adjusted Order Qty",
                    "Manual Price per Planning Unit",
                    "Procurement Unit",
                    "Supplier",
                    "Multiplier",
                    "Qty",
                    "Final Planning Unit Qty",
                    "Price per Planning Unit",
                    "Amt",
                    "Funding Source",
                    "Sub-Funding Source",
                    "Budget",
                    "Notes",
                    "Create date",
                    "Created By",
                    "Last Modified date",
                    "Last Modified by"
                ],
                colWidths: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
                columns: [
                    { type: 'text', readOnly: true },
                ],
                pagination: false,
                search: false,
                columnSorting: true,
                tableOverflow: true,
                wordWrap: true,
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: false,
            };

            // this.el=jexcel(document.getElementById("actualQATOrdersDiv"),"");
            console.log("this.el================", this.el)
            this.el = jexcel(document.getElementById("actualQATOrdersDiv"), options);
        } else if (supplyPlanType == 'Shipments ARTMIS') {
            document.getElementById("shipmentArtmisCard").style.display = "block";
            var json = [];
            var data = [];
            data[0] = month;
            data[1] = "";
            data[2] = "";
            data[3] = "";
            data[4] = "";
            data[5] = "";
            data[6] = "";
            data[7] = "";
            data[8] = "";
            data[9] = "";
            data[10] = "";
            data[11] = quantity;
            data[12] = "";
            data[13] = "";
            data[14] = "";
            data[15] = "";
            data[16] = "";
            data[17] = "";
            data[18] = "";
            data[19] = "";
            data[20] = "";
            data[21] = "";
            json[0] = data;
            var options = {
                data: json,
                colHeaders: [
                    "Month",
                    "QAT Order No",
                    "RO",
                    "Procurement Agent",
                    "Funding Source",
                    "Sub-Funding Source",
                    "Budget",
                    "Planning Unit",
                    "Procurement Unit",
                    "Conversion Units",
                    "Qty",
                    "Planning Unit Qty",
                    "Manufacturer",
                    "Price",
                    "Amt",
                    "Delivery date",
                    "Order Status",
                    "Notes",
                    "Create date",
                    "Created By",
                    "Last Modified date",
                    "Last Modified by"
                ],
                colWidths: [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
                columns: [
                    { type: 'text', readOnly: true },
                ],
                pagination: false,
                search: false,
                columnSorting: true,
                tableOverflow: true,
                wordWrap: true,
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: false,
            };

            // this.el=jexcel(document.getElementById("actualQATOrdersDiv"),"");
            console.log("this.el================", this.el)
            this.el = jexcel(document.getElementById("shipmentsARTMIS"), options);
        } else if (supplyPlanType == 'Adjustments') {
            this.setState({
                adjustments: !this.state.adjustments,
            });
        }

    }

    consumptionDetailsClicked(month, region, quantity) {
        // console.log("This=====================>",this.children[0])
        this.el = jexcel(document.getElementById("jexcelTable"), '');
        console.log("this.el===================", this.el)
        this.el.destroy();
        var json = [];
        var data = [];
        data[0] = month;
        data[1] = region;
        data[2] = "";
        data[3] = quantity;
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        data[9] = "";
        json[0] = data;
        var options = {
            data: json,
            colHeaders: [
                "Month",
                "Region",
                "Data source",
                "Quantity",
                "Days of Stock out",
                "Notes",
                "Create date",
                "Created By",
                "Last Modified date",
                "Last Modified by"
            ],
            colWidths: [80, 80, 80, 80, 80, 200, 80, 80, 80, 80],
            columns: [
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true },
                { type: 'dropdown', source: ['Data source1', 'Data source2', 'Data source3'] },
                { type: 'numeric' },
                { type: 'numeric' },
                { type: 'text' },
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true },
                { type: 'text', readOnly: true }
            ],
            pagination: false,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false
        };
        this.el = jexcel(document.getElementById("jexcelTable"), options);
    }

    adjustmentsDetailsClicked(month, region, quantity) {
        // console.log("This=====================>",this.children[0])
        this.el = jexcel(document.getElementById("adjustmentsTable"), '');
        console.log("this.el===================", this.el)
        this.el.destroy();
        var json = [];
        var data = [];
        data[0] = month;
        data[1] = region;
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        data[9] = "";
        data[10] = "";
        data[11] = "";
        data[12] = "";
        data[13] = "";
        data[14] = "";
        data[15] = "";
        data[16] = "";
        data[17] = "";
        data[18] = "";

        json[0] = data;
        var options = {
            data: json,
            // colHeaders: [
            //     "Month",
            //     "Region",
            //     "Data source",
            //     "Country SKU",
            //     "SKU Code",
            //     "Conversion units",
            //     "Quantity",
            //     "Planning Unit Qty",
            //     "Quantity",
            //     "Planning Unit Qty",
            //     "Quantity",
            //     "Planning Unit Qty",
            //     "Quantity",
            //     "Planning Unit Qty",
            //     "Notes",
            //     "Create date",
            //     "Created By",
            //     "Last Modified date",
            //     "Last Modified by"
            // ],
            nestedHeaders: [
                [
                    {
                        title: '',
                        colspan: '6',
                    },
                    {
                        title: 'Expected Stock',
                        colspan: '2'
                    },
                    {
                        title: 'Manual Adjustment',
                        colspan: '2'
                    }, {
                        title: 'Actual Stock count',
                        colspan: '2'
                    },
                    {
                        title: 'Final Adjustment',
                        colspan: '2'
                    },
                    {
                        title: '',
                        colspan: '5',
                    }
                ],
            ],
            columnDrag: true,
            colWidths: [80, 80, 80, 80, 80, 200, 80, 80, 80, 80],
            columns: [
                { title: 'Month', type: 'text', readOnly: true },
                { title: 'Region', type: 'text', readOnly: true },
                { title: 'Data source', type: 'dropdown', source: ['Data source1', 'Data source2', 'Data source3'] },
                { title: 'Country SKU', type: 'text' },
                { title: 'SKU Code', type: 'text' },
                { title: 'Conversion units', type: 'text' },
                { title: 'Quantity', type: 'text' },
                { title: 'Planning Unit Qty', type: 'text' },
                { title: 'Quantity', type: 'text' },
                { title: 'Planning Unit Qty', type: 'text' },
                { title: 'Quantity', type: 'text' },
                { title: 'Planning Unit Qty', type: 'text' },
                { title: 'Quantity', type: 'text' },
                { title: 'Planning Unit Qty', type: 'text' },
                { title: 'Notes', type: 'text' },
                { title: 'Create date', type: 'text', readOnly: true },
                { title: 'Created By', type: 'text', readOnly: true },
                { title: 'Last Modified date', type: 'text', readOnly: true },
                { title: 'Last Modified by', type: 'text', readOnly: true }
            ],
            pagination: false,
            search: true,
            columnSorting: true,
            tableOverflow: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false
        };
        this.el = jexcel(document.getElementById("adjustmentsTable"), options);
    }

    render() {
        return (
            <>
                <Col xs="12" sm="12">
                    <h5>{i18n.t(this.state.message)}</h5>
                    <Card>
                        <CardHeader>
                            <strong>Supply plan</strong>
                        </CardHeader>
                        <CardBody>
                            <Table bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Feb - 20</th>
                                        <th>Mar - 20</th>
                                        <th>Apr - 20</th>
                                        <th>May - 20</th>
                                        <th>Jun - 20</th>
                                        <th>July - 20</th>
                                        <th>Aug - 20</th>
                                        <th>Sep - 20</th>
                                        <th>Oct - 20</th>
                                        <th>Nov - 20</th>
                                        <th>Dec - 20</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Opening Balance</td>
                                        <td>5,260</td>
                                        <td>5,043</td>
                                        <td>75,409</td>
                                        <td>63,110</td>
                                        <td>49,532</td>
                                        <td>99,110</td>
                                        <td>103,372</td>
                                        <td>94,908</td>
                                        <td>79,049</td>
                                        <td>130,756</td>
                                        <td>172,838</td>
                                    </tr>
                                    <tr className="hoverTd" onDoubleClick={() => this.toggleLarge('Consumption', '', '')}>
                                        <td>Consumption</td>
                                        <td></td>
                                        <td>11,834</td>
                                        <td>12,408</td>
                                        <td>13,047</td>
                                        <td>13,700</td>
                                        <td>14,385</td>
                                        <td>15,104</td>
                                        <td>15,859</td>
                                        <td>16,652</td>
                                        <td>17,485</td>
                                        <td>18,359</td>
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(255, 229, 202)" }}>
                                        <td>QAT Recommended Order Qty</td>
                                        <td></td>
                                        <td>167</td>
                                        <td></td>
                                        <td></td>
                                        <td>44,773</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>68,000</td>
                                        <td></td>
                                        <td>50,000</td>
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(255, 229, 202)" }}>
                                        <td>To be accounted</td>
                                        <td>
                                            <select name="toBeAccounted">
                                                <option value=""></option>
                                                <option value="0">No-skip</option>
                                                <option value="1">Yes-Account</option>
                                            </select>
                                        </td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(224, 239, 212)" }}>
                                        <td>Actual QAT Orders</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td className="hoverTd" onDoubleClick={() => this.toggleLarge('Actual QAT Orders', 'July 20', '44,773')}>44,773</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(224, 239, 212)" }}>
                                        <td>To be accounted</td>
                                        <td>
                                            <select name="toBeAccounted">
                                                <option value=""></option>
                                                <option value="0">No-skip</option>
                                                <option value="1">Yes-Account</option>
                                            </select>
                                        </td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(255, 251, 204)" }}>
                                        <td>Shipments ARTMIS</td>
                                        <td></td>
                                        <td className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'Mar 20', '82200')}>82,200</td>
                                        <td className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'Apr 20', '167')}>167</td>
                                        <td></td>
                                        <td className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'Jun 20', '19466')}>19,466</td>
                                        <td className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'July 20', '18667')}>18,667</td>
                                        <td className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'August 20', '6640')}>6,640</td>
                                        <td></td>
                                        <td className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'Oct 20', '68359')}>68,359</td>
                                        <td className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'Nov 20', '59567')}>59,567</td>
                                        <td></td>
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(255, 251, 204)" }}>
                                        <td>To be accounted</td>
                                        <td>
                                            <select name="toBeAccounted">
                                                <option value=""></option>
                                                <option value="0">No-skip</option>
                                                <option value="1">Yes-Account</option>
                                            </select>
                                        </td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                        <td><select name="toBeAccounted">
                                            <option value=""></option>
                                            <option value="0">No-skip</option>
                                            <option value="1">Yes-Account</option>
                                        </select></td>
                                    </tr>
                                    <tr className="hoverTd" onDoubleClick={() => this.toggleLarge('Adjustments', '', '')}>
                                        <td>Adjustments</td>
                                        <td>(217)</td>
                                        <td>0</td>
                                        <td>(58)</td>
                                        <td>(504)</td>
                                        <td>0</td>
                                        <td>(208)</td>
                                        <td>0</td>
                                        <td>0</td>
                                        <td>0</td>
                                        <td>0</td>
                                        <td>0</td>
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(188, 228, 229)" }}>
                                        <td>Ending balance</td>
                                        <td>5,043</td>
                                        <td>75,409</td>
                                        <td>63,110</td>
                                        <td>49,559</td>
                                        <td>55,325</td>
                                        <td>59,399</td>
                                        <td>50,935</td>
                                        <td>35,076</td>
                                        <td>86,783</td>
                                        <td>128,865</td>
                                        <td>110,506</td>
                                    </tr>
                                    <tr>
                                        <td>AMC</td>
                                        <td>12,747</td>
                                        <td>13,074</td>
                                        <td>13,413</td>
                                        <td>13,762</td>
                                        <td>14,450</td>
                                        <td>15,176</td>
                                        <td>15,934</td>
                                        <td>16,731</td>
                                        <td>17,568</td>
                                        <td>18,446</td>
                                        <td>19,369</td>
                                    </tr>
                                    <tr>
                                        <td>Months of Stock</td>
                                        <td>0.4</td>
                                        <td>5.8</td>
                                        <td>4.7</td>
                                        <td>3.6</td>
                                        <td>3.8</td>
                                        <td>3.9</td>
                                        <td>3.2</td>
                                        <td>2.1</td>
                                        <td>4.9</td>
                                        <td>7.0</td>
                                        <td>5.7</td>
                                    </tr>
                                </tbody>
                            </Table>
                            {/* <div className="table-responsive" id="actualQATOrdersDiv" /> */}
                            <Card id="actualQATOrdersCard"><CardHeader><strong>Actual QAT Orders</strong></CardHeader><CardBody><div className="table-responsive" id="actualQATOrdersDiv" /></CardBody></Card>
                            <Card id="shipmentArtmisCard"><CardHeader><strong>Shipment ARTMIS Details</strong></CardHeader><CardBody><div className="table-responsive" id="shipmentsARTMIS" /></CardBody></Card>
                        </CardBody>
                    </Card>
                    <Modal isOpen={this.state.consumption} toggle={() => this.toggleLarge('Consumption')}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('Consumption')}>Consumption Details</ModalHeader>
                        <ModalBody>
                            <Table bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Mar 20</th>
                                        <th>Apr 20</th>
                                        <th>May 20</th>
                                        <th>June 20</th>
                                        <th>July 20</th>
                                        <th>August 20</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Region A</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Mar 20", "Region A", "3046")}>3,046</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Apr 20", "Region A", "2153")}>2,153</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("May 20", "Region A", "2012")}>2,012</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("June 20", "Region A", "1723")}>1,723</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("July 20", "Region A", "1023")}>1,023</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("August 20", "Region A", "2023")}>2,023</td>
                                    </tr>
                                    <tr>
                                        <td>Region B</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Mar 20", "Region B", "3350")}>3,350</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Apr 20", "Region B", "4202")}>4,202</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("May 20", "Region B", "4012")}>4,012</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Jun 20", "Region B", "6025")}>6,025</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("July 20", "Region B", "3012")}>3,012</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("August 20", "Region B", "4012")}>4,012</td>
                                    </tr>
                                    <tr>
                                        <td>Region C</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Mar 20", "Region C", "4115")}>4,115</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Apr 20", "Region C", "3801")}>3,801</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("May 20", "Region C", "4490")}>4,490</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Jun 20", "Region C", "4100")}>4,100</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("July 20", "Region C", "9082")}>9,082</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("August 20", "Region C", "8082")}>8,082</td>
                                    </tr>
                                    <tr>
                                        <td>Region D</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Mar 20", "Region D", "140")}>140</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Apr 20", "Region D", "75")}>75</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("May 20", "Region D", "106")}>106</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Jun 20", "Region D", "85")}>85</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("July 20", "Region D", "60")}>60</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("August 20", "Region D", "72")}>72</td>
                                    </tr>
                                    <tr>
                                        <td>Region E</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Mar 20", "Region E", "1183")}>1,183</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Apr 20", "Region E", "2177")}>2,177</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("May 20", "Region E", "2427")}>2,427</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("Jun 20", "Region E", "1767")}>1,767</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("July 20", "Region E", "1208")}>1,208</td>
                                        <td className="hoverTd" onClick={() => this.consumptionDetailsClicked("August 20", "Region E", "915")}>915</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th>Total</th>
                                        <th>11,834</th>
                                        <th>12,408</th>
                                        <th>13,047</th>
                                        <th>13,700</th>
                                        <th>14,385</th>
                                        <th>15,104</th>
                                    </tr>
                                </tfoot>
                            </Table>
                            <div className="table-responsive" id="jexcelTable" />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.toggleLarge('Consumption')}>Do Something</Button>{' '}
                            <Button color="secondary" onClick={() => this.toggleLarge('Consumption')}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    <Modal isOpen={this.state.adjustments} toggle={() => this.toggleLarge('Adjustments')}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('Adjustments')}>Adjustments Details</ModalHeader>
                        <ModalBody>
                            <Table bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Mar 20</th>
                                        <th>Apr 20</th>
                                        <th>May 20</th>
                                        <th>June 20</th>
                                        <th>July 20</th>
                                        <th>August 20</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Region A</td>
                                        <td></td>
                                        <td></td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("May 20", "Region A", "(50)")}>(50)</td>
                                        <td>0</td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("July 20", "Region A", "125")}>(125)</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Region B</td>
                                        <td></td>
                                        <td></td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("May 20", "Region B", "25")}>25</td>
                                        <td>0</td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("July 20", "Region B", "25")}>25</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Region C</td>
                                        <td></td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("Apr 20", "Region C", "58")}>(58)</td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("May 20", "Region C", "225")}>(225)</td>
                                        <td>0</td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("July 20", "Region C", "90")}>(90)</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Region D</td>
                                        <td></td>
                                        <td></td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("May 20", "Region D", "238")}>(238)</td>
                                        <td>0</td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("July 20", "Region D", "10")}>(10)</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Region E</td>
                                        <td></td>
                                        <td></td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("May 20", "Region E", "16")}>(16)</td>
                                        <td>0</td>
                                        <td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked("July 20", "Region E", "8")}>(8)</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th>Total</th>
                                        <th>0</th>
                                        <th>(58)</th>
                                        <th>(504)</th>
                                        <th>0</th>
                                        <th>(208)</th>
                                        <th>0</th>
                                    </tr>
                                </tfoot>
                            </Table>
                            <div id="adjustmentsTable" className="table-responsive" />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.toggleLarge('Adjustments')}>Do Something</Button>{' '}
                            <Button color="secondary" onClick={() => this.toggleLarge('Adjustments')}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    {/* <Modal isOpen={this.state.actualQATOrders} toggle={() => this.toggleLarge('Actual QAT Orders','','')}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('Actual QAT Orders')}>Actual QAT Orders Details</ModalHeader>
                        <ModalBody onLoad={()=>this.getActualQATOrders()}>
                            <div id="actualQATOrdersDiv" />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.toggleLarge('Actual QAT Orders')}>Do Something</Button>{' '}
                            <Button color="secondary" onClick={() => this.toggleLarge('Actual QAT Orders')}>Cancel</Button>
                        </ModalFooter>
                    </Modal> */}
                </Col>

            </>
        )
    }

    cancelClicked() {
        // this.props.history.push(`/dashboard/${i18n.t('static.actionCancelled')}`)
    }

    changed = function (instance, cell, x, y, value) {
        // if (x == 2) {
        //     var col = ("C").concat(parseInt(y) + 1);
        //     this.el.setStyle(col, "background-color", "transparent");
        //     this.el.setStyle(col, "background-color", "yellow");
        //     if (value == "") {
        //         this.el.setComments(col, `${i18n.t('static.label.fieldRequired')}`);
        //     } else {
        //         this.el.setComments(col, "");
        //     }
        // } else if (x == 3) {
        //     var col = ("D").concat(parseInt(y) + 1);
        //     this.el.setStyle(col, "background-color", "transparent");
        //     this.el.setStyle(col, "background-color", "yellow");
        // } else if (x == 4) {
        //     var col = ("E").concat(parseInt(y) + 1);
        //     this.el.setStyle(col, "background-color", "transparent");
        //     this.el.setStyle(col, "background-color", "yellow");
        // } else if (x == 5) {
        //     var col = ("F").concat(parseInt(y) + 1);
        //     this.el.setStyle(col, "background-color", "transparent");
        //     this.el.setStyle(col, "background-color", "yellow");
        // }

        // var labelList = this.state.labelList;
        // var tableJson = this.el.getRowData(y);
        // var map = new Map(Object.entries(tableJson))
        // var json = {
        //     labelId: map.get("0"),
        //     label_en: map.get("2"),
        //     label_sp: map.get("5"),
        //     label_fr: map.get("3"),
        //     label_pr: map.get("4")
        // }
        // labelList[y] = (JSON.stringify(json));
        // this.setState({
        //     labelList: labelList
        // })
    }.bind(this)

    editStart = function (instance, cell, x, y, value) {
        if (x == 0) {

        }
    }.bind(this)

    // getActualQATOrders(){
    //     console("on load function")
    // }
}


