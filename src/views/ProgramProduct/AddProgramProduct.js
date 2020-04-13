import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row

} from 'reactstrap';
import DeleteSpecificRow from './TableFeatureTwo';
import ProgramService from "../../api/ProgramService";
import ProductService from "../../api/ProductService"
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitList from '../../api/PlanningUnitService'
import PlanningUnitService from "../../api/PlanningUnitService";
import { boolean } from "yup";

class AddprogramPlanningUnit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            programPlanningUnit: this.props.location.state.programPlanningUnit,
            planningUnitId: '',
            planningUnitName: '',
            reorderFrequencyInMonths: '',
            //maxMonth: '',
            rows: this.props.location.state.programPlanningUnit.planningUnitList,
            programList: [],
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

                    reorderFrequencyInMonths: this.state.reorderFrequencyInMonths,
                    //maxMonth: this.state.maxMonth
                })

            this.setState({ rows: this.state.rows, addRowMessage: '' })
        } else {
            // console.log("sorry----------->");
            this.state.addRowMessage = 'Planning Unit Already Exist In List.'
        }
        this.setState({
            planningUnitId: '',
            reorderFrequencyInMonths: '',
            //maxMonth: '',
            planningUnitName: ''
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

        if (event.target.name === 'reorderFrequencyInMonths') {
            this.setState({ reorderFrequencyInMonths: event.target.value });
        }
        // if (event.target.name === 'maxMonth') {
        //     this.setState({ maxMonth: event.target.value });
        // } 
        else if (event.target.name === 'planningUnitId') {
            this.setState({ planningUnitName: event.target[event.target.selectedIndex].text });
            this.setState({ planningUnitId: event.target.value })
        }
    };
    submitForm() {
        var programPlanningUnit = {
            programId: this.state.programPlanningUnit.programId,
            planningUnits: this.state.rows
        }

        AuthenticationService.setupAxiosInterceptors();
        // console.log("------------------programProdcut", programPlanningUnit);
        ProgramService.addprogramPlanningUnitMapping(programPlanningUnit)
            .then(response => {
                console.log(response.data);
                if (response.status == "200") {
                    console.log(response);
                    this.props.history.push(`/program/listProgram/${response.data.message}`)
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
        ProgramService.getProgramList().then(response => {
            console.log(response.data);
            if (response.status == "200") {
                this.setState({
                    programList: response.data
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
        const { programList } = this.state;
        const { planningUnitList } = this.state;
        let programs = programList.length > 0 && programList.map((item, i) => {
            return (
                <option key={i} value={item.programId}>
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
                                <strong>Add Program Product</strong>
                            </CardHeader>
                            <CardBody>
                                <FormGroup>
                                    <Label htmlFor="select">Select Program</Label>
                                    <Input type="select" value={this.state.programPlanningUnit.programId} name="programId" id="programId" disabled>
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
                                    <Label htmlFor="company">Reorder Frequency In Months</Label>
                                    <Input type="number" min='0' name="reorderFrequencyInMonths" id="reorderFrequencyInMonths" value={this.state.reorderFrequencyInMonths} placeholder="Enter min month stock" onChange={event => this.setTextAndValue(event)} />
                                </FormGroup>
                                {/* <FormGroup>
                                    <Label htmlFor="company">Max Month Stock</Label>
                                    <Input type="number" min="0" name="maxMonth" id="maxMonth" value={this.state.maxMonth} placeholder="Enter max month stock" onChange={event => this.setTextAndValue(event)} />
                                </FormGroup> */}
                                <FormGroup>
                                    <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> Remove Last Row</Button>
                                    <Button type="submit" size="sm" color="success" onClick={this.addRow} className="float-right mr-1" ><i className="fa fa-check"></i>Add</Button>
                                    &nbsp;

                        </FormGroup>
                                <h5>{this.state.addRowMessage}</h5>
                                <Table responsive>

                                    <thead>
                                        <tr>

                                            <th className="text-left"> Program </th>
                                            <th className="text-left"> Planing Unit</th>
                                            <th className="text-left"> Reorder frequency in month </th>
                                            {/* <th className="text-left">Max Month Stock</th> */}
                                            <th className="text-left">Delete Row</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.rows.map((item, idx) => (
                                                <tr id="addr0" key={idx}>
                                                    <td>
                                                        {this.state.programPlanningUnit.label.label_en}
                                                    </td>
                                                    <td>
                                                        {this.state.rows[idx].label.label_en}
                                                    </td>
                                                    <td>

                                                        {this.state.rows[idx].reorderFrequencyInMonths}
                                                    </td>
                                                    {/* <td>
                                                        {this.state.rows[idx].maxMonth}
                                                    </td> */}
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
        this.props.history.push(`/program/listProgram/` + "Action Canceled")
    }

}

export default AddprogramPlanningUnit;