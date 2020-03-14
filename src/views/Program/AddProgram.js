import React,{ Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button,Col
} from 'reactstrap';

export default class AddProgram extends Component{

constructor(props){
    super(props);
    this.state={
        program:{

        }
    }
    this.updateFieldData=this.updateFieldData.bind(this);
    this.submitForm=this.submitForm.bind(this);
}

updateFieldData(){


}

submitForm(){


}
 render() {
        return (
            <Col xs="12" sm="8">
                <Card>
                    <CardHeader>
                        <strong>Add Program</strong>
                    </CardHeader>
                    <CardBody>
                        <FormGroup>
                            <Col md="4">
                                <Label htmlFor="select">Select Realm Country</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="select" name="realmCountryId" id="realmCountryId"  onChange={this.updateFieldData}>
                                    <option value="0">Please select</option>
                                    <option value="1">Program #1</option>
                                    <option value="2">Program #2</option>
                                    <option value="3">Program #3</option>
                                </Input>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="4">
                                <Label htmlFor="select">Select Organisation</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="select" name="organisationId" id="organisationId"  onChange={this.updateFieldData}>
                                    <option value="0">Please select</option>
                                    <option value="1">product #1</option>
                                    <option value="2">product #2</option>
                                    <option value="3">product #3</option>
                                </Input>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="4">
                                <Label htmlFor="select">Select Health Area</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="select" name="organisationId" id="organisationId"  onChange={this.updateFieldData}>
                                    <option value="0">Please select</option>
                                    <option value="1">product #1</option>
                                    <option value="2">product #2</option>
                                    <option value="3">product #3</option>
                                </Input>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="4">
                                <Label htmlFor="select">Select Program Manager</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="select" name="programManagerUserId" id="programManagerUserId"  onChange={this.updateFieldData}>
                                    <option value="0">Please select</option>
                                    <option value="1">product #1</option>
                                    <option value="2">product #2</option>
                                    <option value="3">product #3</option>
                                </Input>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="4">
                                <Label htmlFor="select">Program Notes</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="textarea" name="programNotes" id="programNotes"  onChange={this.updateFieldData}/>
    
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="5">
                                <Label htmlFor="company">Air Freight Percentage</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="text" name="airFreightPercentage" id="airFreightPercentage" placeholder="Enter air freight percentage" onChange={this.updateFieldData} />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="5">
                                <Label htmlFor="company">Sea Freight Percentage</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="text" name="seaFreightPercentage" id="seaFreightPercentage" placeholder="Enter sea freight percentage" onChange={this.updateFieldData} />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="5">
                                <Label htmlFor="company">Plan Draft Lead Time</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="number" name="planDraftLeadTime" id="planDraftLeadTime" placeholder="Enter plan to draft lead time" onChange={this.updateFieldData} />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="5">
                                <Label htmlFor="company">Draft To Submitted Lead Time</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="number" name="draftToSubmittedLeadTime" id="draftToSubmittedLeadTime" placeholder="Enter draft to submitted lead time" onChange={this.updateFieldData} />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="5">
                                <Label htmlFor="company">Submitted To Approved Lead Time</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="number" name="submittedToApprovedLeadTime" id="submittedToApprovedLeadTime" placeholder="Enter submited to approved lead time" onChange={this.updateFieldData} />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="5">
                                <Label htmlFor="company">Approve To Shipped Lead Time</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="number" name="draftToSubmittedLeadTime" id="draftToSubmittedLeadTime" placeholder="Enter draft to submitted lead time" onChange={this.updateFieldData} />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="5">
                                <Label htmlFor="company">Delivered To Recived Lead Time</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="number" name="deliveredToRecivedLeadTime" id="deliveredToRecivedLeadTime" placeholder="Enter delivered to reacived lead time" onChange={this.updateFieldData} />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="5">
                                <Label htmlFor="company">Month In Past For AMC</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="number" name="monthInPastForAmc" id="monthInPastForAmc" placeholder="Enter month in past for AMC" onChange={this.updateFieldData} />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col md="5">
                                <Label htmlFor="company">Month In Future For AMC</Label>
                            </Col>
                            <Col xs="12" md="9">
                                <Input type="number" name="monthInFutureForAmc" id="monthInFutureForAmc"  placeholder="Enter month in future for AMC" onChange={this.updateFieldData} />
                            </Col>
                        </FormGroup>
                     
                        </CardBody>
                    <CardFooter>
                        <Button type="button" size="sm" color="primary" onClick={this.submitForm}><i className="fa fa-dot-circle-o"></i>Submit </Button>
                    </CardFooter>

                </Card>
            </Col>

        );
    }
}