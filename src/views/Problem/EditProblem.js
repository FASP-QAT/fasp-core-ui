import React, { Component } from 'react';
import { Row, Col, Card, CardBody, CardFooter, FormGroup, Label, Input, Table, Button } from 'reactstrap';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';

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
            // <div className="animated fadeIn">
            <Card>
                <CardBody>
                    <Row>
                        {/* <Col> */}

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
                            {/* <FormFeedback className="red">{errors.currencyId}</FormFeedback> */}
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
                            {/* <FormFeedback className="red">{errors.currencyId}</FormFeedback> */}
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
                            {/* <FormFeedback className="red">{errors.currencyId}</FormFeedback> */}
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
                            {/* <FormFeedback className="red">{errors.currencyId}</FormFeedback> */}
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
                            {/* <FormFeedback className="red">{errors.currencyId}</FormFeedback> */}
                        </FormGroup>
                        {/* </CardBody>
                            <CardFooter>


                            </CardFooter>*/}

                    </Row>
                    <Col md="12 pl-0">
                        <div className="row">
                            <div className="col-md-12">
                                {/* {this.state.data.length > 0 && */}
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
                                        {/* {
                                                this.state.data.length > 0
                                                &&
                                                this.state.data.map((item, idx) =>
                                                    <tr id="addr0" key={idx} >
                                                        <td>{getLabelText(this.state.data[idx].realmCountry.label, this.state.lang)}</td>
                                                        <td>{getLabelText(this.state.data[idx].region.label, this.state.lang)}</td>
                                                        <td>
                                                            {
                                                                this.state.data[idx].programList.map((item, idx1) =>
                                                                    <>
                                                                        <span id="addr1" key={idx1}>{getLabelText(this.state.data[idx].programList[idx1].label, this.state.lang)}</span> <br />
                                                                    </>
                                                                )
                                                            }

                                                        </td>
                                                        <td>{this.state.data[idx].gln}</td>
                                                        <td>{(this.state.data[idx].capacityCbm).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</td>
                                                    </tr>
                                                )} */}
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
                                {/* } */}
                            </div>
                        </div>
                    </Col>
                    <br /><br />
                    <Row>
                        {/* <Col> */}

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
                            {/* <FormFeedback className="red">{errors.currencyId}</FormFeedback> */}
                        </FormGroup>
                        <FormGroup className="col-md-6">
                            <Label htmlFor="currencyId">Problem</Label>
                            <Input
                                type="textarea"
                                // maxLength={600}
                                name="programNotes"
                                id="programNotes"
                                autocomplete="off"
                            />

                            {/* <FormFeedback className="red">{errors.currencyId}</FormFeedback> */}
                        </FormGroup>
                    </Row>

                </CardBody>
                <CardFooter>
                    <FormGroup>

                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                        {/* <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button> */}
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