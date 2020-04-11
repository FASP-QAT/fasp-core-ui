
import React, { Component } from 'react';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row

} from 'reactstrap';
import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from "../../api/PlanningUnitService";

export default class AddProcurementAgentPlanningUnit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            procurementAgentPlanningUnit: this.props.location.state.procurementAgentPlanningUnit,

            planningUnitId: '',
            planningUnitName: '',
            skuCode: '',
            catalogPrice: '',
            moq: '',
            unitsPerPallet: '',
            unitsPerContainer: '',
            volume: '',
            weight: '',

            rows: this.props.location.state.procurementAgentPlanningUnit.planningUnitList,
            procurementAgentList: [],
            planningUnitList: [],
            addRowMessage: ''
        }
        this.addRow = this.addRow.bind(this);
        this.deleteLastRow = this.deleteLastRow.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);

    }
    addRow() {
        let addRow = true;
        if (addRow) {
            this.state.rows.map(item => {
                if (item.planningUnitId == this.state.planningUnitId) {
                    addRow = false;
                }
            }
            )
        }
        if (addRow == true) {
            this.state.rows.push(
                {
                    planningUnitId: this.state.planningUnitId,
                    label:
                    {
                        label_en: this.state.planningUnitName
                    },

                    skuCode: this.state.skuCode,
                    catalogPrice: this.state.catalogPrice,
                    moq: this.state.moq,
                    unitsPerPallet: this.state.unitsPerPallet,
                    unitsPerContainer: this.state.unitsPerContainer,
                    volume: this.state.volume,
                    weight: this.state.weight
                })

            this.setState({ rows: this.state.rows, addRowMessage: '' })
        } else {
            this.state.addRowMessage = 'Planning Unit Already Exist In List.'
        }
        this.setState({
            planningUnitId: '',
            planningUnitName: '',
            skuCode: '',
            catalogPrice: '',
            moq: '',
            unitsPerPallet: '',
            unitsPerContainer: '',
            volume: '',
            weight: ''

        });

    }
    deleteLastRow() {
        this.setState({
            rows: this.state.rows.slice(0, -1)
        });
    }

    handleRemoveSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows.splice(idx, 1);
        this.setState({ rows })
    }

    setTextAndValue = (event) => {

        if (event.target.name === 'skuCode') {
            this.setState({ skuCode: event.target.value });
        }
        if (event.target.name === 'catalogPrice') {
            this.setState({ catalogPrice: event.target.value });
        }
        if (event.target.name === 'moq') {
            this.setState({ moq: event.target.value });
        }
        if (event.target.name === 'unitsPerPallet') {
            this.setState({ unitsPerPallet: event.target.value });
        }
        if (event.target.name === 'unitsPerContainer') {
            this.setState({ unitsPerContainer: event.target.value });
        }
        if (event.target.name === 'volume') {
            this.setState({ volume: event.target.value });
        }
        if (event.target.name === 'weight') {
            this.setState({ weight: event.target.value });
        }
        else if (event.target.name === 'planningUnitId') {
            this.setState({ planningUnitName: event.target[event.target.selectedIndex].text });
            this.setState({ planningUnitId: event.target.value })
        }
    };

    submitForm() {
        var procurementAgentPlanningUnit = {
            procurementAgentId: this.state.procurementAgentPlanningUnit.procurementAgentId,
            planningUnits: this.state.rows
        }

        AuthenticationService.setupAxiosInterceptors();
        // console.log("------------------programProdcut", programPlanningUnit);
        ProcurementAgentService.addprocurementAgentPlanningUnitMapping(procurementAgentPlanningUnit)
            .then(response => {
                console.log(response.data);
                if (response.status == "200") {
                    console.log(response);
                    this.props.history.push(`/procurementAgent/listProcurementAgent/${response.data.message}`)
                } else {
                    this.setState({
                        message: response.data.message
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
        AuthenticationService.setupAxiosInterceptors();
        ProcurementAgentService.getProcurementAgentListAll().then(response => {
            console.log(response.data);
            if (response.status == "200") {
                this.setState({
                    procurementAgentList: response.data
                });
            } else {
                this.setState({
                    message: response.data.message
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
        PlanningUnitService.getActivePlanningUnitList().then(response => {
            // console.log(response.data.data);
            if (response.status == 200) {
                this.setState({
                    planningUnitList: response.data
                });
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


    }
    render() {
        const { procurementAgentList } = this.state;
        const { planningUnitList } = this.state;
        let programs = procurementAgentList.length > 0 && procurementAgentList.map((item, i) => {
            return (
                <option key={i} value={item.procurementAgentId}>
                    {item.label.label_en}
                </option>
            )
        }, this);
        let products = planningUnitList.length > 0 && planningUnitList.map((item, i) => {
            return (
                <option key={i} value={item.planningUnitId}>
                    {item.label.label_en}
                </option>
            )
        }, this);
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={10} style={{ flexBasis: 'auto' }}>
                        <Card>

                            <CardHeader>
                                <strong>Map Planning Unit</strong>
                            </CardHeader>
                            <CardBody>
                                <FormGroup>
                                    <Label htmlFor="select">Select Procurement Agent</Label>
                                    <Input type="select" value={this.state.procurementAgentPlanningUnit.procurementAgentId} name="procurementAgentId" id="procurementAgentId" disabled>
                                        {programs}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="select">Select Planning Unit</Label>
                                    <Input type="select" name="planningUnitId" id="select" value={this.state.planningUnitId} onChange={event => this.setTextAndValue(event)}>
                                        <option value="">Please select</option>
                                        {products}
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="company">SKU Code</Label>
                                    <Input type="text" name="skuCode" id="skuCode" value={this.state.skuCode} placeholder="Enter SKU code" onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="company">Catlog Price</Label>
                                    <Input type="number" min="0" name="catalogPrice" id="catalogPrice" value={this.state.catalogPrice} placeholder="Enter catlog price" onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="company">MOQ</Label>
                                    <Input type="number" min="0" name="moq" id="moq" value={this.state.moq} placeholder="Enter moq" onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="company">Unit Per Pallet</Label>
                                    <Input type="number" min="0" name="unitsPerPallet" id="unitsPerPallet" value={this.state.unitsPerPallet} placeholder="Enter unit per pallet" onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="company">Unit Per Container</Label>
                                    <Input type="number" min="0" name="unitsPerContainer" id="unitsPerContainer" value={this.state.unitsPerContainer} placeholder="Enter unitsPerContainer" onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="company">Volume</Label>
                                    <Input type="number" min="0" name="volume" id="volume" value={this.state.volume} placeholder="Enter volume" onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="company">Weight</Label>
                                    <Input type="number" min="0" name="weight" id="weight" value={this.state.weight} placeholder="Enter weight" onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                <FormGroup>
                                    <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> Remove Last Row</Button>
                                    <Button type="submit" size="sm" color="success" onClick={this.addRow} className="float-right mr-1" ><i className="fa fa-check"></i>Add</Button>
                                    &nbsp;

                        </FormGroup>
                                <h5>{this.state.addRowMessage}</h5>
                                <Table responsive>

                                    <thead>
                                        <tr>

                                            <th className="text-left"> Procurement Agent </th>
                                            <th className="text-left"> Planing Unit</th>
                                            <th className="text-left"> SKU Code </th>
                                            <th className="text-left">Catlog Price </th>
                                            <th className="text-left">MOQ </th>
                                            <th className="text-left">Unit Per Pallet </th>
                                            <th className="text-left">Unit Per Container </th>
                                            <th className="text-left">Volume </th>
                                            <th className="text-left">Weight </th>
                                            <th className="text-left">Delete Row</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.rows.map((item, idx) => (
                                                <tr id="addr0" key={idx}>
                                                    <td>
                                                        {this.state.procurementAgentPlanningUnit.label.label_en}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].label.label_en}
                                                    </td>
                                                    <td>

                                                        {this.state.rows[idx].skuCode}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].catalogPrice}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].moq}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].unitsPerPallet}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].unitsPerContainer}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].volume}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].weight}
                                                    </td>
                                                    <td>
                                                        <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} />
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>

                                </Table>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> Cancel</Button>
                                    <Button type="submit" size="sm" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>Submit</Button>
                                    &nbsp;
                                </FormGroup>

                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div>

        );
    }
    cancelClicked() {
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + "Action Canceled")
    }
}