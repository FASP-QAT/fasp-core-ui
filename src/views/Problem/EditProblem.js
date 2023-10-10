import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, FormGroup, Input, Label, Row, Table } from 'reactstrap';
import i18n from '../../i18n';
export default class AddProblem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            problem: {
                problemId: 1,
                label: {
                    id: '',
                    label_en: 'No entried of actual consumption for past 3 months '
                },
                program: {
                    programId: 4,
                    label: {
                        label_en: 'ARV-Zimbabwe-National'
                    }
                },
                planningUnit: {
                    planningUnitId: 152,
                    label: {
                        label_en: 'Abacavir/Lamivudine 120/60 mg Scored Dispersible Tablet, 30 Tablets'
                    }
                },
                problemRaisedOn: '01-Jan-20',
                regionId: 1
            }
        }
        this.cancelClicked = this.cancelClicked.bind(this);
    }
    componentDidMount() {
    }
    render() {
        return (
            <Card>
                <CardBody>
                    <Row>
                        <FormGroup className="col-md-6">
                            <Label htmlFor="currencyId">Program</Label>
                            <Input
                                type="text"
                                name="currencyId"
                                id="currencyId"
                                value={this.state.problem.program.label.label_en}
                                readOnly
                            >
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-6">
                            <Label htmlFor="currencyId">Problem</Label>
                            <Input
                                type="text"
                                name="currencyId"
                                id="currencyId"
                                value={this.state.problem.program.label.label_en}
                                readOnly
                            >
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-6">
                            <Label htmlFor="currencyId">Planning Unit</Label>
                            <Input
                                type="text"
                                name="currencyId"
                                id="currencyId"
                                value={this.state.problem.planningUnit.label.label_en}
                                readOnly
                            >
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-6">
                            <Label htmlFor="currencyId">Problem Raised On </Label>
                            <Input
                                type="text"
                                name="currencyId"
                                id="currencyId"
                                value={this.state.problem.problemRaisedOn}
                                readOnly
                            >
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-6">
                            <Label htmlFor="currencyId">Region </Label>
                            <Input
                                type="text"
                                name="currencyId"
                                id="currencyId"
                                value='NTL'
                                readOnly
                            >
                            </Input>
                        </FormGroup>
                    </Row>
                    <Col md="12 pl-0">
                        <div className="row">
                            <div className="col-md-12">
                                <Table id="mytable" responsive className="table-striped table-hover table-bordered text-center mt-2">
                                    <thead>
                                        <tr>
                                            <th>Problem</th>
                                            <th>Planning Unit</th>
                                            <th>Problem Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{this.state.problem.label.label_en}</td>
                                            <td>{this.state.problem.planningUnit.label.label_en}</td>
                                            <td>Open</td>
                                            <td>'01-Jun-20'</td>
                                        </tr>
                                        <tr>
                                            <td>{this.state.problem.label.label_en}</td>
                                            <td>{this.state.problem.planningUnit.label.label_en}</td>
                                            <td>Reviewed</td>
                                            <td>'01-July-20'</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </Col>
                    <br /><br />
                    <Row>
                        <FormGroup className="col-md-6">
                            <Label htmlFor="currencyId">Program</Label>
                            <Input
                                type="select"
                                name="programId"
                                id="programId"
                                bsSize="sm"
                                onChange={(e) => { this.fetchData(e) }}
                            >
                                <option value="0">Please Select</option>
                                <option value="1">Open</option>
                                <option value="2">Reviewed</option>
                                <option value="3">Close</option>
                            </Input>
                        </FormGroup>
                        <FormGroup className="col-md-6">
                            <Label htmlFor="currencyId">Problem</Label>
                            <Input
                                type="textarea"
                                name="programNotes"
                                id="programNotes"
                                autocomplete="off"
                            />
                        </FormGroup>
                    </Row>
                </CardBody>
                <CardFooter>
                    <FormGroup>
                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                        <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>Submit</Button>
                        &nbsp;
                    </FormGroup>
                </CardFooter>
            </Card>
        );
    }
    cancelClicked() {
        this.props.history.push(`/report/qatProblemPlusActionReport`)
    }
} 