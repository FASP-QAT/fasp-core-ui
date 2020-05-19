import React from "react";

import {
    Card, CardBody, CardHeader,
    Col, Table, Modal, ModalBody, ModalFooter, ModalHeader, Button
} from 'reactstrap';
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import { Menu, Item, Separator, Submenu, MenuProvider } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
import { contextMenu } from 'react-contexify';
import moment from 'moment';

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
        // d.setMonth(d.getMonth() - 3);
        var month=[];
        month.push(((moment().utcOffset('0500').subtract(2, 'months').format('MMM YY'))))
        month.push(((moment().utcOffset('0500').subtract(1, 'months').format('MMM YY'))))
        month.push(((moment(Date.now()).utcOffset('-0500').format('MMM YY'))));
        month.push(((moment().utcOffset('0500').add(1, 'months').format('MMM YY'))))
        month.push(((moment().utcOffset('0500').add(2, 'months').format('MMM YY'))))
        month.push(((moment().utcOffset('0500').add(3, 'months').format('MMM YY'))))
        month.push(((moment().utcOffset('0500').add(4, 'months').format('MMM YY'))))
        month.push(((moment().utcOffset('0500').add(5, 'months').format('MMM YY'))))
        month.push(((moment().utcOffset('0500').add(6, 'months').format('MMM YY'))))
        month.push(((moment().utcOffset('0500').add(7, 'months').format('MMM YY'))))
        month.push(((moment().utcOffset('0500').add(8, 'months').format('MMM YY'))))
        month.push(((moment().utcOffset('0500').add(9, 'months').format('MMM YY'))))
        // month.push(((moment().utcOffset('0500').add(10, 'months').format('MMM YY'))))
        // month.push(((moment().utcOffset('0500').add(11, 'months').format('MMM YY'))))
        // month.push(((moment().utcOffset('0500').add(13, 'months').format('MMM YY'))))
        // month.push(((moment().utcOffset('0500').add(14, 'months').format('MMM YY'))))
        // month.push(((moment().utcOffset('0500').add(15, 'months').format('MMM YY'))))
        console.log("month array",month);
    };

    saveData = function () {
    };

    toggleLarge(supplyPlanType, month, quantity) {
        var supplyPlanType = supplyPlanType;
        if (supplyPlanType == 'Consumption') {
            this.setState({
                consumption: !this.state.consumption,
            });
        } else if (supplyPlanType == 'Actual QAT Orders') {
            this.setState({
                actualQATOrders: !this.state.actualQATOrders,
                qty: quantity
            });
        } else if (supplyPlanType == 'Shipments ARTMIS') {
            this.setState({
                shipmentsArtmis: !this.state.shipmentsArtmis,
                qty: quantity
            });
        } else if (supplyPlanType == 'Adjustments') {
            this.setState({
                adjustments: !this.state.adjustments,
            });
        } else if (supplyPlanType == 'QAT Recommended Order Qty') {
            this.setState({
                QATRecommendedOrderQty: !this.state.QATRecommendedOrderQty,
                qty: quantity
            });
        }

    }



    consumptionDetailsClicked(month, region, quantity) {
        this.el = jexcel(document.getElementById("consumptionDetailsTable"), '');
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
        this.el = jexcel(document.getElementById("consumptionDetailsTable"), options);
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


    handleEvent(e, toBeAccounted) {
        e.preventDefault();
        if (toBeAccounted == true) {
            contextMenu.show({
                id: 'menu_id',
                event: e,
                props: {
                    toBeAccounted: true
                }
            });
        } else {
            contextMenu.show({
                id: 'no_skip',
                event: e,
                props: {
                    toBeAccounted: true
                }
            });
        }
    }

    render() {
        const MyMenu = () => (
            <Menu id='menu_id'>
                <Item disabled>Yes-Account</Item>
                <Item>No-Skip</Item>
            </Menu>
        );

        const NoSkip = () => (
            <Menu id='no_skip'>
                <Item>Yes-Account</Item>
                <Item disabled>No-Skip</Item>
            </Menu>
        );
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
                                    <MyMenu />
                                    <NoSkip />
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
                                        <td onContextMenu={(e) => this.handleEvent(e, false)} className="hoverTd" onDoubleClick={() => this.toggleLarge('QAT Recommended Order Qty', 'Mar 20', '167')}>167</td>
                                        <td></td>
                                        <td></td>
                                        <td onContextMenu={(e) => this.handleEvent(e, false)} className="hoverTd" onDoubleClick={() => this.toggleLarge('QAT Recommended Order Qty', 'Jun 20', '44773')}>44,773</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td onContextMenu={(e) => this.handleEvent(e, true)} className="hoverTd" onDoubleClick={() => this.toggleLarge('QAT Recommended Order Qty', 'Oct 20', '68000')}>68,000</td>
                                        <td></td>
                                        <td onContextMenu={(e) => this.handleEvent(e, true)} className="hoverTd" onDoubleClick={() => this.toggleLarge('QAT Recommended Order Qty', 'Oct 20', '50000')}>50,000</td>
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(224, 239, 212)" }}>
                                        <td>Actual QAT Orders</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td onContextMenu={(e) => this.handleEvent(e, false)} className="hoverTd" onDoubleClick={() => this.toggleLarge('Actual QAT Orders', 'July 20', '44,773')}>44,773</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(255, 251, 204)" }}>
                                        <td>Shipments ARTMIS</td>
                                        <td></td>
                                        <td onContextMenu={(e) => this.handleEvent(e, true)} className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'Mar 20', '82200')}>82,200</td>
                                        <td onContextMenu={(e) => this.handleEvent(e, false)} className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'Apr 20', '167')}>167</td>
                                        <td></td>
                                        <td onContextMenu={(e) => this.handleEvent(e, true)} className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'Jun 20', '19466')}>19,466</td>
                                        <td onContextMenu={(e) => this.handleEvent(e, false)} className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'July 20', '18667')}>18,667</td>
                                        <td onContextMenu={(e) => this.handleEvent(e, false)} className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'August 20', '6640')}>6,640</td>
                                        <td></td>
                                        <td onContextMenu={(e) => this.handleEvent(e, false)} className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'Oct 20', '68359')}>68,359</td>
                                        <td onContextMenu={(e) => this.handleEvent(e, false)} className="hoverTd" onDoubleClick={() => this.toggleLarge('Shipments ARTMIS', 'Nov 20', '59567')}>59,567</td>
                                        <td></td>
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
                            <div className="table-responsive" id="consumptionDetailsTable" />
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
                    <Modal isOpen={this.state.QATRecommendedOrderQty} toggle={() => this.toggleLarge('QAT Recommended Order Qty')}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('QAT Recommended Order Qty')}>QAT Recommended Order</ModalHeader>
                        <ModalBody>
                            <Table bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th>QAT Order No</th>
                                        <th>Expected Delivery date</th>
                                        <th>Shipment Status</th>
                                        <th>Planning Unit</th>
                                        <th>Suggested Order Qty</th>
                                        <th>Adjusted Order Qty</th>
                                        <th>Notes</th>
                                        <th>Create date</th>
                                        <th>Created By</th>
                                        <th>Last Modified date</th>
                                        <th>Last Modified by</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>102129</td>
                                        <td>18 Jun 2020</td>
                                        <td>01-SUGGESTED</td>
                                        <td>Ceftriaxone 250 mg Powder Vial - 10 Vials</td>
                                        <td>{this.state.qty}</td>
                                        <td>{this.state.qty}</td>
                                        <td><input type="textarea" name="notes" id="notes" /></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.toggleLarge('QAT Recommended Order Qty')}>Do Something</Button>{' '}
                            <Button color="secondary" onClick={() => this.toggleLarge('QAT Recommended Order Qty')}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    <Modal isOpen={this.state.actualQATOrders} toggle={() => this.toggleLarge('Actual QAT Orders')}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('Actual QAT Orders')}>Actual QAT Orders</ModalHeader>
                        <ModalBody>
                            <Table bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th colspan="10"></th>
                                        <th colspan="5">Only for strategic products</th>
                                        <th colspan="11"></th>
                                    </tr>
                                    <tr>
                                        <th>QAT Order No</th>
                                        <th>Expected Delivery date</th>
                                        <th>Shipment Status</th>
                                        <th>Procurement Agent</th>
                                        <th>Funding Source</th>
                                        <th>Sub-Funding Source</th>
                                        <th>Budget</th>
                                        <th>Planning Unit</th>
                                        <th>Suggested Order Qty</th>
                                        <th>MoQ</th>
                                        <th>No of Pallets</th>
                                        <th>No of Containers</th>
                                        <th>Order based on</th>
                                        <th>Rounding option</th>
                                        <th>User Qty</th>
                                        <th>Adjusted Order Qty</th>
                                        <th>Adjusted Pallets</th>
                                        <th>Adjusted Containers</th>
                                        <th>Manual Price per Planning Unit</th>
                                        <th>Price per Planning Unit</th>
                                        <th>Amt</th>
                                        <th>Notes</th>
                                        <th>Create date</th>
                                        <th>Created By</th>
                                        <th>Last Modified date</th>
                                        <th>Last Modified by</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>102129</td>
                                        <td><input type="text" id="expectedDeliveryDate" value="18 Jun 2020" /></td>
                                        <td>02-PLANNED</td>
                                        <td><select>
                                            <option selected id="1">PSM</option>
                                        </select></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>{this.state.qty}</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.toggleLarge('Actual QAT Orders')}>Do Something</Button>{' '}
                            <Button color="secondary" onClick={() => this.toggleLarge('Actual QAT Orders')}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    <Modal isOpen={this.state.shipmentsArtmis} toggle={() => this.toggleLarge('Shipments ARTMIS')}
                        className={'modal-lg ' + this.props.className, "modalWidth"}>
                        <ModalHeader toggle={() => this.toggleLarge('Shipments ARTMIS')}>Shipments ARTMIS</ModalHeader>
                        <ModalBody>
                            <Table bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th>QAT Order No</th>
                                        <th>Order date</th>
                                        <th>Order Status</th>
                                        <th>RO</th>
                                        <th>Procurement Agent</th>
                                        <th>Funding Source</th>
                                        <th>Sub-Funding Source</th>
                                        <th>Budget</th>
                                        <th>Planning Unit</th>
                                        <th>Procurement Unit</th>
                                        <th>Conversion Units</th>
                                        <th>Qty</th>
                                        <th>Planning Unit Qty</th>
                                        <th>Supplier</th>
                                        <th>Price</th>
                                        <th>Amt</th>
                                        <th>Delivery date</th>
                                        <th>Notes</th>
                                        <th>Create date</th>
                                        <th>Created By</th>
                                        <th>Last Modified date</th>
                                        <th>Last Modified by</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>{this.state.qty}</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={() => this.toggleLarge('Shipments ARTMIS')}>Do Something</Button>{' '}
                            <Button color="secondary" onClick={() => this.toggleLarge('Shipments ARTMIS')}>Cancel</Button>
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