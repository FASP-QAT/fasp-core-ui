import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Badge, Col, Row

} from 'reactstrap';
// import deleteSpecificRowFormTable from './TableFeatures'
import DeleteSpecificRow from './TableFeatureTwo'

class AddProgramProduct extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // programProduct:{
            programId: '',
            programName: '',
            productId: '',
            productName: '',
            minMonth: '',
            maxMonth: '',
            // },
            rows: []
        }

        this.addRow = this.addRow.bind(this);
        this.deleteLastRow = this.deleteLastRow.bind(this);
        //this.handleChange=this.handleChange.bind(this);
        this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
        this.updateFieldData = this.updateFieldData.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.setTextAndValue = this.setTextAndValue.bind(this);

    }
    addRow() {
        console.log(this.state);
        var rows = this.state.rows
        rows.push({ programId: this.state.programId, programName: this.state.programName, productId: this.state.productId, productName: this.state.productName, minMonth: this.state.minMonth, maxMonth: this.state.maxMonth })
        this.setState({ rows: rows });
        this.setState({ productId: '', minMonth: '', maxMonth: '' });

    }
    deleteLastRow() {
        this.setState({
            rows: this.state.rows.slice(0, -1)
        });
    }
    // handleChange = idx => e => {
    //     const { name, value } = e.target;
    //     const rows = [...this.state.rows];
    //     rows[idx] = {
    //       [name]: value
    //     };
    //     this.setState({
    //       rows
    //     });
    //   };

    handleRemoveSpecificRow(idx) {
        const rows = [...this.state.rows]
        rows.splice(idx, 1);
        this.setState({ rows })
    }

    // handleRemoveSpecificRow = (idx) => () => {
    //     const rows = [...this.state.rows]
    //     rows.splice(idx, 1)
    //     this.setState({ rows })
    // }

    updateFieldData(event) {
        this.setState(
            {
                [event.target.name]: event.target.value

            }

        )

    }

    setTextAndValue = (event) => {
        if (event.target.name === 'programId') {
            this.setState({
                programName: event.target[event.target.selectedIndex].text,
                programId: event.target.value
            });
        } else if (event.target.name === 'productId') {
            this.setState({
                productName: event.target[event.target.selectedIndex].text,
                productId: event.target.value
            });
        }
    };
    submitForm() {
        console.log(this.state.rows);
    }
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <strong>Add Program Product</strong>
                            </CardHeader>
                            <CardBody>
                                <FormGroup>
                                    <Label htmlFor="select">Select Program</Label>
                                    <Input type="select" name="programId" id="programId" value={this.state.programId} onChange={event => this.setTextAndValue(event)}>
                                        <option value="0">Please select</option>
                                        <option value="1">Program #1</option>
                                        <option value="2">Program #2</option>
                                        <option value="3">Program #3</option>
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="select">Select Product</Label>
                                    <Input type="select" name="productId" id="select" value={this.state.productId} onChange={event => this.setTextAndValue(event)}>
                                        <option value="0">Please select</option>
                                        <option value="1">product #1</option>
                                        <option value="2">product #2</option>
                                        <option value="3">product #3</option>
                                    </Input>

                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="company">Min Month Stock</Label>
                                    <Input type="number" name="minMonth" id="minMonth" value={this.state.minMonth} placeholder="Enter your budget amount" onChange={this.updateFieldData} />
                                </FormGroup>
                                <FormGroup>
                                    <Label htmlFor="company">Max Month Stock</Label>
                                    <Input type="number" name="maxMonth" id="maxMonth" value={this.state.maxMonth} placeholder="Enter your budget amount" onChange={this.updateFieldData} />
                                </FormGroup>
                                <FormGroup>
                                    <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> Delete Last Row</Button>
                                    <Button type="submit" size="sm" color="success" onClick={this.addRow} className="float-right mr-1" ><i className="fa fa-check"></i>Add</Button>
                                    &nbsp;

                        </FormGroup>
                                <Table responsive>

                                    <thead>
                                        <tr>
                                            {/* <th className="text-left"> Id </th> */}
                                            <th className="text-left"> Program </th>
                                            <th className="text-left"> Product</th>
                                            <th className="text-left"> Min Month Stock </th>
                                            <th className="text-left">Max Month Stock</th>
                                            <th className="text-left">Delete Row</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.rows.map((item, idx) => (
                                            <tr id="addr0" key={idx}>
                                                {/* <td>{idx}</td> */}
                                                <td>
                                                    {/* <input
                          type="text"
                          name="name"
                          value={this.state.rows[idx].name}
                          onChange={this.handleChange(idx)}
                          className="form-control"
                        /> */}
                                                    {/* {item.program} */}
                                                    {this.state.rows[idx].programName}
                                                </td>
                                                <td>
                                                    {/* <input
                          type="text"
                          name="mobile"
                          value={this.state.rows[idx].mobile}
                          onChange={this.handleChange(idx)}
                          className="form-control"
                        /> */}
                                                    {/* {item.budgetAmount} */}
                                                    {this.state.rows[idx].productName}
                                                </td>
                                                <td>
                                                    {/* {item.startDate} */}
                                                    {this.state.rows[idx].minMonth}
                                                </td>
                                                <td>
                                                    {/* {item.startDate} */}
                                                    {this.state.rows[idx].maxMonth}
                                                </td>
                                                <td>
                                                    {/* <Button type="button" size="sm" color="danger" onClick={this.handleRemoveSpecificRow(idx)}><i className="fa fa-dot-circle-o"></i> Delete  Row </Button> */}
                                                    {/* <Button type="button" size="sm" color="danger" onClick={deleteSpecificRowFormTable.bind(this)}><i className="fa fa-dot-circle-o"></i> Delete  Row </Button> */}
                                                    <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </Table>
                            </CardBody>
                            <CardFooter>
                                <FormGroup>
                                    <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> Cancel</Button>
                                    <Button type="submit" size="sm" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>Submit</Button>
                                    &nbsp;
                                </FormGroup>
                                {/* <Button type="button" size="sm" color="primary" onClick={this.submitForm}><i className="fa fa-dot-circle-o"></i>Submit </Button> */}
                            </CardFooter>
                        </Card>
                    </Col>
                </Row></div>

        );
    }

}

export default AddProgramProduct;